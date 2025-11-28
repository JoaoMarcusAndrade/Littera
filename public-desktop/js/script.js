import { openPopup } from "./auth.js";
// =======================================================
// script.js - Versão organizada, sem duplicações e com carrosséis funcionando
// =======================================================

function setCookie(nome, valor, dias = 7) {
  const data = new Date();
  data.setTime(data.getTime() + (dias * 24 * 60 * 60 * 1000));
  const expiracao = "expires=" + data.toUTCString();
  document.cookie = `${nome}=${valor};${expiracao};path=/`;
}

function getCookie(nome) {
  const nomeEQ = nome + "=";
  const partes = document.cookie.split(";");

  for (let parte of partes) {
    parte = parte.trim();
    if (parte.indexOf(nomeEQ) === 0) {
      return parte.substring(nomeEQ.length);
    }
  }
  return null;
}

// =======================================================
// CARRINHO - Funções globais
// =======================================================

function openCart() {
  const user = getCookie();
  if (!user) {
    openPopup();
    return;
  }

  console.log('[openCart] Abrindo carrinho');
  const modal = document.getElementById('cart-modal');
  if (modal) {
    console.log('[openCart] Modal encontrado, adicionando classe show');
    modal.classList.add('show');
    renderCart();
  } else {
    console.error('[openCart] Modal NÃO encontrado!');
  }
}

