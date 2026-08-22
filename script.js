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
       UPDATE SONG INFORMATION
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
       FLOATING BUTTON STATE
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
       CHECK IF TRACK IS READY
    ===================================================== */

    function waitForTrackAndPlay(loadToken) {

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

        let attempts = 0;

        const maxAttempts = 40;

        const check = () => {

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

            attempts++;

            player.getCurrentSound(
                (sound) => {

                    if (
                        loadToken !== currentLoadToken
                    ) {
                        return;
                    }

                    /*
                     * SoundCloud has successfully
                     * loaded the track.
                     */
                    if (
                        sound &&
                        sound.permalink_url
                    ) {

                        console.log(
                            "Track ready:",
                            sound.title
                        );

                        loadingSong = false;

                        /*
                         * Play immediately.
                         */
                        player.play();

                        /*
                         * Get duration shortly after
                         * the track becomes available.
                         */
                        setTimeout(
                            () => {

                                if (
                                    loadToken ===
                                    currentLoadToken
                                ) {
                                    getDuration();
                                }

                            },
                            150
                        );

                        return;

                    }


                    /*
                     * Track isn't ready yet.
                     * Check again very shortly.
                     */
                    if (
                        attempts < maxAttempts
                    ) {

                        setTimeout(
                            check,
                            100
                        );

                    } else {

                        loadingSong = false;

                        console.warn(
                            "SoundCloud track failed to become ready:",
                            songs[currentIndex].title
                        );

                    }

                }
            );

        };

        check();

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

                resetProgress();

                /*
                 * Load the first song.
                 */
                if (!firstSongLoaded) {

                    firstSongLoaded = true;

                    loadSong(
                        currentIndex,
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

                playing = true;

                loadingSong = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

                console.log(
                    "Playing:",
                    songs[currentIndex].title
                );

            }
        );


        /* =================================================
           PAUSE
        ================================================= */

        player.bind(
            SC.Widget.Events.PAUSE,
            () => {

                playing = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

            }
        );


        /* =================================================
           FINISHED
        ================================================= */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                console.log(
                    "Finished:",
                    songs[currentIndex].title
                );

                playing = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

                /*
                 * Automatically move to the
                 * next song.
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

            player.pause();

        } else {

            /*
             * If we're currently loading a song,
             * don't create another play request.
             */
            if (loadingSong) {
                return;
            }

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
         * Every load receives a unique token.
         *
         * If the user clicks another song before
         * this one finishes loading, the old request
         * becomes invalid.
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


        /*
         * Update UI immediately.
         */
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
         * Load the new SoundCloud track.
         *
         * auto_play is intentionally enabled,
         * but we ALSO explicitly call player.play()
         * once SoundCloud confirms the track exists.
         */
        player.load(
            song.url,
            {
                auto_play: true,

                hide_related: true,

                show_comments: false,

                show_user: false,

                show_reposts: false,

                visual: false
            }
        );


        /*
         * Wait for the actual track to become
         * available instead of guessing with
         * a 700ms timeout.
         */
        waitForTrackAndPlay(
            loadToken
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
                     * Same song:
                     *
                     * Play/pause instead of
                     * reloading the track.
                     */
                    if (
                        index === currentIndex
                    ) {

                        togglePlay();

                        return;

                    }


                    /*
                     * Different song:
                     *
                     * Immediately load and play it.
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
       PROGRESS BAR CLICK / SEEK
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
       PLAY WHEN ENTERING MUSIC SECTION
       PAUSE WHEN LEAVING
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
                     * ENTERING MUSIC SECTION
                     */
                    if (
                        musicSectionVisible
                    ) {

                        /*
                         * Automatically play when
                         * the user reaches the music
                         * section after opening the site.
                         */
                        if (
                            siteOpened &&
                            playerReady &&
                            !playing &&
                            !loadingSong
                        ) {

                            userInteracted =
                                true;

                            player.play();

                        }

                    }


                    /*
                     * LEAVING MUSIC SECTION
                     */
                    else {

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
                     * Force animation restart.
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
