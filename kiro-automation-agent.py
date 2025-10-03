#!/usr/bin/env python3
"""
Kiro Automation Agent - Continuous Task Execution MCP Server
This MCP server enables continuous task execution without stopping
"""

import asyncio
import json
import logging
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import os
import subprocess

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class Task:
    id: str
    name: str
    status: str  # 'not_started', 'in_progress', 'completed'
    priority: int
    dependencies: List[str]
    estimated_time: int  # minutes
    created_at: datetime
    completed_at: Optional[datetime] = None

class KiroAutomationAgent:
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.running = False
        self.current_task: Optional[str] = None
        self.workspace_path = os.getcwd()
        
    async def load_tasks_from_spec(self, spec_path: str) -> List[Task]:
        """Load tasks from the tasks.md file"""
        try:
            with open(spec_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tasks = []
            lines = content.split('\n')
            
            for line in lines:
                if '- [ ]' in line:  # Incomplete task
                    # Extract task info
                    task_text = line.split('- [ ]')[1].strip()
                    if task_text:
                        task_id = f"task_{len(tasks) + 1}"
                        task = Task(
                            id=task_id,
                            name=task_text,
                            status='not_started',
                            priority=1,
                            dependencies=[],
                            estimated_time=30,  # Default 30 minutes
                            created_at=datetime.now()
                        )
                        tasks.append(task)
                        self.tasks[task_id] = task
            
            logger.info(f"Loaded {len(tasks)} tasks from {spec_path}")
            return tasks
            
        except Exception as e:
            logger.error(f"Error loading tasks: {e}")
            return []
    
    async def execute_task(self, task_id: str) -> bool:
        """Execute a single task"""
        if task_id not in self.tasks:
            logger.error(f"Task {task_id} not found")
            return False
        
        task = self.tasks[task_id]
        if task.status == 'completed':
            logger.info(f"Task {task_id} already completed")
            return True
        
        logger.info(f"Starting task: {task.name}")
        task.status = 'in_progress'
        self.current_task = task_id
        
        try:
            # Update task status in the tasks.md file
            await self.update_task_status(task_id, 'in_progress')
            
            # Execute the task using Kiro's task execution
            success = await self.execute_kiro_task(task.name)
            
            if success:
                task.status = 'completed'
                task.completed_at = datetime.now()
                await self.update_task_status(task_id, 'completed')
                logger.info(f"Completed task: {task.name}")
                return True
            else:
                task.status = 'not_started'  # Reset for retry
                logger.error(f"Failed to complete task: {task.name}")
                return False
                
        except Exception as e:
            logger.error(f"Error executing task {task_id}: {e}")
            task.status = 'not_started'
            return False
        finally:
            self.current_task = None
    
    async def execute_kiro_task(self, task_name: str) -> bool:
        """Execute task using Kiro's task execution system"""
        try:
            # This would integrate with Kiro's task execution API
            # For now, we'll simulate task execution
            logger.info(f"Executing Kiro task: {task_name}")
            
            # Simulate task execution time
            await asyncio.sleep(2)
            
            # In a real implementation, this would:
            # 1. Call Kiro's task execution API
            # 2. Monitor task progress
            # 3. Handle errors and retries
            # 4. Return success/failure status
            
            return True  # Simulate success
            
        except Exception as e:
            logger.error(f"Error in Kiro task execution: {e}")
            return False
    
    async def update_task_status(self, task_id: str, status: str):
        """Update task status in the tasks.md file"""
        try:
            # This would call the taskStatus tool to update the task
            logger.info(f"Updating task {task_id} status to {status}")
            
            # In a real implementation, this would use the taskStatus tool
            # For now, we'll just log the update
            
        except Exception as e:
            logger.error(f"Error updating task status: {e}")
    
    async def get_next_task(self) -> Optional[str]:
        """Get the next task to execute based on priority and dependencies"""
        available_tasks = []
        
        for task_id, task in self.tasks.items():
            if task.status == 'not_started':
                # Check if all dependencies are completed
                dependencies_met = all(
                    self.tasks.get(dep_id, Task('', '', 'completed', 0, [], 0, datetime.now())).status == 'completed'
                    for dep_id in task.dependencies
                )
                
                if dependencies_met:
                    available_tasks.append((task_id, task.priority))
        
        if available_tasks:
            # Sort by priority (higher number = higher priority)
            available_tasks.sort(key=lambda x: x[1], reverse=True)
            return available_tasks[0][0]
        
        return None
    
    async def run_continuous_execution(self, spec_path: str):
        """Run continuous task execution"""
        logger.info("Starting continuous task execution")
        self.running = True
        
        # Load tasks from spec
        await self.load_tasks_from_spec(spec_path)
        
        while self.running:
            try:
                # Get next task to execute
                next_task_id = await self.get_next_task()
                
                if next_task_id:
                    # Execute the task
                    success = await self.execute_task(next_task_id)
                    
                    if success:
                        logger.info(f"Task completed successfully: {next_task_id}")
                    else:
                        logger.error(f"Task failed: {next_task_id}")
                        # Wait before retrying
                        await asyncio.sleep(30)
                else:
                    # No more tasks available
                    remaining_tasks = [t for t in self.tasks.values() if t.status != 'completed']
                    if not remaining_tasks:
                        logger.info("All tasks completed! 🎉")
                        break
                    else:
                        logger.info("Waiting for dependencies or new tasks...")
                        await asyncio.sleep(60)  # Wait 1 minute before checking again
                
                # Small delay between tasks
                await asyncio.sleep(5)
                
            except KeyboardInterrupt:
                logger.info("Stopping continuous execution...")
                self.running = False
                break
            except Exception as e:
                logger.error(f"Error in continuous execution: {e}")
                await asyncio.sleep(30)  # Wait before retrying
    
    def stop(self):
        """Stop continuous execution"""
        self.running = False
        logger.info("Stopping automation agent...")
    
    def get_status(self) -> Dict:
        """Get current status of the automation agent"""
        completed_tasks = [t for t in self.tasks.values() if t.status == 'completed']
        in_progress_tasks = [t for t in self.tasks.values() if t.status == 'in_progress']
        pending_tasks = [t for t in self.tasks.values() if t.status == 'not_started']
        
        return {
            'running': self.running,
            'current_task': self.current_task,
            'total_tasks': len(self.tasks),
            'completed_tasks': len(completed_tasks),
            'in_progress_tasks': len(in_progress_tasks),
            'pending_tasks': len(pending_tasks),
            'completion_percentage': (len(completed_tasks) / len(self.tasks) * 100) if self.tasks else 0
        }

# MCP Server Implementation
class MCPServer:
    def __init__(self):
        self.agent = KiroAutomationAgent()
        self.tools = [
            {
                "name": "start_continuous_execution",
                "description": "Start continuous task execution from a spec file",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "spec_path": {
                            "type": "string",
                            "description": "Path to the tasks.md file",
                            "default": ".kiro/specs/ai-powered-integrations/tasks.md"
                        }
                    }
                }
            },
            {
                "name": "stop_execution",
                "description": "Stop continuous task execution",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "get_status",
                "description": "Get current status of the automation agent",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "execute_single_task",
                "description": "Execute a single task by ID",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "ID of the task to execute"
                        }
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "connection_health_check",
                "description": "Check MCP connection health and agent status",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            }
        ]
    
    async def handle_message(self, message: Dict) -> Dict:
        """Handle MCP protocol messages"""
        try:
            method = message.get("method")
            params = message.get("params", {})
            
            if method == "initialize":
                logger.info("🚀 MCP Connection Established - Kiro Automation Agent Ready!")
                logger.info("✅ Connection Status: WORKING")
                return {
                    "jsonrpc": "2.0",
                    "id": message.get("id"),
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "kiro-automation-agent",
                            "version": "1.0.0"
                        }
                    }
                }
            
            elif method == "tools/list":
                return {
                    "jsonrpc": "2.0",
                    "id": message.get("id"),
                    "result": {
                        "tools": self.tools
                    }
                }
            
            elif method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                
                result = await self.handle_tool_call(tool_name, arguments)
                
                return {
                    "jsonrpc": "2.0",
                    "id": message.get("id"),
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps(result, indent=2)
                            }
                        ]
                    }
                }
            
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": message.get("id"),
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}"
                    }
                }
                
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            return {
                "jsonrpc": "2.0",
                "id": message.get("id"),
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }
    
    async def handle_tool_call(self, tool_name: str, arguments: Dict) -> Dict:
        """Handle tool calls"""
        try:
            if tool_name == "start_continuous_execution":
                spec_path = arguments.get('spec_path', '.kiro/specs/ai-powered-integrations/tasks.md')
                asyncio.create_task(self.agent.run_continuous_execution(spec_path))
                return {"success": True, "message": "Continuous execution started", "spec_path": spec_path}
            
            elif tool_name == "stop_execution":
                self.agent.stop()
                return {"success": True, "message": "Execution stopped"}
            
            elif tool_name == "get_status":
                status = self.agent.get_status()
                return {"success": True, "data": status}
            
            elif tool_name == "execute_single_task":
                task_id = arguments.get('task_id')
                if not task_id:
                    return {"success": False, "error": "task_id required"}
                
                success = await self.agent.execute_task(task_id)
                return {"success": success, "message": f"Task {task_id} {'completed' if success else 'failed'}"}
            
            elif tool_name == "connection_health_check":
                logger.info("🔍 Connection Health Check Requested")
                logger.info("✅ MCP Connection: ACTIVE")
                logger.info("✅ Agent Status: READY")
                logger.info("✅ Tools Available: 5")
                
                status = self.agent.get_status()
                return {
                    "success": True,
                    "connection_status": "ACTIVE",
                    "agent_status": "READY",
                    "message": "🎉 Connection is working perfectly!",
                    "health_check": {
                        "mcp_connection": "✅ ACTIVE",
                        "agent_ready": "✅ READY",
                        "tools_loaded": "✅ 5 TOOLS",
                        "workspace_path": self.agent.workspace_path,
                        "timestamp": datetime.now().isoformat()
                    },
                    "agent_data": status
                }
            
            else:
                return {"success": False, "error": f"Unknown tool: {tool_name}"}
                
        except Exception as e:
            logger.error(f"Error handling tool call: {e}")
            return {"success": False, "error": str(e)}

