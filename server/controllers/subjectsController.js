const { prisma } = require('../config/database');

exports.getSubjects = async (req, res) => {
  try {
    const { branch, year, semester, regulation } = req.user;
    
    // Admins can query specific subjects by passing query params. 
    // Defaults to the logged-in student's details.
    const filter = {
      branch: req.query.branch || branch,
      year: req.query.year ? Number(req.query.year) : year,
      semester: req.query.semester ? Number(req.query.semester) : semester,
      regulation: req.query.regulation || regulation
    };

    const subjects = await prisma.subject.findMany({
      where: filter,
      orderBy: { order: 'asc' }
    });

    const grouped = {
      regular: subjects.filter(s => s.type === 'regular'),
      nptel: subjects.filter(s => s.type === 'nptel'),
      lab: subjects.filter(s => s.type === 'lab'),
      elective: subjects.filter(s => s.type === 'elective'),
    };

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const { branch, year, semester } = req.query;
    if (!branch || !year || !semester) {
      return res.status(400).json({ message: 'Branch, year, and semester are required' });
    }
    const subjects = await prisma.subject.findMany({ 
      where: { 
        branch, 
        year: Number(year), 
        semester: Number(semester) 
      },
      orderBy: { order: 'asc' } 
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
