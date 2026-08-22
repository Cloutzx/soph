/* =========================================================
   SOPH'S LITTLE WEBSITE
   script.js
========================================================= */


/* =========================================================
   OPENING SCREEN
========================================================= */

function openSite() {

    const opening = document.getElementById("opening");
    const main = document.getElementById("main");
    const musicButton = document.getElementById("musicFloatingButton");

    opening.classList.add("opening-closing");

    setTimeout(() => {

        opening.style.display = "none";

        main.style.display = "block";

        musicButton.classList.add("visible");

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    }, 800);
}



/* =========================================================
   MUSIC PLAYER
========================================================= */

/*
    PUT YOUR MUSIC FILES IN:

    /music/song1.mp3
    /music/song2.mp3
    /music/song3.mp3

    IMPORTANT:
    Only upload music that you have permission to distribute.
*/


const songs = [

    {
        title: "Song One",
        artist: "for soph ♡",
        file: "music/song1.mp3",
        icon: "♫"
    },

    {
        title: "Our Song",
        artist: "for soph ♡",
        file: "music/song2.mp3",
        icon: "♡"
    },

    {
        title: "Song Three",
        artist: "for soph ♡",
        file: "music/song3.mp3",
        icon: "✦"
    }

];


let currentSongIndex = 1;

let musicPlaying = false;

const audio = document.getElementById("backgroundMusic");

const playButton = document.getElementById("playButton");

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

function formatTime(seconds) {

    if (!seconds || isNaN(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);

    return (
        minutes +
        ":" +
        remainingSeconds.toString().padStart(2, "0")
    );

}



/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index) {

    if (!songs[index]) {
        return;
    }

    currentSongIndex = index;

    const song = songs[currentSongIndex];

    audio.src = song.file;

    currentSongTitle.textContent = song.title;

    currentSongArtist.textContent = song.artist;

    progressBar.style.width = "0%";

    currentTime.textContent = "0:00";

    duration.textContent = "0:00";


    updateMusicWheel();


    audio.load();

}



/* =========================================================
   UPDATE MUSIC WHEEL
========================================================= */

function updateMusicWheel() {

    const songButtons =
        document.querySelectorAll(".music-song");


    songButtons.forEach((button, index) => {

        button.classList.remove("active");

        const title =
            button.querySelector("span");

        const icon =
            button.querySelector(".song-art");


        if (songs[index]) {

            title.textContent =
                songs[index].title;

            icon.textContent =
                songs[index].icon;

        }

    });


    const activeButton =
        document.querySelector(
            `.music-song:nth-child(${currentSongIndex + 1})`
        );


    if (activeButton) {

        activeButton.classList.add("active");

    }


    /*
        Rotate the wheel visually.

        This makes the selected song feel like
        the main song in the middle.
    */

    const wheel =
        document.querySelector(".music-wheel");


    if (!wheel) {
        return;
    }


    wheel.classList.remove(
        "wheel-left",
        "wheel-center",
        "wheel-right"
    );


    if (currentSongIndex === 0) {

        wheel.classList.add("wheel-left");

    }

    else if (currentSongIndex === 2) {

        wheel.classList.add("wheel-right");

    }

    else {

        wheel.classList.add("wheel-center");

    }

}



/* =========================================================
   PLAY MUSIC
========================================================= */

function playMusic() {

    const playPromise =
        audio.play();


    if (playPromise !== undefined) {

        playPromise
            .then(() => {

                musicPlaying = true;

                updatePlayButton();

            })
            .catch((error) => {

                console.log(
                    "Music could not start:",
                    error
                );

            });

    }

}



/* =========================================================
   PAUSE MUSIC
========================================================= */

function pauseMusic() {

    audio.pause();

    musicPlaying = false;

    updatePlayButton();

}



/* =========================================================
   TOGGLE MUSIC
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
   PLAY / PAUSE ICON
========================================================= */

function updatePlayButton() {

    if (playButton) {

        if (musicPlaying) {

            playButton.textContent = "❚❚";

        }

        else {

            playButton.textContent = "▶";

        }

    }


    if (floatingMusicButton) {

        if (musicPlaying) {

            floatingMusicButton.textContent = "❚❚";

        }

        else {

            floatingMusicButton.textContent = "♫";

        }

    }

}



/* =========================================================
   SELECT SONG
========================================================= */

function selectSong(index) {

    if (!songs[index]) {
        return;
    }


    loadSong(index);


    /*
        Clicking a song automatically starts it.
    */

    playMusic();

}



/* =========================================================
   NEXT SONG
========================================================= */

