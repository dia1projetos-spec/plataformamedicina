// MedPlatform - Aplicação React Principal

const { useState } = React;

function MedicalPlatform() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, email: 'admin@medplat.com', password: 'admin123', name: 'Administrador', role: 'admin' }
  ]);
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentView, setCurrentView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '' });
  const [articleForm, setArticleForm] = useState({ title: '', content: '', image: null, imagePreview: null });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', video: null, videoPreview: null });

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
      setLoginForm({ email: '', password: '' });
    } else {
      alert('Email ou senha incorretos');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: users.length + 1,
      ...newUserForm,
      role: 'user'
    };
    setUsers([...users, newUser]);
    setNewUserForm({ name: '', email: '', password: '' });
    alert('Usuário criado com sucesso!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleForm({ ...articleForm, image: file, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoForm({ ...videoForm, video: file, videoPreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateArticle = (e) => {
    e.preventDefault();
    const newArticle = {
      id: articles.length + 1,
      ...articleForm,
      author: currentUser.name,
      date: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };
    setArticles([newArticle, ...articles]);
    setArticleForm({ title: '', content: '', image: null, imagePreview: null });
    alert('Artigo publicado com sucesso!');
  };

  const handleCreateVideo = (e) => {
    e.preventDefault();
    const newVideo = {
      id: videos.length + 1,
      ...videoForm,
      author: currentUser.name,
      date: new Date().toLocaleDateString('pt-BR'),
      timestamp: Date.now()
    };
    setVideos([newVideo, ...videos]);
    setVideoForm({ title: '', description: '', video: null, videoPreview: null });
    alert('Vídeo publicado com sucesso!');
  };

  const handleDeleteArticle = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este artigo?')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const handleDeleteVideo = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este vídeo?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const handleDeleteUser = (id) => {
    if (id === 1) {
      alert('Não é possível excluir o administrador principal');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const Header = () => (
    <header className="bg-white shadow-md border-b-4 border-teal-500">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🏥</span>
          <h1 className="text-3xl font-black text-teal-600">MedPlatform</h1>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-gray-800 font-semibold text-lg">👤 {currentUser.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold shadow-md"
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </header>
  );

  const AdminNav = ({ active }) => (
    <nav className="bg-white border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className={"py-4 px-3 border-b-4 text-lg transition-all " + (active === 'dashboard' ? 'border-teal-600 text-teal-600 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900 font-semibold hover:border-gray-300')}
          >
            📊 Painel
          </button>
          <button
            onClick={() => setCurrentView('admin-users')}
            className={"py-4 px-3 border-b-4 text-lg transition-all " + (active === 'users' ? 'border-teal-600 text-teal-600 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900 font-semibold hover:border-gray-300')}
          >
            👥 Usuários
          </button>
          <button
            onClick={() => setCurrentView('admin-create-article')}
            className={"py-4 px-3 border-b-4 text-lg transition-all " + (active === 'article' ? 'border-teal-600 text-teal-600 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900 font-semibold hover:border-gray-300')}
          >
            📝 Criar Artigo
          </button>
          <button
            onClick={() => setCurrentView('admin-create-video')}
            className={"py-4 px-3 border-b-4 text-lg transition-all " + (active === 'video' ? 'border-teal-600 text-teal-600 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900 font-semibold hover:border-gray-300')}
          >
            🎥 Vídeo
          </button>
        </div>
      </div>
    </nav>
  );

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg border-4 border-teal-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-6 shadow-lg">
              <span className="text-5xl">🏥</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">MedPlatform</h1>
            <p className="text-lg text-gray-600 font-medium">Plataforma Educacional para Medicina</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-300 focus:border-teal-500 text-lg transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Senha</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-300 focus:border-teal-500 text-lg transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🔓 Entrar
            </button>
          </form>

          <div className="mt-8 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200">
            <p className="text-sm font-bold text-teal-800 mb-3">💡 Credenciais de teste:</p>
            <p className="text-sm text-gray-700 mb-1 font-mono">📧 admin@medplat.com</p>
            <p className="text-sm text-gray-700 font-mono">🔑 admin123</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'admin-dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <AdminNav active="dashboard" />
        
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-8 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-bold uppercase">Usuários</p>
                  <p className="text-5xl font-black text-teal-600 mt-2">{users.length}</p>
                </div>
                <span className="text-6xl">👥</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-8 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-bold uppercase">Artigos</p>
                  <p className="text-5xl font-black text-green-600 mt-2">{articles.length}</p>
                </div>
                <span className="text-6xl">📄</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-8 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-bold uppercase">Vídeos</p>
                  <p className="text-5xl font-black text-purple-600 mt-2">{videos.length}</p>
                </div>
                <span className="text-6xl">🎬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-black mb-6 text-gray-800">📋 Conteúdo Recente</h2>
            {[...articles, ...videos].length === 0 ? (
              <p className="text-gray-500 text-center py-12 text-lg font-semibold">Nenhum conteúdo publicado ainda</p>
            ) : (
              <div className="space-y-4">
                {[...articles, ...videos]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={(item.video ? 'video' : 'article') + '-' + item.id} className="flex items-center justify-between p-5 border-2 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.video ? '🎥' : '📝'}</span>
                        <div>
                          <p className="font-bold text-lg text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => item.video ? handleDeleteVideo(item.id) : handleDeleteArticle(item.id)}
                        className="text-red-600 hover:text-red-800 text-2xl"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'admin-users') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <AdminNav active="users" />
        
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-teal-500">
              <h2 className="text-2xl font-black mb-6 text-gray-800">➕ Cadastrar Novo Usuário</h2>
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Nome Completo</label>
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Email</label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Senha</label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md"
                >
                  ✅ Cadastrar Usuário
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-purple-500">
              <h2 className="text-2xl font-black mb-6 text-gray-800">👥 Usuários ({users.length})</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-5 border-2 rounded-xl">
                    <div>
                      <p className="font-bold text-lg text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600 font-mono">{user.email}</p>
                      <span className={"text-xs px-3 py-1 rounded-full font-bold mt-2 inline-block " + (user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                      </span>
                    </div>
                    {user.id !== 1 && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-2xl"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'admin-create-article') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <AdminNav active="article" />
        
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-green-500">
            <h2 className="text-3xl font-black mb-8 text-gray-800">📝 Criar Novo Artigo</h2>
            <form onSubmit={handleCreateArticle} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Título</label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
                  placeholder="Ex: Novas Diretrizes de Cardiologia 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Conteúdo</label>
                <textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 h-64"
                  placeholder="Escreva o conteúdo do artigo..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Imagem de Capa</label>
                <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="article-image"
                  />
                  <label htmlFor="article-image" className="cursor-pointer">
                    {articleForm.imagePreview ? (
                      <img src={articleForm.imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl mb-4 shadow-lg" />
                    ) : (
                      <div>
                        <span className="text-6xl block mb-3">🖼️</span>
                        <p className="text-sm text-gray-600 font-semibold">Clique para selecionar uma imagem</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                ✅ Publicar Artigo
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'admin-create-video') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <AdminNav active="video" />
        
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-purple-500">
            <h2 className="text-3xl font-black mb-8 text-gray-800">🎥 Publicar Novo Vídeo</h2>
            <form onSubmit={handleCreateVideo} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Título</label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  placeholder="Ex: Anatomia do Coração - Aula Completa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Descrição</label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 h-32"
                  placeholder="Descreva o conteúdo do vídeo..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Arquivo de Vídeo</label>
                <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-all">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-file"
                  />
                  <label htmlFor="video-file" className="cursor-pointer">
                    {videoForm.videoPreview ? (
                      <video src={videoForm.videoPreview} controls className="max-h-64 mx-auto rounded-xl mb-4 shadow-lg" />
                    ) : (
                      <div>
                        <span className="text-6xl block mb-3">🎬</span>
                        <p className="text-sm text-gray-600 font-semibold">Clique para selecionar um vídeo</p>
                        <p className="text-xs text-gray-500 mt-2">MP4, MOV, AVI</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg"
              >
                ✅ Publicar Vídeo
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'user-dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />

        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border-l-8 border-teal-500">
            <h2 className="text-3xl font-black mb-3 text-gray-800">Bem-vindo, {currentUser.name}! 👋</h2>
            <p className="text-lg text-gray-600 font-medium">Confira os últimos conteúdos publicados</p>
          </div>

          {articles.length > 0 && (
            <div className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-3">
                <span>📄</span> Artigos Recentes
              </h3>
              <div className="space-y-8">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {article.imagePreview && (
                      <img src={article.imagePreview} alt={article.title} className="w-full h-64 object-cover" />
                    )}
                    <div className="p-8">
                      <h4 className="text-2xl font-black mb-2 text-gray-800">{article.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>Por {article.author}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{article.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className="mb-10">
              <h3 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-3">
                <span>🎥</span> Vídeos Recentes
              </h3>
              <div className="space-y-8">
                {videos.map((video) => (
                  <div key={video.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {video.videoPreview && (
                      <video src={video.videoPreview} controls className="w-full" />
                    )}
                    <div className="p-8">
                      <h4 className="text-2xl font-black mb-2 text-gray-800">{video.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>Por {video.author}</span>
                        <span>•</span>
                        <span>{video.date}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {articles.length === 0 && videos.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <span className="text-8xl block mb-4">👀</span>
              <p className="text-gray-600 text-lg font-semibold">Nenhum conteúdo publicado ainda</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
}

ReactDOM.render(<MedicalPlatform />, document.getElementById('root'));
