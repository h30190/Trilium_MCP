import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import dotenv from "dotenv";
import { TriliumClient } from "./trilium-client.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env from the project root (assuming dist/index.js is one level deep)
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const TRILIUM_ETAPI_URL = process.env.TRILIUM_ETAPI_URL;
const TRILIUM_ETAPI_TOKEN = process.env.TRILIUM_ETAPI_TOKEN;
if (!TRILIUM_ETAPI_URL || !TRILIUM_ETAPI_TOKEN) {
    console.error("Error: TRILIUM_ETAPI_URL and TRILIUM_ETAPI_TOKEN must be set in .env");
    process.exit(1);
}
const trilium = new TriliumClient(TRILIUM_ETAPI_URL, TRILIUM_ETAPI_TOKEN);
const server = new Server({
    name: "trilium-mcp",
    version: "V1.0.0(251124_HJPLUS.DESIGN)",
}, {
    capabilities: {
        tools: {},
    },
});
// Tool Schemas
const searchNotesSchema = z.object({
    query: z.string().describe("The search query string"),
});
const readNoteSchema = z.object({
    noteId: z.string().describe("The ID of the note to read"),
});
const createNoteSchema = z.object({
    parentNoteId: z.string().describe("The ID of the parent note"),
    title: z.string().describe("The title of the new note"),
    type: z.string().default("text").describe("The type of the note (e.g., text, code)"),
    content: z.string().optional().describe("The initial content of the note"),
    mime: z.string().optional().describe("MIME type for the note"),
});
const updateNoteSchema = z.object({
    noteId: z.string().describe("The ID of the note to update"),
    title: z.string().optional().describe("New title"),
    type: z.string().optional().describe("New type"),
    content: z.string().optional().describe("New content"),
    mime: z.string().optional().describe("New MIME type"),
});
const moveNoteSchema = z.object({
    noteId: z.string().describe("The ID of the note to move"),
    parentNoteId: z.string().describe("The ID of the new parent note"),
});
const manageAttributesSchema = z.object({
    action: z.enum(["create", "update", "delete"]).describe("The action to perform"),
    noteId: z.string().optional().describe("The ID of the note (required for create)"),
    attributeId: z.string().optional().describe("The ID of the attribute (required for update/delete)"),
    type: z.enum(["label", "relation"]).optional().describe("Type of attribute (required for create)"),
    name: z.string().optional().describe("Name of the attribute (required for create)"),
    value: z.string().optional().describe("Value of the attribute"),
    isInheritable: z.boolean().optional().describe("Whether the attribute is inheritable"),
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_notes",
                description: "Search for notes in Trilium",
                inputSchema: zodToJsonSchema(searchNotesSchema),
            },
            {
                name: "read_note",
                description: "Read a note's metadata and content",
                inputSchema: zodToJsonSchema(readNoteSchema),
            },
            {
                name: "create_note",
                description: "Create a new note",
                inputSchema: zodToJsonSchema(createNoteSchema),
            },
            {
                name: "update_note",
                description: "Update an existing note",
                inputSchema: zodToJsonSchema(updateNoteSchema),
            },
            {
                name: "move_note",
                description: "Move a note to a new parent",
                inputSchema: zodToJsonSchema(moveNoteSchema),
            },
            {
                name: "manage_attributes",
                description: "Manage note attributes (create, update, delete)",
                inputSchema: zodToJsonSchema(manageAttributesSchema),
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        switch (name) {
            case "search_notes": {
                const { query } = searchNotesSchema.parse(args);
                const results = await trilium.searchNotes(query);
                return {
                    content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
                };
            }
            case "read_note": {
                const { noteId } = readNoteSchema.parse(args);
                const note = await trilium.getNote(noteId);
                const content = await trilium.getNoteContent(noteId);
                return {
                    content: [
                        { type: "text", text: `Metadata:\n${JSON.stringify(note, null, 2)}\n\nContent:\n${content}` },
                    ],
                };
            }
            case "create_note": {
                const params = createNoteSchema.parse(args);
                const note = await trilium.createNote(params);
                return {
                    content: [{ type: "text", text: JSON.stringify(note, null, 2) }],
                };
            }
            case "update_note": {
                const { noteId, ...params } = updateNoteSchema.parse(args);
                const note = await trilium.updateNote(noteId, params);
                return {
                    content: [{ type: "text", text: JSON.stringify(note, null, 2) }],
                };
            }
            case "move_note": {
                const { noteId, parentNoteId } = moveNoteSchema.parse(args);
                const note = await trilium.moveNote(noteId, parentNoteId);
                return {
                    content: [{ type: "text", text: JSON.stringify(note, null, 2) }],
                };
            }
            case "manage_attributes": {
                const { action, noteId, attributeId, type, name, value, isInheritable } = manageAttributesSchema.parse(args);
                if (action === "create") {
                    if (!noteId || !type || !name || value === undefined) {
                        throw new Error("Missing required parameters for create attribute");
                    }
                    const attr = await trilium.createAttribute(noteId, type, name, value, isInheritable);
                    return { content: [{ type: "text", text: JSON.stringify(attr, null, 2) }] };
                }
                else if (action === "update") {
                    if (!attributeId || value === undefined) {
                        throw new Error("Missing required parameters for update attribute");
                    }
                    await trilium.updateAttribute(attributeId, value, isInheritable);
                    return { content: [{ type: "text", text: "Attribute updated" }] };
                }
                else if (action === "delete") {
                    if (!attributeId) {
                        throw new Error("Missing attributeId for delete attribute");
                    }
                    await trilium.deleteAttribute(attributeId);
                    return { content: [{ type: "text", text: "Attribute deleted" }] };
                }
                return { content: [{ type: "text", text: "Invalid action" }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
