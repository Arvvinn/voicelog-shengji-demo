"""Shared local-host and Chromium helpers for the fused UI regression suites."""
from __future__ import annotations

import functools
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports" / "ui-merge"
SCREENSHOT_DIR = ROOT / "screenshots" / "ui-merge"
DEMO_FILE = "VoiceLog_%E5%A3%B0%E8%BF%B9_%E4%BA%A4%E4%BA%92Demo.html"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *_args: object) -> None:
        pass


class DemoHost:
    def __init__(self) -> None:
        handler = functools.partial(QuietHandler, directory=str(ROOT / "demo"))
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        self.server.daemon_threads = True

    @property
    def url(self) -> str:
        return f"http://127.0.0.1:{self.server.server_port}/{DEMO_FILE}"

    def start(self) -> None:
        import threading
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def close(self) -> None:
        self.server.shutdown()
        self.server.server_close()


def launch_options() -> dict:
    options = {"headless": True, "args": ["--no-sandbox"]}
    executable = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE", "").strip()
    if executable:
        options["executable_path"] = executable
    return options


def ensure_output_dirs() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
