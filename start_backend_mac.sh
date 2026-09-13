#!/usr/bin/env bash
set -e

# Change directory to backend folder
cd "$(dirname "$0")/backend"

echo "========================================================"
echo "  PSYCHIS AI Engine & Shadow Dataset Server (macOS)"
echo "  Listening on http://localhost:8000"
echo "========================================================"

# Check for Python 3
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ Ошибка: Python 3 не найден. Установите Python 3."
  exit 1
fi

# Set up virtual environment if missing
if [ ! -d "venv" ]; then
  echo "📦 Создание виртуального окружения Python (venv)..."
  python3 -m venv venv
fi

echo "🔄 Активация виртуального окружения..."
source venv/bin/activate

# Install requirements if needed
echo "📦 Проверка и установка зависимостей Python..."
pip install -r requirements.txt --quiet

# Launch server
echo "🚀 Запуск сервера backend (FastAPI)..."
python server.py
