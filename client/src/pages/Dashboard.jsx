import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Bot, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getSubjects } from '../services/notesService';
import SubjectCard from '../components/notes/SubjectCard';

import SkeletonCard from '../components/common/SkeletonCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState({ regular: [], nptel: [], lab: [], elective: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === 'student') {
      fetchSubjects();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const allSubjectsList = [...subjects.regular, ...subjects.elective, ...subjects.lab, ...subjects.nptel];
  const totalSubjectsCount = allSubjectsList.length;
  const nptelCount = subjects.nptel.length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 p-4">
        <div className="w-1/3 h-10 bg-white/5 rounded-xl animate-pulse mb-4 max-w-[300px]"></div>
        <div className="w-1/2 h-4 bg-white/5 rounded animate-pulse mb-8 max-w-[400px]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="h-[180px] bg-gpcet-card rounded-3xl animate-pulse border border-gpcet-border"></div>
           <div className="h-[180px] bg-gpcet-card rounded-3xl animate-pulse border border-gpcet-border"></div>
           <div className="h-[180px] bg-gpcet-card rounded-3xl animate-pulse border border-gpcet-border"></div>
        </div>
        <div className="w-1/4 h-6 bg-white/5 rounded animate-pulse mb-6 max-w-[200px]"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
           {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gpcet-text mb-4">Admin Dashboard</h1>
        <p className="text-gpcet-muted">Welcome to the GPCET Admin Panel. Use the sidebar to upload and manage notes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header Panel */}
      <div className="mb-10 animate-[fadeIn_1s_ease-out]">
        <h1 className="text-3xl sm:text-4xl font-black text-gpcet-text mb-2 tracking-tight">
          Namaste, <span className="text-gpcet-primary">{user?.display_name || 'Student'}</span>!
        </h1>
        <p className="text-gpcet-muted font-medium flex items-center gap-2">
          Ready to master your syllabus? Let's get started. 🚀
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gpcet-card rounded-3xl p-6 border border-gpcet-border shadow-lg relative overflow-hidden group hover:border-gpcet-primary/30 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
            <BookOpen size={100} className="text-gpcet-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 shadow-inner border border-blue-500/20">
              <BookOpen size={24} />
            </div>
            <p className="text-gpcet-muted font-medium mb-1">Your Subjects</p>
            <h3 className="text-4xl font-black text-gpcet-text tracking-tight mb-2">{totalSubjectsCount}</h3>
            <p className="text-[10px] uppercase tracking-wider text-blue-400/80 font-bold bg-gpcet-bg inline-block px-3 py-1 rounded-full border border-gpcet-border shadow-inner">R23 &bull; {user.branch} &bull; Y{user.year}S{user.semester}</p>
          </div>
        </div>

        <div className="bg-gpcet-card rounded-3xl p-6 border border-gpcet-border shadow-lg relative overflow-hidden group hover:border-gpcet-nptel/30 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
            <GraduationCap size={100} className="text-gpcet-nptel" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4 shadow-inner border border-green-500/20">
              <GraduationCap size={24} />
            </div>
            <p className="text-gpcet-muted font-medium mb-1">NPTEL Courses</p>
            <h3 className="text-4xl font-black text-gpcet-text tracking-tight mb-2">{nptelCount}</h3>
            <p className="text-[10px] uppercase tracking-wider text-green-400/80 font-bold bg-gpcet-bg inline-block px-3 py-1 rounded-full border border-gpcet-border shadow-inner">Active this semester</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/meera')}
          className="bg-gradient-to-br from-indigo-900/40 to-gpcet-card cursor-pointer rounded-3xl p-6 border border-gpcet-accent/30 shadow-lg relative overflow-hidden group hover:border-gpcet-accent/60 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 group-hover:rotate-12 transform origin-center">
            <Bot size={100} className="text-gpcet-accent" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gpcet-accent/20 flex items-center justify-center text-gpcet-accent mb-4 shadow-inner border border-gpcet-accent/30 box-glow-accent">
              <Bot size={24} />
            </div>
            <p className="text-indigo-200 font-medium mb-1">Ask Meera</p>
            <h3 className="text-4xl font-black text-gpcet-text tracking-tight mb-2">AI Ready</h3>
            <p className="text-[10px] uppercase tracking-wider text-gpcet-accent/80 font-bold bg-gpcet-bg inline-block px-3 py-1 rounded-full border border-gpcet-border shadow-inner">Groq llama3-70b &bull; Streaming</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gpcet-text">Your Subjects This Semester</h2>
        <div className="h-px bg-gpcet-border flex-1 ml-6"></div>
      </div>

      {totalSubjectsCount === 0 ? (
        <div className="text-center py-16 bg-gpcet-card rounded-3xl border border-dashed border-gpcet-border shadow-inner">
          <BookOpen size={48} className="mx-auto text-gpcet-muted mb-4 opacity-50" />
          <p className="text-gpcet-muted font-medium px-4">Welcome to GPCET CampusIQ! Start by exploring your subjects below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allSubjectsList.map(subject => (
            <SubjectCard key={subject.id || subject.subject_code} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
