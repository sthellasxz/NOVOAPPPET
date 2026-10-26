<template>
  <IonPage>
    <IonContent fullscreen class="fundo-auth">
      <div class="container-auth">
        <div class="logo-auth">
          <ion-icon :icon="pawOutline"></ion-icon>
          PetMatch
        </div>

        <div class="card-auth">
          <h1 class="titulo-auth">Cadastro ONG</h1>
          <button type="button" class="link-trocar" @click="router.push('/loginong')">JÁ TENHO LOGIN</button>

          <div class="campo-auth">
            <label>Nome da Organização</label>
            <div class="input-com-icone">
              <input v-model="nomeong" type="text" autocomplete="off" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Nome do Responsável</label>
            <div class="input-com-icone">
              <input v-model="nomeresp" type="text" autocomplete="off" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Email da ONG</label>
            <div class="input-com-icone">
              <input v-model="email" type="email" autocomplete="off" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Número de telefone</label>
            <div class="input-com-icone">
              <input v-model="numero" type="tel" autocomplete="off" inputmode="numeric" maxlength="11" placeholder="(00)0000-0000" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>CNPJ</label>
            <div class="input-com-icone">
              <input v-model="cpf" type="text" autocomplete="off" inputmode="numeric" maxlength="14" placeholder="XX.XXX.XXX/0001-XX" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>CEP</label>
            <div class="input-com-icone">
              <input v-model="cep" type="text" autocomplete="off" inputmode="numeric" maxlength="9" placeholder="80000-000" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Nome de Usuário</label>
            <div class="input-com-icone">
              <input v-model="nomeusuario" type="text" autocomplete="off" placeholder="Usuario" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Senha</label>
            <div class="input-com-icone">
              <input v-model="senha" :type="mostrarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="**********" />
              <ion-icon
                :icon="mostrarSenha ? eyeOffOutline : eyeOutline"
                class="icone-clicavel"
                @click="mostrarSenha = !mostrarSenha"
              ></ion-icon>
            </div>
          </div>

          <div class="campo-auth">
            <label>Confirmar Senha</label>
            <div class="input-com-icone">
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
import { pawOutline, pencilOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { cadastrarOng, AuthError } from '@/services/auth';

const router = useRouter();

const nomeong = ref('');
const nomeresp = ref('');
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
  for (const campo of [nomeong, nomeresp, email, numero, cpf, cep, nomeusuario, senha, confirmarsenha, erroCadastro]) {
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
    await cadastrarOng({
      nomeOng: nomeong.value,
      nomeResponsavel: nomeresp.value,
      email: email.value,
      numero: numero.value,
      cnpj: cpf.value,
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
    router.push('/loginong');
  } catch (erro) {
    erroCadastro.value = erro instanceof AuthError ? erro.message : 'Não foi possível concluir o cadastro.';
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
