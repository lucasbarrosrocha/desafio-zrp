import '../entities/episode_detail.dart';
import '../entities/episodes_page.dart';

abstract interface class EpisodeRepository {
  Future<EpisodesPage> listEpisodes({String? search, int page = 1});
  Future<EpisodeDetail> getEpisodeDetail(int id);
}
