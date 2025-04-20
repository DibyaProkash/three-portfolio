window.threeModule = window.threeModule || {};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.z = -200;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
const canvasContainer = document.getElementById('canvas-container');

// WebGL fallback
if (!THREE.WEBGL.isWebGLAvailable()) {
    canvasContainer.innerHTML = '<img src="assets/images/fallback-bg.jpg" alt="Static background" style="width:100%;height:100%;object-fit:cover;">';
} else {
    canvasContainer.appendChild(renderer.domElement);
}

// Universe background
const textureLoader = new THREE.TextureLoader();
const universeTexture = textureLoader.load('assets/images/planets/eso0932a.jpg');
const universeGeometry = new THREE.SphereGeometry(1000, 64, 64);
const universeMaterial = new THREE.MeshBasicMaterial({
    map: universeTexture,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.8
});
const universeSphere = new THREE.Mesh(universeGeometry, universeMaterial);
scene.add(universeSphere);

// Ambient stars with instanced rendering
const starCount = 200;
const starGeometry = new THREE.SphereGeometry(0.5, 8, 8);
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
const starMesh = new THREE.InstancedMesh(starGeometry, starMaterial, starCount);
const matrix = new THREE.Matrix4();
const starOpacities = new Float32Array(starCount);
for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 1000 - 500;
    matrix.setPosition(x, y, z);
    starMesh.setMatrixAt(i, matrix);
    starOpacities[i] = Math.random() * 0.5 + 0.5;
}
scene.add(starMesh);

// Planets
const planet1 = new THREE.Mesh(
    new THREE.SphereGeometry(100, 16, 16),
    new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/images/planets/plutomap1k.jpg'), shininess: 25 })
);
planet1.position.set(300, 200, -800);
scene.add(planet1);

const planet2 = new THREE.Mesh(
    new THREE.SphereGeometry(50, 16, 16),
    new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/images/planets/mars1k.jpg'), shininess: 25 })
);
planet2.position.set(-400, 300, -600);
scene.add(planet2);

const planet3 = new THREE.Mesh(
    new THREE.SphereGeometry(80, 16, 16),
    new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/images/planets/neptunemap.jpg'), shininess: 25 })
);
planet3.position.set(500, -200, -700);
scene.add(planet3);

// Earth
const earthRadius = 300;
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 16, 16),
    new THREE.MeshPhongMaterial({
        map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
        specularMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
        normalMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
        shininess: 25
    })
);
earth.position.set(0, 0, -900);
scene.add(earth);

// Astronaut
let astronaut;
let mixer;
const loader = new THREE.GLTFLoader();
loader.load(
    'assets/models/falling-spaceman.glb',
    (gltf) => {
        astronaut = gltf.scene;
        astronaut.scale.set(100, 100, 100);
        astronaut.position.set(-200, -100, -500);
        astronaut.rotation.x = Math.PI / 4;
        astronaut.rotation.y = Math.PI / 2;
        scene.add(astronaut);
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(astronaut);
            const animationAction = mixer.clipAction(gltf.animations[0]);
            animationAction.play();
        }
    },
    undefined,
    (error) => {
        console.warn('Error loading astronaut model:', error);
        const fallbackGeometry = new THREE.BoxGeometry(50, 50, 50);
        const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        astronaut = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        astronaut.position.set(-200, -100, -500);
        scene.add(astronaut);
    }
);

// Floating shards
const shardCount = 10;
const shards = [];
for (let i = 0; i < shardCount; i++) {
    const shardGeometry = new THREE.BoxGeometry(5, 5, 5);
    const shardMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 });
    const shard = new THREE.Mesh(shardGeometry, shardMaterial);
    shard.position.set(
        -200 + (Math.random() - 0.5) * 50,
        -100 + (Math.random() - 0.5) * 50,
        -500 + (Math.random() - 0.5) * 50
    );
    shard.userData = {
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2
    };
    scene.add(shard);
    shards.push(shard);
}

const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 2000);
pointLight.position.set(500, 500, 500);
scene.add(pointLight);

