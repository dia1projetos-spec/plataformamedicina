// MedPlatform - Versão Completa com Idiomas e Notificações
import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Sistema de Idiomas
let currentLanguage = localStorage.getItem('language') || 'pt';

const translations = {
  pt: {
    // Login
    loginTitle: 'MedPlatform',
    loginSubtitle: 'Plataforma Educacional para Medicina',
    email: 'Email',
    password: 'Senha',
    enterButton: 'Entrar',
    testCredentials: 'Credenciais de teste:',
    
    // Header
    logout: 'Sair',
    
    // Admin Nav
    dashboard: 'Painel',
    users: 'Usuários',
    createArticle: 'Criar Artigo',
    notifications: 'Notificações',
    
    // Dashboard
    usersCount: 'Usuários',
    articlesCount: 'Artigos',
    recentArticles: 'Artigos Recentes',
    noContent: 'Nenhum artigo publicado ainda',
    
    // Users
    createUser: 'Cadastrar Novo Usuário',
    fullName: 'Nome Completo',
    registerButton: 'Cadastrar Usuário',
    admin: 'Admin',
    user: 'Usuário',
    
    // Articles
    createNewArticle: 'Criar Novo Artigo',
    title: 'Título',
    content: 'Conteúdo',
    coverImage: 'Imagem de Capa (opcional)',
    clickToSelect: 'Clique para selecionar uma imagem',
    maxSize: 'Máximo 1MB recomendado',
    publishArticle: 'Publicar Artigo',
    publishing: 'Publicando...',
    articlePlaceholder: 'Ex: Novas Diretrizes de Cardiologia 2025',
    contentPlaceholder: 'Escreva o conteúdo do artigo...',
    
    // Notifications
    sendNotification: 'Enviar Nova Notificação',
    notificationTitle: 'Título da Notificação',
    notificationMessage: 'Mensagem',
    selectRecipients: 'Selecionar Destinatários',
    selectAll: 'Selecionar Todos',
    sendButton: 'Enviar Notificação',
    sending: 'Enviando...',
    myNotifications: 'Minhas Notificações',
    noNotifications: 'Nenhuma notificação',
    markAsRead: 'Marcar como lida',
    unread: 'Não lida',
    read: 'Lida',
    
    // User Dashboard
    welcome: 'Bem-vindo',
    checkContent: 'Confira os últimos conteúdos publicados',
    recentArticlesUser: 'Artigos Recentes',
    by: 'Por',
    
    // Messages
    userCreated: 'Usuário criado com sucesso!',
    articlePublished: 'Artigo publicado com sucesso!',
    notificationSent: 'Notificação enviada com sucesso!',
    confirmDelete: 'Tem certeza que deseja excluir?',
    loginError: 'Erro ao fazer login:',
    createError: 'Erro ao criar:',
    
    // Days
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo'
  },
  es: {
    // Login
    loginTitle: 'MedPlatform',
    loginSubtitle: 'Plataforma Educativa para Medicina',
    email: 'Correo',
    password: 'Contraseña',
    enterButton: 'Ingresar',
    testCredentials: 'Credenciales de prueba:',
    
    // Header
    logout: 'Salir',
    
    // Admin Nav
    dashboard: 'Panel',
    users: 'Usuarios',
    createArticle: 'Crear Artículo',
    notifications: 'Notificaciones',
    
    // Dashboard
    usersCount: 'Usuarios',
    articlesCount: 'Artículos',
    recentArticles: 'Artículos Recientes',
    noContent: 'Ningún artículo publicado aún',
    
    // Users
    createUser: 'Registrar Nuevo Usuario',
    fullName: 'Nombre Completo',
    registerButton: 'Registrar Usuario',
    admin: 'Admin',
    user: 'Usuario',
    
    // Articles
    createNewArticle: 'Crear Nuevo Artículo',
    title: 'Título',
    content: 'Contenido',
    coverImage: 'Imagen de Portada (opcional)',
    clickToSelect: 'Haga clic para seleccionar una imagen',
    maxSize: 'Máximo 1MB recomendado',
    publishArticle: 'Publicar Artículo',
    publishing: 'Publicando...',
    articlePlaceholder: 'Ej: Nuevas Directrices de Cardiología 2025',
    contentPlaceholder: 'Escriba el contenido del artículo...',
    
    // Notifications
    sendNotification: 'Enviar Nueva Notificación',
    notificationTitle: 'Título de la Notificación',
    notificationMessage: 'Mensaje',
    selectRecipients: 'Seleccionar Destinatarios',
    selectAll: 'Seleccionar Todos',
    sendButton: 'Enviar Notificación',
    sending: 'Enviando...',
    myNotifications: 'Mis Notificaciones',
    noNotifications: 'Ninguna notificación',
    markAsRead: 'Marcar como leída',
    unread: 'No leída',
    read: 'Leída',
    
    // User Dashboard
    welcome: 'Bienvenido',
    checkContent: 'Consulte los últimos contenidos publicados',
    recentArticlesUser: 'Artículos Recientes',
    by: 'Por',
    
    // Messages
    userCreated: '¡Usuario creado con éxito!',
    articlePublished: '¡Artículo publicado con éxito!',
    notificationSent: '¡Notificación enviada con éxito!',
    confirmDelete: '¿Está seguro de que desea eliminar?',
    loginError: 'Error al iniciar sesión:',
    createError: 'Error al crear:',
    
    // Days
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  render();
}

// Estado da aplicação
let currentUser = null;
let currentView = 'login';
let articles = [];
let users = [];
let notifications = [];
let selectedRecipients = [];

// Formulários
let articleForm = { title: '', content: '', imageBase64: null };
let notificationForm = { title: '', message: '' };

// Relógio
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const clockElements = document.querySelectorAll('.digital-clock');
  clockElements.forEach(el => {
    el.textContent = `${hours}:${minutes}:${seconds}`;
  });
}

