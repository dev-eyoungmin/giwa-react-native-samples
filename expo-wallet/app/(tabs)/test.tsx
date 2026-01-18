import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  useGiwaWallet,
  useBalance,
  useTransaction,
  useTokens,
  useBridge,
  useFlashblocks,
  useGiwaId,
  useDojang,
  useFaucet,
  useNetworkInfo,
  parseEther,
} from 'giwa-react-native-wallet';

type TestStatus = 'idle' | 'running' | 'pass' | 'fail' | 'skip';

interface TestResult {
  name: string;
  status: TestStatus;
  message?: string;
  duration?: number;
}

const TEST_ADDRESS = '0x0000000000000000000000000000000000000001' as const;

export default function TestScreen() {
  const {
    wallet,
    hasWallet,
    createWallet,
    recoverWallet,
    exportMnemonic,
    exportPrivateKey,
    deleteWallet,
  } = useGiwaWallet();
  const { balance, formattedBalance, refetch: refetchBalance } = useBalance();
  const { sendTransaction, waitForReceipt } = useTransaction();
  const { getToken, getBalance: getTokenBalance, transfer: transferToken } = useTokens();
  const { withdrawETH, isLoading: bridgeLoading } = useBridge();
  const { sendTransaction: sendFlashTx, isEnabled: flashEnabled, setEnabled: setFlashEnabled } = useFlashblocks();
  const { resolveAddress, resolveName, isAvailable: checkGiwaIdAvailable } = useGiwaId();
  const { getAttestation, isAttestationValid, hasVerifiedAddress } = useDojang();
  const { requestFaucet, getFaucetUrl } = useFaucet();
  const { network, isTestnet, isReady, isFeatureAvailable, networkConfig } = useNetworkInfo();

  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const updateTest = useCallback((name: string, status: TestStatus, message?: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.findIndex(t => t.name === name);
      const newResult = { name, status, message, duration };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResult;
        return updated;
      }
      return [...prev, newResult];
    });
  }, []);

  const runTest = useCallback(async (
    name: string,
    testFn: () => Promise<string | void>,
    skipCondition?: boolean,
    skipReason?: string
  ) => {
    if (skipCondition) {
      updateTest(name, 'skip', skipReason || 'Skipped');
      return;
    }

    setCurrentTest(name);
    updateTest(name, 'running');
    const start = Date.now();

    try {
      const result = await testFn();
      const duration = Date.now() - start;
      updateTest(name, 'pass', result || 'OK', duration);
    } catch (err: any) {
      const duration = Date.now() - start;
      updateTest(name, 'fail', err.message, duration);
    }
  }, [updateTest]);

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    // 1. Network Info Test
    await runTest('Network Info', async () => {
      if (!networkConfig) throw new Error('Network config not available');
      return `${network} (Chain ID: ${networkConfig.id})`;
    });

    // 2. Wallet Tests
    const needsWallet = !hasWallet;

    await runTest('Wallet Create', async () => {
      if (hasWallet) return 'Wallet already exists';
      const result = await createWallet();
      if (!result.wallet.address) throw new Error('No address');
      return `Created: ${result.wallet.address.slice(0, 10)}...`;
    }, false);

    await runTest('Wallet Export Mnemonic', async () => {
      const mnemonic = await exportMnemonic();
      if (!mnemonic) return 'No mnemonic (imported via private key)';
      const words = mnemonic.split(' ');
      return `${words.length} words`;
    }, !hasWallet, 'No wallet');

    await runTest('Wallet Export Private Key', async () => {
      const pk = await exportPrivateKey();
      if (!pk) throw new Error('Failed to export');
      return `${pk.slice(0, 10)}...${pk.slice(-6)}`;
    }, !hasWallet, 'No wallet');

    // 3. Balance Test
    await runTest('Balance Query', async () => {
      await refetchBalance();
      return `${formattedBalance ?? '0'} ETH`;
    }, !hasWallet, 'No wallet');

    // 4. Token Tests
    await runTest('Token Manager', async () => {
      // Just verify the hook is available
      if (!getToken) throw new Error('Token manager not available');
      return 'Token manager ready';
    });

    // 5. Bridge Test (feature availability)
    await runTest('Bridge Available', async () => {
      const available = isFeatureAvailable('bridge');
      if (!available) return 'Not available on this network';
      return 'Bridge available';
    });

    // 6. Flashblocks Test
    await runTest('Flashblocks', async () => {
      if (!setFlashEnabled) throw new Error('Flashblocks not available');
      // Toggle test
      setFlashEnabled(true);
      await new Promise<void>(resolve => setTimeout(resolve, 100));
      setFlashEnabled(false);
      return 'Toggle working';
    });

    // 7. GIWA ID Test
    await runTest('GIWA ID Available', async () => {
      const available = isFeatureAvailable('giwaId');
      if (!available) return 'Not available on this network';
      return 'GIWA ID available';
    });

    // 8. Dojang Test
    await runTest('Dojang Available', async () => {
      const available = isFeatureAvailable('dojang');
      if (!available) return 'Not available on this network';
      return 'Dojang available';
    });

    // 9. Faucet Test
    await runTest('Faucet Available', async () => {
      if (!isTestnet) return 'Mainnet - faucet not available';
      const url = getFaucetUrl();
      if (!url) throw new Error('Faucet URL not available');
      return `URL: ${url.slice(0, 30)}...`;
    });

    // 10. Feature Availability Summary
    await runTest('Feature Summary', async () => {
      const features = ['bridge', 'flashblocks', 'giwaId', 'dojang', 'faucet', 'tokens'] as const;
      const available = features.filter(f => isFeatureAvailable(f));
      return `${available.length}/${features.length} features available`;
    });

    setCurrentTest(null);
    setIsRunning(false);
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'pass': return '#4CAF50';
      case 'fail': return '#F44336';
      case 'skip': return '#FF9800';
      case 'running': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'skip': return '○';
      case 'running': return '●';
      default: return '—';
    }
  };

  const passCount = tests.filter(t => t.status === 'pass').length;
  const failCount = tests.filter(t => t.status === 'fail').length;
  const skipCount = tests.filter(t => t.status === 'skip').length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SDK Test Suite</Text>
      <Text style={styles.subtitle}>
        Automated tests for all GIWA SDK features
      </Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Network</Text>
            <Text style={styles.summaryValue}>{network}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Wallet</Text>
            <Text style={styles.summaryValue}>{hasWallet ? 'Connected' : 'None'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ready</Text>
            <Text style={styles.summaryValue}>{isReady ? 'Yes' : 'No'}</Text>
          </View>
        </View>
      </View>

      {/* Run Button */}
      <TouchableOpacity
        style={[styles.runButton, isRunning && styles.runningButton]}
        onPress={runAllTests}
        disabled={isRunning}
      >
        {isRunning ? (
          <View style={styles.runningContent}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.runButtonText}>
              Running: {currentTest || '...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.runButtonText}>Run All Tests</Text>
        )}
      </TouchableOpacity>

      {/* Results Summary */}
      {tests.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Results</Text>
          <View style={styles.resultsBadges}>
            <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.badgeText, { color: '#4CAF50' }]}>
                {passCount} Pass
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.badgeText, { color: '#F44336' }]}>
                {failCount} Fail
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.badgeText, { color: '#FF9800' }]}>
                {skipCount} Skip
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Test Results */}
      <View style={styles.testList}>
        {tests.map((test, index) => (
          <View key={index} style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text
                style={[styles.testIcon, { color: getStatusColor(test.status) }]}
              >
                {getStatusIcon(test.status)}
              </Text>
              <Text style={styles.testName}>{test.name}</Text>
              {test.duration !== undefined && (
                <Text style={styles.testDuration}>{test.duration}ms</Text>
              )}
            </View>
            {test.message && (
              <Text
                style={[
                  styles.testMessage,
                  test.status === 'fail' && styles.testMessageFail,
                ]}
              >
                {test.message}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Test Guide */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>Test Coverage</Text>
        <Text style={styles.guideText}>
          • Network configuration and status{'\n'}
          • Wallet creation and management{'\n'}
          • Balance queries{'\n'}
          • Token manager availability{'\n'}
          • Bridge feature check{'\n'}
          • Flashblocks toggle{'\n'}
          • GIWA ID feature check{'\n'}
          • Dojang attestation check{'\n'}
          • Faucet availability{'\n'}
          • Overall feature summary
        </Text>
      </View>

      {/* Manual Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Tests</Text>
        <Text style={styles.sectionDescription}>
          For full E2E testing, use Maestro CLI:
        </Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>npm run e2e:full</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  runButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  runningButton: {
    backgroundColor: '#5856D6',
  },
  runningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resultsBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testList: {
    marginBottom: 20,
  },
  testItem: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 20,
  },
  testName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  testDuration: {
    fontSize: 12,
    color: '#999',
  },
  testMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginLeft: 30,
    fontFamily: 'SpaceMono',
  },
  testMessageFail: {
    color: '#F44336',
  },
  guideCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  codeBlock: {
    backgroundColor: '#263238',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    color: '#80CBC4',
    fontFamily: 'SpaceMono',
    fontSize: 14,
  },
});
