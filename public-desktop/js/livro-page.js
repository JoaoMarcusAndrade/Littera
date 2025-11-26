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

    document.getElementById('livro-isbn').textContent = livro.ISBN || 'N/A';
    document.getElementById('livro-descricao').textContent =
      livro.description || livro.descricao || 'Sem descrição disponível.';

    document.title = `${livro.title || 'Livro'} | Littera`;

    const btnAdd = document.querySelector('.btn-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        if (typeof addToCart === 'function') {
          addToCart(livro);
        } else {
          alert('Sistema de carrinho carregando...');
        }
      });
    }

    carregarSemelhantes(livro);

  } catch (err) {
    console.error('Erro ao carregar livro:', err);
    alert('Erro ao carregar informações do livro!');
  }
});