import 'package:flutter/material.dart';

import '../../../domain/entities/episode.dart';

class EpisodeCard extends StatelessWidget {
  const EpisodeCard({required this.episode, super.key});

  final Episode episode;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(episode.name),
        subtitle: Text('${episode.episodeCode} · Aired ${episode.airDate}'),
      ),
    );
  }
}
