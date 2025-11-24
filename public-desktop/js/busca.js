const resultados = document.getElementById("resultados");
const resultadoCountEl = document.getElementById("resultado-count");
const urlParams = new URLSearchParams(window.location.search);
const query = (urlParams.get("query") || "").trim();

if (!query) {
  if (resultadoCountEl) resultadoCountEl.textContent = "";
  if (resultados) resultados.innerHTML = "<p>Nenhuma pesquisa informada.</p>";
} else {
  // mostra a query no topo (se houver elemento)
  const qEl = document.getElementById('busca-query');
  if (qEl) qEl.textContent = `"${query}"`;

  buscarLivros();
}

async function buscarLivros() {
  try {
    resultados.innerHTML = "<p>Carregando...</p>";
    const url = `/api/livro?q=${encodeURIComponent(query)}&langRestrict=pt&maxResults=20`;
    const resp = await fetch(url);

    if (!resp.ok) throw new Error("Erro ao consultar a API");

    const dados = await resp.json();

    if (!dados.items || dados.items.length === 0) {
      if (resultadoCountEl) resultadoCountEl.textContent = "0 resultados";
      resultados.innerHTML = "<p>Nenhum livro encontrado.</p>";
      return;
    }

    resultados.innerHTML = "";
    if (resultadoCountEl) resultadoCountEl.textContent = `${dados.length} resultado(s)`;

    dados.items.forEach((livro) => {
      const card = document.createElement("div");
      card.className = "prod-card";

      const capa = info.imageLinks?.thumbnail || './img/placeholder.png';


      card.innerHTML = `
        <img src="${livro.foto_url || './IMG/placeholder.png'}" alt="${(livro.titulo || 'Capa')}">
        <p class="titulo">${(livro.title || 'Título indisponível')}</p>
        <p class="preco">R$ ${Number(livro.preco).toFixed(2)}</p>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("livroSelecionado", JSON.stringify(livroData));
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

// pequena função de escape para evitar inserção de HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}