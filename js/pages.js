// ===================================================
// DIO PORTFOLIO – Page Renderers
// Each function returns an HTML string for its page.
// ===================================================

import { t, getCurrentLang } from './i18n.js';
import { getProjects, getProjectById, getProjectsByCategory } from './data.js';
import { initProfileDisplacement } from './profileDisplacement.js';

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
            <span class="footer-text" data-i18n="footer.text">Developed and Designed by Diogo Santos</span>
            <div class="footer-sitemap">
                <a href="#home" class="footer-nav-link" data-i18n="footer.home">Homepage</a>
                <a href="#about" class="footer-nav-link" data-i18n="footer.about">About me</a>
                <a href="#portfolio" class="footer-nav-link" data-i18n="footer.portfolio">Portfolio</a>
            </div>
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

// --- ABOUT PAGE ---

export function renderAboutPage() {
    return `
    <div class="page page-about">
        ${renderHeader()}
        <div class="about-content">
            <div class="about-copy">
                <div class="about-space"></div>
                <div class="about-intro">
                    <div class="about-intro-text active" data-content="default">
                        <p>
                            <span data-i18n="about.intro_part1">I'm Diogo Santos, a </span><strong data-i18n="about.intro_bold">Creative Technologist</strong><span data-i18n="about.intro_part2"> at the intersection of design and code. I craft aesthetics down to the millimeter and bring them to life through technology, whether on a screen, a virtual stage, or a physical installation.</span>
                        </p>
                    </div>
                    <div class="about-intro-text" data-content="origin" style="display: none; opacity: 0;">
                        <p data-i18n="about.col1">My entire professional life has been linked to graphic and digital design. It's an old passion—ever since I was a child watching cartoons, I knew exactly what I wanted to do. Today, I turn that imagination into reality through Design, Animation and Visual Effects.</p>
                    </div>
                    <div class="about-intro-text" data-content="direction" style="display: none; opacity: 0;">
                        <p data-i18n="about.col2">In my last role, I worked as a Creative and Technical Director, taking responsibility for all 3D virtual production in the events and advertising sectors, as well as content creation and event planning. My role went far beyond visual execution, it involved designing immersive environments, creating animations and visual effects.</p>
                    </div>
                    <div class="about-intro-text" data-content="explorer" style="display: none; opacity: 0;">
                        <p data-i18n="about.col3">I consider myself an eternally curious mind and a chronic self-taught learner, always on the lookout for new technologies. This need to explore led me to test Artificial Intelligence tools, develop applications for various platforms, and dive into electronics. I love getting my hands dirty programming, creating immersive interactive installations that bridge the physical and digital worlds.</p>
                    </div>
                </div>
                <div class="about-timeline-container">
                    <div class="about-timeline">
                        <div class="timeline-node" data-node="origin">
                            <svg viewBox="0 0 120 120" class="timeline-svg">
                                <path id="path-origin" d="M 60,100 a 40,40 0 1,1 0.1,0 Z" fill="none" stroke="none" />
                                <text class="timeline-text-path">
                                    <textPath href="#path-origin" startOffset="50%" text-anchor="middle" data-i18n="about.timeline_origin">THE ORIGIN</textPath>
                                </text>
                                <circle cx="60" cy="60" r="10" class="magnetic-dot" data-force="0.2" />
                                <circle cx="60" cy="60" r="5" class="magnetic-dot" data-force="0.4" />
                                <circle cx="60" cy="60" r="8" class="magnetic-dot" data-force="0.6" />
                                <circle cx="60" cy="60" r="4" class="magnetic-dot" data-force="0.8" />
                                <circle cx="60" cy="60" r="16" class="timeline-shape shape-circle" />
                            </svg>
                        </div>
                        <div class="timeline-line-connector"></div>
                        <div class="timeline-node" data-node="direction">
                            <svg viewBox="0 0 120 120" class="timeline-svg">
                                <path id="path-direction" d="M 60,105 a 45,45 0 1,1 0.1,0 Z" fill="none" stroke="none" />
                                <text class="timeline-text-path">
                                    <textPath href="#path-direction" startOffset="50%" text-anchor="middle" data-i18n="about.timeline_direction">CREATIVE & TECHNICAL DIRECTION</textPath>
                                </text>
                                <g class="pyramid-group" style="transform-origin: 60px 60px;">
                                    <polygon points="60,48 69,66 51,66" class="pyramid-triangle tri-1" />
                                    <polygon points="60,48 69,66 51,66" class="pyramid-triangle tri-2" />
                                    <polygon points="60,48 69,66 51,66" class="pyramid-triangle tri-3" />
                                </g>
                            </svg>
                        </div>
                        <div class="timeline-line-connector"></div>
                        <div class="timeline-node" data-node="explorer">
                            <svg viewBox="0 0 120 120" class="timeline-svg">
                                <path id="path-explorer" d="M 60,100 a 40,40 0 1,1 0.1,0 Z" fill="none" stroke="none" />
                                <text class="timeline-text-path">
                                    <textPath href="#path-explorer" startOffset="50%" text-anchor="middle" data-i18n="about.timeline_explorer">THE EXPLORER SIDE</textPath>
                                </text>
                                <g class="square-grid-group" style="transform-origin: 60px 60px;">
                                    <rect x="44" y="44" width="16" height="16" rx="0" ry="0" fill="currentColor" class="shape-square-grid sq-tl" />
                                    <rect x="60" y="44" width="16" height="16" rx="0" ry="0" fill="currentColor" class="shape-square-grid sq-tr" />
                                    <rect x="44" y="60" width="16" height="16" rx="0" ry="0" fill="currentColor" class="shape-square-grid sq-bl" />
                                    <rect x="60" y="60" width="16" height="16" rx="0" ry="0" fill="currentColor" class="shape-square-grid sq-br" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div class="about-photo">
                <img src="assets/images/profile.jpg" alt="Diogo Santos">
            </div>
        </div>
        ${renderFooter()}
    </div>`;
}

