// MedFocus V4 - Versão Simplificada e Funcional
// Netflix Style + Feed Social + Todas as Features
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where, updateDoc, serverTimestamp, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configuração de Idiomas
let currentLanguage = localStorage.getItem('language') || 'pt';
const t = (key) => (translations[currentLanguage]||translations.pt)[key]||key;
const setLanguage = (lang) => { currentLanguage = lang; localStorage.setItem('language', lang); render(); };

const translations = {
  pt: {
    loginTitle:'MedFocus', loginSubtitle:'Plataforma Educacional', email:'Email', password:'Senha', enterButton:'Entrar',
    testCredentials:'Credenciais:', logout:'Sair', dashboard:'Painel', users:'Usuários', createArticle:'Criar Artigo',
    notifications:'Notificações', subjects:'Matérias', feed:'Feed', home:'Início', mySubjects:'Minhas Matérias',
    usersCount:'Usuários', articlesCount:'Artigos', subjectsCount:'Matérias', postsCount:'Posts',
    createUser:'Cadastrar Usuário', fullName:'Nome', registerButton:'Cadastrar', admin:'Admin', user:'Usuário',
    title:'Título', content:'Conteúdo', subject:'Matéria', selectSubject:'Selecione', publishArticle:'Publicar',
    publishing:'Publicando...', createSubject:'Criar Matéria', subjectName:'Nome', subjectIcon:'Ícone',
    subjectColor:'Cor', subjectDescription:'Descrição', createSubjectButton:'Criar', managePermissions:'Permissões',
    savePermissions:'Salvar', communityFeed:'Feed da Comunidade', whatThinking:'O que está pensando?',
    publish:'Publicar', like:'Curtir', delete:'Excluir', canPost:'Pode Postar', editContent:'Editar Conteúdo',
    saveContent:'Salvar', backToSubjects:'Voltar', articlesInSubject:'Artigos', viewSubject:'Ver Matéria',
    noContent:'Sem conteúdo', noPosts:'Sem posts', noSubjects:'Sem matérias', confirmDelete:'Excluir?'
  },
  es: {
    loginTitle:'MedFocus', loginSubtitle:'Plataforma Educativa', email:'Correo', password:'Contraseña', enterButton:'Ingresar',
    testCredentials:'Credenciales:', logout:'Salir', dashboard:'Panel', users:'Usuarios', createArticle:'Crear',
    notifications:'Notificaciones', subjects:'Materias', feed:'Feed', home:'Inicio', mySubjects:'Mis Materias',
    usersCount:'Usuarios', articlesCount:'Artículos', subjectsCount:'Materias', postsCount:'Posts',
    createUser:'Registrar', fullName:'Nombre', registerButton:'Registrar', admin:'Admin', user:'Usuario',
    title:'Título', content:'Contenido', subject:'Materia', selectSubject:'Seleccione', publishArticle:'Publicar',
    publishing:'Publicando...', createSubject:'Crear Materia', subjectName:'Nombre', subjectIcon:'Ícono',
    subjectColor:'Color', subjectDescription:'Descripción', createSubjectButton:'Crear', managePermissions:'Permisos',
    savePermissions:'Guardar', communityFeed:'Feed Comunidad', whatThinking:'¿Qué piensas?',
    publish:'Publicar', like:'Me gusta', delete:'Eliminar', canPost:'Puede Publicar', editContent:'Editar',
    saveContent:'Guardar', backToSubjects:'Volver', articlesInSubject:'Artículos', viewSubject:'Ver Materia',
    noContent:'Sin contenido', noPosts:'Sin posts', noSubjects:'Sin materias', confirmDelete:'¿Eliminar?'
  }
};

// Ícones disponíveis
const icons = ['🦴','❤️','🧬','💊','🧠','📚','⚗️','🔬','💉','🩺','🫀','🫁','👁️','🦷','💪','🧪','📖','✍️','🎓','💡','🔍','📊','📈','🏥','⚕️','🩹','🩸'];

// Estado Global
let currentUser=null, currentView='login', currentSubjectView=null, editingSubject=null;
let articles=[], users=[], notifications=[], subjects=[], permissions=[], posts=[], feedPermissions=[], payments=[], library=[], bookProgress=[];
let articleForm={title:'',content:'',imageBase64:null,subjectId:''};
let subjectForm={name:'',icon:'📚',color:'#667eea',description:''};

// Relógio
setInterval(() => {
  const now=new Date(), h=String(now.getHours()).padStart(2,'0'), m=String(now.getMinutes()).padStart(2,'0'), s=String(now.getSeconds()).padStart(2,'0');
  document.querySelectorAll('.digital-clock').forEach(el => el.textContent=`${h}:${m}:${s}`);
}, 1000);

// Render
const render = () => { document.getElementById('root').innerHTML = getCurrentView(); attachEventListeners(); };
const getCurrentView = () => {
  if(currentView==='login') return getLoginView();
  if(currentView==='admin-dashboard') return getAdminDashboard();
  if(currentView==='admin-users') return getAdminUsers();
  if(currentView==='admin-create-article') return getCreateArticle();
  if(currentView==='admin-notifications') return getAdminNotifications();
  if(currentView==='admin-subjects') return getAdminSubjects();
  if(currentView==='admin-feed') return getAdminFeed();
  if(currentView==='admin-payments') return getAdminPayments();
  if(currentView==='user-home') return getUserHome();
  if(currentView==='user-subjects') return getUserSubjectsNetflix();
  if(currentView==='user-subject-detail') return getUserSubjectDetail();
  if(currentView==='user-feed') return getUserFeed();
  if(currentView==='user-payments') return getUserPayments();
  if(currentView==='admin-library') return getAdminLibrary();
  if(currentView==='user-library') return getUserLibrary();
  if(currentView==='book-reader') return getBookReader();
  return '';
};

// VIEWS
const getLoginView = () => `
  <div class="login-container">
    <div class="absolute top-4 right-4 flex gap-2">
      <button onclick="window.setLanguage('pt')" class="language-btn ${currentLanguage==='pt'?'active':''}">🇧🇷 PT</button>
      <button onclick="window.setLanguage('es')" class="language-btn ${currentLanguage==='es'?'active':''}">🇦🇷 ES</button>
    </div>
    <div class="login-card fade-in">
      <div class="login-logo">
        <img src="images/logo.png" alt="MedFocus" />
      </div>
      <h1 class="login-title">MedFocus</h1>
      <p class="login-subtitle">Plataforma Educacional para Medicina</p>
      
      <form id="login-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="login-email" class="form-input" required placeholder="seu@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input type="password" id="login-password" class="form-input" required placeholder="••••••••" />
        </div>
        <button type="submit" class="btn-submit">🔓 Entrar</button>
      </form>
      
      <div class="test-credentials">
        <p class="credentials-title">💡 Credenciais de teste:</p>
        <p class="credentials-text">📧 admin@medplat.com</p>
        <p class="credentials-text">🔑 admin123</p>
      </div>
    </div>
  </div>
`;

