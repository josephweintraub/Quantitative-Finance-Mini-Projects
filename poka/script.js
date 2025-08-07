// DOM elements
const forms = document.querySelectorAll('.email-capture-form');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initFormHandling();
    initMobileMenu();
    initNavbarScroll();
    initSmoothScrolling();
    initIntersectionObserver();
    initFAQ();
});

// Scroll animations
function initScrollAnimations() {
    // Add scroll animation classes to elements
    const animateElements = [
        '.feature-card',
        '.section-headline',
        '.host-container',
        '.footer-quote'
    ];

    animateElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('scroll-animate');
        });
    });
}

// Intersection Observer for scroll animations
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add staggered animation for feature cards
                if (entry.target.classList.contains('feature-card')) {
                    const cards = document.querySelectorAll('.feature-card');
                    const index = Array.from(cards).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);

    // Observe all scroll-animate elements
    const animateElements = document.querySelectorAll('.scroll-animate');
    animateElements.forEach(el => observer.observe(el));
}

// Form handling with validation and submission
function initFormHandling() {
    forms.forEach(form => {
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('.cta-button');
        const originalButtonText = button.textContent;

        // Real-time email validation
        input.addEventListener('input', function() {
            const email = this.value.trim();
            
            if (email === '') {
                this.classList.remove('valid', 'invalid');
                return;
            }

            if (emailRegex.test(email)) {
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                this.classList.add('invalid');
                this.classList.remove('valid');
            }
        });

        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = input.value.trim();
            
            if (!emailRegex.test(email)) {
                showFormError(form, 'Please enter a valid email address');
                return;
            }

            // Simulate form submission
            submitEmail(form, email, button, originalButtonText);
        });
    });
}

// Email submission with Firebase
async function submitEmail(form, email, button, originalButtonText) {
    // Show loading state
    button.classList.add('loading');
    button.textContent = 'Submitting...';
    button.disabled = true;

    try {
        // Determine the form type
        const formType = form.id === 'heroEmailForm' ? 'player' : 'host';
        
        // Check if Firebase is available
        if (typeof window.db === 'undefined') {
            console.warn('Firebase not configured. Simulating email submission...');
            await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
            // Save to Firebase Firestore
            const docRef = await window.addDoc(window.collection(window.db, 'waitlist'), {
                email: email,
                type: formType,
                timestamp: window.serverTimestamp(),
                source: 'landing-page',
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct'
            });
            
            console.log('Email saved with ID: ', docRef.id);
            
            // Track analytics (if you add Google Analytics later)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'waitlist_signup', {
                    email_type: formType,
                    method: 'email_form'
                });
            }
        }
        
        // Success state
        showFormSuccess(form, 'Thanks! You\'re on the waitlist! 🎉');
        button.textContent = '✓ Added to Waitlist';
        
        // Update the stats numbers with a slight animation
        updateWaitlistStats(formType);
        
        // Reset after delay
        setTimeout(() => {
            form.reset();
            button.textContent = originalButtonText;
            button.disabled = false;
            button.classList.remove('loading');
            form.classList.remove('form-success');
        }, 4000);

    } catch (error) {
        console.error('Error saving email:', error);
        
        // Error state
        showFormError(form, 'Something went wrong. Please try again.');
        button.textContent = originalButtonText;
        button.disabled = false;
        button.classList.remove('loading');
        
        // Track error (if analytics available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'waitlist_error', {
                error_message: error.message
            });
        }
    }
}

// Show form success state
function showFormSuccess(form, message) {
    form.classList.add('form-success');
    const disclaimer = form.querySelector('.form-disclaimer');
    const originalText = disclaimer.textContent;
    disclaimer.textContent = message;
    disclaimer.style.color = 'var(--accent-green)';
    
    setTimeout(() => {
        disclaimer.textContent = originalText;
        disclaimer.style.color = '';
    }, 3000);
}

// Show form error state
function showFormError(form, message) {
    const disclaimer = form.querySelector('.form-disclaimer');
    const originalText = disclaimer.textContent;
    disclaimer.textContent = message;
    disclaimer.style.color = '#ff6b6b';
    
    // Add shake animation
    form.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        disclaimer.textContent = originalText;
        disclaimer.style.color = '';
        form.style.animation = '';
    }, 3000);
}

