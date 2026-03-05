import { useState, useMemo, useEffect } from "react";

// ── Seed data from UkrSCES template ────────────────────────────────────────
const SEED = [
  { id:1, country:"Ukraine", name:"Ukrainian Scientific Centre of Ecology of the Sea (UkrSCES)", city:"Odesa", lat:46.4397, lng:30.7692, address:"65009, Ukraine, Odesa, Frantsuzsky Blvd., 89", audience:"Higher education and research organisations", aoi:"Water Quality Monitoring", expertise:"Research Institute", subregion:"North-Western Black Sea", mu:"Marine Waters", influence:10, impact:3, contact:"yura.oleynik209@gmail.com", gdpr:"YES", status:"Active", website:"https://sea.gov.ua", partner:"UKR-SCES", comments:"Project partner — lead for UKR stakeholders" },
  { id:2, country:"Ukraine", name:"State Ecological Inspectorate of the South-Western District", city:"Odesa", lat:46.4067, lng:30.7181, address:"65114, Ukraine, Odesa, Lustdorfska road, 22", audience:"Local public authority", aoi:"Water Quality Monitoring", expertise:"Local / Regional Authority", subregion:"North-Western Black Sea", mu:"All Waters", influence:10, impact:8, contact:"sw@dei.gov.ua", gdpr:"YES", status:"Potential", website:"https://sw.dei.gov.ua", partner:"UKR-SCES", comments:"Key decision-maker; permits and reporting" },
  { id:3, country:"Ukraine", name:"State Ecological Inspection of Ukraine", city:"Kyiv", lat:50.4231, lng:30.5284, address:"01042, Kyiv, Novopecherskyi Lane 3", audience:"National public authority", aoi:"Environmental protection", expertise:"National Authority / Ministry", subregion:"North-Western Black Sea", mu:"All Waters", influence:10, impact:8, contact:"info@dei.gov.ua", gdpr:"YES", status:"Potential", website:"https://dei.gov.ua/", partner:"UKR-SCES", comments:"Key decision-maker" },
  { id:4, country:"Ukraine", name:"Ministry of Economy, Environment and Agriculture of Ukraine", city:"Kyiv", lat:50.4474, lng:30.5342, address:"01008, Ukraine, Kyiv, M. Hrushevskoho Street, 12/2", audience:"National public authority", aoi:"Environmental protection", expertise:"National Authority / Ministry", subregion:"North-Western Black Sea", mu:"All Waters", influence:10, impact:10, contact:"meconomy@me.gov.ua", gdpr:"YES", status:"Potential", website:"https://me.gov.ua/", partner:"UKR-SCES", comments:"Key decision-maker; highest impact" },
  { id:5, country:"Ukraine", name:"Dept. of Ecology and Natural Resources of Kherson Regional State Administration", city:"Kherson", lat:46.6411, lng:32.6144, address:"73000, Kherson, pl. Svobody, 1", audience:"National public authority", aoi:"Environmental protection", expertise:"National Authority / Ministry", subregion:"North-Western Black Sea", mu:"All Waters", influence:10, impact:8, contact:"kanc@khoda.gov.ua", gdpr:"YES", status:"Potential", website:"", partner:"UKR-SCES", comments:"" },
  { id:6, country:"Ukraine", name:"Dept. of Ecology and Natural Resources of Odesa Regional State Administration", city:"Odesa", lat:46.466, lng:30.7466, address:"83 Kanatna St., Odesa, 65107", audience:"National public authority", aoi:"Environmental protection", expertise:"National Authority / Ministry", subregion:"North-Western Black Sea", mu:"All Waters", influence:10, impact:8, contact:"ecolog@od.gov.ua", gdpr:"YES", status:"Potential", website:"http://ecology.od.gov.ua/", partner:"UKR-SCES", comments:"" },
  { id:7, country:"Ukraine", name:"Odesa I.I. Mechnikov National University", city:"Odesa", lat:46.4876, lng:30.7313, address:"65082, Ukraine, Odesa, Zmienka Vsevoloda Street, 2", audience:"Higher education and research organisations", aoi:"Environmental protection", expertise:"Educational institution", subregion:"North-Western Black Sea", mu:"All Waters", influence:8, impact:3, contact:"rector@onu.edu.ua", gdpr:"PENDING", status:"Pending", website:"https://onu.edu.ua/uk", partner:"UKR-SCES", comments:"Technical expertise; collaboration potential" },
  { id:8, country:"Ukraine", name:"National Academy of Sciences of Ukraine", city:"Kyiv", lat:50.4449, lng:30.5125, address:"01030, Kyiv, Volodymyrska St., 54", audience:"Higher education and research organisations", aoi:"Environmental protection", expertise:"Research network", subregion:"North-Western Black Sea", mu:"All Waters", influence:9, impact:7, contact:"press@nas.gov.ua", gdpr:"PENDING", status:"Pending", website:"www.nas.gov.ua", partner:"UKR-SCES", comments:"Technical expertise; collaboration potential" },
  { id:9, country:"Ukraine", name:"Institute of Marine Biology of the National Academy of Sciences of Ukraine", city:"Odesa", lat:46.4763, lng:30.7422, address:"65048, Odesa, Pushkinska St., 37", audience:"Higher education and research organisations", aoi:"Biodiversity Conservation", expertise:"Scientific-Research institution", subregion:"North-Western Black Sea", mu:"Marine Waters", influence:8, impact:3, contact:"imb@nas.gov.ua", gdpr:"PENDING", status:"Pending", website:"https://imb.odessa.ua", partner:"UKR-SCES", comments:"" },
  { id:10, country:"Ukraine", name:"Danube Biosphere Reserve", city:"Vilkovo", lat:45.4065, lng:29.5843, address:"68355, Odesa region, Vilkovo, 134a", audience:"Local public authority", aoi:"Biodiversity Conservation", expertise:"Local / Regional Authority", subregion:"North-Western Black Sea", mu:"All Waters", influence:7, impact:4, contact:"dbr.org.ua@gmail.com", gdpr:"PENDING", status:"Pending", website:"https://www.dbr.org.ua/", partner:"UKR-SCES", comments:"" },
  { id:11, country:"Ukraine", name:"WWF-Ukraine", city:"Kyiv", lat:50.4496, lng:30.594, address:"02002, Kyiv, Raisy Okipnoi Street, 4", audience:"Interest groups including NGOs", aoi:"Environmental protection", expertise:"Non-governmental organizations (NGOs)", subregion:"North-Western Black Sea", mu:"All Waters", influence:8, impact:1, contact:"ua@wwf.ua", gdpr:"PENDING", status:"Pending", website:"https://wwf.panda.org/", partner:"UKR-SCES", comments:"" },
  { id:12, country:"Ukraine", name:"ALL-UKRAINIAN ENVIRONMENTAL LEAGUE", city:"Kyiv", lat:50.4368, lng:30.5122, address:"01033, Kyiv, Saksahanskoho vulitsya, 30-v", audience:"Interest groups including NGOs", aoi:"Environmental protection", expertise:"Non-governmental organizations (NGOs)", subregion:"North-Western Black Sea", mu:"All Waters", influence:6, impact:2, contact:"vel@ecoleague.net", gdpr:"PENDING", status:"Pending", website:"https://www.ecoleague.net/", partner:"UKR-SCES", comments:"" },
  { id:13, country:"Romania", name:"Ministry of Environment, Water and Forests", city:"Bucharest", lat:44.4258, lng:26.0911, address:"Bulevardul Libertății 12, 030167 București", audience:"National public authority", aoi:"Policy development and regulatory implementation", expertise:"Marine and environmental policy", subregion:"North-Western Black Sea", mu:"All Waters", influence:9, impact:9, contact:"", gdpr:"PENDING", status:"Pending", website:"", partner:"NIMRD", comments:"Key decision-maker" },
  { id:14, country:"Romania", name:"National Administration of Romanian Waters (ANAR)", city:"Bucharest", lat:44.4408, lng:26.0981, address:"Strada Ion Câmpineanu 11, București", audience:"National public authority", aoi:"Environmental monitoring and data-driven decisions", expertise:"Environmental monitoring and sampling", subregion:"North-Western Black Sea", mu:"All Waters", influence:9, impact:9, contact:"", gdpr:"PENDING", status:"Pending", website:"", partner:"NIMRD", comments:"Data sharing and decision-support access" },
  { id:15, country:"Romania", name:"Danube Delta Biosphere Reserve Administration", city:"Tulcea", lat:45.1804, lng:28.7952, address:"Strada Portului 34a, 827150 Tulcea", audience:"Local public authority", aoi:"Protection of marine ecosystems and biodiversity", expertise:"Marine ecology and biodiversity", subregion:"North-Western Black Sea", mu:"Transitional Waters", influence:5, impact:9, contact:"", gdpr:"PENDING", status:"Pending", website:"", partner:"NIMRD", comments:"Demonstration and pilot activities" },
  { id:16, country:"Romania", name:"Romanian Coast Guard", city:"Constanța", lat:44.1734, lng:28.6417, address:"21 Zmeurei Avenue, 900433, Constanta", audience:"Regional public authority", aoi:"Risk prevention and response to marine incidents", expertise:"Emergency response and marine incidents", subregion:"North-Western Black Sea", mu:"All Waters", influence:9, impact:9, contact:"ijpf.constanta@mai.gov.ro", gdpr:"PENDING", status:"Pending", website:"https://www.politiadefrontiera.ro/en/structura-teritoriala-coast-guard/", partner:"NIMRD", comments:"Key decision-maker; permits and reporting" },
];