const getHeader = () => {
  const unread = notifications.filter(n => n.recipientId === currentUser?.id && !n.read).length;
  return `
    <header>
      <div class="header-content">
        <div class="logo-section">
          <img src="images/logo.png" alt="MedFocus" class="logo-img" />
          <span class="logo-text">MedFocus</span>
        </div>
        <div class="header-actions">
          <div class="digital-clock"></div>
          <button onclick="window.setLanguage('pt')" class="language-btn ${currentLanguage==='pt'?'active':''}">🇧🇷</button>
          <button onclick="window.setLanguage('es')" class="language-btn ${currentLanguage==='es'?'active':''}">🇦🇷</button>
          ${currentUser?.role==='user'?`<button onclick="window.toggleNotifs()" class="relative" style="padding:0.5rem;background:white;border-radius:8px;min-height:36px;"><span style="font-size:1.2rem;">🔔</span>${unread>0?`<span class="notification-badge">${unread}</span>`:''}</button>`:''}
          <div class="user-badge"><span>👤</span><span>${currentUser?.name||''}</span></div>
          <button id="logout-btn" class="btn-logout">🚪</button>
        </div>
      </div>
    </header>
  `;
          <div class="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
            <span class="text-2xl">👤</span><span class="text-gray-800 font-semibold">${currentUser?.name}</span>
          </div>
          <button id="logout-btn" class="flex items-center gap-2 px-5 py-3 gradient-danger text-white rounded-xl font-bold shadow-md">🚪 ${t('logout')}</button>
        </div>
      </div>
    </header>
  `;
};

const getAdminNav = (active) => {
  const items = [
    {id:'dashboard',icon:'📊',label:'Painel',view:'admin-dashboard'},
    {id:'users',icon:'👥',label:'Usuários',view:'admin-users'},
    {id:'payments',icon:'💳',label:'Pagamentos',view:'admin-payments'},
    {id:'library',icon:'📚',label:'Biblioteca',view:'admin-library'},
    {id:'subjects',icon:'📖',label:'Matérias',view:'admin-subjects'},
    {id:'article',icon:'📝',label:'Artigo',view:'admin-create-article'},
    {id:'feed',icon:'💬',label:'Feed',view:'admin-feed'},
    {id:'notifications',icon:'🔔',label:'Notif',view:'admin-notifications'}
  ];
  return `<nav><div class="nav-container">${items.map(i=>`<button class="nav-btn ${active===i.id?'active':''}" data-view="${i.view}"><span>${i.icon}</span><span>${i.label}</span></button>`).join('')}</div></nav>`;
};

const getUserNav = (active) => {
  const items = [
    {id:'home',icon:'🏠',label:'Início',view:'user-home'},
    {id:'subjects',icon:'📖',label:'Matérias',view:'user-subjects'},
    {id:'feed',icon:'💬',label:'Feed',view:'user-feed'},
    {id:'library',icon:'📚',label:'Biblioteca',view:'user-library'},
    {id:'payments',icon:'💳',label:'Pagamentos',view:'user-payments'}
  ];
  return `<nav><div class="nav-container">${items.map(i=>`<button class="nav-btn ${active===i.id?'active':''}" data-view="${i.view}"><span>${i.icon}</span><span>${i.label}</span></button>`).join('')}</div></nav>`;
};

const getAdminDashboard = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('dashboard')}
    <main class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        ${[
          {label:t('usersCount'),value:users.length,color:'purple',icon:'👥'},
          {label:t('articlesCount'),value:articles.length,color:'green',icon:'📄'},
          {label:t('subjectsCount'),value:subjects.length,color:'blue',icon:'📚'},
          {label:t('postsCount'),value:posts.length,color:'pink',icon:'💬'}
        ].map(stat=>`
          <div class="glass p-8 rounded-3xl shadow-modern border-l-8 border-${stat.color}-500 card-hover">
            <div class="flex items-center justify-between">
              <div><p class="text-gray-600 text-sm font-bold uppercase">${stat.label}</p>
                <p class="text-6xl font-black bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-700 bg-clip-text text-transparent mt-2">${stat.value}</p></div>
              <div class="w-20 h-20 gradient-${stat.color==='purple'?'primary':stat.color==='green'?'success':stat.color==='blue'?'info':'danger'} rounded-2xl flex items-center justify-center shadow-lg"><span class="text-5xl">${stat.icon}</span></div>
            </div>
          </div>
        `).join('')}
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
              <input type="text" id="subject-name" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200" placeholder="Ex: Anatomia" required /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subjectIcon')}</label>
              <div class="icon-selector" id="icon-selector">${icons.map(ic=>`<div class="icon-option" data-icon="${ic}">${ic}</div>`).join('')}</div>
              <input type="hidden" id="subject-icon" value="📚" /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subjectColor')}</label>
              <input type="color" id="subject-color" class="w-full h-12 border-2 border-gray-200 rounded-xl cursor-pointer" value="#667eea" /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subjectDescription')}</label>
              <textarea id="subject-description" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 h-32" placeholder="Descrição da matéria..."></textarea></div>
            <button type="submit" class="w-full gradient-success text-white py-4 rounded-xl font-bold text-lg shadow-md">✅ ${t('createSubjectButton')}</button>
          </form>
        </div>
        <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-blue-500">
          <h2 class="text-3xl font-black mb-6">📚 ${t('subjects')} (${subjects.length})</h2>
          <div class="space-y-4 max-h-96 overflow-y-auto">${subjects.map(s=>`
            <div class="flex items-center justify-between p-5 bg-white rounded-2xl shadow-md border-2 border-gray-100" style="border-left: 8px solid ${s.color}">
              <div class="flex items-center gap-3">
                <span class="text-4xl">${s.icon}</span>
                <div><p class="font-bold text-lg">${s.name}</p>
                  ${s.description?`<p class="text-sm text-gray-600">${s.description.substring(0,50)}...</p>`:''}</div>
              </div>
              <div class="flex gap-2">
                <button class="edit-subject p-3 hover:bg-blue-50 rounded-xl" data-id="${s.id}"><span class="text-blue-600 text-2xl">✏️</span></button>
                <button class="delete-subject p-3 hover:bg-red-50 rounded-xl" data-id="${s.id}"><span class="text-red-600 text-2xl">🗑️</span></button>
              </div>
            </div>
          `).join('')}</div>
        </div>
      </div>
    </main>
  </div>
`;

const getAdminUsers = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('users')}
    <main class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-purple-500">
          <h2 class="text-3xl font-black mb-6">➕ ${t('createUser')}</h2>
          <form id="create-user-form" class="space-y-5">
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('fullName')}</label>
              <input type="text" id="new-user-name" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200" required /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('email')}</label>
              <input type="email" id="new-user-email" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200" required /></div>
            <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('password')}</label>
              <input type="password" id="new-user-password" class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200" required /></div>
            <button type="submit" class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-md">✅ ${t('registerButton')}</button>
          </form>
        </div>
        <div class="glass rounded-3xl shadow-modern p-8 border-t-8 border-blue-500">
          <h2 class="text-3xl font-black mb-6">👥 ${t('users')} (${users.length})</h2>
          <div class="space-y-4 max-h-96 overflow-y-auto">${users.map(u=>`
            <div class="flex items-center justify-between p-5 bg-white rounded-2xl shadow-md border-2 border-gray-100">
              <div><p class="font-bold text-lg">${u.name}</p>
                <p class="text-sm text-gray-600 font-mono mt-1">${u.email}</p>
                <span class="badge mt-2 ${u.role==='admin'?'gradient-primary text-white':'bg-blue-100 text-blue-700'}">${u.role==='admin'?'👑 '+t('admin'):'👤 '+t('user')}</span>
                ${u.role!=='admin'?`<button class="manage-perms mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200" data-id="${u.id}" data-name="${u.name}">⚙️ ${t('managePermissions')}</button>`:''}</div>
              ${u.role!=='admin'?`<button class="delete-user p-3 hover:bg-red-50 rounded-xl" data-id="${u.id}"><span class="text-red-600 text-3xl">🗑️</span></button>`:''}</div>
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
        <h2 class="text-4xl font-black mb-8">📝 ${t('createArticle')}</h2>
        <form id="create-article-form" class="space-y-6">
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('title')}</label>
            <input type="text" id="article-title" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 text-lg" required /></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('subject')}</label>
            <select id="article-subject" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 text-lg" required>
              <option value="">${t('selectSubject')}</option>
              ${subjects.map(s=>`<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
            </select></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">${t('content')}</label>
            <textarea id="article-content" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 h-64" required></textarea></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Imagem (opcional)</label>
            <div class="border-4 border-dashed border-gray-300 bg-white rounded-2xl p-10 text-center hover:border-green-400 cursor-pointer">
              <input type="file" accept="image/*" id="article-image" class="hidden" />
              <label for="article-image" class="cursor-pointer"><div id="article-image-preview">
                <span class="text-7xl block mb-4">🖼️</span>
                <p class="text-base text-gray-600 font-semibold">Clique para selecionar</p>
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
        <h2 class="text-4xl font-black mb-8">📬 Enviar Notificação</h2>
        <form id="create-notification-form" class="space-y-6">
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Título</label>
            <input type="text" id="notif-title" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 text-lg" required /></div>
          <div><label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Mensagem</label>
            <textarea id="notif-message" class="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 h-32" required></textarea></div>
          <div><div class="flex justify-between mb-3">
            <label class="block text-sm font-bold text-gray-700 uppercase">Destinatários</label>
            <button type="button" id="select-all-notif" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">✓ Todos</button>
          </div>
          <div class="space-y-3 max-h-60 overflow-y-auto bg-white p-4 rounded-xl border-2 border-gray-200">${users.filter(u=>u.role!=='admin').map(u=>`
            <label class="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg cursor-pointer">
              <input type="checkbox" class="notif-cb w-5 h-5 rounded text-purple-600" value="${u.id}" />
              <div><p class="font-semibold">${u.name}</p><p class="text-sm text-gray-500">${u.email}</p></div>
            </label>
          `).join('')}</div></div>
          <button type="submit" id="submit-notif" class="w-full gradient-primary text-white py-5 rounded-xl font-bold text-xl shadow-md">📤 Enviar</button>
        </form>
      </div>
    </main>
  </div>
`;


// PÁGINA NETFLIX DE MATÉRIAS - USUÁRIO
const getUserSubjectsNetflix = () => {
  const userSubjs = subjects.filter(s => permissions.some(p => p.subjectId === s.id && p.userId === currentUser.id && p.granted));
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getUserNav('subjects')}
      <main class="max-w-7xl mx-auto px-6 py-10">
        ${userSubjs.length>0?`
          <div class="netflix-container">
            <div class="netflix-row">
              <h2 class="text-white">📚 ${t('mySubjects')}</h2>
              <div class="netflix-cards">
                ${userSubjs.map(s=>`
                  <div class="subject-card-netflix" onclick="window.viewSubject('${s.id}')">
                    <div class="subject-card-content" style="background: linear-gradient(135deg, ${s.color} 0%, ${s.color}dd 100%)">
                      <div class="subject-card-icon">${s.icon}</div>
                      <div class="subject-card-name">${s.name}</div>
                    </div>
                    <div class="subject-card-overlay">
                      <p class="text-white text-sm">${s.description||t('noDescription')}</p>
                      <button class="mt-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100">${t('viewSubject')} →</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `:`
          <div class="glass rounded-3xl shadow-modern p-20 text-center">
            <span class="text-9xl block mb-6">📚</span>
            <p class="text-gray-600 text-2xl font-semibold">${t('noSubjects')}</p>
          </div>
        `}
      </main>
    </div>
  `;
};

// DETALHE DA MATÉRIA
const getUserSubjectDetail = () => {
  const subj = subjects.find(s => s.id === currentSubjectView);
  if(!subj) return getUserSubjectsNetflix();
  const subjArticles = articles.filter(a => a.subjectId === subj.id);
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getUserNav('subjects')}
      <main class="max-w-5xl mx-auto px-6 py-10">
        <button onclick="window.backToSubjects()" class="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
          <span class="text-xl">←</span> ${t('backToSubjects')}
        </button>
        <div class="glass rounded-3xl shadow-modern p-10 mb-8 border-l-8" style="border-color: ${subj.color}">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-7xl">${subj.icon}</span>
            <div><h1 class="text-5xl font-black text-gray-900">${subj.name}</h1></div>
          </div>
          ${subj.description?`<p class="text-lg text-gray-700 leading-relaxed mt-6">${subj.description}</p>`:''}</div>
        <div class="glass rounded-3xl shadow-modern p-10">
          <h2 class="text-3xl font-black mb-6">📄 ${t('articlesInSubject')}</h2>
          ${subjArticles.length>0?`
            <div class="space-y-6">${subjArticles.map(a=>`
              <div class="glass rounded-2xl shadow-md p-8 border-2 border-white/30">
                ${a.imageBase64?`<img src="${a.imageBase64}" class="w-full h-64 object-cover rounded-xl mb-4" />`:''}
                <h3 class="text-2xl font-black mb-2">${a.title}</h3>
                <div class="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span class="badge bg-purple-100 text-purple-700">${t('by')} ${a.author}</span>
                  <span>•</span><span>${a.date}</span>
                </div>
                <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${a.content}</p>
              </div>
            `).join('')}</div>
          `:`
            <div class="text-center py-12">
              <span class="text-7xl block mb-4">📭</span>
              <p class="text-gray-500 text-lg">${t('noContent')}</p>
            </div>
          `}
        </div>
      </main>
    </div>
  `;
};

// FEED SOCIAL
const getAdminFeed = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('feed')}
    <main class="max-w-4xl mx-auto px-6 py-10">
      <div class="feed-container">
        <div class="post-input-container">
          <textarea id="post-input" class="post-input" placeholder="${t('whatThinking')}" rows="3"></textarea>
          <div class="flex justify-end mt-3">
            <button id="publish-post" class="gradient-primary text-white px-6 py-3 rounded-xl font-bold shadow-md">📤 ${t('publish')}</button>
          </div>
        </div>
        <div class="mb-6 glass p-6 rounded-2xl">
          <h3 class="text-xl font-bold mb-4">⚙️ Permissões de Postagem</h3>
          <div class="space-y-2">${users.filter(u=>u.role!=='admin').map(u=>{
            const canPost = feedPermissions.some(fp => fp.userId === u.id && fp.canPost);
            return `
              <label class="flex items-center justify-between p-3 bg-white rounded-lg">
                <span class="font-semibold">${u.name}</span>
                <input type="checkbox" class="feed-perm-cb w-5 h-5 rounded text-purple-600" data-userid="${u.id}" ${canPost?'checked':''} />
              </label>
            `;
          }).join('')}</div>
        </div>
        ${posts.length>0?`<div class="space-y-4">${posts.map(p=>`
          <div class="feed-post">
            <div class="post-header">
              <div class="post-avatar">${p.userName.charAt(0).toUpperCase()}</div>
              <div class="post-user-info">
                <div class="post-username">${p.userName}</div>
                <div class="post-time">${formatTime(p.createdAt)}</div>
              </div>
            </div>
            <div class="post-content">${p.content}</div>
            <div class="post-actions">
              <button class="post-action-btn like-post ${p.likedBy?.includes(currentUser.id)?'liked':''}" data-id="${p.id}">
                <span>${p.likedBy?.includes(currentUser.id)?'❤️':'🤍'}</span> ${p.likes||0}
              </button>
              <button class="post-action-btn delete delete-post" data-id="${p.id}">
                <span>🗑️</span> ${t('delete')}
              </button>
            </div>
          </div>
        `).join('')}</div>`:`
          <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <div class="empty-state-text">${t('noPosts')}</div>
          </div>
        `}
      </div>
    </main>
  </div>
`;

const getUserFeed = () => {
  const canPost = feedPermissions.some(fp => fp.userId === currentUser.id && fp.canPost);
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getUserNav('feed')}
      <main class="max-w-4xl mx-auto px-6 py-10">
        <div class="feed-container">
          ${canPost?`
            <div class="post-input-container">
              <textarea id="post-input" class="post-input" placeholder="${t('whatThinking')}" rows="3"></textarea>
              <div class="flex justify-end mt-3">
                <button id="publish-post" class="gradient-primary text-white px-6 py-3 rounded-xl font-bold shadow-md">📤 ${t('publish')}</button>
              </div>
            </div>
          `:''}
          ${posts.length>0?`<div class="space-y-4">${posts.map(p=>`
            <div class="feed-post">
              <div class="post-header">
                <div class="post-avatar">${p.userName.charAt(0).toUpperCase()}</div>
                <div class="post-user-info">
                  <div class="post-username">${p.userName}</div>
                  <div class="post-time">${formatTime(p.createdAt)}</div>
                </div>
              </div>
              <div class="post-content">${p.content}</div>
              <div class="post-actions">
                <button class="post-action-btn like-post ${p.likedBy?.includes(currentUser.id)?'liked':''}" data-id="${p.id}">
                  <span>${p.likedBy?.includes(currentUser.id)?'❤️':'🤍'}</span> ${p.likes||0}
                </button>
              </div>
            </div>
          `).join('')}</div>`:`
            <div class="empty-state">
              <div class="empty-state-icon">💬</div>
              <div class="empty-state-text">${t('noPosts')}</div>
            </div>
          `}
        </div>
      </main>
    </div>
  `;
};