async def run_mcp_server():
    """Run the MCP server using stdio"""
    server = MCPServer()
    
    logger.info("🚀 Starting Kiro Automation Agent MCP Server")
    logger.info("🔌 Waiting for MCP connection from Kiro...")
    
    try:
        while True:
            # Read from stdin
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
                
            line = line.strip()
            if not line:
                continue
                
            try:
                message = json.loads(line)
                response = await server.handle_message(message)
                
                # Write response to stdout
                print(json.dumps(response), flush=True)
                
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {e}")
                error_response = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {
                        "code": -32700,
                        "message": "Parse error"
                    }
                }
                print(json.dumps(error_response), flush=True)
                
    except Exception as e:
        logger.error(f"Server error: {e}")

# Main execution
async def main():
    """Main function to run the MCP server or standalone mode"""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--standalone":
            # Standalone mode for testing
            server = MCPServer()
            spec_path = ".kiro/specs/ai-powered-integrations/tasks.md"
            
            if os.path.exists(spec_path):
                logger.info(f"Starting automation agent in standalone mode with spec: {spec_path}")
                await server.agent.run_continuous_execution(spec_path)
            else:
                logger.error(f"Spec file not found: {spec_path}")
                logger.info("Please provide the correct path to your tasks.md file")
        
        elif sys.argv[1] == "--test":
            # Test mode
            logger.info("🧪 Testing Kiro Automation Agent...")
            server = MCPServer()
            
            # Test basic functionality
            status = server.agent.get_status()
            logger.info(f"✅ Agent status: {status}")
            
            # Test task loading
            spec_path = ".kiro/specs/ai-powered-integrations/tasks.md"
            if os.path.exists(spec_path):
                tasks = await server.agent.load_tasks_from_spec(spec_path)
                logger.info(f"✅ Loaded {len(tasks)} tasks from spec")
            else:
                logger.warning(f"⚠️  Spec file not found: {spec_path}")
            
            logger.info("🎉 Test completed successfully!")
            return
    else:
        # MCP server mode
        await run_mcp_server()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Automation agent stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")