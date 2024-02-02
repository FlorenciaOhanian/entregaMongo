const contenedorTicket = document.getElementById('contenedorTicket');
let localStorageData = JSON.parse(localStorage.getItem('ticket'));
// console.log('Ticket----ticket: ', localStorageData.ticket);

contenedorTicket.innerHTML = '';

contenedorTicket.innerHTML += `
            <div class="contenedorTicketItem">
            <p><span class='ticketEtiqueta'>Comprador:</span> ${localStorageData.ticket.purchaser}</p>
            <p><span class='ticketEtiqueta'>Precio final:</span> $ ${localStorageData.ticket.amount}</p>
            <p><span class='ticketEtiqueta'>Fecha de compra:</span> ${localStorageData.ticket.purchase_datetime}</p>
            </div>
            `;

localStorage.clear()