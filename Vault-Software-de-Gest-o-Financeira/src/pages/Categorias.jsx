import { PRESET_ICONS, PRESET_COLORS } from "../constants";

export default function Categorias({
  categories,
  catForm,
  setCatForm,
  addCat,
  removeCat,
}) {
  return (
    <>
      <div className="pg-title">Categorias</div>
      <div className="pg-sub">Gerencie suas categorias de gastos</div>

      <div className="cp">
        {/* List */}
        <div className="panel">
          <div className="ph">
            <div className="pt">Categorias Ativas ({categories.length})</div>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className="ci">
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: cat.color + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  flexShrink: 0,
                }}
              >
                {cat.icon}
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                {cat.label}
              </span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: cat.color,
                  marginRight: 6,
                }}
              />
              {cat.custom ? (
                <button
                  onClick={() => removeCat(cat.id)}
                  style={{
                    background: "rgba(232,122,109,0.08)",
                    border: "1px solid rgba(232,122,109,0.2)",
                    color: "var(--red)",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontFamily: "var(--font)",
                  }}
                >
                  Remover
                </button>
              ) : (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text3)",
                    letterSpacing: "0.5px",
                    background: "var(--surface3)",
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  padrão
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="panel">
          <div className="ph">
            <div className="pt">Nova Categoria</div>
          </div>

          <div className="field">
            <label className="flbl">Nome</label>
            <input
              className="finp"
              placeholder="Ex: Pets, Investimentos..."
              value={catForm.label}
              onChange={(e) =>
                setCatForm((f) => ({ ...f, label: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label className="flbl" style={{ marginBottom: 8 }}>
              Ícone
            </label>
            <div className="ig">
              {PRESET_ICONS.map((ic) => (
                <div
                  key={ic}
                  className={`io${catForm.icon === ic ? " sel" : ""}`}
                  onClick={() => setCatForm((f) => ({ ...f, icon: ic }))}
                >
                  {ic}
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="flbl" style={{ marginBottom: 10 }}>
              Cor
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_COLORS.map((col) => (
                <div
                  key={col}
                  className={`cdot2${catForm.color === col ? " sel" : ""}`}
                  style={{ background: col }}
                  onClick={() => setCatForm((f) => ({ ...f, color: col }))}
                />
              ))}
            </div>
            <div
              className="cprev"
              style={{
                background: catForm.color + "12",
                border: `1px solid ${catForm.color}30`,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: catForm.color + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                }}
              >
                {catForm.icon}
              </div>
              <span
                style={{ fontSize: 14, fontWeight: 700, color: catForm.color }}
              >
                {catForm.label || "Prévia"}
              </span>
            </div>
          </div>

          <button className="btnp" onClick={addCat}>
            Criar Categoria
          </button>
        </div>
      </div>
    </>
  );
}