const getUserHome = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getUserNav('home')}
    <main class="max-w-5xl mx-auto px-6 py-10">
      <div class="glass rounded-3xl shadow-modern p-10 mb-10 border-l-8 border-purple-500">
        <h2 class="text-4xl font-black mb-3">${t('welcome')}, ${currentUser?.name}! 👋</h2>
        <p class="text-xl text-gray-600">${t('checkContent')}</p>
      </div>
      ${articles.length>0?`<div class="space-y-8">${articles.slice(0,5).map(a=>`
        <div class="glass rounded-3xl shadow-modern overflow-hidden">
          ${a.imageBase64?`<img src="${a.imageBase64}" class="w-full h-80 object-cover" />`:''}
          <div class="p-10">
            <h3 class="text-3xl font-black mb-3">${a.title}</h3>
            <div class="flex items-center gap-4 text-base text-gray-500 mb-6">
              <span class="badge bg-purple-100 text-purple-700">${t('by')} ${a.author}</span>
              <span>•</span><span>${a.date}</span>
            </div>
            <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">${a.content}</p>
          </div>
        </div>
      `).join('')}</div>`:`
        <div class="glass rounded-3xl shadow-modern p-20 text-center">
          <span class="text-9xl block mb-6">👀</span>
          <p class="text-gray-600 text-2xl font-semibold">${t('noContent')}</p>
        </div>
      `}
    </main>
  </div>
