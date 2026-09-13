#!/usr/bin/env bash
set -e

# Change directory to project root
cd "$(dirname "$0")"

export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "========================================================"
echo "  PSYCHIS — Spatial Knowledge Engine (macOS Launcher)"
echo "========================================================"

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Ошибка: Node.js не найден. Установите Node.js (brew install node или https://nodejs.org/)"
  exit 1
fi

# Install dependencies if node_modules or binaries are missing
if [ ! -d "node_modules" ] || [ ! -x "node_modules/.bin/electron" ]; then
  echo "📦 Установка библиотек приложения (npm install)..."
  echo "Пожалуйста, подождите, это делается только один раз..."
  npm install
fi

# Ensure dist exists
if [ ! -d "dist" ]; then
  echo "🔨 Сборка проекта (npm run build)..."
  npm run build
fi

echo ""
echo "🚀 Запуск приложения PSYCHIS..."
echo "1) Нажмите Enter для запуска в виде отдельного окна (Electron)"
echo "2) Или введите 'b' и нажмите Enter для запуска в веб-браузере (Vite Dev Server)"
read -r -t 5 choice || choice=""

if [ "$choice" = "b" ] || [ "$choice" = "B" ]; then
  echo "🌐 Запуск веб-версии на http://localhost:5173..."
  npm run dev
else
  echo "🖥️ Запуск Electron приложения..."
  npm run app || {
    echo "⚠️ Не удалось запустить Electron, переключаемся на веб-версию в браузере..."
    npm run dev
  }
fi
