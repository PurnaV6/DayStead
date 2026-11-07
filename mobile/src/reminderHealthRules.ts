// Turns what the phone reports into a plain pass/fail list for the reminder health check.
// Pure (no phone APIs), so it is unit-tested. null means "not checked yet" or "could not check".
export type RowState='pass'|'fail'|'unknown';
export type HealthAction='notifications'|'alarms'|'battery'|'test'|'restart';
export type HealthRow={key:HealthAction;title:string;detail:string;state:RowState;action?:{kind:HealthAction;label:string}};
export type RestartCheck='not-started'|'waiting'|'ask'|'passed'|'failed';
export type HealthInput={
 android:boolean;
 notifications:boolean|null;
 alarm:'authorized'|'permission-required'|'unsupported'|'development-build-required'|null;
 batteryRestricted:boolean|null;
 testReceived:boolean|null;
 testSending?:boolean;
 restart:RestartCheck;
};

export function healthRows(i:HealthInput):HealthRow[]{
 const rows:HealthRow[]=[];
 rows.push(i.notifications===true?{key:'notifications',state:'pass',title:'Notifications are allowed',detail:'DayStead can send you reminders.'}
  :i.notifications===false?{key:'notifications',state:'fail',title:'Notifications are off',detail:'DayStead cannot remind you until they are allowed.',action:{kind:'notifications',label:'Open settings'}}
  :{key:'notifications',state:'unknown',title:'Notifications',detail:'Not checked yet.'});
 if(i.android){
  rows.push(i.alarm==='authorized'?{key:'alarms',state:'pass',title:'Alarm-style reminders are allowed',detail:'Medicines set to ring can ring at the exact time.'}
   :i.alarm==='permission-required'?{key:'alarms',state:'fail',title:'Alarm-style reminders are not allowed',detail:'Needed for medicines set to ring like an alarm.',action:{kind:'alarms',label:'Allow alarm-style reminders'}}
   :i.alarm===null?{key:'alarms',state:'unknown',title:'Alarm-style reminders',detail:'Not checked yet.'}
   :{key:'alarms',state:'unknown',title:'Alarm-style reminders',detail:'Available in the full DayStead app from Google Play.'});
  rows.push(i.batteryRestricted===false?{key:'battery',state:'pass',title:'Battery saving is not limiting DayStead',detail:'Reminders are not held back to save battery.'}
   :i.batteryRestricted===true?{key:'battery',state:'fail',title:'Battery saving may delay reminders',detail:'Choose "All apps", find DayStead, and set it to "Unrestricted" or "Don\'t optimise".',action:{kind:'battery',label:'Open battery settings'}}
   :{key:'battery',state:'unknown',title:'Battery saving',detail:'Could not check on this phone. You can check it yourself in battery settings.',action:{kind:'battery',label:'Open battery settings'}});
 }
 rows.push(i.testSending?{key:'test',state:'unknown',title:'Test reminder',detail:'Sent. It should arrive in a few seconds.'}
  :i.testReceived===true?{key:'test',state:'pass',title:'Test reminder arrived',detail:'Reminders reach this phone.'}
  :i.testReceived===false?{key:'test',state:'fail',title:'Test reminder did not arrive',detail:'Check the rows above, then try again.',action:{kind:'test',label:'Send again'}}
  :{key:'test',state:'unknown',title:'Test reminder',detail:'Send one to check it arrives.',action:{kind:'test',label:'Send test'}});
 const restart:Record<RestartCheck,HealthRow>={
  'not-started':{key:'restart',state:'unknown',title:'After a restart',detail:'Check reminders still arrive after you turn your phone off and on.',action:{kind:'restart',label:'Start restart check'}},
  waiting:{key:'restart',state:'unknown',title:'After a restart',detail:'Restart your phone now. A test reminder should arrive about 3 minutes after you started. Then open DayStead again.'},
  ask:{key:'restart',state:'unknown',title:'After a restart',detail:'Did the test reminder arrive after the restart?'},
  passed:{key:'restart',state:'pass',title:'Reminders arrive after a restart',detail:'Checked on this phone.'},
  failed:{key:'restart',state:'fail',title:'Reminder did not arrive after a restart',detail:'Check battery saving above, then try again.',action:{kind:'restart',label:'Try again'}},
 };
 rows.push(restart[i.restart]);
 return rows;
}

// The restart check asks the user once the test reminder's time has passed.
export function restartState(stored:{dueAt:number;result?:'passed'|'failed'}|null,now:number):RestartCheck{
 if(!stored)return 'not-started';
 if(stored.result)return stored.result;
 return now>=stored.dueAt?'ask':'waiting';
}
