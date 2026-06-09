document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        startTimer();
    }

    var filterForm = document.querySelector("[data-filter-form]");
    var filterInput = document.querySelector("[data-filter-input]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var filterChips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var activeChip = "";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function runFilter() {
        if (!filterCards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : "");
        var visible = 0;

        filterCards.forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-category"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            var category = card.getAttribute("data-category") || "";
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedChip = !activeChip || category === activeChip;
            var matched = matchedQuery && matchedChip;

            card.style.display = matched ? "" : "none";

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q) {
            filterInput.value = q;
        }

        filterInput.addEventListener("input", runFilter);
        runFilter();
    }

    if (filterForm) {
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            runFilter();
        });
    }

    filterChips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeChip = chip.getAttribute("data-filter-chip") || "";

            filterChips.forEach(function (item) {
                item.classList.toggle("is-active", item === chip);
            });

            runFilter();
        });
    });

    var playerBox = document.querySelector("[data-stream-url]");

    if (playerBox) {
        var video = playerBox.querySelector("video");
        var playButton = playerBox.querySelector(".play-overlay");
        var streamUrl = playerBox.getAttribute("data-stream-url");
        var started = false;
        var hlsInstance = null;

        function begin() {
            if (!video || !streamUrl) {
                return;
            }

            if (playButton) {
                playButton.classList.add("is-hidden");
            }

            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            }
        }

        if (playButton) {
            playButton.addEventListener("click", begin);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });

            video.addEventListener("play", function () {
                if (playButton) {
                    playButton.classList.add("is-hidden");
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
});
