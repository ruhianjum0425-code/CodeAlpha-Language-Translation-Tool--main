/* =========================================================================
   Lexicon — Text Translator
   -------------------------------------------------------------------------
   Default translation backend: MyMemory Translation API
   (https://mymemory.translated.net) — free, no API key required, fine for
   a class/internship project. It is CORS-enabled so it can be called
   straight from the browser.

   Swapping in Google Cloud Translation or Microsoft Translator:
   see the translateWithGoogle() / translateWithMicrosoft() stubs near the
   bottom of this file, and flip ACTIVE_PROVIDER below once you have a key.
   ========================================================================= */

const ACTIVE_PROVIDER = "mymemory"; // "mymemory" | "google" | "microsoft"

// A practical subset of languages. Codes follow ISO 639-1.
const LANGUAGES = [
  ["en", "English"], ["es", "Spanish"], ["fr", "French"], ["de", "German"],
  ["it", "Italian"], ["pt", "Portuguese"], ["nl", "Dutch"], ["ru", "Russian"],
  ["pl", "Polish"], ["tr", "Turkish"], ["ar", "Arabic"], ["he", "Hebrew"],
  ["hi", "Hindi"], ["bn", "Bengali"], ["ta", "Tamil"], ["te", "Telugu"],
  ["mr", "Marathi"], ["gu", "Gujarati"], ["ur", "Urdu"], ["zh", "Chinese"],
  ["ja", "Japanese"], ["ko", "Korean"], ["vi", "Vietnamese"], ["th", "Thai"],
  ["id", "Indonesian"], ["ms", "Malay"], ["sw", "Swahili"], ["el", "Greek"],
  ["sv", "Swedish"], ["fi", "Finnish"], ["da", "Danish"], ["no", "Norwegian"],
  ["cs", "Czech"], ["ro", "Romanian"], ["hu", "Hungarian"], ["uk", "Ukrainian"],
];

const sourceLangEl = document.getElementById("source-lang");
const targetLangEl = document.getElementById("target-lang");
const sourceTextEl = document.getElementById("source-text");
const targetTextEl = document.getElementById("target-text");
const translateBtn = document.getElementById("translate-btn");
const swapBtn = document.getElementById("swap-btn");
const clearBtn = document.getElementById("clear-btn");
const copyBtn = document.getElementById("copy-btn");
const listenSourceBtn = document.getElementById("listen-source-btn");
const listenTargetBtn = document.getElementById("listen-target-btn");
const statusEl = document.getElementById("status-text");
const charCountEl = document.getElementById("source-count");
const toastEl = document.getElementById("toast");

// ---------- Populate language dropdowns ----------
function fillLanguages() {
  for (const [code, name] of LANGUAGES) {
    sourceLangEl.insertAdjacentHTML("beforeend", `<option value="${code}">${name}</option>`);
    targetLangEl.insertAdjacentHTML("beforeend", `<option value="${code}">${name}</option>`);
  }
  sourceLangEl.value = "auto";
  targetLangEl.value = "es";
}
fillLanguages();

// ---------- Character counter ----------
sourceTextEl.addEventListener("input", () => {
  charCountEl.textContent = `${sourceTextEl.value.length} / 2000`;
});

// ---------- Toast helper ----------
let toastTimer;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// ---------- Status helper ----------
function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = "status" + (kind ? " " + kind : "");
}

// =============================== Providers ===============================

// Default: MyMemory (no key needed)
async function translateWithMyMemory(text, sourceLang, targetLang) {
  const langpair = `${sourceLang === "auto" ? "en" : sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Network error (${res.status})`);
  const data = await res.json();
  if (!data || !data.responseData) throw new Error("Unexpected response from translation service");
  if (data.responseStatus && Number(data.responseStatus) >= 400) {
    throw new Error(data.responseDetails || "Translation service returned an error");
  }
  return data.responseData.translatedText;
}

