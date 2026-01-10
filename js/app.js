// MedPlatform V3 - Sistema Completo com Gerenciamento de Matérias
// Código otimizado e funcional - Todas as funcionalidades integradas

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Sistema de Idiomas
let currentLanguage = localStorage.getItem('language') || 'pt';
const t = (key) => (translations[currentLanguage] || translations.pt)[key] || key;
const setLanguage = (lang) => { currentLanguage = lang; localStorage.setItem('language', lang); render(); };

const translations = {
  pt: { loginTitle: 'MedPlatform', loginSubtitle: 'Plataforma Educacional para Medicina', email: 'Email', password: 'Senha', enterButton: 'Entrar', testCredentials: 'Credenciais de teste:', logout: 'Sair', dashboard: 'Painel', users: 'Usuários', createArticle: 'Criar Artigo', notifications: 'Notificações', subjects: 'Matérias', usersCount: 'Usuários', articlesCount: 'Artigos', subjectsCount: 'Matérias', recentArticles: 'Artigos Recentes', noContent: 'Nenhum artigo publicado ainda', createUser: 'Cadastrar Novo Usuário', fullName: 'Nome Completo', registerButton: 'Cadastrar Usuário', admin: 'Admin', user: 'Usuário', createNewArticle: 'Criar Novo Artigo', title: 'Título', content: 'Conteúdo', subject: 'Matéria', selectSubject: 'Selecione uma Matéria', coverImage: 'Imagem de Capa (opcional)', clickToSelect: 'Clique para selecionar uma imagem', maxSize: 'Máximo 1MB recomendado', publishArticle: 'Publicar Artigo', publishing: 'Publicando...', articlePlaceholder: 'Ex: Novas Diretrizes de Cardiologia 2025', contentPlaceholder: 'Escreva o conteúdo do artigo...', sendNotification: 'Enviar Nova Notificação', notificationTitle: 'Título da Notificação', notificationMessage: 'Mensagem', selectRecipients: 'Selecionar Destinatários', selectAll: 'Selecionar Todos', sendButton: 'Enviar Notificação', sending: 'Enviando...', myNotifications: 'Minhas Notificações', noNotifications: 'Nenhuma notificação', markAsRead: 'Marcar como lida', unread: 'Não lida', read: 'Lida', welcome: 'Bem-vindo', checkContent: 'Confira os últimos conteúdos publicados', recentArticlesUser: 'Artigos Recentes', by: 'Por', userCreated: 'Usuário criado com sucesso!', articlePublished: 'Artigo publicado com sucesso!', notificationSent: 'Notificação enviada com sucesso!', confirmDelete: 'Tem certeza que deseja excluir?', loginError: 'Erro ao fazer login:', createError: 'Erro ao criar:', manageSubjects: 'Gerenciar Matérias', createSubject: 'Criar Nova Matéria', subjectName: 'Nome da Matéria', subjectIcon: 'Ícone (emoji)', subjectColor: 'Cor', createSubjectButton: 'Criar Matéria', editSubject: 'Editar', deleteSubject: 'Excluir', subjectCreated: 'Matéria criada com sucesso!', subjectDeleted: 'Matéria excluída com sucesso!', managePermissions: 'Gerenciar Permissões', userPermissions: 'Permissões de', allowedSubjects: 'Matérias Permitidas', savePermissions: 'Salvar Permissões', permissionsSaved: 'Permissões salvas!', mySubjects: 'Minhas Matérias', noSubjects: 'Você não tem acesso a nenhuma matéria', allArticles: 'Todos', noArticlesInSubject: 'Nenhum artigo nesta matéria' },
  es: { loginTitle: 'MedPlatform', loginSubtitle: 'Plataforma Educativa para Medicina', email: 'Correo', password: 'Contraseña', enterButton: 'Ingresar', testCredentials: 'Credenciales de prueba:', logout: 'Salir', dashboard: 'Panel', users: 'Usuarios', createArticle: 'Crear Artículo', notifications: 'Notificaciones', subjects: 'Materias', usersCount: 'Usuarios', articlesCount: 'Artículos', subjectsCount: 'Materias', recentArticles: 'Artículos Recientes', noContent: 'Ningún artículo publicado', createUser: 'Registrar Nuevo Usuario', fullName: 'Nombre Completo', registerButton: 'Registrar Usuario', admin: 'Admin', user: 'Usuario', createNewArticle: 'Crear Nuevo Artículo', title: 'Título', content: 'Contenido', subject: 'Materia', selectSubject: 'Seleccione una Materia', coverImage: 'Imagen de Portada (opcional)', clickToSelect: 'Clic para seleccionar imagen', maxSize: 'Máximo 1MB recomendado', publishArticle: 'Publicar Artículo', publishing: 'Publicando...', articlePlaceholder: 'Ej: Nuevas Directrices Cardiología 2025', contentPlaceholder: 'Escriba el contenido...', sendNotification: 'Enviar Notificación', notificationTitle: 'Título de Notificación', notificationMessage: 'Mensaje', selectRecipients: 'Seleccionar Destinatarios', selectAll: 'Seleccionar Todos', sendButton: 'Enviar Notificación', sending: 'Enviando...', myNotifications: 'Mis Notificaciones', noNotifications: 'Sin notificaciones', markAsRead: 'Marcar leída', unread: 'No leída', read: 'Leída', welcome: 'Bienvenido', checkContent: 'Consulte los contenidos publicados', recentArticlesUser: 'Artículos Recientes', by: 'Por', userCreated: '¡Usuario creado!', articlePublished: '¡Artículo publicado!', notificationSent: '¡Notificación enviada!', confirmDelete: '¿Eliminar?', loginError: 'Error login:', createError: 'Error crear:', manageSubjects: 'Gestionar Materias', createSubject: 'Crear Materia', subjectName: 'Nombre Materia', subjectIcon: 'Ícono (emoji)', subjectColor: 'Color', createSubjectButton: 'Crear Materia', editSubject: 'Editar', deleteSubject: 'Eliminar', subjectCreated: '¡Materia creada!', subjectDeleted: '¡Materia eliminada!', managePermissions: 'Gestionar Permisos', userPermissions: 'Permisos de', allowedSubjects: 'Materias Permitidas', savePermissions: 'Guardar Permisos', permissionsSaved: '¡Permisos guardados!', mySubjects: 'Mis Materias', noSubjects: 'Sin acceso a materias', allArticles: 'Todos', noArticlesInSubject: 'Sin artículos en materia' }
};

