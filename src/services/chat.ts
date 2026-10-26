import { getDb, persistirBanco } from './database';
import type { TipoUsuario } from './session';

export interface Mensagem {
  id: number;
  pet_id: number;
  remetente_tipo: TipoUsuario;
  remetente_id: number;
  destinatario_tipo: TipoUsuario;
  destinatario_id: number;
  texto: string;
  lida: number;
  criado_em: string;
}

export interface Participante {
  tipo: TipoUsuario;
  id: number;
}

export interface Conversa {
  pet_id: number;
  pet_nome: string;
  pet_foto_url: string | null;
  pet_adotado: number;
  outro_tipo: TipoUsuario;
  outro_id: number;
  outro_nome: string;
  ultima_mensagem: string;
  ultima_em: string;
  naoLidas: number;
}

async function nomeDoUsuario(tipo: TipoUsuario, id: number): Promise<string> {
  const db = await getDb();
  if (tipo === 'pessoa') {
    const resultado = await db.query('SELECT nome FROM pessoa WHERE id = ?', [id]);
    return (resultado.values?.[0]?.nome as string) ?? 'Usuário';
  }
  const resultado = await db.query('SELECT nome_ong FROM ong WHERE id = ?', [id]);
  return (resultado.values?.[0]?.nome_ong as string) ?? 'ONG';
}

export async function enviarMensagem(
  petId: number,
  remetente: Participante,
  destinatario: Participante,
  texto: string
): Promise<void> {
  const conteudo = texto.trim();
  if (!conteudo) return;

  const db = await getDb();
  await db.run(
    `INSERT INTO mensagem (pet_id, remetente_tipo, remetente_id, destinatario_tipo, destinatario_id, texto)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [petId, remetente.tipo, remetente.id, destinatario.tipo, destinatario.id, conteudo]
  );
  await persistirBanco();
}

export async function listarMensagens(
  petId: number,
  usuarioA: Participante,
  usuarioB: Participante
): Promise<Mensagem[]> {
  const db = await getDb();
  const resultado = await db.query(
    `SELECT * FROM mensagem
     WHERE pet_id = ?
       AND (
         (remetente_tipo = ? AND remetente_id = ? AND destinatario_tipo = ? AND destinatario_id = ?)
         OR (remetente_tipo = ? AND remetente_id = ? AND destinatario_tipo = ? AND destinatario_id = ?)
       )
     ORDER BY id ASC`,
    [
      petId,
      usuarioA.tipo, usuarioA.id, usuarioB.tipo, usuarioB.id,
      usuarioB.tipo, usuarioB.id, usuarioA.tipo, usuarioA.id,
    ]
  );
  return (resultado.values ?? []) as Mensagem[];
}

export async function marcarConversaComoLida(
  petId: number,
  usuario: Participante,
  outro: Participante
): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE mensagem SET lida = 1
     WHERE pet_id = ? AND destinatario_tipo = ? AND destinatario_id = ?
       AND remetente_tipo = ? AND remetente_id = ? AND lida = 0`,
    [petId, usuario.tipo, usuario.id, outro.tipo, outro.id]
  );
  await persistirBanco();
}

export async function listarConversas(usuario: Participante): Promise<Conversa[]> {
  const db = await getDb();
  const resultado = await db.query(
    `SELECT
       m.pet_id AS pet_id,
       pet.nome AS pet_nome,
       pet.foto_url AS pet_foto_url,
       pet.adotado AS pet_adotado,
       CASE WHEN m.remetente_tipo = ? AND m.remetente_id = ? THEN m.destinatario_tipo ELSE m.remetente_tipo END AS outro_tipo,
       CASE WHEN m.remetente_tipo = ? AND m.remetente_id = ? THEN m.destinatario_id ELSE m.remetente_id END AS outro_id,
       m.texto AS ultima_mensagem,
       m.criado_em AS ultima_em
     FROM mensagem m
     INNER JOIN pet ON pet.id = m.pet_id
     WHERE (m.remetente_tipo = ? AND m.remetente_id = ?) OR (m.destinatario_tipo = ? AND m.destinatario_id = ?)
     ORDER BY m.id DESC`,
    [
      usuario.tipo, usuario.id,
      usuario.tipo, usuario.id,
      usuario.tipo, usuario.id,
      usuario.tipo, usuario.id,
    ]
  );

  const linhas = (resultado.values ?? []) as Array<{
    pet_id: number;
    pet_nome: string;
    pet_foto_url: string | null;
    pet_adotado: number;
    outro_tipo: TipoUsuario;
    outro_id: number;
    ultima_mensagem: string;
    ultima_em: string;
  }>;

  const vistos = new Set<string>();
  const conversas: Conversa[] = [];

  for (const linha of linhas) {
    const chave = `${linha.pet_id}:${linha.outro_tipo}:${linha.outro_id}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);

    const outro: Participante = { tipo: linha.outro_tipo, id: linha.outro_id };
    const naoLidasRes = await db.query(
      `SELECT COUNT(*) as total FROM mensagem
       WHERE pet_id = ? AND destinatario_tipo = ? AND destinatario_id = ?
         AND remetente_tipo = ? AND remetente_id = ? AND lida = 0`,
      [linha.pet_id, usuario.tipo, usuario.id, outro.tipo, outro.id]
    );
    const naoLidas = (naoLidasRes.values?.[0]?.total as number) ?? 0;
    const outroNome = await nomeDoUsuario(outro.tipo, outro.id);

    conversas.push({
      pet_id: linha.pet_id,
      pet_nome: linha.pet_nome,
      pet_foto_url: linha.pet_foto_url,
      pet_adotado: linha.pet_adotado,
      outro_tipo: outro.tipo,
      outro_id: outro.id,
      outro_nome: outroNome,
      ultima_mensagem: linha.ultima_mensagem,
      ultima_em: linha.ultima_em,
      naoLidas,
    });
  }

  return conversas;
}

export async function contarNaoLidasTotal(usuario: Participante): Promise<number> {
  const db = await getDb();
  const resultado = await db.query(
    'SELECT COUNT(*) as total FROM mensagem WHERE destinatario_tipo = ? AND destinatario_id = ? AND lida = 0',
    [usuario.tipo, usuario.id]
  );
  return (resultado.values?.[0]?.total as number) ?? 0;
}
