const { prisma } = require('../config/database');

const NOTE_SELECT = {
  id: true,
  branch: true,
  year: true,
  semester: true,
  regulation: true,
  subject_code: true,
  subject_name: true,
  subject_type: true,
  unit_number: true,
  unit_label: true,
  title: true,
  description: true,
  file_name: true,
  file_mimetype: true,
  file_size_mb: true,
  uploaded_by: true,
  is_important: true,
  important_message: true,
  view_count: true,
  tags: true,
  created_at: true,
  updated_at: true,
  uploader: {
    select: {
      display_name: true,
      avatar_initials: true
    }
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { subject_code, unit_number } = req.query;
    if (!subject_code) return res.status(400).json({ message: 'subject_code is required' });

    const filter = {
      subject_code,
      regulation: req.user.regulation || 'R23'
    };

    if (unit_number !== undefined && unit_number !== 'null') {
      filter.unit_number = Number(unit_number);
    }

    const notes = await prisma.note.findMany({
      where: filter,
      orderBy: [
        { is_important: 'desc' },
        { created_at: 'desc' }
      ],
      select: NOTE_SELECT
    });
    
    // Format output to match existing frontend expectations if needed
    const formattedNotes = notes.map(note => ({
      ...note,
      uploaded_by: note.uploader
    }));
    
    res.json(formattedNotes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdminNotes = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { uploaded_by: req.user.userId },
      orderBy: { created_at: 'desc' },
      take: 20,
      select: NOTE_SELECT
    });

    const formattedNotes = notes.map(note => ({
      ...note,
      uploaded_by: note.uploader
    }));

    res.json(formattedNotes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { branch, year, semester, regulation, subject_code, subject_name, subject_type, unit_number, unit_label, title, description, is_important, important_message, tags } = req.body;

    const newNote = await prisma.note.create({
      data: {
        branch,
        year: Number(year),
        semester: Number(semester),
        regulation: regulation || 'R23',
        subject_code,
        subject_name,
        subject_type,
        unit_number: Number(unit_number),
        unit_label,
        title,
        description,
        file_data: req.file.buffer,
        file_mimetype: req.file.mimetype,
        file_name: req.file.originalname,
        file_size_mb: Number((req.file.size / (1024 * 1024)).toFixed(2)),
        uploaded_by: req.user.userId,
        is_important: is_important === 'true' || is_important === true,
        important_message,
        tags: tags ? tags.split(',').map(t => t.trim()) : []
      },
      select: NOTE_SELECT // Never return file_data on creation response for performance
    });

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    // We only need the ID to ensure it exists before deleting
    const note = await prisma.note.findUnique({ 
      where: { id: req.params.id },
      select: { id: true }
    });
    
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    await prisma.note.delete({ where: { id: req.params.id } });
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.viewNote = async (req, res) => {
  try {
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { view_count: { increment: 1 } },
      select: NOTE_SELECT
    });
    
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await prisma.session.create({
      data: {
        user_id: req.user.userId,
        action_type: 'view_note',
        subject_code: note.subject_code,
        subject_name: note.subject_name
      }
    });

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.proxyPdf = async (req, res) => {
  try {
    // Explicitly query ONLY the file data fields, nothing else needed
    const note = await prisma.note.findUnique({ 
      where: { id: req.params.id },
      select: { file_data: true, file_mimetype: true, file_name: true, title: true }
    });
    
    if (!note || !note.file_data) return res.status(404).json({ message: 'Note or file not found' });

    // Send headers for browser inline viewing
    res.setHeader('Content-Type', note.file_mimetype || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${note.file_name || note.title + '.pdf'}"`);
    
    // Direct stream buffer
    res.end(note.file_data);
  } catch (error) {
    console.error('File Serving Error:', error.message);
    res.status(500).json({ message: 'Failed to serve file', error: error.message });
  }
};