// Estado Global
let currentUser = null, currentView = 'login', currentSubjectFilter = null;
let articles = [], users = [], notifications = [], subjects = [], permissions = [];
let articleForm = { title: '', content: '', imageBase64: null, subjectId: '' };
let subjectForm = { name: '', icon: '📚', color: '#667eea' };

// Relógio
setInterval(() => {
  const now = new Date(), h = String(now.getHours()).padStart(2,'0'), m = String(now.getMinutes()).padStart(2,'0'), s = String(now.getSeconds()).padStart(2,'0');
  document.querySelectorAll('.digital-clock').forEach(el => el.textContent = `${h}:${m}:${s}`);
}, 1000);

// Render
const render = () => { document.getElementById('root').innerHTML = getCurrentView(); attachEventListeners(); };
const getCurrentView = () => {
  if (currentView === 'login') return getLoginView();
  if (currentView === 'admin-dashboard') return getAdminDashboard();
  if (currentView === 'admin-users') return getAdminUsers();
  if (currentView === 'admin-create-article') return getCreateArticle();
  if (currentView === 'admin-notifications') return getAdminNotifications();
  if (currentView === 'admin-subjects') return getAdminSubjects();
  if (currentView === 'user-dashboard') return getUserDashboard();
  return '';
};

// Views
const getLoginView = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
    <div class="absolute top-6 right-6 language-selector">
      <button onclick="window.setLanguage('pt')" class="${currentLanguage==='pt'?'active':''}">🇧🇷 PT</button>
      <button onclick="window.setLanguage('es')" class="${currentLanguage==='es'?'active':''}">🇦🇷 ES</button>
    </div>
    <div class="glass rounded-3xl shadow-modern-lg p-12 w-full max-w-lg border-2 border-white/30">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-28 h-28 gradient-primary rounded-3xl mb-6 shadow-modern"><span class="text-6xl">🏥</span></div>
        <h1 class="text-5xl font-black text-gray-900 mb-3">${t('loginTitle')}</h1>
        <p class="text-lg text-gray-600 font-medium">${t('loginSubtitle')}</p>
      </div>
      <form id="login-form" class="space-y-6">
        <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('email')}</label>
          <input type="email" id="login-email" class="w-full px-5 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg" required /></div>
        <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('password')}</label>
          <input type="password" id="login-password" class="w-full px-5 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg" required /></div>
        <button type="submit" class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-modern">🔓 ${t('enterButton')}</button>
      </form>
      <div class="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-100">
        <p class="text-sm font-bold text-purple-800 mb-3">💡 ${t('testCredentials')}</p>
        <p class="text-sm text-gray-700 font-mono">📧 admin@medplat.com</p>
        <p class="text-sm text-gray-700 font-mono">🔑 admin123</p>
      </div>
    </div>
  </div>
