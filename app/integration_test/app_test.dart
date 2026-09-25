import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:app/app.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('app launches and shows the home screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: DesafioZrpApp()));
    await tester.pumpAndSettle();

    expect(find.text('Desafio ZRP'), findsOneWidget);
  });
}
