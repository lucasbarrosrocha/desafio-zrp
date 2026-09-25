import 'episode.dart';

class EpisodesPage {
  const EpisodesPage({
    required this.episodes,
    required this.page,
    required this.totalPages,
    required this.totalCount,
    required this.hasNext,
    required this.hasPrevious,
  });

  final List<Episode> episodes;
  final int page;
  final int totalPages;
  final int totalCount;
  final bool hasNext;
  final bool hasPrevious;

  factory EpisodesPage.fromJson(Map<String, dynamic> json) {
    return EpisodesPage(
      episodes: (json['episodes'] as List<dynamic>)
          .map((episode) => Episode.fromJson(episode as Map<String, dynamic>))
          .toList(),
      page: json['page'] as int,
      totalPages: json['totalPages'] as int,
      totalCount: json['totalCount'] as int,
      hasNext: json['hasNext'] as bool,
      hasPrevious: json['hasPrevious'] as bool,
    );
  }
}
