// DK AI Voice Assistant - Hinglish command router
// Works in Android Chrome / Edge (Web Speech API). Hindi + English both supported.

const $ = (id) => document.getElementById(id);
const logEl = $("log");
const statusEl = $("status");
const micBtn = $("mic");

// ---------- Speech output ----------
function speak(text, lang = "hi-IN") {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 1;
  speechSynthesis.speak(u);
}

function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = "msg " + who;
  d.textContent = text;
  logEl.appendChild(d);
  logEl.scrollTop = logEl.scrollHeight;
}

// ---------- Speech input ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;

if (SR) {
  recognition = new SR();
  recognition.lang = "hi-IN"; // Hindi recognizer also picks up English words in Hinglish
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => { listening = true; micBtn.classList.add("listening"); statusEl.textContent = "Sun raha hoon..."; };
  recognition.onend = () => { listening = false; micBtn.classList.remove("listening"); statusEl.textContent = ""; };
  recognition.onerror = (e) => { statusEl.textContent = "Error: " + e.error; };
  recognition.onresult = (e) => {
    const said = e.results[0][0].transcript;
    addMsg(said, "you");
    handle(said);
  };
} else {
  micBtn.disabled = true;
  statusEl.textContent = "Is browser mein voice support nahi hai. Chrome use karo.";
}

micBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (listening) recognition.stop();
  else recognition.start();
});

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const t = $("text").value.trim();
  if (!t) return;
  $("text").value = "";
  addMsg(t, "you");
  handle(t);
});

// ---------- Helpers ----------
const norm = (s) => s.toLowerCase().replace(/[?!.,]/g, "").replace(/\s+/g, " ").trim();

const SITES = {
  youtube: "https://www.youtube.com",
  google: "https://www.google.com",
  gmail: "https://mail.google.com",
  whatsapp: "https://web.whatsapp.com",
  maps: "https://www.google.com/maps",
  "google maps": "https://www.google.com/maps",
  instagram: "https://www.instagram.com",
  facebook: "https://www.facebook.com",
  twitter: "https://twitter.com",
  x: "https://x.com",
  amazon: "https://www.amazon.in",
  flipkart: "https://www.flipkart.com",
  wikipedia: "https://hi.wikipedia.org",
  news: "https://news.google.com",
  "news": "https://news.google.com",
};

const openUrl = (url) => window.open(url, "_blank", "noopener");

function reply(text, lang = "hi-IN") {
  addMsg(text, "ai");
  speak(text, lang);
}

// ---------- Command router ----------
const notesKey = "dkai_notes";
const getNotes = () => JSON.parse(localStorage.getItem(notesKey) || "[]");
const setNotes = (n) => localStorage.setItem(notesKey, JSON.stringify(n));

