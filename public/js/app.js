const API_BASE = '/api';

// State
let currentUser = null;
let token = localStorage.getItem('token') || null;
let currentCategoryId = null;
let currentPage = 1;
let currentSort = 'newest';
let allCategoriesList = [];
let allIngredientsList = [];

// Modals
let loginModal, registerModal, categoryModal, ingredientModal, recipeModal;

document.addEventListener('DOMContentLoaded', () => {
  loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
  categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
  ingredientModal = new bootstrap.Modal(document.getElementById('ingredientModal'));
  recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));

  checkAuth();
  loadCategories();
  loadRecipes();
  preloadAdminIngredientsAndCategories();
});

// Preload categories and ingredients for recipe modal selects
async function preloadAdminIngredientsAndCategories() {
  try {
    const [catRes, ingRes] = await Promise.all([
      fetch(`${API_BASE}/categories?limit=100`),
      fetch(`${API_BASE}/ingredients?limit=100`),
    ]);
    const catData = await catRes.json();
    const ingData = await ingRes.json();
    if (catData.success) allCategoriesList = catData.data;
    if (ingData.success) allIngredientsList = ingData.data;
  } catch (err) {
    console.error('Error preloading data:', err);
  }
}

// ================= AUTHENTICATION =================
async function checkAuth() {
  if (!token) {
    updateAuthUI(null);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/members/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      currentUser = result.data;
      updateAuthUI(currentUser);
    } else {
      logout();
    }
  } catch (err) {
    console.error('Failed to verify session', err);
    updateAuthUI(null);
  }
}

function updateAuthUI(user) {
  const guestDiv = document.getElementById('auth-guest');
  const userDiv = document.getElementById('auth-user');
  const memberOnly = document.querySelectorAll('.member-only');
  const adminOnly = document.querySelectorAll('.admin-only');

  if (user) {
    guestDiv.classList.add('d-none');
    userDiv.classList.remove('d-none');
    userDiv.classList.add('d-flex');
    document.getElementById('user-display-name').textContent = user.username;
    document.getElementById('user-badge').textContent = user.role;
    document.getElementById('user-badge').className = `badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-success'}`;

    memberOnly.forEach(el => el.classList.remove('d-none'));
    if (user.role === 'ADMIN') {
      adminOnly.forEach(el => el.classList.remove('d-none'));
    } else {
      adminOnly.forEach(el => el.classList.add('d-none'));
    }
  } else {
    guestDiv.classList.remove('d-none');
    userDiv.classList.add('d-none');
    memberOnly.forEach(el => el.classList.add('d-none'));
    adminOnly.forEach(el => el.classList.add('d-none'));
  }
}

function openLoginModal() {
  loginModal.show();
}

function openRegisterModal() {
  registerModal.show();
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/members/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();

    if (result.success) {
      token = result.data.accessToken;
      currentUser = result.data.user;
      localStorage.setItem('token', token);
      loginModal.hide();
      showAlert('Logged in successfully!', 'success');
      updateAuthUI(currentUser);
      document.getElementById('login-form').reset();
    } else {
      showAlert(result.message || 'Login failed', 'danger');
    }
  } catch (err) {
    showAlert('Server error during login', 'danger');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API_BASE}/members/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const result = await res.json();

    if (result.success) {
      registerModal.hide();
      showAlert('Account created! Please sign in.', 'success');
      document.getElementById('register-form').reset();
      loginModal.show();
    } else {
      showAlert(result.message || 'Registration failed', 'danger');
    }
  } catch (err) {
    showAlert('Server error during registration', 'danger');
  }
}

