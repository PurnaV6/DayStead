Pod::Spec.new do |s|
  s.name           = 'DaysteadAlarm'
  s.version        = '1.0.0'
  s.summary        = 'Daystead medication alarms'
  s.description    = 'Native AlarmKit bridge for Daystead'
  s.author         = 'Provifi'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: 'https://github.com/PurnaV6/DayStead.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
