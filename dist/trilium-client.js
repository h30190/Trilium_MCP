import axios from 'axios';
export class TriliumClient {
    client;
    constructor(baseUrl, token) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });
    }
    async searchNotes(query) {
        const response = await this.client.get('/notes', {
            params: { search: query },
        });
        return response.data;
    }
    async getNote(noteId) {
        const response = await this.client.get(`/notes/${noteId}`);
        return response.data;
    }
    async getNoteContent(noteId) {
        const response = await this.client.get(`/notes/${noteId}/content`, {
            responseType: 'text',
        });
        return response.data;
    }
    async listChildren(parentNoteId) {
        // Get parent note to find childNoteIds
        const parent = await this.getNote(parentNoteId);
        const childIds = parent.childNoteIds ?? [];
        if (childIds.length === 0) {
            return { parentNoteId, children: [] };
        }
        // Fetch each child's basic info in parallel
        const childrenPromises = childIds.map(async (id) => {
            const child = await this.client.get(`/notes/${id}`);
            return {
                noteId: child.data.noteId,
                title: child.data.title,
                type: child.data.type,
            };
        });
        const children = await Promise.all(childrenPromises);
        return { parentNoteId, children };
    }
    async createNote(params) {
        const response = await this.client.post('/create-note', params);
        return response.data;
    }
    async updateNote(noteId, params) {
        // Update metadata
        if (params.title || params.type || params.mime) {
            await this.client.patch(`/notes/${noteId}`, {
                title: params.title,
                type: params.type,
                mime: params.mime
            });
        }
        // Update content if provided
        if (params.content !== undefined) {
            await this.client.put(`/notes/${noteId}/content`, params.content, {
                headers: { 'Content-Type': 'text/plain' } // Assuming text content for now
            });
        }
        return this.getNote(noteId);
    }
    async moveNote(noteId, parentNoteId) {
        // In Trilium, the tree structure is managed via "branches" (parent-child relationships).
        // PATCH /notes does NOT accept parentNoteIds — we must use the branch API:
        //   1. POST /branches to create the new parent-child link
        //   2. DELETE /branches/{branchId} to remove the old link(s)
        // WARNING: This replaces all parents. If a note is cloned, this unclones it.
        // Refresh note to get current parentNoteIds
        const currentNote = await this.getNote(noteId);
        const currentParents = currentNote.parentNoteIds ?? [];
        // Step 1: Create new branch (new parent → note)
        await this.client.post('/branches', {
            noteId,
            parentNoteId,
        });
        // Step 2: Delete old branches (old parent → note)
        for (const oldParent of currentParents) {
            const branchId = `${oldParent}_${noteId}`;
            await this.client.delete(`/branches/${branchId}`);
        }
        return this.getNote(noteId);
    }
    // Attribute Management
    async createAttribute(noteId, type, name, value, isInheritable = false) {
        const response = await this.client.post('/attributes', {
            noteId,
            type,
            name,
            value,
            isInheritable,
        });
        return response.data;
    }
    async updateAttribute(attributeId, value, isInheritable) {
        await this.client.patch(`/attributes/${attributeId}`, {
            value,
            isInheritable
        });
    }
    async deleteAttribute(attributeId) {
        await this.client.delete(`/attributes/${attributeId}`);
    }
    async deleteNote(noteId) {
        await this.client.delete(`/notes/${noteId}`);
    }
    async batchMoveNotes(moves) {
        const results = await Promise.all(moves.map(async (item) => {
            try {
                await this.moveNote(item.noteId, item.parentNoteId);
                return { success: true, noteId: item.noteId };
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                return { success: false, noteId: item.noteId, error: msg };
            }
        }));
        const successCount = results.filter(r => r.success).length;
        return {
            results,
            summary: { total: results.length, success: successCount, failed: results.length - successCount }
        };
    }
    async batchCreateNotes(notes) {
        const results = await Promise.all(notes.map(async (params) => {
            try {
                // Ensure type defaults to "text" if omitted (Trilium requires it)
                const safeParams = {
                    ...params,
                    type: params.type || "text",
                    mime: params.mime || "text/plain",
                };
                const note = await this.createNote(safeParams);
                return { success: true, noteId: note.noteId, data: { title: note.title } };
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                return { success: false, noteId: params.title || '(untitled)', error: msg };
            }
        }));
        const successCount = results.filter(r => r.success).length;
        return {
            results,
            summary: { total: results.length, success: successCount, failed: results.length - successCount }
        };
    }
}
