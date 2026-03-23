import React from 'react';
import { FileText, Star, Clock, Download } from 'lucide-react';

const NoteCard = ({ note, onView, onDownload }) => {
  return (
    <div className="bg-gpcet-card rounded-xl border border-gpcet-border p-4 hover:-translate-y-1 transition-transform duration-200 shadow-lg hover:border-gpcet-primary/30 group flex flex-col h-full relative overflow-hidden">
      
      {/* Decorative top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${note.is_important ? 'bg-amber-500' : 'bg-gpcet-primary/30 group-hover:bg-gpcet-primary transition-colors'}`}></div>

      <div className="flex justify-between items-start mb-3 pt-1">
        <div className="flex items-center gap-2 text-gpcet-muted text-xs font-medium bg-[#0A0F1E] px-2 py-1 rounded shadow-inner border border-gpcet-border">
          <div className="text-red-400 group-hover:scale-110 transition-transform">
            <FileText size={14} />
          </div>
          {note.file_size_mb && <span>{note.file_size_mb} MB</span>}
        </div>
        
        {note.is_important && (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider shadow-inner">
            <Star size={10} fill="currentColor" /> Important
          </span>
        )}
      </div>

      <h3 className="text-white font-bold text-sm leading-snug mb-2 line-clamp-2" title={note.title}>
        {note.title}
      </h3>
      
      {note.description && (
        <p className="text-gpcet-muted text-xs line-clamp-2 mb-3 leading-relaxed">
          {note.description}
        </p>
      )}

      <div className="mt-auto pt-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wide">
            {note.unit_label}
          </span>
          <span className="text-gray-500 text-[10px] font-mono flex items-center gap-1">
            <Clock size={10} /> {new Date(note.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gpcet-muted mb-4 border-t border-gpcet-border/50 pt-3">
          <span className="truncate pr-2 font-medium">By {note.uploaded_by?.display_name || 'Admin'}</span>
          <span className="shrink-0 font-mono text-gray-400 bg-white/5 px-2 rounded-full">{note.view_count} views</span>
        </div>

        <button 
          onClick={() => onView(note)}
          className="w-full py-2.5 rounded-xl border border-gpcet-primary/20 bg-gpcet-primary/10 text-gpcet-primary hover:bg-gpcet-primary hover:text-white transition-all text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 mb-2"
        >
          View PDF
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(note); }}
          className="w-full py-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-xs font-bold active:scale-95 flex items-center justify-center gap-2"
        >
          <Download size={14} /> Download PDF
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
