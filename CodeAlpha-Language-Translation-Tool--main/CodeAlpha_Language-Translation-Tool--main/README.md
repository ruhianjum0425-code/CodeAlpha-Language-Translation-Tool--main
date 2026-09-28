# Lexicon — Text Translator
**Author Name:Pathan RuhiAnjum**
A small web app built to fulfil the AI internship task: enter text, pick a
source and target language, send it to a translation API, and see (and
hear, and copy) the result.

## What's inside

```
translator-app/
├── index.html   — page structure (language pickers, text panes, buttons)
├── style.css    — visual design
├── script.js    — API calls, copy button, text-to-speech
└── README.md    — this file
```

No build step, no dependencies to install — it's plain HTML/CSS/JS.

## How to run it

Just open `index.html` in a browser. Double-click the file, or, for the
most reliable experience (some browsers restrict fetch() from `file://`
pages), serve it locally:

```bash
cd translator-app
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## How it works

1. Type or paste text into the left pane.
2. Choose the source language (or leave it on "Detect language") and the
   target language.
3. Click **Translate** (or press `Ctrl/Cmd + Enter`).
4. The translated text appears in the right pane.
5. Use **Copy** to copy the result, or **Listen** on either pane to have
   it read aloud using your browser's built-in text-to-speech.

## Translation API

By default the app calls the **MyMemory Translation API**
(`api.mymemory.translated.net`), which is free, requires no API key, and
allows direct calls from browser JavaScript (CORS-enabled) — ideal for a
learning project. Its free tier has a modest daily word limit, which is
fine for demos and testing.

### Upgrading to Google Cloud Translation or Microsoft Translator

`script.js` already contains ready-to-use, commented-out functions for
both:

- `translateWithGoogle()` — Google Cloud Translation API v2
- `translateWithMicrosoft()` — Microsoft Translator (Azure Cognitive
  Services)

To switch:

1. Get an API key:
   - Google: enable the "Cloud Translation API" in Google Cloud Console
     and create an API key.
   - Microsoft: create a "Translator" resource in Azure and note the key
     and region.
2. In `script.js`, uncomment the relevant function and paste in your key
   (and region, for Microsoft).
3. Change the line near the top of `script.js`:
   ```js
   const ACTIVE_PROVIDER = "google"; // or "microsoft"
   ```

**Security note:** calling Google or Microsoft's APIs directly from
client-side JavaScript exposes your API key to anyone who views the page
source. That's fine for a local class project, but for anything you plan
to deploy publicly, add a small backend (e.g. a Node/Express or Flask
endpoint) that holds the API key and forwards translation requests, and
call that endpoint from `script.js` instead.

## Notes on the design

Language selection is framed as two facing "pages" (source / target),
echoing a dictionary spread, with a swap control in between. Colors and
type were chosen deliberately for this brief rather than left as
defaults — see the CSS custom properties at the top of `style.css` if you
want to reskin it.

## Possible extensions

- Auto-detect and display the detected source language after translation
- Translation history / recently used language pairs
- File upload (.txt) for longer documents
- Debounced "translate as you type" mode
