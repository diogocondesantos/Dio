// ===================================================
// DIO PORTFOLIO – Custom Cursor with GSAP Lag/Lerp
// ===================================================

let dot, blurEl;
let xToDot, yToDot;
let xToBlur, yToBlur;
let initialized = false;

function onMouseMove(e) {
    if (!initialized) return;

    // Show cursor elements on first move
    if (dot.style.opacity === '0' || dot.style.opacity === '') {
        gsap.to(dot, { opacity: 1, duration: 0.3 });
        gsap.to(blurEl, { opacity: 0.1, duration: 0.3 });
    }

    // Direct values to the GSAP quickTo setters
    xToDot(e.clientX);
    yToDot(e.clientY);
    xToBlur(e.clientX);
    yToBlur(e.clientY);
}

export function initCustomCursor() {
    if (typeof gsap === 'undefined') {
        console.warn('GSAP is not loaded. Custom cursor will not initialize.');
        return;
    }

    // Avoid duplicate instantiation
    if (document.querySelector('.custom-cursor-dot')) return;

    // Create cursor elements
    dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    dot.style.opacity = '0';

    blurEl = document.createElement('div');
    blurEl.className = 'custom-cursor-blur';
    blurEl.style.opacity = '0';

    document.body.appendChild(dot);
    document.body.appendChild(blurEl);

    // Initial positioning offsets using GSAP
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(blurEl, { xPercent: -50, yPercent: -50 });

    // Set up optimized quick setters
    // Small dot follows almost instantly (duration: 0.08s)
    xToDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    yToDot = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });

    // Large blur circle chases with a ~1200ms duration (duration: 1.2s)
    xToBlur = gsap.quickTo(blurEl, 'x', { duration: 1.2, ease: 'power2.out' });
    yToBlur = gsap.quickTo(blurEl, 'y', { duration: 1.2, ease: 'power2.out' });

    initialized = true;

    // Track mouse movement
    window.addEventListener('mousemove', onMouseMove);

    // Handle mouse leaving and entering window
    document.addEventListener('mouseleave', () => {
        gsap.to([dot, blurEl], { opacity: 0, duration: 0.3 });
    });
    document.addEventListener('mouseenter', () => {
        gsap.to(dot, { opacity: 1, duration: 0.3 });
        gsap.to(blurEl, { opacity: 0.1, duration: 0.3 });
    });
}
