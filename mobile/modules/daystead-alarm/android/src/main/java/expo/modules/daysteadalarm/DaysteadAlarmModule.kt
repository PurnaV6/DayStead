package expo.modules.daysteadalarm

import android.app.*
import android.content.*
import android.media.*
import android.net.Uri
import android.os.*
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject

internal object Alarms {
  fun manager(c: Context) = c.getSystemService(Context.ALARM_SERVICE) as AlarmManager
  fun allowed(c: Context) = Build.VERSION.SDK_INT < 31 || manager(c).canScheduleExactAlarms()
  fun prefs(c: Context) = c.getSharedPreferences("daystead-native-alarms", Context.MODE_PRIVATE)
  fun intent(c: Context, key: String) = Intent(c, AlarmReceiver::class.java).setData(Uri.parse("daystead-alarm:" + Uri.encode(key))).putExtra("key", key)
  fun pending(c: Context, key: String): PendingIntent = PendingIntent.getBroadcast(c, 0, intent(c,key), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  fun schedule(c: Context, key: String, at: Long) {
    if (!allowed(c)) throw SecurityException("Allow Alarms & reminders in phone settings.")
    manager(c).setAlarmClock(AlarmManager.AlarmClockInfo(at, PendingIntent.getActivity(c,0,c.packageManager.getLaunchIntentForPackage(c.packageName)!!,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)), pending(c,key))
  }
  @Synchronized fun replace(c: Context, json: String) {
    val rows=JSONArray(json); val next=mutableSetOf<String>(); val old=JSONArray(prefs(c).getString("queue","[]"))
    for(i in 0 until rows.length()) next.add(rows.getJSONObject(i).getString("key"))
    for(i in 0 until old.length()) { val key=old.getJSONObject(i).getString("key"); if(!next.contains(key)) { manager(c).cancel(pending(c,key)); if(prefs(c).getString("ringing",null)==key)c.stopService(Intent(c,RingingService::class.java)) } }
    if(rows.length()>0 && !allowed(c)) throw SecurityException("Alarm permission is off.")
    val previous=mutableSetOf<String>(); for(i in 0 until old.length())previous.add(old.getJSONObject(i).getString("key"))
    for(i in 0 until rows.length()){val row=rows.getJSONObject(i); val at=row.getLong("at"); if(at>System.currentTimeMillis() && !previous.contains(row.getString("key")))schedule(c,row.getString("key"),at)}
    for(i in 0 until rows.length()) { val row=rows.getJSONObject(i); if(row.getLong("at")<=System.currentTimeMillis()) { for(j in 0 until old.length()) { val previousRow=old.getJSONObject(j); if(previousRow.getString("key")==row.getString("key") && previousRow.getLong("at")>System.currentTimeMillis()) row.put("at",previousRow.getLong("at")) } } }
    prefs(c).edit().putString("queue",rows.toString()).apply()
  }
  fun restore(c: Context) {
    if(!allowed(c))return
    val rows=JSONArray(prefs(c).getString("queue","[]")); for(i in 0 until rows.length()){val row=rows.getJSONObject(i);if(row.getLong("at")>System.currentTimeMillis())schedule(c,row.getString("key"),row.getLong("at"))}
  }
  @Synchronized fun snooze(c: Context,key:String) {
    val at=System.currentTimeMillis()+300000; schedule(c,key,at)
    val old=JSONArray(prefs(c).getString("queue","[]")); val rows=JSONArray();for(i in 0 until old.length()){val row=old.getJSONObject(i);if(row.getString("key")!=key)rows.put(row)}
    rows.put(JSONObject().put("key",key).put("at",at));prefs(c).edit().putString("queue",rows.toString()).apply()
  }
}
class DaysteadAlarmModule: Module() {
  override fun definition() = ModuleDefinition {
    Name("DaysteadAlarm")
    AsyncFunction("status") { if(Alarms.allowed(appContext.reactContext!!)) "authorized" else "permission-required" }
    AsyncFunction("requestPermission") {
      val c=appContext.reactContext!!
      if(!Alarms.allowed(c) && Build.VERSION.SDK_INT>=31)c.startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,Uri.parse("package:"+c.packageName)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      if(Alarms.allowed(c)) "authorized" else "permission-required"
    }
    AsyncFunction("replace") { json:String -> Alarms.replace(appContext.reactContext!!,json) }
    AsyncFunction("stop") { key:String -> val c=appContext.reactContext!!; if(Alarms.prefs(c).getString("ringing",null)==key)c.stopService(Intent(c,RingingService::class.java)) }
  }
}
class RestoreAlarmsReceiver: BroadcastReceiver(){override fun onReceive(c:Context,i:Intent){Alarms.restore(c)}}
class AlarmReceiver: BroadcastReceiver(){override fun onReceive(c:Context,i:Intent){val key=i.getStringExtra("key")?:return;c.startForegroundService(Intent(c,RingingService::class.java).putExtra("key",key))}}
class RingingService: Service(){
  private var player:MediaPlayer?=null
  private var vibrator:Vibrator?=null
  private val handler=Handler(Looper.getMainLooper())
  override fun onBind(intent:Intent?) : IBinder? = null
  override fun onStartCommand(intent:Intent?, flags:Int, startId:Int):Int {
    val key=intent?.getStringExtra("key")?:return START_NOT_STICKY
    if(intent.action=="STOP"||intent.action=="SNOOZE"){
      if(intent.action=="SNOOZE") { try { Alarms.snooze(this,key) } catch(_:SecurityException) { /* Permission revoked: cannot schedule an exact snooze. */ } }
      stopSelf();return START_NOT_STICKY
    }
    val nm=getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel=NotificationChannel("daystead-alarm","Medication alarms",NotificationManager.IMPORTANCE_HIGH);channel.setSound(null,null);nm.createNotificationChannel(channel)
    fun action(name:String)=PendingIntent.getService(this,0,Intent(this,RingingService::class.java).setAction(name).setData(Uri.parse("daystead-action:"+name+Uri.encode(key))).putExtra("key",key),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val open=packageManager.getLaunchIntentForPackage(packageName)!!
    val notice=Notification.Builder(this,"daystead-alarm").setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle("Medicine reminder").setContentText("Stop silences this alarm. Record taken separately in Daystead.").setCategory(Notification.CATEGORY_ALARM).setOngoing(true).setContentIntent(PendingIntent.getActivity(this,0,open,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)).addAction(Notification.Action.Builder(null,"Stop",action("STOP")).build()).addAction(Notification.Action.Builder(null,"Snooze 5 min",action("SNOOZE")).build()).build()
    startForeground(42001,notice)
    Alarms.prefs(this).edit().putString("ringing",key).apply()
    player?.release()
    val audio=AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
    try { player=MediaPlayer().apply{setAudioAttributes(audio);setDataSource(this@RingingService,RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)?:RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION));isLooping=true;prepare();start()} } catch(_:Exception){player?.release();player=null}
    @Suppress("DEPRECATION")
    val vib=getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    vibrator=vib;vib.vibrate(VibrationEffect.createWaveform(longArrayOf(0,700,400,700,1200),0),audio)
    handler.removeCallbacksAndMessages(null);handler.postDelayed({stopSelf()},600000)
    return START_NOT_STICKY
  }
  override fun onDestroy(){handler.removeCallbacksAndMessages(null);player?.release();vibrator?.cancel();Alarms.prefs(this).edit().remove("ringing").apply();super.onDestroy()}
}
