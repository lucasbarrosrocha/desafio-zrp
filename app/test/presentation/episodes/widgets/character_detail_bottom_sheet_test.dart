import 'package:app/core/errors/backend_api_exception.dart';
import 'package:app/domain/entities/character_detail.dart';
import 'package:app/domain/entities/character_summary.dart';
import 'package:app/domain/repositories/character_repository.dart';
import 'package:app/presentation/episodes/providers/character_providers.dart';
import 'package:app/presentation/episodes/widgets/character_list_item.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeCharacterRepository implements CharacterRepository {
  _FakeCharacterRepository(this._details);

  final Map<int, CharacterDetail> _details;
  final List<int> calls = [];
  Object? errorToThrow;

  @override
  Future<CharacterDetail> getCharacterDetail(int id) async {
    calls.add(id);
    if (errorToThrow != null) {
      final error = errorToThrow!;
      errorToThrow = null;
      throw error;
    }
    final detail = _details[id];
    if (detail == null) {
      throw BackendApiException('Backend API responded with status 404', statusCode: 404);
    }
    return detail;
  }
}

CharacterDetail _characterDetail({String type = ''}) {
  return CharacterDetail(
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: type,
    gender: 'Male',
    origin: 'Earth (C-137)',
    location: 'Citadel of Ricks',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  );
}

Widget _wrap(CharacterRepository repository, {int characterId = 1, String characterName = 'Rick Sanchez'}) {
  return ProviderScope(
    // Matches main.dart: automatic retries are off, so an error surfaces
    // as soon as the first failed call resolves.
    retry: (retryCount, error) => null,
    overrides: [characterRepositoryProvider.overrideWithValue(repository)],
    child: MaterialApp(
      home: Scaffold(
        body: CharacterListItem(
          character: CharacterSummary(id: characterId, name: characterName, image: 'https://example.com/x.jpeg'),
        ),
      ),
    ),
  );
}

void main() {
  testWidgets('opening a character shows a loading indicator then its detail', (tester) async {
    final repository = _FakeCharacterRepository({1: _characterDetail()});

    await tester.pumpWidget(_wrap(repository));
    await tester.tap(find.widgetWithText(OutlinedButton, 'View details'));
    await tester.pump();

    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    await tester.pumpAndSettle();

    expect(find.text('Alive'), findsOneWidget);
    expect(find.text('Human'), findsOneWidget);
    expect(find.text('Earth (C-137)'), findsOneWidget);
    expect(find.text('Citadel of Ricks'), findsOneWidget);
    expect(repository.calls, [1]);
  });

  testWidgets('omits the Type row when the character has no type', (tester) async {
    final repository = _FakeCharacterRepository({1: _characterDetail(type: '')});

    await tester.pumpWidget(_wrap(repository));
    await tester.tap(find.widgetWithText(OutlinedButton, 'View details'));
    await tester.pumpAndSettle();

    expect(find.text('Type'), findsNothing);
  });

  testWidgets('shows the Type row when the character has one', (tester) async {
    final repository = _FakeCharacterRepository({1: _characterDetail(type: 'Parasite')});

    await tester.pumpWidget(_wrap(repository));
    await tester.tap(find.widgetWithText(OutlinedButton, 'View details'));
    await tester.pumpAndSettle();

    expect(find.text('Type'), findsOneWidget);
    expect(find.text('Parasite'), findsOneWidget);
  });

  testWidgets('shows a not-found message for a 404, with no retry button', (tester) async {
    final repository = _FakeCharacterRepository({});

    await tester.pumpWidget(_wrap(repository, characterId: 999));
    await tester.tap(find.widgetWithText(OutlinedButton, 'View details'));
    await tester.pumpAndSettle();

    expect(find.text('Character not found'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, 'Retry'), findsNothing);
  });

  testWidgets('shows an error state with a working retry button for other failures', (tester) async {
    final repository = _FakeCharacterRepository({1: _characterDetail()})..errorToThrow = Exception('network down');

    await tester.pumpWidget(_wrap(repository));
    await tester.tap(find.widgetWithText(OutlinedButton, 'View details'));
    await tester.pumpAndSettle();

    expect(find.text('Could not load this character. Please try again.'), findsOneWidget);

    await tester.tap(find.widgetWithText(FilledButton, 'Retry'));
    await tester.pumpAndSettle();

    expect(find.text('Alive'), findsOneWidget);
  });

  testWidgets('closes when the close button is tapped, and reopening fetches fresh', (tester) async {
    // Unlike the web modal (a React component that stays mounted the whole
    // time, so its local state survives closing), showModalBottomSheet pops
    // its route entirely on close: the ConsumerWidget watching
    // characterDetailProvider is torn down, the autoDispose provider goes
    // with it, and reopening rebuilds it from scratch — so a second fetch
    // for the same character on reopen is expected, not a bug.
    final repository = _FakeCharacterRepository({1: _characterDetail()});

    await tester.pumpWidget(_wrap(repository));
    await tester.tap(find.widgetWithText(OutlinedButton, 'View details'));
    await tester.pumpAndSettle();

    expect(find.text('Alive'), findsOneWidget);

    await tester.tap(find.byTooltip('Close'));
    await tester.pumpAndSettle();

    expect(find.text('Alive'), findsNothing);

    await tester.tap(find.widgetWithText(OutlinedButton, 'View details'));
    await tester.pumpAndSettle();

    expect(find.text('Alive'), findsOneWidget);
    expect(repository.calls, [1, 1]);
  });
}
