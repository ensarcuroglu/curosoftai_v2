document.addEventListener("DOMContentLoaded", () => {
    // 1. GSAP ScrollTrigger Kaydı
    gsap.registerPlugin(ScrollTrigger);

    // 2. Sayfa içi standart Fade-Up Animasyonları
    const fadeElements = gsap.utils.toArray('.fade-up');

    fadeElements.forEach(element => {
        gsap.set(element, { autoAlpha: 0, y: 30 });

        gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    });

    // 3. UI Sepet Ürünleri için Stagger (Ardışık) Animasyon
    const ctaSection = document.querySelector('.ecom-cta-wrapper');
    const cartItems = document.querySelectorAll('.cart-item');

    if (ctaSection && cartItems.length > 0) {
        ScrollTrigger.create({
            trigger: ctaSection,
            start: "top 75%",
            onEnter: () => {
                gsap.fromTo(cartItems,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        stagger: 0.2,
                        ease: "power2.out",
                        delay: 0.3
                    }
                );
            }
        });

        // 4. Parallax Effect for Portal UI
        const portalUI = document.querySelector('.portal-ui');

        ctaSection.addEventListener('mousemove', (e) => {
            const rect = ctaSection.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // X ekseni hareketleri Y ekseni rotasyonunu (ve tam tersini) etkiler
            const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 10;
            const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 10;

            gsap.to(portalUI, {
                rotateX: rotateX + 5,  // Base 5 derece eğimi koru
                rotateY: rotateY - 10, // Base -10 derece eğimi koru
                duration: 0.4,
                ease: "power2.out"
            });
        });

        ctaSection.addEventListener('mouseleave', () => {
            gsap.to(portalUI, {
                rotateX: 5,
                rotateY: -10,
                duration: 0.8,
                ease: "back.out(1.5)"
            });
        });
    }
});