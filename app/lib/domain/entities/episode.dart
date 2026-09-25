class Episode {
  const Episode({
    required this.id,
    required this.name,
    required this.airDate,
    required this.episodeCode,
  });

  final int id;
  final String name;
  final String airDate;
  final String episodeCode;

  factory Episode.fromJson(Map<String, dynamic> json) {
    return Episode(
      id: json['id'] as int,
      name: json['name'] as String,
      airDate: json['airDate'] as String,
      episodeCode: json['episodeCode'] as String,
    );
  }
}
