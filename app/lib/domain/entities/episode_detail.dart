import 'character_summary.dart';

class EpisodeDetail {
  const EpisodeDetail({
    required this.id,
    required this.name,
    required this.airDate,
    required this.episodeCode,
    required this.characters,
  });

  final int id;
  final String name;
  final String airDate;
  final String episodeCode;
  final List<CharacterSummary> characters;

  factory EpisodeDetail.fromJson(Map<String, dynamic> json) {
    return EpisodeDetail(
      id: json['id'] as int,
      name: json['name'] as String,
      airDate: json['airDate'] as String,
      episodeCode: json['episodeCode'] as String,
      characters: (json['characters'] as List<dynamic>)
          .map((character) => CharacterSummary.fromJson(character as Map<String, dynamic>))
          .toList(),
    );
  }
}
