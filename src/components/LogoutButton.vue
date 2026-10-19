<template>
  <ion-buttons :slot="slot">
    <ion-button @click="sair">
      <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
    </ion-button>
  </ion-buttons>
</template>

<script setup lang="ts">
import { IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { encerrarSessao } from '@/services/session';

withDefaults(defineProps<{ slot?: 'start' | 'end' }>(), { slot: 'start' });

// Recarrega o app para descartar as páginas que o Ionic mantém em cache com dados do usuário anterior.
function sair() {
  encerrarSessao();
  window.location.replace('/login');
}
</script>
