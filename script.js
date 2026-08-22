/* =========================================================
   FOR SOPH ♡ — FULL SCRIPT
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
        console.warn("SoundCloud iframe was not found.");
        return;
    }


    /* =====================================================
       SONG DATA
    ===================================================== */

    const songs = [

        {
            title: "I Love You",
            artist: "Fontaines D.C.",
            url: "https://api.soundcloud.com/tracks/1178495929"
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

    let widget = null;

    let switchingSong = false;

    let musicStarted = false;

    let userHasInteracted = false;

    let musicAreaWasEntered = false;


    /* =====================================================
       OPENING BUTTON UNLOCKS AUDIO
    ===================================================== */

    if (openButton) {

        openButton.addEventListener("click", () => {

            userHasInteracted = true;

            /*
             * The user has now interacted with the page.
             * This lets us attempt SoundCloud playback later
             * when they scroll into the music section.
             */

            if (
                widgetReady &&
                !musicAreaWasEntered &&
                isMusicSectionVisible()
            ) {

                startMusicAutomatically();

            }

        });

    }


    /* =====================================================
       CHECK IF MUSIC AREA IS VISIBLE
    ===================================================== */

    function isMusicSectionVisible() {

        if (!musicSection) {
            return false;
        }

        const rect =
            musicSection.getBoundingClientRect();

        const windowHeight =
            window.innerHeight ||
            document.documentElement.clientHeight;

        const visibleTop =
            Math.max(
                0,
                rect.top
            );

        const visibleBottom =
            Math.min(
                windowHeight,
                rect.bottom
            );

        const visibleHeight =
            Math.max(
                0,
                visibleBottom - visibleTop
            );

        return (
            visibleHeight >=
            rect.height * 0.25
        );

    }


    /* =====================================================
       WAIT FOR SOUNDCLOUD API
    ===================================================== */

    function waitForSoundCloud() {

        if (typeof SC !== "undefined") {

            initializeSoundCloud();

            return;

        }

        setTimeout(
            waitForSoundCloud,
            100
        );

    }


    /* =====================================================
       INITIALIZE SOUNDCLOUD
    ===================================================== */

    function initializeSoundCloud() {

        if (typeof SC === "undefined") {

            console.error(
                "SoundCloud Widget API failed to load."
            );

            return;
        }


        widget =
            SC.Widget(iframe);


        /* =================================================
           READY
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


                /*
                 * If the user already opened the page and
                 * the music section is visible, start it.
                 */

                if (
                    userHasInteracted &&
                    isMusicSectionVisible() &&
                    !musicStarted
                ) {

                    startMusicAutomatically();

                }

            }
        );


        /* =================================================
           PLAY
        ================================================= */

        widget.bind(
            SC.Widget.Events.PLAY,
            () => {

                isPlaying = true;

                switchingSong = false;

                updatePlayButton();

                if (musicDisc) {
                    musicDisc.classList.add("spinning");
                }

                if (floatingMusicButton) {
                    floatingMusicButton.classList.add("playing");
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

                updatePlayButton();

                if (musicDisc) {
                    musicDisc.classList.remove("spinning");
                }

                if (floatingMusicButton) {
                    floatingMusicButton.classList.remove("playing");
                }

            }
        );


        /* =================================================
           FINISHED
        ================================================= */

        widget.bind(
            SC.Widget.Events.FINISH,
            () => {

                isPlaying = false;

                if (musicDisc) {
                    musicDisc.classList.remove("spinning");
                }

                if (floatingMusicButton) {
                    floatingMusicButton.classList.remove("playing");
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

                const position =
                    data.currentPosition || 0;

                const relative =
                    data.relativePosition || 0;

                updateProgress(
                    position,
                    relative
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

                switchingSong = false;

                isPlaying = false;

                updatePlayButton();

                if (musicDisc) {
                    musicDisc.classList.remove("spinning");
                }

                if (floatingMusicButton) {
                    floatingMusicButton.classList.remove("playing");
                }

            }
        );

    }


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
            Math.floor(
                milliseconds / 1000
            );

        const minutes =
            Math.floor(
                totalSeconds / 60
            );

        const seconds =
            totalSeconds % 60;

        return (
            minutes +
            ":" +
            String(seconds).padStart(
                2,
                "0"
            )
        );

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

            const percent =
                Math.max(
                    0,
                    Math.min(
                        1,
                        relative
                    )
                ) * 100;

            progressBar.style.width =
                percent + "%";

        }

    }


    /* =====================================================
       UPDATE DURATION
    ===================================================== */

    function updateDuration() {

        if (
            !widget ||
            !duration
        ) {
            return;
        }

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


        /*
         * IMPORTANT:
         * Remove active from ALL songs.
         * Only the current song gets active.
         */

        songButtons.forEach(
            (button, index) => {

                button.classList.remove(
                    "active"
                );

                button.classList.remove(
                    "song-main"
                );

                if (index === currentSong) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


        if (currentTime) {
            currentTime.textContent =
                "0:00";
        }


        if (progressBar) {
            progressBar.style.width =
                "0%";
        }


        if (duration) {
            duration.textContent =
                "0:00";
        }

    }


    /* =====================================================
       UPDATE PLAY BUTTON
    ===================================================== */

    function updatePlayButton() {

        if (!playButton) return;


        if (isPlaying) {

            playButton.textContent =
                "Ⅱ";

            playButton.setAttribute(
                "aria-label",
                "Pause"
            );

        } else {

            playButton.textContent =
                "▶";

            playButton.setAttribute(
                "aria-label",
                "Play"
            );

        }

    }


    /* =====================================================
       START CURRENT SONG
    ===================================================== */

    function playCurrentSong() {

        if (
            !widgetReady ||
            !widget
        ) {
            return;
        }

        widget.play();

    }


    /* =====================================================
       AUTOMATIC MUSIC START
    ===================================================== */

    function startMusicAutomatically() {

        if (
            !widgetReady ||
            !widget
        ) {
            return;
        }


        if (musicStarted) {
            return;
        }


        musicStarted = true;

        musicAreaWasEntered = true;


        console.log(
            "Music area entered — starting music."
        );


        /*
         * First make sure the correct song is loaded.
         */

        loadSong(
            currentSong,
            true
        );

    }


    /* =====================================================
       LOAD SONG
    ===================================================== */

    function loadSong(
        index,
        autoplay = true
    ) {

        if (
            !widgetReady ||
            !widget
        ) {
            return;
        }


        if (!songs[index]) {
            return;
        }


        if (
            switchingSong &&
            index === currentSong
        ) {
            return;
        }


        currentSong = index;

        switchingSong = true;

        isPlaying = false;


        updateSongUI();

        updatePlayButton();


        if (musicDisc) {

            musicDisc.classList.remove(
                "spinning"
            );

        }


        if (floatingMusicButton) {

            floatingMusicButton.classList.remove(
                "playing"
            );

        }


        const song =
            songs[currentSong];


        console.log(
            "Loading song:",
            song.title
        );


        widget.load(
            song.url,
            {

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


                    updateSongUI();


                    if (autoplay) {

                        /*
                         * Give SoundCloud a moment to
                         * finish loading before playing.
                         */

                        setTimeout(
                            () => {

                                if (
                                    widget &&
                                    widgetReady
                                ) {

                                    widget.play();

                                }

                            },
                            250
                        );

                    }


                    setTimeout(
                        () => {

                            updateDuration();

                        },
                        700
                    );

                }

            }
        );

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

                    event.stopPropagation();


                    userHasInteracted = true;


                    /*
                     * Same song = pause/play.
                     */

                    if (
                        index === currentSong &&
                        isPlaying
                    ) {

                        widget.pause();

                        return;

                    }


                    /*
                     * Different song = load + autoplay.
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

                userHasInteracted = true;


                if (
                    !widgetReady ||
                    !widget
                ) {
                    return;
                }


                if (isPlaying) {

                    widget.pause();

                } else {

                    widget.play();

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

                userHasInteracted = true;

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
            () => {

                userHasInteracted = true;

                previousSong();

            }
        );

    }


    /* =====================================================
       PROGRESS BAR
    ===================================================== */

    if (progressTrack) {

        progressTrack.addEventListener(
            "click",
            (event) => {

                if (
                    !widgetReady ||
                    !widget
                ) {
                    return;
                }


                const rect =
                    progressTrack.getBoundingClientRect();


                const clickPosition =
                    event.clientX -
                    rect.left;


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


                        const seekTo =
                            milliseconds *
                            percentage;


                        widget.seekTo(
                            seekTo
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
       MUSIC AREA OBSERVER
       
       Starts the song once the music section
       becomes visible.
    ===================================================== */

    if (musicSection) {

        const musicObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting &&
                                entry.intersectionRatio >= 0.25
                            ) {

                                console.log(
                                    "Music section visible."
                                );


                                /*
                                 * Only start automatically
                                 * after the user has interacted
                                 * with the page.
                                 */

                                if (
                                    userHasInteracted &&
                                    !musicStarted &&
                                    widgetReady
                                ) {

                                    startMusicAutomatically();

                                }

                            }

                        }
                    );

                },
                {
                    threshold: [
                        0.25,
                        0.5
                    ]
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


            if (
                event.code === "Space" &&
                tag !== "INPUT" &&
                tag !== "TEXTAREA" &&
                tag !== "BUTTON"
            ) {

                event.preventDefault();

                userHasInteracted = true;


                if (isPlaying) {

                    widget.pause();

                } else {

                    widget.play();

                }

            }


            if (
                event.code === "ArrowRight"
            ) {

                userHasInteracted = true;

                nextSong(true);

            }


            if (
                event.code === "ArrowLeft"
            ) {

                userHasInteracted = true;

                previousSong();

            }

        }
    );


    /* =====================================================
       START SOUNDCLOUD
    ===================================================== */

    waitForSoundCloud();

});
