import axios, { AxiosInstance } from 'axios';
import { Note, NoteContent, CreateNoteParams, UpdateNoteParams, Attribute, SearchResult, ListChildrenResult, ChildNote, BatchOperationResult } from './types.js';

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

    async listChildren(parentNoteId: string): Promise<ListChildrenResult> {
        // Get parent note to find childNoteIds
        const parent = await this.getNote(parentNoteId);
        const childIds = parent.childNoteIds ?? [];

        if (childIds.length === 0) {
            return { parentNoteId, children: [] };
        }

        // Fetch each child's basic info in parallel
        const childrenPromises = childIds.map(async (id) => {
            const child = await this.client.get<Note>(`/notes/${id}`);
            return {
                noteId: child.data.noteId,
                title: child.data.title,
                type: child.data.type,
            } as ChildNote;
        });

        const children = await Promise.all(childrenPromises);
        return { parentNoteId, children };
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

   async deleteNote(noteId: string): Promise<void> {
        await this.client.delete(`/notes/${noteId}`);
    }

    async batchMoveNotes(moves: Array<{ noteId: string; parentNoteId: string }>): Promise<BatchOperationResult> {
        const results = await Promise.all(moves.map(async (item) => {
            try {
                await this.moveNote(item.noteId, item.parentNoteId);
                return { success: true, noteId: item.noteId };
            } catch (error) {
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

    async batchCreateNotes(notes: CreateNoteParams[]): Promise<BatchOperationResult> {
        const results = await Promise.all(notes.map(async (params) => {
            try {
                const note = await this.createNote(params);
                return { success: true, noteId: note.noteId, data: { title: note.title } };
            } catch (error) {
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
