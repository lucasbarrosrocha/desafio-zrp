import '../entities/character_detail.dart';

abstract interface class CharacterRepository {
  Future<CharacterDetail> getCharacterDetail(int id);
}
