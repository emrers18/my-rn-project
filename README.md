# 🗺️ TravelBot — AI-Powered Personal Travel Assistant

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-v0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini_AI-Flash_1.5-blue?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

**TravelBot** is a premium, cross-platform mobile travel companion built with React Native and Expo. Powered by Google's Gemini AI and Supabase, it allows travelers to plan itineraries, search flights and accommodation, view locations, and explore destinations dynamically via an interactive generative UI (GenUI) interface.

---

## ✨ Key Features

### 🤖 1. Generative UI (GenUI) Chat
Conversations with the AI are not just text. Based on your inquiries, the assistant dynamically injects rich, interactive components directly into the chat:
*   **Destination Cards:** Shows highlights, weather forecasts, and location details.
*   **Smart Hotel Cards:** Compare prices, ratings, amenities, and trigger direct bookings.
*   **Ticket & Route Cards:** Displays flight/bus times, flight numbers, pricing, and ticket links.
*   **Interactive Timelines:** Displays day-by-day travel routes.

### 🌎 2. Real-Time Centralized Localization
Full support for **Turkish (TR)** and **English (EN)**. Changing settings instantly translates:
*   Tab navigation layout labels.
*   Home page sliders, features description, and concepts.
*   Active chat screen suggestions, input placeholders, indicators, and dates.
*   Profile and system preference settings.

### 🛂 3. Traveler Passport & Rewards
Gamified traveler profile card featuring a classic physical passport look:
*   **Dynamic Title Badge:** Assigns titles like *Novice Traveler (Yeni Gezgin)*, *Adventurer (Maceracı)*, or *Road Guru (Yol Gurusu)* based on your active chat sessions count.
*   **Tier Status:** Shows membership state (*Standard* or *Premium*).
*   **Decorative Design:** Premium golden borders, barcodes, and dynamic ID numbers.

### 🎨 4. Sleek Theme Engine
*   **Modes:** Light, Dark, and System theme selectors.
*   **Aesthetics:** Harmonious corporate blue palettes (`#0052CC` primary brand color), Jakarta Sans headlines, and clean spacing.

---

## 🛠️ Architecture & Tech Stack

The application is structured following Clean Architecture principles:

*   **Core Logic:** TypeScript, Zustand (State stores), TanStack React Query v5 (Server cache), neverthrow (Functional error handling).
*   **UI Elements:** React Native Reanimated (Smooth 60fps animations), Expo Image (Cached imagery), React Native Maps (Static/Interactive geolocation), Expo Router v3 (File-based navigation).
*   **Backend:** Supabase Database (RLS policies, Realtime hooks, Avatars bucket storage), Supabase Auth.
*   **AI Engine:** Google Gemini SDK integration wrapped inside a secure Supabase Edge Function to protect API credentials.

---

## 🚀 Getting Started

### 📋 Prerequisites
*   Node.js (v18+)
*   Expo Go app on iOS/Android or emulator setup.

### 📥 Installation
1. Clone the repository and navigate to the directory:
   ```bash
   cd my-rn-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### ⚙️ Environment Configuration
Create a `.env.local` file in the root directory and configure your Supabase variables:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🏃 Running Locally
1. Start the Expo Bundler:
   ```bash
   npx expo start
   ```
2. Open on device:
   *   Press **`a`** for Android Emulator.
   *   Press **`i`** for iOS Simulator.
   *   Scan the QR code in your console with your **Expo Go** application to run on a physical device.

---

## 🧪 Quality Assurance & Scripts

Verify code safety, styling standards, and tests with:

*   **Type Checker:**
    ```bash
    npx tsc --noEmit
    ```
*   **ESLint Linter:**
    ```bash
    npm run lint
    ```
*   **Jest Unit Tests:**
    ```bash
    npm test
    ```
