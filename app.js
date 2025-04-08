// Scene setup for main background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 0; // Start camera at z = 0
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Universe background (large sphere with texture)
const textureLoader = new THREE.TextureLoader();
const universeTexture = textureLoader.load('assets/images/planets/eso0932a.jpg'); // Universe texture
const universeGeometry = new THREE.SphereGeometry(1000, 64, 64); // Large sphere
const universeMaterial = new THREE.MeshBasicMaterial({
    map: universeTexture,
    side: THREE.BackSide, // Render the inside of the sphere
    transparent: true,
    opacity: 0.8
});
const universeSphere = new THREE.Mesh(universeGeometry, universeMaterial);
scene.add(universeSphere);

// Ambient stars (optional, can be removed if universe texture is sufficient)
const starCount = 500;
const stars = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 2000;
    starPositions[i + 1] = (Math.random() - 0.5) * 2000;
    starPositions[i + 2] = (Math.random() - 0.5) * 1000 - 500;
}
stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 3, transparent: true });
const starSystem = new THREE.Points(stars, starMaterial);
scene.add(starSystem);

// Planets with textures
const planet1 = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshPhongMaterial({
        map: textureLoader.load('assets/images/planets/plutomap1k.jpg'), // Moon-like
        shininess: 25
    })
);
planet1.position.set(300, 200, -800);
scene.add(planet1);

const planet2 = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32),
    new THREE.MeshPhongMaterial({
        map: textureLoader.load('assets/images/planets/mars1k.jpg'), // Mars-like
        shininess: 25
    })
);
planet2.position.set(-400, 300, -600);
scene.add(planet2);

const planet3 = new THREE.Mesh(
    new THREE.SphereGeometry(80, 32, 32),
    new THREE.MeshPhongMaterial({
        map: textureLoader.load('assets/images/planets/neptunemap.jpg'), // Neptune-like
        shininess: 25
    })
);
planet3.position.set(500, -200, -700);
scene.add(planet3);

// Earth in main scene
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

