import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import {
  useGiwaWallet,
  useNetworkInfo,
  useBalance,
} from 'giwa-react-native-wallet';
import Clipboard from '@react-native-clipboard/clipboard';
import { useLanguage } from '../lib/i18n';

type ModalType = 'recover' | 'import' | 'export' | null;

export default function HomeScreen() {
  const {
    wallet,
    isLoading,
    isInitializing,
    hasWallet,
    createWallet,
    recoverWallet,
    importFromPrivateKey,
    exportMnemonic,
    exportPrivateKey,
    deleteWallet,
  } = useGiwaWallet();
  const { networkConfig, isTestnet } = useNetworkInfo();
  const { balance, formattedBalance, isLoading: balanceLoading, refetch } = useBalance();
  const { t } = useLanguage();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [inputValue, setInputValue] = useState('');
  const [exportedValue, setExportedValue] = useState<string | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [newMnemonic, setNewMnemonic] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (isInitializing || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t.sdkInitializing}</Text>
      </View>
    );
  }

  const handleCreateWallet = async () => {
    try {
      setIsProcessing(true);
      const result = await createWallet();
      setNewMnemonic(result.mnemonic);
      setShowMnemonic(true);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecoverWallet = async () => {
    if (!inputValue.trim()) {
      Alert.alert(t.error, t.enterMnemonic);
      return;
    }

    try {
      setIsProcessing(true);
      await recoverWallet(inputValue.trim());
      setModalType(null);
      setInputValue('');
      Alert.alert(t.success, t.walletRecovered);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportPrivateKey = async () => {
    if (!inputValue.trim()) {
      Alert.alert(t.error, t.enterPrivateKey);
      return;
    }

    try {
      setIsProcessing(true);
      await importFromPrivateKey(inputValue.trim() as `0x${string}`);
      setModalType(null);
      setInputValue('');
      Alert.alert(t.success, t.walletImported);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (type: 'mnemonic' | 'privateKey') => {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          t.securityWarning,
          t.securityWarningMessage,
          [
            { text: t.cancel, onPress: () => resolve(false), style: 'cancel' },
            { text: t.continue, onPress: () => resolve(true) },
          ]
        );
      });
      if (!confirmed) return;

      setIsProcessing(true);
      if (type === 'mnemonic') {
        const mnemonic = await exportMnemonic();
        setExportedValue(mnemonic || t.noMnemonic);
      } else {
        const privateKey = await exportPrivateKey();
        setExportedValue(privateKey);
      }
      setModalType('export');
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteWallet = async () => {
    Alert.alert(
      t.deleteWalletConfirm,
      t.deleteWalletMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet();
              Alert.alert(t.done, t.walletDeleted);
            } catch (err: any) {
              Alert.alert(t.error, err.message);
            }
          },
        },
      ]
    );
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    Alert.alert(t.copied, t.copiedToClipboard);
  };

  const closeModal = () => {
    setModalType(null);
    setInputValue('');
    setExportedValue(null);
  };

  // No wallet state
  if (!hasWallet || !wallet) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t.homeTitle}</Text>
        <Text style={styles.subtitle}>{t.homeSubtitle}</Text>

        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>
            {networkConfig?.name || 'Unknown'} {isTestnet ? `(${t.testnet})` : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isProcessing && styles.disabledButton]}
          onPress={handleCreateWallet}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t.createNewWallet}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setModalType('recover')}
        >
          <Text style={styles.secondaryButtonText}>{t.recoverWithMnemonic}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setModalType('import')}
        >
          <Text style={styles.secondaryButtonText}>{t.importPrivateKey}</Text>
        </TouchableOpacity>

        {/* Mnemonic Modal */}
        <Modal visible={showMnemonic} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.saveRecoveryPhrase}</Text>
              <Text style={styles.warningText}>
                {t.recoveryPhraseWarning}
              </Text>
              <View style={styles.mnemonicBox}>
                <Text style={styles.mnemonicText} selectable>
                  {newMnemonic}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(newMnemonic || '')}
              >
                <Text style={styles.copyButtonText}>{t.copy}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setShowMnemonic(false);
                  setNewMnemonic(null);
                }}
              >
                <Text style={styles.primaryButtonText}>{t.iSavedIt}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Recover/Import Modal */}
        <Modal visible={modalType === 'recover' || modalType === 'import'} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {modalType === 'recover' ? t.recoverWallet : t.importWalletTitle}
              </Text>
              <Text style={styles.modalDescription}>
                {modalType === 'recover' ? t.enterMnemonic : t.enterPrivateKey}
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder={
                  modalType === 'recover'
                    ? 'word1 word2 word3 ...'
                    : '0x...'
                }
                value={inputValue}
                onChangeText={setInputValue}
                autoCapitalize="none"
                autoCorrect={false}
                multiline={modalType === 'recover'}
                numberOfLines={modalType === 'recover' ? 3 : 1}
                secureTextEntry={modalType === 'import'}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1 }, isProcessing && styles.disabledButton]}
                  onPress={modalType === 'recover' ? handleRecoverWallet : handleImportPrivateKey}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {modalType === 'recover' ? t.recover : t.import}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  // Wallet exists state
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.walletContainer}>
        <Text style={styles.title}>{t.homeTitle}</Text>

        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>
            {networkConfig?.name || 'Unknown'} {isTestnet ? `(${t.testnet})` : ''}
          </Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t.balance}</Text>
          <Text style={styles.balanceValue}>
            {formattedBalance ?? '0'} <Text style={styles.unit}>ETH</Text>
          </Text>
          {balance !== undefined && (
            <Text style={styles.rawBalance}>
              {balance.toString()} wei
            </Text>
          )}
          <TouchableOpacity
            style={[styles.refreshButton, balanceLoading && styles.disabledButton]}
            onPress={refetch}
            disabled={balanceLoading}
          >
            <Text style={styles.refreshButtonText}>
              {balanceLoading ? t.loading : t.balanceRefresh}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Address Card */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>{t.walletAddress}</Text>
          <Text style={styles.address} selectable>
            {wallet.address}
          </Text>
          <TouchableOpacity
            style={styles.copyAddressButton}
            onPress={() => handleCopy(wallet.address)}
          >
            <Text style={styles.copyAddressText}>{t.copyAddress}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t.walletManagement}</Text>
        <View style={styles.exportButtons}>
          <TouchableOpacity
            style={[styles.exportButton, isProcessing && styles.disabledButton]}
            onPress={() => handleExport('mnemonic')}
            disabled={isProcessing}
          >
            <Text style={styles.exportButtonText}>{t.exportMnemonic}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, isProcessing && styles.disabledButton]}
            onPress={() => handleExport('privateKey')}
            disabled={isProcessing}
          >
            <Text style={styles.exportButtonText}>{t.exportPrivateKey}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteWallet}
        >
          <Text style={styles.deleteButtonText}>{t.deleteWallet}</Text>
        </TouchableOpacity>

        {/* Export Modal */}
        <Modal visible={modalType === 'export'} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.exportedCredentials}</Text>
              <Text style={styles.warningText}>
                {t.neverShareWarning}
              </Text>
              <View style={styles.mnemonicBox}>
                <Text style={styles.mnemonicText} selectable>
                  {exportedValue}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(exportedValue || '')}
              >
                <Text style={styles.copyButtonText}>{t.copy}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={closeModal}
              >
                <Text style={styles.primaryButtonText}>{t.done}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.walletSecurity}</Text>
          <Text style={styles.infoText}>
            - {t.securityTip1}{'\n'}
            - {t.securityTip2}{'\n'}
            - {t.securityTip3}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  walletContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  networkBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  networkText: {
    color: '#1565c0',
    fontWeight: '600',
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#f5f5f5',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#666',
  },
  rawBalance: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  addressCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  address: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 12,
  },
  copyAddressButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyAddressText: {
    color: '#333',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#fff3e0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#e65100',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButtonText: {
    color: '#c62828',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  mnemonicBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  mnemonicText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  copyButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
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
