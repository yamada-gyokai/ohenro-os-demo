const state = {
  currentLang: "en",
  screen:      "welcome",
};

function setLanguage(lang) {
  state.currentLang = lang;
  render();
}

function goToInn() {
  state.screen = "inn";
  render();
}

function goBack() {
  state.screen = "welcome";
  render();
}

function selectInn(id) {
  state.selectedInn = id;
  // 次画面（クーポン選択）へ：未実装
}

function render() {
  const t = translations[state.currentLang];

  // 言語ボタン（国旗はopacityで、テキストは色で強調）
  document.getElementById("btn-ja").style.opacity = state.currentLang === "ja" ? "1"    : "0.4";
  document.getElementById("btn-en").style.opacity = state.currentLang === "en" ? "1"    : "0.4";
  document.getElementById("btn-ja").style.color   = state.currentLang === "ja" ? "#dc2626" : "rgba(0,0,0,0.5)";
  document.getElementById("btn-en").style.color   = state.currentLang === "en" ? "#dc2626" : "rgba(0,0,0,0.5)";

  if (state.screen === "welcome") {
    document.getElementById("screen-welcome").style.display = "flex";
    document.getElementById("screen-inn").style.display     = "none";

    document.getElementById("title").textContent    = t.title;
    document.getElementById("subtitle").textContent = t.subtitle;
    document.getElementById("location").textContent = t.location;
    document.getElementById("catch").textContent    = t.catch;
    document.getElementById("cta").textContent      = t.cta;
  }

  if (state.screen === "inn") {
    document.getElementById("screen-welcome").style.display = "none";
    document.getElementById("screen-inn").style.display     = "flex";

    document.getElementById("inn-title").textContent = t.inn_title;
    document.getElementById("back-btn").textContent  = t.back;

    // 宿カード生成（動的リストのためinnerHTML使用）
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
}

render();
