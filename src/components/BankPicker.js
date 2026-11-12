import React, { useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BANKS } from '../banks';
import { removeAccents } from '../vietqr';
import { C } from '../theme';

export default function BankPicker({ visible, onClose, onPick }) {
  const [q, setQ] = useState('');
  const key = removeAccents(q).toLowerCase();
  const data = BANKS.filter((b) => removeAccents(b.name).toLowerCase().includes(key) || b.bin.includes(key));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>
        <View style={s.head}>
          <TextInput style={s.input} placeholder="Tìm ngân hàng" placeholderTextColor={C.faint}
            value={q} onChangeText={setQ} autoFocus />
          <Pressable onPress={onClose}><Text style={s.close}>Đóng</Text></Pressable>
        </View>
        <FlatList
          data={data}
          keyExtractor={(b) => b.bin}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={s.row} onPress={() => { onPick(item); setQ(''); }}>
              <View style={s.logo}><Text style={s.logoText}>{item.name.charAt(0)}</Text></View>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.bin}>{item.bin}</Text>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 14, height: 48, paddingHorizontal: 14, fontSize: 15, color: C.ink },
  close: { color: C.accent, fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: C.line },
  logo: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: C.accentText, fontWeight: '800' },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: C.ink },
  bin: { color: C.faint, fontSize: 13 },
});
