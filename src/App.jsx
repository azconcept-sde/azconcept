import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  ShoppingCart, X, TrendingUp, DollarSign, Eye, Plus, Minus,
  Check, Lock, Package, Users, Instagram, KeyRound, UserCircle2,
  LogOut, Eye as EyeIcon, EyeOff, Pencil, Trash2, ImagePlus,
Save, AlertCircle, CreditCard, Landmark, Mail, MessageCircle, Truck, Video, Link2, Upload
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
const SB_BASE = "https://fwynwohdkwpnqxflwqcj.supabase.co";

async function sbGetVideos() {
  const r = await fetch(`${SB_URL}/videos?select=*&order=created_at.desc`, { headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function sbCreateVideoRecord(data) {
  const r = await fetch(`${SB_URL}/videos`, {
    method:"POST", headers:{...SB_H,"Prefer":"return=representation"},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0];
}

async function sbDeleteVideo(id) {
  const r = await fetch(`${SB_URL}/videos?id=eq.${id}`, { method:"DELETE", headers: SB_H });
  if (!r.ok) throw new Error(await r.text());
}

async function sbUploadVideoFile(file) {
  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
  const r = await fetch(`${SB_BASE}/storage/v1/object/videos/${filename}`, {
    method:"POST",
    headers:{ "apikey":SB_KEY, "Authorization":`Bearer ${SB_KEY}`, "Content-Type": file.type || "video/mp4" },
    body: file
  });
  if (!r.ok) throw new Error(await r.text());
  return `${SB_BASE}/storage/v1/object/public/videos/${filename}`;
}

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
        onKeyDown={e=>e.key==="Enter"&&onEnter&&onEnter()}
        placeholder={placeholder}
        style={{width:"100%",border:`1.5px solid ${B.line}`,borderRadius:7,padding:"11px 42px 11px 14px",fontSize:14,fontFamily:"'Nunito Sans',sans-serif",outline:"none",color:B.ink,boxSizing:"border-box"}}/>
      <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:B.muted,display:"flex",alignItems:"center"}}>
        {show?<EyeOff size={16}/>:<EyeIcon size={16}/>}
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [products,    setProducts]    = useState([]);
  const [mpKey,       setMpKey]       = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [dbError,     setDbError]     = useState(false);

  const [view,       setView]       = useState("store");
  const [panelTab,   setPanelTab]   = useState("metricas");
  const [loggedUser, setLoggedUser] = useState(null);

  const [authOpen,    setAuthOpen]    = useState(false);
  const [authStep,    setAuthStep]    = useState("select");
  const [authUser,    setAuthUser]    = useState(null);
  const [authPass,    setAuthPass]    = useState("");
  const [authConf,    setAuthConf]    = useState("");
  const [authError,   setAuthError]   = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showConf,    setShowConf]    = useState(false);

  const [cart,       setCart]       = useState([]);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [customText, setCustomText] = useState("");
  const [catFilter,  setCatFilter]  = useState("Todos");
  // checkout: null | form | method | mp | transfer | shipping | ok
  const [checkout,   setCheckout]   = useState(null);
  const [form,       setForm]       = useState({name:"",email:"",phone:""});
  const [mpLoading,  setMpLoading]  = useState(false);
  const [mpError,    setMpError]    = useState("");
  const [transferSaving, setTransferSaving] = useState(false);

  // ── Pedido en curso (para el paso de envío/facturación) ─────────────────────
  const [pendingOrder,   setPendingOrder]   = useState(null); // fila completa del pedido
  const DEFAULT_SHIPPING = { address:"", locality:"", province:"", postalCode:"", dni:"", whatsapp:"" };
  const [shippingForm,   setShippingForm]   = useState(DEFAULT_SHIPPING);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingError,  setShippingError]  = useState("");

  // ── Visitantes reales ──────────────────────────────────────────────────────
  const [visitor,      setVisitor]      = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessForm,   setAccessForm]   = useState({email:"",whatsapp:""});
  const [accessError,  setAccessError]  = useState("");
  const [accessLoading,setAccessLoading]= useState(false);
  const visitLoggedRef = useRef(false);
  const mpReturnCheckedRef = useRef(false);

  const [orders,      setOrders]      = useState([]);
  const [visitors,    setVisitors]    = useState([]);
  const [visitsCount, setVisitsCount] = useState(0);
  const [panelDataLoading, setPanelDataLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm,       setEditForm]       = useState({});
  const [editPhoto,      setEditPhoto]      = useState(null);
  const [editSaving,     setEditSaving]     = useState(false);
  const [editError,      setEditError]      = useState("");
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [configSaving,   setConfigSaving]   = useState(false);
  const [configSaved,    setConfigSaved]    = useState(false);

  const DEFAULT_BANK = { alias:"azconcept", cbu:"", titular:"" };
  const [bankInfo,   setBankInfo]   = useState(DEFAULT_BANK);
  const [bankForm,   setBankForm]   = useState(DEFAULT_BANK);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSaved,  setBankSaved]  = useState(false);

  const [videos,        setVideos]        = useState([]);
  ...
  const [bankInfo,   setBankInfo]   = useState(DEFAULT_BANK);
  const [bankForm,   setBankForm]   = useState(DEFAULT_BANK);
  const [videos,        setVideos]        = useState([]);
  const [videoTitle,    setVideoTitle]    = useState("");
  const [videoLink,     setVideoLink]     = useState("");
  const [videoFile,     setVideoFile]     = useState(null);
  const [videoUploading,setVideoUploading]= useState(false);
  const [videoError,    setVideoError]    = useState("");
  const videoFileInputRef = useRef();

  const DEFAULT_DESIGN = {
    colorOrange: "#FF8321", colorPink: "#FF63CF",
    colorInk: "#1A1A1A", colorBg: "#FAFAFA",
    fontTitle: "Bricolage Grotesque", fontBody: "Nunito Sans",
    heroTitle: "Objetos unicos\nhechos para vos.",
    heroSub: "Fundas, porta computadoras, mouse pads y necesers personalizados con tu diseno.",
    heroBtn: "Explorar coleccion",
  };
  const [design,       setDesign]       = useState(DEFAULT_DESIGN);
  const [designSaving, setDesignSaving] = useState(false);
  const [designSaved,  setDesignSaved]  = useState(false);
  const [designForm,   setDesignForm]   = useState(DEFAULT_DESIGN);

  const photoInputRef = useRef();

  // ── Chequear si ya hay un visitante guardado en este dispositivo ───────────
  useEffect(()=>{
    try {
      const stored = localStorage.getItem("az_visitor");
      if (stored) setVisitor(JSON.parse(stored));
    } catch {}
    setCheckingAccess(false);
  },[]);

  // ── Registrar una visita real por sesión ────────────────────────────────────
  useEffect(()=>{
    if (visitor && !visitLoggedRef.current) {
      visitLoggedRef.current = true;
      sbLogVisit(visitor.id).catch(()=>{});
    }
  },[visitor]);

  // ── Detectar vuelta desde Mercado Pago (?pago=exito&external_reference=...) ─
  useEffect(()=>{
    if (mpReturnCheckedRef.current) return;
    mpReturnCheckedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const pago = params.get("pago");
    const status = params.get("status") || params.get("collection_status");
    const orderId = params.get("external_reference");
    if (pago === "exito" && (status === "approved" || !status) && orderId) {
      (async()=>{
        try {
          const order = await sbGetOrderById(orderId);
          if (order) {
            setPendingOrder(order);
            setCheckout("shipping");
          }
        } catch(e) { console.error(e); }
      })();
      window.history.replaceState({}, "", window.location.pathname);
    }
  },[]);

  const handleAccessSubmit = async () => {
    if (!accessForm.email.trim() && !accessForm.whatsapp.trim()) {
      setAccessError("Ingresá al menos un email o WhatsApp.");
      return;
    }
    setAccessLoading(true);
    setAccessError("");
    try {
      const v = await sbCreateVisitor({
        email: accessForm.email.trim() || null,
        whatsapp: accessForm.whatsapp.trim() || null,
      });
      localStorage.setItem("az_visitor", JSON.stringify(v));
      setVisitor(v);
    } catch(e) {
      console.error(e);
      setAccessError("No se pudo registrar. Intentá de nuevo.");
    }
    setAccessLoading(false);
  };

  // ── Cargar datos desde Supabase ──────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      try {
        let prods = await sbGetProducts();
        if (!prods || prods.length === 0) {
          await sbSeedProducts(DEFAULT_PRODUCTS);
          prods = await sbGetProducts();
        }
        setProducts(prods || []);
      } catch(e) {
        console.error("Error cargando productos:", e);
        setDbError(true);
        setProducts(DEFAULT_PRODUCTS.map((p,i)=>({...p,id:i+1})));
      }
      try { const key = await sbGetConfig("mpkey"); if (key) setMpKey(key); } catch {}
      try {
        const d = await sbGetConfig("design");
        if (d) { const parsed = JSON.parse(d); setDesign(parsed); setDesignForm(parsed); }
      } catch {}
      try {
        const b = await sbGetConfig("bankInfo");
        if (b) { const parsed = JSON.parse(b); setBankInfo(parsed); setBankForm(parsed); }
      } catch {}
      setLoadingData(false);
    })();
  },[]);

// ── Cargar datos reales del panel (pedidos y visitantes) ────────────────────
  useEffect(()=>{
    if (loggedUser) {
      setPanelDataLoading(true);
      (async()=>{
        try { setOrders(await sbGetOrders()); } catch(e){ console.error(e); }
        try { setVisitors(await sbGetVisitors()); } catch(e){ console.error(e); }
        try { setVisitsCount(await sbGetVisitsCount()); } catch(e){ console.error(e); }
        try { setVideos(await sbGetVideos()); } catch(e){ console.error(e); }
        setPanelDataLoading(false);
      })();
    }
  },[loggedUser]);

  // ── Cargar videos para mostrar en la tienda (visible para todos) ────────────
  useEffect(()=>{
    if (visitor) {
      sbGetVideos().then(setVideos).catch(e=>console.error(e));
    }
  },[visitor]);

  const saveMpKey = async (key) => {
    setConfigSaving(true);
    try {
      await sbSetConfig("mpkey", key);
      setMpKey(key);
      setConfigSaved(true);
      setTimeout(()=>setConfigSaved(false), 2500);
    } catch(e) { console.error(e); }
    setConfigSaving(false);
  };

