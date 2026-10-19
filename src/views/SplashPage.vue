<template>
  <ion-page>
    <ion-content fullscreen class="fundo">
      <div class="container">
        <div class="icone-box">
          <ion-icon :icon="paw"></ion-icon>
        </div>
        <h1 class="titulo">PetMatch</h1>
        <p class="subtitulo">ADOÇÃO COM AMOR</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { paw } from 'ionicons/icons';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usarSessao } from '@/services/session';

const router = useRouter();
const sessao = usarSessao();

onMounted(() => {
  setTimeout(() => {
    router.replace(sessao.value ? '/home' : '/login');
  }, 1600);
});
</script>

<style scoped>
.fundo {
  --background: var(--petmatch-slate);
}

.container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}

.icone-box {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icone-box ion-icon {
  font-size: 40px;
  color: var(--petmatch-black);
}

.titulo {
  margin: 8px 0 0;
  color: var(--petmatch-white);
  font-size: 1.8rem;
  font-weight: 800;
}

.subtitulo {
  margin: 0;
  color: var(--petmatch-mint);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 3px;
}
</style>
