<template>
  <IonPage>
    <IonContent fullscreen class="fundo-auth">
      <div class="container-auth">
        <div class="topo-auth">
          <div class="marca-auth">
            <span class="marca-icone"><ion-icon :icon="pawOutline"></ion-icon></span>
            PetMatch
          </div>
          <button type="button" class="link-trocar" @click="router.push('/loginpessoa')">Já tenho login</button>
        </div>

        <div class="card-auth">
          <h1 class="titulo-auth">Criar conta de pessoa</h1>
          <p class="subtitulo-auth">Preencha seus dados para começar a adotar</p>

          <div class="campo-auth">
            <label>Nome completo</label>
            <div class="input-com-icone">
              <ion-icon :icon="personOutline" class="icone-campo"></ion-icon>
              <input v-model="name" type="text" autocomplete="off" placeholder="Seu nome completo" />
            </div>
          </div>

          <div class="campo-auth">
            <label>Email</label>
            <div class="input-com-icone">
              <ion-icon :icon="mailOutline" class="icone-campo"></ion-icon>
              <input v-model="email" type="email" autocomplete="off" placeholder="voce@email.com" />
            </div>
          </div>

          <div class="campo-auth">
            <label>Número de telefone</label>
            <div class="input-com-icone">
              <ion-icon :icon="callOutline" class="icone-campo"></ion-icon>
              <input v-model="numero" type="tel" autocomplete="off" inputmode="numeric" maxlength="11" placeholder="(00)0000-0000" />
            </div>
          </div>

          <div class="campo-auth">
            <label>CPF</label>
            <div class="input-com-icone">
              <ion-icon :icon="cardOutline" class="icone-campo"></ion-icon>
              <input v-model="cpf" type="text" autocomplete="off" inputmode="numeric" maxlength="11" placeholder="XXX.XXX.XXX-00" />
            </div>
          </div>

          <div class="campo-auth">
            <label>CEP</label>
            <div class="input-com-icone">
              <ion-icon :icon="locationOutline" class="icone-campo"></ion-icon>
              <input v-model="cep" type="text" autocomplete="off" inputmode="numeric" maxlength="9" placeholder="80000-000" />
            </div>
          </div>

          <div class="campo-auth">
            <label>Nome de usuário</label>
            <div class="input-com-icone">
              <ion-icon :icon="atOutline" class="icone-campo"></ion-icon>
              <input v-model="nomeusuario" type="text" autocomplete="off" placeholder="Usuario" />
            </div>
          </div>

          <div class="campo-auth">
            <label>Senha</label>
            <div class="input-com-icone">
              <ion-icon :icon="lockClosedOutline" class="icone-campo"></ion-icon>
              <input v-model="senha" :type="mostrarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="**********" />
              <ion-icon
                :icon="mostrarSenha ? eyeOffOutline : eyeOutline"
                class="icone-clicavel"
                @click="mostrarSenha = !mostrarSenha"
              ></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Confirmar senha</label>
            <div class="input-com-icone">
              <ion-icon :icon="lockClosedOutline" class="icone-campo"></ion-icon>
              <input v-model="confirmarsenha" :type="mostrarConfirmarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="**********" />
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

          <IonText color="danger" v-if="erroCadastro">
            <p class="erro-texto">{{ erroCadastro }}</p>
          </IonText>

          <IonButton
            expand="block"
            class="botao-auth"
            :disabled="!senhasIguais || senha === '' || carregando"
            @click="cadastrar"
          >
            Cadastrar
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
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
  personOutline,
  mailOutline,
  callOutline,
  cardOutline,
  locationOutline,
  atOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { cadastrarPessoa, AuthError } from '@/services/auth';

const router = useRouter();

const name = ref('');
const email = ref('');
const numero = ref('');
const cpf = ref('');
const cep = ref('');
const nomeusuario = ref('');
const senha = ref('');
const confirmarsenha =ref('')
const mostrarSenha = ref(false);
const mostrarConfirmarSenha = ref(false);
const erroCadastro = ref('');
const carregando = ref(false);

const senhasIguais = computed (() => {
  return senha.value === confirmarsenha.value
});

const erroSenha = computed(() => {
  if (confirmarsenha.value === '') return '';  // não mostra erro se vazio
  return senhasIguais.value ? '' : 'As senhas não coincidem';
});

function limpar() {
  for (const campo of [name, email, numero, cpf, cep, nomeusuario, senha, confirmarsenha, erroCadastro]) {
    campo.value = '';
  }
  mostrarSenha.value = false;
  mostrarConfirmarSenha.value = false;
}

onIonViewWillEnter(limpar);

const cadastrar = async () => {
  erroCadastro.value = '';
  carregando.value = true;
  try {
    await cadastrarPessoa({
      nome: name.value,
      email: email.value,
      numero: numero.value,
      cpf: cpf.value,
      cep: cep.value,
      nomeusuario: nomeusuario.value,
      senha: senha.value,
    });

    const toast = await toastController.create({
      message: 'Cadastro realizado com sucesso!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();

    (document.activeElement as HTMLElement | null)?.blur();
    limpar();
    router.push('/loginpessoa');
  } catch (erro) {
    erroCadastro.value = erro instanceof AuthError ? erro.message : 'Não foi possível concluir o cadastro.';
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