const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 50*1024*1024){ setVideoError("El video no puede superar 50MB."); return; }
    setVideoFile(file);
    setVideoError("");
  };

  const handleUploadVideoFile = async () => {
    if(!videoFile){ setVideoError("Elegí un archivo de video."); return; }
    setVideoUploading(true);
    setVideoError("");
    try {
      const url = await sbUploadVideoFile(videoFile);
      const saved = await sbCreateVideoRecord({ type:"upload", url, title: videoTitle || null });
      setVideos(v => [saved, ...v]);
      setVideoFile(null);
      setVideoTitle("");
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    } catch(e) {
      console.error(e);
      setVideoError("No se pudo subir el video. Probá con un archivo más liviano.");
    }
    setVideoUploading(false);
  };

  const handleAddVideoLink = async () => {
    if(!videoLink.trim()){ setVideoError("Pegá un link válido."); return; }
    setVideoUploading(true);
    setVideoError("");
    try {
      const saved = await sbCreateVideoRecord({ type:"link", url: videoLink.trim(), title: videoTitle || null });
      setVideos(v => [saved, ...v]);
      setVideoLink("");
      setVideoTitle("");
    } catch(e) {
      console.error(e);
      setVideoError("No se pudo agregar el link.");
    }
    setVideoUploading(false);
  };

  const handleDeleteVideo = async (id) => {
    try {
      await sbDeleteVideo(id);
      setVideos(v => v.filter(x => x.id !== id));
    } catch(e) { console.error(e); }
  };

  const getYoutubeEmbed = (url) => {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };
  const saveDesign = async () => {
    setDesignSaving(true);
    try {
      await sbSetConfig("design", JSON.stringify(designForm));
      setDesign(designForm);
      setDesignSaved(true);
      setTimeout(()=>setDesignSaved(false), 2500);
    } catch(e) { console.error(e); }
    setDesignSaving(false);
  };

  const moveProduct = (id, dir) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
  const cats      = ["Todos", ...new Set(products.map(p=>p.cat))];
  const filtered  = catFilter==="Todos" ? products : products.filter(p=>p.cat===catFilter);
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const transferTotal = Math.round(cartTotal * 0.88);

  const viewProduct = (p) => {
    setSelected(p);
    setCustomText("");
    const newViews = (p.views||0) + 1;
    setProducts(prev => prev.map(x => x.id===p.id ? {...x, views:newViews} : x));
    sbUpsertProduct({ id:p.id, views:newViews }).catch(()=>{});
  };

  const addToCart = (p) => {
    setCart(c=>{
      const ex=c.find(i=>i.id===p.id);
      if(ex) return c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);
      return [...c,{...p,qty:1,custom:customText}];
    });
    setCustomText(""); setSelected(null); setCartOpen(true);
  };
  const updateQty = (id,d)=>setCart(c=>c.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));

  const orderItemsSnapshot = () => cart.map(i=>({ id:i.id, name:i.name, price:i.price, qty:i.qty }));

  const notifyOwners = (order, shipping) => {
    fetch("/.netlify/functions/notificar-pedido", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ order, shipping }),
    }).catch(()=>{});
  };

  // ── Mercado Pago ─────────────────────────────────────────────────────────
  const handlePagarMP = async () => {
    setMpLoading(true);
    setMpError("");
    try {
      const createdOrder = await sbCreateOrder({
        items: orderItemsSnapshot(),
        total: cartTotal,
        payment_method: "mercadopago",
        discount_applied: 0,
        customer_name: form.name,
        customer_email: form.email || visitor?.email || null,
        customer_whatsapp: form.phone || visitor?.whatsapp || null,
        status: "pendiente",
      });

      const res = await fetch("/.netlify/functions/crear-preferencia", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cart, form, orderId: createdOrder?.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        throw new Error(data.error || "No se pudo generar el link de pago");
      }
      window.location.href = data.init_point;
    } catch (e) {
      console.error(e);
      setMpError("No se pudo iniciar el pago. Intentá de nuevo o escribinos por WhatsApp.");
    }
    setMpLoading(false);
  };

  // ── Transferencia con 12% off ────────────────────────────────────────────
  const handleConfirmTransfer = async () => {
    setTransferSaving(true);
    try {
      const createdOrder = await sbCreateOrder({
        items: orderItemsSnapshot(),
        total: transferTotal,
        payment_method: "transferencia",
        discount_applied: cartTotal - transferTotal,
        customer_name: form.name,
        customer_email: form.email || visitor?.email || null,
        customer_whatsapp: form.phone || visitor?.whatsapp || null,
        status: "pendiente",
      });
      setPendingOrder(createdOrder);
      setCheckout("shipping");
      setCart([]);
    } catch(e) {
      console.error(e);
    }
    setTransferSaving(false);
  };

  // ── Envío / facturación (después del pago) ──────────────────────────────────
  const handleSubmitShipping = async () => {
    if (!shippingForm.address.trim() || !shippingForm.province.trim() || !shippingForm.postalCode.trim() || !shippingForm.dni.trim()) {
      setShippingError("Completá domicilio, provincia, código postal y DNI.");
      return;
    }
    setShippingSaving(true);
    setShippingError("");
    try {
      await sbPatchOrderShipping(pendingOrder.id, shippingForm);
      notifyOwners({ ...pendingOrder, shipping: shippingForm }, shippingForm);
      setCheckout("ok");
      setShippingForm(DEFAULT_SHIPPING);
    } catch(e) {
      console.error(e);
      setShippingError("No se pudo guardar. Intentá de nuevo.");
    }
    setShippingSaving(false);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleSelectUser = async (username) => {
    setAuthUser(username); setAuthPass(""); setAuthConf(""); setAuthError(""); setShowPass(false); setShowConf(false); setAuthLoading(true);
    try {
      const pwd = await sbGetConfig(`pwd_${username}`);
      setAuthStep(pwd ? "verify" : "create");
    } catch { setAuthStep("create"); }
    setAuthLoading(false);
  };

  const handleCreatePassword = async () => {
    if(authPass.length<4){setAuthError("Mínimo 4 caracteres.");return;}
    if(authPass!==authConf){setAuthError("Las contraseñas no coinciden.");return;}
    setAuthLoading(true);
    try {
      await sbSetConfig(`pwd_${authUser}`, authPass);
      setLoggedUser(authUser); setView("panel"); setAuthOpen(false); setAuthStep("select");
    } catch { setAuthError("Error al guardar."); }
    setAuthLoading(false);
  };

  const handleVerifyPassword = async () => {
    setAuthLoading(true);
    try {
      const stored = await sbGetConfig(`pwd_${authUser}`);
      if(stored === authPass){ setLoggedUser(authUser); setView("panel"); setAuthOpen(false); setAuthStep("select"); setAuthError(""); }
      else setAuthError("Contraseña incorrecta.");
    } catch { setAuthError("Error al verificar."); }
    setAuthLoading(false);
  };

  const handleChangePassword = async () => {
    if(authPass.length<4){setAuthError("Mínimo 4 caracteres.");return;}
    if(authPass!==authConf){setAuthError("Las contraseñas no coinciden.");return;}
    setAuthLoading(true);
    try {
      await sbSetConfig(`pwd_${authUser}`, authPass);
      setAuthStep("verify"); setAuthPass(""); setAuthConf(""); setAuthError("");
    } catch { setAuthError("Error al guardar."); }
    setAuthLoading(false);
  };

  const openAuth = ()=>{ setAuthOpen(true); setAuthStep("select"); setAuthUser(null); setAuthPass(""); setAuthConf(""); setAuthError(""); setShowPass(false); setShowConf(false); };
  const logout   = ()=>{ setLoggedUser(null); setView("store"); };

  // ── Product Editor ────────────────────────────────────────────────────────
  const openEdit = (p) => {
    setEditingProduct(p);
    setEditForm({name:p.name,description:p.description||"",cat:p.cat,price:p.price,cost:p.cost,stock:p.stock,icon:p.icon,bg:p.bg});
    setEditPhoto(p.photo||null);
    setEditError("");
  };

  const openNew = () => {
    const newP = {id:null,name:"","description":"",cat:"",price:0,cost:0,stock:0,icon:"🛍️",bg:GRADIENTS[0],views:0,sales:0,photo:null};
    setShowNewProduct(true);
    openEdit(newP);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 2*1024*1024){ setEditError("La imagen no puede superar 2MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => setEditPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async () => {
    if(!editForm.name.trim()){setEditError("El nombre es obligatorio.");return;}
    if(!editForm.price||editForm.price<=0){setEditError("El precio debe ser mayor a 0.");return;}
    setEditSaving(true);
    try {
      const payload = {
        ...editForm,
        photo: editPhoto,
        price: Number(editForm.price),
        cost:  Number(editForm.cost),
        stock: Number(editForm.stock),
        views: editingProduct.views || 0,
        sales: editingProduct.sales || 0,
      };
      const savedId = await sbUpsertProduct({ id: editingProduct.id, ...payload });
      if (showNewProduct) {
        setProducts(p => [...p, { ...payload, id: savedId }]);
        setShowNewProduct(false);
      } else {
        setProducts(p => p.map(x => x.id === editingProduct.id ? { ...x, ...payload } : x));
      }
      setEditingProduct(null);
    } catch(e) {
      setEditError("Error al guardar. Revisá tu conexión.");
      console.error(e);
    }
    setEditSaving(false);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await sbDeleteProduct(id);
      setProducts(p => p.filter(x => x.id !== id));
    } catch(e) { console.error(e); }
    setDeleteConfirm(null);
  };

  // ── Metrics reales, calculadas a partir de pedidos verdaderos ───────────────
  const salesByProduct = {};
  orders.forEach(o => (o.items||[]).forEach(it => {
    salesByProduct[it.id] = (salesByProduct[it.id]||0) + it.qty;
  }));
  const productsWithSales = products.map(p => ({ ...p, sales: salesByProduct[p.id] || 0 }));

  const totalRev  = orders.reduce((s,o)=>s+(o.total||0),0);
  const totalCost = orders.reduce((s,o)=> s + (o.items||[]).reduce((s2,it)=>{
    const prod = products.find(p=>p.id===it.id);
    return s2 + (prod ? (prod.cost||0)*it.qty : 0);
  },0), 0);
  const profit    = totalRev - totalCost;
  const unitsSold = orders.reduce((s,o)=>s+(o.items||[]).reduce((s2,it)=>s2+it.qty,0),0);
  const totalViews= products.reduce((s,p)=>s+(p.views||0),0);

  const topViewed = [...productsWithSales].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5);
  const topSold   = [...productsWithSales].sort((a,b)=>(b.sales||0)-(a.sales||0)).slice(0,5);

  const monthlyMap = {};
  orders.forEach(o=>{
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`;
    monthlyMap[key] = (monthlyMap[key]||0) + (o.total||0);
  });
  const MONTHLY_REAL = Object.keys(monthlyMap).sort().map(key=>{
    const [,m] = key.split("-").map(Number);
    return { mes: MONTH_NAMES[m], rev: monthlyMap[key] };
  });

  // ── Styles ────────────────────────────────────────────────────────────────
  const card    = {background:B.white,borderRadius:14,padding:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)"};
  const pill    = active=>({padding:"8px 20px",borderRadius:24,border:`1.5px solid ${active?B.ink:B.line}`,background:active?B.ink:B.white,color:active?B.white:B.muted,fontWeight:active?700:500,fontSize:13,cursor:"pointer",transition:"all .15s",fontFamily:"'Nunito Sans',sans-serif"});
  const btnDark = {background:B.ink,color:B.white,border:"none",borderRadius:8,padding:"12px 26px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Nunito Sans',sans-serif"};
  const inp     = {width:"100%",border:`1.5px solid ${B.line}`,borderRadius:7,padding:"10px 13px",fontSize:14,fontFamily:"'Nunito Sans',sans-serif",outline:"none",color:B.ink,boxSizing:"border-box"};

  if (loadingData || checkingAccess) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:B.bg,fontFamily:"'Nunito Sans',sans-serif",color:B.muted,gap:16}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Nunito+Sans:wght@400;600&display=swap');`}</style>
      <AZLogo size="md"/>
      <p style={{marginTop:8}}>Cargando tienda...</p>
    </div>
  );

  // ══ PANTALLA DE ACCESO (antes de entrar a la tienda) ══
  if (!visitor && !loggedUser) {
    return (
      <div style={{fontFamily:"'Nunito Sans',sans-serif",background:B.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Nunito+Sans:wght@400;600;700&display=swap');*{box-sizing:border-box;}input:focus{border-color:#FF8321!important}`}</style>
        <div style={{background:B.white,borderRadius:20,maxWidth:420,width:"100%",padding:36,boxShadow:"0 8px 30px rgba(0,0,0,.08)",textAlign:"center"}}>
          <AZLogo size="md"/>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:22,margin:"24px 0 8px",color:B.ink}}>¡Bienvenida/o!</h2>
          <p style={{color:B.muted,fontSize:14,lineHeight:1.6,marginBottom:24}}>Dejanos tu email o WhatsApp para entrar a la tienda. Así podemos avisarte sobre tu pedido y ofertas especiales.</p>
          <div style={{display:"flex",flexDirection:"column",gap:12,textAlign:"left"}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Email</label>
              <div style={{position:"relative"}}>
                <Mail size={15} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:B.muted}}/>
                <input value={accessForm.email} onChange={e=>{setAccessForm(f=>({...f,email:e.target.value}));setAccessError("");}}
                  placeholder="tucorreo@mail.com" style={{...inp,paddingLeft:36}}/>
              </div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>WhatsApp</label>
              <div style={{position:"relative"}}>
                <MessageCircle size={15} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:B.muted}}/>
                <input value={accessForm.whatsapp} onChange={e=>{setAccessForm(f=>({...f,whatsapp:e.target.value}));setAccessError("");}}
                  onKeyDown={e=>e.key==="Enter"&&handleAccessSubmit()}
                  placeholder="Ej: +54 385 ..." style={{...inp,paddingLeft:36}}/>
              </div>
            </div>
          </div>
          {accessError && <p style={{color:B.red,fontSize:12,marginTop:12}}>⚠ {accessError}</p>}
          <button onClick={handleAccessSubmit} disabled={accessLoading} style={{...btnDark,width:"100%",padding:13,borderRadius:8,marginTop:22,opacity:accessLoading?.6:1}}>
            {accessLoading?"Ingresando...":"Entrar a la tienda →"}
          </button>
         <p style={{fontSize:11,color:B.muted,marginTop:16,lineHeight:1.5}}>Con al menos uno de los dos datos podés continuar. No compartimos tu información con nadie.</p>
          <button onClick={openAuth} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:12,marginTop:18,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>
            <Lock size={13}/> Acceso al panel (dueñas)
          </button>
        </div>

        {authOpen&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div style={{background:B.white,borderRadius:20,maxWidth:400,width:"100%",padding:34}}>
              {authStep==="select"&&(
                <>
                  <div style={{textAlign:"center",marginBottom:26}}>
                    <div style={{background:`linear-gradient(135deg,${B.orange},${B.pink})`,width:56,height:56,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"white"}}><KeyRound size={24}/></div>
                    <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:22,color:B.ink,marginBottom:6}}>Acceso al panel</h2>
                    <p style={{color:B.muted,fontWeight:400,fontSize:13}}>Seleccioná tu usuario para ingresar</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {Object.entries(USERS).map(([key,u])=>(
                      <button key={key} className="uc" onClick={()=>handleSelectUser(key)}
                        style={{background:B.bg,border:`2px solid ${B.line}`,borderRadius:12,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"transform .15s,box-shadow .15s,border-color .15s",textAlign:"left"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=u.color}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=B.line}>
                        <div style={{width:44,height:44,borderRadius:"50%",background:u.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                        <div>
                          <p style={{fontWeight:700,fontSize:15,color:u.color}}>{u.handle}</p>
                          <p style={{fontSize:12,color:B.muted,fontWeight:400,marginTop:2}}>{u.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setAuthOpen(false)} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginTop:20,fontFamily:"'Nunito Sans',sans-serif"}}>Cancelar</button>
                </>
              )}
              {authStep==="create"&&authUser&&(
                <>
                  <button onClick={()=>setAuthStep("select")} style={{background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:USERS[authUser].grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                    <div><p style={{fontWeight:700,fontSize:15,color:USERS[authUser].color}}>{USERS[authUser].handle}</p><p style={{fontSize:12,color:B.muted}}>Primera vez · Creá tu contraseña</p></div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Contraseña</label><PassInput value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} show={showPass} setShow={setShowPass} placeholder="Mínimo 4 caracteres"/></div>
                    <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Confirmar</label><PassInput value={authConf} onChange={e=>{setAuthConf(e.target.value);setAuthError("");}} show={showConf} setShow={setShowConf} placeholder="Repetí la contraseña" onEnter={handleCreatePassword}/></div>
                  </div>
                  {authError&&<p style={{color:B.red,fontSize:12,marginTop:10}}>⚠ {authError}</p>}
                  <button onClick={handleCreatePassword} disabled={authLoading} style={{...btnDark,width:"100%",padding:13,borderRadius:8,marginTop:20,opacity:authLoading?.6:1}}>{authLoading?"Guardando...":"Crear contraseña →"}</button>
                </>
              )}
              {authStep==="verify"&&authUser&&(
                <>
                  <button onClick={()=>setAuthStep("select")} style={{background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:USERS[authUser].grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                    <div><p style={{fontWeight:700,fontSize:15,color:USERS[authUser].color}}>{USERS[authUser].handle}</p><p style={{fontSize:12,color:B.muted}}>{USERS[authUser].name}</p></div>
                  </div>
                  <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:8,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Contraseña</label>
                  <PassInput value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} show={showPass} setShow={setShowPass} placeholder="Tu contraseña" onEnter={handleVerifyPassword}/>
                  {authError&&<p style={{color:B.red,fontSize:12,marginTop:8}}>⚠ {authError}</p>}
                  <button onClick={handleVerifyPassword} disabled={authLoading} style={{...btnDark,width:"100%",padding:13,borderRadius:8,marginTop:20,opacity:authLoading?.6:1}}>{authLoading?"Verificando...":"Ingresar →"}</button>
                  <button onClick={()=>setAuthStep("change")} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:12,marginTop:12,fontFamily:"'Nunito Sans',sans-serif"}}>Cambiar contraseña</button>
                </>
              )}
              {authStep==="change"&&authUser&&(
                <>
                  <button onClick={()=>setAuthStep("verify")} style={{background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:USERS[authUser].grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                    <div><p style={{fontWeight:700,fontSize:15,color:USERS[authUser].color}}>{USERS[authUser].handle}</p><p style={{fontSize:12,color:B.muted}}>Cambiar contraseña</p></div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Nueva contraseña</label><PassInput value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} show={showPass} setShow={setShowPass} placeholder="Mínimo 4 caracteres"/></div>
                    <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Confirmar</label><PassInput value={authConf} onChange={e=>{setAuthConf(e.target.value);setAuthError("");}} show={showConf} setShow={setShowConf} placeholder="Repetí la contraseña" onEnter={handleChangePassword}/></div>
                  </div>
                  {authError&&<p style={{color:B.red,fontSize:12,marginTop:10}}>⚠ {authError}</p>}
                  <button onClick={handleChangePassword} disabled={authLoading} style={{...btnDark,width:"100%",padding:13,borderRadius:8,marginTop:20,opacity:authLoading?.6:1}}>{authLoading?"Guardando...":"Guardar nueva contraseña"}</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{fontFamily:"'Nunito Sans',sans-serif",background:B.bg,minHeight:"100vh",color:B.ink}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;700;800&family=Nunito+Sans:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#E5E5E5;border-radius:2px}
        .pc:hover{transform:translateY(-5px)!important;box-shadow:0 16px 34px rgba(0,0,0,.10)!important}
        .uc:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(0,0,0,.12)!important}
        input:focus,textarea:focus{border-color:#FF8321!important}
      `}</style>

      {dbError&&(
        <div style={{background:"#FEF3C7",borderBottom:"1px solid #FDE68A",padding:"10px 20px",textAlign:"center",fontSize:13,color:"#92400E"}}>
          ⚠ No se pudo conectar a la base de datos. Verificá las claves en Netlify → Environment variables.
        </div>
      )}

      {/* ══ HEADER ══ */}
      <header style={{background:B.white,borderBottom:`1px solid ${B.line}`,padding:"0 28px",height:68,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 10px rgba(0,0,0,0.04)"}}>
        <AZLogo size="sm" onClick={()=>setView("store")}/>
        <nav style={{display:"flex",gap:16,alignItems:"center"}}>
          <a href={IG_LINK} target="_blank" rel="noreferrer" style={{color:B.pink,display:"flex"}}><Instagram size={19}/></a>
          {view==="store"&&(
            <button onClick={()=>setCartOpen(true)} style={{background:"none",border:"none",cursor:"pointer",position:"relative",color:B.ink}}>
              <ShoppingCart size={21}/>
              {cartCount>0&&<span style={{position:"absolute",top:-7,right:-7,background:B.orange,color:B.white,borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cartCount}</span>}
            </button>
          )}
          {loggedUser?(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,background:B.bg,borderRadius:20,padding:"5px 12px 5px 8px",border:`1px solid ${B.line}`}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:USERS[loggedUser].grad,display:"flex",alignItems:"center",justifyContent:"center"}}><UserCircle2 size={14} color="white"/></div>
                <span style={{fontSize:12,fontWeight:700,color:USERS[loggedUser].color}}>{USERS[loggedUser].handle}</span>
              </div>
              {view!=="panel"&&<button onClick={()=>setView("panel")} style={{...btnDark,padding:"6px 14px",fontSize:12,borderRadius:20}}>Panel</button>}
              <button onClick={logout} title="Salir" style={{background:"none",border:"none",cursor:"pointer",color:B.muted}}><LogOut size={17}/></button>
            </div>
          ):(
            <button onClick={openAuth} style={{background:"none",border:"none",cursor:"pointer",color:B.muted}} title="Acceso socias"><Lock size={18}/></button>
          )}
        </nav>
      </header>

      {/* ══ STORE ══ */}
      {view==="store"&&(
        <>
          <section style={{background:B.white,padding:"80px 28px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 25% 60%,${B.pink}14 0%,transparent 55%),radial-gradient(ellipse at 78% 25%,${B.orange}16 0%,transparent 50%)`,pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <AZLogo size="lg"/>
              <p style={{fontFamily:"'Nunito Sans',sans-serif",fontSize:11,letterSpacing:4,textTransform:"uppercase",margin:"22px auto 14px",color:B.ink,opacity:.6,fontWeight:600}}>@azconcept.ar · Santiago del Estero</p>
              <h1 style={{fontFamily:`'${design.fontTitle}',sans-serif`,fontWeight:800,fontSize:"clamp(36px,5.5vw,66px)",lineHeight:1.08,color:design.colorInk,margin:"0 auto 18px",maxWidth:640}}>
                {design.heroTitle.split("\n").map((l,i)=><span key={i}>{l}{i<design.heroTitle.split("\n").length-1&&<br/>}</span>)}
              </h1>
              <p style={{fontWeight:400,fontSize:16,color:design.colorInk,opacity:.65,maxWidth:440,margin:"0 auto 36px",lineHeight:1.7}}>{design.heroSub}</p>
              <button onClick={()=>document.getElementById("productos").scrollIntoView({behavior:"smooth"})} style={{...btnDark,padding:"14px 38px",fontSize:15,background:design.colorInk}}>{design.heroBtn}</button>
            </div>
          </section>

          <div style={{background:`linear-gradient(90deg,${B.orange},${B.pink})`,padding:"12px 28px",display:"flex",justifyContent:"center",gap:40,flexWrap:"wrap"}}>
            {["✦ Todo 100% personalizado","✦ Envíos a toda Argentina","✦ Pagá con Mercado Pago o transferencia"].map(t=>(
              <span key={t} style={{fontSize:12,color:B.white,fontWeight:700,letterSpacing:.5}}>{t}</span>
            ))}
          </div>

          <section id="productos" style={{padding:"36px 28px 18px",display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            {cats.map(c=><button key={c} style={pill(catFilter===c)} onClick={()=>setCatFilter(c)}>{c}</button>)}
          </section>

          <section style={{padding:"18px 28px 64px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:22,maxWidth:1140,margin:"0 auto"}}>
            {filtered.length===0&&<p style={{gridColumn:"1/-1",textAlign:"center",color:B.muted,padding:48}}>No hay productos en esta categoría.</p>}
            {filtered.map(p=>(
              <div key={p.id} className="pc" onClick={()=>viewProduct(p)}
                style={{background:B.white,borderRadius:14,overflow:"hidden",cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",transition:"transform .2s,box-shadow .2s",border:`1px solid ${B.line}`}}>
                <div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:p.bg}}>
                  {p.photo?<img src={p.photo} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:72}}>{p.icon}</span>}
                </div>
                <div style={{padding:20}}>
                  <span style={{fontSize:10,color:B.muted,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>{p.cat}</span>
                  <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:19,margin:"6px 0 4px"}}>{p.name}</h3>
                  <p style={{fontSize:13,color:B.muted,fontWeight:400,marginBottom:16,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.description}</p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:20,color:B.orange}}>{fmt(p.price)}</span>
                    <button style={{background:B.ink,color:B.white,border:"none",borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito Sans',sans-serif"}}>Personalizar</button>
                  </div>
                </div>
              </div>
            ))}
          </section>

{videos.length>0&&(
            <section style={{padding:"20px 28px 60px",maxWidth:1140,margin:"0 auto"}}>
              <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:26,textAlign:"center",marginBottom:28,color:B.ink}}>🎥 Nuestros videos</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:20}}>
                {videos.map(v=>{
                  const ytEmbed = v.type==="link" ? getYoutubeEmbed(v.url) : null;
                  return (
                    <div key={v.id} style={{background:B.white,borderRadius:14,overflow:"hidden",border:`1px solid ${B.line}`,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                      {v.type==="upload"?(
                        <video controls src={v.url} style={{width:"100%",height:220,objectFit:"cover",background:"#000"}}/>
                      ):ytEmbed?(
                        <iframe src={ytEmbed} title={v.title||"video"} style={{width:"100%",height:220,border:"none"}} allowFullScreen/>
                      ):(
                        <a href={v.url} target="_blank" rel="noreferrer" style={{height:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:`linear-gradient(135deg,${B.orange},${B.pink})`,color:"white",textDecoration:"none"}}>
                          <Video size={36}/>
                          <span style={{fontSize:13,fontWeight:700}}>Ver video ↗</span>
                        </a>
                      )}
                      {v.title&&<p style={{padding:"12px 14px",fontSize:13,fontWeight:600,color:B.ink}}>{v.title}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <footer style={{background:B.ink,color:"#D8D8D8",padding:"52px 28px"}}>
            <div style={{maxWidth:860,margin:"0 auto",display:"flex",flexWrap:"wrap",gap:48,justifyContent:"space-between"}}>
              <AZLogo size="md" variant="white"/>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:B.orange,marginBottom:4}}>Contacto</p>
                <a href={WA_LINK} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#D8D8D8",opacity:.85,textDecoration:"none"}}>💬 WhatsApp: +54 9 3855 02-7443</a>
                <a href={IG_LINK} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#D8D8D8",opacity:.85,textDecoration:"none"}}>📷 @azconcept.ar</a>
                <p style={{fontSize:13,color:"#D8D8D8",opacity:.65}}>📍 Santiago del Estero, Argentina</p>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:B.pink,marginBottom:10}}>Nosotras</p>
                <p style={{fontSize:13,color:"#D8D8D8",opacity:.8}}>Ago Zambolin</p>
                <p style={{fontSize:13,color:"#D8D8D8",opacity:.8,marginTop:4}}>Camila Bravo Trotta</p>
              </div>
            </div>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.12)",marginTop:36,paddingTop:20,textAlign:"center"}}>
              <p style={{fontSize:11,color:"#D8D8D8",opacity:.4,letterSpacing:1}}>© 2025 AZ Concept · Todos los productos son personalizados y hechos a pedido.</p>
            </div>
          </footer>
        </>
      )}

      {/* ══ PRODUCT DETAIL MODAL ══ */}
      {selected&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setSelected(null)}>
          <div style={{background:B.white,borderRadius:18,maxWidth:490,width:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{height:240,display:"flex",alignItems:"center",justifyContent:"center",background:selected.bg,position:"relative",overflow:"hidden"}}>
              {selected.photo?<img src={selected.photo} alt={selected.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:88}}>{selected.icon}</span>}
              <button onClick={()=>setSelected(null)} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,.3)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}><X size={17}/></button>
            </div>
            <div style={{padding:28}}>
              <span style={{fontSize:10,color:B.muted,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>{selected.cat}</span>
              <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:24,margin:"6px 0 10px"}}>{selected.name}</h2>
              <p style={{color:B.muted,fontWeight:400,marginBottom:24,fontSize:14,lineHeight:1.75}}>{selected.description||"Cada pieza es 100% personalizada. Contanos tu idea: nombre, frase, colores o imagen de referencia."}</p>
              <div style={{background:B.bg,borderRadius:10,padding:16,marginBottom:24,border:`1px solid ${B.line}`}}>
                <label style={{fontSize:13,fontWeight:700,display:"block",marginBottom:8}}>✦ ¿Qué querés que lleve tu diseño?</label>
                <textarea value={customText} onChange={e=>setCustomText(e.target.value)} placeholder='Ej: "Mi nombre + flores vintage", colores nude...'
                  style={{width:"100%",border:`1.5px solid ${B.line}`,borderRadius:7,padding:"10px 12px",fontSize:13,fontFamily:"'Nunito Sans',sans-serif",resize:"vertical",minHeight:78,outline:"none",background:B.white}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:28,color:B.orange}}>{fmt(selected.price)}</span>
                <button onClick={()=>addToCart(selected)} style={btnDark}>Agregar al carrito</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CART ══ */}
      {cartOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",justifyContent:"flex-end"}}>
          <div style={{flex:1,background:"rgba(0,0,0,.3)"}} onClick={()=>setCartOpen(false)}/>
          <div style={{background:B.white,width:380,maxWidth:"92vw",height:"100%",display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,.12)"}}>
            <div style={{padding:"22px 22px 16px",borderBottom:`1px solid ${B.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:20}}>Mi carrito ({cartCount})</h3>
              <button onClick={()=>setCartOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:B.muted}}><X size={20}/></button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:18}}>
              {cart.length===0?(
                <div style={{textAlign:"center",padding:"60px 16px",color:B.muted}}>
                  <ShoppingCart size={44} strokeWidth={1} style={{margin:"0 auto 14px",color:B.line}}/>
                  <p style={{fontWeight:400}}>Tu carrito está vacío</p>
                </div>
              ):cart.map(item=>(
                <div key={item.id} style={{display:"flex",gap:12,marginBottom:14,padding:14,background:B.bg,borderRadius:10,border:`1px solid ${B.line}`}}>
                  <div style={{width:54,height:54,borderRadius:8,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                    {item.photo?<img src={item.photo} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28}}>{item.icon}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:700,fontSize:14,marginBottom:2}}>{item.name}</p>
                    {item.custom&&<p style={{fontSize:11,color:B.muted,marginBottom:7,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{item.custom}"</p>}
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>updateQty(item.id,-1)} style={{background:B.white,border:`1px solid ${B.line}`,borderRadius:"50%",width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Minus size={11}/></button>
                      <span style={{fontSize:14,fontWeight:700}}>{item.qty}</span>
                      <button onClick={()=>updateQty(item.id, 1)} style={{background:B.ink,border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:B.white}}><Plus size={11}/></button>
                    </div>
                  </div>
                  <span style={{fontWeight:700,color:B.orange,fontSize:15,flexShrink:0}}>{fmt(item.price*item.qty)}</span>
                </div>
              ))}
            </div>
            {cart.length>0&&(
              <div style={{padding:22,borderBottom:`1px solid ${B.line}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
                  <span style={{fontWeight:600,color:B.muted}}>Total</span>
                  <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:24,color:B.orange}}>{fmt(cartTotal)}</span>
                </div>
                <button onClick={()=>{setCartOpen(false);setCheckout("form");}} style={{...btnDark,width:"100%",padding:"14px",fontSize:15}}>Finalizar pedido →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ CHECKOUT ══ */}
      {checkout&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:B.white,borderRadius:18,maxWidth:460,width:"100%",padding:34,maxHeight:"90vh",overflowY:"auto"}}>
            {checkout==="form"&&(
              <>
                <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:24,marginBottom:6}}>Tus datos</h2>
                <p style={{color:B.muted,fontWeight:400,fontSize:13,marginBottom:24}}>Para coordinar tu pedido personalizado.</p>
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  {[["name","Nombre completo","Ej: Valentina García"],["email","Email","tucorreo@mail.com"],["phone","WhatsApp","Ej: +54 385 ..."]]
                    .map(([k,label,ph])=>(
                      <div key={k}>
                        <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>{label}</label>
                        <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={inp}/>
                      </div>
                    ))}
                </div>
                <div style={{display:"flex",gap:12,marginTop:28}}>
                  <button onClick={()=>setCheckout(null)} style={{flex:1,background:"none",border:`1.5px solid ${B.line}`,borderRadius:7,padding:12,cursor:"pointer",fontWeight:600,fontFamily:"'Nunito Sans',sans-serif"}}>Cancelar</button>
                  <button onClick={()=>setCheckout("method")} style={{flex:2,...btnDark,padding:12,borderRadius:7}}>Continuar →</button>
                </div>
              </>
            )}

            {checkout==="method"&&(
              <>
                <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:24,marginBottom:6}}>¿Cómo querés pagar?</h2>
                <p style={{color:B.muted,fontWeight:400,fontSize:13,marginBottom:24}}>Elegí el método que más te convenga.</p>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <button onClick={()=>setCheckout("mp")}
                    style={{background:"#009EE3",color:"white",border:"none",borderRadius:10,padding:"16px 18px",cursor:"pointer",fontFamily:"'Nunito Sans',sans-serif",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{display:"flex",alignItems:"center",gap:10,fontWeight:800,fontSize:15}}><CreditCard size={20}/> Mercado Pago</span>
                    <span style={{fontWeight:700,fontSize:16}}>{fmt(cartTotal)}</span>
                  </button>
                  <button onClick={()=>setCheckout("transfer")}
                    style={{background:B.verde,color:"white",border:"none",borderRadius:10,padding:"16px 18px",cursor:"pointer",fontFamily:"'Nunito Sans',sans-serif",textAlign:"left",display:"flex",flexDirection:"column",gap:6}}>
                    <span style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{display:"flex",alignItems:"center",gap:10,fontWeight:800,fontSize:15}}><Landmark size={20}/> Transferencia bancaria</span>
                      <span style={{fontWeight:700,fontSize:16}}>{fmt(transferTotal)}</span>
                    </span>
                    <span style={{fontSize:12,opacity:.9,fontWeight:600}}>✦ 12% OFF pagando por transferencia</span>
                  </button>
                </div>
                <button onClick={()=>setCheckout("form")} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginTop:20,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
              </>
            )}

            {checkout==="mp"&&(
              <>
                <div style={{textAlign:"center",marginBottom:24}}>
                  <div style={{background:"linear-gradient(135deg,#009EE3,#007CB5)",borderRadius:14,padding:"18px 32px",display:"inline-block",marginBottom:20,boxShadow:"0 4px 18px rgba(0,158,227,.3)"}}>
                    <span style={{color:"white",fontWeight:800,fontSize:22,fontFamily:"'Bricolage Grotesque',sans-serif",letterSpacing:.5}}>mercado pago</span>
                  </div>
                  <p style={{color:B.muted,fontWeight:400,fontSize:14}}>Total a pagar</p>
                  <p style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:44,color:B.orange,margin:"6px 0"}}>{fmt(cartTotal)}</p>
                </div>
                {mpKey?(
                  <div>
                    <div style={{background:"#EFF9FF",borderRadius:10,padding:14,marginBottom:20,border:"1px solid #BAE6FD",display:"flex",gap:10,alignItems:"flex-start"}}>
                      <CreditCard size={18} color="#0284C7" style={{flexShrink:0,marginTop:1}}/>
                      <p style={{fontSize:13,color:"#0369A1",lineHeight:1.6}}>Serás redirigida a Mercado Pago. Al volver, te pedimos los datos de envío.</p>
                    </div>
                    {mpError&&(
                      <div style={{background:"#FEE2E2",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center",border:"1px solid #FCA5A5"}}>
                        <AlertCircle size={16} color={B.red}/><span style={{fontSize:13,color:B.red}}>{mpError}</span>
                      </div>
                    )}
                    <button onClick={handlePagarMP} disabled={mpLoading} style={{width:"100%",background:"#009EE3",color:"white",border:"none",borderRadius:8,padding:15,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:12,fontFamily:"'Nunito Sans',sans-serif",boxShadow:"0 4px 14px rgba(0,158,227,.35)",opacity:mpLoading?.6:1}}>
                      {mpLoading?"Redirigiendo...":"💳 Pagar con Mercado Pago"}
                    </button>
                  </div>
                ):(
                  <div style={{background:"#FFFBEB",borderRadius:10,padding:14,marginBottom:20,border:"1px solid #FDE68A",display:"flex",gap:10,alignItems:"flex-start"}}>
                    <AlertCircle size={18} color="#D97706" style={{flexShrink:0,marginTop:1}}/>
                    <p style={{fontSize:13,color:"#92400E",lineHeight:1.6}}>
                      <strong>Falta configurar Mercado Pago.</strong> Elegí "Transferencia bancaria" o escribinos por WhatsApp.
                    </p>
                  </div>
                )}
                <button onClick={()=>setCheckout("method")} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
              </>
            )}

            {checkout==="transfer"&&(
              <>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{background:B.verde,borderRadius:14,padding:"16px 28px",display:"inline-block",marginBottom:18,color:"white"}}>
                    <Landmark size={24}/>
                  </div>
                  <p style={{color:B.muted,fontWeight:400,fontSize:14}}>Total con 12% OFF</p>
                  <p style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:40,color:B.verde,margin:"4px 0"}}>{fmt(transferTotal)}</p>
                  <p style={{fontSize:12,color:B.muted,textDecoration:"line-through"}}>{fmt(cartTotal)}</p>
                </div>
                <div style={{background:B.bg,borderRadius:10,padding:16,marginBottom:18,border:`1px solid ${B.line}`}}>
                  <p style={{fontSize:13,marginBottom:6}}><strong>Alias:</strong> {bankInfo.alias || "azconcept"}</p>
                  {bankInfo.cbu && <p style={{fontSize:13,marginBottom:6}}><strong>CBU:</strong> {bankInfo.cbu}</p>}
                  {bankInfo.titular && <p style={{fontSize:13}}><strong>Titular:</strong> {bankInfo.titular}</p>}
                </div>
                <p style={{fontSize:12,color:B.muted,marginBottom:18,lineHeight:1.6}}>Al confirmar, te vamos a pedir tus datos de envío y facturación. Guardá el comprobante por si te lo pedimos por WhatsApp.</p>
                <button onClick={handleConfirmTransfer} disabled={transferSaving} style={{width:"100%",background:B.verde,color:"white",border:"none",borderRadius:8,padding:15,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:12,fontFamily:"'Nunito Sans',sans-serif",opacity:transferSaving?.6:1}}>
                  {transferSaving?"Confirmando...":"✅ Ya transferí, continuar"}
                </button>
                <button onClick={()=>setCheckout("method")} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
              </>
            )}

            {checkout==="shipping"&&(
              <>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{background:`linear-gradient(135deg,${B.orange},${B.pink})`,borderRadius:14,padding:"14px 22px",display:"inline-block",marginBottom:16,color:"white"}}>
                    <Truck size={24}/>
                  </div>
                  <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:22}}>¡Pago recibido!</h2>
                  <p style={{color:B.muted,fontSize:13,marginTop:6}}>Ahora completá tus datos de envío y facturación.</p>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Domicilio (calle y número) *</label>
                    <input value={shippingForm.address} onChange={e=>setShippingForm(f=>({...f,address:e.target.value}))} placeholder="Ej: Av. Belgrano 123" style={inp}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Localidad</label>
                      <input value={shippingForm.locality} onChange={e=>setShippingForm(f=>({...f,locality:e.target.value}))} placeholder="Ej: La Banda" style={inp}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Provincia *</label>
                      <input value={shippingForm.province} onChange={e=>setShippingForm(f=>({...f,province:e.target.value}))} placeholder="Ej: Santiago del Estero" style={inp}/>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Código Postal *</label>
                      <input value={shippingForm.postalCode} onChange={e=>setShippingForm(f=>({...f,postalCode:e.target.value}))} placeholder="Ej: 4200" style={inp}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>DNI *</label>
                      <input value={shippingForm.dni} onChange={e=>setShippingForm(f=>({...f,dni:e.target.value}))} placeholder="Ej: 30123456" style={inp}/>
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>WhatsApp de contacto</label>
                    <input value={shippingForm.whatsapp} onChange={e=>setShippingForm(f=>({...f,whatsapp:e.target.value}))} placeholder="Ej: +54 385 ..." style={inp}/>
                  </div>
                </div>
                {shippingError&&(
                  <div style={{background:"#FEE2E2",borderRadius:8,padding:"10px 14px",marginTop:14,display:"flex",gap:8,alignItems:"center",border:"1px solid #FCA5A5"}}>
                    <AlertCircle size={16} color={B.red}/><span style={{fontSize:13,color:B.red}}>{shippingError}</span>
                  </div>
                )}
                <button onClick={handleSubmitShipping} disabled={shippingSaving} style={{...btnDark,width:"100%",padding:14,borderRadius:8,marginTop:20,opacity:shippingSaving?.6:1}}>
                  {shippingSaving?"Guardando...":"Confirmar pedido →"}
                </button>
              </>
            )}

            {checkout==="ok"&&(
              <div style={{textAlign:"center",padding:"10px 0"}}>
                <div style={{background:`linear-gradient(135deg,${B.orange},${B.pink})`,borderRadius:"50%",width:76,height:76,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",color:"white"}}><Check size={38}/></div>
                <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:26,marginBottom:10}}>¡Pedido confirmado! ✦</h2>
                <p style={{color:B.muted,fontWeight:400,marginBottom:10,lineHeight:1.7}}>Ya recibimos tus datos. Vamos a coordinar tu envío en las próximas horas.</p>
                <p style={{color:B.muted,fontWeight:400,marginBottom:28,fontSize:13}}>¿Dudas sobre tu diseño? Escribinos cuando quieras.</p>
                <a href={WA_LINK} target="_blank" rel="noreferrer" style={{display:"inline-block",background:"#25D366",color:"white",borderRadius:8,padding:"12px 24px",fontWeight:700,fontSize:14,textDecoration:"none",marginBottom:12,fontFamily:"'Nunito Sans',sans-serif"}}>💬 Escribirnos por WhatsApp</a><br/>
                <button onClick={()=>{setCheckout(null);setPendingOrder(null);}} style={{background:"none",border:`1.5px solid ${B.line}`,borderRadius:8,padding:"10px 22px",fontWeight:600,fontSize:13,cursor:"pointer",marginTop:8,fontFamily:"'Nunito Sans',sans-serif"}}>Seguir explorando</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ AUTH MODAL ══ */}
      {authOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:B.white,borderRadius:20,maxWidth:400,width:"100%",padding:34}}>
            {authStep==="select"&&(
              <>
                <div style={{textAlign:"center",marginBottom:26}}>
                  <div style={{background:`linear-gradient(135deg,${B.orange},${B.pink})`,width:56,height:56,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"white"}}><KeyRound size={24}/></div>
                  <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:22,color:B.ink,marginBottom:6}}>Acceso al panel</h2>
                  <p style={{color:B.muted,fontWeight:400,fontSize:13}}>Seleccioná tu usuario para ingresar</p>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {Object.entries(USERS).map(([key,u])=>(
                    <button key={key} className="uc" onClick={()=>handleSelectUser(key)}
                      style={{background:B.bg,border:`2px solid ${B.line}`,borderRadius:12,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"transform .15s,box-shadow .15s,border-color .15s",textAlign:"left"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=u.color}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=B.line}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:u.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                      <div>
                        <p style={{fontWeight:700,fontSize:15,color:u.color}}>{u.handle}</p>
                        <p style={{fontSize:12,color:B.muted,fontWeight:400,marginTop:2}}>{u.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={()=>setAuthOpen(false)} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginTop:20,fontFamily:"'Nunito Sans',sans-serif"}}>Cancelar</button>
              </>
            )}
            {authStep==="create"&&authUser&&(
              <>
                <button onClick={()=>setAuthStep("select")} style={{background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:USERS[authUser].grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                  <div><p style={{fontWeight:700,fontSize:15,color:USERS[authUser].color}}>{USERS[authUser].handle}</p><p style={{fontSize:12,color:B.muted}}>Primera vez · Creá tu contraseña</p></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Contraseña</label><PassInput value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} show={showPass} setShow={setShowPass} placeholder="Mínimo 4 caracteres"/></div>
                  <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Confirmar</label><PassInput value={authConf} onChange={e=>{setAuthConf(e.target.value);setAuthError("");}} show={showConf} setShow={setShowConf} placeholder="Repetí la contraseña" onEnter={handleCreatePassword}/></div>
                </div>
                {authError&&<p style={{color:B.red,fontSize:12,marginTop:10}}>⚠ {authError}</p>}
                <button onClick={handleCreatePassword} disabled={authLoading} style={{...btnDark,width:"100%",padding:13,borderRadius:8,marginTop:20,opacity:authLoading?.6:1}}>{authLoading?"Guardando...":"Crear contraseña →"}</button>
              </>
            )}
            {authStep==="verify"&&authUser&&(
              <>
                <button onClick={()=>setAuthStep("select")} style={{background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:USERS[authUser].grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                  <div><p style={{fontWeight:700,fontSize:15,color:USERS[authUser].color}}>{USERS[authUser].handle}</p><p style={{fontSize:12,color:B.muted}}>{USERS[authUser].name}</p></div>
                </div>
                <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:8,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Contraseña</label>
                <PassInput value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} show={showPass} setShow={setShowPass} placeholder="Tu contraseña" onEnter={handleVerifyPassword}/>
                {authError&&<p style={{color:B.red,fontSize:12,marginTop:8}}>⚠ {authError}</p>}
                <button onClick={handleVerifyPassword} disabled={authLoading} style={{...btnDark,width:"100%",padding:13,borderRadius:8,marginTop:20,opacity:authLoading?.6:1}}>{authLoading?"Verificando...":"Ingresar →"}</button>
                <button onClick={()=>setAuthStep("change")} style={{width:"100%",background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:12,marginTop:12,fontFamily:"'Nunito Sans',sans-serif"}}>Cambiar contraseña</button>
              </>
            )}
            {authStep==="change"&&authUser&&(
              <>
                <button onClick={()=>setAuthStep("verify")} style={{background:"none",border:"none",color:B.muted,cursor:"pointer",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>← Volver</button>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:USERS[authUser].grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UserCircle2 size={22} color="white"/></div>
                  <div><p style={{fontWeight:700,fontSize:15,color:USERS[authUser].color}}>{USERS[authUser].handle}</p><p style={{fontSize:12,color:B.muted}}>Cambiar contraseña</p></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Nueva contraseña</label><PassInput value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} show={showPass} setShow={setShowPass} placeholder="Mínimo 4 caracteres"/></div>
                  <div><label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:5,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Confirmar</label><PassInput value={authConf} onChange={e=>{setAuthConf(e.target.value);setAuthError("");}} show={showConf} setShow={setShowConf} placeholder="Repetí la contraseña" onEnter={handleChangePassword}/></div>
                </div>
                {authError&&<p style={{color:B.red,fontSize:12,marginTop:10}}>⚠ {authError}</p>}
                <button onClick={handleChangePassword} disabled={authLoading} style={{...btnDark,width:"100%",padding:13,borderRadius:8,marginTop:20,opacity:authLoading?.6:1}}>{authLoading?"Guardando...":"Guardar nueva contraseña"}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ PANEL ══ */}
      {view==="panel"&&loggedUser&&(
        <div style={{maxWidth:1120,margin:"0 auto",padding:30}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:16}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:USERS[loggedUser].grad,display:"flex",alignItems:"center",justifyContent:"center"}}><UserCircle2 size={20} color="white"/></div>
                <div>
                  <p style={{fontSize:12,color:USERS[loggedUser].color,fontWeight:700}}>{USERS[loggedUser].handle}</p>
                  <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:26,color:B.ink}}>Panel AZ Concept</h1>
                </div>
              </div>
              <p style={{color:B.muted,fontWeight:400,fontSize:14}}>Bienvenida, {USERS[loggedUser].name.split(" ")[0]} ✦</p>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setView("store")} style={{background:"none",border:`1.5px solid ${B.line}`,borderRadius:7,padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:700,color:B.ink,fontFamily:"'Nunito Sans',sans-serif"}}>← Ver tienda</button>
              <button onClick={logout} style={{background:"none",border:`1.5px solid ${B.line}`,borderRadius:7,padding:"9px 16px",cursor:"pointer",fontSize:13,color:B.muted,display:"flex",alignItems:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}><LogOut size={15}/> Salir</button>
            </div>
          </div>

          <div style={{display:"flex",gap:4,background:B.arena,borderRadius:12,padding:5,marginBottom:28,width:"fit-content",flexWrap:"wrap"}}>
  {[["metricas","📊 Métricas"],["visitantes","👥 Visitantes"],["pedidos","🧾 Pedidos"],["productos","📦 Productos"],["videos","🎬 Videos"],["costos","💰 Costos"],["diseno","🎨 Diseño"],["config","⚙️ Configuración"]].map(([id,label])=>(
              <button key={id} onClick={()=>setPanelTab(id)}
                style={{padding:"9px 20px",borderRadius:8,border:"none",background:panelTab===id?B.ink:"none",fontWeight:panelTab===id?700:500,color:panelTab===id?B.white:B.ink,cursor:"pointer",fontSize:13,transition:"all .15s",fontFamily:"'Nunito Sans',sans-serif"}}>
                {label}
              </button>
            ))}
          </div>

          {panelDataLoading && <p style={{color:B.muted,fontSize:13,marginBottom:16}}>Cargando datos reales...</p>}

          {panelTab==="metricas"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:16,marginBottom:24}}>
                {[
                  {label:"Ingresos reales",  value:fmt(totalRev), icon:<DollarSign size={20}/>,color:B.ink},
                  {label:"Ganancia neta",    value:fmt(profit),   icon:<TrendingUp size={20}/>,color:B.verde},
                  {label:"Unidades vendidas",value:unitsSold,     icon:<Package size={20}/>,color:B.orange},
                  {label:"Vistas de productos",value:totalViews,  icon:<Eye size={20}/>,color:B.pink},
                  {label:"Visitantes únicos",value:visitors.length, icon:<Users size={20}/>,color:"#9333EA"},
                  {label:"Visitas totales",  value:visitsCount,   icon:<TrendingUp size={20}/>,color:"#0EA5E9"},
                ].map((kpi,i)=>(
                  <div key={i} style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <p style={{fontSize:11,color:B.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>{kpi.label}</p>
                        <p style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:700,color:kpi.color}}>{kpi.value}</p>
                      </div>
                      <div style={{background:`${kpi.color}18`,borderRadius:10,padding:10,color:kpi.color}}>{kpi.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{...card,marginBottom:24}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:16,marginBottom:20}}>Ingresos mensuales reales (ARS)</h3>
                {MONTHLY_REAL.length===0?(
                  <p style={{color:B.muted,fontSize:13,padding:"20px 0"}}>Todavía no hay pedidos registrados. En cuanto entre la primera venta, va a aparecer acá.</p>
                ):(
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={MONTHLY_REAL} barSize={38}>
                      <XAxis dataKey="mes" tick={{fontSize:12,fill:B.muted}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:11,fill:B.muted}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                      <Tooltip formatter={v=>[fmt(v),"Ingresos"]} contentStyle={{borderRadius:10,border:"none",boxShadow:"0 4px 14px rgba(0,0,0,.08)"}}/>
                      <Bar dataKey="rev" fill={B.orange} radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:16}}>
                {[["🔍 Más consultados",topViewed,"views",B.pink],["🏆 Más vendidos",topSold,"sales",B.orange]].map(([title,data,key,color])=>(
                  <div key={title} style={card}>
                    <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:15,marginBottom:18}}>{title}</h3>
                    {data.every(p=>!(p[key]))&&<p style={{color:B.muted,fontSize:13}}>Todavía no hay datos.</p>}
                    {data.map((p,i)=>(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                        <span style={{fontSize:13,fontWeight:800,color:B.muted,width:24,flexShrink:0}}>#{i+1}</span>
                        <div style={{width:34,height:34,borderRadius:7,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                          {p.photo?<img src={p.photo} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:18}}>{p.icon}</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                          <div style={{height:4,background:B.bg,borderRadius:2,marginTop:5}}>
                            <div style={{height:"100%",borderRadius:2,background:color,width:`${((p[key]||0)/(data[0][key]||1))*100}%`,transition:"width .5s"}}/>
                          </div>
                        </div>
                        <span style={{fontSize:14,fontWeight:800,color,flexShrink:0}}>{p[key]||0}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {panelTab==="visitantes"&&(
            <div style={{background:B.white,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.06)",border:`1px solid ${B.line}`}}>
              <div style={{padding:"18px 22px",borderBottom:`1px solid ${B.line}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:17}}>Personas que dejaron sus datos</h3>
                <span style={{fontSize:13,color:B.muted}}>{visitors.length} en total · {visitsCount} visitas registradas</span>
              </div>
              {visitors.length===0?(
                <p style={{padding:30,color:B.muted,fontSize:13}}>Todavía nadie dejó sus datos.</p>
              ):(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
                    <thead>
                      <tr style={{background:B.arena}}>
                        {["Email","WhatsApp","Fecha"].map(h=>(
                          <th key={h} style={{padding:"12px 18px",textAlign:"left",fontSize:11,fontWeight:700,color:B.ink,textTransform:"uppercase",letterSpacing:.8}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.map((v,i)=>(
                        <tr key={v.id} style={{borderBottom:`1px solid ${B.bg}`,background:i%2===0?B.white:"#FBFBFB"}}>
                          <td style={{padding:"12px 18px",fontSize:13}}>{v.email||"—"}</td>
                          <td style={{padding:"12px 18px",fontSize:13}}>{v.whatsapp||"—"}</td>
                          <td style={{padding:"12px 18px",fontSize:13,color:B.muted}}>{new Date(v.created_at).toLocaleString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {panelTab==="pedidos"&&(
            <div style={{background:B.white,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.06)",border:`1px solid ${B.line}`}}>
              <div style={{padding:"18px 22px",borderBottom:`1px solid ${B.line}`}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:17}}>Pedidos reales</h3>
              </div>
              {orders.length===0?(
                <p style={{padding:30,color:B.muted,fontSize:13}}>Todavía no hay pedidos.</p>
              ):(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
                    <thead>
                      <tr style={{background:B.arena}}>
                        {["Fecha","Cliente","Método","Total","Envío / Facturación","Estado"].map(h=>(
                          <th key={h} style={{padding:"12px 18px",textAlign:"left",fontSize:11,fontWeight:700,color:B.ink,textTransform:"uppercase",letterSpacing:.8}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o,i)=>(
                        <tr key={o.id} style={{borderBottom:`1px solid ${B.bg}`,background:i%2===0?B.white:"#FBFBFB"}}>
                          <td style={{padding:"12px 18px",fontSize:12,color:B.muted}}>{new Date(o.created_at).toLocaleString("es-AR")}</td>
                          <td style={{padding:"12px 18px",fontSize:13}}>{o.customer_name||"—"}<br/><span style={{color:B.muted,fontSize:11}}>{o.customer_email||o.customer_whatsapp||""}</span></td>
                          <td style={{padding:"12px 18px",fontSize:13,textTransform:"capitalize"}}>{o.payment_method}</td>
                          <td style={{padding:"12px 18px",fontSize:13,fontWeight:700}}>{fmt(o.total)}</td>
                          <td style={{padding:"12px 18px",fontSize:12,color:B.muted}}>
                            {o.shipping ? (
                              <>{o.shipping.address}, {o.shipping.locality} ({o.shipping.province}) CP {o.shipping.postalCode}<br/>DNI: {o.shipping.dni}</>
                            ) : "Sin completar"}
                          </td>
                          <td style={{padding:"12px 18px",fontSize:12}}>
                            <span style={{background: o.status==="confirmado"?"#DCFCE7":"#FEF3C7", color: o.status==="confirmado"?"#15803D":"#92400E", padding:"3px 10px", borderRadius:20, fontWeight:700}}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {panelTab==="productos"&&(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <p style={{color:B.muted,fontSize:14}}>{products.length} productos cargados</p>
                <button onClick={openNew} style={{...btnDark,padding:"10px 22px",display:"flex",alignItems:"center",gap:8,borderRadius:9}}>
                  <Plus size={16}/> Nuevo producto
                </button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
                {productsWithSales.map(p=>(
                  <div key={p.id} style={{background:B.white,borderRadius:14,overflow:"hidden",border:`1px solid ${B.line}`,boxShadow:"0 2px 10px rgba(0,0,0,.05)"}}>
                    <div style={{height:160,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                      {p.photo?<img src={p.photo} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:60}}>{p.icon}</span>}
                    </div>
                    <div style={{padding:16}}>
                      <span style={{fontSize:10,color:B.muted,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>{p.cat}</span>
                      <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:17,margin:"4px 0 6px"}}>{p.name}</h3>
                      <p style={{fontSize:12,color:B.muted,lineHeight:1.5,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.description}</p>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                        <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18,color:B.orange}}>{fmt(p.price)}</span>
                        <span style={{fontSize:12,color:B.muted}}>Stock: <strong>{p.stock}</strong></span>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>openEdit(p)} style={{flex:1,background:B.ink,color:B.white,border:"none",borderRadius:7,padding:"9px",cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"'Nunito Sans',sans-serif"}}>
                          <Pencil size={14}/> Editar
                        </button>
                        <button onClick={()=>setDeleteConfirm(p.id)} style={{background:"none",border:`1.5px solid ${B.line}`,borderRadius:7,padding:"9px 12px",cursor:"pointer",color:B.red,display:"flex",alignItems:"center"}}>
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

{panelTab==="videos"&&(
            <div style={{maxWidth:700}}>
              <div style={{background:B.white,borderRadius:14,padding:24,marginBottom:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18,marginBottom:16}}>🎬 Agregar video</h3>

                <div>
                  <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Título (opcional)</label>
                  <input value={videoTitle} onChange={e=>setVideoTitle(e.target.value)} placeholder="Ej: Cómo hacemos las fundas" style={{...inp,marginBottom:18}}/>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
                  <div style={{border:`2px dashed ${B.line}`,borderRadius:10,padding:16,textAlign:"center"}}>
                    <Upload size={22} color={B.orange} style={{marginBottom:8}}/>
                    <p style={{fontSize:12,fontWeight:700,marginBottom:8}}>Subir archivo</p>
                    <input ref={videoFileInputRef} type="file" accept="video/*" onChange={handleVideoFileChange} style={{fontSize:11,marginBottom:10,width:"100%"}}/>
                    <button onClick={handleUploadVideoFile} disabled={videoUploading||!videoFile} style={{...btnDark,width:"100%",padding:9,borderRadius:7,fontSize:12,opacity:(videoUploading||!videoFile)?.5:1}}>
                      {videoUploading?"Subiendo...":"Subir"}
                    </button>
                    <p style={{fontSize:10,color:B.muted,marginTop:6}}>Máx 50MB</p>
                  </div>
                  <div style={{border:`2px dashed ${B.line}`,borderRadius:10,padding:16,textAlign:"center"}}>
                    <Link2 size={22} color={B.pink} style={{marginBottom:8}}/>
                    <p style={{fontSize:12,fontWeight:700,marginBottom:8}}>Pegar link</p>
                    <input value={videoLink} onChange={e=>setVideoLink(e.target.value)} placeholder="Instagram, TikTok, YouTube..." style={{...inp,fontSize:11,marginBottom:10}}/>
                    <button onClick={handleAddVideoLink} disabled={videoUploading||!videoLink.trim()} style={{...btnDark,width:"100%",padding:9,borderRadius:7,fontSize:12,opacity:(videoUploading||!videoLink.trim())?.5:1}}>
                      {videoUploading?"Agregando...":"Agregar"}
                    </button>
                  </div>
                </div>

                {videoError&&(
                  <div style={{background:"#FEE2E2",borderRadius:8,padding:"10px 14px",display:"flex",gap:8,alignItems:"center",border:"1px solid #FCA5A5"}}>
                    <AlertCircle size={16} color={B.red}/><span style={{fontSize:13,color:B.red}}>{videoError}</span>
                  </div>
                )}
              </div>

              <div style={{background:B.white,borderRadius:14,padding:24,boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18,marginBottom:16}}>Videos cargados ({videos.length})</h3>
                {videos.length===0?(
                  <p style={{color:B.muted,fontSize:13}}>Todavía no cargaste videos.</p>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {videos.map(v=>(
                      <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,background:B.bg,borderRadius:10,padding:"10px 14px",border:`1px solid ${B.line}`}}>
                        {v.type==="upload"?<Upload size={16} color={B.orange}/>:<Link2 size={16} color={B.pink}/>}
                        <span style={{flex:1,fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title || v.url}</span>
                        <a href={v.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:B.muted}}>Ver</a>
                        <button onClick={()=>handleDeleteVideo(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:B.red,display:"flex"}}><Trash2 size={15}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {panelTab==="costos"&&(
            <>
              <div style={{background:B.white,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.06)",marginBottom:24,border:`1px solid ${B.line}`}}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                    <thead>
                      <tr style={{background:B.arena}}>
                        {["Producto","Costo","Precio","Margen","Ganancia/u","Total ganado"].map(h=>(
                          <th key={h} style={{padding:"14px 18px",textAlign:"left",fontSize:11,fontWeight:700,color:B.ink,textTransform:"uppercase",letterSpacing:.8}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {productsWithSales.map((p,i)=>{
                        const margin=p.price>0?((p.price-p.cost)/p.price*100).toFixed(0):0;
                        const gxU=p.price-p.cost;
                        const total=gxU*(p.sales||0);
                        const barC=parseInt(margin)>60?B.verde:parseInt(margin)>40?B.orange:B.red;
                        return (
                          <tr key={p.id} style={{borderBottom:`1px solid ${B.bg}`,background:i%2===0?B.white:"#FBFBFB"}}>
                            <td style={{padding:"14px 18px"}}><div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:20}}>{p.icon}</span><span style={{fontWeight:700,fontSize:14}}>{p.name}</span></div></td>
                            <td style={{padding:"14px 18px",fontSize:14,color:B.muted}}>{fmt(p.cost)}</td>
                            <td style={{padding:"14px 18px",fontWeight:700}}>{fmt(p.price)}</td>
                            <td style={{padding:"14px 18px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{height:6,width:64,background:B.bg,borderRadius:3}}><div style={{height:"100%",width:`${Math.min(100,parseInt(margin))}%`,background:barC,borderRadius:3}}/></div>
                                <span style={{fontSize:13,fontWeight:700,color:barC}}>{margin}%</span>
                              </div>
                            </td>
                            <td style={{padding:"14px 18px",fontWeight:700,color:B.verde}}>{fmt(gxU)}</td>
                            <td style={{padding:"14px 18px",fontWeight:800}}>{fmt(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{background:B.arena,borderTop:`2px solid ${B.line}`}}>
                        <td colSpan={5} style={{padding:"16px 18px",fontWeight:700,fontSize:15}}>💰 Ganancia neta total</td>
                        <td style={{padding:"16px 18px",fontWeight:800,fontSize:22,color:B.orange}}>{fmt(profit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div style={card}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><Users size={20} color={B.pink}/><h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:20}}>División entre socias</h3></div>
                <p style={{color:B.muted,fontWeight:400,fontSize:13,marginBottom:24}}>Distribución equitativa de la ganancia neta</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {Object.entries(USERS).map(([key,u])=>(
                    <div key={key} style={{background:u.grad,borderRadius:12,padding:26,color:"white",position:"relative",overflow:"hidden"}}>
                      {loggedUser===key&&<span style={{position:"absolute",top:12,right:14,fontSize:11,background:"rgba(255,255,255,.25)",borderRadius:10,padding:"3px 8px",fontWeight:700}}>Vos ✦</span>}
                      <p style={{fontSize:11,opacity:.85,marginBottom:4,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{u.handle}</p>
                      <p style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:30}}>{fmt(profit/2)}</p>
                      <p style={{fontSize:12,opacity:.7,marginTop:6}}>50% de {fmt(profit)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {panelTab==="diseno"&&(
            <div style={{maxWidth:700}}>
              {designSaved&&(
                <div style={{background:"#DCFCE7",borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:8,border:"1px solid #BBF7D0"}}>
                  <Check size={16} color="#16A34A"/><span style={{fontSize:13,color:"#15803D",fontWeight:600}}>¡Diseño guardado! Los cambios ya se ven en la tienda.</span>
                </div>
              )}

              <div style={{background:B.white,borderRadius:14,padding:24,marginBottom:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18,marginBottom:4}}>🎨 Colores</h3>
                <p style={{color:B.muted,fontSize:13,marginBottom:20}}>Los colores principales de la tienda.</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {[
                    ["colorOrange","Color principal (naranja)"],
                    ["colorPink","Color secundario (rosa)"],
                    ["colorInk","Color de texto"],
                    ["colorBg","Color de fondo"],
                  ].map(([key,label])=>(
                    <div key={key}>
                      <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:8,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>{label}</label>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <input type="color" value={designForm[key]} onChange={e=>setDesignForm(f=>({...f,[key]:e.target.value}))}
                          style={{width:44,height:44,border:`1.5px solid ${B.line}`,borderRadius:8,cursor:"pointer",padding:2}}/>
                        <input value={designForm[key]} onChange={e=>setDesignForm(f=>({...f,[key]:e.target.value}))}
                          style={{...inp,fontFamily:"monospace",fontSize:13,flex:1}}/>
                      </div>
                      <div style={{marginTop:8,height:32,borderRadius:7,background:designForm[key],border:`1px solid ${B.line}`}}/>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:B.white,borderRadius:14,padding:24,marginBottom:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18,marginBottom:4}}>✍️ Tipografías</h3>
                <p style={{color:B.muted,fontSize:13,marginBottom:20}}>Fuentes de Google Fonts. Escribí el nombre exacto.</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {[
                    ["fontTitle","Fuente de títulos","Bricolage Grotesque"],
                    ["fontBody","Fuente de texto","Nunito Sans"],
                  ].map(([key,label,ph])=>(
                    <div key={key}>
                      <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>{label}</label>
                      <input value={designForm[key]} onChange={e=>setDesignForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} style={inp}/>
                      <p style={{marginTop:8,fontSize:18,fontFamily:`'${designForm[key]}',sans-serif`,color:B.ink}}>AZ Concept — El texto se ve así</p>
                    </div>
                  ))}
                </div>
                <div style={{background:"#EFF9FF",borderRadius:8,padding:12,marginTop:16,border:"1px solid #BAE6FD"}}>
                  <p style={{fontSize:12,color:"#0369A1",lineHeight:1.6}}>💡 Buscá fuentes en <strong>fonts.google.com</strong> y copiá el nombre exacto. Ej: "Playfair Display", "Poppins", "Montserrat"</p>
                </div>
              </div>

              <div style={{background:B.white,borderRadius:14,padding:24,marginBottom:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18,marginBottom:4}}>✦ Textos de la portada</h3>
                <p style={{color:B.muted,fontSize:13,marginBottom:20}}>Lo primero que ven tus clientes.</p>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Título principal</label>
                    <textarea value={designForm.heroTitle} onChange={e=>setDesignForm(f=>({...f,heroTitle:e.target.value}))}
                      placeholder="Objetos únicos
hechos para vos." style={{...inp,resize:"vertical",minHeight:70}}/>
                    <p style={{fontSize:11,color:B.muted,marginTop:4}}>Usá 
 para hacer un salto de línea</p>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Subtítulo</label>
                    <textarea value={designForm.heroSub} onChange={e=>setDesignForm(f=>({...f,heroSub:e.target.value}))}
                      style={{...inp,resize:"vertical",minHeight:60}}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Texto del botón</label>
                    <input value={designForm.heroBtn} onChange={e=>setDesignForm(f=>({...f,heroBtn:e.target.value}))} style={inp}/>
                  </div>
                </div>
              </div>

              <div style={{background:B.white,borderRadius:14,padding:24,marginBottom:24,boxShadow:"0 2px 14px rgba(0,0,0,0.06)"}}>
                <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18,marginBottom:4}}>📦 Orden de productos</h3>
                <p style={{color:B.muted,fontSize:13,marginBottom:20}}>Usá las flechas para cambiar el orden en la tienda.</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {products.map((p,i)=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,background:B.bg,borderRadius:10,padding:"10px 14px",border:`1px solid ${B.line}`}}>
                      <span style={{fontSize:18,flexShrink:0}}>{p.icon}</span>
                      <span style={{flex:1,fontWeight:700,fontSize:14}}>{p.name}</span>
                      <span style={{fontSize:12,color:B.muted,marginRight:8}}>{p.cat}</span>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>moveProduct(p.id,-1)} disabled={i===0}
                          style={{background:i===0?B.line:B.ink,color:"white",border:"none",borderRadius:6,width:28,height:28,cursor:i===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>↑</button>
                        <button onClick={()=>moveProduct(p.id,1)} disabled={i===products.length-1}
                          style={{background:i===products.length-1?B.line:B.ink,color:"white",border:"none",borderRadius:6,width:28,height:28,cursor:i===products.length-1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>↓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:`linear-gradient(135deg,${designForm.colorOrange},${designForm.colorPink})`,borderRadius:14,padding:24,marginBottom:20,color:"white",textAlign:"center"}}>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8,opacity:.85}}>Preview de colores</p>
                <p style={{fontFamily:`'${designForm.fontTitle}',sans-serif`,fontWeight:800,fontSize:28,marginBottom:4}}>{designForm.heroTitle.split("\n")[0]}</p>
                <p style={{fontFamily:`'${designForm.fontBody}',sans-serif`,fontSize:14,opacity:.85}}>{designForm.heroSub.slice(0,60)}...</p>
                <div style={{marginTop:16,display:"inline-block",background:designForm.colorInk,borderRadius:8,padding:"10px 22px",fontWeight:700,fontSize:14}}>{designForm.heroBtn}</div>
              </div>

              <button onClick={saveDesign} disabled={designSaving}
                style={{...btnDark,width:"100%",padding:14,borderRadius:10,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:designSaving?.6:1}}>
                <Save size={18}/> {designSaving?"Guardando...":"Guardar diseño"}
              </button>
            </div>
          )}

          {panelTab==="config"&&(
            <div style={{maxWidth:560,display:"flex",flexDirection:"column",gap:20}}>
              <div style={card}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <div style={{background:"linear-gradient(135deg,#009EE3,#007CB5)",borderRadius:8,padding:8,display:"flex"}}><CreditCard size={18} color="white"/></div>
                  <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18}}>Mercado Pago</h3>
                </div>
                <p style={{color:B.muted,fontSize:13,marginBottom:20,lineHeight:1.6}}>
                  Pegá tu <strong>Public Key</strong> de Mercado Pago. La encontrás en <strong>mercadopago.com.ar → Tu negocio → Credenciales</strong>.
                </p>
                {configSaved&&(
                  <div style={{background:"#DCFCE7",borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8,border:"1px solid #BBF7D0"}}>
                    <Check size={16} color={B.verde}/>
                    <span style={{fontSize:13,color:"#15803D",fontWeight:600}}>¡Guardado en la nube! ✓</span>
                  </div>
                )}
                {mpKey&&!configSaved&&(
                  <div style={{background:"#DCFCE7",borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8,border:"1px solid #BBF7D0"}}>
                    <Check size={16} color={B.verde}/>
                    <span style={{fontSize:13,color:"#15803D",fontWeight:600}}>Mercado Pago configurado ✓</span>
                  </div>
                )}
                <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:8,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Public Key</label>
                <input value={mpKey} onChange={e=>setMpKey(e.target.value)} placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={{...inp,fontFamily:"monospace",fontSize:13}}/>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button onClick={()=>saveMpKey(mpKey)} disabled={configSaving} style={{...btnDark,padding:"10px 22px",borderRadius:8,display:"flex",alignItems:"center",gap:8,opacity:configSaving?.6:1}}>
                    <Save size={15}/> {configSaving?"Guardando...":"Guardar"}
                  </button>
                  {mpKey&&<button onClick={()=>saveMpKey("")} style={{background:"none",border:`1.5px solid ${B.line}`,borderRadius:8,padding:"10px 18px",cursor:"pointer",color:B.red,fontSize:13,fontWeight:600,fontFamily:"'Nunito Sans',sans-serif"}}>Eliminar</button>}
                </div>
              </div>

              <div style={card}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <div style={{background:B.verde,borderRadius:8,padding:8,display:"flex"}}><Landmark size={18} color="white"/></div>
                  <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:18}}>Transferencia bancaria (12% OFF)</h3>
                </div>
                <p style={{color:B.muted,fontSize:13,marginBottom:20,lineHeight:1.6}}>
                  Estos datos se muestran en el checkout cuando alguien elige pagar por transferencia.
                </p>
                {bankSaved&&(
                  <div style={{background:"#DCFCE7",borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8,border:"1px solid #BBF7D0"}}>
                    <Check size={16} color={B.verde}/><span style={{fontSize:13,color:"#15803D",fontWeight:600}}>¡Guardado! ✓</span>
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Alias</label>
                    <input value={bankForm.alias} onChange={e=>setBankForm(f=>({...f,alias:e.target.value}))} placeholder="azconcept" style={inp}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>CBU</label>
                    <input value={bankForm.cbu} onChange={e=>setBankForm(f=>({...f,cbu:e.target.value}))} placeholder="0000000000000000000000" style={{...inp,fontFamily:"monospace"}}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Titular</label>
                    <input value={bankForm.titular} onChange={e=>setBankForm(f=>({...f,titular:e.target.value}))} placeholder="Nombre del titular de la cuenta" style={inp}/>
                  </div>
                </div>
                <button onClick={saveBankInfo} disabled={bankSaving} style={{...btnDark,padding:"10px 22px",borderRadius:8,display:"flex",alignItems:"center",gap:8,opacity:bankSaving?.6:1,marginTop:16}}>
                  <Save size={15}/> {bankSaving?"Guardando...":"Guardar datos bancarios"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ PRODUCT EDITOR MODAL ══ */}
      {editingProduct&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:B.white,borderRadius:20,maxWidth:540,width:"100%",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{padding:"24px 28px 20px",borderBottom:`1px solid ${B.line}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:B.white,zIndex:1}}>
              <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:20}}>{showNewProduct?"Nuevo producto":"Editar producto"}</h2>
              <button onClick={()=>{setEditingProduct(null);setShowNewProduct(false);}} style={{background:"none",border:"none",cursor:"pointer",color:B.muted}}><X size={22}/></button>
            </div>
            <div style={{padding:28,display:"flex",flexDirection:"column",gap:18}}>
              <div>
                <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:10,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Foto del producto</label>
                <div style={{border:`2px dashed ${B.line}`,borderRadius:12,overflow:"hidden",background:B.bg}}>
                  {editPhoto?(
                    <div style={{position:"relative"}}>
                      <img src={editPhoto} alt="preview" style={{width:"100%",height:200,objectFit:"cover",display:"block"}}/>
                      <button onClick={()=>{setEditPhoto(null);if(photoInputRef.current)photoInputRef.current.value="";}}
                        style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,.55)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>
                        <X size={16}/>
                      </button>
                    </div>
                  ):(
                    <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:160,cursor:"pointer",gap:10}}>
                      <div style={{background:"rgba(255,131,33,0.1)",borderRadius:"50%",padding:14}}><ImagePlus size={28} color={B.orange}/></div>
                      <div style={{textAlign:"center"}}>
                        <p style={{fontWeight:700,fontSize:14,color:B.ink}}>Subir foto</p>
                        <p style={{fontSize:12,color:B.muted,marginTop:3}}>JPG, PNG o WEBP · Máx 2MB</p>
                      </div>
                      <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
                    </label>
                  )}
                </div>
              </div>
              {!editPhoto&&(
                <div>
                  <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:8,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Color de fondo</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {GRADIENTS.map((g,i)=>(
                      <button key={i} onClick={()=>setEditForm(f=>({...f,bg:g}))}
                        style={{width:36,height:36,borderRadius:8,background:g,border:editForm.bg===g?`3px solid ${B.ink}`:"3px solid transparent",cursor:"pointer",flexShrink:0}}/>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Nombre *</label>
                <input value={editForm.name||""} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} placeholder="Ej: Funda iPhone" style={inp}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Descripción</label>
                <textarea value={editForm.description||""} onChange={e=>setEditForm(f=>({...f,description:e.target.value}))} placeholder="Describí el producto..." style={{...inp,resize:"vertical",minHeight:90}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Categoría</label>
                <input value={editForm.cat||""} onChange={e=>setEditForm(f=>({...f,cat:e.target.value}))} placeholder="Ej: Fundas, Neceser..." style={inp}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Precio *</label>
                  <input type="number" value={editForm.price||""} onChange={e=>setEditForm(f=>({...f,price:e.target.value}))} placeholder="0" style={inp}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Costo</label>
                  <input type="number" value={editForm.cost||""} onChange={e=>setEditForm(f=>({...f,cost:e.target.value}))} placeholder="0" style={inp}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Stock</label>
                  <input type="number" value={editForm.stock||""} onChange={e=>setEditForm(f=>({...f,stock:e.target.value}))} placeholder="0" style={inp}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,display:"block",marginBottom:6,color:B.muted,textTransform:"uppercase",letterSpacing:.8}}>Ícono emoji</label>
                <input value={editForm.icon||""} onChange={e=>setEditForm(f=>({...f,icon:e.target.value}))} placeholder="📱" style={{...inp,width:90,fontSize:22}}/>
              </div>
              {editError&&(
                <div style={{background:"#FEE2E2",borderRadius:8,padding:"10px 14px",display:"flex",gap:8,alignItems:"center",border:"1px solid #FCA5A5"}}>
                  <AlertCircle size={16} color={B.red}/><span style={{fontSize:13,color:B.red}}>{editError}</span>
                </div>
              )}
              <div style={{display:"flex",gap:12,paddingTop:4}}>
                <button onClick={()=>{setEditingProduct(null);setShowNewProduct(false);}} style={{flex:1,background:"none",border:`1.5px solid ${B.line}`,borderRadius:8,padding:13,cursor:"pointer",fontWeight:600,fontFamily:"'Nunito Sans',sans-serif"}}>Cancelar</button>
                <button onClick={handleSaveProduct} disabled={editSaving} style={{flex:2,...btnDark,padding:13,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:editSaving?.6:1}}>
                  <Save size={16}/>{editSaving?"Guardando...":showNewProduct?"Crear producto":"Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:B.white,borderRadius:16,maxWidth:380,width:"100%",padding:30,textAlign:"center"}}>
            <div style={{background:"#FEE2E2",borderRadius:"50%",width:60,height:60,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}><Trash2 size={26} color={B.red}/></div>
            <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:20,marginBottom:10}}>¿Eliminar producto?</h3>
            <p style={{color:B.muted,fontSize:14,marginBottom:24}}>Esta acción no se puede deshacer.</p>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,background:"none",border:`1.5px solid ${B.line}`,borderRadius:8,padding:12,cursor:"pointer",fontWeight:600,fontFamily:"'Nunito Sans',sans-serif"}}>Cancelar</button>
              <button onClick={()=>handleDeleteProduct(deleteConfirm)} style={{flex:1,background:B.red,color:B.white,border:"none",borderRadius:8,padding:12,cursor:"pointer",fontWeight:700,fontFamily:"'Nunito Sans',sans-serif"}}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
