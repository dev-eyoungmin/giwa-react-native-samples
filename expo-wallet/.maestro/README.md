# GIWA Wallet E2E Tests

This directory contains Maestro E2E tests for the GIWA React Native Wallet SDK test application.

## Prerequisites

1. Install Maestro CLI:
   ```bash
   # macOS
   curl -Ls "https://get.maestro.mobile.dev" | bash

   # Or using Homebrew
   brew tap mobile-dev-inc/tap
   brew install maestro
   ```

2. For iOS testing, ensure you have:
   - Xcode installed
   - iOS Simulator available

3. For Android testing, ensure you have:
   - Android Studio installed
   - Android Emulator running or device connected

## Running Tests

### Run All Tests
```bash
# From the project root
maestro test .maestro/

# Or run the full flow test
maestro test .maestro/full_flow.yaml
```

### Run Specific Feature Tests
```bash
# Wallet tests
maestro test .maestro/wallet/

# Balance tests
maestro test .maestro/balance/

# Send tests
maestro test .maestro/send/

# Token tests
maestro test .maestro/tokens/

# Bridge tests
maestro test .maestro/bridge/

# Flashblocks tests
maestro test .maestro/flashblocks/

# GIWA ID tests
maestro test .maestro/giwa-id/

# Faucet tests
maestro test .maestro/faucet/

# Dojang tests
maestro test .maestro/dojang/

# Settings tests
maestro test .maestro/settings/
```

### Run Individual Tests
```bash
# Create wallet test
maestro test .maestro/wallet/01_create_wallet.yaml

# Recover wallet test
maestro test .maestro/wallet/02_recover_wallet.yaml

# Import private key test
maestro test .maestro/wallet/03_import_private_key.yaml
```

## Test Structure

```
.maestro/
├── config.yaml              # Global configuration
├── full_flow.yaml           # Comprehensive full app flow test
├── README.md                # This file
├── wallet/                  # Wallet management tests
│   ├── 01_create_wallet.yaml
│   ├── 02_recover_wallet.yaml
│   ├── 03_import_private_key.yaml
│   └── 04_export_credentials.yaml
├── balance/                 # Balance checking tests
│   └── 01_check_balance.yaml
├── send/                    # Send ETH tests
│   └── 01_send_eth.yaml
├── tokens/                  # ERC-20 token tests
│   └── 01_token_management.yaml
├── bridge/                  # L1-L2 bridge tests
│   └── 01_bridge.yaml
├── flashblocks/             # Flashblocks tests
│   └── 01_flashblocks.yaml
├── giwa-id/                 # GIWA ID (ENS) tests
│   └── 01_giwa_id.yaml
├── faucet/                  # Testnet faucet tests
│   └── 01_faucet.yaml
├── dojang/                  # Dojang attestation tests
│   └── 01_dojang.yaml
└── settings/                # Settings and network info tests
    └── 01_settings.yaml
```

## Test Coverage

| Feature | Tests | Description |
|---------|-------|-------------|
| Wallet | 4 | Create, recover, import, export |
| Balance | 1 | Check and refresh ETH balance |
| Send | 1 | Send ETH form validation |
| Tokens | 1 | ERC-20 token management |
| Bridge | 1 | L1↔L2 bridge UI |
| Flashblocks | 1 | Fast transaction UI |
| GIWA ID | 1 | ENS-based naming resolution |
| Faucet | 1 | Testnet ETH faucet |
| Dojang | 1 | Attestation verification |
| Settings | 1 | Network config and SDK status |
| Full Flow | 1 | All features in sequence |

## Environment Variables

Set these environment variables for testing:

```bash
export APP_ID="com.giwa.wallet.expo"
export TEST_MNEMONIC="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
export TEST_ADDRESS="0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

## Running with Development Build

1. Start the Expo development server:
   ```bash
   npm start
   ```

2. Build and run on iOS Simulator:
   ```bash
   npm run ios
   ```

3. Or build and run on Android:
   ```bash
   npm run android
   ```

4. Run Maestro tests:
   ```bash
   maestro test .maestro/full_flow.yaml
   ```

## Continuous Integration

For CI/CD integration, use Maestro Cloud:

```bash
# Upload and run tests in the cloud
maestro cloud --app-file=path/to/app.apk .maestro/

# Or for iOS
maestro cloud --app-file=path/to/app.ipa .maestro/
```

## Troubleshooting

### Test Timeout Issues
- Increase timeout values in test files
- Check network connectivity for RPC calls

### Element Not Found
- Verify element text matches exactly
- Use Maestro Studio to inspect elements: `maestro studio`

### App Not Launching
- Ensure app is built and installed
- Check APP_ID matches your bundle identifier

### Biometric Tests
- Biometric tests may require manual intervention on real devices
- Use simulator biometric enrollment for consistent testing

## Writing New Tests

Use Maestro Studio for interactive test development:
```bash
maestro studio
```

This opens a visual interface to record and debug tests.

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [GIWA React Native Wallet SDK](https://github.com/giwa-chain/giwa-react-native-sdk)
- [Expo Documentation](https://docs.expo.dev/)
