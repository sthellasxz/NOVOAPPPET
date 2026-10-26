<template>
  <IonPage>
    <IonContent fullscreen class="fundo-auth">
      <div class="container-auth">
        <div class="logo-auth">
          <ion-icon :icon="pawOutline"></ion-icon>
          PetMatch
        </div>

        <div class="card-auth">
          <h1 class="titulo-auth">Login ONG</h1>
          <button type="button" class="link-trocar" @click="router.push('/cadastroong')">CRIAR CONTA</button>

          <div class="campo-auth">
            <label>Email ou CNPJ da Organização</label>
            <div class="input-com-icone">
              <input v-model="email" type="text" autocomplete="off" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Senha</label>
            <div class="input-com-icone">
              <input v-model="senha" :type="mostrarSenha ? 'text' : 'password'" autocomplete="new-password" />
              <ion-icon
                :icon="mostrarSenha ? eyeOffOutline : eyeOutline"
                class="icone-clicavel"
                @click="mostrarSenha = !mostrarSenha"
              ></ion-icon>
            </div>
          </div>

          <IonText color="danger" v-if="erroLogin">
            <p class="erro-texto">{{ erroLogin }}</p>
          </IonText>

          <IonButton expand="block" class="botao-auth" @click="fazerlogin" :disabled="carregando">
            Entrar
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { pawOutline, pencilOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { loginOng, AuthError } from '@/services/auth';
import { iniciarSessao } from '@/services/session';

const router = useRouter();

const email = ref('');
const senha = ref('');
const mostrarSenha = ref(false);
const erroLogin = ref('');
const carregando = ref(false);

onIonViewWillEnter(() => {
  email.value = '';
  senha.value = '';
  mostrarSenha.value = false;
  erroLogin.value = '';
});

const fazerlogin = async () => {
  erroLogin.value = '';
  carregando.value = true;
  try {
    const usuario = await loginOng(email.value, senha.value);
    iniciarSessao({ tipo: 'ong', id: usuario.id, nome: usuario.nome_ong, nomeusuario: usuario.nomeusuario });
    (document.activeElement as HTMLElement | null)?.blur();
    email.value = '';
    senha.value = '';
    router.replace('/home');
  } catch (erro) {
    erroLogin.value = erro instanceof AuthError ? erro.message : 'Não foi possível fazer login.';
  } finally {
    carregando.value = false;
  }
};
</script>

<style scoped>
.fundo-auth {
  --background: var(--petmatch-white);
}

.container-auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 32px 20px 40px;
}

.logo-auth {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--petmatch-slate);
  margin-bottom: 20px;
}

.card-auth {
  width: 100%;
  max-width: 420px;
  background: var(--petmatch-slate);
  border-radius: 22px;
  padding: 26px 22px;
}

.titulo-auth {
  margin: 0 0 4px;
  text-align: center;
  color: var(--petmatch-white);
  font-size: 1.3rem;
  font-weight: 800;
  text-transform: uppercase;
}

.link-trocar {
  display: block;
  margin: 0 auto 20px;
  background: none;
  border: none;
  color: var(--petmatch-mint);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
}

.campo-auth {
  margin-bottom: 14px;
}

.campo-auth label {
  display: block;
  color: var(--petmatch-white);
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.input-com-icone {
  display: flex;
  align-items: center;
  background: var(--petmatch-mint);
  border-radius: 10px;
  overflow: hidden;
}

.input-com-icone input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--petmatch-slate-shade);
  outline: none;
  min-width: 0;
}

.input-com-icone ion-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  margin-right: 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  color: var(--petmatch-slate-shade);
  padding: 8px;
  box-sizing: border-box;
}

.icone-clicavel {
  cursor: pointer;
}

.erro-texto {
  color: var(--petmatch-red);
  font-size: 0.8rem;
  margin: 4px 2px 8px;
}

.botao-auth {
  --background: var(--petmatch-white);
  --color: var(--petmatch-slate-shade);
  --border-radius: 12px;
  font-weight: 700;
  margin-top: 10px;
}
</style>
