/* =========================================================
   SOP WEBSITE
   script.js
========================================================= */


/* =========================================================
   OPEN WEBSITE
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

    // Try to start the currently selected song.
    // Browsers may block autoplay until the user interacts,
    // but clicking "open it" counts as user interaction.
    setTimeout(() => {
        if (window.soundcloudReady) {
            playCurrentSong();
        }
    }, 800);
}


/* =========================================================
   SECRET MESSAGE
========================================================= */

function openSecret() {
    const message = document.getElementById("secretMessage");

    if (!message) return;

    message.classList.toggle("show");

    const button = document.querySelector(".secret-button");

    if (button) {
        if (message.classList.contains("show")) {
            button.textContent = "okay maybe you can click this ♡";
        } else {
            button.textContent = "definitely don't click this";
        }
    }
}


/* =========================================================
   STAR MESSAGES
========================================================= */

function showStarMessage(message) {
    const box = document.getElementById("starMessage");

    if (!box) return;

    box.textContent = message;

    box.classList.remove("show");

    // Force browser to recognize the class removal before
    // adding it again.
    void box.offsetWidth;

    box.classList.add("show");

    clearTimeout(window.starMessageTimer);

    window.starMessageTimer = setTimeout(() => {
        box.classList.remove("show");
    }, 5000);
}


/* =========================================================
   MUSIC
========================================================= */


/*
    Your SoundCloud tracks.

    These are the three links you gave me.
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
   MUSIC STATE
========================================================= */

let currentSongIndex = 1;

let widget = null;

let widgetReady = false;

let isPlaying = false;

let currentDuration = 0;

let currentPosition = 0;

let progressTimer = null;

window.soundcloudReady = false;


/* =========================================================
   ELEMENTS
========================================================= */

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

const floatingMusicButton =
    document.getElementById("musicFloatingButton");

const songButtons =
    document.querySelectorAll(".music-song");


/* =========================================================
   TIME FORMATTER
========================================================= */

