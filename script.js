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
       MUSIC
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
       STATE
    ===================================================== */

    let player = null;
    let playerReady = false;
    let playing = false;
    let currentIndex = 0;
    let userInteracted = false;
    let loadID = 0;


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
            script.onerror = reject;

            document.head.appendChild(script);

        });

    }


    /* =====================================================
       TIME
    ===================================================== */

    function formatTime(ms) {

        if (!ms || ms < 0) {
            return "0:00";
        }

        const seconds =
            Math.floor(ms / 1000);

        const minutes =
            Math.floor(seconds / 60);

        const remaining =
            seconds % 60;

        return (
            minutes +
            ":" +
            String(remaining).padStart(2, "0")
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

    }


    /* =====================================================
       RECORD
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
       DURATION
    ===================================================== */

    function updateDuration() {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        player.getDuration(
            (ms) => {

                if (
                    ms &&
                    duration
                ) {
                    duration.textContent =
                        formatTime(ms);
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

            const percent =
                Math.min(
                    100,
                    Math.max(
                        0,
                        current / total * 100
                    )
                );

            progressBar.style.width =
                percent + "%";

            if (progressTrack) {

                progressTrack.style.setProperty(
                    "--progress",
                    percent + "%"
                );

            }

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initializeMusic() {

        try {

            await loadSoundCloudAPI();

        } catch (error) {

            console.error(
                "SoundCloud API failed:",
                error
            );

            return;
        }


        if (!iframe) {
            return;
        }


        player =
            SC.Widget(iframe);


        /* -----------------------------------------------
           READY
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.READY,
            () => {

                playerReady = true;

                updateSongUI();

                updatePlayButton();

                resetProgress();

                updateDuration();

            }
        );


        /* -----------------------------------------------
           PLAY
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.PLAY,
            () => {

                playing = true;

                updatePlayButton();

                updateDisc();

                if (floatingMusicButton) {
                    floatingMusicButton.classList.add(
                        "playing"
                    );
                }

            }
        );


        /* -----------------------------------------------
           PAUSE
        ------------------------------------------------ */

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


        /* -----------------------------------------------
           FINISH
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                playing = false;

                updatePlayButton();

                updateDisc();

                nextSong();

            }
        );


        /* -----------------------------------------------
           PROGRESS
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.PLAY_PROGRESS,
            (data) => {

                updateProgress(data);

            }
        );

    }


    /* =====================================================
       PLAY
    ===================================================== */

    function playMusic() {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        userInteracted = true;

        player.play();

    }


    /* =====================================================
       PAUSE
    ===================================================== */

    function pauseMusic() {

        if (
            !player ||
            !playerReady
        ) {
            return;
        }

        player.pause();

    }


    /* =====================================================
       PLAY / PAUSE BUTTON
    ===================================================== */

    if (playButton) {

        playButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                userInteracted = true;

                if (playing) {

                    pauseMusic();

                } else {

                    playMusic();

                }

            }
        );

    }


    /* =====================================================
       LOAD NEW SONG
    ===================================================== */

    function loadSong(index) {

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
         * Give this load a unique ID.
         */

        const thisLoad =
            ++loadID;


        currentIndex =
            index;

        userInteracted =
            true;

        playing =
            false;


        /*
         * Immediately reset everything.
         */

        resetProgress();

        updateSongUI();

        updatePlayButton();

        updateDisc();


        const song =
            songs[index];


        /*
         * Load the new SoundCloud track.
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
         * SoundCloud needs a moment to replace
         * the current track.
         */

        const tryPlay = () => {

            if (
                thisLoad !== loadID
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
             * Tell SoundCloud to play.
             */

            player.play();

            /*
             * Ask for duration after playback begins.
             */

            setTimeout(
                updateDuration,
                700
            );

        };


        /*
         * First attempt.
         */

        setTimeout(
            tryPlay,
            500
        );


        /*
         * Backup attempt in case the track
         * takes longer to load.
         */

        setTimeout(
            tryPlay,
            1200
        );

    }


    /* =====================================================
       NEXT
    ===================================================== */

    function nextSong() {

        let next =
            currentIndex + 1;

        if (
            next >= songs.length
        ) {
            next = 0;
        }

        loadSong(next);

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
       PREVIOUS
    ===================================================== */

    function previousSong() {

        let previous =
            currentIndex - 1;

        if (
            previous < 0
        ) {
            previous =
                songs.length - 1;
        }

        loadSong(previous);

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
       SONG SELECTION
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
                     * pause/play.
                     */

                    if (
                        index === currentIndex
                    ) {

                        if (playing) {

                            pauseMusic();

                        } else {

                            playMusic();

                        }

                        return;
                    }


                    /*
                     * Different song:
                     * LOAD + AUTOPLAY.
                     */

                    loadSong(index);

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


                const position =
                    event.clientX -
                    rect.left;


                const percent =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            position /
                            rect.width
                        )
                    );


                player.getDuration(
                    (ms) => {

                        if (
                            !ms ||
                            ms <= 0
                        ) {
                            return;
                        }

                        player.seekTo(
                            ms * percent
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       MUSIC SECTION
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
                         * Only automatically start when
                         * the user has already interacted
                         * with the music.
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

                        /*
                         * Leaving the music section pauses it.
                         */

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
       FLOATING BUTTON
    ===================================================== */

    if (floatingMusicButton) {

        floatingMusicButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                userInteracted =
                    true;

                if (playing) {

                    pauseMusic();

                } else {

                    playMusic();

                }

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


                    if (!starMessage) {
                        return;
                    }


                    const message =
                        star.dataset.message;


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

                const open =
                    secretMessage.classList.contains(
                        "show"
                    );


                if (open) {

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
