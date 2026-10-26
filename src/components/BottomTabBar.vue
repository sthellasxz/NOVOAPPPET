<template>
  <div class="tab-wrapper">
    <div class="bottom-tab-bar">
      <button
        v-for="item in itens"
        :key="item.rota"
        type="button"
        class="tab-item"
        :class="{ ativo: ehRotaAtual(item.rota) }"
        @click="item.acao"
      >
        <span class="tab-icon-holder">
          <ion-icon :icon="item.icone"></ion-icon>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { homeOutline, addCircleOutline, shieldCheckmarkOutline, heartOutline, chatbubbleOutline } from 'ionicons/icons';
import { usarSessao } from '@/services/session';

const route = useRoute();
const router = useRouter();
const sessao = usarSessao();

function ehRotaAtual(caminho: string) {
  return route.path.startsWith(caminho);
}

function irParaPerfil() {
  if (sessao.value) {
    router.push(`/perfil/${sessao.value.tipo}/${sessao.value.id}`);
  }
}

const itens = [
  { rota: '/home', label: 'Home', icone: homeOutline, acao: () => router.push('/home') },
  { rota: '/cadastro-pet', label: 'Cadastrar Pet', icone: addCircleOutline, acao: () => router.push('/cadastro-pet') },
  { rota: '/conversas', label: 'Mensagens', icone: chatbubbleOutline, acao: () => router.push('/conversas') },
  { rota: '/perfil', label: 'Perfil', icone: shieldCheckmarkOutline, acao: irParaPerfil },
  { rota: '/favoritos', label: 'Favoritos', icone: heartOutline, acao: () => router.push('/favoritos') },
];
</script>

<style scoped>
.tab-wrapper {
  display: flex;
  justify-content: center;
  padding: 0 16px calc(10px + env(safe-area-inset-bottom));
  background: transparent;
}

.bottom-tab-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--petmatch-slate);
  border-radius: 999px;
  padding: 8px 14px;
  box-shadow: 0 8px 20px rgba(70, 96, 107, 0.35);
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--petmatch-white);
  opacity: 0.6;
  padding: 8px;
  cursor: pointer;
}

.tab-icon-holder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.tab-item ion-icon {
  font-size: 22px;
}

.tab-item.ativo {
  opacity: 1;
}

.tab-item.ativo .tab-icon-holder {
  background: var(--petmatch-mint);
  color: var(--petmatch-slate-shade);
}
</style>
