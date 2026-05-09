import 'dotenv/config';

export default {
  expo: {
    name: "VetConnectApp",
    slug: "VetConnectApp",
    version: "1.0.0",
    scheme: "vetconnect",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
      firebaseAppId: process.env.FIREBASE_APP_ID || 'YOUR_APP_ID',
    }
  }
};
