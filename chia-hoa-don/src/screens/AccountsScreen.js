import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BankPicker from '../components/BankPicker';
import { removeAccents } from '../vietqr';
import { uid } from '../storage';

export default function AccountsScreen({ accounts, defaultId, setAccounts, setDefaultId }) {
  const [bank, setBank] = useState(null);
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [picking, setPicking] = useState(false);

  const add = () => {
    const num = number.replace(/\s/g, '');
    if (!bank) return Alert.alert('Chọn ngân hàng');
    if (!/^\d{6,19}$/.test(num)) return Alert.alert('Số tài khoản không hợp lệ', 'Chỉ gồm 6–19 chữ số.');
    if (!holder.trim()) return Alert.alert('Nhập tên chủ tài khoản');

    const acc = {
      id: uid(), bin: bank.bin, bankName: bank.name, number: num,
      holder: removeAccents(holder).toUpperCase().trim(),
    };
    setAccounts([...accounts, acc]);
    if (!defaultId) setDefaultId(acc.id);
    setBank(null); setNumber(''); setHolder('');
  };

  const remove = (id) =>
    Alert.alert('Xoá tài khoản?', '', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive',
        onPress: () => {
          const rest = accounts.filter((a) => a.id !== id);
          setAccounts(rest);
          if (defaultId === id) setDefaultId(rest[0]?.id || null);
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Tài khoản nhận tiền</Text>

      <Pressable style={s.input} onPress={() => setPicking(true)}>
        <Text style={{ color: bank ? '#000' : '#999' }}>{bank ? bank.name : 'Chọn ngân hàng'}</Text>
      </Pressable>
      <TextInput style={s.input} placeholder="Số tài khoản" keyboardType="number-pad" value={number} onChangeText={setNumber} />
      <TextInput style={s.input} placeholder="Tên chủ tài khoản" autoCapitalize="characters" value={holder} onChangeText={setHolder} />
      <Pressable style={s.btn} onPress={add}><Text style={s.btnText}>Lưu tài khoản</Text></Pressable>

      <Text style={s.h2}>Đã lưu</Text>
      {accounts.length === 0 && <Text style={s.hint}>Chưa có tài khoản nào.</Text>}
      {accounts.map((a) => (
        <View key={a.id} style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.bank}>{a.bankName}{a.id === defaultId ? '  ★ mặc định' : ''}</Text>
            <Text style={s.num}>{a.number}</Text>
            <Text style={s.holder}>{a.holder}</Text>
          </View>
          <View style={{ gap: 10, alignItems: 'flex-end' }}>
            {a.id !== defaultId && (
              <Pressable onPress={() => setDefaultId(a.id)}><Text style={s.link}>Đặt mặc định</Text></Pressable>
            )}
            <Pressable onPress={() => remove(a.id)}><Text style={s.del}>Xoá</Text></Pressable>
          </View>
        </View>
      ))}

      <BankPicker visible={picking} onClose={() => setPicking(false)} onPick={(b) => { setBank(b); setPicking(false); }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e1e4e8', fontSize: 15, marginBottom: 10 },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  hint: { color: '#888' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e1e4e8' },
  bank: { fontWeight: '700', fontSize: 15 },
  num: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  holder: { color: '#666', marginTop: 2 },
  link: { color: '#2563eb', fontWeight: '600' },
  del: { color: '#d33' },
});
