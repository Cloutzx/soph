/* =========================================================
   FOR SOPH — SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const opening = document.getElementById("opening");
    const openButton = document.getElementById("openButton");
    const main = document.getElementById("main");

    const soundcloudPlayer =
        document.getElementById("soundcloud-player");

    const musicDisc =
        document.getElementById("musicDisc");

    const musicWheel =
        document.getElementById("musicWheel");

    const musicSongs =
        document.querySelectorAll(".music-song");

    const currentSongTitle =
        document.getElementById("currentSongTitle");

    const currentSongArtist =
        document.getElementById("currentSongArtist");

    const playButton =
        document.getElementById("playButton");

    const previousButton =
        document.getElementById("previousButton");

    const nextButton =
        document.getElementById("nextButton");

    const musicFloatingButton =
        document.getElementById("musicFloatingButton");

    const currentTime =
        document.getElementById("currentTime");

    const duration =
        document.getElementById("duration");

    const progressTrack =
        document.getElementById("progressTrack");

    const progressBar =
        document.getElementById("progressBar");

    const secretButton =
        document.getElementById("secretButton");

    const secretMessage =
        document.getElementById("secretMessage");

    const starMessage =
        document.getElementById("starMessage");

    const stars =
        document.querySelectorAll(".star");


    /* =====================================================
       OPENING SCREEN
    ====================================================== */

    if (main) {
        main.style.visibility = "hidden";
        main.style.opacity = "0";
    }

    if (openButton) {

        openButton.addEventListener("click", () => {

            if (opening) {
                opening.classList.add("opening-hidden");
            }

            if (main) {
                main.style.visibility = "visible";
                main.style.opacity = "1";
            }

            document.body.classList.add("site-open");

            setTimeout(() => {

                if (opening) {
                    opening.style.display = "none";
                }

            }, 1000);

            /*
             * Attempt to start the first song after the
             * user has interacted with the page.
             */
            setTimeout(() => {
                loadSong(currentSongIndex, true);
            }, 500);

        });

    }


    /* =====================================================
       MUSIC DATA
    ====================================================== */

    /*
     * Replace the SoundCloud URLs below with your actual
     * SoundCloud track URLs if needed.
     *
     * The /tracks/ format is converted into an embed URL
     * automatically.
     */

    const songs = [

        {
            title: "I Love You",
            artist: "Fontaines D.C.",
            url: "https://soundcloud.com/fontainesdc/i-love-you"
        },

        {
            title: "You'll Be Mine Tonight",
            artist: "Artist",
            url: "https://soundcloud.com/"
        },

        {
            title: "Moonlight on the River",
            artist: "Mac DeMarco",
            url: "https://soundcloud.com/mac-demarco/moonlight-on-the-river"
        }

    ];


    /* =====================================================
       MUSIC STATE
    ====================================================== */

    let currentSongIndex = 0;

    let isPlaying = false;

    let playerReady = false;

    let player;

    let musicSectionVisible = false;

    let manuallyPaused = false;

    let playerDuration = 0;

    let progressInterval = null;


    /* =====================================================
       SOUNDCLOUD API
    ====================================================== */

    function getEmbedURL(url) {

        return (
            "https://w.soundcloud.com/player/api.html" +
            "?url=" +
            encodeURIComponent(url) +
            "&color=%23ffffff" +
            "&auto_play=false" +
            "&hide_related=true" +
            "&show_comments=false" +
            "&show_user=false" +
            "&show_reposts=false" +
            "&visual=false"
        );

    }


    function createPlayer(songIndex) {

        if (!soundcloudPlayer) {
            return;
        }

        const song = songs[songIndex];

        if (!song) {
            return;
        }

        playerReady = false;

        soundcloudPlayer.src =
            getEmbedURL(song.url);

        player =
            SC.Widget(soundcloudPlayer);

        player.bind(
            SC.Widget.Events.READY,
            () => {

                playerReady = true;

                player.bind(
                    SC.Widget.Events.PLAY,
                    handlePlay
                );

                player.bind(
                    SC.Widget.Events.PAUSE,
                    handlePause
                );

                player.bind(
                    SC.Widget.Events.FINISH,
                    handleFinish
                );

                player.bind(
                    SC.Widget.Events.PLAY_PROGRESS,
                    handleProgress
                );

                player.getDuration(
                    (milliseconds) => {

                        playerDuration =
                            milliseconds || 0;

                        updateDuration();

                    }
                );

            }
        );

    }


    /* =====================================================
       LOAD SONG
    ====================================================== */

    function loadSong(index, shouldPlay = false) {

        if (!songs[index]) {
            return;
        }

        currentSongIndex = index;

        const song = songs[index];


        /* Current song text */

        if (currentSongTitle) {
            currentSongTitle.textContent =
                song.title;
        }

        if (currentSongArtist) {
            currentSongArtist.textContent =
                song.artist;
        }


        /* Active song */

        musicSongs.forEach((button, i) => {

            button.classList.toggle(
                "active",
                i === index
            );

        });


        /* Reset progress */

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


        /*
         * Destroy/recreate the SoundCloud widget.
         * This makes switching tracks much more
         * reliable on desktop and mobile.
         */

        createPlayer(index);


        if (shouldPlay) {

            const waitForPlayer = setInterval(() => {

                if (playerReady && player) {

                    clearInterval(waitForPlayer);

                    try {

                        player.play();

                    } catch (error) {

                        console.log(
                            "Unable to autoplay:",
                            error
                        );

                    }

                }

            }, 100);

            setTimeout(() => {
                clearInterval(waitForPlayer);
            }, 5000);

        }

    }


    /* =====================================================
       PLAY
    ====================================================== */

    function playMusic() {

        if (!playerReady || !player) {

            /*
             * If the player isn't ready yet, reload it.
             */

            loadSong(currentSongIndex, true);

            return;
        }

        try {

            player.play();

        } catch (error) {

            console.log(
                "Play error:",
                error
            );

        }

    }


    /* =====================================================
       PAUSE
    ====================================================== */

    function pauseMusic() {

        if (!playerReady || !player) {
            return;
        }

        try {

            player.pause();

        } catch (error) {

            console.log(
                "Pause error:",
                error
            );

        }

    }


    /* =====================================================
       TOGGLE MUSIC
    ====================================================== */

    function toggleMusic() {

        if (isPlaying) {

            manuallyPaused = true;

            pauseMusic();

        } else {

            manuallyPaused = false;

            playMusic();

        }

    }


    /* =====================================================
       PLAY EVENT
    ====================================================== */

    function handlePlay() {

        isPlaying = true;

        manuallyPaused = false;

        document.body.classList.add(
            "music-playing"
        );

        if (musicDisc) {
            musicDisc.classList.add(
                "playing"
            );
        }

        updatePlayButton();

        startProgressUpdates();

    }


    /* =====================================================
       PAUSE EVENT
    ====================================================== */

    function handlePause() {

        isPlaying = false;

        document.body.classList.remove(
            "music-playing"
        );

        if (musicDisc) {
            musicDisc.classList.remove(
                "playing"
            );
        }

        updatePlayButton();

        stopProgressUpdates();

    }


    /* =====================================================
       FINISH EVENT
    ====================================================== */

    function handleFinish() {

        isPlaying = false;

        if (musicDisc) {
            musicDisc.classList.remove(
                "playing"
            );
        }

        /*
         * Automatically move to the next song.
         */

        const nextIndex =
            (currentSongIndex + 1) %
            songs.length;

        loadSong(nextIndex, true);

    }


    /* =====================================================
       PLAY PROGRESS
    ====================================================== */

    function handleProgress(data) {

        if (!data) {
            return;
        }

        const position =
            data.currentPosition || 0;

        const seconds =
            Math.floor(position / 1000);

        if (currentTime) {

            currentTime.textContent =
                formatTime(seconds);

        }

        if (
            progressBar &&
            playerDuration > 0
        ) {

            const percentage =
                (position / playerDuration) *
                100;

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
       PROGRESS UPDATES
    ====================================================== */

    function startProgressUpdates() {

        stopProgressUpdates();

        progressInterval =
            setInterval(() => {

                if (
                    !player ||
                    !playerReady ||
                    !isPlaying
                ) {
                    return;
                }

                player.getPosition(
                    (position) => {

                        const seconds =
                            Math.floor(
                                (position || 0) /
                                1000
                            );

                        if (currentTime) {

                            currentTime.textContent =
                                formatTime(seconds);

                        }

                        if (
                            progressBar &&
                            playerDuration > 0
                        ) {

                            const percent =
                                ((position || 0) /
                                    playerDuration) *
                                100;

                            progressBar.style.width =
                                Math.min(
                                    100,
                                    Math.max(
                                        0,
                                        percent
                                    )
                                ) + "%";

                        }

                    }
                );

            }, 500);

    }


    function stopProgressUpdates() {

        if (progressInterval) {

            clearInterval(
                progressInterval
            );

            progressInterval = null;

        }

    }


    /* =====================================================
       TIME FORMAT
    ====================================================== */

    function formatTime(seconds) {

        seconds =
            Math.max(
                0,
                Math.floor(seconds || 0)
            );

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;

        return (
            minutes +
            ":" +
            String(
                remainingSeconds
            ).padStart(2, "0")
        );

    }


    function updateDuration() {

        if (!duration) {
            return;
        }

        duration.textContent =
            formatTime(
                playerDuration / 1000
            );

    }


    /* =====================================================
       PLAY BUTTON
    ====================================================== */

    function updatePlayButton() {

        if (!playButton) {
            return;
        }

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
       SONG BUTTONS
    ====================================================== */

    musicSongs.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        button.dataset.song
                    );

                if (
                    Number.isNaN(index) ||
                    !songs[index]
                ) {
                    return;
                }

                loadSong(
                    index,
                    true
                );

            }
        );

    });


    /* =====================================================
       PLAY BUTTON
    ====================================================== */

    if (playButton) {

        playButton.addEventListener(
            "click",
            () => {

                toggleMusic();

            }
        );

    }


    /* =====================================================
       PREVIOUS BUTTON
    ====================================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                let index =
                    currentSongIndex - 1;

                if (index < 0) {
                    index =
                        songs.length - 1;
                }

                loadSong(
                    index,
                    true
                );

            }
        );

    }


    /* =====================================================
       NEXT BUTTON
    ====================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                const index =
                    (
                        currentSongIndex + 1
                    ) %
                    songs.length;

                loadSong(
                    index,
                    true
                );

            }
        );

    }


    /* =====================================================
       FLOATING MUSIC BUTTON
    ====================================================== */

    if (musicFloatingButton) {

        musicFloatingButton.addEventListener(
            "click",
            () => {

                toggleMusic();

            }
        );

    }


    /* =====================================================
       PROGRESS BAR CLICK
    ====================================================== */

    if (progressTrack) {

        progressTrack.addEventListener(
            "click",
            (event) => {

                if (
                    !player ||
                    !playerReady ||
                    !playerDuration
                ) {
                    return;
                }

                const rect =
                    progressTrack.getBoundingClientRect();

                const clickPosition =
                    event.clientX -
                    rect.left;

                const percentage =
                    clickPosition /
                    rect.width;

                const newPosition =
                    percentage *
                    playerDuration;

                try {

                    player.seekTo(
                        newPosition
                    );

                } catch (error) {

                    console.log(
                        "Seek error:",
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       MUSIC SECTION VISIBILITY
    ====================================================== */

    const musicSection =
        document.getElementById("music");

    if (
        musicSection &&
        "IntersectionObserver" in window
    ) {

        const musicObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            musicSectionVisible =
                                entry.isIntersecting;

                            /*
                             * Only automatically pause
                             * if the user actually leaves
                             * the music section.
                             */

                            if (
                                !entry.isIntersecting &&
                                isPlaying
                            ) {

                                pauseMusic();

                            }

                        }
                    );

                },
                {
                    threshold: 0.2
                }
            );

        musicObserver.observe(
            musicSection
        );

    }


    /* =====================================================
       PAGE VISIBILITY
    ====================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden &&
                isPlaying
            ) {

                pauseMusic();

            }

        }
    );


    /* =====================================================
       SECRET MESSAGE
    ====================================================== */

    if (secretButton) {

        secretButton.addEventListener(
            "click",
            () => {

                if (!secretMessage) {
                    return;
                }

                const isOpen =
                    secretMessage.classList.contains(
                        "visible"
                    );

                if (isOpen) {

                    secretMessage.classList.remove(
                        "visible"
                    );

                    secretButton.textContent =
                        "read it";

                } else {

                    secretMessage.classList.add(
                        "visible"
                    );

                    secretButton.textContent =
                        "close";

                }

            }
        );

    }


    /* =====================================================
       STAR MESSAGES
    ====================================================== */

    stars.forEach((star) => {

        star.addEventListener(
            "click",
            () => {

                const message =
                    star.dataset.message;

                if (!starMessage) {
                    return;
                }

                /*
                 * Remove the old active state.
                 */

                stars.forEach((otherStar) => {

                    otherStar.classList.remove(
                        "selected"
                    );

                });

                star.classList.add(
                    "selected"
                );


                /*
                 * Show message.
                 */

                starMessage.textContent =
                    message;

                starMessage.classList.add(
                    "visible"
                );


                /*
                 * Small reset animation.
                 */

                starMessage.classList.remove(
                    "star-message-pop"
                );

                void starMessage.offsetWidth;

                starMessage.classList.add(
                    "star-message-pop"
                );

            }
        );

    });


    /* =====================================================
       CLICK OUTSIDE STAR MESSAGE
    ====================================================== */

    document.addEventListener(
        "click",
        (event) => {

            if (!starMessage) {
                return;
            }

            const clickedStar =
                event.target.closest(".star");

            if (
                !clickedStar &&
                !event.target.closest(".star-message")
            ) {

                starMessage.classList.remove(
                    "visible"
                );

                stars.forEach((star) => {

                    star.classList.remove(
                        "selected"
                    );

                });

            }

        }
    );


    /* =====================================================
       SMOOTH SCROLL
    ====================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(
                        targetId
                    );

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    /* =====================================================
       INTERSECTION REVEALS
    ====================================================== */

    const revealElements =
        document.querySelectorAll(
            ".timeline-item, " +
            ".reason, " +
            ".section-title, " +
            ".secret-box, " +
            ".final-card, " +
            ".music-player"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            (element) => {

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            (element) => {

                element.classList.add(
                    "visible"
                );

            }
        );

    }


    /* =====================================================
       KEYBOARD CONTROLS
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            /*
             * Don't interfere with typing.
             */

            const tag =
                event.target.tagName.toLowerCase();

            if (
                tag === "input" ||
                tag === "textarea" ||
                tag === "select"
            ) {
                return;
            }


            /*
             * Space = play/pause
             */

            if (
                event.code === "Space"
            ) {

                event.preventDefault();

                toggleMusic();

            }


            /*
             * Arrow right = next
             */

            if (
                event.code === "ArrowRight"
            ) {

                const index =
                    (
                        currentSongIndex + 1
                    ) %
                    songs.length;

                loadSong(
                    index,
                    true
                );

            }


            /*
             * Arrow left = previous
             */

            if (
                event.code === "ArrowLeft"
            ) {

                let index =
                    currentSongIndex - 1;

                if (index < 0) {
                    index =
                        songs.length - 1;
                }

                loadSong(
                    index,
                    true
                );

            }

        }
    );


    /* =====================================================
       INITIALIZE MUSIC
    ====================================================== */

    /*
     * SoundCloud's Widget API is loaded here.
     * Once loaded, the first song is prepared.
     */

    function loadSoundCloudAPI() {

        if (
            window.SC &&
            window.SC.Widget
        ) {

            loadSong(
                currentSongIndex,
                false
            );

            return;

        }


        const existingScript =
            document.querySelector(
                'script[src*="api.js"]'
            );

        if (!existingScript) {

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                "https://w.soundcloud.com/player/api.js";

            script.async = true;

            script.onload = () => {

                loadSong(
                    currentSongIndex,
                    false
                );

            };

            document.body.appendChild(
                script
            );

        }

    }


    loadSoundCloudAPI();


    /* =====================================================
       INITIAL UI
    ====================================================== */

    updatePlayButton();


    /* =====================================================
       FLOATING BUTTON STATE
    ====================================================== */

    setInterval(() => {

        if (!musicFloatingButton) {
            return;
        }

        musicFloatingButton.classList.toggle(
            "playing",
            isPlaying
        );

    }, 250);


    /* =====================================================
       PREVENT UNWANTED PAGE JUMPS
    ====================================================== */

    window.addEventListener(
        "load",
        () => {

            if (
                window.location.hash
            ) {

                history.replaceState(
                    null,
                    "",
                    window.location.pathname +
                    window.location.search
                );

                window.scrollTo(
                    0,
                    0
                );

            }

        }
    );

});
