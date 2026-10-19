import { getDb, persistirBanco } from './database';

export class AuthError extends Error {}

export interface DadosPessoa {
  nome: string;
  email: string;
  numero: string;
  cpf: string;
  cep: string;
  nomeusuario: string;
  senha: string;
}

export interface DadosOng {
  nomeOng: string;
  nomeResponsavel: string;
  email: string;
  numero: string;
  cnpj: string;
  cep: string;
  nomeusuario: string;
  senha: string;
}

export interface PessoaLogada {
  id: number;
  nome: string;
  email: string;
  numero: string;
  cpf: string;
  cep: string;
  nomeusuario: string;
  foto_url: string | null;
  criado_em?: string;
}

export interface OngLogada {
  id: number;
  nome_ong: string;
  nome_responsavel: string;
  email: string;
  numero: string;
  cnpj: string;
  cep: string;
  nomeusuario: string;
  foto_url: string | null;
  criado_em?: string;
}

function bytesParaHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function gerarSalt(): string {
  return bytesParaHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashComSalt(senha: string, salt: string): Promise<string> {
  const dados = new TextEncoder().encode(`${salt}:${senha}`);
  const digest = await crypto.subtle.digest('SHA-256', dados);
  return bytesParaHex(new Uint8Array(digest));
}

async function criarSenhaHash(senha: string): Promise<string> {
  const salt = gerarSalt();
  const hash = await hashComSalt(senha, salt);
  return `${salt}:${hash}`;
}

async function senhaConfere(senha: string, senhaHashArmazenada: string): Promise<boolean> {
  const [salt, hash] = senhaHashArmazenada.split(':');
  if (!salt || !hash) return false;
  const hashCalculado = await hashComSalt(senha, salt);
  return hashCalculado === hash;
}

export async function cadastrarPessoa(dados: DadosPessoa): Promise<void> {
  if (!dados.nome || !dados.email || !dados.nomeusuario || !dados.senha) {
    throw new AuthError('Preencha todos os campos obrigatórios.');
  }

  const db = await getDb();
  const existente = await db.query(
    'SELECT id FROM pessoa WHERE email = ? OR nomeusuario = ? OR cpf = ?',
    [dados.email, dados.nomeusuario, dados.cpf]
  );
  if (existente.values && existente.values.length > 0) {
    throw new AuthError('Já existe um cadastro com este email, usuário ou CPF.');
  }

  const senhaHash = await criarSenhaHash(dados.senha);
  await db.run(
    `INSERT INTO pessoa (nome, email, numero, cpf, cep, nomeusuario, senha_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [dados.nome, dados.email, dados.numero, dados.cpf, dados.cep, dados.nomeusuario, senhaHash]
  );
  await persistirBanco();
}

export async function cadastrarOng(dados: DadosOng): Promise<void> {
  if (!dados.nomeOng || !dados.email || !dados.nomeusuario || !dados.senha) {
    throw new AuthError('Preencha todos os campos obrigatórios.');
  }

  const db = await getDb();
  const existente = await db.query(
    'SELECT id FROM ong WHERE email = ? OR nomeusuario = ? OR cnpj = ?',
    [dados.email, dados.nomeusuario, dados.cnpj]
  );
  if (existente.values && existente.values.length > 0) {
    throw new AuthError('Já existe um cadastro com este email, usuário ou CNPJ.');
  }

  const senhaHash = await criarSenhaHash(dados.senha);
  await db.run(
    `INSERT INTO ong (nome_ong, nome_responsavel, email, numero, cnpj, cep, nomeusuario, senha_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dados.nomeOng,
      dados.nomeResponsavel,
      dados.email,
      dados.numero,
      dados.cnpj,
      dados.cep,
      dados.nomeusuario,
      senhaHash,
    ]
  );
  await persistirBanco();
}

export async function loginPessoa(identificador: string, senha: string): Promise<PessoaLogada> {
  const db = await getDb();
  const resultado = await db.query(
    'SELECT * FROM pessoa WHERE email = ? OR nomeusuario = ?',
    [identificador, identificador]
  );
  const usuario = resultado.values?.[0];
  if (!usuario || !(await senhaConfere(senha, usuario.senha_hash))) {
    throw new AuthError('Usuário ou senha inválidos.');
  }

  const { senha_hash, ...dadosPublicos } = usuario;
  return dadosPublicos as PessoaLogada;
}

export async function loginOng(identificador: string, senha: string): Promise<OngLogada> {
  const db = await getDb();
  const resultado = await db.query(
    'SELECT * FROM ong WHERE email = ? OR nomeusuario = ? OR cnpj = ?',
    [identificador, identificador, identificador]
  );
  const usuario = resultado.values?.[0];
  if (!usuario || !(await senhaConfere(senha, usuario.senha_hash))) {
    throw new AuthError('Usuário ou senha inválidos.');
  }

  const { senha_hash, ...dadosPublicos } = usuario;
  return dadosPublicos as OngLogada;
}

export async function obterPessoaPorId(id: number): Promise<PessoaLogada | null> {
  const db = await getDb();
  const resultado = await db.query(
    'SELECT id, nome, email, numero, cpf, cep, nomeusuario, foto_url, criado_em FROM pessoa WHERE id = ?',
    [id]
  );
  return (resultado.values?.[0] as PessoaLogada) ?? null;
}

export async function obterOngPorId(id: number): Promise<OngLogada | null> {
  const db = await getDb();
  const resultado = await db.query(
    'SELECT id, nome_ong, nome_responsavel, email, numero, cnpj, cep, nomeusuario, foto_url, criado_em FROM ong WHERE id = ?',
    [id]
  );
  return (resultado.values?.[0] as OngLogada) ?? null;
}

export interface DadosPerfilPessoa {
  nome: string;
  numero: string;
  cep: string;
  foto_url: string;
}

export interface DadosPerfilOng {
  nome_ong: string;
  nome_responsavel: string;
  numero: string;
  cep: string;
  foto_url: string;
}

export async function atualizarPerfilPessoa(id: number, dados: DadosPerfilPessoa): Promise<void> {
  if (!dados.nome.trim()) {
    throw new AuthError('O nome não pode ficar vazio.');
  }
  const db = await getDb();
  await db.run(
    'UPDATE pessoa SET nome = ?, numero = ?, cep = ?, foto_url = ? WHERE id = ?',
    [dados.nome.trim(), dados.numero || null, dados.cep || null, dados.foto_url || null, id]
  );
  await persistirBanco();
}

export async function atualizarPerfilOng(id: number, dados: DadosPerfilOng): Promise<void> {
  if (!dados.nome_ong.trim()) {
    throw new AuthError('O nome da organização não pode ficar vazio.');
  }
  const db = await getDb();
  await db.run(
    'UPDATE ong SET nome_ong = ?, nome_responsavel = ?, numero = ?, cep = ?, foto_url = ? WHERE id = ?',
    [dados.nome_ong.trim(), dados.nome_responsavel.trim(), dados.numero || null, dados.cep || null, dados.foto_url || null, id]
  );
  await persistirBanco();
}
