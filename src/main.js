// ─── Utility: hide a section and its nav link ──────────────────────
function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'none';
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (navLink && navLink.parentElement) navLink.parentElement.remove();
}

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Fetch and Render Experience
fetch('data/experience.json')
    .then(response => response.json())
    .then(experienceData => {
        if (!experienceData || experienceData.length === 0) {
            hideSection('experience');
            return;
        }
        const homeData = experienceData.filter(exp => exp.showOnHome !== false);
        const timelineGrid = document.querySelector('.timeline-grid');
        if (timelineGrid) {
            timelineGrid.innerHTML = homeData.map((exp, index) => `
                <div class="timeline-card${index === homeData.length - 1 ? ' current' : ''} timeline-card-hidden timeline-card-transition">
                    <div class="timeline-year">${exp.year}</div>
                    <h3 class="job-title">${exp.title}</h3>
                    <p class="company">${exp.company}</p>
                    <p class="duration">${exp.duration}</p>
                    <ul class="timeline-achievements">
                        ${exp.achievements.slice(0, 3).map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
            `).join('');

            // Re-apply intersection observer for dynamically loaded cards
            const timelineCards = document.querySelectorAll('.timeline-card');
            timelineCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.remove('timeline-card-hidden');
                    card.classList.add('timeline-card-visible');
                }, index * 150);
            });
        }
    })
    .catch(error => console.error('Error loading experience:', error));

// Fetch and Render Certifications
fetch('data/certifications.json')
    .then(response => response.json())
    .then(certificationsData => {
        if (!certificationsData || certificationsData.length === 0) {
            hideSection('certifications');
            return;
        }
        const homeCerts = certificationsData.filter(cert => cert.showOnHome !== false);
        const certificationsGrid = document.getElementById('certificationsGrid');
        if (certificationsGrid) {
            certificationsGrid.innerHTML = homeCerts.map(cert => `
                <div class="certification-card">
                    <div class="cert-icon"><i class="${cert.icon}"></i></div>
                    <h3 class="cert-title">${cert.name}</h3>
                    <p class="cert-issuer">${cert.issuer}</p>
                    <p class="cert-year">Issued ${cert.year}</p>
                    ${cert.description ? `<p class="cert-description">${cert.description}</p>` : ''}
                </div>
            `).join('');
        }
    })
    .catch(error => {
        console.error('Error loading certifications:', error);
        hideSection('certifications');
    });

// Fetch and Render Testimonials
fetch('data/Testimonials.json')
    .then(response => response.json())
    .then(testimonialsData => {
        if (!testimonialsData || testimonialsData.length === 0) {
            hideSection('testimonials');
            return;
        }
        const homeTestimonials = testimonialsData.filter(t => t.showOnHome !== false).slice(0, 3);
        const testimonialsGrid = document.getElementById('testimonialsGrid');
        if (testimonialsGrid) {
            const truncate = (text, max = 500) =>
                text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
            testimonialsGrid.innerHTML = homeTestimonials.map(testimonial => `
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="${testimonial.photo}" alt="${testimonial.name}" class="testimonial-photo" />
                        <div class="testimonial-info">
                            <h3 class="testimonial-name">${testimonial.name}</h3>
                            <p class="testimonial-role">${testimonial.role}</p>
                            <p class="testimonial-company">${testimonial.company}</p>
                        </div>
                    </div>
                    <p class="testimonial-text">"${truncate(testimonial.text)}"</p>
                    <a href="${testimonial.linkedin}" class="testimonial-link" target="_blank" rel="noopener">
                        <i class="fab fa-linkedin"></i> View on LinkedIn
                    </a>
                </div>
            `).join('');
        }
    })
    .catch(error => {
        console.error('Error loading testimonials:', error);
        hideSection('testimonials');
    });

// Skills — uniform panels for ALL categories (no featured strip)
fetch('data/skills.json')
    .then(res => res.json())
    .then(skillsData => {
        if (!skillsData || skillsData.length === 0) {
            hideSection('skills');
            return;
        }

        const container = document.getElementById('skillsContainer');
        const loading = document.getElementById('skillsLoading');
        if (loading) loading.remove();

        const categoryIcons = {
            'Core Automation Stack':    'fas fa-layer-group',
            'Languages':                'fas fa-code',
            'DevOps & Cloud':           'fas fa-cloud',
            'Performance & Reliability':'fas fa-tachometer-alt',
            'Supporting Tools':         'fas fa-tools'
        };

        const getLevel = (score) => {
            const s = parseInt(score);
            if (s >= 9) return { label: 'Expert',     dots: 5 };
            if (s >= 7) return { label: 'Advanced',   dots: 4 };
            if (s >= 6) return { label: 'Proficient', dots: 3 };
            return              { label: 'Familiar',  dots: 2 };
        };

        const dots = (n) => Array.from({ length: 5 }, (_, i) =>
            `<span class="skill-dot${i < n ? ' filled' : ''}"></span>`
        ).join('');

        // All categories rendered as uniform compact panels
        const panelsHTML = skillsData.map(cat => {
            const icon = categoryIcons[cat['Skill Category']] || 'fas fa-circle';
            const rows = cat.Skills.map(skill => {
                const level = getLevel(skill.score);
                return `
                <a href="${skill.link}" target="_blank" rel="noopener" class="skill-compact-row">
                    <div class="skill-compact-icon"><i class="${skill.icon}"></i></div>
                    <span class="skill-compact-name">${skill.name}</span>
                    <div class="skill-dots">${dots(level.dots)}</div>
                </a>`;
            }).join('');

            return `
            <div class="skill-panel">
                <div class="skill-panel-header">
                    <i class="${icon}"></i>
                    <span>${cat['Skill Category']}</span>
                </div>
                ${rows}
            </div>`;
        }).join('');

        container.innerHTML = `<div class="skills-uniform-grid">${panelsHTML}</div>`;
    })
    .catch(err => {
        const loading = document.getElementById('skillsLoading');
        if (loading) loading.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i><br>Failed to load skills. Please refresh.</div>';
        console.error('Error loading skills.json:', err);
    });

