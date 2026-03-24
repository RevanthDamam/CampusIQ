import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ZoomIn, ZoomOut, Loader2, Download } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import api from '../../services/api';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ note, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [fileUrl, setFileUrl] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoadError(null);
        // Use the proxy route which IS authenticated (sends our JWT via the 'api' instance)
        const response = await api.get(`/notes/${note.id}/proxy`, { 
          responseType: 'blob'
        });
        const url = URL.createObjectURL(response.data);
        setFileUrl(url);
      } catch (err) {
        console.error('PDF Proxy Fetch Error:', err);
        setLoadError(err.message === 'Request failed with status code 401' ? '401' : err.message);
      }
    };

    fetchPdf();

    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [note.cloudinary_url]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000f2] flex flex-col font-sans backdrop-blur-md">
      {/* Topbar */}
      <div className="h-16 bg-gpcet-navbar border-b border-gpcet-border flex items-center justify-between px-6 shrink-0 shadow-xl">
        <div className="flex flex-1 items-center gap-4 truncate mr-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl hover:bg-red-500/20 hover:text-red-400 group shrink-0">
            <X size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <div className="overflow-hidden">
            <h3 className="text-gpcet-text font-bold truncate text-sm sm:text-base">{note.title}</h3>
            <p className="text-gray-400 text-[11px] flex items-center gap-2 mt-0.5">
              <span className="text-gpcet-primary font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">{note.subject_code}</span>
              <span>{note.unit_label}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5 shadow-inner hidden sm:flex">
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>
              <ZoomOut size={16} />
            </button>
            <span className="text-[11px] font-mono text-gray-300 min-w-[40px] text-center font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" onClick={() => setScale(s => Math.min(3, s + 0.2))}>
              <ZoomIn size={16} />
            </button>
          </div>
          
          <a 
            href={note.cloudinary_url}
            target="_blank"
            rel="noopener noreferrer" 
            className="flex items-center gap-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all border border-blue-500/30 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <Download size={16} /> <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full flex justify-center py-8 relative">
        {loadError ? (
          <div className="flex flex-col items-center justify-center text-red-400 gap-4 max-w-md text-center px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <X size={32} />
            </div>
            <h4 className="text-lg font-bold text-white">Access Denied (401)</h4>
            <p className="text-sm text-gray-400">Your browser is having trouble fetching this PDF directly from Cloudinary. This usually happens due to security headers or temporary link expiration.</p>
            <button 
              onClick={() => window.open(note.cloudinary_url, '_blank')}
              className="mt-4 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-sm font-bold transition-all border border-white/10"
            >
              Try Opening in New Tab
            </button>
          </div>
        ) : !fileUrl ? (
          <div className="flex flex-col items-center justify-center text-gpcet-muted h-64 gap-4">
            <Loader2 size={32} className="animate-spin text-gpcet-primary" />
            <p className="font-bold text-sm">SECURE LINK HANDSHAKE...</p>
          </div>
        ) : (
          <Document
            file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center text-gpcet-muted h-64 gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse"></div>
                <Loader2 size={32} className="animate-spin text-gpcet-primary relative z-10" />
              </div>
              <p className="font-bold text-sm tracking-wide text-gray-300 animate-pulse uppercase">Decrypting Document...</p>
            </div>
          }
          className="flex flex-col gap-8 items-center w-full px-4"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded overflow-hidden bg-white shrink-0 ring-1 ring-white/10 relative group">
              <Page 
                pageNumber={index + 1} 
                scale={scale} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={<div className="bg-white/5 w-[800px] h-[1100px] animate-pulse"></div>}
              />
              {/* Page Number Overlay */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {index + 1} / {numPages}
              </div>
            </div>
          ))}
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
