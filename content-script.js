const para = document.createElement("p");
let isRunning = false
let ogTime = 0
let startTime = 0
para.classList.add("para")
para.classList.add("study")
document.body.appendChild(para);

const audio = new Audio(
    browser.runtime.getURL("sounds/notif.mp3")
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTimer") {
        startTime = Date.now()
        ogTime = message.time
        isRunning = true
        document.body.appendChild(para);
        createPara()
        updatePara()
    }
    if (message.action === "pauseTimer") {
        isRunning = false
    }
    if (message.action == "timeUpdated") {
        isRunning = false
        ogTime = (message.time) * 60 * 1000
        startTime = Date.now()
        para.textContent = formatPara()
    }
    if (message.action === "bg") {
        para.classList.replace(para.classList[1], message.color)
    }
    if (message.action === "switchedTab") {
        isRunning = message.running;
        startTime = Date.now()
        ogTime = message.time

        document.body.appendChild(para);

        createPara();
        updatePara();
        para.classList.replace(para.classList[1], message.color)
    }
    if (message.action === "tabReloaded") {
        isRunning = message.running;
        startTime = Date.now()
        ogTime = message.time

        document.body.appendChild(para);
        createPara();
        updatePara();
        para.classList.replace(para.classList[1], message.color)
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.body.removeChild(document.getElementById("draggable-timer"));
    }
});

function createPara() {
    if (!document.getElementById("draggable-timer")) {
        para.style.visibility = "visible";
        para.id = "draggable-timer"
        para.classList.add("para");

        let isDragging = false;
        let offsetX, offsetY;

        para.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - para.offsetLeft;
            offsetY = e.clientY - para.offsetTop;
        });
        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                para.style.left = (e.clientX - offsetX) + "px";
                para.style.top = (e.clientY - offsetY) + "px";
            }
        });
        document.addEventListener("mouseup", () => {
            isDragging = false;
        });
    }
    para.textContent = formatPara()
}

function formatPara() {
    let totalSeconds = Math.floor((ogTime - Date.now() + startTime) / 1000)
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function updatePara() {
    let interval = setInterval(() => {
        if (isRunning && (ogTime - Date.now() + startTime >= 0)) {
            para.textContent = formatPara()
            if (para.textContent == "00:00") {
                para.textContent = " time's up! ";
                audio.play();
            }
        } else {
            clearInterval(interval)
        }
    }, 1000)
}



