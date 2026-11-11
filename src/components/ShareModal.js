import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import BillCard from './BillCard';

export default function ShareModal({ visible, onClose, accounts, defaultId, title, amount, note, onGoAccounts }) {
  const ref = useRef(null);
  const [accId, setAccId] = useState(defaultId);

  useEffect(() => { if (visible) setAccId(defaultId || accounts[0]?.id); }, [visible, defaultId, accounts]);

  const account = accounts.find((a) => a.id === accId) || accounts[0];

  const share = async () => {
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      if (!(await Sharing.isAvailableAsync())) return Alert.alert('Không hỗ trợ chia sẻ trên thiết bị này');
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Chia sẻ hoá đơn' });
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || e));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>
        <View style={s.head}>
          <Text style={s.h1}>Chia sẻ hoá đơn</Text>
          <Pressable onPress={onClose}><Text style={s.close}>Đóng</Text></Pressable>
        </View>

        {!account ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>Chưa có tài khoản nhận tiền.</Text>
            <Pressable style={s.btn} onPress={onGoAccounts}><Text style={s.btnText}>Thêm tài khoản</Text></Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.body}>
            {accounts.length > 1 && (
              <View style={s.chips}>
                {accounts.map((a) => (
                  <Pressable key={a.id} onPress={() => setAccId(a.id)} style={[s.chip, a.id === account.id && s.chipOn]}>
                    <Text style={[s.chipText, a.id === account.id && { color: '#fff' }]}>
                      {a.bankName} · {a.number.slice(-4)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={s.shadow}>
              <BillCard ref={ref} account={account} amount={amount} title={title} note={note} />
            </View>
            <Pressable style={[s.btn, { marginTop: 20 }]} onPress={share}>
              <Text style={s.btnText}>Chia sẻ ảnh</Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7f9' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  h1: { fontSize: 20, fontWeight: '800' },
  close: { color: '#2563eb', fontWeight: '600' },
  body: { alignItems: 'center', padding: 16, paddingBottom: 48 },
  empty: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: '#666' },
  shadow: { borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#e8eaee' },
  chipOn: { backgroundColor: '#2563eb' },
  chipText: { fontWeight: '500' },
});
