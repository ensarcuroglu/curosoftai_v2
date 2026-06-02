/**
   Curosoftai v2 - Brand & Web Experience Engine
   Concept: Soft Editorial Minimalism
   Handles elegant micro-reveals and liquid custom cursor tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
    // GSAP Core & ScrollTrigger Verification
    gsap.registerPlugin(ScrollTrigger);

    /* ----------------------------------------------------
       1. SMOOTH LIQUID CUSTOM CURSOR
    ---------------------------------------------------- */
    const cursor = document.querySelector('.studio-cursor');

    if (cursor && window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });
        });

        // Expand cursor smoothly on elite interaction points
        const clickables = document.querySelectorAll('a, button, .studio-card, .timeline-row');
        clickables.forEach(target => {
            target.addEventListener('mouseenter', () => cursor.classList.add('is-hovered'));
            target.addEventListener('mouseleave', () => cursor.classList.remove('is-hovered'));
        });
    }

    /* ----------------------------------------------------
       2. HERO EDITORIAL ENTRANCE (SILENT SEQUENCING)
    ---------------------------------------------------- */
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl.to(".studio-tag", { y: 0, opacity: 1, duration: 1.2, delay: 0.3 })
        .to(".studio-hero__title", { y: 0, opacity: 1, duration: 1.2 }, "-=0.9")
        .to(".studio-hero__lead", { y: 0, opacity: 1, duration: 1.0 }, "-=0.9")
        .to(".studio-hero__actions", { y: 0, opacity: 1, duration: 0.8 }, "-=0.8");

    /* ----------------------------------------------------
       3. LINEAR SCROLL REVEALS (JOURNEY & BENTO CARDS)
    ---------------------------------------------------- */
    // Timeline rows step-by-step reveal
    gsap.utils.toArray('.timeline-row').forEach((row) => {
        gsap.to(row, {
            scrollTrigger: {
                trigger: row,
                start: "top 85%"
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Bento grids stagger card reveal
    gsap.utils.toArray('.studio-card').forEach((card, index) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 88%"
            },
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: index * 0.05
        });
    });
});