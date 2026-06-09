(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./category-all.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dotsBox = slider.querySelector("[data-hero-dots]");
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      if (dotsBox) {
        Array.prototype.slice.call(dotsBox.children).forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (dotsBox) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第" + (i + 1) + "屏");
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
        dotsBox.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-form]");
    if (!panel) {
      return;
    }

    var search = panel.querySelector("[data-filter-search]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query && search) {
      search.value = query;
    }

    function valueOf(element) {
      return element ? element.value.trim() : "";
    }

    function filter() {
      var q = valueOf(search).toLowerCase();
      var r = valueOf(region);
      var t = valueOf(type);
      var y = valueOf(year);

      cards.forEach(function (card) {
        var terms = (card.getAttribute("data-terms") || "").toLowerCase();
        var ok = true;
        if (q && terms.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.getAttribute("data-region") !== r) {
          ok = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        card.hidden = !ok;
      });
    }

    [search, region, type, year].forEach(function (element) {
      if (!element) {
        return;
      }
      element.addEventListener("input", filter);
      element.addEventListener("change", filter);
    });

    filter();
  }

  window.initMoviePlayer = function (source) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var overlay = document.querySelector("[data-player-overlay]");
      if (!video || !source) {
        return;
      }

      var attached = false;
      var hls = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  };

  ready(function () {
    setupNav();
    setupHero();
    setupFilters();
  });
})();
