const state = {
  currentLang:    "en",
  screen:         "welcome",
  selectedInn:    null,
  selectedCoupon: null,
  usedCoupons:    [],
  form: {
    region:       "",
    country:      "",
    countryInput: "",
    age:          "",
    gender:       "",
  },
};

const countryOptions = {
  "Asia":          ["Japan", "Taiwan", "Korea", "China", "Other"],
  "Europe":        ["UK", "France", "Germany", "Italy", "Other"],
  "North America": ["USA", "Canada", "Mexico", "Other"],
  "Others":        ["Other"],
};

const demoData = {
  inns: [
    { name: "Kuma Kogen Hotel",    count: 12 },
    { name: "Henro Inn Yamabiko",  count: 8  },
    { name: "Minshuku Iwaya",      count: 3  },
  ],
  experiences: [
    { name: "Tea & Talk",          count: 10 },
    { name: "Farm Experience",     count: 6  },
    { name: "Handmade Market",     count: 4  },
  ],
  countries: [
    { name: "Taiwan",              count: 9  },
    { name: "USA",                 count: 7  },
    { name: "Japan",               count: 5  },
  ],
};

// ── ナビゲーション ──────────────────────────────────────

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
  state.screen = "form";
  render();
}

function goBack() {
  if      (state.screen === "inn")         state.screen = "welcome";
  else if (state.screen === "experience")  state.screen = "inn";
  else if (state.screen === "ticket")      state.screen = "experience";
  else if (state.screen === "form")        state.screen = "ticket";
  else if (state.screen === "dashboard")   state.screen = "done";
  render();
}

function goToDashboard() {
  state.screen = "dashboard";
  render();
}

function resetToWelcome() {
  state.screen         = "welcome";
  state.selectedInn    = null;
  state.selectedCoupon = null;
  state.form = { region: "", country: "", countryInput: "", age: "", gender: "" };
  render();
}

// ── フォーム入力 ────────────────────────────────────────

function selectRegion(val) {
  state.form.region       = val;
  state.form.country      = "";
  state.form.countryInput = "";
  render();
}

function selectCountry(val) {
  state.form.country      = val;
  state.form.countryInput = "";
  render();
}

function setCustomCountry(val) {
  // render()を呼ばない → 入力中のフォーカスを維持するため
  state.form.countryInput = val;
}

function selectAge(val) {
  state.form.age = val;
  render();
}

function selectGender(val) {
  state.form.gender = val;
  render();
}

function submitForm() {
  const country = state.form.country === "Other"
    ? (state.form.countryInput || "Other")
    : state.form.country;

  const log = {
    coupon:    state.selectedCoupon,
    region:    state.form.region,
    country:   country,
    age:       state.form.age,
    gender:    state.form.gender,
    timestamp: new Date().toISOString(),
  };

  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  logs.push(log);
  localStorage.setItem("logs", JSON.stringify(logs));

  console.log("SAVED:", log);

  state.screen = "done";
  render();
}

// ── 画面切替 ────────────────────────────────────────────

function showScreen(id) {
  ["screen-welcome", "screen-inn", "screen-experience",
   "screen-ticket",  "screen-form", "screen-done", "screen-dashboard"].forEach(s => {
    document.getElementById(s).style.display = "none";
  });
  document.getElementById(id).style.display = "flex";
}

// ── ボタンクラスヘルパー ────────────────────────────────

function btnClass(active) {
  return active
    ? "bg-red-600 border border-red-600 text-white text-sm py-3 px-3 rounded-xl text-center transition-colors"
    : "bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm py-3 px-3 rounded-xl text-center transition-colors";
}

// ── メインrender ────────────────────────────────────────

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

  if (state.screen === "form") {
    showScreen("screen-form");
    const f = state.form;

    document.getElementById("form-title").textContent = t.form_title;
    document.getElementById("form-cta").textContent   = t.form_cta;
    document.getElementById("form-back").textContent  = t.back;

    // Region
    const regions = ["Asia", "Europe", "North America", "Others"];
    document.getElementById("region-group").innerHTML = regions.map(r => `
      <button onclick="selectRegion('${r}')" class="${btnClass(f.region === r)}">${r}</button>
    `).join("");

    // Country（regionが選択されたら表示）
    const countrySec = document.getElementById("country-section");
    if (!f.region) {
      countrySec.style.display = "none";
    } else {
      countrySec.style.display = "block";
      const options = countryOptions[f.region];
      const btns = options.map(c => `
        <button onclick="selectCountry('${c}')" class="${btnClass(f.country === c)}">${c}</button>
      `).join("");
      const input = f.country === "Other" ? `
        <input
          type="text"
          placeholder="Enter your country"
          value="${f.countryInput}"
          oninput="setCustomCountry(this.value)"
          class="col-span-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white placeholder-white/40 text-sm py-3 px-4 rounded-xl mt-1"
        />
      ` : "";
      document.getElementById("country-group").innerHTML = btns + input;
    }

    // Age
    const ages = ["10s", "20s", "30s", "40s", "50+"];
    document.getElementById("age-group").innerHTML = ages.map(a => `
      <button onclick="selectAge('${a}')" class="${btnClass(f.age === a)}">${a}</button>
    `).join("");

    // Gender
    const genders = ["Male", "Female", "Other", "Prefer not to say"];
    document.getElementById("gender-group").innerHTML = genders.map(g => `
      <button onclick="selectGender('${g}')" class="${btnClass(f.gender === g)}">${g}</button>
    `).join("");
  }

  if (state.screen === "done") {
    showScreen("screen-done");
    document.getElementById("done-title").textContent   = t.done_title;
    document.getElementById("done-msg").textContent     = t.done_msg;
    document.getElementById("done-results").textContent = t.done_results;
    document.getElementById("done-home").textContent    = t.done_home;
  }

  if (state.screen === "dashboard") {
    showScreen("screen-dashboard");
    document.getElementById("dash-title").textContent = t.dash_title;
    document.getElementById("dash-back").textContent  = t.back;

    document.getElementById("dash-inns-label").textContent     = t.dash_inns;
    document.getElementById("dash-exp-label").textContent      = t.dash_exp;
    document.getElementById("dash-countries-label").textContent = t.dash_countries;

    document.getElementById("dash-inns").innerHTML     = renderBars(demoData.inns);
    document.getElementById("dash-exp").innerHTML      = renderBars(demoData.experiences);
    document.getElementById("dash-countries").innerHTML = renderBars(demoData.countries);
  }
}

function renderBars(data) {
  const max = Math.max(...data.map(d => d.count));
  return data.map(d => {
    const pct = Math.round((d.count / max) * 100);
    return `
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-white/80 text-xs">
          <span>${d.name}</span>
          <span>${d.count}</span>
        </div>
        <div class="h-2.5 bg-white/15 rounded-full overflow-hidden">
          <div class="h-full bg-white/70 rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

render();
