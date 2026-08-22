/* =========================================================
   SOP'S WEBSITE ♡
   script.js
========================================================= */


/* =========================================================
   SOUNDCloud
========================================================= */

let widget = null;
let soundcloudReady = false;

let currentSongIndex = 1;
let isPlaying = false;


/* =========================================================
   SONGS
========================================================= */

const songs = [
    {
        title: "I Love You",
        artist: "Fontaines D.C.",
        url: "https://soundcloud.com/fontainesdublin/i-love-you",
        icon: "♡"
    },

    {
        title: "You'll Be Mine Tonight",
        artist: "Freddie",
        url: "https://soundcloud.com/user-101510492/youll-be-mine-tonight-freddie",
        icon: "♫"
    },

    {
        title: "Moonlight on the River",
        artist: "Mac DeMarco",
        url: "https://soundcloud.com/user-917397187-731881398/mac-demarco-moonlight-on-the-river-slowed",
        icon: "✦"
    }
];


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

const floatingMusicButton =
    document.getElementById("musicFloatingButton");


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
   UPDATE SONG TEXT
========================================================= */

function updateSongInfo() {

    const song =
        songs[currentSongIndex];

    if (!song) return;

    if (currentSongTitle) {
        currentSongTitle.textContent =
            song.title;
    }

    if (currentSongArtist) {
        currentSongArtist.textContent =
            song.artist;
    }

    updateMusicWheel();
}


/* =========================================================
   UPDATE MUSIC WHEEL
========================================================= */

function updateMusicWheel() {

    const buttons =
        document.querySelectorAll(".music-song");

    buttons.forEach(
        (button, index) => {

            button.classList.remove(
                "song-left",
                "song-main",
                "song-right"
            );

            if (!songs[index]) return;

            const title =
                button.querySelector("span");

            const icon =
                button.querySelector(".song-art");

            if (title) {
                title.textContent =
                    songs[index].title;
            }

            if (icon) {
                icon.textContent =
                    songs[index].icon;
            }


            /*
             * Current song
             */

            if (
                index === currentSongIndex
            ) {

                button.classList.add(
                    "song-main"
                );

                return;
            }


            /*
             * Previous song
             */

            const leftIndex =
                (
                    currentSongIndex -
                    1 +
                    songs.length
                ) % songs.length;


            if (
                index === leftIndex
            ) {

                button.classList.add(
                    "song-left"
                );

                return;
            }


            /*
             * Next song
             */

            button.classList.add(
                "song-right"
            );

        }
    );
}


/* =========================================================
   SOUNDCloud INITIALIZATION
========================================================= */

function initializeSoundCloud() {

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
            "SoundCloud API hasn't loaded yet."
        );

        return;
    }


    widget =
        SC.Widget(iframe);


    /*
     * Player ready
     */

    widget.bind(
        SC.Widget.Events.READY,
        function() {

            console.log(
                "♡ SoundCloud player ready"
            );

            soundcloudReady =
                true;

            updateSongInfo();

            updateDuration();

        }
    );


    /*
     * Song started
     */

    widget.bind(
        SC.Widget.Events.PLAY,
        function() {

            isPlaying =
                true;

            updatePlayButton();

        }
    );


    /*
     * Song paused
     */

    widget.bind(
        SC.Widget.Events.PAUSE,
        function() {

            isPlaying =
                false;

            updatePlayButton();

        }
    );


    /*
     * Song finished
     */

    widget.bind(
        SC.Widget.Events.FINISH,
        function() {

            isPlaying =
                false;

            updatePlayButton();

            nextSong();

        }
    );


    /*
     * Playback progress
     */

    widget.bind(
        SC.Widget.Events.PLAY_PROGRESS,
        function(data) {

            if (!data) return;


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
                duration &&
                total > 0
            ) {

                duration.textContent =
                    formatTime(total);

            }


            /*
             * Progress bar
             */

            if (
                progressBar &&
                total > 0
            ) {

                const percentage =
                    (
                        position /
                        total
                    ) * 100;


                progressBar.style.width =
                    percentage + "%";

            }

        }
    );

}


/* =========================================================
   GET DURATION
========================================================= */

