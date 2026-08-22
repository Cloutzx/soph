/* =========================================================
   SOPH WEBSITE
   script.js
========================================================= */


/* =========================================================
   OPENING SCREEN
========================================================= */

function openSite() {

    const opening = document.getElementById("opening");
    const main = document.getElementById("main");

    if (opening) {
        opening.classList.add("opening-hidden");
    }

    if (main) {
        main.classList.add("main-visible");
    }

    document.body.classList.add("site-open");

    /*
     * The user clicked the opening button,
     * so this is a valid interaction for browsers
     * that restrict autoplay.
     */

    setTimeout(function () {

        if (typeof updateFloatingButton === "function") {
            updateFloatingButton();
        }

    }, 500);
}


/* =========================================================
   MUSIC
========================================================= */

let widget = null;

let soundCloudReady = false;

let currentSongIndex = 1;

let isPlaying = false;

let loadingSong = false;


/*
 * Your SoundCloud songs
 */

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


/* =========================================================
   MUSIC ELEMENTS
========================================================= */

const soundCloudIframe =
    document.getElementById("soundcloud-player");

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

const progressTrack =
    document.getElementById("progressTrack");

const progressBar =
    document.getElementById("progressBar");

const floatingMusicButton =
    document.getElementById("musicFloatingButton");


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(milliseconds) {

    if (
        !milliseconds ||
        milliseconds < 0 ||
        !Number.isFinite(milliseconds)
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


/* =========================================================
   UPDATE SONG INFORMATION
========================================================= */

function updateSongDisplay() {

    const song =
        songs[currentSongIndex];

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


    /*
     * Update the song wheel
     */

    const songButtons =
        document.querySelectorAll(".music-song");


    songButtons.forEach(function (button, index) {

        button.classList.toggle(
            "song-main",
            index === currentSongIndex
        );

        button.classList.toggle(
            "active",
            index === currentSongIndex
        );

    });

}


/* =========================================================
   UPDATE PLAY BUTTON
========================================================= */

function updatePlayButton() {

    if (!playButton) {
        return;
    }


    if (isPlaying) {

        playButton.textContent = "❚❚";

        playButton.setAttribute(
            "aria-label",
            "Pause"
        );

    } else {

        playButton.textContent = "▶";

        playButton.setAttribute(
            "aria-label",
            "Play"
        );

    }

}


/* =========================================================
   UPDATE FLOATING MUSIC BUTTON
========================================================= */

function updateFloatingButton() {

    if (!floatingMusicButton) {
        return;
    }


    if (isPlaying) {

        floatingMusicButton.textContent =
            "❚❚";

        floatingMusicButton.setAttribute(
            "aria-label",
            "Pause music"
        );

        floatingMusicButton.classList.add(
            "playing"
        );

    } else {

        floatingMusicButton.textContent =
            "♫";

        floatingMusicButton.setAttribute(
            "aria-label",
            "Play music"
        );

        floatingMusicButton.classList.remove(
            "playing"
        );

    }

}


/* =========================================================
   UPDATE BOTH MUSIC BUTTONS
========================================================= */

function updateMusicControls() {

    updatePlayButton();

    updateFloatingButton();

}


/* =========================================================
   RESET PROGRESS
========================================================= */

function resetProgress() {

    if (currentTime) {

        currentTime.textContent =
            "0:00";

    }


    if (duration) {

        duration.textContent =
            "0:00";

    }


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }

}


/* =========================================================
   GET SONG DURATION
========================================================= */

function getSongDuration() {

    if (
        !widget ||
        !soundCloudReady
    ) {
        return;
    }


    widget.getDuration(
        function (milliseconds) {

            if (
                milliseconds &&
                milliseconds > 0
            ) {

                if (duration) {

                    duration.textContent =
                        formatTime(milliseconds);

                }

            }

        }
    );

}


/* =========================================================
   CREATE SOUNDCLOUD WIDGET
========================================================= */

function createSoundCloudWidget() {

    /*
     * Make sure SoundCloud API loaded.
     */

    if (
        typeof SC === "undefined" ||
        !SC.Widget
    ) {

        console.error(
            "SoundCloud API did not load."
        );

        return;

    }


    if (!soundCloudIframe) {

        console.error(
            "SoundCloud iframe was not found."
        );

        return;

    }


    widget =
        SC.Widget(soundCloudIframe);


    /*
     * SOUNDCloud READY
     */

    widget.bind(
        SC.Widget.Events.READY,
        function () {

            console.log(
                "SoundCloud player is ready."
            );


            soundCloudReady = true;


            updateSongDisplay();


            resetProgress();


            /*
             * Get initial duration.
             */

            setTimeout(
                function () {

                    getSongDuration();

                },
                500
            );

        }
    );


    /*
     * PLAY
     */

    widget.bind(
        SC.Widget.Events.PLAY,
        function () {

            isPlaying = true;

            updateMusicControls();

        }
    );


    /*
     * PAUSE
     */

    widget.bind(
        SC.Widget.Events.PAUSE,
        function () {

            isPlaying = false;

            updateMusicControls();

        }
    );


    /*
     * FINISH
     */

    widget.bind(
        SC.Widget.Events.FINISH,
        function () {

            isPlaying = false;

            updateMusicControls();


            /*
             * Automatically move
             * to the next song.
             */

            setTimeout(
                function () {

                    nextSong();

                },
                300
            );

        }
    );


    /*
     * PLAY PROGRESS
     */

    widget.bind(
        SC.Widget.Events.PLAY_PROGRESS,
        function (data) {

            const position =
                data.currentPosition || 0;


            const total =
                data.duration || 0;


            /*
             * Current time
             */

            if (currentTime) {

                currentTime.textContent =
                    formatTime(position);

            }


            /*
             * Duration
             */

            if (
                total &&
                total > 0
            ) {

                if (duration) {

                    duration.textContent =
                        formatTime(total);

                }


                /*
                 * Progress percentage
                 */

                const percentage =
                    (
                        position /
                        total
                    ) * 100;


                if (progressBar) {

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

        }
    );

}


/* =========================================================
   PLAY
========================================================= */

function playSong() {

    if (
        !widget ||
        !soundCloudReady
    ) {

        console.warn(
            "SoundCloud is not ready yet."
        );

        return;

    }


    widget.play();

}


/* =========================================================
   PAUSE
========================================================= */

function pauseSong() {

    if (
        !widget ||
        !soundCloudReady
    ) {
        return;
    }


    widget.pause();

}


/* =========================================================
   TOGGLE PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (
        !widget ||
        !soundCloudReady
    ) {

        console.warn(
            "SoundCloud is not ready yet."
        );

        return;

    }


    if (isPlaying) {

        pauseSong();

    } else {

        playSong();

    }

}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index) {

    if (
        !widget ||
        !soundCloudReady
    ) {

        console.warn(
            "SoundCloud is not ready yet."
        );

        return;

    }


    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    /*
     * Prevent multiple song loads
     * from happening at once.
     */

    if (loadingSong) {
        return;
    }


    loadingSong = true;


    /*
     * Stop current song first.
     */

    try {

        widget.pause();

    } catch (error) {

        console.warn(
            "Could not pause current song.",
            error
        );

    }


    isPlaying = false;

    updateMusicControls();


    /*
     * Reset progress immediately.
     */

    resetProgress();


    /*
     * Change current song.
     */

    currentSongIndex =
        index;


    updateSongDisplay();


    const song =
        songs[index];


    /*
     * Load the new SoundCloud track.
     */

    widget.load(
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
     * SoundCloud needs a moment
     * to load the new track.
     */

    setTimeout(
        function () {

            loadingSong = false;


            getSongDuration();


            /*
             * Start the newly selected song.
             */

            widget.play();

        },
        1200
    );

}


/* =========================================================
   NEXT SONG
========================================================= */

function nextSong() {

    let nextIndex =
        currentSongIndex + 1;


    if (
        nextIndex >= songs.length
    ) {

        nextIndex = 0;

    }


    loadSong(nextIndex);

}


/* =========================================================
   PREVIOUS SONG
========================================================= */

function previousSong() {

    if (
        !widget ||
        !soundCloudReady
    ) {
        return;
    }


    /*
     * If we're more than 3 seconds
     * into the current song,
     * restart it instead.
     */

    widget.getPosition(
        function (position) {

            if (
                position &&
                position > 3000
            ) {

                widget.seekTo(0);

                return;

            }


            let previousIndex =
                currentSongIndex - 1;


            if (previousIndex < 0) {

                previousIndex =
                    songs.length - 1;

            }


            loadSong(previousIndex);

        }
    );

}


/* =========================================================
   SONG WHEEL BUTTONS
========================================================= */

function setupSongButtons() {

    const songButtons =
        document.querySelectorAll(
            ".music-song"
        );


    songButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );


                    if (
                        Number.isNaN(index)
                    ) {
                        return;
                    }


                    /*
                     * Clicking the currently
                     * playing song toggles it.
                     */

                    if (
                        index ===
                        currentSongIndex
                    ) {

                        togglePlay();

                    } else {

                        loadSong(index);

                    }

                }
            );

        }
    );

}


