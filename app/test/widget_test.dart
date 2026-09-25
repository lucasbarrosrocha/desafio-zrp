import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:app/app.dart';

void main() {
  testWidgets('Home screen shows the project heading', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: DesafioZrpApp()));

    expect(find.text('Desafio ZRP'), findsOneWidget);
  });
}
