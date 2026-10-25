require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, "data");
const JWT_SECRET = process.env.JWT_SECRET || "development-only-change-me";
const primaryWhatsApp = process.env.WHATSAPP_PRIMARY || "919389867765";
const secondaryWhatsApp = process.env.WHATSAPP_SECONDARY || "919690190316";

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(ROOT, "public")));

function read(name) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8")); }
  catch { return []; }
}
function write(name, value) {
  fs.writeFileSync(path.join(DATA, name), JSON.stringify(value, null, 2), "utf8");
}
function tokenFor(user) {
  return jwt.sign({id:user.id, email:user.email, role:user.role}, JWT_SECRET, {expiresIn:"7d"});
}
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({error:"Please sign in again."}); }
}
function adminOnly(req,res,next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({error:"Admin access required."});
  next();
}
function safeUser(u) { return {id:u.id, name:u.name, email:u.email, createdAt:u.createdAt}; }

app.get("/api/health", (req,res)=>res.json({ok:true, brand:"CASAVELLE"}));
app.get("/api/config", (req,res)=>res.json({whatsappPrimary:primaryWhatsApp, whatsappSecondary:secondaryWhatsApp, serviceAreas:["Amroha, Uttar Pradesh","Moradabad, Uttar Pradesh"]}));

app.get("/api/products", (req,res)=>{
  let products = read("products.json").filter(p=>p.active !== false);
  const q = String(req.query.q || "").toLowerCase().trim();
  const category = String(req.query.category || "");
  const min = Number(req.query.min || 0);
  const max = Number(req.query.max || 10000000);
  if(q) products = products.filter(p => `${p.name} ${p.category} ${p.description} ${p.size}`.toLowerCase().includes(q));
  if(category && category !== "All Mirrors") products = products.filter(p=>p.category===category);
  products = products.filter(p=>p.price>=min && p.price<=max);
  res.json(products);
});
app.get("/api/products/:id", (req,res)=>{
  const p = read("products.json").find(x=>x.id===req.params.id && x.active!==false);
  if(!p) return res.status(404).json({error:"Product not found"});
  res.json(p);
});

app.post("/api/signup", async (req,res)=>{
  const name = String(req.body.name||"").trim();
  const email = String(req.body.email||"").trim().toLowerCase();
  const password = String(req.body.password||"");
  if(name.length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length<8)
    return res.status(400).json({error:"Enter your name, a valid email and a password of at least 8 characters."});
  const users = read("users.json");
  if(users.some(u=>u.email===email)) return res.status(409).json({error:"An account with this email already exists."});
  const user = {id:"U"+Date.now(),name,email,passwordHash:await bcrypt.hash(password,10),role:"customer",createdAt:new Date().toISOString()};
  users.push(user); write("users.json",users);
  res.status(201).json({token:tokenFor(user),user:safeUser(user)});
});
app.post("/api/login", async (req,res)=>{
  const email = String(req.body.email||"").trim().toLowerCase();
  const password = String(req.body.password||"");
  const users = read("users.json");
  let user = users.find(u=>u.email===email);
  if(!user && process.env.ADMIN_EMAIL && email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD) {
    user={id:"ADMIN",name:"CASAVELLE Admin",email,role:"admin",createdAt:new Date().toISOString()};
  } else if(!user || !(await bcrypt.compare(password,user.passwordHash||""))) {
    return res.status(401).json({error:"Email or password is incorrect."});
  }
  res.json({token:tokenFor(user),user:safeUser(user)});
});
app.get("/api/me", auth, (req,res)=>{
  if(req.user.role==="admin") return res.json({id:req.user.id,name:"CASAVELLE Admin",email:req.user.email,role:"admin"});
  const u=read("users.json").find(x=>x.id===req.user.id);
  if(!u) return res.status(404).json({error:"Account not found"});
  res.json({...safeUser(u),role:u.role});
});

