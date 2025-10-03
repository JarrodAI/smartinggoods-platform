#!/usr/bin/env python3
"""
Test MCP Connection for Kiro Automation Agent
"""

import json
import subprocess
import sys
import time

def test_mcp_connection():
    """Test the MCP connection by sending a health check"""
    
    print("🧪 Testing Kiro Automation Agent MCP Connection")
    print("=" * 50)
    
    # Test message for health check
    test_message = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "connection_health_check",
            "arguments": {}
        }
    }
    
    try:
        # Start the MCP server process
        print("🚀 Starting MCP server...")
        process = subprocess.Popen(
            [sys.executable, "kiro-automation-agent.py"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Send initialization message first
        init_message = {
            "jsonrpc": "2.0",
            "id": 0,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "test-client",
                    "version": "1.0.0"
                }
            }
        }
        
        print("📡 Sending initialization message...")
        process.stdin.write(json.dumps(init_message) + "\\n")
        process.stdin.flush()
        
        # Wait a moment
        time.sleep(1)
        
        # Send health check
        print("🔍 Sending health check...")
        process.stdin.write(json.dumps(test_message) + "\\n")
        process.stdin.flush()
        
        # Wait for response
        time.sleep(2)
        
        # Read response
        try:
            output, error = process.communicate(timeout=5)
            
            if output:
                print("✅ Response received:")
                print(output)
            
            if error:
                print("📋 Server logs:")
                print(error)
                
        except subprocess.TimeoutExpired:
            print("⏰ Timeout waiting for response")
            process.kill()
            
    except Exception as e:
        print(f"❌ Error testing connection: {e}")
    
    print("\\n🎯 Test completed!")
    print("\\nTo use with Kiro:")
    print("1. Make sure the MCP server is configured in .kiro/settings/mcp.json")
    print("2. Restart Kiro to load the MCP server")
    print("3. Use the 'connection_health_check' tool to verify connection")

if __name__ == "__main__":
    test_mcp_connection()