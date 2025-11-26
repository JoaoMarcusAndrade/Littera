const resultados = document.getElementById("resultados");
const resultadoCountEl = document.getElementById("resultado-count");

const urlParams = new URLSearchParams(window.location.search);
const query = (urlParams.get("query") || "").trim();

// Sem query → mensagem simples
if (!query) {
  if (resultadoCountEl) resultadoCountEl.textContent = "";
  if (resultados) resultados.innerHTML = "<p>Nenhuma pesquisa informada.</p>";
} else {
  const qEl = document.getElementById("busca-query");
  if (qEl) qEl.textContent = `"${query}"`;

  buscarLivros();
}

async function buscarLivros() {
  try {
    resultados.innerHTML = "<p>Carregando...</p>";

    // 🔥 Agora a rota está CERTA:
    const resp = await fetch(`/api/livro?q=${encodeURIComponent(query)}`);

    if (!resp.ok) throw new Error("Erro ao consultar a API");

    const dados = await resp.json();

    // Depende de como tua API retorna!!
    const lista = dados.items || dados || [];

    if (lista.length === 0) {
      if (resultadoCountEl) resultadoCountEl.textContent = "0 resultado(s)";
      resultados.innerHTML = "<p>Nenhum livro encontrado.</p>";
      return;
    }

    resultados.innerHTML = "";
    if (resultadoCountEl) resultadoCountEl.textContent = `${lista.length} resultado(s)`;

    lista.forEach((livro) => {
      const card = document.createElement("div");
      card.className = "prod-card";

      card.innerHTML = `
        <img src="${livro.foto_url || './IMG/placeholder.png'}" alt="${escapeHtml(livro.titulo)}">
        <p class="titulo">${escapeHtml(livro.titulo || 'Título indisponível')}</p>
        <p class="preco">R$ ${Number(livro.preco).toFixed(2)}</p>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("livroSelecionado", JSON.stringify(livro));
        window.location.href = "./livro.html";
      });

      resultados.appendChild(card);
    });

  } catch (err) {
    if (resultadoCountEl) resultadoCountEl.textContent = "";
    resultados.innerHTML = "<p>Erro ao buscar livros.</p>";
    console.error(err);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
