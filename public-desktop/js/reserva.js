import { getCookie } from "./script.js";

const container = document.getElementById("lista-reservas");
const user = getCookie();

if (!user) {
    container.innerHTML = `<p class="sem-reservas">Você precisa estar logado para ver suas reservas.</p>`;
} else if (!user.reservas || user.reservas.length === 0) {
    container.innerHTML = `<p class="sem-reservas">Você ainda não fez nenhuma reserva.</p>`;
} else {
    container.innerHTML = user.reservas
        .map(r => `
            <div class="item-reserva">
                <h2>${r.titulo}</h2>
                <p><strong>Data da reserva:</strong> ${new Date(r.dataReserva).toLocaleDateString()}</p>
                <p><strong>Validade:</strong> ${r.validade} dias</p>
            </div>
        `)
        .join("");
}