`;

// Helper
const formatTime = (timestamp) => {
  if(!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((new Date() - date) / 1000);
  if(diff < 60) return 'agora';
  if(diff < 3600) return `${Math.floor(diff/60)} min`;
  if(diff < 86400) return `${Math.floor(diff/3600)} h`;
  return `${Math.floor(diff/86400)} d`;
};


// EVENT LISTENERS
const attachEventListeners = () => {
  window.setLanguage = setLanguage;
  window.toggleNotifs = toggleNotifs;
  window.viewSubject = viewSubject;
  window.backToSubjects = backToSubjects;
  
  const loginForm = document.getElementById('login-form');
  if(loginForm) loginForm.addEventListener('submit', handleLogin);
  
  const logoutBtn = document.getElementById('logout-btn');
  if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', e => {
    currentView = e.currentTarget.dataset.view;
    currentSubjectView = null;
    render();
  }));
  
  const createUserForm = document.getElementById('create-user-form');
  if(createUserForm) createUserForm.addEventListener('submit', handleCreateUser);
  
  const createArticleForm = document.getElementById('create-article-form');
  if(createArticleForm) {
    createArticleForm.addEventListener('submit', handleCreateArticle);
    const img = document.getElementById('article-image');
    if(img) img.addEventListener('change', e => {
      const file = e.target.files[0];
      if(file) {
        if(file.size > 1048576) { alert('Máximo 1MB'); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
          articleForm.imageBase64 = reader.result;
          document.getElementById('article-image-preview').innerHTML = `<img src="${reader.result}" class="max-h-80 mx-auto rounded-2xl shadow-lg" />`;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  const createSubjectForm = document.getElementById('create-subject-form');
  if(createSubjectForm) createSubjectForm.addEventListener('submit', handleCreateSubject);
  
  const iconSelector = document.getElementById('icon-selector');
  if(iconSelector) {
    iconSelector.querySelectorAll('.icon-option').forEach(opt => {
      opt.addEventListener('click', e => {
        iconSelector.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        document.getElementById('subject-icon').value = e.currentTarget.dataset.icon;
        subjectForm.icon = e.currentTarget.dataset.icon;
      });
    });
  }
  
  const createNotifForm = document.getElementById('create-notification-form');
  if(createNotifForm) {
    createNotifForm.addEventListener('submit', handleCreateNotification);
    const selectAll = document.getElementById('select-all-notif');
    if(selectAll) selectAll.addEventListener('click', () => document.querySelectorAll('.notif-cb').forEach(cb => cb.checked = true));
  }
  
  document.querySelectorAll('.delete-content').forEach(btn => btn.addEventListener('click', e => handleDeleteArticle(e.currentTarget.dataset.id)));
  document.querySelectorAll('.delete-user').forEach(btn => btn.addEventListener('click', e => handleDeleteUser(e.currentTarget.dataset.id)));
  document.querySelectorAll('.delete-subject').forEach(btn => btn.addEventListener('click', e => handleDeleteSubject(e.currentTarget.dataset.id)));
  document.querySelectorAll('.edit-subject').forEach(btn => btn.addEventListener('click', e => handleEditSubject(e.currentTarget.dataset.id)));
  document.querySelectorAll('.manage-perms').forEach(btn => btn.addEventListener('click', e => showPermsModal(e.currentTarget.dataset.id, e.currentTarget.dataset.name)));
  
  const publishPost = document.getElementById('publish-post');
  if(publishPost) publishPost.addEventListener('click', handlePublishPost);
  
  document.querySelectorAll('.like-post').forEach(btn => btn.addEventListener('click', e => handleLikePost(e.currentTarget.dataset.id)));
  document.querySelectorAll('.delete-post').forEach(btn => btn.addEventListener('click', e => handleDeletePost(e.currentTarget.dataset.id)));
  
  document.querySelectorAll('.feed-perm-cb').forEach(cb => cb.addEventListener('change', e => handleFeedPermChange(e.currentTarget.dataset.userid, e.currentTarget.checked)));
  
  // Payment event listeners
  document.querySelectorAll('.set-payment-btn').forEach(btn => btn.addEventListener('click', e => window.showSetPaymentModal(e.currentTarget.dataset.userid, e.currentTarget.dataset.username)));
  document.querySelectorAll('.register-payment-btn').forEach(btn => btn.addEventListener('click', e => window.registerPayment(e.currentTarget.dataset.userid)));
  document.querySelectorAll('.mark-unpaid-btn').forEach(btn => btn.addEventListener('click', e => window.markUnpaid(e.currentTarget.dataset.userid)));
  document.querySelectorAll('.delete-payment-btn').forEach(btn => btn.addEventListener('click', e => window.deletePayment(e.currentTarget.dataset.userid)));
  
  // PIX config listeners
  const savePixBtn = document.getElementById('save-pix-config');
  if(savePixBtn) savePixBtn.addEventListener('click', handleSavePixConfig);
  
  const pixQrUpload = document.getElementById('pix-qr-upload');
  if(pixQrUpload) pixQrUpload.addEventListener('change', handlePixQrUpload);
  
  // Library listeners
  const addBookForm = document.getElementById('add-book-form');
  if(addBookForm) addBookForm.addEventListener('submit', handleAddBook);
  
  document.querySelectorAll('.delete-book-btn').forEach(btn => btn.addEventListener('click', e => handleDeleteBook(e.currentTarget.dataset.id)));
  document.querySelectorAll('.card-netflix[data-bookid]').forEach(card => card.addEventListener('click', e => window.openBook(e.currentTarget.dataset.bookid)));
};

// HANDLERS
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
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, 'users'), { uid: cred.user.uid, name, email, role: 'user', createdAt: serverTimestamp() });
    alert('Usuário criado!');
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
  const btn = document.getElementById('submit-article');
  btn.disabled = true;
  btn.textContent = '⏳ ' + t('publishing');
  try {
    await addDoc(collection(db, 'articles'), {
      title, content, subjectId, imageBase64: articleForm.imageBase64 || null,
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
    btn.disabled = false;
    btn.textContent = '✅ ' + t('publishArticle');
  }
};

const handleCreateSubject = async (e) => {
  e.preventDefault();
  const name = document.getElementById('subject-name').value;
  const icon = document.getElementById('subject-icon').value;
  const color = document.getElementById('subject-color').value;
  const description = document.getElementById('subject-description').value;
  try {
    await addDoc(collection(db, 'subjects'), { name, icon, color, description, createdAt: serverTimestamp() });
    alert('Matéria criada!');
    document.getElementById('create-subject-form').reset();
    subjectForm = { name: '', icon: '📚', color: '#667eea', description: '' };
    await loadSubjects();
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
  }
};

const handleCreateNotification = async (e) => {
  e.preventDefault();
  const title = document.getElementById('notif-title').value;
  const message = document.getElementById('notif-message').value;
  const recipients = Array.from(document.querySelectorAll('.notif-cb:checked')).map(cb => cb.value);
  if(recipients.length === 0) { alert('Selecione destinatários'); return; }
  const btn = document.getElementById('submit-notif');
  btn.disabled = true;
  btn.textContent = '⏳ Enviando...';
  try {
    for(const recipientId of recipients) {
      await addDoc(collection(db, 'notifications'), {
        title, message, recipientId, senderId: currentUser.id, senderName: currentUser.name, read: false, createdAt: serverTimestamp()
      });
    }
    alert('Notificação enviada!');
    document.getElementById('create-notification-form').reset();
    await loadNotifications();
    currentView = 'admin-dashboard';
    render();
  } catch (error) {
    alert(t('createError') + ' ' + error.message);
    btn.disabled = false;
    btn.textContent = '📤 Enviar';
  }
};

const handleDeleteArticle = async (id) => {
  if(!confirm(t('confirmDelete'))) return;
  try { await deleteDoc(doc(db, 'articles', id)); await loadArticles(); render(); } catch (error) { alert('Error: ' + error.message); }
};

const handleDeleteUser = async (id) => {
  if(!confirm(t('confirmDelete'))) return;
  try { await deleteDoc(doc(db, 'users', id)); await loadUsers(); render(); } catch (error) { alert('Error: ' + error.message); }
};

const handleDeleteSubject = async (id) => {
  if(!confirm(t('confirmDelete'))) return;
  try { await deleteDoc(doc(db, 'subjects', id)); await loadSubjects(); render(); } catch (error) { alert('Error: ' + error.message); }
};

const handleEditSubject = async (id) => {
  const subj = subjects.find(s => s.id === id);
  if(!subj) return;
  const newDesc = prompt('Nova descrição:', subj.description || '');
  if(newDesc !== null) {
    try {
      await updateDoc(doc(db, 'subjects', id), { description: newDesc });
      await loadSubjects();
      render();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }
};

const handlePublishPost = async () => {
  const input = document.getElementById('post-input');
  const content = input.value.trim();
  if(!content) return;
  try {
    await addDoc(collection(db, 'posts'), {
      content, userId: currentUser.id, userName: currentUser.name,
      likes: 0, likedBy: [], createdAt: serverTimestamp()
    });
    input.value = '';
    await loadPosts();
    render();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

const handleLikePost = async (id) => {
  const post = posts.find(p => p.id === id);
  if(!post) return;
  try {
    const likedBy = post.likedBy || [];
    const hasLiked = likedBy.includes(currentUser.id);
    if(hasLiked) {
      await updateDoc(doc(db, 'posts', id), {
        likes: increment(-1),
        likedBy: likedBy.filter(uid => uid !== currentUser.id)
      });
    } else {
      await updateDoc(doc(db, 'posts', id), {
        likes: increment(1),
        likedBy: [...likedBy, currentUser.id]
      });
    }
    await loadPosts();
    render();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

const handleDeletePost = async (id) => {
  if(!confirm(t('confirmDelete'))) return;
  try { await deleteDoc(doc(db, 'posts', id)); await loadPosts(); render(); } catch (error) { alert('Error: ' + error.message); }
};

const handleFeedPermChange = async (userId, canPost) => {
  try {
    const existing = await getDocs(query(collection(db, 'feedPermissions'), where('userId', '==', userId)));
    if(!existing.empty) {
      await updateDoc(existing.docs[0].ref, { canPost });
    } else {
      await addDoc(collection(db, 'feedPermissions'), { userId, canPost });
    }
    await loadFeedPermissions();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

const viewSubject = (id) => {
  currentSubjectView = id;
  currentView = 'user-subject-detail';
  render();
};

const backToSubjects = () => {
  currentSubjectView = null;
  currentView = 'user-subjects';
  render();
};

const toggleNotifs = () => {
  const userNotifs = notifications.filter(n => n.recipientId === currentUser?.id);
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50';
  modal.innerHTML = `
    <div class="glass rounded-3xl shadow-modern-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">🔔 ${t('myNotifications')}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl hover:text-red-600">×</button>
      </div>
      ${userNotifs.length===0?`<div class="text-center py-12"><span class="text-7xl block mb-4">📭</span><p class="text-gray-500 text-lg">Sem notificações</p></div>`:`
      <div class="space-y-4">${userNotifs.map(n=>`
        <div class="p-5 rounded-2xl ${n.read?'bg-gray-50':'bg-purple-50 border-2 border-purple-200'}">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-lg">${n.title}</h4>
            ${!n.read?`<span class="badge gradient-danger text-white text-xs">${t('unread')}</span>`:''}
          </div>
          <p class="text-gray-700 mb-3">${n.message}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">${t('by')} ${n.senderName}</span>
            ${!n.read?`<button class="mark-read px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200" data-id="${n.id}">✓ ${t('markAsRead')}</button>`:` <span class="text-gray-400">${t('read')}</span>`}
          </div>
        </div>
      `).join('')}</div>`}
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll('.mark-read').forEach(btn => btn.addEventListener('click', async (e) => {
    try {
      await updateDoc(doc(db, 'notifications', e.currentTarget.dataset.id), { read: true });
      await loadNotifications();
      modal.remove();
      render();
    } catch (error) {
      console.error(error);
    }
  }));
};

