@echo off
title PSYCHIS AI Backend ^& Shadow Dataset Server
cd /d %~dp0
echo ========================================================
echo   PSYCHIS AI Engine ^& Shadow Dataset Server (v2026.1)
echo   Connected to Groq Cloud API (GPT OSS 120B Flagship)
echo   Listening on http://localhost:8000
echo ========================================================
python server.py
pause
