(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-target]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-slide-target"), 10) || 0;
                show(index);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var activeChip = "";

            function apply() {
                var query = normalize(input && input.value);
                var typeValue = normalize(typeSelect && typeSelect.value);
                var regionValue = normalize(regionSelect && regionSelect.value);
                var yearValue = normalize(yearSelect && yearSelect.value);
                var chipValue = normalize(activeChip);

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardGenre = normalize(card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
                    var visible = true;

                    if (query && haystack.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        visible = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        visible = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        visible = false;
                    }
                    if (chipValue && cardGenre.indexOf(chipValue) === -1) {
                        visible = false;
                    }

                    card.classList.toggle("is-filter-hidden", !visible);
                });
            }

            [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var chipRow = scope.querySelector("[data-chip-row]");
            if (chipRow) {
                chipRow.addEventListener("click", function (event) {
                    var button = event.target.closest("[data-chip]");
                    if (!button) {
                        return;
                    }
                    if (button.classList.contains("is-active")) {
                        button.classList.remove("is-active");
                        activeChip = "";
                    } else {
                        Array.prototype.forEach.call(chipRow.querySelectorAll("[data-chip]"), function (chip) {
                            chip.classList.remove("is-active");
                        });
                        button.classList.add("is-active");
                        activeChip = button.getAttribute("data-chip") || "";
                    }
                    apply();
                });
            }
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var cover = document.querySelector("[data-player-cover]");
        var playButton = document.querySelector("[data-play-button]");
        var started = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function requestPlay() {
            if (cover) {
                cover.classList.add("is-hidden");
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function startPlayer() {
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    requestPlay();
                } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
                    hlsInstance = new Hls();
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, requestPlay);
                    requestPlay();
                } else {
                    video.src = streamUrl;
                    requestPlay();
                }
            } else {
                requestPlay();
            }
        }

        if (cover) {
            cover.addEventListener("click", startPlayer);
        }
        if (playButton) {
            playButton.addEventListener("click", startPlayer);
        }
        video.addEventListener("click", function () {
            if (!started) {
                startPlayer();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
