/* =========================
   OPEN WEBSITE
========================= */

function openSite() {
    const opening = document.getElementById("opening");
    const main = document.getElementById("main");

    opening.style.transition = "opacity 0.8s ease";
    opening.style.opacity = "0";

    setTimeout(() => {
        opening.style.display = "none";
        main.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }, 800);
}


/* =========================
   STAR MESSAGES
========================= */

function showStarMessage(message) {
    const box = document.getElementById("starMessage");

    box.textContent = message;
    box.classList.remove("show");

    setTimeout(() => {
        box.classList.add("show");
    }, 50);
}


/* =========================
   SECRET MESSAGE
========================= */

function openSecret() {
    const message = document.getElementById("secretMessage");

    message.classList.toggle("show");
}


/* =========================
   OPTIONAL MUSIC
========================= */

let musicPlaying = false;

function toggleMusic() {
    musicPlaying = !musicPlaying;

    const button = document.getElementById("musicButton");

    if (musicPlaying) {
        button.textContent = "❚❚";
    } else {
        button.textContent = "♫";
    }
}
