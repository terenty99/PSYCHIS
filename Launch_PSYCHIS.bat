@echo off
title PSYCHIS - Spatial Knowledge Engine
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================================
echo   PSYCHIS — Spatial Knowledge Engine (Windows Launcher)
echo ========================================================
echo.

:: 1. Проверка наличия Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен на этом компьютере!
    echo.
    echo Для работы PSYCHIS необходим Node.js (рекомендуется версия LTS).
    echo Скачайте и установите его в один клик:
    echo 👉 https://nodejs.org/
    echo.
    echo После завершения установки просто перезапустите этот файл.
    echo.
    pause
    exit /b 1
)

:: 2. Проверка библиотек (если папка node_modules отсутствует или была скопирована с Mac)
if not exist "node_modules\" (
    echo [УСТАНОВКА] Первичная установка зависимостей (npm install)...
    echo Пожалуйста, подождите 1-2 минуты...
    call npm install
) else if not exist "node_modules\electron\dist\electron.exe" (
    echo [ОБНОВЛЕНИЕ] Настройка бинарных библиотек под Windows...
    call npm install
)

:: 3. Фоновый запуск локального AI-модуля (если Python установлен)
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [СЕРВЕР] Фоновый запуск локального AI-сервера (backend/server.py)...
    start /min "PSYCHIS Backend" cmd /c "cd /d "%~dp0\backend" && python server.py"
)

:: 4. Проверка и компиляция интерфейса
echo [СБОРКА] Компиляция актуального интерфейса (npm run build)...
call npm run build

echo.
echo [ГОТОВО] Запуск PSYCHIS...
echo.
echo 1) Нажмите Enter для запуска в отдельном окне приложения (Electron)
echo 2) Или введите B и нажмите Enter для запуска в обычном браузере (Chrome / Edge)
set /p choice="Ваш выбор (по умолчанию 1): "

if /i "%choice%"=="b" (
    echo.
    echo 🌐 Запуск веб-сервера на http://localhost:5173...
    timeout /t 2 /nobreak >nul
    start http://localhost:5173
    call npm run dev
) else (
    echo.
    echo 🖥️ Запуск десктопного окна Electron...
    call npm run app
    if %errorlevel% neq 0 (
        echo.
        echo [ПРЕДУПРЕЖДЕНИЕ] Не удалось запустить окно Electron, открываем веб-версию в браузере...
        timeout /t 2 /nobreak >nul
        start http://localhost:5173
        call npm run dev
    )
)

pause
