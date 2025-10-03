@echo off
echo 🚀 Setting up Kiro Automation Agent...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found

REM Install required packages
echo 📦 Installing Python dependencies...
pip install asyncio aiofiles python-dotenv

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Test the automation agent
echo 🧪 Testing automation agent...
python kiro-automation-agent.py --test

echo 🎉 Setup complete!
echo.
echo To run the automation agent:
echo   Standalone mode: python kiro-automation-agent.py --standalone
echo   MCP mode: Already configured in .kiro/settings/mcp.json
echo.
echo The MCP server will automatically start when Kiro loads.
pause