async function logout() {
  if (token) {
    try {
      await fetch(`${API_BASE}/members/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch {}
  }

  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  updateAuthUI(null);
  showView('home');
  showAlert('You have been logged out.', 'info');
}

// ================= VIEW NAVIGATION =================
function showView(viewName) {
  const views = ['home', 'detail', 'favorites', 'my-reviews', 'admin'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add('d-none');
    const nav = document.getElementById(`nav-${v}`);
    if (nav) nav.classList.remove('active');
  });

  const activeView = document.getElementById(`view-${viewName}`);
  if (activeView) activeView.classList.remove('d-none');
  const activeNav = document.getElementById(`nav-${viewName}`);
  if (activeNav) activeNav.classList.add('active');

  if (viewName === 'favorites') loadMyFavorites();
  if (viewName === 'my-reviews') loadMyReviews();
  if (viewName === 'admin') loadAdminData();
}

// ================= ALERTS =================
function showAlert(message, type = 'info') {
  const container = document.getElementById('alert-container');
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  setTimeout(() => {
    container.innerHTML = '';
  }, 4000);
}

// ================= CATEGORIES =================
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories?limit=50`);
    const result = await res.json();
    if (result.success) {
      allCategoriesList = result.data;
      const container = document.getElementById('category-chips');
      let html = `<span class="badge ${currentCategoryId === null ? 'bg-primary active' : 'bg-light text-dark border'} category-pill" onclick="filterByCategory(null)">All Categories</span>`;

      result.data.forEach(cat => {
        const isActive = currentCategoryId === cat.id;
        html += `
          <span class="badge ${isActive ? 'bg-primary active' : 'bg-light text-dark border'} category-pill" onclick="filterByCategory(${cat.id})">
            ${cat.name} <small class="opacity-75">(${cat.recipeCount})</small>
          </span>
        `;
      });
      container.innerHTML = html;
    }
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

function filterByCategory(catId) {
  currentCategoryId = catId;
  currentPage = 1;
  loadCategories();
  loadRecipes();
}

// ================= RECIPES =================
async function loadRecipes() {
  const keyword = document.getElementById('search-keyword').value.trim();
  const difficulty = document.getElementById('search-difficulty').value;

  let url;
  if (keyword) {
    url = `${API_BASE}/recipes/search?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&limit=9`;
    if (currentCategoryId) url += `&categoryId=${currentCategoryId}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
  } else if (currentCategoryId) {
    url = `${API_BASE}/categories/${currentCategoryId}/recipes?page=${currentPage}&limit=9&sort=${currentSort}`;
  } else {
    url = `${API_BASE}/recipes?page=${currentPage}&limit=9&sort=${currentSort}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
  }

  try {
    const res = await fetch(url);
    const result = await res.json();

    if (result.success) {
      renderRecipeGrid(result.data);
      renderPagination(result.pagination);
    }
  } catch (err) {
    console.error('Failed to load recipes', err);
  }
}

function renderRecipeGrid(recipes) {
  const grid = document.getElementById('recipe-grid');
  if (!recipes || recipes.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-egg-fried display-1 text-muted"></i>
        <h5 class="text-muted mt-3">No recipes found</h5>
        <p class="small text-muted">Try clearing your search filters or selecting another category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = recipes.map(r => `
    <div class="col-md-4 col-sm-6">
      <div class="card recipe-card h-100 shadow-sm" onclick="viewRecipeDetail(${r.id})">
        ${r.imageUrl ? `
          <img src="${r.imageUrl}" class="card-img-top" alt="${r.title}" style="height: 200px; object-fit: cover;" onerror="this.onerror=null;this.parentElement.firstElementChild.outerHTML='<div class=\\'card-img-top d-flex align-items-center justify-content-center text-muted\\' style=\\'height: 200px;\\'><i class=\\'bi bi-image fs-1 opacity-50\\'></i></div>';">
        ` : `
          <div class="card-img-top d-flex align-items-center justify-content-center text-muted" style="height: 200px; background-color: #f0f0f0;">
            <i class="bi bi-image fs-1 opacity-50"></i>
          </div>
        `}
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-light text-dark border">${r.category?.name || 'Recipe'}</span>
            <span class="badge badge-${r.difficulty.toLowerCase()}">${r.difficulty}</span>
          </div>
          <h5 class="card-title fw-bold text-dark mb-1 text-truncate">${r.title}</h5>
          <p class="card-text text-muted small flex-grow-1 line-clamp-2">${r.description || 'No description available'}</p>
          <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top small text-muted">
            <span><i class="bi bi-clock"></i> ${r.prepTime + r.cookTime} mins</span>
            <span><i class="bi bi-people"></i> ${r.servings} servings</span>
            <span class="text-warning fw-semibold"><i class="bi bi-star-fill"></i> ${r.averageRating > 0 ? r.averageRating.toFixed(1) : 'New'}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPagination(pagination) {
  const controls = document.getElementById('pagination-controls');
  if (!pagination || pagination.totalPages <= 1) {
    controls.innerHTML = '';
    return;
  }

  let html = '';
  html += `
    <li class="page-item ${pagination.page <= 1 ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${pagination.page - 1})">Previous</button>
    </li>
  `;

  for (let i = 1; i <= pagination.totalPages; i++) {
    html += `
      <li class="page-item ${pagination.page === i ? 'active' : ''}">
        <button class="page-link" onclick="goToPage(${i})">${i}</button>
      </li>
    `;
  }

  html += `
    <li class="page-item ${pagination.page >= pagination.totalPages ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${pagination.page + 1})">Next</button>
    </li>
  `;

  controls.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadRecipes();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSearch(e) {
  e.preventDefault();
  currentPage = 1;
  loadRecipes();
}

function handleSortChange() {
  currentSort = document.getElementById('sort-select').value;
  currentPage = 1;
  loadRecipes();
}

function resetFilters() {
  document.getElementById('search-keyword').value = '';
  document.getElementById('search-difficulty').value = '';
  currentCategoryId = null;
  currentPage = 1;
  loadCategories();
  loadRecipes();
}

// ================= RECIPE DETAIL =================
async function viewRecipeDetail(recipeId) {
  try {
    const [recipeRes, reviewsRes] = await Promise.all([
      fetch(`${API_BASE}/recipes/${recipeId}`),
      fetch(`${API_BASE}/reviews/recipe/${recipeId}?limit=20`),
    ]);

    const recipeData = await recipeRes.json();
    const reviewsData = await reviewsRes.json();

    if (!recipeData.success) {
      showAlert('Recipe not found', 'danger');
      return;
    }

    const r = recipeData.data;
    const rev = reviewsData.success ? reviewsData.data : [];
    const revSummary = reviewsData.success ? reviewsData.summary : { averageRating: 0, reviewCount: 0 };

    // Check favorite status if authenticated
    let isFavorite = false;
    if (token) {
      try {
        const favRes = await fetch(`${API_BASE}/favorites/recipe/${recipeId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const favData = await favRes.json();
        if (favData.success) isFavorite = favData.data.isFavorite;
      } catch {}
    }

    renderRecipeDetail(r, rev, revSummary, isFavorite);
    showView('detail');
  } catch (err) {
    showAlert('Failed to load recipe details', 'danger');
  }
}

function renderRecipeDetail(recipe, reviews, summary, isFavorite) {
  const container = document.getElementById('recipe-detail-container');
  container.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-8">
        ${recipe.imageUrl ? `
          <div class="mb-4 rounded-3 overflow-hidden shadow-sm" style="max-height: 380px;">
            <img src="${recipe.imageUrl}" class="w-100 object-fit-cover" alt="${recipe.title}" style="max-height: 380px;" onerror="this.style.display='none';">
          </div>
        ` : ''}

        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-primary mb-2">${recipe.category?.name}</span>
            <span class="badge badge-${recipe.difficulty.toLowerCase()} mb-2 ms-1">${recipe.difficulty}</span>
            <h2 class="fw-bold mb-2">${recipe.title}</h2>
            <p class="text-muted">${recipe.description || ''}</p>
          </div>
          <div>
            ${currentUser ? `
              <button class="btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}" onclick="toggleFavorite(${recipe.id}, ${isFavorite})">
                <i class="bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}"></i> ${isFavorite ? 'Saved' : 'Favorite'}
              </button>
            ` : ''}
          </div>
        </div>

        <div class="d-flex gap-4 p-3 bg-light rounded-3 my-3">
          <div><i class="bi bi-clock text-primary"></i> <strong>Prep:</strong> ${recipe.prepTime} min</div>
          <div><i class="bi bi-fire text-danger"></i> <strong>Cook:</strong> ${recipe.cookTime} min</div>
          <div><i class="bi bi-people text-success"></i> <strong>Servings:</strong> ${recipe.servings}</div>
          <div><i class="bi bi-star-fill text-warning"></i> <strong>${summary.averageRating > 0 ? summary.averageRating.toFixed(1) : 'New'}</strong> (${summary.reviewCount} reviews)</div>
        </div>

        <h4 class="fw-bold mt-4 mb-3 section-title">Ingredients</h4>
        <ul class="list-group list-group-flush mb-4">
          ${recipe.ingredients.map(ing => `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
              <span><strong>${ing.name}</strong> ${ing.note ? `<small class="text-muted">(${ing.note})</small>` : ''}</span>
              <span class="badge bg-light text-dark border">${ing.quantity} ${ing.unit}</span>
            </li>
          `).join('')}
        </ul>

        <h4 class="fw-bold mt-4 mb-3 section-title">Cooking Steps</h4>
        <div class="d-flex flex-column gap-3 mb-5">
          ${recipe.steps.map(s => `
            <div class="d-flex gap-3 align-items-start p-3 bg-light rounded-3">
              <div class="step-circle flex-shrink-0">${s.stepNumber}</div>
              <div class="pt-1 flex-grow-1">
                <div>${s.instruction}</div>
                ${s.imageUrl ? `
                  <div class="mt-2">
                    <img src="${s.imageUrl}" class="rounded-2 shadow-sm" style="max-height: 180px; max-width: 100%; object-fit: cover;" alt="Step ${s.stepNumber}" onerror="this.style.display='none';">
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Reviews Sidebar -->
      <div class="col-lg-4 border-start">
        <h4 class="fw-bold mb-3 section-title">Community Reviews</h4>

        ${currentUser ? `
          <div class="card border-0 bg-light p-3 mb-4 rounded-3 shadow-sm">
            <h6 class="fw-bold mb-2">Leave a Review</h6>
            <form id="review-form" onsubmit="submitReview(event, ${recipe.id})">
              <div class="mb-2">
                <label class="form-label small mb-1">Rating (1 to 5)</label>
                <select id="review-rating" class="form-select form-select-sm" required>
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value="3">⭐⭐⭐ (3 - Good)</option>
                  <option value="2">⭐⭐ (2 - Fair)</option>
                  <option value="1">⭐ (1 - Poor)</option>
                </select>
              </div>
              <div class="mb-2">
                <textarea id="review-comment" class="form-control form-control-sm" rows="3" placeholder="Write your review..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm w-100">Submit Review</button>
            </form>
          </div>
        ` : `
          <div class="alert alert-warning small">
            Please <a href="#" onclick="openLoginModal()">sign in</a> to leave a review.
          </div>
        `}

        <div class="reviews-list">
          ${reviews.length === 0 ? '<p class="text-muted small">No reviews yet. Be the first to review!</p>' : ''}
          ${reviews.map(rev => `
            <div class="border-bottom pb-3 mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong class="small">${rev.user?.username}</strong>
                <span class="text-warning small">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
              </div>
              <p class="small text-muted mb-1">${rev.comment || 'No comment provided'}</p>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted opacity-75" style="font-size: 0.75rem;">${new Date(rev.createdAt).toLocaleDateString()}</small>
                ${(currentUser && (currentUser.id === rev.user?.id || currentUser.role === 'ADMIN')) ? `
                  <button class="btn btn-link text-danger p-0 small" style="font-size: 0.8rem;" onclick="deleteReview(${rev.id}, ${recipe.id})">Delete</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ================= FAVORITES =================
async function toggleFavorite(recipeId, currentlyFavorited) {
  if (!token) {
    openLoginModal();
    return;
  }

  try {
    if (currentlyFavorited) {
      const res = await fetch(`${API_BASE}/favorites/recipe/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        showAlert('Removed from favorites', 'info');
        viewRecipeDetail(recipeId);
      }
    } else {
      const res = await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipeId }),
      });
      const result = await res.json();
      if (result.success) {
        showAlert('Added to favorites!', 'success');
        viewRecipeDetail(recipeId);
      } else {
        showAlert(result.message || 'Failed to add favorite', 'danger');
      }
    }
  } catch (err) {
    showAlert('Error updating favorite', 'danger');
  }
}

async function loadMyFavorites() {
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/favorites?limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();

    const grid = document.getElementById('favorites-grid');
    if (!result.success || result.data.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No saved favorites yet.</div>';
      return;
    }

    grid.innerHTML = result.data.map(fav => `
      <div class="col-md-4 col-sm-6">
        <div class="card recipe-card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge badge-${fav.recipe.difficulty.toLowerCase()}">${fav.recipe.difficulty}</span>
              <button class="btn btn-outline-danger btn-sm" onclick="removeFavoriteItem(${fav.id}, event)"><i class="bi bi-trash"></i></button>
            </div>
            <h5 class="card-title fw-bold" onclick="viewRecipeDetail(${fav.recipe.id})">${fav.recipe.title}</h5>
            <small class="text-muted">Saved on ${new Date(fav.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load favorites', err);
  }
}

async function removeFavoriteItem(favId, e) {
  e.stopPropagation();
  try {
    const res = await fetch(`${API_BASE}/favorites/${favId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      showAlert('Favorite removed', 'info');
      loadMyFavorites();
    }
  } catch (err) {
    showAlert('Failed to remove favorite', 'danger');
  }
}

// ================= REVIEWS =================
async function submitReview(e, recipeId) {
  e.preventDefault();
  const rating = parseInt(document.getElementById('review-rating').value, 10);
  const comment = document.getElementById('review-comment').value.trim();

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ recipeId, rating, comment }),
    });
    const result = await res.json();

    if (result.success) {
      showAlert('Review submitted!', 'success');
      viewRecipeDetail(recipeId);
    } else {
      showAlert(result.message || 'Failed to submit review', 'danger');
    }
  } catch (err) {
    showAlert('Server error submitting review', 'danger');
  }
}

async function deleteReview(reviewId, recipeId) {
  if (!confirm('Are you sure you want to delete this review?')) return;

  try {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      showAlert('Review deleted', 'info');
      if (recipeId) viewRecipeDetail(recipeId);
      else loadMyReviews();
    } else {
      showAlert(result.message || 'Failed to delete review', 'danger');
    }
  } catch (err) {
    showAlert('Error deleting review', 'danger');
  }
}

async function loadMyReviews() {
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/reviews/my-reviews`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();

    const list = document.getElementById('my-reviews-list');
    if (!result.success || result.data.length === 0) {
      list.innerHTML = '<div class="text-center text-muted py-5">You haven\'t reviewed any recipes yet.</div>';
      return;
    }

    list.innerHTML = result.data.map(rev => `
      <div class="list-group-item p-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <h6 class="fw-bold mb-0 text-primary" role="button" onclick="viewRecipeDetail(${rev.recipe.id})">${rev.recipe.title}</h6>
          <div>
            <span class="text-warning small">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
            <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteReview(${rev.id})"><i class="bi bi-trash"></i></button>
          </div>
        </div>
        <p class="text-muted small mb-1">${rev.comment || 'No comment provided'}</p>
        <small class="text-muted">${new Date(rev.createdAt).toLocaleDateString()}</small>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load my reviews', err);
  }
}

// ================= ADMIN MANAGEMENT =================
async function loadAdminData() {
  await preloadAdminIngredientsAndCategories();
  loadAdminRecipes();
  loadAdminCategories();
  loadAdminIngredients();
}

async function loadAdminRecipes() {
  try {
    const res = await fetch(`${API_BASE}/recipes?limit=100`);
    const result = await res.json();
    const tbody = document.getElementById('admin-recipes-tbody');
    if (result.success) {
      tbody.innerHTML = result.data.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>
            ${r.imageUrl ? `<img src="${r.imageUrl}" class="rounded" style="width: 48px; height: 48px; object-fit: cover;" onerror="this.style.display='none';">` : '<span class="badge bg-light text-muted">No Image</span>'}
          </td>
          <td class="fw-bold">${r.title}</td>
          <td>${r.category?.name}</td>
          <td><span class="badge badge-${r.difficulty.toLowerCase()}">${r.difficulty}</span></td>
          <td>${r.prepTime} / ${r.cookTime} m</td>
          <td>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="viewRecipeDetail(${r.id})"><i class="bi bi-eye"></i></button>
            <button class="btn btn-outline-secondary btn-sm me-1" onclick="openEditRecipeModal(${r.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="adminDeleteRecipe(${r.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {}
}

async function openCreateRecipeModal() {
  await preloadAdminIngredientsAndCategories();

  document.getElementById('rec-id').value = '';
  document.getElementById('rec-title').value = '';
  document.getElementById('rec-desc').value = '';
  document.getElementById('rec-image').value = '';
  document.getElementById('rec-prep').value = 10;
  document.getElementById('rec-cook').value = 15;
  document.getElementById('rec-servings').value = 2;
  document.getElementById('rec-difficulty').value = 'EASY';
  document.getElementById('recipeModalTitle').textContent = 'Create New Recipe';

  // Populate categories
  const catSelect = document.getElementById('rec-category');
  catSelect.innerHTML = allCategoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // Reset ingredients & steps rows
  const ingContainer = document.getElementById('recipe-ingredients-rows');
  ingContainer.innerHTML = '';
  addIngredientRow();

  const stepContainer = document.getElementById('recipe-steps-rows');
  stepContainer.innerHTML = '';
  addStepRow();

  recipeModal.show();
}

async function openEditRecipeModal(recipeId) {
  await preloadAdminIngredientsAndCategories();

  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}`);
    const result = await res.json();
    if (!result.success) return;

    const r = result.data;
    document.getElementById('rec-id').value = r.id;
    document.getElementById('rec-title').value = r.title;
    document.getElementById('rec-desc').value = r.description || '';
    document.getElementById('rec-image').value = r.imageUrl || '';
    document.getElementById('rec-prep').value = r.prepTime;
    document.getElementById('rec-cook').value = r.cookTime;
    document.getElementById('rec-servings').value = r.servings;
    document.getElementById('rec-difficulty').value = r.difficulty;
    document.getElementById('recipeModalTitle').textContent = 'Edit Recipe';

    const catSelect = document.getElementById('rec-category');
    catSelect.innerHTML = allCategoriesList.map(c => `
      <option value="${c.id}" ${c.id === r.category?.id ? 'selected' : ''}>${c.name}</option>
    `).join('');

    // Populate ingredients
    const ingContainer = document.getElementById('recipe-ingredients-rows');
    ingContainer.innerHTML = '';
    if (r.ingredients && r.ingredients.length > 0) {
      r.ingredients.forEach(ing => {
        addIngredientRow(ing.ingredientId, ing.quantity, ing.unit, ing.note);
      });
    } else {
      addIngredientRow();
    }

    // Populate steps
    const stepContainer = document.getElementById('recipe-steps-rows');
    stepContainer.innerHTML = '';
    if (r.steps && r.steps.length > 0) {
      r.steps.forEach(s => {
        addStepRow(s.stepNumber, s.instruction, s.imageUrl);
      });
    } else {
      addStepRow();
    }

    recipeModal.show();
  } catch (err) {
    showAlert('Failed to load recipe details for editing', 'danger');
  }
}

function addIngredientRow(selectedId = '', quantity = '100', unit = 'gram', note = '') {
  const container = document.getElementById('recipe-ingredients-rows');
  const div = document.createElement('div');
  div.className = 'row g-2 align-items-center ingredient-row';

  const ingOptions = allIngredientsList.map(i => `
    <option value="${i.id}" data-unit="${i.defaultUnit}" ${i.id === selectedId ? 'selected' : ''}>${i.name} (${i.defaultUnit})</option>
  `).join('');

  div.innerHTML = `
    <div class="col-sm-4">
      <select class="form-select form-select-sm ing-select" required onchange="onIngredientSelectChange(this)">
        ${ingOptions}
      </select>
    </div>
    <div class="col-sm-2">
      <input type="number" step="0.1" min="0.1" class="form-control form-select-sm ing-qty" placeholder="Qty" value="${quantity}" required>
    </div>
    <div class="col-sm-2">
      <input type="text" class="form-control form-select-sm ing-unit" placeholder="Unit" value="${unit}" required>
    </div>
    <div class="col-sm-3">
      <input type="text" class="form-control form-select-sm ing-note" placeholder="Note (optional)" value="${note || ''}">
    </div>
    <div class="col-sm-1 text-end">
      <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.ingredient-row').remove()"><i class="bi bi-x"></i></button>
    </div>
  `;
  container.appendChild(div);
}

function onIngredientSelectChange(selectEl) {
  const selectedOption = selectEl.options[selectEl.selectedIndex];
  const unit = selectedOption.getAttribute('data-unit');
  const row = selectEl.closest('.ingredient-row');
  if (unit && row) {
    row.querySelector('.ing-unit').value = unit;
  }
}

function addStepRow(stepNum = null, instruction = '', imageUrl = '') {
  const container = document.getElementById('recipe-steps-rows');
  const count = container.querySelectorAll('.step-row').length + 1;
  const num = stepNum || count;

  const div = document.createElement('div');
  div.className = 'p-2 border rounded bg-white step-row';
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-1">
      <span class="badge bg-secondary">Step <span class="step-num-display">${num}</span></span>
      <button type="button" class="btn btn-link text-danger p-0 small" onclick="removeStepRow(this)">Remove</button>
    </div>
    <textarea class="form-control form-control-sm mb-2 step-inst" rows="2" placeholder="Step instruction..." required>${instruction}</textarea>
    <input type="text" class="form-control form-control-sm step-image" placeholder="Step Image URL (optional)" value="${imageUrl || ''}">
  `;
  container.appendChild(div);
}

function removeStepRow(btn) {
  btn.closest('.step-row').remove();
  // Re-number remaining steps
  const rows = document.querySelectorAll('#recipe-steps-rows .step-row');
  rows.forEach((row, index) => {
    row.querySelector('.step-num-display').textContent = index + 1;
  });
}

async function handleSaveRecipe(e) {
  e.preventDefault();

  const id = document.getElementById('rec-id').value;
  const isEdit = !!id;

  const title = document.getElementById('rec-title').value.trim();
  const categoryId = parseInt(document.getElementById('rec-category').value, 10);
  const description = document.getElementById('rec-desc').value.trim();
  const imageUrl = document.getElementById('rec-image').value.trim() || null;
  const prepTime = parseInt(document.getElementById('rec-prep').value, 10);
  const cookTime = parseInt(document.getElementById('rec-cook').value, 10);
  const servings = parseInt(document.getElementById('rec-servings').value, 10);
  const difficulty = document.getElementById('rec-difficulty').value;

  // Collect ingredients
  const ingRows = document.querySelectorAll('#recipe-ingredients-rows .ingredient-row');
  const ingredients = [];
  ingRows.forEach(row => {
    ingredients.push({
      ingredientId: parseInt(row.querySelector('.ing-select').value, 10),
      quantity: parseFloat(row.querySelector('.ing-qty').value),
      unit: row.querySelector('.ing-unit').value.trim(),
      note: row.querySelector('.ing-note').value.trim() || null,
    });
  });

  // Collect steps
  const stepRows = document.querySelectorAll('#recipe-steps-rows .step-row');
  const steps = [];
  stepRows.forEach((row, index) => {
    steps.push({
      stepNumber: index + 1,
      instruction: row.querySelector('.step-inst').value.trim(),
      imageUrl: row.querySelector('.step-image').value.trim() || null,
    });
  });

  if (ingredients.length === 0) {
    showAlert('Please add at least one ingredient', 'warning');
    return;
  }

  if (steps.length === 0) {
    showAlert('Please add at least one step', 'warning');
    return;
  }

  const payload = {
    title,
    categoryId,
    description,
    imageUrl,
    prepTime,
    cookTime,
    servings,
    difficulty,
    ingredients,
    steps,
  };

  const url = isEdit ? `${API_BASE}/recipes/${id}` : `${API_BASE}/recipes`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      recipeModal.hide();
      showAlert(`Recipe ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
      loadAdminRecipes();
      loadRecipes();
    } else {
      showAlert(result.message || 'Failed to save recipe', 'danger');
    }
  } catch (err) {
    showAlert('Server error saving recipe', 'danger');
  }
}

async function adminDeleteRecipe(recipeId) {
  if (!confirm('Are you sure you want to delete this recipe?')) return;
  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      showAlert('Recipe deleted successfully', 'success');
      loadAdminRecipes();
      loadRecipes();
    } else {
      showAlert(result.message || 'Cannot delete recipe', 'danger');
    }
  } catch (err) {
    showAlert('Server error', 'danger');
  }
}

async function loadAdminCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories?limit=100`);
    const result = await res.json();
    const tbody = document.getElementById('admin-categories-tbody');
    if (result.success) {
      tbody.innerHTML = result.data.map(c => `
        <tr>
          <td>${c.id}</td>
          <td class="fw-bold">${c.name}</td>
          <td class="small text-muted">${c.description || '-'}</td>
          <td><span class="badge bg-secondary">${c.recipeCount}</span></td>
          <td>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="openEditCategoryModal(${c.id}, '${c.name.replace(/'/g, "\\'")}', '${(c.description || '').replace(/'/g, "\\'")}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="adminDeleteCategory(${c.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {}
}

function openCreateCategoryModal() {
  document.getElementById('cat-id').value = '';
  document.getElementById('cat-name').value = '';
  document.getElementById('cat-desc').value = '';
  document.getElementById('categoryModalTitle').textContent = 'New Category';
  categoryModal.show();
}

function openEditCategoryModal(id, name, desc) {
  document.getElementById('cat-id').value = id;
  document.getElementById('cat-name').value = name;
  document.getElementById('cat-desc').value = desc;
  document.getElementById('categoryModalTitle').textContent = 'Edit Category';
  categoryModal.show();
}

async function handleSaveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('cat-id').value;
  const name = document.getElementById('cat-name').value.trim();
  const description = document.getElementById('cat-desc').value.trim();

  const isEdit = !!id;
  const url = isEdit ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    const result = await res.json();
    if (result.success) {
      categoryModal.hide();
      showAlert(`Category ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
      loadAdminCategories();
      loadCategories();
    } else {
      showAlert(result.message || 'Failed to save category', 'danger');
    }
  } catch (err) {
    showAlert('Server error', 'danger');
  }
}

async function adminDeleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      showAlert('Category deleted', 'success');
      loadAdminCategories();
      loadCategories();
    } else {
      showAlert(result.message || 'Cannot delete category', 'danger');
    }
  } catch (err) {
    showAlert('Server error', 'danger');
  }
}

async function loadAdminIngredients() {
  try {
    const res = await fetch(`${API_BASE}/ingredients?limit=100`);
    const result = await res.json();
    const tbody = document.getElementById('admin-ingredients-tbody');
    if (result.success) {
      tbody.innerHTML = result.data.map(i => `
        <tr>
          <td>${i.id}</td>
          <td class="fw-bold">${i.name}</td>
          <td><span class="badge bg-light text-dark border">${i.defaultUnit}</span></td>
          <td class="small text-muted">${i.description || '-'}</td>
          <td>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="openEditIngredientModal(${i.id}, '${i.name.replace(/'/g, "\\'")}', '${i.defaultUnit}', '${(i.description || '').replace(/'/g, "\\'")}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="adminDeleteIngredient(${i.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {}
}

function openCreateIngredientModal() {
  document.getElementById('ing-id').value = '';
  document.getElementById('ing-name').value = '';
  document.getElementById('ing-unit').value = 'gram';
  document.getElementById('ing-desc').value = '';
  document.getElementById('ingredientModalTitle').textContent = 'New Ingredient';
  ingredientModal.show();
}

function openEditIngredientModal(id, name, unit, desc) {
  document.getElementById('ing-id').value = id;
  document.getElementById('ing-name').value = name;
  document.getElementById('ing-unit').value = unit;
  document.getElementById('ing-desc').value = desc;
  document.getElementById('ingredientModalTitle').textContent = 'Edit Ingredient';
  ingredientModal.show();
}

async function handleSaveIngredient(e) {
  e.preventDefault();
  const id = document.getElementById('ing-id').value;
  const name = document.getElementById('ing-name').value.trim();
  const defaultUnit = document.getElementById('ing-unit').value.trim();
  const description = document.getElementById('ing-desc').value.trim();

  const isEdit = !!id;
  const url = isEdit ? `${API_BASE}/ingredients/${id}` : `${API_BASE}/ingredients`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, defaultUnit, description }),
    });
    const result = await res.json();
    if (result.success) {
      ingredientModal.hide();
      showAlert(`Ingredient ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
      loadAdminIngredients();
    } else {
      showAlert(result.message || 'Failed to save ingredient', 'danger');
    }
  } catch (err) {
    showAlert('Server error', 'danger');
  }
}

async function adminDeleteIngredient(id) {
  if (!confirm('Are you sure you want to delete this ingredient?')) return;
  try {
    const res = await fetch(`${API_BASE}/ingredients/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      showAlert('Ingredient deleted', 'success');
      loadAdminIngredients();
    } else {
      showAlert(result.message || 'Cannot delete ingredient', 'danger');
    }
  } catch (err) {
    showAlert('Server error', 'danger');
  }
}
