function getReservas() {
  try {
    return JSON.parse(localStorage.getItem('reservas') || '[]');
  } catch (err) {
    console.error('[Reservas] Erro ao ler localStorage:', err);
    return [];
  }
}

function saveReservas(reservas) {
  try {
    localStorage.setItem('reservas', JSON.stringify(reservas));
    updateReservasCount();
    if (typeof updateReservasBadgeIcon === 'function') {
      updateReservasBadgeIcon();
    }
    if (typeof updateAccountBadge === 'function') {
      updateAccountBadge();
    }
  } catch (err) {
    console.error('[Reservas] Erro ao salvar localStorage:', err);
  }
}

function addReserva(livro) {
  const reservas = getReservas();
  const usuario = getLoggedUser();

  if (!usuario) {
    openPopup();
    return false;
  }

  const existe = reservas.find(r => 
    r.livro.title === livro.title && 
    r.usuario.email === usuario.email
  );

  if (existe) {
    alert('Você já tem uma reserva deste livro!');
    return false;
  }

  const reserva = {
    id: Date.now(),
    livro: livro,
    usuario: usuario,
    dataReserva: new Date().toLocaleDateString('pt-BR'),
    status: 'Pendente',
    endereco: {
      rua: 'Rua Eduardo Ferreira França',
      numero: '356',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04175000'
    }
  };

  reservas.push(reserva);
  saveReservas(reservas);
  
  const toast = document.getElementById('toast-reserva');
  if (toast) {
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2500);
  } else {
    alert('Livro reservado com sucesso!');
  }

  return true;
}

function removeReserva(reservaId) {
  if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
  
  let reservas = getReservas();
  reservas = reservas.filter(r => r.id !== reservaId);
  saveReservas(reservas);
  renderReservas();
}

function updateReservasCount() {
  const reservas = getReservas();
  const usuario = getLoggedUser();
  
  if (!usuario) {
    updateReservasBadge(0);
    return;
  }

  const count = reservas.filter(r => r.usuario.email === usuario.email).length;
  updateReservasBadge(count);
}

function updateReservasBadge(count) {
  const badge = document.getElementById('reservas-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
      badge.style.display = 'flex';
    } else {
      badge.classList.add('hidden');
      badge.style.display = 'none';
    }
  }
}

function openReservasModal() {
  const modal = document.getElementById('reservas-modal');
  if (!modal) return;

  const usuario = getLoggedUser();
  if (!usuario) {
    openPopup();
    return;
  }

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  renderReservas();
}

function closeReservasModal() {
  const modal = document.getElementById('reservas-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

function renderReservas() {
  const container = document.getElementById('reservas-container');
  const totalEl = document.getElementById('reservas-total-count');
  
  if (!container) return;

  const usuario = getLoggedUser();
  if (!usuario) {
    container.innerHTML = '<div class="reservas-empty"><div class="reservas-empty-icon">📚</div><p>Faça login para ver suas reservas</p></div>';
    if (totalEl) totalEl.textContent = '0 reservas';
    return;
  }

  const todasReservas = getReservas();
  const minhasReservas = todasReservas.filter(r => r.usuario.email === usuario.email);

  if (minhasReservas.length === 0) {
    container.innerHTML = '<div class="reservas-empty"><div class="reservas-empty-icon">📚</div><p>Você ainda não tem reservas</p></div>';
    if (totalEl) totalEl.textContent = '0 reservas';
    return;
  }

  let html = '';
  minhasReservas.forEach(reserva => {
    const livro = reserva.livro;
    const capa = livro.capa || livro.imagem || 'https://via.placeholder.com/120x170?text=Sem+Capa';
    const autor = Array.isArray(livro.authors) 
      ? livro.authors.join(', ') 
      : (livro.autor || 'Autor desconhecido');

    html += `
      <div class="reserva-item" data-id="${reserva.id}">
        <img src="${capa}" alt="${livro.title}" class="reserva-capa">
        <div class="reserva-info">
          <h3 class="reserva-titulo">${livro.title}</h3>
          <p class="reserva-autor">por ${autor}</p>
          
          <div class="reserva-detalhes">
            <div class="reserva-detalhes-item">
              <strong>Data da Reserva:</strong>
              <span>${reserva.dataReserva}</span>
            </div>
            
            <div class="reserva-detalhes-item">
              <strong>Reservado por:</strong>
              <span>${reserva.usuario.nome}</span>
            </div>
            
            <div class="reserva-detalhes-item">
              <strong>Status:</strong>
              <span class="reserva-situacao-badge">${reserva.status}</span>
            </div>
          </div>

          <div class="reserva-endereco">
            <p><strong>Informações da Reserva:</strong></p>
            <p>Você tem 3 dias para retirar o livro reservado em nossa loja. Após esse período, a reserva será cancelada automaticamente.</p>
          </div>

          <div class="reserva-situacao">
            <button class="reserva-btn-visualizar" onclick="alert('Instruções de retirada serão enviadas por email')">
              VER DETALHES DA RESERVA
            </button>
          </div>
        </div>
        <button class="reserva-remove" onclick="removeReserva(${reserva.id})" title="Cancelar reserva">🗑</button>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalEl) {
    totalEl.textContent = `${minhasReservas.length} reserva${minhasReservas.length !== 1 ? 's' : ''}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const reservasModalMarkup = `
    <div id="reservas-modal" class="reservas-modal">
      <div class="reservas-overlay">
        <div class="reservas-content">
          <div class="reservas-header">
            <h1>MINHAS RESERVAS</h1>
            <button class="reservas-close" onclick="closeReservasModal()">&times;</button>
          </div>
          <div class="reservas-body" id="reservas-container">
            <div class="reservas-empty">
              <div class="reservas-empty-icon">📚</div>
              <p>Você ainda não tem reservas</p>
            </div>
          </div>
          <div class="reservas-footer">
            <span class="reservas-total" id="reservas-total-count">0 reservas</span>
            <button class="btn-voltar-reservas" onclick="closeReservasModal()">← VOLTAR</button>
          </div>
        </div>
      </div>
    </div>

    <div id="toast-reserva" style="
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #5a8f3d;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      display: none;
      font-weight: 600;
      animation: slideInRight 0.3s ease-out;
    ">
      ✓ Livro reservado com sucesso!
    </div>
  `;

  if (document.body && !document.getElementById('reservas-modal')) {
    document.body.insertAdjacentHTML('beforeend', reservasModalMarkup);
  }

  const reservasBtnId = document.getElementById('accountReservationsBtn');
  if (reservasBtnId) {
    reservasBtnId.addEventListener('click', () => {
      closeAccountModal();
      openReservasModal();
    });
  }

  const modal = document.getElementById('reservas-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('reservas-overlay')) {
        closeReservasModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('show')) {
      closeReservasModal();
    }
  });

  updateReservasCount();
});

if (typeof window !== 'undefined') {
  window.addReserva = addReserva;
  window.removeReserva = removeReserva;
  window.openReservasModal = openReservasModal;
  window.closeReservasModal = closeReservasModal;
}
