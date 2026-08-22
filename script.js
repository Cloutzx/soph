/* =========================================================
   SOP ♡
   FULL SCRIPT.JS
========================================================= */


/* =========================================================
   OPENING
========================================================= */

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


/* =========================================================
   MUSIC ELEMENTS
========================================================= */

const soundcloudPlayer =
    document.getElementById("soundcloud-player");

const musicDisc =
    document.getElementById("musicDisc");

const playButton =
    document.getElementById("playButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const currentSongTitle =
    document.getElementById("currentSongTitle");

const currentSongArtist =
    document.getElementById("currentSongArtist");

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

const progressTrack =
    document.getElementById("progressTrack");

const progressBar =
    document.getElementById("progressBar");

const musicFloatingButton =
    document.getElementById("musicFloatingButton");

const musicSection =
    document.querySelector(".music-section");


/* =========================================================
   SONGS
========================================================= */

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
   MUSIC STATE
========================================================= */

let player = null;

let currentSongIndex = 0;

let isPlaying = false;

let playerReady = false;

let userHasInteracted = false;

let musicSectionVisible = false;


/* =========================================================
   LOAD SOUNDCLOUD API
========================================================= */

function loadSoundCloudAPI() {

    return new Promise((resolve) => {

        if (window.SC && window.SC.Widget) {
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
                resolve
            );

            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://w.soundcloud.com/player/api.js";

        script.onload = resolve;

        script.onerror = () => {
            console.error(
                "SoundCloud Widget API failed to load."
            );
        };

        document.head.appendChild(script);
    });
}


/* =========================================================
   INITIALIZE SOUNDCLOUD
========================================================= */

async function initializeMusic() {

    if (!soundcloudPlayer) {

        console.error(
            "SoundCloud iframe was not found."
        );

        return;
    }


    await loadSoundCloudAPI();


    if (
        !window.SC ||
        !window.SC.Widget
    ) {

        console.error(
            "SoundCloud Widget API unavailable."
        );

        return;
    }


    player =
        SC.Widget(soundcloudPlayer);


    /* -----------------------------------------
       READY
    ----------------------------------------- */

    player.bind(
        SC.Widget.Events.READY,
        () => {

            playerReady = true;

            console.log(
                "SoundCloud player ready."
            );

            updateSongDisplay();

            updateSongButtons();

            updatePlayButton();

            /*
             * Get duration after the player
             * has actually loaded.
             */

            updateDuration();

        }
    );


    /* -----------------------------------------
       PLAY
    ----------------------------------------- */

    player.bind(
        SC.Widget.Events.PLAY,
        () => {

            isPlaying = true;

            updatePlayButton();

            startDisc();

            updateDuration();

        }
    );


    /* -----------------------------------------
       PAUSE
    ----------------------------------------- */

    player.bind(
        SC.Widget.Events.PAUSE,
        () => {

            isPlaying = false;

            updatePlayButton();

            stopDisc();

        }
    );


    /* -----------------------------------------
       FINISH
    ----------------------------------------- */

    player.bind(
        SC.Widget.Events.FINISH,
        () => {

            isPlaying = false;

            stopDisc();

            nextSong();

        }
    );


    /* -----------------------------------------
       PROGRESS
    ----------------------------------------- */

    player.bind(
        SC.Widget.Events.PLAY_PROGRESS,
        (data) => {

            updateProgress(data);

        }
    );


    /*
     * The iframe already has the first song
     * from the HTML.
     *
     * Do NOT immediately call player.load()
     * here because that can cause the iframe
     * to reload unnecessarily.
     */

    updateSongDisplay();

}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(
    index,
    autoplay = false
) {

    if (!player || !playerReady) {
        return;
    }


    /* Loop around */

    if (index < 0) {
        index = songs.length - 1;
    }

    if (index >= songs.length) {
        index = 0;
    }


    currentSongIndex = index;


    const song =
        songs[currentSongIndex];


    /* Update text */

    updateSongDisplay();

    updateSongButtons();


    /* Reset progress */

    if (progressBar) {
        progressBar.style.width = "0%";
    }

    if (currentTimeElement) {
        currentTimeElement.textContent = "0:00";
    }

    if (durationElement) {
        durationElement.textContent = "0:00";
    }


    isPlaying = false;

    stopDisc();

    updatePlayButton();


    /*
     * Load ONLY ONE SoundCloud player.
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
     * Wait for SoundCloud to load the
     * new song before playing it.
     */

    if (autoplay) {

        setTimeout(() => {

            if (
                player &&
                playerReady &&
                userHasInteracted
            ) {

                player.play();

            }

        }, 900);

    }

}


/* =========================================================
   DISPLAY CURRENT SONG
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

}


/* =========================================================
   SONG BUTTONS
========================================================= */

function updateSongButtons() {

    const buttons =
        document.querySelectorAll(
            ".music-song"
        );


    buttons.forEach(
        (button, index) => {

            button.classList.remove(
                "active",
                "song-main"
            );


            if (
                index === currentSongIndex
            ) {

                button.classList.add(
                    "active",
                    "song-main"
                );

            }

        }
    );

}


document
    .querySelectorAll(".music-song")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                userHasInteracted = true;

                const index =
                    Number(
                        button.dataset.song
                    );

                loadSong(
                    index,
                    true
                );

            }
        );

    });


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (
        !player ||
        !playerReady
    ) {

        console.warn(
            "SoundCloud player isn't ready yet."
        );

        return;
    }


    userHasInteracted = true;


    if (isPlaying) {

        player.pause();

    } else {

        player.play();

    }

}


