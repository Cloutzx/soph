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

    const secretButton = document.getElementById("secretButton");
    const secretMessage = document.getElementById("secretMessage");

    if (secretButton && secretMessage) {

        secretButton.addEventListener("click", () => {

            secretMessage.classList.toggle("show");

            secretButton.textContent =
                secretMessage.classList.contains("show")
                    ? "♡"
                    : "there's something here";

        });

    }


    /* =====================================================
       HIDDEN STARS
    ===================================================== */

    const stars = document.querySelectorAll(".star");
    const starMessage = document.getElementById("starMessage");

    stars.forEach((star) => {

        star.addEventListener("click", () => {

            if (!starMessage) return;

            const message = star.dataset.message || "";

            starMessage.classList.remove("show");

            setTimeout(() => {

                starMessage.textContent = message;

                requestAnimationFrame(() => {
                    starMessage.classList.add("show");
                });

            }, 100);

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
        console.warn("SoundCloud iframe not found.");
        return;
    }


    /* =====================================================
       SONG DATA
    ===================================================== */

    const songs = [

        {
            title: "I Love You",
            artist: "Fontaines D.C.",
            url: "https://api.soundcloud.com/tracks/soundcloud%3Atracks%3A1178495929"
        },

        {
            title: "You'll Be Mine Tonight",
            artist: "Freddie",
            url: "https://soundcloud.com/user-101510492/youll-be-mine-tonight-freddie"
        },

        {
            title: "Moonlight on the River",
            artist: "Mac DeMarco",
            url: "https://soundcloud.com/user-917397187-731881398/mac-demarco-moonlight-on-the-river-slowed"
        }

    ];


    /* =====================================================
       STATE
    ===================================================== */

    let currentSong = 0;
    let isPlaying = false;
    let widgetReady = false;
    let switchingSong = false;
    let musicStarted = false;


    let widget = null;


    /* =====================================================
       UPDATE ACTIVE SONG
       
       IMPORTANT:
       This removes active from EVERY song first,
       then adds it to only the current song.
    ===================================================== */

    function updateActiveSong() {

        songButtons.forEach((button) => {
            button.classList.remove("active");
        });

        const activeButton =
            document.querySelector(
                `.music-song[data-song="${currentSong}"]`
            );

        if (activeButton) {
            activeButton.classList.add("active");
        }

    }


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    function formatTime(milliseconds) {

        if (
            !milliseconds ||
            milliseconds < 0 ||
            !Number.isFinite(milliseconds)
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
       RESET PROGRESS
    ===================================================== */

    function resetProgress() {

        if (currentTime) {
            currentTime.textContent = "0:00";
        }

        if (duration) {
            duration.textContent = "0:00";
        }

        if (progressBar) {
            progressBar.style.width = "0%";
        }

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


        updateActiveSong();

        resetProgress();

    }


    /* =====================================================
       PLAY BUTTON UI
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
       DISC ANIMATION
    ===================================================== */

    function updateDisc() {

        if (!musicDisc) return;

        if (isPlaying) {
            musicDisc.classList.add("playing");
        } else {
            musicDisc.classList.remove("playing");
        }

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

            const percentage =
                Math.max(
                    0,
                    Math.min(1, relative || 0)
                );

            progressBar.style.width =
                `${percentage * 100}%`;

        }

    }


    /* =====================================================
       GET DURATION
    ===================================================== */

    function updateDuration() {

        if (!widget || !duration) return;

        widget.getDuration((milliseconds) => {

            if (milliseconds) {

                duration.textContent =
                    formatTime(milliseconds);

            }

        });

    }


    /* =====================================================
       SOUND CLOUD INITIALIZATION
    ===================================================== */

    function initializeSoundCloud() {

        if (typeof SC === "undefined") {

            console.error(
                "SoundCloud Widget API is not loaded."
            );

            return;

        }


        widget = SC.Widget(iframe);


        /* -------------------------------------------------
           PLAYER READY
        ------------------------------------------------- */

        widget.bind(
            SC.Widget.Events.READY,
            () => {

                widgetReady = true;

                console.log(
                    "SoundCloud player ready."
                );

                updateSongUI();

            }
        );


        /* -------------------------------------------------
           PLAY
        ------------------------------------------------- */

        widget.bind(
            SC.Widget.Events.PLAY,
            () => {

                switchingSong = false;

                isPlaying = true;

                updatePlayButton();
                updateDisc();

                setTimeout(() => {
                    updateDuration();
                }, 300);

            }
        );


        /* -------------------------------------------------
           PAUSE
        ------------------------------------------------- */

        widget.bind(
            SC.Widget.Events.PAUSE,
            () => {

                isPlaying = false;

                updatePlayButton();
                updateDisc();

            }
        );


        /* -------------------------------------------------
           FINISHED
        ------------------------------------------------- */

        widget.bind(
            SC.Widget.Events.FINISH,
            () => {

                isPlaying = false;

                updatePlayButton();
                updateDisc();

                nextSong(true);

            }
        );


        /* -------------------------------------------------
           PROGRESS
        ------------------------------------------------- */

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


        /* -------------------------------------------------
           ERROR
        ------------------------------------------------- */

        widget.bind(
            SC.Widget.Events.ERROR,
            (error) => {

                console.warn(
                    "SoundCloud error:",
                    error
                );

                switchingSong = false;

                isPlaying = false;

                updatePlayButton();
                updateDisc();

            }
        );

    }


    /* =====================================================
       LOAD SONG
       
       This is the important part.
       
       We:
       1. Update the UI immediately
       2. Load the new track
       3. Wait for SoundCloud to finish loading
       4. Explicitly call play()
       
       This prevents the "click song → nothing happens"
       problem.
    ===================================================== */

    function loadSong(index, autoplay = true) {

        if (!widgetReady || !widget) {
            return;
        }

        if (!songs[index]) {
            return;
        }


        currentSong = index;

        const song = songs[currentSong];


        switchingSong = true;

        isPlaying = false;


        /* Update UI immediately */

        updateSongUI();
        updatePlayButton();
        updateDisc();


        /* Load new SoundCloud track */

        widget.load(song.url, {

            auto_play: false,

            hide_related: true,

            show_comments: false,

            show_user: false,

            show_reposts: false,

            show_teaser: false,

            visual: false,

            show_artwork: false,

            callback: () => {

                console.log(
                    "Loaded:",
                    song.title
                );


                switchingSong = false;


                /* Get duration */

                setTimeout(() => {
                    updateDuration();
                }, 250);


                /* Automatically play */

                if (autoplay) {

                    setTimeout(() => {

                        widget.play();

                    }, 100);

                }

            }

        });

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

    songButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();


            const index =
                Number(button.dataset.song);


            if (
                Number.isNaN(index) ||
                !songs[index]
            ) {
                return;
            }


            /* Clicking currently playing song
               pauses it */

            if (
                index === currentSong &&
                isPlaying &&
                !switchingSong
            ) {

                widget.pause();

                return;

            }


            /* Otherwise immediately switch
               and automatically play */

            loadSong(index, true);

        });

    });


    /* =====================================================
       PLAY / PAUSE BUTTON
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

    function nextSong(autoplay = true) {

        let nextIndex =
            currentSong + 1;


        if (nextIndex >= songs.length) {
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
       PROGRESS BAR SEEKING
    ===================================================== */

    if (progressTrack) {

        progressTrack.addEventListener(
            "click",
            (event) => {

                if (!widgetReady || !widget) {
                    return;
                }


                const rect =
                    progressTrack.getBoundingClientRect();


                const clickPosition =
                    event.clientX - rect.left;


                const percentage =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            clickPosition /
                            rect.width
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

                    entries.forEach((entry) => {

                        if (
                            entry.isIntersecting &&
                            widgetReady &&
                            !musicStarted
                        ) {

                            musicStarted = true;

                            loadSong(
                                currentSong,
                                true
                            );

                        }

                    });

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

            if (!widgetReady || !widget) {
                return;
            }


            const tag =
                document.activeElement?.tagName;


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


            if (event.code === "ArrowRight") {

                nextSong(true);

            }


            if (event.code === "ArrowLeft") {

                previousSong();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    initializeSoundCloud();

});
