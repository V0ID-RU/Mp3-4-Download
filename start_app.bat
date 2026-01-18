@echo off
echo Starting MediaDownloader...
start cmd /k "cd backend && npm start"
start cmd /k "cd frontend && npm run dev"
echo Application started!
echo Frontend will be at http://localhost:5173
echo Backend will be at http://localhost:3001
