import 'package:app/domain/entities/episode.dart';
import 'package:app/domain/entities/episode_detail.dart';
import 'package:app/domain/entities/episodes_page.dart';
import 'package:app/domain/repositories/episode_repository.dart';
import 'package:app/presentation/episodes/episode_list_screen.dart';
import 'package:app/presentation/episodes/providers/episode_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeEpisodeRepository implements EpisodeRepository {
  _FakeEpisodeRepository(this._pages, [this._details = const {}]);

  final Map<String, EpisodesPage> _pages;
  final Map<int, EpisodeDetail> _details;
  final List<({String? search, int page})> calls = [];
  final List<int> detailCalls = [];
  Object? errorToThrow;

  static String _key(String? search, int page) => '${search ?? ''}|$page';

  @override
  Future<EpisodesPage> listEpisodes({String? search, int page = 1}) async {
    calls.add((search: search, page: page));
    if (errorToThrow != null) {
      final error = errorToThrow!;
      errorToThrow = null;
      throw error;
    }
    return _pages[_key(search, page)] ??
        EpisodesPage(episodes: const [], page: page, totalPages: 0, totalCount: 0, hasNext: false, hasPrevious: false);
  }

  @override
  Future<EpisodeDetail> getEpisodeDetail(int id) async {
    detailCalls.add(id);
    final detail = _details[id];
    if (detail == null) {
      throw StateError('No fake detail registered for episode $id');
    }
    return detail;
  }
}

Episode _episode(int id, String name) =>
    Episode(id: id, name: name, airDate: 'December 2, 2013', episodeCode: 'S01E0$id');

Widget _wrap(EpisodeRepository repository) {
  return ProviderScope(
    // Matches main.dart: automatic retries are off, so an error surfaces
    // as soon as the first failed call resolves.
    retry: (retryCount, error) => null,
    overrides: [episodeRepositoryProvider.overrideWithValue(repository)],
    child: const MaterialApp(home: EpisodeListScreen()),
  );
}

void main() {
  testWidgets('shows a loading indicator then the fetched episodes', (tester) async {
    final repository = _FakeEpisodeRepository({
      '|1': EpisodesPage(
        episodes: [_episode(1, 'Pilot')],
        page: 1,
        totalPages: 1,
        totalCount: 1,
        hasNext: false,
        hasPrevious: false,
      ),
    });

    await tester.pumpWidget(_wrap(repository));

    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    await tester.pumpAndSettle();

    expect(find.text('Pilot'), findsOneWidget);
    expect(find.text('S01E01 · Aired December 2, 2013'), findsOneWidget);
  });

  testWidgets('shows the empty state when there are no results', (tester) async {
    final repository = _FakeEpisodeRepository({
      '|1': const EpisodesPage(episodes: [], page: 1, totalPages: 0, totalCount: 0, hasNext: false, hasPrevious: false),
    });

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    expect(find.text('No episodes found.'), findsOneWidget);
  });

  testWidgets('shows an error state with a working retry button', (tester) async {
    final repository = _FakeEpisodeRepository({
      '|1': EpisodesPage(
        episodes: [_episode(1, 'Pilot')],
        page: 1,
        totalPages: 1,
        totalCount: 1,
        hasNext: false,
        hasPrevious: false,
      ),
    })..errorToThrow = Exception('network down');

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    expect(find.text('Could not load episodes. Please try again.'), findsOneWidget);
    expect(find.text('Pilot'), findsNothing);

    await tester.tap(find.widgetWithText(FilledButton, 'Retry'));
    await tester.pumpAndSettle();

    expect(find.text('Pilot'), findsOneWidget);
  });

  testWidgets('searching sends the term to the repository and resets to page 1', (tester) async {
    final repository = _FakeEpisodeRepository({
      '|1': EpisodesPage(
        episodes: [_episode(1, 'Pilot')],
        page: 1,
        totalPages: 1,
        totalCount: 1,
        hasNext: false,
        hasPrevious: false,
      ),
      'Rick|1': EpisodesPage(
        episodes: [_episode(2, 'Rickmancing the Stone')],
        page: 1,
        totalPages: 1,
        totalCount: 1,
        hasNext: false,
        hasPrevious: false,
      ),
    });

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'Rick');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pumpAndSettle();

    expect(find.text('Rickmancing the Stone'), findsOneWidget);
    expect(repository.calls.last.search, 'Rick');
    expect(repository.calls.last.page, 1);
  });

  testWidgets('pagination requests the next and previous pages', (tester) async {
    final repository = _FakeEpisodeRepository({
      '|1': EpisodesPage(
        episodes: [_episode(1, 'Pilot')],
        page: 1,
        totalPages: 2,
        totalCount: 2,
        hasNext: true,
        hasPrevious: false,
      ),
      '|2': EpisodesPage(
        episodes: [_episode(2, 'Lawnmower Dog')],
        page: 2,
        totalPages: 2,
        totalCount: 2,
        hasNext: false,
        hasPrevious: true,
      ),
    });

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    expect(find.text('Page 1 of 2'), findsOneWidget);

    await tester.tap(find.byTooltip('Next page'));
    await tester.pumpAndSettle();

    expect(find.text('Lawnmower Dog'), findsOneWidget);
    expect(find.text('Page 2 of 2'), findsOneWidget);

    await tester.tap(find.byTooltip('Previous page'));
    await tester.pumpAndSettle();

    expect(find.text('Pilot'), findsOneWidget);
    expect(find.text('Page 1 of 2'), findsOneWidget);
  });

  testWidgets('opening an episode and going back preserves the list state without refetching', (tester) async {
    final repository = _FakeEpisodeRepository(
      {
        'Rick|1': EpisodesPage(
          episodes: [_episode(2, 'Rickmancing the Stone')],
          page: 1,
          totalPages: 1,
          totalCount: 1,
          hasNext: false,
          hasPrevious: false,
        ),
      },
      {
        2: const EpisodeDetail(
          id: 2,
          name: 'Rickmancing the Stone',
          airDate: 'July 30, 2017',
          episodeCode: 'S03E01',
          characters: [],
        ),
      },
    );

    await tester.pumpWidget(_wrap(repository));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'Rick');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pumpAndSettle();

    expect(find.text('Rickmancing the Stone'), findsOneWidget);
    final callsBeforeNavigation = repository.calls.length;

    await tester.tap(find.text('Rickmancing the Stone'));
    await tester.pumpAndSettle();

    expect(find.text('Episode'), findsOneWidget);
    expect(repository.detailCalls, [2]);

    await tester.pageBack();
    await tester.pumpAndSettle();

    expect(find.text('Episode'), findsNothing);
    expect(tester.widget<TextField>(find.byType(TextField)).controller?.text, 'Rick');
    expect(find.text('Rickmancing the Stone'), findsOneWidget);
    expect(repository.calls.length, callsBeforeNavigation);
  });
}
