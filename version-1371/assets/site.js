(function () {
    var navButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            navButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var hero = document.querySelector('#heroSlider');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var previous = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function (event) {
                event.preventDefault();
                showSlide(index);
                play();
            });
        });

        if (previous) {
            previous.addEventListener('click', function (event) {
                event.preventDefault();
                showSlide(active - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function (event) {
                event.preventDefault();
                showSlide(active + 1);
                play();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        showSlide(0);
        play();
    }

    document.querySelectorAll('.movie-search').forEach(function (input) {
        var target = document.querySelector(input.getAttribute('data-target') || '');
        var scope = target || document;
        var items = Array.prototype.slice.call(scope.querySelectorAll('[data-search-item]'));

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();

            items.forEach(function (item) {
                var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                item.classList.toggle('is-filter-hidden', keyword && text.indexOf(keyword) === -1);
            });
        });
    });
})();
