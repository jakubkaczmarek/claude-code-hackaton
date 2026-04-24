@echo off
wt --title "Backend" --startingDirectory "%~dp0src\backend" cmd /k "set PORT=3000 && npm run dev" ; new-tab --title "LegacyFrontend" --startingDirectory "%~dp0src" cmd /k "npx serve ./frontend-legacy -p 3001"
