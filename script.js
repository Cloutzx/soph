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

    let pageOpened = false;

    if (openButton) {
        openButton.addEventListener("click", () => {

            pageOpened = true;

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

        console.warn(
            "SoundCloud iframe was not found."
        );

        return;

    }


    /* =====================================================
       SONG DATA

       IMPORTANT:
       These are the actual SoundCloud URLs.
    ===================================================== */

    const songs = [

        {
            title: "I Love You",
            artist: "Fontaines D.C.",

            /*
             * Actual track resource from the
             * SoundCloud embed.
             */
            url:
                "https://api.soundcloud.com/tracks/soundcloud:tracks:1178495929"
        },


        {
            title: "You'll Be Mine Tonight",
            artist: "Freddie",

            url:
                "https://soundcloud.com/user-101510492/youll-be-mine-tonight-freddie"
        },


        {
            title: "Moonlight on the River",
            artist: "Mac DeMarco",

            url:
                "https://soundcloud.com/user-917397187-731881398/mac-demarco-moonlight-on-the-river-slowed"
        }

    ];


    /* =====================================================
       MUSIC STATE
    ===================================================== */

    let widget = null;

    let widgetReady = false;

    let currentSong = 0;

    let isPlaying = false;

    let loadingSong = false;

    let musicStarted = false;

    let userInteracted = false;


    /* =====================================================
       SOUNDCOULD WIDGET INITIALIZATION
    ===================================================== */

    function initializeSoundCloud() {

        /*
         * Make sure the SoundCloud Widget API exists.
         */

        if (typeof SC === "undefined") {

            console.error(
                "SoundCloud Widget API is not loaded."
            );

            return;

        }


        /*
         * Create the widget.
         */

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
                 * Get initial duration.
                 */

                setTimeout(() => {

                    updateDuration();

                }, 500);

            }
        );


        /* =================================================
           PLAY
        ================================================= */

        widget.bind(
            SC.Widget.Events.PLAY,
            () => {

                isPlaying = true;

                loadingSong = false;

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

                loadingSong = false;

                updatePlayButton();

                if (musicDisc) {

                    musicDisc.classList.remove(
                        "playing"
                    );

                }

            }
        );


        /* =================================================
           FINISH
        ================================================= */

        widget.bind(
            SC.Widget.Events.FINISH,
            () => {

                isPlaying = false;

                loadingSong = false;

                updatePlayButton();

                if (musicDisc) {

                    musicDisc.classList.remove(
                        "playing"
                    );

                }

                /*
                 * Automatically move to the next song.
                 */

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
                    "SoundCloud playback error:",
                    error
                );

                loadingSong = false;

                isPlaying = false;

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

        if (
            !widget ||
            !widgetReady ||
            !duration
        ) {

            return;

        }

        widget.getDuration(
            (milliseconds) => {

                duration.textContent =
                    formatTime(
                        milliseconds
                    );

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
         * Highlight active song.
         */

        songButtons.forEach(
            (button, index) => {

                button.classList.toggle(
                    "active",
                    index === currentSong
                );

            }
        );


        /*
         * Reset progress.
         */

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
            !widget ||
            !widgetReady
        ) {

            return;

        }


        /*
         * Don't block the click with a long
         * loading lock.
         */

        try {

            widget.play();

        } catch (error) {

            console.error(
                "Could not play song:",
                error
            );

        }

    }


    /* =====================================================
       LOAD SONG
       
       This is the important part for switching
       between songs quickly.
    ===================================================== */

    function loadSong(
        index,
        autoplay = true
    ) {

        if (
            !widget ||
            !widgetReady
        ) {

            console.warn(
                "SoundCloud widget is not ready yet."
            );

            return;

        }


        if (!songs[index]) {

            return;

        }


        /*
         * Prevent invalid indexes.
         */

        currentSong = index;


        const song =
            songs[currentSong];


        /*
         * Immediately update the interface
         * before SoundCloud finishes loading.
         */

        updateSongUI();


        isPlaying = false;

        loadingSong = true;

        updatePlayButton();


        if (musicDisc) {

            musicDisc.classList.remove(
                "playing"
            );

        }


        /*
         * Load the new track.
         */

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

                show_artwork: false

            }
        );


        /*
         * The LOAD event isn't always exposed
         * consistently, so check for the new
         * widget state shortly after loading.
         */

        const playAfterLoad = () => {

            if (!widget) return;


            loadingSong = false;


            updateSongUI();


            updateDuration();


            if (autoplay) {

                try {

                    widget.play();

                } catch (error) {

                    console.error(
                        "Could not autoplay track:",
                        error
                    );

                }

            }

        };


        /*
         * Small delay gives SoundCloud enough
         * time to replace the current track.
         *
         * This prevents the common bug where
         * clicking multiple songs does nothing.
         */

        setTimeout(
            playAfterLoad,
            120
        );

    }


    /* =====================================================
       SONG BUTTONS
       
       Click once = immediately switch and play.
    ===================================================== */

    songButtons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    userInteracted = true;


                    /*
                     * If clicking the currently
                     * playing song, pause it.
                     */

                    if (
                        index === currentSong &&
                        isPlaying
                    ) {

                        if (widget) {

                            widget.pause();

                        }

                        return;

                    }


                    /*
                     * Otherwise immediately
                     * switch to the selected song.
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
       PLAY / PAUSE BUTTON
    ===================================================== */

    if (playButton) {

        playButton.addEventListener(
            "click",
            () => {

                userInteracted = true;


                if (
                    !widget ||
                    !widgetReady
                ) {

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
            nextIndex >=
            songs.length
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

                userInteracted = true;

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

                userInteracted = true;

                previousSong();

            }
        );

    }


    /* =====================================================
       PROGRESS BAR SEEKING
    ===================================================== */

    if (progressTrack) {

        progressTrack.addEventListener(
            "click",
            (event) => {

                if (
                    !widget ||
                    !widgetReady
                ) {

                    return;

                }


                const rect =
                    progressTrack
                        .getBoundingClientRect();


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

                musicSection.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "center"
                    }
                );

            }
        );

    }


    /* =====================================================
       AUTO PLAY WHEN ENTERING MUSIC AREA
       
       Browser autoplay restrictions mean the page
       needs user interaction first. Your opening
       button counts as that interaction.
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
                                widgetReady &&
                                userInteracted
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
       OPENING BUTTON ALSO UNLOCKS MUSIC
       
       This means when you click "open this ♡",
       the browser has received user interaction.
    ===================================================== */

    if (openButton) {

        openButton.addEventListener(
            "click",
            () => {

                userInteracted = true;

            }
        );

    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                !widget ||
                !widgetReady
            ) {

                return;

            }


            /*
             * SPACE = PLAY / PAUSE
             */

            if (
                event.code === "Space"
            ) {

                const tag =
                    document.activeElement
                        ?.tagName;


                if (
                    tag === "INPUT" ||
                    tag === "TEXTAREA" ||
                    tag === "BUTTON"
                ) {

                    return;

                }


                event.preventDefault();

                userInteracted = true;


                if (isPlaying) {

                    widget.pause();

                } else {

                    widget.play();

                }

            }


            /*
             * RIGHT ARROW = NEXT
             */

            if (
                event.code ===
                "ArrowRight"
            ) {

                userInteracted = true;

                nextSong(true);

            }


            /*
             * LEFT ARROW = PREVIOUS
             */

            if (
                event.code ===
                "ArrowLeft"
            ) {

                userInteracted = true;

                previousSong();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    initializeSoundCloud();

});
