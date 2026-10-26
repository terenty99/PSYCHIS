@echo off
title PSYCHIS Backend
cd /d "%~dp0"

python server.py
set "server_exit_code=%errorlevel%"

if not "%server_exit_code%"=="0" pause
exit /b %server_exit_code%