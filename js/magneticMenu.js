// ===================================================
// DIO PORTFOLIO – Magnetic Menu Effect
// Floating menus are subtly attracted toward the cursor.
// ===================================================

let _cleanup = null;
let menuData = [];

export function initMagneticMenu() {
    destroyMagneticMenu();

    const menus = document.querySelectorAll('.floating-menu');
    if (menus.length === 0 || typeof gsap === 'undefined') return;

    // Remove transform from CSS transition to prevent conflicts with GSAP
    menus.forEach(menu => {
        // We override the transition to exclude 'transform'
        menu.style.transition = 'top 0.6s cubic-bezier(0.4, 0, 0.2, 1), left 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Let GSAP manage the -50% centering natively
        gsap.set(menu, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    });

    const RADIUS = 150;   // px – influence zone
    const STRENGTH = 0.3; // 0-1 – max fraction of the distance
    const EASE_BACK = 0.4; // seconds

    function cachePositions() {
        menuData = Array.from(menus).map(el => {
            // Temporarily remove x/y to measure base position
            const currentX = gsap.getProperty(el, "x");
            const currentY = gsap.getProperty(el, "y");
            gsap.set(el, { x: 0, y: 0 });
            
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            
            // Restore
            gsap.set(el, { x: currentX, y: currentY });
            
            return { el, cx, cy };
        });
    }

    // Give the DOM a tiny bit of time to settle, then cache
    setTimeout(cachePositions, 100);

    let mouseX = -9999;
    let mouseY = -9999;
    let rafId = null;

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function tick() {
        for (let i = 0; i < menuData.length; i++) {
            const { el, cx, cy } = menuData[i];
            
            // If the element is hidden (opacity 0) or pointer-events none, don't animate
            const style = window.getComputedStyle(el);
            if (style.opacity === '0' || style.pointerEvents === 'none') {
                continue;
            }

            const dx = mouseX - cx;
            const dy = mouseY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < RADIUS) {
                const influence = 1 - dist / RADIUS;
                const factor = influence * influence * STRENGTH;
                gsap.to(el, {
                    x: dx * factor,
                    y: dy * factor,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            } else {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: EASE_BACK,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', cachePositions);

    rafId = requestAnimationFrame(tick);

    _cleanup = () => {
        cancelAnimationFrame(rafId);
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', cachePositions);
        menus.forEach(menu => {
            gsap.set(menu, { x: 0, y: 0 });
            menu.style.transition = ''; // restore CSS
        });
        _cleanup = null;
    };
}

export function updateMagneticMenuPositions() {
    if (menuData.length > 0) {
        // Temporarily remove x/y to measure base position
        menuData.forEach(item => {
            const currentX = gsap.getProperty(item.el, "x");
            const currentY = gsap.getProperty(item.el, "y");
            gsap.set(item.el, { x: 0, y: 0 });
            
            const r = item.el.getBoundingClientRect();
            item.cx = r.left + r.width / 2;
            item.cy = r.top + r.height / 2;
            
            gsap.set(item.el, { x: currentX, y: currentY });
        });
    }
}

export function destroyMagneticMenu() {
    if (_cleanup) _cleanup();
}
