#!/bin/bash

# Töggle Tracker - Development Start Script

echo "🚀 Starting Töggle Tracker Development Environment..."
echo ""

# Check if backend dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing backend dependencies..."
    pip3 install -r backend/requirements.txt
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo ""
fi

# Start backend in background
echo "🔧 Starting backend server on http://localhost:8000..."
cd backend
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server on http://localhost:5173..."
echo ""
echo "✅ Development servers are running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

cd frontend
npm run dev

# Cleanup: kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null
