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
       STATE
    ===================================================== */

    let player = null;

    let playerReady = false;

    let playing = false;

    let currentIndex = 0;

    let userInteracted = false;

    let changingSong = false;

    let playRequest = null;


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

            script.onerror = () => {
                reject(
                    new Error(
                        "SoundCloud API failed to load."
                    )
                );
            };

            document.head.appendChild(script);

        });

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
       UPDATE SONG UI
    ===================================================== */

    function updateSongUI() {

        const song = songs[currentIndex];

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
       UPDATE PLAY BUTTON
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
       UPDATE DISC
    ===================================================== */

    function updateDisc() {

        if (!musicDisc) {
            return;
        }

        if (playing) {

            musicDisc.classList.add(
                "spinning"
            );

        } else {

            musicDisc.classList.remove(
                "spinning"
            );

        }

    }


    /* =====================================================
       INITIALIZE SOUNDCLOUD
    ===================================================== */

    async function initializeMusic() {

        if (!iframe) {

            console.error(
                "SoundCloud iframe not found."
            );

            return;
        }

        try {

            await loadSoundCloudAPI();

        } catch (error) {

            console.error(
                "SoundCloud API error:",
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
                    "✓ SoundCloud player ready"
                );

                playerReady = true;

                updateSongUI();

                updatePlayButton();

                resetProgress();

                getDuration();

            }
        );


        /* =================================================
           PLAY
        ================================================= */

        player.bind(
            SC.Widget.Events.PLAY,
            () => {

                playing = true;

                changingSong = false;

                updatePlayButton();

                updateDisc();

                if (floatingMusicButton) {
                    floatingMusicButton.classList.add(
                        "playing"
                    );
                }

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

                if (floatingMusicButton) {
                    floatingMusicButton.classList.remove(
                        "playing"
                    );
                }

            }
        );


        /* =================================================
           FINISH
        ================================================= */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                playing = false;

                updatePlayButton();

                updateDisc();

                nextSong();

            }
        );


        /* =================================================
           PROGRESS
        ================================================= */

        player.bind(
            SC.Widget.Events.PLAY_PROGRESS,
            (data) => {

                if (!data) {
                    return;
                }

                updateProgress(data);

            }
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
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress(data) {

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
                (current / total) * 100;

            const safePercentage =
                Math.min(
                    100,
                    Math.max(
                        0,
                        percentage
                    )
                );

            progressBar.style.width =
                safePercentage + "%";


            if (progressTrack) {

                progressTrack.style.setProperty(
                    "--progress",
                    safePercentage + "%"
                );

            }

        }

    }


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    function togglePlay() {

        if (
            !player ||
            !playerReady
        ) {

            console.log(
                "Music player isn't ready yet."
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
       LOAD NEW SONG
    ===================================================== */

    function loadSong(
        index,
        autoPlay = true
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
         * Cancel any previous delayed play request.
         */

        if (playRequest) {

            clearTimeout(
                playRequest
            );

            playRequest = null;

        }


        changingSong = true;

        playing = false;

        currentIndex = index;


        /*
         * Update everything immediately.
         */

        resetProgress();

        updateSongUI();

        updatePlayButton();

        updateDisc();


        const song =
            songs[currentIndex];


        console.log(
            "Loading:",
            song.title
        );


        /*
         * Replace the current SoundCloud track.
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


        if (autoPlay) {

            /*
             * Wait for SoundCloud to finish replacing
             * the track, then play it.
             */

            playRequest =
                setTimeout(() => {

                    if (
                        player &&
                        playerReady
                    ) {

                        player.play();

                    }

                    playRequest = null;

                }, 500);

        }


        /*
         * Ask for the new duration a little later.
         * This makes the duration update correctly
         * after switching tracks.
         */

        setTimeout(() => {

            getDuration();

        }, 900);

    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong() {

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
                     * Same song = play/pause.
                     */

                    if (
                        index === currentIndex
                    ) {

                        togglePlay();

                        return;

                    }


                    /*
                     * Different song = immediately
                     * switch to it.
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
       PROGRESS BAR SEEK
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
        document.getElementById(
            "starMessage"
        );


    stars.forEach(
        (star) => {

            star.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        !starMessage
                    ) {
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
       START
    ===================================================== */

    initializeMusic();

});