// Astronaut with GLTF model
let astronaut;
let mixer; // For playing the built-in animation
const loader = new THREE.GLTFLoader();
loader.load(
    'assets/models/falling-spaceman.glb',
    (gltf) => {
        console.log('Astronaut model loaded successfully');
        astronaut = gltf.scene;
        astronaut.scale.set(100, 100, 100); // Keep the larger scale for visibility

        // Position the astronaut near the camera, in front of the Earth, on the left side, and downwards
        astronaut.position.set(
            -200, // Left side (negative x)
            -100, // Downwards (negative y)
            -500  // Closer to the camera (between z = -200 and z = -900)
        );

        // Rotate the astronaut to match the dynamic pose in the image
        astronaut.rotation.x = Math.PI / 4; // Tilt forward
        astronaut.rotation.y = Math.PI / 2; // Face slightly to the right

        scene.add(astronaut);
        console.log('Astronaut added to scene at position:', astronaut.position);

        // Check for built-in animations
        if (gltf.animations && gltf.animations.length > 0) {
            console.log('Found animations in the GLTF model:', gltf.animations);
            mixer = new THREE.AnimationMixer(astronaut);
            const animationAction = mixer.clipAction(gltf.animations[0]); // Play the first animation
            animationAction.play();
        } else {
            console.warn('No animations found in the GLTF model. Using fallback animation.');
        }
    },
    (progress) => {
        console.log(`Loading astronaut: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
    },
    (error) => {
        console.error('Error loading astronaut model:', error);
        const fallbackGeometry = new THREE.BoxGeometry(50, 50, 50);
        const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        astronaut = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        astronaut.position.set(-200, -100, -500);
        scene.add(astronaut);
        console.log('Added fallback cube for astronaut at position:', astronaut.position);
    }
);

// Debug sphere to confirm position
const debugSphere = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
debugSphere.position.set(-200, -100, -500);
scene.add(debugSphere);

// Add floating shards around the astronaut
const shardCount = 10;
const shards = [];
for (let i = 0; i < shardCount; i++) {
    const shardGeometry = new THREE.BoxGeometry(5, 5, 5); // Small cube as a shard
    const shardMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 });
    const shard = new THREE.Mesh(shardGeometry, shardMaterial);
    shard.position.set(
        -200 + (Math.random() - 0.5) * 50, // Around the astronaut's x
        -100 + (Math.random() - 0.5) * 50, // Around the astronaut's y
        -500 + (Math.random() - 0.5) * 50  // Around the astronaut's z
    );
    shard.userData = {
        floatSpeed: Math.random() * 0.01 + 0.005, // Slower floating speed
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

// Bangladesh (lat: 23.6850° N, lon: 90.3563° E)
const bdMarker = new THREE.Mesh(markerGeometry, markerMaterial);
const bdLat = 23.6850 * (Math.PI / 180);
const bdLon = 90.3563 * (Math.PI / 180);
bdMarker.position.set(
    100 * Math.cos(bdLat) * Math.cos(bdLon),
    100 * Math.sin(bdLat),
    100 * Math.cos(bdLat) * Math.sin(bdLon)
);
globe.add(bdMarker);

// Canada (lat: 53.7609° N, lon: -98.8139° W)
const caMarker = new THREE.Mesh(markerGeometry, markerMaterial);
const caLat = 53.7609 * (Math.PI / 180);
const caLon = -98.8139 * (Math.PI / 180);
caMarker.position.set(
    100 * Math.cos(caLat) * Math.cos(caLon),
    100 * Math.sin(caLat),
    100 * Math.cos(caLat) * Math.sin(caLon)
);
globe.add(caMarker);

// Airplane for animation
const airplaneGeometry = new THREE.BoxGeometry(10, 2, 5);
const airplaneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const airplane = new THREE.Mesh(airplaneGeometry, airplaneMaterial);
globe.add(airplane);

globeCamera.position.z = 200;

// Starfield for Testimonials section
const testimonialsScene = new THREE.Scene();
const testimonialsCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
testimonialsCamera.position.z = 100;

// Create multiple starfield layers
const starLayers = [];
const layerCount = 3; // Number of starfield layers
for (let layer = 0; layer < layerCount; layer++) {
    const starCountLayer = 200 * (layer + 1); // More stars in deeper layers
    const starGeometry = new THREE.BufferGeometry();
    const starPositionsLayer = new Float32Array(starCountLayer * 3);
    const starSizes = new Float32Array(starCountLayer);
    const starOpacities = new Float32Array(starCountLayer);

    for (let i = 0; i < starCountLayer * 3; i += 3) {
        starPositionsLayer[i] = (Math.random() - 0.5) * 2000; // x
        starPositionsLayer[i + 1] = (Math.random() - 0.5) * 2000; // y
        starPositionsLayer[i + 2] = (Math.random() - 0.5) * 500 - (layer * 100); // z (deeper layers)
        starSizes[i / 3] = Math.random() * 2 + 1; // Random size between 1 and 3
        starOpacities[i / 3] = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositionsLayer, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('opacity', new THREE.BufferAttribute(starOpacities, 1));

    const starMaterialLayer = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
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
    starSystemLayer.userData = { speed: 0.1 * (layer + 1) }; // Different speeds for each layer
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

// Wait for the DOM to load before accessing elements
window.addEventListener('DOMContentLoaded', () => {
    // Side navigation bullets
    const bullets = document.querySelectorAll('.nav-bullet');
    bullets.forEach(bullet => {
        bullet.addEventListener('click', () => {
            const targetId = bullet.getAttribute('data-section');
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Animated text in the hero section
    const roles = ['full stack', 'researcher', 'developer', 'designer', 'innovator'];
    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const animatedRoleElement = document.getElementById('animated-role');
    const typingSpeed = 150; // Slower typing speed (ms per character)
    const deletingSpeed = 75; // Slower deleting speed (ms per character)
    const pauseDuration = 1500; // Shorter pause between roles (ms)

    function typeRole() {
        const currentRole = roles[currentRoleIndex];
        if (isDeleting) {
            // Deleting phase
            animatedRoleElement.textContent = `[${currentRole.substring(0, currentCharIndex)}]`;
            currentCharIndex--;
            if (currentCharIndex < 0) {
                isDeleting = false;
                currentRoleIndex = (currentRoleIndex + 1) % roles.length;
                setTimeout(typeRole, 500); // Pause before typing the next role
            } else {
                setTimeout(typeRole, deletingSpeed);
            }
        } else {
            // Typing phase
            animatedRoleElement.textContent = `[${currentRole.substring(0, currentCharIndex)}]`;
            currentCharIndex++;
            if (currentCharIndex > currentRole.length) {
                isDeleting = true;
                setTimeout(typeRole, pauseDuration); // Pause before deleting
            } else {
                setTimeout(typeRole, typingSpeed);
            }
        }
    }

    // Start the typing animation
    typeRole();

    // Tilt effect for About section
    const tiltableElements = document.querySelectorAll('.tiltable');
    tiltableElements.forEach(element => {
        element.addEventListener('mousemove', (event) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = event.clientX - centerX;
            const mouseY = event.clientY - centerY;

            // Calculate tilt angles (max 10 degrees for subtler effect)
            const tiltX = (mouseY / rect.height) * 10; // Tilt around X-axis
            const tiltY = -(mouseX / rect.width) * 10; // Tilt around Y-axis

            element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });

    // Manually defined project data with image URLs
    const projects = [
        {
            name: "Game Boy Pokédex",
            description: "A retro-inspired Pokédex web app styled like a classic Game Boy, built with HTML, CSS, and JavaScript.",
            date: "Apr 2025",
            category: "JavaScript, HTML, CSS, API",
            stars: 0,
            githubUrl: "https://github.com/DibyaProkash/pokedex",
            liveDemoUrl: "https://dibyaprokash.github.io/pokedex/",
            imageUrl: "assets/images/projects/project1.png"
        },
        {
            name: "Real-time Weather Mobile App",
            description: "A real-time weather mobile app using Kotlin and OpenWeatherMap API.",
            date: "Mar 2025",
            category: "Kotlin",
            stars: 0,
            githubUrl: "https://github.com/DibyaProkash/weather-mobile-app",
            liveDemoUrl: "",
            imageUrl: "assets/images/projects/project2.png"
        },
        {
            name: "2d Chess Game",
            description: "A single-player 2D chess game with AI opponent, built with JavaScript and HTML5 Canvas.",
            date: "Mar 2025",
            category: "HTML/CSS, JavaScript",
            stars: 0,
            githubUrl: "https://github.com/DibyaProkash/2D-Chess-Game-JS",
            liveDemoUrl: "https://dibyaprokash.github.io/2D-Chess-Game-JS/", 
            imageUrl: "assets/images/projects/project3.png"
        },
        {
            name: "Real-time News App",
            description: "A real-time mobile news application using Kotlin and NewsAPI, with a focus on responsive design.",
            date: "Mar 2025",
            category: "Kotlin, API",
            stars: 0,
            githubUrl: "https://github.com/DibyaProkash/TheNewsApp",
            liveDemoUrl: "", // No live demo available
            imageUrl: "assets/images/projects/project1.png"
        },
        {
            name: "Space Invader App",
            description: "A retro-style Space Invader game built with JavaScript and HTML5 Canvas.",
            date: "Mar 2025",
            category: "HTML/CSS, JavaScript",
            stars: 0,
            githubUrl: "https://github.com/DibyaProkash/Space-Invader-App-Demo-JS",
            liveDemoUrl: "https://dibyaprokash.github.io/Space-Invader-App-Demo-JS/",
            imageUrl: "assets/images/projects/space-invader.png"
        }
    ];

    // Populate the portfolio section with the manual data
    const projectSlider = document.getElementById('project-grid');
    projectSlider.classList.add('project-slider'); // Add slider class

    // Create slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    projectSlider.appendChild(sliderContainer);

    // Create overlay for popup
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    document.body.appendChild(popupOverlay);

    // Create popup container
    let popup = null;
    let activeExpandedCard = null; // Track the card associated with the popup

    // Create slider controls
    const sliderControls = document.createElement('div');
    sliderControls.className = 'slider-controls';
    sliderControls.innerHTML = `
        <button class="slider-button prev">Prev</button>
        <button class="play-pause-button">Pause</button>
        <button class="slider-button next">Next</button>
    `;
    projectSlider.appendChild(sliderControls);

    // Create pagination dots
    const sliderDots = document.createElement('div');
    sliderDots.className = 'slider-dots';
    projectSlider.appendChild(sliderDots);

    let currentSlide = 0;
    let isPlaying = true;
    let slideInterval;
    let previousSlide = 0; // Track the previous slide to determine sliding direction

    // Function to close the popup
    function closePopup() {
        if (popup) {
            popup.classList.remove('active');
            popupOverlay.classList.remove('active');
            document.body.removeChild(popup);
            popup = null;
            activeExpandedCard = null;
            console.log('Popup closed, isPlaying:', isPlaying);
            if (isPlaying) {
                startAutoplay(); // Resume autoplay if it was active
            }
        }
    }

    // Populate portfolio cards with the manual data
    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="project-window">
                <div class="project-title-bar">
                    <h3>${project.name}</h3>
                    <div class="window-buttons">
                        <div class="window-button minimize">-</div>
                        <div class="window-button extend">↔</div>
                        <div class="window-button close">X</div>
                    </div>
                </div>
                <div class="project-content">
                    <div class="project-image">
                        <img src="${project.imageUrl}" alt="${project.name}">
                    </div>
                    <div class="project-details">
                        <h3>${project.name}</h3>
                        <p>${project.description}</p>
                        <div class="project-meta">
                            <span>${project.date}</span>
                            <span>${project.category}</span>
                            <span>⭐ ${project.stars}</span>
                            <div class="project-links">
                                <a href="${project.liveDemoUrl || '#'}" class="project-link live-demo ${!project.liveDemoUrl ? 'disabled' : ''}" target="_blank">Live Demo</a>
                                <a href="${project.githubUrl}" class="project-link github-repo" target="_blank">GitHub Repo</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        sliderContainer.appendChild(card);

        // Add pagination dot
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = index;
        sliderDots.appendChild(dot);
        dot.addEventListener('click', () => {
            if (activeExpandedCard) return; // Prevent interaction if a popup is open
            stopAutoplay();
            previousSlide = currentSlide;
            currentSlide = parseInt(dot.dataset.index);
            updateSlider();
            if (isPlaying) startAutoplay();
        });

        // Add functionality to window buttons
        const projectContent = card.querySelector('.project-content');
        const minimizeButton = card.querySelector('.minimize');
        const extendButton = card.querySelector('.extend');
        const closeButton = card.querySelector('.close');
        const projectImage = card.querySelector('.project-image');
        const projectDetails = card.querySelector('.project-details');
        let isMinimized = false; // Track the minimized state

        minimizeButton.addEventListener('click', () => {
            isMinimized = !isMinimized;
            projectContent.style.display = isMinimized ? 'none' : 'block';
            console.log(`Minimize clicked: isMinimized = ${isMinimized}, display = ${projectContent.style.display}`);
        });

        // Function to open the popup
        function openPopup() {
            if (popup) {
                closePopup(); // Close any existing popup
            }

            stopAutoplay(); // Pause autoplay when opening popup

            // Create a new popup element
            popup = document.createElement('div');
            popup.className = 'popup';
            popup.innerHTML = `
                <div class="project-window">
                    <div class="project-title-bar">
                        <h3>${project.name}</h3>
                        <div class="window-buttons">
                            <div class="window-button close-popup">X</div>
                        </div>
                    </div>
                    <div class="project-content">
                        <div class="project-image">
                            <img src="${project.imageUrl}" alt="${project.name}">
                        </div>
                        <div class="project-details">
                            <h3>${project.name}</h3>
                            <p>${project.description}</p>
                            <div class="project-meta">
                                <span>${project.date}</span>
                                <span>${project.category}</span>
                                <span>⭐ ${project.stars}</span>
                                <div class="project-links">
                                    <a href="${project.liveDemoUrl || '#'}" class="project-link live-demo ${!project.liveDemoUrl ? 'disabled' : ''}" target="_blank">Live Demo</a>
                                    <a href="${project.githubUrl}" class="project-link github-repo" target="_blank">GitHub Repo</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);

            // Show the popup and overlay
            popup.classList.add('active');
            popupOverlay.classList.add('active');
            activeExpandedCard = card;

            // Add event listener to close button
            const closePopupButton = popup.querySelector('.close-popup');
            closePopupButton.addEventListener('click', closePopup);

            // Add event listener to overlay to close popup when clicking outside
            popupOverlay.addEventListener('click', closePopup);
        }

        // Add click listeners to trigger the popup
        extendButton.addEventListener('click', openPopup);
        projectImage.addEventListener('click', openPopup);
        projectDetails.addEventListener('click', openPopup);

        closeButton.addEventListener('click', () => {
            card.style.display = 'none';
            // If the card was in a popup, close the popup
            if (activeExpandedCard === card) {
                closePopup();
            }
            // Adjust the slider after removing a card
            const visibleCards = Array.from(sliderContainer.children).filter(card => card.style.display !== 'none');
            if (visibleCards.length === 0) {
                clearInterval(slideInterval);
                sliderDots.innerHTML = ''; // Clear dots if no cards remain
                return;
            }
            if (currentSlide >= visibleCards.length) {
                currentSlide = visibleCards.length - 1;
            }
            updateSlider();
        });
    });

    // Slider functionality
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const playPauseButton = document.querySelector('.play-pause-button');

    function updateSlider() {
        const visibleCards = Array.from(sliderContainer.children).filter(card => card.style.display !== 'none');
        if (visibleCards.length === 0) return;

        // Adjust currentSlide if it exceeds the number of visible cards
        if (currentSlide >= visibleCards.length) {
            currentSlide = 0;
        } else if (currentSlide < 0) {
            currentSlide = visibleCards.length - 1;
        }

        // Calculate the target offset for the slider (card width + margin)
        const cardWidth = 800; // Card width (600px) + margin (50px on each side)
        const targetOffset = -currentSlide * cardWidth;

        // Determine sliding direction
        const direction = currentSlide > previousSlide ? 'next' : 'prev';

        // Use Anime.js to animate the sliding with direction-aware effects
        anime({
            targets: sliderContainer,
            translateX: targetOffset,
            duration: 1000, // 1 second for a smooth slide
            easing: direction === 'next' ? 'spring(1, 80, 10, 0)' : 'easeInOutSine', // Bouncy for "next", smooth for "prev"
            opacity: direction === 'prev' ? [0.7, 1] : 1, // Slight fade for "prev"
            update: () => {
                // Animate the active card's opacity and scale
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

        // Update pagination dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update previousSlide for the next transition
        previousSlide = currentSlide;
    }

    function startAutoplay() {
        if (isPlaying && !activeExpandedCard) { // Only start if no popup is open
            console.log('Starting autoplay');
            slideInterval = setInterval(() => {
                previousSlide = currentSlide;
                currentSlide++;
                updateSlider();
            }, 7000); // Change slide every 7 seconds
        }
    }

    function stopAutoplay() {
        console.log('Stopping autoplay');
        clearInterval(slideInterval);
    }

    prevButton.addEventListener('click', () => {
        if (activeExpandedCard) return; // Prevent interaction if a popup is open
        stopAutoplay();
        previousSlide = currentSlide;
        currentSlide--;
        updateSlider();
        if (isPlaying) startAutoplay();
    });

    nextButton.addEventListener('click', () => {
        if (activeExpandedCard) return; // Prevent interaction if a popup is open
        stopAutoplay();
        previousSlide = currentSlide;
        currentSlide++;
        updateSlider();
        if (isPlaying) startAutoplay();
    });

    playPauseButton.addEventListener('click', () => {
        if (activeExpandedCard) return; // Prevent interaction if a popup is open
        if (isPlaying) {
            stopAutoplay();
            playPauseButton.textContent = 'Play';
        } else {
            startAutoplay();
            playPauseButton.textContent = 'Pause';
        }
        isPlaying = !isPlaying;
        console.log('Play/Pause clicked, isPlaying:', isPlaying);
    });

    // Start autoplay initially
    startAutoplay();
    updateSlider();

    // Back to Top button visibility
    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > viewportHeight) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll-based visibility and animations
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - viewportHeight;

    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        let activeSection = null;
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
                section.classList.add('visible');
                if (rect.top <= window.innerHeight / 2) {
                    activeSection = section;
                }
            } else {
                section.classList.remove('visible');
            }
        });

        // Update active bullet
        bullets.forEach(bullet => {
            const targetId = bullet.getAttribute('data-section');
            if (activeSection && targetId === `#${activeSection.id}`) {
                bullet.classList.add('active');
            } else {
                bullet.classList.remove('active');
            }
        });

        // Calculate scroll progress based on scroll position
        const scrollProgress = Math.min(1, scrollY / (documentHeight * 0.5)); // Transition over half the document height

        // Apply an easing function for smoother transition
        const easedProgress = 1 - Math.pow(1 - scrollProgress, 2); // Ease-in quadratic

        // Debug scroll progress and camera position
        console.log('Scroll Y:', scrollY);
        console.log('Document Height:', documentHeight);
        console.log('Scroll Progress:', scrollProgress);
        console.log('Eased Progress:', easedProgress);
        console.log('Camera Z:', camera.position.z);

        // Hero section astronaut animation
        if (astronaut) {
            // Floating animation (bobbing up and down, slower and subtler)
            astronaut.position.y = -100 + Math.sin(time * 0.5) * 10; // Reduced amplitude and speed
            astronaut.position.x = -200 + Math.sin(easedProgress * Math.PI) * 30; // Reduced sway amplitude

            // Tumbling effect (slower)
            astronaut.rotation.x += 0.005;
            astronaut.rotation.z += 0.005;
        }

        // Camera movement: zoom towards Earth
        camera.position.z = -200 - easedProgress * 700; // Ranges from -200 to -900
        earth.rotation.y += 0.005;

        // Render the starfield for Testimonials section when visible
        const testimonialsSection = document.querySelector('#testimonials');
        if (testimonialsSection.classList.contains('visible')) {
            renderer.render(testimonialsScene, testimonialsCamera);
        }

        // Education timeline animation
        const educationSection = document.querySelector('#education');
        if (educationSection.classList.contains('visible')) {
            const timelineItems = document.querySelectorAll('.timeline-item');
            const educationRect = educationSection.getBoundingClientRect();
            const educationProgress = Math.max(0, Math.min(1, (window.innerHeight - educationRect.top) / educationRect.height));

            timelineItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    item.classList.add('visible');
                } else {
                    item.classList.remove('visible');
                }
            });

            let activeItem = null;
            timelineItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
                    activeItem = item;
                }
            });

            if (activeItem) {
                const location = activeItem.getAttribute('data-location');
                if (location === 'bd') {
                    globe.rotation.y += (bdLon - Math.PI / 2 - globe.rotation.y) * 0.05;
                    airplane.position.copy(bdMarker.position);
                    airplane.rotation.z = 0;
                    airplane.visible = true;
                } else if (location === 'ca') {
                    globe.rotation.y += (caLon - Math.PI / 2 - globe.rotation.y) * 0.05;
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
    });
});

