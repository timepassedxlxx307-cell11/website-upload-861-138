(function() {
    var navButton = document.querySelector(".nav-toggle");
    var mobileNav = document.getElementById("mobileNav");

    if (navButton && mobileNav) {
        navButton.addEventListener("click", function() {
            var open = mobileNav.classList.toggle("is-open");
            navButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                startTimer();
            });
        }

        startTimer();
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function(input) {
        var target = input.getAttribute("data-search-target") || "[data-search-card]";
        var cards = Array.prototype.slice.call(document.querySelectorAll(target));

        function filterCards() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var keywords = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
                card.hidden = value !== "" && keywords.indexOf(value) === -1;
            });
        }

        input.addEventListener("input", filterCards);
        filterCards();
    });
})();
