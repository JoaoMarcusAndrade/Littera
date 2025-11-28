import { getCookie } from "./script.js";

let selectedPaymentMethod = '';

function openCheckoutModal() {
  const user = getCookie();
  if (!user) {
    openPopup();
    return;
  }
  
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    console.log('[openCheckoutModal] Abrindo modal de checkout');
    modal.classList.add('show');
    goToStep(1);
  } else {
    console.error('[openCheckoutModal] Modal não encontrado!');
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

function goToStep(stepNumber) {
  const steps = document.querySelectorAll('.step-content');
  const progressSteps = document.querySelectorAll('.progress-step');
  
  steps.forEach(step => step.classList.remove('active'));
  progressSteps.forEach(step => step.classList.remove('active'));
  
  const activeStep = document.getElementById(`step-${stepNumber}`);
  if (activeStep) {
    activeStep.classList.add('active');
  }
  
  const activeProgress = document.querySelector(`[data-step="${stepNumber}"]`);
  if (activeProgress) {
    activeProgress.classList.add('active');
  }
}

function validateStep(stepNumber) {
  const formIds = {
    1: 'form-informacoes',
    2: 'form-metodo',
    3: 'form-cartao'
  };
  
  const form = document.getElementById(formIds[stepNumber]);
  if (!form) return true;
  
  const inputs = form.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('error');
      const errorMsg = input.closest('.form-group')?.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.textContent = 'Este campo é obrigatório';
        errorMsg.classList.add('show');
      }
    } else {
      input.classList.remove('error');
      const errorMsg = input.closest('.form-group')?.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.classList.remove('show');
      }
    }
  });
  
  return isValid;
}

function nextStep(currentStep) {
  if (validateStep(currentStep)) {
    if (currentStep === 1) {
      updateAddressPreview();
    }
    if (currentStep === 2) {
      selectedPaymentMethod = document.querySelector('input[name="metodo-pagamento"]:checked')?.value;
    }
    if (currentStep === 3) {
      updatePaymentConfirmation();
      populateOrderSummary();
    }
    goToStep(currentStep + 1);
    markStepAsCompleted(currentStep);
  }
}

function prevStep(currentStep) {
  goToStep(currentStep - 1);
}

function markStepAsCompleted(stepNumber) {
  const progressStep = document.querySelector(`[data-step="${stepNumber}"]`);
  if (progressStep) {
    progressStep.classList.add('completed');
  }
}

function updateAddressPreview() {
  const nome = document.getElementById('nome-completo')?.value || 'Seu Nome';
  const rua = document.getElementById('rua')?.value || 'Rua';
  const numero = document.getElementById('numero')?.value || '0';
  const bairro = document.getElementById('bairro')?.value || 'Bairro';
  const cidade = document.getElementById('cidade')?.value || 'Cidade';
  const estado = document.getElementById('estado')?.value || 'UF';
  const cep = document.getElementById('cep')?.value || '00000-000';
  
  document.getElementById('nome-entrega').textContent = nome;
  document.getElementById('endereco-entrega-texto').textContent = 
    `${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}, ${cep}`;
  
  document.getElementById('confirmacao-endereco').textContent =
    `${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}, ${cep}`;
}

function updatePaymentConfirmation() {
  const methodNames = {
    'pix': 'PIX',
    'boleto': 'Boleto',
    'cartao-credito': 'Cartão de Crédito',
    'cartao-debito': 'Cartão de Débito'
  };
  const method = methodNames[selectedPaymentMethod] || 'Não selecionado';
  document.getElementById('confirmacao-pagamento').textContent = `Método: ${method}`;
}

