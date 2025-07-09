// =========================
// A. VARIABEL DASAR
// =========================
const navButtons = document.querySelectorAll('[aria-label="NAVBAR TOP"] button');
const timerText = document.querySelector("h3");

const inputs = {
  focus: {
    menit: document.getElementById("menit-focus"),
    detik: document.getElementById("detik-focus"),
  },
  short: {
    menit: document.getElementById("menit-short"),
    detik: document.getElementById("detik-short"),
  },
  long: {
    menit: document.getElementById("menit-long"),
    detik: document.getElementById("detik-long"),
  },
};

const saveButton = document.querySelector("button[type='submit']");
const modeMap = ["focus", "short", "long"];
let currentMode = "focus";

// =========================
// B. DEFAULT DATA
// =========================
const defaultSettings = {
  focus: { menit: 25, detik: 0 },
  short: { menit: 5, detik: 0 },
  long: { menit: 15, detik: 0 },
};

// =========================
// C. SUARA NOTIFIKASI
// =========================
const sounds = {
  focus: new Audio("sounds/focus.mp3"),
  short: new Audio("sounds/short.mp3"),
  long: new Audio("sounds/long.mp3"),
};

Object.values(sounds).forEach(sound => {
  sound.volume = 1;
  sound.load();
});

// =========================
// D. FUNGSI PENDUKUNG
// =========================
function formatTime(m, s) {
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getTimeText(mode) {
  const saved = JSON.parse(localStorage.getItem("pomodoro-settings"));
  const data = saved?.[mode] ?? defaultSettings[mode];
  return formatTime(data.menit, data.detik);
}

function getRemainingSeconds(mode) {
  const saved = JSON.parse(localStorage.getItem("pomodoro-settings")) || defaultSettings;
  const data = saved[mode] ?? defaultSettings[mode];
  return (data.menit * 60) + data.detik;
}

function validateInputs() {
  for (const mode in inputs) {
    const { menit, detik } = inputs[mode];
    if (menit.value < 0 || detik.value < 0) {
      saveButton.disabled = true;
      saveButton.classList.add("opacity-50", "cursor-not-allowed");
      return;
    }
  }
  saveButton.disabled = false;
  saveButton.classList.remove("opacity-50", "cursor-not-allowed");
}

function saveSettingsToLocalStorage() {
  const data = {
    focus: {
      menit: parseInt(inputs.focus.menit.value) || 0,
      detik: parseInt(inputs.focus.detik.value) || 0,
    },
    short: {
      menit: parseInt(inputs.short.menit.value) || 0,
      detik: parseInt(inputs.short.detik.value) || 0,
    },
    long: {
      menit: parseInt(inputs.long.menit.value) || 0,
      detik: parseInt(inputs.long.detik.value) || 0,
    },
  };

  localStorage.setItem("pomodoro-settings", JSON.stringify(data));

  if (!isRunning) {
    timerText.textContent = getTimeText(currentMode);
  }

  alert("Timer settings saved!");
}

function loadSettingsFromLocalStorage() {
  let saved = localStorage.getItem("pomodoro-settings");

  let data;
  if (!saved) {
    data = defaultSettings;
    localStorage.setItem("pomodoro-settings", JSON.stringify(data));
  } else {
    data = JSON.parse(saved);
  }

  for (const mode in inputs) {
    const menit = data[mode].menit ?? defaultSettings[mode].menit;
    const detik = data[mode].detik ?? defaultSettings[mode].detik;

    inputs[mode].menit.value = String(menit).padStart(2, '0');
    inputs[mode].detik.value = String(detik).padStart(2, '0');
  }

  timerText.textContent = getTimeText("focus");
  validateInputs();
}

// =========================
// E. TIMER LOGIC
// =========================
const startBtn = document.querySelector(".start-timer");
const resetBtn = document.querySelector('[aria-label="RESTART"]').closest("button");

let interval = null;
let isRunning = false;
let remainingSeconds = 0;

function startCountdown() {
  if (remainingSeconds <= 0) return;

  interval = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(interval);
      isRunning = false;
      startBtn.textContent = "START TIMER";

      // Mainkan suara jika waktu habis
      if (sounds[currentMode]) {
        const sound = sounds[currentMode];
        sound.currentTime = 0;
        sound.play().catch(err => console.warn("Audio blocked:", err));
      }

      return;
    }

    remainingSeconds--;
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    timerText.textContent = formatTime(m, s);
  }, 1000);
}

// =========================
// F. EVENT LISTENERS
// =========================
window.addEventListener("DOMContentLoaded", loadSettingsFromLocalStorage);

Object.values(inputs).forEach(({ menit, detik }) => {
  menit.addEventListener("input", validateInputs);
  detik.addEventListener("input", validateInputs);
});

saveButton.addEventListener("click", function (e) {
  e.preventDefault();
  saveSettingsToLocalStorage();
});

navButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    currentMode = modeMap[index];

    navButtons.forEach(b => {
      b.classList.remove("bg-[#C803AE]", "text-white");
      b.classList.add("bg-transparent", "text-[#C803AE]");
    });

    btn.classList.remove("bg-transparent", "text-[#C803AE]");
    btn.classList.add("bg-[#C803AE]", "text-white");

    clearInterval(interval);
    isRunning = false;
    startBtn.textContent = "START TIMER";

    remainingSeconds = getRemainingSeconds(currentMode);
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    timerText.textContent = formatTime(m, s);
  });
});

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    if (remainingSeconds <= 0) {
      remainingSeconds = getRemainingSeconds(currentMode);
    }

    startCountdown();
    isRunning = true;
    startBtn.textContent = "PAUSE TIMER";
  } else {
    clearInterval(interval);
    isRunning = false;
    startBtn.textContent = "START TIMER";
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(interval);
  isRunning = false;
  startBtn.textContent = "START TIMER";
  remainingSeconds = getRemainingSeconds(currentMode);
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  timerText.textContent = formatTime(m, s);
});
