function salvarCompraAoFinalizar() {
  const nomeCompleto = document.getElementById('nome-completo')?.value;
  const rua = document.getElementById('rua')?.value;
  const numero = document.getElementById('numero')?.value;
  const complemento = document.getElementById('complemento')?.value || '';
  const bairro = document.getElementById('bairro')?.value;
  const cidade = document.getElementById('cidade')?.value;
  const estado = document.getElementById('estado')?.value;
  const cep = document.getElementById('cep')?.value;
  
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  
  const livrosFormatados = carrinho.map(item => ({
    title: item.title || item.titulo || 'Livro sem título',
    author: item.author || item.autor || (Array.isArray(item.authors) ? item.authors.join(', ') : 'Autor desconhecido'),
    image: item.image || item.capa || item.imagem || item.thumbnail || './img/livro/default.jpg',
    price: typeof item.price === 'string' ? parseFloat(item.price.replace('R$', '').replace(',', '.')) : (item.price || 0),
    quantity: item.quantity || 1
  }));
  
  const total = livrosFormatados.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (typeof saveCompra === 'function') {
    const sucesso = saveCompra({
      nomeCompleto,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      metodoPagamento: selectedPaymentMethod || 'pix',
      livros: livrosFormatados,
      total
    });
    
    if (sucesso) {
      console.log('[Checkout] Compra salva com sucesso!');
      if (typeof updateComprasBadge === 'function') {
        updateComprasBadge();
      }
      if (typeof updateAccountBadge === 'function') {
        updateAccountBadge();
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.salvarCompraAoFinalizar = salvarCompraAoFinalizar;
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const confirmBtn = document.querySelector('.btn-confirm');
    if (confirmBtn) {
      const originalClickHandler = confirmBtn.onclick;
      confirmBtn.addEventListener('click', () => {
        setTimeout(() => {
          salvarCompraAoFinalizar();
        }, 500);
      });
    }
  }, 1000);
});
