import 'package:app/core/errors/backend_api_exception.dart';
import 'package:app/domain/entities/character_summary.dart';
import 'package:app/domain/entities/episode_detail.dart';
import 'package:app/domain/entities/episodes_page.dart';
import 'package:app/domain/repositories/episode_repository.dart';
import 'package:app/presentation/episodes/episode_detail_screen.dart';
import 'package:app/presentation/episodes/providers/episode_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeEpisodeRepository implements EpisodeRepository {
  _FakeEpisodeRepository(this._details);

  final Map<int, EpisodeDetail> _details;
  final List<int> calls = [];
  Object? errorToThrow;

  @override
  Future<EpisodeDetail> getEpisodeDetail(int id) async {
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

  @override
  Future<EpisodesPage> listEpisodes({String? search, int page = 1}) {
    throw UnimplementedError();
  }
}

EpisodeDetail _episodeDetail({List<CharacterSummary> characters = const []}) {
  return EpisodeDetail(
    id: 1,
    name: 'Pilot',
    airDate: 'December 2, 2013',
    episodeCode: 'S01E01',
    characters: characters,
  );
}

Widget _wrap(EpisodeRepository repository, {int episodeId = 1}) {
  return ProviderScope(
    // Matches main.dart: automatic retries are off, so an error surfaces
    // as soon as the first failed call resolves.
    retry: (retryCount, error) => null,
    overrides: [episodeRepositoryProvider.overrideWithValue(repository)],
    child: MaterialApp(home: EpisodeDetailScreen(episodeId: episodeId)),
  );
}

void main() {
  testWidgets('shows a loading indicator then the episode and its characters', (tester) async {
    final repository = _FakeEpisodeRepository({
      1: _episodeDetail(
        characters: const [
          CharacterSummary(id: 1, name: 'Rick Sanchez', image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'),
        ],
      ),
    });

    await tester.pumpWidget(_wrap(repository));

    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    await tester.pumpAndSettle();

    expect(find.text('Pilot'), findsOneWidget);
    expect(find.text('S01E01 · Aired December 2, 2013'), findsOneWidget);
    expect(find.text('Rick Sanchez'), findsOneWidget);
  });

  testWidgets('renders an enabled View details button per character', (tester) async {
    final repository = _FakeEpisodeRepository({
      1: _episodeDetail(
        characters: const [
          CharacterSummary(id: 1, name: 'Rick Sanchez', image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'),
        ],
      ),
    });

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    // The bottom sheet's own behavior (loading/data/not-found/error/close)
    // is covered by character_detail_bottom_sheet_test.dart.
    final button = tester.widget<OutlinedButton>(find.widgetWithText(OutlinedButton, 'View details'));
    expect(button.onPressed, isNotNull);
  });

  testWidgets('shows an empty state when the episode has no characters', (tester) async {
    final repository = _FakeEpisodeRepository({1: _episodeDetail()});

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    expect(find.text('No characters found for this episode.'), findsOneWidget);
  });

  testWidgets('shows a not-found state for a 404, with no retry button', (tester) async {
    final repository = _FakeEpisodeRepository({});

    await tester.pumpWidget(_wrap(repository, episodeId: 999));
    await tester.pumpAndSettle();

    expect(find.text('Episode not found'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, 'Retry'), findsNothing);
  });

  testWidgets('shows an error state with a working retry button for other failures', (tester) async {
    final repository = _FakeEpisodeRepository({1: _episodeDetail()})..errorToThrow = Exception('network down');

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    expect(find.text('Could not load this episode. Please try again.'), findsOneWidget);
    expect(find.text('Pilot'), findsNothing);

    await tester.tap(find.widgetWithText(FilledButton, 'Retry'));
    await tester.pumpAndSettle();

    expect(find.text('Pilot'), findsOneWidget);
  });
}