const showPermsModal = (userId, userName) => {
  const userPerms = permissions.filter(p => p.userId === userId);
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50';
  modal.innerHTML = `
    <div class="glass rounded-3xl shadow-modern-lg p-8 max-w-2xl w-full">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-3xl font-black">⚙️ ${t('userPermissions')}: ${userName}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl hover:text-red-600">×</button>
      </div>
      <div class="space-y-3 mb-6">${subjects.map(s=>{
        const hasPerm = userPerms.some(p => p.subjectId === s.id && p.granted);
        return `<label class="flex items-center gap-3 p-4 hover:bg-purple-50 rounded-lg cursor-pointer bg-white border-2 border-gray-200">
          <input type="checkbox" class="perm-cb w-5 h-5 rounded text-purple-600" data-subjectid="${s.id}" ${hasPerm?'checked':''} />
          <span class="text-2xl">${s.icon}</span>
          <span class="font-semibold">${s.name}</span>
        </label>`;
      }).join('')}</div>
      <button id="save-perms" data-userid="${userId}" class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-md">✅ ${t('savePermissions')}</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#save-perms').addEventListener('click', async (e) => {
    const uid = e.currentTarget.dataset.userid;
    const cbs = modal.querySelectorAll('.perm-cb');
    try {
      const existing = await getDocs(query(collection(db, 'permissions'), where('userId', '==', uid)));
      for(const d of existing.docs) { await deleteDoc(d.ref); }
      for(const cb of cbs) {
        if(cb.checked) {
          await addDoc(collection(db, 'permissions'), { userId: uid, subjectId: cb.dataset.subjectid, granted: true, createdAt: serverTimestamp() });
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

// LOAD DATA
const loadUsers = async () => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    users = [];
    snap.forEach(d => users.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
  }
};

const loadArticles = async () => {
  try {
    const q = query(collection(db, 'articles'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    articles = [];
    snap.forEach(d => articles.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
  }
};

const loadNotifications = async () => {
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    notifications = [];
    snap.forEach(d => notifications.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
  }
};

const loadSubjects = async () => {
  try {
    const snap = await getDocs(collection(db, 'subjects'));
    subjects = [];
    snap.forEach(d => subjects.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
  }
};

const loadPermissions = async () => {
  try {
    const snap = await getDocs(collection(db, 'permissions'));
    permissions = [];
    snap.forEach(d => permissions.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
  }
};

const loadPosts = async () => {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    posts = [];
    snap.forEach(d => posts.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
  }
};

const loadFeedPermissions = async () => {
  try {
    const snap = await getDocs(collection(db, 'feedPermissions'));
    feedPermissions = [];
    snap.forEach(d => feedPermissions.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error:', error);
  }
};

// AUTH
onAuthStateChanged(auth, async (user) => {
  if(user) {
    const snap = await getDocs(collection(db, 'users'));
    let userData = null;
    snap.forEach(d => {
      if(d.data().uid === user.uid || d.data().email === user.email) {
        userData = { id: d.id, ...d.data() };
      }
    });
    if(!userData) {
      const ref = await addDoc(collection(db, 'users'), {
        uid: user.uid, email: user.email, name: user.email.split('@')[0],
        role: user.email === 'admin@medplat.com' ? 'admin' : 'user', createdAt: serverTimestamp()
      });
      userData = { id: ref.id, uid: user.uid, email: user.email, name: user.email.split('@')[0], role: user.email === 'admin@medplat.com' ? 'admin' : 'user' };
    }
    currentUser = userData;
    await Promise.all([loadUsers(), loadArticles(), loadNotifications(), loadSubjects(), loadPermissions(), loadPosts(), loadFeedPermissions(), loadPayments(), loadLibrary(), loadBookProgress()]);
    currentView = userData.role === 'admin' ? 'admin-dashboard' : 'user-home';
    render();
  } else {
    currentUser = null;
    currentView = 'login';
    render();
  }
});

render();

// ============ SISTEMA DE PAGAMENTOS ============

// View Admin Pagamentos
const getAdminPayments = () => {
  const now = new Date();
  const pixConfig = payments.find(p => p.pixKey) || {};
  return `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('payments')}
    <main class="max-w-6xl mx-auto px-6 py-10">
      <div class="glass rounded-3xl shadow-modern p-10 border-t-8 border-blue-500 mb-8">
        <h2 class="text-3xl font-black mb-6">📱 Configurar PIX</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold mb-2">Chave PIX (Email, CPF, Telefone ou Chave Aleatória)</label>
            <input type="text" id="pix-key" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value="${pixConfig.pixKey || ''}" placeholder="Ex: seuemail@gmail.com ou 00000000-0000-0000-0000-000000000000" />
            <p class="text-xs text-gray-600 mt-2">💡 Aceita qualquer tipo de chave PIX</p>
          </div>
          <div>
            <label class="block text-sm font-bold mb-2">QR Code PIX (opcional)</label>
            <input type="file" accept="image/*" id="pix-qr-upload" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
            ${pixConfig.pixQrCode?`<img src="${pixConfig.pixQrCode}" class="mt-3 w-32 h-32 rounded-xl border-2 border-gray-300" />`:''}
          </div>
        </div>
        <button id="save-pix-config" class="mt-6 gradient-success text-white py-3 px-6 rounded-xl font-bold">💾 Salvar Configuração PIX</button>
      </div>
      <div class="glass rounded-3xl shadow-modern p-10 border-t-8 border-green-500">
        <h2 class="text-4xl font-black mb-8" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">💳 Gerenciar Pagamentos</h2>
        <div class="space-y-6">${users.filter(u=>u.role!=='admin').map(u=>{
          const payment = payments.find(p => p.userId === u.id) || {};
          const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
          const isPaid = payment.status === 'paid';
          const isOverdue = dueDate && now > dueDate && !isPaid;
          const statusBadge = isPaid ? 'badge-paid' : isOverdue ? 'badge-overdue' : 'badge-pending';
          const statusText = isPaid ? 'PAGO' : isOverdue ? 'VENCIDO' : 'PENDENTE';
          const statusIcon = isPaid ? '🟢' : isOverdue ? '🔴' : '🟡';
          
          return `
            <div class="payment-card ${isPaid?'paid':isOverdue?'overdue':''}">
              <div class="flex items-center justify-between mb-4">
                <div><h3 class="text-2xl font-bold text-gray-900">👤 ${u.name}</h3>
                  <p class="text-sm text-gray-600">${u.email}</p></div>
                <span class="badge ${statusBadge}">${statusIcon} ${statusText}</span>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div><p class="text-sm text-gray-600">Valor</p>
                  <p class="text-2xl font-bold text-gray-900">R$ ${payment.amount || '0,00'}</p></div>
                <div><p class="text-sm text-gray-600">Vencimento</p>
                  <p class="text-2xl font-bold text-gray-900">${payment.dueDate || '---'}</p></div>
              </div>
              <div class="flex gap-2 flex-wrap">
                <button class="set-payment-btn flex-1 gradient-primary text-white py-3 px-3 rounded-xl font-bold text-sm" data-userid="${u.id}" data-username="${u.name}">✏️ Editar</button>
                ${!isPaid?`<button class="register-payment-btn flex-1 gradient-success text-white py-3 px-3 rounded-xl font-bold text-sm" data-userid="${u.id}">💰 Pago</button>`:`<button class="mark-unpaid-btn flex-1 gradient-warning text-white py-3 px-3 rounded-xl font-bold text-sm" data-userid="${u.id}">↩️ Pendente</button>`}
                <button class="delete-payment-btn gradient-danger text-white py-3 px-3 rounded-xl font-bold text-sm" data-userid="${u.id}">🗑️</button>
              </div>
            </div>
          `;
        }).join('')}</div>
      </div>
    </main>
  </div>
