// Define time in the global scope
let time = 0;

// Scene setup for main background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 0;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('canvas-container').appendChild(renderer.domElement);

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

// Ambient stars with twinkling effect
const starCount = 500;
const stars = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starOpacities = new Float32Array(starCount);
for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 2000;
    starPositions[i + 1] = (Math.random() - 0.5) * 2000;
    starPositions[i + 2] = (Math.random() - 0.5) * 1000 - 500;
    starOpacities[i / 3] = Math.random() * 0.5 + 0.5;
}
stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
stars.setAttribute('opacity', new THREE.BufferAttribute(starOpacities, 1));
const starMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 3.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform float time;
        varying float vOpacity;
        void main() {
            float twinkle = sin(time * 2.0 + vOpacity * 10.0) * 0.5 + 0.5;
            gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity * twinkle);
        }
    `,
    transparent: true
});
const starSystem = new THREE.Points(stars, starMaterial);
scene.add(starSystem);

// Planets
const planet1 = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/images/planets/plutomap1k.jpg'), shininess: 25 })
);
planet1.position.set(300, 200, -800);
scene.add(planet1);

const planet2 = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32),
    new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/images/planets/mars1k.jpg'), shininess: 25 })
);
planet2.position.set(-400, 300, -600);
scene.add(planet2);

const planet3 = new THREE.Mesh(
    new THREE.SphereGeometry(80, 32, 32),
    new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/images/planets/neptunemap.jpg'), shininess: 25 })
);
planet3.position.set(500, -200, -700);
scene.add(planet3);

// Earth
const earthRadius = 300;
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 32, 32),
    new THREE.MeshPhongMaterial({
        map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
        specularMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
        normalMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
        shininess: 25
    })
);
earth.position.z = -900;
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
        console.error('Error loading astronaut model:', error);
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
    const shardGeometry = new THREE.BoxGeometry(5, 5, 5); // Corrected typo here
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

// Globe for Education section
const globeScene = new THREE.Scene();
const globeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const globeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
globeRenderer.setSize(300, 300);
globeRenderer.setClearColor(0x000000, 0);
document.getElementById('globe-container').appendChild(globeRenderer.domElement);

const globe = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshPhongMaterial({
        map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
        specularMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
        normalMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
        shininess: 25
    })
);
globeScene.add(globe);

const globeAmbientLight = new THREE.AmbientLight(0x404040, 1);
globeScene.add(globeAmbientLight);
const globePointLight = new THREE.PointLight(0xffffff, 1, 1000);
globePointLight.position.set(200, 200, 200);
globeScene.add(globePointLight);

// Markers for Bangladesh and Canada
const markerGeometry = new THREE.SphereGeometry(5, 16, 16);
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const bdMarker = new THREE.Mesh(markerGeometry, markerMaterial);
const bdLat = 23.6850 * (Math.PI / 180);
const bdLon = 90.3563 * (Math.PI / 180);
bdMarker.position.set(
    100 * Math.cos(bdLat) * Math.cos(bdLon),
    100 * Math.sin(bdLat),
    100 * Math.cos(bdLat) * Math.sin(bdLon)
);
globe.add(bdMarker);

const caMarker = new THREE.Mesh(markerGeometry, markerMaterial);
const caLat = 53.7609 * (Math.PI / 180);
const caLon = -98.8139 * (Math.PI / 180);
caMarker.position.set(
    100 * Math.cos(caLat) * Math.cos(caLon),
    100 * Math.sin(caLat),
    100 * Math.cos(caLat) * Math.sin(caLon)
);
globe.add(caMarker);

// Airplane
const airplaneGeometry = new THREE.BoxGeometry(10, 2, 5);
const airplaneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const airplane = new THREE.Mesh(airplaneGeometry, airplaneMaterial);
globe.add(airplane);

globeCamera.position.z = 200;

// Starfield for Testimonials section
const testimonialsScene = new THREE.Scene();
const testimonialsCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
testimonialsCamera.position.z = 100;

const starLayers = [];
const layerCount = 3;
for (let layer = 0; layer < layerCount; layer++) {
    const starCountLayer = 200 * (layer + 1);
    const starGeometry = new THREE.BufferGeometry();
    const starPositionsLayer = new Float32Array(starCountLayer * 3);
    const starSizes = new Float32Array(starCountLayer);
    const starOpacitiesLayer = new Float32Array(starCountLayer);

    for (let i = 0; i < starCountLayer * 3; i += 3) {
        starPositionsLayer[i] = (Math.random() - 0.5) * 2000;
        starPositionsLayer[i + 1] = (Math.random() - 0.5) * 2000;
        starPositionsLayer[i + 2] = (Math.random() - 0.5) * 500 - (layer * 100);
        starSizes[i / 3] = Math.random() * 2 + 1;
        starOpacitiesLayer[i / 3] = Math.random() * 0.5 + 0.5;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositionsLayer, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('opacity', new THREE.BufferAttribute(starOpacitiesLayer, 1));

    const starMaterialLayer = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
            attribute float size;
            attribute float opacity;
            varying float vOpacity;
            void main() {
                vOpacity = opacity;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vOpacity;
            void main() {
                gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);
            }
        `,
        transparent: true
    });

    const starSystemLayer = new THREE.Points(starGeometry, starMaterialLayer);
    starSystemLayer.userData = { speed: 0.1 * (layer + 1) };
    starLayers.push(starSystemLayer);
    testimonialsScene.add(starSystemLayer);
}

