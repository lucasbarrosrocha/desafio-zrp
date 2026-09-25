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

  testWidgets('opens an episode and back preserves the list state, against the real backend', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: DesafioZrpApp()));
    await tester.pumpAndSettle(const Duration(seconds: 10));

    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), 'Pilot');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pumpAndSettle(const Duration(seconds: 10));

    final pilotCard = find.descendant(of: find.byType(ListView), matching: find.text('Pilot'));
    expect(pilotCard, findsOneWidget);

    await tester.tap(pilotCard);
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.text('Episode'), findsOneWidget);
    expect(find.text('S01E01 · Aired December 2, 2013'), findsOneWidget);
    // First character alphabetically, so it renders without scrolling the list.
    expect(find.text('Bepisian'), findsOneWidget);
    expect(find.widgetWithText(OutlinedButton, 'View details'), findsWidgets);

    await tester.pageBack();
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.text('Episode'), findsNothing);
    expect(tester.widget<TextField>(find.byType(TextField)).controller?.text, 'Pilot');
    expect(pilotCard, findsOneWidget);
  });

  testWidgets('opens a character bottom sheet showing its detail, against the real backend', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: DesafioZrpApp()));
    await tester.pumpAndSettle(const Duration(seconds: 10));

    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), 'Pilot');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pumpAndSettle(const Duration(seconds: 10));

    await tester.tap(find.descendant(of: find.byType(ListView), matching: find.text('Pilot')));
    await tester.pumpAndSettle(const Duration(seconds: 10));

    // First character alphabetically, so it renders without scrolling the list.
    await tester.tap(find.widgetWithText(OutlinedButton, 'View details').first);
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.text('Bepisian'), findsWidgets);
    expect(find.text('Status'), findsOneWidget);
    expect(find.text('Species'), findsOneWidget);
    expect(find.text('Alien'), findsOneWidget);

    await tester.tap(find.byTooltip('Close'));
    await tester.pumpAndSettle(const Duration(seconds: 10));

    expect(find.text('Status'), findsNothing);
    expect(find.text('S01E01 · Aired December 2, 2013'), findsOneWidget);
  });
}
