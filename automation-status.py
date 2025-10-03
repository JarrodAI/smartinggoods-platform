#!/usr/bin/env python3
"""
Kiro Automation Agent Status Dashboard
Shows real-time status of the automation agent
"""

import json
import time
import os
from datetime import datetime

def show_status_dashboard():
    """Display a real-time status dashboard"""
    
    print("🚀 Kiro Automation Agent Status Dashboard")
    print("=" * 60)
    
    # Check if MCP config exists
    mcp_config_path = ".kiro/settings/mcp.json"
    if os.path.exists(mcp_config_path):
        print("✅ MCP Configuration: FOUND")
        
        try:
            with open(mcp_config_path, 'r') as f:
                config = json.load(f)
                
            if "kiro-automation-agent" in config.get("mcpServers", {}):
                agent_config = config["mcpServers"]["kiro-automation-agent"]
                print(f"✅ Agent Config: ENABLED" if not agent_config.get("disabled", False) else "❌ Agent Config: DISABLED")
                print(f"📁 Command: {agent_config.get('command', 'N/A')}")
                print(f"📋 Args: {' '.join(agent_config.get('args', []))}")
                print(f"🔧 Auto-approve: {len(agent_config.get('autoApprove', []))} tools")
            else:
                print("❌ Agent Config: NOT FOUND in MCP config")
                
        except Exception as e:
            print(f"❌ Error reading MCP config: {e}")
    else:
        print("❌ MCP Configuration: NOT FOUND")
    
    print()
    
    # Check if spec files exist
    spec_path = ".kiro/specs/ai-powered-integrations/tasks.md"
    if os.path.exists(spec_path):
        print("✅ Spec File: FOUND")
        
        try:
            with open(spec_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Count tasks
            total_tasks = content.count('- [ ]') + content.count('- [x]')
            completed_tasks = content.count('- [x]')
            pending_tasks = content.count('- [ ]')
            
            print(f"📊 Total Tasks: {total_tasks}")
            print(f"✅ Completed: {completed_tasks}")
            print(f"⏳ Pending: {pending_tasks}")
            
            if total_tasks > 0:
                completion_rate = (completed_tasks / total_tasks) * 100
                print(f"📈 Progress: {completion_rate:.1f}%")
                
                # Progress bar
                bar_length = 30
                filled_length = int(bar_length * completion_rate / 100)
                bar = '█' * filled_length + '░' * (bar_length - filled_length)
                print(f"📊 [{bar}] {completion_rate:.1f}%")
            
        except Exception as e:
            print(f"❌ Error reading spec file: {e}")
    else:
        print("❌ Spec File: NOT FOUND")
    
    print()
    
    # Check Python environment
    try:
        import asyncio
        print("✅ Python asyncio: AVAILABLE")
    except ImportError:
        print("❌ Python asyncio: NOT AVAILABLE")
    
    # Check if agent script exists
    if os.path.exists("kiro-automation-agent.py"):
        print("✅ Agent Script: FOUND")
    else:
        print("❌ Agent Script: NOT FOUND")
    
    print()
    print("🔧 Quick Actions:")
    print("  • Test connection: python test-mcp-connection.py")
    print("  • Run standalone: python kiro-automation-agent.py --standalone")
    print("  • Test agent: python kiro-automation-agent.py --test")
    print()
    print("📋 MCP Tools Available:")
    print("  • start_continuous_execution - Start automation")
    print("  • stop_execution - Stop automation")
    print("  • get_status - Get current status")
    print("  • execute_single_task - Run one task")
    print("  • connection_health_check - Test connection")
    print()
    print(f"🕒 Status checked at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    show_status_dashboard()