/* =========================================================
   SOP'S LITTLE WEBSITE
   SoundCloud Music Player + Site Effects
========================================================= */


/* =========================================================
   SOUNDCLOUD SETUP
========================================================= */

const soundcloudIframe =
    document.getElementById("soundcloud-player");

const soundcloudWidget =
    SC.Widget(soundcloudIframe);


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


let currentSongIndex = 1;

let musicPlaying = false;

let soundcloudReady = false;


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
    document.getElementById("musicFloatingButton");


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(milliseconds) {

    if (
        milliseconds === undefined ||
        milliseconds === null ||
        isNaN(milliseconds)
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
        seconds
            .toString()
            .padStart(2, "0")
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
   UPDATE MUSIC WHEEL
========================================================= */

function updateMusicWheel() {

    const songButtons =
        document.querySelectorAll(
            ".music-song"
        );


    songButtons.forEach(
        (button, index) => {

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
                Put the currently selected song
                in the center.
            */

            if (
                index === currentSongIndex
            ) {

                button.classList.add(
                    "song-main"
                );

            }

            else if (
                index <
                currentSongIndex
            ) {

                button.classList.add(
                    "song-left"
                );

            }

            else {

                button.classList.add(
                    "song-right"
                );

            }

        }
    );


    const wheel =
        document.querySelector(
            ".music-wheel"
        );


    if (!wheel) {
        return;
    }


    wheel.classList.remove(
        "wheel-left",
        "wheel-center",
        "wheel-right"
    );


    if (currentSongIndex === 0) {

        wheel.classList.add(
            "wheel-left"
        );

    }

    else if (currentSongIndex === 2) {

        wheel.classList.add(
            "wheel-right"
        );

    }

    else {

        wheel.classList.add(
            "wheel-center"
        );

    }

}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index, autoplay = true) {

    if (
        !songs[index] ||
        !soundcloudReady
    ) {
        return;
    }


    currentSongIndex = index;


    const song =
        songs[currentSongIndex];


    updateSongInfo();


    /*
        Reset progress.
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
        Load the SoundCloud track.
    */

    soundcloudWidget.load(
        song.url,
        {
            auto_play: autoplay,

            show_artwork: false,

            hide_related: true,

            show_comments: false,

            show_user: false,

            show_reposts: false,

            visual: false
        }
    );


    musicPlaying =
        autoplay;


    updatePlayButton();

}


/* =========================================================
   PLAY
========================================================= */

function playMusic() {

    if (!soundcloudReady) {

        console.log(
            "SoundCloud is still loading..."
        );

        return;
    }


    soundcloudWidget.play();


    musicPlaying = true;


    updatePlayButton();

}


/* =========================================================
   PAUSE
========================================================= */

function pauseMusic() {

    if (!soundcloudReady) {
        return;
    }


    soundcloudWidget.pause();


    musicPlaying = false;


    updatePlayButton();

}


/* =========================================================
   TOGGLE
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
   PLAY BUTTON
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

    if (!soundcloudReady) {
        return;
    }


    let nextIndex =
        currentSongIndex + 1;


    if (
        nextIndex >=
        songs.length
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

    if (!soundcloudReady) {
        return;
    }


    /*
        If the song has been playing for
        more than 3 seconds, restart it.
    */

    soundcloudWidget.getPosition(
        function(position) {

            if (position > 3000) {

                soundcloudWidget.seekTo(0);

                return;

            }


            let previousIndex =
                currentSongIndex - 1;


            if (previousIndex < 0) {

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
   SELECT SONG FROM WHEEL
========================================================= */

function selectSong(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {
        return;
    }


    loadSong(
        index,
        true
    );

}


/* =========================================================
   SEEK
========================================================= */

function seekMusic(event) {

    if (!soundcloudReady) {
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


    /*
        Keep it between 0 and 1.
    */

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

            if (!totalDuration) {
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


        soundcloudReady = true;


        /*
            Start with the second song
            because that is the center
            song in the HTML.
        */

        updateSongInfo();


        /*
            Get the current duration.
        */

        updateDuration();

    }
);


/* =========================================================
   PLAY EVENT
========================================================= */

soundcloudWidget.bind(
    SC.Widget.Events.PLAY,
    function() {

        musicPlaying = true;

        updatePlayButton();

    }
);


/* =========================================================
   PAUSE EVENT
========================================================= */

soundcloudWidget.bind(
    SC.Widget.Events.PAUSE,
    function() {

        musicPlaying = false;

        updatePlayButton();

    }
);


/* =========================================================
   FINISH EVENT
========================================================= */

soundcloudWidget.bind(
    SC.Widget.Events.FINISH,
    function() {

        musicPlaying = false;

        updatePlayButton();


        /*
            Automatically move to the next song.
        */

        nextSong();

    }
);


/* =========================================================
   PROGRESS EVENT
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


        if (currentTime) {

            currentTime.textContent =
                formatTime(current);

        }


        if (duration && total) {

            duration.textContent =
                formatTime(total);

        }

    }
);


/* =========================================================
   UPDATE DURATION
========================================================= */

function updateDuration() {

    if (!soundcloudReady) {
        return;
    }


    soundcloudWidget.getDuration(
        function(totalDuration) {

            if (!totalDuration) {
                return;
            }


            if (duration) {

                duration.textContent =
                    formatTime(
                        totalDuration
                    );

            }

        }
    );

}


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
   STAR MESSAGES
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
   STAR CLICK SPARKLES
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


    if (!("IntersectionObserver" in window)) {

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
            Set the starting song.
        */

        currentSongIndex = 1;


        updateSongInfo();


        /*
            Background effects.
        */

        createParticles();

        createSkyStars();


        /*
            Scroll animations.
        */

        setupScrollReveal();


        /*
            Initial controls.
        */

        updatePlayButton();

    }
);
