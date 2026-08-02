import React from 'react';
import { View, Text } from 'react-native';

interface IconProps {
  color?: string;
  size?: number;
}

export const PlusIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '700', includeFontPadding: false }}>+</Text>
);

export const ArrowUpRightIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 14 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '700', includeFontPadding: false }}>↗</Text>
);

export const ArrowDownLeftIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 14 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '700', includeFontPadding: false }}>↙</Text>
);

// Professional Non-Stretching Home Icon
export const HomeIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Roof Triangle */}
    <View
      style={{
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: size * 0.45,
        borderRightWidth: size * 0.45,
        borderBottomWidth: size * 0.38,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      }}
    />
    {/* House Body */}
    <View
      style={{
        width: size * 0.65,
        height: size * 0.42,
        backgroundColor: color,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: -1,
      }}
    >
      {/* Door */}
      <View
        style={{
          width: size * 0.22,
          height: size * 0.26,
          backgroundColor: '#0F172A',
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      />
    </View>
  </View>
);

// Professional Credit Card / Expenses Icon
export const ExpensesIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.9,
        height: size * 0.65,
        borderRadius: 4,
        borderWidth: size * 0.08,
        borderColor: color,
        justifyContent: 'space-between',
        paddingVertical: size * 0.08,
      }}
    >
      <View style={{ width: '100%', height: size * 0.14, backgroundColor: color }} />
      <View style={{ flexDirection: 'row', paddingHorizontal: size * 0.1, gap: 2 }}>
        <View style={{ width: size * 0.22, height: size * 0.12, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  </View>
);

// Professional Profile / User Icon
export const ProfileIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Head Circle */}
    <View
      style={{
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: (size * 0.4) / 2,
        backgroundColor: color,
        marginBottom: size * 0.06,
      }}
    />
    {/* Body Arch */}
    <View
      style={{
        width: size * 0.75,
        height: size * 0.35,
        borderTopLeftRadius: size * 0.38,
        borderTopRightRadius: size * 0.38,
        backgroundColor: color,
      }}
    />
  </View>
);

// Professional Camera Icon
export const CameraIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 22 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.3,
        height: size * 0.12,
        backgroundColor: color,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        marginBottom: -1,
      }}
    />
    <View
      style={{
        width: size * 0.9,
        height: size * 0.65,
        borderRadius: 5,
        borderWidth: size * 0.08,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: (size * 0.35) / 2,
          borderWidth: size * 0.08,
          borderColor: color,
        }}
      />
    </View>
  </View>
);

// Professional Gallery / Image Icon
export const GalleryIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 22 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.88,
        height: size * 0.7,
        borderRadius: 4,
        borderWidth: size * 0.08,
        borderColor: color,
        padding: size * 0.08,
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          width: size * 0.18,
          height: size * 0.18,
          borderRadius: (size * 0.18) / 2,
          backgroundColor: color,
          alignSelf: 'flex-end',
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size * 0.18,
            borderRightWidth: size * 0.18,
            borderBottomWidth: size * 0.28,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size * 0.14,
            borderRightWidth: size * 0.14,
            borderBottomWidth: size * 0.2,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
      </View>
    </View>
  </View>
);

// Professional Mic Icon
export const MicIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 22 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.36,
        height: size * 0.55,
        borderRadius: size * 0.18,
        borderWidth: size * 0.08,
        borderColor: color,
      }}
    />
    <View
      style={{
        width: size * 0.6,
        height: size * 0.35,
        borderBottomLeftRadius: size * 0.3,
        borderBottomRightRadius: size * 0.3,
        borderWidth: size * 0.08,
        borderColor: color,
        borderTopWidth: 0,
        position: 'absolute',
        bottom: size * 0.15,
      }}
    />
    <View
      style={{
        width: size * 0.08,
        height: size * 0.15,
        backgroundColor: color,
        position: 'absolute',
        bottom: 0,
      }}
    />
  </View>
);

// Professional Document / Edit Note Icon
export const DocumentIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 22 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.75,
        height: size * 0.9,
        borderRadius: 3,
        borderWidth: size * 0.08,
        borderColor: color,
        padding: size * 0.1,
        justifyContent: 'space-around',
      }}
    >
      <View style={{ width: '80%', height: size * 0.08, backgroundColor: color }} />
      <View style={{ width: '100%', height: size * 0.08, backgroundColor: color }} />
      <View style={{ width: '60%', height: size * 0.08, backgroundColor: color }} />
    </View>
  </View>
);

// Professional Sparkles / Verified Icon
export const SparklesIcon: React.FC<IconProps> = ({ color = '#4F46E5', size = 18 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color: '#FFFFFF', fontSize: size * 0.6, fontWeight: '900', includeFontPadding: false }}>
      ✓
    </Text>
  </View>
);

// Professional Warning Icon
export const WarningIcon: React.FC<IconProps> = ({ color = '#EF4444', size = 20 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: size * 0.1,
      borderColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color, fontSize: size * 0.65, fontWeight: '900', includeFontPadding: false }}>
      !
    </Text>
  </View>
);

// Professional Phone Icon
export const PhoneIcon: React.FC<IconProps> = ({ color = '#6B7280', size = 16 }) => (
  <View
    style={{
      width: size * 0.6,
      height: size,
      borderRadius: 4,
      borderWidth: size * 0.08,
      borderColor: color,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 2,
    }}
  >
    <View style={{ width: size * 0.2, height: size * 0.06, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.15, height: size * 0.15, borderRadius: size * 0.075, borderWidth: size * 0.06, borderColor: color }} />
  </View>
);


