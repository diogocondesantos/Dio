// ===================================================
// DIO PORTFOLIO – i18n (Internationalization)
// ===================================================

let currentLang = 'en';
let translations = {};
const listeners = [];

export async function initI18n() {
    // Try to restore saved language preference
    const saved = localStorage.getItem('dio-lang');
    if (saved) {
        currentLang = saved;
    } else {
        // Automatically detect language based on browser preference
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('pt')) {
            currentLang = 'pt';
        } else {
            currentLang = 'en';
        }
    }

    await loadTranslations(currentLang);
    updateDOM();
}

export function onLanguageChange(fn) {
    listeners.push(fn);
}

export function getCurrentLang() {
    return currentLang;
}

export async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('dio-lang', lang);
    document.documentElement.lang = lang;
    await loadTranslations(lang);
    updateDOM();
    // Notify listeners (e.g., re-render pages)
    listeners.forEach(fn => fn(lang));
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`data/${lang}.json`);
        translations = await response.json();
    } catch (error) {
        console.error(`Error loading translations for ${lang}:`, error);
    }
}

/**
 * Get a translation value by dot-separated key.
 * Example: t('hero.title')
 */
export function t(key) {
    if (!key) return '';
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
        if (!value || value[k] === undefined) return key;
        value = value[k];
    }
    return value;
}

/**
 * Update all DOM elements with data-i18n attribute.
 */
export function updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        if (translated !== key) {
            el.textContent = translated;
        }
    });

    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}
