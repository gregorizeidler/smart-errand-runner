#!/bin/bash

echo "🚀 Iniciando Smart Errand Runner..."

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "⚠️  Arquivo backend/.env não encontrado!"
    echo "Por favor, copie o backend/env.example para backend/.env e configure suas chaves de API"
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo "⚠️  Arquivo frontend/.env não encontrado!"
    echo "Por favor, copie o frontend/env.example para frontend/.env e configure sua chave do Google Maps"
    exit 1
fi

# Start backend
echo "📡 Iniciando Backend..."
cd backend
source venv/bin/activate 2>/dev/null || python -m venv venv && source venv/bin/activate
pip install -r requirements.txt -q
python main.py &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Iniciando Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Aplicação iniciada com sucesso!"
echo ""
echo "📊 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Para parar a aplicação, pressione Ctrl+C"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

