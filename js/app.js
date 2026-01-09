// MedPlatform - Aplicação com Firebase (SEM Storage - Base64)
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
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Estado da aplicação
let currentUser = null;
let currentView = 'login';
let articles = [];
let users = [];

// Formulários
let loginForm = { email: '', password: '' };
let articleForm = { title: '', content: '', imageBase64: null };

// Função para renderizar a aplicação
function render() {
  const root = document.getElementById('root');
  root.innerHTML = getCurrentView();
  attachEventListeners();
}

// Obter a view atual
function getCurrentView() {
  if (currentView === 'login') return getLoginView();
  if (currentView === 'admin-dashboard') return getAdminDashboard();
  if (currentView === 'admin-users') return getAdminUsers();
  if (currentView === 'admin-create-article') return getCreateArticle();
  if (currentView === 'user-dashboard') return getUserDashboard();
  return '';
}

// VIEW: Login
function getLoginView() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg border-4 border-teal-500">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-6 shadow-lg">
            <span class="text-5xl">🏥</span>
          </div>
          <h1 class="text-4xl font-black text-gray-900 mb-3 tracking-tight">MedPlatform</h1>
          <p class="text-lg text-gray-600 font-medium">Plataforma Educacional para Medicina</p>
        </div>

        <form id="login-form" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              id="login-email"
              class="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-300 focus:border-teal-500 text-lg transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Senha</label>
            <input
              type="password"
              id="login-password"
              class="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-300 focus:border-teal-500 text-lg transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🔓 Entrar
          </button>
        </form>

        <div class="mt-8 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200">
          <p class="text-sm font-bold text-teal-800 mb-3">💡 Credenciais de teste:</p>
          <p class="text-sm text-gray-700 mb-1 font-mono">📧 admin@medplat.com</p>
          <p class="text-sm text-gray-700 font-mono">🔑 admin123</p>
        </div>
      </div>
    </div>
  `;
}

// VIEW: Admin Dashboard
function getAdminDashboard() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      ${getHeader()}
      ${getAdminNav('dashboard')}
      
      <main class="max-w-7xl mx-auto px-6 py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div class="bg-white p-8 rounded-2xl shadow-lg border-l-8 border-teal-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase">Usuários</p>
                <p class="text-5xl font-black text-teal-600 mt-2">${users.length}</p>
              </div>
              <span class="text-6xl">👥</span>
            </div>
          </div>
          <div class="bg-white p-8 rounded-2xl shadow-lg border-l-8 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase">Artigos</p>
                <p class="text-5xl font-black text-green-600 mt-2">${articles.length}</p>
              </div>
              <span class="text-6xl">📄</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-black mb-6 text-gray-800">📋 Artigos Recentes</h2>
          ${articles.length === 0 ? `
            <p class="text-gray-500 text-center py-12 text-lg font-semibold">Nenhum artigo publicado ainda</p>
          ` : `
            <div class="space-y-4">
              ${articles.map(item => `
                <div class="flex items-center justify-between p-5 border-2 rounded-xl hover:shadow-md transition-all">
                  <div class="flex items-center gap-4">
                    <span class="text-3xl">📝</span>
                    <div>
                      <p class="font-bold text-lg text-gray-800">${item.title}</p>
                      <p class="text-sm text-gray-600">${item.date || 'Recente'}</p>
                    </div>
                  </div>
                  <button
                    class="delete-content"
                    data-id="${item.id}"
                  >
                    <span class="text-red-600 hover:text-red-800 text-2xl">🗑️</span>
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

// VIEW: Admin Users
function getAdminUsers() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      ${getHeader()}
      ${getAdminNav('users')}
      
      <main class="max-w-7xl mx-auto px-6 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div class="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-teal-500">
            <h2 class="text-2xl font-black mb-6 text-gray-800">➕ Cadastrar Novo Usuário</h2>
            <form id="create-user-form" class="space-y-5">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Nome Completo</label>
                <input
                  type="text"
                  id="new-user-name"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Email</label>
                <input
                  type="email"
                  id="new-user-email"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Senha</label>
                <input
                  type="password"
                  id="new-user-password"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500"
                  required
                />
              </div>
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md"
              >
                ✅ Cadastrar Usuário
              </button>
            </form>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-purple-500">
            <h2 class="text-2xl font-black mb-6 text-gray-800">👥 Usuários (${users.length})</h2>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              ${users.map(user => `
                <div class="flex items-center justify-between p-5 border-2 rounded-xl">
                  <div>
                    <p class="font-bold text-lg text-gray-800">${user.name}</p>
                    <p class="text-sm text-gray-600 font-mono">${user.email}</p>
                    <span class="text-xs px-3 py-1 rounded-full font-bold mt-2 inline-block ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                      ${user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                    </span>
                  </div>
                  ${user.role !== 'admin' ? `
                    <button class="delete-user" data-id="${user.id}">
                      <span class="text-red-600 hover:text-red-800 text-2xl">🗑️</span>
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

// VIEW: Create Article
function getCreateArticle() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      ${getHeader()}
      ${getAdminNav('article')}
      
      <main class="max-w-4xl mx-auto px-6 py-10">
        <div class="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-green-500">
          <h2 class="text-3xl font-black mb-8 text-gray-800">📝 Criar Novo Artigo</h2>
          <form id="create-article-form" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Título</label>
              <input
                type="text"
                id="article-title"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
                placeholder="Ex: Novas Diretrizes de Cardiologia 2025"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Conteúdo</label>
              <textarea
                id="article-content"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 h-64"
                placeholder="Escreva o conteúdo do artigo..."
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Imagem de Capa (opcional)</label>
              <div class="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  id="article-image"
                  class="hidden"
                />
                <label for="article-image" class="cursor-pointer">
                  <div id="article-image-preview">
                    <span class="text-6xl block mb-3">🖼️</span>
                    <p class="text-sm text-gray-600 font-semibold">Clique para selecionar uma imagem</p>
                    <p class="text-xs text-gray-500 mt-2">Máximo 1MB recomendado</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              id="submit-article"
              class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              ✅ Publicar Artigo
            </button>
          </form>
        </div>
      </main>
    </div>
  `;
}

// VIEW: User Dashboard
function getUserDashboard() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      ${getHeader()}

      <main class="max-w-4xl mx-auto px-6 py-10">
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-10 border-l-8 border-teal-500">
          <h2 class="text-3xl font-black mb-3 text-gray-800">Bem-vindo, ${currentUser?.name || 'Usuário'}! 👋</h2>
          <p class="text-lg text-gray-600 font-medium">Confira os últimos conteúdos publicados</p>
        </div>

        ${articles.length > 0 ? `
          <div class="mb-10">
            <h3 class="text-2xl font-black mb-6 text-gray-800 flex items-center gap-3">
              <span>📄</span> Artigos Recentes
            </h3>
            <div class="space-y-8">
              ${articles.map(article => `
                <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                  ${article.imageBase64 ? `
                    <img src="${article.imageBase64}" alt="${article.title}" class="w-full h-64 object-cover" />
                  ` : ''}
                  <div class="p-8">
                    <h4 class="text-2xl font-black mb-2 text-gray-800">${article.title}</h4>
                    <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>Por ${article.author}</span>
                      <span>•</span>
                      <span>${article.date}</span>
                    </div>
                    <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${article.content}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="bg-white rounded-2xl shadow-lg p-16 text-center">
            <span class="text-8xl block mb-4">👀</span>
            <p class="text-gray-600 text-lg font-semibold">Nenhum conteúdo publicado ainda</p>
          </div>
        `}
      </main>
    </div>
  `;
}

// COMPONENT: Header
function getHeader() {
  return `
    <header class="bg-white shadow-md border-b-4 border-teal-500">
      <div class="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <span class="text-4xl">🏥</span>
          <h1 class="text-3xl font-black text-teal-600">MedPlatform</h1>
        </div>
        <div class="flex items-center gap-5">
          <span class="text-gray-800 font-semibold text-lg">👤 ${currentUser?.name || 'Usuário'}</span>
          <button
            id="logout-btn"
            class="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold shadow-md"
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </header>
  `;
}

// COMPONENT: Admin Nav
function getAdminNav(active) {
  const navItems = [
    { id: 'dashboard', label: '📊 Painel', view: 'admin-dashboard' },
    { id: 'users', label: '👥 Usuários', view: 'admin-users' },
    { id: 'article', label: '📝 Criar Artigo', view: 'admin-create-article' }
  ];

  return `
    <nav class="bg-white border-b-2 border-gray-200">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex gap-8">
          ${navItems.map(item => `
            <button
              class="nav-btn py-4 px-3 border-b-4 text-lg transition-all ${
                active === item.id 
                  ? 'border-teal-600 text-teal-600 font-bold' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 font-semibold hover:border-gray-300'
              }"
              data-view="${item.view}"
            >
              ${item.label}
            </button>
          `).join('')}
        </div>
      </div>
    </nav>
  `;
}

// Event Listeners
function attachEventListeners() {
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
}

// HANDLERS
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert('Erro ao fazer login: ' + error.message);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    alert('Erro ao sair: ' + error.message);
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

    alert('Usuário criado com sucesso!');
    document.getElementById('create-user-form').reset();
    await loadUsers();
    render();
  } catch (error) {
    alert('Erro ao criar usuário: ' + error.message);
  }
}

