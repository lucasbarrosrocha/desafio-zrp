class BackendApiException implements Exception {
  BackendApiException(this.message, {this.statusCode, this.cause});

  final String message;
  final int? statusCode;
  final Object? cause;

  @override
  String toString() => 'BackendApiException: $message';
}
