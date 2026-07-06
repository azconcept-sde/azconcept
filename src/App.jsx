import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  ShoppingCart, X, TrendingUp, DollarSign, Eye, Plus, Minus,
  Check, Lock, Package, Users, Instagram, KeyRound, UserCircle2,
  LogOut, Eye as EyeIcon, EyeOff, Pencil, Trash2, ImagePlus,
  Save, AlertCircle, CreditCard, Landmark, Mail, MessageCircle, Truck
} from "lucide-react";

const B = {
  orange:"#FF8321", pink:"#FF63CF",
  ink:"#1A1A1A", muted:"#6B6B6B",
  bg:"#FAFAFA", white:"#FFFFFF",
  arena:"#EFEFEF", line:"#E5E5E5",
  verde:"#16A34A", red:"#DC2626",
};

const WA_NUMBER = "5493855027443";
const WA_LINK   = `https://wa.me/${WA_NUMBER}`;
const IG_LINK   = "https://www.instagram.com/azconcept.ar";

const USERS = {
  azambolin:   { handle:"@azambolin",   name:"Ago Zambolin",        color:B.orange, grad:`linear-gradient(135deg,${B.orange},#CC6200)` },
  bravotrotta: { handle:"@bravotrotta", name:"Camila Bravo Trotta", color:B.pink,   grad:`linear-gradient(135deg,${B.pink},#CC2E9E)` },
};

const DEFAULT_PRODUCTS = [
  { name:"Funda iPhone",       description:"Funda personalizada para iPhone, resistente y con tu diseño exclusivo.",       cat:"Fundas",            price:8500,  cost:2800, views:0, sales:0, stock:15, icon:"📱", bg:"linear-gradient(145deg,#FF8321,#CC6200)",   photo:null },
  { name:"Funda Samsung",      description:"Funda a medida para Samsung, hecha con materiales de calidad.",                cat:"Fundas",            price:7500,  cost:2500, views:0, sales:0, stock:12, icon:"📱", bg:"linear-gradient(145deg,#FF63CF,#CC2E9E)",   photo:null },
  { name:'Porta Mac 13"',      description:'Porta notebook artesanal para Mac 13", acolchado y resistente.',               cat:"Porta Computadora", price:18000, cost:6500, views:0, sales:0, stock:8,  icon:"💻", bg:"linear-gradient(145deg,#1A1A1A,#3D3D3D)",   photo:null },
  { name:"Mouse Pad XL",       description:"Mouse pad de gran superficie con diseño exclusivo AZ Concept.",                cat:"Mouse Pad",         price:5500,  cost:1800, views:0, sales:0, stock:20, icon:"🖱️", bg:"linear-gradient(145deg,#FFB066,#FF8321)",   photo:null },
  { name:"Neceser Concept",    description:"Neceser de tela resistente personalizado, ideal para el día a día.",           cat:"Neceser",           price:9500,  cost:3200, views:0, sales:0, stock:10, icon:"👜", bg:"linear-gradient(145deg,#FF8321,#FF63CF)",   photo:null },
  { name:'Porta Notebook 15"', description:'Porta notebook artesanal para 15", protección con identidad propia.',         cat:"Porta Computadora", price:20000, cost:7200, views:0, sales:0, stock:6,  icon:"💼", bg:"linear-gradient(145deg,#1A1A1A,#FF8321)",   photo:null },
];

const GRADIENTS = [
  "linear-gradient(145deg,#FF8321,#CC6200)",
  "linear-gradient(145deg,#FF63CF,#CC2E9E)",
  "linear-gradient(145deg,#1A1A1A,#3D3D3D)",
  "linear-gradient(145deg,#FFB066,#FF8321)",
  "linear-gradient(145deg,#FF8321,#FF63CF)",
  "linear-gradient(145deg,#1A1A1A,#FF8321)",
  "linear-gradient(145deg,#FF63CF,#FF8321)",
  "linear-gradient(145deg,#9333EA,#FF63CF)",
];

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const fmt = n => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n);

// ─── Supabase REST helpers ────────────────────────────────────────────────────
const SB_URL = "https://fwynwohdkwpnqxflwqcj.supabase.co/rest/v1";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3eW53b2hka3dwbnF4Zmx3cWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDEwMTcsImV4cCI6MjA5ODA3NzAxN30.BwgpwPewKQPl4yJ77q1qjYTf5OXgWBX0XRUzyN4yhb4";
const SB_H = { "Content-Type":"application/json", "apikey":SB_KEY, "Authorization":`Bearer ${SB_KEY}` };

