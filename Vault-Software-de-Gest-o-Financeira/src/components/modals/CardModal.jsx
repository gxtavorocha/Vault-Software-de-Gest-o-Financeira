import { CARD_GRADS } from "../../constants";
import styles from "./Modal.module.css";
import { RiMastercardFill, RiVisaLine } from "react-icons/ri";
import { GrAmex } from "react-icons/gr";


const FLAGS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Elo",
  "Hipercard",
];
const FLAGS_ICONS = {
  "Visa": <RiVisaLine />,
  "Mastercard": <RiMastercardFill />,
  "American Express": <GrAmex />,
  
};

export default function CardModal({
  form,
  setForm,
  isEditing,
  onSave,
  onClose,
}) {
  const grad = CARD_GRADS[form.gradIdx] || CARD_GRADS[0];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.modalInner} />
        <div className={styles.title}>
          {isEditing ? "Editar Cartão" : "Novo Cartão"}
        </div>
        
        <div className={styles.subtitle}>
          {isEditing
            ? "Atualize os dados do seu cartão"
            : "Adicione um cartão de crédito ou débito"}
        </div>

       
        <div
          
          style={{
            borderRadius: 16,
            padding: "20px 22px",
            marginBottom: 20,
            background: `linear-gradient(135deg,${grad.colors[0]},${grad.colors[1]})`,
            position: "relative",
            overflow: "hidden",
            minHeight: 160,
            
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              fontSize: 11,
              opacity: 0.75,
              marginBottom: 3,
              fontWeight: 700,
              letterSpacing: "0.8px",
              display: "flex",
              alignItems: "center",
              gap: 5
              
            }}
          >
               <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            
            {form.flag || "Bandeira"}
            {FLAGS_ICONS[form.flag] && (
              <span style={{
                position: "absolute",
                top: 12,
                right: 16,
                fontSize: 42,        
                lineHeight: 1,
                color: "white",
                opacity: 0.95,
              }}>
                {FLAGS_ICONS[form.flag]}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              marginBottom: 10,
              opacity: form.name ? 1 : 0.45,
              
            }}
          >

            {form.name || "Nome do cartão"}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "2px",
                opacity: 0.85,
              }}
            >
              •••• •••• •••• {form.digits || "0000"}
            </div>
            <div style={{ textAlign: "right", fontSize: 10, opacity: 0.65 }}>
              {form.due && <div>Vence dia {form.due}</div>}
            </div>
          </div>
        </div>
      
        {/* Color picker */}
        <div className={styles.field}>
          <label className={styles.label}>Cor do Cartão</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CARD_GRADS.map((g, i) => (
              <div
                key={i}
                onClick={() => setForm((f) => ({ ...f, gradIdx: i }))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  cursor: "pointer",
                  background: `linear-gradient(135deg,${g.colors[0]},${g.colors[1]})`,
                  border:
                    form.gradIdx === i
                      ? "2.5px solid #fff"
                      : "2.5px solid transparent",
                  boxShadow:
                    form.gradIdx === i
                      ? "0 0 0 2px rgba(255,255,255,0.3)"
                      : "none",
                  transition: "all 0.15s",
                  flexShrink: 0,
                  
                }}
              />
            ))}
            
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nome do Cartão</label>
          <input
            className={styles.input}
            placeholder="Ex: Nubank Ultravioleta, Itaú Platinum..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className={styles.grid2} style={{ marginBottom: 15 }}>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Últimos 4 Dígitos</label>
            <input
              className={styles.input}
              placeholder="0000"
              maxLength={4}
              value={form.digits}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  digits: e.target.value.replace(/\D/g, "").slice(0, 4),
                }))
              }
            />
          </div>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Bandeira</label>
            <select
              className={styles.input}
              value={form.flag}
              onChange={(e) => setForm((f) => ({ ...f, flag: e.target.value }))}
            >
              {FLAGS.map((fl) => (
                <option key={fl} value={fl}>
                  {fl}
                </option>
              ))}
            </select>
          </div>
        </div>
          
        <div className={styles.grid2} style={{ marginBottom: 15 }}>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Limite (R$)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="10000"
              value={form.limit}
              onChange={(e) =>
                setForm((f) => ({ ...f, limit: e.target.value }))
              }
            />
          </div>
          <div className={styles.field} style={{ margin: 0 }}>
            <label className={styles.label}>Fatura Atual (R$)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="0"
              value={form.balance}
              onChange={(e) =>
                setForm((f) => ({ ...f, balance: e.target.value }))
              }
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Dia do Vencimento</label>
          <input
            className={styles.input}
            placeholder="Ex: 15"
            maxLength={2}
            value={form.due}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                due: e.target.value.replace(/\D/g, "").slice(0, 2),
              }))
            }
          />
        </div>

        <button className={styles.btnPrimary} onClick={onSave}>
          {isEditing ? "Salvar Alterações" : "Adicionar Cartão"}
        </button>
        <button className={styles.btnSecondary} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
