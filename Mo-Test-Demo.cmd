@echo off
cd /d "%~dp0"
powershell -NoProfile -Command "if (-not (Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue)) { Start-Process -FilePath 'node' -ArgumentList 'serve-test-demo.cjs' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden }; Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:8765/test-demo.html'"
