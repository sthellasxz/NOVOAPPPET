<template>
  <ion-page>
    <ion-header class="cabecalho">
      <ion-toolbar>
        <div class="logo" slot="start">
          <ion-icon :icon="pawOutline"></ion-icon>
          PetMatch
        </div>
        <ion-buttons slot="end">
          <ion-back-button default-href="/home" text="" class="botao-voltar"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content v-if="pet" class="fundo-detalhes">
      <!-- Card com foto -->
      <div class="foto-card">
        <img v-if="pet.foto_url" class="pet-foto" :src="pet.foto_url" :alt="pet.nome" />
        <div v-else class="pet-avatar">🐾</div>
      </div>

      <div class="conteudo">
        <div class="titulo-linha">
          <h1>{{ pet.nome }}</h1>
          <ion-badge :color="pet.adotado ? 'danger' : 'success'">
            {{ pet.adotado ? 'Adotado' : 'Disponível' }}
          </ion-badge>
        </div>
        <div class="divisor"></div>

        <div class="lista-detalhes">
          <p><strong>Espécie:</strong> {{ pet.especie }}</p>
          <p v-if="pet.situacao"><strong>Situação:</strong> {{ pet.situacao }}</p>
          <p><strong>Idade:</strong> {{ formatarIdade(pet.idade_meses) }}</p>
          <p><strong>Porte:</strong> {{ pet.porte || 'Não informado' }}</p>
          <p><strong>Raça:</strong> {{ pet.raca || 'Não informada' }}</p>
          <p><strong>Sexo:</strong> {{ pet.sexo || 'Não informado' }}</p>
          <p><strong>Castrado:</strong> {{ pet.castrado ? 'Sim' : 'Não' }}</p>
          <p><strong>Vacinado:</strong> {{ pet.vacinado ? 'Sim' : 'Não' }}</p>
          <p><strong>CEP:</strong> {{ pet.cep || 'Não informado' }}</p>
          <p class="clicavel" @click="ligarContato"><strong>Contato:</strong> {{ pet.contato || 'Não informado' }}</p>
          <p class="clicavel" @click="verPerfilAnunciante"><strong>Anunciante:</strong> ver perfil de quem cadastrou</p>
        </div>

        <div class="divisor" v-if="pet.descricao"></div>

        <div v-if="pet.descricao" class="lista-detalhes">
          <p class="descricao">{{ pet.descricao }}</p>
        </div>

        <p class="data-cadastro">Anunciado em {{ formatarData(pet.criado_em) }}</p>

        <ion-button v-if="podeAdotar" expand="block" class="botao-adotar" @click="demonstrarInteresse">
          <ion-icon :icon="heartOutline" slot="start"></ion-icon>
          Tenho interesse
        </ion-button>

        <div class="botoes-acao" v-if="souDono">
          <ion-button expand="block" class="botao-adotar" @click="alternarAdotado">
            <ion-icon :icon="pet.adotado ? refreshOutline : checkmarkCircleOutline" slot="start"></ion-icon>
            {{ pet.adotado ? 'Marcar como disponível' : 'Marcar como adotado' }}
          </ion-button>
          <ion-button expand="block" color="warning" @click="editarPet">
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            Editar Anúncio
          </ion-button>
          <ion-button expand="block" color="danger" fill="outline" @click="confirmarExclusao">
            <ion-icon :icon="trashOutline" slot="start"></ion-icon>
            Excluir Anúncio
          </ion-button>
        </div>
      </div>
    </ion-content>

    <!-- Loading/Carregando -->
    <ion-content v-else class="ion-padding">
      <div class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Carregando detalhes...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon, IonBadge,
  IonSpinner, alertController, toastController
} from '@ionic/vue'
import {
  pawOutline,
  heartOutline,
  createOutline,
  trashOutline,
  checkmarkCircleOutline,
  refreshOutline,
} from 'ionicons/icons'
import { obterPetPorId, definirAdotado, deletarPet, type Pet } from '@/services/pet'
import { usarSessao } from '@/services/session'

const route = useRoute()
const router = useRouter()
const sessao = usarSessao()

const pet = ref<Pet | null>(null)
const petId = Number(route.params.id)

const souDono = computed(() =>
  !!pet.value && !!sessao.value &&
  pet.value.dono_tipo === sessao.value.tipo &&
  pet.value.dono_id === sessao.value.id
)