function playMusic() {

    if (
        !player ||
        !playerReady
    ) {
        return;
    }

    userHasInteracted = true;

    player.play();

}


function pauseMusic() {

    if (
        !player ||
        !playerReady
    ) {
        return;
    }

    player.pause();

}


/* =========================================================
   PLAY BUTTON
========================================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        () => {

            togglePlay();

        }
    );

}


/* =========================================================
   NEXT
========================================================= */

function nextSong() {

    const nextIndex =
        (
            currentSongIndex + 1
        ) % songs.length;


    loadSong(
        nextIndex,
        true
    );

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            userHasInteracted = true;

            nextSong();

        }
    );

}


/* =========================================================
   PREVIOUS
========================================================= */

function previousSong() {

    const previousIndex =
        (
            currentSongIndex -
            1 +
            songs.length
        ) % songs.length;


    loadSong(
        previousIndex,
        true
    );

}


if (previousButton) {

    previousButton.addEventListener(
        "click",
        () => {

            userHasInteracted = true;

            previousSong();

        }
    );

}


/* =========================================================
   PLAY BUTTON VISUAL
========================================================= */

function updatePlayButton() {

    if (playButton) {

        if (isPlaying) {

            playButton.textContent = "Ⅱ";

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


    if (musicFloatingButton) {

        musicFloatingButton.textContent =
            isPlaying
                ? "Ⅱ"
                : "♫";

        musicFloatingButton.classList.toggle(
            "playing",
            isPlaying
        );

    }

}


/* =========================================================
   FLOATING MUSIC BUTTON
========================================================= */

if (musicFloatingButton) {

    musicFloatingButton.addEventListener(
        "click",
        () => {

            togglePlay();

        }
    );

}


/* =========================================================
   VINYL
========================================================= */

function startDisc() {

    if (musicDisc) {

        musicDisc.classList.add(
            "spinning"
        );

    }

}


function stopDisc() {

    if (musicDisc) {

        musicDisc.classList.remove(
            "spinning"
        );

    }

}


/* =========================================================
   FORMAT TIME
========================================================= */

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
        String(seconds).padStart(
            2,
            "0"
        )
    );

}


/* =========================================================
   DURATION
========================================================= */

