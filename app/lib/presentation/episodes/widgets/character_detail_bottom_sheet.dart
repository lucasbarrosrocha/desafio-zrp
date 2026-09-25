import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/errors/backend_api_exception.dart';
import '../../../domain/entities/character_detail.dart';
import '../providers/character_providers.dart';
import 'character_avatar.dart';

Future<void> showCharacterDetailBottomSheet(
  BuildContext context, {
  required int characterId,
  required String characterName,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => CharacterDetailBottomSheet(characterId: characterId, characterName: characterName),
  );
}

class CharacterDetailBottomSheet extends ConsumerWidget {
  const CharacterDetailBottomSheet({required this.characterId, required this.characterName, super.key});

  final int characterId;
  final String characterName;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final characterAsync = ref.watch(characterDetailProvider(characterId));

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(characterName, style: Theme.of(context).textTheme.titleLarge),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Close',
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            characterAsync.when(
              data: (character) => _CharacterDetailContent(character: character),
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (error, _) {
                if (error is BackendApiException && error.statusCode == 404) {
                  return const _NotFoundContent();
                }
                return _ErrorContent(onRetry: () => ref.invalidate(characterDetailProvider(characterId)));
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _CharacterDetailContent extends StatelessWidget {
  const _CharacterDetailContent({required this.character});

  final CharacterDetail character;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: CharacterAvatar(imageUrl: character.image, diameter: 96),
        ),
        const SizedBox(height: 16),
        _DetailRow(label: 'Status', value: character.status),
        _DetailRow(label: 'Species', value: character.species),
        if (character.type.isNotEmpty) _DetailRow(label: 'Type', value: character.type),
        _DetailRow(label: 'Gender', value: character.gender),
        _DetailRow(label: 'Origin', value: character.origin),
        _DetailRow(label: 'Location', value: character.location),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class _NotFoundContent extends StatelessWidget {
  const _NotFoundContent();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Character not found', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          const Text(
            "This character doesn't exist. It may have been mistyped or removed.",
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ErrorContent extends StatelessWidget {
  const _ErrorContent({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Could not load this character. Please try again.', textAlign: TextAlign.center),
          const SizedBox(height: 12),
          FilledButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
