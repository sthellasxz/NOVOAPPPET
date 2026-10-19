<template>
  <IonPage>
    <ion-header class="header-transparente">
      <ion-toolbar>
        <LogoutButton v-if="ehPerfilProprio" />
        <ion-buttons slot="start" v-else>
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <IonContent class="fundo-perfil">
      <div class="badge-central">
        <span>PERFIL</span>
      </div>

      <div class="cartao-perfil" v-if="dados && !editando">
        <div class="avatar">
          <img v-if="dados.foto_url" :src="dados.foto_url" alt="Foto de perfil" />
          <ion-icon v-else :icon="personOutline"></ion-icon>
        </div>

        <div class="campos">
          <div class="campo">
            <span class="rotulo">{{ tipo === 'ong' ? 'Organização' : 'Nome' }}</span>
            <span class="valor">{{ dados.nome }}</span>
          </div>
          <div class="campo" v-if="tipo === 'ong' && dados.responsavel">
            <span class="rotulo">Responsável</span>
            <span class="valor">{{ dados.responsavel }}</span>
          </div>
          <div class="campo">
            <span class="rotulo">Email</span>
            <span class="valor">{{ dados.email }}</span>
          </div>
          <div class="campo">
            <span class="rotulo">Telefone</span>
            <span class="valor">{{ dados.numero || 'Não informado' }}</span>
          </div>
        </div>

        <span class="usuario">@{{ dados.nomeusuario }}</span>

        <div class="campo campo-cep">
          <span class="rotulo">CEP</span>
          <span class="valor">{{ dados.cep || 'Não informado' }}</span>
        </div>

        <button v-if="ehPerfilProprio" type="button" class="botao-editar" @click="abrirEdicao">
          <ion-icon :icon="createOutline"></ion-icon>
          Editar perfil
        </button>
      </div>

      <div class="cartao-edicao" v-if="dados && editando">
        <div class="avatar-edicao" @click="inputFotoRef?.click()">
          <img v-if="form.foto_url" :src="form.foto_url" alt="Foto de perfil" />
          <ion-icon v-else :icon="personOutline"></ion-icon>
          <span class="selo-camera">
            <ion-icon :icon="cameraOutline"></ion-icon>
          </span>
          <input ref="inputFotoRef" type="file" accept="image/*" class="oculto" @change="onFotoSelecionada" />
        </div>
        <button v-if="form.foto_url" type="button" class="link-remover" @click="form.foto_url = ''">
          Remover foto
        </button>

        <div class="campo-form">
          <label>{{ tipo === 'ong' ? 'Nome da organização' : 'Nome' }}</label>
          <input v-model="form.nome" type="text" autocomplete="off" />
        </div>
        <div class="campo-form" v-if="tipo === 'ong'">
          <label>Nome do responsável</label>
          <input v-model="form.responsavel" type="text" autocomplete="off" />
        </div>
        <div class="campo-form">
          <label>Telefone</label>
          <input v-model="form.numero" type="tel" inputmode="numeric" maxlength="11" autocomplete="off" />
        </div>
        <div class="campo-form">
          <label>CEP</label>
          <input v-model="form.cep" type="text" inputmode="numeric" maxlength="9" autocomplete="off" />
        </div>

        <p class="erro-texto" v-if="erro">{{ erro }}</p>

        <ion-button expand="block" class="botao-salvar" :disabled="salvando || !form.nome.trim()" @click="salvar">
          Salvar
        </ion-button>
        <button type="button" class="link-cancelar" @click="editando = false">Cancelar</button>
      </div>

      <div class="badge-central">
        <span>PUBLICAÇÕES</span>
      </div>

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
        <p v-if="ehPerfilProprio">Você ainda não tem publicações.<br />Clique em publicar e faça a sua primeira!</p>
        <p v-else>Nenhuma publicação ainda.</p>
      </div>
    </IonContent>

    <ion-footer v-if="ehPerfilProprio">
      <BottomTabBar />
    </ion-footer>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonFooter,
  IonIcon,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue';
import { personOutline, createOutline, cameraOutline } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import PetCard from '@/components/PetCard.vue';
import BottomTabBar from '@/components/BottomTabBar.vue';
import LogoutButton from '@/components/LogoutButton.vue';
import { listarPetsPorDono, favoritarPet, desfavoritarPet, listarIdsFavoritos, type Pet } from '@/services/pet';
import { obterPessoaPorId, obterOngPorId, atualizarPerfilPessoa, atualizarPerfilOng, AuthError } from '@/services/auth';
import { usarSessao, atualizarNomeSessao, type TipoUsuario } from '@/services/session';
import { prepararFoto, ImagemError } from '@/services/imagem';

interface DadosPerfil {
  nome: string;
  responsavel: string;
  email: string;
  numero: string;
  cep: string;
  nomeusuario: string;
  foto_url: string | null;
}

const route = useRoute();
const router = useRouter();
const sessao = usarSessao();

const tipo = computed(() => route.params.tipo as TipoUsuario);
const id = computed(() => Number(route.params.id));
const ehPerfilProprio = computed(() =>
  !!sessao.value && sessao.value.tipo === tipo.value && sessao.value.id === id.value
);

const dados = ref<DadosPerfil | null>(null);
const pets = ref<Pet[]>([]);
const idsFavoritos = ref<Set<number>>(new Set());

const editando = ref(false);
const salvando = ref(false);
const erro = ref('');
const inputFotoRef = ref<HTMLInputElement | null>(null);
const form = reactive({ nome: '', responsavel: '', numero: '', cep: '', foto_url: '' });

