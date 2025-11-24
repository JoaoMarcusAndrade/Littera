import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import { sequelize } from './models.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
 

// Arquivos estáticos-desktop
router.use(express.static(path.join(__dirname, 'public-desktop')));

// Arquivos estáticos-mobile
router.use('/mobile', express.static(path.join(__dirname, 'public-mobile')));
// SPA mobile
router.get(/^\/mobile(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public-mobile', 'index.html'));
});

app.use('/', routes);

const PORT = 3000;
app.listen(PORT, () => {
  //powershell -ExecutionPolicy Bypass
  console.log(`Server rodando em http://localhost:${PORT}`);
});
(async () => {
  try {
    await sequelize.sync({ alter: true }); // cria/atualiza as tabelas
    console.log("Banco de dados sincronizado com sucesso!");
  } catch (error) {
    console.error("Erro ao sincronizar o banco:", error);
  }
})();
