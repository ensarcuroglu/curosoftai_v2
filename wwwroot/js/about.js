/**
 * curosoftai - About Page Storytelling Interactions
 * Requires GSAP & ScrollTrigger (loaded in _Layout.cshtml)
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        // GSAP yüklenmediyse fallback: tüm animasyon hedeflerini görünür yap
        showFallback();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (reduceMotion) {
        showFallback();
        return;
    }

    initHeroAnimation();
    initTextReveal();

    // Mobilde yatay pin animasyonu hem performans hem UX açısından kötü;
    // CSS zaten kartları dikey listeye düşürüyor, JS de bu modda devreye girmiyor.
    if (!isMobile) {
        initHorizontalScroll();
    }
});

function showFallback() {
    document.querySelectorAll('.story-text .word').forEach(el => { el.style.opacity = 1; });
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
    });
    document.querySelectorAll('[data-gsap="title-line"]').forEach(el => {
        el.style.opacity = 1;
    });
}

/**
 * 1. Hero Giriş Animasyonu
 */
function initHeroAnimation() {
    const titles = document.querySelectorAll('[data-gsap="title-line"]');

    titles.forEach(title => {
        const text = title.innerHTML;
        title.innerHTML = `<span style="display:inline-block; transform:translateY(110%); will-change:transform;">${text}</span>`;
    });

    const titleInners = document.querySelectorAll('[data-gsap="title-line"] > span');
    const fadeElements = document.querySelectorAll('[data-gsap="fade-up"]');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(titleInners, {
        y: '0%',
        duration: 1.2,
        stagger: 0.15,
        delay: 0.2
    }).fromTo(fadeElements,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2 },
        "-=0.6"
    );
}

/**
 * 2. Metin Aydınlanma (Scrub Text Reveal) Animasyonu
 */
function initTextReveal() {
    const revealTexts = document.querySelectorAll('[data-text-reveal]');

    revealTexts.forEach(text => {
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
                start: "top 80%",
                end: "top 30%",
                scrub: 1,
            }
        });
    });
}

/**
 * 3. Yatay Kaydırma (Horizontal Scroll) Animasyonu
 * Pin başlangıç noktası, sabit header kadar aşağıdan başlar — böylece
 * "Stüdyo Kültürü / Neye İnanıyoruz?" başlığı header'ın altında kaybolmaz.
 */
function initHorizontalScroll() {
    const pinSection = document.getElementById('manifesto-pin');
    const pinWrap = document.getElementById('manifesto-wrap');

    if (!pinSection || !pinWrap) return;

    const getHeaderOffset = () => {
        const styles = getComputedStyle(document.documentElement);
        const scrolled = parseInt(styles.getPropertyValue('--header-height-scroll')) || 65;
        return scrolled;
    };

    function getScrollAmount() {
        const wrapWidth = pinWrap.scrollWidth;
        // Tüm kartlar son scroll'da tamamen görünür olsun + 5vw padding payı
        return -(wrapWidth - window.innerWidth + (window.innerWidth * 0.05));
    }

    const tween = gsap.to(pinWrap, {
        x: getScrollAmount,
        ease: "none"
    });

    ScrollTrigger.create({
        trigger: pinSection,
        start: () => `top ${getHeaderOffset()}px`,
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        pinSpacing: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
    });
}