// Nebula effect for dark background (after About Me section)
const nebulaGeometry = new THREE.PlaneGeometry(2000, 2000);
const nebulaShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Simple 2D noise function
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float smoothNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(noise(i + vec2(0.0, 0.0)), noise(i + vec2(1.0, 0.0)), u.x),
                       mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), u.x), u.y);
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            for (int i = 0; i < 6; ++i) {
                v += a * smoothNoise(p);
                p = p * 2.0 + shift;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = vUv * uResolution / min(uResolution.x, uResolution.y);
            uv = uv * 2.0 - 1.0;

            // Adjust UV based on mouse position
            vec2 mouse = uMouse * 2.0 - 1.0;
            uv += mouse * 0.2;

            // Animate noise over time
            float n = fbm(uv + uTime * 0.05);

            // Create color gradient for nebula effect
            vec3 color = vec3(0.0);
            color += vec3(0.2, 0.4, 0.8) * smoothNoise(uv + vec2(uTime * 0.05, 0.0)); // Brighter blue
            color += vec3(0.5, 0.2, 0.6) * smoothNoise(uv + vec2(0.0, uTime * 0.03)); // Brighter purple
            color += vec3(0.2, 0.6, 0.5) * smoothNoise(uv + vec2(uTime * 0.02, uTime * 0.04)); // Brighter green

            // Use noise to blend colors and add variation
            color *= n * 2.0;
            color += 0.1;
            color = clamp(color, 0.0, 1.0);

            // Apply transparency
            float alpha = n * 0.5;
            alpha = clamp(alpha, 0.2, 0.5);
            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false, // Prevent depth issues
    depthTest: true
});
const nebula = new THREE.Mesh(nebulaGeometry, nebulaShaderMaterial);
nebula.position.z = -200; // Position behind content
scene.add(nebula);

// Initially hide nebula
nebula.visible = false;

// Sparse white particles to overlay on nebula
const particleCount = 100;
const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false });
const particles = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
const particleVelocities = [];
for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = -200 + (Math.random() - 0.5) * 100; // Closer to nebula
    matrix.setPosition(x, y, z);
    particles.setMatrixAt(i, matrix);
    particleVelocities.push({
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.2
    });
}
scene.add(particles);

// Initially hide particles
particles.visible = false;

// Star-like particles with connecting lines for nebula background
const starParticleCount = 500;
const starParticleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
const starParticleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false });
const starParticles = new THREE.InstancedMesh(starParticleGeometry, starParticleMaterial, starParticleCount);
const starParticlePositions = [];
const starParticleBaseVelocities = [];
for (let i = 0; i < starParticleCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = -250 + (Math.random() - 0.5) * 50; // Closer to camera
    matrix.setPosition(x, y, z);
    starParticles.setMatrixAt(i, matrix);
    starParticlePositions.push(new THREE.Vector3(x, y, z));
    starParticleBaseVelocities.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1
    });
}
scene.add(starParticles);

// Initially hide star particles
starParticles.visible = false;

// Connecting lines for star particles
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, depthWrite: false });
const lineSegments = [];
function updateStarParticleLines() {
    console.log('Updating star particle lines, starParticles visible:', starParticles.visible);
    // Remove existing lines
    lineSegments.forEach(segment => scene.remove(segment));
    lineSegments.length = 0;

    // Create new lines between nearby particles
    const maxDistance = 100;
    for (let i = 0; i < starParticleCount; i++) {
        for (let j = i + 1; j < starParticleCount; j++) {
            const pos1 = starParticlePositions[i];
            const pos2 = starParticlePositions[j];
            const distance = pos1.distanceTo(pos2);
            if (distance < maxDistance) {
                const geometry = new THREE.BufferGeometry().setFromPoints([pos1, pos2]);
                const line = new THREE.Line(geometry, lineMaterial);
                line.position.z = -250; // Match star particles
                scene.add(line);
                lineSegments.push(line);
            }
        }
    }
}

// Initially update lines (though hidden until nebula is visible)
updateStarParticleLines();

let time = 0;
const clock = new THREE.Clock();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let animationFrameId;
let showMainScene = true; // Flag to toggle between main scene and nebula
let nebulaTime = 0; // Separate time for nebula to reset on transition
let lastPastAbout = false; // Track previous state to detect transitions

