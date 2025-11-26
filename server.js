import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import cookieParser from 'cookie-parser';
import { sequelize } from './models.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

 
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