setInterval(updateClock, 1000);

// Função para renderizar a aplicação
function render() {
  const root = document.getElementById('root');
  root.innerHTML = getCurrentView();
  attachEventListeners();
  updateClock();
}

// Obter a view atual
function getCurrentView() {
  if (currentView === 'login') return getLoginView();
  if (currentView === 'admin-dashboard') return getAdminDashboard();
  if (currentView === 'admin-users') return getAdminUsers();
  if (currentView === 'admin-create-article') return getCreateArticle();
  if (currentView === 'admin-notifications') return getAdminNotifications();
  if (currentView === 'user-dashboard') return getUserDashboard();
  return '';
}

// VIEW: Login
function getLoginView() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <!-- Language Selector -->
      <div class="absolute top-6 right-6 language-selector">
        <button onclick="window.setLanguage('pt')" class="${currentLanguage === 'pt' ? 'active' : ''}">
          🇧🇷 PT
        </button>
        <button onclick="window.setLanguage('es')" class="${currentLanguage === 'es' ? 'active' : ''}">
          🇦🇷 ES
        </button>
      </div>
      
      <div class="glass rounded-3xl shadow-modern-lg p-12 w-full max-w-lg border-2 border-white/30 fade-in">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-28 h-28 gradient-primary rounded-3xl mb-6 shadow-modern">
            <span class="text-6xl">🏥</span>
          </div>
          <h1 class="text-5xl font-black text-gray-900 mb-3 tracking-tight">${t('loginTitle')}</h1>
          <p class="text-lg text-gray-600 font-medium">${t('loginSubtitle')}</p>
        </div>

        <form id="login-form" class="space-y-6">
          <div class="slide-in" style="animation-delay: 0.1s">
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">${t('email')}</label>
            <input
              type="email"
              id="login-email"
              class="w-full px-5 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div class="slide-in" style="animation-delay: 0.2s">
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">${t('password')}</label>
            <input
              type="password"
              id="login-password"
              class="w-full px-5 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-modern hover:shadow-modern-lg transform hover:-translate-y-1"
          >
            🔓 ${t('enterButton')}
          </button>
        </form>

        <div class="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-100">
          <p class="text-sm font-bold text-purple-800 mb-3">💡 ${t('testCredentials')}</p>
          <p class="text-sm text-gray-700 mb-1 font-mono">📧 admin@medplat.com</p>
          <p class="text-sm text-gray-700 font-mono">🔑 admin123</p>
        </div>
      </div>
    </div>
  `;
}

// COMPONENT: Header
function getHeader() {
  const unreadCount = notifications.filter(n => n.recipientId === currentUser?.id && !n.read).length;
  
  return `
    <header class="glass border-b-2 border-white/30 shadow-modern">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-md">
            <span class="text-3xl">🏥</span>
          </div>
          <h1 class="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MedPlatform</h1>
        </div>
        <div class="flex items-center gap-4">
          <!-- Relógio Digital -->
          <div class="digital-clock"></div>
          
          <!-- Language Selector -->
          <div class="language-selector">
            <button onclick="window.setLanguage('pt')" class="${currentLanguage === 'pt' ? 'active' : ''}">
              🇧🇷
            </button>
            <button onclick="window.setLanguage('es')" class="${currentLanguage === 'es' ? 'active' : ''}">
              🇦🇷
            </button>
          </div>
          
          ${currentUser?.role === 'user' ? `
            <button
              onclick="window.toggleUserNotifications()"
              class="relative p-3 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-md"
            >
              <span class="text-2xl">🔔</span>
              ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount}</span>` : ''}
            </button>
          ` : ''}
          
          <div class="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
            <span class="text-2xl">👤</span>
            <span class="text-gray-800 font-semibold">${currentUser?.name || 'Usuário'}</span>
          </div>
          <button
            id="logout-btn"
            class="flex items-center gap-2 px-5 py-3 gradient-danger text-white rounded-xl font-bold shadow-md hover:shadow-lg"
          >
            🚪 ${t('logout')}
          </button>
        </div>
      </div>
    </header>
  `;
}

