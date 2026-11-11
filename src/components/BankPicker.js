import React, { useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BANKS } from '../banks';
import { removeAccents } from '../vietqr';

export default function BankPicker({ visible, onClose, onPick }) {
  const [q, setQ] = useState('');
  const key = removeAccents(q).toLowerCase();
  const data = BANKS.filter((b) => removeAccents(b.name).toLowerCase().includes(key) || b.bin.includes(key));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>
        <View style={s.head}>
          <TextInput style={s.input} placeholder="Tìm ngân hàng" value={q} onChangeText={setQ} autoFocus />
          <Pressable onPress={onClose}><Text style={s.close}>Đóng</Text></Pressable>
        </View>
        <FlatList
          data={data}
          keyExtractor={(b) => b.bin}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={s.row} onPress={() => { onPick(item); setQ(''); }}>
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
  safe: { flex: 1, backgroundColor: '#fff' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  input: { flex: 1, backgroundColor: '#f1f3f5', borderRadius: 10, padding: 12, fontSize: 15 },
  close: { color: '#2563eb', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16 },
  bin: { color: '#999' },
});