`;
};

// View User Pagamentos
const getUserPayments = () => {
  const payment = payments.find(p => p.userId === currentUser.id) || {};
  const pixConfig = payments.find(p => p.pixKey) || {};
  const now = new Date();
  const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
  const isPaid = payment.status === 'paid';
  const isOverdue = dueDate && now > dueDate && !isPaid;
  const statusBadge = isPaid ? 'badge-paid' : isOverdue ? 'badge-overdue' : 'badge-pending';
  const statusText = isPaid ? 'EM DIA' : isOverdue ? 'VENCIDO' : 'PENDENTE';
  const statusIcon = isPaid ? '🟢' : isOverdue ? '🔴' : '🟡';
  
  return `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getUserNav('payments')}
    <main class="max-w-4xl mx-auto px-6 py-10">
      <div class="glass rounded-3xl shadow-modern p-10 border-l-8 border-blue-500 mb-8">
        <h2 class="text-4xl font-black mb-8">💳 Minha Assinatura</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <p class="text-sm text-gray-600 mb-2">Plano</p>
            <p class="text-3xl font-black text-gray-900">Mensal</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <p class="text-sm text-gray-600 mb-2">Valor</p>
            <p class="text-3xl font-black text-gray-900">R$ ${payment.amount || '0,00'}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <p class="text-sm text-gray-600 mb-2">Vencimento</p>
            <p class="text-2xl font-bold text-gray-900">${payment.dueDate || '---'}</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <p class="text-sm text-gray-600 mb-2">Status</p>
            <span class="badge ${statusBadge} text-xl">${statusIcon} ${statusText}</span>
          </div>
        </div>
        ${payment.paymentDate?`
          <div class="bg-green-50 border-2 border-green-200 p-6 rounded-2xl mb-6">
            <p class="text-sm text-green-700 font-bold mb-2">✅ Último Pagamento</p>
            <p class="text-xl text-green-900 font-bold">${payment.paymentDate}</p>
          </div>
        `:''}
        ${pixConfig.pixKey?`
          <div class="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl">
            <h3 class="text-2xl font-bold mb-4">📱 Pagar via PIX</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-blue-700 font-bold mb-2">Chave PIX:</p>
                <div class="bg-white p-4 rounded-xl border-2 border-blue-300">
                  <p class="font-mono text-lg text-gray-900 break-all">${pixConfig.pixKey}</p>
                </div>
                <button onclick="navigator.clipboard.writeText('${pixConfig.pixKey}')" class="mt-3 w-full gradient-primary text-white py-2 rounded-lg font-bold">📋 Copiar Chave</button>
              </div>
              ${pixConfig.pixQrCode?`
                <div class="text-center">
                  <p class="text-sm text-blue-700 font-bold mb-2">QR Code:</p>
                  <img src="${pixConfig.pixQrCode}" class="w-48 h-48 mx-auto rounded-xl border-4 border-blue-300 shadow-lg" />
                </div>
              `:''}
            </div>
          </div>
        `:''}
      </div>
    </main>
  </div>
