import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import oauthRoutes from "./oauth.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/test", (req, res) => {
  res.json({ message: "Backend OK !" });
});

app.use("/", oauthRoutes);

// limite des requêtes à 150MB
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

let scheduledPosts = [];

// --- Upload immédiat
app.post('/upload', upload.fields([{ name: 'video' }, { name: 'cover' }]), (req, res) => {
  const video = req.files['video'] ? req.files['video'][0] : null;
  const cover = req.files['cover'] ? req.files['cover'][0] : null;
  const description = req.body.description || '';
  const platforms = req.body.platforms ? req.body.platforms.split(',') : [];

  console.log(`Vidéo reçue : ${video ? video.filename : 'aucune'} sur plateformes ${platforms}`);

  res.json({ success: true, video, cover, description, platforms });
});

// --- Programmation
app.post('/schedule', upload.fields([{ name: 'video' }, { name: 'cover' }]), (req, res) => {
  const video = req.files['video'] ? req.files['video'][0] : null;
  const cover = req.files['cover'] ? req.files['cover'][0] : null;
  const description = req.body.description || '';
  const platforms = req.body.platforms ? req.body.platforms.split(',') : [];
  const schedule = req.body.schedule;

  const post = {
    video: {
      filename: video.originalname,
      path: video.path,
      url: `http://localhost:${PORT}/uploads/${video.filename}`
    },
    cover: cover ? {
      filename: cover.originalname,
      path: cover.path,
      url: `http://localhost:${PORT}/uploads/${cover.filename}`
    } : null,
    description,
    platforms,
    schedule: new Date(schedule).toISOString()
  };

  scheduledPosts.push(post);

  // ✅ On remet le log
  console.log(`Post programmé : ${video.path} à ${schedule} plateformes:`, platforms);

  res.json({ success: true, post });
});

// --- Récupérer les posts programmés (non publiés)
app.get('/scheduled', (req, res) => {
  const now = new Date();
  const upcomingPosts = scheduledPosts.filter(p => new Date(p.schedule) > now);
  res.json(upcomingPosts);
});

// --- Supprimer un post programmé
app.delete('/scheduled/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < scheduledPosts.length) {
    scheduledPosts.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Index invalide" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
