const storedTheme = localStorage.getItem("pd-theme");
    if (storedTheme) document.documentElement.dataset.theme = storedTheme;

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const keys = {
  tasks: "pd-tasks",
  goals: "pd-goals",
  planner: "pd-planner",
  theme: "pd-theme"
};

let tasks = storage.get(keys.tasks, []);
let goals = storage.get(keys.goals, []);
let planner = storage.get(keys.planner, {});
let timerSeconds = 25 * 60;
let timerInterval = null;

const featureNames = {
  todo: "Todo List",
  planner: "Daily Planner",
  goals: "Daily Goals",
  pomodoro: "Pomodoro Timer",
  quotes: "Motivation Quote"
};

const fallbackQuotes = [
  "The secret of getting ahead is getting started.",
  "What you do today can improve all your tomorrows.",
  "Focus on being productive instead of busy.",
  "Start where you are. Use what you have. Do what you can.",
  "Small steps every day become big changes over time.",
  "Progress is progress, even when it is quiet.",
  "Do one thing well, then do the next.",
  "Your future is built by what you repeat.",
  "Stay patient and keep showing up.",
  "A focused hour can change the whole day.",
  "Done is better than perfect when perfect keeps you stuck.",
  "Make it simple. Make it steady. Make it real.",
  "Energy follows action.",
  "The next best move is enough.",
  "Protect your focus like it matters.",
  "You do not need more time. You need a clear next step.",
  "Keep going. Momentum is made, not found.",
  "Win the next ten minutes.",
  "Consistency turns ordinary effort into results.",
  "Start before you feel ready."
];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupTheme();
  setupClock();
  setupBackground();
  setupTodo();
  setupPlanner();
  setupGoals();
  setupPomodoro();
  setupQuotes();
  setupWeather();
  updateDashboardStats();
});

function $(selector) {
  return document.querySelector(selector);
}

function setupNavigation() {
  document.querySelectorAll("[data-feature]").forEach((card) => {
    card.addEventListener("click", () => openFeature(card.dataset.feature));
  });

  $("#backToDashboard").addEventListener("click", () => {
    $("#featureView").hidden = true;
    $("#dashboardView").hidden = false;
    const fg = document.querySelector('.feature-grid');
    if (fg) fg.style.display = '';
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.display = '';
    const headerBack = document.getElementById('headerBackBtn');
    if (headerBack) headerBack.style.display = 'none';
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = true;
    });
    updateDashboardStats();
  });
}

function openFeature(name) {
  $("#dashboardView").hidden = true;
  $("#featureView").hidden = false;
  const fg = document.querySelector('.feature-grid');
  if (fg) fg.style.display = 'none';
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = 'none';
  const headerBack = document.getElementById('headerBackBtn');
  if (headerBack) headerBack.style.display = '';
  $("#activeFeatureName").textContent = featureNames[name] || "Tool";

document.addEventListener('DOMContentLoaded', () => {
  const hb = document.getElementById('headerBackBtn');
  if (hb) hb.addEventListener('click', () => {
    document.getElementById('backToDashboard').click();
  });
});
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
}

function setupTheme() {
  const switcher = $("#themeSwitch");
  const label = $("#themeLabel");
  const current = document.documentElement.dataset.theme || "light";
  switcher.checked = current === "dark";
  label.textContent = current === "dark" ? "Dark" : "Light";

  switcher.addEventListener("change", () => {
    const theme = switcher.checked ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(keys.theme, theme);
    label.textContent = theme === "dark" ? "Dark" : "Light";
  });
}

function setupClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  $("#dateText").textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  $("#timeText").textContent = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function setupBackground() {
  applyTimeBackground();
  setInterval(applyTimeBackground, 5 * 60 * 1000);
}

function applyTimeBackground() {
  const hour = new Date().getHours();
  const video = document.getElementById("backgroundVideo");
  let greeting = "Good morning. Set the pace.";
  let period = "day";
  let videoSrc = "assets/day.mp4";

  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon. Keep the line moving.";
    videoSrc = "assets/day.mp4";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening. Close the loop.";
    period = "night";
    videoSrc = "assets/night.mp4";
  } else if (hour >= 21 || hour < 5) {
    greeting = "Quiet hours. Choose one calm win.";
    period = "night";
    videoSrc = "assets/night.mp4";
  }

  if (video && video.getAttribute("src") !== videoSrc) {
    video.innerHTML = `<source src="${videoSrc}" type="video/mp4">`;
    video.load();
    video.play().catch(() => {});
  }

  document.body.classList.toggle("time-night", period === "night");
  document.body.classList.toggle("time-day", period === "day");
  $("#backgroundGreeting").textContent = greeting;
}

