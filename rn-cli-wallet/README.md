# GIWA Wallet - React Native CLI

A React Native CLI implementation of the GIWA Wallet demonstrating all features of the `giwa-react-native-wallet` SDK.

## Prerequisites

- Node.js >= 20.0.0
- Ruby (for iOS)
- CocoaPods (for iOS)
- Xcode 15+ (for iOS)
- Android Studio (for Android)

## Installation

```bash
# Install dependencies
npm install

# iOS: Install CocoaPods
cd ios
bundle install
bundle exec pod install
cd ..
```

## Running the App

### Start Metro Bundler

```bash
npm start
# or
npx react-native start
```

### iOS

```bash
npm run ios
# or
npx react-native run-ios --simulator="iPhone 16 Pro"
```

### Android

```bash
npm run android
# or
npx react-native run-android
```

## Features

This sample app demonstrates all SDK features:

### Home Screen (홈)
- Create new wallet with 12-word mnemonic
- Recover wallet from mnemonic phrase
- Import wallet from private key
- View ETH balance
- Export mnemonic/private key
- Delete wallet

### Assets Screen (자산)
- Add custom ERC-20 tokens by contract address
- View token balances
- Transfer tokens
- Remove tokens (long press)

### Transfer Screen (전송)
- **Send ETH**: Transfer ETH to addresses on L2
- **L1 Bridge**: Withdraw ETH to L1 (Coming Soon - contract not deployed)
- Transaction status tracking with block confirmations

### Services Screen (서비스)
| Service | Status | Description |
|---------|--------|-------------|
| **Faucet** | ✅ Available | Get testnet ETH |
| **Flashblocks** | ✅ Available | Fast transaction preconfirmations |
| **GIWA ID** | 🚧 Coming Soon | ENS-based naming system |
| **Dojang** | 🚧 Coming Soon | EAS-based attestation system |

### Settings Screen (설정)
- Network information display
- RPC endpoints
- Feature availability status
- SDK test suite
- Language toggle (Korean/English)

## Environment Badge

This app displays a **blue "RN CLI"** badge in the header to distinguish it from the Expo version (which shows a black "Expo" badge).

## Configuration Files

### react-native.config.js

Required for linking vector icon fonts:

```javascript
module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
  assets: ['./node_modules/react-native-vector-icons/Fonts'],
};
```

### Info.plist (iOS)

Vector icon fonts must be registered in `ios/rn_cli_wallet/Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
  <string>FontAwesome.ttf</string>
  <string>Ionicons.ttf</string>
  <string>MaterialIcons.ttf</string>
  <!-- ... other fonts -->
</array>
```

## SDK Integration

```typescript
import { GiwaProvider, useGiwaWallet, useBalance } from 'giwa-react-native-wallet';

// Wrap your app with GiwaProvider
<GiwaProvider config={{ network: 'testnet' }}>
  <App />
</GiwaProvider>

// Use hooks in your components
const { wallet, hasWallet, createWallet } = useGiwaWallet();
const { formattedBalance, refetch } = useBalance();
```

## Dependencies Comparison with Expo

| Feature | Expo | RN CLI (this app) |
|---------|------|-------------------|
| Clipboard | expo-clipboard | @react-native-clipboard/clipboard |
| Secure Storage | expo-secure-store | react-native-keychain |
| Web Browser | expo-web-browser | react-native Linking |
| Vector Icons | @expo/vector-icons | react-native-vector-icons |

## Troubleshooting

### Icons Not Showing

1. Ensure fonts are registered in `Info.plist`
2. Run font linking:
   ```bash
   npx react-native-asset
   ```
3. Clean rebuild:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/rn_cli_wallet-*
   npx react-native run-ios
   ```

### iOS Build Fails

```bash
cd ios
rm -rf Pods Podfile.lock build
pod install
cd ..
npx react-native run-ios
```

### Metro Bundler Issues

```bash
# Reset cache
npm start -- --reset-cache

# Or use different port
npx react-native start --port 8082
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit

# Run linter
npm run lint
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Metro bundler |
| `npm run ios` | Build and run on iOS simulator |
| `npm run android` | Build and run on Android emulator |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |

## Project Structure

```
rn-cli-wallet/
├── App.tsx                    # Root component with navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Wallet management
│   │   ├── TokensScreen.tsx   # Token management
│   │   ├── TransferScreen.tsx # ETH transfer & bridge
│   │   ├── ServicesScreen.tsx # Faucet, Flashblocks, etc.
│   │   └── SettingsScreen.tsx # Settings & SDK tests
│   └── lib/
│       └── i18n.tsx           # Internationalization
├── ios/                       # iOS native code
├── android/                   # Android native code
├── react-native.config.js     # RN CLI configuration
└── package.json
```

## License

MIT
