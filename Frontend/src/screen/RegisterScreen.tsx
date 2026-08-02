import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface RegisterScreenProps {
    navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const { colors } = useTheme();
    const { register, error, clearError } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async () => {
        setLocalError('');
        clearError();

        if (!username.trim()) {
            setLocalError('Please choose a username');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setLocalError('Please enter a valid email address');
            return;
        }
        if (!password) {
            setLocalError('Please enter a password');
            return;
        }
        if (password.length < 8) {
            setLocalError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(username.trim(), email.trim(), password, phone.trim() || undefined);
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayError = localError || error;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            Join us to track income, budget expenses, and reach your money goals.
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View
                        style={[
                            styles.card,
                            { backgroundColor: colors.surface, borderColor: colors.surfaceLight },
                        ]}
                    >
                        {displayError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{displayError}</Text>
                            </View>
                        ) : null}

                        {/* Username Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Username <Text style={{ color: colors.danger }}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background,
                                        color: colors.textPrimary,
                                        borderColor: colors.surfaceLight,
                                    },
                                ]}
                                placeholder="Choose a unique username"
                                placeholderTextColor={colors.textMuted}
                                value={username}
                                onChangeText={(text) => {
                                    setUsername(text);
                                    if (displayError) {
                                        setLocalError('');
                                        clearError();
                                    }
                                }}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Email <Text style={{ color: colors.danger }}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background,
                                        color: colors.textPrimary,
                                        borderColor: colors.surfaceLight,
                                    },
                                ]}
                                placeholder="name@example.com"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (displayError) {
                                        setLocalError('');
                                        clearError();
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Phone Input (Optional) */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number (Optional)</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background,
                                        color: colors.textPrimary,
                                        borderColor: colors.surfaceLight,
                                    },
                                ]}
                                placeholder="+1 234 567 890"
                                placeholderTextColor={colors.textMuted}
                                value={phone}
                                onChangeText={(text) => setPhone(text)}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Password <Text style={{ color: colors.danger }}>*</Text>
                            </Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.passwordInput,
                                        {
                                            backgroundColor: colors.background,
                                            color: colors.textPrimary,
                                            borderColor: colors.surfaceLight,
                                        },
                                    ]}
                                    placeholder="At least 8 characters"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (displayError) {
                                            setLocalError('');
                                            clearError();
                                        }
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeBtn}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                >
                                    <Text style={[styles.eyeText, { color: colors.primary }]}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Confirm Password <Text style={{ color: colors.danger }}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background,
                                        color: colors.textPrimary,
                                        borderColor: colors.surfaceLight,
                                    },
                                ]}
                                placeholder="Re-enter your password"
                                placeholderTextColor={colors.textMuted}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (displayError) {
                                        setLocalError('');
                                        clearError();
                                    }
                                }}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: colors.primary },
                                isSubmitting && { opacity: 0.7 },
                            ]}
                            onPress={handleRegister}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        {/* Login Footer Link */}
                        <View style={styles.footerRow}>
                            <Text style={[styles.footerText, { color: colors.textMuted }]}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    errorContainer: {
        backgroundColor: '#FF3B3020',
        borderWidth: 1,
        borderColor: '#FF3B30',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    passwordWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    passwordInput: {
        paddingRight: 60,
    },
    eyeBtn: {
        position: 'absolute',
        right: 16,
        height: 48,
        justifyContent: 'center',
    },
    eyeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    submitBtn: {
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        elevation: 3,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '700',
    },
});