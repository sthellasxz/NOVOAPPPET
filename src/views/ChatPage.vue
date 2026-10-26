<template>
  <IonPage>
    <ion-header class="cabecalho">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/conversas" text="" class="botao-voltar"></ion-back-button>
        </ion-buttons>
        <div class="titulo-barra" v-if="pet">
          <img v-if="pet.foto_url" class="pet-mini-foto" :src="pet.foto_url" :alt="pet.nome" />
          <div v-else class="pet-mini-avatar">🐾</div>
          <div class="titulo-textos">
            <strong>{{ outroNome }}</strong>
            <span>sobre {{ pet.nome }}</span>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <IonContent ref="conteudoRef" class="fundo-chat">
      <div class="lista-mensagens">
        <div v-if="carregando" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
        </div>

        <div v-else-if="mensagens.length === 0" class="vazio">
          <ion-icon :icon="chatbubbleOutline"></ion-icon>
          <p>Envie uma mensagem para {{ outroNome }} sobre {{ pet?.nome }}.</p>
        </div>

        <div
          v-for="mensagem in mensagens"
          :key="mensagem.id"
          class="bolha-linha"
          :class="{ 'bolha-linha-minha': ehMinha(mensagem) }"
        >
          <div class="bolha" :class="{ 'bolha-minha': ehMinha(mensagem) }">
            <p>{{ mensagem.texto }}</p>
            <span class="bolha-hora">{{ formatarHora(mensagem.criado_em) }}</span>
          </div>
        </div>
      </div>
    </IonContent>

    <ion-footer class="rodape-chat">
      <form class="barra-envio" @submit.prevent="enviar">
        <input
          v-model="texto"
          type="text"
          placeholder="Escreva uma mensagem..."
          autocomplete="off"
          :disabled="enviando"
        />
        <button type="submit" class="botao-enviar" :disabled="!texto.trim() || enviando">
          <ion-icon :icon="sendOutline"></ion-icon>
        </button>
      </form>
    </ion-footer>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import { chatbubbleOutline, sendOutline } from 'ionicons/icons';
import { obterPetPorId, type Pet } from '@/services/pet';
import { obterPessoaPorId, obterOngPorId } from '@/services/auth';
import {
  listarMensagens,
  enviarMensagem,
  marcarConversaComoLida,
  type Mensagem,
  type Participante,
} from '@/services/chat';
import { usarSessao, type TipoUsuario } from '@/services/session';

const route = useRoute();
const router = useRouter();
const sessao = usarSessao();

const petId = Number(route.params.petId);
const outro = ref<Participante>({
  tipo: route.params.tipo as TipoUsuario,
  id: Number(route.params.id),
});

const pet = ref<Pet | null>(null);
const outroNome = ref('');
const mensagens = ref<Mensagem[]>([]);
const texto = ref('');
const carregando = ref(true);
const enviando = ref(false);
const conteudoRef = ref<{ $el: { scrollToBottom?: (duration?: number) => Promise<void> } } | null>(null);

const eu = computed<Participante | null>(() =>
  sessao.value ? { tipo: sessao.value.tipo, id: sessao.value.id } : null
);

function ehMinha(mensagem: Mensagem) {
  return !!eu.value && mensagem.remetente_tipo === eu.value.tipo && mensagem.remetente_id === eu.value.id;
}

function formatarHora(data: string) {
  return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

async function rolarParaFim() {
  await nextTick();
  await conteudoRef.value?.$el?.scrollToBottom?.(200);
}

async function carregar() {
  if (!eu.value) {
    router.replace('/login');
    return;
  }

  carregando.value = true;
  const petEncontrado = await obterPetPorId(petId);
  const nomeOutro = outro.value.tipo === 'pessoa'
    ? await obterPessoaPorId(outro.value.id)
    : await obterOngPorId(outro.value.id);

  if (!petEncontrado) {
    router.replace('/conversas');
    return;
  }

  pet.value = petEncontrado;
  outroNome.value = nomeOutro
    ? ('nome' in nomeOutro ? nomeOutro.nome : nomeOutro.nome_ong)
    : 'Usuário';

  mensagens.value = await listarMensagens(petId, eu.value, outro.value);
  await marcarConversaComoLida(petId, eu.value, outro.value);
  carregando.value = false;
  rolarParaFim();
}

async function enviar() {
  if (!eu.value || !texto.value.trim() || enviando.value) return;
  enviando.value = true;
  const conteudo = texto.value;
  texto.value = '';
  try {
    await enviarMensagem(petId, eu.value, outro.value, conteudo);
    mensagens.value = await listarMensagens(petId, eu.value, outro.value);
    rolarParaFim();
  } finally {
    enviando.value = false;
  }
}

onIonViewWillEnter(carregar);
</script>

<style scoped>
.cabecalho ion-toolbar {
  --background: var(--petmatch-white);
  --border-width: 0;
}

.botao-voltar {
  --color: var(--petmatch-slate);
}

.titulo-barra {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 12px;
}

.pet-mini-foto {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  object-fit: cover;
}

.pet-mini-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.titulo-textos {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.titulo-textos strong {
  font-size: 0.92rem;
  color: var(--petmatch-slate-shade);
}

.titulo-textos span {
  font-size: 0.75rem;
  color: var(--petmatch-slate-shade);
  opacity: 0.7;
}

.fundo-chat {
  --background: #f4f6f7;
}

.lista-mensagens {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  min-height: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.vazio {
  margin: auto;
  text-align: center;
  color: var(--petmatch-slate-shade);
  opacity: 0.7;
  padding: 32px;
}

.vazio ion-icon {
  font-size: 34px;
  margin-bottom: 8px;
}

.bolha-linha {
  display: flex;
  justify-content: flex-start;
}

.bolha-linha-minha {
  justify-content: flex-end;
}

.bolha {
  max-width: 75%;
  background: var(--petmatch-white);
  border: 1.5px solid #e3e8ea;
  border-radius: 16px 16px 16px 4px;
  padding: 10px 14px;
}

.bolha-minha {
  background: var(--petmatch-slate);
  border-color: var(--petmatch-slate);
  border-radius: 16px 16px 4px 16px;
}

.bolha p {
  margin: 0;
  font-size: 0.92rem;
  color: var(--petmatch-black);
  white-space: pre-line;
  word-break: break-word;
}

.bolha-minha p {
  color: var(--petmatch-white);
}

.bolha-hora {
  display: block;
  margin-top: 4px;
  font-size: 0.68rem;
  color: var(--petmatch-slate-shade);
  opacity: 0.6;
  text-align: right;
}

.bolha-minha .bolha-hora {
  color: var(--petmatch-white);
  opacity: 0.75;
}

.rodape-chat {
  background: var(--petmatch-white);
}

.barra-envio {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
}

.barra-envio input {
  flex: 1;
  border: 1.5px solid #e3e8ea;
  border-radius: 999px;
  padding: 11px 16px;
  font-size: 0.92rem;
  font-family: inherit;
  outline: none;
  color: var(--petmatch-black);
  min-width: 0;
}

.barra-envio input:focus {
  border-color: var(--petmatch-slate);
}

.botao-enviar {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: var(--petmatch-slate);
  color: var(--petmatch-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.botao-enviar:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.botao-enviar ion-icon {
  font-size: 18px;
}
</style>
