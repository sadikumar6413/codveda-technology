(() => {
    'use strict';

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.navbar__link');
    const backToTopBtn = document.getElementById('back-to-top');
    const contactForm = document.getElementById('contact-form');
    const revealElements = document.querySelectorAll('.reveal');
    const statNumbers = document.querySelectorAll('.stats__number');

    const themeToggle = document.getElementById('theme-toggle');
    const THEME_STORAGE_KEY = 'codveda-theme';
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    const getSavedTheme = () => {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (e) {
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {}
    };

    const applyTheme = (isDark) => {
        document.body.classList.toggle('dark-mode', isDark);
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(isDark));
            themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
    };

    const initTheme = () => {
        const saved = getSavedTheme();
        applyTheme(saved ? saved === 'dark' : prefersDarkScheme.matches);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = !document.body.classList.contains('dark-mode');
            applyTheme(isDark);
            saveTheme(isDark ? 'dark' : 'light');
        });
    }

    prefersDarkScheme.addEventListener('change', (e) => {
        if (!getSavedTheme()) applyTheme(e.matches);
    });

    initTheme();

    const handleNavScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    const updateActiveLink = () => {
        const scrollPos = window.scrollY + 120;

        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach((link) => {
                    link.classList.remove('navbar__link--active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('navbar__link--active');
                    }
                });
            }
        });
    };

    let overlay = null;

    const createOverlay = () => {
        overlay = document.createElement('div');
        overlay.classList.add('nav-overlay');
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMenu);
    };

    const openMenu = () => {
        navMenu.classList.add('open');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        if (!overlay) createOverlay();
        requestAnimationFrame(() => overlay.classList.add('visible'));
    };

    const closeMenu = () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                    overlay = null;
                }
            }, 300);
        }
    };

    const toggleMenu = () => {
        if (navMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    navToggle.addEventListener('click', toggleMenu);

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) closeMenu();
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const offset = navbar.offsetHeight + 16;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });
        });
    });

    const handleBackToTop = () => {
        if (window.scrollY > 600) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    };

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    revealElements.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index % 6, 5) * 0.08}s`;
        revealObserver.observe(el);
    });

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2200;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            el.textContent = Math.round(eased * target);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        };

        requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.stats__number');
                    counters.forEach((counter) => animateCounter(counter));
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.4 }
    );

    const statsSection = document.querySelector('.stats__grid');
    if (statsSection) counterObserver.observe(statsSection);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const showFieldError = (input, message) => {
        input.classList.add('error');
        let errorEl = input.parentNode.querySelector('.form__error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.classList.add('form__error');
            input.parentNode.appendChild(errorEl);
        }
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    };

    const clearFieldError = (input) => {
        input.classList.remove('error');
        const errorEl = input.parentNode.querySelector('.form__error');
        if (errorEl) errorEl.classList.remove('visible');
    };

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            const nameInput = contactForm.querySelector('#name');
            const emailInput = contactForm.querySelector('#email');
            const subjectInput = contactForm.querySelector('#subject');
            const messageInput = contactForm.querySelector('#message');

            [nameInput, emailInput, subjectInput, messageInput].forEach(clearFieldError);

            if (!nameInput.value.trim()) {
                showFieldError(nameInput, 'Please enter your name');
                isValid = false;
            }

            if (!emailInput.value.trim()) {
                showFieldError(emailInput, 'Please enter your email');
                isValid = false;
            } else if (!validateEmail(emailInput.value)) {
                showFieldError(emailInput, 'Please enter a valid email');
                isValid = false;
            }

            if (!subjectInput.value.trim()) {
                showFieldError(subjectInput, 'Please enter a subject');
                isValid = false;
            }

            if (!messageInput.value.trim()) {
                showFieldError(messageInput, 'Please enter your message');
                isValid = false;
            }

            if (isValid) {
                const btn = contactForm.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Sending...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.textContent = 'Message Sent!';
                    btn.style.background = '#16a34a';

                    const successMsg = document.createElement('div');
                    successMsg.classList.add('form__success', 'visible');
                    successMsg.textContent = 'Thank you! Your message has been sent. We\'ll get back to you within 24 hours.';
                    contactForm.insertBefore(successMsg, contactForm.firstChild);

                    contactForm.reset();

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                        if (successMsg.parentNode) successMsg.remove();
                    }, 4000);
                }, 1200);
            }
        });

        contactForm.querySelectorAll('.form__input').forEach((input) => {
            input.addEventListener('input', () => clearFieldError(input));
        });
    }

    let ticking = false;

    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleNavScroll();
                handleBackToTop();
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            closeMenu();
            navToggle.focus();
        }
    });

    handleNavScroll();
    handleBackToTop();
})();
