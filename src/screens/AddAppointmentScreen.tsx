import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppData } from '../context/AppDataContext';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Appointment } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddAppointment'>;

export default function AddAppointmentScreen({ navigation }: Props) {
  const { addOrUpdateAppointment } = useAppData();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [inDays, setInDays] = useState('1');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  async function save() {
    if (!title.trim()) return;
    const dateTime = new Date();
    dateTime.setDate(dateTime.getDate() + (parseInt(inDays, 10) || 0));
    const [hour, minute] = time.split(':').map(Number);
    dateTime.setHours(hour || 9, minute || 0, 0, 0);

    const appt: Appointment = {
      id: uuid(),
      title: title.trim(),
      location: location.trim(),
      dateTime: dateTime.toISOString(),
      notes: notes.trim(),
      remindersEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addOrUpdateAppointment(appt);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. GP appointment" />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="optional" />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>In how many days</Text>
          <TextInput style={styles.input} value={inDays} onChangeText={setInDays} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Time</Text>
          <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="HH:mm" />
        </View>
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="optional" multiline />

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Remind me 1 hour before</Text>
        <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} />
      </View>

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>Save appointment</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { ...typography.label, color: colors.muted, marginTop: spacing.md, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.panel,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
