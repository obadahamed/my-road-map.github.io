/**
 * Road Map — App Logic
 * All state management, render functions, and UI interactions.
 * Data (WEEKS_DATA) lives in assets/data/weeks-data.js
 */

// ===== localStorage helpers with graceful error handling =====
let _lsAvailable = null;

function checkLocalStorage() {
  if (_lsAvailable !== null) return _lsAvailable;
  try {
    const t = '__ls_test__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    _lsAvailable = true;
  } catch (e) {
    _lsAvailable = false;
    showLSBanner();
  }
  return _lsAvailable;
}

function showLSBanner() {
  const existing = document.getElementById('ls-banner');
  if (existing) return;
  const div = document.createElement('div');
  div.id = 'ls-banner';
  div.className = 'ls-banner';
  div.setAttribute('role', 'alert');
  div.innerHTML = `
    <span class="ls-banner-icon">⚠️</span>
    <span>التخزين المحلي (localStorage) غير متاح في هذا المتصفح. لن يتم حفظ بياناتك. تأكد من عدم استخدام وضع التصفح الخاص أو تعطيل الكوكيز.</span>
    <span class="ls-banner-close" onclick="this.parentElement.remove()" aria-label="إغلاق">✕</span>
  `;
  document.body.appendChild(div);
}

function save(key, val) {
  if (!checkLocalStorage()) return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* quota exceeded etc */ }
}

function load(key, def) {
  if (!checkLocalStorage()) return def;
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : def;
  } catch (e) {
    return def;
  }
}

function safeJSONParse(str, def) {
  try { return JSON.parse(str); } catch (e) { return def; }
}

// ===== WEEKS_DATA integrity check =====
function checkWeeksData() {
  const wd = window.WEEKS_DATA;
  if (!Array.isArray(wd) || wd.length === 0) {
    const main = document.querySelector('.main');
    if (main) {
      main.innerHTML = `<div class="data-error">
        <div class="data-error-icon">⚠️</div>
        <h2>بيانات الخارطة غير موجودة</h2>
        <p>تعذّر تحميل <code>window.WEEKS_DATA</code>. تأكد من وجود ملف <code>assets/data/weeks-data.js</code> وأنه يُحمَّل بشكل صحيح.</p>
      </div>`;
    }
    return false;
  }
  // Basic shape check: each item should have num, phase, topic, dates, days
  const valid = wd.every(w =>
    typeof w.num === 'number' &&
    typeof w.phase === 'number' &&
    typeof w.topic === 'string' &&
    Array.isArray(w.days)
  );
  if (!valid) {
    console.warn('[RoadMap] WEEKS_DATA has unexpected shape – some weeks may not render correctly.');
  }
  return true;
}

// ===== DATA — PRELOADED_ROOMS =====
const PRELOADED_ROOMS = [
  "Linux Fundamentals Part 1","Linux Fundamentals Part 2","Linux Fundamentals Part 3","Linux Shells","Linux Privilege Escalation",
  "Windows Fundamentals 1","Windows Fundamentals 2","Windows Fundamentals 3","Windows Command Line","Windows PowerShell","Windows Privilege Escalation",
  "How Websites Work","HTTP in Detail","Web Application Basics","Walking An Application","Putting it all together",
  "Content Discovery","Subdomain Enumeration","Authentication Bypass","IDOR","Intro to SSRF","Intro to Cross-site Scripting",
  "File Inclusion","Command Injection","Upload Vulnerabilities","OWASP Juice Shop",
  "SQL Injection","Advanced SQL Injection","NoSQL Injection","SQLMap: The Basics","SQL Fundamentals",
  "DNS in Detail","What is Networking?","Intro to LAN","OSI Model","Packets & Frames","Extending Your Network","Networking Concepts",
  "Networking Essentials","Networking Core Protocols","Networking Secure Protocols","Network Services","Protocols and Servers 2",
  "Passive Reconnaissance","Active Reconnaissance","Nmap","Nmap: The Basics","Nmap Live Host Discovery","Nmap Basic Port Scans",
  "Wireshark: The Basics","Tcpdump: The Basics","Net Sec Challenge",
  "Burp Suite: The Basics","Burp Suite: Repeater","Burp Suite: Intruder","Burp Suite: Other Modules","Burp Suite: Extensions",
  "Metasploit: Introduction","Metasploit: Exploitation","Metasploit: Meterpreter",
  "Vulnerabilities 101","Exploit Vulnerabilities","Cryptography Basics","Hashing Basics","Public Key Cryptography Basics",
  "Security Principles","Security Awareness",
  "Active Directory Basics",
  "Pickle Rick","Mr Robot CTF","OhSINT","Simple CTF","Agent Sudo","LazyAdmin","Bounty Hacker","Overpass","RootMe","Brooklyn Nine Nine","Easy Peasy","Cyborg","Blue","Basic Pentesting",
  "Gobuster: The Basics","John the Ripper: The Basics","CyberChef: The Basics","Hydra",
  "Offensive Security Intro","Pentesting Fundamentals","Search Skills","Shells Overview","What the Shell?"
];

