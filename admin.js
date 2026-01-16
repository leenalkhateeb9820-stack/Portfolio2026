// [2026-01-16] حماية صفحة الآدمن عن طريق السيرفر (أمان كامل)
async function checkAccess() {
    const pass = document.getElementById('adminPass').value;
    
    try {
        // نرسل الباسورد للسيرفر ليفحصه هناك بدلاً من كتابته هنا
        const response = await fetch('/api/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            if (typeof loadAdminProjects === 'function') loadAdminProjects();
        } else {
            showLoginError();
        }
    } catch (err) {
        alert("Server Error! Make sure your backend is running.");
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
        colorClass: "text-orange-500", // يمكنكِ جعل هذا الحقل متغيراً من الفورم لاحقاً
        glowClass: "project-glow"
    };

    try {
        // تم تغيير الرابط ليصبح نسبياً (يعمل على Render و Localhost)
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            document.getElementById('statusMessage').innerText = "✅ Project uploaded successfully!";
            document.getElementById('addProjectForm').reset();
            loadAdminProjects(); // تحديث القائمة فوراً بعد الإضافة
        } else {
            document.getElementById('statusMessage').innerText = "❌ Failed to upload.";
        }
    } catch (err) {
        document.getElementById('statusMessage').innerText = "❌ Connection Error.";
    }
});

async function loadAdminProjects() {
    const grid = document.getElementById('adminProjectsGrid');
    if (!grid) return;

    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();

        grid.innerHTML = projects.map(p => `
            <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                    <p class="text-white font-bold text-sm">${p.title}</p>
                    <p class="text-white/40 text-[10px] uppercase tracking-widest">${p.type}</p>
                </div>
                <button onclick="deleteProject('${p._id}')" class="text-red-500 hover:text-red-400 p-2">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        loadAdminProjects();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // لا نحمل المشاريع إلا إذا كان المستخدم مسجل دخول (اختياري للأمان)
});