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

    let changingSong = false;

    let userInteracted = false;

    let musicVisible = false;


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
       UPDATE PLAYER UI
    ===================================================== */

    function updatePlayerUI() {

        if (playButton) {

            playButton.textContent =
                playing ? "Ⅱ" : "▶";

        }


        if (musicDisc) {

            musicDisc.classList.toggle(
                "spinning",
                playing
            );

        }


        if (floatingMusicButton) {

            floatingMusicButton.classList.toggle(
                "playing",
                playing
            );

        }

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
                    duration
                ) {

                    duration.textContent =
                        formatTime(
                            milliseconds
                        );

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

            const percent =
                Math.min(
                    100,
                    Math.max(
                        0,
                        (current / total) * 100
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
       LOAD SONG
       MOBILE FRIENDLY
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


        currentIndex =
            index;


        userInteracted =
            true;


        changingSong =
            true;


        const song =
            songs[index];


        /*
         * Stop the old song first.
         */

        player.pause();


        playing =
            false;


        /*
         * Reset the old song's UI immediately.
         */

        resetProgress();

        updateSongUI();

        updatePlayerUI();


        /*
         * Load the NEW song.
         *
         * auto_play:true is important here because
         * this function is called directly from a
         * user's tap/click.
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
         * The new track is loading.
         */

        setTimeout(
            () => {

                changingSong =
                    false;

                getDuration();

            },
            1000
        );

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
                     * DIFFERENT SONG
                     */

                    if (
                        index !== currentIndex
                    ) {

                        loadSong(index);

                        return;

                    }


                    /*
                     * SAME SONG
                     */

                    if (playing) {

                        pauseMusic();

                    } else {

                        playMusic();

                    }

                }
            );

        }
    );


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong() {

        let nextIndex =
            currentIndex + 1;


        if (
            nextIndex >= songs.length
        ) {

            nextIndex = 0;

        }


        loadSong(nextIndex);

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();


                userInteracted =
                    true;


                nextSong();

            }
        );

    }


    /* =====================================================
       PREVIOUS SONG
    ===================================================== */

    function previousSong() {

        let previousIndex =
            currentIndex - 1;


        if (
            previousIndex < 0
        ) {

            previousIndex =
                songs.length - 1;

        }


        loadSong(previousIndex);

    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();


                userInteracted =
                    true;


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
                    !player ||
                    !playerReady
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
       SOUNDCLOUD PLAYER
    ===================================================== */

    async function initializeMusic() {

        try {

            await loadSoundCloudAPI();

        } catch (error) {

            console.error(
                "SoundCloud API could not load:",
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

                playerReady =
                    true;


                updateSongUI();

                resetProgress();

                updatePlayerUI();

                getDuration();

            }
        );


        /* -----------------------------------------------
           PLAY
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.PLAY,
            () => {

                playing =
                    true;


                updatePlayerUI();

            }
        );


        /* -----------------------------------------------
           PAUSE
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.PAUSE,
            () => {

                /*
                 * Ignore the temporary pause that
                 * happens while switching songs.
                 */

                if (changingSong) {
                    return;
                }


                playing =
                    false;


                updatePlayerUI();

            }
        );


        /* -----------------------------------------------
           FINISH
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                playing =
                    false;


                updatePlayerUI();


                /*
                 * Automatically go to the next song.
                 */

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
       MUSIC SECTION
       PAUSE WHEN LEAVING
    ===================================================== */

    if (musicSection) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    const entry =
                        entries[0];


                    musicVisible =
                        entry.isIntersecting;


                    /*
                     * Leaving the music section
                     * pauses the song.
                     */

                    if (!musicVisible) {

                        if (
                            playerReady &&
                            playing &&
                            !changingSong
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


                    if (!message) {
                        return;
                    }


                    starMessage.textContent =
                        message;


                    starMessage.classList.remove(
                        "show"
                    );


                    /*
                     * Restart the animation.
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
