import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';
import '../../../data/repositories/http_episode_repository.dart';
import '../../../domain/entities/episodes_page.dart';
import '../../../domain/repositories/episode_repository.dart';

final episodeRepositoryProvider = Provider<EpisodeRepository>((ref) {
  final client = http.Client();
  ref.onDispose(client.close);
  return HttpEpisodeRepository(client: client, baseUrl: AppConfig.backendApiUrl);
});

class EpisodeListQuery {
  const EpisodeListQuery({this.search = '', this.page = 1});

  final String search;
  final int page;

  EpisodeListQuery copyWith({String? search, int? page}) {
    return EpisodeListQuery(search: search ?? this.search, page: page ?? this.page);
  }
}

/// Not `autoDispose`: the widget it backs must keep its state alive when a
/// detail screen is pushed on top of it, so search/page survive the round
/// trip through `Navigator.pop` (see the state-preservation decision in
/// `.claude/PROJECT.md`).
class EpisodeListQueryNotifier extends Notifier<EpisodeListQuery> {
  @override
  EpisodeListQuery build() => const EpisodeListQuery();

  void search(String term) {
    state = EpisodeListQuery(search: term, page: 1);
  }

  void goToPage(int page) {
    state = state.copyWith(page: page);
  }
}

final episodeListQueryProvider = NotifierProvider<EpisodeListQueryNotifier, EpisodeListQuery>(
  EpisodeListQueryNotifier.new,
);

final episodesPageProvider = FutureProvider<EpisodesPage>((ref) {
  final query = ref.watch(episodeListQueryProvider);
  final repository = ref.watch(episodeRepositoryProvider);
  return repository.listEpisodes(
    search: query.search.isEmpty ? null : query.search,
    page: query.page,
  );
});
