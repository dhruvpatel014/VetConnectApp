import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PawPrint, Smartphone, Lock, Activity, ShieldCheck, User } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';
import { useRouter } from 'expo-router';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          <LinearGradient
            colors={[colors.primary.main, colors.primary.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.iconWrapper}>
              <PawPrint size={32} color={colors.primary.emerald300} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>VetConnect</Text>
            <Text style={styles.subtitle}>RURAL VETERINARY PLATFORM</Text>
          </LinearGradient>

          <View style={styles.formContainer}>
            <Input
              label="Mobile / Email"
              placeholder="e.g. 9876543210"
              icon={<Smartphone size={16} color={colors.text.muted} />}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            
            <Input
              label="Password"
              placeholder="••••••••"
              icon={<Lock size={16} color={colors.text.muted} />}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </View>

            <Button 
              label={isLoading ? "Signing In..." : "Sign In"} 
              onPress={handleLogin}
              disabled={isLoading}
            />

            <Badge
              variant="warning"
              label="Offline mode available after first login"
            />

            <View style={styles.rolesContainer}>
              <Text style={styles.rolesTitle}>Platform Supported For</Text>
              <View style={styles.rolesList}>
                <Badge label="Veterinarian" />
                <Badge label="Farmer" />
                <Badge label="Admin" />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.default },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { paddingTop: 80, paddingBottom: 80, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  iconWrapper: { width: 64, height: 64, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  title: { color: colors.white, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: colors.primary.emerald100, fontSize: 10, fontWeight: 'medium', letterSpacing: 0.5, marginTop: 6 },
  formContainer: { flex: 1, backgroundColor: colors.background.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 20, elevation: 10 },
  forgotPasswordContainer: { alignItems: 'flex-end', marginTop: -8, marginBottom: 16 },
  forgotPasswordText: { color: colors.primary.light, fontSize: 14, fontWeight: 'bold' },
  rolesContainer: { marginTop: 40 },
  rolesTitle: { fontSize: 10, color: colors.text.muted, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  rolesList: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
});
