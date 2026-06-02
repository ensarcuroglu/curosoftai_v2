document.addEventListener("DOMContentLoaded", () => {
    // GSAP Kaydı
    gsap.registerPlugin(ScrollTrigger);

    // 1. Fade Up Animasyonları
    const fadeElements = gsap.utils.toArray('.fade-up');
    fadeElements.forEach(element => {
        gsap.set(element, { autoAlpha: 0, y: 40 });

        gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
                trigger: element,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });

    // 2. Dashboard UI Parallax
    const ctaSection = document.querySelector('.op-cta-wrapper');
    const dashboard = document.querySelector('.data-dashboard-ui');

    if (ctaSection && dashboard) {
        ctaSection.addEventListener('mousemove', (e) => {
            const rect = ctaSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xRotation = (y - rect.height / 2) / 20;
            const yRotation = (x - rect.width / 2) / 20;

            gsap.to(dashboard, {
                rotateX: -xRotation,
                rotateY: yRotation,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        ctaSection.addEventListener('mouseleave', () => {
            gsap.to(dashboard, {
                rotateX: 10,
                rotateY: -10,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        });
    }

    // 3. Stats Sayı Saydırma (Opsiyonel Ekstra)
    const stats = document.querySelectorAll('.stat-item h4');
    stats.forEach(stat => {
        ScrollTrigger.create({
            trigger: stat,
            onEnter: () => {
                // Eğer sayılar sadece metin değilse burada countup yapılabilir
                // Şimdilik basit bir parlayıp sönme efekti:
                gsap.from(stat, {
                    scale: 1.2,
                    duration: 0.8,
                    ease: "back.out"
                });
            }
        });
    });
});