function populateStep3() {
  const step3 = document.getElementById('step-3');
  if (!step3) return;

  if (selectedPaymentMethod === 'credito') {
    form.innerHTML = `
      <div class="card-preview">
        <div class="card-chip"></div>
        <div class="card-number-preview" id="card-preview-number">**** **** **** ****</div>
        <div class="card-info">
          <div class="card-holder" id="card-preview-holder">NOME DO TITULAR</div>
          <div class="card-expiry" id="card-preview-expiry">MM/AA</div>
        </div>
        <div class="card-logo">VISA</div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label for="nome-titular">NOME DO TITULAR*</label>
          <input
            type="text"
            id="nome-titular"
            placeholder="Ex: Lucas Cobucci Martins"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label for="cpf-cartao">CPF*</label>
          <input
            type="text"
            id="cpf-cartao"
            placeholder="Ex: 999.999.999-99"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label for="numero-cartao">NÚMERO DO CARTÃO*</label>
          <input
            type="text"
            id="numero-cartao"
            placeholder="1234 1234 1234 1234"
            maxlength="19"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="vencimento">VENCIMENTO*</label>
          <input
            type="text"
            id="vencimento"
            placeholder="MM/AA"
            maxlength="5"
            required
          >
          <span class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="cvv">CVV*</label>
          <input
            type="text"
            id="cvv"
            placeholder="Ex: 123"
            maxlength="4"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>
    `;
    setupCardPreview();
  } else if (selectedPaymentMethod === 'debito') {
    form.innerHTML = `
      <div class="card-preview">
        <div class="card-chip"></div>
        <div class="card-number-preview" id="card-preview-number">**** **** **** ****</div>
        <div class="card-info">
          <div class="card-holder" id="card-preview-holder">NOME DO TITULAR</div>
          <div class="card-expiry" id="card-preview-expiry">MM/AA</div>
        </div>
        <div class="card-logo">VISA</div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label for="nome-titular-debito">NOME DO TITULAR*</label>
          <input
            type="text"
            id="nome-titular-debito"
            placeholder="Ex: Lucas Cobucci Martins"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label for="cpf-cartao-debito">CPF*</label>
          <input
            type="text"
            id="cpf-cartao-debito"
            placeholder="Ex: 999.999.999-99"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full">
          <label for="numero-cartao-debito">NÚMERO DO CARTÃO DE DÉBITO*</label>
          <input
            type="text"
            id="numero-cartao-debito"
            placeholder="1234 1234 1234 1234"
            maxlength="19"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="vencimento-debito">VENCIMENTO*</label>
          <input
            type="text"
            id="vencimento-debito"
            placeholder="MM/AA"
            maxlength="5"
            required
          >
          <span class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="cvv-debito">CVV*</label>
          <input
            type="text"
            id="cvv-debito"
            placeholder="Ex: 123"
            maxlength="4"
            required
          >
          <span class="error-message"></span>
        </div>
      </div>
    `;
    setupCardPreview();
  } else if (selectedPaymentMethod === 'boleto') {
    form.innerHTML = `
      <div class="boleto-info">
        <h3>Pagamento via Boleto</h3>
        <p>O boleto será gerado após a confirmação do pedido e enviado para o seu e-mail.</p>
        <p>O prazo para pagamento é de 3 dias úteis.</p>
        <div class="boleto-placeholder">
          <div style="border: 2px dashed #ccc; padding: 20px; text-align: center; color: #666;">
            Boleto será gerado aqui
          </div>
        </div>
      </div>
    `;
  } else if (selectedPaymentMethod === 'pix') {
    form.innerHTML = `
      <div class="pix-info">
        <h3>Pagamento via PIX</h3>
        <p>Escaneie o QR Code abaixo para realizar o pagamento.</p>
        <div id="qrcode" style="text-align: center; margin: 20px 0;"></div>
        <p>Ou copie o código PIX: <span id="pix-code">00020101021126330014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913Littera Livros6009Sao Paulo62070503***6304ABCD</span></p>
      </div>
    `;
    generatePixQR();
  }
}

function generatePixQR() {
  const qrContainer = document.getElementById('qrcode');
  if (!qrContainer) return;

  // Generate a random PIX code for simulation
  const randomCode = '00020101021126330014BR.GOV.BCB.PIX0114+' + Math.random().toString(36).substr(2, 14) + '5204000053039865802BR5913Littera Livros6009Sao Paulo62070503***6304' + Math.random().toString(36).substr(2, 4);

  // Update the pix-code span
  const pixCodeSpan = document.getElementById('pix-code');
  if (pixCodeSpan) {
    pixCodeSpan.textContent = randomCode;
  }

  // Generate QR code
  QRCode.toCanvas(qrContainer, randomCode, { width: 200, height: 200 }, function (error) {
    if (error) console.error(error);
  });
}

