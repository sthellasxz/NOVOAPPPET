<template>
  <ion-page>
    <ion-content fullscreen class="fundo-cadastro">
      <div class="topo">
        <div class="logo-cadastro">
          <span class="logo-icone">
            <ion-icon :icon="pawOutline"></ion-icon>
          </span>
          <span class="logo-texto">
            <span class="logo-nome"><strong>Pet</strong>Match</span>
            <span class="logo-badge">Adoção com amor</span>
          </span>
        </div>
        <button type="button" class="botao-fechar" @click="fechar">
          <ion-icon :icon="closeOutline"></ion-icon>
        </button>
      </div>

      <!-- ETAPA 1: FOTO -->
      <template v-if="etapa === 'foto'">
        <div class="barra-secao">Foto do Animal</div>

        <div class="dropzone" @click="abrirSeletorArquivo">
          <input
            ref="inputArquivoRef"
            type="file"
            accept="image/*"
            class="input-arquivo-oculto"
            @change="onFotoSelecionada"
          />
          <template v-if="!fotoUrl">
            <span class="icone-dropzone">
              <ion-icon :icon="pawOutline"></ion-icon>
            </span>
            <p class="dropzone-titulo">Toque para adicionar foto</p>
            <p class="dropzone-sub">JPG ou PNG · Máx 10MB</p>
          </template>
          <img v-else class="foto-preview" :src="fotoUrl" alt="Foto do pet" />
        </div>
        <p class="erro-foto" v-if="erroFoto">{{ erroFoto }}</p>

        <div class="rodape-etapa">
          <ion-button expand="block" class="botao-pill" :disabled="!fotoUrl" @click="etapa = 'form'">
            Continuar
          </ion-button>
          <button type="button" class="link-simples" @click="fechar">Cancelar</button>
        </div>
      </template>

      <!-- ETAPA 2: INFORMAÇÕES -->
      <template v-else>
        <div class="card-form">
          <h2 class="titulo-form">{{ modoEdicao ? 'Editar seu pet' : 'Publique seu pet' }}</h2>
          <p class="subtitulo-form">Preencha os campos abaixo</p>

          <div class="campo">
            <label>Nome do Pet</label>
            <div class="input-com-icone">
              <input v-model="nome" type="text" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>Espécie</label>
            <div class="input-com-icone select">
              <select v-model="especie">
                <option value="" disabled>Selecione</option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Outro">Outro</option>
              </select>
              <ion-icon :icon="chevronDownOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>Situação do pet</label>
            <div class="opcoes-radio">
              <label class="opcao-radio">
                <input type="radio" value="Resgatado" v-model="situacao" />
                Resgatado
              </label>
              <label class="opcao-radio">
                <input type="radio" value="ONG" v-model="situacao" />
                ONG
              </label>
              <label class="opcao-radio">
                <input type="radio" value="Doméstico" v-model="situacao" />
                Doméstico
              </label>
            </div>
          </div>

          <div class="campo">
            <label>Raça</label>
            <div class="input-com-icone">
              <input v-model="raca" type="text" placeholder="Opcional" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>Sexo</label>
            <div class="input-com-icone select">
              <select v-model="sexo">
                <option value="">Não informado</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
              <ion-icon :icon="chevronDownOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>Idade</label>
            <div class="input-com-icone">
              <input v-model="idadeMeses" type="number" inputmode="numeric" placeholder="Em meses" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>Contato</label>
            <div class="input-com-icone">
              <input v-model="contato" type="tel" placeholder="(00) 00000-0000" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>CEP</label>
            <div class="input-com-icone">
              <input v-model="cep" type="text" inputmode="numeric" maxlength="9" placeholder="80000-000" />
              <ion-icon :icon="pencilOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>É castrado(a)?</label>
            <div class="opcoes-radio">
              <label class="opcao-radio">
                <input type="radio" value="sim" v-model="castradoOpcao" />
                Sim
              </label>
              <label class="opcao-radio">
                <input type="radio" value="nao" v-model="castradoOpcao" />
                Não
              </label>
              <label class="opcao-radio">
                <input type="radio" value="nao-sei" v-model="castradoOpcao" />
                Não sei
              </label>
            </div>
          </div>

          <div class="campo">
            <label>É vacinado(a)?</label>
            <div class="opcoes-radio">
              <label class="opcao-radio">
                <input type="radio" :value="true" v-model="vacinado" />
                Sim
              </label>
              <label class="opcao-radio">
                <input type="radio" :value="false" v-model="vacinado" />
                Não
              </label>
            </div>
          </div>

          <div class="campo">
            <label>Porte</label>
            <div class="input-com-icone select">
              <select v-model="porte">
                <option value="" disabled>Selecione</option>
                <option value="Pequeno">Pequeno</option>
                <option value="Médio">Médio</option>
                <option value="Grande">Grande</option>
              </select>
              <ion-icon :icon="chevronDownOutline"></ion-icon>
            </div>
          </div>

          <div class="campo">
            <label>Detalhes do pet</label>
            <textarea v-model="descricao" rows="3" placeholder="Conte um pouco sobre o pet"></textarea>
          </div>

          <IonText color="danger" v-if="erro">
            <p class="erro-texto">{{ erro }}</p>
          </IonText>

          <ion-button expand="block" class="botao-pill" :disabled="!nome || !especie || carregando" @click="salvar">
            {{ modoEdicao ? 'Salvar Alterações' : 'Publicar' }}
          </ion-button>
          <button type="button" class="link-simples" @click="etapa = 'foto'">← Voltar à foto</button>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  toastController,
  onIonViewWillEnter,
} from '@ionic/vue';
import { pawOutline, closeOutline, pencilOutline, chevronDownOutline } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { cadastrarPet, atualizarPet, obterPetPorId, type DadosPet } from '@/services/pet';
import { usarSessao } from '@/services/session';
import { prepararFoto, ImagemError } from '@/services/imagem';