/* =========================================================
   PROGRESS BAR
========================================================= */

function setupProgressBar() {

    if (!progressTrack) {
        return;
    }


    progressTrack.addEventListener(
        "click",
        function (event) {

            if (
                !widget ||
                !soundCloudReady
            ) {
                return;
            }


            widget.getDuration(
                function (total) {

                    if (
                        !total ||
                        total <= 0
                    ) {
                        return;
                    }


                    const rectangle =
                        progressTrack
                            .getBoundingClientRect();


                    const clickPosition =
                        event.clientX -
                        rectangle.left;


                    let percentage =
                        clickPosition /
                        rectangle.width;


                    percentage =
                        Math.max(
                            0,
                            Math.min(
                                1,
                                percentage
                            )
                        );


                    const newPosition =
                        total *
                        percentage;


                    widget.seekTo(
                        newPosition
                    );

                }
            );

        }
    );

}


/* =========================================================
   MUSIC BUTTON EVENTS
========================================================= */

function setupMusicControls() {

    if (playButton) {

        playButton.addEventListener(
            "click",
            function () {

                togglePlay();

            }
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                nextSong();

            }
        );

    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                previousSong();

            }
        );

    }


    /*
     * Floating music button
     */

    if (floatingMusicButton) {

        floatingMusicButton.addEventListener(
            "click",
            function () {

                togglePlay();

            }
        );

    }

}


