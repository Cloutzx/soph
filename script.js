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

            /*
             * If the music section is already visible when
             * the opening is closed, allow music to start.
             */
            setTimeout(() => {
                tryAutoPlayIfVisible();
            }, 300);
        });
    }


    /* =====================================================
       MUSIC ELEMENTS
    ===================================================== */

    const iframe = document.getElementById("soundcloud-player");
    const musicSection = document.getElementById("musicSection");
    const musicDisc = document.getElementById("musicDisc");

    const playButton = document.getElementById("playButton");
    const nextButton = document.getElementById("nextButton");
    const previousButton = document.getElementById("previousButton");

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
            url: "https://soundcloud.com/fontainesdublin/i-love-you?si=feac8f98899e4093b9270cab7034708c&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
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

    let musicSectionVisible = false;

    /*
     * Used to prevent old loads from interfering with
     * a newer song.
     */
    let loadToken = 0;

    /*
     * Prevents multiple play commands from being sent
     * at the same time.
     */
    let playRequestPending = false;

    /*
     * Keeps track of whether we want the current song
     * to automatically play.
     */
    let shouldPlayAfterLoad = false;


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
       PLAY CURRENT TRACK
    ===================================================== */

    function playCurrentTrack() {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        if (playRequestPending) {
            return;
        }

        playRequestPending = true;

        try {

            player.play();

        } catch (error) {

            console.error(
                "SoundCloud play error:",
                error
            );

        }

        /*
         * SoundCloud normally fires PLAY almost instantly.
         * This timeout only releases the lock if something
         * went wrong.
         */
        setTimeout(() => {

            playRequestPending = false;

        }, 1000);

    }


    /* =====================================================
       AUTO PLAY IF VISIBLE
    ===================================================== */

    function tryAutoPlayIfVisible() {

        if (
            !siteOpened ||
            !musicSectionVisible ||
            !playerReady
        ) {
            return;
        }

        /*
         * The user has already interacted with the page/player.
         */
        if (userInteracted) {

            if (!playing) {
                playCurrentTrack();
            }

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


        /*
         * Create the SoundCloud widget.
         */
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

                getDuration();

                /*
                 * If the user already clicked something
                 * before SoundCloud finished loading,
                 * start now.
                 */
                if (
                    shouldPlayAfterLoad &&
                    siteOpened
                ) {

                    setTimeout(() => {

                        playCurrentTrack();

                    }, 50);

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

                playRequestPending = false;

                shouldPlayAfterLoad = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

            }
        );


        /* =================================================
           PAUSE
        ================================================= */

        player.bind(
            SC.Widget.Events.PAUSE,
            () => {

                playing = false;

                playRequestPending = false;

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

                playing = false;

                playRequestPending = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

                /*
                 * Automatically go to the next song.
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

            /*
             * Remember that the user wants music.
             */
            userInteracted = true;
            shouldPlayAfterLoad = true;

            return;
        }

        userInteracted = true;

        if (playing) {

            player.pause();

        } else {

            playCurrentTrack();

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

    function loadSong(index, autoplay = true) {

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
         * New token.
         */
        const thisLoadToken =
            ++loadToken;


        currentIndex = index;

        playing = false;

        playRequestPending = false;

        shouldPlayAfterLoad =
            autoplay;


        /*
         * Update interface immediately.
         */
        resetProgress();

        updateSongUI();

        updatePlayButton();

        updateDisc();

        updateFloatingButton();


        const song =
            songs[currentIndex];


        console.log(
            "Switching to:",
            song.title
        );


        /*
         * Tell SoundCloud to load the track.
         *
         * We deliberately do NOT use auto_play here.
         * SoundCloud can sometimes ignore auto_play while
         * another track is still changing.
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
         * SoundCloud loads asynchronously.
         *
         * Try to play repeatedly for a short period.
         * The token makes sure an old song can never
         * accidentally start after the user picked another.
         */
        if (autoplay) {

            const startTime =
                Date.now();

            const attemptPlay =
                () => {

                    if (
                        thisLoadToken !== loadToken
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
                     * If it already started, stop trying.
                     */
                    if (playing) {
                        return;
                    }

                    /*
                     * Don't keep trying forever.
                     */
                    if (
                        Date.now() - startTime >
                        5000
                    ) {

                        console.warn(
                            "SoundCloud took too long to start:",
                            song.title
                        );

                        return;

                    }

                    try {

                        player.play();

                    } catch (error) {

                        console.warn(
                            "Waiting for SoundCloud...",
                            error
                        );

                    }

                    setTimeout(
                        attemptPlay,
                        250
                    );

                };


            /*
             * First attempt is extremely quick.
             */
            setTimeout(
                attemptPlay,
                50
            );

        }


        /*
         * Refresh duration shortly after loading.
         */
        setTimeout(
            () => {

                if (
                    thisLoadToken !== loadToken
                ) {
                    return;
                }

                getDuration();

            },
            800
        );

    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong(fromFinish = false) {

        if (!playerReady) {
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

        /*
         * Always autoplay the next song.
         */
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

                userInteracted = true;

                nextSong();

            }
        );

    }


    /* =====================================================
       PREVIOUS SONG
    ===================================================== */

    function previousSong() {

        if (!playerReady) {
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

        /*
         * Immediately switch and play.
         */
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

                    userInteracted = true;


                    /*
                     * Same song:
                     * toggle pause/play.
                     */
                    if (
                        index === currentIndex
                    ) {

                        togglePlay();

                        return;

                    }


                    /*
                     * Different song:
                     * immediately switch and autoplay.
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
                            clickX / rect.width
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
                     * ENTERING MUSIC SECTION
                     *
                     * Once the site has been opened,
                     * automatically play the current song.
                     */
                    if (
                        musicSectionVisible
                    ) {

                        if (
                            siteOpened &&
                            playerReady &&
                            !playing
                        ) {

                            /*
                             * The page opening button counts
                             * as the user's interaction.
                             */
                            userInteracted = true;

                            playCurrentTrack();

                        }

                    }


                    /*
                     * LEAVING MUSIC SECTION
                     *
                     * Pause it so the music doesn't keep
                     * playing while they're elsewhere.
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
                    threshold: 0.25
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

                userInteracted = true;

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

    updateSongUI();

    updatePlayButton();

    updateDisc();

    updateFloatingButton();

    initializeMusic();

});
