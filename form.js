window.formModule = window.formModule || {};

function initForm() {
    const contactForm = document.getElementById('contact-form');
    const submitButton = contactForm.querySelector('.submit-button');
    let lastSubmissionTime = 0;
    const submissionCooldown = 30000; // 30 seconds cooldown
    const minimumInteractionTime = 3000; // 3 seconds minimum interaction time
    let formLoadTime = Date.now();

    // Helper function to log events to Google Analytics
    function logEvent(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        } else {
            console.log(`GA Event: ${category} - ${action} - ${label}`);
        }
    }

    // Ensure reCAPTCHA is loaded before allowing form submission
    function waitForRecaptcha() {
        return new Promise((resolve, reject) => {
            const checkRecaptcha = setInterval(() => {
                if (typeof grecaptcha !== 'undefined' && grecaptcha) {
                    clearInterval(checkRecaptcha);
                    resolve();
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkRecaptcha);
                reject(new Error('reCAPTCHA failed to load.'));
            }, 10000);
        });
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default submission until validated

        const currentTime = Date.now();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Check minimum interaction time
        if (currentTime - formLoadTime < minimumInteractionTime) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'Please wait a moment before submitting the form.';
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
            logEvent('Form', 'Rapid Submission', 'Submitted too quickly');
            return;
        }

        // Check rate limiting
        if (currentTime - lastSubmissionTime < submissionCooldown) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'Please wait a moment before submitting again.';
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
            logEvent('Form', 'Rate Limit Exceeded', 'Too many submissions');
            return;
        }

        // Check honeypot field
        const honeypot = document.getElementById('honeypot').value;
        if (honeypot) {
            console.warn('Honeypot field filled. Possible bot activity.');
            logEvent('Form', 'Honeypot Triggered', 'Bot detected');
            return; // Silently fail for bots
        }

        // Existing validation for email, name, and message
        if (!emailRegex.test(email)) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'Please enter a valid email address.';
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
            logEvent('Form', 'Validation Failed', 'Invalid email');
            return;
        }

        if (!name.trim() || !message.trim()) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'All fields are required.';
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
            logEvent('Form', 'Validation Failed', 'Missing required fields');
            return;
        }

        try {
            // Wait for reCAPTCHA to be ready
            await waitForRecaptcha();

            // Check if reCAPTCHA is filled
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-message error';
                errorMessage.textContent = 'Please complete the reCAPTCHA to submit the form.';
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
                logEvent('Form', 'reCAPTCHA Failed', 'User did not complete reCAPTCHA');
                return;
            }

            lastSubmissionTime = currentTime;
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
                    logEvent('Form', 'Submission Success', 'Form submitted successfully');
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
                logEvent('Form', 'Submission Failed', error.message);
            });
        } catch (error) {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            const errorMessage = document.createElement('div');
            errorMessage.className = 'form-message error';
            errorMessage.textContent = 'reCAPTCHA failed to load. Please refresh the page and try again.';
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
            logEvent('Form', 'reCAPTCHA Load Error', error.message);
        }
    });
}

window.formModule = {
    initForm
};