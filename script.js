/* =========================================================
   SOP ♡
   COMPLETE SCRIPT
========================================================= */


/* =========================================================
   OPENING SCREEN
========================================================= */

const opening = document.getElementById("opening");
const openButton = document.getElementById("openButton");
const main = document.getElementById("main");

let siteOpened = false;

if (openButton) {
    openButton.addEventListener("click", () => {

        siteOpened = true;

        opening.classList.add("opening-hidden");

        setTimeout(() => {
            main.classList.add("main-visible");
        }, 300);

    });
}


/* =========================================================
   MUSIC
========================================================= */

const soundcloudPlayer = document.getElementById("soundcloud-player");
const musicDisc = document.getElementById("musicDisc");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

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
   SOUNDCLOUD SONGS
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

let currentSongIndex = 0;

let player = null;

let isPlaying = false;

let musicSectionVisible = false;

let soundcloudReady = false;


/* =========================================================
   LOAD SOUNDCLOUD API
========================================================= */

function loadSoundCloudAPI() {

    return new Promise((resolve) => {

        if (window.SC) {
            resolve();
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://w.soundcloud.com/player/api.js";

        script.onload = () => {
            resolve();
        };

        document.head.appendChild(script);

    });

}


/* =========================================================
   CREATE SOUNDCLOUD PLAYER
========================================================= */

async function initializeMusic() {

    if (!soundcloudPlayer) {
        return;
    }

    await loadSoundCloudAPI();

    player =
        SC.Widget(soundcloudPlayer);

    soundcloudReady = true;


    /* -----------------------------------------
       LOAD FIRST SONG
    ----------------------------------------- */

    loadSong(currentSongIndex, false);


    /* -----------------------------------------
       PLAYER READY
    ----------------------------------------- */

    player.bind(
        SC.Widget.Events.READY,
        () => {

            soundcloudReady = true;

            updateSongDisplay();

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
       PLAY PROGRESS
    ----------------------------------------- */

    player.bind(
        SC.Widget.Events.PLAY_PROGRESS,
        (data) => {

            updateProgress(data);

        }
    );

}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index, autoplay = false) {

    if (!player || !soundcloudReady) {
        return;
    }

    if (index < 0) {
        index = songs.length - 1;
    }

    if (index >= songs.length) {
        index = 0;
    }

    currentSongIndex = index;

    const song = songs[currentSongIndex];


    /* -----------------------------------------
       UPDATE TEXT
    ----------------------------------------- */

    updateSongDisplay();


    /* -----------------------------------------
       UPDATE ACTIVE SONG
    ----------------------------------------- */

    updateSongButtons();


    /* -----------------------------------------
       RESET PROGRESS
    ----------------------------------------- */

    if (progressBar) {
        progressBar.style.width = "0%";
    }

    if (currentTimeElement) {
        currentTimeElement.textContent = "0:00";
    }

    if (durationElement) {
        durationElement.textContent = "0:00";
    }


    /* -----------------------------------------
       LOAD SOUNDCLOUD
    ----------------------------------------- */

    player.load(
        song.url,
        {
            auto_play: autoplay,
            hide_related: true,
            show_comments: false,
            show_user: false,
            show_reposts: false,
            visual: false
        }
    );

}


/* =========================================================
   UPDATE SONG DISPLAY
========================================================= */

function updateSongDisplay() {

    if (!songs[currentSongIndex]) {
        return;
    }

    const song = songs[currentSongIndex];

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
   UPDATE SONG BUTTONS
========================================================= */

function updateSongButtons() {

    const songButtons =
        document.querySelectorAll(".music-song");

    songButtons.forEach((button, index) => {

        button.classList.remove(
            "active",
            "song-main"
        );

        if (index === currentSongIndex) {

            button.classList.add(
                "active",
                "song-main"
            );

        }

    });

}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!player || !soundcloudReady) {
        return;
    }

    if (isPlaying) {

        player.pause();

    } else {

        player.play();

    }

}


/* =========================================================
   PLAY
========================================================= */

function playMusic() {

    if (!player || !soundcloudReady) {
        return;
    }

    player.play();

}


/* =========================================================
   PAUSE
========================================================= */

function pauseMusic() {

    if (!player || !soundcloudReady) {
        return;
    }

    player.pause();

}


/* =========================================================
   NEXT SONG
========================================================= */

function nextSong() {

    const nextIndex =
        (currentSongIndex + 1) % songs.length;

    loadSong(
        nextIndex,
        true
    );

}


/* =========================================================
   PREVIOUS SONG
========================================================= */

function previousSong() {

    const previousIndex =
        (currentSongIndex - 1 + songs.length)
        % songs.length;

    loadSong(
        previousIndex,
        true
    );

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
   NEXT BUTTON
========================================================= */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            nextSong();

        }
    );

}


