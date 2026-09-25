import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/episodes_page.dart';
import 'providers/episode_providers.dart';
import 'widgets/episode_card.dart';
import 'widgets/episode_search_field.dart';
import 'widgets/pagination_controls.dart';

class EpisodeListScreen extends ConsumerWidget {
  const EpisodeListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final query = ref.watch(episodeListQueryProvider);
    final episodesAsync = ref.watch(episodesPageProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Desafio ZRP')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              EpisodeSearchField(
                initialValue: query.search,
                onSearch: (term) => ref.read(episodeListQueryProvider.notifier).search(term),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: episodesAsync.when(
                  data: (page) => _EpisodeListBody(page: page),
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (error, _) => _ErrorState(
                    onRetry: () => ref.invalidate(episodesPageProvider),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EpisodeListBody extends ConsumerWidget {
  const _EpisodeListBody({required this.page});

  final EpisodesPage page;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (page.episodes.isEmpty) {
      return const Center(child: Text('No episodes found.'));
    }

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            itemCount: page.episodes.length,
            itemBuilder: (context, index) => EpisodeCard(episode: page.episodes[index]),
          ),
        ),
        PaginationControls(
          page: page.page,
          totalPages: page.totalPages,
          onPrevious: page.hasPrevious
              ? () => ref.read(episodeListQueryProvider.notifier).goToPage(page.page - 1)
              : null,
          onNext: page.hasNext
              ? () => ref.read(episodeListQueryProvider.notifier).goToPage(page.page + 1)
              : null,
        ),
      ],
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
          const Text('Could not load episodes. Please try again.', textAlign: TextAlign.center),
          const SizedBox(height: 12),
          FilledButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
