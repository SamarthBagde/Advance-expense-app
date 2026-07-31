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
import { Colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';


interface LoginScreenProps {
    navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const { colors } = useTheme();
    const { login, error, clearError } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async () => {
        setLocalError('');
        clearError();

        if (!username.trim()) {
            setLocalError('Please enter your username or email');
            return;
        }
        if (!password) {
            setLocalError('Please enter your password');
            return;
        }

        setIsSubmitting(true);
        try {
            await login(username.trim(), password);
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
                    {/* Header Badge & Title */}
                    <View style={styles.header}>
                        <View style={[styles.badge, { backgroundColor: colors.primaryGlow }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>EXPENSE TRACKER</Text>
                        </View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            Sign in to manage your budget & track expenses seamlessly.
                        </Text>
                    </View>

                    {/* Form Container */}
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
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.background,
                                        color: colors.textPrimary,
                                        borderColor: colors.surfaceLight,
                                    },
                                ]}
                                placeholder="Enter your username"
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

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
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
                                    placeholder="Enter your password"
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

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: colors.primary },
                                isSubmitting && { opacity: 0.7 },
                            ]}
                            onPress={handleLogin}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Footer Link */}
                        <View style={styles.footerRow}>
                            <Text style={[styles.footerText, { color: colors.textMuted }]}>
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={[styles.linkText, { color: colors.primary }]}>Sign Up</Text>
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
        minHeight: '100%',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
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
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
    },
    input: {
        height: 50,
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
        height: 50,
        justifyContent: 'center',
    },
    eyeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    submitBtn: {
        height: 52,
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