// Animation loop
let time = 0;
const clock = new THREE.Clock(); // For animation mixer
function animate() {
    requestAnimationFrame(animate);
    time += 0.02;

    // Update the animation mixer
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }

    // Rotate the universe background
    universeSphere.rotation.y += 0.001;

    // Animate stars in the main scene
    const starPositions = starSystem.geometry.attributes.position.array;
    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i + 2] += Math.sin(time + i) * 0.05;
        starPositions[i + 1] += Math.cos(time + i) * 0.03;
        if (starPositions[i + 2] > 500) starPositions[i + 2] = -500;
        if (starPositions[i + 1] > 1000) starPositions[i + 1] = -1000;
    }
    starSystem.geometry.attributes.position.needsUpdate = true;

    // Animate floating shards
    shards.forEach(shard => {
        shard.position.y += Math.sin(time + shard.userData.floatOffset) * shard.userData.floatSpeed;
        shard.rotation.x += 0.01; // Slower rotation
        shard.rotation.y += 0.01; // Slower rotation
    });

    // Animate starfield layers in the Testimonials section
    starLayers.forEach(layer => {
        const positions = layer.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += layer.userData.speed; // Move stars forward
            if (positions[i + 2] > 100) {
                positions[i + 2] = -400; // Reset to back
            }
        }
        layer.geometry.attributes.position.needsUpdate = true;
    });

    // Camera movement
    camera.position.x += (targetCameraX - camera.position.x) * 0.05;

    renderer.render(scene, camera);
    if (globeRenderer) {
        globeRenderer.render(globeScene, globeCamera);
    }
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    testimonialsCamera.aspect = window.innerWidth / window.innerHeight;
    testimonialsCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});