const route = useRoute();
const router = useRouter();
const sessao = usarSessao();

const petId = computed(() => (route.params.id ? Number(route.params.id) : null));
const modoEdicao = computed(() => petId.value !== null);

const etapa = ref<'foto' | 'form'>('foto');
const inputArquivoRef = ref<HTMLInputElement | null>(null);

const fotoUrl = ref('');
const nome = ref('');
const especie = ref('');
const situacao = ref('');
const raca = ref('');
const sexo = ref('');
const idadeMeses = ref('');
const contato = ref('');
const cep = ref('');
const castradoOpcao = ref<'sim' | 'nao' | 'nao-sei'>('nao-sei');
const vacinado = ref(false);
const porte = ref('');
const descricao = ref('');
const erro = ref('');
const erroFoto = ref('');
const carregando = ref(false);

function abrirSeletorArquivo() {
  inputArquivoRef.value?.click();
}

async function onFotoSelecionada(evento: Event) {
  const input = evento.target as HTMLInputElement;
  const arquivo = input.files?.[0];
  input.value = '';
  if (!arquivo) return;
  try {
    fotoUrl.value = await prepararFoto(arquivo);
    erroFoto.value = '';
  } catch (e) {
    erroFoto.value = e instanceof ImagemError ? e.message : 'Não foi possível carregar a foto.';
  }
}

function fechar() {
  router.push('/home');
}

function limparFormulario() {
  etapa.value = 'foto';
  for (const campo of [fotoUrl, nome, especie, situacao, raca, sexo, idadeMeses, contato, cep, porte, descricao, erro, erroFoto]) {
    campo.value = '';
  }
  castradoOpcao.value = 'nao-sei';
  vacinado.value = false;
}

onIonViewWillEnter(async () => {
  limparFormulario();

  if (!sessao.value) {
    router.replace('/login');
    return;
  }

  if (petId.value !== null) {
    const pet = await obterPetPorId(petId.value);
    if (!pet || pet.dono_tipo !== sessao.value.tipo || pet.dono_id !== sessao.value.id) {
      router.replace('/home');
      return;
    }
    etapa.value = 'form';
    nome.value = pet.nome;
    especie.value = pet.especie;
    situacao.value = pet.situacao ?? '';
    raca.value = pet.raca ?? '';
    idadeMeses.value = pet.idade_meses !== null ? String(pet.idade_meses) : '';
    porte.value = pet.porte ?? '';
    sexo.value = pet.sexo ?? '';
    castradoOpcao.value = pet.castrado ? 'sim' : 'nao';
    vacinado.value = !!pet.vacinado;
    cep.value = pet.cep ?? '';
    contato.value = pet.contato ?? '';
    descricao.value = pet.descricao ?? '';
    fotoUrl.value = pet.foto_url ?? '';
  }
});

