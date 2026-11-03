# DK AI Voice Assistant (Hinglish) - Android App

Capacitor se bana Android app. Web version (PWA) bhi `www/` se chalta hai.

## Structure
- `www/` : app ka web code (index.html, app.js, manifest, icon)
- `capacitor.config.json` : app id `com.dkai.voiceassistant`, name "DK AI"
- `android/` : native Android project (Android Studio se open karo)

## APK kaise banayein (Android Studio)
1. Android Studio install karo (https://developer.android.com/studio).
2. Terminal mein:
   ```
   cd voice-assistant
   npm install
   npx cap sync android
   npx cap open android
   ```
3. Android Studio mein Gradle sync hone do.
4. **Build > Build Bundle(s) / APK(s) > Build APK(s)** chuno.
5. APK `android/app/build/outputs/apk/debug/app-debug.apk` mein milega. Phone par install karo.

Pehli baar app kholne par Mic permission maangi jayegi, allow karo.

## Web par chalana (PWA)
`www/` folder ko HTTPS par host karo (mic ke liye zaroori), phir Android Chrome mein "Home screen par add" karo.

## Commands (examples)
| Bolo | Kya hoga |
|---|---|
| "time kya hai" / "aaj ki date" | Time / date batayega |
| "google par Python search karo" | Google search |
| "youtube par gaane chalao" | YouTube search |
| "instagram kholo" | Website khulegi |
| "Delhi tak raasta batao" | Google Maps directions |
| "call 9876543210" | Dialer khulega |
| "message 9876543210 bolo kal milte hain" | WhatsApp message draft |
| "timer 5 minute" | Timer lagega |
| "calculate 25 plus 17" | Calculation |
| "note: kal doctor" / "mere notes padho" | Notes save / padhna |
| "help" | Commands ki list |

## Limitations
- Phone ke alarm, SMS, contacts ka direct control abhi nahi hai (Android ke extra native code se possible hai).
- General sawal / "kuch bhi" ke liye AI backend chahiye. `www/app.js` mein `AI_ENDPOINT` set karo (API key server par rakho).
- Speech recognition Android par Google speech service use karta hai (internet chahiye).