// Fetch and Render Projects — condensed cards on home, full detail on projects.html
fetch('data/projects.json')
    .then(response => response.json())
    .then(projectsData => {
        if (!projectsData || projectsData.length === 0) {
            hideSection('projects');
            return;
        }
        const projectsGrid = document.getElementById('projectsGrid');
        if (projectsGrid) {
            const renderProjectCondensed = (project) => {
                const tagsHTML = project.tags
                    ? project.tags.map(tag => {
                        const tagClass = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        return `<span class="tag tag-${tagClass}">${tag}</span>`;
                    }).join('')
                    : '';
                const metricsHTML = project.metrics
                    ? project.metrics.map(m => `<span class="metric-chip">${m}</span>`).join('')
                    : '';
                const techHTML = project.techStack
                    .map(t => `<span class="tech-tag">${t}</span>`).join('');
                return `
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-icon"><i class="${project.icon}"></i></div>
                        <h3 class="project-title">${project.title}</h3>
                    </div>
                    <div class="project-content">
                        ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
                        <p class="project-description">${project.description}</p>
                        ${metricsHTML ? `<div class="project-metrics">${metricsHTML}</div>` : ''}
                        <div class="project-tech-stack">${techHTML}</div>
                        <div class="project-card-footer">
                            <a href="${project.github}" class="project-card-readme" target="_blank" rel="noopener">
                                <i class="fab fa-github"></i> README
                            </a>
                            ${project.demo ? `<a href="${project.demo}" class="project-card-demo" target="_blank" rel="noopener">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>` : ''}
                        </div>
                    </div>
                </div>`;
            };

            const homeProjects = projectsData.filter(p => p.showOnHome !== false);
            projectsGrid.innerHTML = homeProjects.map(renderProjectCondensed).join('');

            // "View Full Case Studies" button → dedicated projects page
            const viewMoreContainer = document.createElement('div');
            viewMoreContainer.className = 'view-more-container';
            viewMoreContainer.innerHTML = `
                <a href="src/projects.html" class="view-more-btn">
                    <i class="fas fa-layer-group"></i>
                    View Full Case Studies
                </a>`;
            projectsGrid.parentElement.appendChild(viewMoreContainer);
        }
    })
    .catch(error => console.error('Error loading projects:', error));

// Insights JSON Loading
Promise.all([
    fetch('data/insights.json').then(r => r.json()),
    fetch('data/insights-meta.json').then(r => r.json())
])
    .then(([insightsData, insightsMeta]) => {
        const insightsGrid = document.getElementById('insightsGrid');
        if (!insightsGrid) return;

        const hasContent = Object.values(insightsData).some(posts => posts.length > 0);
        if (!hasContent) {
            hideSection('learning');
            return;
        }

        for (const [section, posts] of Object.entries(insightsData)) {
            const meta = insightsMeta[section];
            const previewPosts = posts.filter(p => p.showOnHome).slice(0, 4).map(post =>
                `<a href="${post.url}" target="_blank" class="insight-content-item">
                    <i class="fas fa-arrow-right insight-arrow"></i>
                    <span class="insight-content-text">${post.title}</span>
                    <i class="fas fa-external-link-alt insight-external-icon"></i>
                </a>`
            ).join('');
            insightsGrid.innerHTML += `
                <div class="insight-tile">
                    <div class="insight-top">
                        <div class="insight-header">
                            <span class="insight-icon"><i class="${meta.icon}"></i></span>
                            <div><h3 class="insight-title">${meta.title}</h3></div>
                        </div>
                        <div class="insight-desc">${meta.desc}</div>
                    </div>
                    <div class="insight-links-area">
                        <div class="insight-content-list">${previewPosts}</div>
                        <a class="insight-more" href="src/insights.html?section=${section}">${meta.moreLabel} &rarr;</a>
                    </div>
                </div>
            `;
        }
    })
    .catch(err => console.error('Error loading insights:', err));

// Navigation and Scroll Behavior
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section, .hero');

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

let ticking = false;

function updateNavbar() {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
});

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
    threshold: 0.15,
    rootMargin: '-80px 0px -30% 0px'
});

sections.forEach(section => navObserver.observe(section));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('active');
            }, index * 100);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.classList.add('ripple');
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    window.dispatchEvent(new Event('scroll'));

    // Handle hash in URL — scroll with navbar offset
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
});
