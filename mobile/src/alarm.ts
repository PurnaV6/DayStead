import {requireOptionalNativeModule} from 'expo-modules-core';
export type AlarmStatus='authorized'|'permission-required'|'unsupported'|'development-build-required';
interface NativeAlarm {status():Promise<AlarmStatus>;requestPermission():Promise<AlarmStatus>;replace(json:string):Promise<void>;stop(key:string):Promise<void>}
const native=requireOptionalNativeModule<NativeAlarm>('DaysteadAlarm');
export const alarmStatus=async():Promise<AlarmStatus>=>native?native.status():'development-build-required';
export const requestAlarmPermission=async():Promise<AlarmStatus>=>native?native.requestPermission():'development-build-required';
export async function replaceAlarms(rows:{key:string;at:number}[]){if(native)await native.replace(JSON.stringify(rows));else if(rows.length)throw new Error('Alarm mode needs a development build.');}
export async function stopAlarm(key:string){await native?.stop(key)}
