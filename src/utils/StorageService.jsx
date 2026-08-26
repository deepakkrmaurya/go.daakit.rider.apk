
import { createMMKV } from 'react-native-mmkv'
const storage = createMMKV()

// Save (string or object)
export const setItem = (key, value) => {
  try {
    if (typeof value === 'object') {
      storage.set(key, JSON.stringify(value));
    } else {
      storage.set(key, value);
    }
  } catch (error) {
    console.log('Storage Set Error:', error);
  }
};

// Get (auto parse object)
export const getItem = (key) => {
  try {
    const value = storage.getString(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.log('Storage Get Error:', error);
    return null;
  }
};

// Remove
export const removeItem = (key) => {
  try {
    storage.delete(key);
  } catch (error) {
    console.log('Storage Remove Error:', error);
  }
};

// Clear all
export const clearStorage = () => {
  storage.clearAll();
};