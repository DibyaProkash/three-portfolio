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

    // Clean URL on page load
    if (window.location.pathname.endsWith('index.html')) {
        const newPath = window.location.pathname.replace('index.html', '');
        const newHash = window.location.hash;
        window.history.replaceState(null, '', newPath + newHash);
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

    // Wait for DOM to load before adding event listeners
    document.addEventListener('DOMContentLoaded', () => {
        // Tilt effect
        const tiltableElements = document.querySelectorAll('.tiltable');
        console.log('Tiltable elements found:', tiltableElements.length);
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

        // Poke effect for hero image
        const pokeableElements = document.querySelectorAll('.pokeable');
        console.log('Pokeable elements found:', pokeableElements.length);
        pokeableElements.forEach(element => {
            element.addEventListener('click', () => {
                element.classList.remove('poked');
                void element.offsetWidth;
                element.classList.add('poked');
            });

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === 'Space') {
                    e.preventDefault();
                    element.classList.remove('poked');
                    void element.offsetWidth;
                    element.classList.add('poked');
                }
            });
        });

        // Skills animation
        document.querySelectorAll('.skill-card').forEach(card => {
            const level = card.dataset.level;
            const progress = card.querySelector('.progress');
            if (progress) {
                progress.style.width = `${level}%`;
            }
        });

        // Experience expandable animation
        const experienceItems = document.querySelectorAll('#experience .timeline-item');
        console.log('Experience timeline items found:', experienceItems.length);
        experienceItems.forEach(item => {
            const role = item.querySelector('h3').textContent.trim();
            const company = item.querySelector('.company').textContent.trim();
            const courseList = item.querySelector('.course-list');
            const coursesContainer = item.querySelector('.experience-courses');
            let isExpanded = false;

            // Fetch and populate courses
            if (courseList) {
                fetch('data/courses.json').then(response => response.json()).then(courses => {
                    const coursesForRole = courses.find(courseEntry =>
                        courseEntry.role === role && courseEntry.company === company
                    );
                    if (coursesForRole) {
                        coursesForRole.courses.forEach(course => {
                            const li = document.createElement('li');
                            li.textContent = course;
                            courseList.appendChild(li);
                        });
                    }
                }).catch(error => {
                    console.error('Error loading courses for experience:', error);
                });
            }

            // Only add click event if there is a courses container to expand
            if (coursesContainer) {
                item.addEventListener('click', (e) => {
                    // Prevent click on course list items from toggling
                    if (e.target.closest('.course-list')) return;

                    isExpanded = !isExpanded;
                    if (isExpanded) {
                        coursesContainer.style.display = 'block';
                        anime({
                            targets: coursesContainer,
                            height: coursesContainer.scrollHeight,
                            opacity: 1,
                            translateY: [20, 0],
                            duration: 600,
                            easing: 'easeOutExpo'
                        });
                    } else {
                        anime({
                            targets: coursesContainer,
                            height: 0,
                            opacity: 0,
                            translateY: [0, 20],
                            duration: 600,
                            easing: 'easeInExpo',
                            complete: () => {
                                coursesContainer.style.display = 'none';
                            }
                        });
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

    // Publication Modals
    const publicationData = {
        j1: {
            title: "I Am Here: Privacy Aware Support",
            authors: "Mohammad Kaosain Akbar, <strong>Dibya Prokash Sarkar</strong>, and Emrul Kaiser",
            details: "2022. <em>International Journal for Research in Applied Science & Engineering Technology</em>, 10(ix), pp. 1162-1173.",
            link: "https://d1wqtxts1xzle7.cloudfront.net/93940760/I_Am_Here_Privacy_Aware_Support-libre.pdf?1667988219=&response-content-disposition=inline%3B+filename%3DI_Am_Here_Privacy_Aware_Support.pdf&Expires=1745189455&Signature=Md1pEDqhWmU85q0QoZMrxJnpbDcwPCo53Uo~HQcqLRXCouNR598SeHYzKPeJNrIJO13OTozn6KkKsBnYhVuQ6msHdAZ3t2qG17dLyFbqwrO9UnLUWk5okcwjQpfdArWn7KXhlOBwIBNPkMv5rzs8FCi0Rc~AoSHybXM-un3zJ5zhnpZ1qyrhmXhRfPzfVbV2tKfgOZ4LzzdDgS2GvGcNBVIuW9DbjzZdM5XiTPeRUyQGBjk3RlXu2gjB8wvX48cuDDyYLv7G-83kzkYOE7kQX0yobpqUZpX1hcP4qwbV84rlldyLaeEiR9wU6zNKfY1muzXcoGeJEjVi8rWMluubXQ__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA",
            linkText: "[Link]"
        },
        c1: {
            title: "Collaboration Dynamics in Constructive Physicalization of Shared Personal Data",
            authors: "<strong>Dibya Prokash Sarkar</strong>, Sowmya Somanath, and Charles Perin",
            details: "2025. <em>51st Graphics Interface Conference (GI ’25)</em>",
            link: "#",
            linkText: "[Appearing Soon!]"
        },
        c2: {
            title: "SHEBA: A Low-Cost Assistive Robot for Older Adults in the Developing World",
            authors: "Tamanna Motahar, Md. Fahim Farden, <strong>Dibya Prokash Sarkar</strong>, Md. Atiqul Islam, Maria E. Cabrera, and Maya Cakmak",
            details: "2019. <em>2019 28th IEEE International Conference on Robot and Human Interactive Communication (RO-MAN)</em>",
            link: "https://ieeexplore.ieee.org/abstract/document/8956402",
            linkText: "[Link]"
        },
        c3: {
            title: "A Low-cost Healthcare Bot for Elderly People",
            authors: "<strong>Dibya Prokash Sarkar</strong>, Md. Fahim Farden, Md. Atiqul Islam, Rahat Jahangir Rony, and Tamanna Motahar",
            details: "2018. <em>2019 Joint 8th International Conference on Informatics, Electronics & Vision (ICIEV) and 2019 3rd International Conference on Imaging, Vision & Pattern Recognition (icIVPR)</em>",
            link: "https://ieeexplore.ieee.org/abstract/document/8858567",
            linkText: "[Link]"
        },
        p1: {
            title: "Mini Nurse-Bot: A Healthcare Assistance for Elderly People",
            authors: "Tamanna Motahar, Md. Fahim Farden, Md. Atiqul Islam, Rahat Jahangir Rony, and <strong>Dibya Prokash Sarkar</strong>",
            details: "2018. <em>2018 ACM International Joint Conference and 2018 International Symposium on Pervasive and Ubiquitous Computing and Wearable Computers (UbiComp '18)</em>",
            link: "https://dl.acm.org/doi/abs/10.1145/3267305.3267662",
            linkText: "[Link]"
        },
        w1: {
            title: "A Nurse Bot for Elderly People",
            authors: "<strong>Dibya Prokash Sarkar</strong>",
            details: "2018. <em>2018 ACM International Joint Conference and 2018 International Symposium on Pervasive and Ubiquitous Computing and Wearable Computers (UbiComp '18)</em>",
            link: "https://dl.acm.org/doi/abs/10.1145/3267305.3277821",
            linkText: "[Link]"
        },
        t1: {
            title: "Understanding Shared Personal Data Constructive Physicalization Process",
            authors: "<strong>Dibya Prokash Sarkar</strong>",
            details: "2024. MSc Thesis, University of Victoria, BC, Canada.",
            link: "https://dspace.library.uvic.ca/items/439a0b05-bfff-4f44-85bd-98450f32b0ce",
            linkText: "[Link]"
        },
        t2: {
            title: "I Am Here: A Security Service Preserving Privacy",
            authors: "Mohammad Kaosain Akbar, <strong>Dibya Prokash Sarkar</strong>, Emrul Kaisar, Soufia Neli Roshni, and Nova Ahmed",
            details: "2018. BSc Thesis, North South University, Dhaka, Bangladesh.",
            link: "#",
            linkText: "[Link Not Available]"
        }
    };

    const modalOverlay = document.getElementById('publication-modal-overlay');
    const modal = document.getElementById('publication-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalAuthors = document.getElementById('modal-authors');
    const modalDetails = document.getElementById('modal-details');
    const modalLink = document.getElementById('modal-link');
    const modalClose = modal.querySelector('.modal-close');

    function openModal(publicationId) {
        const data = publicationData[publicationId];
        if (!data) return;

        modalTitle.innerHTML = data.title;
        modalAuthors.innerHTML = data.authors;
        modalDetails.innerHTML = data.details;
        modalLink.href = data.link;
        modalLink.textContent = data.linkText;
        modalLink.setAttribute('aria-label', `Link to ${data.title}`);

        modalOverlay.classList.add('active');
        modal.classList.add('active');

        // Focus on modal for accessibility
        modal.focus();
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        modal.classList.remove('active');

        // Return focus to the triggering element
        if (document.activeElement === modal || modal.contains(document.activeElement)) {
            const publicationId = modalTitle.innerHTML.replace(/[^a-zA-Z0-9]/g, '');
            const triggeringElement = document.querySelector(`.publication-item[data-publication-id="${publicationId}"]`);
            if (triggeringElement) triggeringElement.focus();
        }
    }

    document.querySelectorAll('.publication-item').forEach(item => {
        item.addEventListener('click', () => {
            const publicationId = item.getAttribute('data-publication-id');
            openModal(publicationId);
        });

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Space') {
                e.preventDefault();
                const publicationId = item.getAttribute('data-publication-id');
                openModal(publicationId);
            }
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Trap focus within modal
    const focusableElements = modal.querySelectorAll('button, a[href]');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });

    // Scroll-based visibility
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - viewportHeight;

    function updateSectionVisibility() {
        console.log('updateSectionVisibility called');

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

        console.log('Scroll Y:', scrollY, 'Home Visible:', document.querySelector('#home').classList.contains('visible'));

        const scrollProgress = Math.max(0, Math.min(1, scrollY / (documentHeight * 0.5)));
        const easedProgress = 1 - Math.pow(1 - scrollProgress, 2);
        updateScene(scrollProgress, easedProgress);

        // Animate cards in Education section
        const educationSection = document.querySelector('#education');
        if (educationSection.classList.contains('visible')) {
            const educationCards = educationSection.querySelectorAll('.education-card');
            educationCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    card.classList.add('visible');
                } else {
                    card.classList.remove('visible');
                }
            });
        }

        // Animate timeline items in Experience section
        const experienceSection = document.querySelector('#experience');
        if (experienceSection.classList.contains('visible')) {
            const timelineItems = experienceSection.querySelectorAll('.timeline-item');
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