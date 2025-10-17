# Forebearer Mobile Apps - Build & Deploy Guide

This guide explains how to build and deploy the Forebearer iOS and Android apps using Capacitor with remote content loading.

## Architecture Overview

The Forebearer mobile apps use **Capacitor's remote content feature** (Option 2):
- The apps load the live website at `https://forebearer.app` in a native WebView
- All updates to the website are instantly available in the mobile apps
- No need for app store resubmissions for content/feature updates
- Authentication and encryption work seamlessly across web and mobile

## Prerequisites

### For iOS Development
- **macOS** (required for iOS builds)
- **Xcode 14+** installed from the Mac App Store
- **CocoaPods** installed: `sudo gem install cocoapods`
- **Apple Developer Account** ($99/year) for App Store deployment

### For Android Development
- **Android Studio** (latest stable version)
- **Java Development Kit (JDK) 17+**
- **Android SDK** with:
  - Android SDK Platform 33+
  - Android SDK Build-Tools 33+
  - Android SDK Command-line Tools
- **Google Play Developer Account** ($25 one-time fee) for Play Store deployment

### General Requirements
- **Node.js 18+** and npm installed
- Forebearer repository cloned locally

## Project Setup

The Capacitor configuration is already set up in this repository:

- **App ID/Bundle ID**: `app.forebearer`
- **App Name**: Forebearer
- **Remote URL**: `https://forebearer.app`
- **Platforms**: iOS and Android added
- **Icons & Splash Screens**: Generated from logoonly.png

### Platform Detection

The app includes platform detection utilities at `src/lib/platform.ts`:

```typescript
import { platform, useIsMobile, usePlatform } from '@/lib/platform';

// In your components:
const isMobile = useIsMobile(); // true when running in native app
const currentPlatform = usePlatform(); // 'ios', 'android', or 'web'

// Utility functions:
platform.isMobile() // Check if running in native mobile
platform.isIOS() // Check if iOS
platform.isAndroid() // Check if Android
platform.isWeb() // Check if web browser
```

## Building for iOS

### Initial Setup

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. In Xcode, configure signing:
   - Select the "App" project in the left sidebar
   - Select the "App" target
   - Go to "Signing & Capabilities" tab
   - Select your Team from the dropdown
   - Xcode will automatically create a provisioning profile

3. Set up your development certificate:
   - Go to Xcode > Preferences > Accounts
   - Add your Apple ID
   - Click "Manage Certificates" and create an iOS Development certificate

### Building the App

1. **For development/testing on a physical device:**
   - Connect your iPhone via USB
   - Select your device from the device dropdown in Xcode
   - Click the "Play" button or press Cmd+R
   - The app will install and launch on your device

2. **For TestFlight distribution:**
   - In Xcode, select "Any iOS Device (arm64)" as the build target
   - Go to Product > Archive
   - Wait for the archive to complete
   - In the Organizer window, click "Distribute App"
   - Select "App Store Connect"
   - Follow the wizard to upload to TestFlight

