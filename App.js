import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect } from 'react-native-svg';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { loadData, saveData } from './src/storage';
import SplitScreen from './src/screens/SplitScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import { C } from './src/theme';

const INITIAL = {
  people: [], items: [], mode: 'items', total: '', equalCount: '',
  taxPct: '0', tipPct: '0', roundUp: false,
  accounts: [], defaultId: null,
};

const TabIcon = ({ kind, color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {kind === 'split' ? (
      <>
        <Path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <Path d="M9 8h6M9 12h6" />
      </>
    ) : (
      <>
        <Rect x={3} y={6} width={18} height={13} rx={3} />
        <Path d="M3 10h18M16 15h2" />
      </>
    )}
  </Svg>
);

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
          {[['split', 'Chia tiền'], ['accounts', 'Tài khoản']].map(([k, label]) => {
            const color = tab === k ? C.accent : '#8A948F';
            return (
              <Pressable key={k} style={s.tab} onPress={() => setTab(k)}>
                <TabIcon kind={k} color={color} />
                <Text style={[s.tabText, { color }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: C.line, backgroundColor: '#fff', paddingTop: 8, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  tabText: { fontSize: 12, fontWeight: '700' },
});