`;
};

// Load payments
const loadPayments = async () => {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    payments = [];
    snap.forEach(d => payments.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error loading payments:', error);
  }
};

// Handler modal para definir vencimento
window.showSetPaymentModal = (userId, userName) => {
  const payment = payments.find(p => p.userId === userId) || {};
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50';
  modal.innerHTML = `
    <div class="glass rounded-3xl shadow-modern-lg p-8 max-w-md w-full">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-black">Definir Vencimento: ${userName}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl hover:text-red-600">×</button>
      </div>
      <div class="space-y-4">
        <div><label class="block text-sm font-bold mb-2">Valor (R$)</label>
          <input type="number" id="payment-amount" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value="${payment.amount || 100}" step="0.01" /></div>
        <div><label class="block text-sm font-bold mb-2">Data de Vencimento</label>
          <input type="date" id="payment-due-date" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value="${payment.dueDate || ''}" /></div>
      </div>
      <button id="save-payment-settings" data-userid="${userId}" class="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-md mt-6">💾 Salvar</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.querySelector('#save-payment-settings').addEventListener('click', async (e) => {
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const dueDate = document.getElementById('payment-due-date').value;
    try {
      const existing = payments.find(p => p.userId === userId);
      if(existing) {
        await updateDoc(doc(db, 'payments', existing.id), { amount, dueDate, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'payments'), { userId, amount, dueDate, status: 'pending', plan: 'monthly', createdAt: serverTimestamp() });
      }
      await loadPayments();
      modal.remove();
      render();
      alert('Vencimento definido!');
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  });
};

// Handler registrar pagamento
window.registerPayment = async (userId) => {
  const paymentDate = new Date().toISOString().split('T')[0];
  try {
    const payment = payments.find(p => p.userId === userId);
    if(payment) {
      await updateDoc(doc(db, 'payments', payment.id), { status: 'paid', paymentDate, updatedAt: serverTimestamp() });
      alert('Pagamento registrado!');
      await loadPayments();
      render();
    }
  } catch (error) {
    alert('Erro: ' + error.message);
  }
};

// Handler marcar como pendente
window.markUnpaid = async (userId) => {
  try {
    const payment = payments.find(p => p.userId === userId);
    if(payment) {
      await updateDoc(doc(db, 'payments', payment.id), { status: 'pending', paymentDate: null, updatedAt: serverTimestamp() });
      await loadPayments();
      render();
    }
  } catch (error) {
    alert('Erro: ' + error.message);
  }
};



// Handlers PIX
let tempPixQrCode = null;

