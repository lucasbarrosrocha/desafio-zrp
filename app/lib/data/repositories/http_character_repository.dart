import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/errors/backend_api_exception.dart';
import '../../domain/entities/character_detail.dart';
import '../../domain/repositories/character_repository.dart';

class HttpCharacterRepository implements CharacterRepository {
  HttpCharacterRepository({required this._client, required this._baseUrl});

  final http.Client _client;
  final String _baseUrl;

  @override
  Future<CharacterDetail> getCharacterDetail(int id) async {
    final uri = Uri.parse('$_baseUrl/characters/$id');

    final http.Response response;
    try {
      response = await _client.get(uri);
    } catch (error) {
      throw BackendApiException('Failed to reach the backend API', cause: error);
    }

    if (response.statusCode != 200) {
      throw BackendApiException(
        'Backend API responded with status ${response.statusCode}',
        statusCode: response.statusCode,
      );
    }

    return CharacterDetail.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }
}
