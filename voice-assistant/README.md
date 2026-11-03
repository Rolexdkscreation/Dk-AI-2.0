# DK AI Voice Assistant (Hinglish)

Android Chrome mein chalne wala voice assistant (PWA). Mic dabao, Hindi ya English mein bolo.

## Kaise chalayein
1. Is folder ko kisi static server par host karo (HTTPS zaroori hai mic ke liye), ya local mein:
   `cd voice-assistant && python3 -m http.server 8080`
2. Android Chrome mein kholo.
3. Menu > **"Home screen par add karo"** karo, app jaisa khulega.

## Commands (examples)
| Bolo | Kya hoga |
|---|---|
| "time kya hai" / "aaj ki date" | Time / date batayega |
| "google par Python search karo" | Google search |
| "youtube par gaane chalao" | YouTube search |
| "youtube kholo" / "instagram kholo" | Website khulegi |
| "Delhi tak raasta batao" | Google Maps directions |
| "call 9876543210" | Dialer khulega |
| "message 9876543210 bolo kal milte hain" | WhatsApp message draft |
| "timer 5 minute" | Timer lagega |
| "calculate 25 plus 17" | Calculation |
| "note: kal doctor" / "mere notes padho" | Notes save / padhna |
| "help" | Commands ki list |

## Limitations
- Browser ki wajah se phone ke contacts, alarm, apps ko direct control nahi kar sakta. Call/message ke liye dialer/WhatsApp khulta hai aur aap confirm karte ho.
- Koi bhi general sawal ke liye AI backend chahiye. `app.js` mein `AI_ENDPOINT` set karke apna API (OpenAI/Gemini/etc.) jod sakte ho. Abhi wo Google search par bhejta hai.
- Voice recognition Chrome/Edge par best chalta hai.

## Next steps
- AI backend (API key server-side rakhein, browser mein nahi)
- Wake word ("Hey DK") support
- Native Android app (Capacitor / Kotlin) jisse alarm, SMS, contacts control ho sake
