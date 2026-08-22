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
       SONGS
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
       PLAYER STATE
    ===================================================== */

    let player = null;

    let playerReady = false;

    let playing = false;

    let currentIndex = 0;

    let userInteracted = false;

    let currentLoadToken = 0;

    let musicSectionVisible = false;

    let loadingSong = false;

    let firstSongLoaded = false;

    let playAttempts = 0;

    let playRetryTimer = null;


    /* =====================================================
       SOUNDCLOUD API
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

            const existing =
                document.querySelector(
                    'script[src="https://w.soundcloud.com/player/api.js"]'
                );

            if (existing) {

                existing.addEventListener(
                    "load",
                    resolve,
                    { once: true }
                );

                existing.addEventListener(
                    "error",
                    reject,
                    { once: true }
                );

                return;
            }

            const script =
                document.createElement("script");

            script.src =
                "https://w.soundcloud.com/player/api.js";

            script.onload = resolve;

            script.onerror = reject;

            document.head.appendChild(script);

        });

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

        if (progressTrack) {
            progressTrack.style.setProperty(
                "--progress",
                "0%"
            );
        }

    }


    /* =====================================================
       UPDATE SONG UI
    ===================================================== */

    function updateSongUI() {

        const song =
            songs[currentIndex];

        if (!song) {
            return;
        }

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
       PLAY BUTTON
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
       MUSIC DISC
    ===================================================== */

    function updateDisc() {

        if (!musicDisc) {
            return;
        }

        musicDisc.classList.toggle(
            "spinning",
            playing
        );

    }


    /* =====================================================
       FLOATING BUTTON
    ===================================================== */

    function updateFloatingButton() {

        if (!floatingMusicButton) {
            return;
        }

        floatingMusicButton.classList.toggle(
            "playing",
            playing
        );

    }


    /* =====================================================
       GET DURATION
    ===================================================== */

    function getDuration() {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        player.getDuration(
            (milliseconds) => {

                if (
                    milliseconds &&
                    milliseconds > 0 &&
                    duration
                ) {

                    duration.textContent =
                        formatTime(milliseconds);

                }

            }
        );

    }


    /* =====================================================
       UPDATE PROGRESS
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
            total > 0 &&
            duration
        ) {

            duration.textContent =
                formatTime(total);

        }


        if (
            total > 0 &&
            progressBar
        ) {

            const percentage =
                Math.min(
                    100,
                    Math.max(
                        0,
                        (current / total) * 100
                    )
                );

            progressBar.style.width =
                percentage + "%";

            if (progressTrack) {

                progressTrack.style.setProperty(
                    "--progress",
                    percentage + "%"
                );

            }

        }

    }


    /* =====================================================
       STOP PLAY RETRIES
    ===================================================== */

    function stopPlayRetries() {

        if (playRetryTimer) {

            clearTimeout(
                playRetryTimer
            );

            playRetryTimer = null;

        }

        playAttempts = 0;

    }


    /* =====================================================
       RELIABLE PLAY
    ===================================================== */

    function reliablePlay(loadToken) {

        if (
            loadToken !== currentLoadToken
        ) {
            return;
        }

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        if (playing) {
            return;
        }

        playAttempts++;

        console.log(
            "Play attempt:",
            playAttempts,
            songs[currentIndex].title
        );


        player.play();


        /*
         * If SoundCloud hasn't started playback yet,
         * try again very shortly.
         *
         * This is intentionally limited so we don't
         * hammer the player.
         */
        if (
            playAttempts < 15
        ) {

            playRetryTimer =
                setTimeout(
                    () => {

                        if (
                            loadToken !==
                            currentLoadToken
                        ) {
                            return;
                        }

                        if (!playing) {

                            reliablePlay(
                                loadToken
                            );

                        }

                    },
                    150
                );

        }

    }


    /* =====================================================
       INITIALIZE PLAYER
    ===================================================== */

    async function initializeMusic() {

        if (!iframe) {

            console.error(
                "SoundCloud iframe was not found."
            );

            return;

        }


        try {

            await loadSoundCloudAPI();

        } catch (error) {

            console.error(
                "Could not load SoundCloud API:",
                error
            );

            return;

        }


        player =
            SC.Widget(iframe);


        /* =================================================
           READY
        ================================================= */

        player.bind(
            SC.Widget.Events.READY,
            () => {

                console.log(
                    "SoundCloud player ready."
                );

                playerReady = true;

                updateSongUI();

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

                resetProgress();


                /*
                 * Load the first song once.
                 */
                if (!firstSongLoaded) {

                    firstSongLoaded = true;

                    loadSong(
                        0,
                        false
                    );

                }

            }
        );


        /* =================================================
           PLAY
        ================================================= */

        player.bind(
            SC.Widget.Events.PLAY,
            () => {

                stopPlayRetries();

                playing = true;

                loadingSong = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

                console.log(
                    "Playing:",
                    songs[currentIndex].title
                );

                getDuration();

            }
        );


        /* =================================================
           PAUSE
        ================================================= */

        player.bind(
            SC.Widget.Events.PAUSE,
            () => {

                stopPlayRetries();

                playing = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

            }
        );


        /* =================================================
           FINISH
        ================================================= */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                stopPlayRetries();

                playing = false;

                loadingSong = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

                console.log(
                    "Finished:",
                    songs[currentIndex].title
                );


                /*
                 * Automatically go to next song.
                 */
                nextSong(true);

            }
        );


        /* =================================================
           PROGRESS
        ================================================= */

        player.bind(
            SC.Widget.Events.PLAY_PROGRESS,
            (data) => {

                updateProgress(data);

            }
        );

    }


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    function togglePlay() {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        userInteracted = true;


        if (playing) {

            stopPlayRetries();

            player.pause();

        } else {

            /*
             * If a song is already being loaded,
             * let that load finish.
             */
            if (loadingSong) {
                return;
            }

            playAttempts = 0;

            reliablePlay(
                currentLoadToken
            );

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

    function loadSong(
        index,
        markInteraction = true
    ) {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        if (
            index < 0 ||
            index >= songs.length
        ) {
            return;
        }


        /*
         * Cancel all previous loading/play attempts.
         */
        stopPlayRetries();


        /*
         * New token invalidates every older
         * song-switch request.
         */
        const loadToken =
            ++currentLoadToken;


        currentIndex =
            index;

        playing =
            false;

        loadingSong =
            true;


        if (markInteraction) {
            userInteracted = true;
        }


        resetProgress();

        updateSongUI();

        updatePlayButton();

        updateDisc();

        updateFloatingButton();


        const song =
            songs[currentIndex];


        console.log(
            "Loading song:",
            song.title
        );


        /*
         * Load the actual SoundCloud URL.
         *
         * auto_play is false here because we want
         * our JavaScript to control exactly when
         * playback begins.
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
         * Give SoundCloud a tiny amount of time to
         * replace the current track, then begin our
         * controlled play attempts.
         */
        setTimeout(
            () => {

                if (
                    loadToken !==
                    currentLoadToken
                ) {
                    return;
                }

                if (
                    !player ||
                    !playerReady
                ) {
                    return;
                }


                /*
                 * Get the duration repeatedly while
                 * SoundCloud finishes loading.
                 */
                let durationAttempts = 0;


                const waitForDuration = () => {

                    if (
                        loadToken !==
                        currentLoadToken
                    ) {
                        return;
                    }

                    durationAttempts++;


                    player.getDuration(
                        (milliseconds) => {

                            if (
                                loadToken !==
                                currentLoadToken
                            ) {
                                return;
                            }


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


                                /*
                                 * Track is loaded enough
                                 * to start playback.
                                 */
                                loadingSong = false;

                                playAttempts = 0;

                                reliablePlay(
                                    loadToken
                                );

                                return;

                            }


                            /*
                             * Some SoundCloud tracks,
                             * especially slower-loading ones,
                             * need more time.
                             */
                            if (
                                durationAttempts <
                                30
                            ) {

                                setTimeout(
                                    waitForDuration,
                                    100
                                );

                            } else {

                                /*
                                 * Final fallback:
                                 * attempt playback anyway.
                                 */
                                loadingSong = false;

                                playAttempts = 0;

                                reliablePlay(
                                    loadToken
                                );

                            }

                        }
                    );

                };


                waitForDuration();

            },
            100
        );

    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong(
        automatic = false
    ) {

        if (
            !playerReady
        ) {
            return;
        }


        if (!automatic) {
            userInteracted = true;
        }


        let nextIndex =
            currentIndex + 1;


        if (
            nextIndex >= songs.length
        ) {
            nextIndex = 0;
        }


        /*
         * Immediately switch to the next song.
         */
        loadSong(
            nextIndex,
            !automatic
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                nextSong(false);

            }
        );

    }


    /* =====================================================
       PREVIOUS SONG
    ===================================================== */

    function previousSong() {

        if (
            !playerReady
        ) {
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
       SONG BUTTONS
    ===================================================== */

    songButtons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    userInteracted =
                        true;


                    /*
                     * Clicking the current song
                     * toggles play/pause.
                     */
                    if (
                        index === currentIndex
                    ) {

                        togglePlay();

                        return;

                    }


                    /*
                     * Different song:
                     * immediately switch and play.
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
       PROGRESS BAR / SEEK
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


                const rect =
                    progressTrack.getBoundingClientRect();


                const clickX =
                    event.clientX -
                    rect.left;


                const percentage =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            clickX /
                            rect.width
                        )
                    );


                player.getDuration(
                    (milliseconds) => {

                        if (
                            !milliseconds ||
                            milliseconds <= 0
                        ) {
                            return;
                        }


                        player.seekTo(
                            milliseconds *
                            percentage
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       MUSIC SECTION VISIBILITY
    ===================================================== */

    if (musicSection) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    const entry =
                        entries[0];


                    musicSectionVisible =
                        entry.isIntersecting;


                    /*
                     * ENTER MUSIC SECTION
                     */
                    if (
                        musicSectionVisible
                    ) {

                        /*
                         * Once the user has opened
                         * the site, automatically play
                         * when they reach the music area.
                         */
                        if (
                            siteOpened &&
                            playerReady &&
                            !playing &&
                            !loadingSong
                        ) {

                            userInteracted =
                                true;

                            playAttempts =
                                0;

                            reliablePlay(
                                currentLoadToken
                            );

                        }

                    }


                    /*
                     * LEAVE MUSIC SECTION
                     */
                    else {

                        if (
                            playerReady &&
                            playing
                        ) {

                            stopPlayRetries();

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
       HIDDEN STARS
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


                    if (!starMessage) {
                        return;
                    }


                    const message =
                        star.dataset.message;


                    if (!message) {
                        return;
                    }


                    starMessage.textContent =
                        message;


                    starMessage.classList.remove(
                        "show"
                    );


                    /*
                     * Restart animation.
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
        document.getElementById("secretButton");

    const secretMessage =
        document.getElementById("secretMessage");


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
