# Original safety scoring restored

At the user request, the original weighted scoring model and original score display have been restored. Weather 18%, incidents 35%, crowd 12%, news sentiment 15%, road 20%. The original model includes mock/random fallback behavior and fixed confidence in the bridge. Its score is not a validated safety probability. The experimental dataset-only and provisional scoring contracts have been removed.

Request deduplication, brief backend caching, environment configuration loading and the longer frontend request timeout remain to help delivery. Reverse-geocoding failure no longer blocks score calculation.
