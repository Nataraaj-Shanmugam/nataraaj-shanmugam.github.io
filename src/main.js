// ─── Utility: hide a section and its nav link ──────────────────────
function hideSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.style.display = 'none';
  const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
  if (navLink && navLink.parentElement) navLink.parentElement.remove();
}

// ─── Nav: mobile toggle ────────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

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
  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

// ─── Nav: scroll behaviour ─────────────────────────────────────────
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      ticking = false;
    });
    ticking = true;
  }
});

// ─── Smooth scroll for anchor links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    }
  });
});

// ─── Active nav highlight ──────────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.15, rootMargin: '-72px 0px -30% 0px' });
document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

// ─── Reveal on scroll ──────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('active'), index * 80);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── Ripple effect on .btn ─────────────────────────────────────────
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.classList.add('ripple');
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ─── Helper: skill proficiency dots ───────────────────────────────
function renderDots(score) {
  const s = parseInt(score);
  const filled = s >= 9 ? 5 : s >= 7 ? 4 : s >= 6 ? 3 : 2;
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="skill-dot${i < filled ? ' filled' : ''}"></span>`
  ).join('');
}

// ─── EXPERIENCE ────────────────────────────────────────────────────
fetch('data/experience.json')
  .then(r => r.json())
  .then(data => {
    if (!data || !data.length) { hideSection('experience'); return; }
    const homeData = data.filter(e => e.showOnHome !== false);
    const grid = document.querySelector('.exp-grid, .timeline-grid');
    if (!grid) return;
    grid.innerHTML = homeData.map((exp, i) => `
      <div class="exp-card${i === homeData.length - 1 ? ' current' : ''}">
        ${i === homeData.length - 1 ? '<span class="exp-now">Current</span>' : ''}
        <div class="exp-dot">${exp.year}</div>
        <h3 class="exp-title">${exp.title}</h3>
        <p class="exp-co">${exp.company}</p>
        <p class="exp-dur">${exp.duration}</p>
        <ul class="exp-list">
          ${exp.achievements.slice(0, 3).map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>`).join('');
  })
  .catch(err => console.error('Error loading experience:', err));

// ─── PROJECTS ──────────────────────────────────────────────────────
fetch('data/projects.json')
  .then(r => r.json())
  .then(data => {
    if (!data || !data.length) { hideSection('projects'); return; }
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const homeProjects = data.filter(p => p.showOnHome !== false);
    grid.innerHTML = homeProjects.map(p => {
      const tagsHTML = (p.tags || []).map(tag => {
        const cls = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `<span class="chip tag-${cls}">${tag}</span>`;
      }).join('');
      const metricsHTML = (p.metrics || []).map(m => `<span class="metric">${m}</span>`).join('');
      const techHTML = (p.techStack || []).map(t => `<span class="tech">${t}</span>`).join('');
      return `
      <div class="proj-card">
        <div class="proj-top">
          <div class="proj-icon"><i class="${p.icon}"></i></div>
          <h3 class="proj-name">${p.title}</h3>
        </div>
        <div class="proj-body">
          <p class="proj-desc">${p.description}</p>
          ${tagsHTML ? `<div class="chips-row">${tagsHTML}</div>` : ''}
          ${metricsHTML ? `<div class="metric-chips">${metricsHTML}</div>` : ''}
          ${techHTML ? `<div class="tech-chips">${techHTML}</div>` : ''}
        </div>
        <div class="proj-foot">
          <a href="${p.github}" class="proj-link" target="_blank" rel="noopener">
            <i class="fab fa-github"></i> View on GitHub
          </a>
          ${p.demo ? `<a href="${p.demo}" class="proj-link" target="_blank" rel="noopener" style="margin-left:auto;color:var(--text-faint);font-size:.75rem">
            <i class="fas fa-external-link-alt"></i> Demo
          </a>` : ''}
        </div>
      </div>`;
    }).join('');

    // "View Full Case Studies" link appended below grid
    const viewAll = document.createElement('div');
    viewAll.className = 'view-all';
    viewAll.innerHTML = `<a href="src/projects.html" class="btn-outline"><i class="fas fa-layer-group"></i> View Full Case Studies</a>`;
    grid.parentElement.appendChild(viewAll);
  })
  .catch(err => console.error('Error loading projects:', err));

// ─── SKILLS ────────────────────────────────────────────────────────
fetch('data/skills.json')
  .then(r => r.json())
  .then(data => {
    if (!data || !data.length) { hideSection('skills'); return; }
    const container = document.getElementById('skillsContainer');
    const loading   = document.getElementById('skillsLoading');
    if (loading) loading.remove();
    if (!container) return;

    const categoryIcons = {
      'Core Automation Stack':     'fas fa-layer-group',
      'Languages':                 'fas fa-code',
      'DevOps & Cloud':            'fas fa-cloud',
      'Performance & Reliability': 'fas fa-tachometer-alt',
      'Supporting Tools':          'fas fa-tools',
    };

    const panelsHTML = data.map(cat => {
      const icon = categoryIcons[cat['Skill Category']] || 'fas fa-circle';
      const rows = cat.Skills.map(skill => `
        <a href="${skill.link}" target="_blank" rel="noopener" class="skill-compact-row">
          <div class="skill-compact-icon"><i class="${skill.icon}"></i></div>
          <span class="skill-compact-name">${skill.name}</span>
          <div class="skill-dots">${renderDots(skill.score)}</div>
        </a>`).join('');
      return `
      <div class="skill-panel">
        <div class="skill-panel-header">
          <i class="${icon}"></i>
          <span>${cat['Skill Category']}</span>
        </div>
        ${rows}
      </div>`;
    }).join('');

    container.innerHTML = `<div class="skills-flex">${panelsHTML}</div>`;
  })
  .catch(err => {
    const loading = document.getElementById('skillsLoading');
    if (loading) loading.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Failed to load skills.</p>';
    console.error('Error loading skills:', err);
  });

// ─── TESTIMONIALS ──────────────────────────────────────────────────
fetch('data/Testimonials.json')
  .then(r => r.json())
  .then(data => {
    if (!data || !data.length) { hideSection('testimonials'); return; }
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    const truncate = (text, max = 480) =>
      text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
    const homeData = data.filter(t => t.showOnHome !== false).slice(0, 3);
    grid.innerHTML = homeData.map(t => `
      <div class="tcard">
        <div class="tcard-head">
          <img src="${t.photo}" alt="${t.name}" class="tcard-photo"/>
          <div>
            <div class="tcard-name">${t.name}</div>
            <div class="tcard-role">${t.role}</div>
            <div class="tcard-co">${t.company}</div>
          </div>
        </div>
        <p class="tcard-text">"${truncate(t.text)}"</p>
        <a href="${t.linkedin}" class="tcard-link" target="_blank" rel="noopener">
          <i class="fab fa-linkedin"></i> View on LinkedIn
        </a>
      </div>`).join('');
  })
  .catch(err => { console.error('Error loading testimonials:', err); hideSection('testimonials'); });

// ─── INSIGHTS ──────────────────────────────────────────────────────
Promise.all([
  fetch('data/insights.json').then(r => r.json()),
  fetch('data/insights-meta.json').then(r => r.json()),
]).then(([insightsData, insightsMeta]) => {
  const grid = document.getElementById('insightsGrid');
  if (!grid) return;
  const hasContent = Object.values(insightsData).some(posts => posts.length > 0);
  if (!hasContent) { hideSection('learning'); return; }

  for (const [section, posts] of Object.entries(insightsData)) {
    const meta = insightsMeta[section];
    const previewPosts = posts.filter(p => p.showOnHome).slice(0, 4).map(post => `
      <a href="${post.url}" target="_blank" rel="noopener" class="insight-content-item">
        <i class="fas fa-arrow-right insight-arrow"></i>
        <span class="insight-content-text">${post.title}</span>
        <i class="fas fa-external-link-alt insight-external-icon"></i>
      </a>`).join('');
    grid.innerHTML += `
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
      </div>`;
  }
}).catch(err => { console.error('Error loading insights:', err); hideSection('learning'); });

// ─── CERTIFICATIONS ────────────────────────────────────────────────
fetch('data/certifications.json')
  .then(r => r.json())
  .then(data => {
    if (!data || !data.length) { hideSection('certifications'); return; }
    const grid = document.getElementById('certificationsGrid');
    if (!grid) return;
    const homeData = data.filter(c => c.showOnHome !== false);
    grid.innerHTML = homeData.map(cert => `
      <div class="cert-card">
        <div class="cert-icon"><i class="${cert.icon}"></i></div>
        <h3 class="cert-title">${cert.name}</h3>
        <p class="cert-issuer">${cert.issuer}</p>
        <p class="cert-year">Issued ${cert.year}</p>
        ${cert.description ? `<p class="cert-description">${cert.description}</p>` : ''}
      </div>`).join('');
  })
  .catch(err => { console.error('Error loading certifications:', err); hideSection('certifications'); });

// ─── On load ───────────────────────────────────────────────────────
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  window.dispatchEvent(new Event('scroll'));
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' }), 150);
    }
  }
});