async function handleCreateArticle(e) {
  e.preventDefault();
  const title = document.getElementById('article-title').value;
  const content = document.getElementById('article-content').value;
  const imageBase64 = articleForm.imageBase64;

  const submitBtn = document.getElementById('submit-article');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Publicando...';

  try {
    await addDoc(collection(db, 'articles'), {
      title,
      content,
      imageBase64: imageBase64 || null,
      author: currentUser.name,
      authorId: currentUser.uid,
      date: new Date().toLocaleDateString('pt-BR'),
      timestamp: serverTimestamp()
    });

    alert('Artigo publicado com sucesso!');
    articleForm = { title: '', content: '', imageBase64: null };
    await loadArticles();
    currentView = 'admin-dashboard';
    render();
  } catch (error) {
    alert('Erro ao publicar artigo: ' + error.message);
    console.error('Erro completo:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = '✅ Publicar Artigo';
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
      preview.innerHTML = `<img src="${reader.result}" alt="Preview" class="max-h-64 mx-auto rounded-xl mb-4 shadow-lg" />`;
    };
    reader.readAsDataURL(file);
  }
}

async function handleDeleteArticle(id) {
  if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

  try {
    await deleteDoc(doc(db, 'articles', id));
    await loadArticles();
    render();
  } catch (error) {
    alert('Erro ao excluir artigo: ' + error.message);
  }
}

async function handleDeleteUser(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

  try {
    await deleteDoc(doc(db, 'users', id));
    await loadUsers();
    render();
  } catch (error) {
    alert('Erro ao excluir usuário: ' + error.message);
  }
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
    console.error('Erro ao carregar usuários:', error);
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
    console.error('Erro ao carregar artigos:', error);
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
    await Promise.all([loadUsers(), loadArticles()]);
    currentView = userData.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';
    render();
  } else {
    currentUser = null;
    currentView = 'login';
    render();
  }
});

render();