const podeAdotar = computed(() => !!pet.value && !pet.value.adotado && !souDono.value)

onMounted(async () => {
  const petEncontrado = await obterPetPorId(petId)

  if (petEncontrado) {
    pet.value = petEncontrado
  } else {
    router.push('/home')
  }
})

const formatarIdade = (idadeMeses: number | null) => {
  if (idadeMeses === null || idadeMeses === undefined) return 'Não informada'
  if (idadeMeses < 12) {
    return `${idadeMeses} ${idadeMeses === 1 ? 'mês' : 'meses'}`
  }
  const anos = Math.floor(idadeMeses / 12)
  const meses = idadeMeses % 12
  if (meses === 0) {
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  }
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`
}

const formatarData = (data: string | undefined) => {
  if (!data) return 'data desconhecida'
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const ligarContato = () => {
  if (pet.value?.contato) {
    window.location.href = `tel:${pet.value.contato}`
  }
}

const demonstrarInteresse = async () => {
  if (!sessao.value) {
    router.push('/login')
    return
  }
  if (!pet.value) return

  const digitos = (pet.value.contato ?? '').replace(/\D/g, '')
  if (!digitos) {
    const toast = await toastController.create({
      message: 'O anunciante não informou um contato. Veja o perfil dele.',
      duration: 2500,
      color: 'medium',
    })
    await toast.present()
    return
  }

  const telefoneWhats = digitos.length <= 11 ? `55${digitos}` : digitos
  const mensagem = encodeURIComponent(`Olá! Vi o anúncio do ${pet.value.nome} no PetMatch e tenho interesse em adotar.`)

  const alert = await alertController.create({
    header: 'Falar com o anunciante',
    message: `Como você quer entrar em contato sobre o ${pet.value.nome}?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Ligar', handler: () => { window.location.href = `tel:${digitos}` } },
      { text: 'WhatsApp', handler: () => { window.open(`https://wa.me/${telefoneWhats}?text=${mensagem}`, '_blank') } },
    ]
  })
  await alert.present()
}

const alternarAdotado = async () => {
  if (!pet.value || !souDono.value) return
  const novoValor = !pet.value.adotado
  await definirAdotado(pet.value.id, novoValor)
  pet.value.adotado = novoValor ? 1 : 0
}

const confirmarExclusao = async () => {
  if (!pet.value) return

  const alert = await alertController.create({
    header: 'Excluir Anúncio',
    message: `Tem certeza que deseja excluir o anúncio do ${pet.value.nome}?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Excluir',
        role: 'destructive',
        handler: async () => {
          await deletarPet(pet.value!.id)
          router.push('/home')
        }
      }
    ]
  })
  await alert.present()
}

const editarPet = () => {
  router.push(`/cadastro-pet/${pet.value!.id}`)
}

const verPerfilAnunciante = () => {
  if (!pet.value) return
  router.push(`/perfil/${pet.value.dono_tipo}/${pet.value.dono_id}`)
}
</script>

<style scoped>
.cabecalho ion-toolbar {
  --background: var(--petmatch-white);
  --border-width: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--petmatch-slate);
}

.botao-voltar {
  --color: var(--petmatch-slate);
}

.fundo-detalhes {
  --background: var(--petmatch-white);
}

.foto-card {
  margin: 8px 16px 0;
  background: var(--petmatch-mint);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-foto {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 14px;
  display: block;
}

.pet-avatar {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
}

.conteudo {
  padding: 20px 20px 100px;
}

.titulo-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.titulo-linha h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--petmatch-slate-shade);
}

.divisor {
  height: 8px;
  border-radius: 999px;
  background: var(--petmatch-slate);
  margin: 12px 0 16px;
}

.lista-detalhes p {
  margin: 0 0 10px;
  font-size: 0.95rem;
  color: var(--petmatch-black);
}

.lista-detalhes p strong {
  color: var(--petmatch-slate-shade);
}

.clicavel {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--petmatch-mint);
}

.descricao {
  line-height: 1.5;
  white-space: pre-line;
}

.data-cadastro {
  margin: 12px 0 20px;
  font-size: 0.78rem;
  color: var(--petmatch-slate-shade);
  opacity: 0.7;
}

.botao-adotar {
  --background: var(--petmatch-slate);
  --border-radius: 12px;
  margin-bottom: 12px;
}

.botoes-acao {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}
</style>
