import React, { useState, useMemo, useEffect, useCallback } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbwR2zrhnt3KQVlWvMit34ffcIUKJveUW2qty6jXkXc3k3rn9bC8oBPaht_lBR_hMh5qMA/exec";

const WRITE_PIN = "2025";

async function apiGet() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Load failed: "+res.status);
  return (await res.json()).data || [];
}

async function apiPost(body) {
  const res = await fetch(API_URL, { method:"POST", headers:{"Content-Type":"text/plain"}, body:JSON.stringify(body) });
  if (!res.ok) throw new Error("Save failed: "+res.status);
  return res.json();
}


// ── Seed data from UkrSCES template ────────────────────────────────────────

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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    apiGet()
      .then(rows => { setData(rows); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);
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
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [nextId, setNextId] = useState(1);

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
    const byAOI = {};
    data.forEach(r => {
      byAOI[r.aoi] = (byAOI[r.aoi] || 0) + 1;
      byCountry[r.country] = (byCountry[r.country] || 0) + 1;
      byAudience[r.audience] = (byAudience[r.audience] || 0) + 1;
      const cat = getCategory(r.influence, r.impact);
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });
    const topAudience = Object.entries(byAudience).sort((a,b)=>b[1]-a[1])[0]?.[0] || "";
    const topAOI = Object.entries(byAOI||{}).sort((a,b)=>b[1]-a[1])[0]?.[0] || "";
    return { total, byCountry, byAudience, byCategory, byStatus, topAudience, topAOI };
  }, [data]);

  function requirePin(action) {
    if (pinUnlocked) { action(); return; }
    setPendingAction(() => action);
    setShowPinModal(true);
    setPinInput(""); setPinError(false);
  }
  function submitPin() {
    if (pinInput === WRITE_PIN) {
      setPinUnlocked(true); setShowPinModal(false);
      if (pendingAction) { pendingAction(); setPendingAction(null); }
    } else { setPinError(true); setPinInput(""); }
  }
  function openNew() { requirePin(() => { setEditing(null); setForm({ ...EMPTY }); setView("form"); }); }

  function openEdit(row) { requirePin(() => { setEditing(row.id); setForm({ ...row }); setView("form"); setSelected(null); }); }

  async function saveForm() {
    if (!form.name || !form.country) { showToast("Name and Country are required", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        const result = await apiPost({ action:"update", record:{ ...form, id:editing } });
        if (!result.success) throw new Error(result.error||"Update failed");
        setData(d => d.map(r => r.id===editing ? { ...form, id:editing } : r));
        showToast("Stakeholder updated ✓");
      } else {
        const result = await apiPost({ action:"add", record:form });
        if (!result.success) throw new Error(result.error||"Add failed");
        setData(d => [...d, { ...form, id:result.id }]);
        showToast("Stakeholder added ✓");
      }
      setView("table");
    } catch(e) { showToast("Error: "+e.message, "error"); }
    finally { setSaving(false); }
  }

  async function deleteRow(id) {
    if (!confirm("Delete this stakeholder?")) return;
    setSaving(true);
    try {
      const result = await apiPost({ action:"delete", id });
      if (!result.success) throw new Error(result.error||"Delete failed");
      setData(d => d.filter(r => r.id!==id));
      setSelected(null); showToast("Stakeholder removed");
    } catch(e) { showToast("Error: "+e.message, "error"); }
    finally { setSaving(false); }
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
    const a = document.createElement("a"); a.href = url; a.download = "ANEMONE_PLUS_Stakeholder_Database.csv"; document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
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

  // ── MAP VIEW ──────────────────────────────────────────────────────────────
  const PinModal = () => (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setShowPinModal(false)}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:320, textAlign:"center" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:32, marginBottom:8 }}>🔒</div>
        <div style={{ fontWeight:800, fontSize:16, color:"#0a3d62", marginBottom:4 }}>Enter PIN to edit</div>
        <div style={{ fontSize:12, color:"#64748b", marginBottom:20 }}>Contact the project coordinator for the PIN</div>
        <input type="password" maxLength={4} value={pinInput} onChange={e => { setPinInput(e.target.value); setPinError(false); }} onKeyDown={e => e.key === "Enter" && submitPin()} placeholder="••••" autoFocus
          style={{ width:"100%", padding:"9px 12px", borderRadius:8, border: pinError ? "1.5px solid #ef4444" : "1.5px solid #cbd5e1", fontSize:24, textAlign:"center", letterSpacing:8, outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
        {pinError && <div style={{ fontSize:12, color:"#ef4444", marginBottom:8 }}>Incorrect PIN</div>}
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <button style={{ flex:1, padding:"8px 16px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontSize:13, fontWeight:600 }} onClick={() => setShowPinModal(false)}>Cancel</button>
          <button style={{ flex:1, padding:"8px 16px", borderRadius:8, border:"none", background:"#0a3d62", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }} onClick={submitPin}>Unlock</button>
        </div>
      </div>
    </div>
  );

  const MapView = () => {
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);

    React.useEffect(() => {
      // Load Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      // Load Leaflet JS
      const loadMap = () => {
        if (mapInstanceRef.current) return;
        const L = window.L;
        if (!L) return;
        const map = L.map(mapRef.current, { center:[43, 33], zoom:5 });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:"© OpenStreetMap contributors"
        }).addTo(map);
        const colors = { "Manage closely":"#ef4444", "Keep satisfied":"#f59e0b", "Consult with":"#3b82f6", "Keep informed":"#22c55e" };
        data.forEach(r => {
          if (!r.lat || !r.lng) return;
          const cat = getCategory(r.influence, r.impact);
          const color = colors[cat] || "#64748b";
          const marker = L.circleMarker([Number(r.lat), Number(r.lng)], {
            radius:7, fillColor:color, color:"#fff", weight:1.5, fillOpacity:0.85
          }).addTo(map);
          marker.bindPopup("<strong>" + r.name + "</strong><br/>" + r.city + ", " + r.country + "<br/><em>" + cat + "</em>");
        });
        mapInstanceRef.current = map;
      };
      if (window.L) { loadMap(); }
      else {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = loadMap;
        document.head.appendChild(script);
      }
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    return (
      <div>
        <div style={{ marginBottom:12, display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#64748b" }}>Showing <strong>{data.filter(r=>r.lat&&r.lng).length}</strong> stakeholders with coordinates</span>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["#ef4444","Manage closely"],["#f59e0b","Keep satisfied"],["#3b82f6","Consult with"],["#22c55e","Keep informed"]].map(([color,label])=>(
              <div key={label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#64748b" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:color }}/>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div ref={mapRef} style={{ height:"calc(100vh - 180px)", borderRadius:12, boxShadow:"0 1px 6px rgba(0,0,0,0.08)", minHeight:400 }}/>
      </div>
    );
  };


  const StatsView = () => {
    const gdprYes     = data.filter(r => r.gdpr === "YES").length;
    const gdprPending = data.filter(r => r.gdpr === "PENDING").length;
    const gdprNo      = data.filter(r => r.gdpr === "NO").length;
    const byPartner   = {};
    data.forEach(r => { if (r.partner) byPartner[r.partner] = (byPartner[r.partner] || 0) + 1; });
    const kpis = [
      { label:"Total Stakeholders", val:stats.total,                           icon:"👥", color:"#0a3d62", accent:"#0a3d62", sub:"across all countries" },
      { label:"Manage Closely",     val:stats.byCategory["Manage closely"]||0, icon:"🎯", color:"#dc2626", accent:"#dc2626", sub:"high influence & impact" },
      { label:"Countries",          val:Object.keys(stats.byCountry).length,   icon:"🌍", color:"#0e7490", accent:"#0e7490", sub:"Black Sea region" },
      { label:"Top Audience",        val:stats.topAudience,                     icon:"🏛️", color:"#7c3aed", accent:"#7c3aed", sub:"most represented" },
      { label:"Top Area of Interest",val:stats.topAOI,                          icon:"🌊", color:"#0891b2", accent:"#0891b2", sub:"most common focus" },
    ];
    const BarRow = ({ label, val, total, color }) => {
      const pct = total > 0 ? Math.round(val / total * 100) : 0;
      return (
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
            <span style={{ fontSize:12, fontWeight:600, color:"#334155", flex:1, paddingRight:8 }}>{label}</span>
            <span style={{ fontSize:12, color:"#64748b", fontWeight:700, whiteSpace:"nowrap" }}>
              {val} <span style={{ fontWeight:400 }}>({pct}%)</span>
            </span>
          </div>
          <div style={{ background:"#f1f5f9", borderRadius:999, overflow:"hidden", height:10 }}>
            <div style={{ height:10, borderRadius:999, background:color, width:pct+"%", transition:"width 0.6s ease", minWidth: pct > 0 ? 4 : 0 }} />
          </div>
        </div>
      );
    };
    const matrixOrder = ["Keep satisfied","Manage closely","Keep informed","Consult with"];
    return (
      <div>

        {/* KPI row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:20 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background:"#fff", borderRadius:12, padding:"16px 18px", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", borderLeft:"4px solid "+k.accent }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{k.icon}</div>
              <div style={{ fontSize:32, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#1a2332", marginTop:4 }}>{k.label}</div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Category + Status */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

          <div style={S.card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>🎯 By Engagement Category</div>
            {Object.entries(stats.byCategory).map(([cat,n]) => (
              <BarRow key={cat} label={cat} val={n} total={stats.total} color={CATEGORY_COLOR[cat].dot} />
            ))}
            <div style={{ marginTop:16, padding:"12px 14px", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Power / Interest Matrix</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {matrixOrder.map(cat => {
                  const n = stats.byCategory[cat] || 0;
                  const c = CATEGORY_COLOR[cat];
                  return (
                    <div key={cat} style={{ background:c.bg, borderRadius:8, padding:"10px 12px", border:"1px solid "+c.dot+"40" }}>
                      <div style={{ fontSize:22, fontWeight:800, color:c.text, lineHeight:1 }}>{n}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:c.text, marginTop:3, opacity:0.85 }}>{cat}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:10, color:"#94a3b8", borderTop:"1px solid #e2e8f0", paddingTop:6 }}>
                <span>← Low Influence</span><span>High Influence →</span>
              </div>
            </div>
          </div>
          <div style={S.card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>📊 Influence / Impact Scatter</div>
            <svg viewBox="0 0 300 260" style={{ width:"100%", height:"auto" }}>
              <line x1="40" y1="10" x2="40" y2="220" stroke="#e2e8f0" strokeWidth="1"/>
              <line x1="40" y1="220" x2="290" y2="220" stroke="#e2e8f0" strokeWidth="1"/>
              <line x1="165" y1="10" x2="165" y2="220" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4"/>
              <line x1="40" y1="115" x2="290" y2="115" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4"/>
              <text x="55" y="25" fontSize="7" fill="#94a3b8">Keep satisfied</text>
              <text x="175" y="25" fontSize="7" fill="#ef4444" fontWeight="bold">Manage closely</text>
              <text x="55" y="130" fontSize="7" fill="#22c55e">Keep informed</text>
              <text x="175" y="130" fontSize="7" fill="#3b82f6">Consult with</text>
              <text x="155" y="245" fontSize="8" fill="#64748b" textAnchor="middle">Influence</text>
              {data.map((r,i) => {
                const x = 40 + (Number(r.influence) / 10) * 250;
                const y = 220 - (Number(r.impact) / 10) * 210;
                const cat = getCategory(r.influence, r.impact);
                const color = CATEGORY_COLOR[cat].dot;
                return <circle key={i} cx={x} cy={y} r="4" fill={color} fillOpacity="0.7"/>;
              })}
            </svg>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:8 }}>
              {Object.entries(CATEGORY_COLOR).map(([cat,c]) => (
                <div key={cat} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"#64748b" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:c.dot }}/>
                  {cat}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Country + Partner */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <div style={S.card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>🌍 By Country</div>
            {Object.entries(stats.byCountry).sort((a,b)=>b[1]-a[1]).map(([c,n]) => (
              <BarRow key={c} label={c} val={n} total={stats.total} color="#0a3d62" />
            ))}
          </div>
          <div style={S.card}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>🤝 By Partner Organisation</div>
            {Object.entries(byPartner).sort((a,b)=>b[1]-a[1]).map(([p,n]) => (
              <BarRow key={p} label={p} val={n} total={stats.total} color="#0e7490" />
            ))}
          </div>
        </div>

        {/* Stakeholder Type full width */}
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#0a3d62" }}>🏛️ By Stakeholder Type</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
            {Object.entries(stats.byAudience).sort((a,b)=>b[1]-a[1]).map(([a,n]) => (
              <BarRow key={a} label={a} val={n} total={stats.total} color="#7c3aed" />
            ))}
          </div>
        </div>

      </div>
    );
  };
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
                  {f.opts.map(o => <option key={o} value={o}>{o === "Turkey" ? "Türkiye" : o}</option>)}
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
          {COUNTRIES.map(c=><option key={c} value={c}>{c === "Turkey" ? "Türkiye" : c}</option>)}
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
  if (loading) return (
    <div style={{ fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif", background:"#f0f4f8", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <img src="/anemoneplus-db/logo.png" alt="ANEMONE PLUS" style={{ height:80, width:"auto", opacity:0.8 }}/>
      <div style={{ width:40, height:40, border:"4px solid #0a3d62", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ color:"#0a3d62", fontWeight:600, fontSize:14 }}>Loading stakeholder database…</div>
    </div>
  );

  return (
    <div style={S.app}>
      {showPinModal && <PinModal />}
      <header style={S.header}>
        <div style={S.logo}>
          <img src="/anemoneplus-db/logo.png" alt="ANEMONE PLUS" style={{height:50, width:"auto"}} />
          <div>
            <div style={S.logoText}>ANEMONE PLUS</div>
            <div style={S.logoSub}>BSB00949 · Stakeholder Database · Output 1.1</div>
          </div>
        </div>
        <div style={S.nav}>
          {[
            { id:"table", label:"📋 Database" },
            { id:"stats",  label:"📊 Statistics" },
            { id:"map",    label:"🗺️ Map" },
            { id:"form",   label:"➕ Add New" },
          ].map(b => (
            <button key={b.id} style={S.navBtn(view === b.id)} onClick={() => { if(b.id==="form") openNew(); else setView(b.id); }}>
              {b.label}
            </button>
          ))}
        </div>
        <div style={S.headerRight}>
          <span style={S.pill("#1a3a5c","rgba(255,255,255,0.7)")}>{data.length} stakeholders</span>
<button style={{...S.btn("teal"),fontSize:12}} onClick={exportCSV}>📥 CSV</button>
        </div>
      </header>

      <main style={S.body}>
        {view === "table" && <TableView />}
        {view === "stats" && <StatsView />}
        {view === "map"   && <MapView />}
        {view === "form"  && <FormView key="stable-form" />}
      </main>

      {toast && (
        <div style={S.toast(toast.type)}>
          {toast.type === "error" ? "⚠️" : "✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}