function formatTime(milliseconds) {

    if (
        milliseconds === undefined ||
        milliseconds === null ||
        !Number.isFinite(milliseconds)
    ) {
        return "0:00";
    }

    const totalSeconds =
        Math.max(0, Math.floor(milliseconds / 1000));

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

function updateSongInfo() {

    const song = songs[currentSongIndex];

    if (!song) return;

    if (currentSongTitle) {
        currentSongTitle.textContent = song.title;
    }

    if (currentSongArtist) {
        currentSongArtist.textContent = song.artist;
    }

    if (currentTime) {
        currentTime.textContent = "0:00";
    }

    if (duration) {
        duration.textContent = "0:00";
    }

    if (progressBar) {
        progressBar.style.width = "0%";
    }

    updateSongButtons();
}


/* =========================================================
   UPDATE SONG WHEEL
========================================================= */

function updateSongButtons() {

    songButtons.forEach((button, index) => {

        button.classList.remove("active");
        button.classList.remove("song-main");

        if (index === currentSongIndex) {

            button.classList.add("active");
            button.classList.add("song-main");

        }

    });
}


/* =========================================================
   CREATE SOUNDCLOUD WIDGET
========================================================= */

function createWidget() {

    if (!iframe) {
        console.error(
            "SoundCloud iframe was not found."
        );

        return;
    }

    if (
        typeof SC === "undefined" ||
        !SC.Widget
    ) {
        console.error(
            "SoundCloud Widget API did not load."
        );

        return;
    }


    widget = SC.Widget(iframe);


    widget.bind(
        SC.Widget.Events.READY,
        function () {

            console.log(
                "SoundCloud widget ready."
            );

            widgetReady = true;

            window.soundcloudReady = true;

            setupWidgetEvents();

            updateSongInfo();

        }
    );
}


/* =========================================================
   SOUNDCLOUD EVENTS
========================================================= */

function setupWidgetEvents() {

    if (!widget) return;


    /* PLAY */

    widget.bind(
        SC.Widget.Events.PLAY,
        function () {

            isPlaying = true;

            updatePlayButton();

            startProgressUpdater();

            if (floatingMusicButton) {
                floatingMusicButton.classList.add(
                    "playing"
                );
            }

        }
    );


    /* PAUSE */

    widget.bind(
        SC.Widget.Events.PAUSE,
        function () {

            isPlaying = false;

            updatePlayButton();

            stopProgressUpdater();

            if (floatingMusicButton) {
                floatingMusicButton.classList.remove(
                    "playing"
                );
            }

        }
    );


    /* FINISH */

    widget.bind(
        SC.Widget.Events.FINISH,
        function () {

            isPlaying = false;

            stopProgressUpdater();

            nextSong(true);

        }
    );


    /* LOAD PROGRESS */

    widget.bind(
        SC.Widget.Events.LOAD_PROGRESS,
        function (data) {

            if (!data) return;

            if (
                data.loadedFraction !== undefined &&
                progressBar &&
                currentDuration > 0
            ) {

                // Don't actually set the progress here.
                // PLAY_PROGRESS is more accurate.

            }

        }
    );


    /* PLAY PROGRESS */

    widget.bind(
        SC.Widget.Events.PLAY_PROGRESS,
        function (data) {

            if (!data) return;

            if (
                data.currentPosition !== undefined
            ) {

                currentPosition =
                    data.currentPosition;

                updateProgress(
                    currentPosition
                );

            }

        }
    );


    /* SEEK */

    widget.bind(
        SC.Widget.Events.SEEK,
        function (data) {

            if (!data) return;

            if (
                data.currentPosition !== undefined
            ) {

                currentPosition =
                    data.currentPosition;

                updateProgress(
                    currentPosition
                );

            }

        }
    );

}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(
    index,
    autoplay = false
) {

    if (!widgetReady || !widget) {
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


    currentSongIndex = index;

    isPlaying = false;

    currentDuration = 0;

    currentPosition = 0;

    stopProgressUpdater();

    updateSongInfo();

    updatePlayButton();


    /*
        THIS IS IMPORTANT.

        We use the existing SoundCloud widget
        instead of creating another iframe.

        That prevents overlapping songs.
    */

    widget.load(
        songs[index].url,
        {
            auto_play: autoplay,
            hide_related: true,
            show_comments: false,
            show_user: false,
            show_reposts: false,
            visual: false,
            color: "#b28bbd"
        }
    );


    /*
        Ask SoundCloud for the duration shortly
        after the new track loads.
    */

    setTimeout(() => {
        getDuration();
    }, 700);

}


/* =========================================================
   GET DURATION
========================================================= */

function getDuration() {

    if (!widgetReady || !widget) return;

    widget.getDuration(
        function (milliseconds) {

            if (
                milliseconds &&
                milliseconds > 0
            ) {

                currentDuration =
                    milliseconds;

                if (duration) {
                    duration.textContent =
                        formatTime(milliseconds);
                }

                updateProgress(
                    currentPosition
                );

            }

        }
    );

}


/* =========================================================
   PLAY
========================================================= */

function playCurrentSong() {

    if (!widgetReady || !widget) {
        return;
    }

    widget.play();
}


/* =========================================================
   PAUSE
========================================================= */

function pauseCurrentSong() {

    if (!widgetReady || !widget) {
        return;
    }

    widget.pause();
}


/* =========================================================
   TOGGLE PLAY
========================================================= */

function togglePlay() {

    if (!widgetReady || !widget) {
        console.warn(
            "SoundCloud widget isn't ready."
        );

        return;
    }

    if (isPlaying) {

        pauseCurrentSong();

    } else {

        playCurrentSong();

    }
}


/* =========================================================
   NEXT SONG
========================================================= */

function nextSong(fromFinish = false) {

    let nextIndex =
        currentSongIndex + 1;

    if (
        nextIndex >= songs.length
    ) {
        nextIndex = 0;
    }

    loadSong(
        nextIndex,
        fromFinish || isPlaying
    );
}


/* =========================================================
   PREVIOUS SONG
========================================================= */

function previousSong() {

    let previousIndex =
        currentSongIndex - 1;

    if (
        previousIndex < 0
    ) {
        previousIndex =
            songs.length - 1;
    }

    loadSong(
        previousIndex,
        false
    );
}


/* =========================================================
   PLAY BUTTON
========================================================= */

function updatePlayButton() {

    if (!playButton) return;

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


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress(milliseconds) {

    if (!currentTime) return;

    currentTime.textContent =
        formatTime(milliseconds);


    if (
        currentDuration > 0 &&
        progressBar
    ) {

        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    (milliseconds /
                        currentDuration) *
                    100
                )
            );

        progressBar.style.width =
            percentage + "%";

    }


    if (
        currentDuration > 0 &&
        duration
    ) {

        duration.textContent =
            formatTime(currentDuration);

    }

}


/* =========================================================
   PROGRESS FALLBACK
========================================================= */

function startProgressUpdater() {

    stopProgressUpdater();

    progressTimer =
        setInterval(() => {

            if (!widgetReady || !widget) {
                return;
            }

            widget.getPosition(
                function (position) {

                    if (
                        position !== undefined &&
                        position !== null
                    ) {

                        currentPosition =
                            position;

                        updateProgress(
                            position
                        );

                    }

                }
            );


            if (currentDuration <= 0) {
                getDuration();
            }

        }, 500);

}


function stopProgressUpdater() {

    if (progressTimer) {

        clearInterval(
            progressTimer
        );

        progressTimer = null;

    }

}


/* =========================================================
   CLICK PROGRESS BAR
========================================================= */

function seekFromProgress(event) {

    if (
        !widgetReady ||
        !widget ||
        !progressTrack ||
        currentDuration <= 0
    ) {
        return;
    }


    const rect =
        progressTrack.getBoundingClientRect();


    const clickPosition =
        event.clientX -
        rect.left;


    let percentage =
        clickPosition /
        rect.width;


    percentage =
        Math.max(
            0,
            Math.min(
                1,
                percentage
            )
        );


    const newPosition =
        currentDuration *
        percentage;


    widget.seekTo(
        newPosition
    );

}


/* =========================================================
   SONG BUTTONS
========================================================= */

songButtons.forEach(
    (button) => {

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
                    Selecting a song immediately
                    loads that song and plays it.
                */

                loadSong(
                    index,
                    true
                );

            }
        );

    }
);


/* =========================================================
   CONTROL BUTTONS
========================================================= */

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

            nextSong(false);

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


if (progressTrack) {

    progressTrack.addEventListener(
        "click",
        function (event) {

            seekFromProgress(event);

        }
    );

}


/* =========================================================
   FLOATING MUSIC BUTTON
========================================================= */

if (floatingMusicButton) {

    floatingMusicButton.addEventListener(
        "click",
        function () {

            togglePlay();

        }
    );

}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        /*
            Don't trigger music controls while
            typing into an input.
        */

        const tag =
            document.activeElement?.tagName;

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA"
        ) {
            return;
        }


        /* SPACE = PLAY / PAUSE */

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            togglePlay();

        }


        /* RIGHT ARROW = NEXT */

        if (
            event.code === "ArrowRight"
        ) {

            nextSong(false);

        }


        /* LEFT ARROW = PREVIOUS */

        if (
            event.code === "ArrowLeft"
        ) {

            previousSong();

        }

    }
);


/* =========================================================
   INITIALIZE SOUNDCLOUD
========================================================= */

function initializeSoundCloud() {

    if (
        typeof SC === "undefined" ||
        !SC.Widget
    ) {

        console.error(
            "SoundCloud API hasn't loaded yet."
        );

        /*
            Sometimes the API takes a moment to load.
            Try again.
        */

        setTimeout(
            initializeSoundCloud,
            500
        );

        return;
    }


    createWidget();

}


/* =========================================================
   WAIT FOR PAGE
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSoundCloud
    );

} else {

    initializeSoundCloud();

}


/* =========================================================
   INITIAL UI
========================================================= */

updateSongInfo();

updatePlayButton();


/* =========================================================
   MAKE OPEN SITE AVAILABLE GLOBALLY
========================================================= */

window.openSite =
    openSite;

window.openSecret =
    openSecret;

window.showStarMessage =
    showStarMessage;

window.playCurrentSong =
    playCurrentSong;