// Mouse interaction for camera
const mouse = new THREE.Vector2();
let targetCameraX = 0;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    targetCameraX = mouse.x * 200;
});

// Slider variables
let sliderContainer;
let currentSlide = 0;
let isPlaying = true;
let slideInterval;
let previousSlide = 0;
let visibleProjects;
let activeExpandedCard = null;
let popup = null;

// Project data
const projects = [
    {
        name: "Game Boy Pokédex",
        description: "A retro-inspired Pokédex web app styled like a classic Game Boy, built with HTML, CSS, and JavaScript.",
        date: "Apr 2025",
        categories: ["JavaScript", "HTML/CSS", "API"],
        stars: 0,
        githubUrl: "https://github.com/DibyaProkash/pokedex",
        liveDemoUrl: "https://dibyaprokash.github.io/pokedex/",
        imageUrl: "assets/images/projects/pokedex1.png"
    },
    {
        name: "Real-time Weather Mobile App",
        description: "A real-time weather mobile app using Kotlin and OpenWeatherMap API.",
        date: "Mar 2025",
        categories: ["Kotlin", "API"],
        stars: 0,
        githubUrl: "https://github.com/DibyaProkash/weather-mobile-app",
        liveDemoUrl: "",
        imageUrl: "assets/images/projects/weather-app.png"
    },
    {
        name: "2D Chess Game",
        description: "A single-player 2D chess game with AI opponent, built with JavaScript and HTML5 Canvas.",
        date: "Mar 2025",
        categories: ["JavaScript", "HTML/CSS"],
        stars: 0,
        githubUrl: "https://github.com/DibyaProkash/2D-Chess-Game-JS",
        liveDemoUrl: "https://dibyaprokash.github.io/2D-Chess-Game-JS/",
        imageUrl: "assets/images/projects/2d-chess.png"
    },
    {
        name: "Real-time News App",
        description: "A real-time mobile news application using Kotlin and NewsAPI, with a focus on responsive design.",
        date: "Mar 2025",
        categories: ["Kotlin", "API"],
        stars: 0,
        githubUrl: "https://github.com/DibyaProkash/TheNewsApp",
        liveDemoUrl: "",
        imageUrl: "assets/images/projects/project1.png"
    },
    {
        name: "Space Invader App",
        description: "A retro-style Space Invader game built with JavaScript and HTML5 Canvas.",
        date: "Mar 2025",
        categories: ["JavaScript", "HTML/CSS"],
        stars: 0,
        githubUrl: "https://github.com/DibyaProkash/Space-Invader-App-Demo-JS",
        liveDemoUrl: "https://dibyaprokash.github.io/Space-Invader-App-Demo-JS/",
        imageUrl: "assets/images/projects/space-invader.png"
    }
];

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');
        themeToggle.innerHTML = isLightMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-pressed', isLightMode);
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.setAttribute('aria-pressed', 'true');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-pressed', 'false');
    }

    // Side navigation
    const bullets = document.querySelectorAll('.nav-bullet');
    bullets.forEach(bullet => {
        bullet.addEventListener('click', () => {
            const targetId = bullet.getAttribute('data-section');
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
            bullets.forEach(b => b.removeAttribute('aria-current'));
            bullet.setAttribute('aria-current', 'page');
        });
    });

    // Animated role text
    const roles = ['full stack', 'researcher', 'developer', 'designer', 'innovator'];
    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const animatedRoleElement = document.getElementById('animated-role');
    const typingSpeed = 150;
    const deletingSpeed = 75;
    const pauseDuration = 1500;

    function typeRole() {
        const currentRole = roles[currentRoleIndex];
        if (isDeleting) {
            animatedRoleElement.textContent = `[${currentRole.substring(0, currentCharIndex)}]`;
            currentCharIndex--;
            if (currentCharIndex < 0) {
                isDeleting = false;
                currentRoleIndex = (currentRoleIndex + 1) % roles.length;
                setTimeout(typeRole, 500);
            } else {
                setTimeout(typeRole, deletingSpeed);
            }
        } else {
            animatedRoleElement.textContent = `[${currentRole.substring(0, currentCharIndex)}]`;
            currentCharIndex++;
            if (currentCharIndex > currentRole.length) {
                isDeleting = true;
                setTimeout(typeRole, pauseDuration);
            } else {
                setTimeout(typeRole, typingSpeed);
            }
        }
    }
    typeRole();

    // Tilt effect
    const tiltableElements = document.querySelectorAll('.tiltable');
    tiltableElements.forEach(element => {
        element.addEventListener('mousemove', (event) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = event.clientX - centerX;
            const mouseY = event.clientY - centerY;
            const tiltX = (mouseY / rect.height) * 10;
            const tiltY = -(mouseX / rect.width) * 10;
            element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });

    // Generate resume
    const generateResumeButton = document.getElementById('generate-resume');
    generateResumeButton.addEventListener('click', () => {
        const resumeContent = `
            <h1>Dibya Prokash Sarkar</h1>
            <p>Email: dibyaprokash@gmail.com | Location: Dhaka, Bangladesh</p>
            <h2>Skills</h2>
            <ul>${Array.from(document.querySelectorAll('.skill-circle')).map(circle => `<li>${circle.dataset.skill} (${circle.dataset.level}%)</li>`).join('')}</ul>
            <h2>Experience</h2>
            ${document.querySelector('.experience-list').innerHTML}
            <h2>Education</h2>
            ${document.querySelector('.timeline').innerHTML}
        `;
        const element = document.createElement('div');
        element.innerHTML = resumeContent;
        document.body.appendChild(element);
        html2pdf().from(element).save('Dibya_Prokash_Sarkar_Resume.pdf').then(() => {
            document.body.removeChild(element);
        });
    });

    // Portfolio section
    const projectSlider = document.getElementById('project-grid');
    projectSlider.classList.add('project-slider');

    sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    projectSlider.appendChild(sliderContainer);

    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    document.body.appendChild(popupOverlay);

    const sliderControls = document.createElement('div');
    sliderControls.className = 'slider-controls';
    sliderControls.innerHTML = `
        <button class="slider-button prev" aria-label="Previous project">Prev</button>
        <button class="play-pause-button" aria-label="Pause or play slideshow">Pause</button>
        <button class="slider-button next" aria-label="Next project">Next</button>
    `;
    projectSlider.appendChild(sliderControls);

    const sliderDots = document.createElement('div');
    sliderDots.className = 'slider-dots';
    projectSlider.appendChild(sliderDots);

    visibleProjects = [...projects];

    const categoryFilter = document.getElementById('category-filter');
    const allCategories = new Set();
    projects.forEach(project => project.categories.forEach(category => allCategories.add(category)));

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All';
    categoryFilter.appendChild(allOption);

    Array.from(allCategories).sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Skills animation
    document.querySelectorAll('.skill-circle').forEach(circle => {
        const level = circle.dataset.level;
        circle.style.setProperty('--level', level);
    });

    function closePopup() {
        if (popup) {
            popup.classList.remove('active');
            popupOverlay.classList.remove('active');
            document.body.removeChild(popup);
            popup = null;
            activeExpandedCard = null;
            if (isPlaying) startAutoplay();
        }
    }

    // Experience expandable animation with Framer Motion
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach(item => {
        const skills = item.getAttribute('data-skills').split(', ');
        const projectList = item.querySelector('.project-list');
        const projectsForSkills = projects.filter(project =>
            project.categories.some(category => skills.includes(category))
        );

        projectsForSkills.forEach(project => {
            const li = document.createElement('li');
            li.textContent = project.name;
            projectList.appendChild(li);
        });

        const projectsContainer = item.querySelector('.experience-projects');
        let isExpanded = false;

        item.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                projectsContainer.style.display = 'block';
                motion.animate(projectsContainer, {
                    height: 'auto',
                    opacity: 1
                }, {
                    duration: 0.5,
                    ease: "easeInOut"
                });
            } else {
                motion.animate(projectsContainer, {
                    height: 0,
                    opacity: 0
                }, {
                    duration: 0.5,
                    ease: "easeInOut",
                    onComplete: () => {
                        projectsContainer.style.display = 'none';
                    }
                });
            }
        });
    });

    function renderProjects(projectsToRender) {
        sliderContainer.innerHTML = '';
        sliderDots.innerHTML = '';

        if (projectsToRender.length === 0) {
            const noProjectsMessage = document.createElement('div');
            noProjectsMessage.className = 'no-projects-message';
            noProjectsMessage.style.color = '#ffffff';
            noProjectsMessage.style.fontSize = '1.5em';
            noProjectsMessage.style.textAlign = 'center';
            noProjectsMessage.style.height = '500px';
            noProjectsMessage.style.display = 'flex';
            noProjectsMessage.style.alignItems = 'center';
            noProjectsMessage.style.justifyContent = 'center';
            noProjectsMessage.textContent = 'No projects found in this category.';
            sliderContainer.appendChild(noProjectsMessage);
            return;
        }

        projectsToRender.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.index = index;
            card.setAttribute('aria-label', `Project: ${project.name}`);
            card.innerHTML = `
                <div class="project-window">
                    <div class="project-title-bar">
                        <h3>${project.name}</h3>
                        <div class="window-buttons">
                            <div class="window-button minimize" aria-label="Minimize project window">-</div>
                            <div class="window-button extend" aria-label="Expand project details">↔</div>
                            <div class="window-button close" aria-label="Close project window">X</div>
                        </div>
                    </div>
                    <div class="project-content">
                        <div class="project-image" role="button" aria-label="Expand project details">
                            <img src="${project.imageUrl}" alt="${project.name}" loading="lazy">
                        </div>
                        <div class="project-details" role="button" aria-label="Expand project details">
                            <h3>${project.name}</h3>
                            <p>${project.description}</p>
                            <a href="#" class="read-more" aria-label="Read more about ${project.name}">Read More</a>
                            <div class="project-meta">
                                <div class="meta-info">
                                    <span><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${project.date}</span>
                                    <span class="category-badges"><i class="fas fa-tag" aria-hidden="true"></i>
                                        ${project.categories.map(category => `<span class="category-badge">${category}</span>`).join('')}
                                    </span>
                                    <span><i class="fas fa-star" aria-hidden="true"></i> ${project.stars}</span>
                                </div>
                                <div class="project-links">
                                    <a href="${project.liveDemoUrl || '#'}" class="project-link live-demo ${!project.liveDemoUrl ? 'disabled' : ''}" target="_blank" aria-label="View live demo of ${project.name}" ${!project.liveDemoUrl ? 'aria-disabled="true"' : ''}>Live Demo</a>
                                    <a href="${project.githubUrl}" class="project-link github-repo" target="_blank" aria-label="View GitHub repository for ${project.name}">GitHub Repo</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            sliderContainer.appendChild(card);

            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.dataset.index = index;
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to project ${index + 1}`);
            sliderDots.appendChild(dot);
            dot.addEventListener('click', () => {
                if (activeExpandedCard) return;
                stopAutoplay();
                previousSlide = currentSlide;
                currentSlide = parseInt(dot.dataset.index);
                updateSlider();
                if (isPlaying) startAutoplay();
            });

            const projectContent = card.querySelector('.project-content');
            const minimizeButton = card.querySelector('.minimize');
            const extendButton = card.querySelector('.extend');
            const closeButton = card.querySelector('.close');
            const projectImage = card.querySelector('.project-image');
            const projectDetails = card.querySelector('.project-details');
            const readMoreLink = card.querySelector('.read-more');
            let isMinimized = false;

            minimizeButton.addEventListener('click', () => {
                isMinimized = !isMinimized;
                projectContent.style.display = isMinimized ? 'none' : 'block';
            });

            function openPopup() {
                if (popup) closePopup();
                stopAutoplay();

                popup = document.createElement('div');
                popup.className = 'popup';
                popup.setAttribute('role', 'dialog');
                popup.setAttribute('aria-label', `Details for ${project.name}`);
                popup.setAttribute('tabindex', '-1');
                popup.innerHTML = `
                    <div class="project-window">
                        <div class="project-title-bar">
                            <h3>${project.name}</h3>
                            <div class="window-buttons">
                                <div class="window-button close-popup" role="button" aria-label="Close project details">X</div>
                            </div>
                        </div>
                        <div class="project-content">
                            <div class="project-image">
                                <img src="${project.imageUrl}" alt="${project.name}" loading="lazy">
                            </div>
                            <div class="project-details">
                                <h3>${project.name}</h3>
                                <p>${project.description}</p>
                                <div class="project-meta">
                                    <div class="meta-info">
                                        <span><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${project.date}</span>
                                        <span><i class="fas fa-tag" aria-hidden="true"></i> ${project.categories.join(', ')}</span>
                                        <span><i class="fas fa-star" aria-hidden="true"></i> ${project.stars}</span>
                                    </div>
                                    <div class="project-links">
                                        <a href="${project.liveDemoUrl || '#'}" class="project-link live-demo ${!project.liveDemoUrl ? 'disabled' : ''}" target="_blank" aria-label="View live demo of ${project.name}" ${!project.liveDemoUrl ? 'aria-disabled="true"' : ''}>Live Demo</a>
                                        <a href="${project.githubUrl}" class="project-link github-repo" target="_blank" aria-label="View GitHub repository for ${project.name}">GitHub Repo</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(popup);

                popup.classList.add('active');
                popupOverlay.classList.add('active');
                activeExpandedCard = card;

                const closePopupButton = popup.querySelector('.close-popup');
                closePopupButton.addEventListener('click', closePopup);
                popupOverlay.addEventListener('click', closePopup);
                popup.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') closePopup();
                });

                closePopupButton.focus();
            }

            extendButton.addEventListener('click', openPopup);
            projectImage.addEventListener('click', openPopup);
            projectDetails.addEventListener('click', openPopup);
            readMoreLink.addEventListener('click', (e) => {
                e.preventDefault();
                openPopup();
            });

            closeButton.addEventListener('click', () => {
                card.style.display = 'none';
                if (activeExpandedCard === card) closePopup();
                const visibleCards = Array.from(sliderContainer.children).filter(card => card.style.display !== 'none');
                if (visibleCards.length === 0) {
                    clearInterval(slideInterval);
                    sliderDots.innerHTML = '';
                    renderProjects(visibleProjects);
                    return;
                }
                if (currentSlide >= visibleCards.length) currentSlide = visibleCards.length - 1;
                updateSlider();
            });

            setTimeout(() => card.classList.add('visible'), index * 200);
        });

        // Thumbnails
        const thumbnails = document.createElement('div');
        thumbnails.className = 'slider-thumbnails';
        projectsToRender.forEach((project, index) => {
            const thumb = document.createElement('img');
            thumb.src = project.imageUrl;
            thumb.alt = `Thumbnail for ${project.name}`;
            thumb.className = 'thumbnail';
            thumb.dataset.index = index;
            thumb.addEventListener('click', () => {
                stopAutoplay();
                previousSlide = currentSlide;
                currentSlide = index;
                updateSlider();
                if (isPlaying) startAutoplay();
            });
            thumbnails.appendChild(thumb);
        });
        projectSlider.appendChild(thumbnails);
    }

    setTimeout(() => {
        const loadingSpinner = projectSlider.querySelector('.loading-spinner');
        if (loadingSpinner) loadingSpinner.remove();
        renderProjects(projects);
        updateSlider();
        startAutoplay();
    }, 1000);

    // Filter by category
    categoryFilter.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        stopAutoplay();
        currentSlide = 0;
        previousSlide = 0;
        visibleProjects = selectedCategory === 'all' ? [...projects] : projects.filter(project => project.categories.includes(selectedCategory));
        renderProjects(visibleProjects);
        updateSlider();
        if (isPlaying) startAutoplay();
    });

    // Search projects
    const searchInput = document.getElementById('project-search');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        stopAutoplay();
        visibleProjects = projects.filter(project =>
            project.name.toLowerCase().includes(query) ||
            project.categories.some(cat => cat.toLowerCase().includes(query))
        );
        currentSlide = 0;
        previousSlide = 0;
        renderProjects(visibleProjects);
        updateSlider();
        if (isPlaying) startAutoplay();
    });

    // Contact form
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const submitButton = contactForm.querySelector('.submit-button');

        if (!emailRegex.test(email)) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'Please enter a valid email address.';
            contactForm.appendChild(errorMessage);
            setTimeout(() => errorMessage.remove(), 3000);
            return;
        }
        if (!name.trim() || !message.trim()) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'All fields are required.';
            contactForm.appendChild(errorMessage);
            setTimeout(() => errorMessage.remove(), 3000);
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            if (response.ok) {
                const successMessage = document.createElement('div');
                successMessage.className = 'form-message success';
                successMessage.textContent = 'Message sent successfully!';
                contactForm.appendChild(successMessage);
                contactForm.reset();
                anime({
                    targets: successMessage,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 500,
                    easing: 'easeOutQuad',
                    complete: () => {
                        setTimeout(() => {
                            anime({
                                targets: successMessage,
                                opacity: 0,
                                translateY: -20,
                                duration: 500,
                                easing: 'easeInQuad',
                                complete: () => successMessage.remove()
                            });
                        }, 3000);
                    }
                });
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'There was an error sending your message. Please try again.';
            contactForm.appendChild(errorMessage);
            anime({
                targets: errorMessage,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: 'easeOutQuad',
                complete: () => {
                    setTimeout(() => {
                        anime({
                            targets: errorMessage,
                            opacity: 0,
                            translateY: -20,
                            duration: 500,
                            easing: 'easeInQuad',
                            complete: () => errorMessage.remove()
                        });
                    }, 3000);
                }
            });
        });
    });

    // Back to top
    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll-based visibility
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - viewportHeight;

    function updateSectionVisibility() {
        const sections = document.querySelectorAll('section');
        let activeSection = null;
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
                section.classList.add('visible');
                if (rect.top <= window.innerHeight / 2) activeSection = section;
            } else {
                section.classList.remove('visible');
            }
        });

        bullets.forEach(bullet => {
            const targetId = bullet.getAttribute('data-section');
            if (activeSection && targetId === `#${activeSection.id}`) {
                bullet.classList.add('active');
            } else {
                bullet.classList.remove('active');
            }
        });

        const scrollProgress = Math.min(1, scrollY / (documentHeight * 0.5));
        const easedProgress = 1 - Math.pow(1 - scrollProgress, 2);

        if (astronaut) {
            astronaut.position.y = -100 + Math.sin(time * 0.5) * 10;
            astronaut.position.x = -200 + Math.sin(easedProgress * Math.PI) * 30;
            astronaut.rotation.x += 0.002;
            astronaut.rotation.z += 0.002;
        }

        camera.position.z = -200 - easedProgress * 700;
        earth.rotation.y += 0.005;

        planet1.rotation.y += 0.002;
        planet2.rotation.y += 0.003;
        planet3.rotation.y += 0.0015;

        const testimonialsSection = document.querySelector('#testimonials');
        if (testimonialsSection.classList.contains('visible')) {
            renderer.render(testimonialsScene, testimonialsCamera);
        }

        const educationSection = document.querySelector('#education');
        if (educationSection.classList.contains('visible')) {
            const timelineItems = document.querySelectorAll('.timeline-item');
            const educationRect = educationSection.getBoundingClientRect();
            const educationProgress = Math.max(0, Math.min(1, (window.innerHeight - educationRect.top) / educationRect.height));

            timelineItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) item.classList.add('visible');
                else item.classList.remove('visible');
            });

            let activeItem = null;
            timelineItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) activeItem = item;
            });

            if (activeItem) {
                const location = activeItem.getAttribute('data-location');
                const targetRotationY = location === 'bd' ? bdLon - Math.PI / 2 : caLon - Math.PI / 2;
                globe.rotation.y = THREE.MathUtils.lerp(globe.rotation.y, targetRotationY, 0.05);
                if (location === 'bd') {
                    airplane.position.copy(bdMarker.position);
                    airplane.rotation.z = 0;
                    airplane.visible = true;
                } else if (location === 'ca') {
                    const t = Math.min(1, (educationProgress - 0.5) * 2);
                    if (t > 0) {
                        const start = bdMarker.position.clone();
                        const end = caMarker.position.clone();
                        airplane.position.lerpVectors(start, end, t);
                        airplane.rotation.z = Math.atan2(end.y - start.y, end.x - start.x);
                    }
                }
            }
        }
    }

    updateSectionVisibility();
    window.addEventListener('scroll', updateSectionVisibility);

    // Slider controls
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const playPauseButton = document.querySelector('.play-pause-button');

    prevButton.addEventListener('click', () => {
        if (activeExpandedCard) return;
        stopAutoplay();
        previousSlide = currentSlide;
        currentSlide--;
        updateSlider();
        if (isPlaying) startAutoplay();
    });

    nextButton.addEventListener('click', () => {
        if (activeExpandedCard) return;
        stopAutoplay();
        previousSlide = currentSlide;
        currentSlide++;
        updateSlider();
        if (isPlaying) startAutoplay();
    });

    playPauseButton.addEventListener('click', () => {
        if (activeExpandedCard) return;
        if (isPlaying) {
            stopAutoplay();
            playPauseButton.textContent = 'Play';
            playPauseButton.setAttribute('aria-label', 'Play slideshow');
        } else {
            startAutoplay();
            playPauseButton.textContent = 'Pause';
            playPauseButton.setAttribute('aria-label', 'Pause slideshow');
        }
        isPlaying = !isPlaying;
    });

    document.addEventListener('keydown', (e) => {
        if (activeExpandedCard) return;
        if (e.key === 'ArrowLeft') {
            stopAutoplay();
            previousSlide = currentSlide;
            currentSlide--;
            updateSlider();
            if (isPlaying) startAutoplay();
        } else if (e.key === 'ArrowRight') {
            stopAutoplay();
            previousSlide = currentSlide;
            currentSlide++;
            updateSlider();
            if (isPlaying) startAutoplay();
        } else if (e.key === 'Escape' && activeExpandedCard) {
            closePopup();
        }
    });
});