// Mobile menu functionality
function initMobileMenu() {
    // Select mobile menu elements inside the function to ensure DOM is loaded
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenuClose = document.getElementById('mobile-close-btn');
    const hamburgerToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!hamburgerToggle || !mobileSidebar || !mobileOverlay) {
        console.warn('Mobile menu elements not found');
        return;
    }

    console.log('🔧 Setting up mobile menu with isolated event handlers...');

    // CLOSE BUTTON using event delegation (with CSS z-index fixes)
    document.addEventListener('click', function(e) {
        // Check if the clicked element is the close button or inside it
        if (e.target.closest('#mobile-close-btn')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Close button clicked - CLOSING sidebar');
            closeMobileSidebar();
        }
    });
    
    console.log('✅ Close button ready with z-index fixes');

    // Set up hamburger with delay to avoid conflicts
    setTimeout(() => {
                 // HAMBURGER MENU - Toggle sidebar with guard logic
         hamburgerToggle.addEventListener('click', function(e) {
             console.log('🔍 Hamburger event fired - target:', e.target);
             
             e.preventDefault();
             e.stopPropagation();
             
             // Guard: if sidebar is already open, close it instead of re-opening
             if (mobileSidebar.classList.contains('active')) {
                 console.log('🔄 Sidebar is open - CLOSING instead of opening');
                 closeMobileSidebar();
             } else {
                 console.log('🍔 Hamburger clicked - OPENING sidebar');
                 openMobileSidebar();
             }
         });
        
        console.log('✅ Hamburger menu ready');
    }, 100);

    // Close sidebar when clicking overlay
    mobileOverlay.addEventListener('click', function(e) {
        if (e.target === mobileOverlay) {
            console.log('🖱️ Overlay clicked - CLOSING sidebar');
            closeMobileSidebar();
        }
    });

    // Close sidebar when clicking nav links
    const mobileNavLinks = mobileSidebar.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('🔗 Nav link clicked - CLOSING sidebar');
            closeMobileSidebar();
        });
    });

    // Close sidebar with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileSidebar.classList.contains('active')) {
            console.log('⌨️ Escape key pressed - CLOSING sidebar');
            closeMobileSidebar();
        }
    });
    
    // Store references for use in other functions
    window.mobileSidebar = mobileSidebar;
    window.mobileOverlay = mobileOverlay;
    window.hamburgerToggle = hamburgerToggle;
}

function openMobileSidebar() {
    const mobileSidebar = window.mobileSidebar || document.querySelector('.mobile-sidebar');
    const mobileOverlay = window.mobileOverlay || document.querySelector('.mobile-menu-overlay');
    const hamburgerToggle = window.hamburgerToggle || document.querySelector('.mobile-menu-toggle');
    
    if (mobileSidebar && mobileOverlay && hamburgerToggle) {
        mobileSidebar.classList.add('active');
        mobileOverlay.classList.add('active');
        hamburgerToggle.classList.add('active');
        document.body.classList.add('sidebar-open'); // Add blur class
        document.body.style.overflow = 'hidden';
        
        // Animate hamburger to X
        const spans = hamburgerToggle.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        console.error('❌ Could not find required elements for opening sidebar');
    }
}

function closeMobileSidebar() {
    const mobileSidebar = window.mobileSidebar || document.querySelector('.mobile-sidebar');
    const mobileOverlay = window.mobileOverlay || document.querySelector('.mobile-menu-overlay');
    const hamburgerToggle = window.hamburgerToggle || document.querySelector('.mobile-menu-toggle');
    
    if (mobileSidebar && mobileOverlay && hamburgerToggle) {
        mobileSidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
        hamburgerToggle.classList.remove('active');
        document.body.classList.remove('sidebar-open'); // Remove blur class
        document.body.style.overflow = '';
        
        // Reset hamburger
        const spans = hamburgerToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    } else {
        console.error('❌ Could not find required elements for closing sidebar');
    }
}

// Navbar scroll effect
function initNavbarScroll() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScroll > lastScrollTop && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinkItems = document.querySelectorAll('a[href^="#"]');
    
    navLinkItems.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Poker chip floating animation
function initPokerChipAnimations() {
    const features = document.querySelector('.features');
    
    if (!features) return;
    
    // Create floating poker chips
    for (let i = 0; i < 5; i++) {
        createFloatingChip(features, i);
    }
}