/* =========================================================
   STAR MESSAGES
========================================================= */

function showStarMessage(message) {

    const starMessage =
        document.getElementById(
            "starMessage"
        );


    if (!starMessage) {
        return;
    }


    starMessage.textContent =
        message;


    starMessage.classList.add(
        "show"
    );


    /*
     * Remove previous timeout
     */

    if (
        window.starMessageTimeout
    ) {

        clearTimeout(
            window.starMessageTimeout
        );

    }


    window.starMessageTimeout =
        setTimeout(
            function () {

                starMessage.classList.remove(
                    "show"
                );

            },
            5000
        );

}


/* =========================================================
   SECRET MESSAGE
========================================================= */

function openSecret() {

    const secretMessage =
        document.getElementById(
            "secretMessage"
        );


    if (!secretMessage) {
        return;
    }


    secretMessage.classList.toggle(
        "show"
    );


    /*
     * Change the button text
     */

    const button =
        document.querySelector(
            ".secret-button"
        );


    if (!button) {
        return;
    }


    if (
        secretMessage.classList.contains(
            "show"
        )
    ) {

        button.textContent =
            "okay... you found it ♡";

    } else {

        button.textContent =
            "definitely don't click this";

    }

}


/* =========================================================
   SMOOTH SCROLL
========================================================= */

function setupSmoothScrolling() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function (event) {

                        const targetID =
                            this.getAttribute(
                                "href"
                            );


                        if (
                            !targetID ||
                            targetID === "#"
                        ) {
                            return;
                        }


                        const target =
                            document.querySelector(
                                targetID
                            );


                        if (!target) {
                            return;
                        }


                        event.preventDefault();


                        target.scrollIntoView(
                            {
                                behavior: "smooth",
                                block: "start"
                            }
                        );

                    }
                );

            }
        );

}


/* =========================================================
   LITTLE STAR BACKGROUND EFFECT
========================================================= */

function createBackgroundStars() {

    const background =
        document.querySelector(
            ".background"
        );


    if (!background) {
        return;
    }


    /*
     * Don't create too many stars.
     */

    const amount = 35;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const star =
            document.createElement(
                "span"
            );


        star.className =
            "floating-star";


        star.style.left =
            Math.random() * 100 + "%";


        star.style.top =
            Math.random() * 100 + "%";


        star.style.animationDelay =
            Math.random() * 5 + "s";


        star.style.animationDuration =
            (
                3 +
                Math.random() * 5
            ) + "s";


        background.appendChild(
            star
        );

    }

}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

function setupKeyboardControls() {

    document.addEventListener(
        "keydown",
        function (event) {

            /*
             * Don't activate controls while
             * typing in an input.
             */

            const tag =
                event.target.tagName;


            if (
                tag === "INPUT" ||
                tag === "TEXTAREA"
            ) {
                return;
            }


            /*
             * Space = play / pause
             */

            if (
                event.code ===
                "Space"
            ) {

                event.preventDefault();

                togglePlay();

            }


            /*
             * Right arrow = next
             */

            if (
                event.code ===
                "ArrowRight"
            ) {

                nextSong();

            }


            /*
             * Left arrow = previous
             */

            if (
                event.code ===
                "ArrowLeft"
            ) {

                previousSong();

            }

        }
    );

}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

function initializeSite() {

    console.log(
        "♡ Soph website loading..."
    );


    /*
     * Initial song
     */

    currentSongIndex = 1;


    updateSongDisplay();


    updateMusicControls();


    resetProgress();


    /*
     * Setup everything
     */

    setupSongButtons();

    setupMusicControls();

    setupProgressBar();

    setupSmoothScrolling();

    setupKeyboardControls();

    createBackgroundStars();


    /*
     * Give the SoundCloud iframe
     * time to initialize.
     */

    setTimeout(
        function () {

            createSoundCloudWidget();

        },
        700
    );

}


/* =========================================================
   START EVERYTHING
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSite
    );

} else {

    initializeSite();

}
