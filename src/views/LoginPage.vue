<template>
  <ion-page>
    <ion-content fullscreen class="fundo">
      <div class="container">
        <div class="cabecalho">
          <ion-icon :icon="pawOutline"></ion-icon>
          <span>PetMatch</span>
        </div>

        <h1 class="titulo">Como deseja usar<br />o PetMatch?</h1>
        <p class="subtitulo">Selecione seu perfil para começar</p>

        <div class="opcoes">
          <button
            type="button"
            class="opcao-card"
            :class="{ selecionada: tiposelecionado === 'pessoa' }"
            @click="tiposelecionado = 'pessoa'"
          >
            <span class="icone-box">
              <ion-icon :icon="personOutline"></ion-icon>
            </span>
            <span class="opcao-texto">
              <strong>Pessoa</strong>
              <span>Quero adotar ou encontrar um pet perdido</span>
            </span>
            <ion-icon class="seta" :icon="chevronForwardOutline"></ion-icon>
          </button>

          <button
            type="button"
            class="opcao-card"
            :class="{ selecionada: tiposelecionado === 'ong' }"
            @click="tiposelecionado = 'ong'"
          >
            <span class="icone-box">
              <ion-icon :icon="homeOutline"></ion-icon>
            </span>
            <span class="opcao-texto">
              <strong>ONG / Abrigo</strong>
              <span>Represento uma organização de proteção animal</span>
            </span>
            <ion-icon class="seta" :icon="chevronForwardOutline"></ion-icon>
          </button>
        </div>

        <div class="acoes">
          <div class="divisor">
            <span></span>
            <p>ou</p>
            <span></span>
          </div>

          <ion-button expand="block" class="botao-entrar" :disabled="!tiposelecionado" @click="entrar">
            Entrar na conta
          </ion-button>

          <button type="button" class="link-cadastro" :disabled="!tiposelecionado" @click="criarConta">
            Criar conta gratuitamente
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { pawOutline, personOutline, homeOutline, chevronForwardOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const tiposelecionado = ref('');
const router = useRouter();

const entrar = () => {
  if (tiposelecionado.value === 'pessoa') router.push('/loginpessoa');
  else if (tiposelecionado.value === 'ong') router.push('/loginong');
};

const criarConta = () => {
  if (tiposelecionado.value === 'pessoa') router.push('/cadastropessoa');
  else if (tiposelecionado.value === 'ong') router.push('/cadastroong');
};
</script>

<style scoped>
.fundo {
  --background: #f4f6f7;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 24px 24px;
}

.cabecalho {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--petmatch-slate);
  margin-bottom: 28px;
}

.cabecalho ion-icon {
  font-size: 1.4rem;
}

.titulo {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--petmatch-black);
  line-height: 1.3;
  margin: 0 0 8px;
}

.subtitulo {
  color: var(--petmatch-black);
  opacity: 0.6;
  margin: 0 0 24px;
  font-size: 0.95rem;
}

.opcoes {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.opcao-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  background: var(--petmatch-white);
  border: 2px solid #e3e8ea;
  border-radius: 16px;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.opcao-card.selecionada {
  border-color: var(--petmatch-slate);
  box-shadow: 0 0 0 1px var(--petmatch-slate);
}

.icone-box {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icone-box ion-icon {
  font-size: 22px;
  color: var(--petmatch-slate-shade);
}

.opcao-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opcao-texto strong {
  color: var(--petmatch-black);
  font-size: 1rem;
}

.opcao-texto span {
  color: var(--petmatch-black);
  opacity: 0.6;
  font-size: 0.82rem;
  line-height: 1.3;
}

.seta {
  flex-shrink: 0;
  color: var(--petmatch-slate);
  font-size: 18px;
}

.acoes {
  margin-top: auto;
  padding-top: 32px;
}

.divisor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.divisor span {
  flex: 1;
  height: 1px;
  background: #dde3e5;
}

.divisor p {
  margin: 0;
  color: #9aa5aa;
  font-size: 0.85rem;
}

.botao-entrar {
  --background: var(--petmatch-slate);
  --background-hover: var(--petmatch-slate-shade);
  --color: var(--petmatch-white);
  --border-radius: 12px;
  font-weight: 600;
  height: 48px;
}

.link-cadastro {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: var(--petmatch-slate);
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  padding: 14px 0 4px;
  cursor: pointer;
}

.link-cadastro:disabled {
  color: var(--petmatch-black);
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
