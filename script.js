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

            if (opening) {
                opening.classList.add("opening-hidden");
            }

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

    const secretButton =
        document.getElementById("secretButton");

    const secretMessage =
        document.getElementById("secretMessage");

    if (secretButton && secretMessage) {

        secretButton.addEventListener("click", () => {

            secretMessage.classList.toggle("show");

            if (secretMessage.classList.contains("show")) {

                secretButton.textContent = "♡";

            } else {

                secretButton.textContent =
                    "there's something here";

            }

        });

    }


    /* =====================================================
       HIDDEN STARS
    ===================================================== */

    const stars =
        document.querySelectorAll(".star");

    const starMessage =
        document.getElementById("starMessage");

    stars.forEach((star) => {

        star.addEventListener("click", () => {

            if (!starMessage) return;

            const message =
                star.dataset.message || "";

            starMessage.classList.remove("show");

            starMessage.textContent = message;

            requestAnimationFrame(() => {

                starMessage.classList.add("show");

            });

        });

    });


    /* =====================================================
       MUSIC ELEMENTS
    ===================================================== */

    const iframe =
        document.getElementById("soundcloud-player");

    const playButton =
        document.getElementById("playButton");

    const previousButton =
        document.getElementById("previousButton");

    const nextButton =
        document.getElementById("nextButton");

    const musicDisc =
        document.getElementById("musicDisc");

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


    if (!iframe) {

        console.error(
            "SoundCloud iframe was not found."
        );

        return;

    }


    /* =====================================================
       SONG DATA

       PUT YOUR REAL SOUNDCLOUD URLS HERE
    ===================================================== */

    const songs = [

        {
            title: "I Love You",
            artist: "Fontaines D.C.",
            url:
                "https://soundcloud.com/fontainesdublin/i-love-you"
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

    let widget = null;

    let musicStarted = false;

    let changingSong = false;


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    function formatTime(milliseconds) {

        if (
            !milliseconds ||
            milliseconds < 0
        ) {

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
       UPDATE PLAY BUTTON
    ===================================================== */

    function updatePlayButton() {

        if (!playButton) return;

        if (isPlaying) {

            playButton.textContent = "Ⅱ";

            playButton.setAttribute(
                "aria-label",
                "Pause"
            );

        } else {

            playButton.textContent = "▶";

            playButton.setAttribute(
                "aria-label",
                "Play"
            );

        }

    }


    /* =====================================================
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress(
        position,
        relative
    ) {

        if (currentTime) {

            currentTime.textContent =
                formatTime(position);

        }

        if (progressBar) {

            const percentage =
                Math.max(
                    0,
                    Math.min(
                        1,
                        relative || 0
                    )
                ) * 100;

            progressBar.style.width =
                percentage + "%";

        }

    }


    /* =====================================================
       UPDATE DURATION
    ===================================================== */

    function updateDuration() {

        if (!widget || !duration) return;

        widget.getDuration(
            (milliseconds) => {

                duration.textContent =
                    formatTime(milliseconds);

            }
        );

    }


    /* =====================================================
       UPDATE SONG UI
    ===================================================== */

    function updateSongUI() {

        const song =
            songs[currentSong];

        if (!song) return;


        if (currentSongTitle) {

            currentSongTitle.textContent =
                song.title;

        }


        if (currentSongArtist) {

            currentSongArtist.textContent =
                song.artist;

        }


        songButtons.forEach(
            (button, index) => {

                button.classList.toggle(
                    "active",
                    index === currentSong
                );

            }
        );


        if (currentTime) {

            currentTime.textContent =
                "0:00";

        }


        if (duration) {

            duration.textContent =
                "0:00";

        }


        if (progressBar) {

            progressBar.style.width =
                "0%";

        }

    }


    /* =====================================================
       SOUNDCloud WIDGET
    ===================================================== */

    function initializeSoundCloud() {

        /*
         * The SoundCloud API script MUST be loaded
         * before this script in index.html.
         */

        if (typeof SC === "undefined") {

            console.error(
                "SoundCloud Widget API is missing."
            );

            console.error(
                "Add this before script.js:"
            );

            console.error(
                "https://w.soundcloud.com/player/api.js"
            );

            return;

        }


        widget =
            SC.Widget(iframe);


        /* =================================================
           PLAYER READY
        ================================================= */

        widget.bind(
            SC.Widget.Events.READY,
            () => {

                widgetReady = true;

                console.log(
                    "SoundCloud player ready."
                );

                updateSongUI();

                updatePlayButton();

            }
        );


        /* =================================================
           PLAY
        ================================================= */

        widget.bind(
            SC.Widget.Events.PLAY,
            () => {

                isPlaying = true;

                changingSong = false;

                updatePlayButton();


                if (musicDisc) {

                    musicDisc.classList.add(
                        "playing"
                    );

                }

            }
        );


        /* =================================================
           PAUSE
        ================================================= */

        widget.bind(
            SC.Widget.Events.PAUSE,
            () => {

                isPlaying = false;

                changingSong = false;

                updatePlayButton();


                if (musicDisc) {

                    musicDisc.classList.remove(
                        "playing"
                    );

                }

            }
        );


        /* =================================================
           SONG FINISHED
        ================================================= */

        widget.bind(
            SC.Widget.Events.FINISH,
            () => {

                isPlaying = false;

                if (musicDisc) {

                    musicDisc.classList.remove(
                        "playing"
                    );

                }

                updatePlayButton();

                nextSong(true);

            }
        );


        /* =================================================
           PLAY PROGRESS
        ================================================= */

        widget.bind(
            SC.Widget.Events.PLAY_PROGRESS,
            (data) => {

                if (!data) return;

                updateProgress(
                    data.currentPosition || 0,
                    data.relativePosition || 0
                );

            }
        );


        /* =================================================
           ERROR
        ================================================= */

        widget.bind(
            SC.Widget.Events.ERROR,
            (error) => {

                console.error(
                    "SoundCloud player error:",
                    error
                );

                isPlaying = false;

                changingSong = false;

                updatePlayButton();


                if (musicDisc) {

                    musicDisc.classList.remove(
                        "playing"
                    );

                }

            }
        );

    }


    /* =====================================================
       LOAD SONG
    ===================================================== */

    function loadSong(
        index,
        autoplay = true
    ) {

        if (!widgetReady || !widget) {

            console.warn(
                "SoundCloud isn't ready yet."
            );

            return;

        }


        if (
            index < 0 ||
            index >= songs.length
        ) {

            return;

        }


        const song =
            songs[index];


        if (!song || !song.url) {

            console.error(
                "Song URL is missing:",
                index
            );

            return;

        }


        currentSong = index;

        changingSong = true;

        isPlaying = false;


        updateSongUI();

        updatePlayButton();


        if (musicDisc) {

            musicDisc.classList.remove(
                "playing"
            );

        }


        /*
         * Load the new SoundCloud track
         * inside the SAME iframe.
         */

        widget.load(
            song.url,
            {

                auto_play: autoplay,

                hide_related: true,

                show_comments: false,

                show_user: false,

                show_reposts: false,

                show_teaser: false,

                visual: false,

                show_artwork: false,

                callback: () => {

                    changingSong = false;

                    updateSongUI();


                    if (autoplay) {

                        /*
                         * Tiny delay makes switching
                         * much more reliable.
                         */

                        setTimeout(() => {

                            widget.play();

                        }, 50);

                    }


                    setTimeout(() => {

                        updateDuration();

                    }, 500);

                }

            }
        );

    }


    /* =====================================================
       PLAY CURRENT SONG
    ===================================================== */

    function playCurrentSong() {

        if (!widgetReady || !widget) {

            return;

        }

        widget.play();

    }


    /* =====================================================
       SONG BUTTONS
    ===================================================== */

    songButtons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    /*
                     * Clicking the currently playing
                     * song pauses it.
                     */

                    if (
                        index === currentSong &&
                        isPlaying
                    ) {

                        widget.pause();

                        return;

                    }


                    /*
                     * Clicking another song
                     * immediately switches to it.
                     */

                    loadSong(
                        index,
                        true
                    );

                }
            );

        }
    );


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    if (playButton) {

        playButton.addEventListener(
            "click",
            () => {

                if (!widgetReady || !widget) {

                    return;

                }


                if (isPlaying) {

                    widget.pause();

                } else {

                    playCurrentSong();

                }

            }
        );

    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong(
        autoplay = true
    ) {

        let nextIndex =
            currentSong + 1;


        if (
            nextIndex >= songs.length
        ) {

            nextIndex = 0;

        }


        loadSong(
            nextIndex,
            autoplay
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                nextSong(true);

            }
        );

    }


    /* =====================================================
       PREVIOUS SONG
    ===================================================== */

    function previousSong() {

        let previousIndex =
            currentSong - 1;


        if (previousIndex < 0) {

            previousIndex =
                songs.length - 1;

        }


        loadSong(
            previousIndex,
            true
        );

    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousSong
        );

    }


    /* =====================================================
       PROGRESS BAR SEEK
    ===================================================== */

    if (progressTrack) {

        progressTrack.addEventListener(
            "click",
            (event) => {

                if (!widgetReady || !widget) {

                    return;

                }


                const rect =
                    progressTrack
                        .getBoundingClientRect();


                if (!rect.width) return;


                const clickPosition =
                    event.clientX -
                    rect.left;


                let percentage =
                    clickPosition /
                    rect.width;


                percentage =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            percentage
                        )
                    );


                widget.getDuration(
                    (milliseconds) => {

                        if (!milliseconds) {

                            return;

                        }


                        widget.seekTo(
                            milliseconds *
                            percentage
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       FLOATING MUSIC BUTTON
    ===================================================== */

    if (
        floatingMusicButton &&
        musicSection
    ) {

        floatingMusicButton.addEventListener(
            "click",
            () => {

                musicSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );

    }


    /* =====================================================
       AUTO PLAY WHEN ENTERING MUSIC SECTION
    ===================================================== */

    if (musicSection) {

        const musicObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting &&
                                !musicStarted &&
                                widgetReady
                            ) {

                                musicStarted =
                                    true;


                                loadSong(
                                    currentSong,
                                    true
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.35
                }
            );


        musicObserver.observe(
            musicSection
        );

    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                !widgetReady ||
                !widget
            ) {

                return;

            }


            const tag =
                document.activeElement?.tagName;


            /* SPACE = PLAY / PAUSE */

            if (
                event.code === "Space" &&
                tag !== "INPUT" &&
                tag !== "TEXTAREA" &&
                tag !== "BUTTON"
            ) {

                event.preventDefault();


                if (isPlaying) {

                    widget.pause();

                } else {

                    widget.play();

                }

            }


            /* RIGHT ARROW = NEXT */

            if (
                event.code === "ArrowRight"
            ) {

                nextSong(true);

            }


            /* LEFT ARROW = PREVIOUS */

            if (
                event.code === "ArrowLeft"
            ) {

                previousSong();

            }

        }
    );


    /* =====================================================
       INITIALIZE MUSIC
    ===================================================== */

    initializeSoundCloud();

});
