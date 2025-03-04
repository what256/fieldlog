# CI/CD Guide for FieldLog

This guide provides step-by-step instructions for setting up continuous integration and continuous deployment for the FieldLog app using Codemagic.

## Table of Contents

1. [Setting Up Codemagic](#setting-up-codemagic)
2. [Environment Variables](#environment-variables)
3. [Build Configuration](#build-configuration)
4. [iOS Setup](#ios-setup)
5. [Android Setup](#android-setup)
6. [Publishing to App Stores](#publishing-to-app-stores)
7. [Automating Version Management](#automating-version-management)
8. [Troubleshooting](#troubleshooting)

## Setting Up Codemagic

1. **Create a Codemagic account**: Sign up at [codemagic.io](https://codemagic.io)
2. **Connect your repository**: In the Codemagic dashboard, click "Add application" and select your repository provider (GitHub, Bitbucket, or GitLab)
3. **Select the repository**: Find and select the FieldLog repository
4. **Set up the project**: Choose "React Native app" as the project type

## Environment Variables

Set up the following environment variables in the Codemagic dashboard:

### Group: keystore_credentials
- `CM_KEYSTORE`: Base64-encoded Android keystore file
- `CM_KEYSTORE_PASSWORD`: Password for the keystore
- `CM_KEY_ALIAS`: Key alias for signing
- `CM_KEY_PASSWORD`: Password for the key

### Group: firebase_credentials
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Base64-encoded Firebase service account JSON file

### Group: app_store_credentials
- `APP_STORE_CONNECT_PRIVATE_KEY`: Base64-encoded App Store Connect API key
- `APP_STORE_CONNECT_KEY_IDENTIFIER`: Key identifier from Apple
- `APP_STORE_CONNECT_ISSUER_ID`: Issuer ID from Apple

### Group: certificates
- `CERTIFICATE_PRIVATE_KEY`: Base64-encoded private key for iOS certificates
- `DISTRIBUTION_CERTIFICATE`: Base64-encoded distribution certificate
- `PROVISIONING_PROFILE`: Base64-encoded provisioning profile

## Build Configuration

The build configuration is defined in the `codemagic.yaml` file. It includes workflows for:

- Android Build
- iOS Build
- Unit Tests

Make sure this file is committed to your repository.

## iOS Setup

1. **Apple Developer Account**: Ensure you have an active Apple Developer account
2. **Certificates and Profiles**: Generate distribution certificates and provisioning profiles from the Apple Developer portal
3. **Export Options**: Configure the `exportOptions.plist` file with your team ID and provisioning profile name
4. **App Store Connect**: Create an API key in App Store Connect and add it to Codemagic environment variables

## Android Setup

1. **Generate Keystore**: Create a signing keystore if you don't already have one
   ```
   keytool -genkey -v -keystore fieldlog.keystore -alias fieldlog -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Encode Keystore**: Base64 encode the keystore file to add it to Codemagic environment variables
   ```
   base64 fieldlog.keystore > fieldlog.keystore.base64
   ```
3. **Google Play Console**: Set up a service account with access to the Google Play Developer API
4. **Firebase Distribution**: Configure Firebase App Distribution if you want to distribute beta versions

## Publishing to App Stores

### App Store
1. Create an app in App Store Connect
2. Configure the bundle identifier and other metadata
3. Make sure your provisioning profile is set up correctly
4. Use the Codemagic workflow to publish to TestFlight or App Store

### Google Play
1. Create an app in the Google Play Console
2. Set up the package name and other metadata
3. Create a closed testing track
4. Use the Codemagic workflow to publish to the internal or closed testing track

## Automating Version Management

Use the provided version bump script to manage version numbers across both platforms:

```
node scripts/version-bump.js [major|minor|patch]
```

This script will:
1. Update the version in `package.json`
2. Update the version and build numbers in `app.json`
3. Create a Git commit and tag for the new version

## Troubleshooting

### Common Issues

1. **iOS Build Errors**:
   - Verify provisioning profiles are correctly set up
   - Check that your team ID matches in all places
   - Ensure certificates are not expired

2. **Android Build Errors**:
   - Verify keystore information is correct
   - Check Gradle configuration
   - Ensure Google Play API access is properly set up

3. **Publishing Errors**:
   - Verify app ID/package name matches between Codemagic and the app stores
   - Check for metadata validation errors
   - Ensure your app meets all store requirements

### Getting Help

If you encounter issues with Codemagic, you can:
- Check the [Codemagic documentation](https://docs.codemagic.io/)
- Contact Codemagic support
- Refer to build logs for detailed error information 