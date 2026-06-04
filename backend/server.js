// ============================================
// HRMS BACKEND — server.js
// ============================================

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ---- CONNECT TO MYSQL ----
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to HRMS database');
        createDefaultAdmin();
    }
});

// Create default admin user if no users exist
const createDefaultAdmin = async () => {
    db.query('SELECT * FROM users LIMIT 1', async (err, result) => {
        if (err) return;
        if (result.length === 0) {
            const hashed = await bcrypt.hash('admin123', 10);
            db.query(
                'INSERT INTO users (UserName, Password) VALUES (?, ?)',
                ['admin', hashed],
                (err) => { if (!err) console.log('✅ Default admin created: admin / admin123'); }
            );
        }
    });
};

// ---- AUTH MIDDLEWARE (protect routes) ----
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// ============================================
// AUTH ROUTES
// ============================================

// LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE UserName = ?', [username], async (err, result) => {
        if (err || result.length === 0)
            return res.status(401).json({ message: 'Invalid credentials' });
        const user = result[0];
        const valid = await bcrypt.compare(password, user.Password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign(
            { id: user.UserID, username: user.UserName },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, username: user.UserName });
    });
});

// SIGNUP
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Username and password required' });
    if (password.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    db.query('SELECT UserID FROM users WHERE UserName = ?', [username], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) return res.status(409).json({ message: 'Username already exists' });
        const hashed = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (UserName, Password) VALUES (?, ?)', [username, hashed],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Account created successfully' });
            });
    });
});

// ============================================
// DEPARTMENT ROUTES
// ============================================

// Get all departments
app.get('/api/departments', (req, res) => {
    db.query('SELECT * FROM department ORDER BY DepartmentName', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Add new department
app.post('/api/departments', (req, res) => {
    const { DepartmentName } = req.body;
    if (!DepartmentName) return res.status(400).json({ error: 'Department name is required' });

    db.query('INSERT INTO department (DepartmentName) VALUES (?)', [DepartmentName],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Department created', id: result.insertId });
        });
});

// Update department
app.put('/api/departments/:id', (req, res) => {
    const { DepartmentName } = req.body;
    if (!DepartmentName) return res.status(400).json({ error: 'Department name is required' });

    db.query('UPDATE department SET DepartmentName=? WHERE DepartmentID=?',
        [DepartmentName, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Department updated' });
        });
});

// Delete department
app.delete('/api/departments/:id', (req, res) => {
    db.query('DELETE FROM department WHERE DepartmentID=?', [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Department deleted' });
        });
});

// ============================================
// POSITION ROUTES
// ============================================

app.get('/api/positions', (req, res) => {
    db.query('SELECT * FROM positions ORDER BY PosName', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.post('/api/positions', (req, res) => {
    const { PosName, RequiredQualification } = req.body;
    if (!PosName) return res.status(400).json({ error: 'Position name is required' });

    db.query('INSERT INTO positions (PosName, RequiredQualification) VALUES (?, ?)',
        [PosName, RequiredQualification],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Position created', id: result.insertId });
        });
});

app.put('/api/positions/:id', (req, res) => {
    const { PosName, RequiredQualification } = req.body;
    if (!PosName) return res.status(400).json({ error: 'Position name is required' });

    db.query('UPDATE positions SET PosName=?, RequiredQualification=? WHERE PositionID=?',
        [PosName, RequiredQualification, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Position updated' });
        });
});

app.delete('/api/positions/:id', (req, res) => {
    db.query('DELETE FROM positions WHERE PositionID=?', [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Position deleted' });
        });
});

// ============================================
// EMPLOYEE ROUTES
// ============================================

// Get all employees (with department and position names)
app.get('/api/employees', (req, res) => {
    const sql = `
        SELECT e.*, d.DepartmentName, p.PosName
        FROM employee e
        LEFT JOIN department d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN positions p ON e.PositionID = p.PositionID
        ORDER BY e.EmpLastName ASC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get one employee by ID
app.get('/api/employees/:id', (req, res) => {
    db.query('SELECT * FROM employee WHERE EmpID=?', [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result[0] || null);
        });
});

// Add new employee
app.post('/api/employees', (req, res) => {
    const { EmpFirstName, EmpLastName, EmpEmail, EmpTelephone, EmpGender,
            EmpAddress, EmpDateOfBirth, EmpHireDate, EmpStatus, DepartmentID, PositionID } = req.body;
    if (!EmpFirstName || !EmpLastName || !EmpGender) {
        return res.status(400).json({ error: 'First name, last name, and gender are required' });
    }

    db.query(
        `INSERT INTO employee
         (EmpFirstName,EmpLastName,EmpEmail,EmpTelephone,EmpGender,EmpAddress,
          EmpDateOfBirth,EmpHireDate,EmpStatus,DepartmentID,PositionID)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [EmpFirstName,EmpLastName,EmpEmail,EmpTelephone,EmpGender,EmpAddress,
         EmpDateOfBirth||null,EmpHireDate||null,EmpStatus||'active',DepartmentID||null,PositionID||null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Employee added', id: result.insertId });
        });
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
    const { EmpFirstName, EmpLastName, EmpEmail, EmpTelephone, EmpGender,
            EmpAddress, EmpDateOfBirth, EmpHireDate, EmpStatus, DepartmentID, PositionID } = req.body;
    if (!EmpFirstName || !EmpLastName || !EmpGender) {
        return res.status(400).json({ error: 'First name, last name, and gender are required' });
    }

    db.query(
        `UPDATE employee SET
         EmpFirstName=?,EmpLastName=?,EmpEmail=?,EmpTelephone=?,EmpGender=?,EmpAddress=?,
         EmpDateOfBirth=?,EmpHireDate=?,EmpStatus=?,DepartmentID=?,PositionID=?
         WHERE EmpID=?`,
        [EmpFirstName,EmpLastName,EmpEmail,EmpTelephone,EmpGender,EmpAddress,
         EmpDateOfBirth||null,EmpHireDate||null,EmpStatus||'active',DepartmentID||null,PositionID||null,req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Employee updated' });
        });
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
    db.query('DELETE FROM employee WHERE EmpID=?', [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Employee deleted' });
        });
});

// ============================================
// STATUS REPORT ROUTE
// Get employees on leave grouped by department
// ============================================
app.get('/api/report/on-leave', (req, res) => {
    const sql = `
        SELECT
            e.EmpID,
            d.DepartmentName,
            e.EmpFirstName,
            e.EmpLastName,
            e.EmpEmail,
            e.EmpTelephone,
            p.PosName,
            e.EmpStatus,
            (
                SELECT COUNT(*)
                FROM employee e2
                WHERE e2.EmpStatus = 'on leave'
                  AND (
                    e2.DepartmentID = e.DepartmentID
                    OR (e2.DepartmentID IS NULL AND e.DepartmentID IS NULL)
                  )
            ) AS DeptTotal
        FROM employee e
        LEFT JOIN department d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN positions p ON e.PositionID = p.PositionID
        WHERE e.EmpStatus = 'on leave'
        ORDER BY d.DepartmentName, e.EmpLastName
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
