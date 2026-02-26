let timerTime = 25;
let timeSet = [25, 5, 10]
let body = document.querySelector("body")
let timerText = document.querySelector(".timer-text")
let sliderBg = document.querySelector(".slider-bg")
let studyButton = document.querySelector(".study")
let shortButton = document.querySelector(".short-break")
let longButton = document.querySelector(".long-break")
let settings = document.querySelector(".settings")
let settingsForm = document.querySelector(".settings-form")
let startButton = document.querySelector(".start-button")
let localState = null;
let interval = null;


//slider
studyButton.addEventListener("click",
    async function () {
        timerTime = timeSet[0];
        sliderBg.classList.replace(sliderBg.classList[1], "slider-bg-study")
        body.classList.replace(body.classList[0], "study-mode-colors")
        await browser.runtime.sendMessage({ type: "timeUpdated", time: timerTime, set: "study" })
        const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true
        });
        await browser.tabs.sendMessage(tab.id, { action: "bg", color: "study" });
        await browser.tabs.sendMessage(tab.id, { action: "timeUpdated", time: timerTime });

        await (loadState())
    })

shortButton.addEventListener("click",
    async function () {
        timerTime = timeSet[1];
        sliderBg.classList.replace(sliderBg.classList[1], "slider-bg-sbreak")
        body.classList.replace(body.classList[0], "sbreak-mode-colors")
        await browser.runtime.sendMessage({ type: "timeUpdated", time: timerTime, set: "sbreak" })
        const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true
        });
        await browser.tabs.sendMessage(tab.id, { action: "bg", color: "sbreak" });
        await browser.tabs.sendMessage(tab.id, { action: "timeUpdated", time: timerTime });

        await (loadState())

    })

longButton.addEventListener("click",
    async function () {
        timerTime = timeSet[2];
        sliderBg.classList.replace(sliderBg.classList[1], "slider-bg-lbreak")
        body.classList.replace(body.classList[0], "lbreak-mode-colors")
        await browser.runtime.sendMessage({ type: "timeUpdated", time: timerTime, set: "lbreak" })
        const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true
        });
        browser.tabs.sendMessage(tab.id, { action: "bg", color: "lbreak" });
        browser.tabs.sendMessage(tab.id, { action: "timeUpdated", time: timerTime });


        await (loadState())
    })


//settings
settings.addEventListener("click",
    async function () {
        document.querySelector(".settings-popup").classList.toggle("show");
        document.querySelector(".settings-popup").classList.toggle("hide");
        if (!localState) return;
        if (localState.isRunning) {
            await browser.runtime.sendMessage({ type: "pauseTimer" });
            const [tab] = await browser.tabs.query({
                active: true,
                currentWindow: true
            });
            browser.tabs.sendMessage(tab.id, { action: "pauseTimer" });
        }
        await loadState();
    }
)

settingsForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (document.getElementById("study").value != "") {
        timeSet[0] = document.getElementById("study").value;
    }
    if (document.getElementById("sbreak").value != "") {
        timeSet[1] = document.getElementById("sbreak").value;

    }
    if (document.getElementById("lbreak").value != "") {
        timeSet[2] = document.getElementById("lbreak").value;

    }

    document.querySelector(".settings-popup").classList.toggle("show");
    document.querySelector(".settings-popup").classList.toggle("hide");
    if (sliderBg.classList.contains("slider-bg-study")) {
        timerTime = timeSet[0]
    } else if (sliderBg.classList.contains("slider-bg-sbreak")) {
        timerTime = timeSet[1]
    } else if (sliderBg.classList.contains("slider-bg-lbreak")) {
        timerTime = timeSet[2]
    }
    timerText.textContent = `${timerTime}:00`;
    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    await browser.tabs.sendMessage(tab.id, { action: "timeUpdated", time: timerTime });
    await browser.runtime.sendMessage({ type: "timeUpdated", time: timerTime, newTimes: timeSet })
    await loadState()
})

//timer function

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000)
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0")
    );
}

function updateDisplay() {
    if (!localState) return;
    let remaining = localState.remainingTime;
    if (localState.isRunning) {
        let elapsed = Date.now() - localState.startTime;
        remaining -= elapsed;
    }
    if (remaining <= 0) {
        remaining = 0;
        browser.runtime.sendMessage({ type: "pauseTimer" })
    };
    timerText.textContent = formatTime(remaining);

    strokeCur = (283 - (remaining / (timerTime * 60 * 1000)) * 283)
    document.querySelector(".timer-progress").style.strokeDashoffset = strokeCur;
}

async function loadState() {
    localState = await browser.runtime.sendMessage({ type: "getState" });
    startButton.textContent = localState.isRunning ? "pause" : "start";
    timerTime = localState.ogTime;
    if (localState.set == "study") {
        sliderBg.classList.replace(sliderBg.classList[1], "slider-bg-study")
        body.classList.replace(body.classList[0], "study-mode-colors")
    } else if (localState.set == "sbreak") {
        sliderBg.classList.replace(sliderBg.classList[1], "slider-bg-sbreak")
        body.classList.replace(body.classList[0], "sbreak-mode-colors")
    } else if (localState.set == "lbreak") {
        sliderBg.classList.replace(sliderBg.classList[1], "slider-bg-lbreak")
        body.classList.replace(body.classList[0], "lbreak-mode-colors")
    }
    updateDisplay();

    if (interval) clearInterval(interval);
    interval = setInterval(updateDisplay, 1000);
}

startButton.addEventListener("click", async () => {
    if (!localState) return;
    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    if (localState.isRunning) {
        await browser.runtime.sendMessage({ type: "pauseTimer" });
        await browser.tabs.sendMessage(tab.id, { action: "pauseTimer" });
    } else {
        await browser.runtime.sendMessage({ type: "startTimer" });
        await browser.tabs.sendMessage(tab.id, { action: "startTimer", time: localState.remainingTime });
    }
    await loadState();
});

document.addEventListener("DOMContentLoaded", loadState);