import Storage from 'expo-sqlite/kv-store';
import { useEffect, useState } from 'react';

export function useStoredUsername() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsername() {
        try {
            const authString = await Storage.getItem('auth');
            if (!authString) return;
            
        const auth = JSON.parse(authString);
        if (auth?.unique_id) {
          setUsername(auth.unique_id);
        }
      } catch (error) {
        console.error("Failed to load username from Storage:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsername();
  }, []);

  return { username, loading };
}
