import React from 'react';
import { Text } from 'react-native';

interface IconProps {
  color?: string;
  size?: number;
}

export const PlusIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 16 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '700' }}>+</Text>
);

export const ArrowUpRightIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 14 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '700' }}>↗</Text>
);

export const ArrowDownLeftIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 14 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '700' }}>↙</Text>
);

export const HomeIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20 }) => (
  <Text style={{ color, fontSize: size }}>🏠</Text>
);

export const ExpensesIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20 }) => (
  <Text style={{ color, fontSize: size }}>💳</Text>
);

export const ProfileIcon: React.FC<IconProps> = ({ color = '#FFFFFF', size = 20 }) => (
  <Text style={{ color, fontSize: size }}>👤</Text>
);
