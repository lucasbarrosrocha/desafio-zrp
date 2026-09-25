import 'package:flutter/material.dart';

import '../../../domain/entities/character_summary.dart';
import 'character_avatar.dart';
import 'character_detail_bottom_sheet.dart';

class CharacterListItem extends StatelessWidget {
  const CharacterListItem({required this.character, super.key});

  final CharacterSummary character;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CharacterAvatar(imageUrl: character.image, diameter: 40),
        title: Text(character.name),
        trailing: OutlinedButton(
          onPressed: () => showCharacterDetailBottomSheet(
            context,
            characterId: character.id,
            characterName: character.name,
          ),
          child: const Text('View details'),
        ),
      ),
    );
  }
}
