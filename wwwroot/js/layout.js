/**
 * curosoftai Website Structural Interactions
 * Handcrafted minimalist vanilla javascript architecture.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initPageProgressBar();
    initNavIndicator();
    initHeaderEntrance();
});

/**
 * Respect the user's motion preferences for all non-essential animation
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Manages header background shifts and height reductions on page scrolling
 */
function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const scrollThreshold = 16;
    let ticking = false;

    // At the very top the header is chrome-less and merges with the page; past the
    // threshold it condenses into the floating capsule. The toggle is rAF-throttled
    // so it never runs more than once per frame, however fast the user scrolls.
    const applyState = () => {
        const scrolled = window.scrollY > scrollThreshold;
        header.classList.toggle('scrolled', scrolled);
        header.classList.toggle('is-top', !scrolled);
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(applyState);
        }
    };

    applyState();
    window.addEventListener('scroll', onScroll, { passive: true });
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
 * Glides a soft "liquid" pill behind the link under the cursor, fading it out
 * when the pointer leaves the navigation. The active link has its own
 * persistent CSS indicator, so this layer is purely a hover affordance.
 */
function initNavIndicator() {
    const navList = document.getElementById('navList');
    const indicator = document.getElementById('navIndicator');
    if (!navList || !indicator) return;

    const links = Array.from(navList.querySelectorAll('.nav-link'));
    if (!links.length) return;

    links.forEach((link) => {
        link.addEventListener('mouseenter', () => {
            // Measure against the nav-list via client rects rather than offsetLeft:
            // a transform left on an ancestor (e.g. by GSAP) would otherwise become
            // the offsetParent and collapse offsetLeft to ~0 for every link.
            const listRect = navList.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            indicator.style.width = linkRect.width + 'px';
            indicator.style.transform = `translate(${linkRect.left - listRect.left}px, -50%)`;
            indicator.style.opacity = '1';
        });
    });

    navList.addEventListener('mouseleave', () => {
        indicator.style.opacity = '0';
    });
}

/**
 * Soft staggered entrance for the logo and navigation on first paint (GSAP)
 */
function initHeaderEntrance() {
    if (prefersReducedMotion() || typeof gsap === 'undefined') return;

    const logo = document.querySelector('.site-logo');
    const actions = document.querySelector('.header-actions');
    const items = gsap.utils.toArray('.nav-item');

    gsap.from([logo, actions], { y: -14, opacity: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' });
    gsap.from(items, {
        y: -14,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
        delay: 0.1,
        // Clear the leftover identity transform so nav items don't linger as the
        // offsetParent / containing block of their links after the entrance.
        clearProps: 'transform'
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