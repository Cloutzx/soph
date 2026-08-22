document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       OPENING
    ========================= */

    const opening = document.getElementById("opening");
    const openButton = document.getElementById("openButton");
    const main = document.getElementById("main");

    if (openButton) {
        openButton.addEventListener("click", () => {
            opening.classList.add("opening-hidden");

            setTimeout(() => {
                main.classList.add("main-visible");
            }, 300);
        });
    }


    /* =========================
       MUSIC
    ========================= */

    const iframe = document.getElementById("soundcloud-player");

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

    const musicDisc =
        document.getElementById("musicDisc");

    const musicSection =
        document.getElementById("musicSection");

    const floatingMusicButton =
        document.getElementById("floatingMusicButton");

    const songButtons =
        document.querySelectorAll(".music-song");


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


    let player = null;

    let currentIndex = 0;

    let isPlaying = false;

    let isReady = false;

    let changingSong = false;


    /* =========================
       LOAD SOUNDCLOUD API
    ========================= */

    function loadSoundCloudAPI() {

        return new Promise((resolve, reject) => {

            if (
                window.SC &&
                window.SC.Widget
            ) {
                resolve();
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


    /* =========================
       FORMAT TIME
    ========================= */

    function formatTime(ms) {

        if (!ms || ms < 0) {
            return "0:00";
        }

        const seconds =
            Math.floor(ms / 1000);

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;

        return (
            minutes +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }


    /* =========================
       RESET PROGRESS
    ========================= */

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
    }


    /* =========================
       UPDATE UI
    ========================= */

    function updateUI() {

        if (playButton) {
            playButton.textContent =
                isPlaying ? "Ⅱ" : "▶";
        }

        if (musicDisc) {
            musicDisc.classList.toggle(
                "spinning",
                isPlaying
            );
        }

        if (floatingMusicButton) {
            floatingMusicButton.classList.toggle(
                "playing",
                isPlaying
            );
        }
    }


    /* =========================
       UPDATE SONG
    ========================= */

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

            button.classList.toggle(
                "active",
                index === currentIndex
            );

        });
    }


    /* =========================
       PLAY
    ========================= */

    function playMusic() {

        if (
            !player ||
            !isReady
        ) {
            return;
        }

        player.play();
    }


    /* =========================
       PAUSE
    ========================= */

    function pauseMusic() {

        if (
            !player ||
            !isReady
        ) {
            return;
        }

        player.pause();
    }


    /* =========================
       LOAD SONG
    ========================= */

    function loadSong(index) {

        if (
            !player ||
            !isReady
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

        isPlaying = false;

        updateUI();

        resetProgress();

        updateSongUI();


        /*
         * Load the new song.
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
         * Give SoundCloud time to
         * load the new track.
         */

        setTimeout(() => {

            changingSong = false;

        }, 1200);
    }


    /* =========================
       PLAY BUTTON
    ========================= */

    if (playButton) {

        playButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                if (isPlaying) {
                    pauseMusic();
                } else {
                    playMusic();
                }

            }
        );
    }


    /* =========================
       SONG BUTTONS
    ========================= */

    songButtons.forEach((button, index) => {

        button.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                if (index !== currentIndex) {

                    loadSong(index);

                } else {

                    if (isPlaying) {
                        pauseMusic();
                    } else {
                        playMusic();
                    }

                }

            }
        );

    });


    /* =========================
       NEXT
    ========================= */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                let next =
                    currentIndex + 1;

                if (
                    next >= songs.length
                ) {
                    next = 0;
                }

                loadSong(next);

            }
        );
    }


    /* =========================
       PREVIOUS
    ========================= */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                let previous =
                    currentIndex - 1;

                if (previous < 0) {
                    previous =
                        songs.length - 1;
                }

                loadSong(previous);

            }
        );
    }


    /* =========================
       PROGRESS BAR
    ========================= */

    if (progressTrack) {

        progressTrack.addEventListener(
            "click",
            (event) => {

                if (
                    !player ||
                    !isReady
                ) {
                    return;
                }

                const rect =
                    progressTrack.getBoundingClientRect();

                const position =
                    event.clientX - rect.left;

                const percentage =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            position / rect.width
                        )
                    );

                player.getDuration(
                    (songDuration) => {

                        if (
                            songDuration &&
                            songDuration > 0
                        ) {

                            player.seekTo(
                                songDuration *
                                percentage
                            );

                        }

                    }
                );

            }
        );
    }


    /* =========================
       FLOATING MUSIC BUTTON
    ========================= */

    if (floatingMusicButton) {

        floatingMusicButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                if (isPlaying) {
                    pauseMusic();
                } else {
                    playMusic();
                }

            }
        );
    }


    /* =========================
       SOUNDCLOUD
    ========================= */

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


        /* READY */

        player.bind(
            SC.Widget.Events.READY,
            () => {

                isReady = true;

                updateSongUI();

                resetProgress();

                updateUI();

            }
        );


        /* PLAY */

        player.bind(
            SC.Widget.Events.PLAY,
            () => {

                isPlaying = true;

                updateUI();

            }
        );


        /* PAUSE */

        player.bind(
            SC.Widget.Events.PAUSE,
            () => {

                if (changingSong) {
                    return;
                }

                isPlaying = false;

                updateUI();

            }
        );


        /* PROGRESS */

        player.bind(
            SC.Widget.Events.PLAY_PROGRESS,
            (data) => {

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

                    const percent =
                        (
                            current /
                            total
                        ) * 100;

                    progressBar.style.width =
                        Math.min(
                            100,
                            percent
                        ) + "%";

                }

            }
        );


        /* FINISHED */

        player.bind(
            SC.Widget.Events.FINISH,
            () => {

                isPlaying = false;

                updateUI();

                let next =
                    currentIndex + 1;

                if (
                    next >= songs.length
                ) {
                    next = 0;
                }

                loadSong(next);

            }
        );

    }


    /* =========================
       MUSIC SECTION
       PAUSE WHEN LEAVING
    ========================= */

    if (musicSection) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    const visible =
                        entries[0].isIntersecting;

                    if (
                        !visible &&
                        player &&
                        isReady &&
                        isPlaying &&
                        !changingSong
                    ) {

                        pauseMusic();

                    }

                },
                {
                    threshold: 0.25
                }
            );

        observer.observe(musicSection);
    }


    initializeMusic();


    /* =========================
       STARS
    ========================= */

    const stars =
        document.querySelectorAll(".star");

    const starMessage =
        document.getElementById("starMessage");


    stars.forEach((star) => {

        star.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                const message =
                    star.dataset.message;

                if (!message || !starMessage) {
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
                    setTimeout(() => {

                        starMessage.classList.remove(
                            "show"
                        );

                    }, 4500);

            }
        );

    });


    /* =========================
       SECRET
    ========================= */

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

                const showing =
                    secretMessage.classList.contains(
                        "show"
                    );


                if (showing) {

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

});
