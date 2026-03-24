require('dotenv').config();
const jwt = require('jsonwebtoken');
const { prisma } = require('./config/database');

async function testApi() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    const token = jwt.sign(
      { userId: admin.id, role: admin.role, branch: admin.branch, regulation: admin.regulation },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    
    const headers = { Authorization: `Bearer ${token}` };

    console.log("Fetching subjects...");
    const subjectsRes = await fetch('http://localhost:5000/api/subjects/all?branch=CSE&year=1&semester=1', { headers });
    const subjects = await subjectsRes.json();
    if (!subjectsRes.ok) throw new Error(JSON.stringify(subjects));
    console.log("Subjects ok, count:", subjects.length);

    console.log("Fetching admin notes...");
    const notesRes = await fetch('http://localhost:5000/api/notes/admin', { headers });
    const notes = await notesRes.json();
    if (!notesRes.ok) throw new Error(JSON.stringify(notes));
    console.log("Admin notes ok, count:", notes.length);

  } catch (error) {
    if (error.response) {
      console.error("API error:", error.response.status, error.response.data);
    } else {
      console.error("Request failed:", error.message);
    }
  }
}
testApi();
