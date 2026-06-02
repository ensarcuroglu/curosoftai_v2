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

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const scrollThreshold = 16;
    let ticking = false;

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

        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', toggleMenu);

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
 * Zarif Alt Çizgi Konsepti:
 * Linkin padding alanını dışarıda bırakarak sadece metnin genişliğine göre
 * alt çizgi oluşturur ve yatay eksende (X ekseni) yumuşakça kaydırır.
 */
function initNavIndicator() {
    const navList = document.getElementById('navList');
    const indicator = document.getElementById('navIndicator');
    if (!navList || !indicator) return;

    const links = Array.from(navList.querySelectorAll('.nav-link'));
    if (!links.length) return;

    links.forEach((link) => {
        link.addEventListener('mouseenter', () => {
            const listRect = navList.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();

            // CSS'teki yatay padding değerimiz (her bir yan için 16px)
            const paddingX = 16;

            // Çizgi genişliği sadece linkin iç metni (text) kadar olsun
            const textWidth = linkRect.width - (paddingX * 2);

            indicator.style.width = textWidth + 'px';

            // X ekseninde, padding kadar içeriden başlatıyoruz
            indicator.style.transform = `translateX(${linkRect.left - listRect.left + paddingX}px)`;
            indicator.style.opacity = '1';
        });
    });

    navList.addEventListener('mouseleave', () => {
        indicator.style.opacity = '0';
    });
}

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
        clearProps: 'transform'
    });
}

function initPageProgressBar() {
    const progressBar = document.getElementById('pageProgress');
    if (!progressBar) return;

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