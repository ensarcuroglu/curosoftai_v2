/**
 * curosoftai - Contact Page Interactions
 * Minimal & Soft UI Sürümü + Canlı Yerel Saat
 */

document.addEventListener('DOMContentLoaded', () => {
    initSoftAnimations();
    initTextareaAutoResize();
    initFormValidationAndSubmit();
    initLiveLocalTime(); // Yeni eklendi
});

/**
 * Canlı Yerel Saat (Türkiye / GMT+3)
 */
function initLiveLocalTime() {
    const timeElement = document.getElementById('liveLocalTime');
    if (!timeElement) return;

    const updateClock = () => {
        // Türkiye saati (GMT+3) için formatlayıcı
        const now = new Date();
        const timeString = new Intl.DateTimeFormat('tr-TR', {
            timeZone: 'Europe/Istanbul',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(now);

        timeElement.textContent = timeString;
    };

    // İlk güncellemeyi yap ve her saniye tekrarla
    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * GSAP Giriş Animasyonları
 */
function initSoftAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof gsap === 'undefined') {
        gsap.set('[data-gsap]', { opacity: 1, y: 0, x: 0, transform: 'none' });
        return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    const fadeElements = document.querySelectorAll('[data-gsap="fade-up"]');
    if (fadeElements.length) {
        tl.fromTo(fadeElements,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 },
            0.1
        );
    }

    const formPanel = document.querySelector('[data-gsap="form-reveal"]');
    if (formPanel) {
        tl.fromTo(formPanel,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.4, clearProps: 'transform' },
            0.2
        );
    }
}

/**
 * Dinamik Textarea Boyutlandırma
 */
function initTextareaAutoResize() {
    const textarea = document.querySelector('.form-textarea');
    if (!textarea) return;

    const resize = () => {
        textarea.style.height = '48px';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    textarea.addEventListener('input', resize);
    window.addEventListener('load', resize);
}

/**
 * Minimal Form Validasyonu ve Submit
 */
function initFormValidationAndSubmit() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const inputs = form.querySelectorAll('.form-input[required]');
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const statusBox = document.getElementById('formStatus');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.input-group');
            if (group.classList.contains('is-error')) {
                group.classList.remove('is-error', 'apply-shake');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        inputs.forEach(input => {
            const group = input.closest('.input-group');
            if (!input.value.trim() || (input.type === 'email' && !isValidEmail(input.value))) {
                isValid = false;

                group.classList.remove('apply-shake');
                void group.offsetWidth;
                group.classList.add('is-error', 'apply-shake');
            }
        });

        if (!isValid) return;

        const originalText = btnText.textContent;
        btnText.textContent = 'Gönderiliyor...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'wait';

        setTimeout(() => {
            form.reset();
            const textarea = form.querySelector('.form-textarea');
            if (textarea) textarea.style.height = '48px';

            statusBox.classList.add('is-active');
            btnText.textContent = 'Gönderildi';

            setTimeout(() => {
                statusBox.classList.remove('is-active');
                btnText.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }, 5000);

        }, 1500);
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}