const handlePixQrUpload = (e) => {
  const file = e.target.files[0];
  if(file) {
    if(file.size > 1048576) { alert('Máximo 1MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      tempPixQrCode = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSavePixConfig = async () => {
  const pixKey = document.getElementById('pix-key').value.trim();
  if(!pixKey) { alert('Digite a chave PIX'); return; }
  
  try {
    const existing = payments.find(p => p.pixKey);
    const data = { pixKey, pixQrCode: tempPixQrCode || (existing?.pixQrCode || null), updatedAt: serverTimestamp() };
    
    if(existing) {
      await updateDoc(doc(db, 'payments', existing.id), data);
    } else {
      await addDoc(collection(db, 'payments'), { ...data, createdAt: serverTimestamp() });
    }
    
    alert('Configuração PIX salva!');
    await loadPayments();
    render();
  } catch (error) {
    alert('Erro: ' + error.message);
  }
};


// ==================== BIBLIOTECA SYSTEM ====================

let currentBook = null;
let currentBookPage = 1;

// View Admin Library
const getAdminLibrary = () => `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('library')}
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div class="glass rounded-2xl sm:rounded-3xl shadow-modern p-4 sm:p-10 border-t-8 border-indigo-500 mb-6 sm:mb-8">
        <h2 class="text-2xl sm:text-4xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">📚 Gerenciar Biblioteca</h2>
        
        <form id="add-book-form" class="space-y-4 sm:space-y-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="block text-sm font-bold mb-2">Título do Livro</label>
              <input type="text" id="book-title" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required /></div>
            <div><label class="block text-sm font-bold mb-2">Categoria</label>
              <input type="text" id="book-category" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" placeholder="Ex: Anatomia, Fisiologia..." required /></div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="block text-sm font-bold mb-2">Capa do Livro (imagem)</label>
              <input type="file" accept="image/*" id="book-cover" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required /></div>
            <div><label class="block text-sm font-bold mb-2">PDF do Livro</label>
              <input type="file" accept="application/pdf" id="book-pdf" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" required /></div>
          </div>
          
          <button type="submit" class="w-full gradient-success text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg">📖 Adicionar Livro</button>
        </form>
      </div>
      
      <div class="glass rounded-2xl sm:rounded-3xl shadow-modern p-4 sm:p-10">
        <h3 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">📖 Livros Cadastrados</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          ${library.map(book => `
            <div class="bg-white rounded-xl overflow-hidden shadow-md">
              <img src="${book.cover}" class="w-full h-48 sm:h-56 object-cover" />
              <div class="p-3">
                <p class="font-bold text-sm sm:text-base line-clamp-2">${book.title}</p>
                <p class="text-xs text-gray-600 mt-1">${book.category}</p>
                <button class="delete-book-btn w-full mt-3 gradient-danger text-white py-2 rounded-lg font-bold text-sm" data-id="${book.id}">🗑️ Excluir</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </main>
  </div>
`;

// View User Library
const getUserLibrary = () => {
  const categories = [...new Set(library.map(b => b.category))];
  
  return `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getUserNav('library')}
    <main class="px-0 py-4 sm:py-6">
      ${categories.map(category => {
        const books = library.filter(b => b.category === category);
        return `
          <div class="netflix-container">
            <div class="netflix-row">
              <h2 class="text-white">📚 ${category}</h2>
              <div class="netflix-cards">
                ${books.map(book => `
                  <div class="card-netflix gradient-primary" data-bookid="${book.id}">
                    <img src="${book.cover}" class="card-cover" />
                    <div class="card-overlay">
                      <p class="text-white font-bold text-sm">${book.title}</p>
                      ${bookProgress.find(p => p.userId === currentUser.id && p.bookId === book.id) ? 
                        `<p class="text-xs text-green-300 mt-1">📖 Página ${bookProgress.find(p => p.userId === currentUser.id && p.bookId === book.id).lastPage}</p>` : 
                        '<p class="text-xs text-gray-300 mt-1">Não iniciado</p>'}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </main>
  </div>
`;
};

// View Book Reader
const getBookReader = () => {
  if(!currentBook) return getUserLibrary();
  const progress = bookProgress.find(p => p.userId === currentUser.id && p.bookId === currentBook.id);
  const lastPage = progress?.lastPage || 1;
  
  return `
    <div class="pdf-viewer-container">
      <div class="pdf-toolbar">
        <button id="close-reader" class="flex items-center gap-2 px-4 py-2 gradient-danger text-white rounded-lg font-bold text-sm">← Fechar</button>
        <div class="flex items-center gap-2 flex-1 justify-center">
          <button id="prev-page" class="px-3 py-2 bg-gray-200 rounded-lg font-bold text-sm">◀</button>
          <span class="font-mono text-sm"><span id="page-num">${lastPage}</span> / <span id="page-count">0</span></span>
          <button id="next-page" class="px-3 py-2 bg-gray-200 rounded-lg font-bold text-sm">▶</button>
        </div>
        <div class="text-sm font-bold">${currentBook.title}</div>
      </div>
      <div class="pdf-canvas-container" id="pdf-container">
        <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
      </div>
    </div>
  `;
};

// Load Library
const loadLibrary = async () => {
  try {
    const snap = await getDocs(collection(db, 'library'));
    library = [];
    snap.forEach(d => library.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error loading library:', error);
  }
};

// Load Book Progress
const loadBookProgress = async () => {
  try {
    const snap = await getDocs(collection(db, 'bookProgress'));
    bookProgress = [];
    snap.forEach(d => bookProgress.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error loading progress:', error);
  }
};

// Add Book Handler
const handleAddBook = async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('book-title').value.trim();
  const category = document.getElementById('book-category').value.trim();
  const coverFile = document.getElementById('book-cover').files[0];
  const pdfFile = document.getElementById('book-pdf').files[0];
  
  if(!title || !category) { alert('❌ Preencha título e categoria'); return; }
  if(!coverFile || !pdfFile) { alert('❌ Selecione capa e PDF'); return; }
  if(coverFile.size > 2097152) { alert('❌ Capa máximo 2MB'); return; }
  if(pdfFile.size > 52428800) { alert('❌ PDF máximo 50MB'); return; }
  
  // Show loading
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = '⏳ Salvando...';
  btn.disabled = true;
  
  try {
    console.log('Convertendo capa para Base64...');
    const coverBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(coverFile);
    });
    
    console.log('Convertendo PDF para Base64...');
    const pdfBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(pdfFile);
    });
    
    console.log('Salvando no Firebase...');
    const docRef = await addDoc(collection(db, 'library'), {
      title,
      category,
      cover: coverBase64,
      pdf: pdfBase64,
      createdAt: serverTimestamp()
    });
    
    console.log('Livro salvo com ID:', docRef.id);
    
    // Success!
    alert('✅ SUCESSO! Livro "' + title + '" foi adicionado à biblioteca!');
    
    // Reset form
    e.target.reset();
    
    // Reload library
    await loadLibrary();
    render();
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    alert('❌ ERRO ao adicionar livro: ' + error.message);
    btn.textContent = originalText;
    btn.disabled = false;
  }
};
  } catch (error) {
    alert('Erro: ' + error.message);
  }
};

// Delete Book Handler
const handleDeleteBook = async (bookId) => {
  if(!confirm('Excluir este livro?')) return;
  
  try {
    await deleteDoc(doc(db, 'library', bookId));
    await loadLibrary();
    render();
  } catch (error) {
    alert('Erro: ' + error.message);
  }
};

// Open Book Handler
window.openBook = async (bookId) => {
  currentBook = library.find(b => b.id === bookId);
  if(!currentBook) return;
  
  const progress = bookProgress.find(p => p.userId === currentUser.id && p.bookId === bookId);
  currentBookPage = progress?.lastPage || 1;
  
  currentView = 'book-reader';
  render();
  
  // Initialize PDF.js
  setTimeout(() => initPDFReader(), 100);
};

// Initialize PDF Reader
const initPDFReader = async () => {
  const pdfData = currentBook.pdf;
  
  // Load PDF
  const loadingTask = pdfjsLib.getDocument({ data: atob(pdfData.split(',')[1]) });
  const pdf = await loadingTask.promise;
  
  window.pdfDoc = pdf;
  window.pageNum = currentBookPage;
  document.getElementById('page-count').textContent = pdf.numPages;
  
  renderPage(currentBookPage);
  
  // Event listeners
  document.getElementById('close-reader').addEventListener('click', () => {
    currentView = 'user-library';
    currentBook = null;
    render();
  });
  
  document.getElementById('prev-page').addEventListener('click', () => {
    if(window.pageNum <= 1) return;
    window.pageNum--;
    renderPage(window.pageNum);
    saveProgress();
  });
  
  document.getElementById('next-page').addEventListener('click', () => {
    if(window.pageNum >= window.pdfDoc.numPages) return;
    window.pageNum++;
    renderPage(window.pageNum);
    saveProgress();
  });
};

// Render PDF Page
const renderPage = async (num) => {
  const page = await window.pdfDoc.getPage(num);
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');
  
  const viewport = page.getViewport({ scale: 1.5 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({ canvasContext: ctx, viewport }).promise;
  
  document.getElementById('page-num').textContent = num;
  window.pageNum = num;
};

// Save Reading Progress
const saveProgress = async () => {
  try {
    const existing = bookProgress.find(p => p.userId === currentUser.id && p.bookId === currentBook.id);
    
    if(existing) {
      await updateDoc(doc(db, 'bookProgress', existing.id), {
        lastPage: window.pageNum,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'bookProgress'), {
        userId: currentUser.id,
        bookId: currentBook.id,
        lastPage: window.pageNum,
        createdAt: serverTimestamp()
      });
    }
    
    await loadBookProgress();
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// ==================== PAYMENT EDITS ====================

// Edit Payment Modal
window.editPayment = (userId) => {
  window.showSetPaymentModal(userId, users.find(u => u.id === userId)?.name || '');
};

// Delete Payment
window.deletePayment = async (userId) => {
  if(!confirm('Excluir configuração de pagamento?')) return;
  
  try {
    const payment = payments.find(p => p.userId === userId);
    if(payment) {
      await deleteDoc(doc(db, 'payments', payment.id));
      await loadPayments();
      render();
    }
  } catch (error) {
    alert('Erro: ' + error.message);
  }
};

