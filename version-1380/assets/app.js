(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobileMenu = qs('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var target = form.getAttribute('data-search-target') || 'search.html';
      window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  });

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  var currentSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  setSlide(0);

  var listingSearch = qs('[data-listing-search]');
  var cards = qsa('[data-movie-card]');
  var typeSelect = qs('[data-type-filter]');
  var yearSelect = qs('[data-year-filter]');
  var pills = qsa('[data-filter-pill]');
  var activeCategory = 'all';
  var emptyResult = qs('[data-empty-result]');

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  if (listingSearch && query) {
    listingSearch.value = query;
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(listingSearch ? listingSearch.value : '');
    var typeValue = normalize(typeSelect ? typeSelect.value : 'all');
    var yearValue = normalize(yearSelect ? yearSelect.value : 'all');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (typeValue !== 'all' && cardType !== typeValue) {
        matched = false;
      }

      if (yearValue !== 'all' && cardYear !== yearValue) {
        matched = false;
      }

      if (activeCategory !== 'all' && cardCategory !== activeCategory) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle('is-visible', visible === 0);
    }
  }

  if (listingSearch) {
    listingSearch.addEventListener('input', applyFilters);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      activeCategory = normalize(pill.getAttribute('data-filter-pill'));
      pills.forEach(function (item) {
        item.classList.toggle('is-active', item === pill);
      });
      applyFilters();
    });
  });

  applyFilters();

  qsa('[data-player]').forEach(function (box) {
    var video = qs('video', box);
    var overlay = qs('[data-play-overlay]', box);
    var url = box.getAttribute('data-video');
    var ready = false;

    function loadAndPlay() {
      if (!video || !url) {
        return;
      }

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        ready = true;
      }

      box.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
    }
  });
}());
