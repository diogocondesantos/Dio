// ===================================================
// DIO PORTFOLIO – Profile Photo WebGL Displacement & Drag Effect
// ===================================================

const VS_SOURCE = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const FS_SOURCE = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;
    uniform float uHover;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;

    void main() {
        // 1. Cover aspect-ratio calculations (similar to object-fit: cover)
        vec2 ratio = vec2(
            min((uResolution.x / uResolution.y) / (uImageResolution.x / uImageResolution.y), 1.0),
            min((uResolution.y / uResolution.x) / (uImageResolution.y / uImageResolution.x), 1.0)
        );
        vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
        );

        // 2. Localized drag and warp based on mouse proximity & velocity
        vec2 toMouse = uv - uMouse;
        
        // Correct distance check using aspect ratio so the mouse radius remains a perfect circle
        vec2 aspectToMouse = toMouse;
        aspectToMouse.x *= (uResolution.x / uResolution.y);
        float dist = length(aspectToMouse);
        
        // Highly concentrated influence (smaller radius = 0.22 with cubic falloff for ultra-sharp focus)
        float radius = 0.22;
        float rawInfluence = smoothstep(radius, 0.0, dist);
        float influence = pow(rawInfluence, 3.0) * uHover;
        
        // Controlled velocity amplification for a sleek, refined physical pull (7.5 instead of 12.0)
        vec2 amplifiedVelocity = uVelocity * 7.5;
        
        // Elegant drag displacement along the amplified velocity vector (1.1 instead of 1.5)
        vec2 displacement = amplifiedVelocity * influence * 1.1;
        
        // Subtle liquid ripple waves propagating outwards from the mouse cursor,
        // with an elegant time multiplier (3.0) and reduced amplitude (0.045 instead of 0.08) for maximum sophistication
        float speed = length(amplifiedVelocity);
        float ripple = sin(dist * 55.0 - uTime * 3.0) * 0.045 * influence * (0.05 + speed);
        
        // Apply radial ripple displacement plus drag displacement
        vec2 liquidDisplacement = displacement + (toMouse / (dist + 0.001)) * ripple;

        // 3. Chromatic Aberration: shift each color channel with clean, high-end offsets
        vec2 uvR = uv - liquidDisplacement * 1.5;
        vec2 uvG = uv - liquidDisplacement;
        vec2 uvB = uv - liquidDisplacement * 0.5;
        
        // Clamp UVs to prevent edge pixel wrapping/tiling glitches
        uvR = clamp(uvR, 0.001, 0.999);
        uvG = clamp(uvG, 0.001, 0.999);
        uvB = clamp(uvB, 0.001, 0.999);
        
        float r = texture2D(uTexture, uvR).r;
        float g = texture2D(uTexture, uvG).g;
        float b = texture2D(uTexture, uvB).b;
        
        gl_FragColor = vec4(r, g, b, 1.0);
    }
