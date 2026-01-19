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

// Fetch and Render Certifications
fetch('data/certifications.json')
    .then(response => response.json())
    .then(certificationsData => {
        const certificationsGrid = document.getElementById('certificationsGrid');
        if (certificationsGrid) {
            certificationsGrid.innerHTML = certificationsData.map(cert => `
                <div class="certification-card">
                    <div class="cert-icon"><i class="${cert.icon}"></i></div>
                    <h3 class="cert-title">${cert.name}</h3>
                    <p class="cert-issuer">${cert.issuer}</p>
                    <p class="cert-year">Issued ${cert.year}</p>
                    <p class="cert-description">${cert.description}</p>
                </div>
            `).join('');
        }
    })
    .catch(error => console.error('Error loading certifications:', error));

// Fetch and Render Testimonials
fetch('data/Testimonials.json')
    .then(response => response.json())
    .then(testimonialsData => {
        const testimonialsGrid = document.getElementById('testimonialsGrid');
        if (testimonialsGrid) {
            testimonialsGrid.innerHTML = testimonialsData.map(testimonial => `
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="${testimonial.photo}" alt="${testimonial.name}" class="testimonial-photo" />
                        <div class="testimonial-info">
                            <h3 class="testimonial-name">${testimonial.name}</h3>
                            <p class="testimonial-role">${testimonial.role}</p>
                            <p class="testimonial-company">${testimonial.company}</p>
                        </div>
                    </div>
                    <div class="testimonial-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(testimonial.rating)}
                    </div>
                    <p class="testimonial-text">"${testimonial.text}"</p>
                    <a href="${testimonial.linkedin}" class="testimonial-link" target="_blank" rel="noopener">
                        <i class="fab fa-linkedin"></i> View on LinkedIn
                    </a>
                </div>
            `).join('');
        }
    })
    .catch(error => console.error('Error loading testimonials:', error));

// Skills JSON Loading
fetch('data/skills.json')
    .then(res => res.json())
    .then(skillsData => {
        const container = document.getElementById('skillsContainer');
        const loading = document.getElementById('skillsLoading');

        if (loading) loading.remove();

        let gridHTML = '<div class="skills-grid">';
        skillsData.forEach(category => {
            let skillsHTML = '';
            category.Skills.forEach(skill => {
                skillsHTML += `
                    <a href="${skill.link}" target="_blank" class="skill-item" data-score="${skill.score}">
                        <div class="skill-item-icon"><i class="${skill.icon}"></i></div>
                        <div class="skill-item-name">${skill.name}</div>
                    </a>
                `;
            });
            gridHTML += `
                <div class="skill-category">
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
        gridHTML += '</div>';
        container.innerHTML = gridHTML;
    })
    .catch(err => {
        const loading = document.getElementById('skillsLoading');
        if (loading) {
            loading.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i><br>Failed to load skills. Please refresh the page.</div>';
        }
        console.error('Error loading skills.json:', err);
    });

// Fetch and Render Projects
fetch('data/projects.json')
    .then(response => response.json())
    .then(projectsData => {
        const projectsGrid = document.getElementById('projectsGrid');
        if (projectsGrid) {
            projectsGrid.innerHTML = projectsData.map(project => `
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-icon"><i class="${project.icon}"></i></div>
                        <h3 class="project-title">${project.title}</h3>
                    </div>
                    <div class="project-content">
                        <p class="project-description">${project.description}</p>
                        <div class="project-tech-stack">
                            ${project.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                        
                        ${project.caseStudy ? `
                        <div class="case-study">
                            <h4 class="case-study-title"><i class="fas fa-lightbulb"></i> Case Study</h4>
                            <div class="case-study-section">
                                <strong>Problem:</strong>
                                <p>${project.caseStudy.problem}</p>
                            </div>
                            <div class="case-study-section">
                                <strong>Solution:</strong>
                                <p>${project.caseStudy.solution}</p>
                            </div>
                            <div class="case-study-section">
                                <strong>Results:</strong>
                                <ul class="case-study-results">
                                    ${project.caseStudy.results.map(r => `<li><i class="fas fa-check-circle"></i> ${r}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="project-highlights">
                            ${project.highlights.map(h => `
                                <div class="project-highlight">
                                    <i class="fas fa-check-circle"></i>
                                    <span>${h}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="project-links">
                            ${project.demo ? `<a href="${project.demo}" class="project-link" target="_blank" rel="noopener">Live Demo <i class="fas fa-external-link-alt"></i></a>` : ''}
                            <a href="${project.github}" class="project-link" target="_blank" rel="noopener">View on GitHub <i class="fas fa-external-link-alt"></i></a>
                        </div>
                    </div>
                </div>
            `).join('');
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
        if (insightsGrid) {
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
        }
    })
    .catch(err => console.error('Error loading insights:', err));


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

let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    lastScrollY = currentScrollY;
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
    threshold: 0.3,
    rootMargin: '-80px 0px -80px 0px'
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

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1000;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

const style = document.createElement('style');
style.textContent = `@keyframes ripple { to { transform: scale(4); opacity: 0; } }`;
document.head.appendChild(style);

const timelineCards = document.querySelectorAll('.timeline-card');
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 150);
        }
    });
}, {
    rootMargin: '50px',
    threshold: 0.1
});

timelineCards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    timelineObserver.observe(card);
});

const hero = document.querySelector('.hero');
function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * 0.3;
    if (hero) hero.style.transform = `translateY(${parallax}px)`;
}
window.addEventListener('scroll', updateParallax);

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
});