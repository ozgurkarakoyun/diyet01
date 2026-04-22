import { useState, useEffect } from 'react';
import { api } from './api.js';

const STAGES = [
  { id:1, name:'1. Etap', days:4,  color:'#06B6D4' },
  { id:2, name:'2. Etap', days:5,  color:'#8B5CF6' },
  { id:3, name:'3. Etap', days:5,  color:'#10B981' },
  { id:4, name:'4. Etap', days:7,  color:'#F59E0B' },
];

const COLORS = {
  bg: '#0F172A', card: '#1E293B', accent: '#0EA5E9', success: '#10B981',
  warn: '#F59E0B', danger: '#EF4444', text: '#F1F5F9', textMuted: '#94A3B8',
};

const MFIELDS = [
  {key:'boyun', label:'Boyun'},
  {key:'ust_gogus', label:'Üst Göğüs'},
  {key:'gogus', label:'Göğüs'},
  {key:'alt_gogus', label:'Alt Göğüs'},
  {key:'kol', label:'Kol'},
  {key:'bel', label:'Bel'},
  {key:'gobek', label:'Göbek'},
  {key:'kalca', label:'Kalça'},
  {key:'bacak', label:'Bacak'},
];

const Toast = ({ msg, ok }) => msg ? <div style={{position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:ok?'#10B981':'#EF4444',color:'#fff',padding:'12px 20px',borderRadius:10,fontWeight:600,fontSize:14,zIndex:9999}}>{msg}</div> : null;

function useToast() {
  const [t, setT] = useState(null);
  const show = (msg, ok=true) => { setT({msg,ok}); setTimeout(()=>setT(null), 3500); };
  return [t, show];
}

