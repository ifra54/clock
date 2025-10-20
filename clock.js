function updateTime() {
  const now = new Date();
  const nyOptions = {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const pkOptions = {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const pOption = {
    timeZone: "America/Los_Angeles",

    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const ioption = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const londonOption = {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const dubaiOption = {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const tokyoOption = {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const sydneyOption = {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const nyTime = now.toLocaleTimeString("en-US", nyOptions);
  const pkTime = now.toLocaleTimeString("en-US", pkOptions);
  const pTime = now.toLocaleTimeString("en-US", pOption);
  const iTime = now.toLocaleTimeString("en-US", ioption);
  const londonTime = now.toLocaleTimeString("en-US", londonOption);
  const dubaiTime = now.toLocaleTimeString("en-US", dubaiOption);
  const tokyoTime = now.toLocaleTimeString("en-US", tokyoOption);
  const sydneyTime = now.toLocaleTimeString("en-US", sydneyOption);

  document.getElementById("nyTime").textContent = "NY USA Time: " + nyTime;
  document.getElementById("pakTime").textContent =
    "🇵🇰 Pakistan Time: " + pkTime;
  document.getElementById("pacific").textContent = "🇺🇸 Pacific US : " + pTime;
  document.getElementById("india").textContent =
    "🇮🇳 India (Delhi, Mumbai) : " + iTime;
  document.getElementById("london").textContent = "🇬🇧 London: " + londonTime;
  document.getElementById("dubai").textContent = "🇦🇪 Dubai: " + dubaiTime;
  document.getElementById("tokyo").textContent = "🇯🇵 Tokyo: " + tokyoTime;
  document.getElementById("sydney").textContent = "🇦🇺 Sydney: " + sydneyTime;
}
updateTime();
setInterval(updateTime, 1000);