`;

const getHeader = () => {
  const unreadCount = notifications.filter(n => n.recipientId === currentUser?.id && !n.read).length;
  return `
    <header class="glass border-b-2 border-white/30 shadow-modern">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-md"><span class="text-3xl">🏥</span></div>
          <h1 class="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MedPlatform</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="digital-clock"></div>
          <div class="language-selector">
            <button onclick="window.setLanguage('pt')" class="${currentLanguage==='pt'?'active':''}">🇧🇷</button>
            <button onclick="window.setLanguage('es')" class="${currentLanguage==='es'?'active':''}">🇦🇷</button>
          </div>
          ${currentUser?.role==='user'?`<button onclick="window.toggleUserNotifications()" class="relative p-3 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-md"><span class="text-2xl">🔔</span>${unreadCount>0?`<span class="notification-badge">${unreadCount}</span>`:''}</button>`:''}
          <div class="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
            <span class="text-2xl">👤</span><span class="text-gray-800 font-semibold">${currentUser?.name||'Usuário'}</span>
          </div>
          <button id="logout-btn" class="flex items-center gap-2 px-5 py-3 gradient-danger text-white rounded-xl font-bold shadow-md">🚪 ${t('logout')}</button>
        </div>
      </div>
    </header>
  `;
};

const getAdminNav = (active) => {
  const items = [
    {id:'dashboard', icon:'📊', label:t('dashboard'), view:'admin-dashboard'},
    {id:'users', icon:'👥', label:t('users'), view:'admin-users'},
    {id:'subjects', icon:'📚', label:t('subjects'), view:'admin-subjects'},
    {id:'article', icon:'📝', label:t('createArticle'), view:'admin-create-article'},
    {id:'notifications', icon:'🔔', label:t('notifications'), view:'admin-notifications'}
  ];
  return `<nav class="glass border-b-2 border-white/20"><div class="max-w-7xl mx-auto px-6"><div class="flex gap-4">${items.map(i=>`<button class="nav-btn flex items-center gap-2 py-4 px-4 border-b-4 text-base transition-all ${active===i.id?'border-purple-600 text-purple-600 font-bold bg-purple-50/50':'border-transparent text-gray-600 hover:text-gray-900 font-semibold hover:bg-gray-50/50'} rounded-t-lg" data-view="${i.view}"><span class="text-xl">${i.icon}</span>${i.label}</button>`).join('')}</div></div></nav>`;
};

const getAdminDashboard = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('dashboard')}
    <main class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div class="glass p-8 rounded-3xl shadow-modern border-l-8 border-purple-500 card-hover">
          <div class="flex items-center justify-between"><div><p class="text-gray-600 text-sm font-bold uppercase">${t('usersCount')}</p>
            <p class="text-6xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">${users.length}</p></div>
            <div class="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-lg"><span class="text-5xl">👥</span></div></div>
        </div>
        <div class="glass p-8 rounded-3xl shadow-modern border-l-8 border-green-500 card-hover">
          <div class="flex items-center justify-between"><div><p class="text-gray-600 text-sm font-bold uppercase">${t('articlesCount')}</p>
            <p class="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">${articles.length}</p></div>
            <div class="w-20 h-20 gradient-success rounded-2xl flex items-center justify-center shadow-lg"><span class="text-5xl">📄</span></div></div>
        </div>
        <div class="glass p-8 rounded-3xl shadow-modern border-l-8 border-blue-500 card-hover">
          <div class="flex items-center justify-between"><div><p class="text-gray-600 text-sm font-bold uppercase">${t('subjectsCount')}</p>
            <p class="text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">${subjects.length}</p></div>
            <div class="w-20 h-20 gradient-info rounded-2xl flex items-center justify-center shadow-lg"><span class="text-5xl">📚</span></div></div>
        </div>
      </div>
      <div class="glass rounded-3xl shadow-modern p-8 border-2 border-white/30">
        <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">📋 ${t('recentArticles')}</h2>
        ${articles.length===0?`<div class="text-center py-16"><span class="text-8xl block mb-4">📭</span><p class="text-gray-500 text-xl font-semibold">${t('noContent')}</p></div>`:`
        <div class="space-y-4">${articles.slice(0,5).map(a=>`
          <div class="flex items-center justify-between p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all card-interactive border-2 border-gray-100">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 gradient-success rounded-xl flex items-center justify-center"><span class="text-3xl">📝</span></div>
              <div><p class="font-bold text-xl text-gray-800">${a.title}</p><p class="text-sm text-gray-500 mt-1">${a.date}</p></div>
            </div>
            <button class="delete-content p-3 hover:bg-red-50 rounded-xl transition-all" data-id="${a.id}"><span class="text-red-600 text-3xl">🗑️</span></button>
          </div>`).join('')}</div>`}
      </div>
    </main>
  </div>
`;


