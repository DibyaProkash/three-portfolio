window.sliderModule = window.sliderModule || {};

let sliderContainer;
let currentSlide = 0;
let isPlaying = true;
let slideInterval;
let previousSlide = 0;
let visibleProjects = [];
let activeExpandedCard = null;
let popup = null;

function fetchProjects() {
    return fetch('data/projects.json')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching projects:', error);
            return [];
        });
}

function renderProjects(projectsToRender) {
    const projectSlider = document.getElementById('project-grid');
    projectSlider.classList.add('project-slider');
    sliderContainer.innerHTML = '';
    const sliderDots = document.querySelector('.slider-dots');
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
            document.querySelector('.popup-overlay').classList.add('active');
            activeExpandedCard = card;

            const closePopupButton = popup.querySelector('.close-popup');
            closePopupButton.addEventListener('click', closePopup);
            document.querySelector('.popup-overlay').addEventListener('click', closePopup);
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

function closePopup() {
    if (popup) {
        popup.classList.remove('active');
        document.querySelector('.popup-overlay').classList.remove('active');
        document.body.removeChild(popup);
        popup = null;
        activeExpandedCard = null;
        if (isPlaying) startAutoplay();
    }
}

function initSlider() {
    sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    document.getElementById('project-grid').appendChild(sliderContainer);

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
    document.getElementById('project-grid').appendChild(sliderControls);

    const sliderDots = document.createElement('div');
    sliderDots.className = 'slider-dots';
    document.getElementById('project-grid').appendChild(sliderDots);

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

    fetchProjects().then(projects => {
        visibleProjects = projects;
        setTimeout(() => {
            const loadingSpinner = document.getElementById('project-grid').querySelector('.loading-spinner');
            if (loadingSpinner) loadingSpinner.remove();
            renderProjects(projects);
            updateSlider();
            startAutoplay();
        }, 1000);

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
    });
}

window.sliderModule = {
    initSlider,
    updateSlider
};