/* ---------------------------------------------------------------------
   Google Cloud Translation API v2 (needs an API key with billing enabled)
   Uncomment and set ACTIVE_PROVIDER = "google" to use this instead.
   Note: calling Google's API directly from client-side JS exposes your
   key — in a real deployment, proxy this call through your own backend.
----------------------------------------------------------------------
async function translateWithGoogle(text, sourceLang, targetLang) {
  const API_KEY = "YOUR_GOOGLE_API_KEY";
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: sourceLang === "auto" ? undefined : sourceLang,
      target: targetLang,
      format: "text",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Google Translate error");
  return data.data.translations[0].translatedText;
}
---------------------------------------------------------------------- */

/* ---------------------------------------------------------------------
   Microsoft Translator (Azure Cognitive Services) — needs a key + region.
   Uncomment and set ACTIVE_PROVIDER = "microsoft" to use this instead.
----------------------------------------------------------------------
async function translateWithMicrosoft(text, sourceLang, targetLang) {
  const API_KEY = "YOUR_AZURE_TRANSLATOR_KEY";
  const REGION = "YOUR_AZURE_REGION";
  const base = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
  const params = `&to=${targetLang}` + (sourceLang !== "auto" ? `&from=${sourceLang}` : "");
  const res = await fetch(base + params, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": API_KEY,
      "Ocp-Apim-Subscription-Region": REGION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ text }]),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Microsoft Translator error");
  return data[0].translations[0].text;
}
---------------------------------------------------------------------- */

async function translate(text, sourceLang, targetLang) {
  switch (ACTIVE_PROVIDER) {
    case "mymemory":
      return translateWithMyMemory(text, sourceLang, targetLang);
    // case "google": return translateWithGoogle(text, sourceLang, targetLang);
    // case "microsoft": return translateWithMicrosoft(text, sourceLang, targetLang);
    default:
      throw new Error("No translation provider configured");
  }
}

// =============================== Actions ==================================

async function runTranslation() {
  const text = sourceTextEl.value.trim();
  if (!text) {
    setStatus("Type something first", "error");
    sourceTextEl.focus();
    return;
  }

  const sourceLang = sourceLangEl.value;
  const targetLang = targetLangEl.value;

  translateBtn.disabled = true;
  translateBtn.textContent = "Translating…";
  setStatus("Translating…", "working");

  try {
    const translated = await translate(text, sourceLang, targetLang);
    targetTextEl.textContent = translated;
    setStatus("Done");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Translation failed", "error");
    showToast("Couldn't translate that — please try again");
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate";
  }
}

translateBtn.addEventListener("click", runTranslation);

sourceTextEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    runTranslation();
  }
});

clearBtn.addEventListener("click", () => {
  sourceTextEl.value = "";
  targetTextEl.textContent = "";
  charCountEl.textContent = "0 / 2000";
  setStatus("");
  sourceTextEl.focus();
});

swapBtn.addEventListener("click", () => {
  if (sourceLangEl.value === "auto") {
    showToast("Pick a specific source language first");
    return;
  }
  const sTemp = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = sTemp;

  const tTemp = sourceTextEl.value;
  sourceTextEl.value = targetTextEl.textContent;
  targetTextEl.textContent = tTemp;
  charCountEl.textContent = `${sourceTextEl.value.length} / 2000`;
});

// ---------- Copy ----------
copyBtn.addEventListener("click", async () => {
  const text = targetTextEl.textContent;
  if (!text) {
    showToast("Nothing to copy yet");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  } catch {
    // Fallback for browsers without Clipboard API access
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Copied to clipboard");
  }
});

// ---------- Text-to-speech (Web Speech API, built into the browser) ----------
function speak(text, lang, button) {
  if (!text) {
    showToast("Nothing to read yet");
    return;
  }
  if (!("speechSynthesis" in window)) {
    showToast("Text-to-speech isn't supported in this browser");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (lang && lang !== "auto") utterance.lang = lang;
  button.classList.add("speaking");
  utterance.onend = () => button.classList.remove("speaking");
  utterance.onerror = () => button.classList.remove("speaking");
  window.speechSynthesis.speak(utterance);
}

listenSourceBtn.addEventListener("click", () => {
  speak(sourceTextEl.value.trim(), sourceLangEl.value, listenSourceBtn);
});
listenTargetBtn.addEventListener("click", () => {
  speak(targetTextEl.textContent.trim(), targetLangEl.value, listenTargetBtn);
});
