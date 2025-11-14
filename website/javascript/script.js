// --------------------------
// Receptendata
// --------------------------
const recipes = [
  {
    id: 'pannenkoeken',
    name: 'Pannenkoeken',
    ingredients: ['melk', 'eieren', 'bloem'],
    steps: [
      'Meng melk, eieren en bloem in een kom.',
      'Verhit boter in een pan.',
      'Bak de pannenkoeken goudbruin aan beide kanten.'
    ]
  },
  {
    id: 'omelet',
    name: 'Omelet met kaas',
    ingredients: ['eieren', 'kaas', 'boter'],
    steps: [
      'Klop de eieren los.',
      'Smelt boter in de pan.',
      'Giet de eieren erin en voeg kaas toe.'
    ]
  },
  {
    id: 'smoothie',
    name: 'Banaan-melk smoothie',
    ingredients: ['melk', 'banaan'],
    steps: [
      'Doe melk en banaan in een blender.',
      'Mix tot een gladde smoothie.',
      'Serveer gekoeld.'
    ]
  }
];


// --------------------------
// Helpers
// --------------------------
const norm = str => String(str).trim().toLowerCase();

function loadInventory() {
  return JSON.parse(localStorage.getItem("inventory")) || [];
}

function saveInventory(items) {
  localStorage.setItem("inventory", JSON.stringify(items));
}


// --------------------------
// Sync DOM -> Storage (éénmalig)
// --------------------------
function initializeStorageFromDOM() {
  const stored = loadInventory();
  if (stored.length > 0) return; // storage bestaat al → niets doen

  const rows = document.querySelectorAll("#inventoryBody tr");
  const items = [...rows].map(r => ({
    name: norm(r.dataset.name),
    qty: r.children[1].textContent.trim(),
    loc: r.children[2].textContent.trim()
  }));

  saveInventory(items);
}


// --------------------------
// Render voorraad
// --------------------------
function renderInventory() {
  const tbody = document.getElementById("inventoryBody");
  tbody.innerHTML = "";

  loadInventory().forEach(item => {
    const tr = document.createElement("tr");
    tr.dataset.name = item.name;
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.loc}</td>
      <td><button class="remove">Verwijder</button></td>
    `;
    tbody.appendChild(tr);
  });
}


// --------------------------
// MAIN LOGIC INDEX PAGINA
// --------------------------
if (document.getElementById("inventoryBody")) {

  initializeStorageFromDOM();
  renderInventory();

  // Toevoegen
  document.getElementById("addForm").addEventListener("submit", e => {
    e.preventDefault();

    const name = norm(document.getElementById("name").value);
    const qty = document.getElementById("qty").value.trim();
    const loc = document.getElementById("loc").value.trim();

    const inv = loadInventory();
    inv.push({ name, qty, loc });
    saveInventory(inv);

    renderInventory();
    e.target.reset();
  });

  // Verwijderen
  document.getElementById("inventoryBody").addEventListener("click", e => {
    if (!e.target.classList.contains("remove")) return;

    const tr = e.target.closest("tr");
    const name = norm(tr.dataset.name);

    let inv = loadInventory();
    inv = inv.filter(i => i.name !== name);
    saveInventory(inv);

    renderInventory();
  });

  // Recepten tonen
  document.getElementById("showRecipes").addEventListener("click", () => {
    const currentItems = loadInventory().map(i => i.name);
    const recipeList = document.getElementById("recipeList");
    recipeList.innerHTML = "";

    recipes.forEach(r => {
      const match = r.ingredients.some(i => currentItems.includes(norm(i)));
      if (!match) return;

      const li = document.createElement("li");
      li.className = "match";
      li.innerHTML = `
        <span>${r.name}</span>
        <a href="recept.html?id=${r.id}">Bekijk</a>
      `;
      recipeList.appendChild(li);
    });

    if (recipeList.innerHTML.trim() === "") {
      recipeList.innerHTML = `<li>Geen recepten gevonden.</li>`;
    }
  });
}


// --------------------------
// RECEPT DETAIL PAGINA
// --------------------------
if (document.getElementById("recipeTitle")) {
  const params = new URLSearchParams(location.search);
  const r = recipes.find(x => x.id === params.get("id"));

  if (r) {
    document.getElementById("recipeTitle").textContent = r.name;

    const inventoryNames = loadInventory().map(i => i.name);
    const have = r.ingredients.filter(i => inventoryNames.includes(norm(i)));
    const missing = r.ingredients.filter(i => !inventoryNames.includes(norm(i)));

    const ingList = document.getElementById("recipeIngredients");
    ingList.innerHTML = "";

    have.forEach(i => {
      const li = document.createElement("li");
      li.textContent = i + " ✔";
      li.style.color = "green";
      ingList.appendChild(li);
    });

    if (missing.length > 0) {
      const title = document.createElement("h3");
      title.textContent = "Ingrediënten die je nog nodig hebt:";
      ingList.insertAdjacentElement("afterend", title);

      const missingUl = document.createElement("ul");
      missing.forEach(i => {
        const li = document.createElement("li");
        li.textContent = i + " ✘";
        li.style.color = "red";
        missingUl.appendChild(li);
      });

      title.insertAdjacentElement("afterend", missingUl);
    }

    const stepsList = document.getElementById("recipeSteps");
    stepsList.innerHTML = "";
    r.steps.forEach(s => stepsList.appendChild(Object.assign(document.createElement("li"), { textContent: s })));
  }
}