function updateDuration() {

    if (
        !widget ||
        !soundcloudReady
    ) {
        return;
    }


    widget.getDuration(
        function(total) {

            if (
                total &&
                total > 0
            ) {

                if (duration) {

                    duration.textContent =
                        formatTime(total);

                }

            }

        }
    );
}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(
    index,
    autoplay = true
) {

    if (
        !widget ||
        !soundcloudReady
    ) {

        console.warn(
            "SoundCloud isn't ready."
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
     * Stop previous track completely.
     */

    widget.pause();


    isPlaying =
        false;


    updatePlayButton();


    /*
     * Reset UI.
     */

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


    /*
     * Change selected song.
     */

    currentSongIndex =
        index;


    updateSongInfo();


    const song =
        songs[index];


    /*
     * Load the new SoundCloud
     * track.
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
     * Wait for SoundCloud to
     * finish loading the track.
     */

    setTimeout(
        function() {

            updateDuration();


            if (autoplay) {

                widget.play();

            }

        },
        1200
    );

}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function toggleMusic() {

    if (
        !widget ||
        !soundcloudReady
    ) {

        return;
    }


    if (isPlaying) {

        widget.pause();

    } else {

        widget.play();

    }

}


/* =========================================================
   NEXT
========================================================= */

function nextSong() {

    let nextIndex =
        currentSongIndex + 1;


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


/* =========================================================
   PREVIOUS
========================================================= */

function previousSong() {

    if (!widget) return;


    /*
     * If we're more than 3 seconds
     * into the current song,
     * restart it.
     */

    widget.getPosition(
        function(position) {

            if (
                position > 3000
            ) {

                widget.seekTo(0);

                return;
            }


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
                true
            );

        }
    );

}


/* =========================================================
   SELECT SONG
========================================================= */

function selectSong(index) {

    if (
        index === currentSongIndex
    ) {

        toggleMusic();

        return;
    }


    loadSong(
        index,
        true
    );

}


/* =========================================================
   UPDATE PLAY BUTTON
========================================================= */

function updatePlayButton() {

    if (playButton) {

        playButton.textContent =
            isPlaying
                ? "❚❚"
                : "▶";

    }


    if (floatingMusicButton) {

        floatingMusicButton.textContent =
            isPlaying
                ? "❚❚"
                : "♫";

    }

}


/* =========================================================
   SEEK
========================================================= */

function seekMusic(event) {

    if (
        !widget ||
        !soundcloudReady
    ) {

        return;
    }


    const track =
        event.currentTarget;


    const rectangle =
        track.getBoundingClientRect();


    const clickPosition =
        event.clientX -
        rectangle.left;


    const percentage =
        Math.max(
            0,
            Math.min(
                1,
                clickPosition /
                rectangle.width
            )
        );


    widget.getDuration(
        function(total) {

            if (
                !total ||
                total <= 0
            ) {

                return;
            }


            widget.seekTo(
                total * percentage
            );

        }
    );

}


/* =========================================================
   OPEN SITE
========================================================= */

function openSite() {

    const opening =
        document.getElementById("opening");

    const main =
        document.getElementById("main");

    const musicButton =
        document.getElementById(
            "musicFloatingButton"
        );


    if (!opening || !main) {
        return;
    }


    opening.classList.add(
        "opening-closing"
    );


    setTimeout(
        function() {

            opening.style.display =
                "none";


            main.style.display =
                "block";


            if (musicButton) {

                musicButton.classList.add(
                    "visible"
                );

            }


            window.scrollTo(
                0,
                0
            );

        },
        800
    );

}


/* =========================================================
   SECRET MESSAGE
========================================================= */

function openSecret() {

    const message =
        document.getElementById(
            "secretMessage"
        );


    const button =
        document.querySelector(
            ".secret-button"
        );


    if (!message) return;


    message.classList.toggle(
        "show"
    );


    if (button) {

        if (
            message.classList.contains(
                "show"
            )
        ) {

            button.textContent =
                "okay you found it ♡";

        } else {

            button.textContent =
                "definitely don't click this";

        }

    }

}


/* =========================================================
   STAR MESSAGE
========================================================= */

function showStarMessage(message) {

    const box =
        document.getElementById(
            "starMessage"
        );


    if (!box) return;


    box.textContent =
        message;


    box.classList.add(
        "show"
    );


    clearTimeout(
        window.starMessageTimeout
    );


    window.starMessageTimeout =
        setTimeout(
            function() {

                box.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   CLICK SPARKLES
========================================================= */

function createClickSparkles(
    x,
    y
) {

    const symbols = [
        "♡",
        "✦",
        "✧",
        "·"
    ];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const sparkle =
            document.createElement(
                "span"
            );


        sparkle.className =
            "click-sparkle";


        sparkle.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        sparkle.style.left =
            x + "px";


        sparkle.style.top =
            y + "px";


        sparkle.style.setProperty(
            "--x",
            (
                Math.random() * 100 -
                50
            ) + "px"
        );


        sparkle.style.setProperty(
            "--y",
            (
                Math.random() * 100 -
                50
            ) + "px"
        );


        document.body.appendChild(
            sparkle
        );


        setTimeout(
            function() {

                sparkle.remove();

            },
            900
        );

    }

}


/* =========================================================
   FLOATING PARTICLES
========================================================= */

function createParticles() {

    const background =
        document.querySelector(
            ".background"
        );


    if (!background) return;


    const symbols = [
        "♡",
        "✦",
        "✧",
        "·"
    ];


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "floating-particle";


        particle.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        particle.style.left =
            Math.random() * 100 +
            "%";


        particle.style.animationDuration =
            (
                10 +
                Math.random() * 15
            ) + "s";


        particle.style.animationDelay =
            (
                Math.random() * 10
            ) + "s";


        particle.style.fontSize =
            (
                8 +
                Math.random() * 12
            ) + "px";


        background.appendChild(
            particle
        );

    }

}


/* =========================================================
   BACKGROUND STARS
========================================================= */

function createSkyStars() {

    const sky =
        document.querySelector(
            ".sky-container"
        );


    if (!sky) return;


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const star =
            document.createElement(
                "span"
            );


        star.className =
            "background-star";


        star.style.left =
            Math.random() * 100 +
            "%";


        star.style.top =
            Math.random() * 100 +
            "%";


        star.style.animationDelay =
            (
                Math.random() * 3
            ) + "s";


        star.style.animationDuration =
            (
                1.5 +
                Math.random() * 2
            ) + "s";


        sky.appendChild(
            star
        );

    }

}


/* =========================================================
   SONG BUTTON EVENTS
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const songButton =
            event.target.closest(
                ".music-song"
            );


        if (songButton) {

            const index =
                Number(
                    songButton.dataset.index
                );


            if (
                !Number.isNaN(index)
            ) {

                selectSong(index);

            }

        }


        /*
         * Stars
         */

        const star =
            event.target.closest(
                ".star"
            );


        if (star) {

            createClickSparkles(
                event.clientX,
                event.clientY
            );

        }

    }
);