// Mouse position for nebula and star particle interaction
const mouse = new THREE.Vector2();
const mouseWorld = new THREE.Vector3();
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    nebulaShaderMaterial.uniforms.uMouse.value.set(mouse.x / 2 + 0.5, -mouse.y / 2 + 0.5);

    // Convert mouse position to world coordinates at z = -250
    mouseWorld.set(mouse.x, mouse.y, 0.5);
    mouseWorld.unproject(camera);
    const dir = mouseWorld.sub(camera.position).normalize();
    const distance = (camera.position.z - (-250)) / dir.z;
    mouseWorld.copy(camera.position).add(dir.multiplyScalar(-distance));
});

function animate() {
    animationFrameId = requestAnimationFrame(animate); // Continuous loop
    console.log('Animate running, frame:', animationFrameId); // Debug log to confirm animation loop

    // Skip updates if tab is hidden or prefers reduced motion
    if (prefersReducedMotion || document.visibilityState === 'hidden') {
        return;
    }

    // Update times for animations
    time += 0.02;
    if (!showMainScene) {
        nebulaTime += 0.02;
    }
    if (mixer) mixer.update(clock.getDelta());

    if (showMainScene) {
        // Ensure main scene elements are visible
        universeSphere.visible = true;
        starMesh.visible = true;
        planet1.visible = true;
        planet2.visible = true;
        planet3.visible = true;
        earth.visible = true;
        if (astronaut) astronaut.visible = true;
        shards.forEach(shard => shard.visible = true);
        ambientLight.visible = true;
        pointLight.visible = true;

        // Hide nebula, particles, and star particles
        nebula.visible = false;
        particles.visible = false;
        starParticles.visible = false;
        lineSegments.forEach(segment => scene.remove(segment));
        lineSegments.length = 0;

        // Animate main scene elements
        universeSphere.rotation.y += 0.001;

        for (let i = 0; i < starCount; i++) {
            starMesh.getMatrixAt(i, matrix);
            let pos = new THREE.Vector3();
            matrix.decompose(pos, new THREE.Quaternion(), new THREE.Vector3());
            pos.z += Math.sin(time + i) * 0.05;
            pos.y += Math.cos(time + i) * 0.03;
            if (pos.z > 500) pos.z = -500;
            if (pos.y > 1000) pos.y = -1000;
            matrix.setPosition(pos);
            starMesh.setMatrixAt(i, matrix);
            starMaterial.opacity = starOpacities[i] * (Math.sin(time * 2.0 + i * 0.1) * 0.5 + 0.5);
        }
        starMesh.instanceMatrix.needsUpdate = true;

        shards.forEach(shard => {
            shard.position.y += Math.sin(time + shard.userData.floatOffset) * shard.userData.floatSpeed;
            shard.rotation.x += 0.01;
            shard.rotation.y += 0.01;
        });

        renderer.render(scene, camera);
    } else {
        // Ensure nebula, particles, and star particles are visible
        nebula.visible = true;
        particles.visible = true;
        starParticles.visible = true;
        console.log('Nebula visible:', nebula.visible, 'Particles visible:', particles.visible, 'Star Particles visible:', starParticles.visible);

        // Hide main scene elements
        universeSphere.visible = false;
        starMesh.visible = false;
        planet1.visible = false;
        planet2.visible = false;
        planet3.visible = false;
        earth.visible = false;
        if (astronaut) astronaut.visible = false;
        shards.forEach(shard => shard.visible = false);
        ambientLight.visible = false;
        pointLight.visible = false;

        // Animate nebula and overlay particles
        nebulaShaderMaterial.uniforms.uTime.value = nebulaTime;

        // Animate particles for depth
        for (let i = 0; i < particleCount; i++) {
            particles.getMatrixAt(i, matrix);
            let pos = new THREE.Vector3();
            matrix.decompose(pos, new THREE.Quaternion(), new THREE.Vector3());
            pos.x += particleVelocities[i].x;
            pos.y += particleVelocities[i].y;
            pos.z += particleVelocities[i].z;

            // Wrap particles around the viewport
            if (pos.x > 1000) pos.x = -1000;
            if (pos.x < -1000) pos.x = 1000;
            if (pos.y > 1000) pos.y = -1000;
            if (pos.y < -1000) pos.y = 1000;
            if (pos.z > -100) pos.z = -300; // Adjusted range
            if (pos.z < -300) pos.z = -100;

            matrix.setPosition(pos);
            particles.setMatrixAt(i, matrix);
        }
        particles.instanceMatrix.needsUpdate = true;

        // Animate star particles with cursor repulsion
        for (let i = 0; i < starParticleCount; i++) {
            starParticles.getMatrixAt(i, matrix);
            let pos = starParticlePositions[i];
            let vel = starParticleBaseVelocities[i];

            // Apply base velocity
            pos.x += vel.x;
            pos.y += vel.y;
            pos.z += vel.z;

            // Apply repulsion from cursor
            const dx = pos.x - mouseWorld.x;
            const dy = pos.y - mouseWorld.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;
            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance * 0.5;
                const angle = Math.atan2(dy, dx);
                pos.x += Math.cos(angle) * force;
                pos.y += Math.sin(angle) * force;
            }

            // Wrap particles around the viewport
            if (pos.x > 1000) pos.x = -1000;
            if (pos.x < -1000) pos.x = 1000;
            if (pos.y > 1000) pos.y = -1000;
            if (pos.y < -1000) pos.y = 1000;
            if (pos.z > -200) pos.z = -300; // Adjusted range
            if (pos.z < -300) pos.z = -200;

            matrix.setPosition(pos);
            starParticles.setMatrixAt(i, matrix);
            starParticlePositions[i] = pos;
        }
        starParticles.instanceMatrix.needsUpdate = true;

        // Update connecting lines
        updateStarParticleLines();

        renderer.render(scene, camera);
    }
}

