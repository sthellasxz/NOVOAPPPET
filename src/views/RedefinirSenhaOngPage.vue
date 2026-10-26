<template>
  <IonPage>
    <IonContent fullscreen class="fundo-auth">
      <div class="container-auth">
        <div class="topo-auth">
          <div class="marca-auth">
            <span class="marca-icone"><ion-icon :icon="pawOutline"></ion-icon></span>
            PetMatch
          </div>
          <button type="button" class="link-trocar" @click="router.push('/loginong')">Voltar ao login</button>
        </div>

        <div class="card-auth">
          <h1 class="titulo-auth">Redefinir senha</h1>
          <p class="subtitulo-auth">Confirme os dados da organização para criar uma nova senha</p>

          <div class="campo-auth">
            <label>Email ou nome de usuário</label>
            <div class="input-com-icone">
              <ion-icon :icon="mailOutline" class="icone-campo"></ion-icon>
              <input v-model="identificador" type="text" autocomplete="off" placeholder="ong@email.com" />
            </div>
          </div>

          <div class="campo-auth">
            <label>CNPJ cadastrado</label>
            <div class="input-com-icone">
              <ion-icon :icon="cardOutline" class="icone-campo"></ion-icon>
              <input v-model="cnpj" type="text" autocomplete="off" inputmode="numeric" maxlength="14" placeholder="XX.XXX.XXX/0001-XX" />
            </div>
          </div>

          <div class="campo-auth">
            <label>Nova senha</label>
            <div class="input-com-icone">
              <ion-icon :icon="lockClosedOutline" class="icone-campo"></ion-icon>
              <input v-model="novaSenha" :type="mostrarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="**********" />
              <ion-icon
                :icon="mostrarSenha ? eyeOffOutline : eyeOutline"
                class="icone-clicavel"
                @click="mostrarSenha = !mostrarSenha"
              ></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Confirmar nova senha</label>
            <div class="input-com-icone">
              <ion-icon :icon="lockClosedOutline" class="icone-campo"></ion-icon>
              <input v-model="confirmarSenha" :type="mostrarConfirmarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="**********" />
              <ion-icon
                :icon="mostrarConfirmarSenha ? eyeOffOutline : eyeOutline"
                class="icone-clicavel"
                @click="mostrarConfirmarSenha = !mostrarConfirmarSenha"
              ></ion-icon>
            </div>
          </div>

          <IonText color="danger" v-if="erroSenha">
            <p class="erro-texto">{{ erroSenha }}</p>
          </IonText>

          <IonText color="danger" v-if="erro">
            <p class="erro-texto">{{ erro }}</p>
          </IonText>

          <IonButton
            expand="block"
            class="botao-auth"
            :disabled="!identificador || !cnpj || !senhasIguais || novaSenha === '' || carregando"
            @click="redefinir"
          >
            Redefinir senha
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonIcon,
  toastController,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  pawOutline,
  mailOutline,
  cardOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { redefinirSenhaOng, AuthError } from '@/services/auth';

const router = useRouter();

const identificador = ref('');
const cnpj = ref('');
const novaSenha = ref('');
const confirmarSenha = ref('');
const mostrarSenha = ref(false);
const mostrarConfirmarSenha = ref(false);
const erro = ref('');
const carregando = ref(false);

const senhasIguais = computed(() => novaSenha.value === confirmarSenha.value);

const erroSenha = computed(() => {
  if (confirmarSenha.value === '') return '';
  return senhasIguais.value ? '' : 'As senhas não coincidem';
});

function limpar() {
  identificador.value = '';
  cnpj.value = '';
  novaSenha.value = '';
  confirmarSenha.value = '';
  mostrarSenha.value = false;
  mostrarConfirmarSenha.value = false;
  erro.value = '';
}

onIonViewWillEnter(limpar);

const redefinir = async () => {
  erro.value = '';
  carregando.value = true;
  try {
    await redefinirSenhaOng(identificador.value, cnpj.value, novaSenha.value);
    const toast = await toastController.create({
      message: 'Senha redefinida com sucesso!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    limpar();
    router.push('/loginong');
  } catch (erroCapturado) {
    erro.value = erroCapturado instanceof AuthError ? erroCapturado.message : 'Não foi possível redefinir a senha.';
  } finally {
    carregando.value = false;
  }
};
</script>

<style scoped>
.fundo-auth {
  --background: #f4f6f7;
}

.container-auth {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 28px 20px 40px;
}

.topo-auth {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.marca-auth {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--petmatch-slate);
}

.marca-icone {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.marca-icone ion-icon {
  font-size: 16px;
  color: var(--petmatch-slate-shade);
}

.link-trocar {
  background: none;
  border: 1.5px solid #e3e8ea;
  border-radius: 10px;
  padding: 7px 14px;
  color: var(--petmatch-slate);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.link-trocar:hover {
  border-color: var(--petmatch-slate);
}

.card-auth {
  width: 100%;
  background: var(--petmatch-white);
  border: 1.5px solid #e3e8ea;
  border-radius: 20px;
  padding: 28px 24px;
}

.titulo-auth {
  margin: 0 0 6px;
  color: var(--petmatch-black);
  font-size: 1.4rem;
  font-weight: 700;
}

.subtitulo-auth {
  margin: 0 0 24px;
  color: var(--petmatch-black);
  opacity: 0.6;
  font-size: 0.88rem;
  line-height: 1.4;
}

.campo-auth {
  margin-bottom: 16px;
}

.campo-auth label {
  display: block;
  color: var(--petmatch-black);
  opacity: 0.75;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.input-com-icone {
  display: flex;
  align-items: center;
  background: var(--petmatch-white);
  border: 1.5px solid #e3e8ea;
  border-radius: 12px;
  padding: 0 12px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-com-icone:focus-within {
  border-color: var(--petmatch-slate);
  box-shadow: 0 0 0 3px rgba(96, 121, 133, 0.14);
}

.icone-campo {
  flex-shrink: 0;
  font-size: 18px;
  color: #9aa5aa;
  margin-right: 10px;
}

.input-com-icone input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 13px 0;
  font-size: 0.92rem;
  font-family: inherit;
  color: var(--petmatch-black);
  outline: none;
  min-width: 0;
}

.input-com-icone input::placeholder {
  color: #aab3b8;
}

.icone-clicavel {
  flex-shrink: 0;
  font-size: 18px;
  color: #9aa5aa;
  cursor: pointer;
  padding: 4px;
  margin-left: 4px;
}

.icone-clicavel:hover {
  color: var(--petmatch-slate);
}

.erro-texto {
  color: var(--petmatch-red);
  font-size: 0.82rem;
  margin: -4px 2px 14px;
}

.botao-auth {
  --background: var(--petmatch-slate);
  --background-hover: var(--petmatch-slate-shade);
  --color: var(--petmatch-white);
  --border-radius: 12px;
  font-weight: 600;
  height: 48px;
  margin-top: 6px;
}
</style>
