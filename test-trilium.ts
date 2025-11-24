import { TriliumClient } from './src/trilium-client';
import dotenv from 'dotenv';

dotenv.config();

const TRILIUM_ETAPI_URL = process.env.TRILIUM_ETAPI_URL;
const TRILIUM_ETAPI_TOKEN = process.env.TRILIUM_ETAPI_TOKEN;

if (!TRILIUM_ETAPI_URL || !TRILIUM_ETAPI_TOKEN) {
    console.error("Error: TRILIUM_ETAPI_URL and TRILIUM_ETAPI_TOKEN must be set in .env");
    process.exit(1);
}

async function runTest() {
    const trilium = new TriliumClient(TRILIUM_ETAPI_URL!, TRILIUM_ETAPI_TOKEN!);

    try {
        console.log("Searching for notes...");
        const searchResults = await trilium.searchNotes("Welcome");
        console.log("Search Results:", searchResults);

        if (searchResults.results.length > 0) {
            const noteId = searchResults.results[0].noteId;
            console.log(`Reading note: ${noteId}`);
            const note = await trilium.getNote(noteId);
            console.log("Note Metadata:", note);

            const content = await trilium.getNoteContent(noteId);
            console.log("Note Content (first 100 chars):", content.substring(0, 100));
        }

        // Uncomment to test creation
        /*
        console.log("Creating a test note...");
        const newNote = await trilium.createNote({
            parentNoteId: 'root', // Replace with a valid parent ID
            title: 'MCP Test Note',
            type: 'text',
            content: 'Hello from MCP!'
        });
        console.log("Created Note:", newNote);
        */

    } catch (error) {
        console.error("Error during test:", error);
    }
}

runTest();
