/* ============================================================
   curosoftai — Services Page Animations
   "Sakin editöryal" hareket: yalnızca niyet-odaklı (scroll-reveal)
   animasyon. Sürekli/dekoratif efekt yok.

   GSAP + ScrollTrigger layout.cshtml içinde (defer ile) yüklüdür;
   bu dosya da defer ile yüklendiği için onlardan sonra çalışır.
   GSAP yoksa veya reduced-motion ise içerik tam görünür kalır.
   ============================================================ */
(function () {
    "use strict";

    function init() {
        var page = document.querySelector(".services-page");
        if (!page) return;

        // GSAP yüklenmediyse hiçbir şey gizleme — içerik görünür kalsın.
        if (typeof window.gsap === "undefined") return;

        var prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // İçerik artık JS kontrolünde: başlangıç gizli durumlarını CSS aktif etsin.
        page.setAttribute("data-svc-ready", "");

        if (prefersReduced) return; // CSS reduced-motion kuralı içeriği gösterir.

        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        var ease = "power3.out";

        /* ---------- HERO (sayfa yüklenince yumuşak staggered fade-up) ---------- */
        var heroEls = gsap.utils.toArray('[data-svc-anim="hero"]');
        gsap.set(heroEls, { opacity: 0, y: 24 });
        gsap.to(heroEls, {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: ease,
            stagger: 0.1,
            delay: 0.12
        });

        /* ---------- Genel fade-in (section başlıkları, CTA) ---------- */
        gsap.utils.toArray('[data-svc-anim="fade"]').forEach(function (el) {
            gsap.set(el, { opacity: 0, y: 28 });
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: ease,
                scrollTrigger: { trigger: el, start: "top 86%" }
            });
        });

        /* ---------- Hizmet kartları (staggered reveal) ---------- */
        var cards = gsap.utils.toArray('[data-svc-anim="card"]');
        gsap.set(cards, { opacity: 0, y: 40 });
        ScrollTrigger.batch(cards, {
            start: "top 88%",
            onEnter: function (batch) {
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: ease,
                    stagger: 0.1,
                    overwrite: true
                });
            }
        });

        /* ---------- Süreç adımları (sıralı reveal) ---------- */
        var steps = gsap.utils.toArray('[data-svc-anim="step"]');
        gsap.set(steps, { opacity: 0, y: 32 });
        gsap.to(steps, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: ease,
            stagger: 0.14,
            scrollTrigger: {
                trigger: ".svc-steps",
                start: "top 80%"
            }
        });

        /* ---------- Süreç çizgisi (scroll ile dolar — sayfanın tek imza hareketi) ---------- */
        var lineFill = document.querySelector(".svc-steps__line-fill");
        if (lineFill) {
            // CSS desktop'ta scaleX(0), mobilde scaleY(0) başlangıcı verir;
            // her iki ekseni de 1'e çekmek iki düzende de doğru çalışır.
            gsap.to(lineFill, {
                scaleX: 1,
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".svc-steps",
                    start: "top 72%",
                    end: "bottom 72%",
                    scrub: 0.6
                }
            });
        }

        // Görseller/yazılar yerleştikten sonra tetikleyici konumlarını tazele.
        ScrollTrigger.refresh();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
