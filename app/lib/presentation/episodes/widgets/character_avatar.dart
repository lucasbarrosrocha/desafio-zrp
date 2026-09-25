import 'package:flutter/material.dart';

/// A circular character avatar that falls back to a plain icon instead of
/// crashing/reporting a `FlutterError` when the image fails to load — e.g. a
/// transient network hiccup on a real device. Deliberately `Image.network`
/// with `errorBuilder` rather than `CircleAvatar.backgroundImage` +
/// `onBackgroundImageError`: the latter only marks the framework's own error
/// report "silent" (still reported), while `errorBuilder` suppresses it
/// outright — the difference only shows up under `integration_test`, which
/// fails a test on any reported `FlutterError` regardless of the silent
/// flag, unlike a plain widget test.
class CharacterAvatar extends StatelessWidget {
  const CharacterAvatar({required this.imageUrl, required this.diameter, super.key});

  final String imageUrl;
  final double diameter;

  @override
  Widget build(BuildContext context) {
    return ClipOval(
      child: Image.network(
        imageUrl,
        width: diameter,
        height: diameter,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          width: diameter,
          height: diameter,
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          alignment: Alignment.center,
          child: Icon(
            Icons.person,
            size: diameter * 0.6,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}
