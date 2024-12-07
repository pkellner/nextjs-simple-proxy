curl -k -X POST "https://localhost:5200/api/v2/api/V2/Client/List" \
-H "Content-Type: application/json" \
--cookie "sessionId=abc123; user=PeterKellner" \
-d '{"key": "value"}' -v
