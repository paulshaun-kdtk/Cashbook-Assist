import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
// import * as Network from 'expo-network';
import { Text, View } from 'react-native';
// import { logError } from './custom_error_loging';
import Loader from '@/components/ui/loading';

export default function UpdatesChecker() {
  const [status, setStatus] = useState('Checking for updates...');
  const [isUpdating, setIsUpdating] = useState(false);

  const checkAndApplyUpdate = async () => {
    try {
      setIsUpdating(true);

      // Check network type
    //   const networkState = await Network.getNetworkStateAsync();
    //   if (networkState.type !== Network.NetworkStateType.WIFI) {
    //     setStatus('Update skipped: Wi-Fi required 🚫📶');
    //     logError('Update skipped: Wi-Fi required');
    //     return;
    //   }

      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setStatus('Update found. Downloading...');
        await Updates.fetchUpdateAsync();
        setStatus('Update downloaded. Applying update...');
        await Updates.reloadAsync();
      } else {
        setStatus('App is up to date ✅');
      }
    } catch (error) {
    console.error('Error checking for updates:', error);
      // logError(`Error checking for updates: ${error}`);
      setStatus('Failed to check for updates ❌');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    checkAndApplyUpdate();
  }, []);

  return (
    <View className="justify-center items-center">
      {isUpdating && (
        <>
            <Loader />
          <Text className="mt-2 text-cyan-700 font-semibold">{status}</Text>
        </>
      )}
    </View>
  );
}