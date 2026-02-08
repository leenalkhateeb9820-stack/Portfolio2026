let editMode = false;
let editId = null;

async function checkAccess() {
    const pass = document.getElementById('adminPass').value;
    try {
        const response = await fetch('https://leen-portfolio2026.onrender.com/api/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            loadAdminProjects();
            loadAdminMessages();
        } else {
            showLoginError();
        }
    } catch (err) {
        alert("Server Error! Make sure your backend on Render is running.");
    }
}

function showLoginError() {
    const error = document.getElementById('loginError');
    error.classList.remove('hidden');
    document.getElementById('loginOverlay').classList.add('animate-bounce');
    setTimeout(() => document.getElementById('loginOverlay').classList.remove('animate-bounce'), 500);
}

document.getElementById('addProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tagsInput = document.getElementById('tags').value;
    const tagsArray = tagsInput.split(',').map(tag => tag.trim());
    const projectData = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value,
        link: document.getElementById('link').value,
        tags: tagsArray,
        colorClass: "text-orange-500", 
        glowClass: "project-glow"
    };

    const url = editMode 
        ? `https://leen-portfolio2026.onrender.com/api/projects/${editId}` 
        : 'https://leen-portfolio2026.onrender.com/api/projects';

    try {
        const response = await fetch(url, {
            method: editMode ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        if (response.ok) {
            alert(editMode ? "✅ Project updated!" : "✅ Project uploaded!");
            resetForm();
            loadAdminProjects(); 
        } else {
            alert("❌ Process failed.");
        }
    } catch (err) {
        alert("❌ Connection Error.");
    }
});

function prepareEdit(id, title, type, desc, image, link, tags) {
    switchTab('projectsTab');
    editMode = true;
    editId = id;
    document.getElementById('title').value = title;
    document.getElementById('type').value = type;
    document.getElementById('description').value = desc;
    document.getElementById('image').value = image;
    document.getElementById('link').value = link;
    document.getElementById('tags').value = tags;
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.innerText = "Update Project";
        submitBtn.classList.add('bg-blue-600');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    editMode = false;
    editId = null;
    document.getElementById('addProjectForm').reset();
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.innerText = "Commit to Portfolio";
        submitBtn.classList.remove('bg-blue-600');
    }
}

async function loadAdminProjects() {
    const grid = document.getElementById('adminProjectsGrid');
    if (!grid) return;
    try {
        const response = await fetch('https://leen-portfolio2026.onrender.com/api/projects');
        const projects = await response.json();
        grid.innerHTML = projects.map(p => `
            <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 mb-3">
                <div>
                    <p class="text-white font-bold text-sm">${p.title}</p>
                    <p class="text-white/40 text-[10px] uppercase tracking-widest">${p.type}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="prepareEdit('${p._id}', '${p.title.replace(/'/g, "\\'")}', '${p.type.replace(/'/g, "\\'")}', '${p.description.replace(/'/g, "\\'")}', '${p.image}', '${p.link}', '${p.tags.join(',')}')" 
                            class="text-blue-400 hover:text-blue-300 p-2">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteProject('${p._id}')" class="text-red-500 hover:text-red-400 p-2">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        await fetch(`https://leen-portfolio2026.onrender.com/api/projects/${id}`, { method: 'DELETE' });
        loadAdminProjects();
    }
}

async function loadAdminMessages() {
    const container = document.getElementById('adminMessagesList');
    if (!container) return;
    try {
        const res = await fetch('https://leen-portfolio2026.onrender.com/api/messages');
        const messages = await res.json();
        
        if (messages.length === 0) {
            container.innerHTML = `<p class="text-white/30 text-center italic py-10">No messages found in your inbox.</p>`;
            return;
        }

        container.innerHTML = messages.map(msg => {
            const originalDate = new Date(msg.date).toLocaleString();
            
            // ترتيب النص ليظهر كأنه مكتوب يدوياً عند فك التشفير في جيميل
            const emailBody = `Hi ${msg.name},\n\n[اكتبي ردك هنا]\n\n--- Original Message ---\nFrom: ${msg.email}\nSent: ${originalDate}\nSubject: ${msg.subject}\n\n${msg.message}`;
            
            const encodedSubject = encodeURIComponent(`Re: ${msg.subject}`);
            const encodedBody = encodeURIComponent(emailBody);
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${msg.email}&su=${encodedSubject}&body=${encodedBody}`;
            
            return `
                <div class="message-item admin-card p-6 rounded-2xl relative group">
                    <div class="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                        <div>
                            <h4 class="text-red-400 font-bold text-lg">${msg.name}</h4>
                            <p class="text-white/50 text-xs tracking-widest uppercase">${msg.email}</p>
                        </div>
                        <span class="text-[10px] text-white/30 font-mono bg-white/5 px-3 py-1 rounded-full">
                            ${originalDate}
                        </span>
                    </div>
                    <div class="mb-6">
                        <p class="text-orange-200/70 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Subject</p>
                        <p class="text-white font-medium mb-3">${msg.subject}</p>
                        <p class="text-orange-200/70 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Message Content</p>
                        <div class="bg-black/20 p-4 rounded-xl text-white/80 leading-relaxed text-sm italic">"${msg.message}"</div>
                    </div>
                    <div class="flex gap-3 justify-end">
                        <a href="${gmailLink}" target="_blank"
                           class="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2">
                            <i class="fa-solid fa-reply"></i> Send Reply
                        </a>
                        <button onclick="deleteMessage('${msg._id}')" 
                                class="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = '<p class="text-red-500/50 text-center py-4">Error loading messages.</p>';
    }
}

async function deleteMessage(id) {
    if (confirm('Delete this message?')) {
        await fetch(`https://leen-portfolio2026.onrender.com/api/messages/${id}`, { method: 'DELETE' });
        loadAdminMessages();
    }
}
