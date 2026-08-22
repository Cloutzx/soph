/* =========================================================
   SOP'S LITTLE WEBSITE
   FULL SCRIPT
========================================================= */


/* =========================================================
   SOUNDCLOUD
========================================================= */

const soundcloudIframe = document.getElementById(
    "soundcloud-player"
);

const soundcloudWidget = SC.Widget(
    soundcloudIframe
);


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
   PLAYER STATE
========================================================= */

let currentSongIndex = 1;

let musicPlaying = false;

let soundcloudReady = false;

let loadingSong = false;

let loadRequest = 0;


/* =========================================================
   ELEMENTS
========================================================= */

const playButton =
    document.getElementById("playButton");

const currentSongTitle =
    document.getElementById("currentSongTitle");

const currentSongArtist =
    document.getElementById("currentSongArtist");

const progressBar =
    document.getElementById("progressBar");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const floatingMusicButton =
    document.getElementById(
        "musicFloatingButton"
    );


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(milliseconds) {

    if (
        milliseconds === undefined ||
        milliseconds === null ||
        isNaN(milliseconds) ||
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
        seconds.toString().padStart(2, "0")
    );
}


/* =========================================================
   UPDATE SONG INFORMATION
========================================================= */

function updateSongInfo() {

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

    updateMusicWheel();
}


/* =========================================================
   MUSIC WHEEL
========================================================= */

