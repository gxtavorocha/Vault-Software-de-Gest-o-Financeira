import { useState } from "react";
import styles from "./Modal.module.css";
import { BANK_CARDS } from "../../constants";
import CustomSelect from "../ui/CustomSelect";

export default function ManageAccountModal({ accounts, onEdit, onRemove, onClose }) {
  const [selectedId, setSelectedId] = useState(accounts.length > 0 ? accounts[0].id : "");

  const handleEdit = () => {
    const acc = accounts.find((c) => String(c.id) === String(selectedId));
    if (acc) onEdit(acc);
    onClose();
  };

  const handleRemove = () => {
    onRemove(selectedId);
    
    const remaining = accounts.filter(c => String(c.id) !== String(selectedId));
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal} style={{ maxWidth: 440 }}>
        <div className={styles.modalInner} />
        <div className={styles.title}>Gerenciar Contas</div>
        <div className={styles.subtitle}>
          Selecione a conta que deseja modificar ou excluir permanentemente.
        </div>

        {accounts.length === 0 ? (
          <div style={{ color: "var(--text2)", textAlign: "center", padding: "30px 0" }}>
            Nenhuma conta cadastrada no momento.
          </div>
        ) : (
          <>
            <div className={styles.field} style={{ marginBottom: 24, marginTop: 10 }}>
              <label className={styles.label}>Conta Selecionada</label>
              <CustomSelect
                value={selectedId}
                onChange={setSelectedId}
                options={accounts.map((c) => {
                  const bank = BANK_CARDS.find((b) => b.id === c.bankId) 
                    || BANK_CARDS.find((b) => b.colors?.[0] === c.grad?.[0]) 
                    || BANK_CARDS[0];

                  return {
                    value: c.id,
                    label: `${bank.name} - ${c.name}`
                  };
                })}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className={styles.btnPrimary} style={{ flex: 1.5 }} onClick={handleEdit}>
                Editar Conta
              </button>
              <button
                className={styles.btnSecondary}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(220, 38, 38, 0.15)",
                  color: "#ff4d4d",
                  borderColor: "transparent"
                }}
                onClick={handleRemove}
              >
                Excluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
