
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors()); // Allow requests from our frontend development server
app.use(express.json()); // Middleware to parse JSON bodies

// Helper function to read from the DB
const readDb = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ polls: [] }));
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

// Helper function to write to the DB
const writeDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- API Endpoints ---

// GET /api/polls - Get all polls (or filter by status)
app.get('/api/polls', (req, res) => {
  const { polls } = readDb();
  const { status } = req.query;
  if (status === 'open') {
    return res.json(polls.filter(p => p.status === 'open'));
  }
  res.json(polls);
});

// GET /api/polls/:id - Get a single poll
app.get('/api/polls/:id', (req, res) => {
  const { polls } = readDb();
  const poll = polls.find(p => p.id === req.params.id);
  if (poll) {
    res.json(poll);
  } else {
    res.status(404).json({ message: 'Poll not found' });
  }
});

// GET /api/polls/:id/results - Get results for a poll
app.get('/api/polls/:id/results', (req, res) => {
    const { polls } = readDb();
    const poll = polls.find(p => p.id === req.params.id);
    if (poll) {
        // Sort by votes descending
        const sortedCandidates = [...poll.candidates].sort((a, b) => b.votes - a.votes);
        res.json(sortedCandidates);
    } else {
        res.status(404).json({ message: 'Poll not found' });
    }
});


// POST /api/polls - Create a new poll
app.post('/api/polls', (req, res) => {
  const { title, candidates } = req.body;
  if (!title || !Array.isArray(candidates) || candidates.length < 2) {
    return res.status(400).json({ message: 'Invalid poll data provided' });
  }
  
  const db = readDb();
  const newPoll = {
    id: crypto.randomUUID(),
    title,
    candidates: candidates.map(name => ({
      id: crypto.randomUUID(),
      name,
      votes: 0,
    })),
    status: 'open',
  };
  
  db.polls.push(newPoll);
  writeDb(db);
  res.status(201).json(newPoll);
});

// POST /api/polls/:id/vote - Submit a vote
app.post('/api/polls/:id/vote', (req, res) => {
    const db = readDb();
    const poll = db.polls.find(p => p.id === req.params.id);
    if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
    }
    if (poll.status === 'closed') {
        return res.status(400).json({ message: 'This poll is closed' });
    }

    const { candidateId } = req.body;
    const candidate = poll.candidates.find(c => c.id === candidateId);
    if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
    }

    candidate.votes++;
    writeDb(db);
    res.status(200).json({ message: 'Vote counted successfully' });
});


// PATCH /api/polls/:id/status - Toggle poll status
app.patch('/api/polls/:id/status', (req, res) => {
    const db = readDb();
    const pollIndex = db.polls.findIndex(p => p.id === req.params.id);
    if (pollIndex === -1) {
        return res.status(404).json({ message: 'Poll not found' });
    }
    
    const currentStatus = db.polls[pollIndex].status;
    db.polls[pollIndex].status = currentStatus === 'open' ? 'closed' : 'open';
    writeDb(db);
    res.json(db.polls[pollIndex]);
});

// DELETE /api/polls/:id - Delete a single poll
app.delete('/api/polls/:id', (req, res) => {
    const db = readDb();
    const initialLength = db.polls.length;
    db.polls = db.polls.filter(p => p.id !== req.params.id);
    if (db.polls.length === initialLength) {
        return res.status(404).json({ message: 'Poll not found' });
    }

    writeDb(db);
    res.status(204).send(); // No content
});

// DELETE /api/polls - Delete all polls
app.delete('/api/polls', (req, res) => {
    writeDb({ polls: [] });
    res.status(204).send(); // No content
});


app.listen(PORT, () => {
  console.log(`Kinettix Poll backend server running on http://localhost:${PORT}`);
});
