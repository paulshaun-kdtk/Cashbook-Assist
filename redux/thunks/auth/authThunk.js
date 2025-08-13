import { clearAuth } from "@/redux/slices/auth/authSlice";
import { handleErrorWithOfflineSupport } from "@/utils/networkErrorDetection";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Storage from 'expo-sqlite/kv-store';
import * as WebBrowser from 'expo-web-browser';
import { account } from "../../appwrite/config";
import { appwriteCreds } from "../../appwrite/credentials";

WebBrowser.maybeCompleteAuthSession();

export const initAuth = () => async (dispatch) => {
  try {
    const authDataString = await Storage.getItem('auth');
    if (!authDataString) return;

    const authData = JSON.parse(authDataString);

    // If it looks like it's authenticated, verify it with Appwrite
    if (authData?.authenticated && authData?.user) {
      try {
        const currentUser = await account.get(); // Check Appwrite session
        dispatch({
          type: 'auth/restoreSession',
          payload: currentUser, // safer than trusting stale storage
        });
      } catch (error) {
        // Analyze the error to determine if it's network-related
        const errorAnalysis = handleErrorWithOfflineSupport(error, 'session_check');
        
        if (errorAnalysis.shouldActivateOfflineMode) {
          // Network error - keep user logged in but activate offline mode
          console.log('Network error during session check. Activating offline mode and keeping user authenticated.');
          console.log('Error details:', errorAnalysis.analysis);
          
          // Restore from stored auth data instead of clearing
          dispatch({
            type: 'auth/restoreSession',
            payload: authData.user,
          });
          
          // Note: The OfflineIndicator component will show offline status
          // The app will continue to work in offline mode with local data
        } else {
          // Authentication error or other non-network error - clear auth
          console.log('Authentication error during session check. Clearing stored auth.');
          console.log('Error type:', errorAnalysis.analysis.errorType);
          await Storage.removeItem('auth');
          dispatch(clearAuth());
        }
      }
    }
  } catch (error) {
    console.log('Error restoring auth:', error);
    
    // Even for top-level errors, check if it might be network-related
    const errorAnalysis = handleErrorWithOfflineSupport(error, 'auth_restore');
    
    if (!errorAnalysis.shouldActivateOfflineMode) {
      // Only clear auth if it's not a network error
      dispatch(clearAuth());
    }
  }
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password, username }, thunkAPI) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      // Save to Storage
      const authData = {
        user,
        unique_id: username,
        authenticated: true,
      };
      await Storage.setItem('auth', JSON.stringify(authData));

      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const googleLoginThunk = createAsyncThunk(
  "auth/googleLogin",
  async (_, thunkAPI) => {
    try {
      // Warm up the browser session first for faster loading
      await WebBrowser.warmUpAsync();
      
      // Create a unique state parameter to track this OAuth request
      const state = Date.now().toString();
      
      try {
        // Method 1: Try Appwrite's OAuth method with web gateway
        console.log('Attempting Appwrite OAuth with web gateway...');
        const sessionResult = await account.createOAuth2Session(
          'google',
          `https://shsoftwares.com/signin?mobile=true&state=${state}&redirect=cashbookassist://auth`, // success redirect to your web gateway
          `https://shsoftwares.com/signin?mobile=true&error=oauth_failed&redirect=cashbookassist://auth`  // failure redirect to your web gateway
        );
        console.log('Appwrite OAuth result:', sessionResult);
        return { initiated: true, method: 'appwrite', state };
      } catch (appwriteError) {
        console.log('Appwrite OAuth failed, trying manual approach:', appwriteError);
        
        // Method 2: Fallback - Manual OAuth URL construction and WebBrowser
        const projectId = appwriteCreds.projectId;
        // Use your web domain as OAuth gateway
        const successUrl = `https://shsoftwares.com/signin?mobile=true&state=${state}&redirect=cashbookassist://auth`;
        const failureUrl = `https://shsoftwares.com/signin?mobile=true&error=oauth_failed&redirect=cashbookassist://auth`;
        
        const oauthUrl = `https://cloud.appwrite.io/v1/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
        
        console.log('Opening OAuth URL:', oauthUrl);
        
        const result = await WebBrowser.openBrowserAsync(oauthUrl, {
          showTitle: false,
          enableBarCollapsing: false,
          browserPackage: undefined,
        });
        
        console.log('WebBrowser result:', result);
        return { initiated: true, method: 'manual', state, result };
      }
    } catch (error) {
      // Cool down browser if error occurs
      WebBrowser.coolDownAsync();
      console.error('Google OAuth error:', error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const webToMobileAuthThunk = createAsyncThunk(
  "auth/webToMobileAuth",
  async ({ token, jwt }, thunkAPI) => {
    try {
      console.log('Processing web-to-mobile auth with token/JWT...');
      
      if (jwt) {
        // Method 1: Use JWT if provided
        console.log('Setting JWT token...');
        await account.setJWT(jwt);
      } else if (token) {
        // Method 2: Use session token if provided
        console.log('Setting session token...');
        await account.setSession(token);
      } else {
        throw new Error('No token or JWT provided');
      }
      
      // Get user data after setting session
      const user = await account.get();
      console.log('User authenticated via web gateway:', user);
      
      // Save to Storage with the same structure as email login
      const authData = {
        user,
        unique_id: user.email,
        authenticated: true,
      };
      await Storage.setItem('auth', JSON.stringify(authData));
      
      return user;
    } catch (error) {
      console.error('Web-to-mobile auth error:', error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const completeOAuthThunk = createAsyncThunk(
  "auth/completeOAuth",
  async (_, thunkAPI) => {
    try {
      // This should be called after OAuth redirect completes
      const user = await account.get();

      // Save to Storage with the same structure as email login
      const authData = {
        user,
        unique_id: user.email,
        authenticated: true,
      };
      await Storage.setItem('auth', JSON.stringify(authData));

      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const checkSessionThunk = createAsyncThunk(
  "auth/checkSession",
  async (_, thunkAPI) => {
    try {
      const user = await account.get();
      
      // Save to Storage with the same structure as other auth methods
      const authData = {
        user,
        unique_id: user.email,
        authenticated: true,
      };
      await Storage.setItem('auth', JSON.stringify(authData));
      
      return user;
    } catch (error) {
      console.error('Session check error:', error);
      
      // Analyze the error to determine if it's network-related
      const errorAnalysis = handleErrorWithOfflineSupport(error, 'session_check');
      
      if (errorAnalysis.shouldActivateOfflineMode) {
        // Network error - try to restore from stored auth data
        try {
          const authDataString = await Storage.getItem('auth');
          if (authDataString) {
            const authData = JSON.parse(authDataString);
            if (authData?.authenticated && authData?.user) {
              console.log('Network error during session check. Using stored auth data and activating offline mode.');
              return authData.user; // Return stored user data
            }
          }
        } catch (storageError) {
          console.error('Failed to retrieve stored auth data:', storageError);
        }
        
        // If no stored auth data, still reject but with network error context
        return thunkAPI.rejectWithValue({
          error: 'network_error',
          message: 'Network unavailable. Please check your connection.',
          shouldRetry: true
        });
      } else {
        // Authentication error or other non-network error
        return thunkAPI.rejectWithValue({
          error: 'authentication_error',
          message: 'Session expired. Please sign in again.',
          shouldRetry: false
        });
      }
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await account.deleteSession("current");
      await Storage.removeItem('auth');
      return null;
    } catch (error) {
      console.error("Logout error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
