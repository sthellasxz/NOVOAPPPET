<template>
  <IonPage>
    <IonContent fullscreen class="fundo-auth">
      <div class="container-auth">
        <div class="topo-auth">
          <div class="marca-auth">
            <span class="marca-icone"><ion-icon :icon="pawOutline"></ion-icon></span>
            PetMatch
          </div>
          <button type="button" class="link-trocar" @click="router.push('/cadastroong')">Criar conta</button>
        </div>

        <div class="card-auth">
          <h1 class="titulo-auth">Entrar como ONG</h1>
          <p class="subtitulo-auth">Acesse a conta da sua organização para gerenciar os pets</p>

          <div class="campo-auth">
            <label>Email ou CNPJ da organização</label>
            <div class="input-com-icone">
              <ion-icon :icon="mailOutline" class="icone-campo"></ion-icon>
              <input v-model="email" type="text" autocomplete="off" placeholder="ong@email.com" />
            </div>
          </div>

          <div class="campo-auth">
            <label>Senha</label>
            <div class="input-com-icone">
              <ion-icon :icon="lockClosedOutline" class="icone-campo"></ion-icon>
              <input v-model="senha" :type="mostrarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="Sua senha" />
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
import { pawOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
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
