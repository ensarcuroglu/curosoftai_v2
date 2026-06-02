/**
 * project.js — Projeler · "Quiet Editorial · Vaka Dosyaları"
 * Sakin, editöryal scroll-reveal animasyonları (GSAP + ScrollTrigger).
 *
 * Erişilebilirlik / dayanıklılık:
 *  - prefers-reduced-motion veya GSAP yoksa: hiçbir öğe gizlenmez,
 *    içerik olduğu gibi görünür (data-ready hiç eklenmez).
 *  - Görsel hover (zoom + reveal katmanı) tamamen CSS'tedir; JS gerektirmez.
 */

document.addEventListener('DOMContentLoaded', () => {
    const page = document.querySelector('.projects-page');
    if (!page) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // GSAP yok ya da reduced-motion: animasyonsuz, içerik görünür kalsın.
    if (prefersReduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    // JS aktif → reveal hedeflerini gizlemeye izin ver (CSS kuralı bunu bekler).
    page.setAttribute('data-ready', '');
    gsap.registerPlugin(ScrollTrigger);

    // Başlangıç durumunu netle (FOUC önle).
    gsap.set('[data-reveal]', { opacity: 0, y: 28 });

    // 1) Hero — staggered fade-up.
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.projects-hero__eyebrow', { y: 0, opacity: 1, duration: 0.7, delay: 0.1 })
        .to('.projects-hero__title',   { y: 0, opacity: 1, duration: 0.9 }, '-=0.45')
        .to('.projects-hero__lead',    { y: 0, opacity: 1, duration: 0.8 }, '-=0.6');

    // 2) Vaka blokları — scroll ile tek tek belirir.
    gsap.utils.toArray('.case-item').forEach((item) => {
        gsap.to(item, {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 82%',
                toggleActions: 'play none none none'
            }
        });
    });

    // 3) Alt CTA.
    gsap.to('.case-cta-wrapper', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.case-cta-section',
            start: 'top 85%',
            toggleActions: 'play none none none'
        }
    });
});