function safeCalc(expr) {
  // Only digits and basic operators allowed
  const e = expr
    .replace(/into|guna|x|×/g, "*")
    .replace(/bhag|by|divided by|\//g, "/")
    .replace(/plus|jodo|\+|mein jodo/g, "+")
    .replace(/minus|ghatao|-/g, "-")
    .replace(/[^0-9+\-*/(). ]/g, "")
    .trim();
  if (!e || !/\d/.test(e)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const r = Function('"use strict"; return (' + e + ")")();
    return Number.isFinite(r) ? r : null;
  } catch { return null; }
}

function handle(raw) {
  const t = norm(raw);
  let m;

  // Stop / help
  if (/^(ruko|stop|chup|band karo|bas)$/.test(t)) {
    speechSynthesis.cancel();
    return reply("Theek hai, ruk gaya.");
  }
  if (/(help|madad|kya kar sakte ho|kya kar sakti ho|commands)/.test(t)) {
    return reply(
      "Main ye kar sakta hoon:\n" +
      "- time / date batana\n" +
      "- 'google par X search karo'\n" +
      "- 'youtube par X chalao'\n" +
      "- 'X kholo' (website/app)\n" +
      "- 'X tak raasta batao' (Google Maps)\n" +
      "- 'Call 9876543210' / 'Message 9876543210 bolo ...'\n" +
      "- 'timer 5 minute'\n" +
      "- 'calculate 25 plus 17'\n" +
      "- 'note: kuch likhna' / 'mere notes padho'\n" +
      "- Koi bhi sawal: 'X kya hai'"
    );
  }

  // Time & date
  if (/(time|samay|waqt|baje)/.test(t) && !/timer/.test(t)) {
    return reply("Abhi " + new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }) + " baje hain.");
  }
  if (/(date|tarikh|aaj kya hai|din kya)/.test(t)) {
    return reply("Aaj " + new Date().toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " hai.");
  }

  // Calculator
  if (/(calculate|calc|hisab|kitne hote|kitna hota)/.test(t) || /\d\s*(plus|minus|into|guna|bhag|\+|-|\*|x|\/)\s*\d/.test(t)) {
    const r = safeCalc(t.replace(/^(calculate|calc|hisab karo|kitne hote hain|kitna hota hai)/, ""));
    if (r !== null) return reply("Jawab hai " + r + ".");
  }

  // Timer
  if ((m = t.match(/timer (\d+)\s*(second|sec|minute|min|ghanta|hour)/))) {
    const n = +m[1];
    const isSec = /sec/.test(m[2]);
    const isHour = /ghanta|hour/.test(m[2]);
    const ms = (isSec ? n : isHour ? n * 3600 : n * 60) * 1000;
    setTimeout(() => reply("Timer khatam ho gaya!"), ms);
    return reply(`Theek hai, ${n} ${m[2]} ka timer laga diya.`);
  }

  // Notes
  if ((m = raw.match(/^(note|note karo|likh lo|yaad rakho)[:\s]+(.+)/i))) {
    const notes = getNotes();
    notes.push({ text: m[2], at: new Date().toISOString() });
    setNotes(notes);
    return reply("Note save ho gaya.");
  }
  if (/(mere notes|notes padho|notes batao)/.test(t)) {
    const notes = getNotes();
    if (!notes.length) return reply("Abhi koi note nahi hai.");
    return reply("Aapke notes:\n" + notes.map((n, i) => `${i + 1}. ${n.text}`).join("\n"));
  }

  // Calls & messages (opens dialer / WhatsApp, user confirms)
  if ((m = t.match(/(?:call|phone|phone karo|call karo)\s*([+\d][\d\s-]{5,})/))) {
    const num = m[1].replace(/[\s-]/g, "");
    reply("Call kar raha hoon " + num);
    return (location.href = "tel:" + num);
  }
  if ((m = raw.match(/(?:message|msg|whatsapp)\s*([+\d][\d\s-]{5,})\s*(?:bolo|karo|likho|ko)?\s*[:\-]?\s*(.+)/i))) {
    const num = m[1].replace(/[^\d]/g, "");
    const text = encodeURIComponent(m[2]);
    reply("WhatsApp message khol raha hoon.");
    return openUrl(`https://wa.me/${num}?text=${text}`);
  }

  // Navigation
  if ((m = t.match(/(.+?) (?:tak|ka) (?:raasta|rasta|route)(?: batao| bata do)?$/) || t.match(/^(?:navigate to|raasta batao) (.+)/))) {
    const dest = m[1].replace(/^(?:navigate to|raasta batao)/, "").trim();
    reply("Google Maps par " + dest + " ka raasta khol raha hoon.");
    return openUrl("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(dest));
  }

  // Play music / video
  if ((m = t.match(/^(.+?) (?:chalao|play karo|bajao|play)$/) || t.match(/^(?:play) (.+)/))) {
    const q = m[1].trim();
    reply(q + " YouTube par chala raha hoon.");
    return openUrl("https://www.youtube.com/results?search_query=" + encodeURIComponent(q));
  }

  // Search
  if ((m = t.match(/^(?:google|search|khojo|dhundo)(?: par| pe| mein)? (.+?)(?: search karo| khojo| dhundo)?$/) || t.match(/^(.+?) (?:search karo|khojo|dhundo|search)$/))) {
    const q = m[1].trim();
    reply(q + " Google par search kar raha hoon.");
    return openUrl("https://www.google.com/search?q=" + encodeURIComponent(q));
  }

  // Open site / app
  if ((m = t.match(/^(?:open|kholo|khol do|khol)\s+(.+)/) || t.match(/^(.+?) (?:kholo|khol do|open karo|open)$/))) {
    const name = m[1].trim();
    if (SITES[name]) {
      reply(name + " khol raha hoon.");
      return openUrl(SITES[name]);
    }
    if (/\.(com|in|org|net)/.test(name)) {
      reply(name + " khol raha hoon.");
      return openUrl("https://" + name.replace(/^https?:\/\//, ""));
    }
    reply(name + " Google par khoj raha hoon.");
    return openUrl("https://www.google.com/search?q=" + encodeURIComponent(name));
  }

  // Fallback: general question
  if ((m = t.match(/^(.+?) (?:kya hai|kya he|kaun hai|kaun hain|kab|kyu|kaise|meaning)/) || t.match(/^(?:what is|who is|how|why|when) (.+)/))) {
    return askAI(raw);
  }

  return askAI(raw);
}

// ---------- AI fallback ----------
// Koi bhi sawal / kaam jo upar match na ho. Yahan apna AI API endpoint lagaya ja sakta hai.
// Jab tak endpoint set nahi hai, Google search par bhej deta hai.
const AI_ENDPOINT = null; // e.g. "/api/chat" (apna backend URL)

async function askAI(text) {
  if (!AI_ENDPOINT) {
    reply("Ye kaam mere basic commands mein nahi hai. Google par khoj raha hoon.");
    return openUrl("https://www.google.com/search?q=" + encodeURIComponent(text));
  }
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    reply(data.reply || "Jawab nahi mila.");
  } catch {
    reply("AI server se connect nahi ho paya.");
  }
}

// Greeting
addMsg("Namaste! Main DK AI hoon. 'help' bolo to dekho main kya kar sakta hoon.", "ai");
