import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'chia-hoa-don:v2';

export async function loadData() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(data) {
  return AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
}

export const uid = () => Math.random().toString(36).slice(2, 9);