// COMPONENT: Admin Nav
function getAdminNav(active) {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: t('dashboard'), view: 'admin-dashboard' },
    { id: 'users', icon: '👥', label: t('users'), view: 'admin-users' },
    { id: 'article', icon: '📝', label: t('createArticle'), view: 'admin-create-article' },
    { id: 'notifications', icon: '🔔', label: t('notifications'), view: 'admin-notifications' }
  ];

  return `
    <nav class="glass border-b-2 border-white/20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex gap-4">
          ${navItems.map(item => `
            <button
              class="nav-btn flex items-center gap-2 py-4 px-4 border-b-4 text-base transition-all ${
                active === item.id 
                  ? 'border-purple-600 text-purple-600 font-bold bg-purple-50/50' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 font-semibold hover:bg-gray-50/50'
              } rounded-t-lg"
              data-view="${item.view}"
            >
              <span class="text-xl">${item.icon}</span>
              ${item.label}
            </button>
          `).join('')}
        </div>
      </div>
    </nav>
  `;
}

// VIEW: Admin Dashboard
function getAdminDashboard() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      ${getHeader()}
      ${getAdminNav('dashboard')}
      
      <main class="max-w-7xl mx-auto px-6 py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div class="glass p-8 rounded-3xl shadow-modern border-l-8 border-purple-500 card-hover">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">${t('usersCount')}</p>
                <p class="text-6xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">${users.length}</p>
              </div>
              <div class="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-5xl">👥</span>
              </div>
            </div>
          </div>
          <div class="glass p-8 rounded-3xl shadow-modern border-l-8 border-green-500 card-hover">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">${t('articlesCount')}</p>
                <p class="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">${articles.length}</p>
              </div>
              <div class="w-20 h-20 gradient-success rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-5xl">📄</span>
              </div>
            </div>
          </div>
        </div>

        <div class="glass rounded-3xl shadow-modern p-8 border-2 border-white/30">
          <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">📋 ${t('recentArticles')}</h2>
          ${articles.length === 0 ? `
            <div class="text-center py-16">
              <span class="text-8xl block mb-4">📭</span>
              <p class="text-gray-500 text-xl font-semibold">${t('noContent')}</p>
            </div>
          ` : `
            <div class="space-y-4">
              ${articles.map(item => `
                <div class="flex items-center justify-between p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all card-interactive border-2 border-gray-100">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 gradient-success rounded-xl flex items-center justify-center">
                      <span class="text-3xl">📝</span>
                    </div>
                    <div>
                      <p class="font-bold text-xl text-gray-800">${item.title}</p>
                      <p class="text-sm text-gray-500 mt-1">${item.date || 'Recente'}</p>
                    </div>
                  </div>
                  <button
                    class="delete-content p-3 hover:bg-red-50 rounded-xl transition-all"
                    data-id="${item.id}"
                  >
                    <span class="text-red-600 hover:text-red-800 text-3xl">🗑️</span>
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </main>
    </div>
  `;
}

// VIEW: Admin Users (continuando no próximo bloco devido ao tamanho)

function getAdminUsers() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      ${getHeader()}
      ${getAdminNav('users')}
      
      <main class="max-w-7xl mx-auto px-6 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-purple-500">
            <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">➕ ${t('createUser')}</h2>
            <form id="create-user-form" class="space-y-5">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('fullName')}</label>
                <input
                  type="text"
                  id="new-user-name"
                  class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('email')}</label>
                <input
                  type="email"
                  id="new-user-email"
                  class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('password')}</label>
                <input
                  type="password"
                  id="new-user-password"
                  class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400"
                  required
                />
              </div>
              <button
                type="submit"
                class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg"
              >
                ✅ ${t('registerButton')}
              </button>
            </form>
          </div>

          <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-blue-500">
            <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">👥 ${t('users')} (${users.length})</h2>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              ${users.map(user => `
                <div class="flex items-center justify-between p-5 bg-white rounded-2xl shadow-md border-2 border-gray-100">
                  <div>
                    <p class="font-bold text-lg text-gray-800">${user.name}</p>
                    <p class="text-sm text-gray-600 font-mono mt-1">${user.email}</p>
                    <span class="badge mt-2 ${user.role === 'admin' ? 'gradient-primary text-white' : 'bg-blue-100 text-blue-700'}">
                      ${user.role === 'admin' ? '👑 ' + t('admin') : '👤 ' + t('user')}
                    </span>
                  </div>
                  ${user.role !== 'admin' ? `
                    <button class="delete-user p-3 hover:bg-red-50 rounded-xl transition-all" data-id="${user.id}">
                      <span class="text-red-600 hover:text-red-800 text-3xl">🗑️</span>
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

function getCreateArticle() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      ${getHeader()}
      ${getAdminNav('article')}
      
      <main class="max-w-4xl mx-auto px-6 py-10">
        <div class="glass rounded-3xl shadow-modern p-10 border-t-8 border-green-500">
          <h2 class="text-4xl font-black mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">📝 ${t('createNewArticle')}</h2>
          <form id="create-article-form" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('title')}</label>
              <input
                type="text"
                id="article-title"
                class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 text-lg"
                placeholder="${t('articlePlaceholder')}"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('content')}</label>
              <textarea
                id="article-content"
                class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 h-64"
                placeholder="${t('contentPlaceholder')}"
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('coverImage')}</label>
              <div class="border-4 border-dashed border-gray-300 bg-white rounded-2xl p-10 text-center hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  id="article-image"
                  class="hidden"
                />
                <label for="article-image" class="cursor-pointer">
                  <div id="article-image-preview">
                    <span class="text-7xl block mb-4">🖼️</span>
                    <p class="text-base text-gray-600 font-semibold">${t('clickToSelect')}</p>
                    <p class="text-xs text-gray-500 mt-2">${t('maxSize')}</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              id="submit-article"
              class="w-full gradient-success text-white py-5 rounded-xl font-bold text-xl shadow-md hover:shadow-lg"
            >
              ✅ ${t('publishArticle')}
            </button>
          </form>
        </div>
      </main>
    </div>
  `;
}

function getAdminNotifications() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      ${getHeader()}
      ${getAdminNav('notifications')}
      
      <main class="max-w-6xl mx-auto px-6 py-10">
        <div class="glass rounded-3xl shadow-modern p-10 border-t-8 border-purple-500">
          <h2 class="text-4xl font-black mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">📬 ${t('sendNotification')}</h2>
          <form id="create-notification-form" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('notificationTitle')}</label>
              <input
                type="text"
                id="notification-title"
                class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg"
                placeholder="Ex: Reunião importante"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('notificationMessage')}</label>
              <textarea
                id="notification-message"
                class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 h-32"
                placeholder="Escreva a mensagem..."
                required
              ></textarea>
            </div>

            <div>
              <div class="flex justify-between items-center mb-3">
                <label class="block text-sm font-bold text-gray-700 uppercase">${t('selectRecipients')}</label>
                <button
                  type="button"
                  id="select-all-recipients"
                  class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 transition-all"
                >
                  ✓ ${t('selectAll')}
                </button>
              </div>
              <div class="space-y-3 max-h-60 overflow-y-auto bg-white p-4 rounded-xl border-2 border-gray-200">
                ${users.filter(u => u.role !== 'admin').map(user => `
                  <label class="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      class="recipient-checkbox w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      value="${user.id}"
                    />
                    <div class="flex-1">
                      <p class="font-semibold text-gray-800">${user.name}</p>
                      <p class="text-sm text-gray-500">${user.email}</p>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <button
              type="submit"
              id="submit-notification"
              class="w-full gradient-primary text-white py-5 rounded-xl font-bold text-xl shadow-md hover:shadow-lg"
            >
              📤 ${t('sendButton')}
            </button>
          </form>
        </div>
      </main>
    </div>
  `;
}

function getUserDashboard() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      ${getHeader()}

      <main class="max-w-5xl mx-auto px-6 py-10">
        <div class="glass rounded-3xl shadow-modern p-10 mb-10 border-l-8 border-purple-500">
          <h2 class="text-4xl font-black mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">${t('welcome')}, ${currentUser?.name || 'Usuário'}! 👋</h2>
          <p class="text-xl text-gray-600 font-medium">${t('checkContent')}</p>
        </div>

        ${articles.length > 0 ? `
          <div class="mb-10">
            <h3 class="text-3xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              <span class="text-4xl">📄</span> ${t('recentArticlesUser')}
            </h3>
            <div class="space-y-8">
              ${articles.map(article => `
                <div class="glass rounded-3xl shadow-modern overflow-hidden border-2 border-white/30 card-hover">
                  ${article.imageBase64 ? `
                    <img src="${article.imageBase64}" alt="${article.title}" class="w-full h-80 object-cover" />
                  ` : ''}
                  <div class="p-10">
                    <h4 class="text-3xl font-black mb-3 text-gray-900">${article.title}</h4>
                    <div class="flex items-center gap-4 text-base text-gray-500 mb-6">
                      <span class="badge bg-purple-100 text-purple-700">${t('by')} ${article.author}</span>
                      <span>•</span>
                      <span>${article.date}</span>
                    </div>
                    <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">${article.content}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="glass rounded-3xl shadow-modern p-20 text-center">
            <span class="text-9xl block mb-6">👀</span>
            <p class="text-gray-600 text-2xl font-semibold">${t('noContent')}</p>
          </div>
        `}
      </main>
    </div>
  `;
}

// Event Listeners
function attachEventListeners() {
  window.setLanguage = setLanguage;
  window.toggleUserNotifications = toggleUserNotifications;
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentView = e.currentTarget.dataset.view;
      render();
    });
  });

  const createUserForm = document.getElementById('create-user-form');
  if (createUserForm) {
    createUserForm.addEventListener('submit', handleCreateUser);
  }

  const createArticleForm = document.getElementById('create-article-form');
  if (createArticleForm) {
    createArticleForm.addEventListener('submit', handleCreateArticle);
    
    const imageInput = document.getElementById('article-image');
    if (imageInput) {
      imageInput.addEventListener('change', handleArticleImagePreview);
    }
  }

  const createNotificationForm = document.getElementById('create-notification-form');
  if (createNotificationForm) {
    createNotificationForm.addEventListener('submit', handleCreateNotification);
    
    const selectAllBtn = document.getElementById('select-all-recipients');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.recipient-checkbox').forEach(cb => cb.checked = true);
      });
    }
  }

  document.querySelectorAll('.delete-content').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      handleDeleteArticle(id);
    });
  });

  document.querySelectorAll('.delete-user').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      handleDeleteUser(id);
    });
  });
  
  document.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      handleMarkAsRead(id);
    });
  });
}

