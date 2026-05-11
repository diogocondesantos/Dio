// ===================================================
// DIO PORTFOLIO – SPA Router
// ===================================================
import { getPreviousProject, getNextProject } from './data.js';

const routes = {};
let currentRoute = null;

/**
 * Register a route.
 * @param {string} hash - The hash path (e.g., 'home', 'about', 'portfolio')
 * @param {Function} renderFn - A function that returns an HTML string for the page
 */
export function registerRoute(hash, renderFn) {
    routes[hash] = renderFn;
}

/**
 * Navigate to a hash route.
 */
export function navigate(hash) {
    window.location.hash = hash;
}

/**
 * Initialize the router, listen for hash changes.
 * @param {Function} onRouteChange - Callback after rendering (for binding events, etc.)
 */
export function initRouter(onRouteChange) {
    function handleRoute() {
        const hash = window.location.hash.replace('#', '') || 'home';
        const app = document.getElementById('app');

        if (routes[hash]) {
            app.innerHTML = routes[hash]();
            currentRoute = hash;
        } else if (hash.startsWith('project/')) {
            // Dynamic project route: project/<projectId>
            if (routes['project']) {
                const projectId = hash.split('/')[1];
                app.innerHTML = routes['project'](projectId);
                currentRoute = 'project';
            }
        } else {
            // Fallback to home
            app.innerHTML = routes['home']();
            currentRoute = 'home';
        }

        // Update floating menu position
        updateMenuPosition(currentRoute, hash);

        // Update menu active states
        updateMenuActiveStates(hash);

        // Toggle body scroll lock for fullscreen pages
        const noScrollPages = ['home', 'about'];
        document.body.classList.toggle('no-scroll', noScrollPages.includes(currentRoute));

        // Scroll to top on page change
        window.scrollTo(0, 0);

        // Callback for post-render binding
        if (onRouteChange) onRouteChange(currentRoute, hash);
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Initial load
}

function updateMenuPosition(route, hash) {
    const menu = document.getElementById('floating-menu');
    const menuNext = document.getElementById('floating-menu-next');
    const mainLinks = document.querySelectorAll('.main-link');
    const projectLinks = document.querySelectorAll('.project-link');
    const btnPrev = document.getElementById('menu-prev');
    const btnNext = document.getElementById('menu-next');

    if (!menu) return;

    if (route === 'home') {
        menu.setAttribute('data-position', 'home');
    } else if (route === 'about') {
        menu.setAttribute('data-position', 'about');
    } else if (route === 'portfolio') {
        menu.setAttribute('data-position', 'portfolio');
    } else if (route === 'project') {
        menu.setAttribute('data-position', 'project');
    }

    // Toggle menu items and secondary menu
    if (route === 'project' && hash.startsWith('project/')) {
        const projectId = hash.split('/')[1];
        const prevProject = getPreviousProject(projectId);
        const nextProject = getNextProject(projectId);
        
        mainLinks.forEach(el => el.style.display = 'none');
        projectLinks.forEach(el => el.style.display = 'flex');
        
        if (btnPrev && prevProject) btnPrev.href = `#project/${prevProject.id}`;
        if (btnNext && nextProject) btnNext.href = `#project/${nextProject.id}`;
        
        if (menuNext) menuNext.setAttribute('data-position', 'project-next');
    } else {
        mainLinks.forEach(el => el.style.display = 'flex');
        // Hide only the prev button inside the main menu
        if (btnPrev) btnPrev.style.display = 'none';
        
        if (menuNext) menuNext.setAttribute('data-position', 'hidden');
    }
}

function updateMenuActiveStates(hash) {
    const aboutLink = document.getElementById('menu-about');
    const portfolioLink = document.getElementById('menu-portfolio');

    if (aboutLink) {
        aboutLink.classList.toggle('active', hash === 'about');
    }
    if (portfolioLink) {
        portfolioLink.classList.toggle('active',
            hash === 'portfolio' || hash.startsWith('project/')
        );
    }
}
