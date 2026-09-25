import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

void main() {
  runApp(
    // Riverpod 3 retries a failing provider automatically (exponential
    // backoff) by default. Screens here surface errors with their own
    // explicit "Retry" action instead, so silent background retries are
    // switched off — otherwise a real failure would hang behind a spinner
    // for several seconds before the error state ever appears.
    ProviderScope(retry: (retryCount, error) => null, child: const DesafioZrpApp()),
  );
}
