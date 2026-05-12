// ===================================================
// DIO PORTFOLIO – Page Renderers
// Each function returns an HTML string for its page.
// ===================================================

import { t, getCurrentLang } from './i18n.js';
import { getProjects, getProjectById, getProjectsByCategory } from './data.js';

let homeCarouselInterval = null;
let currentCarouselIndex = 0;

// --- Shared Components ---

function renderHeader(bordered = false) {
    const lang = getCurrentLang();
    return `
    <div class="header-container">
        <div class="header ${bordered ? 'header--bordered' : ''}">
            <a href="#home" class="logo">
                <img src="assets/images/logo.png" alt="DIO Logo">
            </a>
            <a href="mailto:diogocondesantos@gmail.com" class="contact-me">
                <span data-i18n="header.contact">SAY HELLO</span>
                <svg class="arrow-icon" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 16L17 1M17 1H3M17 1V15" stroke="black" stroke-width="1.5"/>
                </svg>
            </a>
        </div>
    </div>`;
}

function renderFooter(variant = 'default') {
    const lang = getCurrentLang();
    const containerClass = variant === 'portfolio' ? 'footer-container footer-container--portfolio' : 'footer-container';
    return `
    <div class="${containerClass}">
        <div class="footer">
            <span class="footer-text" data-i18n="footer.text">All Rights Reserved DIO 2026</span>
            <div class="language-toggle">
                <button class="lang-btn" data-lang="pt">PT</button>
                <button class="lang-btn" data-lang="en">EN</button>
            </div>
        </div>
    </div>`;
}

// --- HOME PAGE ---

export function renderHomePage() {
    // Get first project for featured image
    const projects = getProjects();
    const featured = projects.length > 0 ? projects[0] : null;
    const featuredImg = featured ? featured.thumbnail : '';
    const title = featured ? (t(featured.titleKey) || featured.title) : '';

    return `
    <div class="page page-home">
        ${renderHeader()}
        <div class="home-content">
            <div class="home-copy">
                <h1 data-i18n="home.headline">
                    <span style="font-weight:200" data-i18n="home.headline_light1">The bridge between</span>
                </h1>
            </div>
            <div class="home-features">
                ${featuredImg ? `
                <a href="#project/${featured.id}" class="home-featured-image" data-title="${title}">
                    <img src="${featuredImg}" alt="${t('home.featured_alt')}">
                </a>` : ''}
                <span class="home-featured-label" data-i18n="home.featured_label">CHECK ONE OF MY WORKS</span>
            </div>
        </div>
        ${renderFooter()}
    </div>`;
}

// Custom render for the home headline with mixed weights
export function postRenderHome() {
    const copyEl = document.querySelector('.home-copy h1');
    if (copyEl) {
        const headline1 = t('home.headline_part1');
        const headline2 = t('home.headline_part2');
        const headline3 = t('home.headline_part3');
        const headline4 = t('home.headline_part4');
        copyEl.innerHTML = `<span style="font-weight:200">${headline1}</span><br><strong>${headline2}</strong> <span style="font-weight:200">${headline3}</span><br><strong>${headline4}</strong>`;
    }

    // Custom cursor title follow interaction for the featured image
    const homePage = document.querySelector('.page-home');
    const featuredImage = document.querySelector('.home-featured-image');
    if (homePage && featuredImage) {
        // Create tooltip element dynamically inside the page container
        const tooltip = document.createElement('div');
        tooltip.className = 'portfolio-cursor-title';
        homePage.appendChild(tooltip);

        featuredImage.addEventListener('mousemove', (e) => {
            tooltip.style.transform = `translate3d(${e.clientX + 20}px, ${e.clientY}px, 0) translateY(-50%)`;
        });

        featuredImage.addEventListener('mouseenter', () => {
            const title = featuredImage.dataset.title || '';
            tooltip.textContent = title;
            tooltip.classList.add('visible');
        });

        featuredImage.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });

        // Start the featured projects carousel
        startHomeCarousel(featuredImage, tooltip);
    }
}