function setupCardPreview() {
  const cardNumberInput = document.getElementById('numero-cartao') || document.getElementById('numero-cartao-debito');
  const cardHolderInput = document.getElementById('nome-cartao') || document.getElementById('nome-cartao-debito');
  const cardExpiryInput = document.getElementById('validade-cartao') || document.getElementById('validade-cartao-debito');

  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, '');
      const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
      e.target.value = formatted;

      const preview = document.querySelector('.card-number');
      if (preview) {
        const lastFour = value.slice(-4) || '0000';
        preview.textContent = `**** **** **** ${lastFour}`;
      }
    });
  }

  if (cardHolderInput) {
    cardHolderInput.addEventListener('input', (e) => {
      const preview = document.querySelector('.card-name');
      if (preview) {
        preview.textContent = e.target.value.toUpperCase() || 'NOME DO TITULAR';
      }
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;

      const preview = document.querySelector('.card-expiry');
      if (preview) {
        preview.textContent = value || 'MM/AA';
      }
    });
  }
}

function populateOrderSummary() {
  const cart = getCart();
  const summaryContainer = document.getElementById('resumo-itens');
  
  if (!summaryContainer) return;
  
  let html = '';
  let total = 0;
  
  cart.forEach(item => {
    const price = parseFloat(item.preco?.replace('R$', '').replace(',', '.')) || 0;
    const itemTotal = price * item.quantity;
    total += itemTotal;
    
    html += `
      <div class="resumo-item">
        <div class="resumo-item-info">
          <span class="resumo-item-titulo">${item.title}</span>
          <span class="resumo-item-qty">Qtd: ${item.quantity}</span>
        </div>
        <span class="resumo-item-valor">${item.preco || 'R$ 0,00'}</span>
      </div>
    `;
  });
  
  summaryContainer.innerHTML = html;
  
  const frete = 15.00;
  const totalFinal = total + frete;
  
  document.getElementById('resumo-subtotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  document.getElementById('resumo-frete').textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
  document.getElementById('resumo-total-final').textContent = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
}

function setupCheckoutEvents() {
  // Step 1 form
  const formInfo = document.getElementById('form-informacoes');
  if (formInfo) {
    formInfo.addEventListener('submit', (e) => {
      e.preventDefault();
      nextStep(1);
    });
  }
  
  // Step 2 form
  const formMetodo = document.getElementById('form-metodo');
  if (formMetodo) {
    formMetodo.addEventListener('submit', (e) => {
      e.preventDefault();
      const metodo = document.querySelector('input[name="metodo-pagamento"]:checked')?.value;
      if (metodo) {
        selectedPaymentMethod = metodo;
        nextStep(2);
      }
    });
  }
  
  // Step 3 form
  const formCartao = document.getElementById('form-cartao');
  if (formCartao) {
    formCartao.addEventListener('submit', (e) => {
      e.preventDefault();
      nextStep(3);
    });
  }
  
  // Step 4 - Confirm button
  const confirmBtn = document.querySelector('.btn-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      alert('✅ Compra realizada com sucesso! Obrigado.');
      clearCartAndCloseCheckout();
    });
  }
  
  // Close buttons
  const closeCheckoutBtn = document.querySelector('.checkout-close');
  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
  }
  
  setupCardPreview();
}

function clearCartAndCloseCheckout() {
  localStorage.setItem('carrinho', '[]');
  closeCheckoutModal();
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    renderCart();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCheckoutEvents);
} else {
  setupCheckoutEvents();
}
  
function fecharCheckout() {  
  window.history.back();  
}  
  
function finalizarPedido() {  
  alert('Pedido finalizado com sucesso!');  
  window.location.href = 'index.html';  
} 
  
function getCart() {  
  return JSON.parse(localStorage.getItem('carrinho') || '[]');  
} 