async function carregar() {
  editando.value = false;
  if (tipo.value === 'ong') {
    const ong = await obterOngPorId(id.value);
    dados.value = ong
      ? {
          nome: ong.nome_ong,
          responsavel: ong.nome_responsavel,
          email: ong.email,
          numero: ong.numero,
          cep: ong.cep,
          nomeusuario: ong.nomeusuario,
          foto_url: ong.foto_url,
        }
      : null;
  } else {
    const pessoa = await obterPessoaPorId(id.value);
    dados.value = pessoa
      ? {
          nome: pessoa.nome,
          responsavel: '',
          email: pessoa.email,
          numero: pessoa.numero,
          cep: pessoa.cep,
          nomeusuario: pessoa.nomeusuario,
          foto_url: pessoa.foto_url,
        }
      : null;
  }

  pets.value = await listarPetsPorDono(tipo.value, id.value);

  if (sessao.value) {
    idsFavoritos.value = await listarIdsFavoritos({ tipo: sessao.value.tipo, id: sessao.value.id });
  }
}

function abrirEdicao() {
  if (!dados.value) return;
  form.nome = dados.value.nome;
  form.responsavel = dados.value.responsavel;
  form.numero = dados.value.numero ?? '';
  form.cep = dados.value.cep ?? '';
  form.foto_url = dados.value.foto_url ?? '';
  erro.value = '';
  editando.value = true;
}

async function onFotoSelecionada(evento: Event) {
  const input = evento.target as HTMLInputElement;
  const arquivo = input.files?.[0];
  input.value = '';
  if (!arquivo) return;
  try {
    form.foto_url = await prepararFoto(arquivo, 512);
    erro.value = '';
  } catch (e) {
    erro.value = e instanceof ImagemError ? e.message : 'Não foi possível carregar a foto.';
  }
}

async function salvar() {
  if (!ehPerfilProprio.value) return;
  salvando.value = true;
  erro.value = '';
  try {
    if (tipo.value === 'ong') {
      await atualizarPerfilOng(id.value, {
        nome_ong: form.nome,
        nome_responsavel: form.responsavel,
        numero: form.numero,
        cep: form.cep,
        foto_url: form.foto_url,
      });
    } else {
      await atualizarPerfilPessoa(id.value, {
        nome: form.nome,
        numero: form.numero,
        cep: form.cep,
        foto_url: form.foto_url,
      });
    }
    atualizarNomeSessao(form.nome.trim());
    await carregar();
    const toast = await toastController.create({ message: 'Perfil atualizado!', duration: 2000, color: 'success' });
    await toast.present();
  } catch (e) {
    erro.value = e instanceof AuthError ? e.message : 'Não foi possível salvar o perfil.';
  } finally {
    salvando.value = false;
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

onIonViewWillEnter(carregar);
</script>

<style scoped>
.header-transparente ion-toolbar {
  --background: transparent;
  --border-width: 0;
}

.fundo-perfil {
  --background: #f4f6f7;
}

.badge-central {
  display: flex;
  justify-content: center;
  margin: 4px 0 20px;
}

.badge-central span {
  background: var(--petmatch-slate);
  color: var(--petmatch-white);
  padding: 6px 22px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.cartao-perfil {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto auto;
  column-gap: 16px;
  row-gap: 14px;
  background: var(--petmatch-slate);
  border-radius: 18px;
  padding: 20px;
  margin: 0 16px 24px;
}

.avatar {
  grid-column: 1;
  grid-row: 1;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar img,
.avatar-edicao img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar ion-icon {
  font-size: 30px;
  color: var(--petmatch-slate);
}

.campos {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.rotulo {
  color: var(--petmatch-mint);
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.valor {
  color: var(--petmatch-white);
  font-size: 0.85rem;
  word-break: break-word;
}

.usuario {
  grid-column: 1;
  grid-row: 2;
  align-self: end;
  color: var(--petmatch-mint);
  font-size: 0.7rem;
  opacity: 0.9;
}

.campo-cep {
  grid-column: 2;
  grid-row: 2;
  align-self: end;
  text-align: right;
}

.botao-editar {
  grid-column: 1 / -1;
  grid-row: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--petmatch-mint);
  color: var(--petmatch-slate-shade);
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.cartao-edicao {
  display: flex;
  flex-direction: column;
  background: var(--petmatch-slate);
  border-radius: 18px;
  padding: 20px;
  margin: 0 16px 24px;
}

.avatar-edicao {
  position: relative;
  align-self: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-edicao img {
  border-radius: 50%;
}

.avatar-edicao > ion-icon {
  font-size: 44px;
  color: var(--petmatch-slate);
}

.selo-camera {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--petmatch-white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.selo-camera ion-icon {
  font-size: 17px;
  color: var(--petmatch-slate-shade);
}

.oculto {
  display: none;
}

.link-remover {
  margin-top: 8px;
}

.link-remover,
.link-cancelar {
  align-self: center;
  background: none;
  border: none;
  color: var(--petmatch-mint);
  font-family: inherit;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 8px;
  cursor: pointer;
}

.campo-form {
  margin-top: 12px;
}

.campo-form label {
  display: block;
  color: var(--petmatch-white);
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.campo-form input {
  width: 100%;
  box-sizing: border-box;
  background: var(--petmatch-mint);
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--petmatch-slate-shade);
  outline: none;
}

.erro-texto {
  color: #ffd2d2;
  font-size: 0.8rem;
  margin: 10px 2px 0;
}

.botao-salvar {
  --background: var(--petmatch-white);
  --color: var(--petmatch-slate-shade);
  --border-radius: 12px;
  font-weight: 700;
  margin-top: 18px;
}

.cards-lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 16px 100px;
}

@media (min-width: 769px) {
  .cards-lista {
    max-width: 640px;
    margin: 0 auto;
  }
}

.vazio {
  text-align: center;
  padding: 32px 24px 64px;
}

.vazio p {
  margin: 0;
  color: var(--petmatch-black);
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
