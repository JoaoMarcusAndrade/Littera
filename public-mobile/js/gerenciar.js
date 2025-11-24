// gerenciar.js — controle da página de gerenciamento

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[Littera] Gerenciar carregado");

  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("close-btn");
  const overlay = document.getElementById("overlay");
  const listaLivros = document.getElementById("lista-livros");
  const modal = document.getElementById("modal-editar");
  const fecharEditar = document.getElementById("fechar-editar");
  const formEditar = document.getElementById("form-editar");

  let response = await fetch('/api/livro');
  let livros = await response.json();

  let livroEditandoIndex = null;

  // ---------- renderizar ----------
  function renderizar() {
    listaLivros.innerHTML = "";
    if (livros.length === 0) {
      listaLivros.innerHTML = "<p class='vazio'>Nenhum livro cadastrado ainda.</p>";
      return;
    }

    livros.forEach((livro, i) => {
      const card = document.createElement("div");
      card.className = "card-livro";
      card.innerHTML = `
        <img src="${livro.foto_url || './IMG/placeholder.png'}" alt="${livro.titulo}" class="capa-livro">
        <div class="info-livro">
          <h3>${livro.titulo}</h3>
          <p><strong>Autor:</strong> ${livro.autor || ''}</p>
          <p><strong>Editora:</strong> ${livro.editora || ''}</p>
          <p><strong>ISBN:</strong> ${livro.ISBN || '—'}</p>
          <p><strong>Preço:</strong> ${livro.preco}</p>
          <div class="acoes">
            <button class="btn-editar" data-index="${i}"><i class="fa-solid fa-pen"></i> Editar</button>
            <button class="btn-excluir" data-index="${i}"><i class="fa-solid fa-trash"></i> Excluir</button>
          </div>
        </div>
      `;
      listaLivros.appendChild(card);
    });
  }

  renderizar();

  // ---------- excluir ----------
  listaLivros.addEventListener("click", async (e) => {
    if (e.target.closest(".btn-excluir")) {
      const index = e.target.closest(".btn-excluir").dataset.index;
      if (confirm("Deseja realmente excluir este livro?")) {
        const id = livros[index].id_livro;
        try {
          const response = await fetch(`/api/livro/${id}`, {
            method: "DELETE"
          });

          if (!response.ok) throw new Error("Falha no delete");

          livros.splice(index, 1); // remove da lista local
          renderizar();

        } catch (err) {
          console.error(err);
          alert('Erro ao excluir livro')

        }
      }
    }
  });

  // ---------- abrir modal editar ----------
  listaLivros.addEventListener("click", (e) => {
    if (e.target.closest(".btn-editar")) {
      const index = e.target.closest(".btn-editar").dataset.index;
      livroEditandoIndex = index;
      const livro = livros[index];

      document.getElementById("editar-titulo").value = livro.titulo;
      document.getElementById("editar-autor").value = livro.autor;
      document.getElementById("editar-editora").value = livro.editora;
      document.getElementById("editar-isbn").value = livro.ISBN;
      document.getElementById("editar-descricao").value = livro.descricao;

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });

  // ---------- fechar modal ----------
  fecharEditar.addEventListener("click", fecharModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  function fecharModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
  const imagemInput = document.getElementById("editar-imagem");
  const preview = document.getElementById("preview");

  if (imagemInput && preview) {
    imagemInput.addEventListener("change", () => {
      const arquivo = imagemInput.files[0];
      if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = (e) => (preview.src = e.target.result);
        leitor.readAsDataURL(arquivo);
      }
    });
  }

  // ---------- salvar alterações ----------
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (livroEditandoIndex === null) return;

    const atualizado = {
      ...livros[livroEditandoIndex],
      titulo: document.getElementById("editar-titulo").value,
      autor: document.getElementById("editar-autor").value,
      nacionalidade: document.getElementById("editar-nacionalidade").value,
      editora: document.getElementById("editar-editora").value,
      paginas: document.getElementById("editar-paginas").value,
      preco: document.getElementById("editar-preco").value,
      ISBN: document.getElementById("editar-isbn").value,
      genero: document.getElementById("editar-genero").value,
      estado_conservacao: document.getElementById("editar-estado_concervacao").value,
      descricao: document.getElementById("editar-descricao").value,
      metodo_aquisicao: document.getElementById("editar-metodo_aquisicao").value,
      foto_url: preview.src
    };

    livros[livroEditandoIndex] = atualizado;
    const id = livros[livroEditandoIndex].id_livro;

    const response = await fetch(`/api/livro/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(atualizado)
    });

    if (!response.ok) {
      alert("Erro ao atualizar livro");
      return;
    }

    alert("Livro atualizado com sucesso!");
    fecharModal();
    renderizar();
  });


  // ====== MENU LATERAL ======
  if (menuBtn && sidebar && closeBtn && overlay) {
    menuBtn.addEventListener("click", () => {
      sidebar.style.width = "320px";
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    function fecharMenu() {
      sidebar.style.width = "0";
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", fecharMenu);
    overlay.addEventListener("click", fecharMenu);
  }
});
