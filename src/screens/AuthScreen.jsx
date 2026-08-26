import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 👉 Auto biometric login on app open
  useEffect(() => {
    handleBiometricLogin();
  }, []);

  // ✅ Normal Login
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Enter username & password');
      return;
    }

    setLoading(true);

    try {
      // 🔹 Fake API call (replace with real API)
      const fakeToken = 'my_secure_token_123';

      // 🔐 Ask user to enable biometric
      Alert.alert(
        'Enable Biometric Login?',
        'Use Face ID / Fingerprint next time',
        [
          { text: 'No' },
          {
            text: 'Yes',
            onPress: async () => {
              await saveTokenWithBiometric(fakeToken);
            },
          },
        ]
      );

      Alert.alert('Success', 'Logged in!');
    } catch (e) {
      Alert.alert('Error', 'Login failed');
    }

    setLoading(false);
  };

  // 🔐 Save token securely with biometric protection
  const saveTokenWithBiometric = async (token) => {
    try {
      await Keychain.setGenericPassword('userToken', token, {
        service: 'user_token_service_bio',
        accessControl:
          Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      });

      Alert.alert('Success', 'Biometric enabled!');
    } catch (e) {
      console.log('Keychain error:', e);
    }
  };

  // 👆 Biometric Login
  const handleBiometricLogin = async () => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) return;

      const credentials = await Keychain.getGenericPassword({
        service: 'user_token_service_bio',
      });

      if (!credentials) return;

      // 👉 Trigger biometric prompt
      const result = await rnBiometrics.simplePrompt({
        promptMessage: 'Login with Biometrics',
      });

      if (result.success) {
        const token = credentials.password;

        Alert.alert('Welcome Back!', `Token: ${token}`);
        // 👉 Navigate to Home Screen here
      }
    } catch (e) {
      console.log('Biometric login error:', e);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Login
      </Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          marginBottom: 20,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <Button
        title={loading ? 'Loading...' : 'Login'}
        onPress={handleLogin}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Login with Biometrics"
          onPress={handleBiometricLogin}
        />
      </View>
    </View>
  );
}