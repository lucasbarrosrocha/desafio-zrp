import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/errors/backend_api_exception.dart';
import '../../domain/entities/episode_detail.dart';
import 'providers/episode_providers.dart';
import 'widgets/character_list_item.dart';

class EpisodeDetailScreen extends ConsumerWidget {
  const EpisodeDetailScreen({required this.episodeId, super.key});

  final int episodeId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final episodeAsync = ref.watch(episodeDetailProvider(episodeId));

    return Scaffold(
      appBar: AppBar(title: const Text('Episode')),
      body: SafeArea(
        child: episodeAsync.when(
          data: (episode) => _EpisodeDetailBody(episode: episode),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) {
            if (error is BackendApiException && error.statusCode == 404) {
              return const _NotFoundState();
            }
            return _ErrorState(onRetry: () => ref.invalidate(episodeDetailProvider(episodeId)));
          },
        ),
      ),
    );
  }
}

class _EpisodeDetailBody extends StatelessWidget {
  const _EpisodeDetailBody({required this.episode});

  final EpisodeDetail episode;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(episode.name, style: theme.textTheme.headlineSmall),
        const SizedBox(height: 4),
        Text(
          '${episode.episodeCode} · Aired ${episode.airDate}',
          style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
        ),
        const SizedBox(height: 24),
        Text('Characters', style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        if (episode.characters.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Text('No characters found for this episode.'),
          )
        else
          ...episode.characters.map((character) => CharacterListItem(character: character)),
      ],
    );
  }
}

class _NotFoundState extends StatelessWidget {
  const _NotFoundState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Episode not found', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Text(
              "This episode doesn't exist. It may have been mistyped or removed.",
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Could not load this episode. Please try again.', textAlign: TextAlign.center),
          const SizedBox(height: 12),
          FilledButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
