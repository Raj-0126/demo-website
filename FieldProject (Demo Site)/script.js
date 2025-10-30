/* script.js
   - single shared product data
   - renders products on shop / home / deals / categories
   - cart & wishlist stored in localStorage
*/

const PRODUCTS = [
  // electronics
  { id: 'p1', name: 'Wireless Headphones', category: 'electronics', price: 89.99, image: 'image3.jpg', featured: true, deal: true },
  { id: 'p2', name: 'Wireless Mouse', category: 'electronics', price: 29.99, image: 'image3.jpg', featured: true, deal: false },
  { id: 'p3', name: 'Mechanical Keyboard', category: 'electronics', price: 119.99, image: 'image4.jpg', featured: false, deal: true },

  // fashion
  { id: 'p4', name: 'Classic Sneakers', category: 'fashion', price: 79.99, image: 'image5.jpg', featured: true, deal: false },
  { id: 'p5', name: 'Denim Jacket', category: 'fashion', price: 99.95, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=80&auto=format&fit=crop', featured: false, deal: true },

  // home
  { id: 'p6', name: 'Ceramic Coffee Maker', category: 'home', price: 59.99, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80&auto=format&fit=crop', featured: false, deal: true },
  { id: 'p7', name: 'Modern Rug', category: 'home', price: 129.00, image: 'image6.jpg', featured: true, deal: false },

  // beauty
  { id: 'p8', name: 'Luxury Serum', category: 'beauty', price: 45.00, image: 'image8.jpg', featured: false, deal: true },
  { id: 'p9', name: 'Spa Candle Gift Set', category: 'beauty', price: 29.99, image: 'image9.jpg', featured: false, deal: false }
];

// localStorage helpers
function load(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) || fallback } catch(e){ return fallback } }
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)) }

let CART = load('nm_cart', []);
let WISHLIST = load('nm_wishlist', []);
let MODE = localStorage.getItem('nm_mode') || 'light';

// common DOM helpers
const byId = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

// update cart count badge
function updateCartCount(){
  const els = qsa('#cart-count');
  els.forEach(el => el.textContent = CART.length);
}

// render a product card (used in multiple pages)
function makeProductCard(product){
  const div = document.createElement('div');
  div.className = 'product-card';
  div.innerHTML = `
    <img loading="lazy" src="${product.image}" alt="${escapeHtml(product.name)}">
    <div class="product-info">
      <h3>${escapeHtml(product.name)}</h3>
      <div>
        <span class="price">$${product.price.toFixed(2)}</span>
        ${product.deal ? '<span class="muted"> • Deal</span>' : ''}
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn small add" data-id="${product.id}">Add to cart</button>
        <button class="btn small ghost wish" data-id="${product.id}">${WISHLIST.find(p=>p.id===product.id)?'♥':'♡'}</button>
      </div>
    </div>
  `;
  // add animation
  div.style.opacity = 0;
  setTimeout(()=>{ div.style.transition='opacity .4s ease, transform .25s ease'; div.style.opacity=1; div.style.transform='translateY(0)' }, 30);
  return div;
}

