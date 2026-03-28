import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "../components/ChartTooltip";
import { fmt } from "../utils/format";
import { IoAdd } from "react-icons/io5";
import { MdOutlineCreditScore } from "react-icons/md";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoCard } from "react-icons/io5";
import { MdAddCard } from "react-icons/md";
import styles from "./Cartoes.module.css";
import dashStyles from "./Dashboard.module.css";

const truncateName = (name, maxLength = 12) =>
  name.length > maxLength ? name.slice(0, maxLength) + "…" : name;

const calcUsagePct = (balance, limit) =>
  limit > 0 ? (balance / limit) * 100 : 0;

function CreditCard({ card, onEdit, onRemove }) {
  const usagePct = calcUsagePct(card.balance, card.limit);

  return (
    <div className={styles.cardContainer}>
      <div
        className={styles.creditCard}
        style={{
          background: `linear-gradient(135deg,${card.grad[0]},${card.grad[1]})`,
        }}
      >
        <div className={styles.cardSec1} />
        <div className={styles.cardSec2} />

        {}
        <div className={styles.btnContainer}>
          <button
            onClick={() => onEdit(card)}
            className={`${styles.btnAction} ${styles.btnEdit}`}
          >
            ✎
          </button>
          <button
            onClick={() => onRemove(card.id)}
            className={`${styles.btnAction} ${styles.btnRemove}`}
          >
            ✕
          </button>
        </div>

        {/* Bandeira e nome */}
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardLabel}>{card.flag}</div>
            <div className={styles.cardName}>{card.name}</div>
          </div>
          <div className={styles.cardChip}></div>
        </div>

        {/* Número mascarado */}
        <div className={styles.cardNumber}>•••• •••• •••• {card.digits}</div>

        {/* Fatura e limite */}
        <div className={styles.cardFooter}>
          <div>
            <div className={styles.footerLabel}>Fatura Atual</div>
            <div className={styles.footerValue}>
              R$ {card.balance.toLocaleString("pt-BR")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={styles.footerLabel}>Limite</div>
            <div className={styles.footerLimit}>
              R$ {card.limit.toLocaleString("pt-BR")}
            </div>
            {card.due && (
              <div className={styles.footerDue}>Vence dia {card.due}</div>
            )}
          </div>
        </div>

        {/* Barra de uso */}
        <div className={styles.cardProgressBar}>
          <div
            className={styles.cardProgressFill}
            style={{ width: `${Math.min(usagePct, 100)}%` }}
          />
        </div>
        <div className={styles.cardMeta}>
          <span>{usagePct.toFixed(0)}% utilizado</span>
          <span>
            R$ {Math.max(0, card.limit - card.balance).toLocaleString("pt-BR")}{" "}
            disponível
          </span>
        </div>
      </div>
    </div>
  );
}