function closeCart() {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}
function getCart() {
  return JSON.parse(localStorage.getItem('carrinho') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('carrinho', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = count;
}

function addToCart(livro) {
  const user = getLoggedUser();
  if (!user) {
    openPopup(); // usuário não logado → abre popup
    return;
  }

  const cart = getCart();

  // procurar se o livro já existe no carrinho
  const existente = cart.find(item => 
    item.titulo === livro.titulo ||
    item.title === livro.title
  );

  if (existente) {
    // se já existe, só aumenta a quantidade
    existente.quantity = (existente.quantity || 1) + 1;
  } else {
    // se não existe, cria item novo com quantity = 1
    cart.push({
      ...livro,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();

  // --- animação do ícone do carrinho ---
  const icon = document.getElementById('carrinho-icon');
  if (icon) {
    icon.style.transform = 'scale(1.2)';
    setTimeout(() => icon.style.transform = '', 300);
  }

  // --- toast ---
  const toast = document.getElementById('toast');
  if (toast) {
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
  }
}


function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items-container');

  if (!container) {
    console.warn('[renderCart] Container não encontrado');
    return;
  }

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-items-empty">Seu carrinho está vazio</div>';
    updateCartTotal(0);
    return;
  }

  let html = '';
  let total = 0;

  cart.forEach((item, index) => {
    const price = parseFloat(item.preco?.replace('R$', '').replace(',', '.')) || 0;
    const itemTotal = price * item.quantity;
    total += itemTotal;

    const capa = item.capa || item.imagem || 'https://via.placeholder.com/100x140.png?text=Sem+Capa';
    const authors = Array.isArray(item.authors) ? item.authors.join(', ') : (item.authors || 'Autor desconhecido');

    html += `
      <div class="cart-item" data-index="${index}">
        <input type="checkbox" class="cart-item-checkbox" data-index="${index}">
        <img src="${capa}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-author">por ${authors}</div>
        </div>
        <div class="cart-item-price">${item.preco || 'R$ 0,00'}</div>
        <div class="cart-item-qty">
          <button class="qty-btn qty-minus" data-index="${index}">−</button>
          <input type="number" class="qty-input" value="${item.quantity}" data-index="${index}" min="1">
          <button class="qty-btn qty-plus" data-index="${index}">+</button>
        </div>
        <button class="cart-item-remove" data-index="${index}" title="Remover item">🗑</button>
      </div>
    `;
  });

  container.innerHTML = html;
  updateCartTotal(total);
  attachCartEventListeners();
}

function updateCartTotal(total) {
  const totalEl = document.getElementById('cart-total');
  const footerMiddle = document.querySelector('.cart-footer-middle span');
  const count = getCart().length;

  if (totalEl) {
    totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }

  if (footerMiddle) {
    footerMiddle.innerHTML = `Subtotal (${count} produto${count !== 1 ? 's' : ''}): <strong id="cart-total">R$ ${total.toFixed(2).replace('.', ',')}</strong>`;
  }
}

function attachCartEventListeners() {
  // Remove buttons
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = getCart();
      cart.splice(index, 1);
      saveCart(cart);
      updateCartCount();
      renderCart();
    });
  });

  // Qty minus
  document.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = getCart();
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart(cart);
        updateCartCount();
        renderCart();
      }
    });
  });

  // Qty plus
  document.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = getCart();
      cart[index].quantity++;
      saveCart(cart);
      updateCartCount();
      renderCart();
    });
  });

  // Qty input
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = e.target.dataset.index;
      let value = parseInt(e.target.value) || 1;
      if (value < 1) value = 1;

      const cart = getCart();
      cart[index].quantity = value;
      saveCart(cart);
      updateCartCount();
      renderCart();
    });
  });

  // Select all checkbox
  const selectAllCheckbox = document.getElementById('cart-select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[script] DOM carregado");

  // ---------- utilidades ----------
  const qs = (id) => document.getElementById(id);
  const safeText = (id, text) => { const el = qs(id); if (el) el.innerText = text; };

  // =======================================================
  // RESERVA DE LIVROS (3 DIAS)
  // =======================================================
  function getReservations() {
    return JSON.parse(localStorage.getItem('reservas') || '[]');
  }

  function saveReservations(res) {
    localStorage.setItem('reservas', JSON.stringify(res));
  }

  function reservarLivro(book) {
    const reservas = getReservations();

    const jaExiste = reservas.find(item => item.isbn === book.isbn);
    if (jaExiste) {
      alert("Este livro já está reservado!");
      return;
    }

    const agora = new Date();
    const expiracao = new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000);

    reservas.push({
      ...book,
      reservadoEm: agora.toISOString(),
      expiraEm: expiracao.toISOString()
    });

    saveReservations(reservas);

    alert("Livro reservado por 3 dias!");
  }


  // =======================================================
  // QUANTIDADE BUTTONS (+ e -)
  // =======================================================
  const qtyInput = document.querySelector(".qty-input");
  const qtyBtns = document.querySelectorAll(".qty-btn");

  if (qtyInput && qtyBtns.length === 2) {
    const minusBtn = qtyBtns[0];
    const plusBtn = qtyBtns[1];

    minusBtn.addEventListener("click", () => {
      let currentValue = parseInt(qtyInput.value) || 1;
      if (currentValue > 1) {
        qtyInput.value = currentValue - 1;
      }
    });

    plusBtn.addEventListener("click", () => {
      let currentValue = parseInt(qtyInput.value) || 1;
      const maxStock = parseInt(document.querySelector("#livro-estoque")?.innerText) || 99;
      if (currentValue < maxStock) {
        qtyInput.value = currentValue + 1;
      }
    });

    qtyInput.addEventListener("change", () => {
      let value = parseInt(qtyInput.value) || 1;
      const maxStock = parseInt(document.querySelector("#livro-estoque")?.innerText) || 99;
      if (value < 1) qtyInput.value = 1;
      if (value > maxStock) qtyInput.value = maxStock;
    });
  }

  // =======================================================
  // CLIQUE EM LIVROS
  // =======================================================
  function aplicarCliqueLivro(card, livroInfo) {
    if (!card) return;
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      localStorage.setItem("livroSelecionado", JSON.stringify(livroInfo));
      window.location.href = "livro.html";
    });
  }

  // =======================================================
  // MENU LATERAL
  // =======================================================
  const menuBtn = qs("menu-btn");
  const sidebar = qs("sidebar");
  const closeBtn = qs("close-btn");
  const overlay = qs("overlay"); // AGORA EXISTE

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

  // =======================================================
  // CARRINHO - EVENT LISTENERS
  // =======================================================
  const closeCartBtn = document.getElementById('close-cart');
  const cartModal = document.getElementById('cart-modal');
  const cartOverlay = document.querySelector('.cart-modal-overlay');

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCart);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) {
        closeCart();
      }
    });
  }

  // =======================================================
  // livro.html — CARREGAR LIVRO
  // =======================================================
  if (window.location.pathname.includes("livro.html")) {
    const livroData = localStorage.getItem("livroSelecionado");

    if (!livroData) {
      safeText("livro-titulo", "Livro não encontrado");
      return;
    }

    const btnReservar = document.getElementById("btn-reservar");

    if (btnReservar) {
      btnReservar.addEventListener("click", () => {
        reservarLivro(livro);
      });
    }


    const livro = JSON.parse(livroData);

    safeText("livro-titulo", livro.title || livro.titulo || "Livro sem título");
    safeText("livro-autor", livro.authors?.join(", ") || livro.autor || "Autor desconhecido");
    safeText("livro-paginas", livro.pageCount || livro.paginas || "--");
    safeText("livro-editora", livro.publisher || livro.publicador || livro.editora || "Desconhecida");
    safeText("livro-isbn", livro.isbn || "Não informado");
    safeText("livro-preco", livro.preco || "R$ 39,90");
    safeText("livro-descricao", livro.description || livro.descricao || "Sem descrição disponível.");

    const capaEl = qs("livro-capa");
    if (capaEl)
      capaEl.src = livro.capa || livro.imageLinks?.thumbnail || livro.imagem || "https://via.placeholder.com/260x380.png?text=Sem+Capa";

    carregarSemelhantes(livro.authors?.[0] || livro.title);
  }

  // =======================================================
  // CARROSSEL PRINCIPAL (BANNERS)
  // =======================================================

  function attachBannerCarousel() {
    // SELECIONA O NOVO CONTÊINER
    const containerEl = document.querySelector(".banner-carousel-container");
    if (!containerEl) return;

    // SELECIONA AS NOVAS CLASSES
    const track = containerEl.querySelector(".banner-track");
    const items = containerEl.querySelectorAll(".banner-item");
    const dots = containerEl.querySelectorAll(".banner-dot");

    if (items.length === 0 || dots.length === 0) return; // Garante que há itens e dots

    let currentIndex = 0;
    const intervalTime = 5000; // Troca a cada 5 segundos
    let intervalId;

    // Apenas o trecho da função com a mudança
    function moveToSlide(index) {
      // 1. Calcula a posição do slide em pixels

      // --- MUDANÇA CRÍTICA AQUI ---
      // Pega a largura do contêiner 'banner-carousel-container'
      // O JS usa window.innerWidth se o elemento não for encontrado ou não tiver largura.
      const containerWidth = containerEl.getBoundingClientRect().width;
      // Se a largura for 0, tente obter a largura do primeiro item para uma estimativa segura.
      if (containerWidth === 0 && items.length > 0) {
        containerWidth = items[0].offsetWidth;
      }

      // Calcula a posição de translação
      const position = -index * containerWidth;

      // 2. Aplica o movimento ao track
      track.style.transform = `translateX(${position}px)`;
      // ... restante da função (dots)
      // ...
    }
    // ... restante da função

    function nextSlide() {
      let newIndex = currentIndex + 1;
      if (newIndex >= items.length) {
        newIndex = 0;
      }
      moveToSlide(newIndex);
    }

    function startInterval() {
      clearInterval(intervalId);
      intervalId = setInterval(nextSlide, intervalTime);
    }

    // Anexa o evento de clique nos indicadores
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        moveToSlide(index);
        startInterval(); // Reinicia o timer ao clicar
      });
    });

    moveToSlide(0);
    startInterval();

    // Adiciona listener de redimensionamento para recalcular a posição
    window.addEventListener('resize', () => {
      // Reposiciona o slide visível com base na nova largura da tela
      moveToSlide(currentIndex);
    });
  }

  // =======================================================
  // RECOMENDADOS (CARROSSEL)
  // =======================================================
