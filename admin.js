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
            document.getElementById('statusMessage').innerText = editMode ? "✅ Project updated!" : "✅ Project uploaded!";
            resetForm();
            loadAdminProjects(); 
        } else {
            document.getElementById('statusMessage').innerText = "❌ Process failed.";
        }
    } catch (err) {
        document.getElementById('statusMessage').innerText = "❌ Connection Error.";
    }
});

function prepareEdit(id, title, type, desc, image, link, tags) {
    editMode = true;
    editId = id;
    document.getElementById('title').value = title;
    document.getElementById('type').value = type;
    document.getElementById('description').value = desc;
    document.getElementById('image').value = image;
    document.getElementById('link').value = link;
    document.getElementById('tags').value = tags;
    const submitBtn = document.querySelector('#addProjectForm button[type="submit"]');
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
    const submitBtn = document.querySelector('#addProjectForm button[type="submit"]');
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
    const list = document.getElementById('adminMessagesList');
    if (!list) return;
    try {
        const res = await fetch('https://leen-portfolio2026.onrender.com/api/messages');
        const messages = await res.json();
        if (messages.length === 0) {
            list.innerHTML = '<p class="text-white/20 text-center py-4 italic">No messages yet.</p>';
            return;
        }
        list.innerHTML = messages.map(m => `
            <div class="bg-black/20 p-5 rounded-2xl border border-white/5 relative group">
                <button onclick="deleteMessage('${m._id}')" class="absolute top-4 right-4 text-white/10 group-hover:text-red-500 transition-colors">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="mb-2">
                    <span class="text-orange-500 font-bold text-xs">${m.name}</span>
                    <span class="text-[9px] text-white/20 ml-2">${new Date(m.date).toLocaleDateString()}</span>
                </div>
                <p class="text-white/40 text-[10px] mb-2">${m.email} | ${m.subject}</p>
                <p class="text-white/70 text-xs leading-relaxed">${m.message}</p>
            </div>
        `).join('');
    } catch (err) {
        list.innerHTML = '<p class="text-red-500/50 text-center py-4">Error loading messages.</p>';
    }
}

async function deleteMessage(id) {
    if (confirm('Delete this message?')) {
        await fetch(`https://leen-portfolio2026.onrender.com/api/messages/${id}`, { method: 'DELETE' });
        loadAdminMessages();
    }
}
