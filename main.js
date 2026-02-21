const staticProjects = [
    {
        title: "Croissant & Co",
        type: "E-Commerce Solution",
        description: "A comprehensive digital bakery experience where I engineered a seamless ordering system and high-conversion UI.",
        tags: ["Full Stack", "Tailwind CSS", "UX Design"],
        link: "https://croissant-co-bakery.onrender.com",
        image: "croissant.webp",
        colorClass: "gold-text", // تم التغيير ليكون ذهبي
        glowClass: "project-glow"
    }
];

async function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    // حالة التحميل (Skeleton)
    container.innerHTML = `
        <div class="flex items-center justify-center w-full mb-12">
            <div class="glass-card animate-pulse w-full max-w-[550px] rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 min-h-[300px] bg-white/5 border border-white/10 flex flex-col justify-center">
                <div class="h-4 w-24 bg-white/10 rounded mb-4"></div>
                <div class="h-8 w-48 bg-white/10 rounded mb-4"></div>
                <div class="h-16 w-full bg-white/10 rounded"></div>
            </div>
        </div>
    `;

    let allProjects = [];

    try {
        const response = await fetch('https://leen-portfolio2026.onrender.com/api/projects');
        if (response.ok) {
            const dbProjects = await response.json();
            allProjects = dbProjects.length > 0 ? dbProjects : staticProjects;
        } else {
            allProjects = staticProjects;
        }
    } catch (err) {
        allProjects = staticProjects;
    }

    container.innerHTML = allProjects.map(p => `
        <div class="reveal relative group flex items-center justify-center w-full mb-12">
            <div class="glass-card ${p.glowClass || 'project-glow'} w-full max-w-[550px] rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 relative overflow-hidden transition-all duration-500 min-h-[300px] flex flex-col justify-center">
                
                <div class="relative z-20 pr-32 md:pr-40 text-left"> 
                    <span class="${p.colorClass || 'gold-text'} font-black text-[8px] md:text-[9px] tracking-[0.3em] uppercase mb-2 block">
                        ${p.type}
                    </span>
                    
                    <h4 class="text-xl md:text-3xl font-extrabold gold-text mb-3 leading-tight whitespace-nowrap md:whitespace-normal overflow-hidden overflow-ellipsis">
                        ${p.title}
                    </h4>
                    
                    <p class="soft-cream text-[11px] md:text-xs leading-relaxed mb-4">
                        ${p.description}
                    </p>
                    
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${p.tags ? p.tags.map(tag => `
                            <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] soft-cream font-bold uppercase tracking-wider">
                                ${tag}
                            </span>
                        `).join('') : ''}
                    </div>

                    <a href="${p.link}" target="_blank" class="gold-text font-bold text-[10px] uppercase tracking-widest group/link inline-flex items-center">
                        Explore Project <i class="fa-solid fa-arrow-right ml-2 transition-transform group-hover/link:translate-x-2"></i>
                    </a>
                </div>

                <div class="absolute right-0 bottom-0 w-44 h-44 md:w-60 md:h-60 z-10 pointer-events-none transition-transform duration-700 group-hover:scale-105 translate-x-4 translate-y-4">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                </div>
            </div>
        </div>
    `).join('');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


async function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('sendBtn');
        const status = document.getElementById('formStatus');
        
        btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner animate-spin ml-2"></i>';
        btn.disabled = true;

        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            subject: document.getElementById('contact-subject').value,
            message: document.getElementById('contact-message').value
        };

        try {
            const response = await fetch('https://leen-portfolio2026.onrender.com/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                status.innerText = "✅ Message sent and saved to dashboard!";
                status.className = "text-center text-[10px] font-bold uppercase tracking-widest mt-4 text-green-500";
                contactForm.reset();
            } else {
                throw new Error();
            }
        } catch (err) {
            status.innerText = "❌ Connection error. Try again.";
            status.className = "text-center text-[10px] font-bold uppercase tracking-widest mt-4 text-red-500";
        } finally {
            btn.innerHTML = 'Send Inquiry <i class="fa-solid fa-paper-plane ml-2"></i>';
            btn.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    handleContactForm();
});

