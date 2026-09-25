import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/errors/backend_api_exception.dart';
import '../../domain/entities/episode_detail.dart';
import '../../domain/entities/episodes_page.dart';
import '../../domain/repositories/episode_repository.dart';

class HttpEpisodeRepository implements EpisodeRepository {
  HttpEpisodeRepository({required this._client, required this._baseUrl});

  final http.Client _client;
  final String _baseUrl;

  @override
  Future<EpisodesPage> listEpisodes({String? search, int page = 1}) async {
    final uri = Uri.parse('$_baseUrl/episodes').replace(
      queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page.toString(),
      },
    );

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

    return EpisodesPage.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  @override
  Future<EpisodeDetail> getEpisodeDetail(int id) async {
    final uri = Uri.parse('$_baseUrl/episodes/$id');

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

    return EpisodeDetail.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }
}
