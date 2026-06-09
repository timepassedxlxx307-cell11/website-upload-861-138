/* 国产影视静态站交互脚本：移动导航、筛选、搜索、HLS 播放器 */
(function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            var isOpen = navMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function updateCatalogFilters() {
        var catalogGrid = document.querySelector('.catalog-grid');
        if (!catalogGrid) {
            return;
        }

        var keywordInput = document.querySelector('.js-filter-input');
        var typeSelect = document.querySelector('.js-filter-type');
        var regionSelect = document.querySelector('.js-filter-region');
        var countNode = document.querySelector('.js-visible-count');
        var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll('.movie-card'));

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !type || normalize(card.dataset.type) === type;
                var matchRegion = !region || normalize(card.dataset.region) === region;
                var show = matchKeyword && matchType && matchRegion;

                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        [keywordInput, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
            '    <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
            '        <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
            '        <span class="card-play" aria-hidden="true">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
            '        <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-list">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('
');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function updateSearchApp() {
        var app = document.querySelector('[data-search-app]');
        if (!app || !window.MOVIE_INDEX) {
            return;
        }

        var keywordInput = app.querySelector('.js-search-keyword');
        var typeSelect = app.querySelector('.js-search-type');
        var regionSelect = app.querySelector('.js-search-region');
        var resultNode = app.querySelector('.js-search-results');
        var countNode = app.querySelector('.js-search-count');

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);

            var results = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.type,
                    movie.region,
                    movie.regionGroup,
                    movie.genre,
                    movie.channelName,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !type || normalize(movie.type) === type;
                var matchRegion = !region || normalize(movie.regionGroup) === region;

                return matchKeyword && matchType && matchRegion;
            }).slice(0, 120);

            resultNode.innerHTML = results.map(movieCardTemplate).join('
');
            if (countNode) {
                countNode.textContent = String(results.length);
            }
        }

        [keywordInput, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function initializePlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-overlay');
            var status = player.querySelector('.js-player-status');
            var source = player.dataset.video;
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource() {
                if (video.dataset.ready === 'true') {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    setStatus('正在使用浏览器原生播放能力。');
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放清单加载完成，准备播放。');
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            setStatus('播放源加载异常，请稍后重试。');
                        }
                    });
                } else {
                    video.src = source;
                    setStatus('已尝试直接加载播放源。');
                }

                video.dataset.ready = 'true';
            }

            function play() {
                attachSource();
                player.classList.add('is-playing');
                video.play().catch(function () {
                    setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
                });
            }

            button.addEventListener('click', play);
            player.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    play();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    updateCatalogFilters();
    updateSearchApp();
    initializePlayers();
})();
