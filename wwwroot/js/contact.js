/**
 * curosoftai - Contact Page Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initContactAnimations();
    initTextareaAutoResize();
    initFormHandling();
});

/**
 * GSAP Entrance Animations
 */
function initContactAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback for missing GSAP or reduced motion
    if (typeof gsap === 'undefined' || reduceMotion) {
        document.querySelectorAll('[data-gsap]').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });
        return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Left Column Info Stagger
    const fadeElements = document.querySelectorAll('[data-gsap="fade-up"]');
    tl.fromTo(fadeElements,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15 },
        0.2
    );

    // Right Column Form Panel Reveal
    const formPanel = document.querySelector('[data-gsap="form-reveal"]');
    if (formPanel) {
        tl.fromTo(formPanel,
            { opacity: 0, x: 40, rotationY: -5 },
            { opacity: 1, x: 0, rotationY: 0, duration: 1.2, clearProps: "all" },
            0.4
        );
    }
}

/**
 * Textarea Auto-Resize based on content length
 */
function initTextareaAutoResize() {
    const textarea = document.querySelector('.form-textarea');
    if (!textarea) return;

    textarea.addEventListener('input', function () {
        this.style.height = 'auto'; // Reset height
        this.style.height = (this.scrollHeight) + 'px'; // Set to scroll height
    });
}

/**
 * Form Handling (Demo logic preventing default submission)
 */
function initFormHandling() {
    const form = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Varsayılan sayfa yenilemesini engelle

        // Temel doğrulama (HTML5 required attribute zaten tutuyor, ek güvenlik)
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Simüle Edilmiş Gönderme Durumu
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = "Gönderiliyor...";
        submitBtn.style.pointerEvents = "none";
        submitBtn.style.opacity = "0.7";

        // API'ye gidiyormuş gibi bekle (örneğin 1.5s)
        setTimeout(() => {
            // Başarı durumunu göster
            successMsg.classList.add('is-visible');
            successMsg.setAttribute('aria-hidden', 'false');

            // Formu Temizle
            form.reset();

            // Textarea yüksekliğini sıfırla
            const textarea = form.querySelector('.form-textarea');
            if (textarea) textarea.style.height = 'auto';

            // Butonu eski haline getir
            submitBtn.querySelector('.btn-text').textContent = "Gönderildi";

            // İsteğe bağlı: 5 saniye sonra başarı mesajını gizleyebilir veya butonu eski haline getirebilirsiniz.
            setTimeout(() => {
                successMsg.classList.remove('is-visible');
                successMsg.setAttribute('aria-hidden', 'true');
                submitBtn.querySelector('.btn-text').textContent = originalText;
                submitBtn.style.pointerEvents = "auto";
                submitBtn.style.opacity = "1";
            }, 5000);

        }, 1500);
    });
}