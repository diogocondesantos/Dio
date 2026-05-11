// ===================================================
// DIO PORTFOLIO – Main Entry Point
// ===================================================

import { initI18n, setLanguage, onLanguageChange, updateDOM } from './i18n.js';
import { loadProjectsData } from './data.js';
import { registerRoute, initRouter } from './router.js';
import {
    renderHomePage, postRenderHome,
    renderAboutPage,
    renderPortfolioPage, postRenderPortfolio,
    renderProjectPage, postRenderProject
} from './pages.js';
import { initMagneticText, destroyMagneticText } from './magneticText.js';
import { initCustomCursor } from './customCursor.js';
import { initMagneticMenu, updateMagneticMenuPositions } from './magneticMenu.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Initialize Custom Cursor and Magnetic Menu
    initCustomCursor();
    initMagneticMenu();

    // 1. Load data first
    await loadProjectsData();

    // 2. Initialize i18n
    await initI18n();

    // 3. Register routes
    registerRoute('home', renderHomePage);
    registerRoute('about', renderAboutPage);
    registerRoute('portfolio', renderPortfolioPage);
    registerRoute('project', renderProjectPage);

    // 4. Start the router
    initRouter((currentRoute, hash) => {
        // Post-render hooks
        updateDOM();

        // Clean up magnetic text when leaving home
        destroyMagneticText();

        if (currentRoute === 'home') {
            postRenderHome();
            initMagneticText();
        }
        if (currentRoute === 'portfolio') {
            postRenderPortfolio();
        }
        if (currentRoute === 'project') {
            postRenderProject();
        }

        // Bind language toggle buttons everywhere
        bindLanguageToggles();

        // Update magnetic menu positions after CSS transitions complete (0.6s)
        setTimeout(() => {
            updateMagneticMenuPositions();
        }, 650);
    });

    // 5. Re-render on language change
    onLanguageChange(() => {
        // Re-trigger the current route
        const hash = window.location.hash.replace('#', '') || 'home';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    // 6. Disable right-click globally to protect portfolio assets
    document.addEventListener('contextmenu', e => e.preventDefault());
});

function bindLanguageToggles() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
}
