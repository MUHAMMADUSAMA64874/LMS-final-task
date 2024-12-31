const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const authMiddleware = require('./middleware/auth');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));  // Assuming your frontend is in 'frontend' folder
const upload = multer({ dest: 'uploads/' });

const usersPath = path.join(__dirname, 'models/users.json');
const coursesPath = path.join(__dirname, 'models/courses.json');
const assignmentsPath = path.join(__dirname, 'models/assignments.json');
const quizzesPath = path.join(__dirname, 'models/quizzes.json');

// Function to read data with error handling
const readData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data); // Return parsed JSON data
    } catch (error) {
        console.error(`Error reading or parsing ${filePath}:`, error);
        return []; // Return empty array in case of error
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
    }
};

app.post('/api/signup', upload.single('profilePicture'), async (req, res) => {
    const { username, password, firstName, lastName, email, phone, bio } = req.body;
    const users = readData(usersPath);
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        phone,
        bio,
        profilePicture: req.file.path // Store the file path
    });
    writeData(usersPath, users);
    res.status(201).send('User created');
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readData(usersPath);
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username, role: user.role }, 'secret');
        res.json({
            token,
            user: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                profilePicture: user.profilePicture
            }
        });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Fetch courses with error handling
app.get('/api/courses', (req, res) => {
    try {
        const courses = readData(coursesPath);
        if (!courses || courses.length === 0) {
            return res.status(404).send('No courses available');
        }
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Error fetching courses');
    }
});

// Add a new course with error handling
app.post('/api/courses', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    const courses = readData(coursesPath);
    const { title, description, videoLink } = req.body;
    const courseId = courses.length + 1; // Simple ID generation
    courses.push({ id: courseId, title, description, videoLink });
    writeData(coursesPath, courses);
    res.status(201).send('Course added');
});

// Handle other endpoints...
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
