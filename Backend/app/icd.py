"""Live ICD-10-AM coding demo, backed by the icd10am-claude-coding study.

Two of the study's nine prompt strategies run on the same note: the plain
question and the strict-format contract. Both go through the study's own
prompt templates and extractor, so what the page shows is what the study
measured: the model writes a code either way, and the prompt decides whether
the extractor can read it.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from icdprompt.postprocess import extract_code
from icdprompt.prompts import get_template

MODEL = os.getenv("ICD_MODEL", "claude-haiku-5-5")
#: Same generation settings as the study: low effort, generous ceiling because
#: reasoning tokens count toward it.
MAX_TOKENS = 4096
EFFORT = "low"
STRATEGIES = (("plain question", "zero_shot_minimal"), ("strict format", "zero_shot_strict_format"))

SOURCES = [
    {"label": "Study code, prompts and results", "url": "https://github.com/itsgichia/icd10am-claude-coding"},
    {"label": "Example notes: AGBonnet/augmented-clinical-notes", "url": "https://huggingface.co/datasets/AGBonnet/augmented-clinical-notes"},
]

_EXAMPLES: list[dict[str, Any]] = json.loads((Path(__file__).parent / "icd_examples.json").read_text())
_client: Any = None


class ModelError(RuntimeError):
    """The model could not be called or did not answer."""


def available() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


def status() -> dict[str, Any]:
    return {
        "available": available(),
        "model": MODEL,
        "strategies": [{"label": label, "template": name} for label, name in STRATEGIES],
        "sources": SOURCES,
    }


def examples() -> list[dict[str, Any]]:
    return _EXAMPLES


def _get_client() -> Any:
    global _client
    if _client is None:
        import anthropic

        _client = anthropic.Anthropic()
    return _client


def request_params(template_name: str, note: str) -> dict[str, Any]:
    """Build the Messages API call exactly as the study's runner does."""
    template = get_template(template_name)
    messages = template.render_messages(note)
    params: dict[str, Any] = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "output_config": {"effort": EFFORT},
        "messages": [m for m in messages if m["role"] != "system"],
    }
    system = [m["content"] for m in messages if m["role"] == "system"]
    if system:
        params["system"] = "\n\n".join(system)
    return params


def _text_of(message: Any) -> str:
    return "".join(getattr(block, "text", "") for block in message.content if getattr(block, "type", "") == "text")


def code_note(note: str, client: Any = None) -> dict[str, Any]:
    """Run both strategies on one note and return the responses with the extractor's reading."""
    client = client or _get_client()
    runs = []
    for label, name in STRATEGIES:
        template = get_template(name)
        try:
            message = client.messages.create(**request_params(name, note))
        except Exception as e:  # the SDK's own error classes all subclass Exception
            raise ModelError(f"The model did not answer ({e.__class__.__name__}).") from e
        text = _text_of(message)
        result = extract_code(text, prefer=template.prefer)
        usage = getattr(message, "usage", None)
        runs.append(
            {
                "strategy": label,
                "template": name,
                "response": text,
                "code": result.code,
                "valid": result.is_valid,
                "method": result.method,
                "candidates": list(result.candidates),
                "stop_reason": getattr(message, "stop_reason", None),
                "input_tokens": getattr(usage, "input_tokens", None),
                "output_tokens": getattr(usage, "output_tokens", None),
            }
        )
    return {"model": MODEL, "runs": runs}