const getAdminUsers = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('users')}
    <main class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-purple-500">
          <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">➕ ${t('createUser')}</h2>
          <form id="create-user-form" class="space-y-5">
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('fullName')}</label>
              <input type="text" id="new-user-name" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400" required /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('email')}</label>
              <input type="email" id="new-user-email" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400" required /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('password')}</label>
              <input type="password" id="new-user-password" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400" required /></div>
            <button type="submit" class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-md">✅ ${t('registerButton')}</button>
          </form>
        </div>
        <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-blue-500">
          <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">👥 ${t('users')} (${users.length})</h2>
          <div class="space-y-4 max-h-96 overflow-y-auto">${users.map(u=>`
            <div class="flex items-center justify-between p-5 bg-white rounded-2xl shadow-md border-2 border-gray-100">
              <div><p class="font-bold text-lg text-gray-800">${u.name}</p>
                <p class="text-sm text-gray-600 font-mono mt-1">${u.email}</p>
                <span class="badge mt-2 ${u.role==='admin'?'gradient-primary text-white':'bg-blue-100 text-blue-700'}">${u.role==='admin'?'👑 '+t('admin'):'👤 '+t('user')}</span>
                ${u.role!=='admin'?`<button class="manage-permissions-btn mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200" data-userid="${u.id}" data-username="${u.name}">⚙️ ${t('managePermissions')}</button>`:''}</div>
              ${u.role!=='admin'?`<button class="delete-user p-3 hover:bg-red-50 rounded-xl transition-all" data-id="${u.id}"><span class="text-red-600 text-3xl">🗑️</span></button>`:''}</div>
          `).join('')}</div>
        </div>
      </div>
    </main>
  </div>
`;

const getAdminSubjects = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('subjects')}
    <main class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-green-500">
          <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">➕ ${t('createSubject')}</h2>
          <form id="create-subject-form" class="space-y-5">
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subjectName')}</label>
              <input type="text" id="subject-name" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400" placeholder="Ex: Anatomia" required /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subjectIcon')}</label>
              <input type="text" id="subject-icon" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400" placeholder="🦴" maxlength="2" required /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subjectColor')}</label>
              <input type="color" id="subject-color" class="w-full h-12 bg-white border-2 border-gray-200 rounded-xl cursor-pointer" value="#667eea" /></div>
            <button type="submit" class="w-full gradient-success text-white py-4 rounded-xl font-bold text-lg shadow-md">✅ ${t('createSubjectButton')}</button>
          </form>
        </div>
        <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-blue-500">
          <h2 class="text-3xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">📚 ${t('subjects')} (${subjects.length})</h2>
          <div class="space-y-4 max-h-96 overflow-y-auto">${subjects.map(s=>`
            <div class="flex items-center justify-between p-5 bg-white rounded-2xl shadow-md border-2 border-gray-100" style="border-left: 8px solid ${s.color}">
              <div class="flex items-center gap-3">
                <span class="text-4xl">${s.icon}</span>
                <p class="font-bold text-lg text-gray-800">${s.name}</p>
              </div>
              <button class="delete-subject p-3 hover:bg-red-50 rounded-xl transition-all" data-id="${s.id}"><span class="text-red-600 text-3xl">🗑️</span></button>
            </div>
          `).join('')}</div>
        </div>
      </div>
    </main>
  </div>
`;

