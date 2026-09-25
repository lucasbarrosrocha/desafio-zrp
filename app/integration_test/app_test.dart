import 'package:app/app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

/// Drives the real app against the real backend (`BACKEND_API_URL`, default
/// `http://10.0.2.2:3001` for the Android emulator) — start `backend/`
/// (`npm run dev`) before running this suite.
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('lists episodes, searches, and paginates against the real backend', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: DesafioZrpApp()));
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.text('Desafio ZRP'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(find.textContaining('Page 1 of'), findsOneWidget);

    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), 'Pilot');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.descendant(of: find.byType(ListView), matching: find.text('Pilot')), findsOneWidget);

    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), '');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pumpAndSettle(const Duration(seconds: 10));

    final nextPageButton = find.byTooltip('Next page');
    expect(nextPageButton, findsOneWidget);

    await tester.tap(nextPageButton);
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.textContaining('Page 2 of'), findsOneWidget);

    await tester.tap(find.byTooltip('Previous page'));
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.textContaining('Page 1 of'), findsOneWidget);
  });
}
