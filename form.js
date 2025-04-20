window.formModule = window.formModule || {};

function initForm() {
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
}

window.formModule = {
    initForm
};