// Slider functions
function updateSlider() {
    const visibleCards = Array.from(sliderContainer.children).filter(card => card.style.display !== 'none');
    if (visibleCards.length === 0) return;

    if (currentSlide >= visibleCards.length) currentSlide = 0;
    else if (currentSlide < 0) currentSlide = visibleCards.length - 1;

    const cardWidth = window.innerWidth <= 768 ? window.innerWidth * 0.95 + 20 : 800;
    const targetOffset = -currentSlide * cardWidth;
    const direction = currentSlide > previousSlide ? 'next' : 'prev';

    anime({
        targets: sliderContainer,
        translateX: targetOffset,
        duration: 1000,
        easing: direction === 'next' ? 'spring(1, 80, 10, 0)' : 'easeInOutSine',
        opacity: direction === 'prev' ? [0.7, 1] : 1,
        update: () => {
            visibleCards.forEach((card, index) => {
                if (index === currentSlide) {
                    card.classList.add('active');
                    anime({
                        targets: card,
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        duration: 1000,
                        easing: 'easeInOutQuad'
                    });
                } else {
                    card.classList.remove('active');
                }
            });
        }
    });

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });

    previousSlide = currentSlide;
}

function startAutoplay() {
    if (isPlaying && !activeExpandedCard) {
        slideInterval = setInterval(() => {
            previousSlide = currentSlide;
            currentSlide++;
            updateSlider();
        }, 5000);
    }
}

