/**
 * curosoftai - About Page Storytelling Interactions
 * Requires GSAP & ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
    // ScrollTrigger'ı kaydet
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion) {
        initHeroAnimation();
        initTextReveal();
        initHorizontalScroll();
    } else {
        // Hareketi azaltmayı seçen kullanıcılar için öğeleri görünür yap
        document.querySelectorAll('.story-text').forEach(el => el.style.opacity = 1);
        document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });
    }
});

/**
 * 1. Hero Giriş Animasyonu
 */
function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Satırları maske içinden çıkarma
    const titles = document.querySelectorAll('[data-gsap="title-line"]');

    // Geçici olarak maskelemek için içeriği sarıyoruz
    titles.forEach(title => {
        const text = title.innerHTML;
        title.innerHTML = `<span style="display:inline-block; transform:translateY(110%); will-change:transform;">${text}</span>`;
    });

    const titleInners = document.querySelectorAll('[data-gsap="title-line"] > span');
    const fadeElements = document.querySelectorAll('[data-gsap="fade-up"]');

    tl.to(titleInners, {
        y: '0%',
        duration: 1.2,
        stagger: 0.15,
        delay: 0.2
    })
        .fromTo(fadeElements,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.2 },
            "-=0.6"
        );
}

/**
 * 2. Metin Aydınlanma (Scrub Text Reveal) Animasyonu
 * Kullanıcı sayfayı kaydırdıkça metinler kelime kelime belirginleşir.
 */
function initTextReveal() {
    const revealTexts = document.querySelectorAll('[data-text-reveal]');

    revealTexts.forEach(text => {
        // Metni kelimelere böl (HTML etiketlerini bozmadan basitçe boşluklardan bölme)
        // Eğer içinde <em> gibi etiketler varsa regex ile korunabilir ama tasarımda saf metin veya manuel etiketleme kullandık.
        const content = text.innerHTML;
        const words = content.split(' ').map(word => {
            if (word.trim() === '') return '';
            return `<span class="word">${word}</span>`;
        }).join(' ');

        text.innerHTML = words;

        const wordElements = text.querySelectorAll('.word');

        gsap.to(wordElements, {
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
                trigger: text,
                start: "top 85%", // Metin ekranın %85'ine geldiğinde başla
                end: "top 35%",   // Metin ekranın %35'ine geldiğinde bitir
                scrub: 1,         // Kaydırma hızına yumuşak (1sn) bir şekilde bağla
            }
        });
    });
}

/**
 * 3. Yatay Kaydırma (Horizontal Scroll) Animasyonu
 * Manifesto bölümü ekranda sabitlenir ve kartlar yatayda kayar.
 */
function initHorizontalScroll() {
    const pinSection = document.getElementById('manifesto-pin');
    const pinWrap = document.getElementById('manifesto-wrap');

    if (!pinSection || !pinWrap) return;

    // Kapsayıcı ne kadar kaymalı? (İçeriğin genişliği - ekranın genişliği kadar)
    function getScrollAmount() {
        let wrapWidth = pinWrap.scrollWidth;
        return -(wrapWidth - window.innerWidth + 100); // 100px padding payı
    }

    const tween = gsap.to(pinWrap, {
        x: getScrollAmount,
        ease: "none"
    });

    ScrollTrigger.create({
        trigger: pinSection,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`, // Animasyon mesafesi kadar scroll uzunluğu yarat
        pin: true,
        animation: tween,
        scrub: 1, // Smooth scrub
        invalidateOnRefresh: true // Ekran boyutu değiştiğinde değerleri yeniden hesapla
    });
}