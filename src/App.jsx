import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Lobby } from "./screens/Lobby";
import { CompetitionShell } from "./screens/CompetitionShell";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
@keyframes pp{0%,100%{opacity:0.14}50%{opacity:0.24}}
@keyframes sc{0%{transform:translateY(-100%)}100%{transform:translateY(2000%)}}
@keyframes ballFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-5px)}}
@keyframes glowP{0%,100%{opacity:0.25}50%{opacity:0.55}}
.pp{animation:pp 3s ease-in-out infinite}
.scanline{animation:sc 5s linear infinite}
.ballf{animation:ballFloat 3s ease-in-out infinite}
.glowp{animation:glowP 3s ease-in-out infinite}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000;-webkit-tap-highlight-color:transparent;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
input[type=number]{-moz-appearance:textfield;}
input,select,button,textarea{outline:none!important;} input:focus,select:focus{border-color:#1a1a1a!important;box-shadow:none!important;}
button:active{transform:scale(0.97);}
tr:hover td{background:#0c0c0c;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
@keyframes pitchPulse{0%,100%{opacity:0.13;}50%{opacity:0.22;}}
::-webkit-scrollbar{height:4px;width:4px;background:#0a0a0a;}
::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:#3a3a3a;}
::-webkit-scrollbar-track{background:#0a0a0a;}
*{scrollbar-width:thin;scrollbar-color:#2a2a2a #0a0a0a;}
@keyframes scanMove{0%{transform:translateY(-100px);}100%{transform:translateY(1000px);}}
.pitch-lines{animation:pitchPulse 3s ease-in-out infinite;}
.scan-line{animation:scanMove 5s linear infinite;}
.cp{animation:fall 1.4s ease-in forwards;}
@keyframes fall{0%{transform:translateY(0) rotate(0);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}
`;

function Auth({onLogin}){
  const[mode,setMode]=useState("login");const[name,setName]=useState("");const[email,setEmail]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[load,setLoad]=useState(false);
  const[resetSent,setResetSent]=useState(false);
  async function sendReset(){if(!email.includes("@")){setErr("Please enter your email address first.");return;}setErr("");setLoad(true);try{const{error:e}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:"https://scoracle.live"});if(e)throw e;setResetSent(true);}catch(e){setErr(e.message||"Could not send reset email.");}setLoad(false);}
  async function go(){if(mode==="signup"&&!name.trim()){setErr("Please enter your name.");return;}if(!email.includes("@")){setErr("Invalid email.");return;}if(pw.length<6){setErr("Password min 6 characters.");return;}setErr("");setLoad(true);try{if(mode==="signup"){const{data,error:e}=await supabase.auth.signUp({email,password:pw,options:{data:{name:name.trim()}}});if(e)throw e;if(data.user)onLogin({id:data.user.id,name:name.trim(),email});}else{const{data,error:e}=await supabase.auth.signInWithPassword({email,password:pw});if(e)throw e;const{data:pr}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();onLogin({id:data.user.id,name:pr?.name||email.split("@")[0],email});}}catch(e){setErr(e.message||"Something went wrong.");}setLoad(false);}
  return(
    <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0"/>
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.07"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g fill="none" stroke="#f59e0b" strokeWidth="1.4" className="pitch-lines">
          {/* Outer boundary */}
          <rect x="20" y="30" width="350" height="784"/>
          {/* Halfway line */}
          <line x1="20" y1="422" x2="370" y2="422"/>
          {/* Centre circle - single, correct position */}
          <circle cx="195" cy="422" r="70"/>
          <circle cx="195" cy="422" r="4" fill="#f59e0b"/>
          {/* Top penalty box */}
          <rect x="95" y="30" width="200" height="110"/>
          {/* Top six yard box */}
          <rect x="140" y="30" width="110" height="48"/>
          {/* Top penalty spot */}
          <circle cx="195" cy="110" r="3" fill="#f59e0b"/>
          {/* Top penalty arc */}
          <path d="M 148 140 A 70 70 0 0 1 242 140"/>
          {/* Bottom penalty box */}
          <rect x="95" y="704" width="200" height="110"/>
          {/* Bottom six yard box */}
          <rect x="140" y="766" width="110" height="48"/>
          {/* Bottom penalty spot */}
          <circle cx="195" cy="734" r="3" fill="#f59e0b"/>
          {/* Bottom penalty arc */}
          <path d="M 148 704 A 70 70 0 0 0 242 704"/>
          {/* Corner arcs */}
          <path d="M 20 50 A 20 20 0 0 1 40 30"/>
          <path d="M 350 30 A 20 20 0 0 1 370 50"/>
          <path d="M 20 794 A 20 20 0 0 0 40 814"/>
          <path d="M 350 814 A 20 20 0 0 0 370 794"/>
        </g>
        <rect className="scan-line" x="0" y="0" width="390" height="80" fill="url(#scanGrad)"/>
      </svg>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.82) 100%)"}}/>
      <div style={{position:"relative",zIndex:1,background:"rgba(8,8,8,0.93)",border:"1px solid #252525",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:400,textAlign:"center"}}>
        <div style={{marginBottom:12}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:10}}>
            <div style={{position:"absolute",inset:-12,background:"radial-gradient(circle,rgba(245,158,11,0.3) 0%,transparent 70%)",borderRadius:"50%"}}/>
            <span style={{fontSize:56,filter:"drop-shadow(0 0 16px rgba(245,158,11,0.6))",display:"block",lineHeight:1}}>⚽</span>
          </div>
          <div style={{fontSize:30,fontWeight:800,letterSpacing:5,color:"#f59e0b",marginBottom:4}}>SCORACLE</div>
          <div style={{fontSize:11,color:"#555",letterSpacing:1,marginBottom:16}}>FIFA World Cup 2026 · Prediction Game</div>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",background:"#111",borderRadius:12,padding:"10px 0",border:"1px solid #1f1f1f",marginBottom:18}}>
            {[["48","TEAMS"],["12","GROUPS"],["104","MATCHES"]].map(([n,l],i)=>(
              <div key={l} style={{display:"flex",alignItems:"center"}}>
                {i>0&&<div style={{width:1,height:28,background:"#222",margin:"0 4px"}}/>}
                <div style={{textAlign:"center",padding:"0 14px"}}><div style={{fontSize:19,fontWeight:800,color:"#f59e0b"}}>{n}</div><div style={{fontSize:9,color:"#555",letterSpacing:1}}>{l}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",background:"#111",borderRadius:12,padding:4,marginBottom:18,gap:4,border:"1px solid #1f1f1f"}}>
          <button onClick={()=>setMode("login")} style={{flex:1,background:mode==="login"?"#1a1a1a":"none",border:"none",color:mode==="login"?"#f59e0b":"#6b7280",padding:"10px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,outline:"none"}}>Sign In</button>
          <button onClick={()=>setMode("signup")} style={{flex:1,background:mode==="signup"?"#1a1a1a":"none",border:"none",color:mode==="signup"?"#f59e0b":"#6b7280",padding:"10px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,outline:"none"}}>Create Account</button>
        </div>
        {mode==="signup"&&<div style={{marginBottom:14,textAlign:"left"}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Your Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John Smith" style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/></div>}
        <div style={{marginBottom:14,textAlign:"left"}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Email Address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        <div style={{marginBottom:14,textAlign:"left"}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        {err&&<div style={{fontSize:12,color:"#ef4444",marginBottom:12,padding:"10px 12px",background:"#1f0000",borderRadius:8,border:"1px solid #ef444433"}}>{err}</div>}
        <button onClick={go} disabled={load} style={{width:"100%",background:"linear-gradient(90deg,#f59e0b,#f97316)",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,padding:"14px",cursor:"pointer",marginTop:4,opacity:load?0.6:1,outline:"none"}}>{load?"Please wait...":(mode==="login"?"Sign In to Scoracle →":"Join Scoracle →")}</button>
        {mode==="login"&&!resetSent&&(<button onClick={sendReset} disabled={load} style={{width:"100%",background:"none",border:"none",color:"#6b7280",fontSize:12,fontWeight:600,padding:"10px",cursor:"pointer",marginTop:4,outline:"none"}}>Forgot password?</button>)}
        {mode==="login"&&resetSent&&(<div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:10,padding:"12px 14px",marginTop:8,textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:"#22c55e",marginBottom:4}}>Reset email sent!</div><div style={{fontSize:11,color:"#6b7280"}}>Check your inbox and click the link to set a new password.</div></div>)}
        <div style={{fontSize:10,color:"#333",textAlign:"center",marginTop:14}}>🔒 Predictions Saved · Live Leaderboard</div>
        <div style={{fontSize:11,color:"#f59e0b",textAlign:"center",marginTop:6,fontWeight:600}}>⚽ Competition starts June 11, 2026</div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoad, setAuthLoad] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [resetMode, setResetMode] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [newPwErr, setNewPwErr] = useState("");
  const [newPwDone, setNewPwDone] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) { setResetMode(true); setAuthLoad(false); return; }
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s?.user) {
        const { data: pr } = await supabase.from("profiles").select("*").eq("id", s.user.id).single();
        setUser({ id: s.user.id, name: pr?.name || s.user.email.split("@")[0], email: s.user.email });
      }
      setAuthLoad(false);
    });
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") { setResetMode(true); }
    });
  }, []);

  async function handleNewPassword() {
    if (newPw.length < 6) { setNewPwErr("Password must be at least 6 characters."); return; }
    setNewPwErr("");
    const { error: e } = await supabase.auth.updateUser({ password: newPw });
    if (e) { setNewPwErr(e.message || "Could not update password."); return; }
    setNewPwDone(true);
    setTimeout(function () { setResetMode(false); window.location.hash = ""; }, 2000);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedCompetition(null);
  }

  if (authLoad) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{CSS}</style>
      <span style={{ fontSize: 48, filter: "drop-shadow(0 0 12px #f59e0b88)" }}>⚽</span>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 4, color: "#f59e0b" }}>SCORACLE</div>
      <div style={{ fontSize: 12, color: "#374151" }}>Loading...</div>
    </div>
  );

  if (resetMode) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b", letterSpacing: 2, marginBottom: 4 }}>SCORACLE</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Set a new password</div>
        </div>
        {newPwDone
          ? <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>Password updated!</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Taking you back to the app...</div>
            </div>
          : <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase" }}>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" style={{ width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 10, color: "#f9fafb", fontSize: 15, padding: "12px 14px", outline: "none", boxSizing: "border-box", marginBottom: 14 }}/>
              {newPwErr && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{newPwErr}</div>}
              <button onClick={handleNewPassword} style={{ width: "100%", background: "linear-gradient(90deg,#f59e0b,#f97316)", border: "none", borderRadius: 12, color: "#000", fontWeight: 800, fontSize: 15, padding: "14px", cursor: "pointer", outline: "none" }}>Update Password</button>
            </div>
        }
      </div>
    </div>
  );

  if (!user) return (
    <>
      <style>{CSS}</style>
      <Auth onLogin={setUser}/>
    </>
  );

  if (!selectedCompetition) return (
    <>
      <style>{CSS}</style>
      <Lobby user={user} onSelect={setSelectedCompetition} onSignOut={signOut}/>
    </>
  );

  return (
    <CompetitionShell
      competitionId={selectedCompetition}
      user={user}
      onBack={() => setSelectedCompetition(null)}
    />
  );
}
