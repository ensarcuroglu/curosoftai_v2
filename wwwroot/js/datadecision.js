document.addEventListener("DOMContentLoaded", () => {
    // 1. GSAP ScrollTrigger Kaydı
    gsap.registerPlugin(ScrollTrigger);

    // 2. Global Fade-Up Animasyonları
    const fadeElements = gsap.utils.toArray('.fade-up');

    fadeElements.forEach(element => {
        gsap.set(element, { autoAlpha: 0, y: 30 });

        gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    });

    // 3. Data Dashboard (Bar Chart) Animasyonları
    const dashboardSection = document.querySelector('.data-cta-wrapper');

    if (dashboardSection) {
        ScrollTrigger.create({
            trigger: dashboardSection,
            start: "top 75%",
            onEnter: () => {
                // Bar grafiklerinin yükseliş animasyonu
                gsap.to(".value-1", { height: "40%", duration: 1, ease: "power3.out" });
                gsap.to(".value-2", { height: "65%", duration: 1, delay: 0.1, ease: "power3.out" });
                gsap.to(".value-3", { height: "90%", duration: 1, delay: 0.2, ease: "power3.out" });
                gsap.to(".value-4", { height: "50%", duration: 1, delay: 0.3, ease: "power3.out" });
                gsap.to(".value-5", { height: "75%", duration: 1, delay: 0.4, ease: "power3.out" });
                gsap.to(".value-6", { height: "85%", duration: 1, delay: 0.5, ease: "power3.out" });

                // Ara sıra aktif barın nabız gibi atması (Simüle edilmiş veri işleme)
                gsap.to(".active-bar .bar", {
                    opacity: 0.8,
                    yoyo: true,
                    repeat: -1,
                    duration: 1.5,
                    ease: "sine.inOut"
                });
            }
        });

        // 4. Parallax Effect for Data Dashboard
        const dashUI = document.querySelector('.glass-dashboard');

        dashboardSection.addEventListener('mousemove', (e) => {
            const rect = dashboardSection.getBoundingClientRect();

            // Merkez noktasını bul
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Mouse'un merkeze olan uzaklığına göre dönüş açısı hesapla (max 8 derece)
            const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
            const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 8;

            gsap.to(dashUI, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        dashboardSection.addEventListener('mouseleave', () => {
            // Mouse çıkınca varsayılan izometrik duruşa geri dön
            gsap.to(dashUI, {
                rotateX: 4,
                rotateY: -6,
                duration: 1,
                ease: "power3.out"
            });
        });
    }
});