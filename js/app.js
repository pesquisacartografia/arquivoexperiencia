// ======================================================
// ESTADO GLOBAL
// ======================================================

let database = [];
let categorias = [];
let categoriasSelecionadas = new Set();

let resultadosFiltrados = [];
let paginaAtual = 1;

const itensPorPagina = 10;


// ======================================================
// DADOS - EQUIPE
// ======================================================

const equipe = [
  {
    nome: "Fernando Zanetti",
    instituicao: "Universidade Federal de Minas Gerais",
    funcao: "Coordenador",
    email: "fernandozanetti@hotmail.com",
    bio: "Outra bio...",
    foto: "img/team/fernando.png",
    lattes: "http://lattes.cnpq.br/1395386104738431"
  },
  {
    nome: "Karine Miranda",
    instituicao: "Universidade Federal de Minas Gerais",
    funcao: "Pesquisadora Bolsista",
    email: "mkarine945@gmail.com",
    bio: "Descrição completa da pessoa...",
    foto: "img/team/karine.png",
    lattes: "http://lattes.cnpq.br/1255208143513486"
  },
  {
    nome: "Gabriel Corrêa",
    instituicao: "Universidade Federal de Minas Gerais",
    funcao: "Desenvolvedor e Pesquisador",
    email: "gabriel.correa@gamarco.com.br",
    bio: "Outra bio...",
    foto: "img/team/gabriel.png",
    lattes: "http://lattes.cnpq.br/2021789826051133"
  },
  {
    nome: "Dandahra Evangelista",
    instituicao: "Universidade Federal de Minas Gerais",
    funcao: "Bolsista de IC",
    email: "dandahraarchanjo@gmail.com",
    bio: "Descrição completa da pessoa...",
    foto: "img/team/dandahra.png",
    lattes: "http://lattes.cnpq.br/7998854283352166"
  },
  {
    nome: "Maria Cardinal",
    instituicao: "Universidade Federal de Minas Gerais",
    funcao: "Bolsista de IC",
    email: "cardinal.ma05@gmail.com",
    bio: "Descrição completa da pessoa...",
    foto: "img/team/maria.png",
    lattes: "http://lattes.cnpq.br/5062069923007508"
  }
];


// ======================================================
// SPA (NAVEGAÇÃO)
// ======================================================

function showPage(id) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");
}


// ======================================================
// LOAD DE DADOS
// ======================================================

async function loadData() {
  const res = await fetch("data/database.json");
  database = await res.json();

  resultadosFiltrados = database;
  render();
}

async function loadCategorias() {
  const res = await fetch("data/categories.json");
  categorias = await res.json();

  renderCategorias(categorias);
}


// ======================================================
// BUSCA E FILTROS
// ======================================================

function buscar() {
  const termo = document.getElementById("searchInput").value.toLowerCase();

  resultadosFiltrados = database.filter(item => {

    const matchCategoria =
      categoriasSelecionadas.size === 0 ||
      item.categorias.some(c =>
        categoriasSelecionadas.has(c.categoria)
      );

    if (!matchCategoria) return false;

    if (!termo) return true;

    const texto = `
      ${item.titulo_artigo || ""}
      ${item.autoria || ""}
      ${item.periodico || ""}
      ${(item.categorias || [])
        .map(c => c.descricao + " " + c.conceito)
        .join(" ")}
    `.toLowerCase();

    return texto.includes(termo);
  });

  paginaAtual = 1;
  render();
}


// ======================================================
// RENDER GERAL
// ======================================================

function render() {
  renderTotalResultados();
  renderResultados();
  renderPaginacao();
}


// ======================================================
// RESULTADOS
// ======================================================

