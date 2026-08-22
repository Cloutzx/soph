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
             * The opening button counts as a real user interaction.
             * Once the player is ready, allow the music section
             * to autoplay without requiring another click.
             */
            if (playerReady && musicSectionVisible && !playing) {
                player.play();
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
            url:
                "https://soundcloud.com/fontainesdublin/i-love-you"
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
       PLAYER STATE
    ===================================================== */

    let player = null;

    let playerReady = false;

    let playing = false;

    let currentIndex = 0;

    let userInteracted = false;

    let currentLoadToken = 0;

    let musicSectionVisible = false;

    let musicWasPlayingBeforeLeaving = false;


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

        songButtons.forEach((button, index) => {

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

        });

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
       PLAY CURRENT SONG
    ===================================================== */

    function playCurrentSong() {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        player.play();

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

                updateFloatingButton();

                resetProgress();

                getDuration();


                /*
                 * If the visitor has already opened the site
                 * and the music section is visible, start
                 * immediately.
                 */

                if (
                    siteOpened &&
                    musicSectionVisible &&
                    !playing
                ) {

                    player.play();

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

                playing = false;

                updatePlayButton();

                updateDisc();

                updateFloatingButton();

                /*
                 * Automatically move to the next song.
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
        shouldPlay = true
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
         * Every request gets a unique token.
         * This prevents an old load from affecting
         * a newer song selection.
         */

        const loadToken =
            ++currentLoadToken;


        currentIndex = index;

        userInteracted = true;


        /*
         * Update the interface immediately.
         */

        playing = false;

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
         * THIS IS THE IMPORTANT PART.
         *
         * SoundCloud loads the new track and is told
         * to autoplay as part of the SAME load request.
         *
         * No 700ms timeout.
         */

        player.load(
            song.url,
            {
                auto_play: shouldPlay,

                hide_related: true,

                show_comments: false,

                show_user: false,

                show_reposts: false,

                visual: false
            }
        );


        /*
         * Get the duration shortly after the new
         * track has loaded.
         *
         * This does NOT control playback.
         */

        setTimeout(
            () => {

                if (
                    loadToken !==
                    currentLoadToken
                ) {
                    return;
                }

                getDuration();

            },
            300
        );

    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong(
        automatic = false
    ) {

        if (!playerReady) {
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
         * Immediately load and play
         * the previous song.
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
                     * Clicking the currently selected
                     * song toggles play/pause.
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
                     * switch immediately
                     * + autoplay immediately
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
       MUSIC SECTION OBSERVER
    ===================================================== */

    if (musicSection) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    const entry =
                        entries[0];


                    musicSectionVisible =
                        entry.isIntersecting;


                    /* =====================================
                       ENTERING MUSIC SECTION
                    ===================================== */

                    if (
                        musicSectionVisible
                    ) {

                        /*
                         * If the player is ready and the
                         * site has been opened, automatically
                         * play the current song.
                         */

                        if (
                            siteOpened &&
                            playerReady &&
                            !playing
                        ) {

                            userInteracted = true;

                            player.play();

                        }

                    }


                    /* =====================================
                       LEAVING MUSIC SECTION
                    ===================================== */

                    else {

                        /*
                         * Remember whether music was playing.
                         */

                        if (
                            playerReady &&
                            playing
                        ) {

                            musicWasPlayingBeforeLeaving =
                                true;

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