/* =========================================================
   PREVIOUS BUTTON
========================================================= */

if (previousButton) {

    previousButton.addEventListener(
        "click",
        () => {

            previousSong();

        }
    );

}


/* =========================================================
   SONG BUTTONS
========================================================= */

const songButtons =
    document.querySelectorAll(".music-song");

songButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

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
   UPDATE PLAY BUTTON
========================================================= */

function updatePlayButton() {

    if (!playButton) {
        return;
    }

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


    /* Floating button */

    if (musicFloatingButton) {

        musicFloatingButton.textContent =
            isPlaying ? "Ⅱ" : "♫";

        musicFloatingButton.classList.toggle(
            "playing",
            isPlaying
        );

    }

}


/* =========================================================
   VINYL START / STOP
========================================================= */

function startDisc() {

    if (!musicDisc) {
        return;
    }

    musicDisc.classList.add(
        "spinning"
    );

}


function stopDisc() {

    if (!musicDisc) {
        return;
    }

    musicDisc.classList.remove(
        "spinning"
    );

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
        String(seconds).padStart(2, "0")
    );

}


/* =========================================================
   UPDATE PROGRESS
========================================================= */

function updateProgress(data) {

    if (!data) {
        return;
    }


    /* Current time */

    if (currentTimeElement) {

        currentTimeElement.textContent =
            formatTime(
                data.currentPosition
            );

    }


    /* Duration */

    if (
        durationElement &&
        data.duration
    ) {

        durationElement.textContent =
            formatTime(
                data.duration
            );

    }


    /* Progress bar */

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
   CLICK PROGRESS BAR
========================================================= */

if (progressTrack) {

    progressTrack.addEventListener(
        "click",
        (event) => {

            if (
                !player ||
                !soundcloudReady
            ) {
                return;
            }

            player.getDuration(
                (duration) => {

                    if (!duration) {
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
                        duration *
                        percentage;

                    player.seekTo(
                        newPosition
                    );

                }
            );

        }
    );

}


/* =========================================================
   AUTOMATIC MUSIC WHEN ENTERING SECTION
========================================================= */

if (musicSection) {

    const musicObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting &&
                            siteOpened
                        ) {

                            musicSectionVisible =
                                true;

                            /*
                             * Start the song when
                             * the music section
                             * becomes visible.
                             */

                            if (
                                player &&
                                soundcloudReady
                            ) {

                                player.play();

                            }

                        } else {

                            musicSectionVisible =
                                false;

                            /*
                             * Stop music when the
                             * section leaves view.
                             */

                            if (
                                player &&
                                soundcloudReady
                            ) {

                                player.pause();

                            }

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
   STARS
========================================================= */

const stars =
    document.querySelectorAll(".star");

const starMessage =
    document.getElementById("starMessage");

let starMessageTimeout;


stars.forEach((star) => {

    star.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            const message =
                star.dataset.message;

            if (!message) {
                return;
            }


            /* -----------------------------------------
               SHOW MESSAGE
            ----------------------------------------- */

            if (starMessage) {

                starMessage.textContent =
                    message;

                starMessage.classList.add(
                    "show"
                );

            }


            /* -----------------------------------------
               RESET MESSAGE TIMER
            ----------------------------------------- */

            clearTimeout(
                starMessageTimeout
            );

            starMessageTimeout =
                setTimeout(
                    () => {

                        if (starMessage) {

                            starMessage.classList.remove(
                                "show"
                            );

                        }

                    },
                    4500
                );


            /* -----------------------------------------
               LITTLE STAR EFFECT
            ----------------------------------------- */

            star.style.transform =
                "scale(1.35)";

            setTimeout(
                () => {

                    star.style.transform =
                        "";

                },
                250
            );

        }
    );

});


/* =========================================================
   SECRET MESSAGE
========================================================= */

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

document.querySelectorAll(
    'a[href^="#"]'
).forEach((link) => {

    link.addEventListener(
        "click",
        (event) => {

            const target =
                document.querySelector(
                    link.getAttribute("href")
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

});


/* =========================================================
   START MUSIC SYSTEM
========================================================= */

initializeMusic();
