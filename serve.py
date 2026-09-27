"""Serve this package locally using Python stdlib. No external dependency."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
from urllib.parse import quote
import webbrowser
ROOT=Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  super().end_headers()
if __name__=='__main__':
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
 url=f'http://127.0.0.1:{server.server_port}/demo/'+quote('VoiceLog_声迹_交互Demo.html')
 print('VoiceLog / 声迹 · 本机预览\n'+url+'\nCtrl+C 结束',flush=True)
 try:
  webbrowser.open(url)
  server.serve_forever()
 except KeyboardInterrupt:pass
 finally:server.server_close()