// ===== DATA — SKILLS_DEF =====
const SKILLS_DEF = [
  {"id":"web","name":"Web Exploitation","ar":"استغلال الويب","color":"#6366f1","icon":"🌐","rooms":["How Websites Work","HTTP in Detail","Web Application Basics","Walking An Application","Putting it all together","Content Discovery","Subdomain Enumeration","Authentication Bypass","IDOR","Intro to SSRF","Intro to Cross-site Scripting","File Inclusion","Command Injection","Upload Vulnerabilities","OWASP Juice Shop"]},
  {"id":"sqli","name":"SQL Injection","ar":"SQL Injection","color":"#a78bfa","icon":"💉","rooms":["SQL Injection","Advanced SQL Injection","NoSQL Injection","SQLMap: The Basics","SQL Fundamentals"]},
  {"id":"linuxPriv","name":"Linux PrivEsc","ar":"رفع صلاحيات Linux","color":"#10b981","icon":"🐧","rooms":["Linux Privilege Escalation","Linux Fundamentals Part 1","Linux Fundamentals Part 2","Linux Fundamentals Part 3","Linux Shells"]},
  {"id":"winPriv","name":"Windows PrivEsc","ar":"رفع صلاحيات Windows","color":"#38bdf8","icon":"🪟","rooms":["Windows Privilege Escalation","Windows Fundamentals 1","Windows Fundamentals 2","Windows Fundamentals 3","Windows Command Line","Windows PowerShell"]},
  {"id":"ad","name":"Active Directory","ar":"Active Directory","color":"#f59e0b","icon":"🏢","rooms":["Active Directory Basics"]},
  {"id":"net","name":"Networking","ar":"شبكات","color":"#34d399","icon":"🔌","rooms":["DNS in Detail","What is Networking?","Intro to LAN","OSI Model","Packets & Frames","Extending Your Network","Networking Concepts","Networking Essentials","Networking Core Protocols","Networking Secure Protocols","Network Services","Protocols and Servers 2","Passive Reconnaissance","Active Reconnaissance","Nmap","Nmap: The Basics","Nmap Live Host Discovery","Nmap Basic Port Scans","Wireshark: The Basics","Tcpdump: The Basics","Net Sec Challenge"]},
  {"id":"burp","name":"Burp Suite","ar":"Burp Suite","color":"#f97316","icon":"🔥","rooms":["Burp Suite: The Basics","Burp Suite: Repeater","Burp Suite: Intruder","Burp Suite: Other Modules","Burp Suite: Extensions"]},
  {"id":"msf","name":"Metasploit","ar":"Metasploit","color":"#ef4444","icon":"🎯","rooms":["Metasploit: Introduction","Metasploit: Exploitation","Metasploit: Meterpreter"]},
  {"id":"report","name":"Report Writing","ar":"كتابة التقارير","color":"#22d3ee","icon":"📝","rooms":[]}
];

// ===== START DATE =====
const START_DATE = new Date('2026-03-02T00:00:00');

// ===== STATE =====
const S = {
  tasks: {},
  routine: {},
  extraRoomsCatalog: [],
  roomsState: {},
  notes: {},
  ratings: {},
  notifications: { enabled: false, time: "20:00" },
  focus: { running: false, mode: "pomodoro25", startedAt: 0, durationMs: 25*60*1000, endsAt: 0 },
  view: 'today',
  phase: 1,
  roomFilter: 'all',
  roomSearch: '',
  roadmapSearch: ''
};

// ===== LOAD / SAVE STATE =====
function loadState() {
  S.tasks              = load('xenos_tasks', {});
  S.routine            = load('xenos_routine', {});
  S.extraRoomsCatalog  = load('xenos_extra_catalog', []);
  S.roomsState         = load('xenos_rooms_state', {});
  S.notes              = load('xenos_notes', {});
  S.ratings            = load('xenos_ratings', {});
  S.notifications      = load('xenos_notifications', { enabled: false, time: "20:00" });
  S.focus              = load('xenos_focus', { running: false, mode: "pomodoro25", startedAt: 0, durationMs: 25*60*1000, endsAt: 0 });
  S.view               = localStorage.getItem('xenos_view') || 'today';
  S.phase              = parseInt(load('xenos_phase', 1)) || 1;
}

// ===== DATE HELPERS =====
function pad2(n) { return String(n).padStart(2, '0'); }

