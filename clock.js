const cities = {
  nyTime: {
    name: "New York",
    timeZone: "America/New_York"
  },
  pakTime: {
    name: "Pakistan",
    timeZone: "Asia/Karachi"
  },
  pacific: {
    name: "Pacific Time",
    timeZone: "America/Los_Angeles"
  },
  india: {
    name: "India",
    timeZone: "Asia/Kolkata"
  },
  london: {
    name: "London",
    timeZone: "Europe/London"
  },
  dubai: {
    name: "Dubai",
    timeZone: "Asia/Dubai"
  },
  tokyo: {
    name: "Tokyo",
    timeZone: "Asia/Tokyo"
  },
  sydney: {
    name: "Sydney",
    timeZone: "Australia/Sydney"
  }
};

function updateTime() {
  const now = new Date();

  Object.entries(cities).forEach(([id, city]) => {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = new Intl.DateTimeFormat("en-US", {
      timeZone: city.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).format(now);
  });
}

const clockModeButton = document.getElementById("clockModeButton");
const plannerModeButton = document.getElementById("plannerModeButton");
const worldClock = document.getElementById("world-clock");
const meetingPlanner = document.getElementById("meeting-planner");

function showMode(mode) {
  const showClock = mode === "clock";

  worldClock.hidden = !showClock;
  meetingPlanner.hidden = showClock;

  clockModeButton.classList.toggle("active", showClock);
  plannerModeButton.classList.toggle("active", !showClock);

  clockModeButton.setAttribute("aria-pressed", String(showClock));
  plannerModeButton.setAttribute("aria-pressed", String(!showClock));
}

clockModeButton.addEventListener("click", () => showMode("clock"));
plannerModeButton.addEventListener("click", () => showMode("planner"));

const meetingDate = document.getElementById("meetingDate");
const meetingForm = document.getElementById("meetingForm");
const meetingResults = document.getElementById("meetingResults");

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

meetingDate.min = getLocalDateString(new Date());
meetingDate.value = meetingDate.min;

function getTimeAtZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const result = {};

  parts.forEach(part => {
    if (part.type !== "literal") {
      result[part.type] = Number(part.value);
    }
  });

  return result;
}

function zonedTimeToUtc(dateString, timeString, timeZone) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);

  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;

  for (let i = 0; i < 4; i++) {
    const local = getTimeAtZone(new Date(guess), timeZone);

    const represented = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second
    );

    guess += target - represented;
  }

  const check = getTimeAtZone(new Date(guess), timeZone);

  if (
    check.year !== year ||
    check.month !== month ||
    check.day !== day ||
    check.hour !== hour ||
    check.minute !== minute
  ) {
    return null;
  }

  return guess;
}

function formatCityTime(timestamp, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(timestamp));
}

function formatUtcTime(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
}

function getCityName(select) {
  return select.options[select.selectedIndex].textContent.trim();
}

meetingForm.addEventListener("submit", event => {
  event.preventDefault();

  const date = meetingDate.value;
  const participants = Array.from(
    document.querySelectorAll(".participant")
  );

  if (!date || participants.length !== 2) {
    meetingResults.textContent = "Please complete the meeting details.";
    return;
  }

  const people = participants.map(participant => ({
    city: participant.querySelector("select"),
    start: participant.querySelector('input[type="time"]:first-of-type'),
    end: participant.querySelectorAll('input[type="time"]')[1]
  }));

  const details = people.map(person => ({
    name: getCityName(person.city),
    zone: person.city.value,
    start: person.start.value,
    end: person.end.value
  }));

  for (const person of details) {
    if (!person.start || !person.end || person.start >= person.end) {
      meetingResults.textContent =
        "Please enter valid working hours. End time must be after start time.";
      return;
    }
  }

  if (details[0].zone === details[1].zone) {
    meetingResults.textContent =
      "Both participants have the same time zone. Choose two different cities to compare.";
    return;
  }

  const intervals = details.map(person => ({
    ...person,
    startUtc: zonedTimeToUtc(date, person.start, person.zone),
    endUtc: zonedTimeToUtc(date, person.end, person.zone)
  }));

  if (intervals.some(person => person.startUtc === null || person.endUtc === null)) {
    meetingResults.textContent =
      "A selected time may not exist because of a daylight-saving clock change. Try another time or date.";
    return;
  }

  const overlapStart = Math.max(...intervals.map(person => person.startUtc));
  const overlapEnd = Math.min(...intervals.map(person => person.endUtc));

  if (overlapStart >= overlapEnd) {
    meetingResults.textContent =
      "There is no overlapping working time for these cities on the selected date. Try changing the date or working hours.";
    return;
  }

  const slots = [];

  for (
    let timestamp = Math.ceil(overlapStart / 1800000) * 1800000;
    timestamp + 1800000 <= overlapEnd;
    timestamp += 1800000
  ) {
    slots.push(timestamp);
  }

  if (slots.length === 0) {
    meetingResults.textContent =
      "The overlap is less than 30 minutes. Try adjusting working hours.";
    return;
  }

  const firstCity = intervals[0];
  const secondCity = intervals[1];

  const resultHeading = document.createElement("h2");
  resultHeading.textContent = "Suggested meeting times";

  const resultDescription = document.createElement("p");
  resultDescription.textContent =
    `Working-hour overlap: ${formatCityTime(overlapStart, firstCity.zone)}–${formatCityTime(overlapEnd, firstCity.zone)} in ${firstCity.name}, and ${formatCityTime(overlapStart, secondCity.zone)}–${formatCityTime(overlapEnd, secondCity.zone)} in ${secondCity.name}.`;

  const resultList = document.createElement("ul");

  slots.slice(0, 8).forEach(timestamp => {
    const item = document.createElement("li");
    item.textContent =
      `${formatCityTime(timestamp, firstCity.zone)} in ${firstCity.name} · ${formatCityTime(timestamp, secondCity.zone)} in ${secondCity.name}`;
    resultList.appendChild(item);
  });

  meetingResults.replaceChildren(
    resultHeading,
    resultDescription,
    resultList
  );
});

updateTime();
setInterval(updateTime, 1000);