function AdminDash({ onLogout }) {
  const [tab, setTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, show] = useToast();

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const result = await api.getPatients();
      setPatients(result || []);
    } catch(e) { show(e.message, false); }
    setLoading(false);
  };

  const loadPatientDetail = async (patientId) => {
    try {
      const data = await api.getPatient(patientId);
      setPatientData(data);
    } catch(e) { show(e.message, false); }
  };

  useEffect(() => {
    if (selectedPatient?.id) {
      loadPatientDetail(selectedPatient.id);
    }
  }, [selectedPatient]);

  const sendMessage = async () => {
    if (!message.trim()) {
      show('Mesaj yazınız', false);
      return;
    }
    if (!selectedPatient) {
      show('Hasta seçiniz', false);
      return;
    }
    try {
      await api.sendMessage(selectedPatient.id, message);
      show('✓ Mesaj gönderildi!');
      setMessage('');
    } catch(e) {
      show('Hata: ' + e.message, false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:COLORS.bg}}>
      <div style={{background:'linear-gradient(135deg,#0EA5E9,#06B6D4)',padding:'24px 18px 40px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <h2 style={{color:'#fff',fontSize:22,fontWeight:700}}>Admin Sistemi</h2>
          </div>
          <button onClick={onLogout} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',padding:'10px 18px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:14}}>Çıkış</button>
        </div>
      </div>

      <div style={{padding:'16px'}}>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[{id:'patients',l:'👥 Hastalar'},{id:'messages',l:'📧 Mesaj'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 16px',border:'none',borderRadius:10,cursor:'pointer',fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:13,background:tab===t.id?'linear-gradient(135deg,#0EA5E9,#06B6D4)':'#1E293B',color:'#fff',flex:1}}>
              {t.l}
            </button>
          ))}
        </div>

        <Toast {...(toast||{msg:''})} />

        {loading && <div style={{textAlign:'center',padding:40,color:COLORS.textMuted}}>Yükleniyor...</div>}

        {!loading && tab==='patients' && (
          <div>
            {patients.length===0 ? (
              <div style={{background:COLORS.card,borderRadius:14,padding:32,textAlign:'center'}}>
                <p style={{color:COLORS.textMuted}}>Henüz hasta kaydı yok</p>
              </div>
            ) : (
              patients.map(u=>(
                <div key={u.id} style={{background:COLORS.card,borderRadius:14,padding:16,marginBottom:12,cursor:'pointer',border:`2px solid ${selectedPatient?.id===u.id?COLORS.accent:'#334155'}`}} onClick={()=>setSelectedPatient(u)}>
                  <h4 style={{fontWeight:700,color:COLORS.accent,fontSize:15}}>{u.name}</h4>
                  <p style={{color:COLORS.textMuted,fontSize:11}}>{u.email}</p>
                  <p style={{color:COLORS.text,fontSize:12,marginTop:8}}>Etap: {u.stage} | Kilo: {u.weight}kg</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab==='messages' && (
          <div>
            {selectedPatient ? (
              <div style={{background:COLORS.card,borderRadius:14,padding:16}}>
                <h3 style={{color:COLORS.accent,marginBottom:14}}>📧 {selectedPatient.name}</h3>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Hastaya mesaj yazınız..." style={{width:'100%',padding:'12px',border:`1px solid #334155`,borderRadius:10,fontSize:14,background:'#0F172A',color:COLORS.text,minHeight:100,fontFamily:"'Inter',sans-serif",marginBottom:12}}/>
                <button onClick={sendMessage} style={{width:'100%',padding:'10px',background:'linear-gradient(135deg,#0EA5E9,#06B6D4)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer'}}>
                  📤 Gönder
                </button>
              </div>
            ) : (
              <div style={{background:COLORS.card,borderRadius:14,padding:28,textAlign:'center'}}>
                <p style={{color:COLORS.textMuted,fontSize:14}}>Mesaj gönderecek hastayı seçin</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientDash({ user, onLogout }) {
  const [tab, setTab] = useState('home');
  const [measures, setMeasures] = useState([]);
  const [meals, setMeals] = useState([]);
  const [measureVals, setMeasureVals] = useState({});
  const [kilo, setKilo] = useState('');
  const [mealText, setMealText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, show] = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [m, ml] = await Promise.all([api.getMeasurements(), api.getMeals()]);
      setMeasures(m || []);
      setMeals(ml || []);
    } catch(e) { show(e.message, false); }
  };

  const saveMeasure = async () => {
    if (!kilo && !Object.values(measureVals).some(v=>v)) {
      show('En az bir değer giriniz', false);
      return;
    }
    setLoading(true);
    try {
      await api.addMeasurement({ kilo: kilo?+kilo:undefined, ...measureVals });
      show('✓ Ölçümler kaydedildi!');
      setKilo('');
      setMeasureVals({});
      loadData();
    } catch(e) { show('Hata: ' + e.message, false); }
    setLoading(false);
  };

  const saveMeal = async () => {
    if (!mealText) {
      show('Öğün açıklaması giriniz', false);
      return;
    }
    setLoading(true);
    try {
      await api.addMeal(mealText);
      show('✓ Öğün kaydedildi!');
      setMealText('');
      loadData();
    } catch(e) { show('Hata: ' + e.message, false); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:COLORS.bg}}>
      <div style={{background:'linear-gradient(135deg,#0EA5E9,#06B6D4)',padding:'22px 18px 60px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div>
            <h2 style={{color:'#fff',fontSize:20,fontWeight:700}}>{user.name}</h2>
          </div>
          <button onClick={onLogout} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',width:44,height:44,borderRadius:'50%',cursor:'pointer',fontSize:18}}>🚪</button>
        </div>
      </div>

      <div style={{padding:'14px',paddingBottom:90}}>
        <Toast {...(toast||{msg:''})} />

        {tab==='home' && (
          <div>
            <div style={{background:COLORS.card,borderRadius:14,padding:16}}>
              <h3 style={{color:COLORS.accent,marginBottom:14}}>📋 Etap Bilgisi</h3>
              {STAGES.map(s=>(
                <div key={s.id} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13,fontWeight:600}}>
                    <span style={{color:user.stage>=s.id?s.color:COLORS.textMuted}}>{s.name}</span>
                    <span style={{color:COLORS.textMuted}}>{s.days} gün</span>
                  </div>
                  <div style={{height:6,background:'#334155',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:user.stage>=s.id?'100%':'0%',background:s.color}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='measure' && (
          <div>
            <div style={{background:COLORS.card,borderRadius:14,padding:16}}>
              <h3 style={{color:COLORS.accent,marginBottom:12}}>📏 Ölçüm Gir</h3>
              <input type="number" value={kilo} onChange={e=>setKilo(e.target.value)} placeholder="Kilo (kg)" style={{width:'100%',padding:'10px',marginBottom:12,borderRadius:8,border:`1px solid #334155`,background:'#0F172A',color:'#fff'}}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                {MFIELDS.map(f=>(
                  <input key={f.key} type="number" value={measureVals[f.key]||''} onChange={e=>setMeasureVals(p=>({...p,[f.key]:e.target.value}))} placeholder={f.label} style={{padding:'10px',borderRadius:8,border:`1px solid #334155`,background:'#0F172A',color:'#fff'}}/>
                ))}
              </div>
              <button onClick={saveMeasure} disabled={loading} style={{width:'100%',padding:'10px',background:'linear-gradient(135deg,#0EA5E9,#06B6D4)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer'}}>
                💾 Kaydet
              </button>
            </div>
            {measures.length>0 && (
              <div style={{background:COLORS.card,borderRadius:14,padding:16,marginTop:12}}>
                <h3 style={{color:COLORS.accent,marginBottom:12}}>📊 Son Ölçümler</h3>
                {measures.slice(0,3).map((m,i)=>(
                  <div key={m.id} style={{background:'#0F172A',borderRadius:8,padding:10,marginBottom:8}}>
                    <p style={{fontSize:11,color:COLORS.textMuted}}>Tarih: {new Date(m.recorded_at).toLocaleDateString('tr-TR')}</p>
                    {m.kilo && <p style={{fontSize:12,color:COLORS.accent}}>Kilo: {m.kilo}kg</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='log' && (
          <div>
            <div style={{background:COLORS.card,borderRadius:14,padding:16}}>
              <h3 style={{color:COLORS.accent,marginBottom:12}}>🍽️ Öğün Kaydet</h3>
              <textarea value={mealText} onChange={e=>setMealText(e.target.value)} placeholder="Ne yediniz?" style={{width:'100%',padding:'12px',border:`1px solid #334155`,borderRadius:10,fontSize:14,background:'#0F172A',color:COLORS.text,minHeight:80,fontFamily:"'Inter',sans-serif",marginBottom:12}}/>
              <button onClick={saveMeal} disabled={loading} style={{width:'100%',padding:'10px',background:'linear-gradient(135deg,#0EA5E9,#06B6D4)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer'}}>
                📤 Kaydet
              </button>
            </div>
            {meals.length>0 && (
              <div style={{background:COLORS.card,borderRadius:14,padding:16,marginTop:12}}>
                <h3 style={{color:COLORS.accent,marginBottom:12}}>📋 Son Öğünler</h3>
                {meals.slice(0,10).map(l=>(
                  <div key={l.id} style={{background:'#0F172A',borderRadius:8,padding:10,marginBottom:8}}>
                    <p style={{fontSize:12,color:COLORS.accent}}>{l.meal}</p>
                    <p style={{fontSize:10,color:COLORS.textMuted}}>{new Date(l.logged_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:COLORS.card,borderTop:`1px solid #334155`,display:'flex',zIndex:100}}>
        {[{id:'home',l:'Ana',i:'🏠'},{id:'measure',l:'Ölçüm',i:'📏'},{id:'log',l:'Günlük',i:'📋'}].map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,border:'none',background:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 0',color:tab===n.id?COLORS.accent:COLORS.textMuted}}>
            <span style={{fontSize:20}}>{n.i}</span>
            <span style={{fontSize:10,fontWeight:600}}>{n.l}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('token', res.token);
      api.setToken(res.token);
      onLogin(res.user);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0F172A,#1E293B)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:10}}>🥗</div>
          <h1 style={{fontSize:28,color:COLORS.accent,marginBottom:4,fontWeight:700}}>Diyet Takip Sistemi</h1>
        </div>

        <div style={{background:COLORS.card,borderRadius:14,padding:24}}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%', padding:'11px 14px', border:`1px solid #334155`, borderRadius:10, fontSize:16, background:'#0F172A', color:COLORS.text, marginBottom:16}}/>
          <input type="password" placeholder="Şifre" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%', padding:'11px 14px', border:`1px solid #334155`, borderRadius:10, fontSize:16, background:'#0F172A', color:COLORS.text, marginBottom:16}}/>

          {error && <p style={{color:COLORS.danger,fontSize:13,marginBottom:12,background:'#EF444430',padding:'10px 12px',borderRadius:8}}>{error}</p>}

          <button onClick={submit} disabled={loading} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#0EA5E9,#06B6D4)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:14,cursor:'pointer'}}>
            {loading ? 'Lütfen bekleyin...' : 'Giriş Yap'}
          </button>

          <p style={{color:COLORS.textMuted,marginTop:14,fontSize:12,textAlign:'center'}}>
            Demo: admin@diyet.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (!token) { setChecking(false); return; }
    api.setToken(token);
    api.getMe().then(u=>{ setUser(u); setChecking(false); }).catch(()=>{ localStorage.removeItem('token'); setChecking(false); });
  },[]);

  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  if (checking) return (
    <div style={{minHeight:'100vh',background:COLORS.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <div style={{fontSize:48}}>🥗</div>
      <p style={{color:COLORS.textMuted,fontSize:14}}>Yükleniyor...</p>
    </div>
  );

  if (!user) return <Login onLogin={setUser}/>;
  if (user.role==='admin') return <AdminDash onLogout={logout}/>;
  return <PatientDash user={user} onLogout={logout}/>;
}
