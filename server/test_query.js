require('dotenv').config();
const { prisma } = require('./config/database');
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

async function test() {
  try {
    const notes = await prisma.note.findMany({ select: NOTE_SELECT });
    console.log("Success fetching notes!");
  } catch (e) {
    console.error("Notes err:", e.message);
  }
  
  try {
    const subjects = await prisma.subject.findMany({});
    console.log("Success fetching subjects. count:", subjects.length);
  } catch(e) {
    console.error("Subjects err:", e.message);
  }
}
test();
