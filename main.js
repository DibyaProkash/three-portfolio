(function () {
    // Initialize global modules
    window.threeModule = window.threeModule || {};
    window.sliderModule = window.sliderModule || {};
    window.formModule = window.formModule || {};

    // Check for module existence
    if (!window.threeModule.scene || !window.sliderModule.initSlider || !window.formModule.initForm) {
        console.error('One or more modules (threeModule, sliderModule, formModule) are not defined.');
        // Fallback: Display basic UI without animations
        document.body.classList.add('no-webgl');
        // Initialize slider and form without Three.js
        if (window.sliderModule.initSlider) window.sliderModule.initSlider();
        if (window.formModule.initForm) window.formModule.initForm();
        return;
    }

    const { scene, camera, renderer, animate, updateCamera, updateScene, resize } = window.threeModule;
    const { initSlider, updateSlider } = window.sliderModule;
    const { initForm } = window.formModule;

    // Mouse interaction
    const mouse = new THREE.Vector2();
    let targetCameraX = 0;

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        targetCameraX = mouse.x * 200;
        updateCamera(targetCameraX);
    });

    // Theme toggle (manual)
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

    // Skills animation
    document.querySelectorAll('.skill-circle').forEach(circle => {
        const level = circle.dataset.level;
        circle.style.setProperty('--level', level);
    });

    // Experience expandable animation
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach(item => {
        const skills = item.getAttribute('data-skills').split(', ');
        const projectList = item.querySelector('.project-list');
        fetch('data/projects.json').then(response => response.json()).then(projects => {
            const projectsForSkills = projects.filter(project =>
                project.categories.some(category => skills.includes(category))
            );
            projectsForSkills.forEach(project => {
                const li = document.createElement('li');
                li.textContent = project.name;
                projectList.appendChild(li);
            });
        }).catch(error => {
            console.error('Error loading projects for experience:', error);
        });

        const projectsContainer = item.querySelector('.experience-projects');
        let isExpanded = false;

        item.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                projectsContainer.style.display = 'block';
                anime({
                    targets: projectsContainer,
                    height: 'auto',
                    opacity: 1,
                    duration: 500,
                    easing: 'easeInOutQuad'
                });
            } else {
                anime({
                    targets: projectsContainer,
                    height: 0,
                    opacity: 0,
                    duration: 500,
                    easing: 'easeInOutQuad',
                    complete: () => {
                        projectsContainer.style.display = 'none';
                    }
                });
            }
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
        console.log('updateSectionVisibility called'); // Debug log to confirm scroll event

        const sections = document.querySelectorAll('section');
        let activeSection = null;
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > -viewportHeight) {
                section.classList.add('visible');
                if (rect.top <= window.innerHeight / 2) activeSection = section;
            } else {
                section.classList.remove('visible');
            }
        });

        // Theme toggle based on scroll position (after About Me section)
        const aboutSection = document.querySelector('#about');
        const aboutRect = aboutSection.getBoundingClientRect();
        const isPastAbout = aboutRect.bottom < window.innerHeight * 0.5;
        if (isPastAbout) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-pressed', 'false');
            localStorage.setItem('theme', 'dark');
        } else {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-mode');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                themeToggle.setAttribute('aria-pressed', 'true');
            }
        }

        bullets.forEach(bullet => {
            const targetId = bullet.getAttribute('data-section');
            if (activeSection && targetId === `#${activeSection.id}`) {
                bullet.classList.add('active');
            } else {
                bullet.classList.remove('active');
            }
        });

        // Debugging log
        console.log('Scroll Y:', scrollY, 'Home Visible:', document.querySelector('#home').classList.contains('visible'));

        const scrollProgress = Math.max(0, Math.min(1, scrollY / (documentHeight * 0.5)));
        const easedProgress = 1 - Math.pow(1 - scrollProgress, 2);
        updateScene(scrollProgress, easedProgress);

        // Animate timeline items in Education section
        const educationSection = document.querySelector('#education');
        if (educationSection.classList.contains('visible')) {
            const timelineItems = document.querySelectorAll('.timeline-item');
            timelineItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    item.classList.add('visible');
                } else {
                    item.classList.remove('visible');
                }
            });
        }
    }

    updateSectionVisibility();
    window.addEventListener('scroll', updateSectionVisibility);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            document.querySelector('.prev').click();
        } else if (e.key === 'ArrowRight') {
            document.querySelector('.next').click();
        } else if (e.key === 'Escape' && document.querySelector('.popup.active')) {
            document.querySelector('.close-popup').click();
        }
    });

    // Debounced resize handler
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    window.addEventListener('resize', debounce(() => {
        resize();
        updateSlider();
    }, 100));

    // Email id obfuscating
    document.getElementById('email-address').textContent = ['dibya', 'prokash', '@', 'gmail', '.', 'com'].join('');

    // Initialize modules
    initSlider();
    initForm();
    animate();
})();