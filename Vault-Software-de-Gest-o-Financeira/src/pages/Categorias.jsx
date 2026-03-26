import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { PRESET_ICONS, PRESET_COLORS } from "../constants";
import { CatIcon } from "../constants/CatIcon";
import styles from "./Categorias.module.css";
import dashStyles from "./Dashboard.module.css";


export default function Categorias() {
  const { categoryHook } = useFinance();
  const { showToast } = useAppContext();
  
  const { categories, catForm, setCatForm } = categoryHook;

  const addCat = () => {
    if (categoryHook.addCat()) showToast("Categoria criada! ✓");
  };

  const removeCat = (id) => {
    if (categoryHook.removeCat(id)) showToast("Categoria removida.", "err");
  };

  return (
    <>
      <div className="pg-title">Categorias</div>
      <div className="pg-sub">Gerencie suas categorias de gastos</div>

      <div className={styles.categoriesPage}>
        {/* List */}
        <div className={dashStyles.panel}>
          <div className={dashStyles.panelHeader}>
            <div className={dashStyles.panelTitle}>Categorias Ativas ({categories.length})</div>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.categoryItem}>
              <div
                className={styles.categoryIcon}
                style={{ background: cat.color + "18" }}
              >
                <CatIcon name={cat.icon} size={17} color={cat.color} />
              </div>
              <span className={styles.categoryLabel}>{cat.label}</span>
              <div
                className={styles.categoryDot}
                style={{ background: cat.color }}
              />
              {cat.custom ? (
                <button
                  onClick={() => removeCat(cat.id)}
                  className={styles.btnRemove}
                >
                  Remover
                </button>
              ) : (
                <span className={styles.badgeDefault}>padrão</span>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className={dashStyles.panel}>
          <div className={dashStyles.panelHeader}>
            <div className={dashStyles.panelTitle}>Nova Categoria</div>
          </div>

          <div className={dashStyles.field}>
            <label className={dashStyles.label}>Nome</label>
            <input
              className={dashStyles.input}
              placeholder="Ex: Pets, Investimentos..."
              value={catForm.label}
              onChange={(e) =>
                setCatForm((f) => ({ ...f, label: e.target.value }))
              }
            />
          </div>

          <div className={dashStyles.field}>
            <label className={dashStyles.label} style={{ marginBottom: 8 }}>
              Ícone
            </label>
            <div className={styles.iconGrid}>
              {PRESET_ICONS.map((key) => (
                <div
                  key={key}
                  className={`${styles.iconOption}${catForm.icon === key ? ` ${styles.iconOptionSelected}` : ""}`}
                  onClick={() => setCatForm((f) => ({ ...f, icon: key }))}
                  title={key}
                >
                  <CatIcon
                    name={key}
                    size={16}
                    color={catForm.icon === key ? catForm.color : "var(--text2)"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={dashStyles.field}>
            <label className={dashStyles.label} style={{ marginBottom: 10 }}>
              Cor
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_COLORS.map((col) => (
                <div
                  key={col}
                  className={`${styles.colorDot}${catForm.color === col ? ` ${styles.colorDotSelected}` : ""}`}
                  style={{ background: col }}
                  onClick={() => setCatForm((f) => ({ ...f, color: col }))}
                />
              ))}
            </div>
            <div
              className={styles.preview}
              style={{
                background: catForm.color + "12",
                border: `1px solid ${catForm.color}30`,
              }}
            >
              <div
                className={styles.previewIcon}
                style={{ background: catForm.color + "22" }}
              >
                <CatIcon name={catForm.icon} size={17} color={catForm.color} />
              </div>
              <span
                className={styles.previewLabel}
                style={{ color: catForm.color }}
              >
                {catForm.label || "Prévia"}
              </span>
            </div>
          </div>

          <button className={dashStyles.btnPrimary} onClick={addCat}>
            Criar Categoria
          </button>
        </div>
      </div>
    </>
  );
}