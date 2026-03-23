import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ExternalLink, Bot } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getSubjects, getNotes, viewNote, downloadNote } from '../services/notesService';
import NoteCard from '../components/notes/NoteCard';
import EmptyState from '../components/common/EmptyState';
import PDFViewer from '../components/notes/PDFViewer';
import SkeletonCard from '../components/common/SkeletonCard';
import SkeletonRow from '../components/common/SkeletonRow';

const getTabsForType = (type) => {
  if (type === 'nptel') return ['All', 'Week 1-4', 'Week 5-8', 'Week 9-12', 'Assignments'];
  if (type === 'lab') return ['All', 'Programs', 'Viva Questions', 'Lab Manual'];
  return ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
};

const Notes = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState({ regular: [], nptel: [], lab: [], elective: [] });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  
  const [notes, setNotes] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  const [viewingPdf, setViewingPdf] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
        
        const allList = [...data.regular, ...data.elective, ...data.lab, ...data.nptel];
        const querySubjectCode = searchParams.get('subject');
        
        if (querySubjectCode) {
          const found = allList.find(s => s.subject_code === querySubjectCode);
          if (found) setSelectedSubject(found);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    if (user?.role === 'student') fetchSubjects();
  }, [searchParams, user]);

  useEffect(() => {
    if (!selectedSubject) return;
    
    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        const data = await getNotes(selectedSubject.subject_code, 'all');
        setNotes(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingNotes(false);
      }
    };
    fetchNotes();
  }, [selectedSubject]);

  const filteredNotes = notes.filter(n => {
    if (activeTab === 'All') return true;
    return n.unit_label.toLowerCase() === activeTab.toLowerCase();
  });

  const handleSelectSubject = (subj) => {
    setSelectedSubject(subj);
    setActiveTab('All');
  };

  const handleViewPdf = async (note) => {
    setViewingPdf(note);
    try {
      await viewNote(note._id);
    } catch(e) {
      console.error(e);
    }
  };

  const handleDownloadPdf = async (note) => {
    try {
      const blob = await downloadNote(note._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${note.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const renderSubjectList = (list, typeColor) => (
    list.map(s => (
      <button
        key={s.subject_code}
        onClick={() => handleSelectSubject(s)}
        className={`w-full text-left p-3 rounded-xl mb-2 transition-all border ${
          selectedSubject?.subject_code === s.subject_code
            ? 'bg-blue-500/10 border-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
            : 'bg-transparent border-transparent text-gpcet-muted hover:bg-white/5 hover:text-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${typeColor}`}></div>
          <span className="font-mono text-[10px] tracking-wider">{s.subject_code}</span>
          <span className={`ml-auto text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shadow-inner ${
            s.type === 'regular' ? 'bg-blue-900/50 text-blue-300' :
            s.type === 'nptel' ? 'bg-green-900/50 text-green-300' :
            s.type === 'lab' ? 'bg-amber-900/50 text-amber-300' :
            'bg-gray-800 text-gray-400'
          }`}>
            {s.type}
          </span>
        </div>
        <p className={`text-sm font-bold truncate ${selectedSubject?.subject_code === s.subject_code ? 'text-blue-400' : ''}`}>
          {s.subject_name}
        </p>
      </button>
    ))
  );

  if (user?.role === 'admin') return <div className="p-4 text-white">Admins use the All Notes panel.</div>;

  return (
    <div className="flex flex-col md:flex-row h-auto min-h-full md:h-full gap-6 pb-6 p-4 md:p-0">
      
      {/* Left Panel */}
      <div className="w-full md:w-[280px] shrink-0 flex flex-col bg-[#111827] rounded-3xl border border-gpcet-border overflow-hidden shadow-lg h-[250px] md:h-[calc(100vh-120px)]">
        <div className="p-5 border-b border-gpcet-border bg-[#0A0F1E]">
          <h2 className="text-xs uppercase font-black text-gpcet-muted tracking-widest">Your Subjects</h2>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {isLoadingSubjects ? (
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : (
            <>
              {subjects.regular.length > 0 && (
                <div className="mb-4">
                  {renderSubjectList(subjects.regular, 'bg-blue-500 text-blue-500')}
                </div>
              )}
              {subjects.elective.length > 0 && (
                <div className="mb-4">
                  {renderSubjectList(subjects.elective, 'bg-gray-500 text-gray-500')}
                </div>
              )}
              {subjects.lab.length > 0 && (
                <div className="mb-4">
                  {renderSubjectList(subjects.lab, 'bg-amber-500 text-amber-500')}
                </div>
              )}
              {subjects.nptel.length > 0 && (
                <div className="mb-4">
                  {renderSubjectList(subjects.nptel, 'bg-green-500 text-green-500')}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-[600px] md:h-[calc(100vh-120px)] md:mr-6">
        {!selectedSubject ? (
          <EmptyState message="Select a subject from the left panel to view its modules and modules." />
        ) : (
          <div className="flex flex-col h-full bg-[#111827] rounded-3xl border border-gpcet-border overflow-hidden shadow-lg relative">
            
            {/* Header info */}
            <div className="p-6 sm:p-8 border-b border-gpcet-border bg-[#0A0F1E] relative overflow-hidden shrink-0">
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -mr-20 -mt-20 ${
                selectedSubject.type === 'nptel' ? 'bg-green-500' : 'bg-gpcet-primary'
              }`}></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-gray-400 bg-[#111827] border border-gpcet-border px-2 py-0.5 rounded shadow-inner">
                      {selectedSubject.subject_code}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-gpcet-muted bg-[#111827] border border-gpcet-border px-2 py-0.5 rounded shadow-inner">
                      {selectedSubject.credits} Credits
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    {selectedSubject.subject_name}
                  </h2>
                </div>
                
                <div className="flex gap-3">
                  {selectedSubject.type === 'nptel' && selectedSubject.nptel_course_url && (
                    <a 
                      href={selectedSubject.nptel_course_url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-green-500/30 hover:border-green-500 shadow-inner"
                    >
                      <ExternalLink size={16} /> Open NPTEL
                    </a>
                  )}
                  <button 
                    onClick={() => navigate(`/meera?subject=${selectedSubject.subject_code}&name=${encodeURIComponent(selectedSubject.subject_name)}`)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-gpcet-accent/10 to-[#111827] border border-gpcet-accent/30 hover:border-gpcet-accent/60 text-gpcet-accent hover:text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] box-glow-accent"
                  >
                    <Bot size={16} /> Ask Meera
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-4 border-b border-gpcet-border bg-[#0A0F1E] shrink-0 overflow-x-auto custom-scrollbar shadow-inner">
              <div className="flex gap-2 whitespace-nowrap">
                {getTabsForType(selectedSubject.type).map(tab => {
                  let activeClass = 'bg-gpcet-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-gpcet-primary/80';
                  if (selectedSubject.type === 'nptel') activeClass = 'bg-gpcet-nptel text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-400';
                  if (selectedSubject.type === 'lab') activeClass = 'bg-gpcet-warning text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-400';

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shadow-inner ${
                        activeTab === tab 
                          ? activeClass 
                          : 'bg-[#111827] border-gpcet-border text-gpcet-muted hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar relative bg-[#0A0F1E]/50">
              {isLoadingNotes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                  {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message={`No notes yet for ${selectedSubject.subject_code}. Your admin will upload them soon.`} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                  {filteredNotes.map(note => (
                    <NoteCard 
                      key={note._id} 
                      note={note} 
                      onView={handleViewPdf} 
                      onDownload={handleDownloadPdf}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {viewingPdf && (
        <PDFViewer note={viewingPdf} onClose={() => setViewingPdf(null)} />
      )}
    </div>
  );
};

export default Notes;
