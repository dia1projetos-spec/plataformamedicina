# MedPlatform - Plataforma Educacional para Medicina

## 📁 Estrutura do Projeto

```
medplatform/
├── index.html          # Página HTML principal
├── css/
│   └── styles.css     # Estilos CSS customizados
├── js/
│   └── app.js         # Código JavaScript/React
└── README.md           # Este arquivo
```

## 🚀 Como Usar

### ⚠️ IMPORTANTE: Você precisa rodar um servidor local!

Os navegadores modernos bloqueiam o carregamento de arquivos JavaScript externos por segurança (CORS). 

Existem **3 formas** de rodar:

### Opção 1: Usar o Live Server do VS Code (MAIS FÁCIL)
1. Abra o VS Code
2. Instale a extensão "Live Server"
3. Clique com botão direito no `index.html`
4. Escolha "Open with Live Server"
5. Pronto! Abre automaticamente no navegador

### Opção 2: Python (se você tem Python instalado)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Depois abra: http://localhost:8000

### Opção 3: Node.js (se você tem Node instalado)
```bash
npx serve
```
Depois abra o endereço que aparecer

## 🔐 Credenciais de Teste

- **Email:** admin@medplat.com
- **Senha:** admin123

## ✨ Funcionalidades

### Para Administradores:
- ✅ Gerenciar usuários (criar, visualizar, excluir)
- ✅ Publicar artigos com imagens
- ✅ Publicar vídeos
- ✅ Dashboard com estatísticas
- ✅ Ver todo o conteúdo publicado

### Para Usuários:
- ✅ Ver artigos publicados
- ✅ Assistir vídeos
- ✅ Feed com todo o conteúdo

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework JavaScript
- **Tailwind CSS** - Framework CSS (via CDN)
- **Babel** - Compilador JavaScript (via CDN)
- **HTML5 / CSS3** - Estrutura e estilo

## 📝 Arquivos Separados

Agora você tem:
- **index.html** - Estrutura HTML e links para os recursos
- **css/styles.css** - Estilos customizados
- **js/app.js** - Toda a lógica da aplicação React

Você pode editar cada arquivo separadamente!

## 🎨 Como Personalizar

### Mudar cores:
Edite `css/styles.css` ou procure por cores no `js/app.js`:
- `teal` → Cor principal
- `green` → Artigos
- `purple` → Vídeos

### Mudar textos:
Edite `js/app.js` e procure pelos textos que quer alterar

### Adicionar funcionalidades:
Edite `js/app.js` e adicione novos componentes React

## ⚠️ Limitações da Versão Atual

- Dados salvos apenas na memória (perdidos ao recarregar)
- Sem backend real
- Sem banco de dados

## 🔄 Próximos Passos para Produção

Para transformar em uma aplicação real, você precisará:
1. Backend (Node.js, PHP, Python, etc.)
2. Banco de dados (MySQL, PostgreSQL, MongoDB)
3. Sistema de autenticação JWT
4. Upload real de arquivos para servidor
5. Hospedagem (Vercel, Heroku, AWS, etc.)

---

Desenvolvido com ❤️ para estudantes de medicina
