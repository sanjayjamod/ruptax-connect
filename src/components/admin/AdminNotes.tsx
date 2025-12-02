import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StickyNote, Plus, Trash2, Save, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

const NOTES_KEY = "ruptax_admin_notes";

const getAdminNotes = (): Note[] => {
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAdminNotes = (notes: Note[]) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

interface AdminNotesProps {
  clientId?: string;
  clientName?: string;
}

const AdminNotes = ({ clientId, clientName }: AdminNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  useEffect(() => {
    const allNotes = getAdminNotes();
    if (clientId) {
      setNotes(allNotes.filter(n => n.clientId === clientId));
    } else {
      setNotes(allNotes.filter(n => !n.clientId));
    }
  }, [clientId, isOpen]);

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    const note: Note = {
      id: `note_${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      clientId: clientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allNotes = getAdminNotes();
    allNotes.push(note);
    saveAdminNotes(allNotes);
    
    setNewNote({ title: "", content: "" });
    setNotes(prev => [...prev, note]);
    
    toast({
      title: "Note Added",
      description: "Your note has been saved.",
    });
  };

  const handleUpdateNote = () => {
    if (!editingNote) return;

    const allNotes = getAdminNotes();
    const index = allNotes.findIndex(n => n.id === editingNote.id);
    if (index >= 0) {
      allNotes[index] = { ...editingNote, updatedAt: new Date().toISOString() };
      saveAdminNotes(allNotes);
      setNotes(prev => prev.map(n => n.id === editingNote.id ? allNotes[index] : n));
    }
    
    setEditingNote(null);
    toast({
      title: "Note Updated",
      description: "Your changes have been saved.",
    });
  };

  const handleDeleteNote = (noteId: string) => {
    const allNotes = getAdminNotes();
    const filtered = allNotes.filter(n => n.id !== noteId);
    saveAdminNotes(filtered);
    setNotes(prev => prev.filter(n => n.id !== noteId));
    
    toast({
      title: "Note Deleted",
      description: "The note has been removed.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <StickyNote className="h-4 w-4 mr-2" />
          Notes {notes.length > 0 && `(${notes.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            {clientId ? `Notes for ${clientName || clientId}` : "Admin Notes"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Add New Note */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Note
              </h4>
              <Input
                placeholder="Note Title"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
              />
              <Button onClick={handleAddNote} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </div>

            {/* Existing Notes */}
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No notes yet. Add your first note above.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-border p-4 space-y-2">
                  {editingNote?.id === note.id ? (
                    <>
                      <Input
                        value={editingNote.title}
                        onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                      />
                      <Textarea
                        value={editingNote.content}
                        onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateNote}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{note.title}</h4>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingNote(note)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleString('en-IN')}
                      </p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminNotes;
