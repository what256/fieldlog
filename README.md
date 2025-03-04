# FieldLog - Modern Note Taking App

A beautiful and feature-rich note-taking application built with React Native. FieldLog allows users to create, edit, and organize notes with rich content, location tagging, voice notes, and more.

![FieldLog App](./screenshots/app-preview.png)

## 🌟 Features

- **Modern UI**: Beautiful and responsive UI with smooth animations
- **Rich Note Taking**: Create notes with formatted text, images, and attachments
- **Location Tagging**: Add location information to your notes
- **Voice Notes**: Record voice notes for quick capture
- **Search & Filter**: Powerful search functionality with tag filtering
- **Favorites**: Mark your most important notes as favorites
- **Dark Mode**: Full support for light and dark themes
- **Offline Support**: Work offline with full functionality

## 🚀 Technology Stack

- **React Native**: Core framework for cross-platform mobile development
- **TypeScript**: Type-safe JavaScript for better development experience
- **React Navigation**: Navigation and routing
- **React Native Paper**: Material Design components
- **SQLite**: Local database for offline storage
- **Expo**: Development tooling and modules
- **Codemagic**: CI/CD for mobile app deployment

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- React Native development environment setup
- Expo CLI

## 🔧 Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fieldlog.git
   cd fieldlog
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Run on your preferred platform:
   ```
   npm run android
   # or
   npm run ios
   ```

## 🏗️ Project Structure

```
fieldlog/
├── src/
│   ├── components/       # Reusable components
│   │   └── ui/           # UI components
│   ├── context/          # React Context providers
│   ├── db/               # Database configuration and queries
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── styles/           # Global styles and themes
│   └── utils/            # Utility functions
├── assets/               # Static assets like images
├── android/              # Android-specific code
├── ios/                  # iOS-specific code
├── app.json              # Expo configuration
├── App.tsx               # Entry point
├── codemagic.yaml        # CI/CD configuration
└── package.json          # Dependencies and scripts
```

## 🧪 Testing

Run tests with the following command:

```
npm test
```

## 📱 Building for Production

### Using Expo

```
expo build:android
expo build:ios
```

### Using Codemagic

1. Push your changes to your repository
2. Set up your project on Codemagic
3. Configure the build settings as per the `codemagic.yaml` file
4. Start the build process

## 🔄 CI/CD with Codemagic

We use Codemagic for continuous integration and deployment. The `codemagic.yaml` file in the root directory contains the configuration for building and publishing the app. Make sure to:

1. Set up the required environment variables in Codemagic
2. Configure signing certificates for both iOS and Android
3. Set up distribution to App Store Connect and Google Play

## 🎨 UI Components

FieldLog includes a rich set of custom UI components:

- **AnimatedButton**: Interactive button with scale and feedback animations
- **Card**: Versatile card with multiple variants (default, elevated, outlined, flat)
- **EmptyState**: Beautiful empty state component
- **Illustrations**: SVG illustrations for various app states
- **LoadingIndicator**: Customizable loading indicators
- **PageTransition**: Smooth transitions between screens
- **SearchBar**: Advanced search component with animations
- **Tag**: Versatile tag/chip component with different variants
- **Toast**: Toast notification system for user feedback

## 🛠️ Customization

### Themes

You can customize the app's themes by modifying the theme files in `src/styles/theme.ts`. The app supports both light and dark modes.

### Animations

Customize animations by using the built-in animation utilities in `src/utils/AnimationUtils.ts`.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- Your Name - Initial work

## 🙏 Acknowledgments

- React Native Team
- Expo Team
- React Native Paper Team
- All the open source libraries used in this project
