document.getElementById("cep").addEventListener("blur", async () => {
  let cep = document.getElementById("cep").value.replace(/\D/g, "");

  if (cep.length !== 8) return;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      alert("CEP não encontrado.");
      return;
    }

    document.getElementById("logradouro").value = dados.logradouro;
    document.getElementById("bairro").value = dados.bairro;
    document.getElementById("cidade").value = dados.localidade;
    document.getElementById("estado").value = dados.uf;

  } catch (erro) {
    alert("Erro ao buscar o CEP.");
  }
});
