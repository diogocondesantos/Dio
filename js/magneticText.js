// ===================================================
// DIO PORTFOLIO – Magnetic Text Effect (GSAP + SplitText)
// Letters are subtly attracted toward the cursor when nearby.
// ===================================================

let _cleanup = null; // holds the teardown function for the current instance

/**
 * Initialise the magnetic-letter effect on .home-copy h1.
 * Call once after postRenderHome() has populated the headline.
 * Safe to call multiple times — previous listeners are removed first.
 */
export function initMagneticText() {
    // Tear down any previous instance (route changes, language swaps)
    destroyMagneticText();

    const h1 = document.querySelector('.home-copy h1');
    if (!h1 || typeof gsap === 'undefined') return;

    // --- Split headline into individual characters (manual) ----------
    // Walk each child node of the h1 (spans, strongs, text nodes)
    // and wrap every character in a <span class="mag-char">.
    const originalNodes = Array.from(h1.childNodes);
    h1.innerHTML = ''; // clear

    originalNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Plain text node — wrap each char
            Array.from(node.textContent).forEach(ch => {
                const span = document.createElement('span');
                span.className = 'mag-char';
                span.textContent = ch === ' ' ? '\u00A0' : ch; // preserve spaces
                h1.appendChild(span);
            });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Element (span/strong/br)
            const tag = node.tagName.toLowerCase();
            if (tag === 'br') {
                h1.appendChild(document.createElement('br'));
                return;
            }
            const style = node.getAttribute('style') || '';
            Array.from(node.textContent).forEach(ch => {
                const wrapper = document.createElement(tag);
                if (style) wrapper.setAttribute('style', style);
                const inner = document.createElement('span');
                inner.className = 'mag-char';
                inner.textContent = ch === ' ' ? '\u00A0' : ch;
                wrapper.appendChild(inner);
                h1.appendChild(wrapper);
            });
        }
    });

    const chars = Array.from(h1.querySelectorAll('.mag-char'));
    if (chars.length === 0) return;

    // --- Tuning knobs ---------------------------------------------------
    const RADIUS   = 380;   // px – influence zone around the cursor
    const STRENGTH = 0.40;  // 0-1  – max fraction of the distance the letter travels
    const EASE_BACK = 0.85; // seconds – how fast letters ease back to rest

    // --- Cache letter positions (recompute on resize) -------------------
    let charData = []; // { el, cx, cy }

    function cachePositions() {
        charData = chars.map(el => {
            const r = el.getBoundingClientRect();
            return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        });
    }
    cachePositions();

    // --- Mouse handler --------------------------------------------------
    let mouseX = -9999;
    let mouseY = -9999;
    let rafId = null;

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function tick() {
        for (let i = 0; i < charData.length; i++) {
            const { el, cx, cy } = charData[i];
            const dx = mouseX - cx;
            const dy = mouseY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < RADIUS) {
                // Normalised influence: 1 at cursor, 0 at RADIUS edge
                const influence = 1 - dist / RADIUS;
                // Smooth cubic falloff for subtlety
                const factor = influence * influence * STRENGTH;
                gsap.to(el, {
                    x: dx * factor,
                    y: dy * factor,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            } else {
                // Spring back to rest
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

    // --- Attach listeners -----------------------------------------------
    const container = document.querySelector('.home-copy');
    if (!container) return;

    function onTouchMove(e) {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }

    function onTouchStart(e) {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }

    function onTouchEnd() {
        mouseX = -9999;
        mouseY = -9999;
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    window.addEventListener('resize', cachePositions);

    // Start the animation loop
    rafId = requestAnimationFrame(tick);

    // --- Cleanup closure ------------------------------------------------
    _cleanup = () => {
        cancelAnimationFrame(rafId);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('resize', cachePositions);

        // Reset all chars to their original position
        chars.forEach(c => gsap.set(c, { x: 0, y: 0 }));

        _cleanup = null;
    };
}

/**
 * Tear down the magnetic effect (safe to call even if never initialised).
 */
export function destroyMagneticText() {
    if (_cleanup) _cleanup();
}