function startHomeCarousel(featuredImage, tooltip) {
    // Clear any existing carousel interval
    destroyHomeCarousel();

    const projects = getProjects();
    if (projects.length <= 1) return; // No need to rotate if 0 or 1 project

    // Initialize index at 0 (or match currently displayed featured project)
    currentCarouselIndex = 0;

    homeCarouselInterval = setInterval(() => {
        currentCarouselIndex = (currentCarouselIndex + 1) % projects.length;
        const nextProject = projects[currentCarouselIndex];
        const nextTitle = t(nextProject.titleKey) || nextProject.title;

        if (window.gsap) {
            window.gsap.to(featuredImage, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    featuredImage.href = `#project/${nextProject.id}`;
                    featuredImage.dataset.title = nextTitle;
                    
                    const img = featuredImage.querySelector('img');
                    if (img) {
                        img.src = nextProject.thumbnail;
                    }

                    if (tooltip && tooltip.classList.contains('visible')) {
                        tooltip.textContent = nextTitle;
                    }

                    window.gsap.to(featuredImage, {
                        opacity: 1,
                        duration: 0.5
                    });
                }
            });
        } else {
            // Fallback if GSAP is not loaded
            featuredImage.href = `#project/${nextProject.id}`;
            featuredImage.dataset.title = nextTitle;
            const img = featuredImage.querySelector('img');
            if (img) {
                img.src = nextProject.thumbnail;
            }
            if (tooltip && tooltip.classList.contains('visible')) {
                tooltip.textContent = nextTitle;
            }
        }
    }, 5000); // Every 5 seconds
}

export function destroyHomeCarousel() {
    if (homeCarouselInterval) {
        clearInterval(homeCarouselInterval);
        homeCarouselInterval = null;
    }
}

// --- ABOUT PAGE ---

export function renderAboutPage() {
    return `
    <div class="page page-about">
        ${renderHeader()}
        <div class="about-content">
            <div class="about-copy">
                <div class="about-space"></div>
                <div class="about-intro">
                    <p>
                        <span data-i18n="about.intro_part1">I'm Diogo Conde, a </span><strong data-i18n="about.intro_bold">Creative Technologist</strong><span data-i18n="about.intro_part2"> at the intersection of design and code. I craft aesthetics down to the millimeter and bring them to life through technology, whether on a screen, a virtual stage, or a physical installation.</span>
                    </p>
                </div>
                <div class="about-details">
                    <div class="about-timeline">
                        <span class="timeline-label" data-i18n="about.timeline_origin">THE ORIGIN</span>
                        <div class="timeline-line"></div>
                        <span class="timeline-label" data-i18n="about.timeline_direction">CREATIVE & TECHNICAL DIRECTION</span>
                        <div class="timeline-line"></div>
                        <span class="timeline-label" data-i18n="about.timeline_explorer">THE EXPLORER SIDE</span>
                    </div>
                    <div class="about-columns">
                        <p data-i18n="about.col1">My entire professional life has been linked to graphic and digital design. It's an old passion—ever since I was a child watching cartoons, I knew exactly what I wanted to do. Today, I turn that imagination into reality through Design, Animation and Visual Effects.</p>
                        <p data-i18n="about.col2">In my last role, I worked as a Creative and Technical Director, taking responsibility for all 3D virtual production in the events and advertising sectors, as well as content creation and event planning. My role went far beyond visual execution, it involved designing immersive environments, creating animations and visual effects.</p>
                        <p data-i18n="about.col3">I consider myself an eternally curious mind and a chronic self-taught learner, always on the lookout for new technologies. This need to explore led me to test Artificial Intelligence tools, develop applications for various platforms, and dive into electronics. I love getting my hands dirty programming, creating immersive interactive installations that bridge the physical and digital worlds.</p>
                    </div>
                </div>
            </div>
            <div class="about-photo">
                <img src="assets/images/profile.png" alt="Diogo Conde">
            </div>
        </div>
        ${renderFooter()}
    </div>`;
}

// --- PORTFOLIO PAGE ---

const CATEGORIES = ['ALL', '3D VIZ', 'MOTION', 'INTERACTIVE', 'DIGITAL UI/UX', 'DESIGN'];