function renderResultados() {
  const container = document.getElementById("resultados");
  container.innerHTML = "";

  if (!resultadosFiltrados.length) {
    container.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  const pagina = resultadosFiltrados.slice(inicio, fim);

  pagina.forEach(item => {

    const div = document.createElement("div");
    div.className = "resultado";

    const categoriasHTML = (item.categorias || []).map(cat => `
      <div class="categoria-bloco">
        <p><strong>${cat.categoria}</strong></p>
        <p>${cat.conceito}</p>
        <p>${cat.descricao}</p>
      </div>
    `).join("");

    div.innerHTML = `
      <h3>${item.titulo_artigo}</h3>
      <p>${item.autoria || ""} (${item.ano_publicacao || ""})</p>
      <button class="toggle-btn">Ver detalhes ▼</button>

      <div class="detalhes hidden">
        ${categoriasHTML}
        <a href="${item.link_acesso}" class="btn-article" target="_blank">
          Acessar artigo
        </a>
      </div>
    `;

    const btn = div.querySelector(".toggle-btn");
    const detalhes = div.querySelector(".detalhes");

    btn.onclick = () => {
      detalhes.classList.toggle("hidden");
    };

    container.appendChild(div);
  });
}


// ======================================================
// PAGINAÇÃO
// ======================================================

function renderPaginacao() {
  const container = document.getElementById("paginacao");
  container.innerHTML = "";

  const totalPaginas = Math.ceil(resultadosFiltrados.length / itensPorPagina);

  if (totalPaginas <= 1) return;

  function criarBotao(label, pagina) {
    const btn = document.createElement("button");
    btn.textContent = label;

    btn.onclick = () => {
      paginaAtual = pagina;
      render();
    };

    return btn;
  }

  container.appendChild(criarBotao("<<", 1));
  container.appendChild(criarBotao("<", Math.max(1, paginaAtual - 1)));

  let inicio = Math.max(1, paginaAtual - 2);
  let fim = Math.min(totalPaginas, paginaAtual + 2);

  for (let i = inicio; i <= fim; i++) {
    const btn = criarBotao(i, i);

    if (i === paginaAtual) {
      btn.classList.add("active");
    }

    container.appendChild(btn);
  }

  container.appendChild(criarBotao(">", Math.min(totalPaginas, paginaAtual + 1)));
  container.appendChild(criarBotao(">>", totalPaginas));
}


// ======================================================
// CATEGORIAS
// ======================================================

function renderCategorias(lista) {
  const container = document.getElementById("listaCategorias");
  container.innerHTML = "";

  lista.forEach(cat => {

    const div = document.createElement("div");
    div.textContent = cat.categoria;
    div.classList.add("categoria-item");

    if (categoriasSelecionadas.has(cat.categoria)) {
      div.classList.add("selected");
    }

    div.onclick = () => {
      if (categoriasSelecionadas.has(cat.categoria)) {
        categoriasSelecionadas.delete(cat.categoria);
        div.classList.remove("selected");
      } else {
        categoriasSelecionadas.add(cat.categoria);
        div.classList.add("selected");
      }

      renderCategoriasSelecionadas();
      buscar();
      atualizarBotaoLimpar();
    };

    container.appendChild(div);
  });
}


// ======================================================
// FILTRO DE CATEGORIAS
// ======================================================

function filtrarCategorias() {
  const termo = document.getElementById("searchCategoria").value.toLowerCase();

  const filtradas = categorias.filter(cat =>
    cat.categoria.toLowerCase().includes(termo)
  );

  renderCategorias(filtradas);
}


// ======================================================
// CATEGORIAS SELECIONADAS
// ======================================================

function renderCategoriasSelecionadas() {
  const container = document.getElementById("categoriasSelecionadas");
  container.innerHTML = "";

  categoriasSelecionadas.forEach(cat => {

    const tag = document.createElement("div");
    tag.className = "tag";

    tag.innerHTML = `${cat} <span>×</span>`;

    tag.onclick = () => {
      categoriasSelecionadas.delete(cat);
      renderCategorias(categorias);
      buscar();
      renderCategoriasSelecionadas();
      atualizarBotaoLimpar();
    };

    container.appendChild(tag);
  });
}


// ======================================================
// BOTÃO LIMPAR
// ======================================================

function atualizarBotaoLimpar() {
  const btn = document.getElementById("limparCategorias");
  const total = categoriasSelecionadas.size;

  btn.textContent = total > 0
    ? `Limpar categorias (${total})`
    : "Limpar categorias";

  btn.disabled = total === 0;
}


// ======================================================
// EQUIPE
// ======================================================

function renderEquipe() {
  const container = document.getElementById("teamContainer");
  container.innerHTML = "";

  equipe.forEach(pessoa => {

    const card = document.createElement("div");
    card.className = "team-card";

    card.innerHTML = `
      <div class="team-header">
        <img src="${pessoa.foto}" class="team-photo">

        <div class="team-info">
          <h3>${pessoa.nome}</h3>

          <div class="team-meta">
            <h4>${pessoa.funcao}</h4>
            <span>${pessoa.instituicao}</span>
            <span style="text-decoration: underline;">
              ${pessoa.email}
            </span>
          </div>
        </div>
      </div>

      <a href="${pessoa.lattes}" target="_blank" class="team-btn">
        Currículo Lattes
      </a>
    `;

    container.appendChild(card);
  });
}


// ======================================================
// UTILIDADES
// ======================================================

function debounce(fn, delay) {
  let timeout;

  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), delay);
  };
}


// ======================================================
// INIT
// ======================================================

window.onload = () => {

  loadData();
  loadCategorias();
  renderEquipe();

  atualizarBotaoLimpar();

  document
    .getElementById("searchInput")
    .addEventListener("input", debounce(buscar, 300));

  document
    .getElementById("searchCategoria")
    .addEventListener("input", debounce(filtrarCategorias, 200));

  document.getElementById("limparCategorias").onclick = () => {

    categoriasSelecionadas.clear();

    document.querySelectorAll(".categoria-item").forEach(el => {
      el.classList.remove("selected");
    });

    renderCategoriasSelecionadas();
    buscar();
    atualizarBotaoLimpar();
  };
};

// ======================================================
// RENDER TOTAL RESULTADOS
// ======================================================

function renderTotalResultados() {
  const el = document.getElementById("totalResultados");

  const totalBase = database.length;
  const totalFiltrado = resultadosFiltrados.length;
  const totalCategorias = categoriasSelecionadas.size;

  // texto base
  const textoBase = `${totalBase} resultados encontrados`;

  // porcentagem
  const porcentagem = totalBase > 0
    ? ((totalFiltrado / totalBase) * 100).toFixed(2).replace(".", ",")
    : "0";

  // texto filtrado
  const textoFiltrado =
    totalFiltrado === totalBase
      ? ""
      : ` • ${totalFiltrado} resultado${totalFiltrado !== 1 ? "s" : ""} encontrado${totalFiltrado !== 1 ? "s" : ""} (${porcentagem}%)`;

  // texto categorias
  const textoCategorias =
    totalCategorias === 0
      ? ""
      : ` • ${totalCategorias} categoria${totalCategorias > 1 ? "s" : ""} selecionada${totalCategorias > 1 ? "s" : ""}`;

  el.textContent = textoBase + textoFiltrado + textoCategorias;
}
