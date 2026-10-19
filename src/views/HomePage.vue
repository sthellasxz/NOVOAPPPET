<template>
  <ion-page>
    <ion-header class="cabecalho">
      <ion-toolbar>
        <div class="logo" slot="start">
          <ion-icon :icon="pawOutline"></ion-icon>
          PetMatch
        </div>
        <LogoutButton slot="end" />
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="fundo-home">
      <!-- Busca -->
      <ion-searchbar
        class="barra"
        placeholder="Buscar pet..."
        v-model="busca"
        @ionInput="carregarPets"
      ></ion-searchbar>

      <!-- Banner -->
      <button type="button" class="banner-disponiveis" :class="{ ativo: apenasDisponiveis }" @click="alternarApenasDisponiveis">
        {{ apenasDisponiveis ? 'Mostrando disponíveis' : 'Mostrando todos' }}
      </button>

      <!-- Chips de filtro -->
      <div class="chips">
        <button
          type="button"
          class="chip"
          :class="{ ativo: filtroEspecie === 'Gato' }"
          @click="alternarFiltroEspecie('Gato')"
        >
          Apenas gatos
        </button>
        <button
          type="button"
          class="chip"
          :class="{ ativo: filtroEspecie === 'Cachorro' }"
          @click="alternarFiltroEspecie('Cachorro')"
        >
          Apenas cachorros
        </button>
      </div>

      <!-- Lista de cards -->
      <div class="cards-lista" v-if="pets.length > 0">
        <PetCard
          v-for="pet in pets"
          :key="pet.id"
          :pet="pet"
          :favorito="idsFavoritos.has(pet.id)"
          @favoritar="favoritar"
          @detalhes="irParaDetalhes"
        />
      </div>
      <div class="vazio" v-else>
        <p>Nenhum pet encontrado.</p>
      </div>
    </ion-content>

    <ion-footer>
      <BottomTabBar />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonFooter,
  IonSearchbar,
  onIonViewWillEnter,
} from '@ionic/vue';
import { pawOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import PetCard from '@/components/PetCard.vue';
import BottomTabBar from '@/components/BottomTabBar.vue';
import LogoutButton from '@/components/LogoutButton.vue';
import { listarPets, favoritarPet, desfavoritarPet, listarIdsFavoritos, type Pet } from '@/services/pet';
import { usarSessao } from '@/services/session';

const router = useRouter();
const sessao = usarSessao();

const pets = ref<Pet[]>([]);
const idsFavoritos = ref<Set<number>>(new Set());
const busca = ref('');
const apenasDisponiveis = ref(true);
const filtroEspecie = ref<string | null>(null);

function alternarFiltroEspecie(especie: string) {
  filtroEspecie.value = filtroEspecie.value === especie ? null : especie;
  carregarPets();
}

function alternarApenasDisponiveis() {
  apenasDisponiveis.value = !apenasDisponiveis.value;
  carregarPets();
}

async function carregarPets() {
  pets.value = await listarPets({
    especie: filtroEspecie.value ?? undefined,
    apenasDisponiveis: apenasDisponiveis.value,
    busca: busca.value,
  });
  if (sessao.value) {
    idsFavoritos.value = await listarIdsFavoritos({ tipo: sessao.value.tipo, id: sessao.value.id });
  }
}

async function favoritar(petId: number) {
  if (!sessao.value) {
    router.push('/login');
    return;
  }
  const usuario = { tipo: sessao.value.tipo, id: sessao.value.id };
  if (idsFavoritos.value.has(petId)) {
    await desfavoritarPet(usuario, petId);
  } else {
    await favoritarPet(usuario, petId);
  }
  idsFavoritos.value = await listarIdsFavoritos(usuario);
}

function irParaDetalhes(petId: number) {
  router.push(`/detalhes/${petId}`);
}

onMounted(carregarPets);
onIonViewWillEnter(carregarPets);
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
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--petmatch-slate);
}

.logo ion-icon {
  font-size: 1.3rem;
}

.fundo-home {
  --background: var(--petmatch-white);
}

.barra {
  padding: 8px 16px 4px;
  --background: var(--petmatch-mint);
  --border-radius: 999px;
  --placeholder-color: var(--petmatch-slate-shade);
  --icon-color: var(--petmatch-slate-shade);
  --color: var(--petmatch-slate-shade);
  --box-shadow: none;
}

.banner-disponiveis {
  display: block;
  width: calc(100% - 32px);
  margin: 8px 16px 12px;
  background: var(--petmatch-slate);
  color: var(--petmatch-white);
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
}

.banner-disponiveis.ativo {
  background: var(--petmatch-slate-shade);
}

.chips {
  display: flex;
  gap: 10px;
  padding: 0 16px 14px;
  flex-wrap: wrap;
}

.chip {
  background: transparent;
  border: 1.5px solid var(--petmatch-slate);
  color: var(--petmatch-slate);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.chip.ativo {
  background: var(--petmatch-slate);
  color: var(--petmatch-white);
}

.cards-lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 16px 100px;
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
