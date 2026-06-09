function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);

    if (!video) {
        return;
    }

    var frame = video.closest('.video-frame');
    var startButton = frame ? frame.querySelector('.player-start') : null;
    var hls = null;
    var isReady = false;

    function hideStartButton() {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
    }

    function attachSource() {
        if (isReady) {
            return;
        }

        isReady = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function startPlayback() {
        attachSource();
        hideStartButton();
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (startButton) {
        startButton.addEventListener('click', function (event) {
            event.preventDefault();
            startPlayback();
        });
    }

    video.addEventListener('click', function () {
        if (!isReady || video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', hideStartButton);

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