function updateDuration() {

    if (
        !player ||
        !durationElement
    ) {
        return;
    }


    player.getDuration(
        (duration) => {

            if (duration) {

                durationElement.textContent =
                    formatTime(duration);

            }

        }
    );

}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress(data) {

    if (!data) {
        return;
    }


    if (currentTimeElement) {

        currentTimeElement.textContent =
            formatTime(
                data.currentPosition
            );

    }


    if (
        durationElement &&
        data.duration
    ) {

        durationElement.textContent =
            formatTime(
                data.duration
            );

    }


    if (
        progressBar &&
        data.duration
    ) {

        const percentage =
            (
                data.currentPosition /
                data.duration
            ) * 100;


        progressBar.style.width =
            Math.min(
                percentage,
                100
            ) + "%";

    }

}


/* =========================================================
   CLICK PROGRESS
========================================================= */

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


            userHasInteracted = true;


            player.getDuration(
                (duration) => {

                    if (!duration) {
                        return;
                    }


                    const rect =
                        progressTrack
                            .getBoundingClientRect();


                    const position =
                        event.clientX -
                        rect.left;


                    const percentage =
                        position /
                        rect.width;


                    const newPosition =
                        duration *
                        Math.max(
                            0,
                            Math.min(
                                percentage,
                                1
                            )
                        );


                    player.seekTo(
                        newPosition
                    );

                }
            );

        }
    );

}


/* =========================================================
   MUSIC SECTION VISIBILITY
========================================================= */

if (musicSection) {

    const musicObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        musicSectionVisible =
                            entry.isIntersecting;


                        /*
                         * Only automatically play
                         * after the user has interacted
                         * with the site.
                         */

                        if (
                            entry.isIntersecting &&
                            siteOpened &&
                            userHasInteracted &&
                            playerReady
                        ) {

                            player.play();

                        }


                        /*
                         * Pause when leaving.
                         */

                        if (
                            !entry.isIntersecting &&
                            playerReady &&
                            isPlaying
                        ) {

                            player.pause();

                        }

                    }
                );

            },
            {
                threshold: 0.35
            }
        );


    musicObserver.observe(
        musicSection
    );

}


/* =========================================================
   FIRST USER INTERACTION
========================================================= */

document.addEventListener(
    "click",
    () => {

        userHasInteracted = true;

    },
    {
        once: true
    }
);


/* =========================================================
   STARS
========================================================= */

const stars =
    document.querySelectorAll(
        ".star"
    );

const starMessage =
    document.getElementById(
        "starMessage"
    );

let starMessageTimeout = null;


stars.forEach(
    (star) => {

        star.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();


                const message =
                    star.dataset.message;


                if (
                    !message ||
                    !starMessage
                ) {
                    return;
                }


                starMessage.textContent =
                    message;


                starMessage.classList.add(
                    "show"
                );


                clearTimeout(
                    starMessageTimeout
                );


                starMessageTimeout =
                    setTimeout(
                        () => {

                            starMessage.classList.remove(
                                "show"
                            );

                        },
                        4500
                    );


                star.style.transform =
                    "scale(1.25)";


                setTimeout(
                    () => {

                        star.style.transform =
                            "";

                    },
                    250
                );

            }
        );

    }
);


/* =========================================================
   SECRET MESSAGE
========================================================= */

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

            const open =
                secretMessage.classList.contains(
                    "show"
                );


            if (open) {

                secretMessage.classList.remove(
                    "show"
                );

                secretButton.textContent =
                    "read it";

            } else {

                secretMessage.classList.add(
                    "show"
                );

                secretButton.textContent =
                    "hide it";

            }

        }
    );

}


/* =========================================================
   SMOOTH SCROLL
========================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const target =
                        document.querySelector(
                            link.getAttribute(
                                "href"
                            )
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );

        }
    );


/* =========================================================
   START
========================================================= */

initializeMusic();
