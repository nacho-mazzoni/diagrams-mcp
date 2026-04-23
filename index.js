import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { validateSchema } from "./tools/validateSchema.js";
import { generateClassDiagram } from "./tools/classDiagram.js";
import { generateERDiagram } from "./tools/erDiagram.js";

import { textToClass } from "./parsers/textToClass.js";
import { textToER } from "./parsers/textToER.js";

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
          text: { type: "string" },
          classes: {
            type: "array",
            items: { type: "object" }
          },
          relations: {
            type: "array",
            items: { type: "object" }
          },
          format: {
            type: "string",
            enum: ["svg", "pdf"],
            description: "Formato de salida deseado. Usar 'pdf' solo si el usuario lo pide explícitamente, sino usar 'svg'."
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
          text: { type: "string" },
          entities: {
            type: "array",
            items: { type: "object" }
          },
          relations: {
            type: "array",
            items: { type: "object" }
          },
          format: {
            type: "string",
            enum: ["svg", "pdf"],
            description: "Formato de salida deseado. Usar 'pdf' solo si el usuario lo pide explícitamente, sino usar 'svg'."
          }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "generate_class_diagram") {
      let data;
      
      // === 1. DETECCIÓN INTELIGENTE ===
      if (args.text && typeof args.text === "string") {
        // Entró como texto plano: lo parseamos a JSON
        data = textToClass(args.text);
      } else {
        // Entró como JSON nativo: lo usamos directo
        data = args;
      }
      
      // === 2. GENERACIÓN ===
      const format = args.format || "svg"; // Por defecto SVG, a menos que se pida explícitamente PDF
      const result = await generateClassDiagram(data, format);
      return {
        content: [{ type: "text", text: result.svg }]
      };
    }

    if (name === "generate_er_diagram") {
      let data;
      
      // === 1. DETECCIÓN INTELIGENTE ===
      if (args.text && typeof args.text === "string") {
        // Entró como texto plano: lo parseamos a JSON
        data = textToER(args.text);
      } else {
        // Entró como JSON nativo: lo usamos directo
        data = args;
      }

      // === 2. NORMALIZACIÓN ===
      // Acomodamos los nombres por si el JSON vino de textToER ('relations') 
      // o directo del agente ('relationships'). Tu validador espera 'relationships'.
      data.relationships = data.relationships || data.relations || [];
      data.entities = data.entities || [];

      // === 3. VALIDACIÓN SEMÁNTICA ===
      const schemaCheck = validateSchema(data);
      
      if (!schemaCheck.isValid) {
        throw new Error(`Inconsistencias en el esquema ER: ${schemaCheck.errors.join(" | ")}`);
      }

      if (schemaCheck.warnings && schemaCheck.warnings.length > 0) {
        console.warn(`[Warnings ER]:`, schemaCheck.warnings);
      }

      // === 4. GENERACIÓN ===
      const format = args.format || "svg"; // Por defecto SVG, a menos que se pida explícitamente PDF
      const result = await generateERDiagram(data, format);
      return {
        content: [{ type: "text", text: result.svg }]
      };
    }

    throw new Error(`Unknown tool: ${name}`);

  } catch (error) {
    // === 5. CAPTURA DE ERRORES INTELIGENTE ===
    console.error(`[Error en ${name}]: ${error.message}`);
    return {
      content: [
        { 
          type: "text", 
          text: `Error en la validación o parseo: ${error.message}. Por favor corregí los datos y volvé a intentarlo.` 
        }
      ],
      isError: true 
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);