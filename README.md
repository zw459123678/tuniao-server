
# TuNiao UI MCP Server

A Model Context Protocol (MCP) server that provides access to TuNiao UI components documentation and listings.

## Features

- Component information from [Tuniao UI](https://vue2.tuniaokj.com/)
- MCP protocol compatible
- Easy integration with AI models
- Markdown formatted output with clickable links
- Comprehensive component documentation

## Available Tools

- `get_component_list`
  - Gets a list of available TuNiao UI components
  
- `get_component_doc`
  - Gets detailed documentation for a specific TuNiao UI component

## Installation

### NPX

```json
{
  "mcpServers": {
    "mcp-server-tuniao": {
      "command": "npx",
      "args": [
        "-y",
        "@zw459123678/tuniao-server"
      ]
    }
  }
}
```

### Docker 
（ Docker image not uploaded to Docker Hub, need to build it yourself. ）

```json
{
  "mcpServers": {
    "mcp-server-tuniao": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "zw459123678/tuniao-server"
      ]
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Watch mode
npm run watch

# Build
npm run build

# Test components
npm run test:comp
```

Docker build:

```bash
docker build -t zw459123678/tuniao-server:latest -f Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