const getCreateArticle = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('article')}
    <main class="max-w-4xl mx-auto px-6 py-10">
      <div class="glass rounded-3xl shadow-modern p-10 border-t-8 border-green-500">
        <h2 class="text-4xl font-black mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">📝 ${t('createNewArticle')}</h2>
        <form id="create-article-form" class="space-y-6">
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('title')}</label>
            <input type="text" id="article-title" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 text-lg" placeholder="${t('articlePlaceholder')}" required /></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subject')}</label>
            <select id="article-subject" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 text-lg" required>
              <option value="">${t('selectSubject')}</option>
              ${subjects.map(s=>`<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
            </select></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('content')}</label>
            <textarea id="article-content" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 h-64" placeholder="${t('contentPlaceholder')}" required></textarea></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('coverImage')}</label>
            <div class="border-4 border-dashed border-gray-300 bg-white rounded-2xl p-10 text-center hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer">
              <input type="file" accept="image/*" id="article-image" class="hidden" />
              <label for="article-image" class="cursor-pointer"><div id="article-image-preview">
                <span class="text-7xl block mb-4">🖼️</span>
                <p class="text-base text-gray-600 font-semibold">${t('clickToSelect')}</p>
                <p class="text-xs text-gray-500 mt-2">${t('maxSize')}</p>
              </div></label>
            </div></div>
          <button type="submit" id="submit-article" class="w-full gradient-success text-white py-5 rounded-xl font-bold text-xl shadow-md">✅ ${t('publishArticle')}</button>
        </form>
      </div>
    </main>
  </div>
`;

const getAdminNotifications = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('notifications')}
    <main class="max-w-6xl mx-auto px-6 py-10">
      <div class="glass rounded-3xl shadow-modern p-10 border-t-8 border-purple-500">
        <h2 class="text-4xl font-black mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">📬 ${t('sendNotification')}</h2>
        <form id="create-notification-form" class="space-y-6">
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('notificationTitle')}</label>
            <input type="text" id="notification-title" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg" required /></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('notificationMessage')}</label>
            <textarea id="notification-message" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 h-32" required></textarea></div>
          <div><div class="flex justify-between items-center mb-3">
            <label class="block text-sm font-bold text-gray-700 uppercase">${t('selectRecipients')}</label>
            <button type="button" id="select-all-recipients" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200">✓ ${t('selectAll')}</button>
          </div>
          <div class="space-y-3 max-h-60 overflow-y-auto bg-white p-4 rounded-xl border-2 border-gray-200">${users.filter(u=>u.role!=='admin').map(u=>`
            <label class="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg cursor-pointer">
              <input type="checkbox" class="recipient-checkbox w-5 h-5 rounded border-gray-300 text-purple-600" value="${u.id}" />
              <div><p class="font-semibold text-gray-800">${u.name}</p><p class="text-sm text-gray-500">${u.email}</p></div>
            </label>
          `).join('')}</div></div>
          <button type="submit" id="submit-notification" class="w-full gradient-primary text-white py-5 rounded-xl font-bold text-xl shadow-md">📤 ${t('sendButton')}</button>
        </form>
      </div>
    </main>
  </div>
