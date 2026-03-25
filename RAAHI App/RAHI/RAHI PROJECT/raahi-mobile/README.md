# RAAHI Mobile

This is the React Native traveler app replacement for the old `RAAHI App` Android code.

## What it includes

- Same traveler login flow as `RAAHI Web`
- Tourist dashboard with saved traveler details
- Separate `Safety Score` screen in the left drawer
- Left hamburger navigation and top-right profile access
- Profile review and edit flow
- Live location tracking for safety score
- QR card for the traveler verification page

## Run

1. Install dependencies:
   `npm install`
2. Start Expo:
   `npm start`
3. Run on Android:
   `npm run android`

## Backend URL

Set `EXPO_PUBLIC_API_BASE_URL` if needed.

Example for a physical Android device on the same Wi-Fi:

`EXPO_PUBLIC_API_BASE_URL=http://YOUR_PC_IP:5000/api`

Default fallback in `app.json` is:

`http://10.0.2.2:5000/api`

That default is for the Android emulator.
