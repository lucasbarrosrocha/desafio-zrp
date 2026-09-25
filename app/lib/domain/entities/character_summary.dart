class CharacterSummary {
  const CharacterSummary({required this.id, required this.name, required this.image});

  final int id;
  final String name;
  final String image;

  factory CharacterSummary.fromJson(Map<String, dynamic> json) {
    return CharacterSummary(
      id: json['id'] as int,
      name: json['name'] as String,
      image: json['image'] as String,
    );
  }
}
