import { getDb, persistirBanco } from './database';
import type { TipoUsuario } from './session';

export interface Pet {
  id: number;
  dono_tipo: TipoUsuario;
  dono_id: number;
  nome: string;
  especie: string;
  raca: string | null;
  idade_meses: number | null;
  porte: string | null;
  sexo: string | null;
  castrado: number;
  vacinado: number;
  cep: string | null;
  situacao: string | null;
  contato: string | null;
  descricao: string | null;
  foto_url: string | null;
  adotado: number;
  criado_em?: string;
}

export interface DadosPet {
  nome: string;
  especie: string;
  raca: string;
  idade_meses: number | null;
  porte: string;
  sexo: string;
  castrado: boolean;
  vacinado: boolean;
  cep: string;
  situacao: string;
  contato: string;
  descricao: string;
  foto_url: string;
}

export interface FiltrosPet {
  especie?: string;
  apenasDisponiveis?: boolean;
  busca?: string;
}

interface Dono {
  tipo: TipoUsuario;
  id: number;
}

const COLUNAS_PET = 'id, dono_tipo, dono_id, nome, especie, raca, idade_meses, porte, sexo, castrado, vacinado, cep, situacao, contato, descricao, foto_url, adotado, criado_em';

function valoresPet(dados: DadosPet) {
  return [
    dados.nome,
    dados.especie,
    dados.raca || null,
    dados.idade_meses,
    dados.porte || null,
    dados.sexo || null,
    dados.castrado ? 1 : 0,
    dados.vacinado ? 1 : 0,
    dados.cep || null,
    dados.situacao || null,
    dados.contato || null,
    dados.descricao || null,
    dados.foto_url || null,
  ];
}

export async function cadastrarPet(dono: Dono, dados: DadosPet): Promise<number> {
  const db = await getDb();
  const resultado = await db.run(
    `INSERT INTO pet (dono_tipo, dono_id, nome, especie, raca, idade_meses, porte, sexo, castrado, vacinado, cep, situacao, contato, descricao, foto_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [dono.tipo, dono.id, ...valoresPet(dados)]
  );
  await persistirBanco();
  return resultado.changes?.lastId ?? 0;
}

export async function atualizarPet(id: number, dados: DadosPet): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE pet SET nome = ?, especie = ?, raca = ?, idade_meses = ?, porte = ?, sexo = ?, castrado = ?, vacinado = ?, cep = ?, situacao = ?, contato = ?, descricao = ?, foto_url = ?
     WHERE id = ?`,
    [...valoresPet(dados), id]
  );
  await persistirBanco();
}

export async function listarPets(filtros: FiltrosPet = {}): Promise<Pet[]> {
  const condicoes: string[] = [];
  const parametros: (string | number)[] = [];

  if (filtros.apenasDisponiveis) {
    condicoes.push('adotado = 0');
  }
  if (filtros.especie) {
    condicoes.push('especie = ?');
    parametros.push(filtros.especie);
  }
  const termo = filtros.busca?.trim();
  if (termo) {
    condicoes.push("(nome LIKE ? OR IFNULL(raca, '') LIKE ?)");
    parametros.push(`%${termo}%`, `%${termo}%`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  const db = await getDb();
  const resultado = await db.query(`SELECT ${COLUNAS_PET} FROM pet ${where} ORDER BY id DESC`, parametros);
  return (resultado.values ?? []) as Pet[];
}

export async function obterPetPorId(id: number): Promise<Pet | null> {
  const db = await getDb();
  const resultado = await db.query(`SELECT ${COLUNAS_PET} FROM pet WHERE id = ?`, [id]);
  return (resultado.values?.[0] as Pet) ?? null;
}

export async function listarPetsPorDono(donoTipo: TipoUsuario, donoId: number): Promise<Pet[]> {
  const db = await getDb();
  const resultado = await db.query(
    `SELECT ${COLUNAS_PET} FROM pet WHERE dono_tipo = ? AND dono_id = ? ORDER BY id DESC`,
    [donoTipo, donoId]
  );
  return (resultado.values ?? []) as Pet[];
}

export async function definirAdotado(id: number, adotado: boolean): Promise<void> {
  const db = await getDb();
  await db.run('UPDATE pet SET adotado = ? WHERE id = ?', [adotado ? 1 : 0, id]);
  await persistirBanco();
}

export async function deletarPet(id: number): Promise<void> {
  const db = await getDb();
  await db.run('DELETE FROM favorito WHERE pet_id = ?', [id]);
  await db.run('DELETE FROM pet WHERE id = ?', [id]);
  await persistirBanco();
}

export async function favoritarPet(usuario: Dono, petId: number): Promise<void> {
  const db = await getDb();
  await db.run(
    'INSERT OR IGNORE INTO favorito (usuario_tipo, usuario_id, pet_id) VALUES (?, ?, ?)',
    [usuario.tipo, usuario.id, petId]
  );
  await persistirBanco();
}

export async function desfavoritarPet(usuario: Dono, petId: number): Promise<void> {
  const db = await getDb();
  await db.run(
    'DELETE FROM favorito WHERE usuario_tipo = ? AND usuario_id = ? AND pet_id = ?',
    [usuario.tipo, usuario.id, petId]
  );
  await persistirBanco();
}

export async function listarIdsFavoritos(usuario: Dono): Promise<Set<number>> {
  const db = await getDb();
  const resultado = await db.query(
    'SELECT pet_id FROM favorito WHERE usuario_tipo = ? AND usuario_id = ?',
    [usuario.tipo, usuario.id]
  );
  const linhas = (resultado.values ?? []) as { pet_id: number }[];
  return new Set(linhas.map((linha) => linha.pet_id));
}

export async function listarFavoritos(usuario: Dono): Promise<Pet[]> {
  const db = await getDb();
  const resultado = await db.query(
    `SELECT ${COLUNAS_PET.split(', ').map((c) => `pet.${c}`).join(', ')} FROM pet
     INNER JOIN favorito ON favorito.pet_id = pet.id
     WHERE favorito.usuario_tipo = ? AND favorito.usuario_id = ?
     ORDER BY favorito.id DESC`,
    [usuario.tipo, usuario.id]
  );
  return (resultado.values ?? []) as Pet[];
}
