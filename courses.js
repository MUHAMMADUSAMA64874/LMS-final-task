const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const coursesPath = path.join(__dirname, '../models/courses.json');

router.get('/', (req, res) => {
    const courses = JSON.parse(fs.readFileSync(coursesPath));
    res.json(courses);
});

router.post('/', authMiddleware, (req, res) => {
    const courses = JSON.parse(fs.readFileSync(coursesPath));
    const { title, description, videoLink } = req.body;
    courses.push({ title, description, videoLink });
    fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 2));
    res.status(201).send('Course added');
});

module.exports = router;
