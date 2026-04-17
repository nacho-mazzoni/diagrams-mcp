import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { generateClassDiagram } from "./tools/classDiagram.js";
import { generateERDiagram } from "./tools/erDiagram.js";

const server = new Server(
  {
    name: "diagram-mcp",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_class_diagram",
      description: "Generate UML class diagram",
      inputSchema: {
        type: "object",
        properties: {
          classes: {
            type: "array",
            items: { type: "object" }
          },
          relations: {
            type: "array",
            items: { type: "object" }
          }
        }
      }
    },
    {
      name: "generate_er_diagram",
      description: "Generate ER diagram",
      inputSchema: {
        type: "object",
        properties: {
          entities: {
            type: "array",
            items: { type: "object" }
          },
          relations: {
            type: "array",
            items: { type: "object" }
          }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "generate_class_diagram") {
    const result = await generateClassDiagram(args);
    return {
      content: [{ type: "text", text: result.svg }]
    };
  }

  if (name === "generate_er_diagram") {
    const result = await generateERDiagram(args);
    return {
      content: [{ type: "text", text: result.svg }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport); 