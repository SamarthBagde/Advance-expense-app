# 📱 React Native Production APK Build

This guide explains how to generate a signed production APK for a React Native CLI Android application.

## Prerequisites

Make sure the following are installed and configured:

- Node.js
- Java JDK
- Android Studio
- Android SDK
- React Native CLI
- Android device/emulator for testing

Verify that the React Native project works in development:

```powershell
npx react-native run-android
```

---

## 1. Generate a Production Keystore

A keystore is required to sign the production Android application.

From the project root, run:

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

You will be asked to provide:

- Keystore password
- Key password
- Name
- Organization
- City
- State
- Country

Keep the keystore and passwords safe.


---

## 2. Move the Keystore

Move:

```text
my-upload-key.keystore
```

into:

```text
android/app/
```

Project structure:

```text
Frontend/
├── android/
│   └── app/
│       ├── src/
│       ├── build.gradle
│       └── my-upload-key.keystore
├── ios/
├── src/
├── package.json
└── ...
```

---

## 3. Configure Gradle Properties

Open:

```text
android/gradle.properties
```

Add:

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

## 4. Configure Release Signing

Open:

```text
android/app/build.gradle
```

Inside the `android {}` block, configure the release signing:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}
```

Then configure the release build:

```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }

    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        shrinkResources false
    }
}
```

> **Note:** Do not replace the entire `build.gradle` file. Keep the existing React Native configuration and add/update only the required signing configuration.

---

## 5. Check the Application ID

In:

```text
android/app/build.gradle
```

Check:

```gradle
defaultConfig {
    applicationId "com.yourapp"
}
```

For example:

```gradle
defaultConfig {
    applicationId "com.example.expensetracker"
}
```

Choose the application ID carefully because it uniquely identifies your Android application.

---

# 🔨 Build Production APK

Open PowerShell and navigate to the Android directory:

```powershell
cd "android"
```

### Clean the previous build

```powershell
.\gradlew.bat clean
```

### Generate the production APK

```powershell
.\gradlew.bat assembleRelease
```

If the build is successful, you should see:

```text
BUILD SUCCESSFUL
```

---

## 📦 APK Location

The generated production APK will be located at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

For this project:

```text
E:\web development\Advance Expense Tracker\Frontend\android\app\build\outputs\apk\release\app-release.apk
```

---

# 📲 Install the Production APK

If an Android device is connected and ADB is configured:

```powershell
adb install -r "app\build\outputs\apk\release\app-release.apk"
```

Alternatively, copy `app-release.apk` to your Android phone and install it manually.

---
