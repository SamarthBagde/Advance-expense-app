import React, { useEffect } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import QuickActions from 'react-native-quick-actions';
import { useExpense } from '../context/ExpenseContext';

export const QuickActionListener: React.FC = () => {
  const { openAddModal, openScanModal, openVoiceModal } = useExpense();

  useEffect(() => {
    // Define Quick Launch Shortcut Items for Home Screen Icon Long-Press
    try {
      QuickActions.setShortcutItems([
        {
          type: 'add_expense',
          title: 'Add Expense',
          subtitle: 'Record expense manually',
          icon: Platform.OS === 'ios' ? 'Compose' : 'add_icon',
          userInfo: { url: 'add' } as any,
        },
        {
          type: 'scan_receipt',
          title: 'Scan Receipt',
          subtitle: 'Scan bill photo with camera',
          icon: Platform.OS === 'ios' ? 'CapturePhoto' : 'scan_icon',
          userInfo: { url: 'scan' } as any,
        },
        {
          type: 'voice_entry',
          title: 'Voice Entry',
          subtitle: 'Speak transaction details',
          icon: Platform.OS === 'ios' ? 'Audio' : 'mic_icon',
          userInfo: { url: 'voice' } as any,
        },
      ]);
    } catch (err) {
      console.warn('Failed to set quick action items:', err);
    }

    const handleShortcut = (action: any) => {
      if (!action || !action.type) return;

      switch (action.type) {
        case 'add_expense':
          openAddModal();
          break;
        case 'scan_receipt':
          openScanModal();
          break;
        case 'voice_entry':
          openVoiceModal();
          break;
      }
    };

    // Handle cold start launch from Quick Action shortcut
    QuickActions.popInitialAction()
      .then((action: any) => {
        if (action) {
          setTimeout(() => handleShortcut(action), 400);
        }
      })
      .catch((err: any) => console.warn('QuickAction popInitialAction error:', err));


    // Handle background / active launch from Quick Action shortcut
    const subscription = DeviceEventEmitter.addListener('quickActionShortcut', (action: any) => {
      handleShortcut(action);
    });

    return () => {
      subscription.remove();
    };
  }, [openAddModal, openScanModal, openVoiceModal]);

  return null;
};

