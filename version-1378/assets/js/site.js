(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.getElementById("mobileNav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, pos) {
                    slide.classList.toggle("is-active", pos === current);
                });
                dots.forEach(function (dot, pos) {
                    dot.classList.toggle("is-active", pos === current);
                });
            };
            dots.forEach(function (dot, pos) {
                dot.addEventListener("click", function () {
                    showSlide(pos);
                });
            });
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var filterPanel = document.querySelector("[data-filter-panel]");
        var filterGrid = document.querySelector("[data-filter-grid]");
        if (filterPanel && filterGrid) {
            var keywordInput = filterPanel.querySelector("[data-filter-keyword]");
            var yearSelect = filterPanel.querySelector("[data-filter-year]");
            var regionSelect = filterPanel.querySelector("[data-filter-region]");
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
            var applyFilter = function () {
                var keyword = normalize(keywordInput && keywordInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year")
                    ].join(" "));
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var okRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
                    card.style.display = okKeyword && okYear && okRegion ? "" : "none";
                });
            };
            [keywordInput, yearSelect, regionSelect].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", applyFilter);
                    item.addEventListener("change", applyFilter);
                }
            });
        }

        var searchRoot = document.querySelector("[data-search-root]");
        if (searchRoot && window.SEARCH_MOVIES) {
            var input = searchRoot.querySelector("[data-search-input]");
            var typeSelect = searchRoot.querySelector("[data-search-type]");
            var results = searchRoot.querySelector("[data-search-results]");
            var render = function () {
                var keyword = normalize(input && input.value);
                var type = normalize(typeSelect && typeSelect.value);
                var source = window.SEARCH_MOVIES.filter(function (movie) {
                    var blob = normalize([movie.title, movie.year, movie.type, movie.genre, movie.region, movie.tags].join(" "));
                    var okKeyword = !keyword || blob.indexOf(keyword) !== -1;
                    var okType = !type || normalize(movie.type).indexOf(type) !== -1;
                    return okKeyword && okType;
                }).slice(0, 80);
                if (!source.length) {
                    results.innerHTML = '<div class="empty-state">未找到匹配影片</div>';
                    return;
                }
                results.innerHTML = source.map(function (movie) {
                    return '<article class="movie-card">' +
                        '<a class="movie-cover" href="' + movie.url + '">' +
                            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
                            '<span class="movie-year">' + movie.year + '</span>' +
                            '<span class="movie-play-mark">▶</span>' +
                        '</a>' +
                        '<div class="movie-card-body">' +
                            '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
                            '<p class="movie-meta-line">' + movie.region + ' · ' + movie.type + ' · ' + movie.genre + '</p>' +
                            '<p class="movie-one-line">' + movie.oneLine + '</p>' +
                            '<div class="tag-row">' + movie.tags.split("|").slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join("") + '</div>' +
                        '</div>' +
                    '</article>';
                }).join("");
            };
            if (input) {
                input.addEventListener("input", render);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", render);
            }
            render();
        }
    });

    window.initMoviePlayer = function (videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video || !sourceUrl) {
            return;
        }
        var overlay = document.querySelector('[data-player="' + videoId + '"]');
        var attached = false;
        var attach = function () {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = sourceUrl;
            }
            attached = true;
        };
        var start = function () {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var play = video.play();
            if (play && play.catch) {
                play.catch(function () {});
            }
        };
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                start();
            }
        });
    };
}());