async function carregarSemelhantes(livroAtual) {
  const container = document.getElementById("livros-similares");
  if (!container) return;

  try {
    const genero = livroAtual.genero || livroAtual.categoria || livroAtual.categories?.[0];

    if (!genero) {
      container.innerHTML = '<p style="text-align:center;color:#999;">Sem categoria para buscar similares</p>';
      return;
    }

    const url = `/api/livro?genero=${encodeURIComponent(genero)}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!dados.items || dados.items.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#999;">Nenhum livro similar encontrado</p>';
      return;
    }

    // --- Monta o layout ---
    container.innerHTML = `
      <div class="produtos-carousel recomendados-carousel">
        <button class="prod-seta esquerda">&#8249;</button>
        <div class="produtos-track recomendados-track"></div>
        <button class="prod-seta direita">&#8250;</button>
      </div>
    `;

    const track = container.querySelector(".recomendados-track");

    dados.items.forEach(item => {
      const card = document.createElement("div");
      card.className = "prod-card";

      card.innerHTML = `
        <img src="${item.foto_url || './IMG/placeholder.png'}" alt="${item.titulo}">
        <p class="titulo">${item.titulo}</p>
        <p class="preco">R$ ${Number(item.preco).toFixed(2)}</p>
      `;

      // clique → salvar e abrir página
      card.addEventListener("click", () => {
        localStorage.setItem("livroSelecionado", JSON.stringify(item));
        window.location.href = "./livro.html";
      });

      track.appendChild(card);
    });

    attachCarouselControls(container.querySelector(".recomendados-carousel"));

  } catch (erro) {
    console.error("[carregarSemelhantes] Erro:", erro);
    container.innerHTML = '<p style="text-align:center;color:#999;">Erro ao carregar recomendações</p>';
  }
}



  // =======================================================
  // ROMANCES POPULARES
  // =======================================================
  async function carregarRomance() {
    const track = document.querySelector(".romance-track");
    if (!track) return;

    try {
      // Consulta: /api/livro?genero=Romance
      const resposta = await fetch('/api/livro?genero=Romance');
      const dados = await resposta.json(); // <- isso é um array direto

      track.innerHTML = "";

      if (!dados || dados.length === 0) {
        track.innerHTML = "<p>Nenhum livro encontrado nesta categoria.</p>";
        return;
      }

      dados.forEach(livro => {
        if (!livro.foto_url) return;

        const card = document.createElement("div");


        const preco = parseFloat(String(livro.preco).replace(",", "."));

        card.className = "prod-card";
        card.innerHTML = `
        <img src="${livro.foto_url}" alt="${livro.titulo}" class="capa-livro">
        <p class="titulo">${livro.titulo}</p>
        <p class="preco">R$ ${(!isNaN(preco) ? preco : 0).toFixed(2)}</p>
      `;

        aplicarCliqueLivro(card, livro);
        track.appendChild(card);
      });

      attachCarouselControls(document.querySelector(".romance-carousel"));
    } catch (e) {
      console.error("[romance] Erro ao carregar romances:", e);
    }
  }


  carregarRomance();

  // =======================================================
  // FICÇÃO CIENTÍFICA
  // =======================================================
  async function carregarFiccao() {
    const track = document.querySelector(".ficcao-track");
    if (!track) return;
        try {
      // Consulta: /api/livro?genero=Romance
      const resposta = await fetch('/api/livro?genero=Ficção');
      const dados = await resposta.json(); // <- isso é um array direto

      track.innerHTML = "";

      if (!dados || dados.length === 0) {
        track.innerHTML = "<p>Nenhum livro encontrado nesta categoria.</p>";
        return;
      }

      dados.forEach(livro => {
        if (!livro.foto_url) return;

        const card = document.createElement("div");

        const preco = parseFloat(String(livro.preco).replace(",", "."));

        card.className = "prod-card";
        card.innerHTML = `
        <img src="${livro.foto_url}" alt="${livro.titulo}" class="capa-livro">
        <p class="titulo">${livro.titulo}</p>
        <p class="preco">R$ ${(!isNaN(preco) ? preco : 0).toFixed(2)}</p>
      `;

        aplicarCliqueLivro(card, livro);
        track.appendChild(card);
      });

      attachCarouselControls(document.querySelector(".ficcao-carousel"));
    } catch (e) {
      console.error("[ficção] Erro ao carregar ficção:", e);
    }

  }

carregarFiccao();

  // =======================================================
  // AVENTURA E MISTÉRIO
  // =======================================================
  async function carregarAventura() {
    const track = document.querySelector(".aventura-track");
    if (!track) return;

    try {
      // Consulta: /api/livro?genero=Romance
      const resposta = await fetch('/api/livro?genero=Aventura');
      const dados = await resposta.json(); // <- isso é um array direto

      track.innerHTML = "";

      if (!dados || dados.length === 0) {
        track.innerHTML = "<p>Nenhum livro encontrado nesta categoria.</p>";
        return;
      }

      dados.forEach(livro => {
        if (!livro.foto_url) return;

        const card = document.createElement("div");

        const preco = parseFloat(String(livro.preco).replace(",", "."));

        card.className = "prod-card";
        card.innerHTML = `
        <img src="${livro.foto_url}" alt="${livro.titulo}" class="capa-livro">
        <p class="titulo">${livro.titulo}</p>
        <p class="preco">R$ ${(!isNaN(preco) ? preco : 0).toFixed(2)}</p>
      `;

        aplicarCliqueLivro(card, livro);
        track.appendChild(card);
      });

      attachCarouselControls(document.querySelector(".ficcao-carousel"));
    } catch (e) {
      console.error("[romance] Erro ao carregar ficção cientifica:", e);
    }
  }

  carregarAventura();

  // =======================================================
  // FILOSOFIA
  // =======================================================
  async function carregarFilosofia() {
    const track = document.querySelector(".filosofia-track");
    if (!track) return;
        try {
      // Consulta: /api/livro?genero=Romance
      const resposta = await fetch('/api/livro?genero=Filosofia');
      const dados = await resposta.json(); // <- isso é um array direto

      track.innerHTML = "";

      if (!dados || dados.length === 0) {
        track.innerHTML = "<p>Nenhum livro encontrado nesta categoria.</p>";
        return;
      }

      dados.forEach(livro => {
        if (!livro.foto_url) return;

        const card = document.createElement("div");

        const preco = parseFloat(String(livro.preco).replace(",", "."));

        card.className = "prod-card";
        card.innerHTML = `
        <img src="${livro.foto_url}" alt="${livro.titulo}" class="capa-livro">
        <p class="titulo">${livro.titulo}</p>
        <p class="preco">R$ ${(!isNaN(preco) ? preco : 0).toFixed(2)}</p>
      `;

        aplicarCliqueLivro(card, livro);
        track.appendChild(card);
      });

      attachCarouselControls(document.querySelector(".filosofia-carousel"));
    } catch (e) {
      console.error("[romance] Erro ao carregar filosofia:", e);
    }

  }

  carregarFilosofia();

  // =======================================================
  // HISTÓRIAS EM QUADRINHOS
  // =======================================================
  async function carregarHQs() {
    const track = document.querySelector(".hqs-track");
    if (!track) return;
    try {
      // Consulta: /api/livro?genero=Romance
      const resposta = await fetch('/api/livro?genero=HQ');
      const dados = await resposta.json(); // <- isso é um array direto

      track.innerHTML = "";

      if (!dados || dados.length === 0) {
        track.innerHTML = "<p>Nenhum livro encontrado nesta categoria.</p>";
        return;
      }

      dados.forEach(livro => {
        if (!livro.foto_url) return;

        const card = document.createElement("div");

        const preco = parseFloat(String(livro.preco).replace(",", "."));

        card.className = "prod-card";
        card.innerHTML = `
        <img src="${livro.foto_url}" alt="${livro.titulo}" class="capa-livro">
        <p class="titulo">${livro.titulo}</p>
        <p class="preco">R$ ${(!isNaN(preco) ? preco : 0).toFixed(2)}</p>
      `;

        aplicarCliqueLivro(card, livro);
        track.appendChild(card);
      });

      attachCarouselControls(document.querySelector(".hqs-carousel"));
    } catch (e) {
      console.error("[romance] Erro ao carregar HQs:", e);
    }

  }

  carregarHQs();

  // =======================================================
  // CONTROLES DE CARROSSEL (melhor cálculo de step e limites)
  // =======================================================
  function attachCarouselControls(containerEl) {
    if (!containerEl) return;

    const btnPrev = containerEl.querySelector(".esquerda");
    const btnNext = containerEl.querySelector(".direita");
    // Seleciona o primeiro elemento track válido dentro do container
    const track = containerEl.querySelector(".produtos-track, .mv-track, .recomendados-track, .romance-track, .ficcao-track, .aventura-track, .filosofia-track, .hqs-track");

    if (!track) return;

    // 1. GARANTE O ESTADO INICIAL
    if (!track.dataset.position) {
      track.dataset.position = 0;
      track.style.transform = 'translateX(0px)';
    }
    track.style.willChange = 'transform';

    function getViewport() {
      // Tenta encontrar o elemento que tem overflow:hidden ou volta ao pai
      const containerViewport = containerEl.querySelector('.produtos-track-container') || track.parentElement;
      return containerViewport;
    }

    // 2. CORREÇÃO PRINCIPAL: O passo é a largura da viewport, não a de um card.
    function step() {
      const viewport = getViewport();
      // O passo de movimento será a largura da área visível (Viewport)
      return Math.round(viewport.getBoundingClientRect().width);
    }

    function updatePosition(delta) {
      let pos = Math.round(parseFloat(track.dataset.position) || 0);
      pos += Math.round(delta);

      const viewport = getViewport();
      const viewportWidth = Math.round(viewport.getBoundingClientRect().width);

      // scrollWidth é a largura total do conteúdo do track
      const maxScroll = Math.max(0, Math.round(track.scrollWidth) - viewportWidth);

      // Limita a posição entre o início (0) e o final (-maxScroll)
      pos = Math.max(-maxScroll, Math.min(0, pos));

      track.dataset.position = pos;
      // Aplica a transformação
      track.style.transform = `translateX(${Math.round(pos)}px)`;
    }

    // Remove listeners duplicados (boa prática)
    if (btnPrev) {
      btnPrev.replaceWith(btnPrev.cloneNode(true));
    }
    if (btnNext) {
      btnNext.replaceWith(btnNext.cloneNode(true));
    }

    const newPrev = containerEl.querySelector(".esquerda");
    const newNext = containerEl.querySelector(".direita");

    if (newPrev)
      // Ao clicar para a esquerda (Prev), a posição (pos) deve aumentar (pos + step())
      newPrev.addEventListener("click", () => updatePosition(step()));

    if (newNext)
      // Ao clicar para a direita (Next), a posição (pos) deve diminuir (pos - step())
      newNext.addEventListener("click", () => updatePosition(-step()));

    // Touch/Swipe Support
    let touchStartX = 0;
    containerEl.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
    containerEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? updatePosition(-step()) : updatePosition(step());
      }
    });

    // Recalcular ao redimensionar
    window.addEventListener('resize', () => {
      // Simplesmente reajusta a posição para garantir que não passe do limite após redimensionamento.
      updatePosition(0);
    });
  }
  // Initialize cart
  updateCartCount();

  const checkoutBtn = document.querySelector('.btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      closeCart();
      openCheckoutModal();
    });
  }

  // Add to cart for livro.html
  if (window.location.pathname.includes("livro.html")) {
    const addBtn = document.querySelector('.btn-add');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const livroData = localStorage.getItem("livroSelecionado");
        if (!livroData) return;
        const livro = JSON.parse(livroData);
        const qty = parseInt(document.querySelector('.qty-input')?.value) || 1;
        addToCart(livro, qty);
      });
    }
  }
  // CARRINHO
  const icon = document.getElementById("carrinho-icon");
  if (icon) {
    icon.addEventListener("click", openCart);
  }

  // FILTRO
  const filtro = document.getElementById("loginIcon");
  if (filtro) {
    filtro.addEventListener("change", openPopup);
  }
}); // FIM DOMContentLoaded

// =======================================================
// PESQUISA (fora do DOMContentLoaded)
// =======================================================
const searchToggle = document.getElementById("search-toggle");
const searchContainer = document.getElementById("searchBox")?.parentElement;
const searchInput = document.getElementById("searchBox")?.querySelector("input");

if (searchToggle && searchContainer && searchInput) {
  searchToggle.addEventListener("click", () => {
    searchContainer.classList.toggle("active");
    if (searchContainer.classList.contains("active")) {
      searchInput.focus();
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query !== "") {
        window.location.href = `./busca.html?query=${encodeURIComponent(query)}`;
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target) && !searchToggle.contains(e.target)) {
      searchContainer.classList.remove("active");
    }
  });
}