import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/Navigation';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Login'>>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
  };

  const signInWithPhoneNumber = async () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    
    if (!validatePhoneNumber(cleanedPhone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(`+91${cleanedPhone}`);
      setConfirm(confirmation);
      setIsCodeSent(true);
      setResendTimer(30);
    } catch (error) {
      console.error('Phone auth error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCode = async () => {
    if (!confirm) {
      Alert.alert('Error', 'Please request OTP first');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await confirm.confirm(code);
      navigation.navigate('CameraScreen');
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Verification Failed', 'Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendTimer > 0) return;
    
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    setIsLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(`+91${cleanedPhone}`);
      setConfirm(confirmation);
      setResendTimer(30);
      Alert.alert('OTP Resent', 'New verification code sent to your phone');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setConfirm(null);
    setIsCodeSent(false);
    setCode('');
    setResendTimer(0);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>📱</Text>
              </View>
              <Text style={styles.appName}>Secure Login</Text>
              <Text style={styles.tagline}>
                {!isCodeSent 
                  ? 'Enter your phone number to get started' 
                  : 'Enter the verification code sent to your phone'
                }
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {!isCodeSent ? (
                <>
                  <Text style={styles.title}>Phone Number</Text>
                  <Text style={styles.subtitle}>We'll send you a verification code</Text>
                  
                  <View style={styles.phoneInputContainer}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      value={phoneNumber}
                      onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                      placeholder="98765 43210"
                      keyboardType="phone-pad"
                      style={styles.phoneInput}
                      placeholderTextColor="#9CA3AF"
                      maxLength={12}
                      editable={!isLoading}
                    />
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      (!validatePhoneNumber(phoneNumber.replace(/\D/g, '')) || isLoading) && styles.disabledButton
                    ]}
                    onPress={signInWithPhoneNumber}
                    disabled={!validatePhoneNumber(phoneNumber.replace(/\D/g, '')) || isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Send OTP</Text>
                        <Text style={styles.buttonIcon}>→</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.title}>Verification Code</Text>
                  <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to{'\n'}
                    <Text style={styles.phoneHighlight}>+91 {formatPhoneNumber(phoneNumber)}</Text>
                  </Text>
                  
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="000000"
                    keyboardType="number-pad"
                    style={styles.otpInput}
                    placeholderTextColor="#9CA3AF"
                    maxLength={6}
                    editable={!isLoading}
                    textAlign="center"
                    letterSpacing={8}
                  />
                  
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      (code.length !== 6 || isLoading) && styles.disabledButton
                    ]}
                    onPress={confirmCode}
                    disabled={code.length !== 6 || isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                        <Text style={styles.buttonIcon}>✓</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  {/* Resend OTP */}
                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive code? </Text>
                    <TouchableOpacity
                      onPress={resendOTP}
                      disabled={resendTimer > 0 || isLoading}
                      style={styles.resendButton}
                    >
                      <Text style={[
                        styles.resendButtonText,
                        (resendTimer > 0 || isLoading) && styles.resendButtonTextDisabled
                      ]}>
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6366F1',
  },
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  phoneHighlight: {
    fontWeight: '600',
    color: '#6366F1',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  countryCode: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default Login;