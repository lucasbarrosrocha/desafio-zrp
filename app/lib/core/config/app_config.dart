class AppConfig {
  AppConfig._();

  /// Defaults to the Android emulator's alias for the host machine's
  /// `localhost`, since that's where this project's real-consumption tests
  /// run. Override for an iOS simulator, a physical device, or desktop:
  /// `flutter run --dart-define=BACKEND_API_URL=http://localhost:3001`.
  static const String backendApiUrl = String.fromEnvironment(
    'BACKEND_API_URL',
    defaultValue: 'http://10.0.2.2:3001',
  );
}
