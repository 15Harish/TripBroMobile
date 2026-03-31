# ✈️ TripBro — AI-Powered Travel Planning App

A full-featured React Native (Expo) travel planning app with Gemini AI itinerary generation, Supabase backend, and beautiful UI.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd TripBro
npm install
```

### 2. Configure API Keys
Open `src/constants/config.js` and replace the placeholder values:

```js
export const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key',
  GEMINI_API_KEY: 'your-gemini-api-key',           // https://aistudio.google.com/
  OPENWEATHER_API_KEY: 'your-openweather-key',      // https://openweathermap.org/api
  UNSPLASH_ACCESS_KEY: 'your-unsplash-key',         // https://unsplash.com/developers
  EXCHANGE_RATE_API_KEY: 'your-exchange-rate-key',  // https://open.er-api.com (free)
  GOOGLE_PLACES_API_KEY: 'your-google-places-key',  // https://console.cloud.google.com
};
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your `Project URL` and `anon public` key into `config.js`
3. Go to **SQL Editor** in Supabase dashboard
4. Paste and run the contents of `supabase_schema.sql`
5. Enable **Email Auth** in Authentication → Providers

### 4. Run on Android Emulator
```bash
# Start Android emulator in Android Studio first, then:
npx expo start --android

# OR
npm run android
```

### 5. Run in Expo Go (for quick testing)
```bash
npx expo start
# Scan QR code with Expo Go app
```

---

## 📁 Project Structure

```
TripBro/
├── App.js                          # Entry point
├── app.json                        # Expo config
├── supabase_schema.sql             # Database schema
├── src/
│   ├── constants/
│   │   ├── theme.js                # Colors, fonts, spacing
│   │   └── config.js               # API keys & app config
│   ├── context/
│   │   ├── AuthContext.js          # Auth state & Supabase auth
│   │   └── TripContext.js          # Trip CRUD & state
│   ├── services/
│   │   ├── supabase.js             # Supabase client
│   │   ├── gemini.js               # Gemini AI integration
│   │   └── apiServices.js          # Weather, currency, Unsplash
│   ├── navigation/
│   │   └── AppNavigator.js         # Stack + Tab navigation
│   └── screens/
│       ├── WelcomeScreen.js        # Landing page
│       ├── DashboardScreen.js      # Home dashboard
│       ├── ProfileScreen.js        # User profile
│       ├── OtherScreens.js         # Explore, History, Settings
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   ├── RegisterScreen.js
│       │   └── ForgotPasswordScreen.js
│       └── trip/
│           ├── CreateTripScreen.js  # 4-step wizard
│           ├── ItineraryScreen.js   # Full itinerary view
│           ├── CustomizeScreen.js   # Edit itinerary
│           └── DetailScreens.js     # Accommodation & Activity details
```

---

## 🎨 Features

| Feature | Status |
|---------|--------|
| ✅ User Auth (Email/Password) | Complete |
| ✅ AI Itinerary Generation (Gemini) | Complete |
| ✅ Day-by-Day Itinerary View | Complete |
| ✅ Budget Breakdown | Complete |
| ✅ Itinerary Customization | Complete |
| ✅ Activity Swap with AI Alternatives | Complete |
| ✅ Accommodation Details | Complete |
| ✅ Trip History | Complete |
| ✅ Explore Destinations | Complete |
| ✅ Currency Converter | Complete |
| ✅ Weather Widget | Complete |
| ✅ Emergency Info | Complete |
| ✅ Packing List | Complete |
| ✅ Social Sharing | Complete |
| ✅ Supabase Backend | Complete |

---

## 🔑 API Keys Guide

| API | Free Tier | Get Key |
|-----|-----------|---------|
| Gemini AI | Yes (generous) | [aistudio.google.com](https://aistudio.google.com) |
| Supabase | Yes (500MB DB) | [supabase.com](https://supabase.com) |
| OpenWeatherMap | Yes (1000 calls/day) | [openweathermap.org](https://openweathermap.org/api) |
| Open Exchange Rates | Yes (1500/month) | [open.er-api.com](https://open.er-api.com) |
| Unsplash | Yes (50 req/hour) | [unsplash.com/developers](https://unsplash.com/developers) |

---

## 🛠️ Troubleshooting

**App crashes on start?**
- Make sure all dependencies are installed: `npm install`
- Clear Metro cache: `npx expo start --clear`

**Itinerary generation fails?**
- Check your Gemini API key in `config.js`
- Ensure you have internet access
- The free Gemini tier has rate limits — wait and retry

**Supabase auth not working?**
- Verify your Supabase URL and anon key
- Enable Email auth in Supabase dashboard
- For local dev, disable email confirmation in Supabase settings

**Android emulator not detected?**
- Make sure Android Studio emulator is running first
- Run `adb devices` to verify connection

---

## 🎨 Design System

- **Primary**: Ocean Blue `#0077BE`
- **Secondary**: Warm Sand `#F5E6D3`
- **Accent**: Sunset Orange `#FF6B35`
- **Headings**: Poppins
- **Body**: Inter
