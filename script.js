/* =========================================================
   FOR SOPH — MAIN SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       OPENING
    ===================================================== */

    const opening = document.getElementById("opening");
    const openButton = document.getElementById("openButton");
    const main = document.getElementById("main");

    if (openButton) {
        openButton.addEventListener("click", () => {

            opening.classList.add("opening-hidden");

            setTimeout(() => {
                if (main) {
                    main.classList.add("main-visible");
                }
            }, 250);

        });
    }


    /* =====================================================
       SECRET MESSAGE
    ===================================================== */

    const secretButton = document.getElementById("secretButton");
    const secretMessage = document.getElementById("secretMessage");

    if (secretButton && secretMessage) {

        secretButton.addEventListener("click", () => {

            secretMessage.classList.toggle("show");

            if (secretMessage.classList.contains("show")) {
                secretButton.textContent = "♡";
            } else {
                secretButton.textContent = "there's something here";
            }

        });

    }


    /* =====================================================
       HIDDEN STARS
    ===================================================== */

    const stars = document.querySelectorAll(".star");
    const starMessage = document.getElementById("starMessage");

    stars.forEach((star) => {

        star.addEventListener("click", () => {

            const message = star.dataset.message;

            if (!starMessage) return;

            starMessage.textContent = message;

            starMessage.classList.remove("show");

            requestAnimationFrame(() => {
                starMessage.classList.add("show");
            });

        });

    });


    /* =====================================================
       MUSIC
    ===================================================== */

    const iframe = document.getElementById("soundcloud-player");

    const playButton = document.getElementById("playButton");
    const previousButton = document.getElementById("previousButton");
    const nextButton = document.getElementById("nextButton");

    const musicDisc = document.getElementById("musicDisc");

    const currentSongTitle =
        document.getElementById("currentSongTitle");

    const currentSongArtist =
        document.getElementById("currentSongArtist");

    const currentTime =
        document.getElementById("currentTime");

    const duration =
        document.getElementById("duration");

    const progressBar =
        document.getElementById("progressBar");

    const progressTrack =
        document.getElementById("progressTrack");

    const musicSection =
        document.getElementById("musicSection");

    const floatingMusicButton =
        document.getElementById("floatingMusicButton");

    const songButtons =
        document.querySelectorAll(".music-song");


    if (!iframe) return;


    /* =====================================================
       SONG DATA

       Put your REAL SoundCloud URLs here.
    ===================================================== */

    const songs = [

        {
            title: "I Love You",
            artist: "Fontaines D.C.",
            url: "https://soundcloud.com/fontainesdublin/i-love-you"
        },

        {
            title: "You'll Be Mine Tonight",
            artist: "Your Artist",
            url: "YOUR_SECOND_SOUNDCLOUD_URL"
        },

        {
            title: "Moonlight on the River",
            artist: "Your Artist",
            url: "YOUR_THIRD_SOUNDCLOUD_URL"
        }

    ];


    /* =====================================================
       STATE
    ===================================================== */

    let currentSong = 0;
    let isPlaying = false;
    let widgetReady = false;
    let loadingSong = false;
    let musicStarted = false;


    /* =====================================================
       SOUNDCloud WIDGET
    ===================================================== */

    let widget = null;


    function initializeSoundCloud() {

        if (typeof SC === "undefined") {
            console.error("SoundCloud Widget API failed to load.");
            return;
        }

        widget = SC.Widget(iframe);

        widget.bind(SC.Widget.Events.READY, () => {

            widgetReady = true;

            console.log("SoundCloud player ready.");

            updateSongUI();

        });


        widget.bind(SC.Widget.Events.PLAY, () => {

            isPlaying = true;

            updatePlayButton();

            if (musicDisc) {
                musicDisc.classList.add("playing");
            }

        });


        widget.bind(SC.Widget.Events.PAUSE, () => {

            isPlaying = false;

            updatePlayButton();

            if (musicDisc) {
                musicDisc.classList.remove("playing");
            }

        });


        widget.bind(SC.Widget.Events.FINISH, () => {

            isPlaying = false;

            updatePlayButton();

            if (musicDisc) {
                musicDisc.classList.remove("playing");
            }

            nextSong(true);

        });


        widget.bind(
            SC.Widget.Events.PLAY_PROGRESS,
            (data) => {

                if (!data) return;

                const position =
                    data.currentPosition || 0;

                const relative =
                    data.relativePosition || 0;

                updateProgress(position, relative);

            }
        );


        widget.bind(SC.Widget.Events.ERROR, (error) => {

            console.warn(
                "SoundCloud could not play this track:",
                error
            );

            loadingSong = false;

            isPlaying = false;

            updatePlayButton();

            if (musicDisc) {
                musicDisc.classList.remove("playing");
            }

        });

    }


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    function formatTime(milliseconds) {

        if (!milliseconds || milliseconds < 0) {
            return "0:00";
        }

        const totalSeconds =
            Math.floor(milliseconds / 1000);

        const minutes =
            Math.floor(totalSeconds / 60);

        const seconds =
            totalSeconds % 60;

        return (
            minutes +
            ":" +
            String(seconds).padStart(2, "0")
        );

    }


    /* =====================================================
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress(position, relative) {

        if (currentTime) {
            currentTime.textContent =
                formatTime(position);
        }

        if (progressBar) {

            progressBar.style.width =
                `${Math.max(0, Math.min(1, relative)) * 100}%`;

        }

    }


    /* =====================================================
       GET DURATION
    ===================================================== */

    function updateDuration() {

        if (!widget || !duration) return;

        widget.getDuration((milliseconds) => {

            duration.textContent =
                formatTime(milliseconds);

        });

    }


    /* =====================================================
       UPDATE SONG UI
    ===================================================== */

    function updateSongUI() {

        const song = songs[currentSong];

        if (!song) return;

        if (currentSongTitle) {
            currentSongTitle.textContent =
                song.title;
        }

        if (currentSongArtist) {
            currentSongArtist.textContent =
                song.artist;
        }


        songButtons.forEach((button, index) => {

            button.classList.toggle(
                "active",
                index === currentSong
            );

        });


        if (currentTime) {
            currentTime.textContent = "0:00";
        }

        if (progressBar) {
            progressBar.style.width = "0%";
        }

        if (duration) {
            duration.textContent = "0:00";
        }

    }


    /* =====================================================
       PLAY BUTTON
    ===================================================== */

    function updatePlayButton() {

        if (!playButton) return;

        playButton.textContent =
            isPlaying ? "Ⅱ" : "▶";

        playButton.setAttribute(
            "aria-label",
            isPlaying ? "Pause" : "Play"
        );

    }


    /* =====================================================
       PLAY CURRENT SONG
    ===================================================== */

    function playCurrentSong() {

        if (!widgetReady || !widget) return;

        if (loadingSong) return;

        loadingSong = true;

        widget.play();

        setTimeout(() => {

            loadingSong = false;

        }, 300);

    }


    /* =====================================================
       LOAD SONG

       SoundCloud's Widget API supports loading a new
       SoundCloud URL directly into the existing iframe.
    ===================================================== */

    function loadSong(index, autoplay = true) {

        if (!widgetReady || !widget) return;

        if (!songs[index]) return;

        currentSong = index;

        const song = songs[currentSong];

        loadingSong = true;

        isPlaying = false;

        updateSongUI();
        updatePlayButton();


        if (musicDisc) {
            musicDisc.classList.remove("playing");
        }


        widget.load(song.url, {

            auto_play: autoplay,

            hide_related: true,

            show_comments: false,

            show_user: false,

            show_reposts: false,

            show_teaser: false,

            visual: false,

            show_artwork: false,

            callback: () => {

                loadingSong = false;

                updateSongUI();

                if (autoplay) {

                    widget.play();

                }

                setTimeout(() => {

                    updateDuration();

                }, 400);

            }

        });

    }


    /* =====================================================
       SONG BUTTONS

       Clicking the cover immediately switches songs.
    ===================================================== */

    songButtons.forEach((button, index) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            if (index === currentSong && isPlaying) {

                widget.pause();

                return;

            }

            loadSong(index, true);

        });

    });


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    if (playButton) {

        playButton.addEventListener("click", () => {

            if (!widgetReady || !widget) return;

            if (isPlaying) {

                widget.pause();

            } else {

                playCurrentSong();

            }

        });

    }


    /* =====================================================
       NEXT
    ===================================================== */

    function nextSong(autoplay = true) {

        let nextIndex =
            currentSong + 1;

        if (nextIndex >= songs.length) {
            nextIndex = 0;
        }

        loadSong(nextIndex, autoplay);

    }


    if (nextButton) {

        nextButton.addEventListener("click", () => {

            nextSong(true);

        });

    }


    /* =====================================================
       PREVIOUS
    ===================================================== */

    function previousSong() {

        let previousIndex =
            currentSong - 1;

        if (previousIndex < 0) {
            previousIndex = songs.length - 1;
        }

        loadSong(previousIndex, true);

    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousSong
        );

    }


    /* =====================================================
       PROGRESS BAR SEEKING
    ===================================================== */

    if (progressTrack) {

        progressTrack.addEventListener("click", (event) => {

            if (!widgetReady || !widget) return;

            const rect =
                progressTrack.getBoundingClientRect();

            const clickPosition =
                event.clientX - rect.left;

            const percentage =
                clickPosition / rect.width;

            widget.getDuration((milliseconds) => {

                if (!milliseconds) return;

                const seekTo =
                    milliseconds * percentage;

                widget.seekTo(seekTo);

            });

        });

    }


    /* =====================================================
       FLOATING MUSIC BUTTON
    ===================================================== */

    if (floatingMusicButton && musicSection) {

        floatingMusicButton.addEventListener("click", () => {

            musicSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        });

    }


    /* =====================================================
       AUTO PLAY WHEN ENTERING MUSIC AREA
    ===================================================== */

    if (musicSection) {

        const musicObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (
                            entry.isIntersecting &&
                            !musicStarted &&
                            widgetReady
                        ) {

                            musicStarted = true;

                            loadSong(currentSong, true);

                        }

                    });

                },
                {
                    threshold: 0.35
                }
            );

        musicObserver.observe(musicSection);

    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (!widgetReady || !widget) return;

        if (event.code === "Space") {

            const tag =
                document.activeElement?.tagName;

            if (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "BUTTON"
            ) {
                return;
            }

            event.preventDefault();

            if (isPlaying) {
                widget.pause();
            } else {
                widget.play();
            }

        }

        if (event.code === "ArrowRight") {
            nextSong(true);
        }

        if (event.code === "ArrowLeft") {
            previousSong();
        }

    });


    /* =====================================================
       INITIALIZE
    ===================================================== */

    initializeSoundCloud();

});
