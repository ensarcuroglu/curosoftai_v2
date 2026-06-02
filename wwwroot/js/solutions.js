/* curosoftai - Solutions Page Interactions */
(function () {
    "use strict";

    function init() {
        var page = document.querySelector(".solutions-page");
        if (!page) return;

        var hasGsap = typeof window.gsap !== "undefined";
        var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (hasGsap) {
            page.setAttribute("data-sol-ready", "");
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll(".sol-card"));
        cards.forEach(function (card) {
            card.addEventListener("pointermove", function (event) {
                var rect = card.getBoundingClientRect();
                card.style.setProperty("--mx", event.clientX - rect.left + "px");
                card.style.setProperty("--my", event.clientY - rect.top + "px");
            });
        });

        if (!hasGsap || prefersReduced) return;

        if (window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        gsap.set('[data-sol-anim="hero"]', { opacity: 1 });
        var heroItems = gsap.utils.toArray('[data-sol-anim="hero"] > *');
        gsap.set(heroItems, { opacity: 0, y: 24 });
        gsap.to(heroItems, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.11,
            delay: 0.15
        });

        gsap.fromTo(
            '[data-sol-anim="visual"]',
            { opacity: 0, y: 26, scale: 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: "power3.out", delay: 0.25 }
        );

        gsap.utils.toArray('[data-sol-anim="fade"]').forEach(function (item) {
            gsap.fromTo(
                item,
                { opacity: 0, y: 28 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: { trigger: item, start: "top 84%" }
                }
            );
        });

        var animatedCards = gsap.utils.toArray('[data-sol-anim="card"]');
        gsap.set(animatedCards, { opacity: 0, y: 34 });
        ScrollTrigger.batch(animatedCards, {
            start: "top 88%",
            onEnter: function (batch) {
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    duration: 0.78,
                    ease: "power3.out",
                    stagger: 0.09,
                    overwrite: true
                });
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
