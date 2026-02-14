/* ==========================================================================
   Portfolio — Main JavaScript
   Handles: data fetching, rendering, navigation, animations, empty-section hiding
   ========================================================================== */

// --- Path Helpers ---
const getDataPath = (path) => {
    const isSubPage = window.location.pathname.includes('/src/');
    return isSubPage ? `../${path}` : path;
};

const getLinkPath = (path) => {
    const isSubPage = window.location.pathname.includes('/src/');
    if (isSubPage) {
        if (path.startsWith('src/')) return path.substring(4);
        if (path === 'index.html') return '../index.html';
    }
    return path;
};

// --- Empty Section Hiding ---
function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
        // Also hide the nav link pointing to this section
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (navLink) navLink.parentElement ? navLink.style.display = 'none' : null;
    }
}

// --- Mobile Navigation ---
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');

function closeMobileNav() {
    if (navToggle) navToggle.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
}

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (navOverlay) navOverlay.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMobileNav);
    }

    document.addEventListener('click', (e) => {
        if (navToggle && navMenu &&
            !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            closeMobileNav();
        }
    });
}

// --- Stat Counter Animation ---
function animateCounters() {
    const stats = document.querySelectorAll('.hero-stat-value[data-target]');
    stats.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 800;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    });
}

// Trigger counters when hero is visible
const heroSection = document.querySelector('.hero');
if (heroSection) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });
    counterObserver.observe(heroSection);
}

// --- Fetch and Render Experience ---
fetch(getDataPath('data/experience.json'))
    .then(r => r.json())
    .then(data => {
        if (!data || data.length === 0) { hideSection('experience'); return; }

        const grid = document.getElementById('experienceGrid');
        if (!grid) return;

        // Reverse to show newest first
        const sorted = [...data].reverse();

        grid.innerHTML = sorted.map(exp => {
            const isCurrent = exp.duration.toLowerCase().includes('present');
            return `
                <div class="experience-card stagger-item ${isCurrent ? 'experience-card--current' : ''}">
                    <div class="experience-year">${exp.year}</div>
                    <div class="experience-company">${exp.company}</div>
                    <div class="experience-title">${exp.title}</div>
                    <div class="experience-duration">${exp.duration}</div>
                    <ul class="experience-achievements">
                        ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            `;
        }).join('');
    })
    .catch(err => console.error('Error loading experience:', err));

// --- Fetch and Render Certifications (hide if empty) ---
fetch(getDataPath('data/certifications.json'))
    .then(r => r.json())
    .then(data => {
        if (!data || data.length === 0) { hideSection('certifications'); return; }

        const grid = document.getElementById('certificationsGrid');
        if (!grid) return;

        grid.innerHTML = data.map(cert => `
            <div class="certification-card stagger-item">
                <div class="cert-icon"><i class="${cert.icon}"></i></div>
                <div class="cert-info">
                    <h3>${cert.name}</h3>
                    <p>${cert.issuer} &middot; ${cert.year}</p>
                </div>
            </div>
        `).join('');
    })
    .catch(err => {
        console.error('Error loading certifications:', err);
        hideSection('certifications');
    });

