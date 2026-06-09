(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
      button.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-card-search]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!input && !year && !type)) {
      return;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      cards.forEach(function (card) {
        var body = (card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region")).toLowerCase();
        var okQuery = !query || body.indexOf(query) !== -1;
        var okYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var okType = !selectedType || card.getAttribute("data-type") === selectedType;
        card.style.display = okQuery && okYear && okType ? "" : "none";
      });
    }
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function cardHtml(movie) {
    return [
      '<article class="movie-card" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml(movie.tags) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '">',
      '  <a class="poster-link" href="' + movie.url + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
      '    <span class="play-badge">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3 class="card-title"><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-summary">' + escapeHtml(movie.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !form || !input || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;
    function render(query) {
      var q = query.trim().toLowerCase();
      var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var body = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return !q || body.indexOf(q) !== -1;
      }).slice(0, 80);
      results.innerHTML = list.map(cardHtml).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var nextUrl = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
      window.history.replaceState({}, "", nextUrl);
      render(q);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initialQuery);
  }

  window.initPlayer = function (streamUrl, videoId, buttonId) {
    ready(function () {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video || !button || !streamUrl) {
        return;
      }
      var loaded = false;
      var hls = null;
      var wantedPlay = false;
      function requestPlay() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }
      function load() {
        if (loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 45,
            enableWorker: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (wantedPlay) {
              requestPlay();
            }
          });
          video._hlsInstance = hls;
        } else {
          video.src = streamUrl;
        }
        loaded = true;
      }
      function play() {
        wantedPlay = true;
        load();
        button.classList.add("hidden");
        video.controls = true;
        requestPlay();
      }
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