const salvar = async () => {
  if (!sessao.value) {
    router.replace('/login');
    return;
  }

  erro.value = '';
  carregando.value = true;
  try {
    const dados: DadosPet = {
      nome: nome.value,
      especie: especie.value,
      raca: raca.value,
      idade_meses: idadeMeses.value !== '' ? Number(idadeMeses.value) : null,
      porte: porte.value,
      sexo: sexo.value,
      castrado: castradoOpcao.value === 'sim',
      vacinado: vacinado.value,
      cep: cep.value,
      situacao: situacao.value,
      contato: contato.value,
      descricao: descricao.value,
      foto_url: fotoUrl.value,
    };

    let idFinal = petId.value;
    if (modoEdicao.value && petId.value !== null) {
      await atualizarPet(petId.value, dados);
    } else {
      idFinal = await cadastrarPet({ tipo: sessao.value.tipo, id: sessao.value.id }, dados);
    }

    const toast = await toastController.create({
      message: modoEdicao.value ? 'Pet atualizado com sucesso!' : 'Pet cadastrado com sucesso!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();

    (document.activeElement as HTMLElement | null)?.blur();
    router.push(`/detalhes/${idFinal}`);
  } catch {
    erro.value = 'Não foi possível salvar o pet.';
  } finally {
    carregando.value = false;
  }
};
</script>

<style scoped>
.fundo-cadastro {
  --background: var(--petmatch-white);
}

.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.logo-cadastro {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icone {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icone ion-icon {
  font-size: 20px;
  color: var(--petmatch-slate-shade);
}

.logo-texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.logo-nome {
  font-size: 1.05rem;
  color: var(--petmatch-slate);
}

.logo-nome strong {
  color: var(--petmatch-slate-shade);
}

.logo-badge {
  align-self: flex-start;
  background: var(--petmatch-mint);
  color: var(--petmatch-slate-shade);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 999px;
}

.botao-fechar {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--petmatch-slate-shade);
  cursor: pointer;
  padding: 4px;
}

.barra-secao {
  background: var(--petmatch-slate-shade);
  color: var(--petmatch-white);
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 16px;
  margin-top: 4px;
}

.dropzone {
  margin: 20px 16px;
  border: 2px dashed var(--petmatch-mint);
  border-radius: 22px;
  background: rgba(181, 208, 205, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  cursor: pointer;
  min-height: 220px;
}

.input-arquivo-oculto {
  display: none;
}

.icone-dropzone {
  width: 84px;
  height: 84px;
  border-radius: 20px;
  background: var(--petmatch-slate-shade);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.icone-dropzone ion-icon {
  font-size: 38px;
  color: var(--petmatch-white);
}

.dropzone-titulo {
  margin: 0;
  font-weight: 700;
  color: var(--petmatch-slate-shade);
  font-size: 0.95rem;
}

.dropzone-sub {
  margin: 0;
  font-size: 0.75rem;
  color: var(--petmatch-slate-shade);
  opacity: 0.65;
}

.foto-preview {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 16px;
}

.erro-foto {
  color: var(--petmatch-red);
  font-size: 0.8rem;
  text-align: center;
  margin: -8px 16px 0;
}

.rodape-etapa {
  padding: 12px 16px 40px;
}

.card-form {
  margin: 8px 16px 40px;
  background: var(--petmatch-slate);
  border-radius: 22px;
  padding: 24px 20px;
}

.titulo-form {
  margin: 0 0 2px;
  color: var(--petmatch-white);
  font-size: 1.25rem;
  font-weight: 800;
}

.subtitulo-form {
  margin: 0 0 18px;
  color: var(--petmatch-mint);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.campo {
  margin-bottom: 14px;
}

.campo > label {
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

.input-com-icone input,
.input-com-icone select {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--petmatch-slate-shade);
  outline: none;
  min-width: 0;
  appearance: none;
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

textarea {
  width: 100%;
  background: var(--petmatch-mint);
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--petmatch-slate-shade);
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.opcoes-radio {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
}

.opcao-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--petmatch-white);
  font-size: 0.85rem;
  cursor: pointer;
}

.opcao-radio input[type='radio'] {
  accent-color: var(--petmatch-mint);
  width: 16px;
  height: 16px;
  margin: 0;
}

.erro-texto {
  color: var(--petmatch-red);
  font-size: 0.8rem;
  margin: 4px 2px 8px;
}

.botao-pill {
  --background: var(--petmatch-mint);
  --background-hover: var(--petmatch-mint);
  --color: var(--petmatch-slate-shade);
  --border-radius: 999px;
  font-weight: 700;
  margin: 8px 0 6px;
}

.link-simples {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: var(--petmatch-slate);
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
  padding: 6px 0;
  cursor: pointer;
}

.card-form .link-simples {
  color: var(--petmatch-mint);
}
</style>
