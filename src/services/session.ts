import { ref } from 'vue';

export type TipoUsuario = 'pessoa' | 'ong';

export interface Sessao {
  tipo: TipoUsuario;
  id: number;
  nome: string;
  nomeusuario: string;
}

const CHAVE_STORAGE = 'petmatch_sessao';

function carregarDoStorage(): Sessao | null {
  const bruto = localStorage.getItem(CHAVE_STORAGE);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as Sessao;
  } catch {
    return null;
  }
}

const sessaoAtual = ref<Sessao | null>(carregarDoStorage());

export function usarSessao() {
  return sessaoAtual;
}

export function iniciarSessao(sessao: Sessao): void {
  sessaoAtual.value = sessao;
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(sessao));
}

export function atualizarNomeSessao(nome: string): void {
  if (!sessaoAtual.value) return;
  iniciarSessao({ ...sessaoAtual.value, nome });
}

export function encerrarSessao(): void {
  sessaoAtual.value = null;
  localStorage.removeItem(CHAVE_STORAGE);
}
