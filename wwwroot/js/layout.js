/**
 * curosoftai Website Structural Interactions
 * Handcrafted minimalist vanilla javascript architecture.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initPageProgressBar();
});

/**
 * Manages header background shifts and height reductions on page scrolling
 */
function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const scrollThreshold = 20;

    const checkScroll = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // Run on init and bound to scroll event
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
}

/**
 * Seamlessly toggles mobile responsive sliding drawer navigation menu
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const siteNav = document.getElementById('siteNav');

    if (!menuToggle || !siteNav) return;

    const toggleMenu = (e) => {
        e.stopPropagation();
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

        menuToggle.setAttribute('aria-expanded', !isExpanded);
        menuToggle.classList.toggle('is-active');
        siteNav.classList.toggle('is-active');

        // Prevent background scrolling when menu drawer is visible
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Dynamic clean up: close menu when clicking outside the navigation box
    document.addEventListener('click', (e) => {
        if (siteNav.classList.contains('is-active') && !siteNav.contains(e.target) && e.target !== menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('is-active');
            siteNav.classList.remove('is-active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Minimal top loading simulation to offer soft native transition feedback
 */
function initPageProgressBar() {
    const progressBar = document.getElementById('pageProgress');
    if (!progressBar) return;

    // Simulate complete progression during page render stages
    progressBar.style.width = '30%';

    window.addEventListener('load', () => {
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBar.style.opacity = '0';
            setTimeout(() => {
                progressBar.style.width = '0';
                progressBar.style.opacity = '1';
            }, 300);
        }, 200);
    });
}