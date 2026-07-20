export default function Confetti() {
  const cols = ["#f59e0b","#22c55e","#3b82f6","#ef4444","#a855f7","#fff","#06b6d4"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {Array.from({length:22},(_,i)=>(
        <div key={i} className="cp" style={{position:"absolute",top:-10,borderRadius:2,left:`${Math.random()*100}%`,width:`${5+Math.random()*7}px`,height:`${5+Math.random()*7}px`,background:cols[i%cols.length],animationDelay:`${Math.random()*0.5}s`}}/>
      ))}
    </div>
  );
}
