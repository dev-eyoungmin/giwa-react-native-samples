import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Linking,
} from 'react-native';
import {
  useGiwaWallet,
  useBalance,
  useNetworkInfo,
  useFaucet,
  useFlashblocks,
  useGiwaId,
  useDojang,
  parseEther,
} from 'giwa-react-native-wallet';
import Clipboard from '@react-native-clipboard/clipboard';
import { useLanguage } from '../lib/i18n';

type ServiceTab = 'faucet' | 'flashblocks' | 'giwaId' | 'dojang';

export default function ServicesScreen() {
  const { wallet, hasWallet } = useGiwaWallet();
  const { formattedBalance, refetch } = useBalance();
  const { isTestnet, isFeatureAvailable } = useNetworkInfo();
  const { t, language } = useLanguage();

  // Faucet
  const { requestFaucet, getFaucetUrl, isLoading: faucetLoading } = useFaucet();

  // Flashblocks
  const {
    isEnabled: flashEnabled,
    setEnabled: setFlashEnabled,
    sendTransaction: flashSend,
    getAverageLatency,
    isLoading: flashLoading,
  } = useFlashblocks();

  // GIWA ID
  const {
    resolveAddress,
    isAvailable: checkNameAvailable,
    isLoading: giwaIdLoading,
  } = useGiwaId();

  // Dojang
  const {
    isAttestationValid,
    hasVerifiedAddress,
    isLoading: dojangLoading,
  } = useDojang();

  const [activeTab, setActiveTab] = useState<ServiceTab>('faucet');

  // Flashblocks state
  const [flashTo, setFlashTo] = useState('');
  const [flashAmount, setFlashAmount] = useState('');
  const [flashResult, setFlashResult] = useState<string | null>(null);

  // GIWA ID state
  const [giwaIdInput, setGiwaIdInput] = useState('');
  const [giwaIdResult, setGiwaIdResult] = useState<string | null>(null);

  // Dojang state
  const [attestationUid, setAttestationUid] = useState('');
  const [dojangResult, setDojangResult] = useState<string | null>(null);

  const giwaIdAvailable = isFeatureAvailable('giwaId');
  const dojangAvailable = isFeatureAvailable('dojang');

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>{language === 'ko' ? '먼저 지갑을 생성해주세요' : 'Please create a wallet first'}</Text>
        <Text style={styles.subText}>{language === 'ko' ? '홈 탭에서 지갑을 생성할 수 있습니다' : 'You can create a wallet in the Home tab'}</Text>
      </View>
    );
  }

  const handleCopyAddress = () => {
    if (wallet?.address) {
      Clipboard.setString(wallet.address);
      Alert.alert(t.copied, t.copiedToClipboard);
    }
  };

  const handleOpenFaucet = async () => {
    try {
      await requestFaucet();
      const url = `${getFaucetUrl()}?address=${wallet?.address}`;
      await Linking.openURL(url);
      Alert.alert(t.faucetOpened, t.faucetOpenedMessage);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    }
  };

  const handleFlashSend = async () => {
    if (!flashTo || !flashAmount) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }

    try {
      setFlashResult(t.sendWithFlashblocks + '...');
      const startTime = Date.now();
      const { preconfirmation } = await flashSend({
        to: flashTo as `0x${string}`,
        value: parseEther(flashAmount),
      });
      const preconfTime = Date.now() - startTime;
      setFlashResult(`${preconfTime}ms${t.preconfirmedIn}\n${t.hash}: ${preconfirmation.txHash.slice(0, 20)}...`);
      refetch();
      setFlashTo('');
      setFlashAmount('');
    } catch (err: any) {
      setFlashResult(null);
      Alert.alert(t.error, err.message);
    }
  };

  const handleResolveGiwaId = async () => {
    if (!giwaIdInput) {
      Alert.alert(t.error, language === 'ko' ? 'GIWA ID를 입력해주세요' : 'Please enter a GIWA ID');
      return;
    }

    try {
      setGiwaIdResult(null);
      const address = await resolveAddress(giwaIdInput);
      if (address) {
        setGiwaIdResult(`${giwaIdInput} => ${address}`);
      } else {
        setGiwaIdResult(`"${giwaIdInput}"${t.notFound}`);
      }
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    }
  };

  const handleCheckAvailability = async () => {
    if (!giwaIdInput) {
      Alert.alert(t.error, language === 'ko' ? 'GIWA ID를 입력해주세요' : 'Please enter a GIWA ID');
      return;
    }

    try {
      setGiwaIdResult(null);
      const available = await checkNameAvailable(giwaIdInput);
      setGiwaIdResult(`"${giwaIdInput}" ${available ? t.available : t.taken}`);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    }
  };

  const handleCheckAttestation = async () => {
    if (!attestationUid) {
      Alert.alert(t.error, language === 'ko' ? '증명 UID를 입력해주세요' : 'Please enter attestation UID');
      return;
    }

    try {
      setDojangResult(null);
      const valid = await isAttestationValid(attestationUid as `0x${string}`);
      setDojangResult(valid ? t.attestationValid : t.attestationInvalid);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setDojangResult(null);
      const verified = await hasVerifiedAddress(wallet?.address as `0x${string}`);
      setDojangResult(verified ? t.myAddressVerified : t.myAddressNotVerified);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    }
  };

  const avgLatency = getAverageLatency?.() || null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.servicesTitle}</Text>

      {/* Service Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'faucet' && styles.activeTab]}
            onPress={() => setActiveTab('faucet')}
          >
            <Text style={[styles.tabText, activeTab === 'faucet' && styles.activeTabText]}>
              {t.faucet}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'flashblocks' && styles.activeTab]}
            onPress={() => setActiveTab('flashblocks')}
          >
            <Text style={[styles.tabText, activeTab === 'flashblocks' && styles.activeTabText]}>
              {t.flashblocks}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'giwaId' && styles.activeTab, !giwaIdAvailable && styles.disabledTab]}
            onPress={() => giwaIdAvailable && setActiveTab('giwaId')}
            disabled={!giwaIdAvailable}
          >
            <Text style={[styles.tabText, activeTab === 'giwaId' && styles.activeTabText]}>
              {t.giwaId} {!giwaIdAvailable && `(${t.preparing})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dojang' && styles.activeTab, !dojangAvailable && styles.disabledTab]}
            onPress={() => dojangAvailable && setActiveTab('dojang')}
            disabled={!dojangAvailable}
          >
            <Text style={[styles.tabText, activeTab === 'dojang' && styles.activeTabText]}>
              {t.dojang} {!dojangAvailable && `(${t.preparing})`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Faucet Tab */}
      {activeTab === 'faucet' && (
        <View>
          {!isTestnet ? (
            <View style={styles.unavailableCard}>
              <Text style={styles.unavailableTitle}>{t.faucetNotAvailable}</Text>
              <Text style={styles.unavailableText}>
                {t.faucetTestnetOnly}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>{t.currentBalance}</Text>
                <Text style={styles.balanceValue}>{formattedBalance ?? '0'} ETH</Text>
              </View>

              <View style={styles.addressCard}>
                <Text style={styles.addressLabel}>{t.myAddress}</Text>
                <Text style={styles.address} selectable>{wallet?.address}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyAddress}>
                  <Text style={styles.copyButtonText}>{t.copyAddress}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, faucetLoading && styles.disabledButton]}
                onPress={handleOpenFaucet}
                disabled={faucetLoading}
              >
                <Text style={styles.primaryButtonText}>{t.requestTestnetEth}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
                <Text style={styles.refreshButtonText}>{t.refreshBalance}</Text>
              </TouchableOpacity>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{t.aboutTestnetEth}</Text>
                <Text style={styles.infoText}>
                  {t.testnetEthDescription}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Flashblocks Tab */}
      {activeTab === 'flashblocks' && (
        <View>
          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>{t.flashblocksToggle}</Text>
              <Text style={styles.toggleDescription}>
                {flashEnabled ? t.fastTransactionsEnabled : t.enableForFastTransactions}
              </Text>
            </View>
            <Switch
              value={flashEnabled}
              onValueChange={setFlashEnabled}
              trackColor={{ false: '#ddd', true: '#4CAF50' }}
              thumbColor={flashEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t.avgLatency}</Text>
              <Text style={styles.statValue}>
                {avgLatency ? `${avgLatency.toFixed(0)}ms` : '--'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t.balance}</Text>
              <Text style={styles.statValue}>{formattedBalance ?? '0'}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.recipientAddressLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="0x..."
              value={flashTo}
              onChangeText={setFlashTo}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.amountEth}</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              value={flashAmount}
              onChangeText={setFlashAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.flashButton, (!flashEnabled || flashLoading) && styles.disabledButton]}
            onPress={handleFlashSend}
            disabled={!flashEnabled || flashLoading}
          >
            {flashLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {flashEnabled ? t.sendWithFlashblocks : t.enableFlashblocksFirst}
              </Text>
            )}
          </TouchableOpacity>

          {flashResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t.result}</Text>
              <Text style={styles.resultText}>{flashResult}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t.flashblocksHowItWorks}</Text>
            <Text style={styles.infoText}>
              {t.flashblocksStep1}{'\n'}
              {t.flashblocksStep2}{'\n'}
              {t.flashblocksStep3}
            </Text>
          </View>
        </View>
      )}

      {/* GIWA ID Tab */}
      {activeTab === 'giwaId' && (
        <View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.giwaIdLookup}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.exampleGiwaId}
              value={giwaIdInput}
              onChangeText={setGiwaIdInput}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.halfButton, giwaIdLoading && styles.disabledButton]}
              onPress={handleResolveGiwaId}
              disabled={giwaIdLoading}
            >
              <Text style={styles.halfButtonText}>{t.lookupAddress}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.halfButtonSecondary, giwaIdLoading && styles.disabledButton]}
              onPress={handleCheckAvailability}
              disabled={giwaIdLoading}
            >
              <Text style={styles.halfButtonSecondaryText}>{t.checkAvailability}</Text>
            </TouchableOpacity>
          </View>

          {giwaIdResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t.result}</Text>
              <Text style={styles.resultText} selectable>{giwaIdResult}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t.aboutGiwaId}</Text>
            <Text style={styles.infoText}>
              {t.giwaIdDescription}
            </Text>
          </View>
        </View>
      )}

      {/* Dojang Tab */}
      {activeTab === 'dojang' && (
        <View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.attestationUid}</Text>
            <TextInput
              style={styles.input}
              placeholder="0x..."
              value={attestationUid}
              onChangeText={setAttestationUid}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, dojangLoading && styles.disabledButton]}
            onPress={handleCheckAttestation}
            disabled={dojangLoading}
          >
            {dojangLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>{t.checkAttestationValidity}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, dojangLoading && styles.disabledButton]}
            onPress={handleCheckVerification}
            disabled={dojangLoading}
          >
            <Text style={styles.secondaryButtonText}>{t.checkMyVerificationStatus}</Text>
          </TouchableOpacity>

          {dojangResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t.result}</Text>
              <Text style={styles.resultText}>{dojangResult}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t.aboutDojang}</Text>
            <Text style={styles.infoText}>
              {t.dojangDescription}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabScroll: {
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  unavailableCard: {
    backgroundColor: '#f5f5f5',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  unavailableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  unavailableText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  addressCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flashButton: {
    backgroundColor: '#7c4dff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  halfButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  halfButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  halfButtonSecondary: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  halfButtonSecondaryText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#388e3c',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 22,
  },
});
