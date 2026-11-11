import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { loadData, saveData } from './src/storage';
import SplitScreen from './src/screens/SplitScreen';
import AccountsScreen from './src/screens/AccountsScreen';

const INITIAL = {
  people: [], items: [], mode: 'items', total: '',
  taxPct: '0', tipPct: '0', roundUp: false,
  accounts: [], defaultId: null,
};

export default function App() {
  const [data, setData] = useState(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('split');

  useEffect(() => {
    loadData().then((d) => { if (d) setData({ ...INITIAL, ...d }); setLoaded(true); });
  }, []);

  useEffect(() => { if (loaded) saveData(data); }, [data, loaded]);

  const patch = useCallback((p) => setData((d) => ({ ...d, ...p })), []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {tab === 'split' ? (
            <SplitScreen
              data={data} patch={patch}
              accounts={data.accounts} defaultId={data.defaultId}
              goAccounts={() => setTab('accounts')}
            />
          ) : (
            <AccountsScreen
              accounts={data.accounts} defaultId={data.defaultId}
              setAccounts={(accounts) => patch({ accounts })}
              setDefaultId={(defaultId) => patch({ defaultId })}
            />
          )}
        </View>
        <View style={s.tabs}>
          {[['split', 'Chia tiền'], ['accounts', 'Tài khoản']].map(([k, label]) => (
            <Pressable key={k} style={s.tab} onPress={() => setTab(k)}>
              <Text style={[s.tabText, tab === k && s.tabOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7f9' },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e1e4e8', backgroundColor: '#fff' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  tabText: { color: '#888', fontWeight: '600' },
  tabOn: { color: '#2563eb' },
});
