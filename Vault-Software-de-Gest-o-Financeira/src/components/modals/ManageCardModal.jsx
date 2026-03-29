import { useState } from "react";
import styles from "./Modal.module.css";
import { BANK_CARDS } from "../../constants";
import CustomSelect from "../ui/CustomSelect";

export default function ManageCardModal({ cards, onEdit, onRemove, onClose }) {
  const [selectedId, setSelectedId] = useState(cards.length > 0 ? cards[0].id : "");

  const handleEdit = () => {
    const card = cards.find((c) => String(c.id) === String(selectedId));
    if (card) onEdit(card);
    onClose();
  };

  const handleRemove = () => {
    // Ao deletar, avisamos o componente pai
    onRemove(selectedId);
    
    // Tentamos selecionar o próximo array disponível ou fechamos se acabar
    const remaining = cards.filter(c => String(c.id) !== String(selectedId));
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
        <div className={styles.title}>Gerenciar Cartões</div>
        <div className={styles.subtitle}>
          Selecione o cartão que deseja modificar ou excluir permanentemente.
        </div>

        {cards.length === 0 ? (
          <div style={{ color: "var(--text2)", textAlign: "center", padding: "30px 0" }}>
            Nenhum cartão cadastrado no momento.
          </div>
        ) : (
          <>
            <div className={styles.field} style={{ marginBottom: 24, marginTop: 10 }}>
              <label className={styles.label}>Cartão Selecionado</label>
              <CustomSelect
                value={selectedId}
                onChange={setSelectedId}
                options={cards.map((c) => {
                  const bank = BANK_CARDS.find((b) => b.id === c.bankId) 
                    || BANK_CARDS.find((b) => b.colors?.[0] === c.grad?.[0]) 
                    || BANK_CARDS[0];

                  return {
                    value: c.id,
                    label: `${bank.name} - ${c.name} (•••• ${c.digits})`
                  };
                })}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className={styles.btnPrimary} style={{ flex: 1.5 }} onClick={handleEdit}>
                Editar Cartão
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
