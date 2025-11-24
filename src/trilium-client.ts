import axios, { AxiosInstance } from 'axios';
import { Note, NoteContent, CreateNoteParams, UpdateNoteParams, Attribute, SearchResult } from './types.js';

export class TriliumClient {
    private client: AxiosInstance;

    constructor(baseUrl: string, token: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });
    }

    async searchNotes(query: string): Promise<SearchResult> {
        const response = await this.client.get<SearchResult>('/notes', {
            params: { search: query },
        });
        return response.data;
    }

    async getNote(noteId: string): Promise<Note> {
        const response = await this.client.get<Note>(`/notes/${noteId}`);
        return response.data;
    }

    async getNoteContent(noteId: string): Promise<string> {
        const response = await this.client.get(`/notes/${noteId}/content`, {
            responseType: 'text',
        });
        return response.data;
    }

    async createNote(params: CreateNoteParams): Promise<Note> {
        const response = await this.client.post<Note>('/create-note', params);
        return response.data;
    }

    async updateNote(noteId: string, params: UpdateNoteParams): Promise<Note> {
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

    async moveNote(noteId: string, parentNoteId: string): Promise<Note> {
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
    async createAttribute(noteId: string, type: 'label' | 'relation', name: string, value: string, isInheritable: boolean = false): Promise<Attribute> {
        const response = await this.client.post<Attribute>('/attributes', {
            noteId,
            type,
            name,
            value,
            isInheritable,
        });
        return response.data;
    }

    async updateAttribute(attributeId: string, value: string, isInheritable?: boolean): Promise<void> {
        await this.client.patch(`/attributes/${attributeId}`, {
            value,
            isInheritable
        });
    }

    async deleteAttribute(attributeId: string): Promise<void> {
        await this.client.delete(`/attributes/${attributeId}`);
    }
}
