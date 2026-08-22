/* =========================================================
   SOP'S WEBSITE — MUSIC + INTERACTIONS
========================================================= */


/* =========================================================
   SOUNDCloud PLAYER
========================================================= */

const iframe = document.getElementById("soundcloud-player");

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

const playButton =
    document.getElementById("playButton");

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


/* =========================================================
   UPDATE SONG INFO
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

            if (index === currentSongIndex) {

                button.classList.add(
                    "song-main"
                );

            } else {

                const left =
                    (
                        currentSongIndex -
                        1 +
                        songs.length
                    ) %
                    songs.length;

                if (index === left) {

                    button.classList.add(
                        "song-left"
                    );

                } else {

                    button.classList.add(
                        "song-right"
                    );

                }
            }
        }
    );
}


/* =========================================================
   INITIALIZE SOUNDCLOUD
========================================================= */

function initializeSoundCloud() {

    if (!iframe) {

        console.error(
            "SoundCloud iframe not found."
        );

        return;
    }


    if (
        typeof SC === "undefined" ||
        !SC.Widget
    ) {

        console.error(
            "SoundCloud API has not loaded."
        );

        return;
    }


    widget =
        SC.Widget(iframe);


    widget.bind(
        SC.Widget.Events.READY,
        function() {

            console.log(
                "SoundCloud player ready!"
            );

            soundcloudReady =
                true;

            updateSongInfo();

            updateDuration();

        }
    );


    widget.bind(
        SC.Widget.Events.PLAY,
        function() {

            isPlaying =
                true;

            updatePlayButton();

            updateDuration();

        }
    );


    widget.bind(
        SC.Widget.Events.PAUSE,
        function() {

            isPlaying =
                false;

            updatePlayButton();

        }
    );


    widget.bind(
        SC.Widget.Events.FINISH,
        function() {

            isPlaying =
                false;

            updatePlayButton();

            nextSong();

        }
    );


    widget.bind(
        SC.Widget.Events.PLAY_PROGRESS,
        function(data) {

            if (!data) return;


            const current =
                data.currentPosition || 0;

            const total =
                data.duration || 0;


            if (
                currentTime
            ) {

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
                    percent + "%";

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
            "SoundCloud isn't ready yet."
        );

        return;
    }


    if (
        !songs[index]
    ) {

        return;
    }


    currentSongIndex =
        index;


    const song =
        songs[index];


    /*
     * Stop the current song first.
     */

    widget.pause();


    isPlaying =
        false;


    updatePlayButton();


    /*
     * Reset progress.
     */

    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    if (currentTime) {

        currentTime.textContent =
            "0:00";

    }


    if (duration) {

        duration.textContent =
            "0:00";

    }


    updateSongInfo();


    /*
     * Load the new SoundCloud track.
     */

    widget.load(
        song.url,
        {
            auto_play: false,

            show_artwork: false,

            hide_related: true,

            show_comments: false,

            show_user: false,

            show_reposts: false,

            visual: false
        }
    );


    /*
     * Give SoundCloud time to load
     * the new track.
     */

    setTimeout(
        function() {

            updateDuration();


            if (autoplay) {

                widget.play();

            }

        },
        800
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
   NEXT SONG
========================================================= */

function nextSong() {

    let next =
        currentSongIndex + 1;


    if (
        next >= songs.length
    ) {

        next = 0;

    }


    loadSong(
        next,
        true
    );
}


/* =========================================================
   PREVIOUS SONG
========================================================= */

function previousSong() {

    /*
     * If we're several seconds into
     * the song, restart it instead.
     */

    if (widget) {

        widget.getPosition(
            function(position) {

                if (
                    position > 3000
                ) {

                    widget.seekTo(0);

                    return;

                }


                let previous =
                    currentSongIndex - 1;


                if (
                    previous < 0
                ) {

                    previous =
                        songs.length - 1;

                }


                loadSong(
                    previous,
                    true
                );

            }
        );

    }
}


/* =========================================================
   SELECT SONG FROM WHEEL
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


    const rect =
        track.getBoundingClientRect();


    const position =
        event.clientX -
        rect.left;


    const percentage =
        Math.max(
            0,
            Math.min(
                1,
                position / rect.width
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
        "✧"
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
   PARTICLES
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
            Math.random() * 100 + "%";


        particle.style.animationDuration =
            10 +
            Math.random() * 15 +
            "s";


        particle.style.animationDelay =
            Math.random() * 10 +
            "s";


        particle.style.fontSize =
            8 +
            Math.random() * 12 +
            "px";


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
            Math.random() * 100 + "%";


        star.style.top =
            Math.random() * 100 + "%";


        star.style.animationDelay =
            Math.random() * 3 + "s";


        star.style.animationDuration =
            1.5 +
            Math.random() * 2 +
            "s";


        sky.appendChild(
            star
        );
    }
}


/* =========================================================
   CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        /*
         * Music wheel
         */

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
         * Clickable stars
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
   BUTTON EVENTS
========================================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        toggleMusic
    );

}


const nextButton =
    document.getElementById(
        "nextButton"
    );


if (nextButton) {

    nextButton.addEventListener(
        "click",
        nextSong
    );

}


const previousButton =
    document.getElementById(
        "previousButton"
    );


if (previousButton) {

    previousButton.addEventListener(
        "click",
        previousSong
    );

}


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


if (floatingMusicButton) {

    floatingMusicButton.addEventListener(
        "click",
        toggleMusic
    );

}


/* =========================================================
   START
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
         * Wait until the SoundCloud
         * API script is available.
         */

        if (
            typeof SC !== "undefined" &&
            SC.Widget
        ) {

            initializeSoundCloud();

        } else {

            setTimeout(
                initializeSoundCloud,
                500
            );

        }

    }
);
