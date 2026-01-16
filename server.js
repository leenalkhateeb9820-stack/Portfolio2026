const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// يخبر السيرفر أن يقرأ الصور والملفات من المجلد الحالي
app.use(express.static(__dirname)); 

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
    .catch(err => console.error("❌ Connection error:", err));

const projectSchema = new mongoose.Schema({
    title: String,
    type: String,
    description: String,
    image: String,
    link: String,
    tags: [String],
    colorClass: String,
    glowClass: String
});

const Project = mongoose.model('Project', projectSchema);

// --- [إضافة: بوابة الأمان للتحقق من الباسورد] ---
app.post('/api/verify-password', (req, res) => {
    const { password } = req.body;
    // الباسورد سيتم سحبه من إعدادات Render لاحقاً
    const securePassword = process.env.ADMIN_PASSWORD; 

    if (password === securePassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Incorrect Password!" });
    }
});
// ------------------------------------------

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});