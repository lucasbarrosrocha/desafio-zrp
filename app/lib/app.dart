import 'package:flutter/material.dart';
import 'presentation/episodes/episode_list_screen.dart';

class DesafioZrpApp extends StatelessWidget {
  const DesafioZrpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Desafio ZRP',
      theme: ThemeData(colorSchemeSeed: Colors.deepPurple, useMaterial3: true),
      home: const EpisodeListScreen(),
    );
  }
}