/** Barra de utilização de limite por cartão */
function LimitUsageItem({ card }) {
  const pct = calcUsagePct(card.balance, card.limit);
  const warn = pct > 60;

  return (
    <div className={styles.usageItem}>
      <div className={styles.usageHeader}>
        <div className={styles.usageInfo}>
          <div
            className={styles.usageDot}
            style={{ background: card.grad[0] }}
          />
          <span className={styles.usageName}>{card.name}</span>
        </div>
        <span
          className={styles.usagePct}
          style={{ color: warn ? "var(--red)" : "var(--green)" }}
        >
          {pct.toFixed(0)}%
        </span>
      </div>

      <div className={styles.usageTrack}>
        <div
          className={styles.usageFill}
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: warn
              ? `linear-gradient(90deg,${card.grad[0]},var(--red))`
              : `linear-gradient(90deg,${card.grad[0]},var(--green))`,
          }}
        />
      </div>

      <div className={styles.usageFooter}>
        <span>R$ {card.balance.toLocaleString("pt-BR")} usado</span>
        {card.due && <span>Vence dia {card.due}</span>}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Cartoes() {
  const { cardHook } = useFinance();
  const { showToast } = useAppContext();
  
  const { cards, openNewCard, openEditCard } = cardHook;

  const removeCard = (id) => {
    if (cardHook.removeCard(id)) showToast("Cartão removido.", "err");
  };

  // Totalizadores
  const totalFatura = cards.reduce((sum, c) => sum + c.balance, 0);
  const totalLimite = cards.reduce((sum, c) => sum + c.limit, 0);
  const totalDisponivel = cards.reduce(
    (sum, c) => sum + Math.max(0, c.limit - c.balance),
    0,
  );

  // Dados formatados para o gráfico
  const chartData = cards.map((c) => ({
    name: truncateName(c.name),
    fatura: c.balance,
  }));

  // Lê a variável CSS atual para adaptar as cores do gráfico ao tema
  const isDark =
    document.documentElement.getAttribute("data-theme") !== "light";
  const axisTickColor = isDark
    ? "rgba(240,238,232,0.5)"
    : "rgba(26,28,34,0.55)";

  const summaryCards = [
    {
      label: "Total em Faturas",
      value: totalFatura,
      color: "var(--red)",
      icon: <MdOutlineAttachMoney />,
    },
    {
      label: "Limite Total",
      value: totalLimite,
      color: "var(--text)",
      icon: <IoCard />,
    },
    {
      label: "Limite Disponível",
      value: totalDisponivel,
      color: "var(--green)",
      icon: <MdOutlineCreditScore />,
    },
  ];

  return (
    <>
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <div className="pg-title">Meus Cartões</div>
        <button onClick={openNewCard} className={styles.btnAddCard}>
          Adicionar Cartão
        </button>
      </div>
      <div className="pg-sub">
        Controle de faturas e limites · {cards.length} cartão
        {cards.length !== 1 ? "s" : ""} cadastrado
        {cards.length !== 1 ? "s" : ""}
      </div>

      
      {cards.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <MdAddCard />
          </div>
          <div className={styles.emptyTitle}>Nenhum cartão cadastrado</div>
          <div className={styles.emptyDesc}>
            Adicione seus cartões para controlar faturas e limites
          </div>
          <button onClick={openNewCard} className={styles.btnFirstCard}>
            Adicionar primeiro cartão
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <>
          {/* ── Cards visuais ── */}
          <div className={styles.cardGrid}>
            {cards.map((card) => (
              <CreditCard
                key={card.id}
                card={card}
                onEdit={openEditCard}
                onRemove={removeCard}
              />
            ))}
          </div>

          {/* ── Gráfico + Utilização ── */}
          <div className={dashStyles.grid2}>
            
            <div className={dashStyles.panel}>
              <div className={dashStyles.panelHeader}>
                <div className={dashStyles.panelTitle}>Distribuição de Faturas</div>
                <div className={styles.emptyDesc} style={{ margin: 0 }}>Proporção de gastos entre cartões</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                
                <div
                  style={{
                    flexShrink: 0,
                    position: "relative",
                    width: 160,
                    height: 160,
                  }}
                >
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="fatura"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {cards.map((c, i) => (
                          <Cell key={i} fill={c.grad[0]} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Total no centro do donut */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "var(--text2)",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >

                        
                      Total
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "var(--text)",
                      }}
                    >
                      {fmt(totalFatura)}
                    </div>
                  </div>
                </div>

                
                <div className={styles.legendContainer}>
                  {cards.map((card) => {
                    const sharePct =
                      totalFatura > 0
                        ? ((card.balance / totalFatura) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <div key={card.id}>
                        
                        <div className={styles.legendHeader}>
                          <div className={styles.usageInfo}>
                            <div
                              className={styles.usageDot}
                              style={{
                                background: card.grad[0],
                                width: 10,
                                height: 10,
                                borderRadius: 3,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--text)",
                              }}
                            >
                              {card.name}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: card.grad[0],
                            }}
                          >
                            {sharePct}%
                          </span>
                        </div>

                        
                        <div className={styles.usageTrack} style={{ height: 6 }}>
                          <div
                            className={styles.usageFill}
                            style={{
                              width: `${sharePct}%`,
                              background: `linear-gradient(90deg, ${card.grad[0]}, ${card.grad[1]})`,
                              boxShadow: `0 0 6px ${card.grad[0]}66`,
                            }}
                          />
                        </div>

                      
                        <div className={styles.usageFooter}>
                          {fmt(card.balance)} de {fmt(card.limit)} de limite
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Utilização dos limites */}
            <div className={dashStyles.panel}>
              <div className={dashStyles.panelHeader}>
                <div className={dashStyles.panelTitle}>Utilização dos Limites</div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  paddingTop: 4,
                }}
              >
                {cards.map((card) => (
                  <LimitUsageItem key={card.id} card={card} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Totalizadores ── */}
          <div className={dashStyles.grid3}>
            {summaryCards.map((s, i) => (
              <div key={i} className={dashStyles.statCard}>
                <span
                  style={{ fontSize: 20, marginBottom: 12, display: "block" }}
                >
                  {s.icon}
                </span>
                <div className={dashStyles.label}>{s.label}</div>
                <div
                  className={dashStyles.value}
                  style={{ color: s.color, fontSize: 22 }}
                >
                  {fmt(s.value)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