`;

const getUserDashboard = () => {
  const userSubjects = subjects.filter(s => permissions.some(p => p.subjectId === s.id && p.userId === currentUser.id && p.granted));
  const filteredArticles = currentSubjectFilter ? articles.filter(a => a.subjectId === currentSubjectFilter) : articles;
  
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}
      <main class="max-w-6xl mx-auto px-6 py-10">
        <div class="glass rounded-3xl shadow-modern p-10 mb-10 border-l-8 border-purple-500">
          <h2 class="text-4xl font-black mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">${t('welcome')}, ${currentUser?.name}! 👋</h2>
          <p class="text-xl text-gray-600 font-medium">${t('checkContent')}</p>
        </div>
        ${userSubjects.length>0?`
          <div class="glass rounded-2xl shadow-modern p-6 mb-8 border-2 border-white/30">
            <h3 class="text-xl font-black mb-4 text-gray-800">📚 ${t('mySubjects')}</h3>
            <div class="flex gap-3 flex-wrap">
              <button onclick="window.filterBySubject(null)" class="px-6 py-3 rounded-xl font-bold text-base transition-all ${!currentSubjectFilter?'gradient-primary text-white shadow-lg':'bg-white text-gray-700 hover:bg-gray-50'}">${t('allArticles')}</button>
              ${userSubjects.map(s=>`<button onclick="window.filterBySubject('${s.id}')" class="px-6 py-3 rounded-xl font-bold text-base transition-all ${currentSubjectFilter===s.id?'text-white shadow-lg':'bg-white text-gray-700 hover:bg-gray-50'}" style="${currentSubjectFilter===s.id?`background-color: ${s.color}`:''}">${s.icon} ${s.name}</button>`).join('')}
            </div>
          </div>
        `:`<div class="glass rounded-3xl shadow-modern p-20 text-center mb-10"><span class="text-9xl block mb-6">📚</span><p class="text-gray-600 text-2xl font-semibold">${t('noSubjects')}</p></div>`}
        ${filteredArticles.length>0?`
          <div class="mb-10">
            <h3 class="text-3xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              <span class="text-4xl">📄</span> ${currentSubjectFilter?subjects.find(s=>s.id===currentSubjectFilter)?.name:t('recentArticlesUser')}
            </h3>
            <div class="space-y-8">${filteredArticles.map(a=>{
              const subj = subjects.find(s=>s.id===a.subjectId);
              return `<div class="glass rounded-3xl shadow-modern overflow-hidden border-2 border-white/30 card-hover">
                ${a.imageBase64?`<img src="${a.imageBase64}" alt="${a.title}" class="w-full h-80 object-cover" />`:''}
                <div class="p-10">
                  <div class="flex items-center gap-2 mb-3">${subj?`<span class="badge text-white" style="background-color: ${subj.color}">${subj.icon} ${subj.name}</span>`:''}</div>
                  <h4 class="text-3xl font-black mb-3 text-gray-900">${a.title}</h4>
                  <div class="flex items-center gap-4 text-base text-gray-500 mb-6">
                    <span class="badge bg-purple-100 text-purple-700">${t('by')} ${a.author}</span>
                    <span>•</span><span>${a.date}</span>
                  </div>
                  <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">${a.content}</p>
                </div>
              </div>`;
            }).join('')}</div>
          </div>
        `:`<div class="glass rounded-3xl shadow-modern p-20 text-center"><span class="text-9xl block mb-6">👀</span><p class="text-gray-600 text-2xl font-semibold">${currentSubjectFilter?t('noArticlesInSubject'):t('noContent')}</p></div>`}
      </main>
    </div>
  `;
};


// Event Listeners
const attachEventListeners = () => {
  window.setLanguage = setLanguage;
  window.toggleUserNotifications = toggleUserNotifications;
  window.filterBySubject = filterBySubject;
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', e => { currentView = e.currentTarget.dataset.view; render(); }));
  
  const createUserForm = document.getElementById('create-user-form');
  if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);
  
  const createArticleForm = document.getElementById('create-article-form');
  if (createArticleForm) {
    createArticleForm.addEventListener('submit', handleCreateArticle);
    const imageInput = document.getElementById('article-image');
    if (imageInput) imageInput.addEventListener('change', handleArticleImagePreview);
  }
  
  const createNotificationForm = document.getElementById('create-notification-form');
  if (createNotificationForm) {
    createNotificationForm.addEventListener('submit', handleCreateNotification);
    const selectAllBtn = document.getElementById('select-all-recipients');
    if (selectAllBtn) selectAllBtn.addEventListener('click', () => document.querySelectorAll('.recipient-checkbox').forEach(cb => cb.checked = true));
  }
  
  const createSubjectForm = document.getElementById('create-subject-form');
  if (createSubjectForm) createSubjectForm.addEventListener('submit', handleCreateSubject);
  
  document.querySelectorAll('.delete-content').forEach(btn => btn.addEventListener('click', e => handleDeleteArticle(e.currentTarget.dataset.id)));
  document.querySelectorAll('.delete-user').forEach(btn => btn.addEventListener('click', e => handleDeleteUser(e.currentTarget.dataset.id)));
  document.querySelectorAll('.delete-subject').forEach(btn => btn.addEventListener('click', e => handleDeleteSubject(e.currentTarget.dataset.id)));
  document.querySelectorAll('.manage-permissions-btn').forEach(btn => btn.addEventListener('click', e => showPermissionsModal(e.currentTarget.dataset.userid, e.currentTarget.dataset.username)));
};

// Handlers
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
  } catch (error) {
    alert(t('loginError') + ' ' + error.message);
  }
};

const handleLogout = async () => {
  try { await signOut(auth); } catch (error) { alert('Error: ' + error.message); }
};