function updateCamera(targetCameraX) {
    camera.position.x += (targetCameraX - camera.position.x) * 0.05;
}

function updateScene(scrollProgress, easedProgress) {
    // Debugging logs
    console.log('Scroll Progress:', scrollProgress, 'Eased Progress:', easedProgress);
    console.log('Camera Z:', camera.position.z, 'Earth Scale:', earth.scale.x, 'Astronaut Z:', astronaut ? astronaut.position.z : 'N/A');

    // Determine if we're past the About Me section
    const aboutSection = document.querySelector('#about');
    if (!aboutSection) {
        console.error('About section not found in DOM');
        return;
    }
    const aboutRect = aboutSection.getBoundingClientRect();
    const isPastAbout = aboutRect.bottom < window.innerHeight * 0.5;
    console.log('isPastAbout:', isPastAbout, 'aboutRect.bottom:', aboutRect.bottom, 'window.innerHeight * 0.5:', window.innerHeight * 0.5);

    // Detect state transition and log
    if (isPastAbout !== lastPastAbout) {
        if (isPastAbout) {
            console.log('Transitioning to nebula effect');
            showMainScene = false;
            nebulaTime = 0; // Reset nebula time on transition
            camera.position.z = -200; // Fix camera position for nebula view
        } else {
            console.log('Transitioning back to main scene');
            showMainScene = true;
        }
        lastPastAbout = isPastAbout;
    }

    // Update main scene elements if visible
    if (showMainScene) {
        if (astronaut) {
            astronaut.position.y = -100 + Math.sin(time * 0.5) * 10;
            astronaut.position.x = -200 + Math.sin(easedProgress * Math.PI) * 30;
            astronaut.position.z = -500 - easedProgress * 200;
            astronaut.rotation.x += 0.002;
            astronaut.rotation.z += 0.002;
        }

        // Move camera to approach Earth when scrolling down
        camera.position.z = -200 - easedProgress * 700;

        // Scale Earth to appear smaller when scrolling up
        const earthScale = 1 - easedProgress * 0.5;
        earth.scale.set(earthScale, earthScale, earthScale);
        earth.rotation.y += 0.005;

        // Rotate other planets
        planet1.rotation.y += 0.002;
        planet2.rotation.y += 0.003;
        planet3.rotation.y += 0.0015;
    }
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    nebulaShaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

window.threeModule = {
    scene,
    camera,
    renderer,
    animate,
    updateCamera,
    updateScene,
    resize
};