async function sbGetProducts() {
  const r = await fetch(`${SB_URL}/products?select=*&order=id`, { headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function sbSeedProducts(prods) {
  const r = await fetch(`${SB_URL}/products`, {
    method:"POST", headers:{...SB_H,"Prefer":"return=minimal"},
    body: JSON.stringify(prods)
  });
  if (!r.ok) throw new Error(await r.text());
}

async function sbUpsertProduct(product) {
  const { id, ...data } = product;
  if (id) {
    const r = await fetch(`${SB_URL}/products?id=eq.${id}`, {
      method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"},
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    return id;
  } else {
    const r = await fetch(`${SB_URL}/products`, {
      method:"POST", headers:{...SB_H,"Prefer":"return=representation"},
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    const rows = await r.json();
    return rows[0].id;
  }
}

async function sbDeleteProduct(id) {
  const r = await fetch(`${SB_URL}/products?id=eq.${id}`, { method:"DELETE", headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
}

async function sbGetConfig(key) {
  const r = await fetch(`${SB_URL}/config?select=value&key=eq.${encodeURIComponent(key)}&limit=1`, { headers: SB_H });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0]?.value ?? null;
}

async function sbSetConfig(key, value) {
  const r = await fetch(`${SB_URL}/config`, {
    method:"POST",
    headers:{...SB_H,"Prefer":"resolution=merge-duplicates,return=minimal"},
    body: JSON.stringify({ key, value })
  });
  if (!r.ok) throw new Error(await r.text());
}

async function sbCreateVisitor(data) {
  const r = await fetch(`${SB_URL}/visitors`, {
    method:"POST", headers:{...SB_H,"Prefer":"return=representation"},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0];
}

async function sbLogVisit(visitor_id) {
  const r = await fetch(`${SB_URL}/visits`, {
    method:"POST", headers:{...SB_H,"Prefer":"return=minimal"},
    body: JSON.stringify({ visitor_id })
  });
  if (!r.ok) throw new Error(await r.text());
}

async function sbGetVisitors() {
  const r = await fetch(`${SB_URL}/visitors?select=*&order=created_at.desc&limit=200`, { headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function sbGetVisitsCount() {
  const r = await fetch(`${SB_URL}/visits?select=id`, { headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows.length;
}

async function sbCreateOrder(order) {
  const r = await fetch(`${SB_URL}/orders`, {
    method:"POST", headers:{...SB_H,"Prefer":"return=representation"},
    body: JSON.stringify(order)
  });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0];
}

async function sbGetOrders() {
  const r = await fetch(`${SB_URL}/orders?select=*&order=created_at.desc`, { headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function sbGetOrderById(id) {
  const r = await fetch(`${SB_URL}/orders?id=eq.${id}&select=*&limit=1`, { headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0];
}

async function sbPatchOrderShipping(id, shipping) {
  const r = await fetch(`${SB_URL}/orders?id=eq.${id}`, {
    method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"},
    body: JSON.stringify({ shipping, status:"confirmado" })
  });
  if (!r.ok) throw new Error(await r.text());
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function AZLogo({ size="md", variant="main", onClick }) {
  const s = size==="lg"?1.8:size==="sm"?0.65:1;
  const isWhite = variant==="white";
  const aColor = isWhite?"#FFF":B.orange;
  const zColor = isWhite?"#FFF":B.pink;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:onClick?"pointer":"default",lineHeight:1}} onClick={onClick}>
      <div style={{display:"flex",alignItems:"flex-end",gap:1*s}}>
        <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:44*s,color:aColor,display:"inline-block",transform:"rotate(-8deg)",marginBottom:1*s,lineHeight:1}}>A</span>
        <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:44*s,color:zColor,lineHeight:1,position:"relative"}}>
          z<span style={{position:"absolute",top:-8*s,right:-10*s,fontSize:14*s,color:aColor,lineHeight:1}}>✦</span>
        </span>
      </div>
      <span style={{fontFamily:"'Nunito Sans',sans-serif",fontWeight:600,fontSize:10*s,color:zColor,letterSpacing:5*s,textTransform:"uppercase",marginTop:3*s}}>CONCEPT</span>
    </div>
  );
}

function PassInput({value,onChange,show,setShow,placeholder,onEnter}){
  return (
    <div style={{position:"relative"}}>
      <input type={show?"text":"password"} value={value} onChange={onChange}