function updateMusicWheel() {

    const songButtons =
        document.querySelectorAll(
            ".music-song"
        );

    songButtons.forEach(
        function(button, index) {

            button.classList.remove(
                "song-left",
                "song-main",
                "song-right"
            );

            const song =
                songs[index];

            if (!song) {
                return;
            }

            const title =
                button.querySelector("span");

            const icon =
                button.querySelector(".song-art");

            if (title) {

                title.textContent =
                    song.title;

            }

            if (icon) {

                icon.textContent =
                    song.icon;

            }


            /*
             * CENTER
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
             * LEFT
             */

            const leftIndex =
                (
                    currentSongIndex -
                    1 +
                    songs.length
                ) %
                songs.length;


            if (
                index === leftIndex
            ) {

                button.classList.add(
                    "song-left"
                );

                return;

            }


            /*
             * RIGHT
             */

            button.classList.add(
                "song-right"
            );

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
        !songs[index] ||
        !soundcloudReady
    ) {
        return;
    }


    /*
     * Create a unique request ID.
     *
     * This prevents an old delayed load
     * from loading after the user clicks
     * another song quickly.
     */

    const requestID =
        ++loadRequest;


    loadingSong = true;


    currentSongIndex =
        index;


    const song =
        songs[currentSongIndex];


    /*
     * STOP THE CURRENT SONG FIRST
     */

    soundcloudWidget.pause();


    musicPlaying =
        false;


    updatePlayButton();


    /*
     * RESET PROGRESS
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


    /*
     * Update the visible song
     * immediately.
     */

    updateSongInfo();


    /*
     * Give SoundCloud time to stop
     * the previous track.
     */

    setTimeout(
        function() {

            /*
             * A newer song was clicked.
             * Don't load this old request.
             */

            if (
                requestID !== loadRequest
            ) {

                return;

            }


            soundcloudWidget.load(
                song.url,
                {

                    auto_play:
                        false,

                    show_artwork:
                        false,

                    hide_related:
                        true,

                    show_comments:
                        false,

                    show_user:
                        false,

                    show_reposts:
                        false,

                    visual:
                        false

                }
            );


            /*
             * Wait for SoundCloud to
             * finish loading.
             */

            setTimeout(
                function() {

                    if (
                        requestID !==
                        loadRequest
                    ) {
                        return;
                    }


                    updateDuration();


                    /*
                     * Start the new song only
                     * after it has been loaded.
                     */

                    if (autoplay) {

                        setTimeout(
                            function() {

                                if (
                                    requestID !==
                                    loadRequest
                                ) {
                                    return;
                                }


                                soundcloudWidget.play();


                                musicPlaying =
                                    true;


                                updatePlayButton();

                            },
                            250
                        );

                    }

                    else {

                        musicPlaying =
                            false;

                        updatePlayButton();

                    }


                    loadingSong =
                        false;

                },
                500
            );

        },
        200
    );

}


/* =========================================================
   PLAY
========================================================= */

function playMusic() {

    if (
        !soundcloudReady ||
        loadingSong
    ) {
        return;
    }


    soundcloudWidget.play();


    musicPlaying =
        true;


    updatePlayButton();

}


/* =========================================================
   PAUSE
========================================================= */

function pauseMusic() {

    if (
        !soundcloudReady ||
        loadingSong
    ) {
        return;
    }


    soundcloudWidget.pause();


    musicPlaying =
        false;


    updatePlayButton();

}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function toggleMusic() {

    if (musicPlaying) {

        pauseMusic();

    }

    else {

        playMusic();

    }

}


/* =========================================================
   UPDATE PLAY BUTTON
========================================================= */

function updatePlayButton() {

    if (playButton) {

        playButton.textContent =
            musicPlaying
                ? "❚❚"
                : "▶";

    }


    if (floatingMusicButton) {

        floatingMusicButton.textContent =
            musicPlaying
                ? "❚❚"
                : "♫";

    }

}


/* =========================================================
   NEXT SONG
========================================================= */

function nextSong() {

    if (
        !soundcloudReady
    ) {
        return;
    }


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
   PREVIOUS SONG
========================================================= */

function previousSong() {

    if (
        !soundcloudReady
    ) {
        return;
    }


    soundcloudWidget.getPosition(
        function(position) {

            /*
             * If we're more than 3 seconds
             * into the current song,
             * restart the song.
             */

            if (
                position > 3000
            ) {

                soundcloudWidget.seekTo(
                    0
                );

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
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    /*
     * Clicking the currently playing
     * song acts as play/pause.
     */

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
   GET SONG DURATION
========================================================= */

function updateDuration() {

    if (!soundcloudReady) {
        return;
    }


    soundcloudWidget.getDuration(
        function(totalDuration) {

            if (
                totalDuration &&
                totalDuration > 0
            ) {

                if (duration) {

                    duration.textContent =
                        formatTime(
                            totalDuration
                        );

                }

                return;

            }


            /*
             * SoundCloud sometimes needs
             * another moment.
             */

            setTimeout(
                updateDuration,
                500
            );

        }
    );

}


/* =========================================================
   SEEK BAR
========================================================= */

function seekMusic(event) {

    if (
        !soundcloudReady ||
        loadingSong
    ) {
        return;
    }


    const track =
        event.currentTarget;


    const rect =
        track.getBoundingClientRect();


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


    soundcloudWidget.getDuration(
        function(totalDuration) {

            if (
                !totalDuration ||
                totalDuration <= 0
            ) {
                return;
            }


            const position =
                totalDuration *
                percentage;


            soundcloudWidget.seekTo(
                position
            );

        }
    );

}


/* =========================================================
   SOUNDCLOUD READY
========================================================= */

soundcloudWidget.bind(
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


/* =========================================================
   PLAY EVENT
========================================================= */

soundcloudWidget.bind(
    SC.Widget.Events.PLAY,
    function() {

        musicPlaying =
            true;


        updatePlayButton();


        updateDuration();

    }
);


/* =========================================================
   PAUSE EVENT
========================================================= */

soundcloudWidget.bind(
    SC.Widget.Events.PAUSE,
    function() {

        musicPlaying =
            false;


        updatePlayButton();

    }
);


/* =========================================================
   FINISHED
========================================================= */

soundcloudWidget.bind(
    SC.Widget.Events.FINISH,
    function() {

        musicPlaying =
            false;


        updatePlayButton();


        /*
         * Automatically go to
         * the next song.
         */

        setTimeout(
            function() {

                nextSong();

            },
            200
        );

    }
);


/* =========================================================
   PLAY PROGRESS
========================================================= */

soundcloudWidget.bind(
    SC.Widget.Events.PLAY_PROGRESS,
    function(data) {

        if (!data) {
            return;
        }


        const current =
            data.currentPosition || 0;


        const total =
            data.duration || 0;


        /*
         * Progress bar
         */

        if (
            progressBar &&
            total > 0
        ) {

            const percentage =
                (
                    current /
                    total
                ) * 100;


            progressBar.style.width =
                percentage + "%";

        }


        /*
         * Current time
         */

        if (currentTime) {

            currentTime.textContent =
                formatTime(
                    current
                );

        }


        /*
         * Actual end time
         */

        if (
            duration &&
            total > 0
        ) {

            duration.textContent =
                formatTime(
                    total
                );

        }

    }
);


/* =========================================================
   OPEN WEBSITE
========================================================= */

function openSite() {

    const opening =
        document.getElementById(
            "opening"
        );


    const main =
        document.getElementById(
            "main"
        );


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
                {
                    top: 0,
                    behavior: "instant"
                }
            );

        },
        800
    );

}


/* =========================================================
   STAR MESSAGE
========================================================= */

function showStarMessage(message) {

    const box =
        document.getElementById(
            "starMessage"
        );


    if (!box) {
        return;
    }


    box.classList.remove(
        "show"
    );


    setTimeout(
        function() {

            box.textContent =
                message;


            box.classList.add(
                "show"
            );

        },
        100
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


    if (!message) {
        return;
    }


    message.classList.toggle(
        "show"
    );


    if (!button) {
        return;
    }


    if (
        message.classList.contains(
            "show"
        )
    ) {

        button.textContent =
            "okay you found it ♡";

    }

    else {

        button.textContent =
            "definitely don't click this";

    }

}


/* =========================================================
   BACKGROUND PARTICLES
========================================================= */

function createParticles() {

    const background =
        document.querySelector(
            ".background"
        );


    if (!background) {
        return;
    }


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


        particle.classList.add(
            "floating-particle"
        );


        particle.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        particle.style.left =
            Math.random() *
            100 +
            "%";


        particle.style.animationDuration =
            10 +
            Math.random() *
            15 +
            "s";


        particle.style.animationDelay =
            Math.random() *
            10 +
            "s";


        particle.style.fontSize =
            8 +
            Math.random() *
            12 +
            "px";


        background.appendChild(
            particle
        );

    }

}


/* =========================================================
   SKY STARS
========================================================= */

function createSkyStars() {

    const sky =
        document.querySelector(
            ".sky-container"
        );


    if (!sky) {
        return;
    }


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const star =
            document.createElement(
                "span"
            );


        star.classList.add(
            "background-star"
        );


        star.style.left =
            Math.random() *
            100 +
            "%";


        star.style.top =
            Math.random() *
            100 +
            "%";


        star.style.animationDelay =
            Math.random() *
            3 +
            "s";


        star.style.animationDuration =
            1.5 +
            Math.random() *
            2 +
            "s";


        sky.appendChild(
            star
        );

    }

}


/* =========================================================
   CLICK SPARKLES
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const star =
            event.target.closest(
                ".star"
            );


        if (!star) {
            return;
        }


        createClickSparkles(
            event.clientX,
            event.clientY
        );

    }
);


/* =========================================================
   CREATE CLICK SPARKLES
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
            x +
            "px";


        sparkle.style.top =
            y +
            "px";


        sparkle.style.setProperty(
            "--x",
            (
                Math.random() *
                100 -
                50
            ) +
            "px"
        );


        sparkle.style.setProperty(
            "--y",
            (
                Math.random() *
                100 -
                50
            ) +
            "px"
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
   SCROLL REVEAL
========================================================= */

function setupScrollReveal() {

    const elements =
        document.querySelectorAll(
            ".reason, .timeline-item, .secret-box, .final-card"
        );


    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        elements.forEach(
            function(element) {

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
                    function(entry) {

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
        function(element) {

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
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
         * Start with the second song
         */

        currentSongIndex =
            1;


        updateSongInfo();


        /*
         * Background effects
         */

        createParticles();

        createSkyStars();


        /*
         * Scroll animations
         */

        setupScrollReveal();


        /*
         * Music controls
         */

        updatePlayButton();

    }
);