3. **For App Store release:**
   - First upload to TestFlight (see above)
   - Go to App Store Connect (https://appstoreconnect.apple.com)
   - Create a new app listing
   - Add screenshots, description, privacy policy, etc.
   - Select your TestFlight build
   - Submit for review

### iOS Configuration Files

- `ios/App/App/Info.plist` - App metadata and permissions
- `ios/App/App.xcodeproj/project.pbxproj` - Xcode project settings
- `capacitor.config.ts` - Capacitor configuration (already set up)

### iOS Deployment Checklist

- [ ] App icons and splash screens generated
- [ ] Bundle ID set to `app.forebearer`
- [ ] Signing configured with your Apple Developer account
- [ ] Version number updated in Xcode
- [ ] Privacy policy URL added to Info.plist
- [ ] App Store screenshots prepared (required sizes)
- [ ] App description and keywords prepared

## Building for Android

### Initial Setup

1. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```

2. Wait for Gradle sync to complete

3. Configure signing (for release builds):
   - Generate a signing key:
     ```bash
     keytool -genkey -v -keystore forebearer-release-key.keystore -alias forebearer -keyalg RSA -keysize 2048 -validity 10000
     ```
   - Create `android/keystore.properties`:
     ```properties
     storeFile=../forebearer-release-key.keystore
     storePassword=YOUR_KEYSTORE_PASSWORD
     keyAlias=forebearer
     keyPassword=YOUR_KEY_PASSWORD
     ```
   - Update `android/app/build.gradle` to use the keystore (see below)

### Building the App

1. **For development/testing on a physical device or emulator:**
   - Connect your Android device via USB (with USB debugging enabled)
   - Or launch an Android emulator from Android Studio
   - Click the "Run" button or press Ctrl+R (Windows/Linux) / Cmd+R (Mac)
   - The app will install and launch on your device/emulator

2. **For Google Play internal testing:**
   - In Android Studio, go to Build > Generate Signed Bundle / APK
   - Select "Android App Bundle"
   - Choose your signing key
   - Select "release" build variant
   - Click "Finish"
   - The AAB file will be in `android/app/release/app-release.aab`

3. **For Google Play release:**
   - Upload the AAB to Google Play Console (https://play.google.com/console)
   - Create a new release in the desired track (internal/alpha/beta/production)
   - Add release notes
   - Review and rollout

### Android Release Signing Configuration

Add this to `android/app/build.gradle` after the `android {` block:

```gradle
android {
    // ... existing config ...

    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            def keystoreProperties = new Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            }

            storeFile file(keystoreProperties['storeFile'] ?: 'release.keystore')
            storePassword keystoreProperties['storePassword'] ?: ''
            keyAlias keystoreProperties['keyAlias'] ?: ''
            keyPassword keystoreProperties['keyPassword'] ?: ''
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Android Deployment Checklist

- [ ] App icons and splash screens generated
- [ ] Package name set to `app.forebearer`
- [ ] Signing keystore created and configured
- [ ] Version code and version name updated in build.gradle
- [ ] Privacy policy URL added to Play Store listing
- [ ] Play Store screenshots prepared (required sizes)
- [ ] App description and keywords prepared

## Syncing Changes

When you update the Capacitor configuration or add new native plugins, sync the changes:

```bash
# Sync both platforms
npx cap sync

# Or sync individually
npx cap sync ios
npx cap sync android
```

**Note:** Since we're using remote content, you don't need to sync for web content changes. The apps automatically load the latest version from https://forebearer.app.

## Testing Remote Content Loading

### Verify the App Loads the Remote URL

1. Launch the app on a device/emulator
2. The app should load `https://forebearer.app`
3. All features should work including authentication and encryption
4. Test sign-up, sign-in, and vault access

### Test Platform Detection

Add this temporary code to test platform detection:

```typescript
import { useIsMobile, usePlatform } from '@/lib/platform';

function TestComponent() {
  const isMobile = useIsMobile();
  const platform = usePlatform();

  return (
    <div>
      <p>Is Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>Platform: {platform}</p>
    </div>
  );
}
```

- On web: Should show "Is Mobile: No" and "Platform: web"
- On iOS: Should show "Is Mobile: Yes" and "Platform: ios"
- On Android: Should show "Is Mobile: Yes" and "Platform: android"

## Updating the Apps

### For Content/Feature Updates

Since the app loads the remote website, just deploy changes to https://forebearer.app:
- Changes are instantly available in the mobile apps
- No app store resubmission needed
- Users don't need to update the app

### For Native Updates

If you add native functionality (plugins, permissions, etc.):

1. Update the code
2. Run `npx cap sync`
3. Build new versions
4. Increment version numbers
5. Submit to app stores

## Adding Native Features (Future)

### Example: Biometric Authentication

1. Install the plugin:
   ```bash
   npm install @capacitor-community/biometric
   npx cap sync
   ```

2. Use in your code:
   ```typescript
   import { NativeBiometric } from '@capacitor-community/biometric';
   import { platform } from '@/lib/platform';

   async function authenticateWithBiometrics() {
     if (!platform.isMobile()) {
       // Fallback for web
       return authenticateWithPassword();
     }

     try {
       const result = await NativeBiometric.verifyIdentity({
         reason: 'Unlock your vault',
         title: 'Forebearer',
       });

       if (result.verified) {
         // Biometric auth successful
       }
     } catch (error) {
       // Handle error or fallback
     }
   }
   ```

### Example: Native Camera

1. Install the plugin:
   ```bash
   npm install @capacitor/camera
   npx cap sync
   ```

2. Update permissions in `ios/App/App/Info.plist`:
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>Upload photos to your vault</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>Select photos to upload to your vault</string>
   ```

3. Update permissions in `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
   ```

## Troubleshooting

### iOS Issues

**"No provisioning profiles found"**
- Go to Xcode > Preferences > Accounts
- Select your Apple ID and click "Manage Certificates"
- Create a new iOS Development certificate

**"Code signing error"**
- Select the App target in Xcode
- Go to Signing & Capabilities
- Enable "Automatically manage signing"
- Select your team

**App shows blank screen**
- Check that https://forebearer.app is accessible
- Check the Xcode console for errors
- Verify capacitor.config.ts has the correct URL

### Android Issues

**"SDK location not found"**
- Create `android/local.properties`:
  ```properties
  sdk.dir=/path/to/Android/sdk
  ```

**Gradle build fails**
- Update Android Studio to the latest version
- Invalidate caches: File > Invalidate Caches / Restart
- Clean and rebuild: Build > Clean Project, then Build > Rebuild Project

**App shows blank screen**
- Check that https://forebearer.app is accessible
- Check Android Studio's Logcat for errors
- Verify capacitor.config.ts has the correct URL

### General Issues

**Platform detection not working**
- Make sure @capacitor/core is installed
- Restart the dev server
- Rebuild the native apps

**Changes not appearing**
- For web content: Changes should appear immediately (cached in browser/WebView may need clearing)
- For native changes: Run `npx cap sync` and rebuild

## App Store Metadata

### App Name
Forebearer

### App Tagline / Short Description
Secure digital legacy and memory storage

### App Description
```
Forebearer helps you organize, protect, and deliver your most meaningful memories. Store photos, videos, letters, and important account information in an encrypted vault.

KEY FEATURES
• End-to-end encryption - Your data is encrypted on your device before it leaves
• Time-lock releases - Schedule memories to be shared on specific dates
• Heartbeat monitoring - Automatically release memories if you're unable to
• Secure file storage - Store photos, videos, voice recordings, and documents
• Digital inheritance - Share passwords and account access with trusted loved ones

PRIVACY & SECURITY
Your vault is protected with zero-knowledge encryption. We never see your password or decrypted data. Only you and your chosen recipients can access your memories.

HOW IT WORKS
1. Create encrypted bundles of photos, messages, and files
2. Choose who receives them and when
3. We deliver everything at exactly the right time

Whether you're planning for the future or creating a surprise for a loved one, Forebearer keeps your memories safe until the perfect moment.
```

### Keywords
digital legacy, memory storage, encrypted photos, time capsule, digital inheritance, secure vault, heartbeat monitoring, posthumous messages, family memories, encrypted storage

### Privacy Policy URL
https://forebearer.app/privacy

### Terms of Service URL
https://forebearer.app/terms

### Support URL
https://forebearer.app/support

### Category
- iOS: Lifestyle
- Android: Lifestyle

### Age Rating
- iOS: 4+ (No objectionable content)
- Android: Everyone

## Version Management

### Version Numbering
Follow semantic versioning: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes or major redesigns
- **MINOR**: New features or significant improvements
- **PATCH**: Bug fixes and minor improvements

### Updating Version Numbers

**iOS (Xcode):**
- Select App target
- General tab
- Update "Version" (display version, e.g., 1.0.0)
- Update "Build" (build number, must increment, e.g., 1, 2, 3...)

**Android (build.gradle):**
```gradle
defaultConfig {
    versionCode 1  // Increment for each release
    versionName "1.0.0"  // Display version
}
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Guidelines](https://play.google.com/about/developer-content-policy/)
- [Apple Developer Portal](https://developer.apple.com)
- [Google Play Console](https://play.google.com/console)

## Need Help?

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Check Capacitor documentation
3. Review platform-specific documentation (iOS/Android)
4. Check the Capacitor GitHub discussions

---

**Important:** Keep your signing keys and keystore files secure and backed up. If you lose them, you won't be able to update your apps on the stores.
