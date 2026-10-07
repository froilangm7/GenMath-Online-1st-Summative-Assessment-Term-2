const $ = (id) => document.getElementById(id);

const startScreen = $("startScreen");
const examScreen = $("examScreen");
const lockedScreen = $("lockedScreen");
const studentName = $("studentName");
const section = $("section");
const agreement = $("agreement");
const startBtn = $("startBtn");
const formsFrame = $("formsFrame");
const timerEl = $("timer");

let started = false;
let frozen = false;
let secondsLeft = EXAM_MINUTES * 60;
let timerHandle = null;
let incidentSent = false;

agreement.addEventListener("change", () => {
  startBtn.disabled = !agreement.checked || !studentName.value.trim() || !section.value.trim();
});
[studentName, section].forEach(el => el.addEventListener("input", () => {
  startBtn.disabled = !agreement.checked || !studentName.value.trim() || !section.value.trim();
}));

async function requestFullscreen() {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (_) {
    // Fullscreen can be denied by browser/OS. The portal continues, but visibility rules remain active.
  }
}

function sendIncident(type) {
  const payload = {
    student: studentName.value.trim(),
    section: section.value.trim(),
    type,
    timestamp: new Date().toISOString(),
    page: location.href,
    userAgent: navigator.userAgent
  };

  localStorage.setItem("last_exam_incident", JSON.stringify(payload));

  if (INCIDENT_ENDPOINT) {
    try {
      navigator.sendBeacon(
        INCIDENT_ENDPOINT,
        new Blob([JSON.stringify(payload)], {type: "application/json"})
      );
      incidentSent = true;
    } catch (_) {}
  }

  return payload;
}

function freezeExam(type, message) {
  if (!started || frozen) return;
  frozen = true;
  clearInterval(timerHandle);

  const p = sendIncident(type);
  $("incidentType").textContent = type;
  $("incidentTime").textContent = new Date(p.timestamp).toLocaleString();
  $("lockReason").textContent = message;

  examScreen.classList.add("hidden");
  lockedScreen.classList.remove("hidden");

  try { document.exitFullscreen?.(); } catch (_) {}
}

function updateTimer() {
  const m = Math.floor(secondsLeft / 60).toString().padStart(2,"0");
  const s = (secondsLeft % 60).toString().padStart(2,"0");
  timerEl.textContent = `${m}:${s}`;

  if (secondsLeft <= 0) {
    clearInterval(timerHandle);
    // Microsoft Forms is responsible for final submission when its own timer ends.
    $("status").textContent = "TIME LIMIT REACHED";
    return;
  }
  secondsLeft--;
}

startBtn.addEventListener("click", async () => {
  if (FORM_URL.includes("PASTE_YOUR_")) {
    alert("Teacher setup incomplete: replace FORM_URL in config.js with your Microsoft Forms quiz URL.");
    return;
  }

  started = true;
  startScreen.classList.add("hidden");
  examScreen.classList.remove("hidden");

  $("studentBadge").textContent = `${studentName.value.trim()} • ${section.value.trim()}`;
  formsFrame.src = FORM_URL;

  await requestFullscreen();
  updateTimer();
  timerHandle = setInterval(updateTimer, 1000);
});

/*
  IMPORTANT:
  These browser events are useful as a deterrent and incident flag.
  They are NOT a secure OS-level lockdown. A determined student can sometimes
  bypass browser-level controls, and Android behavior varies by browser/device.
*/
document.addEventListener("visibilitychange", () => {
  if (started && document.hidden) {
    freezeExam(
      "PAGE/APP VISIBILITY LOST",
      "The examination page was no longer visible. Your session has been frozen for teacher verification."
    );
  }
});

window.addEventListener("blur", () => {
  if (started) {
    freezeExam(
      "WINDOW/FOCUS LOST",
      "The examination window lost focus. Your session has been frozen for teacher verification."
    );
  }
});

window.addEventListener("pagehide", () => {
  if (started && !frozen) {
    sendIncident("PAGEHIDE / NAVIGATION EVENT");
  }
});

document.addEventListener("fullscreenchange", () => {
  if (started && !document.fullscreenElement && !frozen) {
    freezeExam(
      "FULLSCREEN EXITED",
      "Fullscreen mode was exited. Your session has been frozen for teacher verification."
    );
  }
});

$("paperBtn").addEventListener("click", () => {
  alert("Please remain in your seat and wait for your teacher/proctor to provide the supervised paper version.");
});

/*
  Keyboard deterrence. This is NOT a security boundary.
*/
document.addEventListener("keydown", (e) => {
  if (!started) return;
  if (e.key === "F12" ||
      (e.ctrlKey && ["l","t","n","w","r","u","s","p"].includes(e.key.toLowerCase())) ||
      (e.metaKey && ["l","t","n","w","r","u","s","p"].includes(e.key.toLowerCase()))) {
    e.preventDefault();
    freezeExam("RESTRICTED KEYBOARD COMMAND", "A restricted browser command was detected.");
  }
});
