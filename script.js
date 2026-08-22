/* =========================================================
   FOR SOPH ♡
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   OPENING
========================================================= */

const opening = document.getElementById("opening");
const openButton = document.getElementById("openButton");
const main = document.getElementById("main");

if (openButton) {
    openButton.addEventListener("click", () => {
        opening.classList.add("hidden");

        setTimeout(() => {
            main.classList.add("visible");
        }, 300);
    });
}


/* =========================================================
   MUSIC PLAYER
========================================================= */

const playerFrame = document.getElementById("soundcloud-player");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const musicDisc = document.getElementById("musicDisc");

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
    document.getElementById("floatingMusicButton");

const musicSection =
    document.getElementById("musicSection");


/* =========================================================
   SOUNDCLOUD API
========================================================= */

let soundCloudWidget = null;
let playerReady = false;
let isPlaying = false;

let currentSongIndex = 0;
let switchTimeout = null;


/* =========================================================
   SONG DATA
========================================================= */

const songs = [

    {
        title: "I Love You",
        artist: "Fontaines D.C.",

        url:
            "https://soundcloud.com/fontainesdublin/i-love-you",

        cover:
            "music/i-love-you.jpg"
    },

    {
        title: "You'll Be Mine Tonight",
        artist: "Freddie",

        url:
            "https://soundcloud.com/freddie/youll-be-mine-tonight",

        cover:
            "music/youll-be-mine-tonight.jpg"
    },

    {
        title: "Moonlight on the River",
        artist: "Mac DeMarco",

        url:
            "https://soundcloud.com/macdemarco/moonlight-on-the-river",

        cover:
            "music/moonlight-on-the-river.jpg"
    }

];


/* =========================================================
   LOAD SOUNDCLOUD API
========================================================= */

function loadSoundCloudAPI() {

    if (window.SC && SC.Widget) {
        setupSoundCloud();
        return;
    }

    const script = document.createElement("script");

    script.src =
        "https://w.soundcloud.com/player/api.js";

    script.onload = () => {
        setupSoundCloud();
    };

    document.head.appendChild(script);
}


/* =========================================================
   SETUP SOUNDCLOUD
========================================================= */

function setupSoundCloud() {

    if (!playerFrame || !window.SC) {
        return;
    }

    soundCloudWidget =
        SC.Widget(playerFrame);

    soundCloudWidget.bind(
        SC.Widget.Events.READY,
        () => {

            playerReady = true;

            updateSongUI();

            soundCloudWidget.bind(
                SC.Widget.Events.PLAY,
                () => {

                    isPlaying = true;

                    updatePlayButton();
                    startDisc();
                }
            );

            soundCloudWidget.bind(
                SC.Widget.Events.PAUSE,
                () => {

                    isPlaying = false;

                    updatePlayButton();
                    stopDisc();
                }
            );

            soundCloudWidget.bind(
                SC.Widget.Events.FINISH,
                () => {

                    isPlaying = false;

                    updatePlayButton();
                    stopDisc();

                    nextSong(true);
                }
            );

            soundCloudWidget.bind(
                SC.Widget.Events.PLAY_PROGRESS,
                (data) => {

                    updateProgress(data);
                }
            );

        }
    );
}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index, autoplay = false) {

    if (!soundCloudWidget) {
        return;
    }

    if (switchTimeout) {
        clearTimeout(switchTimeout);
        switchTimeout = null;
    }

    currentSongIndex =
        (index + songs.length) % songs.length;

    const song =
        songs[currentSongIndex];

    isPlaying = false;

    stopDisc();

    updateSongUI();

    /*
        SoundCloud loads the new track inside the
        existing iframe instead of creating a new iframe.
        This makes switching much smoother.
    */

    soundCloudWidget.load(
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
        Wait for SoundCloud to finish loading,
        then immediately play it.

        This prevents the annoying:
        click → nothing → click again
        problem.
    */

    if (autoplay) {

        switchTimeout = setTimeout(() => {

            if (!soundCloudWidget) {
                return;
            }

            soundCloudWidget.play();

        }, 450);
    }
}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!soundCloudWidget) {
        return;
    }

    if (!playerReady) {
        return;
    }

    if (isPlaying) {

        soundCloudWidget.pause();

    } else {

        soundCloudWidget.play();

    }
}


/* =========================================================
   NEXT SONG
========================================================= */

function nextSong(fromFinish = false) {

    const nextIndex =
        (currentSongIndex + 1) % songs.length;

    loadSong(nextIndex, true);
}


/* =========================================================
   PREVIOUS SONG
========================================================= */

function previousSong() {

    const previousIndex =
        (currentSongIndex - 1 + songs.length)
        % songs.length;

    loadSong(previousIndex, true);
}


/* =========================================================
   SONG BUTTONS
========================================================= */

const songButtons =
    document.querySelectorAll(".music-song");

songButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const index =
            Number(button.dataset.song);

        /*
            If clicking the song we're already on,
            just play it immediately.
        */

        if (index === currentSongIndex) {

            if (!isPlaying) {
                soundCloudWidget.play();
            }

            return;
        }

        /*
            Otherwise switch directly to it.
        */

        loadSong(index, true);

    });

});


/* =========================================================
   PLAY BUTTON
========================================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        togglePlay
    );

}


/* =========================================================
   PREVIOUS BUTTON
========================================================= */

if (previousButton) {

    previousButton.addEventListener(
        "click",
        previousSong
    );

}


/* =========================================================
   NEXT BUTTON
========================================================= */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => nextSong(false)
    );

}


/* =========================================================
   UPDATE SONG UI
========================================================= */

function updateSongUI() {

    const song =
        songs[currentSongIndex];

    if (currentSongTitle) {
        currentSongTitle.textContent =
            song.title;
    }

    if (currentSongArtist) {
        currentSongArtist.textContent =
            song.artist;
    }

    /*
        Update active song button.
    */

    songButtons.forEach((button, index) => {

        button.classList.toggle(
            "active",
            index === currentSongIndex
        );

    });

    /*
        Update cover image if the HTML has
        an element for it.
    */

    const cover =
        document.getElementById("currentSongCover");

    if (cover) {

        cover.src = song.cover;

        cover.alt =
            `${song.title} by ${song.artist}`;
    }

    /*
        Reset progress.
    */

    if (progressBar) {
        progressBar.style.width = "0%";
    }

    if (currentTime) {
        currentTime.textContent = "0:00";
    }

    if (duration) {
        duration.textContent = "0:00";
    }
}


/* =========================================================
   PLAY BUTTON UI
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
   VINYL ANIMATION
========================================================= */

function startDisc() {

    if (musicDisc) {
        musicDisc.classList.add("playing");
    }
}


function stopDisc() {

    if (musicDisc) {
        musicDisc.classList.remove("playing");
    }
}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress(data) {

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

    if (duration) {

        duration.textContent =
            formatTime(total);
    }

    if (progressBar && total > 0) {

        const percentage =
            (current / total) * 100;

        progressBar.style.width =
            `${percentage}%`;
    }
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(milliseconds) {

    const seconds =
        Math.floor(milliseconds / 1000);

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
   PROGRESS BAR CLICK
========================================================= */

if (progressTrack) {

    progressTrack.addEventListener(
        "click",
        (event) => {

            if (!soundCloudWidget) {
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

            soundCloudWidget.getDuration(
                (total) => {

                    if (!total) {
                        return;
                    }

                    soundCloudWidget.seekTo(
                        total * percentage
                    );

                }
            );

        }
    );

}


/* =========================================================
   FLOATING MUSIC BUTTON
========================================================= */

if (floatingMusicButton) {

    floatingMusicButton.addEventListener(
        "click",
        () => {

            if (musicSection) {

                musicSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }
    );

}


/* =========================================================
   AUTO PLAY WHEN ENTERING MUSIC AREA
========================================================= */

let musicAreaPlayed = false;

if (musicSection) {

    const musicObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (
                        entry.isIntersecting &&
                        !musicAreaPlayed
                    ) {

                        musicAreaPlayed = true;

                        /*
                            Start the first song automatically
                            once the visitor reaches the music
                            section.

                            Browsers may block completely
                            automatic audio, so this works
                            when the user has already interacted
                            with the page.
                        */

                        if (
                            soundCloudWidget &&
                            playerReady
                        ) {

                            soundCloudWidget.play();

                        }

                    }

                });

            },
            {
                threshold: 0.35
            }
        );

    musicObserver.observe(musicSection);
}


/* =========================================================
   HIDDEN STARS
========================================================= */

const stars =
    document.querySelectorAll(".star");

const starMessage =
    document.getElementById("starMessage");

stars.forEach((star) => {

    star.addEventListener("click", () => {

        const message =
            star.dataset.message;

        if (!starMessage) {
            return;
        }

        starMessage.textContent =
            message;

        starMessage.classList.add("show");

        stars.forEach((otherStar) => {

            otherStar.classList.remove(
                "found"
            );

        });

        star.classList.add("found");

    });

});


/* =========================================================
   SECRET MESSAGE
========================================================= */

const secretButton =
    document.getElementById("secretButton");

const secretMessage =
    document.getElementById("secretMessage");

if (secretButton && secretMessage) {

    secretButton.addEventListener(
        "click",
        () => {

            secretMessage.classList.toggle(
                "show"
            );

            if (
                secretMessage.classList.contains(
                    "show"
                )
            ) {

                secretButton.textContent =
                    "♡";

            } else {

                secretButton.textContent =
                    "there's something here";

            }

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

updateSongUI();
updatePlayButton();
loadSoundCloudAPI();
