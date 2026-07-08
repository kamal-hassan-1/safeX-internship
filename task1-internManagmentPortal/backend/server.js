const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Seed Initial Data Endpoint
app.post('/api/seed', async (req, res) => {
  try {
    const Candidate = require('./models/Candidate');
    const Group = require('./models/Group');
    const Task = require('./models/Task');

    // Clean existing data
    await Candidate.deleteMany();
    await Group.deleteMany();
    await Task.deleteMany();

    // Create Groups
    const group1 = await Group.create({
      name: 'Software Engineering Alpha',
      leadName: 'Ayesha Rehman',
      description: 'Core web application development team focusing on features and integrations.'
    });

    const group2 = await Group.create({
      name: 'UX/UI Design Wizards',
      leadName: 'Farhan Saeed',
      description: 'Creative design, layout design, glassmorphic styling, and user flow definition.'
    });

    const group3 = await Group.create({
      name: 'Cloud & DevOps Solutions',
      leadName: 'Dr. Asim Riaz',
      description: 'Infrastructure, deployment automation, security policies, and performance tuning.'
    });

    // Create Candidates
    const cand1 = await Candidate.create({
      name: 'Muhammad Ali',
      email: 'muhammad.ali@gmail.com',
      phone: '+03412987460',
      role: 'Frontend Dev',
      status: 'Accepted',
      group: group1._id,
      notes: 'Strong in React, eager to learn. Clean coding standards.'
    });

    const cand2 = await Candidate.create({
      name: 'Zainab Fatima',
      email: 'zainab.fatima@gmail.com',
      phone: '+903412987460',
      role: 'Backend Dev',
      status: 'Interviewing',
      group: group1._id,
      notes: 'Experienced with Node, Express, MongoDB. Excellent problem solver.'
    });

    const cand3 = await Candidate.create({
      name: 'Bilal Ahmed',
      email: 'bilal.ahmed@gmail.com',
      phone: '03412987460',
      role: 'UI/UX Designer',
      status: 'Accepted',
      group: group2._id,
      notes: 'Created modern UI designs. Master of Figma and CSS transitions.'
    });

    const cand4 = await Candidate.create({
      name: 'Hamza Yusuf',
      email: 'hamza.yusuf@gmail.com',
      phone: '03412987460',
      role: 'DevOps Intern',
      status: 'Offered',
      group: group3._id,
      notes: 'Familiar with Docker and AWS basics. Passionate about system automation.'
    });

    const cand5 = await Candidate.create({
      name: 'Ayesha Khan',
      email: 'ayesha.khan@gmail.com',
      phone: '03412987460',
      role: 'Fullstack Dev',
      status: 'Applied',
      notes: 'Awaiting interview scheduling. High GPA, impressive GitHub profile.'
    });

    // Create Tasks
    await Task.create({
      title: 'Initialize Repository & Setup Linters',
      description: 'Set up the base project structure, configure ESLint, and establish the main branches.',
      weekNumber: 1,
      assignedTo: cand1._id,
      status: 'Completed',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      feedback: 'Excellent work, clean setup!'
    });

    await Task.create({
      title: 'Design Dashboard Mockups',
      description: 'Create high-fidelity Figma layouts for the Candidate Directory and Weekly Tracker.',
      weekNumber: 1,
      assignedTo: cand3._id,
      status: 'Completed',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      feedback: 'Very elegant, theme matches guidelines perfectly.'
    });

    await Task.create({
      title: 'Implement Authentication APIs',
      description: 'Write REST endpoints for candidate login, token validation, and authorization middlewares.',
      weekNumber: 2,
      assignedTo: cand2._id,
      status: 'In Progress',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    });

    await Task.create({
      title: 'Configure CI/CD Pipelines',
      description: 'Draft GitHub Actions workflow to run lint checks and run unit tests on push.',
      weekNumber: 2,
      assignedTo: cand4._id,
      status: 'Pending',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({
      success: true,
      message: 'Database seeded with mock candidates, groups, and tasks.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed data',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
