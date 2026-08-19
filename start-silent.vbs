Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c pm2 delete ghosthire-backend & pm2 start E:\AI_assistant\backend\server.js --name ghosthire-backend --interpreter node", 0, False
