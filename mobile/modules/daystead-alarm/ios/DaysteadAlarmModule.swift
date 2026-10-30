import ExpoModulesCore
import AlarmKit
import AppIntents
import SwiftUI
import CryptoKit

@available(iOS 26.0, *)
struct DaysteadAlarmMetadata: AlarmMetadata {}

@available(iOS 26.0, *)
struct SnoozeDaysteadAlarm: LiveActivityIntent {
  static var title: LocalizedStringResource = "Snooze Daystead alarm"
  static var openAppWhenRun: Bool = false
  @Parameter(title: "Alarm identifier") var alarmID: String
  init() {}
  init(id: String) { alarmID = id }
  func perform() async throws -> some IntentResult {
    guard let id = UUID(uuidString: alarmID) else { return .result() }
    try? AlarmManager.shared.stop(id: id)
    try await DaysteadAlarms.schedule(id: id, date: Date().addingTimeInterval(300))
    return .result()
  }
}

@available(iOS 26.0, *)
enum DaysteadAlarms {
  static func id(_ key: String) -> UUID {
    let bytes = Array(SHA256.hash(data: Data(key.utf8)).prefix(16))
    return UUID(uuid: (bytes[0],bytes[1],bytes[2],bytes[3],bytes[4],bytes[5],bytes[6],bytes[7],bytes[8],bytes[9],bytes[10],bytes[11],bytes[12],bytes[13],bytes[14],bytes[15]))
  }
  static func schedule(id: UUID, date: Date) async throws {
    // Fixed-date custom snooze avoids countdown presentations, which require a widget extension.
    let alert = AlarmPresentation.Alert(title: "Medicine reminder", stopButton: AlarmButton(text: "Stop", textColor: .white, systemImageName: "stop.fill"), secondaryButton: AlarmButton(text: "Snooze 5 min", textColor: .white, systemImageName: "zzz"), secondaryButtonBehavior: .custom)
    let attributes = AlarmAttributes(presentation: AlarmPresentation(alert: alert), metadata: DaysteadAlarmMetadata(), tintColor: Color.green)
    let config = AlarmManager.AlarmConfiguration(schedule: .fixed(date), attributes: attributes, secondaryIntent: SnoozeDaysteadAlarm(id: id.uuidString))
    _ = try await AlarmManager.shared.schedule(id: id, configuration: config)
  }
}

public class DaysteadAlarmModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DaysteadAlarm")
    AsyncFunction("status") { () -> String in
      if #available(iOS 26.0, *) { return AlarmManager.shared.authorizationState == .authorized ? "authorized" : "permission-required" }
      return "unsupported"
    }
    AsyncFunction("requestPermission") { () async throws -> String in
      if #available(iOS 26.0, *) { return try await AlarmManager.shared.requestAuthorization() == .authorized ? "authorized" : "permission-required" }
      return "unsupported"
    }
    AsyncFunction("replace") { (json: String) async throws in
      guard #available(iOS 26.0, *) else { if json == "[]" { return }; throw NSError(domain: "Daystead", code: 1, userInfo: [NSLocalizedDescriptionKey: "Alarm mode requires iOS 26 or later."]) }
      guard let data = json.data(using: .utf8), let rows = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { throw NSError(domain: "Daystead", code: 2) }
      let desired = Set(rows.compactMap { ($0["key"] as? String).map { DaysteadAlarms.id($0) } })
      if AlarmManager.shared.authorizationState != .authorized && rows.isEmpty { return }
      let existing = try AlarmManager.shared.alarms
      for alarm in existing where !desired.contains(alarm.id) { try AlarmManager.shared.cancel(id: alarm.id) }
      let existingIDs = Set(existing.map { $0.id })
      for row in rows {
        guard let key = row["key"] as? String, let ms = row["at"] as? Double else { continue }
        let id = DaysteadAlarms.id(key), date = Date(timeIntervalSince1970: ms / 1000)
        if date > Date() && !existingIDs.contains(id) { try await DaysteadAlarms.schedule(id: id, date: date) }
      }
    }
    AsyncFunction("stop") { (key: String) throws in
      if #available(iOS 26.0, *) { try AlarmManager.shared.stop(id: DaysteadAlarms.id(key)) }
    }
  }
}
