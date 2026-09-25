import 'package:flutter/material.dart';

import '../../../domain/entities/character_summary.dart';

class CharacterListItem extends StatelessWidget {
  const CharacterListItem({required this.character, super.key});

  final CharacterSummary character;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
        backgroundImage: NetworkImage(character.image),
        // Falls back to the plain avatar background instead of crashing/
        // logging noisily if the image fails to load.
        onBackgroundImageError: (_, _) {},
      ),
        title: Text(character.name),
        // Modal wiring lands in a later phase — the button is disabled until then.
        trailing: const OutlinedButton(onPressed: null, child: Text('View details')),
      ),
    );
  }
}
