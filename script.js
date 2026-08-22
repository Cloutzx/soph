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

    let changingSong = false;

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

            const existingScript =
                document.querySelector(
                    'script[src="https://w.soundcloud.com/player/api.js"]'
                );

            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    resolve,
                    { once: true }
                );

                existingScript.addEventListener(
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
       UPDATE MUSIC UI
    ===================================================== */

    function updateMusicUI() {

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

        player.getDuration((milliseconds) => {

            if (
                milliseconds &&
                duration
            ) {
                duration.textContent =
                    formatTime(milliseconds);
            }
        });
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
       LOAD + PLAY SONG
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

        currentIndex = index;

        changingSong = true;

        /*
         * Stop the current song.
         */

        player.pause();

        playing = false;

        updateMusicUI();

        /*
         * Reset immediately.
         */

        resetProgress();

        updateSongUI();

        /*
         * Load the new SoundCloud track.
         *
         * auto_play is enabled here because
         * loadSong() is called from the user's
         * actual button tap.
         */

        player.load(
            songs[index].url,
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
         * Give the new track a moment to load.
         * This does NOT call play() again, which
         * prevents the play/pause flicker.
         */

        setTimeout(() => {
            changingSong = false;
            getDuration();
        }, 1000);
    }


    /* =====================================================
       PLAY / PAUSE BUTTON
    ===================================================== */

    if (playButton) {

        playButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            if (playing) {
                pauseMusic();
            } else {
                playMusic();
            }
        });
    }


    /* =====================================================
       SONG BUTTONS
    ===================================================== */

    songButtons.forEach((button, index) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            /*
             * Different song:
             * immediately load + autoplay.
             */

            if (index !== currentIndex) {

                loadSong(index);

                return;
            }

            /*
             * Same song:
             * toggle play/pause.
             */

            if (playing) {
                pauseMusic();
            } else {
                playMusic();
            }
        });

    });


    /* =====================================================
       NEXT
    ===================================================== */

    function nextSong() {

        let nextIndex =
            currentIndex + 1;

        if (nextIndex >= songs.length) {
            nextIndex = 0;
        }

        loadSong(nextIndex);
    }


    if (nextButton) {

        nextButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            nextSong();
        });
    }


    /* =====================================================
       PREVIOUS
    ===================================================== */

    function previousSong() {

        let previousIndex =
            currentIndex - 1;

        if (previousIndex < 0) {
            previousIndex = songs.length - 1;
        }

        loadSong(previousIndex);
    }


    if (previousButton) {

        previousButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            previousSong();
        });
    }


    /* =====================================================
       PROGRESS BAR SEEK
    ===================================================== */

    if (progressTrack) {

        progressTrack.addEventListener("click", (event) => {

            if (
                !player ||
                !playerReady
            ) {
                return;
            }

            const rect =
                progressTrack.getBoundingClientRect();

            const clickPosition =
                event.clientX - rect.left;

            const percentage =
                Math.max(
                    0,
                    Math.min(
                        1,
                        clickPosition / rect.width
                    )
                );

            player.getDuration((milliseconds) => {

                if (
                    !milliseconds ||
                    milliseconds <= 0
                ) {
                    return;
                }

                player.seekTo(
                    milliseconds * percentage
                );
            });
        });
    }


    /* =====================================================
       SOUNDCLOUD INITIALIZATION
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
            console.error(
                "SoundCloud iframe not found."
            );

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

                resetProgress();

                updateMusicUI();

                getDuration();
            }
        );


        /* -----------------------------------------------
           PLAY
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.PLAY,
            () => {

                playing = true;

                updateMusicUI();
            }
        );


        /* -----------------------------------------------
           PAUSE
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.PAUSE,
            () => {

                /*
                 * SoundCloud sends a PAUSE while changing
                 * tracks. Don't let that make the new
                 * song's UI flash to paused.
                 */

                if (changingSong) {
                    return;
                }

                playing = false;

                updateMusicUI();
            }
        );


        /* -----------------------------------------------
           FINISH
        ------------------------------------------------ */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                playing = false;

                updateMusicUI();

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
       PAUSE WHEN LEAVING MUSIC SECTION
    ===================================================== */

    if (musicSection) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    const entry =
                        entries[0];

                    musicVisible =
                        entry.isIntersecting;

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

        observer.observe(musicSection);
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


    stars.forEach((star) => {

        star.addEventListener("click", (event) => {

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
                setTimeout(() => {

                    starMessage.classList.remove(
                        "show"
                    );

                }, 4500);

        });

    });


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
