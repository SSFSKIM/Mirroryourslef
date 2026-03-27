import unittest

from fastapi.testclient import TestClient

from main import app


class LocalCorsTests(unittest.TestCase):
    def test_allows_local_preview_origin(self) -> None:
        client = TestClient(app)

        response = client.options(
            "/routes/yt-sync/analytics?sample_size=100",
            headers={
                "Origin": "http://localhost:4173",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"),
            "http://localhost:4173",
        )


if __name__ == "__main__":
    unittest.main()