export function renderPortfolioPage() {
    const savedCategory = sessionStorage.getItem('portfolioCategory') || 'ALL';
    const projects = savedCategory === 'ALL' ? getProjects() : getProjectsByCategory(savedCategory);

    return `
    <div class="page page-portfolio">
        <div class="portfolio-header-wrapper">
            ${renderHeader(true)}
            <div class="filter-bar">
                ${CATEGORIES.map((cat, i) => `
                    <div class="filter-item">
                        <button class="filter-btn ${cat === savedCategory ? 'active' : ''}" data-category="${cat}">
                            <span class="filter-text">${cat}</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="portfolio-content">
            <div class="portfolio-grid" id="portfolio-grid">
                ${renderProjectThumbnails(projects)}
            </div>
        </div>
        ${renderFooter('portfolio')}
    </div>`;
}

function renderProjectThumbnails(projects) {
    return projects.map(p => {
        const title = t(p.titleKey) || p.title;
        return `
            <a href="#project/${p.id}" class="project-thumb" data-title="${title}" data-categories="${(p.categories || []).join(',')}">
                <img src="${p.thumbnail}" alt="${title}" loading="lazy">
                <div class="duotone-overlay"></div>
            </a>
        `;
    }).join('');
}

let portfolioResizeHandler = null;

function updateFilterPillPosition(filterBar, activeBtn, animate = true) {
    let pill = filterBar.querySelector('.filter-active-pill');
    if (!pill) {
        pill = document.createElement('div');
        pill.className = 'filter-active-pill';
        filterBar.appendChild(pill);
    }

    if (!activeBtn) {
        pill.style.opacity = '0';
        return;
    }

    if (!animate) {
        pill.style.transition = 'none';
    } else {
        pill.style.transition = 'left 0.4s cubic-bezier(0.25, 1, 0.5, 1), width 0.4s cubic-bezier(0.25, 1, 0.5, 1), height 0.4s cubic-bezier(0.25, 1, 0.5, 1), top 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
    }

    const barRect = filterBar.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const relativeLeft = btnRect.left - barRect.left;
    const relativeTop = btnRect.top - barRect.top;

    pill.style.left = `${relativeLeft}px`;
    pill.style.top = `${relativeTop}px`;
    pill.style.width = `${btnRect.width}px`;
    pill.style.height = `${btnRect.height}px`;
    pill.style.opacity = '1';

    if (!animate) {
        // Force reflow
        pill.offsetHeight;
        pill.style.transition = '';
    }
}

export function postRenderPortfolio() {
    // Remove previous listener to prevent leaks
    if (portfolioResizeHandler) {
        window.removeEventListener('resize', portfolioResizeHandler);
        portfolioResizeHandler = null;
    }

    const filterBar = document.querySelector('.page-portfolio .filter-bar');
    const filterBtns = document.querySelectorAll('.page-portfolio .filter-btn');
    const grid = document.getElementById('portfolio-grid');

    if (filterBar) {
        const activeBtn = filterBar.querySelector('.filter-btn.active');
        // Initialize the pill position synchronously (no animation) with a tiny timeout
        // to ensure DOM layouts are calculated
        setTimeout(() => {
            const currentActive = filterBar.querySelector('.filter-btn.active');
            updateFilterPillPosition(filterBar, currentActive, false);
        }, 50);

        portfolioResizeHandler = () => {
            const currentActive = filterBar.querySelector('.filter-btn.active');
            updateFilterPillPosition(filterBar, currentActive, false);
        };
        window.addEventListener('resize', portfolioResizeHandler);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (filterBar) {
                updateFilterPillPosition(filterBar, btn, true);
            }

            // Filter projects
            const category = btn.dataset.category;
            sessionStorage.setItem('portfolioCategory', category);
            const projects = category === 'ALL' ? getProjects() : getProjectsByCategory(category);
            if (grid) {
                grid.innerHTML = renderProjectThumbnails(projects);
            }
        });
    });

    // Custom cursor title follow interaction for cards
    const portfolioPage = document.querySelector('.page-portfolio');
    if (portfolioPage) {
        // Create tooltip element dynamically inside the page container
        const tooltip = document.createElement('div');
        tooltip.className = 'portfolio-cursor-title';
        portfolioPage.appendChild(tooltip);

        let activeThumb = null;

        portfolioPage.addEventListener('mousemove', (e) => {
            tooltip.style.transform = `translate3d(${e.clientX + 20}px, ${e.clientY}px, 0) translateY(-50%)`;
        });

        portfolioPage.addEventListener('mouseover', (e) => {
            const thumb = e.target.closest('.project-thumb');
            if (thumb && thumb !== activeThumb) {
                activeThumb = thumb;
                const title = thumb.dataset.title || '';
                tooltip.textContent = title;
                tooltip.classList.add('visible');
            }
        });

        portfolioPage.addEventListener('mouseout', (e) => {
            const thumb = e.target.closest('.project-thumb');
            if (thumb && thumb === activeThumb) {
                const related = e.relatedTarget;
                if (!related || !thumb.contains(related)) {
                    activeThumb = null;
                    tooltip.classList.remove('visible');
                }
            }
        });
    }
}

// --- PROJECT DETAIL PAGE ---

export function renderProjectPage(projectId) {
    const project = getProjectById(projectId);
    if (!project) {
        return `<div class="page page-project">
            ${renderHeader(true)}
            <div class="project-content"><p>Project not found.</p></div>
            ${renderFooter('portfolio')}
        </div>`;
    }

    const title = t(project.titleKey) || project.title;
    const year = project.year || '';
    const objective = t(project.objectiveKey) || project.objective || '';
    const description = t(project.descriptionKey) || project.description || '';
    const media = [...(project.media || [])].sort((a, b) => a.url.localeCompare(b.url, undefined, { numeric: true, sensitivity: 'base' }));

    return `
    <div class="page page-project">
        <div class="project-header-wrapper">
            ${renderHeader(true)}
            <div class="filter-bar">
                ${CATEGORIES.map(cat => `
                    <div class="filter-item">
                        <button class="filter-btn ${project.categories && project.categories.includes(cat) ? 'active' : ''}" data-category="${cat}">
                            <span class="filter-text">${cat}</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="project-content">
            <div class="project-info">
                <a href="#portfolio" class="project-back">
                    <svg class="back-arrow" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 16L17 1M17 1H3M17 1V15" stroke="#ff4000" stroke-width="1.5"/>
                    </svg>
                    <span data-i18n="project.back">Back</span>
                </a>
                <div class="project-title-section">
                    <h2>${title}</h2>
                    <span class="project-year">${year}</span>
                </div>
                <div class="project-objective">
                    <p>${objective}</p>
                </div>
                <div class="project-description">
                    <p>${description}</p>
                </div>
            </div>
            <div class="project-media">
                ${media.map(item => {
                    const ext = item.url.split('.').pop().toLowerCase();
                    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
                    if (isVideo) {
                        return `<div class="project-media-item"><video src="${item.url}" controls controlsList="nodownload"></video></div>`;
                    }
                    return `<div class="project-media-item"><img src="${item.url}" alt="${title}"></div>`;
                }).join('')}
                ${media.length === 0 ? `
                    <div class="project-media-item"></div>
                    <div class="project-media-item"></div>
                    <div class="project-media-item"></div>
                ` : ''}
            </div>
        </div>
        ${renderFooter('portfolio')}
    </div>`;
}

export function postRenderProject() {
    const filterBtns = document.querySelectorAll('.page-project .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            sessionStorage.setItem('portfolioCategory', category);
            window.location.hash = 'portfolio';
        });
    });

    // Image Popup functionality
    const images = document.querySelectorAll('.page-project .project-media-item img');
    
    // Create popup wrapper if not exists
    let popup = document.querySelector('.project-image-popup-overlay');
    if (!popup) {
        popup = document.createElement('div');
        popup.className = 'project-image-popup-overlay';
        popup.innerHTML = `
            <button class="project-image-popup-close" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="project-image-popup-content">
                <img src="" alt="Popup Image">
            </div>
        `;
        document.body.appendChild(popup);

        // Close functions
        const closeBtn = popup.querySelector('.project-image-popup-close');
        const closePopup = () => {
            popup.classList.remove('active');
            document.body.style.overflow = '';
        };
        closeBtn.addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup || e.target.classList.contains('project-image-popup-content')) {
                closePopup();
            }
        });
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                closePopup();
            }
        });
    }

    images.forEach(img => {
        img.addEventListener('click', () => {
            const popupImg = popup.querySelector('img');
            popupImg.src = img.src;
            popupImg.alt = img.alt;
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}
