import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "sqlite",
  storage: "data.db"
});

// ============ TABELA LIVRO ============
const Livro = sequelize.define("LIVRO", {
  id_livro: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  autor: { type: DataTypes.STRING(100) },
  genero: { type: DataTypes.STRING(40) },
  estado_conservacao: { type: DataTypes.STRING(255) },
  edicao: { type: DataTypes.STRING(30) },
  nacionalidade: { type: DataTypes.STRING(20) },
  preco: { type: DataTypes.DECIMAL(10, 2) },
  metodo_aquisicao: { type: DataTypes.STRING(30) },
  reservado: { type: DataTypes.BOOLEAN, defaultValue: false },
  foto_url: { type: DataTypes.STRING(255) },
  ISBN: { type: DataTypes.CHAR(13) },
  quantidade: { type: DataTypes.SMALLINT, defaultValue: 1 },
});

// ============ TABELA USUARIO ============
const Usuario = sequelize.define("USUARIO", {
  id_usuario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome_user: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255) },
  telefone: { type: DataTypes.CHAR(11) },
  permissao: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: "C" }, // C = comum, A = admin
});

// ============ TABELA ENDERECO ============
const Endereco = sequelize.define("ENDERECO", {
  id_endereco: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  rua: { type: DataTypes.STRING(100) },
  numero_casa: { type: DataTypes.INTEGER },
  complemento: { type: DataTypes.STRING(20) },
  bairro: { type: DataTypes.STRING(40) },
  cidade: { type: DataTypes.STRING(100) },
  estado: { type: DataTypes.CHAR(2) },
  cep: { type: DataTypes.CHAR(8) },
});

// ============ USUARIO_ENDERECO ============
const UsuarioEndereco = sequelize.define("USUARIO_ENDERECO", {}, { timestamps: false });

// Relacionamento N:N
Usuario.belongsToMany(Endereco, {
  through: UsuarioEndereco,
  foreignKey: "FK_USUARIO_id_usuario",
});
Endereco.belongsToMany(Usuario, {
  through: UsuarioEndereco,
  foreignKey: "FK_ENDERECO_id_endereco",
});

// ============ CATALOGA ============
const Cataloga = sequelize.define("CATALOGA", {
  id_catalogo: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  data_cadastro: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
});

// Relacionamento com usuário e livro
Usuario.hasMany(Cataloga, { foreignKey: "FK_USUARIO_id_usuario" });
Livro.hasMany(Cataloga, { foreignKey: "FK_LIVRO_id_livro" });
Cataloga.belongsTo(Usuario, { foreignKey: "FK_USUARIO_id_usuario" });
Cataloga.belongsTo(Livro, { foreignKey: "FK_LIVRO_id_livro" });

// ============ PEDIDO ============
const Pedido = sequelize.define("PEDIDO", {
  id_pedido: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  data_pedido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  valor_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
});

// Um usuário faz vários pedidos
Usuario.hasMany(Pedido, { foreignKey: "FK_USUARIO_id_usuario" });
Pedido.belongsTo(Usuario, { foreignKey: "FK_USUARIO_id_usuario" });

// ============ PEDIDO_LIVRO ============
const PedidoLivro = sequelize.define("PEDIDO_LIVRO", {
  id_pedido_livro: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantidade: { type: DataTypes.SMALLINT, allowNull: false },
  preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

// Relacionamentos N:N (pedido <-> livro)
Pedido.belongsToMany(Livro, {
  through: PedidoLivro,
  foreignKey: "FK_PEDIDO_id_pedido",
});
Livro.belongsToMany(Pedido, {
  through: PedidoLivro,
  foreignKey: "FK_LIVRO_id_livro",
});

export { Livro, Usuario, Endereco, UsuarioEndereco, Cataloga, Pedido, PedidoLivro };
