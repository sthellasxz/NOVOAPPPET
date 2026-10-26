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

        <div class="chips-rapidos">
          <span class="chip">{{ pet.especie }}</span>
          <span class="chip" v-if="pet.situacao">{{ pet.situacao }}</span>
          <span class="chip">{{ formatarIdade(pet.idade_meses) }}</span>
        </div>

        <div class="grade-info">
          <div class="info-item">
            <span class="info-label">Porte</span>
            <span class="info-valor">{{ pet.porte || 'Não informado' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Raça</span>
            <span class="info-valor">{{ pet.raca || 'Não informada' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Sexo</span>
            <span class="info-valor">{{ pet.sexo || 'Não informado' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Castrado</span>
            <span class="info-valor">{{ pet.castrado ? 'Sim' : 'Não' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Vacinado</span>
            <span class="info-valor">{{ pet.vacinado ? 'Sim' : 'Não' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">CEP</span>
            <span class="info-valor">{{ pet.cep || 'Não informado' }}</span>
          </div>
        </div>

        <div class="lista-contato">
          <button type="button" class="linha-contato" @click="ligarContato">
            <span class="icone-contato"><ion-icon :icon="callOutline"></ion-icon></span>
            <span class="linha-contato-texto">
              <strong>Contato</strong>
              <span>{{ pet.contato || 'Não informado' }}</span>
            </span>
            <ion-icon :icon="chevronForwardOutline" class="seta"></ion-icon>
          </button>
          <button type="button" class="linha-contato" @click="verPerfilAnunciante">
            <span class="icone-contato"><ion-icon :icon="personOutline"></ion-icon></span>
            <span class="linha-contato-texto">
              <strong>Anunciante</strong>
              <span>Ver perfil de quem cadastrou</span>
            </span>
            <ion-icon :icon="chevronForwardOutline" class="seta"></ion-icon>
          </button>
        </div>

        <div v-if="pet.descricao" class="bloco-descricao">
          <span class="info-label">Sobre {{ pet.nome }}</span>
          <p class="descricao">{{ pet.descricao }}</p>
        </div>

        <p class="data-cadastro">Anunciado em {{ formatarData(pet.criado_em) }}</p>

        <ion-button v-if="podeAdotar" expand="block" class="botao-adotar" @click="irParaConversa">
          <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
          Conversar com o anunciante
        </ion-button>

        <ion-button v-if="podeAdotar" expand="block" fill="outline" class="botao-contato" @click="demonstrarInteresse">
          <ion-icon :icon="callOutline" slot="start"></ion-icon>
          Ligar ou WhatsApp
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
  chatbubbleOutline,
  callOutline,
  personOutline,
  chevronForwardOutline,
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
  if (idadeMeses === null || idadeMeses === undefined) return 'Idade não informada'
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

const irParaConversa = () => {
  if (!sessao.value) {
    router.push('/login')
    return
  }
  if (!pet.value) return
  router.push(`/conversa/${pet.value.id}/${pet.value.dono_tipo}/${pet.value.dono_id}`)
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
  padding: 14px;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--petmatch-slate-shade);
}

.chips-rapidos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.chip {
  background: var(--petmatch-mint);
  color: var(--petmatch-slate-shade);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
}

.grade-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
}

.info-item {
  background: var(--petmatch-white);
  border: 1.5px solid #e3e8ea;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--petmatch-slate-shade);
  opacity: 0.7;
}

.info-valor {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--petmatch-black);
}

.lista-contato {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.linha-contato {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: var(--petmatch-white);
  border: 1.5px solid #e3e8ea;
  border-radius: 14px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
}

.icone-contato {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--petmatch-mint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icone-contato ion-icon {
  font-size: 18px;
  color: var(--petmatch-slate-shade);
}

.linha-contato-texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.linha-contato-texto strong {
  font-size: 0.85rem;
  color: var(--petmatch-slate-shade);
}

.linha-contato-texto span {
  font-size: 0.88rem;
  color: var(--petmatch-black);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seta {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--petmatch-slate);
  opacity: 0.6;
}

.bloco-descricao {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--petmatch-white);
  border: 1.5px solid #e3e8ea;
  border-radius: 14px;
  padding: 14px;
  margin-top: 16px;
}

.descricao {
  margin: 0;
  line-height: 1.5;
  white-space: pre-line;
  font-size: 0.92rem;
  color: var(--petmatch-black);
}

.data-cadastro {
  margin: 14px 0 20px;
  font-size: 0.78rem;
  color: var(--petmatch-slate-shade);
  opacity: 0.7;
}

.botao-adotar {
  --background: var(--petmatch-slate);
  --border-radius: 12px;
  margin-bottom: 12px;
}

.botao-contato {
  --color: var(--petmatch-slate);
  --border-color: var(--petmatch-slate);
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
