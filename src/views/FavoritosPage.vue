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

    <IonContent class="fundo-favoritos">
      <h2 class="titulo-pagina">Meus Favoritos</h2>
      <div class="cards-lista" v-if="pets.length > 0">
        <PetCard
          v-for="pet in pets"
          :key="pet.id"
          :pet="pet"
          :favorito="true"
          @favoritar="desfavoritar"
          @detalhes="irParaDetalhes"
        />
      </div>
      <div class="vazio" v-else>
        <p>Você ainda não favoritou nenhum pet.</p>
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
  onIonViewWillEnter,
} from '@ionic/vue';
import { pawOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import PetCard from '@/components/PetCard.vue';
import BottomTabBar from '@/components/BottomTabBar.vue';
import LogoutButton from '@/components/LogoutButton.vue';
import { listarFavoritos, desfavoritarPet, type Pet } from '@/services/pet';
import { usarSessao } from '@/services/session';

const router = useRouter();
const sessao = usarSessao();
const pets = ref<Pet[]>([]);

async function carregar() {
  if (!sessao.value) {
    router.replace('/login');
    return;
  }
  pets.value = await listarFavoritos({ tipo: sessao.value.tipo, id: sessao.value.id });
}

async function desfavoritar(petId: number) {
  if (!sessao.value) return;
  await desfavoritarPet({ tipo: sessao.value.tipo, id: sessao.value.id }, petId);
  await carregar();
}

function irParaDetalhes(petId: number) {
  router.push(`/detalhes/${petId}`);
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

.fundo-favoritos {
  --background: var(--petmatch-white);
}

.titulo-pagina {
  margin: 12px 16px 4px;
  color: var(--petmatch-slate-shade);
  font-weight: 800;
}

.cards-lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 16px 100px;
}

.vazio {
  text-align: center;
  color: var(--petmatch-slate-shade);
  padding: 32px 16px;
}

@media (min-width: 769px) {
  .cards-lista {
    max-width: 640px;
    margin: 0 auto;
  }
}
</style>
