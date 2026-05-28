/**
 * curosoftai - Contact Page Interactions
 * GSAP & ScrollTrigger _Layout.cshtml içinden defer ile yükleniyor;
 * DOMContentLoaded sırasında hazır olmaları beklenir.
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
    const fadeElements = document.querySelectorAll('[data-gsap="fade-up"]');
    const formPanel = document.querySelector('[data-gsap="form-reveal"]');

    // Fallback: GSAP yoksa veya kullanıcı reduced-motion istiyorsa
    if (typeof gsap === 'undefined' || reduceMotion) {
        fadeElements.forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });
        if (formPanel) {
            formPanel.style.opacity = 1;
            formPanel.style.transform = 'none';
        }
        return;
    }

    // about.js ile aynı plugin kaydı — ileride scroll bazlı reveal eklenirse hazır
    if (typeof ScrollTrigger !== 'undefined' && !gsap.core.globals().ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (fadeElements.length) {
        tl.fromTo(fadeElements,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.15 },
            0.2
        );
    }

    if (formPanel) {
        tl.fromTo(formPanel,
            { opacity: 0, x: 40, rotationY: -5 },
            { opacity: 1, x: 0, rotationY: 0, duration: 1.2, clearProps: 'transform' },
            0.4
        );
    }
}

/**
 * Textarea Auto-Resize
 */
function initTextareaAutoResize() {
    const textarea = document.querySelector('.form-textarea');
    if (!textarea) return;

    const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    textarea.addEventListener('input', resize);
}

/**
 * Form Handling (Demo)
 * NOT: Gerçek gönderim eklenince fetch() ile değiştirin.
 */
function initFormHandling() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const successMsg = document.getElementById('formSuccess');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnTextEl = submitBtn?.querySelector('.btn-text');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const originalText = btnTextEl ? btnTextEl.textContent : '';

        if (btnTextEl) btnTextEl.textContent = 'Gönderiliyor...';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        }

        // Simüle edilmiş ağ gecikmesi — gerçek entegrasyonda fetch ile değiştir
        setTimeout(() => {
            if (successMsg) {
                successMsg.classList.add('is-visible');
                successMsg.setAttribute('aria-hidden', 'false');
            }

            form.reset();

            const textarea = form.querySelector('.form-textarea');
            if (textarea) textarea.style.height = 'auto';

            if (btnTextEl) btnTextEl.textContent = 'Gönderildi';

            setTimeout(() => {
                if (successMsg) {
                    successMsg.classList.remove('is-visible');
                    successMsg.setAttribute('aria-hidden', 'true');
                }
                if (btnTextEl) btnTextEl.textContent = originalText;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '';
                }
            }, 5000);
        }, 1500);
    });
}
