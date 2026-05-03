const state = {
  currentLang:    "en",
  screen:         "welcome",
  selectedInn:    null,
  selectedCoupon: null,
  usedCoupons:    [],
};

function setLanguage(lang) {
  state.currentLang = lang;
  render();
}

function goToInn() {
  state.screen = "inn";
  render();
}

function selectInn(id) {
  state.selectedInn = id;
  state.screen = "experience";
  render();
}

function selectCoupon(id) {
  state.selectedCoupon = id;
  state.screen = "ticket";
  render();
}

function useTicket() {
  state.usedCoupons.push(state.selectedCoupon);
  console.log("USED:", state.selectedCoupon);
  alert("Used");
}

function goBack() {
  if (state.screen === "inn")         state.screen = "welcome";
  else if (state.screen === "experience") state.screen = "inn";
  else if (state.screen === "ticket")     state.screen = "experience";
  render();
}

function showScreen(id) {
  ["screen-welcome", "screen-inn", "screen-experience", "screen-ticket"].forEach(s => {
    document.getElementById(s).style.display = "none";
  });
  document.getElementById(id).style.display = "flex";
}

function render() {
  const t = translations[state.currentLang];

  // 言語ボタン
  document.getElementById("btn-ja").style.opacity = state.currentLang === "ja" ? "1"       : "0.4";
  document.getElementById("btn-en").style.opacity = state.currentLang === "en" ? "1"       : "0.4";
  document.getElementById("btn-ja").style.color   = state.currentLang === "ja" ? "#dc2626" : "rgba(0,0,0,0.5)";
  document.getElementById("btn-en").style.color   = state.currentLang === "en" ? "#dc2626" : "rgba(0,0,0,0.5)";

  if (state.screen === "welcome") {
    showScreen("screen-welcome");
    document.getElementById("title").textContent    = t.title;
    document.getElementById("subtitle").textContent = t.subtitle;
    document.getElementById("location").textContent = t.location;
    document.getElementById("catch").textContent    = t.catch;
    document.getElementById("cta").textContent      = t.cta;
  }

  if (state.screen === "inn") {
    showScreen("screen-inn");
    document.getElementById("inn-title").textContent = t.inn_title;
    document.getElementById("inn-back").textContent  = t.back;

    document.getElementById("inn-list").innerHTML = inns.map(inn => `
      <button
        onclick="selectInn('${inn.id}')"
        class="w-full bg-white/95 rounded-2xl px-6 py-5 text-left shadow-lg active:bg-white/80 transition-colors"
      >
        <p class="text-gray-800 text-lg font-semibold tracking-wide">
          ${state.currentLang === "en" ? inn.name_en : inn.name_ja}
        </p>
      </button>
    `).join("");
  }

  if (state.screen === "experience") {
    showScreen("screen-experience");
    document.getElementById("exp-title").textContent = t.exp_title;
    document.getElementById("exp-back").textContent  = t.back;

    const filtered = coupons.filter(c => c.inn_id === state.selectedInn);

    if (filtered.length === 0) {
      document.getElementById("exp-list").innerHTML =
        `<p class="text-white/50 text-base text-center tracking-wide pt-8">${t.exp_empty}</p>`;
    } else {
      document.getElementById("exp-list").innerHTML = filtered.map(cp => `
        <button
          onclick="selectCoupon('${cp.id}')"
          class="w-full bg-white/95 rounded-2xl px-6 py-5 text-left shadow-lg active:bg-white/80 transition-colors"
        >
          <p class="text-gray-800 text-base font-semibold tracking-wide">
            ${state.currentLang === "en" ? cp.title_en : cp.title_ja}
          </p>
          <p class="text-gray-500 text-sm mt-1">
            ${state.currentLang === "en" ? cp.desc_en : cp.desc_ja}
          </p>
        </button>
      `).join("");
    }
  }

  if (state.screen === "ticket") {
    showScreen("screen-ticket");
    const cp = coupons.find(c => c.id === state.selectedCoupon);

    document.getElementById("ticket-back").textContent  = t.back;
    document.getElementById("ticket-title").textContent = state.currentLang === "en" ? cp.title_en : cp.title_ja;
    document.getElementById("ticket-desc").textContent  = state.currentLang === "en" ? cp.desc_en  : cp.desc_ja;
    document.getElementById("ticket-cta").textContent   = t.ticket_cta;

    const phrases = [t.phrase_thank, t.phrase_please, t.phrase_ok, t.phrase_photo];
    document.getElementById("phrase-list").innerHTML = phrases.map(p => `
      <button class="bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm py-3 px-4 rounded-2xl text-center">
        ${p}
      </button>
    `).join("");
  }
}

render();
