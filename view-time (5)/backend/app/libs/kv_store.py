from __future__ import annotations

from datetime import datetime
from typing import Any

# Optional Firestore client. Fallback to Databutton storage when unavailable.
try:
    from google.cloud import firestore  # type: ignore

    _fs_client = firestore.Client()
    _has_firestore = True
except Exception as _e:  # pragma: no cover - environment dependent
    print(f"Firestore client unavailable: {_e}")
    _fs_client = None
    _has_firestore = False

try:
    import databutton as db  # type: ignore
except Exception as _e:  # pragma: no cover - local/Cloud Run
    print(f"Databutton storage unavailable: {_e}")
    db = None  # type: ignore


_COLLECTION = "kv_store"


def put_json(key: str, value: Any) -> None:
    """Store a JSON-serializable value under a key.

    Prefers Firestore when available; falls back to Databutton storage.
    """
    try:
        if _has_firestore and _fs_client is not None:
            doc = {"value": value, "updated_at": datetime.utcnow().isoformat()}
            _fs_client.collection(_COLLECTION).document(key).set(doc)
            return

        if db is not None:
            db.storage.json.put(key, value)
            return

        raise RuntimeError("No storage backend available")
    except Exception as e:  # pragma: no cover
        print(f"put_json failed for key={key}: {e}")


def get_json(key: str, default: Any = None) -> Any:
    try:
        if _has_firestore and _fs_client is not None:
            snap = _fs_client.collection(_COLLECTION).document(key).get()
            if snap.exists:
                data = snap.to_dict() or {}
                return data.get("value", default)
            return default

        if db is not None:
            return db.storage.json.get(key, default=default)

        return default
    except Exception as e:  # pragma: no cover
        print(f"get_json failed for key={key}: {e}")
        return default


def put_text(key: str, text: str) -> None:
    try:
        if _has_firestore and _fs_client is not None:
            doc = {"value": text, "updated_at": datetime.utcnow().isoformat()}
            _fs_client.collection(_COLLECTION).document(key).set(doc)
            return

        if db is not None:
            db.storage.text.put(key, text)
            return

        raise RuntimeError("No storage backend available")
    except Exception as e:  # pragma: no cover
        print(f"put_text failed for key={key}: {e}")


def get_text(key: str, default: str = "") -> str:
    try:
        if _has_firestore and _fs_client is not None:
            snap = _fs_client.collection(_COLLECTION).document(key).get()
            if snap.exists:
                data = snap.to_dict() or {}
                return str(data.get("value", default))
            return default

        if db is not None:
            return db.storage.text.get(key, default=default)

        return default
    except Exception as e:  # pragma: no cover
        print(f"get_text failed for key={key}: {e}")
        return default