// HANDLERS
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(t('loginError') + ' ' + error.message);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleCreateUser(e) {
  e.preventDefault();
  const name = document.getElementById('new-user-name').value;
  const email = document.getElementById('new-user-email').value;
  const password = document.getElementById('new-user-password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      name: name,
      email: email,
      role: 'user',
      createdAt: serverTimestamp()
    });

    alert(t('userCreated'));
    document.getElementById('create-user-form').reset();
    await loadUsers();
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
  }
}

async function handleCreateArticle(e) {
  e.preventDefault();
  const title = document.getElementById('article-title').value;
  const content = document.getElementById('article-content').value;
  const imageBase64 = articleForm.imageBase64;

  const submitBtn = document.getElementById('submit-article');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ ' + t('publishing');

  try {
    await addDoc(collection(db, 'articles'), {
      title,
      content,
      imageBase64: imageBase64 || null,
      author: currentUser.name,
      authorId: currentUser.uid,
      date: new Date().toLocaleDateString(currentLanguage === 'pt' ? 'pt-BR' : 'es-AR'),
      timestamp: serverTimestamp()
    });

    alert(t('articlePublished'));
    articleForm = { title: '', content: '', imageBase64: null };
    await loadArticles();
    currentView = 'admin-dashboard';
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '✅ ' + t('publishArticle');
  }
}

