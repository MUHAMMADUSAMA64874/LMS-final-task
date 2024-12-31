const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../models/users.json');

router.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;
    const users = JSON.parse(fs.readFileSync(usersPath));
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role });
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.status(201).send('User created');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersPath));
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username, role: user.role }, 'secret');
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

module.exports = router;
