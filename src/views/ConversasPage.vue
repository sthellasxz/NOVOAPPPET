<template>
  <IonPage>
    <ion-header class="cabecalho">
      <ion-toolbar>
        <div class="logo" slot="start">
          <ion-icon :icon="pawOutline"></ion-icon>
          PetMatch
        </div>
        <LogoutButton slot="end" />
      </ion-toolbar>
    </ion-header>

    <IonContent class="fundo-conversas">
      <h2 class="titulo-pagina">Mensagens</h2>

      <div v-if="carregando" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div class="lista-conversas" v-else-if="conversas.length > 0">
        <button
          type="button"
          class="item-conversa"
          v-for="conversa in conversas"
          :key="`${conversa.pet_id}-${conversa.outro_tipo}-${conversa.outro_id}`"
          @click="abrirConversa(conversa)"
        >
          <img v-if="conversa.pet_foto_url" class="foto-pet" :src="conversa.pet_foto_url" :alt="conversa.pet_nome" />
          <div v-else class="foto-pet foto-pet-vazia">🐾</div>

          <div class="info-conversa">
            <div class="linha-topo">
              <strong>{{ conversa.outro_nome }}</strong>
              <span class="hora">{{ formatarHora(conversa.ultima_em) }}</span>
            </div>
            <p class="pet-nome">Sobre {{ conversa.pet_nome }}</p>
            <p class="ultima-mensagem">{{ conversa.ultima_mensagem }}</p>
          </div>

          <span v-if="conversa.naoLidas > 0" class="badge-nao-lida">{{ conversa.naoLidas }}</span>
        </button>
      </div>

      <div class="vazio" v-else>
        <ion-icon :icon="chatbubbleOutline"></ion-icon>
        <p>Suas conversas sobre os pets aparecem aqui.</p>
      </div>
    </IonContent>

    <ion-footer>
      <BottomTabBar />
    </ion-footer>
  </IonPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonFooter,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import { pawOutline, chatbubbleOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import BottomTabBar from '@/components/BottomTabBar.vue';
import LogoutButton from '@/components/LogoutButton.vue';
import { listarConversas, type Conversa } from '@/services/chat';
import { usarSessao } from '@/services/session';

const router = useRouter();
const sessao = usarSessao();
const conversas = ref<Conversa[]>([]);
const carregando = ref(true);

async function carregar() {
  if (!sessao.value) {
    router.replace('/login');
    return;
  }
  carregando.value = true;
  conversas.value = await listarConversas({ tipo: sessao.value.tipo, id: sessao.value.id });
  carregando.value = false;
}

function abrirConversa(conversa: Conversa) {
  router.push(`/conversa/${conversa.pet_id}/${conversa.outro_tipo}/${conversa.outro_id}`);
}

function formatarHora(data: string) {
  const agora = new Date();
  const dataMensagem = new Date(data);
  const mesmoDia = agora.toDateString() === dataMensagem.toDateString();
  return mesmoDia
    ? dataMensagem.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : dataMensagem.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

onIonViewWillEnter(carregar);
</script>

<style scoped>
.cabecalho ion-toolbar {
  --background: var(--petmatch-white);
  --border-width: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--petmatch-slate);
}

.fundo-conversas {
  --background: var(--petmatch-white);
}

.titulo-pagina {
  margin: 12px 16px 4px;
  color: var(--petmatch-slate-shade);
  font-weight: 800;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.lista-conversas {
  display: flex;
  flex-direction: column;
  padding: 8px 16px 100px;
}

.item-conversa {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid #e3e8ea;
  padding: 14px 4px;
  text-align: left;
  cursor: pointer;
  position: relative;
}

.foto-pet {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
}

.foto-pet-vazia {
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.info-conversa {
  flex: 1;
  min-width: 0;
}

.linha-topo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.linha-topo strong {
  color: var(--petmatch-black);
  font-size: 0.95rem;
}

.hora {
  flex-shrink: 0;
  font-size: 0.72rem;
  color: var(--petmatch-slate-shade);
  opacity: 0.65;
}

.pet-nome {
  margin: 2px 0;
  font-size: 0.78rem;
  color: var(--petmatch-slate);
  font-weight: 600;
}

.ultima-mensagem {
  margin: 0;
  font-size: 0.85rem;
  color: var(--petmatch-black);
  opacity: 0.65;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-nao-lida {
  flex-shrink: 0;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--petmatch-green);
  color: var(--petmatch-white);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.vazio {
  text-align: center;
  color: var(--petmatch-slate-shade);
  opacity: 0.7;
  padding: 48px 24px;
}

.vazio ion-icon {
  font-size: 34px;
  margin-bottom: 8px;
}

@media (min-width: 769px) {
  .lista-conversas {
    max-width: 640px;
    margin: 0 auto;
  }
}
</style>