async function handleCreateNotification(e) {
  e.preventDefault();
  const title = document.getElementById('notification-title').value;
  const message = document.getElementById('notification-message').value;
  const recipients = Array.from(document.querySelectorAll('.recipient-checkbox:checked')).map(cb => cb.value);

  if (recipients.length === 0) {
    alert('Selecione pelo menos um destinatário');
    return;
  }

  const submitBtn = document.getElementById('submit-notification');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ ' + t('sending');

  try {
    for (const recipientId of recipients) {
      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        recipientId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        read: false,
        createdAt: serverTimestamp()
      });
    }

    alert(t('notificationSent'));
    document.getElementById('create-notification-form').reset();
    await loadNotifications();
    currentView = 'admin-dashboard';
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '📤 ' + t('sendButton');
  }
}

function handleArticleImagePreview(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 1048576) {
      alert('Imagem muito grande! Use uma imagem menor que 1MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      articleForm.imageBase64 = reader.result;
      const preview = document.getElementById('article-image-preview');
      preview.innerHTML = `<img src="${reader.result}" alt="Preview" class="max-h-80 mx-auto rounded-2xl shadow-lg" />`;
    };
    reader.readAsDataURL(file);
  }
}

async function handleDeleteArticle(id) {
  if (!confirm(t('confirmDelete'))) return;

  try {
    await deleteDoc(doc(db, 'articles', id));
    await loadArticles();
    render();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleDeleteUser(id) {
  if (!confirm(t('confirmDelete'))) return;

  try {
    await deleteDoc(doc(db, 'users', id));
    await loadUsers();
    render();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleMarkAsRead(notificationId) {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
    await loadNotifications();
    render();
  } catch (error) {
    console.error('Error marking as read:', error);
  }
}

function toggleUserNotifications() {
  const userNotifications = notifications.filter(n => n.recipientId === currentUser?.id);
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50';
  modal.innerHTML = `
    <div class="glass rounded-3xl shadow-modern-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">🔔 ${t('myNotifications')}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl hover:text-red-600 transition-all">×</button>
      </div>
      ${userNotifications.length === 0 ? `
        <div class="text-center py-12">
          <span class="text-7xl block mb-4">📭</span>
          <p class="text-gray-500 text-lg">${t('noNotifications')}</p>
        </div>
      ` : `
        <div class="space-y-4">
          ${userNotifications.map(notif => `
            <div class="p-5 rounded-2xl ${notif.read ? 'bg-gray-50' : 'bg-purple-50 border-2 border-purple-200'}">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-lg">${notif.title}</h4>
                ${!notif.read ? `<span class="badge gradient-danger text-white text-xs">${t('unread')}</span>` : ''}
              </div>
              <p class="text-gray-700 mb-3">${notif.message}</p>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">${t('by')} ${notif.senderName}</span>
                ${!notif.read ? `
                  <button class="mark-read-btn px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-all" data-id="${notif.id}">
                    ✓ ${t('markAsRead')}
                  </button>
                ` : `<span class="text-gray-400">${t('read')}</span>`}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      await handleMarkAsRead(e.currentTarget.dataset.id);
      modal.remove();
      render();
    });
  });
}

// LOAD DATA
async function loadUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

async function loadArticles() {
  try {
    const q = query(collection(db, 'articles'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    articles = [];
    querySnapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error('Error loading articles:', error);
  }
}

async function loadNotifications() {
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

// AUTH STATE OBSERVER
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let userData = null;
    
    usersSnapshot.forEach((doc) => {
      if (doc.data().uid === user.uid || doc.data().email === user.email) {
        userData = { id: doc.id, ...doc.data() };
      }
    });

    if (!userData) {
      const docRef = await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        name: user.email.split('@')[0],
        role: user.email === 'admin@medplat.com' ? 'admin' : 'user',
        createdAt: serverTimestamp()
      });
      userData = {
        id: docRef.id,
        uid: user.uid,
        email: user.email,
        name: user.email.split('@')[0],
        role: user.email === 'admin@medplat.com' ? 'admin' : 'user'
      };
    }

    currentUser = userData;
    await Promise.all([loadUsers(), loadArticles(), loadNotifications()]);
    currentView = userData.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';
    render();
  } else {
    currentUser = null;
    currentView = 'login';
    render();
  }
});

render();