app.post("/api/orders", auth, (req,res)=>{
  const {items, customerName, phone, address, note} = req.body || {};
  if(!Array.isArray(items)||!items.length || !customerName || !phone || !address)
    return res.status(400).json({error:"Please provide products, name, phone and delivery address."});
  const products=read("products.json");
  const cleanItems=[];
  for(const item of items) {
    const p=products.find(x=>x.id===item.id && x.active!==false);
    const qty=Math.max(1,Math.min(20,Number(item.qty)||1));
    if(p) cleanItems.push({id:p.id,name:p.name,price:p.price,qty});
  }
  if(!cleanItems.length) return res.status(400).json({error:"No valid products in order."});
  const total=cleanItems.reduce((sum,i)=>sum+i.price*i.qty,0);
  const orders=read("orders.json");
  const order={id:"CV-"+Date.now(),userId:req.user.id,customerName:String(customerName).slice(0,100),phone:String(phone).slice(0,30),address:String(address).slice(0,500),note:String(note||"").slice(0,500),items:cleanItems,total,status:"New",createdAt:new Date().toISOString()};
  orders.unshift(order); write("orders.json",orders);
  res.status(201).json({order,whatsapp:primaryWhatsApp});
});

app.get("/api/admin/summary", auth, adminOnly, (req,res)=>{
  const products=read("products.json");
  const orders=read("orders.json");
  const users=read("users.json");
  res.json({products:products.length,activeProducts:products.filter(p=>p.active!==false).length,orders:orders.length,customers:users.length,revenue:orders.reduce((s,o)=>s+o.total,0),recentOrders:orders.slice(0,10)});
});
app.get("/api/admin/products", auth, adminOnly, (req,res)=>res.json(read("products.json")));
app.post("/api/admin/products", auth, adminOnly, (req,res)=>{
  const {name,category,price,size,description,image} = req.body||{};
  if(!name||!category||!Number.isFinite(Number(price))||Number(price)<0) return res.status(400).json({error:"Product name, category and valid price are required."});
  const products=read("products.json");
  const p={id:"CV"+String(Date.now()).slice(-8),name:String(name).slice(0,100),category:String(category).slice(0,80),price:Number(price),oldPrice:null,size:String(size||"Contact us"),description:String(description||"").slice(0,500),featured:false,active:true,image:image||"/assets/mirror-round.svg"};
  products.unshift(p);write("products.json",products);res.status(201).json(p);
});
app.patch("/api/admin/products/:id", auth, adminOnly, (req,res)=>{
  const products=read("products.json"); const p=products.find(x=>x.id===req.params.id);
  if(!p) return res.status(404).json({error:"Product not found"});
  for(const key of ["name","category","size","description","image"]) if(req.body[key]!==undefined) p[key]=String(req.body[key]).slice(0,500);
  if(req.body.price!==undefined && Number.isFinite(Number(req.body.price)) && Number(req.body.price)>=0) p.price=Number(req.body.price);
  if(req.body.active!==undefined) p.active=Boolean(req.body.active);
  write("products.json",products);res.json(p);
});
app.get("/api/admin/orders", auth, adminOnly, (req,res)=>res.json(read("orders.json")));
app.patch("/api/admin/orders/:id", auth, adminOnly, (req,res)=>{
  const orders=read("orders.json"); const o=orders.find(x=>x.id===req.params.id);
  if(!o) return res.status(404).json({error:"Order not found"});
  const allowed=["New","Confirmed","Packed","Shipped","Delivered","Cancelled"];
  if(!allowed.includes(req.body.status)) return res.status(400).json({error:"Invalid order status"});
  o.status=req.body.status;write("orders.json",orders);res.json(o);
});

app.get("*",(req,res)=>res.sendFile(path.join(ROOT,"public","index.html")));
app.listen(PORT,()=>console.log(`CASAVELLE website running at http://localhost:${PORT}`));
