
// server.js (CommonJS)
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// allow requests from your Live Server (and others). You can restrict origin if you want.
app.use(cors()); 
app.use(express.json());

// Make uploads folder if missing
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Serve uploaded images if you want to view them
app.use('/uploads', express.static(uploadDir));

// ---------- MongoDB ----------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bbsbec';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ---------- Mongoose schema ----------
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollno: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  batch: { type: String, required: true },
  branch: { type: String, required: true },
  photoPath: { type: String }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// ---------- Multer setup ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, Date.now() + '_' + base + ext);
  }
});
const upload = multer({ storage });

// ---------- API route ----------
app.post('/api/students', upload.single('photo'), async (req, res) => {
  try {
    const { name, rollno, phone, email, batch, branch } = req.body;

    if (!name || !rollno || !phone || !email || !batch || !branch) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const student = new Student({
      name, rollno, phone, email, batch, branch,
      photoPath: req.file ? '/uploads/' + req.file.filename : null
    });

    await student.save();
    return res.json({ ok: true, id: student._id });
  } catch (err) {
    console.error('Save error:', err);
    if (err.code === 11000) return res.status(400).json({ message: 'Roll number already exists' });
    return res.status(500).json({ message: 'Server error' });
  }
});

// Optional: serve your frontend from Express (uncomment if you want)
// app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