/* =========================================================
   SCROLL REVEAL
========================================================= */

function setupScrollReveal() {

    const elements =
        document.querySelectorAll(
            ".reason, .timeline-item, .secret-box, .final-card"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            function(entries) {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );


                            observer.unobserve(
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


    elements.forEach(
        element => {

            element.classList.add(
                "reveal"
            );


            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   BUTTONS
========================================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        toggleMusic
    );

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        nextSong
    );

}


if (previousButton) {

    previousButton.addEventListener(
        "click",
        previousSong
    );

}


if (floatingMusicButton) {

    floatingMusicButton.addEventListener(
        "click",
        toggleMusic
    );

}


/* =========================================================
   PROGRESS BAR
========================================================= */

const progressTrack =
    document.querySelector(
        ".progress-track"
    );


if (progressTrack) {

    progressTrack.addEventListener(
        "click",
        seekMusic
    );

}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateSongInfo();

        updatePlayButton();

        createParticles();

        createSkyStars();

        setupScrollReveal();


        /*
         * SoundCloud API may take a
         * moment to load.
         */

        if (
            typeof SC !== "undefined" &&
            SC.Widget
        ) {

            initializeSoundCloud();

        } else {

            setTimeout(
                initializeSoundCloud,
                700
            );

        }

    }
);
