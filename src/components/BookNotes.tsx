import React from 'react';
import { FaPlus, FaTimes, FaStickyNote } from 'react-icons/fa';
import { BookNote } from '../types';

interface BookNotesProps {
    notes: BookNote[];
    showAddNote: boolean;
    setShowAddNote: (show: boolean) => void;
    newNote: {
        page: number;
        content: string;
        color: string;
    };
    setNewNote: (note: { page: number; content: string; color: string }) => void;
    onAddNote: () => void;
}

const BookNotes: React.FC<BookNotesProps> = ({
    notes,
    showAddNote,
    setShowAddNote,
    newNote,
    setNewNote,
    onAddNote
}) => {
    const colors = [
        '#ffffff', // White
        '#fecaca', // Red-100
        '#fed7aa', // Orange-100
        '#fef08a', // Yellow-100
        '#bbf7d0', // Green-100
        '#bfdbfe', // Blue-100
        '#ddd6fe', // Purple-100
        '#fbcfe8', // Pink-100
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNote.content.trim() && newNote.page >= 0) {
            onAddNote();
        }
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaStickyNote />
                    Notes
                </h3>
                {!showAddNote && (
                    <button
                        onClick={() => setShowAddNote(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <FaPlus size={12} />
                        Add Note
                    </button>
                )}
            </div>

            {showAddNote && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">New Note</h4>
                        <button
                            type="button"
                            onClick={() => setShowAddNote(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Page Number</label>
                        <input
                            type="number"
                            value={newNote.page}
                            onChange={(e) => setNewNote({ ...newNote, page: Number(e.target.value) })}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            min={0}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Note Color</label>
                        <div className="flex gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewNote({ ...newNote, color })}
                                    className={`w-6 h-6 rounded-full border-2 ${
                                        newNote.color === color ? 'border-primary-600' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <textarea
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAddNote(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                            Save Note
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: note.color || '#ffffff' }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium">Page {note.page}</span>
                            <span className="text-sm text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    </div>
                ))}
                {notes.length === 0 && !showAddNote && (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        No notes yet. Click "Add Note" to create one.
                    </p>
                )}
            </div>
        </div>
    );
};

export default BookNotes; 