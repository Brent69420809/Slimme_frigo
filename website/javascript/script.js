// --- Receptendata ---
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
      'Klop de eieren los en voeg zout toe.',
      'Smelt boter in de pan.',
      'Giet de eieren erin en voeg kaas toe, vouw dubbel als het stolt.'
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

// --- Inventaris functionaliteit (enkel op index.html) ---
const addForm = document.getElementById('addForm');
const inventoryBody = document.getElementById('inventoryBody');
const recipeList = document.getElementById('recipeList');
const showRecipesBtn = document.getElementById('showRecipes');

if (addForm) {
  addForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim().toLowerCase();
    const qty = document.getElementById('qty').value.trim();
    const loc = document.getElementById('loc').value.trim();
    if (!name || !qty || !loc) return;
    const tr = document.createElement('tr');
    tr.dataset.name = name;
    tr.innerHTML = `<td>${name}</td><td>${qty}</td><td>${loc}</td><td><button class="remove">Verwijder</button></td>`;
    inventoryBody.appendChild(tr);
    addForm.reset();
  });

  inventoryBody.addEventListener('click', e => {
    if (e.target.classList.contains('remove')) {
      e.target.closest('tr').remove();
    }
  });

  showRecipesBtn.addEventListener('click', () => {
    const currentItems = Array.from(document.querySelectorAll('#inventoryBody tr')).map(r => r.dataset.name);
    recipeList.innerHTML = '';
    recipes.forEach(r => {
      const hasIngredients = r.ingredients.every(i => currentItems.includes(i));
      const li = document.createElement('li');
      li.className = hasIngredients ? 'match' : '';
      li.innerHTML = `<span>${r.name}</span><a href="recept.html?id=${r.id}">Bekijk</a>`;
      recipeList.appendChild(li);
    });
  });
}

// --- Recept detailpagina ---
const recipeTitle = document.getElementById('recipeTitle');
if (recipeTitle) {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get('id');
  const recipe = recipes.find(r => r.id === recipeId);
  if (recipe) {
    recipeTitle.textContent = recipe.name;
    const ingredientsList = document.getElementById('recipeIngredients');
    recipe.ingredients.forEach(i => {
      const li = document.createElement('li');
      li.textContent = i;
      ingredientsList.appendChild(li);
    });
    const stepsList = document.getElementById('recipeSteps');
    recipe.steps.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      stepsList.appendChild(li);
    });
  }
}
