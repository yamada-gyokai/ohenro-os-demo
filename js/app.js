const state = {
  currentLang:    "en",
  screen:         "welcome",
  session_id:     (localStorage.getItem("session_id") || (() => {
                    const id = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
                    localStorage.setItem("session_id", id);
                    return id;
                  })()),
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

// ── ログ送信（GAS） ─────────────────────────────────────
function sendLog(payload) {
  fetch(CONFIG.GAS_URL, {
    method:  "POST",
    mode:    "no-cors",
    headers: { "Content-Type": "text/plain" },
    body:    JSON.stringify(payload),
  }).catch(() => {});
}

// ── ログ保存（localStorage） ─────────────────────────────
function saveLog(payload) {
  const entry = { ...payload, session_id: state.session_id, timestamp: new Date().toISOString() };
  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  logs.push(entry);
  localStorage.setItem("logs", JSON.stringify(logs));
}

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
  sendLog({ session_id: state.session_id, event: "inn_select", timestamp: new Date().toISOString(), spot: "45", inn: id, location_type: "inn" });
  saveLog({ event: "inn_select", inn: id, spot: "45" });
  state.screen = "experience";
  render();
}

function selectCoupon(id) {
  state.selectedCoupon = id;
  sendLog({ session_id: state.session_id, event: "coupon_display",       timestamp: new Date().toISOString(), inn: state.selectedInn, coupon: id });
  sendLog({ session_id: state.session_id, event: "navigate_experience",  timestamp: new Date().toISOString(), inn: state.selectedInn, coupon: id });
  saveLog({ event: "coupon_display",      inn: state.selectedInn, coupon: id });
  saveLog({ event: "navigate_experience", inn: state.selectedInn, coupon: id });
  state.screen = "ticket";
  render();
}

function useTicket() {
  state.usedCoupons.push(state.selectedCoupon);
  console.log("USED:", state.selectedCoupon);
  sendLog({ session_id: state.session_id, event: "coupon_use", timestamp: new Date().toISOString(), inn: state.selectedInn, coupon: state.selectedCoupon });
  saveLog({ event: "coupon_use", inn: state.selectedInn, coupon: state.selectedCoupon });
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
    document.getElementById("dash-back").textContent = t.back;

    const d   = collectDashData();
    const isJA = state.currentLang === "ja";

    // ① 人の流れ
    document.getElementById("dash-flow").innerHTML = `
      <div class="flex items-center justify-center gap-6 mb-3">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-white/50 text-xs">${isJA ? "45番" : "Temple 45"}</span>
          <span class="text-white text-4xl font-semibold">${d.spotVisits}</span>
          <span class="text-white/50 text-xs">${isJA ? "人" : "visitors"}</span>
        </div>
        <span class="text-white/30 text-2xl">→</span>
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-white/50 text-xs">${isJA ? "宿選択" : "Inn select"}</span>
          <span class="text-white text-4xl font-semibold">${d.innSelects}</span>
          <span class="text-white/50 text-xs">${isJA ? "人" : "people"}</span>
        </div>
      </div>
      <p class="text-white/40 text-xs text-center tracking-widest">${isJA ? "人はここまで来ている" : "People are making it here"}</p>
    `;

    // ② 宿ランキング
    const max = d.innRanking[0]?.count || 1;
    document.getElementById("dash-inns-ranking").innerHTML =
      d.innRanking.map((inn, i) => `
        <div class="flex items-center gap-3">
          <span class="text-white/30 text-xs w-3">${i + 1}</span>
          <div class="flex-1 flex flex-col gap-1">
            <div class="flex justify-between text-white/80 text-xs">
              <span>${inn.name}</span><span>${inn.count}</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-white/60 rounded-full" style="width:${Math.round(inn.count / max * 100)}%"></div>
            </div>
          </div>
        </div>
      `).join("")
      + `<p class="text-white/40 text-xs text-center tracking-widest mt-1">${isJA ? "この宿に人が流れている" : "These inns are attracting visitors"}</p>`;

    // ③ 属性
    const total = (d.japan + d.abroad) || 1;
    document.getElementById("dash-attr").innerHTML = `
      <div class="flex justify-center gap-8 mb-3">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-white/50 text-xs">${isJA ? "日本" : "Japan"}</span>
          <span class="text-white text-4xl font-semibold">${d.japan}</span>
        </div>
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-white/50 text-xs">${isJA ? "海外" : "International"}</span>
          <span class="text-white text-4xl font-semibold">${d.abroad}</span>
        </div>
      </div>
      <div class="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <div class="h-full bg-white/60 rounded-full" style="width:${Math.round(d.japan / total * 100)}%"></div>
      </div>
      <p class="text-white/40 text-xs text-center tracking-widest">${isJA ? "どんな人が来ているか" : "Who is visiting"}</p>
    `;
  }
}

// ── ダッシュボードデータ集計 ─────────────────────────────
function collectDashData() {
  const raw = JSON.parse(localStorage.getItem("logs") || "[]");

  // ログなし → PoC用ダミー
  if (raw.length === 0) {
    return {
      spotVisits: 18,
      innSelects: 12,
      innRanking: [
        { name: state.currentLang === "ja" ? "久万高原ホテル" : "Kuma Kogen Hotel",   count: 6 },
        { name: state.currentLang === "ja" ? "遍路宿やまびこ"  : "Henro Inn Yamabiko", count: 4 },
        { name: state.currentLang === "ja" ? "民宿いわや"      : "Minshuku Iwaya",     count: 2 },
      ],
      japan: 5, abroad: 7,
    };
  }

  const innSelectLogs = raw.filter(l => l.event === "inn_select");
  const sessions      = new Set(raw.map(l => l.session_id).filter(Boolean)).size;

  // 宿ランキング
  const counts = {};
  innSelectLogs.forEach(l => {
    const found = inns.find(i => i.id === l.inn);
    const name  = found ? (state.currentLang === "ja" ? found.name_ja : found.name_en) : l.inn;
    counts[name] = (counts[name] || 0) + 1;
  });
  const innRanking = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 属性（form logsはcountryフィールドを持つ）
  const formLogs = raw.filter(l => l.country);
  const japan    = formLogs.filter(l => l.country === "Japan").length;
  const abroad   = formLogs.filter(l => l.country !== "Japan").length;

  return { spotVisits: Math.max(sessions, innSelectLogs.length), innSelects: innSelectLogs.length, innRanking, japan, abroad };
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
