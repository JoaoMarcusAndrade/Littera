function getCompras() {
  try {
    return JSON.parse(localStorage.getItem('compras') || '[]');
  } catch (err) {
    console.error('[Compras] Erro ao ler localStorage:', err);
    return [];
  }
}

function saveCompra(dadosCompra) {
  try {
    const compras = getCompras();
    const usuario = getLoggedUser();

    if (!usuario) {
      alert('Você precisa estar logado para finalizar a compra!');
      return false;
    }

    const compra = {
      id: Date.now(),
      usuario: {
        nome: dadosCompra.nomeCompleto,
        email: usuario.email
      },
      endereco: {
        rua: dadosCompra.rua,
        numero: dadosCompra.numero,
        complemento: dadosCompra.complemento || '',
        bairro: dadosCompra.bairro,
        cidade: dadosCompra.cidade,
        estado: dadosCompra.estado,
        cep: dadosCompra.cep
      },
      metodoPagamento: dadosCompra.metodoPagamento,
      livros: dadosCompra.livros,
      total: dadosCompra.total,
      dataCompra: new Date().toLocaleDateString('pt-BR'),
      status: 'Finalizada'
    };

    compras.push(compra);
    localStorage.setItem('compras', JSON.stringify(compras));
    
    console.log('[Compras] Compra salva com sucesso:', compra);
    return true;
  } catch (err) {
    console.error('[Compras] Erro ao salvar compra:', err);
    return false;
  }
}

function openComprasModal() {
  const modal = document.getElementById('compras-modal');
  if (modal) {
    console.log('[Compras] Abrindo modal de compras');
    modal.classList.add('show');
    renderCompras();
  } else {
    console.error('[Compras] Modal não encontrado!');
  }
}

function closeComprasModal() {
  const modal = document.getElementById('compras-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

function renderCompras() {
  const compras = getCompras();
  const usuario = getLoggedUser();
  const container = document.getElementById('compras-lista');

  if (!usuario) {
    container.innerHTML = `
      <div class="sem-compras">
        Você precisa estar logado para ver suas compras.
      </div>
    `;
    return;
  }

  const minhasCompras = compras.filter(c => c.usuario.email === usuario.email);

  if (minhasCompras.length === 0) {
    container.innerHTML = `
      <div class="sem-compras">
        Você ainda não realizou nenhuma compra.
      </div>
    `;
    return;
  }

  container.innerHTML = minhasCompras
    .sort((a, b) => b.id - a.id)
    .map(compra => {
      const enderecoCompleto = `${compra.endereco.rua}, ${compra.endereco.numero}${compra.endereco.complemento ? ' - ' + compra.endereco.complemento : ''} - ${compra.endereco.bairro}, ${compra.endereco.cidade}/${compra.endereco.estado} - CEP: ${compra.endereco.cep}`;
      
      const metodoPagamentoTexto = {
        'cartao-credito': '💳 Cartão de Crédito',
        'cartao-debito': '💳 Cartão de Débito',
        'pix': '📱 PIX',
        'boleto': '📄 Boleto Bancário'
      }[compra.metodoPagamento] || compra.metodoPagamento;

      const livrosHTML = compra.livros.map(livro => {
        const imagemLivro = livro.image || livro.capa || livro.imagem || livro.thumbnail || './img/livro/default.jpg';
        const tituloLivro = livro.title || livro.titulo || 'Livro sem título';
        const autorLivro = livro.author || livro.autor || (Array.isArray(livro.authors) ? livro.authors.join(', ') : 'Autor desconhecido');
        const precoLivro = livro.price || livro.preco || 0;
        const precoNumerico = typeof precoLivro === 'string' ? parseFloat(precoLivro.replace('R$', '').replace(',', '.')) : precoLivro;
        
        return `
          <div class="compra-livro-info">
            <img src="${imagemLivro}" alt="${tituloLivro}" class="compra-livro-capa" onerror="this.src='./img/livro/default.jpg'">
            <div class="compra-livro-detalhes">
              <h3>${tituloLivro}</h3>
              <p><strong>Autor:</strong> ${autorLivro}</p>
              <p><strong>Quantidade:</strong> ${livro.quantity || 1}</p>
              <p><strong>Preço unitário:</strong> R$ ${precoNumerico.toFixed(2)}</p>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="compra-item">
          ${livrosHTML}
          
          <div class="compra-dados">
            <div class="compra-campo">
              <span class="compra-campo-label">👤 Nome Completo</span>
              <div class="compra-campo-valor">${compra.usuario.nome}</div>
            </div>
            
            <div class="compra-campo">
              <span class="compra-campo-label">📧 Email</span>
              <div class="compra-campo-valor">${compra.usuario.email}</div>
            </div>
            
            <div class="compra-campo">
              <span class="compra-campo-label">📍 Endereço de Entrega</span>
              <div class="compra-campo-valor">${enderecoCompleto}</div>
            </div>
            
            <div class="compra-campo">
              <span class="compra-campo-label">💰 Método de Pagamento</span>
              <div class="compra-campo-valor">${metodoPagamentoTexto}</div>
            </div>
          </div>

          <div class="compra-preco-data">
            <div>
              <div class="compra-preco">R$ ${compra.total.toFixed(2)}</div>
              <span class="compra-status ${compra.status.toLowerCase()}">${compra.status}</span>
            </div>
            <div class="compra-data">📅 ${compra.dataCompra}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

function updateComprasBadge() {
  const compras = getCompras();
  const usuario = getLoggedUser();
  
  if (!usuario) return;

  const minhasCompras = compras.filter(c => c.usuario.email === usuario.email);
  const badge = document.getElementById('compras-badge');
  
  if (badge) {
    if (minhasCompras.length > 0) {
      badge.textContent = minhasCompras.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateComprasBadge();
});
