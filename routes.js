import express from 'express';
import path from 'path';
import bcrypt from "bcryptjs";
import { fileURLToPath } from 'url';
import { Usuario, Livro } from "./models.js";
import { Op } from 'sequelize';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Arquivos estáticos-desktop
router.use(express.static(path.join(__dirname, 'public-desktop')));

// Arquivos estáticos-mobile
router.use('/mobile', express.static(path.join(__dirname, 'public-mobile')));


// SPA mobile
router.get(/^\/mobile(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public-mobile', 'index.html'));
});

// Rotas SPA
const spaRoutes = [
  '/', '/login', '/cadastro'
];

spaRoutes.forEach(route => {
  router.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public-desktop', 'index.html'));
  });
});


//  ROTAS DA API MOBILE
router.post('/api/livro', async (req, res) => {
  try {
    const dados = req.body;

    if (!dados.titulo) {
      return res.status(400).json({ error: "Título é obrigatório." });
    }

    const livro = await Livro.create({
      titulo: dados.titulo,
      autor: dados.autor,
      nacionalidade : dados.nacionalidade,
      editora: dados.editora,
      paginas: dados.paginas,
      preco: dados.preco,
      ISBN: dados.isbn,
      genero: dados.genero,
      estado_conservacao: dados.estado_conservacao,
      descricao: dados.descricao,
      metodo_aquisicao: dados.metodo_aquisicao,
      foto_url: dados.imagem
    });

    return res.status(201).json({ message: "Livro cadastrado!", livro });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar dados" });
  }
})

router.get('/api/livro', async (req, res) => { // puxar livros
  try{

    const { genero, titulo, ISBN, autor } = req.query; //texto de pesquisa opcional

    const where = {};

    if (genero) where.genero = { [Op.iLike]: `%${genero}%`};
    if (titulo) where.titulo = { [Op.iLike]: `%${titulo}%`};
    if (ISBN) where.ISBN = { [Op.iLike]: `%${ISBN}%`};
    if (autor) where.autor = { [Op.iLike]: `%${autor}%`};

    const livros = await Livro.findAll({
      where,
      order: [['createdAt', 'DESC']]//pega todos os livros do mais rescente ao mais antigo
    });
    
    res.json(livros);
  } catch (err){
    console.error(err);
    res.status(500).json({ error: "Erro ao processar dados"});
  }
});

router.delete('/api/livro/:id', async (req, res) => {
  try {
  const { id } = req.params;

  const livro = await Livro.findByPk(id);

  if (!livro) {
    return res.status(404).json({ error: "Livro não encontrado" });
  }

  await livro.destroy();
    res.json({ ok: true, message: "Livro deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar livro" });
  }
});

router.put('/api/livro/:id', async (req, res) => {
  try {
    const livro = await Livro.findByPk(req.params.id);

    if (!livro) return res.status(404).json({ error: "Livro não encontrado" });

    await livro.update(req.body);
    
    return res.json(livro);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar livro" });
  }
});

//  ROTAS DA API DESKTOP
router.post('/api/cadastro', async (req, res) => {
  try {
    const { nome_user, email, telefone, senha } = req.body;

    // Checagem rápida para ver se os dados estão chegando
    if (!nome_user || !email || !telefone || !senha) {
      return res.status(400).json({ error: 'Faltam campos obrigatórios' });
    }

    const userExists = await Usuario.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existente' })
    }

    const hash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
      nome_user,
      email,
      telefone,
      senha: hash
    });

    res.json({ ok: true, usuario });
  } catch (e) {
    console.error("erro no cadastro: ", e);
    res.status(500).json({ error: 'Erro ao cadastrar' });
  }
});

router.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) return res.status(401).json({ error: 'Email não encontrado' });

    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return res.status(401).json({ error: 'Senha inválida' });

    res.cookie("id_usuario", usuario.id_usuario, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.json({ ok: true, usuario });
  } catch (e) {
    res.status(500).json({ error: 'Erro no login' });
  }
});

const checkAuth = async (req, res, next) => {
  try {
    const id = req.cookies.id_usuario;
    if (!id) return res.status(401).json({ error: "Não autenticado" });

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(401).json({ error: "Não autenticado" });

    req.usuario = usuario;
    next();
  } catch {
    res.status(500).json({ error: "Erro ao verificar auth" });
  }
};

router.get("/api/check-auth", checkAuth, (req, res) => {
  res.json({ authenticated: true, usuario: req.usuario });
});


export default router;