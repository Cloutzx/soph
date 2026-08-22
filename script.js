document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       OPENING
    ===================================================== */

    const opening = document.getElementById("opening");
    const openButton = document.getElementById("openButton");
    const main = document.getElementById("main");

    let siteOpened = false;

    if (openButton) {
        openButton.addEventListener("click", () => {

            siteOpened = true;

            if (opening) {
                opening.classList.add("opening-hidden");
            }

            if (main) {
                setTimeout(() => {
                    main.classList.add("main-visible");
                }, 250);
            }

        });
    }


    /* =====================================================
       MUSIC ELEMENTS
    ===================================================== */

    const iframe =
        document.getElementById("soundcloud-player");

    const musicSection =
        document.getElementById("musicSection");

    const musicDisc =
        document.getElementById("musicDisc");

    const playButton =
        document.getElementById("playButton");

    const nextButton =
        document.getElementById("nextButton");

    const previousButton =
        document.getElementById("previousButton");

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

    const songButtons =
        document.querySelectorAll(".music-song");

    const floatingMusicButton =
        document.getElementById("floatingMusicButton");


    /* =====================================================
       SONG DATA
    ===================================================== */

    const songs = [

        {
            title: "I Love You",
            artist: "Fontaines D.C.",
            url: "https://soundcloud.com/fontainesdublin/i-love-you"
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
       MUSIC STATE
    ===================================================== */

    let player = null;

    let playerReady = false;

    let playing = false;

    let currentIndex = 0;

    let userInteracted = false;

    let loadingSong = false;


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log("♡ Music system starting...");

    console.log("SoundCloud iframe:", iframe);
    console.log("Play button:", playButton);
    console.log("Next button:", nextButton);
    console.log("Previous button:", previousButton);
    console.log("Song buttons:", songButtons.length);


    if (!iframe) {

        console.error(
            "❌ #soundcloud-player was not found."
        );

        return;
    }


    /* =====================================================
       LOAD SOUNDCLOUD API
    ===================================================== */

    function loadSoundCloudAPI() {

        return new Promise((resolve, reject) => {

            if (
                window.SC &&
                window.SC.Widget
            ) {

                resolve();
                return;

            }


            const existingScript =
                document.querySelector(
                    'script[src="https://w.soundcloud.com/player/api.js"]'
                );


            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    resolve
                );

                existingScript.addEventListener(
                    "error",
                    reject
                );

                return;

            }


            const script =
                document.createElement("script");

            script.src =
                "https://w.soundcloud.com/player/api.js";

            script.onload = () => {
                resolve();
            };

            script.onerror = () => {

                console.error(
                    "❌ Could not load SoundCloud API."
                );

                reject(
                    new Error(
                        "SoundCloud API failed"
                    )
                );

            };

            document.head.appendChild(script);

        });

    }


    /* =====================================================
       INITIALIZE SOUNDCLOUD
    ===================================================== */

    async function initializeMusic() {

        try {

            await loadSoundCloudAPI();

        } catch (error) {

            console.error(error);

            return;

        }


        if (
            !window.SC ||
            !window.SC.Widget
        ) {

            console.error(
                "❌ SoundCloud Widget API is unavailable."
            );

            return;
        }


        player =
            SC.Widget(iframe);


        /* ---------------------------------------------
           READY
        --------------------------------------------- */

        player.bind(
            SC.Widget.Events.READY,
            () => {

                console.log(
                    "✓ SoundCloud player ready"
                );

                playerReady = true;

                updateSongUI();

                updatePlayButton();

                updateDuration();

            }
        );


        /* ---------------------------------------------
           PLAY
        --------------------------------------------- */

        player.bind(
            SC.Widget.Events.PLAY,
            () => {

                playing = true;

                loadingSong = false;

                updatePlayButton();

                if (musicDisc) {

                    musicDisc.classList.add(
                        "spinning"
                    );

                }

                if (floatingMusicButton) {

                    floatingMusicButton.classList.add(
                        "playing"
                    );

                }

            }
        );


        /* ---------------------------------------------
           PAUSE
        --------------------------------------------- */

        player.bind(
            SC.Widget.Events.PAUSE,
            () => {

                playing = false;

                loadingSong = false;

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

            }
        );


        /* ---------------------------------------------
           FINISH
        --------------------------------------------- */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                playing = false;

                updatePlayButton();

                if (musicDisc) {

                    musicDisc.classList.remove(
                        "spinning"
                    );

                }

                nextSong();

            }
        );


        /* ---------------------------------------------
           PROGRESS
        --------------------------------------------- */

        player.bind(
            SC.Widget.Events.PLAY_PROGRESS,
            (data) => {

                updateProgress(data);

            }
        );

    }


    /* =====================================================
       UPDATE SONG UI
    ===================================================== */

    function updateSongUI() {

        const song =
            songs[currentIndex];


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

                const active =
                    index === currentIndex;


                button.classList.toggle(
                    "active",
                    active
                );


                button.classList.toggle(
                    "song-main",
                    active
                );

            }
        );

    }


    /* =====================================================
       PLAY BUTTON UI
    ===================================================== */

    function updatePlayButton() {

        if (!playButton) {
            return;
        }


        playButton.textContent =
            playing ? "Ⅱ" : "▶";


        playButton.setAttribute(
            "aria-label",
            playing ? "Pause" : "Play"
        );

    }


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    function togglePlay() {

        if (!player || !playerReady) {

            console.warn(
                "SoundCloud player isn't ready yet."
            );

            return;

        }


        userInteracted = true;


        if (playing) {

            player.pause();

        } else {

            player.play();

        }

    }


    if (playButton) {

        playButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                togglePlay();

            }
        );

    }


    /* =====================================================
       LOAD SONG
    ===================================================== */

    function loadSong(index, autoPlay = false) {

        if (!player || !playerReady) {

            console.warn(
                "Cannot load song — player isn't ready."
            );

            return;

        }


        if (
            index < 0 ||
            index >= songs.length
        ) {

            return;

        }


        currentIndex = index;

        loadingSong = true;

        playing = false;


        if (musicDisc) {

            musicDisc.classList.remove(
                "spinning"
            );

        }


        updateSongUI();

        updatePlayButton();


        if (currentTime) {
            currentTime.textContent = "0:00";
        }


        if (duration) {
            duration.textContent = "0:00";
        }


        if (progressBar) {
            progressBar.style.width = "0%";
        }


        const song =
            songs[currentIndex];


        console.log(
            "Loading song:",
            song.title
        );


        /*
         * IMPORTANT:
         * We use player.load() instead of creating
         * another iframe. This prevents songs from
         * overlapping.
         */

        player.load(
            song.url,
            {
                auto_play: false,
                hide_related: true,
                show_comments: false,
                show_user: false,
                show_reposts: false,
                visual: false
            }
        );


        /*
         * SoundCloud needs a moment to load the new
         * track before play() works.
         */

        if (autoPlay) {

            let attempts = 0;

            const tryPlaying = () => {

                attempts++;


                if (
                    player &&
                    playerReady
                ) {

                    player.play();

                }


                if (
                    attempts < 5 &&
                    !playing
                ) {

                    setTimeout(
                        tryPlaying,
                        700
                    );

                }

            };


            setTimeout(
                tryPlaying,
                900
            );

        }

    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong() {

        if (!player || !playerReady) {
            return;
        }


        userInteracted = true;


        let nextIndex =
            currentIndex + 1;


        if (
            nextIndex >= songs.length
        ) {

            nextIndex = 0;

        }


        loadSong(
            nextIndex,
            true
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                nextSong();

            }
        );

    }


    /* =====================================================
       PREVIOUS SONG
    ===================================================== */

    function previousSong() {

        if (!player || !playerReady) {
            return;
        }


        userInteracted = true;


        let previousIndex =
            currentIndex - 1;


        if (
            previousIndex < 0
        ) {

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
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                previousSong();

            }
        );

    }


    /* =====================================================
       CLICK SONG FROM WHEEL
    ===================================================== */

    songButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    const index =
                        Number(
                            button.dataset.song
                        );


                    if (
                        Number.isNaN(index)
                    ) {

                        console.warn(
                            "Invalid song index."
                        );

                        return;

                    }


                    userInteracted = true;


                    /*
                     * Clicking the currently playing
                     * song pauses it.
                     */

                    if (
                        index === currentIndex &&
                        playing
                    ) {

                        player.pause();

                        return;

                    }


                    /*
                     * Clicking the current song while
                     * paused starts it.
                     */

                    if (
                        index === currentIndex &&
                        !playing
                    ) {

                        player.play();

                        return;

                    }


                    /*
                     * Different song.
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
       GET DURATION
    ===================================================== */

    function updateDuration() {

        if (!player) {
            return;
        }


        player.getDuration(
            (milliseconds) => {

                if (
                    milliseconds &&
                    milliseconds > 0
                ) {

                    if (duration) {

                        duration.textContent =
                            formatTime(
                                milliseconds
                            );

                    }

                }

            }
        );

    }


    /* =====================================================
       PROGRESS
    ===================================================== */

    function updateProgress(data) {

        if (!data) {
            return;
        }


        const current =
            data.currentPosition || 0;


        const total =
            data.duration || 0;


        if (currentTime) {

            currentTime.textContent =
                formatTime(current);

        }


        if (
            duration &&
            total > 0
        ) {

            duration.textContent =
                formatTime(total);

        }


        if (
            progressBar &&
            total > 0
        ) {

            const percentage =
                (current / total) * 100;


            progressBar.style.width =
                Math.min(
                    100,
                    Math.max(
                        0,
                        percentage
                    )
                ) + "%";

        }

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
       CLICK PROGRESS BAR
    ===================================================== */

    if (progressTrack) {

        progressTrack.addEventListener(
            "click",
            (event) => {

                if (
                    !player ||
                    !playerReady
                ) {

                    return;

                }


                userInteracted = true;


                const rect =
                    progressTrack.getBoundingClientRect();


                const clickPosition =
                    event.clientX -
                    rect.left;


                const percentage =
                    clickPosition /
                    rect.width;


                const safePercentage =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            percentage
                        )
                    );


                player.getDuration(
                    (milliseconds) => {

                        if (
                            !milliseconds
                        ) {

                            return;

                        }


                        player.seekTo(
                            milliseconds *
                            safePercentage
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       MUSIC SECTION
       PLAY WHEN ENTERING
       PAUSE WHEN LEAVING
    ===================================================== */

    if (musicSection) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    const entry =
                        entries[0];


                    if (
                        entry.isIntersecting
                    ) {

                        /*
                         * Only automatically play after
                         * the user has interacted with
                         * the site/music.
                         */

                        if (
                            siteOpened &&
                            userInteracted &&
                            playerReady &&
                            !playing
                        ) {

                            player.play();

                        }

                    } else {

                        if (
                            playerReady &&
                            playing
                        ) {

                            player.pause();

                        }

                    }

                },
                {
                    threshold: 0.35
                }
            );


        observer.observe(
            musicSection
        );

    }


    /* =====================================================
       FLOATING MUSIC BUTTON
    ===================================================== */

    if (floatingMusicButton) {

        floatingMusicButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                togglePlay();

            }
        );

    }


    /* =====================================================
       STARS
    ===================================================== */

    const stars =
        document.querySelectorAll(".star");

    const starMessage =
        document.getElementById("starMessage");


    stars.forEach(
        (star) => {

            star.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    const message =
                        star.dataset.message;


                    if (
                        !starMessage ||
                        !message
                    ) {

                        return;

                    }


                    starMessage.textContent =
                        message;


                    starMessage.classList.remove(
                        "show"
                    );


                    /*
                     * Force the browser to notice
                     * the class change so every star
                     * animation works correctly.
                     */

                    void starMessage.offsetWidth;


                    starMessage.classList.add(
                        "show"
                    );


                    clearTimeout(
                        starMessage.hideTimer
                    );


                    starMessage.hideTimer =
                        setTimeout(
                            () => {

                                starMessage.classList.remove(
                                    "show"
                                );

                            },
                            4500
                        );

                }
            );

        }
    );


    /* =====================================================
       SECRET MESSAGE
    ===================================================== */

    const secretButton =
        document.getElementById(
            "secretButton"
        );

    const secretMessage =
        document.getElementById(
            "secretMessage"
        );


    if (
        secretButton &&
        secretMessage
    ) {

        secretButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    secretMessage.classList.contains(
                        "show"
                    );


                if (isOpen) {

                    secretMessage.classList.remove(
                        "show"
                    );


                    secretButton.textContent =
                        "there's something here";

                } else {

                    secretMessage.classList.add(
                        "show"
                    );


                    secretButton.textContent =
                        "hide it ♡";

                }

            }
        );

    }


    /* =====================================================
       START MUSIC SYSTEM
    ===================================================== */

    initializeMusic();

});
