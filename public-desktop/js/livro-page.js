document.addEventListener('DOMContentLoaded', () => {
  const livroDataStr = localStorage.getItem('livroSelecionado');
  
  if (!livroDataStr) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>Nenhum livro selecionado</h2><a href="index.html">Voltar ao início</a></div>';
    return;
  }

  try {
    const livro = JSON.parse(livroDataStr);
    
    const capaEl = document.getElementById('livro-capa');
    const tituloEl = document.getElementById('livro-titulo');
    const precoEl = document.getElementById('livro-preco');
    const autorEl = document.getElementById('livro-autor');
    const editoraEl = document.getElementById('livro-editora');
    const paginasEl = document.getElementById('livro-paginas');
    const isbnEl = document.getElementById('livro-isbn');
    const descricaoEl = document.getElementById('livro-descricao');
    const estoqueEl = document.getElementById('livro-estoque');

    if (capaEl) capaEl.src = livro.capa || livro.imagem || 'https://via.placeholder.com/300x450?text=Sem+Capa';
    if (tituloEl) tituloEl.textContent = livro.title || livro.titulo || 'Título não disponível';
    
    const precoStr = livro.preco || 'R$ 0,00';
    if (precoEl) precoEl.textContent = precoStr.replace('R$', '').trim();
    
    const autores = Array.isArray(livro.authors) 
      ? livro.authors.join(', ') 
      : (livro.autor || 'Autor desconhecido');
    if (autorEl) autorEl.textContent = autores;
    
    if (editoraEl) editoraEl.textContent = livro.publisher || livro.publicador || 'Editora desconhecida';
    if (paginasEl) paginasEl.textContent = livro.pageCount || livro.paginas || 'Desconhecido';
    if (isbnEl) isbnEl.textContent = livro.isbn || 'N/A';
    if (descricaoEl) descricaoEl.textContent = livro.description || livro.descricao || 'Sem descrição disponível.';
    if (estoqueEl) estoqueEl.textContent = Math.floor(Math.random() * 5) + 1;

    document.title = `${livro.title || 'Livro'} | Littera`;

    const qtyMinus = document.querySelectorAll('.qty-btn')[0];
    const qtyPlus = document.querySelectorAll('.qty-btn')[1];
    const qtyInput = document.querySelector('.qty-input');

    if (qtyMinus) {
      qtyMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) {
          qtyInput.value = val - 1;
        }
      });
    }

    if (qtyPlus) {
      qtyPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        const estoque = parseInt(estoqueEl?.textContent || 10);
        if (val < estoque) {
          qtyInput.value = val + 1;
        }
      });
    }

    const btnAdd = document.querySelector('.btn-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const qty = parseInt(qtyInput?.value || 1);
        if (typeof addToCart === 'function') {
          addToCart(livro, qty);
        } else {
          alert('Sistema de carrinho carregando...');
        }
      });
    }

    carregarLivrosSimilares(livro);

  } catch (err) {
    console.error('Erro ao carregar livro:', err);
    alert('Erro ao carregar informações do livro!');
  }
});

async function carregarLivrosSimilares(livroAtual) {
  const container = document.getElementById('livros-similares');
  if (!container) return;

  try {
    const categoria = livroAtual.categories?.[0] || 'ficção';
    const query = encodeURIComponent(categoria);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=pt&maxResults=8`;
    
    const resp = await fetch(url);
    const data = await resp.json();

    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#999;">Nenhum livro similar encontrado</p>';
      return;
    }

    container.innerHTML = '';

    data.items.forEach(item => {
      const info = item.volumeInfo;
      if (!info.imageLinks?.thumbnail) return;

      const card = document.createElement('div');
      card.className = 'prod-card';
      card.style.cursor = 'pointer';

      const preco = `R$ ${(Math.random() * 40 + 10).toFixed(2)}`;

      card.innerHTML = `
        <img src="${info.imageLinks.thumbnail}" alt="${info.title}">
        <p class="titulo">${info.title}</p>
        <p class="preco">${preco}</p>
      `;

      card.addEventListener('click', () => {
        const livroData = {
          id: item.id,
          title: info.title,
          titulo: info.title,
          authors: info.authors || [],
          autor: (info.authors || []).join(', '),
          description: info.description || 'Sem descrição disponível.',
          descricao: info.description || 'Sem descrição disponível.',
          capa: info.imageLinks?.thumbnail || '',
          imagem: info.imageLinks?.thumbnail || '',
          imageLinks: info.imageLinks || {},
          preco: preco,
          publisher: info.publisher || 'Editora Desconhecida',
          publicador: info.publisher || 'Editora Desconhecida',
          publishedDate: info.publishedDate || 'Data desconhecida',
          dataPublicacao: info.publishedDate || 'Data desconhecida',
          pageCount: info.pageCount || 'Desconhecido',
          paginas: info.pageCount || 'Desconhecido',
          isbn: info.industryIdentifiers?.[0]?.identifier || 'N/A',
          categories: info.categories || []
        };

        localStorage.setItem('livroSelecionado', JSON.stringify(livroData));
        window.location.reload();
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error('Erro ao carregar similares:', err);
    container.innerHTML = '<p style="text-align:center;color:#999;">Erro ao carregar recomendações</p>';
  }
}
