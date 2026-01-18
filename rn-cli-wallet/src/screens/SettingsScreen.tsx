import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  useNetworkInfo,
  useGiwaWallet,
  useBalance,
  useFlashblocks,
  useFaucet,
} from 'giwa-react-native-wallet';
import type { FeatureName } from 'giwa-react-native-wallet';
import Clipboard from '@react-native-clipboard/clipboard';
import { useLanguage, Language } from '../lib/i18n';

type TabType = 'settings' | 'test';
type TestStatus = 'idle' | 'running' | 'pass' | 'fail' | 'skip';

interface TestResult {
  name: string;
  status: TestStatus;
  message?: string;
  duration?: number;
}

export default function SettingsScreen() {
  const { hasWallet, wallet, createWallet, exportMnemonic, exportPrivateKey } = useGiwaWallet();
  const { formattedBalance, refetch: refetchBalance } = useBalance();
  const { setEnabled: setFlashEnabled } = useFlashblocks();
  const { getFaucetUrl } = useFaucet();
  const {
    networkConfig,
    network,
    isTestnet,
    isReady,
    hasWarnings,
    warnings,
    isFeatureAvailable,
    rpcUrl,
    explorerUrl,
  } = useNetworkInfo();
  const { t, language, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [showDetails, setShowDetails] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const handleCopy = (text: string, _label: string) => {
    Clipboard.setString(text);
    Alert.alert(t.copied, t.copiedToClipboard);
  };

  const handleOpenExplorer = async () => {
    if (explorerUrl) {
      await Linking.openURL(explorerUrl);
    }
  };

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

  const features: { key: FeatureName; label: string }[] = [
    { key: 'bridge', label: t.bridge },
    { key: 'flashblocks', label: 'Flashblocks' },
    { key: 'giwaId', label: 'GIWA ID (ENS)' },
    { key: 'dojang', label: 'Dojang' },
    { key: 'faucet', label: 'Faucet' },
  ];

  // Test functions
  const updateTest = useCallback((name: string, status: TestStatus, message?: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.findIndex(test => test.name === name);
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
      updateTest(name, 'skip', skipReason || t.skip);
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
  }, [updateTest, t]);

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    await runTest(t.testNetworkInfo, async () => {
      if (!networkConfig) throw new Error(t.networkConfigUnavailable);
      return `${network} (Chain ID: ${networkConfig.id})`;
    });

    await runTest(t.testWalletCreate, async () => {
      if (hasWallet) return t.walletExists;
      const result = await createWallet();
      if (!result.wallet.address) throw new Error('No address');
      return `Created: ${result.wallet.address.slice(0, 10)}...`;
    }, false);

    await runTest(t.testExportMnemonic, async () => {
      const mnemonic = await exportMnemonic();
      if (!mnemonic) return t.noMnemonic;
      const words = mnemonic.split(' ');
      return `${words.length}${t.words}`;
    }, !hasWallet, t.noWallet);

    await runTest(t.testExportPrivateKey, async () => {
      const pk = await exportPrivateKey();
      if (!pk) throw new Error(t.exportFailed);
      return `${pk.slice(0, 10)}...${pk.slice(-6)}`;
    }, !hasWallet, t.noWallet);

    await runTest(t.testBalanceQuery, async () => {
      await refetchBalance();
      return `${formattedBalance ?? '0'} ETH`;
    }, !hasWallet, t.noWallet);

    await runTest(t.testBridgeAvailable, async () => {
      const available = isFeatureAvailable('bridge');
      if (!available) return t.notAvailableOnNetwork;
      return t.bridge;
    });

    await runTest(t.testFlashblocks, async () => {
      if (!setFlashEnabled) throw new Error('Flashblocks not available');
      setFlashEnabled(true);
      await new Promise<void>(resolve => setTimeout(resolve, 100));
      setFlashEnabled(false);
      return t.toggleWorking;
    });

    await runTest(t.testGiwaIdAvailable, async () => {
      const available = isFeatureAvailable('giwaId');
      if (!available) return t.notAvailableOnNetwork;
      return 'GIWA ID';
    });

    await runTest(t.testDojangAvailable, async () => {
      const available = isFeatureAvailable('dojang');
      if (!available) return t.notAvailableOnNetwork;
      return 'Dojang';
    });

    await runTest(t.testFaucetAvailable, async () => {
      if (!isTestnet) return t.mainnetFaucetUnavailable;
      const url = getFaucetUrl();
      if (!url) throw new Error('Faucet URL not available');
      return `URL: ${url.slice(0, 30)}...`;
    });

    await runTest(t.testFeatureSummary, async () => {
      const featureKeys = ['bridge', 'flashblocks', 'giwaId', 'dojang', 'faucet', 'tokens'] as const;
      const available = featureKeys.filter(f => isFeatureAvailable(f));
      return `${available.length}/${featureKeys.length}${t.featuresAvailable}`;
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

  const passCount = tests.filter(test => test.status === 'pass').length;
  const failCount = tests.filter(test => test.status === 'fail').length;
  const skipCount = tests.filter(test => test.status === 'skip').length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.settingsTitle}</Text>

      {/* Language Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.language}</Text>
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.languageButton, language === 'ko' && styles.languageButtonActive]}
            onPress={() => handleLanguageChange('ko')}
          >
            <Text style={[styles.languageButtonText, language === 'ko' && styles.languageButtonTextActive]}>
              {t.korean}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[styles.languageButtonText, language === 'en' && styles.languageButtonTextActive]}>
              {t.english}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            {t.networkInfo}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'test' && styles.activeTab]}
          onPress={() => setActiveTab('test')}
        >
          <Text style={[styles.tabText, activeTab === 'test' && styles.activeTabText]}>
            {t.sdkTest}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'settings' ? (
        <>
          {/* Network Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.networkStatus}</Text>
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>{t.network}</Text>
                <Text style={styles.statusValue}>{network}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>{t.name}</Text>
                <Text style={styles.statusValue}>{networkConfig?.name || '--'}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>{t.chainId}</Text>
                <Text style={styles.statusValue}>{networkConfig?.id || '--'}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>{t.type}</Text>
                <View style={[styles.badge, isTestnet ? styles.testnetBadge : styles.mainnetBadge]}>
                  <Text style={[styles.badgeText, isTestnet ? styles.testnetBadgeText : styles.mainnetBadgeText]}>
                    {isTestnet ? t.testnet : t.mainnet}
                  </Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>{t.status}</Text>
                <View style={[styles.badge, isReady ? styles.readyBadge : styles.notReadyBadge]}>
                  <Text style={[styles.badgeText, isReady ? styles.readyBadgeText : styles.notReadyBadgeText]}>
                    {isReady ? t.ready : t.notReady}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Warnings */}
          {hasWarnings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.networkWarnings}</Text>
              <View style={styles.warningCard}>
                {warnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>- {warning}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Feature Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.featureAvailability}</Text>
            <View style={styles.card}>
              {features.map((feature) => {
                const available = isFeatureAvailable(feature.key);
                return (
                  <View key={feature.key} style={styles.featureRow}>
                    <Text style={styles.featureLabel}>{feature.label}</Text>
                    <View style={[styles.featureBadge, available ? styles.availableBadge : styles.unavailableBadge]}>
                      <Text style={[styles.featureBadgeText, available ? styles.availableBadgeText : styles.unavailableBadgeText]}>
                        {available ? (language === 'ko' ? '사용 가능' : 'Available') : (language === 'ko' ? '사용 불가' : 'Unavailable')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* RPC Endpoints */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.rpcEndpoints}</Text>
              <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
                <Text style={styles.toggleText}>{showDetails ? t.hide : t.show}</Text>
              </TouchableOpacity>
            </View>
            {showDetails && (
              <View style={styles.card}>
                <TouchableOpacity style={styles.endpointRow} onPress={() => handleCopy(rpcUrl || '', t.rpcUrl)}>
                  <Text style={styles.endpointLabel}>{t.rpcUrl}</Text>
                  <Text style={styles.endpointValue} numberOfLines={1}>{rpcUrl || '--'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.endpointRow} onPress={handleOpenExplorer}>
                  <Text style={styles.endpointLabel}>{t.blockExplorer}</Text>
                  <Text style={[styles.endpointValue, styles.link]} numberOfLines={1}>{explorerUrl || '--'}</Text>
                </TouchableOpacity>
                <Text style={styles.hint}>{t.tapToCopyTapExplorerToOpen}</Text>
              </View>
            )}
          </View>

          {/* Wallet Status */}
          {hasWallet && wallet && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.walletStatus}</Text>
              <View style={styles.card}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{t.connected}</Text>
                  <Text style={styles.statusValue}>{t.yes}</Text>
                </View>
                <TouchableOpacity style={styles.endpointRow} onPress={() => handleCopy(wallet.address, t.address)}>
                  <Text style={styles.endpointLabel}>{t.address}</Text>
                  <Text style={styles.endpointValue} numberOfLines={1}>{wallet.address}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SDK Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.sdkInfo}</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{t.sdkInfoText}</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Test Tab */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t.network}</Text>
                <Text style={styles.summaryValue}>{network}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{language === 'ko' ? '지갑' : 'Wallet'}</Text>
                <Text style={styles.summaryValue}>{hasWallet ? t.connected : (language === 'ko' ? '없음' : 'None')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t.ready}</Text>
                <Text style={styles.summaryValue}>{isReady ? t.yes : t.no}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.runButton, isRunning && styles.runningButton]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <View style={styles.runningContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.runButtonText}>{t.running}: {currentTest || '...'}</Text>
              </View>
            ) : (
              <Text style={styles.runButtonText}>{t.runAllTests}</Text>
            )}
          </TouchableOpacity>

          {tests.length > 0 && (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>{t.results}</Text>
              <View style={styles.resultsBadges}>
                <View style={[styles.resultBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.resultBadgeText, { color: '#4CAF50' }]}>{passCount} {t.pass}</Text>
                </View>
                <View style={[styles.resultBadge, { backgroundColor: '#FFEBEE' }]}>
                  <Text style={[styles.resultBadgeText, { color: '#F44336' }]}>{failCount} {t.fail}</Text>
                </View>
                <View style={[styles.resultBadge, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={[styles.resultBadgeText, { color: '#FF9800' }]}>{skipCount} {t.skip}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.testList}>
            {tests.map((test, index) => (
              <View key={index} style={styles.testItem}>
                <View style={styles.testHeader}>
                  <Text style={[styles.testIcon, { color: getStatusColor(test.status) }]}>
                    {getStatusIcon(test.status)}
                  </Text>
                  <Text style={styles.testName}>{test.name}</Text>
                  {test.duration !== undefined && (
                    <Text style={styles.testDuration}>{test.duration}ms</Text>
                  )}
                </View>
                {test.message && (
                  <Text style={[styles.testMessage, test.status === 'fail' && styles.testMessageFail]}>
                    {test.message}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>{t.testCoverage}</Text>
            <Text style={styles.guideText}>{t.testCoverageList}</Text>
          </View>
        </>
      )}

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
    marginBottom: 20,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  languageButtonTextActive: {
    color: '#007AFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  toggleText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testnetBadge: {
    backgroundColor: '#fff3e0',
  },
  testnetBadgeText: {
    color: '#e65100',
  },
  mainnetBadge: {
    backgroundColor: '#e8f5e9',
  },
  mainnetBadgeText: {
    color: '#2e7d32',
  },
  readyBadge: {
    backgroundColor: '#e8f5e9',
  },
  readyBadgeText: {
    color: '#2e7d32',
  },
  notReadyBadge: {
    backgroundColor: '#ffebee',
  },
  notReadyBadgeText: {
    color: '#c62828',
  },
  warningCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 15,
  },
  warningText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  featureLabel: {
    fontSize: 14,
    color: '#333',
  },
  featureBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  availableBadge: {
    backgroundColor: '#e8f5e9',
  },
  availableBadgeText: {
    color: '#2e7d32',
  },
  unavailableBadge: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  unavailableBadgeText: {
    color: '#999',
  },
  endpointRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  endpointLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  endpointValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  link: {
    color: '#007AFF',
  },
  hint: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
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
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
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
    fontFamily: 'monospace',
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
});