function stopAutoplay() {
    clearInterval(slideInterval);
}

// Animation loop
const clock = new THREE.Clock();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animate() {
    if (prefersReducedMotion) {
        renderer.render(scene, camera);
        if (globeRenderer) globeRenderer.render(globeScene, globeCamera);
        return;
    }

    requestAnimationFrame(animate);
    time += 0.02;

    if (mixer) mixer.update(clock.getDelta());

    starMaterial.uniforms.time.value = time;
    universeSphere.rotation.y += 0.001;

    const starPositionsArray = starSystem.geometry.attributes.position.array;
    for (let i = 0; i < starCount * 3; i += 3) {
        starPositionsArray[i + 2] += Math.sin(time + i) * 0.05;
        starPositionsArray[i + 1] += Math.cos(time + i) * 0.03;
        if (starPositionsArray[i + 2] > 500) starPositionsArray[i + 2] = -500;
        if (starPositionsArray[i + 1] > 1000) starPositionsArray[i + 1] = -1000;
    }
    starSystem.geometry.attributes.position.needsUpdate = true;

    shards.forEach(shard => {
        shard.position.y += Math.sin(time + shard.userData.floatOffset) * shard.userData.floatSpeed;
        shard.rotation.x += 0.01;
        shard.rotation.y += 0.01;
    });

    starLayers.forEach(layer => {
        const positions = layer.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += layer.userData.speed;
            if (positions[i + 2] > 100) positions[i + 2] = -400;
        }
        layer.geometry.attributes.position.needsUpdate = true;
    });

    camera.position.x += (targetCameraX - camera.position.x) * 0.05;

    renderer.render(scene, camera);
    if (globeRenderer) globeRenderer.render(globeScene, globeCamera);
}
animate();

// Debounced resize handler
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.addEventListener('resize', debounce(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    testimonialsCamera.aspect = window.innerWidth / window.innerHeight;
    testimonialsCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateSlider();
}, 100));