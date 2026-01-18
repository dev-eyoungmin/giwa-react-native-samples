# GIWA Wallet - Expo

An Expo implementation of the GIWA Wallet demonstrating all features of the `giwa-react-native-wallet` SDK.

## Prerequisites

- Node.js >= 20.0.0
- Expo CLI (`npm install -g expo-cli`)
- Xcode (for iOS development builds)
- Android Studio (for Android development builds)

## Installation

```bash
# Install dependencies
npm install
```

## Running the App

### Development Build (Recommended)

For full SDK functionality, use a development build:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Expo Go (Limited)

For quick testing (some native features may not work):

```bash
npx expo start
```

Then scan the QR code with Expo Go app.

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

This app displays a **black "Expo"** badge in the header to distinguish it from the RN CLI version (which shows a blue "RN CLI" badge).

## SDK Integration

```typescript
import { GiwaProvider, useGiwaWallet, useBalance } from 'giwa-react-native-wallet';

// Wrap your app with GiwaProvider (in app/_layout.tsx)
<GiwaProvider config={{ network: 'testnet' }}>
  <Stack />
</GiwaProvider>

// Use hooks in your components
const { wallet, hasWallet, createWallet } = useGiwaWallet();
const { formattedBalance, refetch } = useBalance();
```

## Expo Router

This app uses [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing:

```
app/
├── _layout.tsx          # Root layout with providers
├── index.tsx            # Redirect to tabs
├── (tabs)/
│   ├── _layout.tsx      # Tab navigator configuration
│   ├── index.tsx        # Home screen
│   ├── tokens.tsx       # Assets screen
│   ├── transfer.tsx     # Transfer screen
│   ├── services.tsx     # Services screen
│   └── settings.tsx     # Settings screen
└── modal.tsx            # Modal screen
```

## Dependencies (Expo-specific)

| Feature | Package |
|---------|---------|
| Clipboard | expo-clipboard |
| Secure Storage | expo-secure-store |
| Web Browser | expo-web-browser |
| Vector Icons | @expo/vector-icons |
| Local Auth | expo-local-authentication |
| Crypto | expo-crypto |

## Configuration

### metro.config.js

Custom Metro configuration for local SDK development:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const localSdkPath = path.resolve(__dirname, '../giwa-react-native-sdk');
const config = getDefaultConfig(__dirname);

// Use local SDK if it exists
if (fs.existsSync(localSdkPath)) {
  config.watchFolders = [localSdkPath];
  config.resolver.extraNodeModules = {
    'giwa-react-native-wallet': localSdkPath,
  };
}

module.exports = config;
```

### app.json

Key Expo configuration:

```json
{
  "expo": {
    "name": "GIWA Wallet",
    "slug": "giwa-wallet-expo",
    "scheme": "giwa-wallet",
    "ios": {
      "bundleIdentifier": "com.leeyoungmin.giwa-wallet-expo"
    }
  }
}
```

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf ios/Pods ios/Podfile.lock ios/build
npx expo run:ios
```

### Metro Bundler Issues

```bash
# Clear cache
npx expo start --clear

# Or reset completely
rm -rf node_modules
npm install
npx expo start --clear
```

### Module Resolution Errors

If you see errors about missing modules from wrong paths:

1. Stop Metro bundler
2. Delete `.expo` folder
3. Restart with `npx expo start --clear`

### Development Build Not Installing

```bash
# Reinstall on simulator
xcrun simctl uninstall booted com.leeyoungmin.giwa-wallet-expo
npx expo run:ios
```

## E2E Testing

This app includes Maestro E2E tests:

```bash
# Run all tests
maestro test .maestro/full_flow.yaml

# Run specific test
maestro test .maestro/wallet/01_create_wallet.yaml
```

Test files are located in `.maestro/` directory.

## Project Structure

```
expo-wallet/
├── app/                       # Expo Router screens
│   ├── _layout.tsx            # Root layout
│   ├── (tabs)/                # Tab screens
│   │   ├── _layout.tsx        # Tab configuration
│   │   ├── index.tsx          # Home
│   │   ├── tokens.tsx         # Assets
│   │   ├── transfer.tsx       # Transfer
│   │   ├── services.tsx       # Services
│   │   └── settings.tsx       # Settings
│   └── modal.tsx              # Modal
├── components/                # Reusable components
├── lib/
│   └── i18n.tsx               # Internationalization
├── constants/
│   └── Colors.ts              # Theme colors
├── assets/                    # Images, fonts
├── .maestro/                  # E2E tests
├── app.json                   # Expo configuration
├── metro.config.js            # Metro bundler config
└── package.json
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npx expo run:ios` | Build and run on iOS |
| `npx expo run:android` | Build and run on Android |

## License

MIT
