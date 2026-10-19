import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

const DB_NAME = 'petmatch';

const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS pessoa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    numero TEXT,
    cpf TEXT UNIQUE,
    cep TEXT,
    nomeusuario TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    foto_url TEXT,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_ong TEXT NOT NULL,
    nome_responsavel TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    numero TEXT,
    cnpj TEXT UNIQUE,
    cep TEXT,
    nomeusuario TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    foto_url TEXT,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dono_tipo TEXT NOT NULL CHECK (dono_tipo IN ('pessoa', 'ong')),
    dono_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL,
    raca TEXT,
    idade_meses INTEGER,
    porte TEXT,
    sexo TEXT,
    castrado INTEGER NOT NULL DEFAULT 0,
    vacinado INTEGER NOT NULL DEFAULT 0,
    cep TEXT,
    situacao TEXT,
    contato TEXT,
    descricao TEXT,
    foto_url TEXT,
    adotado INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorito (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_tipo TEXT NOT NULL CHECK (usuario_tipo IN ('pessoa', 'ong')),
    usuario_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_tipo, usuario_id, pet_id)
  );
`;

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;
let readyPromise: Promise<SQLiteDBConnection> | null = null;

function comTimeout<T>(promessa: Promise<T>, etapa: string, ms = 10000): Promise<T> {
  return Promise.race([
    promessa,
    new Promise<T>((_, rejeitar) =>
      setTimeout(() => rejeitar(new Error(`Tempo esgotado ao inicializar o banco de dados (${etapa}).`)), ms)
    ),
  ]);
}

async function colunas(conn: SQLiteDBConnection, tabela: string): Promise<Set<string>> {
  const resultado = await conn.query(`PRAGMA table_info(${tabela})`);
  return new Set((resultado.values ?? []).map((linha: { name: string }) => linha.name));
}

// Bancos criados por versões antigas do app não têm as colunas novas.
async function migrar(conn: SQLiteDBConnection): Promise<void> {
  for (const tabela of ['pessoa', 'ong']) {
    if (!(await colunas(conn, tabela)).has('foto_url')) {
      await conn.execute(`ALTER TABLE ${tabela} ADD COLUMN foto_url TEXT`);
    }
  }

  const colunasPet = await colunas(conn, 'pet');
  if (!colunasPet.has('cep')) {
    await conn.execute('ALTER TABLE pet ADD COLUMN cep TEXT');
    if (colunasPet.has('cidade')) {
      await conn.execute('UPDATE pet SET cep = cidade');
    }
  }
  if (!colunasPet.has('situacao')) {
    await conn.execute('ALTER TABLE pet ADD COLUMN situacao TEXT');
    const antigos = await conn.query("SELECT id, descricao FROM pet WHERE descricao LIKE 'Situação: %'");
    for (const pet of (antigos.values ?? []) as { id: number; descricao: string }[]) {
      const match = pet.descricao.match(/^Situação: (.*?)(?:\n\n|$)/);
      if (!match) continue;
      const descricao = pet.descricao.slice(match[0].length) || null;
      await conn.run('UPDATE pet SET situacao = ?, descricao = ? WHERE id = ?', [match[1], descricao, pet.id]);
    }
  }
}

async function abrirConexao(): Promise<SQLiteDBConnection> {
  if (Capacitor.getPlatform() === 'web') {
    const jeepEl = document.querySelector('jeep-sqlite') as (HTMLElement & { componentOnReady?: () => Promise<unknown> }) | null;
    await comTimeout(customElements.whenDefined('jeep-sqlite'), 'jeep-sqlite: whenDefined');
    if (jeepEl?.componentOnReady) {
      await comTimeout(jeepEl.componentOnReady(), 'jeep-sqlite: componentOnReady');
    }
    await comTimeout(sqlite.initWebStore(), 'initWebStore');
  }

  const isConn = (await comTimeout(sqlite.isConnection(DB_NAME, false), 'isConnection')).result;
  const connection = isConn
    ? await comTimeout(sqlite.retrieveConnection(DB_NAME, false), 'retrieveConnection')
    : await comTimeout(sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false), 'createConnection');

  await comTimeout(connection.open(), 'connection.open');
  await comTimeout(connection.execute(CREATE_TABLES), 'CREATE_TABLES');
  await comTimeout(migrar(connection), 'migrações');

  if (Capacitor.getPlatform() === 'web') {
    await comTimeout(sqlite.saveToStore(DB_NAME), 'saveToStore');
  }

  return connection;
}

export async function initDatabase(): Promise<void> {
  if (!readyPromise) {
    readyPromise = abrirConexao()
      .then((connection) => {
        db = connection;
        return connection;
      })
      .catch((erro) => {
        // Permite tentar novamente numa próxima chamada em vez de ficar travado num erro permanente.
        readyPromise = null;
        throw erro;
      });
  }
  await readyPromise;
}

export async function getDb(): Promise<SQLiteDBConnection> {
  await initDatabase();
  return db as SQLiteDBConnection;
}

export async function persistirBanco(): Promise<void> {
  if (Capacitor.getPlatform() === 'web') {
    await sqlite.saveToStore(DB_NAME);
  }
}