const handleCreateUser = async (e) => {
  e.preventDefault();
  const name = document.getElementById('new-user-name').value;
  const email = document.getElementById('new-user-email').value;
  const password = document.getElementById('new-user-password').value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, 'users'), { uid: userCredential.user.uid, name, email, role: 'user', createdAt: serverTimestamp() });
    alert(t('userCreated'));
    document.getElementById('create-user-form').reset();
    await loadUsers();
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
  }
};

const handleCreateArticle = async (e) => {
  e.preventDefault();
  const title = document.getElementById('article-title').value;
  const content = document.getElementById('article-content').value;
  const subjectId = document.getElementById('article-subject').value;
  const imageBase64 = articleForm.imageBase64;
  const submitBtn = document.getElementById('submit-article');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ ' + t('publishing');
  try {
    await addDoc(collection(db, 'articles'), {
      title, content, subjectId, imageBase64: imageBase64 || null,
      author: currentUser.name, authorId: currentUser.uid,
      date: new Date().toLocaleDateString(currentLanguage === 'pt' ? 'pt-BR' : 'es-AR'),
      timestamp: serverTimestamp()
    });
    alert(t('articlePublished'));
    articleForm = { title: '', content: '', imageBase64: null, subjectId: '' };
    await loadArticles();
    currentView = 'admin-dashboard';
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '✅ ' + t('publishArticle');
  }
};

const handleCreateNotification = async (e) => {
  e.preventDefault();
  const title = document.getElementById('notification-title').value;
  const message = document.getElementById('notification-message').value;
  const recipients = Array.from(document.querySelectorAll('.recipient-checkbox:checked')).map(cb => cb.value);
  if (recipients.length === 0) { alert('Selecione destinatários'); return; }
  const submitBtn = document.getElementById('submit-notification');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ ' + t('sending');
  try {
    for (const recipientId of recipients) {
      await addDoc(collection(db, 'notifications'), {
        title, message, recipientId, senderId: currentUser.id, senderName: currentUser.name, read: false, createdAt: serverTimestamp()
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
};

const handleCreateSubject = async (e) => {
  e.preventDefault();
  const name = document.getElementById('subject-name').value;
  const icon = document.getElementById('subject-icon').value;
  const color = document.getElementById('subject-color').value;
  try {
    await addDoc(collection(db, 'subjects'), { name, icon, color, createdAt: serverTimestamp() });
    alert(t('subjectCreated'));
    document.getElementById('create-subject-form').reset();
    await loadSubjects();
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
  }
};

const handleArticleImagePreview = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 1048576) { alert('Imagem muito grande! Máximo 1MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      articleForm.imageBase64 = reader.result;
      document.getElementById('article-image-preview').innerHTML = `<img src="${reader.result}" alt="Preview" class="max-h-80 mx-auto rounded-2xl shadow-lg" />`;
    };
    reader.readAsDataURL(file);
  }
};

const handleDeleteArticle = async (id) => {
  if (!confirm(t('confirmDelete'))) return;
  try { await deleteDoc(doc(db, 'articles', id)); await loadArticles(); render(); } catch (error) { alert('Error: ' + error.message); }
};

const handleDeleteUser = async (id) => {
  if (!confirm(t('confirmDelete'))) return;
  try { await deleteDoc(doc(db, 'users', id)); await loadUsers(); render(); } catch (error) { alert('Error: ' + error.message); }
};

const handleDeleteSubject = async (id) => {
  if (!confirm(t('confirmDelete'))) return;
  try { await deleteDoc(doc(db, 'subjects', id)); await loadSubjects(); render(); } catch (error) { alert('Error: ' + error.message); }
};

const handleMarkAsRead = async (notificationId) => {
  try { await updateDoc(doc(db, 'notifications', notificationId), { read: true }); await loadNotifications(); render(); } catch (error) { console.error(error); }
};

const filterBySubject = (subjectId) => {
  currentSubjectFilter = subjectId;
  render();
};

const toggleUserNotifications = () => {
  const userNotifications = notifications.filter(n => n.recipientId === currentUser?.id);
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50';
  modal.innerHTML = `
    <div class="glass rounded-3xl shadow-modern-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">🔔 ${t('myNotifications')}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl hover:text-red-600 transition-all">×</button>
      </div>
      ${userNotifications.length===0?`<div class="text-center py-12"><span class="text-7xl block mb-4">📭</span><p class="text-gray-500 text-lg">${t('noNotifications')}</p></div>`:`
      <div class="space-y-4">${userNotifications.map(n=>`
        <div class="p-5 rounded-2xl ${n.read?'bg-gray-50':'bg-purple-50 border-2 border-purple-200'}">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-lg">${n.title}</h4>
            ${!n.read?`<span class="badge gradient-danger text-white text-xs">${t('unread')}</span>`:''}
          </div>
          <p class="text-gray-700 mb-3">${n.message}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">${t('by')} ${n.senderName}</span>
            ${!n.read?`<button class="mark-read-btn px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200" data-id="${n.id}">✓ ${t('markAsRead')}</button>`:`<span class="text-gray-400">${t('read')}</span>`}
          </div>
        </div>
      `).join('')}</div>`}
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll('.mark-read-btn').forEach(btn => btn.addEventListener('click', async (e) => { await handleMarkAsRead(e.currentTarget.dataset.id); modal.remove(); render(); }));
};

const showPermissionsModal = (userId, userName) => {
  const userPerms = permissions.filter(p => p.userId === userId);
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50';
  modal.innerHTML = `
    <div class="glass rounded-3xl shadow-modern-lg p-8 max-w-2xl w-full">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">⚙️ ${t('userPermissions')}: ${userName}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl hover:text-red-600 transition-all">×</button>
      </div>
      <div class="space-y-3 mb-6">${subjects.map(s=>{
        const hasPermission = userPerms.some(p => p.subjectId === s.id && p.granted);
        return `<label class="flex items-center gap-3 p-4 hover:bg-purple-50 rounded-lg cursor-pointer bg-white border-2 border-gray-200">
          <input type="checkbox" class="permission-checkbox w-5 h-5 rounded border-gray-300 text-purple-600" data-subjectid="${s.id}" ${hasPermission?'checked':''} />
          <span class="text-2xl">${s.icon}</span>
          <span class="font-semibold text-gray-800">${s.name}</span>
        </label>`;
      }).join('')}</div>
      <button id="save-permissions-btn" data-userid="${userId}" class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-md">✅ ${t('savePermissions')}</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#save-permissions-btn').addEventListener('click', async (e) => {
    const userId = e.currentTarget.dataset.userid;
    const checkboxes = modal.querySelectorAll('.permission-checkbox');
    try {
      const existingPerms = await getDocs(query(collection(db, 'permissions'), where('userId', '==', userId)));
      for (const doc of existingPerms.docs) { await deleteDoc(doc.ref); }
      for (const cb of checkboxes) {
        if (cb.checked) {
          await addDoc(collection(db, 'permissions'), { userId, subjectId: cb.dataset.subjectid, granted: true, createdAt: serverTimestamp() });
        }
      }
      alert(t('permissionsSaved'));
      await loadPermissions();
      modal.remove();
      render();
    } catch (error) {
      alert(t('createError') + ' ' + error.message);
    }
  });
};

