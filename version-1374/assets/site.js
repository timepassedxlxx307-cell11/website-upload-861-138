(function() {
    var toggle = document.querySelector(".mobile-nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
        toggle.addEventListener("click", function() {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
            panel.hidden = expanded;
        });
    }

    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
        var prev = carousel.querySelector(".hero-control.prev");
        var next = carousel.querySelector(".hero-control.next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }
        show(0);
        start();
    }

    var searchPage = document.querySelector(".search-results-grid");
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var input = document.querySelector(".search-box input");
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-button"));
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
        var noResults = document.querySelector(".no-results");
        var activeFilter = "all";

        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        function textOf(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-category") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var shown = 0;
            cards.forEach(function(card) {
                var matchText = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchFilter = activeFilter === "all" || card.getAttribute("data-category") === activeFilter || card.getAttribute("data-type") === activeFilter;
                var visible = matchText && matchFilter;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (noResults) {
                noResults.style.display = shown ? "none" : "block";
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        buttons.forEach(function(button) {
            button.addEventListener("click", function() {
                activeFilter = button.getAttribute("data-filter") || "all";
                buttons.forEach(function(item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
        applyFilter();
    }
})();