`;

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compiler error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function initProfileDisplacement() {
    const container = document.querySelector('.about-photo');
    if (!container) return;

    const img = container.querySelector('img');
    if (!img) return;

    if (img.complete) {
        setupWebGL(container, img);
    } else {
        img.addEventListener('load', () => setupWebGL(container, img), { once: true });
    }
}

function setupWebGL(container, img) {
    // Avoid duplicate canvases if already instantiated
    if (container.querySelector('canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'about-photo-canvas';
    container.appendChild(canvas);

    // Try to get WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL is not supported in this browser. Falling back to static profile image.');
        canvas.remove();
        return;
    }

    // Hide original image safely to fallback if canvas initialization fails
    img.style.display = 'none';

    // Compile Shaders & Link Program
    const vs = compileShader(gl, VS_SOURCE, gl.VERTEX_SHADER);
    const fs = compileShader(gl, FS_SOURCE, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('WebGL Program Linking Error:', gl.getProgramInfoLog(program));
        img.style.display = 'block';
        canvas.remove();
        return;
    }

    // Set up full plane geometry (quad covering clip space)
    const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Create & Upload Texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload the loaded DOM Image to WebGL Texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    // Get Uniform Locations
    const uniforms = {
        uTexture: gl.getUniformLocation(program, 'uTexture'),
        uMouse: gl.getUniformLocation(program, 'uMouse'),
        uVelocity: gl.getUniformLocation(program, 'uVelocity'),
        uHover: gl.getUniformLocation(program, 'uHover'),
        uTime: gl.getUniformLocation(program, 'uTime'),
        uResolution: gl.getUniformLocation(program, 'uResolution'),
        uImageResolution: gl.getUniformLocation(program, 'uImageResolution')
    };

    // Keep track of interaction states
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let lastMouseX = 0.5;
    let lastMouseY = 0.5;

    let velocityX = 0;
    let velocityY = 0;

    let hoverVal = 0.0;
    let targetHoverVal = 0.0;

    // Normalize coordinates relative to canvas bounding client rect
    function updateMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left) / rect.width;
        targetMouseY = 1.0 - ((e.clientY - rect.top) / rect.height); // Invert Y to match UV coordinate space
    }

    function updateTouchPosition(e) {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            targetMouseX = (e.touches[0].clientX - rect.left) / rect.width;
            targetMouseY = 1.0 - ((e.touches[0].clientY - rect.top) / rect.height);
        }
    }

    // Set up event listeners
    canvas.addEventListener('mousemove', updateMousePosition);
    canvas.addEventListener('mouseenter', (e) => {
        targetHoverVal = 1.0;
        updateMousePosition(e);
        // Instant snap for mouse coordinates on enter to avoid long warp trails from previous positions
        mouseX = targetMouseX;
        mouseY = targetMouseY;
        lastMouseX = targetMouseX;
        lastMouseY = targetMouseY;
    });
    canvas.addEventListener('mouseleave', () => {
        targetHoverVal = 0.0;
    });

    canvas.addEventListener('touchstart', (e) => {
        targetHoverVal = 1.0;
        updateTouchPosition(e);
        mouseX = targetMouseX;
        mouseY = targetMouseY;
        lastMouseX = targetMouseX;
        lastMouseY = targetMouseY;
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
        updateTouchPosition(e);
    }, { passive: true });
    canvas.addEventListener('touchend', () => {
        targetHoverVal = 0.0;
    }, { passive: true });

    // Handle responsive resizing
    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    
    resize();
    window.addEventListener('resize', resize);

    // Animation Render Loop
    let startTimestamp = null;

    function tick(timestamp) {
        // Automatic cleanup loop trigger: if canvas is removed from DOM (user switched pages), delete resources
        if (!canvas.isConnected) {
            window.removeEventListener('resize', resize);
            gl.deleteTexture(texture);
            gl.deleteBuffer(vertexBuffer);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return;
        }

        if (!startTimestamp) startTimestamp = timestamp;
        const elapsedSecs = (timestamp - startTimestamp) * 0.001;

        // Linear interpolation (lerp) for smooth easing/inertia
        const lerpSpeed = 0.08;
        mouseX += (targetMouseX - mouseX) * lerpSpeed;
        mouseY += (targetMouseY - mouseY) * lerpSpeed;

        // Velocity is current position delta
        const rawVelX = targetMouseX - lastMouseX;
        const rawVelY = targetMouseY - lastMouseY;

        // Decoupled velocity building and decay loop:
        // When actively moving, velocity builds up immediately (speed 0.15).
        // When stationary or left, velocity decays extremely slowly (speed 0.008 instead of 0.015)
        // to create an ultra-long lingering drag trail that takes 6 to 8 seconds to dissolve.
        const isMouseMoving = Math.abs(rawVelX) > 0.0001 || Math.abs(rawVelY) > 0.0001;
        const velocityDecaySpeed = isMouseMoving ? 0.15 : 0.008;

        velocityX += (rawVelX - velocityX) * velocityDecaySpeed;
        velocityY += (rawVelY - velocityY) * velocityDecaySpeed;

        lastMouseX = targetMouseX;
        lastMouseY = targetMouseY;

        // Dual-speed decay loop:
        // When hovered, effect activates smoothly at speed 0.08.
        // When unhovered, effect decays and returns to normal shape extremely slowly (speed 0.008)
        // to match the lingering viscous velocity decay.
        const hoverInterpolationSpeed = targetHoverVal === 0.0 ? 0.008 : 0.08;
        hoverVal += (targetHoverVal - hoverVal) * hoverInterpolationSpeed;

        // Clear WebGL buffer
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Bind Shader Program
        gl.useProgram(program);

        // Bind image texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uniforms.uTexture, 0);

        // Send uniform values to the shaders
        gl.uniform2f(uniforms.uMouse, mouseX, mouseY);
        gl.uniform2f(uniforms.uVelocity, velocityX, velocityY);
        gl.uniform1f(uniforms.uHover, hoverVal);
        gl.uniform1f(uniforms.uTime, elapsedSecs);
        gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
        gl.uniform2f(uniforms.uImageResolution, img.naturalWidth || 800, img.naturalHeight || 800);

        // Draw quad
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Request next frame
        requestAnimationFrame(tick);
    }

    // Begin the animation frame loop
    requestAnimationFrame(tick);
}
