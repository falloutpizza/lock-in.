let timerState = {
    isRunning: false,
    startTime: 0,
    remainingTime: 25 * 60 * 1000,
    set: "study"
};

browser.runtime.onInstalled.addListener(async () => {
    await browser.storage.local.set({ timerState });
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
    const data = await browser.storage.local.get("timerState");
    let state = data.timerState;
    let elapsed = Date.now() - state.startTime;
    if (state.startTime !== 0) {
        browser.tabs.sendMessage(activeInfo.tabId, {
            action: "switchedTab", time: (state.remainingTime - elapsed), running: state.isRunning
        });
    }
});

browser.runtime.onMessage.addListener(async (msg) => {
    const data = await browser.storage.local.get("timerState");
    let state = data.timerState;

    if (msg.type === "getState") {
        return state;
    }
    if (msg.type === "startTimer") {
        if (!state.isRunning && state.remainingTime > 0) {
            state.isRunning = true;
            state.startTime = Date.now();
            await browser.storage.local.set({ timerState: state });
        }
    }
    if (msg.type === "pauseTimer") {
        if (state.isRunning) {
            let elapsed = Date.now() - state.startTime;
            state.remainingTime -= elapsed;

            state.isRunning = false;
            state.startTime = 0;

            await browser.storage.local.set({ timerState: state });
        }
    }
    if (msg.type === "timeUpdated") {
        let newState = {
            isRunning: false,
            startTime: 0,
            remainingTime: msg.time * 60 * 1000,
            set: msg.set
        }
        await browser.storage.local.set({ timerState: newState })
    }
});