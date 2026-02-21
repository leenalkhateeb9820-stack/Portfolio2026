require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
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

const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/verify-password', (req, res) => {
    const { password } = req.body;
    const securePassword = process.env.ADMIN_PASSWORD; 

    if (password === securePassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Incorrect Password!" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

app.put('/api/projects/:id', async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedProject) return res.status(404).json({ message: "Project not found" });
        res.json(updatedProject);
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

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        const cleanSubject = `Inquiry — ${name}`;

        const newMessage = new Message({ 
            name, 
            email, 
            subject: cleanSubject, 
            message 
        });
        await newMessage.save();

        res.status(200).json({ success: true });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: cleanSubject,
            html: `
                <div style="direction: rtl; font-family: sans-serif; padding: 25px; border-right: 5px solid #4d0013; background-color: #ffffff; max-width: 600px; margin: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h2 style="color: #4d0013; margin-top: 0;">رسالة جديدة من الموقع</h2>
                    <p style="font-size: 16px; color: #333;"><strong>المرسل:</strong> ${name}</p>
                    <p style="font-size: 16px; color: #333;"><strong>البريد الإلكتروني:</strong> ${email}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-weight: bold; color: #4d0013;">نص الرسالة:</p>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; color: #444; line-height: 1.8; font-style: italic;">
                        "${message}"
                    </div>
                    <p style="margin-top: 25px; font-size: 12px; color: #888; text-align: center;">
                        يمكنك الرد مباشرة بالضغط على <b>Reply</b>.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions).then(() => {
            console.log("✅ Email sent successfully to:", process.env.EMAIL_USER);
        }).catch(err => {
            console.error("❌ Email failed behind the scenes:", err.message);
        });

    } catch (err) {
        console.error("❌ Critical Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
});// --- نهاية قسم التواصل المصحح ---

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ date: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/ping', (req, res) => {
    res.status(200).send('Server is alive!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});


