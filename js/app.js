const state = {
  currentLang: "en",
};

function setLanguage(lang) {
  state.currentLang = lang;
  render();
}

function render() {
  const t = translations[state.currentLang];

  document.getElementById("title").textContent    = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;
  document.getElementById("location").textContent = t.location;
  document.getElementById("catch").textContent    = t.catch;
  document.getElementById("cta").textContent      = t.cta;

  // 言語ボタンのアクティブ表示
  document.getElementById("btn-ja").style.opacity = state.currentLang === "ja" ? "1"   : "0.35";
  document.getElementById("btn-en").style.opacity = state.currentLang === "en" ? "1"   : "0.35";
  document.getElementById("btn-ja").style.fontWeight = state.currentLang === "ja" ? "600" : "400";
  document.getElementById("btn-en").style.fontWeight = state.currentLang === "en" ? "600" : "400";
}

render();
