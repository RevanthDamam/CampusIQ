import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle2, Loader2, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSubjects, uploadNote, getAdminNotes, deleteNote } from '../../services/notesService';
import { BRANCHES } from '../../constants/gpcet';

const AdminUpload = () => {
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  
  const [unitLabel, setUnitLabel] = useState('Unit 1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  
  const [isImportant, setIsImportant] = useState(false);
  const [importantMessage, setImportantMessage] = useState('');
  
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [recentNotes, setRecentNotes] = useState([]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getAllSubjects(branch, year, semester);
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectCode(data[0].subject_code);
        } else {
          setSelectedSubjectCode('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSubjects();
  }, [branch, year, semester]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getAdminNotes();
        setRecentNotes(data);
      } catch(err) {}
    };
    fetchRecent();
  }, []);

  const selectedSubject = subjects.find(s => s.subject_code === selectedSubjectCode);

  const getUnitOptions = () => {
    if (!selectedSubject) return ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
    if (selectedSubject.type === 'nptel') return ['Week 1-4', 'Week 5-8', 'Week 9-12', 'Assignments', 'General'];
    if (selectedSubject.type === 'lab') return ['Programs', 'Viva Questions', 'Lab Manual', 'General'];
    return ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];
  };

  useEffect(() => {
    const opts = getUnitOptions();
    if (!opts.includes(unitLabel)) {
      setUnitLabel(opts[0]);
    }
  }, [selectedSubject]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Only PDF files are supported.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a PDF file');
    if (!selectedSubject) return toast.error('Please select a subject');

    setIsUploading(true);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('branch', branch);
    formData.append('year', year);
    formData.append('semester', semester);
    formData.append('subject_code', selectedSubject.subject_code);
    formData.append('subject_name', selectedSubject.subject_name);
    formData.append('subject_type', selectedSubject.type);
    
    // derive a unit_number roughly for sorting logic
    let unitNum = 1;
    if (unitLabel.startsWith('Unit ')) unitNum = parseInt(unitLabel.split(' ')[1]);
    if (selectedSubject.type === 'nptel') unitNum = 0;
    
    formData.append('unit_number', unitNum);
    formData.append('unit_label', unitLabel);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('is_important', isImportant);
    if (isImportant) formData.append('important_message', importantMessage);

    try {
      const newNote = await uploadNote(formData);
      toast.success('Notes uploaded successfully!');
      
      // Reset form visually
      setTitle('');
      setDescription('');
      setTags('');
      setFile(null);
      setIsImportant(false);
      setImportantMessage('');
      
      setRecentNotes([newNote, ...recentNotes.slice(0, 9)]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(id);
      setRecentNotes(recentNotes.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch(err) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 p-8 bg-gpcet-card rounded-3xl border border-gpcet-border shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gpcet-primary opacity-5 blur-3xl rounded-full"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gpcet-text mb-2 tracking-tight">Upload Study Material</h1>
          <p className="text-gpcet-muted font-medium text-sm">Materials will be visible to students instantly after upload.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 relative z-10 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Branch</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full bg-gpcet-bg border border-gpcet-border rounded-xl px-4 py-3 text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow">
                {BRANCHES.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-gpcet-bg border border-gpcet-border rounded-xl px-4 py-3 text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow">
                {[1,2,3,4].map(y => <option key={y} value={y}>{y}{y===1?'st':y===2?'nd':y===3?'rd':'th'} Year</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Semester</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-gpcet-bg border border-gpcet-border rounded-xl px-4 py-3 text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow">
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</label>
              <select 
                value={selectedSubjectCode} 
                onChange={(e) => setSelectedSubjectCode(e.target.value)} 
                className="w-full bg-gpcet-bg border border-gpcet-border rounded-xl px-4 py-3 text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow"
                disabled={subjects.length === 0}
              >
                {subjects.map(s => <option key={s.subject_code} value={s.subject_code}>{s.subject_name} ({s.subject_code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category &bull; Unit</label>
              <select 
                value={unitLabel} 
                onChange={(e) => setUnitLabel(e.target.value)} 
                className="w-full bg-gpcet-bg border border-gpcet-border rounded-xl px-4 py-3 text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow"
              >
                {getUnitOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-gpcet-border/50 my-6"></div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Note Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. OS Unit 3 - Process Scheduling Notes"
              className="w-full bg-gpcet-bg border border-gpcet-border rounded-xl px-4 py-3 text-gpcet-text focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description <span className="lowercase text-[10px] text-gray-500 font-normal">(Optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of contents..."
              rows={2}
              className="w-full bg-[#0A0F1E] border border-gpcet-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow custom-scrollbar resize-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tags <span className="lowercase text-[10px] text-gray-500 font-normal">(Comma separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. deadlock, scheduling, memory"
              className="w-full bg-[#0A0F1E] border border-gpcet-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gpcet-primary outline-none font-medium shadow-inner transition-shadow font-mono text-sm"
            />
          </div>

          <div className="bg-gpcet-bg rounded-xl p-4 border border-amber-500/20 flex flex-col gap-4">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isImportant} 
                  onChange={(e) => setIsImportant(e.target.checked)} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isImportant ? 'bg-amber-500' : 'bg-gray-700'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isImportant ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-3 font-bold text-amber-500 flex items-center gap-1"><Star size={16} fill={isImportant?"currentColor":"none"}/> Mark as Important</div>
            </label>
            
            {isImportant && (
              <input
                type="text"
                value={importantMessage}
                onChange={(e) => setImportantMessage(e.target.value)}
                placeholder="Important message to students (optional)"
                className="w-full bg-gpcet-card border border-amber-500/30 rounded-xl px-4 py-2.5 text-gpcet-text focus:ring-2 focus:ring-amber-500 outline-none text-sm placeholder-amber-500/30"
              />
            )}
          </div>

          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative bg-gpcet-bg/50 ${
              file ? 'border-green-500/50 bg-green-500/5' : 'border-gpcet-border hover:border-gpcet-primary/50'
            }`}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileDrop} 
            />
            {file ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-4 shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-white font-bold mb-1 break-all px-4">{file.name}</p>
                <p className="text-green-500/80 text-xs font-mono font-bold bg-green-500/10 px-2 py-1 rounded">{(file.size / (1024*1024)).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 shadow-inner border border-red-500/20">
                  <FileText size={32} />
                </div>
                <p className="text-white font-bold mb-1">Drop PDF here or click to browse</p>
                <p className="text-gpcet-muted text-xs">Maximum file size: 50MB &bull; PDF files only</p>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-gpcet-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest text-sm py-4 px-4 rounded-xl transition-all flex justify-center items-center shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
          >
            {isUploading ? (
              <><Loader2 className="animate-spin mr-2" size={20} /> Uploading heavily to Cloudinary...</>
            ) : (
              <><UploadIcon className="mr-2" size={18} /> Upload Notes Node</>
            )}
          </button>
        </form>
      </div>

      <div className="mb-6 flex items-center justify-between px-2">
        <h2 className="text-xl font-bold text-gpcet-text">Recent Uploads</h2>
      </div>

      <div className="bg-gpcet-card rounded-3xl border border-gpcet-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gpcet-bg border-b border-gpcet-border text-xs uppercase text-gpcet-muted font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Unit/Week</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gpcet-border bg-gpcet-card">
              {recentNotes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gpcet-muted font-medium bg-gpcet-bg/30">No recent uploads found.</td>
                </tr>
              ) : (
                recentNotes.map(note => (
                  <tr key={note.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gpcet-text">{note.subject_code}</div>
                      <div className="text-[10px] text-gpcet-muted mt-0.5">{note.regulation} &bull; {note.branch}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">{note.unit_label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-200 line-clamp-1">{note.title}</div>
                      <div className="text-[10px] flex items-center gap-1 text-gray-500 mt-1"><Clock size={10} /> {new Date(note.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs bg-gpcet-bg px-2 py-1 rounded border border-gpcet-border shadow-inner">{note.view_count}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleDelete(note.id)}
                        className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
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

export default AdminUpload;