function getCategory(influence, impact) {
  if (influence >= 7 && impact >= 7) return "Manage closely";
  if (influence >= 7 && impact < 7) return "Keep satisfied";
  if (influence < 7 && impact >= 7) return "Consult with";
  return "Keep informed";
}

const CATEGORY_COLOR = {
  "Manage closely": { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  "Keep satisfied": { bg: "#fef9c3", text: "#854d0e", dot: "#f59e0b" },
  "Consult with":   { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  "Keep informed":  { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
};

const STATUS_COLOR = {
  "Active":   { bg:"#d1fae5", text:"#065f46" },
  "Potential":{ bg:"#dbeafe", text:"#1e40af" },
  "Pending":  { bg:"#fef3c7", text:"#92400e" },
  "Inactive": { bg:"#f3f4f6", text:"#6b7280" },
};

const GDPR_COLOR = {
  "YES":     { bg:"#d1fae5", text:"#065f46" },
  "NO":      { bg:"#fee2e2", text:"#991b1b" },
  "PENDING": { bg:"#fef3c7", text:"#92400e" },
};

const PARTNERS = ["All partners", "NIMRD", "IO-BAS", "UKR-SCES", "TUBITAK", "TUDAV", "Mare Nostrum"];
const COUNTRIES = ["All countries", "Romania", "Bulgaria", "Ukraine", "Turkey", "Georgia"];
const AUDIENCES = ["All audiences", "National public authority", "Regional public authority", "Local public authority", "Higher education and research organisations", "Interest groups including NGOs", "Education / training center and school", "Sectoral agency", "SME", "Business support organisation", "General public"];
const STATUSES = ["All statuses", "Active", "Potential", "Pending", "Inactive"];

const EMPTY = { country:"", name:"", city:"", lat:"", lng:"", address:"", audience:"", aoi:"", expertise:"", subregion:"", mu:"", influence:5, impact:5, contact:"", gdpr:"PENDING", status:"Pending", website:"", partner:"", comments:"" };

export default function App() {
  const [data, setData] = useState(SEED);
  const [view, setView] = useState("table"); // table | form | stats
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All countries");
  const [filterPartner, setFilterPartner] = useState("All partners");
  const [filterAudience, setFilterAudience] = useState("All audiences");
  const [filterStatus, setFilterStatus] = useState("All statuses");
  const [filterCategory, setFilterCategory] = useState("All categories");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [nextId, setNextId] = useState(SEED.length + 1);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return data
      .filter(r => {
        const cat = getCategory(r.influence, r.impact);
        const q = search.toLowerCase();
        const matchSearch = !q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.contact.toLowerCase().includes(q) || r.aoi.toLowerCase().includes(q);
        return matchSearch
          && (filterCountry === "All countries" || r.country === filterCountry)
          && (filterPartner === "All partners" || r.partner === filterPartner)
          && (filterAudience === "All audiences" || r.audience === filterAudience)
          && (filterStatus === "All statuses" || r.status === filterStatus)
          && (filterCategory === "All categories" || cat === filterCategory);
      })
      .sort((a, b) => {
        let av = a[sortField] ?? "", bv = b[sortField] ?? "";
        if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
  }, [data, search, filterCountry, filterPartner, filterAudience, filterStatus, filterCategory, sortField, sortDir]);

  const stats = useMemo(() => {
    const total = data.length;
    const byCountry = {};
    const byAudience = {};
    const byCategory = {};
    const byStatus = {};
    data.forEach(r => {
      byCountry[r.country] = (byCountry[r.country] || 0) + 1;
      byAudience[r.audience] = (byAudience[r.audience] || 0) + 1;
      const cat = getCategory(r.influence, r.impact);
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });
    return { total, byCountry, byAudience, byCategory, byStatus };
  }, [data]);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY });
    setView("form");
  }

  function openEdit(row) {
    setEditing(row.id);
    setForm({ ...row });
    setView("form");
    setSelected(null);
  }

  function saveForm() {
    if (!form.name || !form.country) { showToast("Name and Country are required", "error"); return; }
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkaG1nc2Vsbnhkc3FjeGNpdXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MjM4NjksImV4cCI6MjA1NjQ5OTg2OX0.bYMzSSZMRi0cDSBpRSxGEaAJCXbdp_i6Q9CgDRRzBek';
    const BASE = 'https://hdhmgselnxdsqcxciupp.supabase.co/rest/v1/stakeholders';
    const h = { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY };
    if (editing) {
      const { id, ...rest } = form;
      fetch(BASE + '?id=eq.' + editing, { method: 'PATCH', headers: { ...h, Prefer: 'return=minimal' }, body: JSON.stringify(rest) })
        .then(() => { setData(d => d.map(r => r.id === editing ? { ...form, id: editing } : r)); showToast("Stakeholder updated ✓"); setView("table"); })
        .catch(() => showToast("Save failed", "error"));
    } else {
      const { id, ...rest } = form;
      fetch(BASE, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(rest) })
        .then(r => r.json())
        .then(rows => { setData(d => [...d, rows[0] || { ...form, id: nextId }]); setNextId(n => n+1); showToast("Stakeholder added ✓"); setView("table"); })
        .catch(() => showToast("Save failed", "error"));
    }
  }

  function deleteRow(id) {
    setData(d => d.filter(r => r.id !== id));
    setSelected(null);
    showToast("Stakeholder removed");
  }

  function sortBy(field) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function exportCSV() {
    const cols = ["id","country","name","city","lat","lng","address","audience","aoi","expertise","subregion","mu","influence","impact","category","contact","gdpr","status","website","partner","comments"];
    const rows = [cols.join(","), ...data.map(r => cols.map(c => {
      const v = c === "category" ? getCategory(r.influence, r.impact) : (r[c] ?? "");
      return `"${String(v).replace(/"/g,'""')}"`;
    }).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ANEMONE_PLUS_Stakeholder_Database.csv"; a.click();
    showToast("CSV exported ✓");
  }

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.3, fontSize: 10 }}>
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app: { fontFamily:"'IBM Plex Sans', 'Segoe UI', sans-serif", background:"#f0f4f8", minHeight:"100vh", color:"#1a2332" },
    header: { background:"linear-gradient(135deg, #0a1628 0%, #1a3a5c 60%, #0e3d6a 100%)", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, boxShadow:"0 2px 12px rgba(0,0,0,0.3)", position:"sticky", top:0, zIndex:100 },
    logo: { display:"flex", alignItems:"center", gap:10 },
    logoMark: { width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg, #00b4d8, #0077b6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#fff", boxShadow:"0 0 0 2px rgba(0,180,216,0.4)" },
    logoText: { color:"#fff", fontSize:15, fontWeight:700, letterSpacing:"0.02em" },
    logoSub: { color:"rgba(255,255,255,0.5)", fontSize:11, letterSpacing:"0.05em" },
    nav: { display:"flex", gap:4 },
    navBtn: (active) => ({ padding:"6px 14px", borderRadius:6, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, letterSpacing:"0.02em", background: active ? "rgba(0,180,216,0.25)" : "transparent", color: active ? "#00b4d8" : "rgba(255,255,255,0.6)", transition:"all 0.15s" }),
    headerRight: { display:"flex", gap:8, alignItems:"center" },
    pill: (bg, text) => ({ background:bg, color:text, borderRadius:999, padding:"2px 8px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }),
    body: { padding:"20px 24px", maxWidth:1400, margin:"0 auto" },
    toolbar: { display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:16 },
    search: { flex:1, minWidth:200, padding:"9px 14px 9px 36px", borderRadius:8, border:"1.5px solid #cbd5e1", background:"#fff", fontSize:13, outline:"none", transition:"border 0.15s" },
    select: { padding:"8px 12px", borderRadius:8, border:"1.5px solid #cbd5e1", background:"#fff", fontSize:13, outline:"none", cursor:"pointer" },
    btn: (variant) => {
      const map = {
        primary: { background:"#0a3d62", color:"#fff", border:"none" },
        success: { background:"#065f46", color:"#fff", border:"none" },
        danger:  { background:"#fee2e2", color:"#991b1b", border:"1.5px solid #fca5a5" },
        ghost:   { background:"#f8fafc", color:"#334155", border:"1.5px solid #e2e8f0" },
        teal:    { background:"#0e7490", color:"#fff", border:"none" },
      };
      return { ...(map[variant]||map.ghost), padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", letterSpacing:"0.01em" };
    },
    table: { width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" },
    th: { padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, letterSpacing:"0.06em", color:"#64748b", background:"#f8fafc", borderBottom:"1.5px solid #e2e8f0", cursor:"pointer", userSelect:"none", textTransform:"uppercase", whiteSpace:"nowrap" },
    td: (highlight) => ({ padding:"10px 14px", fontSize:13, color:"#334155", borderBottom:"1px solid #f1f5f9", background: highlight ? "#f0f9ff" : "transparent", transition:"background 0.1s" }),
    tr: (sel) => ({ cursor:"pointer", background: sel ? "#eff6ff" : "transparent", transition:"background 0.1s" }),
    card: { background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 6px rgba(0,0,0,0.08)" },
    detailPanel: { position:"fixed", right:0, top:60, bottom:0, width:380, background:"#fff", boxShadow:"-4px 0 24px rgba(0,0,0,0.1)", zIndex:90, overflowY:"auto", padding:24, transition:"transform 0.25s" },
    label: { fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4, display:"block" },
    input: { width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #cbd5e1", fontSize:13, outline:"none", boxSizing:"border-box", transition:"border 0.15s" },
    formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 20px" },
    formGroup: { display:"flex", flexDirection:"column", gap:4 },
    statCard: { background:"#fff", borderRadius:12, padding:18, boxShadow:"0 1px 6px rgba(0,0,0,0.07)" },
    statNum: { fontSize:36, fontWeight:800, color:"#0a3d62", lineHeight:1 },
    statLabel: { fontSize:12, color:"#64748b", marginTop:4, fontWeight:600 },
    progressBar: (pct, color) => ({ height:7, borderRadius:999, background:color, width:`${pct}%`, transition:"width 0.4s" }),
    toast: (type) => ({ position:"fixed", bottom:24, right:24, padding:"12px 20px", borderRadius:10, background: type==="error"?"#fee2e2":"#d1fae5", color: type==="error"?"#991b1b":"#065f46", fontWeight:700, fontSize:13, boxShadow:"0 4px 16px rgba(0,0,0,0.15)", zIndex:999, display:"flex", alignItems:"center", gap:8 }),
  };

  // ── STATS VIEW ────────────────────────────────────────────────────────────
  const StatsView = () => (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Stakeholders", val:stats.total, color:"#0a3d62" },
          { label:"Manage Closely", val:stats.byCategory["Manage closely"]||0, color:"#ef4444" },
          { label:"Countries", val:Object.keys(stats.byCountry).length, color:"#0e7490" },
          { label:"Active", val:stats.byStatus["Active"]||0, color:"#065f46" },
        ].map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={{ ...S.statNum, color:s.color }}>{s.val}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>By Engagement Category</div>
          {Object.entries(stats.byCategory).map(([cat,n]) => {
            const c = CATEGORY_COLOR[cat];
            return (
              <div key={cat} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ fontWeight:600 }}>{cat}</span>
                  <span style={{ color:"#64748b" }}>{n} ({Math.round(n/stats.total*100)}%)</span>
                </div>
                <div style={{ background:"#f1f5f9", borderRadius:999, overflow:"hidden", height:7 }}>
                  <div style={S.progressBar(n/stats.total*100, c.dot)} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>By Country</div>
          {Object.entries(stats.byCountry).sort((a,b)=>b[1]-a[1]).map(([c,n]) => (
            <div key={c} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ fontWeight:600 }}>{c}</span>
                <span style={{ color:"#64748b" }}>{n} ({Math.round(n/stats.total*100)}%)</span>
              </div>
              <div style={{ background:"#f1f5f9", borderRadius:999, overflow:"hidden", height:7 }}>
                <div style={S.progressBar(n/stats.total*100, "#0a3d62")} />
              </div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>By Stakeholder Type</div>
          {Object.entries(stats.byAudience).sort((a,b)=>b[1]-a[1]).map(([a,n]) => (
            <div key={a} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #f1f5f9", fontSize:12 }}>
              <span style={{ color:"#334155" }}>{a}</span>
              <span style={{ fontWeight:700, color:"#0a3d62", minWidth:24, textAlign:"right" }}>{n}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>By Status</div>
          {Object.entries(stats.byStatus).map(([s,n]) => {
            const c = STATUS_COLOR[s] || STATUS_COLOR["Inactive"];
            return (
              <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ ...S.pill(c.bg, c.text) }}>{s}</span>
                <div style={{ flex:1, margin:"0 12px", background:"#f1f5f9", borderRadius:999, overflow:"hidden", height:7 }}>
                  <div style={S.progressBar(n/stats.total*100, c.text)} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#334155" }}>{n}</span>
              </div>
            );
          })}
          <div style={{ marginTop:16, padding:"12px 14px", background:"#fffbeb", borderRadius:8, border:"1px solid #fde68a" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#92400e", marginBottom:4 }}>⚠ GDPR Pending</div>
            <div style={{ fontSize:13, color:"#78350f" }}>{data.filter(r=>r.gdpr==="PENDING").length} stakeholders awaiting GDPR consent confirmation</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── FORM VIEW ─────────────────────────────────────────────────────────────
  const FormView = () => (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <div style={S.card}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"#0a3d62", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#fff" }}>{editing ? "✏️" : "➕"}</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:"#0a3d62" }}>{editing ? "Edit Stakeholder" : "Add New Stakeholder"}</div>
            <div style={{ fontSize:12, color:"#64748b" }}>Output 1.1 – ANEMONE PLUS Stakeholder Database</div>
          </div>
        </div>

        <div style={{ background:"#f0f9ff", borderRadius:8, padding:"10px 14px", marginBottom:18, fontSize:12, color:"#0369a1", borderLeft:"3px solid #0ea5e9" }}>
          Fields marked with * are required. Geographic coordinates are mandatory for WebGIS integration.
        </div>

        <div style={{ fontWeight:700, fontSize:12, color:"#64748b", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>Basic Information</div>
        <div style={S.formGrid}>
          {[
            { label:"Stakeholder Name *", key:"name", span:2 },
            { label:"Country *", key:"country", type:"select", opts:["Romania","Bulgaria","Ukraine","Turkey","Georgia"] },
            { label:"City", key:"city" },
            { label:"Latitude (N, WGS84) *", key:"lat", placeholder:"e.g. 44.1734" },
            { label:"Longitude (E, WGS84) *", key:"lng", placeholder:"e.g. 28.6417" },
            { label:"Full Address (with postal code)", key:"address", span:2 },
          ].map(f => (
            <div key={f.key} style={{ ...S.formGroup, gridColumn: f.span === 2 ? "1 / -1" : undefined }}>
              <label style={S.label}>{f.label}</label>
              {f.type === "select" ? (
                <select style={S.input} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                  <option value="">Select…</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input style={S.input} value={form[f.key]} placeholder={f.placeholder} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>

        <div style={{ fontWeight:700, fontSize:12, color:"#64748b", letterSpacing:"0.06em", textTransform:"uppercase", margin:"18px 0 10px" }}>Classification</div>
        <div style={S.formGrid}>
          {[
            { label:"Target Audience (JEMS)", key:"audience", type:"select", opts:["National public authority","Regional public authority","Local public authority","Higher education and research organisations","Interest groups including NGOs","Education / training center and school","Sectoral agency","SME","Business support organisation","General public"] },
            { label:"Area of Interest", key:"aoi", type:"select", opts:["Protection of marine ecosystems and biodiversity","Water Quality Monitoring","Environmental protection","Biodiversity Conservation","Environmental monitoring and data-driven decisions","Policy development and regulatory implementation","Maritime Transport","Nature management","Citizen Science","Climate change impacts, adaptation and resilience","Sustainable fisheries, aquaculture and blue economy","Other"] },
            { label:"Thematic Expertise", key:"expertise" },
            { label:"Sub-Region", key:"subregion", type:"select", opts:["North-Western Black Sea","Western Black Sea","Southern Black Sea","Eastern Black Sea","Northern Black Sea","South-Western Black Sea","South-Eastern Black Sea","North-Eastern Black Sea"] },
            { label:"Marine Unit (MU)", key:"mu", type:"select", opts:["All Waters","Marine Waters","Coastal waters","Transitional Waters"] },
            { label:"Responsible Partner", key:"partner", type:"select", opts:["NIMRD","IO-BAS","UKR-SCES","TUBITAK","TUDAV","Mare Nostrum"] },
          ].map(f => (
            <div key={f.key} style={S.formGroup}>
              <label style={S.label}>{f.label}</label>
              {f.type === "select" ? (
                <select style={S.input} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                  <option value="">Select…</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input style={S.input} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>

        <div style={{ fontWeight:700, fontSize:12, color:"#64748b", letterSpacing:"0.06em", textTransform:"uppercase", margin:"18px 0 10px" }}>Scoring (Power/Interest Matrix)</div>
        <div style={S.formGrid}>
          {[
            { label:`Influence / Interest: ${form.influence}/10`, key:"influence" },
            { label:`Impact: ${form.impact}/10`, key:"impact" },
          ].map(f => (
            <div key={f.key} style={S.formGroup}>
              <label style={S.label}>{f.label}</label>
              <input type="range" min="1" max="10" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))} style={{ width:"100%", accentColor:"#0a3d62" }} />
            </div>
          ))}
          <div style={{ ...S.formGroup, gridColumn:"1/-1" }}>
            <label style={S.label}>Resulting Category</label>
            <div>
              {(() => { const cat = getCategory(form.influence, form.impact); const c = CATEGORY_COLOR[cat]; return <span style={{ ...S.pill(c.bg, c.text), fontSize:13, padding:"4px 14px" }}>● {cat}</span>; })()}
            </div>
          </div>
        </div>

        <div style={{ fontWeight:700, fontSize:12, color:"#64748b", letterSpacing:"0.06em", textTransform:"uppercase", margin:"18px 0 10px" }}>Contact & Admin</div>
        <div style={S.formGrid}>
          {[
            { label:"Contact Information", key:"contact", placeholder:"email, phone…" },
            { label:"Website", key:"website", placeholder:"https://…" },
            { label:"GDPR Consent", key:"gdpr", type:"select", opts:["YES","NO","PENDING"] },
            { label:"Status", key:"status", type:"select", opts:["Active","Potential","Pending","Inactive"] },
            { label:"Comments / Justification", key:"comments", span:2 },
          ].map(f => (
            <div key={f.key} style={{ ...S.formGroup, gridColumn: f.span === 2 ? "1 / -1" : undefined }}>
              <label style={S.label}>{f.label}</label>
              {f.type === "select" ? (
                <select style={S.input} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : f.span === 2 ? (
                <textarea style={{ ...S.input, height:70, resize:"vertical" }} value={form[f.key]} placeholder={f.placeholder} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              ) : (
                <input style={S.input} value={form[f.key]} placeholder={f.placeholder} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:24, paddingTop:16, borderTop:"1.5px solid #f1f5f9" }}>
          <button style={S.btn("ghost")} onClick={() => setView("table")}>Cancel</button>
          <button style={S.btn("primary")} onClick={saveForm}>💾 {editing ? "Update" : "Add Stakeholder"}</button>
        </div>
      </div>
    </div>
  );

  // ── DETAIL PANEL ──────────────────────────────────────────────────────────
  const DetailPanel = ({ row }) => {
    const cat = getCategory(row.influence, row.impact);
    const cc = CATEGORY_COLOR[cat];
    const sc = STATUS_COLOR[row.status] || STATUS_COLOR["Inactive"];
    const gc = GDPR_COLOR[row.gdpr] || GDPR_COLOR["PENDING"];
    return (
      <div style={S.detailPanel}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:15, color:"#0a3d62", lineHeight:1.3, marginBottom:6 }}>{row.name}</div>
            <div style={{ fontSize:12, color:"#64748b" }}>{row.city}, {row.country}</div>
          </div>
          <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#94a3b8", padding:4 }}>✕</button>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
          <span style={S.pill(cc.bg, cc.text)}>● {cat}</span>
          <span style={S.pill(sc.bg, sc.text)}>{row.status}</span>
          <span style={S.pill(gc.bg, gc.text)}>GDPR: {row.gdpr}</span>
        </div>

        {[
          { label:"Audience", val:row.audience },
          { label:"Area of Interest", val:row.aoi },
          { label:"Expertise", val:row.expertise },
          { label:"Sub-region", val:row.subregion },
          { label:"Marine Unit", val:row.mu },
          { label:"Partner responsible", val:row.partner },
        ].map(f => f.val ? (
          <div key={f.label} style={{ marginBottom:10 }}>
            <div style={S.label}>{f.label}</div>
            <div style={{ fontSize:13, color:"#334155" }}>{f.val}</div>
          </div>
        ) : null)}

        <div style={{ background:"#f0f4f8", borderRadius:10, padding:"12px 14px", margin:"14px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:800, color:"#0a3d62" }}>{row.influence}</div>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>INFLUENCE</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:800, color:"#0a3d62" }}>{row.impact}</div>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>IMPACT</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color:cc.dot }}>{row.influence + row.impact}</div>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>COMBINED</div>
            </div>
          </div>
        </div>

        {row.contact && (
          <div style={{ marginBottom:10 }}>
            <div style={S.label}>Contact</div>
            <div style={{ fontSize:13, color:"#0a3d62", wordBreak:"break-all" }}>{row.contact}</div>
          </div>
        )}
        {row.website && (
          <div style={{ marginBottom:10 }}>
            <div style={S.label}>Website</div>
            <a href={row.website.startsWith("http") ? row.website : `https://${row.website}`} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#0e7490", textDecoration:"none", wordBreak:"break-all" }}>{row.website}</a>
          </div>
        )}
        {row.address && (
          <div style={{ marginBottom:10 }}>
            <div style={S.label}>Address</div>
            <div style={{ fontSize:12, color:"#334155" }}>{row.address}</div>
          </div>
        )}
        {row.lat && row.lng && (
          <div style={{ marginBottom:10 }}>
            <div style={S.label}>Coordinates (WGS84)</div>
            <div style={{ fontSize:12, color:"#334155", fontFamily:"monospace" }}>{Number(row.lat).toFixed(4)}°N, {Number(row.lng).toFixed(4)}°E</div>
          </div>
        )}
        {row.comments && (
          <div style={{ marginBottom:10 }}>
            <div style={S.label}>Comments</div>
            <div style={{ fontSize:12, color:"#334155", background:"#fffbeb", borderRadius:6, padding:"8px 10px", borderLeft:"3px solid #f59e0b" }}>{row.comments}</div>
          </div>
        )}

        <div style={{ display:"flex", gap:8, marginTop:16, paddingTop:16, borderTop:"1px solid #f1f5f9" }}>
          <button style={{ ...S.btn("ghost"), flex:1, justifyContent:"center" }} onClick={() => openEdit(row)}>✏️ Edit</button>
          <button style={{ ...S.btn("danger"), flex:1, justifyContent:"center" }} onClick={() => { if(confirm("Delete this stakeholder?")) deleteRow(row.id); }}>🗑 Delete</button>
        </div>
      </div>
    );
  };

  // ── TABLE VIEW ────────────────────────────────────────────────────────────
  const TableView = () => (
    <>
      <div style={S.toolbar}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:15 }}>🔍</span>
          <input style={S.search} placeholder="Search name, city, contact, area of interest…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={S.select} value={filterCountry} onChange={e=>setFilterCountry(e.target.value)}>
          {COUNTRIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <select style={S.select} value={filterPartner} onChange={e=>setFilterPartner(e.target.value)}>
          {PARTNERS.map(p=><option key={p}>{p}</option>)}
        </select>
        <select style={S.select} value={filterAudience} onChange={e=>setFilterAudience(e.target.value)}>
          {AUDIENCES.map(a=><option key={a}>{a}</option>)}
        </select>
        <select style={S.select} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select style={S.select} value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
          {["All categories","Manage closely","Keep satisfied","Consult with","Keep informed"].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, color:"#64748b" }}>
          Showing <strong style={{ color:"#0a3d62" }}>{filtered.length}</strong> of <strong style={{ color:"#0a3d62" }}>{data.length}</strong> stakeholders
        </span>
        <div style={{ display:"flex", gap:6 }}>
          <button style={S.btn("ghost")} onClick={exportCSV}>📥 Export CSV</button>
          <button style={S.btn("primary")} onClick={openNew}>➕ Add Stakeholder</button>
        </div>
      </div>

      <div style={{ overflowX:"auto", borderRadius:12, boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
        <table style={S.table}>
          <thead>
            <tr>
              {[
                { label:"#", field:"id", w:44 },
                { label:"Name", field:"name", w:260 },
                { label:"Country", field:"country", w:90 },
                { label:"City", field:"city", w:100 },
                { label:"Audience", field:"audience", w:160 },
                { label:"Area of Interest", field:"aoi", w:160 },
                { label:"Inf.", field:"influence", w:50 },
                { label:"Imp.", field:"impact", w:50 },
                { label:"Category", field:"_cat", w:130 },
                { label:"Partner", field:"partner", w:80 },
                { label:"Status", field:"status", w:80 },
                { label:"GDPR", field:"gdpr", w:70 },
              ].map(col => (
                <th key={col.field} style={{ ...S.th, width:col.w, minWidth:col.w }} onClick={() => col.field !== "_cat" && sortBy(col.field)}>
                  {col.label}{col.field !== "_cat" && <SortIcon field={col.field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={12} style={{ textAlign:"center", padding:40, color:"#94a3b8", fontSize:14 }}>No stakeholders match the current filters</td></tr>
            )}
            {filtered.map(row => {
              const cat = getCategory(row.influence, row.impact);
              const cc = CATEGORY_COLOR[cat];
              const sc = STATUS_COLOR[row.status] || STATUS_COLOR["Inactive"];
              const gc = GDPR_COLOR[row.gdpr] || GDPR_COLOR["PENDING"];
              const isSelected = selected?.id === row.id;
              return (
                <tr key={row.id} style={S.tr(isSelected)} onClick={() => setSelected(isSelected ? null : row)} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background=isSelected?"#eff6ff":"transparent"}>
                  <td style={S.td(isSelected)}><span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>{row.id}</span></td>
                  <td style={S.td(isSelected)}><span style={{ fontWeight:600, color:"#1a2332" }}>{row.name}</span></td>
                  <td style={S.td(isSelected)}><span style={{ fontSize:12 }}>{row.country}</span></td>
                  <td style={S.td(isSelected)}><span style={{ fontSize:12 }}>{row.city}</span></td>
                  <td style={S.td(isSelected)}><span style={{ fontSize:11, color:"#64748b" }}>{row.audience}</span></td>
                  <td style={S.td(isSelected)}><span style={{ fontSize:11, color:"#64748b" }}>{row.aoi}</span></td>
                  <td style={{ ...S.td(isSelected), textAlign:"center" }}><strong style={{ color:"#0a3d62" }}>{row.influence}</strong></td>
                  <td style={{ ...S.td(isSelected), textAlign:"center" }}><strong style={{ color:"#0a3d62" }}>{row.impact}</strong></td>
                  <td style={S.td(isSelected)}><span style={{ ...S.pill(cc.bg, cc.text), fontSize:10 }}>● {cat}</span></td>
                  <td style={S.td(isSelected)}><span style={{ fontSize:11 }}>{row.partner}</span></td>
                  <td style={S.td(isSelected)}><span style={{ ...S.pill(sc.bg, sc.text), fontSize:10 }}>{row.status}</span></td>
                  <td style={S.td(isSelected)}><span style={{ ...S.pill(gc.bg, gc.text), fontSize:10 }}>{row.gdpr}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <DetailPanel row={selected} />}
    </>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={S.logo}>
          <img src="/logo.png" alt="ANEMONE PLUS" style={{height:50, width:"auto"}} />
          <div>
            <div style={S.logoText}>ANEMONE PLUS</div>
            <div style={S.logoSub}>BSB00949 · Stakeholder Database · Output 1.1</div>
          </div>
        </div>
        <div style={S.nav}>
          {[
            { id:"table", label:"📋 Database" },
            { id:"stats",  label:"📊 Statistics" },
            { id:"form",   label:"➕ Add New" },
          ].map(b => (
            <button key={b.id} style={S.navBtn(view === b.id)} onClick={() => { if(b.id==="form") openNew(); else setView(b.id); }}>
              {b.label}
            </button>
          ))}
        </div>
        <div style={S.headerRight}>
          <span style={S.pill("#1a3a5c","rgba(255,255,255,0.7)")}>{data.length} stakeholders</span>
          <button style={{ ...S.btn("teal"), fontSize:12 }} onClick={exportCSV}>📥 CSV</button>
        </div>
      </header>

      <main style={S.body}>
        {view === "table" && <TableView />}
        {view === "stats" && <StatsView />}
        {view === "form"  && <FormView />}
      </main>

      {toast && (
        <div style={S.toast(toast.type)}>
          {toast.type === "error" ? "⚠️" : "✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}
