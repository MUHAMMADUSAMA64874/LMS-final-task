const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const assignmentsPath = path.join(__dirname, '../models/assignments.json');

router.post('/', upload.single('file'), (req, res) => {
    const assignments = JSON.parse(fs.readFileSync(assignmentsPath));
    const { courseId } = req.body;
    assignments.push({ courseId, file: req.file.path });
    fs.writeFileSync(assignmentsPath, JSON.stringify(assignments, null, 2));
    res.status(201).send('Assignment submitted');
});

module.exports = router;