function setupTodo() {
  $("#todoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#todoInput");
    const text = input.value.trim();
    if (!text) return;

    tasks.unshift({
      id: crypto.randomUUID(),
      text,
      completed: false,
      important: false,
      createdAt: Date.now()
    });
    input.value = "";
    saveTasks();
  });

  $("#todoList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.closest("[data-id]").dataset.id;
    const task = tasks.find((item) => item.id === id);
    if (!task && button.dataset.action !== "delete") return;

    if (button.dataset.action === "complete") task.completed = !task.completed;
    if (button.dataset.action === "important") task.important = !task.important;
    if (button.dataset.action === "delete") tasks = tasks.filter((item) => item.id !== id);
    saveTasks();
  });

  renderTasks();
}

function saveTasks() {
  storage.set(keys.tasks, tasks);
  renderTasks();
  updateDashboardStats();
}

function renderTasks() {
  const list = $("#todoList");
  const openCount = tasks.filter((task) => !task.completed).length;
  $("#todoCount").textContent = `${openCount} open`;

  if (!tasks.length) {
    list.innerHTML = '<li class="empty-state">No tasks yet.</li>';
    return;
  }

  list.innerHTML = tasks.map((task) => `
    <li class="item-row ${task.completed ? "is-complete" : ""} ${task.important ? "is-important" : ""}" data-id="${task.id}">
      <button class="icon-btn" data-action="complete" type="button" aria-label="Toggle complete">${task.completed ? "Done" : "Todo"}</button>
      <span class="item-text">${escapeHtml(task.text)}</span>
      <button class="icon-btn" data-action="important" type="button" aria-label="Toggle important">${task.important ? "High" : "Mark"}</button>
      <button class="icon-btn delete-btn" data-action="delete" type="button" aria-label="Delete">X</button>
    </li>
  `).join("");
}

function setupPlanner() {
  const plannerSlots = $("#plannerSlots");
  const hours = Array.from({ length: 15 }, (_, index) => index + 6);
  plannerSlots.innerHTML = hours.map((hour) => {
    const label = formatHour(hour);
    return `
      <label class="planner-slot" data-hour="${hour}">
        <span class="slot-time">${label}</span>
        <textarea data-planner-hour="${hour}" placeholder="Plan this hour">${escapeHtml(planner[hour] || "")}</textarea>
      </label>
    `;
  }).join("");

  plannerSlots.addEventListener("input", (event) => {
    const field = event.target.closest("[data-planner-hour]");
    if (!field) return;
    const hour = field.dataset.plannerHour;
    planner[hour] = field.value.trim();
    if (!planner[hour]) delete planner[hour];
    storage.set(keys.planner, planner);
    updateDashboardStats();
  });

  $("#clearPlanner").addEventListener("click", () => {
    planner = {};
    storage.set(keys.planner, planner);
    document.querySelectorAll("[data-planner-hour]").forEach((field) => {
      field.value = "";
    });
    updateDashboardStats();
  });

  highlightCurrentSlot();
  setInterval(highlightCurrentSlot, 60 * 1000);
}

