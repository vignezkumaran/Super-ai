# Rocket

Rocket is an open-source, privacy-first mobile app that unifies local and cloud AI models in one chat interface.

## Highlights

- Single chat UI for Local, Cloud, and Auto modes
- Local inference with Ollama
- Cloud inference with OpenAI and Claude (bring your own API keys)
- Auto-routing logic for simple/complex prompts
- Conversation history (save, load, rename, delete, search)
- Open-source model downloads from Ollama and Hugging Face (MVP)
- No analytics, no cloud sync, no data collection

## Tech Stack

- React Native 0.84+
- TypeScript
- React Navigation
- AsyncStorage
- Axios

## Project Structure

```txt
.
├── App.tsx
├── src/
│   ├── components/
│   │   ├── ConversationItem.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ModelSelector.tsx
│   │   └── TypingIndicator.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   └── useSettings.ts
│   ├── screens/
│   │   ├── ChatScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── CloudService.ts
│   │   ├── LocalService.ts
│   │   └── RouterService.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── constants.ts
│       └── storage.ts
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) iOS setup

```bash
bundle install
bundle exec pod install --project-directory=ios
```

If your Ruby version is too old for CocoaPods in this project, use a newer Ruby (3.2+) and rerun the commands.

### 3) Run the app

Start Metro:

```bash
npm start
```

Run iOS in another terminal:

```bash
npm run ios
```

Run Android:

```bash
npm run android
```

## Production Builds

### iOS Archive (App Store Connect)

```bash
npm run ios:archive
```

Then open Organizer in Xcode and upload archive to App Store Connect.

### Android Release Bundle (Play Console)

```bash
npm run android:bundle
```

The AAB will be generated in `android/app/build/outputs/bundle/release/`.

For signed release builds, set these Gradle properties in `android/gradle.properties` (or CI secrets):

```properties
ROCKET_UPLOAD_STORE_FILE=release.keystore
ROCKET_UPLOAD_STORE_PASSWORD=***
ROCKET_UPLOAD_KEY_ALIAS=***
ROCKET_UPLOAD_KEY_PASSWORD=***
```

## App Store Release Guidelines

Use the full step-by-step checklist in `APP_STORE_RELEASE.md` before each submission.

## Ollama Setup (Local Mode)

1. Install Ollama: https://ollama.com
2. Start Ollama service.
3. Pull a model:

```bash
ollama pull llama3.2:3b
```

4. Keep default host/port in settings unless needed:
- Host: `http://localhost`
- Port: `11434`

## Auto Routing Rules

- Simple keywords (`what is`, `define`, `explain`, etc.) -> Local
- Complex keywords (`code`, `build`, `architecture`, `analyze`, etc.) -> Cloud
- Prompts under 5 words -> Local
- Default fallback -> Local

## Privacy

- API keys are stored only on device with AsyncStorage.
- No analytics, tracking, or telemetry.
- No cloud synchronization.
- Full source code is auditable.

Read full details in `PRIVACY.md`.

## Roadmap

- Streaming responses
- Better token and usage analytics
- Improved Android rename UX for history items
- Optional Pro layer (future, non-MVP)