function nextSong() {

    let nextIndex =
        currentSongIndex + 1;


    if (nextIndex >= songs.length) {

        nextIndex = 0;

    }


    loadSong(nextIndex);

    playMusic();

}



/* =========================================================
   PREVIOUS SONG
========================================================= */

function previousSong() {

    /*
        If the song has played for more than
        3 seconds, pressing previous starts
        the current song over.

        Otherwise it goes to the previous song.
    */

    if (audio.currentTime > 3) {

        audio.currentTime = 0;

        return;

    }


    let previousIndex =
        currentSongIndex - 1;


    if (previousIndex < 0) {

        previousIndex =
            songs.length - 1;

    }


    loadSong(previousIndex);

    playMusic();

}



/* =========================================================
   SONG ENDS
========================================================= */

audio.addEventListener(
    "ended",
    () => {

        nextSong();

    }
);



/* =========================================================
   MUSIC PROGRESS
========================================================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }


        const percentage =
            (audio.currentTime / audio.duration) * 100;


        progressBar.style.width =
            percentage + "%";


        currentTime.textContent =
            formatTime(audio.currentTime);

    }
);



/* =========================================================
   MUSIC DURATION
========================================================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(audio.duration);

    }
);



/* =========================================================
   SEEK MUSIC
========================================================= */

function seekMusic(event) {

    if (!audio.duration) {
        return;
    }


    const track =
        event.currentTarget;


    const rect =
        track.getBoundingClientRect();


    const clickPosition =
        event.clientX - rect.left;


    const percentage =
        clickPosition / rect.width;


    audio.currentTime =
        percentage * audio.duration;

}



/* =========================================================
   STAR MESSAGES
========================================================= */

function showStarMessage(message) {

    const box =
        document.getElementById("starMessage");


    if (!box) {
        return;
    }


    box.classList.remove("show");


    setTimeout(() => {

        box.textContent = message;

        box.classList.add("show");

    }, 100);

}



/* =========================================================
   SECRET MESSAGE
========================================================= */

function openSecret() {

    const message =
        document.getElementById("secretMessage");


    if (!message) {
        return;
    }


    message.classList.toggle("show");


    /*
        Change button text when opened.
    */

    const button =
        document.querySelector(".secret-button");


    if (!button) {
        return;
    }


    if (message.classList.contains("show")) {

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
        document.querySelector(".background");


    if (!background) {
        return;
    }


    const symbols = [
        "♡",
        "✦",
        "✧",
        "·"
    ];


    for (let i = 0; i < 35; i++) {

        const particle =
            document.createElement("span");


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
            Math.random() * 100 + "%";


        particle.style.animationDuration =
            10 + Math.random() * 15 + "s";


        particle.style.animationDelay =
            Math.random() * 10 + "s";


        particle.style.fontSize =
            8 + Math.random() * 12 + "px";


        background.appendChild(
            particle
        );

    }

}



/* =========================================================
   STAR SPARKLE EFFECT
========================================================= */

function createSkyStars() {

    const sky =
        document.querySelector(".sky-container");


    if (!sky) {
        return;
    }


    for (let i = 0; i < 35; i++) {

        const star =
            document.createElement("span");


        star.classList.add(
            "background-star"
        );


        star.style.left =
            Math.random() * 100 + "%";


        star.style.top =
            Math.random() * 100 + "%";


        star.style.animationDelay =
            Math.random() * 3 + "s";


        star.style.animationDuration =
            1.5 + Math.random() * 2 + "s";


        sky.appendChild(star);

    }

}



/* =========================================================
   STAR CLICK EFFECT
========================================================= */

document.addEventListener(
    "click",
    (event) => {

        const star =
            event.target.closest(".star");


        if (!star) {
            return;
        }


        createClickSparkles(
            event.clientX,
            event.clientY
        );

    }
);



function createClickSparkles(x, y) {

    const symbols = [
        "♡",
        "✦",
        "✧"
    ];


    for (let i = 0; i < 7; i++) {

        const sparkle =
            document.createElement("span");


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
            (Math.random() * 100 - 50) + "px"
        );


        sparkle.style.setProperty(
            "--y",
            (Math.random() * 100 - 50) + "px"
        );


        document.body.appendChild(
            sparkle
        );


        setTimeout(() => {

            sparkle.remove();

        }, 900);

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


    const observer =
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
        (element) => {

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
    () => {

        /*
            Start with the middle song selected.
        */

        loadSong(currentSongIndex);


        /*
            Create extra background details.
        */

        createParticles();

        createSkyStars();


        /*
            Setup scroll animations.
        */

        setupScrollReveal();


        /*
            Make sure controls start correctly.
        */

        updatePlayButton();

    }
);