// Load Data
const loadUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users = [];
    querySnapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
  } catch (error) { console.error('Error loading users:', error); }
};

const loadArticles = async () => {
  try {
    const q = query(collection(db, 'articles'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    articles = [];
    querySnapshot.forEach((doc) => articles.push({ id: doc.id, ...doc.data() }));
  } catch (error) { console.error('Error loading articles:', error); }
};

const loadNotifications = async () => {
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    notifications = [];
    querySnapshot.forEach((doc) => notifications.push({ id: doc.id, ...doc.data() }));
  } catch (error) { console.error('Error loading notifications:', error); }
};

const loadSubjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'subjects'));
    subjects = [];
    querySnapshot.forEach((doc) => subjects.push({ id: doc.id, ...doc.data() }));
  } catch (error) { console.error('Error loading subjects:', error); }
};

const loadPermissions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'permissions'));
    permissions = [];
    querySnapshot.forEach((doc) => permissions.push({ id: doc.id, ...doc.data() }));
  } catch (error) { console.error('Error loading permissions:', error); }
};

// Auth State Observer
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
        uid: user.uid, email: user.email, name: user.email.split('@')[0],
        role: user.email === 'admin@medplat.com' ? 'admin' : 'user', createdAt: serverTimestamp()
      });
      userData = { id: docRef.id, uid: user.uid, email: user.email, name: user.email.split('@')[0], role: user.email === 'admin@medplat.com' ? 'admin' : 'user' };
    }
    currentUser = userData;
    await Promise.all([loadUsers(), loadArticles(), loadNotifications(), loadSubjects(), loadPermissions()]);
    currentView = userData.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';
    render();
  } else {
    currentUser = null;
    currentView = 'login';
    render();
  }
});

render();