export function postRenderAbout() {
    const originNode = document.querySelector('.page-about .timeline-node[data-node="origin"]');
    const directionNode = document.querySelector('.page-about .timeline-node[data-node="direction"]');
    const explorerNode = document.querySelector('.page-about .timeline-node[data-node="explorer"]');
    const magneticDots = document.querySelectorAll('.page-about .magnetic-dot');
    const pageContainer = document.querySelector('.page-about');
    
    // Create floating glass box tooltip
    let tooltip = null;
    if (pageContainer) {
        tooltip = document.createElement('div');
        tooltip.className = 'timeline-glass-tooltip';
        pageContainer.appendChild(tooltip);

        if (window.gsap) {
            window.gsap.set(tooltip, { x: 0, y: 0, scale: 0.8, opacity: 0 });
        }

        const nodes = [
            { el: originNode, titleKey: 'about.timeline_origin', descKey: 'about.col1' },
            { el: directionNode, titleKey: 'about.timeline_direction', descKey: 'about.col2' },
            { el: explorerNode, titleKey: 'about.timeline_explorer', descKey: 'about.col3' }
        ];

        nodes.forEach(node => {
            if (node.el) {
                node.el.addEventListener('mouseenter', (e) => {
                    const desc = t(node.descKey) || '';
                    
                    tooltip.innerHTML = `
                        <p>${desc}</p>
                    `;
                    
                    tooltip.classList.add('visible');
                    
                    // Set initial positioning instantly so it doesn't glide from (0,0)
                    const offset = 25;
                    let startX = e.clientX + offset;
                    let startY = e.clientY + offset;
                    const tooltipWidth = 380;
                    if (startX + tooltipWidth > window.innerWidth) {
                        startX = e.clientX - tooltipWidth - offset;
                    }
                    const tooltipHeight = tooltip.offsetHeight || 250;
                    if (startY + tooltipHeight > window.innerHeight) {
                        startY = e.clientY - tooltipHeight - offset;
                    }
                    
                    if (window.gsap) {
                        window.gsap.set(tooltip, { x: startX, y: startY });
                        window.gsap.to(tooltip, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                            ease: 'power2.out',
                            overwrite: 'auto'
                        });
                    } else {
                        tooltip.style.opacity = '1';
                        tooltip.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(1)`;
                    }
                });

                node.el.addEventListener('mouseleave', () => {
                    tooltip.classList.remove('visible');
                    if (window.gsap) {
                        window.gsap.to(tooltip, {
                            opacity: 0,
                            scale: 0.8,
                            duration: 0.3,
                            ease: 'power2.in',
                            overwrite: 'auto'
                        });
                    } else {
                        tooltip.style.opacity = '0';
                    }
                });
            }
        });
    }
    
    // Initialize pyramid group scale to 1.78 (32px height) on load cleanly via GSAP (avoids clashing with inline CSS styles)
    if (directionNode) {
        const pyramidGroup = directionNode.querySelector('.pyramid-group');
        if (pyramidGroup) {
            window.gsap.set(pyramidGroup, { scale: 1.78, svgOrigin: "60 60" });
        }
    }
    
    if (pageContainer) {
        let isHovered = false;
        let targetX = 0;
        let targetY = 0;
        
        let isDirHovered = false;
        let targetAngle = 0;
        
        let isExpHovered = false;
        let expDist = 150; // mouse distance to explorer node, default to max
        let targetExpDeltaX = 0;
        let targetExpDeltaY = 0;
        
        // 4 smoothed factors, one for each square to introduce individual, staggered delay / lag
        const currentRepelFactors = [0, 0, 0, 0];
        
        // Individual lerp speeds (smaller speed = heavier delay/lag in response)
        const sqLerpSpeeds = [0.015, 0.025, 0.035, 0.045];
        
        // Individual random angular offsets (adds custom scatter randomness to their repel directions)
        const sqAngleOffsets = [];
        for (let i = 0; i < 4; i++) {
            // Random offset angle between -45 and +45 degrees in radians
            sqAngleOffsets.push((Math.random() - 0.5) * (Math.PI / 2));
        }
        
        // Individual force multipliers to create high variation in displacement (some fly much further than others)
        const sqForceMultipliers = [0.65, 1.45, 0.90, 1.75];
        
        const activationDistance = 150; // Trigger distance in pixels
        
        pageContainer.addEventListener('mousemove', (e) => {
            // Update tooltip position if visible
            if (tooltip && tooltip.classList.contains('visible')) {
                const offset = 25;
                let tX = e.clientX + offset;
                let tY = e.clientY + offset;
                
                const tooltipWidth = 380;
                const tooltipHeight = tooltip.offsetHeight || 250;
                
                if (tX + tooltipWidth > window.innerWidth) {
                    tX = e.clientX - tooltipWidth - offset;
                }
                if (tY + tooltipHeight > window.innerHeight) {
                    tY = e.clientY - tooltipHeight - offset;
                }
                if (tY < 0) {
                    tY = offset;
                }
                
                if (window.gsap) {
                    window.gsap.to(tooltip, {
                        x: tX,
                        y: tY,
                        duration: 1.0,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                } else {
                    tooltip.style.transform = `translate3d(${tX}px, ${tY}px, 0)`;
                }
            }

            // 1. Origin Node Physics Calculation (Particles)
            if (originNode && magneticDots.length > 0) {
                const rect = originNode.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (dist < activationDistance) {
                    isHovered = true;
                    const maxDist = 45;
                    if (dist > maxDist) {
                        targetX = (deltaX / dist) * maxDist;
                        targetY = (deltaY / dist) * maxDist;
                    } else {
                        targetX = deltaX;
                        targetY = deltaY;
                    }
                } else {
                    isHovered = false;
                    targetX = 0;
                    targetY = 0;
                }
            }
            
            // 2. Direction Node Physics Calculation (Pyramid Rotation)
            if (directionNode) {
                const rect = directionNode.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (dist < activationDistance) {
                    isDirHovered = true;
                    // Math.atan2 gives the angle in radians. We add 90 degrees (Math.PI / 2) because 
                    // the triangle points UP natively, but Math.atan2 0 is rightward.
                    const angleRad = Math.atan2(deltaY, deltaX);
                    targetAngle = angleRad * (180 / Math.PI) + 90;
                } else {
                    isDirHovered = false;
                    targetAngle = 0;
                }
            }
            
            // 3. Explorer Node Physics Calculation (Repelling Grid Squares)
            if (explorerNode) {
                const rect = explorerNode.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                expDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (expDist < activationDistance) {
                    isExpHovered = true;
                    targetExpDeltaX = deltaX;
                    targetExpDeltaY = deltaY;
                } else {
                    isExpHovered = false;
                    targetExpDeltaX = 0;
                    targetExpDeltaY = 0;
                }
            }
        });
        
        // Reset if mouse leaves the page entirely
        pageContainer.addEventListener('mouseleave', () => {
            isHovered = false;
            targetX = 0;
            targetY = 0;
            isDirHovered = false;
            targetAngle = 0;
            isExpHovered = false;
            expDist = 150;
            targetExpDeltaX = 0;
            targetExpDeltaY = 0;
        });

        // Continuous Physics Loop
        function renderLoop() {
            if (!document.querySelector('.page-about')) return; // Stop loop if page changes
            
            const time = performance.now() * 0.001;
            
            if (window.gsap) {
                // Animate Origin Particles
                if (magneticDots.length > 0) {
                    magneticDots.forEach((dot, index) => {
                        const baseForce = parseFloat(dot.dataset.force || 0.2);
                        const dynamicForce = baseForce + Math.sin(time * 0.5 + index) * 0.15;
                        
                        const noiseAmplitude = isHovered ? 12 : 6;
                        const noiseX = Math.sin(time * 1.5 + index * 2.1) * noiseAmplitude;
                        const noiseY = Math.cos(time * 1.1 + index * 1.7) * noiseAmplitude;
                        
                        const finalX = (targetX * dynamicForce) + noiseX;
                        const finalY = (targetY * dynamicForce) + noiseY;
                        
                        const animDuration = isHovered 
                            ? 0.6 + (index * 0.35) 
                            : 2.0 + (index * 0.6);
                        
                        window.gsap.to(dot, {
                            x: finalX,
                            y: finalY,
                            duration: animDuration,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    });
                }
                
                // Animate Direction Pyramid Morph and Rotation
                if (directionNode) {
                    const pyramidGroup = directionNode.querySelector('.pyramid-group');
                    const tri1 = directionNode.querySelector('.tri-1');
                    const tri2 = directionNode.querySelector('.tri-2');
                    const tri3 = directionNode.querySelector('.tri-3');
                    
                    if (pyramidGroup && tri1 && tri2 && tri3) {
                        if (isDirHovered) {
                            // Expand the 3 stacked triangles outwards into a mathematically centered perfect pyramid
                            window.gsap.to(tri1, {
                                x: 0,
                                y: -12,
                                duration: 0.6,
                                ease: "back.out(1.5)",
                                overwrite: "auto"
                            });
                            window.gsap.to(tri2, {
                                x: -10,
                                y: 6,
                                duration: 0.6,
                                ease: "back.out(1.5)",
                                overwrite: "auto"
                            });
                            window.gsap.to(tri3, {
                                x: 10,
                                y: 6,
                                duration: 0.6,
                                ease: "back.out(1.5)",
                                overwrite: "auto"
                            });
                            
                            // Rotate and shrink the entire pyramid group perfectly around (60, 60) to point at mouse
                            window.gsap.to(pyramidGroup, {
                                scale: 1.0,
                                rotation: targetAngle + "_short",
                                svgOrigin: "60 60",
                                duration: 0.8,
                                ease: "power2.out",
                                overwrite: "auto"
                            });
                        } else {
                            // Collapse all 3 triangles back to the center (fully overlapping at 60,60)
                            window.gsap.to([tri1, tri2, tri3], {
                                x: 0,
                                y: 0,
                                duration: 1.0,
                                ease: "power3.out",
                                overwrite: "auto"
                            });
                            
                            // Reset parent group rotation and expand scale to 1.78 (32px height) around (60, 60)
                            window.gsap.to(pyramidGroup, {
                                scale: 1.78,
                                rotation: 0,
                                svgOrigin: "60 60",
                                duration: 1.2,
                                ease: "power2.out",
                                overwrite: "auto"
                            });
                        }
                    }
                }
                
                // Animate Explorer - 4 Custom Repelling Grid Squares
                if (explorerNode) {
                    const gridSquares = [
                        explorerNode.querySelector('.sq-tl'),
                        explorerNode.querySelector('.sq-tr'),
                        explorerNode.querySelector('.sq-bl'),
                        explorerNode.querySelector('.sq-br')
                    ];

                    const maxRepelDistance = 40; // max pixels they drift apart in opposite direction of mouse

                    // Calculate base repel direction away from mouse
                    const len = Math.sqrt(targetExpDeltaX * targetExpDeltaX + targetExpDeltaY * targetExpDeltaY) || 1;
                    const repelX = -targetExpDeltaX / len;
                    const repelY = -targetExpDeltaY / len;

                    gridSquares.forEach((sq, index) => {
                        if (sq) {
                            // Update individual factor with unique lerp speed for staggered delay/lag
                            const targetFactor = isExpHovered ? Math.max(0, 1 - (expDist / activationDistance)) : 0;
                            currentRepelFactors[index] += (targetFactor - currentRepelFactors[index]) * sqLerpSpeeds[index];
                            
                            const factor = currentRepelFactors[index];

                            // "quanto mais perto estou do centro mais eles se mexem e quanto mais afasto estou menos eles se mexem"
                            // Directly proportional dampening: maximum scatter/vibration when pushed far out (factor -> 1)
                            const randomDampening = factor;

                            // Rotate the base repel direction by the unique angle offset (scales down with distance)
                            const angleOffset = sqAngleOffsets[index] * randomDampening;
                            const cos = Math.cos(angleOffset);
                            const sin = Math.sin(angleOffset);
                            const finalRepelX = repelX * cos - repelY * sin;
                            const finalRepelY = repelX * sin + repelY * cos;

                            // Unique noise - also scales down as they fly further out
                            const noiseAmplitude = isExpHovered ? 12 : 0;
                            const noiseX = Math.sin(time * 1.8 + index * 2.5) * noiseAmplitude * randomDampening;
                            const noiseY = Math.cos(time * 1.4 + index * 1.9) * noiseAmplitude * randomDampening;
                            
                            // Base force multiplier per square from the predefined highly-varied array
                            const baseForce = sqForceMultipliers[index];
                            const repelDist = maxRepelDistance * factor * baseForce;
                            
                            const targetX = finalRepelX * repelDist + noiseX;
                            const targetY = finalRepelY * repelDist + noiseY;
                            
                            window.gsap.to(sq, {
                                x: targetX,
                                y: targetY,
                                duration: 0.45,
                                ease: "power2.out",
                                overwrite: "auto"
                            });
                        }
                    });
                }
            }
            
            requestAnimationFrame(renderLoop);
        }
        
        renderLoop();
    }

    // Initialize WebGL displacement effect on the profile picture
    initProfileDisplacement();
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
                            <span class="filter-text">${t('categories.' + cat)}</span>
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
        let xToTooltip, yToTooltip;

        if (typeof gsap !== 'undefined') {
            gsap.set(tooltip, { xPercent: 0, yPercent: -50, x: 0, y: 0 });
            xToTooltip = gsap.quickTo(tooltip, 'x', { duration: 0.6, ease: 'power2.out' });
            yToTooltip = gsap.quickTo(tooltip, 'y', { duration: 0.6, ease: 'power2.out' });
        }

        portfolioPage.addEventListener('mousemove', (e) => {
            const targetX = e.clientX + 20;
            const targetY = e.clientY;
            if (xToTooltip && yToTooltip) {
                xToTooltip(targetX);
                yToTooltip(targetY);
            } else {
                tooltip.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translateY(-50%)`;
            }
        });

        portfolioPage.addEventListener('mouseover', (e) => {
            const thumb = e.target.closest('.project-thumb');
            if (thumb && thumb !== activeThumb) {
                const title = thumb.dataset.title || '';
                tooltip.textContent = title;

                // Snap position instantly on first hover so it doesn't glide from (0,0)
                const startX = e.clientX + 20;
                const startY = e.clientY;
                if (typeof gsap !== 'undefined') {
                    gsap.set(tooltip, { x: startX, y: startY });
                    if (xToTooltip && yToTooltip) {
                        xToTooltip(startX);
                        yToTooltip(startY);
                    }
                } else {
                    tooltip.style.transform = `translate3d(${startX}px, ${startY}px, 0) translateY(-50%)`;
                }

                activeThumb = thumb;
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
    const isSingleCol = project.mediaLayout === 'single';
    const mediaClass = isSingleCol ? 'project-media project-media--single' : 'project-media';

    return `
    <div class="page page-project">
        <div class="project-header-wrapper">
            ${renderHeader(true)}
            <div class="filter-bar">
                ${CATEGORIES.map(cat => `
                    <div class="filter-item">
                        <button class="filter-btn ${project.categories && project.categories.includes(cat) ? 'active' : ''}" data-category="${cat}">
                            <span class="filter-text">${t('categories.' + cat)}</span>
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
                    <span class="project-year">
                        <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${year}
                    </span>
                </div>
                <div class="project-objective">
                    <h3 class="project-sidebar-title" data-i18n="project.objective">Objective</h3>
                    <p>${objective}</p>
                </div>
                <div class="project-description">
                    <h3 class="project-sidebar-title" data-i18n="project.description">Description</h3>
                    <p class="description-html">${description}</p>
                </div>
            </div>
            <div class="${mediaClass}">
                ${media.map(item => {
                    const ext = item.url.split('.').pop().toLowerCase();
                    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
                    if (item.type === '360') {
                        return `<div class="project-media-item project-media-item--360" data-src360="${item.url}">
                            <div class="viewer360-container" id="viewer360">
                                <div class="viewer360-hint">↔ Drag to explore 360°</div>
                            </div>
                        </div>`;
                    }
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
    // Description HTML is already rendered properly by the template literal.

    // Init Three.js 360° viewer if present
    const viewer360El = document.getElementById('viewer360');
    if (viewer360El) {
        const src = viewer360El.closest('[data-src360]')?.dataset.src360;
        if (src) init360Viewer(viewer360El, src);
    }


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

// ===================================================
// THREE.JS 360° PANORAMA VIEWER
// ===================================================
function init360Viewer(container, imageSrc) {
    // Dynamically load Three.js from CDN if not already loaded
    function loadScript(src, callback) {
        if (document.querySelector(`script[src="${src}"]`)) { callback(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = callback;
        document.head.appendChild(s);
    }

    loadScript('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js', () => {
        const THREE = window.THREE;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 0.001);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // Sphere geometry for equirectangular panorama
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert so texture faces inward
        const texture = new THREE.TextureLoader().load(imageSrc);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        scene.add(new THREE.Mesh(geometry, material));

        // Drag interaction state
        let isDragging = false;
        let previousMouse = { x: 0, y: 0 };
        let lon = 0, lat = 0;
        let targetLon = 0, targetLat = 0;

        const el = renderer.domElement;

        el.addEventListener('mousedown', e => {
            isDragging = true;
            previousMouse = { x: e.clientX, y: e.clientY };
        });
        window.addEventListener('mouseup', () => { isDragging = false; });
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            targetLon -= (e.clientX - previousMouse.x) * 0.2;
            targetLat += (e.clientY - previousMouse.y) * 0.1;
            previousMouse = { x: e.clientX, y: e.clientY };
        });

        // Touch support
        let lastTouch = null;
        el.addEventListener('touchstart', e => { lastTouch = e.touches[0]; });
        el.addEventListener('touchmove', e => {
            if (!lastTouch) return;
            e.preventDefault();
            const t = e.touches[0];
            targetLon -= (t.clientX - lastTouch.clientX) * 0.3;
            targetLat += (t.clientY - lastTouch.clientY) * 0.15;
            lastTouch = t;
        }, { passive: false });
        el.addEventListener('touchend', () => { lastTouch = null; });

        // Hint fade out
        const hint = container.querySelector('.viewer360-hint');
        if (hint) setTimeout(() => { hint.style.opacity = '0'; }, 2500);

        // Auto-rotation speed (degrees per frame) — always active
        const AUTO_ROTATE_SPEED = 0.04;

        let animId;
        function animate() {
            animId = requestAnimationFrame(animate);

            // Always auto-rotate — drag input adds on top of this
            targetLon += AUTO_ROTATE_SPEED;

            // Smooth interpolation
            lon += (targetLon - lon) * 0.06;
            lat += (targetLat - lat) * 0.06;
            lat = Math.max(-85, Math.min(85, lat));
            const phi = THREE.MathUtils.degToRad(90 - lat);
            const theta = THREE.MathUtils.degToRad(lon);
            camera.lookAt(
                500 * Math.sin(phi) * Math.cos(theta),
                500 * Math.cos(phi),
                500 * Math.sin(phi) * Math.sin(theta)
            );
            renderer.render(scene, camera);
        }
        animate();

        // Resize handler
        const resizeObs = new ResizeObserver(() => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });
        resizeObs.observe(container);

        // Cleanup when navigating away
        window.addEventListener('hashchange', () => {
            cancelAnimationFrame(animId);
            resizeObs.disconnect();
            renderer.dispose();
        }, { once: true });
    });
}
