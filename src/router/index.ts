import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginpessoaPage from '@/views/LoginpessoaPage.vue';
import LoginongPage from '@/views/LoginongPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import CadastroPage from '@/views/CadastroPage.vue';
import CadastroPessoaPage from '@/views/CadastroPessoaPage.vue';
import CadastroOngPage from '@/views/CadastroOngPage.vue';
import DetalhesPage from '@/views/DetalhesPage.vue';
import CadastroPetPage from '@/views/CadastroPetPage.vue';
import PerfilPage from '@/views/PerfilPage.vue';
import FavoritosPage from '@/views/FavoritosPage.vue';
import SplashPage from '@/views/SplashPage.vue';
import ConversasPage from '@/views/ConversasPage.vue';
import ChatPage from '@/views/ChatPage.vue';
import RedefinirSenhaPessoaPage from '@/views/RedefinirSenhaPessoaPage.vue';
import RedefinirSenhaOngPage from '@/views/RedefinirSenhaOngPage.vue';
import { usarSessao } from '@/services/session';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Splash',
    component: SplashPage
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/loginpessoa',
    name: 'Loginpessoa',
    component: LoginpessoaPage
  },
  {
    path: '/loginong',
    name: 'Loginong',
    component: LoginongPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
   {
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroPage
  },
  {
    path: '/cadastropessoa',
    name: 'CadastroPessoa',
    component: CadastroPessoaPage
  },
  {
    path: '/cadastroong',
    name: 'CadastroOng',
    component: CadastroOngPage
  },
   {
    path: '/detalhes/:id',
    name: 'Detalhes',
    component: DetalhesPage
  },
  {
    path: '/cadastro-pet',
    name: 'CadastroPet',
    component: CadastroPetPage
  },
  {
    path: '/cadastro-pet/:id',
    name: 'EditarPet',
    component: CadastroPetPage
  },
  {
    path: '/perfil/:tipo/:id',
    name: 'Perfil',
    component: PerfilPage
  },
  {
    path: '/favoritos',
    name: 'Favoritos',
    component: FavoritosPage
  },
  {
    path: '/conversas',
    name: 'Conversas',
    component: ConversasPage
  },
  {
    path: '/conversa/:petId/:tipo/:id',
    name: 'Chat',
    component: ChatPage
  },
  {
    path: '/redefinirsenhapessoa',
    name: 'RedefinirSenhaPessoa',
    component: RedefinirSenhaPessoaPage
  },
  {
    path: '/redefinirsenhaong',
    name: 'RedefinirSenhaOng',
    component: RedefinirSenhaOngPage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

const ROTAS_PUBLICAS = [
  '/', '/login', '/loginpessoa', '/loginong', '/cadastro', '/cadastropessoa', '/cadastroong',
  '/redefinirsenhapessoa', '/redefinirsenhaong',
];

router.beforeEach((to) => {
  const sessao = usarSessao();
  if (!sessao.value && !ROTAS_PUBLICAS.includes(to.path)) {
    return '/login';
  }
});

export default router;