// --- Fetch and Render Testimonials (hide if empty) ---
fetch(getDataPath('data/Testimonials.json'))
    .then(r => r.json())
    .then(data => {
        if (!data || data.length === 0) { hideSection('testimonials'); return; }

        const grid = document.getElementById('testimonialsGrid');
        if (!grid) return;

        grid.innerHTML = data.map(t => `
            <div class="testimonial-card stagger-item">
                <span class="testimonial-quote-mark">&ldquo;</span>
                <p class="testimonial-text">${t.text}</p>
                <div class="testimonial-author">
                    <img src="${t.photo}" alt="${t.name}" class="testimonial-photo" loading="lazy" />
                    <div>
                        <div class="testimonial-name">${t.name}</div>
                        <div class="testimonial-role">${t.role}, ${t.company}</div>
                        <a href="${t.linkedin}" class="testimonial-linkedin" target="_blank" rel="noopener">
                            <i class="fab fa-linkedin"></i> View on LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    })
    .catch(err => {
        console.error('Error loading testimonials:', err);
        hideSection('testimonials');
    });

// --- Fetch and Render Skills (hide if empty) ---
fetch(getDataPath('data/skills.json'))
    .then(r => r.json())
    .then(data => {
        if (!data || data.length === 0) { hideSection('skills'); return; }

        const container = document.getElementById('skillsContainer');
        const loading = document.getElementById('skillsLoading');
        if (loading) loading.remove();
        if (!container) return;

        let html = '<div class="skills-grid">';
        data.forEach(category => {
            const skillsHTML = category.Skills.map(skill => `
                <a href="${skill.link}" target="_blank" class="skill-item" rel="noopener">
                    <span class="skill-item-icon"><i class="${skill.icon}"></i></span>
                    <span class="skill-item-name">${skill.name}</span>
                </a>
            `).join('');

            html += `
                <div class="skill-category stagger-item">
                    <div class="skill-header">
                        <h3 class="skill-title">${category['Skill Category']}</h3>
                        <p class="skill-subtitle">${category['Skill Description']}</p>
                    </div>
                    <div class="skill-content">
                        <div class="skill-items">${skillsHTML}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    })
    .catch(err => {
        console.error('Error loading skills:', err);
        const loading = document.getElementById('skillsLoading');
        if (loading) {
            loading.innerHTML = '<p style="text-align:center;color:var(--slate-500);padding:2rem;">Failed to load skills.</p>';
        }
    });

// --- Fetch and Render Projects ---
fetch(getDataPath('data/projects.json'))
    .then(r => r.json())
    .then(data => {
        if (!data || data.length === 0) { hideSection('projects'); return; }

        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        const sorted = data.sort((a, b) => (a.priority || 99) - (b.priority || 99));
        const isProjectsPage = window.location.pathname.includes('src/projects.html') ||
            document.querySelector('.page-header');
        const projects = isProjectsPage ? sorted : sorted.slice(0, 3);

        // Store projects for modal access
        window._projectsData = window._projectsData || {};

        const renderProject = (project, index) => {
            const mainLink = project.demo || project.github;
            const tagClass = (tag) => tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const projectId = 'project-' + index;
            window._projectsData[projectId] = project;

            return `
                <div class="project-card stagger-item">
                    <div class="project-card-header">
                        <div class="project-icon"><i class="${project.icon}"></i></div>
                        <h3>
                            <a href="${mainLink}" target="_blank" rel="noopener">
                                ${project.title} <i class="fas fa-external-link-alt"></i>
                            </a>
                        </h3>
                    </div>
                    <div class="project-card-body">
                        ${project.tags ? `
                        <div class="project-tags">
                            ${project.tags.map(t => `<span class="tag tag-${tagClass(t)}">${t}</span>`).join('')}
                        </div>` : ''}

                        <p class="project-description">${project.description}</p>

                        ${project.metrics ? `
                        <div class="project-metrics">
                            ${project.metrics.map(m => `<span class="metric-chip">${m}</span>`).join('')}
                        </div>` : ''}

                        <div class="project-tech">
                            ${project.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                        </div>

                        ${project.caseStudy ? `
                        <button class="case-study-btn" data-project="${projectId}">
                            <i class="fas fa-microscope"></i> View Case Study <i class="fas fa-arrow-right"></i>
                        </button>` : ''}

                        <div class="project-links">
                            ${project.demo ? `<a href="${project.demo}" class="project-link project-link--demo" target="_blank" rel="noopener"><i class="fas fa-play-circle"></i> Live Demo</a>` : ''}
                            <a href="${project.github}" class="project-link" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>
                        </div>
                    </div>
                </div>
            `;
        };

        grid.innerHTML = projects.map(renderProject).join('');

        // Attach case study modal handlers
        grid.querySelectorAll('.case-study-btn').forEach(btn => {
            btn.addEventListener('click', () => openProjectModal(btn.dataset.project));
        });

        // View All button (home page only)
        if (!isProjectsPage && sorted.length > 3) {
            const container = document.createElement('div');
            container.className = 'view-more-container';
            container.innerHTML = `
                <a href="${getLinkPath('src/projects.html')}" class="view-more-btn">
                    <i class="fas fa-th-large"></i> View All Projects
                </a>
            `;
            grid.parentElement.appendChild(container);
        }
    })
    .catch(err => console.error('Error loading projects:', err));

// --- Fetch and Render Insights ---
Promise.all([
    fetch(getDataPath('data/insights.json')).then(r => r.json()),
    fetch(getDataPath('data/insights-meta.json')).then(r => r.json())
])
    .then(([insightsData, insightsMeta]) => {
        const insightsGrid = document.getElementById('insightsGrid');
        const accordionContainer = document.getElementById('accordionContainer');

        // Check if all categories are empty
        const allEmpty = Object.values(insightsData).every(posts => !posts || posts.length === 0);
        if (allEmpty) {
            hideSection('insights');
            return;
        }

        // --- Home page: tile grid ---
        if (insightsGrid) {
            for (const [section, posts] of Object.entries(insightsData)) {
                const meta = insightsMeta[section];
                if (!meta || !posts || posts.length === 0) continue;

                const previewPosts = posts.filter(p => p.showOnHome).slice(0, 4);
                const postsHTML = previewPosts.map(post => `
                    <a href="${post.url}" target="_blank" rel="noopener" class="insight-list-item">
                        <i class="fas fa-arrow-right"></i>
                        <span>${post.title}</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                `).join('');

                insightsGrid.innerHTML += `
                    <div class="insight-tile stagger-item">
                        <div class="insight-tile-header">
                            <span class="insight-icon"><i class="${meta.icon}"></i></span>
                            <h3 class="insight-tile-title">${meta.title}</h3>
                        </div>
                        <p class="insight-tile-desc">${meta.desc}</p>
                        <div class="insight-list">${postsHTML}</div>
                        <a class="insight-more-link" href="${getLinkPath('src/insights.html')}?section=${section}">
                            ${meta.moreLabel} &rarr;
                        </a>
                    </div>
                `;
            }
        }

        // --- Insights page: accordion ---
        if (accordionContainer) {
            const params = new URLSearchParams(window.location.search);
            const openSection = params.get('section') || Object.keys(insightsMeta)[0];

            for (const [section, meta] of Object.entries(insightsMeta)) {
                const posts = insightsData[section] || [];
                const isOpen = section === openSection;

                const postsHTML = posts.length
                    ? `<div class="accordion-list">${posts.map(post => `
                        <a href="${post.url}" target="_blank" rel="noopener">
                            <i class="fas fa-arrow-right"></i>
                            <span>${post.title}</span>
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    `).join('')}</div>`
                    : '<p style="color:var(--slate-400);font-size:0.875rem;">No content yet.</p>';

                accordionContainer.innerHTML += `
                    <div class="accordion-section">
                        <div class="accordion-header${isOpen ? ' active' : ''}" data-section="${section}">
                            <i class="${meta.icon}"></i>
                            <span>${meta.title}</span>
                            <i class="fas fa-chevron-down accordion-chevron"></i>
                        </div>
                        <div class="accordion-content" style="display:${isOpen ? 'block' : 'none'};">
                            <p class="accordion-desc">${meta.desc}</p>
                            ${postsHTML}
                        </div>
                    </div>
                `;
            }

            // Accordion toggle
            document.querySelectorAll('.accordion-header').forEach(header => {
                header.addEventListener('click', () => {
                    const section = header.dataset.section;
                    const wasActive = header.classList.contains('active');

                    // Close all
                    document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
                    document.querySelectorAll('.accordion-content').forEach(c => c.style.display = 'none');

                    // Toggle clicked
                    if (!wasActive) {
                        header.classList.add('active');
                        header.nextElementSibling.style.display = 'block';
                        window.history.replaceState({}, '', window.location.pathname + '?section=' + section);
                    }
                });
            });
        }
    })
    .catch(err => {
        console.error('Error loading insights:', err);
        hideSection('insights');
    });

// --- Navigation: Scroll State ---
const navbar = document.getElementById('navbar');
let scrollTicking = false;

function updateNavbar() {
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(updateNavbar);
        scrollTicking = true;
    }
});

