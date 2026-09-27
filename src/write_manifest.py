from hashlib import sha256
from pathlib import Path

root = Path(__file__).resolve().parents[1]
ignored_dirs = {'.git', '.netlify', '__pycache__'}
ignored_files = {'MANIFEST.sha256', '.DS_Store', 'Thumbs.db'}
files = sorted(
    path for path in root.rglob('*')
    if path.is_file()
    and not any(part in ignored_dirs for part in path.relative_to(root).parts)
    and path.name not in ignored_files
    and path.suffix != '.pyc'
)
lines = [f'{sha256(path.read_bytes()).hexdigest()}  {path.relative_to(root).as_posix()}' for path in files]
(root / 'MANIFEST.sha256').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote {len(lines)} hashes')
