import 'package:app/presentation/episodes/providers/episode_providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('EpisodeListQueryNotifier', () {
    test('starts with an empty search and page 1', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final query = container.read(episodeListQueryProvider);

      expect(query.search, '');
      expect(query.page, 1);
    });

    test('search sets the term and resets the page to 1', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(episodeListQueryProvider.notifier).goToPage(3);
      container.read(episodeListQueryProvider.notifier).search('pilot');

      final query = container.read(episodeListQueryProvider);
      expect(query.search, 'pilot');
      expect(query.page, 1);
    });

    test('goToPage changes the page without touching the search term', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(episodeListQueryProvider.notifier).search('pilot');
      container.read(episodeListQueryProvider.notifier).goToPage(2);

      final query = container.read(episodeListQueryProvider);
      expect(query.search, 'pilot');
      expect(query.page, 2);
    });
  });
}
