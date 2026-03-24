import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Eye, Clock, FileText, Loader2 } from 'lucide-react';
import { getAdminNotes, deleteNote } from '../../services/notesService';
import toast from 'react-hot-toast';

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await getAdminNotes();
      setNotes(data);
    } catch (err) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note? This action is permanent.')) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      toast.success('Note deleted successfully');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         note.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'important') return matchesSearch && note.is_important;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 size={40} className="animate-spin text-gpcet-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gpcet-text mb-2">Manage All Notes</h1>
          <p className="text-gpcet-muted font-medium">Review, search, and manage student study materials.</p>
        </div>
        
        <div className="flex gap-3">
           <div className="relative">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
             <input 
               type="text" 
               placeholder="Search by title or code..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-gpcet-card border border-gpcet-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none w-64 shadow-inner"
             />
           </div>
           
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="bg-gpcet-card border border-gpcet-border rounded-xl px-4 py-2.5 text-sm text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none shadow-inner"
           >
             <option value="all">All Notes</option>
             <option value="important">Important Only</option>
           </select>
        </div>
      </div>

      <div className="bg-gpcet-card rounded-3xl border border-gpcet-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gpcet-bg border-b border-gpcet-border">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gpcet-muted">Content</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gpcet-muted">Context</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gpcet-muted">Analytics</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gpcet-muted">Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gpcet-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gpcet-border">
              {filteredNotes.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center">
                     <FileText size={48} className="mx-auto text-gpcet-border mb-4 opacity-50" />
                     <p className="text-gpcet-muted font-bold">No notes found matching your criteria.</p>
                   </td>
                </tr>
              ) : (
                filteredNotes.map(note => (
                  <tr key={note.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${note.is_important ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-gpcet-primary/10 text-gpcet-primary border border-gpcet-primary/20'}`}>
                          <FileText size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-gpcet-text font-bold text-sm truncate max-w-xs">{note.title}</p>
                          <p className="text-gpcet-muted text-[11px] mt-0.5 truncate">{note.unit_label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <span className="bg-gpcet-bg px-2 py-0.5 rounded text-[10px] font-mono text-gpcet-primary border border-gpcet-primary/20">{note.subject_code}</span>
                        <div className="text-[10px] text-gray-500 font-medium">{note.branch} &bull; {note.regulation}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-gpcet-muted">
                          <Eye size={12} /> {note.view_count}
                        </div>
                        {note.is_important && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase">Important</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                         <Clock size={12} /> {new Date(note.created_at).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => handleDelete(note.id)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                        title="Delete Permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotes;
