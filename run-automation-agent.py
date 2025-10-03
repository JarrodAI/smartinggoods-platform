#!/usr/bin/env python3
"""
Simple launcher for the Kiro Automation Agent
"""

import subprocess
import sys
import os

def main():
    """Launch the automation agent with proper error handling"""
    
    print("🚀 Kiro Automation Agent Launcher")
    print("=" * 40)
    
    # Check if the main script exists
    script_path = "kiro-automation-agent.py"
    if not os.path.exists(script_path):
        print(f"❌ Error: {script_path} not found")
        print("Make sure you're running this from the smartinggoods-platform directory")
        return 1
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8+ required")
        print(f"Current version: {sys.version}")
        return 1
    
    print("✅ Python version OK")
    
    # Try to import required modules
    try:
        import asyncio
        print("✅ asyncio available")
    except ImportError:
        print("❌ asyncio not available (should be built-in)")
        return 1
    
    # Launch the agent
    try:
        print("\n🎯 Starting Kiro Automation Agent...")
        print("Press Ctrl+C to stop\n")
        
        # Pass through any command line arguments
        args = [sys.executable, script_path] + sys.argv[1:]
        subprocess.run(args)
        
    except KeyboardInterrupt:
        print("\n👋 Automation agent stopped by user")
        return 0
    except Exception as e:
        print(f"\n❌ Error running automation agent: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())