function todayDate() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getTodayKey() {
  const d = todayDate();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function getTodayDayName() {
  const names = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  return names[new Date().getDay()];
}

function formatDate() {
  return new Date().toLocaleDateString('ar-SA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function getCurrentWeek() {
  const now = todayDate();
  const diff = Math.floor((now - START_DATE) / (7 * 24 * 3600 * 1000));
  return Math.max(1, Math.min(52, diff + 1));
}

function getWeekStartDate(weekNum) {
  return addDays(START_DATE, (weekNum - 1) * 7);
}

function getDayDate(weekNum, dayIndex) {
  // dayIndex 0=Mon, 1=Tue, ..., 5=Sat (skip Friday index 4 if needed)
  return addDays(getWeekStartDate(weekNum), dayIndex);
}

// Map Arabic day names to offsets from week-start (Monday = 0)
const DAY_OFFSETS = {
  'الاثنين': 0, 'الثلاثاء': 1, 'الأربعاء': 2,
  'الخميس': 3,  'السبت': 5, 'الأحد': 6
};

function getDayDateByName(weekNum, dayName) {
  const offset = DAY_OFFSETS[dayName];
  if (offset === undefined) return null;
  return addDays(getWeekStartDate(weekNum), offset);
}

// ===== OVERDUE & UPCOMING =====
function getOverdueAndUpcoming() {
  const overdue = [], upcoming = [];
  const today = todayDate();
  const weeks = window.WEEKS_DATA || [];

  weeks.forEach(w => {
    (w.days || []).forEach(d => {
      if (d.d === 'الجمعة') return;
      const key = `w${w.num}_${d.d}`;
      const dayDate = getDayDateByName(w.num, d.d);
      if (!dayDate) return;

      const item = { key, task: d.task, type: d.t, weekNum: w.num, dayName: d.d, date: dayDate };

      if (dayDate < today && !S.tasks[key]) {
        overdue.push(item);
      } else if (dayDate > today && dayDate <= addDays(today, 7)) {
        upcoming.push(item);
      }
    });
  });

  overdue.sort((a, b) => b.date - a.date);
  upcoming.sort((a, b) => a.date - b.date);

  return { overdue: overdue.slice(0, 5), upcoming: upcoming.slice(0, 5) };
}

// ===== ROOMS STATE =====
function getRoomsCatalogList() {
  return [...new Set([...PRELOADED_ROOMS, ...S.extraRoomsCatalog])];
}

function getRoomState(name) {
  return S.roomsState[name] || 'pending';
}

function setRoomState(name, st) {
  S.roomsState[name] = st;
  save('xenos_rooms_state', S.roomsState);
}

function countRooms() {
  const all = getRoomsCatalogList();
  let done = 0, inprogress = 0, pending = 0;
  all.forEach(r => {
    const s = getRoomState(r);
    if (s === 'done') done++;
    else if (s === 'inprogress') inprogress++;
    else pending++;
  });
  return { done, inprogress, pending, total: all.length };
}

// ===== SKILLS CALC =====
function calcSkills() {
  const result = {};
  SKILLS_DEF.forEach(sk => {
    if (!sk.rooms.length) { result[sk.id] = 0; return; }
    const done = sk.rooms.filter(r => getRoomState(r) === 'done').length;
    result[sk.id] = Math.round((done / sk.rooms.length) * 100);
  });
  return result;
}

// ===== STREAK =====
function getStreak() {
  let streak = 0;
  const today = todayDate();
  for (let i = 0; i <= 365; i++) {
    const d = addDays(today, -i);
    const k = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
    const r = S.routine[k] || {};
    if (r.teeth && r.exercise) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function getTotalTasksDone() {
  return Object.values(S.tasks).filter(Boolean).length;
}

// ===== BONUS ROOM =====
const BONUS_POOL = [
  "Pickle Rick","RootMe","Simple CTF","Agent Sudo","LazyAdmin","Bounty Hacker",
  "Overpass","Brooklyn Nine Nine","Easy Peasy","Cyborg","Blue","Basic Pentesting",
  "OhSINT","Mr Robot CTF","Net Sec Challenge","Nmap","Wreath","OWASP Juice Shop",
  "Enumeration & Brute Force","Hydra","John the Ripper: The Basics",
  "CyberChef: The Basics","Gobuster: The Basics"
];
function getBonusRoom() {
  const daysSinceStart = Math.floor((todayDate() - START_DATE) / (24 * 3600 * 1000));
  return BONUS_POOL[Math.abs(daysSinceStart) % BONUS_POOL.length];
}

// ===== WEEK PROGRESS =====
function getWeekProgress(wn) {
  const weeks = window.WEEKS_DATA || [];
  const wk = weeks.find(w => w.num === wn);
  if (!wk) return 0;
  const days = (wk.days || []).filter(d => d.d !== 'الجمعة');
  const done = days.filter(d => S.tasks[`w${wn}_${d.d}`]).length;
  return days.length ? Math.round(done / days.length * 100) : 0;
}

// ===== NAV =====
function nav(v) {
  S.view = v;
  localStorage.setItem('xenos_view', v);
  document.querySelectorAll('.sb-item').forEach(el =>
    el.classList.toggle('active', el.dataset.view === v)
  );
  document.querySelectorAll('.view').forEach(el =>
    el.classList.toggle('active', el.id === 'v-' + v)
  );
  // Close sidebar on mobile after navigation
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && window.innerWidth <= 768) sidebar.classList.remove('open');
  renderView(v);
}

function renderView(v) {
  if (v === 'today') renderToday();
  else if (v === 'roadmap') renderRoadmap();
  else if (v === 'skills') renderSkills();
  else if (v === 'rooms') renderRooms();
}

// ===== SMART PLAN =====
function getPlan(minutes) {
  if (minutes <= 30) return [
    "افتح المهمة/الروم الخاصة باليوم واقرأ المقدمة فقط.",
    "اكتب 3 نقاط: (شو الهدف؟ شو الأدوات؟ شو الأشياء اللي ما فهمتها؟).",
    "لو ضل وقت: راجع ملاحظات الأسبوع."
  ];
  if (minutes <= 60) return [
    "اقرأ المقدمة + أول جزء من الروم، وركز على فهم المصطلحات.",
    "كل ما تشوف مصطلح جديد: اكتبه بملاحظاتك.",
    "آخر 10 دقائق: اكتب ملخص بسيط (5 سطور)."
  ];
  return [
    "قسم الجلسة: 10 دقائق تجهيز + 70 دقائق عمل + 10 دقائق تلخيص + 10 دقائق تنظيم.",
    "كل 20 دقيقة توقف 30 ثانية واسأل نفسك: (ليش عم أعمل هالخطوة؟).",
    "آخر الجلسة: حدّد 'خطوة واحدة' لباكر."
  ];
}

// ===== FOCUS / POMODORO =====
function startFocus(mode) {
  const mins = mode === "pomodoro50" ? 50 : 25;
  S.focus = { mode, running: true, startedAt: Date.now(), durationMs: mins * 60 * 1000, endsAt: Date.now() + mins * 60 * 1000 };
  save('xenos_focus', S.focus);
  renderView(S.view);
}

function stopFocus() {
  S.focus.running = false;
  save('xenos_focus', S.focus);
  renderView(S.view);
}

function getFocusRemainingMs() {
  if (!S.focus.running) return 0;
  return Math.max(0, S.focus.endsAt - Date.now());
}

function formatMMSS(ms) {
  const s = Math.floor(ms / 1000);
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

// ===== NOTIFICATIONS =====
async function enableNotifications() {
  if (!("Notification" in window)) { alert("متصفحك لا يدعم الإشعارات."); return; }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") { alert("لم يتم إعطاء إذن الإشعارات."); return; }
  S.notifications.enabled = true;
  save('xenos_notifications', S.notifications);
  alert("تم تفعيل الإشعارات. لازم تترك الصفحة مفتوحة حتى يشتغل التذكير.");
  renderView(S.view);
}

function setNotifyTime(t) {
  S.notifications.time = t;
  save('xenos_notifications', S.notifications);
}

function maybeFireDailyNotification() {
  if (!S.notifications.enabled) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const keyToday = getTodayKey();
  const lastKey = localStorage.getItem("xenos_notify_last") || "";
  const [hh, mm] = (S.notifications.time || "20:00").split(":").map(x => parseInt(x, 10));
  const now = new Date();
  if (now.getHours() === hh && now.getMinutes() === mm && lastKey !== keyToday) {
    localStorage.setItem("xenos_notify_last", keyToday);
    new Notification("Road Map — تذكير اليوم", {
      body: "افتح المهام وحدد 30 دقيقة تركيز. خطوة صغيرة كل يوم."
    });
  }
}

// ===== BACKUP / RESTORE =====
function exportBackup() {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      tasks: S.tasks,
      routine: S.routine,
      extraRoomsCatalog: S.extraRoomsCatalog,
      roomsState: S.roomsState,
      notes: S.notes,
      ratings: S.ratings,
      notifications: S.notifications
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `roadmap-backup-${getTodayKey()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const obj = safeJSONParse(reader.result, null);
    if (!obj || !obj.data) { alert("الملف غير صالح."); return; }
    const d = obj.data;
    if (obj.version !== 2 && !confirm(`نسخة احتياطية قديمة (v${obj.version || '?'}). هل تريد الاستمرار؟`)) return;
    S.tasks               = d.tasks || {};
    S.routine             = d.routine || {};
    S.extraRoomsCatalog   = d.extraRoomsCatalog || [];
    S.roomsState          = d.roomsState || {};
    S.notes               = d.notes || {};
    S.ratings             = d.ratings || {};
    S.notifications       = d.notifications || S.notifications;
    save('xenos_tasks',          S.tasks);
    save('xenos_routine',        S.routine);
    save('xenos_extra_catalog',  S.extraRoomsCatalog);
    save('xenos_rooms_state',    S.roomsState);
    save('xenos_notes',          S.notes);
    save('xenos_ratings',        S.ratings);
    save('xenos_notifications',  S.notifications);
    alert("تم الاستيراد بنجاح.");
    renderView(S.view);
  };
  reader.readAsText(file);
}

// ===== ESCAPE HELPERS =====
function escapeHTML(s) {
  return String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function escapeJS(s) {
  return String(s).replaceAll("\\","\\\\").replaceAll("'","\\'");
}

// ===== TODAY VIEW =====
function renderToday() {
  const wn = getCurrentWeek();
  const weeks = window.WEEKS_DATA || [];
  const wk = weeks.find(w => w.num === wn);
  const dayName = getTodayDayName();
  const todayKey = getTodayKey();
  const routine = S.routine[todayKey] || {};
  const streak = getStreak();
  const bonus = getBonusRoom();
  const skills = calcSkills();
  const roomsCount = countRooms();
  const { overdue, upcoming } = getOverdueAndUpcoming();
  const todayDay = wk ? (wk.days || []).find(d => d.d === dayName) : null;
  const weekProgress = getWeekProgress(wn);

  // Next undone task
  let nextTask = null;
  if (wk) {
    const remainingDays = (wk.days || []).filter(d => d.d !== 'الجمعة' && !S.tasks[`w${wn}_${d.d}`]);
    if (remainingDays.length) nextTask = remainingDays[0];
  }

  let html = `
    <div class="topbar">
      <div class="topbar-title">اليوم <span>/ Today</span></div>
      <div class="topbar-right">
        <span class="pill">📅 ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
        <button class="mini-btn" onclick="exportBackup()" title="تصدير نسخة احتياطية">↓ Backup</button>
        <label class="mini-btn" style="cursor:pointer" title="استيراد نسخة احتياطية">
          ↑ Restore<input type="file" accept="application/json" style="display:none" onchange="importBackup(this.files[0])" />
        </label>
      </div>
    </div>

    <div class="today-header">
      <div class="today-date">${formatDate()}</div>
      <div class="today-week-label">الأسبوع ${wn} — ${wk ? wk.topic : '...'}</div>
      <div class="today-dates-range">${wk ? wk.dates : ''}</div>
    </div>

    <div class="today-summary">
      <div class="summary-item">
        <div class="summary-num ${overdue.length > 0 ? 'red' : 'green'}">${overdue.length}</div>
        <div class="summary-label">متأخر</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-num yellow">${weekProgress}%</div>
        <div class="summary-label">تقدم الأسبوع</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-num">${roomsCount.done}</div>
        <div class="summary-label">Rooms منجزة</div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-num ${streak >= 7 ? 'yellow' : ''}">${streak}</div>
        <div class="summary-label">🔥 Streak</div>
      </div>
      ${nextTask ? `
      <div class="summary-divider"></div>
      <div class="summary-next-task">
        <div class="summary-next-label">المهمة التالية</div>
        <div>${nextTask.task}</div>
      </div>` : ''}
    </div>

    <div class="grid-3" style="margin-bottom:1.25rem">
      <div class="card">
        <div class="card-title"><span class="card-title-icon">📍</span> الأسبوع</div>
        <div class="stat-num">${wn}<span style="font-size:1rem;color:var(--muted)">/52</span></div>
        <div class="stat-sub">المرحلة ${wk ? wk.phase : 1}</div>
      </div>
      <div class="card">
        <div class="card-title"><span class="card-title-icon">🔥</span> Streak</div>
        <div class="stat-num" style="color:${streak>=7?'var(--yellow)':streak>=3?'var(--orange)':'var(--accent2)'}">${streak}</div>
        <div class="stat-sub">يوم متتالي — دنتال + تمرين</div>
      </div>
      <div class="card">
        <div class="card-title"><span class="card-title-icon">🏁</span> Rooms</div>
        <div class="stat-num" style="color:var(--cyan)">${roomsCount.done}</div>
        <div class="stat-sub">${roomsCount.inprogress} جاري · ${roomsCount.pending} لم تبدأ</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:1.25rem">
      <div class="card">
        <div class="card-title"><span class="card-title-icon">✅</span> الروتين اليومي</div>
  `;

  ['teeth', 'exercise'].forEach(type => {
    const done = routine[type];
    const emoji = type === 'teeth' ? '🪥' : '💪';
    const label = type === 'teeth' ? 'تفريش الأسنان' : 'تمرين يومي';
    html += `<div class="routine-item" onclick="toggleRoutine('${type}')">
      <span class="routine-emoji">${emoji}</span>
      <span class="routine-text">${label}</span>
      <div class="routine-check ${done ? 'done' : ''}"></div>
    </div>`;
  });

  html += `
      </div>

      <div class="card">
        <div class="card-title"><span class="card-title-icon">⏱</span> Focus / Pomodoro</div>
        <div class="focus-row" style="margin-bottom:0.5rem">
          <button class="mini-btn ok" onclick="startFocus('pomodoro25')">25 min</button>
          <button class="mini-btn warn" onclick="startFocus('pomodoro50')">50 min</button>
          <button class="mini-btn danger" onclick="stopFocus()">Stop</button>
          <div style="flex:1"></div>
          <div>
            <div class="focus-time" id="focus-time">${S.focus.running ? formatMMSS(getFocusRemainingMs()) : "00:00"}</div>
            <div class="focus-sub">${S.focus.running ? "جلسة تركيز نشطة" : "اختر مؤقت وابدأ"}</div>
          </div>
        </div>
        <div class="focus-bar"><div class="focus-fill" id="focus-fill"></div></div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:1.25rem">
      <div class="card">
        <div class="card-title"><span class="card-title-icon">🗂</span> خطة حسب وقتك</div>
        <div class="focus-row">
          <button class="mini-btn" onclick="renderPlan(30)">30 دقيقة</button>
          <button class="mini-btn" onclick="renderPlan(60)">ساعة</button>
          <button class="mini-btn" onclick="renderPlan(120)">ساعتان</button>
        </div>
        <div id="plan-box" class="section-help" style="border-top:none;padding-top:0.75rem"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="card-title-icon">🔔</span> تذكير يومي</div>
        <div class="focus-row">
          <button class="mini-btn ${S.notifications.enabled ? 'ok' : ''}" onclick="enableNotifications()">
            ${S.notifications.enabled ? '✓ مفعّل' : 'تفعيل'}
          </button>
          <input type="time" value="${S.notifications.time || '20:00'}"
            onchange="setNotifyTime(this.value)"
            style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:0.25rem 0.5rem;font-size:0.78rem;outline:none" />
        </div>
        <div class="section-help">لازم تترك الصفحة مفتوحة حتى يُرسَل التذكير.</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:1.25rem">
      <div class="card">
        <div class="card-title"><span class="card-title-icon">🎯</span> Bonus Room</div>
        <div class="bonus-room">
          <div class="bonus-icon">🔵</div>
          <div>
            <div class="bonus-label">Room of the Day</div>
            <div class="bonus-name">${escapeHTML(bonus)}</div>
            <a href="https://tryhackme.com/r/search?search=${encodeURIComponent(bonus)}" target="_blank" class="bonus-link">Open on THM ↗</a>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="card-title-icon">💡</span> نصيحة ذكية</div>
        ${renderSmartTipHTML(skills, overdue.length)}
      </div>
    </div>
  `;

  // Today's tasks
  html += `<div class="card" style="margin-bottom:1.25rem">
    <div class="card-title"><span class="card-title-icon">📋</span> مهام اليوم — ${dayName}</div>`;
  if (!todayDay) {
    html += dayName === 'الجمعة'
      ? `<div class="empty-state">🌿 يوم الراحة — استرح وأعد شحن طاقتك</div>`
      : `<div class="empty-state">لا توجد مهمة محددة لهذا اليوم.</div>`;
  } else {
    const key = `w${wn}_${todayDay.d}`;
    const done = S.tasks[key];
    html += `<div class="task-item ${done ? 'done' : ''}" onclick="toggleTask('${key}')">
      <div class="task-cb ${done ? 'done' : ''}"></div>
      <div class="task-text">${escapeHTML(todayDay.task)}</div>
      <div class="task-meta">
        <div class="task-badge badge-${todayDay.t}">${todayDay.t.toUpperCase()}</div>
        <div class="task-badge badge-today">TODAY</div>
      </div>
    </div>`;
  }
  html += `</div>`;

  // Overdue + Upcoming
  html += `<div class="grid-2" style="margin-bottom:1.25rem">
    <div class="card">
      <div class="card-title"><span class="card-title-icon">⚠️</span> متأخر (Overdue)</div>
      ${overdue.length
        ? overdue.map(t => renderTaskMini(t, "overdue")).join('')
        : `<div class="empty-state">لا يوجد متأخرات — أداء ممتاز!</div>`}
    </div>
    <div class="card">
      <div class="card-title"><span class="card-title-icon">🔜</span> القادم (Upcoming)</div>
      ${upcoming.length
        ? upcoming.map(t => renderTaskMini(t, "upcoming")).join('')
        : `<div class="empty-state">لا توجد مهام قادمة خلال ٧ أيام.</div>`}
    </div>
  </div>`;

  // All week tasks
  html += `<div class="card" style="margin-bottom:1.25rem">
    <div class="card-title"><span class="card-title-icon">📅</span> مهام الأسبوع ${wn}</div>
    <div class="week-prog-bar"><div class="week-prog-fill" style="width:${weekProgress}%"></div></div>
    <div class="week-prog-text"><span>التقدم</span><span>${weekProgress}%</span></div>
    <div style="margin-top:1rem">`;

  if (wk) {
    (wk.days || []).forEach(d => {
      if (d.d === 'الجمعة') return;
      const key = `w${wn}_${d.d}`;
      const done = S.tasks[key];
      html += `<div class="task-item ${done ? 'done' : ''}" onclick="toggleTask('${key}')">
        <div class="task-cb ${done ? 'done' : ''}"></div>
        <div style="min-width:58px;font-size:0.7rem;color:var(--muted);padding-top:2px;font-weight:500">${d.d}</div>
        <div class="task-text">${escapeHTML(d.task)}</div>
        <div class="task-meta"><div class="task-badge badge-${d.t}">${d.t.toUpperCase()}</div></div>
      </div>`;
    });
  }
  html += `</div></div>`;

  // Week notes
  const noteVal = escapeHTML(S.notes[`w${wn}`] || '');
  const rating = S.ratings[`w${wn}`] || '';
  html += `<div class="card">
    <div class="card-title"><span class="card-title-icon">📝</span> ملاحظات الأسبوع ${wn}</div>
    <textarea class="week-notes" placeholder="اكتب ملاحظاتك هنا..." onchange="saveNote(${wn},this.value)">${noteVal}</textarea>
    <div class="rating-row">
      <button class="rating-btn ${rating==='all'?'active-all':''}" onclick="setRating(${wn},'all')">✅ أنجزت الكل</button>
      <button class="rating-btn ${rating==='most'?'active-most':''}" onclick="setRating(${wn},'most')">🟡 معظم المهام</button>
      <button class="rating-btn ${rating==='delayed'?'active-delayed':''}" onclick="setRating(${wn},'delayed')">🔴 تأخيرات</button>
    </div>
  </div>`;

  document.getElementById('v-today').innerHTML = html;
  updateFocusUI();
}

function renderSmartTipHTML(skills, overdueCount) {
  const sorted = SKILLS_DEF
    .map(sk => ({ ...sk, pct: skills[sk.id] || 0 }))
    .filter(sk => sk.rooms.length > 0)
    .sort((a, b) => a.pct - b.pct);
  const weakest = sorted[0];
  const msgs = [];
  if (overdueCount >= 3) {
    msgs.push("عندك متأخرات كثيرة: اليوم ركّز على مهمة واحدة فقط وخفّف الباقي.");
  } else {
    msgs.push("الوضع ممتاز — كمل خطوة ثابتة اليوم.");
  }
  if (weakest) {
    msgs.push(`أضعف مهارة: ${weakest.icon} ${weakest.ar} (${weakest.pct}%) — خذ منها 20 دقيقة هذا الأسبوع.`);
  }
  msgs.push("قاعدة ذهبية: اكتب ملاحظاتك بكلماتك أنت، لا تنسخ.");
  return `<div style="font-family:'Cairo',sans-serif;line-height:1.9;color:var(--text2)">
    <ul style="margin-inline-start:1.2rem">
      ${msgs.map(x => `<li style="margin-bottom:0.35rem">${x}</li>`).join('')}
    </ul>
  </div>`;
}

function renderTaskMini(t, kind) {
  const dateStr = t.date.toLocaleDateString('en-CA');
  const badge = kind === "overdue" ? "badge-overdue" : "badge-upcoming";
  const badgeText = kind === "overdue" ? "OVERDUE" : "UPCOMING";
  const done = !!S.tasks[t.key];
  return `<div class="task-item ${done ? 'done' : ''}" onclick="toggleTask('${escapeJS(t.key)}')">
    <div class="task-cb ${done ? 'done' : ''}"></div>
    <div class="task-text">
      <div style="font-size:0.82rem">${escapeHTML(t.task)}</div>
      <div style="font-size:0.68rem;color:var(--muted);margin-top:0.1rem;direction:ltr">${dateStr} · W${t.weekNum} · ${t.dayName}</div>
    </div>
    <div class="task-meta">
      <div class="task-badge badge-${t.type}">${String(t.type || '').toUpperCase()}</div>
      <div class="task-badge ${badge}">${badgeText}</div>
    </div>
  </div>`;
}

function renderPlan(minutes) {
  const box = document.getElementById("plan-box");
  if (!box) return;
  const tips = getPlan(minutes);
  box.innerHTML = `<div style="color:var(--text2);font-family:'Cairo',sans-serif;line-height:1.9">
    <div style="margin-bottom:0.35rem;color:var(--text);font-weight:600">خطة ${minutes} دقيقة:</div>
    <ol style="margin-inline-start:1.2rem">${tips.map(t => `<li style="margin-bottom:0.35rem">${t}</li>`).join('')}</ol>
  </div>`;
}

// ===== ROADMAP VIEW =====
function switchPhase(p) {
  S.phase = p;
  save('xenos_phase', p);
  document.querySelectorAll('.pt').forEach(el => {
    el.className = 'pt' + (parseInt(el.dataset.p) === p ? ' p' + p + 'a' : '');
  });
  renderWeeksGrid();
}

function renderRoadmap() {
  const wn = getCurrentWeek();
  let html = `
    <div class="topbar">
      <div class="topbar-title">الخارطة <span>/ 52-Week Roadmap</span></div>
    </div>
    <div class="roadmap-search-row">
      <input class="search-input" placeholder="ابحث عن أسبوع أو موضوع..." id="roadmap-search-input"
        value="${escapeHTML(S.roadmapSearch)}"
        oninput="S.roadmapSearch=this.value;renderWeeksGrid()" />
    </div>
    <div class="phase-tabs">
      <div class="pt ${S.phase===1?'p1a':''}" data-p="1" onclick="switchPhase(1)">المرحلة الأولى — الأساس (W1–13)</div>
      <div class="pt ${S.phase===2?'p2a':''}" data-p="2" onclick="switchPhase(2)">المرحلة الثانية — تخصص (W14–26)</div>
      <div class="pt ${S.phase===3?'p3a':''}" data-p="3" onclick="switchPhase(3)">المرحلة الثالثة — احتراف (W27–52)</div>
    </div>
    <div class="weeks-grid" id="weeks-grid"></div>`;
  document.getElementById('v-roadmap').innerHTML = html;
  renderWeeksGrid();

  setTimeout(() => {
    const el = document.getElementById(`rwk${wn}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function renderWeeksGrid() {
  const wn = getCurrentWeek();
  const weeks = window.WEEKS_DATA || [];
  const q = (S.roadmapSearch || '').toLowerCase().trim();

  let filtered = weeks.filter(w => w.phase === S.phase);
  if (q) {
    filtered = filtered.filter(w =>
      String(w.num).includes(q) ||
      (w.topic || '').toLowerCase().includes(q) ||
      (w.dates || '').toLowerCase().includes(q) ||
      (w.days || []).some(d => (d.task || '').toLowerCase().includes(q))
    );
  }

  const grid = document.getElementById('weeks-grid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">لا توجد نتائج مطابقة للبحث.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(w => {
    const prog = getWeekProgress(w.num);
    const isCur = w.num === wn;
    const isOpen = isCur;
    const daysHtml = (w.days || []).filter(d => d.d !== 'الجمعة').map(d => {
      const key = `w${w.num}_${d.d}`;
      const done = S.tasks[key];
      return `<div class="dr ${done ? 'done' : ''}" onclick="toggleTask('${key}');event.stopPropagation()">
        <div class="dname">${d.d}</div>
        <div class="task-badge badge-${d.t}" style="margin-top:1px;flex-shrink:0">${String(d.t || '').toUpperCase()}</div>
        <div class="dr-task">${escapeHTML(d.task)}</div>
        <div class="task-cb ${done ? 'done' : ''}" style="flex-shrink:0;margin-top:2px"></div>
      </div>`;
    }).join('');

    return `<div class="wc p${w.phase} ${isCur ? 'cur' : ''} ${isOpen ? 'open' : ''}" id="rwk${w.num}">
      ${isCur ? '<div class="cur-banner">▶ الأسبوع الحالي</div>' : ''}
      <div class="wh" onclick="toggleWeek(${w.num})">
        <div class="wnum">W${String(w.num).padStart(2,'0')}</div>
        <div class="wi">
          <div class="wtopic">${escapeHTML(w.topic)}</div>
          <div class="wdates">${escapeHTML(w.dates)}</div>
          <div class="wprog"><div class="wprogf" style="width:${prog}%"></div></div>
        </div>
        <div style="font-size:0.68rem;color:var(--muted);padding-inline-start:0.5rem;flex-shrink:0">${prog}%</div>
        <div class="wtog">▾</div>
      </div>
      <div class="wdays">${daysHtml}</div>
    </div>`;
  }).join('');
}

function toggleWeek(n) {
  const el = document.getElementById(`rwk${n}`);
  if (el) el.classList.toggle('open');
}

// ===== SKILLS VIEW =====
function renderSkills() {
  const skills = calcSkills();
  const roomsCount = countRooms();
  let html = `<div class="topbar">
    <div class="topbar-title">المهارات <span>/ Skill Matrix</span></div>
    <div class="topbar-right">
      <span class="pill">🏁 ${roomsCount.done} rooms done · ${roomsCount.inprogress} in progress</span>
    </div>
  </div>
  <div class="card">
    <div class="card-title"><span class="card-title-icon">📊</span> تقدم المهارات — محسوب من Rooms المنجزة</div>`;

  SKILLS_DEF.forEach(sk => {
    const pct = skills[sk.id] || 0;
    const doneRooms = sk.rooms.filter(r => getRoomState(r) === "done");
    html += `<div class="skill-row">
      <div class="skill-header">
        <div class="skill-name"><span class="skill-icon">${sk.icon}</span>${sk.ar}</div>
        <div class="skill-pct" style="color:${sk.color}">${pct}%</div>
      </div>
      <div class="skill-bar"><div class="skill-fill" style="width:${pct}%;background:linear-gradient(90deg,${sk.color},${sk.color}88)"></div></div>
      <div class="skill-meta">
        <span>${doneRooms.length}/${sk.rooms.length} rooms</span>
        <span>${pct < 30 ? '🔴 مبتدئ' : pct < 60 ? '🟡 متوسط' : pct < 80 ? '🟢 جيد' : '💚 متقدم'}</span>
      </div>
      ${doneRooms.length ? `<div class="skill-rooms">${doneRooms.slice(0,5).join(' · ')}${doneRooms.length > 5 ? ` +${doneRooms.length-5} more` : ''}</div>` : ''}
    </div>`;
  });

  html += `</div>`;
  document.getElementById('v-skills').innerHTML = html;
}

// ===== ROOMS VIEW =====
function renderRooms() {
  const catalog = getRoomsCatalogList();
  const stats = countRooms();

  const filtered = catalog.filter(r => {
    const st = getRoomState(r);
    const matchSearch = S.roomSearch === '' || r.toLowerCase().includes(S.roomSearch.toLowerCase());
    if (S.roomFilter === 'done') return st === "done" && matchSearch;
    if (S.roomFilter === 'inprogress') return st === "inprogress" && matchSearch;
    if (S.roomFilter === 'pending') return st === "pending" && matchSearch;
    return matchSearch;
  });

  let html = `
    <div class="topbar">
      <div class="topbar-title">الرومات <span>/ Room Tracker</span></div>
    </div>
    <div class="rooms-stats">
      <div class="rooms-stat"><div class="rooms-stat-n">${stats.done}</div><div class="rooms-stat-l">Done</div></div>
      <div class="rooms-stat"><div class="rooms-stat-n" style="color:var(--yellow)">${stats.inprogress}</div><div class="rooms-stat-l">In Progress</div></div>
      <div class="rooms-stat"><div class="rooms-stat-n" style="color:var(--cyan)">${stats.pending}</div><div class="rooms-stat-l">Pending</div></div>
      <div class="rooms-stat"><div class="rooms-stat-n" style="color:var(--text2)">${stats.total}</div><div class="rooms-stat-l">Total</div></div>
    </div>
    <div class="add-room-row">
      <input class="add-room-input" id="newRoomInput" placeholder="أضف room جديدة للكتالوج..." onkeydown="if(event.key==='Enter')addRoom()" />
      <button class="btn-add" onclick="addRoom()">+ إضافة</button>
    </div>
    <div class="rooms-header">
      <input class="rooms-search" placeholder="بحث في الرومات..." oninput="S.roomSearch=this.value;renderRooms()" value="${escapeHTML(S.roomSearch)}" />
      <button class="mini-btn danger" onclick="resetRooms()">إعادة تعيين</button>
    </div>
    <div class="filter-row">
      <button class="filter-btn ${S.roomFilter==='all'?'active':''}" onclick="S.roomFilter='all';renderRooms()">الكل</button>
      <button class="filter-btn ${S.roomFilter==='pending'?'active':''}" onclick="S.roomFilter='pending';renderRooms()">لم تبدأ</button>
      <button class="filter-btn ${S.roomFilter==='inprogress'?'active':''}" onclick="S.roomFilter='inprogress';renderRooms()">جاري</button>
      <button class="filter-btn ${S.roomFilter==='done'?'active':''}" onclick="S.roomFilter='done';renderRooms()">منجز</button>
    </div>
    <div class="rooms-grid">`;

  filtered.forEach(r => {
    const st = getRoomState(r);
    const tags = SKILLS_DEF.filter(sk => sk.rooms.includes(r)).map(sk => sk.id);

    html += `<div class="room-item" data-state="${st}">
      <div class="room-dot"></div>
      <div style="flex:1;min-width:0">
        <div class="room-item-name">${escapeHTML(r)}</div>
        ${tags.length ? `<div class="room-tags">${tags.map(t => `<span class="room-tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
        <div class="room-actions">
          <button class="state-btn pd ${st==='pending'?'active':''}" onclick="event.stopPropagation();updateRoom('${escapeJS(r)}','pending')">pending</button>
          <button class="state-btn ip ${st==='inprogress'?'active':''}" onclick="event.stopPropagation();updateRoom('${escapeJS(r)}','inprogress')">in progress</button>
          <button class="state-btn ${st==='done'?'active':''}" onclick="event.stopPropagation();updateRoom('${escapeJS(r)}','done')">done</button>
          <a class="state-btn" style="text-decoration:none" target="_blank" href="https://tryhackme.com/r/search?search=${encodeURIComponent(r)}" onclick="event.stopPropagation()">open ↗</a>
        </div>
      </div>
    </div>`;
  });

  html += `</div>`;
  document.getElementById('v-rooms').innerHTML = html;
}

function updateRoom(name, st) {
  setRoomState(name, st);
  renderRooms();
}

// ===== ACTIONS =====
function toggleTask(key) {
  S.tasks[key] = !S.tasks[key];
  save('xenos_tasks', S.tasks);
  renderView(S.view);
}

function toggleRoutine(type) {
  const key = getTodayKey();
  if (!S.routine[key]) S.routine[key] = {};
  S.routine[key][type] = !S.routine[key][type];
  save('xenos_routine', S.routine);
  renderView(S.view);
}

function addRoom() {
  const inp = document.getElementById('newRoomInput');
  if (!inp) return;
  const name = inp.value.trim();
  if (!name) return;
  if (!S.extraRoomsCatalog.includes(name) && !PRELOADED_ROOMS.includes(name)) {
    S.extraRoomsCatalog.push(name);
    save('xenos_extra_catalog', S.extraRoomsCatalog);
  }
  inp.value = '';
  renderRooms();
}

function resetRooms() {
  if (!confirm("هل أنت متأكد؟ سيُعاد تعيين حالات الرومات فقط.")) return;
  S.roomsState = {};
  save('xenos_rooms_state', S.roomsState);
  renderRooms();
}

function saveNote(wn, text) {
  S.notes[`w${wn}`] = text;
  save('xenos_notes', S.notes);
}

function setRating(wn, r) {
  const k = `w${wn}`;
  S.ratings[k] = S.ratings[k] === r ? '' : r;
  save('xenos_ratings', S.ratings);
  renderView(S.view);
}

// ===== FOCUS TIMER UI =====
function updateFocusUI() {
  const t = document.getElementById("focus-time");
  const f = document.getElementById("focus-fill");
  if (!t || !f) return;
  if (!S.focus.running) {
    t.textContent = "00:00";
    f.style.width = "0%";
    return;
  }
  const rem = getFocusRemainingMs();
  t.textContent = formatMMSS(rem);
  const pct = Math.min(100, Math.max(0, (1 - rem / S.focus.durationMs) * 100));
  f.style.width = pct.toFixed(0) + "%";
}

// ===== MOBILE SIDEBAR TOGGLE =====
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ===== INIT =====
(function init() {
  // Check WEEKS_DATA before doing anything else
  if (!checkWeeksData()) return;

  loadState();

  // Check localStorage availability early
  checkLocalStorage();

  nav(S.view);

  // Update sidebar week badge
  const badge = document.getElementById('sb-week');
  if (badge) badge.textContent = 'W' + String(getCurrentWeek()).padStart(2, '0');

  // Focus timer tick + notifications tick
  setInterval(() => {
    maybeFireDailyNotification();
    if (S.focus.running) {
      const rem = getFocusRemainingMs();
      if (rem <= 0) {
        S.focus.running = false;
        save('xenos_focus', S.focus);
        try {
          new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=").play();
        } catch(e) {}
        if (S.view === 'today') renderToday();
      } else {
        updateFocusUI();
      }
    }
  }, 1000);
})();
