// ======================================================
// ESTADO GLOBAL
// ======================================================

let database = [];
let categorias = [];
let publicacoes = [];
let categoriasSelecionadas = new Set();

let resultadosFiltrados = [];
let paginaAtual = 1;

const itensPorPagina = 10;

let equipe = [];


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
// PUBLICACOES
// ======================================================

async function loadPublicacoes() {
  // const res = await fetch("data/publications.json");
  const res = await fetch("https://sheetdb.io/api/v1/inx9laveb5ir0");
  publicacoes = await res.json();
  renderPublicacoes();
}

async function loadCapitulos() {
  // const res = await fetch("data/publications.json");
  const res = await fetch("https://sheetdb.io/api/v1/gr3upgd454ful");
  publicacoes = await res.json();
  renderCapitulos();
}


// FUNÇÃO CHAMA .JSON LOCAL
// function renderPublicacoes() {
//   const container = document.getElementById("publicacoesContainer");
//   container.innerHTML = "";

//   publicacoes.forEach(pub => {

//     const div = document.createElement("div");
//     div.className = "publicacao";

//     div.innerHTML = `
//       <p>
//         <strong>${pub.autoria}</strong>.
//         ${pub.titulo}.
//         <em>${pub.periodico}</em>,
//         v. ${pub.volume}, n. ${pub.numero},
//         p. ${pub.paginas}, ${pub.data}.
//       </p>

//       <p>
//         DOI: <a href="${pub.doi}" target="_blank">${pub.doi}</a><br>
//         <a href="${pub.link}" target="_blank" class="team-btn">Acessar publicação</a>
//       </p>
//     `;

//     container.appendChild(div);
//   });
// }

// FUNCAO CHAMA API (GOOGLE SHEETS TO .JSON)
function renderPublicacoes() {
  const container = document.getElementById("publicacoesContainer");
  container.innerHTML = "";

  publicacoes.forEach(pub => {

    const div = document.createElement("div");
    div.className = "publicacao";

    div.innerHTML = `
      <p>
        ${pub.tipo || ""}
        ${pub.autoria || ""}.
        ${pub.titulo || ""}.
        <strong>${pub.periodico || ""}</strong>,
        v. ${pub.volume || "-"}, n. ${pub.numero || "-"},
        p. ${pub.paginas || "-"}, ${pub.data || ""}.
      </p>

      <p>
        DOI/ISSN: ${pub.doi || "Não informado"}<br>
        <a href="${pub.link || "#"}" target="_blank" class="team-btn">Acessar publicação</a>
      </p>
    `;

    container.appendChild(div);
  });
}

function renderCapitulos() {
  const container = document.getElementById("capitulosContainer");
  container.innerHTML = "";

  publicacoes.forEach(pub => {

    const div = document.createElement("div");
    div.className = "capitulo";

    div.innerHTML = `
      <p>
        ${pub.autoria || ""}.
        ${pub.titulo || ""}.
        <em>In: </em>
        ${pub.orgs || ""} (orgs.).
        <strong>${pub.livro || ""}</strong>.
        ${pub.cidade || "<em>[S. l.]</em>"}:
        ${pub.editora || "<em>[s. n.]</em>"},
        ${pub.data || ""}. p. ${pub.paginas || "-"}.
      </p>

      <p>
        DOI/ISBN: ${pub.doi || "Não informado"}<br>
        <a href="${pub.link || "#"}" target="_blank" class="team-btn">Acessar publicação</a>
      </p>
    `;

    container.appendChild(div);
  });
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

async function loadEquipe() {
  try {
    const res = await fetch("data/team.json");
    equipe = await res.json();

    renderEquipe();
  } catch (erro) {
    console.error("Erro ao carregar equipe:", erro);
  }
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
  loadPublicacoes();
  loadCapitulos();
  loadEquipe();

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
<<<<<<< HEAD

function toggleTexto() {
  const texto = document.getElementById("textoContexto");
  const btn = document.querySelector(".btn-lermais");

  texto.classList.toggle("texto-expandido");

  if (texto.classList.contains("texto-expandido")) {
    btn.textContent = "Ler menos";
  } else {
    btn.textContent = "Ler mais";
  }
}

function toggleMetodologia() {
  const texto = document.getElementById("textoMetodologia");
  const btn = document.querySelector(".btn-lermais");

  texto.classList.toggle("texto-expandido");

  if (texto.classList.contains("texto-expandido")) {
    btn.textContent = "Ler menos";
  } else {
    btn.textContent = "Ler mais";
  }
}
=======
>>>>>>> 3499f4106743f12c99c1e93ba8f43a6bcacaa09f
