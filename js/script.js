document.addEventListener('DOMContentLoaded', function () {

    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');
    var navOverlay = document.getElementById('nav-overlay');
    var navLinks = document.querySelectorAll('.nav-link');
    var backToTopBtn = document.getElementById('back-to-top');
    var contactForm = document.getElementById('contact-form');

    function handleNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function updateActiveLink() {
        var scrollPos = window.scrollY + 120;
        var sections = document.querySelectorAll('section[id]');

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    function openMenu() {
        navMenu.classList.add('open');
        navToggle.classList.add('active');
        navOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        if (navMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    navToggle.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', closeMenu);

    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (navMenu.classList.contains('open')) {
                closeMenu();
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            var offset = navbar.offsetHeight + 16;
            var targetPos = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });
        });
    });

    function handleBackToTop() {
        if (window.scrollY > 600) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
    });

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var current = 0;
        var increment = target / 80;
        var timer = setInterval(function () {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 30);
    }

    var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var counters = entry.target.querySelectorAll('.stats-number');
                counters.forEach(function (counter) {
                    animateCounter(counter);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    var statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsObserver.observe(statsGrid);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(input, message) {
        input.classList.add('error');
        var errorEl = input.parentNode.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.classList.add('form-error');
            input.parentNode.appendChild(errorEl);
        }
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }

    function clearError(input) {
        input.classList.remove('error');
        var errorEl = input.parentNode.querySelector('.form-error');
        if (errorEl) {
            errorEl.classList.remove('visible');
        }
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var isValid = true;

            var nameInput = contactForm.querySelector('#name');
            var emailInput = contactForm.querySelector('#email');
            var subjectInput = contactForm.querySelector('#subject');
            var messageInput = contactForm.querySelector('#message');

            [nameInput, emailInput, subjectInput, messageInput].forEach(clearError);

            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            }

            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your email');
                isValid = false;
            } else if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email');
                isValid = false;
            }

            if (!subjectInput.value.trim()) {
                showError(subjectInput, 'Please enter a subject');
                isValid = false;
            }

            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            }

            if (isValid) {
                var btn = contactForm.querySelector('button[type="submit"]');
                var originalText = btn.textContent;
                btn.textContent = 'Sending...';
                btn.disabled = true;

                setTimeout(function () {
                    btn.textContent = 'Message Sent!';
                    btn.style.background = '#16a34a';

                    var successMsg = document.createElement('div');
                    successMsg.classList.add('form-success', 'visible');
                    successMsg.textContent = 'Thank you! Your message has been sent. We\'ll get back to you within 24 hours.';
                    contactForm.insertBefore(successMsg, contactForm.firstChild);

                    contactForm.reset();

                    setTimeout(function () {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                        if (successMsg.parentNode) {
                            successMsg.remove();
                        }
                    }, 4000);
                }, 1200);
            }
        });

        contactForm.querySelectorAll('.form-input').forEach(function (input) {
            input.addEventListener('input', function () {
                clearError(input);
            });
        });
    }

    window.addEventListener('scroll', function () {
        handleNavbar();
        handleBackToTop();
        updateActiveLink();
    });

    handleNavbar();
    handleBackToTop();

});
