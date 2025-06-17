# React Native App

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

---

🧰 Tech Stack
⚛️ React Native (v0.76.5) – with TypeScript

🔥 Firebase

Firestore – to store image metadata (image URL, coordinates, timestamp)

Storage – to store actual image files

📍 Location – react-native-geolocation-service

📸 Camera – react-native-image-picker or react-native-camera

🗺️ Maps – react-native-maps


🔗 @react-native-firebase/app, firestore, storage

📸 Features
1. Camera/Upload Screen
Take pictures using the camera or gallery

Auto-fetch the current GPS location

Display a preview with location coordinates

Upload to Firebase Firestore + Storage on button tap

2. Gallery Screen (Optional)
List of all uploaded photos

View timestamps and coordinates

Optionally open image in full-screen or open location in Google Maps

3. Map Screen
Display uploaded images as map markers

Tapping a marker shows a thumbnail or image preview

🧪 How It Works
Launch the app

Navigate to Upload screen

Capture/select a photo

Allow location access → coordinates fetched

Press "Upload" to:

Upload image to Firebase Storage

Store metadata in Firestore

Switch to Map screen to view markers of uploaded content

🛠️ Getting Started
🔧 Prerequisites
Node.js & npm/yarn

React Native CLI setup

Android Studio / Xcode

Firebase Project with Firestore & Storage enabled

Google Maps API key (for MapView)

📦 Installation
bash
Copy
Edit
git clone <your-public-repo-url>
cd <project-folder>
npm install
# or
yarn install
🔌 Firebase Setup
Create a Firebase project

Enable Firestore and Storage

Download and place:

google-services.json in /android/app/


▶️ Running the App
Android
bash
Copy
Edit
npx react-native run-android
iOS (macOS only)
bash
Copy
Edit
📂 Folder Structure
bash
Copy
Edit
src/
├── components/         # Reusable UI components
├── screens/
│   ├── CameraScreen.tsx
│   ├── GalleryScreen.tsx
│   └── MapScreen.tsx
├── services/           # Firebase logic
├── context/            # App-wide state
├── utils/              # Helper functions
└── assets/
📌 Environment Variables
Use .env for Firebase or Google Maps config if needed

ini
Copy
Edit
GOOGLE_MAPS_API_KEY=your_key_here

---

## Getting Started

...