function createFloatingChip(container, index) {
    const chip = document.createElement('div');
    chip.className = 'floating-chip';
    chip.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#2d5a2d" stroke="#4a8c4a" stroke-width="2" opacity="0.3"/>
            <circle cx="20" cy="20" r="12" fill="none" stroke="#4a8c4a" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
        </svg>
    `;
    
    // Random positioning
    chip.style.position = 'absolute';
    chip.style.left = Math.random() * 100 + '%';
    chip.style.top = Math.random() * 100 + '%';
    chip.style.animationDelay = index * 0.5 + 's';
    chip.style.animationDuration = (3 + Math.random() * 2) + 's';
    chip.style.opacity = '0.2';
    chip.style.pointerEvents = 'none';
    chip.style.animation = 'float 4s ease-in-out infinite';
    
    container.appendChild(chip);
}

// Add CSS for form states
const additionalStyles = `
    .form-group input.valid {
        border-color: var(--accent-green);
        background: rgba(45, 90, 45, 0.05);
    }
    
    .form-group input.invalid {
        border-color: #ff6b6b;
        background: rgba(255, 107, 107, 0.05);
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .navbar.scrolled {
        background: rgba(10, 10, 10, 0.98);
        backdrop-filter: blur(20px);
    }
    
    .floating-chip {
        z-index: 1;
    }
    
    @media (max-width: 767px) {
        .nav-links.active {
            display: flex;
            position: fixed;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 2rem;
            border-top: 1px solid var(--border-color);
            animation: slideDown 0.3s ease-out forwards;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .nav-links.active .nav-link {
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .nav-links.active .nav-link:last-child {
            border-bottom: none;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize poker chip animations after page load
window.addEventListener('load', function() {
    initPokerChipAnimations();
    
    // Add entrance animations to hero elements
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero-text > *');
        heroElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.2}s`;
            el.classList.add('animate-fade-in');
        });
    }, 500);
});

// Performance optimization: throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add some easter eggs for engagement
let konami = [];
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

document.addEventListener('keydown', function(e) {
    konami.push(e.keyCode);
    konami = konami.slice(-10);
    
    if (konami.join(',') === konamiCode.join(',')) {
        triggerEasterEgg();
    }
});

function triggerEasterEgg() {
    // Create poker cards rain effect
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createFallingCard();
        }, i * 100);
    }
}

function createFallingCard() {
    const card = document.createElement('div');
    card.style.position = 'fixed';
    card.style.left = Math.random() * 100 + 'vw';
    card.style.top = '-50px';
    card.style.fontSize = '20px';
    card.style.zIndex = '9999';
    card.style.pointerEvents = 'none';
    card.textContent = ['♠️', '♥️', '♦️', '♣️'][Math.floor(Math.random() * 4)];
    card.style.animation = 'fall 3s linear forwards';
    
    document.body.appendChild(card);
    
    setTimeout(() => {
        card.remove();
    }, 3000);
}

// Add fall animation
const fallKeyframes = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;

styleSheet.textContent += fallKeyframes;

// FAQ functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// Update waitlist stats with animation
function updateWaitlistStats(formType) {
    const statsNumbers = document.querySelectorAll('.stat-number');
    
    statsNumbers.forEach(statElement => {
        // Add a pulse animation
        statElement.style.transform = 'scale(1.1)';
        statElement.style.transition = 'transform 0.3s ease-out';
        
        setTimeout(() => {
            statElement.style.transform = 'scale(1)';
        }, 300);
    });
    
    // Optionally increment the displayed numbers
    if (formType === 'player') {
        const playersElement = statsNumbers[0];
        if (playersElement) {
            const currentNumber = parseInt(playersElement.textContent.replace(/[^\d]/g, ''));
            playersElement.textContent = (currentNumber + 1).toLocaleString();
        }
    } else if (formType === 'host') {
        const hostsElement = statsNumbers[2];
        if (hostsElement) {
            const currentNumber = parseInt(hostsElement.textContent.replace(/[^\d]/g, ''));
            hostsElement.textContent = (currentNumber + 1) + '+';
        }
    }
}

// Enhanced email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Basic format check
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    // Check for common typos
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const domain = email.split('@')[1];
    
    // You could add more sophisticated validation here
    return { isValid: true, message: '' };
}

// Check if email already exists (optional feature)
async function checkEmailExists(email) {
    if (typeof window.db === 'undefined') {
        return false;
    }
    
    try {
        // This would require additional Firebase rules and queries
        // For now, we'll skip duplicate checking to keep it simple
        return false;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

// Export emails function (for admin use)
function downloadWaitlistEmails() {
    if (typeof window.db === 'undefined') {
        alert('Firebase not configured');
        return;
    }
    
    // This would be an admin-only function
    console.log('Email export feature - implement with proper authentication');
}