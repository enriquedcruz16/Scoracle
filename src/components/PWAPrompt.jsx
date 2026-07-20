import { useState, useEffect } from "react";

const G = "#f59e0b";

export default function PWAPrompt() {
  const [show, setShow] = useState(false);
  const [dp, setDp] = useState(null);
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      setDp(e);
      setTimeout(() => setShow(true), 4000);
    });
  }, []);
  if (!show) return null;
  return (
    <div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:500,background:"#0f0f0f",border:`1px solid ${G}44`,borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,zIndex:300,boxShadow:`0 4px 20px ${G}22`}}>
      <span style={{fontSize:20}}>⚽</span>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:13}}>Install Scoracle</div>
        <div style={{fontSize:11,color:"#6b7280"}}>Add to home screen</div>
      </div>
      <button onClick={async()=>{if(dp){await dp.prompt();setShow(false);}}} style={{background:`linear-gradient(90deg,${G},#f97316)`,border:"none",borderRadius:8,color:"#000",fontWeight:800,fontSize:13,padding:"8px 16px",cursor:"pointer",flexShrink:0}}>Install</button>
      <button onClick={()=>setShow(false)} style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:16,padding:"4px 8px",flexShrink:0}}>✕</button>
    </div>
  );
}