// escape helper
function escapeHtml(s){ return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

// page specific rendering
function onLoad(){
  // set dark mode
  if(MODE === 'dark') document.body.classList.add('dark');

  updateCartCount();

  const page = document.body.getAttribute('data-page');

  if(page === 'home'){
    // featured picks
    const featured = PRODUCTS.filter(p=>p.featured);
    const holder = document.getElementById('featured-grid');
    featured.forEach(p => holder.appendChild(makeProductCard(p)));
  }

  if(page === 'shop'){
    const grid = document.getElementById('product-grid');
    const search = document.getElementById('search');
    const cat = document.getElementById('categoryFilter');
    const sort = document.getElementById('sortBy');

    // if URL has ?category=.. pre-select
    const params = new URLSearchParams(location.search);
    const urlCat = params.get('category');
    if(urlCat && cat) cat.value = urlCat;

    function applyFilters(){
      let list = PRODUCTS.slice();
      const q = search?.value?.toLowerCase?.() || '';
      const c = cat?.value || 'all';
      const s = sort?.value || 'featured';
      if(c !== 'all') list = list.filter(p=>p.category===c);
      if(q) list = list.filter(p=>p.name.toLowerCase().includes(q));
      if(s === 'price-asc') list.sort((a,b)=>a.price-b.price);
      if(s === 'price-desc') list.sort((a,b)=>b.price-a.price);
      if(s === 'featured') list.sort((a,b)=> (b.featured?1:0) - (a.featured?1:0));
      grid.innerHTML = '';
      list.forEach(p => grid.appendChild(makeProductCard(p)));
      attachProductButtons();
    }

    [search, cat, sort].forEach(el=> el && el.addEventListener('input', applyFilters));
    applyFilters();
  }

  if(page === 'categories'){
    // nothing else, user clicks category cards to filter in shop
  }

  if(page === 'deals'){
    const holder = document.getElementById('deals-grid');
    const deals = PRODUCTS.filter(p => p.deal);
    deals.forEach(p => holder.appendChild(makeProductCard(p)));
    attachProductButtons();
  }

  if(page === 'cart'){
    renderCart();
  }

  // attach global action handlers
  qsa('.add').forEach(btn => btn.addEventListener('click', (e)=> {
    const id = e.currentTarget.dataset.id; addToCartById(id);
  }));
  qsa('.wish').forEach(btn => btn.addEventListener('click', (e)=> {
    const id = e.currentTarget.dataset.id; toggleWishlistById(id, e.currentTarget);
  }));

  // dark toggle (multiple pages)
  const darkToggles = qsa('#darkToggle');
  darkToggles.forEach(t => t.addEventListener('click', toggleDark));

  // featured / shop attach
  attachProductButtons();

  // checkout & clear on cart page
  const clr = byId('clearCart'); if(clr) clr.addEventListener('click', ()=>{ CART=[]; save('nm_cart',CART); renderCart(); updateCartCount(); });
  const chk = byId('checkout'); if(chk) chk.addEventListener('click', ()=>{ if(CART.length===0){ alert('Your cart is empty'); return } alert('Checkout simulated — this is a front-end demo.'); CART=[]; save('nm_cart',CART); renderCart(); updateCartCount(); });

  // show/hide empty note on cart page
  const emptyNote = byId('empty-note'); if(emptyNote) emptyNote.style.display = CART.length ? 'none' : 'block';
}

// attach add/wish handlers (use for dynamic cards)
function attachProductButtons(){
  qsa('.product-card .add').forEach(btn=>{
    btn.onclick = ()=> addToCartById(btn.dataset.id);
  });
  qsa('.product-card .wish').forEach(btn=>{
    btn.onclick = ()=> toggleWishlistById(btn.dataset.id, btn);
  });
}

// add to cart by id
function addToCartById(id){
  const prod = PRODUCTS.find(p => p.id === id);
  if(!prod) return alert('Product not found');
  CART.push(prod);
  save('nm_cart', CART);
  updateCartCount();
  animateCartFly(prod);
}

// wishlist toggle
function toggleWishlistById(id, btnEl){
  const prod = PRODUCTS.find(p => p.id === id);
  if(!prod) return;
  const exists = WISHLIST.find(p=>p.id===id);
  if(exists){
    WISHLIST = WISHLIST.filter(p=>p.id!==id);
    btnEl && (btnEl.textContent = '♡');
  } else {
    WISHLIST.push(prod);
    btnEl && (btnEl.textContent = '♥');
  }
  save('nm_wishlist', WISHLIST);
}

// simple animation: small fly effect from add button to cart icon
function animateCartFly(product){
  const img = document.createElement('img');
  img.src = product.image;
  img.style.position = 'fixed';
  img.style.width='80px';
  img.style.zIndex=9999;
  img.style.borderRadius='8px';
  // place near bottom center (safe fallback)
  img.style.left = (window.innerWidth/2 - 40) + 'px';
  img.style.top = (window.innerHeight/2 - 40) + 'px';
  document.body.appendChild(img);
  const target = qsa('#cart-count')[0] || document.querySelector('.icon-btn');
  const rect = target ? target.getBoundingClientRect() : {left: window.innerWidth-60, top:20};
  setTimeout(()=> {
    img.style.transition = 'transform .8s ease, left .8s ease, top .8s ease, opacity .8s';
    img.style.left = (rect.left + 10) + 'px';
    img.style.top = (rect.top + 10) + 'px';
    img.style.transform = 'scale(.2)';
    img.style.opacity = '0.2';
  }, 20);
  setTimeout(()=> img.remove(), 900);
}

// render cart page
function renderCart(){
  const container = byId('cart-items');
  if(!container) return;
  container.innerHTML = '';
  if(CART.length === 0){
    container.innerHTML = '<p class="muted">Your cart is empty.</p>';
    byId('cart-total').textContent = '0.00';
    const empty = byId('empty-note'); if(empty) empty.style.display='block';
    return;
  }
  const summary = CART.reduce((s,p)=> s + p.price, 0);
  byId('cart-total').textContent = summary.toFixed(2);
  byId('empty-note') && (byId('empty-note').style.display = 'none');

  CART.forEach((p, idx) => {
    const el = document.createElement('div'); el.className = 'cart-item';
    el.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
      <div class="meta">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${escapeHtml(p.name)}</strong><div class="muted">${p.category}</div></div>
          <div style="text-align:right">
            <div class="price">$${p.price.toFixed(2)}</div>
            <div style="margin-top:8px">
              <button class="btn small ghost remove" data-idx="${idx}">Remove</button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(el);
  });

  qsa('.remove').forEach(btn => btn.addEventListener('click', (e) => {
    const idx = Number(e.currentTarget.dataset.idx);
    CART.splice(idx,1);
    save('nm_cart', CART);
    renderCart();
    updateCartCount();
  }));
}

// dark mode toggle
function toggleDark(){
  document.body.classList.toggle('dark');
  MODE = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('nm_mode', MODE);
}

// on load hook
document.addEventListener('DOMContentLoaded', () => {
  onLoad();
  updateCartCount();
});

