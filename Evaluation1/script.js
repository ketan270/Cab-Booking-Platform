document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    // Add animation classes to form elements
    const animateForm = () => {
        const formElements = document.querySelectorAll('.form-header, .input-group, button, .form-footer');
        formElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
            element.style.transitionDelay = `${index * 0.1}s`;
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100);
        });
    };

    animateForm();

    if (form) {
        // Validate password on registration form
        if (form.id === 'registerForm') {
            const passwordInput = document.getElementById('password');
            
            passwordInput.addEventListener('input', () => {
                validatePassword(passwordInput);
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // For registration form, validate password before submission
            if (form.id === 'registerForm') {
                const passwordInput = document.getElementById('password');
                if (!validatePassword(passwordInput)) {
                    return;
                }
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitButton.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const result = await response.text();
                    showMessage(result, 'success');
                    
                    // Reset form on successful registration
                    if (form.id === 'registerForm') {
                        form.reset();
                    }
                    
                    setTimeout(() => {
                        window.location.href = form.id === 'registerForm' ? '/' : '/dashboard';
                    }, 2000);
                } else {
                    const error = await response.text();
                    showMessage(error, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('An error occurred. Please try again.', 'error');
            } finally {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});

function validatePassword(passwordInput) {
    const password = passwordInput.value;
    const minLength = 8;
    
    if (password.length < minLength) {
        showMessage(`Password must be at least ${minLength} characters long`, 'error');
        return false;
    }
    
    return true;
}

function showMessage(message, type) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    
    // Add icon based on message type
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    messageElement.appendChild(icon);
    
    const textNode = document.createTextNode(` ${message}`);
    messageElement.appendChild(textNode);
    
    messageElement.style.cssText = `
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    document.body.appendChild(messageElement);
    
    // Trigger animation
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }, 3000);
}