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
  if (stored.length > 0) return;

  const rows = document.querySelectorAll("#inventoryBody tr");
  const items = [...rows].map(r => ({
    name: norm(r.dataset.name),
    qty: r.children[1].textContent.trim(),
    loc: r.children[2].textContent.trim()
  }));

  saveInventory(items);
}

// --------------------------
// Render voorraad (alleen voor index.html)
// --------------------------
function renderInventory() {
  const tbody = document.getElementById("inventoryBody");
  if (!tbody) return; // Alleen uitvoeren als tbody bestaat

  tbody.innerHTML = "";

  loadInventory().forEach(item => {
    const tr = document.createElement("tr");
    tr.dataset.name = item.name;

    const tdName = document.createElement("td");
    tdName.textContent = item.name;
    tr.appendChild(tdName);

    const tdQty = document.createElement("td");
    tdQty.textContent = item.qty;
    tr.appendChild(tdQty);

    const tdLoc = document.createElement("td");
    tdLoc.textContent = item.loc;
    tr.appendChild(tdLoc);

    const tdButton = document.createElement("td");
    const button = document.createElement("button");
    button.className = "remove";
    button.textContent = "Verwijder";
    tdButton.appendChild(button);
    tr.appendChild(tdButton);

    tbody.appendChild(tr);
  });
}

// --------------------------
// Render recepten lijst (voor recept_list.html)
// --------------------------
function renderRecipeList() {
  const recipeList = document.getElementById("recipeList");
  if (!recipeList) return; // Alleen uitvoeren als recipeList bestaat

  recipeList.innerHTML = "";
  const currentItems = loadInventory().map(i => i.name);

  recipes.forEach(r => {
    const match = r.ingredients.some(i => currentItems.includes(norm(i)));
    if (!match) return;

    const li = document.createElement("li");
    li.className = "match";

    const span = document.createElement("span");
    span.textContent = r.name;
    li.appendChild(span);

    const a = document.createElement("a");
    a.href = "recept.html?id=" + r.id;
    a.textContent = "Bekijk";
    li.appendChild(a);

    recipeList.appendChild(li);
  });

  if (recipeList.children.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Geen recepten gevonden.";
    recipeList.appendChild(li);
  }
}

// --------------------------
// MAIN LOGIC INDEX PAGINA (alleen voorraad)
// --------------------------
if (document.getElementById("inventoryBody")) {
  initializeStorageFromDOM();
  renderInventory();

  // Toevoegen
  document.getElementById("addForm").addEventListener("submit", e => {
    e.preventDefault();

    const name = norm(document.getElementById("name").value);
    const qty = document.getElementById("qty").value.trim() + " " + document.getElementById("unit").value;
    const loc = document.getElementById("locLetter").value + document.getElementById("locNumber").value;

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
}

// --------------------------
// MAIN LOGIC RECEPT LIST PAGINA (automatisch laden)
// --------------------------
if (document.getElementById("recipeList")) {
  renderRecipeList(); // Automatisch laden bij openen van pagina
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

    const stepsList = document.getElementById("recipeSteps");
    stepsList.innerHTML = "";

    if (missing.length > 0) {
      const extraInfo = document.createElement("p");
      extraInfo.style.marginTop = "10px";

      const strong = document.createElement("strong");
      strong.textContent = "Niet in frigo: ";
      extraInfo.appendChild(strong);

      extraInfo.appendChild(document.createTextNode(missing.join(", ")));

      stepsList.insertAdjacentElement("beforebegin", extraInfo);
    }

    r.steps.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      stepsList.appendChild(li);
    });
  }
}