function highlightCurrentSlot() {
  const currentHour = new Date().getHours();
  document.querySelectorAll(".planner-slot").forEach((slot) => {
    slot.classList.toggle("is-now", Number(slot.dataset.hour) === currentHour);
  });
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:00 ${suffix}`;
}

function setupGoals() {
  $("#goalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#goalInput");
    const text = input.value.trim();
    if (!text) return;

    goals.push({
      id: crypto.randomUUID(),
      text,
      completed: false
    });
    input.value = "";
    saveGoals();
  });

  $("#goalList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.closest("[data-id]").dataset.id;
    const goal = goals.find((item) => item.id === id);

    if (button.dataset.action === "complete" && goal) goal.completed = !goal.completed;
    if (button.dataset.action === "delete") goals = goals.filter((item) => item.id !== id);
    saveGoals();
  });

  renderGoals();
}

function saveGoals() {
  storage.set(keys.goals, goals);
  renderGoals();
  updateDashboardStats();
}

function renderGoals() {
  const list = $("#goalList");
  const completed = goals.filter((goal) => goal.completed).length;
  const percent = goals.length ? Math.round((completed / goals.length) * 100) : 0;
  $("#goalsProgressText").textContent = `${completed} of ${goals.length}`;
  $("#goalsProgressBar").style.width = `${percent}%`;

  if (!goals.length) {
    list.innerHTML = '<li class="empty-state">No goals yet.</li>';
    return;
  }

  list.innerHTML = goals.map((goal) => `
    <li class="item-row ${goal.completed ? "is-complete" : ""}" data-id="${goal.id}">
      <button class="icon-btn" data-action="complete" type="button" aria-label="Toggle goal">${goal.completed ? "Done" : "Todo"}</button>
      <span class="item-text">${escapeHtml(goal.text)}</span>
      <button class="icon-btn delete-btn" data-action="delete" type="button" aria-label="Delete">X</button>
    </li>
  `).join("");
}

function setupPomodoro() {
  $("#startTimer").addEventListener("click", () => {
    if (timerInterval) return;
    $("#timerMessage").textContent = "Stay with it.";
    timerInterval = setInterval(() => {
      timerSeconds -= 1;
      renderTimer();

      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerSeconds = 5 * 60;
        $("#timerMode").textContent = "Break Session";
        $("#timerMessage").textContent = "Nice work. Take five.";
        renderTimer();
      }
    }, 1000);
  });

  $("#pauseTimer").addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    $("#timerMessage").textContent = "Paused.";
  });

  $("#resetTimer").addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 25 * 60;
    $("#timerMode").textContent = "Work Session";
    $("#timerMessage").textContent = "Ready for one focused block.";
    renderTimer();
  });

  renderTimer();
}

function renderTimer() {
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  const seconds = (timerSeconds % 60).toString().padStart(2, "0");
  $("#timerDisplay").textContent = `${minutes}:${seconds}`;
}

function setupQuotes() {
  $("#newQuote").addEventListener("click", fetchQuote);
}

async function fetchQuote() {
  const text = $("#quoteText");
  text.textContent = "Loading...";

  try {
    const response = await fetch("https://api.quotable.io/random?tags=motivational|success|inspirational");
    if (!response.ok) throw new Error("Quote request failed");
    const data = await response.json();
    text.textContent = data.content || "Keep going.";
  } catch {
    const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    text.textContent = quote;
  }
}

function setupWeather() {
  $("#refreshWeather").addEventListener("click", loadWeather);
  loadWeather();
}

function loadWeather() {
  setWeatherLoading();

  if (!navigator.geolocation) {
    fetchWeather(22.5726, 88.3639, "Kolkata");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => fetchWeather(position.coords.latitude, position.coords.longitude, "Your location"),
    () => fetchWeather(22.5726, 88.3639, "Kolkata"),
    { enableHighAccuracy: false, timeout: 7000, maximumAge: 20 * 60 * 1000 }
  );
}

function setWeatherLoading() {
  $("#weatherTemp").textContent = "--";
  $("#weatherPlace").textContent = "Checking conditions";
  $("#weatherCondition").textContent = "Loading";
  $("#weatherHumidity").textContent = "--";
  $("#weatherWind").textContent = "--";
}

async function fetchWeather(latitude, longitude, label) {
  const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
  endpoint.search = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    wind_speed_unit: "kmh"
  });

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Weather request failed");
    const data = await response.json();
    const current = data.current;
    $("#weatherTemp").textContent = `${Math.round(current.temperature_2m)}\u00B0`;
    $("#weatherPlace").textContent = label;
    $("#weatherCondition").textContent = weatherCodeLabel(current.weather_code);
    $("#weatherHumidity").textContent = `${current.relative_humidity_2m}%`;
    $("#weatherWind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  } catch {
    $("#weatherTemp").textContent = "28\u00B0";
    $("#weatherPlace").textContent = "Offline sample";
    $("#weatherCondition").textContent = "Clear";
    $("#weatherHumidity").textContent = "62%";
    $("#weatherWind").textContent = "9 km/h";
  }
}

function weatherCodeLabel(code) {
  if ([0, 1].includes(code)) return "Clear";
  if ([2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Storm";
  return "Mixed";
}

function updateDashboardStats() {
  const openTasks = tasks.filter((task) => !task.completed).length;
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const goalPercent = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;
  const plannedSlots = Object.values(planner).filter(Boolean).length;

  $("#taskStat").textContent = openTasks;
  $("#goalStat").textContent = `${goalPercent}%`;
  $("#planStat").textContent = plannedSlots;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


