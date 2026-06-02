document.addEventListener("DOMContentLoaded", () => {
    // 1. GSAP ScrollTrigger Kaydý (Layout'ta yüklü olduðu varsayýlýr)
    gsap.registerPlugin(ScrollTrigger);

    // 2. Sayfa içi Fade-Up Elementlerinin Animasyonu
    const fadeElements = gsap.utils.toArray('.fade-up');

    fadeElements.forEach(element => {
        // Elementi görünür yapýp baþlangýç durumunu ayarlýyoruz
        gsap.set(element, { autoAlpha: 0, y: 40 });

        gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // Ekranýn %85'ine geldiðinde baþla
                toggleActions: "play none none none"
            }
        });
    });

    // 3. CTA Bölümündeki Tarayýcý Ýçin Mouse Parallax Efekti
    const ctaWrapper = document.querySelector('.web-cta-wrapper');
    const browser = document.querySelector('.glass-browser');

    if (ctaWrapper && browser) {
        ctaWrapper.addEventListener('mousemove', (e) => {
            const rect = ctaWrapper.getBoundingClientRect();
            // Mouse pozisyonunu box merkezine göre hesapla
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Hassasiyet ayarý (ne kadar büyükse o kadar az döner)
            const moveX = (x - centerX) / 40;
            const moveY = (y - centerY) / 40;

            // X ekseninde hareket Y rotasyonunu, Y ekseninde hareket X rotasyonunu etkiler
            browser.style.transform = `rotateY(${moveX}deg) rotateX(${-moveY}deg) scale(1.02)`;
        });

        // Mouse çýktýðýnda baþlangýç konumuna (hafif eðik yapýya) geri dön
        ctaWrapper.addEventListener('mouseleave', () => {
            browser.style.transform = `rotateY(-5deg) rotateX(5deg) scale(1)`;
        });
    }
});