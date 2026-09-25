import 'dart:convert';

import 'package:app/core/errors/backend_api_exception.dart';
import 'package:app/data/repositories/http_episode_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  group('HttpEpisodeRepository', () {
    test('parses a successful response into an EpisodesPage', () async {
      final client = MockClient((request) async {
        expect(request.url.path, '/episodes');
        expect(request.url.queryParameters, {'search': 'pilot', 'page': '1'});

        return http.Response(
          jsonEncode({
            'episodes': [
              {'id': 1, 'name': 'Pilot', 'airDate': 'December 2, 2013', 'episodeCode': 'S01E01'},
            ],
            'page': 1,
            'totalPages': 1,
            'totalCount': 1,
            'hasNext': false,
            'hasPrevious': false,
          }),
          200,
        );
      });

      final repository = HttpEpisodeRepository(client: client, baseUrl: 'http://backend.test');
      final result = await repository.listEpisodes(search: 'pilot', page: 1);

      expect(result.totalCount, 1);
      expect(result.episodes, hasLength(1));
      expect(result.episodes.single.name, 'Pilot');
      expect(result.episodes.single.episodeCode, 'S01E01');
    });

    test('omits the search query parameter when none is given', () async {
      final client = MockClient((request) async {
        expect(request.url.queryParameters.containsKey('search'), isFalse);
        expect(request.url.queryParameters['page'], '2');

        return http.Response(
          jsonEncode({
            'episodes': <Object?>[],
            'page': 2,
            'totalPages': 3,
            'totalCount': 51,
            'hasNext': true,
            'hasPrevious': true,
          }),
          200,
        );
      });

      final repository = HttpEpisodeRepository(client: client, baseUrl: 'http://backend.test');
      final result = await repository.listEpisodes(page: 2);

      expect(result.episodes, isEmpty);
      expect(result.hasPrevious, isTrue);
    });

    test('throws a BackendApiException on a non-200 response', () async {
      final client = MockClient((request) async => http.Response('{"error":"boom"}', 502));
      final repository = HttpEpisodeRepository(client: client, baseUrl: 'http://backend.test');

      await expectLater(
        repository.listEpisodes(page: 1),
        throwsA(isA<BackendApiException>().having((e) => e.statusCode, 'statusCode', 502)),
      );
    });

    test('throws a BackendApiException when the request fails', () async {
      final client = MockClient((request) async => throw Exception('network down'));
      final repository = HttpEpisodeRepository(client: client, baseUrl: 'http://backend.test');

      await expectLater(repository.listEpisodes(page: 1), throwsA(isA<BackendApiException>()));
    });

    test('parses a successful response into an EpisodeDetail with its characters', () async {
      final client = MockClient((request) async {
        expect(request.url.path, '/episodes/1');

        return http.Response(
          jsonEncode({
            'id': 1,
            'name': 'Pilot',
            'airDate': 'December 2, 2013',
            'episodeCode': 'S01E01',
            'characters': [
              {'id': 1, 'name': 'Rick Sanchez', 'image': 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'},
            ],
          }),
          200,
        );
      });

      final repository = HttpEpisodeRepository(client: client, baseUrl: 'http://backend.test');
      final result = await repository.getEpisodeDetail(1);

      expect(result.name, 'Pilot');
      expect(result.characters, hasLength(1));
      expect(result.characters.single.name, 'Rick Sanchez');
    });

    test('throws a BackendApiException with the status on a 404', () async {
      final client = MockClient((request) async => http.Response('{"error":"Episode not found"}', 404));
      final repository = HttpEpisodeRepository(client: client, baseUrl: 'http://backend.test');

      await expectLater(
        repository.getEpisodeDetail(999),
        throwsA(isA<BackendApiException>().having((e) => e.statusCode, 'statusCode', 404)),
      );
    });

    test('throws a BackendApiException when the detail request fails', () async {
      final client = MockClient((request) async => throw Exception('network down'));
      final repository = HttpEpisodeRepository(client: client, baseUrl: 'http://backend.test');

      await expectLater(repository.getEpisodeDetail(1), throwsA(isA<BackendApiException>()));
    });
  });
}
