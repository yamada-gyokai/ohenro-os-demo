const state = {
  currentLang: "en",
  screen:      "welcome",
  selectedInn: null,
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
  // 次画面（属性入力）へ：未実装
}

function goBack() {
  if (state.screen === "inn")        state.screen = "welcome";
  else if (state.screen === "experience") state.screen = "inn";
  render();
}

// 全画面をhideしてから対象のみ表示
function showScreen(id) {
  ["screen-welcome", "screen-inn", "screen-experience"].forEach(s => {
    document.getElementById(s).style.display = "none";
  });
  document.getElementById(id).style.display = "flex";
}

function render() {
  const t = translations[state.currentLang];

  // 言語ボタン
  document.getElementById("btn-ja").style.opacity = state.currentLang === "ja" ? "1"    : "0.4";
  document.getElementById("btn-en").style.opacity = state.currentLang === "en" ? "1"    : "0.4";
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

render();
