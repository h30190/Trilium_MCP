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
        // In Trilium, moving a note usually means changing its parent.
        // We can use PATCH to update parentNoteIds.
        // WARNING: This replaces all parents. If a note is cloned, this might unclone it from other locations.
        // For simple "move", this is acceptable.
        await this.client.patch(`/notes/${noteId}`, {
            parentNoteIds: [parentNoteId],
        });
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
}
