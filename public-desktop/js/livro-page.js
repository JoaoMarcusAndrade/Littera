document.addEventListener('DOMContentLoaded', () => {
  const livroDataStr = localStorage.getItem('livroSelecionado');
  
  if (!livroDataStr) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>Nenhum livro selecionado</h2><a href="index.html">Voltar ao início</a></div>';
    return;
  }

  try {
    const livro = JSON.parse(livroDataStr);

    // Normalização: garante que tenha uma capa
    const capaFinal = livro.foto_url || livro.capa || livro.imagem || livro.imageLinks?.thumbnail || 'https://via.placeholder.com/300x450?text=Sem+Capa';

    // ELEMENTOS
    document.getElementById('livro-capa').src = capaFinal;
    document.getElementById('livro-titulo').textContent = livro.title || livro.titulo || 'Título não disponível';

    const precoStr = livro.preco ? `R$ ${Number(livro.preco).toFixed(2)}` : 'R$ 0,00';
    document.getElementById('livro-preco').textContent = precoStr.replace('R$', '').trim();

    document.getElementById('livro-autor').textContent =
      Array.isArray(livro.authors)
        ? livro.authors.join(', ')
        : livro.autor || 'Autor desconhecido';

    document.getElementById('livro-editora').textContent =
      livro.publisher || livro.publicador || 'Editora desconhecida';

    document.getElementById('livro-paginas').textContent =
      livro.pageCount || livro.paginas || 'Desconhecido';

    document.getElementById('livro-isbn').textContent = livro.isbn || 'N/A';
    document.getElementById('livro-descricao').textContent =
      livro.description || livro.descricao || 'Sem descrição disponível.';

    const estoque = Math.floor(Math.random() * 5) + 1;
    document.getElementById('livro-estoque').textContent = estoque;

    document.title = `${livro.title || 'Livro'} | Littera`;

    // Controles de quantidade
    const qtyMinus = document.querySelector('.qty-btn.minus');
    const qtyPlus = document.querySelector('.qty-btn.plus');
    const qtyInput = document.querySelector('.qty-input');

    if (qtyMinus) {
      qtyMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });
    }

    if (qtyPlus) {
      qtyPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val < estoque) qtyInput.value = val + 1;
      });
    }

    const btnAdd = document.querySelector('.btn-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        if (typeof addToCart === 'function') {
          addToCart(livro, qty);
        } else {
          alert('Sistema de carrinho carregando...');
        }
      });
    }

    // 🔥 Recomendações do banco
    carregarLivrosSimilares(livro);

  } catch (err) {
    console.error('Erro ao carregar livro:', err);
    alert('Erro ao carregar informações do livro!');
  }
});


// ============================================================
// 🔥 BUSCAR LIVROS SIMILARES PELO BANCO
// ============================================================
async function carregarLivrosSimilares(livroAtual) {
  const container = document.getElementById('livros-similares');
  if (!container) return;

  try {
    const genero = livroAtual.genero || livroAtual.categoria || livroAtual.categories?.[0];
    if (!genero) {
      container.innerHTML = '<p style="text-align:center;color:#999;">Sem categoria para buscar similares</p>';
      return;
    }

    const url = `/api/livro?g=${encodeURIComponent(genero)}`;
    
    const resp = await fetch(url);
    const data = await resp.json();

    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#999;">Nenhum livro similar encontrado</p>';
      return;
    }

    container.innerHTML = '';

    data.items.forEach(item => {
      if (item.id === livroAtual.id) return; // evita recomendar o mesmo livro

      const card = document.createElement('div');
      card.className = 'prod-card';
      card.style.cursor = 'pointer';

      const preco = `R$ ${Number(item.preco || 0).toFixed(2)}`;

      card.innerHTML = `
        <img src="${item.foto_url || './IMG/placeholder.png'}" alt="${item.titulo}">
        <p class="titulo">${item.titulo}</p>
        <p class="preco">${preco}</p>
      `;

      card.addEventListener('click', () => {
        localStorage.setItem('livroSelecionado', JSON.stringify(item));
        window.location.reload();
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error('Erro ao carregar similares:', err);
    container.innerHTML = '<p style="text-align:center;color:#999;">Erro ao carregar recomendações</p>';
  }
}