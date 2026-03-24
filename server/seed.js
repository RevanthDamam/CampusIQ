require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Note = require('./models/Note');
const Session = require('./models/Session');
const connectDB = require('./config/database');

const seedData = async () => {
  try {
    await connectDB();

    console.log("Starting seed process...");

    // STEP 1 — Clear existing data:
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Note.deleteMany({});
    await Session.deleteMany({});
    console.log("Cleared existing data.");

    // STEP 2 — Create admin account:
    const adminPassword = await bcrypt.hash('Admin@GPCET123', 10);
    const admin = await User.create({
      email: 'admin@gpcet.ac.in',
      password: adminPassword,
      role: 'admin',
      display_name: 'GPCET Admin',
      branch: 'CSE',
      year: 1,
      semester: 1
    });

    // STEP 3 — Create demo student account:
    const studentPassword = await bcrypt.hash('Student@123', 10);
    const student = await User.create({
      email: 'student@gpcet.ac.in',
      password: studentPassword,
      role: 'student',
      display_name: 'GPCET Student',
      roll_number: '23B91A0501',
      branch: 'CSE',
      year: 3,
      semester: 2,
      regulation: 'R23'
    });
    console.log("Created demo accounts.");

    // STEP 4 & 5 — Seed ALL subjects for R23, CSE branch (all 4 years) + CAI (Year 3 Sem 2):
    const subjects = [
      // CSE · Year 1 · Semester 1
      { branch: 'CSE', year: 1, semester: 1, regulation: 'R23', code: '23BS1101', name: 'Mathematics - I', type: 'regular', credits: 4, order: 1 },
      { branch: 'CSE', year: 1, semester: 1, regulation: 'R23', code: '23BS1102', name: 'Engineering Physics', type: 'regular', credits: 4, order: 2 },
      { branch: 'CSE', year: 1, semester: 1, regulation: 'R23', code: '23CS1101', name: 'Introduction to Programming (Python)', type: 'regular', credits: 4, order: 3 },
      { branch: 'CSE', year: 1, semester: 1, regulation: 'R23', code: '23BS1103', name: 'English for Communication', type: 'regular', credits: 3, order: 4 },
      { branch: 'CSE', year: 1, semester: 1, regulation: 'R23', code: '23CS1102', name: 'Engineering Workshop', type: 'lab', is_theory: false, credits: 2, order: 5 },
      { branch: 'CSE', year: 1, semester: 1, regulation: 'R23', code: '23CS1103', name: 'Programming Lab (Python)', type: 'lab', is_theory: false, credits: 2, order: 6 },

      // CSE · Year 1 · Semester 2
      { branch: 'CSE', year: 1, semester: 2, regulation: 'R23', code: '23BS1201', name: 'Mathematics - II', type: 'regular', credits: 4, order: 1 },
      { branch: 'CSE', year: 1, semester: 2, regulation: 'R23', code: '23BS1202', name: 'Engineering Chemistry', type: 'regular', credits: 4, order: 2 },
      { branch: 'CSE', year: 1, semester: 2, regulation: 'R23', code: '23CS1201', name: 'Digital Logic Design', type: 'regular', credits: 4, order: 3 },
      { branch: 'CSE', year: 1, semester: 2, regulation: 'R23', code: '23CS1202', name: 'Data Structures', type: 'regular', credits: 4, order: 4 },
      { branch: 'CSE', year: 1, semester: 2, regulation: 'R23', code: '23CS1203', name: 'Data Structures Lab', type: 'lab', is_theory: false, credits: 2, order: 5 },
      { branch: 'CSE', year: 1, semester: 2, regulation: 'R23', code: '23CS1204', name: 'Digital Logic Lab', type: 'lab', is_theory: false, credits: 2, order: 6 },

      // CSE · Year 2 · Semester 1
      { branch: 'CSE', year: 2, semester: 1, regulation: 'R23', code: '23CS2101', name: 'Object Oriented Programming (Java)', type: 'regular', credits: 4, order: 1 },
      { branch: 'CSE', year: 2, semester: 1, regulation: 'R23', code: '23CS2102', name: 'Computer Organization and Architecture', type: 'regular', credits: 4, order: 2 },
      { branch: 'CSE', year: 2, semester: 1, regulation: 'R23', code: '23CS2103', name: 'Discrete Mathematics', type: 'regular', credits: 4, order: 3 },
      { branch: 'CSE', year: 2, semester: 1, regulation: 'R23', code: '23CS2104', name: 'Database Management Systems', type: 'regular', credits: 4, order: 4 },
      { branch: 'CSE', year: 2, semester: 1, regulation: 'R23', code: '23CS2105', name: 'OOP Lab (Java)', type: 'lab', is_theory: false, credits: 2, order: 5 },
      { branch: 'CSE', year: 2, semester: 1, regulation: 'R23', code: '23CS2106', name: 'DBMS Lab', type: 'lab', is_theory: false, credits: 2, order: 6 },
      { branch: 'CSE', year: 2, semester: 1, regulation: 'R23', code: 'NPTEL2101', name: 'Programming in Java', type: 'nptel', credits: 3, order: 7, nptel_course_url: 'https://nptel.ac.in/courses/106105191', nptel_weeks_total: 12 },

      // CSE · Year 2 · Semester 2
      { branch: 'CSE', year: 2, semester: 2, regulation: 'R23', code: '23CS2201', name: 'Operating Systems', type: 'regular', credits: 4, order: 1 },
      { branch: 'CSE', year: 2, semester: 2, regulation: 'R23', code: '23CS2202', name: 'Computer Networks', type: 'regular', credits: 4, order: 2 },
      { branch: 'CSE', year: 2, semester: 2, regulation: 'R23', code: '23CS2203', name: 'Theory of Computation', type: 'regular', credits: 4, order: 3 },
      { branch: 'CSE', year: 2, semester: 2, regulation: 'R23', code: '23CS2204', name: 'Software Engineering', type: 'regular', credits: 3, order: 4 },
      { branch: 'CSE', year: 2, semester: 2, regulation: 'R23', code: '23CS2205', name: 'OS Lab', type: 'lab', is_theory: false, credits: 2, order: 5 },
      { branch: 'CSE', year: 2, semester: 2, regulation: 'R23', code: '23CS2206', name: 'Networks Lab', type: 'lab', is_theory: false, credits: 2, order: 6 },
      { branch: 'CSE', year: 2, semester: 2, regulation: 'R23', code: 'NPTEL2201', name: 'Data Science for Engineers', type: 'nptel', credits: 3, order: 7, nptel_course_url: 'https://nptel.ac.in/courses/106106179', nptel_weeks_total: 12 },

      // CSE · Year 3 · Semester 1
      { branch: 'CSE', year: 3, semester: 1, regulation: 'R23', code: '23CS3101', name: 'Design and Analysis of Algorithms', type: 'regular', credits: 4, order: 1 },
      { branch: 'CSE', year: 3, semester: 1, regulation: 'R23', code: '23CS3102', name: 'Compiler Design', type: 'regular', credits: 4, order: 2 },
      { branch: 'CSE', year: 3, semester: 1, regulation: 'R23', code: '23CS3103', name: 'Artificial Intelligence', type: 'regular', credits: 4, order: 3 },
      { branch: 'CSE', year: 3, semester: 1, regulation: 'R23', code: '23CS3104', name: 'Web Technologies', type: 'regular', credits: 3, order: 4 },
      { branch: 'CSE', year: 3, semester: 1, regulation: 'R23', code: '23CS3105', name: 'Algorithms Lab', type: 'lab', is_theory: false, credits: 2, order: 5 },
      { branch: 'CSE', year: 3, semester: 1, regulation: 'R23', code: '23CS3106', name: 'Web Technologies Lab', type: 'lab', is_theory: false, credits: 2, order: 6 },
      { branch: 'CSE', year: 3, semester: 1, regulation: 'R23', code: 'NPTEL3101', name: 'Cloud Computing', type: 'nptel', credits: 3, order: 7, nptel_course_url: 'https://nptel.ac.in/courses/106105215', nptel_weeks_total: 12 },

      // CSE · Year 3 · Semester 2 (DEMO STUDENT SEMESTER)
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: '23CS3201', name: 'Machine Learning', type: 'regular', credits: 4, order: 1 },
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: '23CS3202', name: 'Cryptography and Network Security', type: 'regular', credits: 4, order: 2 },
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: '23CS3203', name: 'Software Project Management', type: 'regular', credits: 3, order: 3 },
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: 'NPTEL3201', name: 'Mobile Computing and Ad-Hoc Networks', type: 'nptel', credits: 3, order: 4, nptel_course_url: 'https://onlinecourses.nptel.ac.in/noc25_cs74/preview', nptel_weeks_total: 12 },
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: 'NPTEL3202', name: 'Cloud Computing', type: 'nptel', credits: 3, order: 5, nptel_course_url: 'https://onlinecourses.nptel.ac.in/noc26_cs55/preview', nptel_weeks_total: 12 },
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: 'NPTEL3203', name: 'Non-Conventional Energy Resources', type: 'nptel', credits: 3, order: 6, nptel_course_url: 'https://onlinecourses.nptel.ac.in/noc22_ge14/preview', nptel_weeks_total: 12 },
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: '23CS3204', name: 'ML Lab', type: 'lab', is_theory: false, credits: 2, order: 7 },
      { branch: 'CSE', year: 3, semester: 2, regulation: 'R23', code: '23CS3204', name: 'CNS Lab', type: 'lab', is_theory: false, credits: 2, order: 7 },

      
      // CSE · Year 4 · Semester 1
      { branch: 'CSE', year: 4, semester: 1, regulation: 'R23', code: '23CS4101', name: 'Big Data Analytics', type: 'regular', credits: 4, order: 1 },
      { branch: 'CSE', year: 4, semester: 1, regulation: 'R23', code: '23CS4102', name: 'Information Security', type: 'regular', credits: 4, order: 2 },
      { branch: 'CSE', year: 4, semester: 1, regulation: 'R23', code: '23CS4103', name: 'Elective I', type: 'elective', credits: 3, order: 3 },
      { branch: 'CSE', year: 4, semester: 1, regulation: 'R23', code: '23CS4104', name: 'Elective II', type: 'elective', credits: 3, order: 4 },
      { branch: 'CSE', year: 4, semester: 1, regulation: 'R23', code: '23CS4105', name: 'Project Phase I', type: 'lab', is_theory: false, credits: 4, order: 5 },
      { branch: 'CSE', year: 4, semester: 1, regulation: 'R23', code: 'NPTEL4101', name: 'Deep Learning', type: 'nptel', credits: 3, order: 6, nptel_course_url: 'https://nptel.ac.in/courses/106106184', nptel_weeks_total: 12 },

      // CSE · Year 4 · Semester 2
      { branch: 'CSE', year: 4, semester: 2, regulation: 'R23', code: '23CS4201', name: 'Elective III', type: 'elective', credits: 3, order: 1 },
      { branch: 'CSE', year: 4, semester: 2, regulation: 'R23', code: '23CS4202', name: 'Elective IV', type: 'elective', credits: 3, order: 2 },
      { branch: 'CSE', year: 4, semester: 2, regulation: 'R23', code: '23CS4203', name: 'Project Phase II', type: 'lab', is_theory: false, credits: 8, order: 3 },
      { branch: 'CSE', year: 4, semester: 2, regulation: 'R23', code: '23CS4204', name: 'Internship', type: 'lab', is_theory: false, credits: 4, order: 4 },
      { branch: 'CSE', year: 4, semester: 2, regulation: 'R23', code: 'NPTEL4201', name: 'Ethics in Engineering Practice', type: 'nptel', credits: 2, order: 5, nptel_course_url: 'https://nptel.ac.in/courses/109104129', nptel_weeks_total: 8 },

      // CAI · Year 3 · Semester 2
      { branch: 'CAI', year: 3, semester: 2, regulation: 'R23', code: '23CA3201', name: 'Natural Language Processing', type: 'regular', credits: 4, order: 1 },
      { branch: 'CAI', year: 3, semester: 2, regulation: 'R23', code: '23CA3202', name: 'Computer Vision', type: 'regular', credits: 4, order: 2 },
      { branch: 'CAI', year: 3, semester: 2, regulation: 'R23', code: '23CA3203', name: 'Reinforcement Learning', type: 'regular', credits: 3, order: 3 },
      { branch: 'CAI', year: 3, semester: 2, regulation: 'R23', code: 'NPTEL-CA3201', name: 'Deep Learning for Computer Vision', type: 'nptel', credits: 3, order: 4, nptel_course_url: 'https://nptel.ac.in/courses/106106184', nptel_weeks_total: 12 }
    ];

    for (let subj of subjects) {
      await Subject.create({
        branch: subj.branch,
        year: subj.year,
        semester: subj.semester,
        regulation: subj.regulation,
        subject_code: subj.code,
        subject_name: subj.name,
        type: subj.type,
        credits: subj.credits,
        is_theory: subj.is_theory !== false,
        nptel_course_url: subj.nptel_course_url,
        nptel_weeks_total: subj.nptel_weeks_total,
        order: subj.order
      });
    }

    console.log("✅ GPCET CampusIQ seed complete!");
    console.log("   Admin  : admin@gpcet.ac.in  / Admin@GPCET123");
    console.log("   Student: student@gpcet.ac.in / Student@123");
    console.log("   Subjects seeded: CSE (all 4 years), CAI (Year 3 Sem 2)");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedData();
