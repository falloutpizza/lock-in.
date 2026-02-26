const para = document.createElement("p");
let isRunning = false
let remainingTime = 0
document.body.appendChild(para);
para.classList.add("para")
para.classList.add("study")


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTimer") {
        remainingTime = message.time
        isRunning = true
        createPara()
        updatePara()
    }
    if (message.action === "pauseTimer") {
        isRunning = false
    }
    if (message.action == "timeUpdated") {
        isRunning = false
        remainingTime = message.time * 60 * 1000
        para.textContent = formatPara()
    }
    if (message.action === "bg") {
        para.classList.replace(para.classList[1], message.color)
    }
    if (message.action === "switchedTab") {
        remainingTime = message.time;
        isRunning = message.running;
        console.log(isRunning)
        createPara();
        updatePara();
    }
});

function formatPara() {
    let totalSeconds = Math.floor(remainingTime / 1000)
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

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
    remainingTime -= 1000
}

function updatePara(time) {
    para.textContent = formatPara()
    remainingTime -= 1000
    let interval = setInterval(() => {
        if (isRunning) {
            para.textContent = formatPara()
            remainingTime -= 1000
        } else {
            clearInterval(interval)
        }
    }, 1000)
}



