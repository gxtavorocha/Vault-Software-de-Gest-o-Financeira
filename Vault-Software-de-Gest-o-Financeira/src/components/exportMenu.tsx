// components/ExportMenu.jsx
import { useExport } from "../hooks/useExport";
import { FiDownload } from "react-icons/fi";

export default function ExportMenu() {
  const {
    exportAll,
    exportTransactions,
    exportCards,
    exportAccounts,
    exportCategories,
  } = useExport();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button onClick={exportAll} style={btnStyle("#6366f1")}>
        <FiDownload /> Exportar Tudo (4 arquivos CSV)
      </button>
      <button onClick={exportTransactions} style={btnStyle("#22c55e")}>
        <FiDownload /> Só Transações
      </button>
      <button onClick={exportCards} style={btnStyle("#3b82f6")}>
        <FiDownload /> Só Cartões
      </button>
      <button onClick={exportAccounts} style={btnStyle("#f59e0b")}>
        <FiDownload /> Só Contas
      </button>
      <button onClick={exportCategories} style={btnStyle("#ec4899")}>
        <FiDownload /> Só Categorias
      </button>
    </div>
  );
}

const btnStyle = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
});