<template>
  <div class="pet-card" @click="$emit('detalhes', pet.id)">
    <img class="pet-foto" :alt="pet.nome" :src="pet.foto_url || fotoPadrao" />

    <div class="pet-info">
      <h3 class="pet-nome">{{ pet.nome }}</h3>
      <p class="pet-sub">{{ pet.especie }}{{ pet.raca ? ` · ${pet.raca}` : '' }}</p>
      <p class="pet-sub">{{ formatarIdade(pet.idade_meses) }}</p>

      <div class="pet-tags">
        <span class="tag" :class="pet.adotado ? 'tag-vermelha' : 'tag-verde'">
          {{ pet.adotado ? 'Adotado' : 'Disponível' }}
        </span>
        <span class="tag">{{ pet.castrado ? 'Castrado' : 'Não castrado' }}</span>
      </div>
    </div>

    <button type="button" class="coracao" @click.stop="$emit('favoritar', pet.id)">
      <ion-icon :icon="favorito ? heart : heartOutline" :class="{ favoritado: favorito }"></ion-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { heartOutline, heart } from 'ionicons/icons';
import type { Pet } from '@/services/pet';

defineProps<{
  pet: Pet;
  favorito: boolean;
}>();

defineEmits<{
  favoritar: [petId: number];
  detalhes: [petId: number];
}>();

const fotoPadrao = 'https://placehold.co/400x300?text=Sem+foto';

function formatarIdade(idadeMeses: number | null): string {
  if (idadeMeses === null || idadeMeses === undefined) return 'Idade não informada';
  if (idadeMeses < 12) return `${idadeMeses} ${idadeMeses === 1 ? 'mês' : 'meses'}`;
  const anos = Math.floor(idadeMeses / 12);
  const meses = idadeMeses % 12;
  if (meses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}
</script>

<style scoped>
.pet-card {
  position: relative;
  display: flex;
  gap: 14px;
  background: var(--petmatch-mint);
  border-radius: 18px;
  padding: 10px;
  cursor: pointer;
}

.pet-foto {
  width: 130px;
  height: 110px;
  object-fit: cover;
  border-radius: 14px;
  flex-shrink: 0;
}

.pet-info {
  flex: 1;
  min-width: 0;
  padding: 4px 36px 4px 0;
}

.pet-nome {
  margin: 0 0 2px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--petmatch-slate-shade);
}

.pet-sub {
  margin: 0 0 2px;
  font-size: 0.78rem;
  color: var(--petmatch-slate-shade);
  opacity: 0.85;
}

.pet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--petmatch-white);
  color: var(--petmatch-slate-shade);
}

.tag-verde {
  background: var(--petmatch-green);
  color: var(--petmatch-white);
}

.tag-vermelha {
  background: var(--petmatch-red);
  color: var(--petmatch-white);
}

.coracao {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: var(--petmatch-white);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.coracao ion-icon {
  font-size: 16px;
  color: var(--petmatch-slate-shade);
}

.coracao ion-icon.favoritado {
  color: var(--petmatch-red);
}
</style>
