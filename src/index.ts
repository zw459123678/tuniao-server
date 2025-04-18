#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

import {
  BASE_API_URL,
  HOT_NEWS_SOURCES,
  generateSourcesDescription,
  getMaxSourceId,
} from "./config.js";
import { extractNavigation, getComponentDocumentation } from "./extract-content.js";
// Define interfaces for type safety
interface HotNewsSource {
  name: string;
  description: string;
}

interface HotNewsItem {
  index: number;
  title: string;
  url: string;
  hot?: string | number;
}

interface HotNewsResponse {
  success: boolean;
  message?: string;
  name: string;
  subtitle: string;
  update_time: string;
  data: HotNewsItem[];
}

class HotNewsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "mcp-server/hotnewslist",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_component_list",
          description: "Get component list",
          inputSchema: {
            type: "object",
            properties: {},
          },
          required: [],
        },
        {
          name: "get_component_doc",
          description: "Get component documentation by component name",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The component name",
              },
            },
            required: ["name"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== "get_component_list" && request.params.name !== "get_component_doc") {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`,
        );
      }

      if (request.params.name === "get_component_list") {
        const baseUrl: string = 'https://vue2.tuniaokj.com/components/setting.html'; 
        const navigation = await extractNavigation(baseUrl);
        return {
          content: [
            {
              type: "text",
              text: navigation.map((item) => `${item.name} - https://vue2.tuniaokj.com${item.url}`).join("\n"),
            },
          ],
        }
      } else if (request.params.name === "get_component_doc") {
        try {
          const componentName = request.params.arguments?.name as string;
          if (componentName.length === 0) {
            throw new Error("Please provide valid component name");
          }
          const baseUrl: string = 'https://vue2.tuniaokj.com/components/setting.html'; 
          const results = await getComponentDocumentation(baseUrl, componentName);
          return {
            content: [
              {
                type: "text",
                text: results.content,
              },
            ],
          };

        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text",
                text: `Error: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
        
      } else {
        return {  
          content: [
            {
              type: "text",
              text: "Unknown tool",
            },
          ],
        }
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Hot news MCP server running on stdio");
  }
}

const server = new HotNewsServer();
server.run().catch(console.error);