// --- Navigation: Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// --- Navigation: Active Link Highlighting ---
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const observedSections = document.querySelectorAll('.section, .hero');

if (navLinks.length > 0 && observedSections.length > 0) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -80px 0px'
    });

    observedSections.forEach(section => navObserver.observe(section));
}

// --- Section Reveal on Scroll ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- Keyboard Navigation ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// --- Project Case Study Modal ---
function createModal() {
    if (document.getElementById('projectModal')) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'projectModal';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal-close" aria-label="Close modal"><i class="fas fa-times"></i></button>
            <div class="modal-project-icon"></div>
            <h3 class="modal-title"></h3>
            <p class="modal-description"></p>
            <div class="modal-metrics"></div>
            <div class="modal-divider"></div>
            <div class="modal-case-study"></div>
            <div class="modal-links"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

function openProjectModal(projectId) {
    createModal();
    const project = window._projectsData[projectId];
    if (!project || !project.caseStudy) return;

    const overlay = document.getElementById('projectModal');
    overlay.querySelector('.modal-project-icon').innerHTML = `<i class="${project.icon}"></i>`;
    overlay.querySelector('.modal-title').textContent = project.title;
    overlay.querySelector('.modal-description').textContent = project.description;

    overlay.querySelector('.modal-metrics').innerHTML = project.metrics
        ? project.metrics.map(m => `<span class="metric-chip">${m}</span>`).join('')
        : '';

    overlay.querySelector('.modal-case-study').innerHTML = `
        <div class="case-study">
            <div class="case-study-label">Case Study</div>
            <div class="case-study-block">
                <strong>Problem</strong>
                <p>${project.caseStudy.problem}</p>
            </div>
            <div class="case-study-block">
                <strong>Solution</strong>
                <p>${project.caseStudy.solution}</p>
            </div>
            <div class="case-study-block">
                <strong>Results</strong>
                <ul class="case-study-results">
                    ${project.caseStudy.results.map(r => `<li><i class="fas fa-check-circle"></i>${r}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    overlay.querySelector('.modal-links').innerHTML = `
        ${project.demo ? `<a href="${project.demo}" class="modal-link modal-link--primary" target="_blank" rel="noopener"><i class="fas fa-play-circle"></i> Live Demo</a>` : ''}
        <a href="${project.github}" class="modal-link modal-link--secondary" target="_blank" rel="noopener"><i class="fab fa-github"></i> View on GitHub</a>
    `;

    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('projectModal');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// --- Page Load ---
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    window.dispatchEvent(new Event('scroll'));
});
