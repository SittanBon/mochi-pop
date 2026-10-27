# Mochi Pop 🍡

A stress-relief tapping app with a mochi pet that grows up with you.
Pop the mochi, feel your phone buzz, and look after your own little mochi: feed it, walk it, and collect silly new looks.

Built with [Expo](https://expo.dev) (React Native), so it runs on both iPhone and Android.

**▶️ [Play it in your browser](https://sittanbon.github.io/mochi-pop/)** — no install needed. The browser version is a preview: vibration works only on Android, and walks use the 30-second stroll. For the full experience, run the app on your phone (below).

## Features

- **Pop the mochi.** Every tap squishes it with a sound and a real haptic buzz. Fast taps build combos, and ×50 triggers Rage mode. Multi-finger tapping works.
- **Name your mochi.** You name it the first time you open the app, and can rename it any time (tap ✏️).
- **It grows up.** Baby 🌱 → Kid 🌿 → Teen 🌸 → Adult 🍡 → Grand 👑, earning XP from popping, feeding, walking and petting.
- **Auras.** Six tiers based on total pops, from Soft Glow 💗 to Cosmic 🪐. They shine brightest on days you pop a lot.
- **Candy 🍬.** Earned from popping, candy chests at pop milestones, walks and petting.
- **Pet care.** Meals and energy drinks, real walks using the phone's step counter, 30-second strolls, baths, sleep and medicine.
- **Mochi shop.** 31 characters to buy with candy, including Mafia Mochi, Ghost Mochi, Durian Mochi and Mochi Tower.
- **Live leaderboard.** Works once you connect a free Firebase project (see below).
- Progress is saved on the device automatically.

Coming in later versions: ads (no pop-ups), teams, quests, hidden mochi, the Mochi lab, notifications and background step counting.

## Run it on your phone

You need a Mac or PC with [Node.js](https://nodejs.org) (LTS version) and the free **Expo Go** app on your phone (App Store or Google Play).

```bash
git clone https://github.com/SittanBon/mochi-pop.git
cd mochi-pop
npm install
npx expo start
```

A QR code appears in the terminal. Scan it with your iPhone camera (or from inside Expo Go on Android) and the app opens.

Your computer and phone need to be on the same Wi-Fi. If the QR code doesn't connect, stop the server with Ctrl + C and run `npx expo start --tunnel` instead.

Changes to the code show up on your phone instantly.

## Turn on the live leaderboard (optional)

The app works fully without this; only the Ranks tab stays off.

1. Go to the [Firebase console](https://console.firebase.google.com) and create a project (free).
2. In the project, click the **</>** (Web) icon to add a web app. Any name works.
3. Firebase shows a `firebaseConfig = { apiKey: ..., projectId: ..., ... }` block. Copy those values into `src/firebaseConfig.js`.
4. In the left menu, open **Build → Firestore Database → Create database** and pick a region near you.
5. Open the **Rules** tab, replace everything with the contents of `firestore.rules` from this project, and click **Publish**.
6. Restart the app. Friends running the same app will see each other on the board.

These rules are meant for testing with friends. Before a public store release, add sign-in so the board can't be faked.

## Publish to the App Store and Google Play

1. Create an Apple Developer account (US$99 per year) and a Google Play Console account (US$25 one-time).
2. In `app.json`, change `ios.bundleIdentifier` and `android.package` from `com.yourname.mochipop` to your own, for example `com.sittanbon.mochipop`.
3. Create a free account at [expo.dev](https://expo.dev), then run:
   ```bash
   npx eas-cli@latest build --platform ios
   npx eas-cli@latest submit --platform ios
   ```
   EAS builds the app in the cloud, so you don't need Xcode.

## Project structure

| File | What it does |
|---|---|
| `App.js` | Main app: saving, game rules, tabs |
| `src/game.js` | All the numbers: food, XP, candy, chests, pet needs |
| `src/mochi.js` | Every mochi drawing, part, shop price and aura |
| `src/screens/` | The Pop, Pet, Mochi and Ranks screens |
| `src/firebaseConfig.js` | Leaderboard settings |
| `firestore.rules` | Security rules for the leaderboard database |
| `assets/sounds/` | Pop sound effects |

To tune the game, such as food prices or how fast your mochi gets hungry, edit `src/game.js`.

### The food formula

Every food follows one rule, so no snack is a shortcut:

- **Value** = Full × 1.0 + Fun × 1.2 + Energy × 1.5
- **Price** = Value ÷ 5
- **XP** = Value ÷ 3
