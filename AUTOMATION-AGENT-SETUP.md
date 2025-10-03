# 🚀 Kiro Automation Agent Setup Guide

## Overview
The Kiro Automation Agent is an MCP server that automatically executes tasks from your spec files, enabling continuous development without manual intervention.

## Quick Setup

### 1. Install Dependencies
```bash
# Install Python dependencies
pip install asyncio aiofiles python-dotenv

# Or run the setup script (Windows)
setup-automation-agent.bat
```

### 2. Test the Agent
```bash
# Test the automation agent
python kiro-automation-agent.py --test
```

### 3. MCP Configuration
The agent is already configured in `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "kiro-automation-agent": {
      "command": "python",
      "args": ["smartinggoods-platform/kiro-automation-agent.py"],
      "env": {
        "PYTHONPATH": ".",
        "WORKSPACE_PATH": "."
      },
      "disabled": false,
      "autoApprove": [
        "start_continuous_execution",
        "execute_single_task",
        "get_status",
        "stop_execution"
      ]
    }
  }
}
```

## Usage

### Available Tools

1. **start_continuous_execution**
   - Starts continuous task execution from a spec file
   - Parameters: `spec_path` (optional, defaults to ai-powered-integrations)

2. **execute_single_task**
   - Executes a single task by ID
   - Parameters: `task_id` (required)

3. **get_status**
   - Returns current agent status and progress
   - No parameters required

4. **stop_execution**
   - Stops continuous execution
   - No parameters required

### Running Modes

#### MCP Mode (Recommended)
The agent runs as an MCP server integrated with Kiro:
- Automatically starts when Kiro loads
- Available through Kiro's tool system
- Integrated with task management

#### Standalone Mode
For testing and development:
```bash
python kiro-automation-agent.py --standalone
```

## How It Works

1. **Task Loading**: Reads tasks from `tasks.md` files in spec directories
2. **Dependency Management**: Executes tasks in order based on dependencies
3. **Status Tracking**: Updates task status in real-time
4. **Error Handling**: Retries failed tasks and logs errors
5. **Continuous Execution**: Automatically moves to next available task

## Configuration

### Environment Variables
- `WORKSPACE_PATH`: Path to your workspace (default: current directory)
- `PYTHONPATH`: Python path for imports

### Spec File Format
The agent reads tasks from markdown files with this format:
```markdown
- [ ] 1.1 Task name here
  - Task details and requirements
  - _Requirements: 1.1, 2.3_

- [x] 1.2 Completed task
  - This task is already done
```

## Troubleshooting

### Common Issues

1. **Python not found**
   - Install Python 3.8+ from https://python.org
   - Ensure Python is in your PATH

2. **Dependencies missing**
   - Run: `pip install asyncio aiofiles python-dotenv`

3. **MCP server not connecting**
   - Check `.kiro/settings/mcp.json` configuration
   - Restart Kiro to reload MCP servers
   - Check logs for connection errors

4. **Tasks not executing**
   - Verify spec file path exists
   - Check task format in markdown
   - Review agent logs for errors

### Logs and Debugging

The agent logs to console with timestamps:
```
2024-01-01 12:00:00 - kiro-automation-agent - INFO - Starting continuous task execution
2024-01-01 12:00:01 - kiro-automation-agent - INFO - Loaded 5 tasks from spec
2024-01-01 12:00:02 - kiro-automation-agent - INFO - Starting task: 1.1 Setup infrastructure
```

## Advanced Configuration

### Custom Task Execution
You can extend the agent by modifying the `execute_kiro_task` method to:
- Integrate with external APIs
- Run custom scripts
- Send notifications
- Update external systems

### Integration with CI/CD
The agent can be integrated with CI/CD pipelines:
```bash
# Run specific task
python kiro-automation-agent.py --execute-task "1.1 Setup infrastructure"

# Run all pending tasks
python kiro-automation-agent.py --run-pending
```

## API Keys and Configuration

Currently, the agent doesn't require external API keys. However, if you extend it to integrate with external services, you may need:

- **OpenAI API Key**: For AI-powered task execution
- **GitHub Token**: For repository operations
- **Cloud Provider Keys**: For infrastructure deployment

Add these to your environment or `.env` file:
```bash
OPENAI_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here
AWS_ACCESS_KEY_ID=your_key_here
```

## Next Steps

1. **Test the setup**: Run `python kiro-automation-agent.py --test`
2. **Start continuous execution**: Use the MCP tools in Kiro
3. **Monitor progress**: Check agent status regularly
4. **Customize**: Extend the agent for your specific needs

The automation agent is now ready to help you execute tasks continuously! 🎉