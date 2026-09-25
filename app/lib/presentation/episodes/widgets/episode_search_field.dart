import 'package:flutter/material.dart';

class EpisodeSearchField extends StatefulWidget {
  const EpisodeSearchField({required this.initialValue, required this.onSearch, super.key});

  final String initialValue;
  final ValueChanged<String> onSearch;

  @override
  State<EpisodeSearchField> createState() => _EpisodeSearchFieldState();
}

class _EpisodeSearchFieldState extends State<EpisodeSearchField> {
  late final TextEditingController _controller = TextEditingController(text: widget.initialValue);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() => widget.onSearch(_controller.text.trim());

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      textInputAction: TextInputAction.search,
      onSubmitted: (_) => _submit(),
      decoration: InputDecoration(
        labelText: 'Search episodes',
        hintText: 'Search episodes…',
        border: const OutlineInputBorder(),
        suffixIcon: IconButton(icon: const Icon(Icons.search), tooltip: 'Search', onPressed: _submit),
      ),
    );
  }
}
