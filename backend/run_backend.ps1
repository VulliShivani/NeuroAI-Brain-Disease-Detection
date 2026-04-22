$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $PSScriptRoot
& "$repoRoot\.venv\Scripts\python.exe" -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload