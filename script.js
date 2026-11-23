let fluxoDeCaixa = JSON.parse(localStorage.getItem('fluxo_caixa_web')) || [];

const form = document.getElementById('formRegistro');
const tabelaCorpo = document.getElementById('tabelaCorpo');

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function salvarDados() {
  localStorage.setItem('fluxo_caixa_web', JSON.stringify(fluxoDeCaixa));
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const descricao = document.getElementById('descricao').value.trim();
  const categoria = document.getElementById('categoria').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;

  if (valor <= 0 || isNaN(valor)) {
    alert('O valor deve ser positivo e maior que zero.');
    return;
  }

  fluxoDeCaixa.unshift({
    id: Date.now(),
    tipo: tipo,
    descricao: descricao,
    categoria: categoria,
    valor: valor
  });

  salvarDados();
  form.reset();
  renderizarRelatorio();
});

function excluirRegistro(id) {
  fluxoDeCaixa = fluxoDeCaixa.filter(function(item) {
    return item.id !== id;
  });
  salvarDados();
  renderizarRelatorio();
}

function renderizarRelatorio() {
  const filtroCat = document.getElementById('filtroCategoria').value;
  tabelaCorpo.innerHTML = '';

  let totalEntradas = 0;
  let totalSaidas = 0;

  fluxoDeCaixa.forEach(function(r) {
    if (r.tipo === 'Entrada') totalEntradas += r.valor;
    else totalSaidas += r.valor;
  });

  const saldo = totalEntradas - totalSaidas;

  document.getElementById('totalEntradas').textContent = formatarMoeda(totalEntradas);
  document.getElementById('totalSaidas').textContent = formatarMoeda(totalSaidas);
  document.getElementById('saldoTotal').textContent = formatarMoeda(saldo);

  const banner = document.getElementById('statusBanner');
  if (saldo >= 0) {
    banner.textContent = 'Status: Saldo positivo. Gestão sob controle.';
    banner.className = 'status-banner status-ok';
  } else {
    banner.textContent = 'Status: Saldo negativo. Atenção ao orçamento!';
    banner.className = 'status-banner status-alerta';
  }

  let percentual = 0;
  if (totalEntradas > 0) {
    percentual = Math.min(Math.round((totalSaidas / totalEntradas) * 100), 100);
  } else if (totalSaidas > 0) {
    percentual = 100;
  }
  document.getElementById('percentualGasto').textContent = percentual + '%';
  const barra = document.getElementById('barraProgresso');
  barra.style.width = percentual + '%';
  barra.style.background = percentual > 80 ? '#ef4444' : '#38bdf8';

  const filtrados = fluxoDeCaixa.filter(function(r) {
    return filtroCat === 'Todas' || r.categoria === filtroCat;
  });

  if (filtrados.length === 0) {
    tabelaCorpo.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum registro encontrado no fluxo de caixa.</td></tr>';
    return;
  }

  filtrados.forEach(function(r) {
    const tr = document.createElement('tr');
    const classeCor = r.tipo === 'Entrada' ? 'entrada' : 'saida';
    tr.innerHTML =
      '<td class="' + classeCor + '"><strong>' + r.tipo + '</strong></td>' +
      '<td>' + r.descricao + '</td>' +
      '<td><span class="tag-cat">' + r.categoria + '</span></td>' +
      '<td class="' + classeCor + '">' + formatarMoeda(r.valor) + '</td>' +
      '<td><button class="btn-del" onclick="excluirRegistro(' + r.id + ')">Excluir</button></td>';
    tabelaCorpo.appendChild(tr);
  });
}

renderizarRelatorio();