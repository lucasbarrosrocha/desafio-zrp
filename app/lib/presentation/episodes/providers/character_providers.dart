import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';
import '../../../data/repositories/http_character_repository.dart';
import '../../../domain/entities/character_detail.dart';
import '../../../domain/repositories/character_repository.dart';

final characterRepositoryProvider = Provider<CharacterRepository>((ref) {
  final client = http.Client();
  ref.onDispose(client.close);
  return HttpCharacterRepository(client: client, baseUrl: AppConfig.backendApiUrl);
});

/// `autoDispose`: the bottom sheet's own data has no reason to stay cached
/// once it's dismissed (mirrors [episodeDetailProvider] in
/// `episode_providers.dart`, for the same reason).
final characterDetailProvider = FutureProvider.autoDispose.family<CharacterDetail, int>((ref, id) {
  final repository = ref.watch(characterRepositoryProvider);
  return repository.getCharacterDetail(id);
});
