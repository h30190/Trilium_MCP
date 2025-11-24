export interface Note {
    noteId: string;
    title: string;
    type: string;
    mime: string;
    isProtected: boolean;
    dateCreated: string;
    dateModified: string;
    parentNoteIds: string[];
    childNoteIds: string[];
    attributes?: Attribute[];
}

export interface Attribute {
    attributeId: string;
    noteId: string;
    type: 'label' | 'relation';
    name: string;
    value: string;
    isInheritable: boolean;
}

export interface NoteContent {
    noteId: string;
    content: string;
}

export interface SearchResult {
    results: Note[];
}

export interface CreateNoteParams {
    parentNoteId: string;
    title: string;
    type: string;
    content?: string;
    mime?: string;
}

export interface UpdateNoteParams {
    title?: string;
    type?: string;
    mime?: string;
    content?: string;
}
