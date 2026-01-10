// PATCH DE PAGAMENTOS - Adicionar ao final do app.js original

// Adicionar 'payments' ao array de estado global (já deve existir)
// let payments = [];

// Adicionar view de pagamentos ao getCurrentView (substituir a função inteira):
/*
const getCurrentView = () => {
  if(currentView==='login') return getLoginView();
  if(currentView==='admin-dashboard') return getAdminDashboard();
  if(currentView==='admin-users') return getAdminUsers();
  if(currentView==='admin-create-article') return getCreateArticle();
  if(currentView==='admin-notifications') return getAdminNotifications();
  if(currentView==='admin-subjects') return getAdminSubjects();
  if(currentView==='admin-feed') return getAdminFeed();
  if(currentView==='admin-payments') return getAdminPayments(); // ADICIONAR
  if(currentView==='user-home') return getUserHome();
  if(currentView==='user-subjects') return getUserSubjectsNetflix();
  if(currentView==='user-subject-detail') return getUserSubjectDetail();
  if(currentView==='user-feed') return getUserFeed();
  if(currentView==='user-payments') return getUserPayments(); // ADICIONAR
  return '';
};
*/

// View Admin Pagamentos
const getAdminPayments = () => {
  const now = new Date();
  return `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">${getHeader()}${getAdminNav('payments')}
    <main class="max-w-6xl mx-auto px-6 py-10">
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
              <div class="flex gap-3">
                <button class="set-payment-btn flex-1 gradient-primary text-white py-3 px-4 rounded-xl font-bold" data-userid="${u.id}" data-username="${u.name}">⚙️ Definir Vencimento</button>
                ${!isPaid?`<button class="register-payment-btn flex-1 gradient-success text-white py-3 px-4 rounded-xl font-bold" data-userid="${u.id}">💰 Registrar Pagamento</button>`:`<button class="mark-unpaid-btn flex-1 gradient-warning text-white py-3 px-4 rounded-xl font-bold" data-userid="${u.id}">↩️ Marcar Pendente</button>`}
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
          <div class="bg-green-50 border-2 border-green-200 p-6 rounded-2xl">
            <p class="text-sm text-green-700 font-bold mb-2">✅ Último Pagamento</p>
            <p class="text-xl text-green-900 font-bold">${payment.paymentDate}</p>
          </div>
        `:''}
      </div>
    </main>
  </div>
`;
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

// Load payments from Firestore
const loadPayments = async () => {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    payments = [];
    snap.forEach(d => payments.push({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error loading payments:', error);
  }
};

// Adicionar event listeners para botões de pagamento ao attachEventListeners:
/*
  document.querySelectorAll('.set-payment-btn').forEach(btn => btn.addEventListener('click', e => window.showSetPaymentModal(e.currentTarget.dataset.userid, e.currentTarget.dataset.username)));
  document.querySelectorAll('.register-payment-btn').forEach(btn => btn.addEventListener('click', e => window.registerPayment(e.currentTarget.dataset.userid)));
  document.querySelectorAll('.mark-unpaid-btn').forEach(btn => btn.addEventListener('click', e => window.markUnpaid(e.currentTarget.dataset.userid)));
*/

// Adicionar loadPayments() ao onAuthStateChanged junto com outros loads:
/*
  await Promise.all([loadUsers(), loadArticles(), loadNotifications(), loadSubjects(), loadPermissions(), loadPosts(), loadFeedPermissions(), loadPayments()]);
*/

