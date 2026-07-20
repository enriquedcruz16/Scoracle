export default function SPill({status, elapsed}) {
  if (["1H","2H","ET"].includes(status)) return <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#fff",background:"#ef4444",animation:"pulse 1.5s infinite"}}>🔴 {elapsed}'</span>;
  if (status === "HT") return <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#000",background:"#f59e0b"}}>HT</span>;
  if (status === "PEN") return <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#fff",background:"#1f2937"}}>PEN</span>;
  if (["FT","AET"].includes(status)) return <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#fff",background:"#1f2937"}}>FT</span>;
  return null;
}
