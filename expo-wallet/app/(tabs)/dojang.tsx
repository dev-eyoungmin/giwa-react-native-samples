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
} from 'react-native';
import { useDojang, useGiwaWallet, useNetworkInfo } from 'giwa-react-native-wallet';

export default function DojangScreen() {
  const { wallet, hasWallet } = useGiwaWallet();
  const { isFeatureAvailable } = useNetworkInfo();
  const {
    getAttestation,
    isAttestationValid,
    hasVerifiedAddress,
    getVerifiedBalance,
    isLoading,
    error,
  } = useDojang();

  const [attestationUid, setAttestationUid] = useState('');
  const [addressToCheck, setAddressToCheck] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [attestationDetails, setAttestationDetails] = useState<any>(null);

  const dojangAvailable = isFeatureAvailable('dojang');

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please create a wallet first</Text>
        <Text style={styles.subText}>Go to the Wallet tab to get started</Text>
      </View>
    );
  }

  if (!dojangAvailable) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Dojang Not Available</Text>
        <Text style={styles.subText}>
          This feature is not available on the current network yet.
        </Text>
        <Text style={[styles.subText, { marginTop: 10 }]}>
          Dojang attestation will be available when contracts are deployed.
        </Text>
      </View>
    );
  }

  const handleGetAttestation = async () => {
    if (!attestationUid) {
      Alert.alert('Error', 'Please enter an attestation UID');
      return;
    }

    try {
      setResult(null);
      setAttestationDetails(null);
      const attestation = await getAttestation(attestationUid as `0x${string}`);
      if (attestation) {
        setAttestationDetails(attestation);
        setResult('Attestation found! See details below.');
      } else {
        setResult('Attestation not found');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCheckValidity = async () => {
    if (!attestationUid) {
      Alert.alert('Error', 'Please enter an attestation UID');
      return;
    }

    try {
      setResult(null);
      const valid = await isAttestationValid(attestationUid as `0x${string}`);
      setResult(`Attestation is ${valid ? 'VALID' : 'INVALID'}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCheckVerifiedAddress = async () => {
    const addr = addressToCheck || wallet?.address;
    if (!addr) return;

    try {
      setResult(null);
      const verified = await hasVerifiedAddress(addr as `0x${string}`);
      setResult(
        `Address ${addr.slice(0, 10)}...${addr.slice(-8)} is ${
          verified ? 'VERIFIED' : 'NOT VERIFIED'
        }`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleGetVerifiedBalance = async () => {
    if (!attestationUid) {
      Alert.alert('Error', 'Please enter an attestation UID');
      return;
    }

    try {
      setResult(null);
      const balanceInfo = await getVerifiedBalance(attestationUid as `0x${string}`);
      if (balanceInfo) {
        setResult(
          `Verified Balance:\n` +
            `Balance: ${balanceInfo.balance.toString()} wei\n` +
            `Timestamp: ${new Date(Number(balanceInfo.timestamp) * 1000).toLocaleString()}`
        );
      } else {
        setResult('No verified balance found');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dojang</Text>
      <Text style={styles.subtitle}>
        EAS-based attestation verification for GIWA Chain
      </Text>

      {/* Attestation UID Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attestation Lookup</Text>
        <Text style={styles.sectionDescription}>
          Enter an attestation UID to look up or verify
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Attestation UID (0x...)"
          value={attestationUid}
          onChangeText={setAttestationUid}
          autoCapitalize="none"
        />
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.gridButton, isLoading && styles.disabledButton]}
            onPress={handleGetAttestation}
            disabled={isLoading}
          >
            <Text style={styles.gridButtonText}>Get Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridButton, isLoading && styles.disabledButton]}
            onPress={handleCheckValidity}
            disabled={isLoading}
          >
            <Text style={styles.gridButtonText}>Check Validity</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.secondaryButton, isLoading && styles.disabledButton]}
          onPress={handleGetVerifiedBalance}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#333" size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>Get Verified Balance</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Verification Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Verification</Text>
        <Text style={styles.sectionDescription}>
          Check if an address has been verified through Dojang
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Address (leave empty for your address)"
          value={addressToCheck}
          onChangeText={setAddressToCheck}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleCheckVerifiedAddress}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Check Verification</Text>
        </TouchableOpacity>
      </View>

      {/* Result Display */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Result</Text>
          <Text style={styles.resultText} selectable>
            {result}
          </Text>
        </View>
      )}

      {/* Attestation Details */}
      {attestationDetails && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Attestation Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Schema:</Text>
            <Text style={styles.detailValue} selectable>
              {attestationDetails.schema?.slice(0, 20)}...
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Attester:</Text>
            <Text style={styles.detailValue} selectable>
              {attestationDetails.attester?.slice(0, 20)}...
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipient:</Text>
            <Text style={styles.detailValue} selectable>
              {attestationDetails.recipient?.slice(0, 20)}...
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Revocable:</Text>
            <Text style={styles.detailValue}>
              {attestationDetails.revocable ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Revoked:</Text>
            <Text style={styles.detailValue}>
              {attestationDetails.revocationTime > 0 ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About Dojang</Text>
        <Text style={styles.infoText}>
          Dojang is GIWA Chain's attestation system based on Ethereum Attestation
          Service (EAS). It enables:{'\n\n'}
          - Identity verification{'\n'}
          - Balance attestations{'\n'}
          - Custom attestation schemas{'\n'}
          - On-chain reputation building
        </Text>
      </View>
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
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  gridButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  gridButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  resultCard: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
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
    lineHeight: 22,
    fontFamily: 'SpaceMono',
  },
  detailsCard: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#9c27b0',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#7b1fa2',
    fontFamily: 'SpaceMono',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
  },
  infoCard: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#f57c00',
    lineHeight: 22,
  },
});
