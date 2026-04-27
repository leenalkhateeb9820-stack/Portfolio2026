require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.static(__dirname)); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/verify-password', (req, res) => {
    const { password } = req.body;
    const securePassword = process.env.ADMIN_PASSWORD; 

    if (password === securePassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Incorrect Password!" });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { data, error } = await supabase.from('projects').insert([req.body]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('projects').update(req.body).eq('id', req.params.id).select();
        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ message: "Project not found" });
        res.json(data[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    console.log("📥 New message received");
    try {
        const { name, email, message } = req.body;
        const { error } = await supabase.from('messages').insert([{ 
            name, 
            email, 
            subject: `Inquiry — ${name}`, 
            message 
        }]);
        if (error) throw error;
        console.log("💾 Message saved to Supabase");
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Save failed:", err.message);
        res.status(500).json({ success: false });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    console.log("📥 New message received");
    try {
        const { name, email, message } = req.body;
        const newMessage = new Message({ 
            name, 
            email, 
            subject: `Inquiry — ${name}`, 
            message 
        });
        await newMessage.save();
        console.log("💾 Message saved to Database");
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Save failed:", err.message);
        res.status(500).json({ success: false });
    }
});

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
    console.log(`🚀 Server is running on port ${PORT}`);
});
