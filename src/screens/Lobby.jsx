import { COMPETITIONS_LIST } from "../constants/competitions";

const STATUS_LABEL = { active: "Live Now", upcoming: "Coming Soon", ended: "Ended" };
const STATUS_COLOR = { active: "#22c55e", upcoming: "#f59e0b", ended: "#6b7280" };

export function Lobby({ user, onSelect, onSignOut }) {
  return (
    <div style={{minHeight: "100vh", background: "#000", color: "#f9fafb", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "0 0 40px"}}>
      <header style={{background: "#000", borderBottom: "1px solid #141414", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100}}>
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <span style={{fontSize: 24}}>⚽</span>
          <div>
            <div style={{fontSize: 16, fontWeight: 800, letterSpacing: 3, color: "#f59e0b"}}>SCORACLE</div>
            <div style={{fontSize: 9, color: "#374151", letterSpacing: 0.5}}>Pick your competition</div>
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <span style={{fontSize: 13, color: "#6b7280"}}>{user.name}</span>
          <button onClick={onSignOut} style={{background: "none", border: "1px solid #1f1f1f", color: "#6b7280", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600}}>Sign Out</button>
        </div>
      </header>

      <main style={{maxWidth: 560, margin: "0 auto", padding: "32px 20px"}}>
        <div style={{textAlign: "center", marginBottom: 32}}>
          <div style={{fontSize: 24, fontWeight: 800, marginBottom: 8}}>Choose a Competition</div>
          <div style={{fontSize: 13, color: "#6b7280"}}>Select which competition you want to predict</div>
        </div>

        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          {COMPETITIONS_LIST.map(comp => (
            <button
              key={comp.id}
              onClick={() => comp.status !== "ended" && onSelect(comp.id)}
              disabled={comp.status === "ended"}
              style={{
                background: "#080808",
                border: `1px solid ${comp.accentColor}33`,
                borderRadius: 20,
                padding: 20,
                cursor: comp.status === "ended" ? "not-allowed" : "pointer",
                textAlign: "left",
                opacity: comp.status === "ended" ? 0.5 : 1,
                transition: "border-color 0.2s, box-shadow 0.2s",
                width: "100%",
              }}
            >
              <div style={{display: "flex", alignItems: "flex-start", gap: 16}}>
                <div style={{fontSize: 44, lineHeight: 1, flexShrink: 0, filter: `drop-shadow(0 0 10px ${comp.accentColor}55)`}}>
                  {comp.emoji}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap"}}>
                    <div style={{fontSize: 17, fontWeight: 800, color: "#f9fafb"}}>{comp.name}</div>
                    <span style={{fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${STATUS_COLOR[comp.status]}22`, color: STATUS_COLOR[comp.status], border: `1px solid ${STATUS_COLOR[comp.status]}44`, flexShrink: 0}}>
                      {STATUS_LABEL[comp.status]}
                    </span>
                  </div>
                  <div style={{fontSize: 12, color: "#6b7280", marginBottom: 12}}>{comp.description}</div>
                  {comp.status !== "ended" && (
                    <div style={{display: "inline-flex", alignItems: "center", gap: 6, background: `${comp.accentColor}22`, border: `1px solid ${comp.accentColor}44`, borderRadius: 10, padding: "8px 14px"}}>
                      <span style={{fontSize: 12, fontWeight: 700, color: comp.accentColor}}>Enter Competition →</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{textAlign: "center", marginTop: 32, fontSize: 11, color: "#374151"}}>
          More competitions coming soon
        </div>
      </main>
    </div>
  );
}
