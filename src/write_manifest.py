from hashlib import sha256
from pathlib import Path

root = Path(__file__).resolve().parents[1]
ignored_dirs = {'.git', '.netlify', '__pycache__'}
ignored_files = {'MANIFEST.sha256', '.DS_Store', 'Thumbs.db'}
binary_suffixes = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf', '.docx'}
files = sorted(
    path for path in root.rglob('*')
    if path.is_file()
    and not any(part in ignored_dirs for part in path.relative_to(root).parts)
    and path.name not in ignored_files
    and path.suffix != '.pyc'
)
lines = []
for path in files:
    data = path.read_bytes()
    if path.suffix.lower() not in binary_suffixes and b'\x00' not in data:
        data = data.replace(b'\r\n', b'\n')
    lines.append(f'{sha256(data).hexdigest()}  {path.relative_to(root).as_posix()}')
(root / 'MANIFEST.sha256').write_bytes(('\n'.join(lines) + '\n').encode('utf-8'))
print(f'Wrote {len(lines)} hashes')
