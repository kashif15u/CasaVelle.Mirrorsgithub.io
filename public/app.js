const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let products = [], authMode = "login", currentUser = null;
const token = () => localStorage.getItem("casavelle_token");
const money = n => "₹" + Number(n).toLocaleString("en-IN");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function api(url, options={}) {
  const headers = {"Content-Type":"application/json",...(options.headers||{})};
  if(token()) headers.Authorization = "Bearer "+token();
  const r=await fetch(url,{...options,headers});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||"Something went wrong.");
  return data;
}
async function loadProducts(){
  const grid=$("#productGrid"); grid.innerHTML='<div class="loading">Curating the collection…</div>';
  try{
    const [min,max]=($("#priceFilter")?.value||"0-100000").split("-").map(Number);
    const params=new URLSearchParams({q:$("#searchInput")?.value||"",category:$("#categoryFilter")?.value||"All Mirrors",min,max});
    products=await api("/api/products?"+params.toString());
    if(!products.length){grid.innerHTML='<div class="empty-state">No mirrors found. Try another search or filter.</div>';return;}
    grid.innerHTML=products.map(p=>`<article class="product-card">
      <div class="product-image" data-view="${esc(p.id)}"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"><span class="product-badge">${p.featured?"CASAVELLE EDIT":"CURATED DESIGN"}</span></div>
      <div class="product-info"><div class="product-category">${esc(p.category)}</div><div class="product-title-row"><h3 class="product-title">${esc(p.name)}</h3><div class="product-price">${money(p.price)} ${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:""}</div></div>
      <div class="product-size">${esc(p.size||"Contact us for dimensions")}</div><div class="product-actions"><button class="mini-button" data-view="${esc(p.id)}">View details</button><button class="mini-button primary" data-order="${esc(p.id)}">Enquire / order</button></div></div></article>`).join("");
  }catch(e){grid.innerHTML=`<div class="empty-state">Could not load products. Please refresh the page.<br>${esc(e.message)}</div>`;}
}
function openModal(id){const m=$("#"+id);m.classList.add("open");m.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeModal(id){const m=$("#"+id);m.classList.remove("open");m.setAttribute("aria-hidden","true");document.body.style.overflow="";}
function setAuthMode(mode){authMode=mode;$$(".auth-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));$("#nameField").classList.toggle("hidden",mode!=="signup");$("#nameField input").required=mode==="signup";$("#authSubmit").textContent=mode==="signup"?"Create account":"Sign in";$("#authTitle").innerHTML=mode==="signup"?"Join the CASAVELLE<br><em>experience.</em>":"Your account,<br><em>made simple.</em>";$("#authMessage").textContent="";}
async function refreshUser(){if(!token()){currentUser=null;$("#accountBtn").textContent="Sign in";return;}try{currentUser=await api("/api/me");$("#accountBtn").textContent="Hi, "+(currentUser.name||"Account").split(" ")[0];}catch{localStorage.removeItem("casavelle_token");currentUser=null;$("#accountBtn").textContent="Sign in";}}
async function showProduct(id, order=false){
  const p=products.find(x=>x.id===id)||await api("/api/products/"+encodeURIComponent(id));
  $("#productDetail").innerHTML=`<div class="detail-layout"><img src="${esc(p.image)}" alt="${esc(p.name)}"><div><div class="product-category">${esc(p.category)}</div><h2>${esc(p.name)}</h2><div class="detail-price">${money(p.price)} ${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:""}</div><p><b>Size:</b> ${esc(p.size||"Please enquire")}</p><p>${esc(p.description)}</p><p class="tiny-note">Illustrative product visual. Confirm actual design, availability and delivery cost before purchase.</p><button class="button button-dark" id="detailOrder">Enquire / order on WhatsApp ↗</button></div></div>`;
  $("#detailOrder").onclick=()=>{const msg=`Hello CASAVELLE, I am interested in ${p.name} (${p.id}) listed at ${money(p.price)}. Please confirm availability, actual design, size and delivery charges.`;window.open("https://wa.me/919389867765?text="+encodeURIComponent(msg),"_blank","noopener");};
  openModal("productModal");
}
$("#productGrid").addEventListener("click",e=>{const view=e.target.closest("[data-view]");const order=e.target.closest("[data-order]");if(view)showProduct(view.dataset.view);else if(order)showProduct(order.dataset.order,true);});
$("#searchInput").addEventListener("input",()=>{clearTimeout(window.searchTimer);window.searchTimer=setTimeout(loadProducts,250);});
$("#categoryFilter").addEventListener("change",loadProducts);$("#priceFilter").addEventListener("change",loadProducts);
$("#accountBtn").onclick=()=>{if(currentUser){if(confirm("Sign out of your CASAVELLE account?")){localStorage.removeItem("casavelle_token");refreshUser();}}else{setAuthMode("login");openModal("authModal");}};
$("#newsletterSignup").onclick=()=>{setAuthMode("signup");openModal("authModal");};
$$(".auth-tabs button").forEach(b=>b.onclick=()=>setAuthMode(b.dataset.mode));
$("#authForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const payload={email:f.get("email"),password:f.get("password")};if(authMode==="signup")payload.name=f.get("name");const msg=$("#authMessage");msg.textContent="Please wait…";try{const result=await api(authMode==="signup"?"/api/signup":"/api/login",{method:"POST",body:JSON.stringify(payload)});localStorage.setItem("casavelle_token",result.token);currentUser=result.user;closeModal("authModal");await refreshUser();if(currentUser.role==="admin")window.location.href="/admin.html";else alert("Welcome to CASAVELLE, "+currentUser.name+"!");}catch(err){msg.textContent=err.message;}});
$("#closeModal").onclick=()=>closeModal("authModal");$("#closeProduct").onclick=()=>closeModal("productModal");
$$(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id);}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal-backdrop.open").forEach(m=>closeModal(m.id));});
$("#menuBtn").onclick=()=>$("#nav").classList.toggle("open");$("#nav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("#nav").classList.remove("open")));
$("#year").textContent=new Date().getFullYear();
refreshUser();loadProducts();
