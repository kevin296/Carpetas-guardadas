const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de carpeta pública
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de body-parser
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(__dirname, 'public', 'temp', req.body.username);
    if (!fs.existsSync(userDir)){
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ruta principal
app.get('/', (req, res) => {
  const tempDir = path.join(__dirname, 'public', 'temp');
  const users = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
  let tempFiles = [];

  users.forEach(user => {
    const userDir = path.join(tempDir, user);
    const files = fs.readdirSync(userDir).map(file => ({ username: user, filename: file }));
    tempFiles = tempFiles.concat(files);
  });

  res.render('index', { tempFiles });
});

// Ruta para subir archivos
app.post('/upload', upload.array('pdfs', 10), (req, res) => {
  res.redirect('/');
});

// Ruta para mover archivos a permanente
app.post('/move-to-permanent', (req, res) => {
  const username = req.body.username;
  const tempDir = path.join(__dirname, 'public', 'temp', username);
  const permanentDir = path.join(__dirname, 'public', 'permanent', username);

  if (!fs.existsSync(permanentDir)){
    fs.mkdirSync(permanentDir, { recursive: true });
  }

  const files = fs.readdirSync(tempDir);
  files.forEach(file => {
    fs.renameSync(path.join(tempDir, file), path.join(permanentDir, file));
  });

  fs.rmdirSync(tempDir);
  res.redirect('/');
});

// Servidor escuchando
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
