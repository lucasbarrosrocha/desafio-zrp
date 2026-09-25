import 'dart:convert';

import 'package:app/core/errors/backend_api_exception.dart';
import 'package:app/data/repositories/http_character_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  group('HttpCharacterRepository', () {
    test('parses a successful response into a CharacterDetail', () async {
      final client = MockClient((request) async {
        expect(request.url.path, '/characters/1');

        return http.Response(
          jsonEncode({
            'id': 1,
            'name': 'Rick Sanchez',
            'status': 'Alive',
            'species': 'Human',
            'type': '',
            'gender': 'Male',
            'origin': 'Earth (C-137)',
            'location': 'Citadel of Ricks',
            'image': 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
          }),
          200,
        );
      });

      final repository = HttpCharacterRepository(client: client, baseUrl: 'http://backend.test');
      final result = await repository.getCharacterDetail(1);

      expect(result.name, 'Rick Sanchez');
      expect(result.status, 'Alive');
      expect(result.species, 'Human');
      expect(result.type, '');
      expect(result.origin, 'Earth (C-137)');
      expect(result.location, 'Citadel of Ricks');
    });

    test('throws a BackendApiException with the status on a 404', () async {
      final client = MockClient((request) async => http.Response('{"error":"Character not found"}', 404));
      final repository = HttpCharacterRepository(client: client, baseUrl: 'http://backend.test');

      await expectLater(
        repository.getCharacterDetail(999),
        throwsA(isA<BackendApiException>().having((e) => e.statusCode, 'statusCode', 404)),
      );
    });

    test('throws a BackendApiException when the request fails', () async {
      final client = MockClient((request) async => throw Exception('network down'));
      final repository = HttpCharacterRepository(client: client, baseUrl: 'http://backend.test');

      await expectLater(repository.getCharacterDetail(1), throwsA(isA<BackendApiException>()));
    });
  });
}
