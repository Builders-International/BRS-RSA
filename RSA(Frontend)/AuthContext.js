import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Use your custom native redirect URI for standalone builds.
  // (This value is generated from app.json’s scheme if not overridden.)
  const redirectUri = makeRedirectUri({ native: 'com.egod21.ReceiptSorterApp://' });
  console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = useAuthRequest({
    iosClientId: '163742226090-rkqm4uhjkdpkcu8e1m5q04rsl9rcasfa.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    expoClientId: '163742226090-mj1t94rahvr13f7ltq83ff9p37b1a31c.apps.googleusercontent.com',
    redirectUri,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchUserInfo = async (accessToken) => {
    try {
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const userInfo = await res.json();
      setUser(userInfo);
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  const signIn = async () => {
    if (!request) return;
    await promptAsync();
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, request }}>
      {children}
    </AuthContext.Provider>
  );
}