import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "../components/ChartTooltip";
import { fmt } from "../utils/format";
import { IoAdd } from "react-icons/io5";
import { MdOutlineCreditScore } from "react-icons/md";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoCard, IoWifi } from "react-icons/io5";
import { MdAddCard } from "react-icons/md";
import { RiMastercardFill, RiVisaLine } from "react-icons/ri";
import { GrAmex } from "react-icons/gr";
import { BANK_CARDS } from "../constants";
import ManageCardModal from "../components/modals/ManageCardModal";
import styles from "./Cartoes.module.css";
import dashStyles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { BsCheckCircleFill } from "react-icons/bs";
import { MdOutlineAccessTime } from "react-icons/md";
import { CatIcon } from "../constants/CatIcon";

const FLAGS_ICONS = {
  Visa: <RiVisaLine size={48} />,
  Mastercard: <RiMastercardFill size={48} />,
  "American Express": <GrAmex size={38} style={{ borderRadius: 4 }} />,
};

const truncateName = (name, maxLength = 12) =>
  name.length > maxLength ? name.slice(0, maxLength) + "…" : name;

const calcUsagePct = (balance, limit) =>
  limit > 0 ? (balance / limit) * 100 : 0;

function CreditCard({ card }) {
  const usagePct = calcUsagePct(card.balance, card.limit);
  
  // Resgata os dados avançados da instituição pelo ID ouFallback para cor primária legada
  const bank = BANK_CARDS.find(b => b.id === card.bankId) 
    || BANK_CARDS.find(b => b.colors[0] === card.grad?.[0]) 
    || BANK_CARDS[0];

  return (
    <div
      className={styles.creditCard}
      style={{
        background: `linear-gradient(135deg,${bank.colors[0]},${bank.colors[1]})`,
        color: bank.textColor,
        border: bank.border || "none",
        height: "100%"
      }}
    >
      <div className={styles.cardSec1} />



      <div className={styles.cardHeader} style={{ alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div className={styles.cardLabel} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
            {bank.domain && (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=64`} 
                alt={bank.name} 
                style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff', padding: 2 }} 
              />
            )}
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.5px" }}>{bank.name}</span>
          </div>
          <div className={styles.cardName} style={{ marginTop: 2, color: bank.textColor }}>{card.name}</div>
        </div>
        {card.flag && FLAGS_ICONS[card.flag] && (
           <div style={{ color: bank.textColor, opacity: 0.95 }}>
             {FLAGS_ICONS[card.flag]}
           </div>
        )}
      </div>

      {/* Ícone Contactless e Chip estilo clássico */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6, paddingLeft: 2 }}>
         <div style={{ width: 36, height: 26, borderRadius: 4, background: "linear-gradient(135deg, #e6e6e6 0%, #a8a8a8 100%)", position: "relative", overflow: "hidden", opacity: 0.85 }}>
           <div style={{ position: "absolute", top: "50%", left: -5, right: -5, height: 1, background: "rgba(0,0,0,0.15)" }} />
           <div style={{ position: "absolute", left: "50%", top: -5, bottom: -5, width: 1, background: "rgba(0,0,0,0.15)" }} />
         </div>
         <IoWifi size={26} style={{ transform: "rotate(90deg)", opacity: 0.7 }} />
      </div>

      {/* Número mascarado */}
      <div className={styles.cardNumber}>•••• •••• •••• {card.digits}</div>

      {/* Fatura e limite */}
      <div className={styles.cardFooter} style={{ color: bank.textColor, marginTop: 16 }}>
        <div>
          <div className={styles.footerLabel} style={{ color: bank.textColor, opacity: 0.8 }}>Fatura Atual</div>
          <div className={styles.footerValue} style={{ color: bank.textColor }}>
            R$ {card.balance.toLocaleString("pt-BR")}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={styles.footerLabel} style={{ color: bank.textColor, opacity: 0.8 }}>Limite</div>
          <div className={styles.footerLimit} style={{ color: bank.textColor }}>
            R$ {card.limit.toLocaleString("pt-BR")}
          </div>
          {card.due && (
            <div className={styles.footerDue} style={{ color: bank.textColor, opacity: 0.75 }}>Vence dia {card.due}</div>
          )}
        </div>
      </div>

      {/* Barra de uso */}
      <div className={styles.cardProgressBar} style={{ background: bank.textColor === "#ffffff" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)" }}>
        <div
          className={styles.cardProgressFill}
          style={{ width: `${Math.min(usagePct, 100)}%`, background: bank.textColor === "#ffffff" ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.55)" }}
        />
      </div>
      <div className={styles.cardMeta} style={{ color: bank.textColor, opacity: 0.85 }}>
        <span>{usagePct.toFixed(0)}% utilizado</span>
        <span>
          R$ {Math.max(0, card.limit - card.balance).toLocaleString("pt-BR")}{" "}
          disponível
        </span>
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
  const navigate = useNavigate();
  const [showManageModal, setShowManageModal] = useState(false);
  const { cardHook, txHook, categoryHook } = useFinance();
  const { showToast } = useAppContext();
  
  const { cards, openNewCard, openEditCard } = cardHook;
  const { togglePaid, filtered } = txHook;
  const { getCat } = categoryHook;

  const removeCard = (id) => {
    if (cardHook.removeCard(id)) showToast("Cartão removido.", "err");
  };

  // Transações do Cartão (Filtradas)
  const cardTransactions = filtered
    .filter((t) => t.paymentMethod === "credito")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
              />
            ))}
            
            {/* ── Pseudo-Cartão de Gerenciamento ── */}
            <div 
              className={styles.manageCard} 
              onClick={() => setShowManageModal(true)}
            >
              <IoCard size={56} color="var(--text2)" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Gerenciar Cartões</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>Editar ou Excluir</div>
              </div>
            </div>
          </div>

          {/* ── Gráfico + Utilização ── */}
          <div className={dashStyles.grid2} style={{ alignItems: "stretch" }}>
            
            <div className={dashStyles.panel} style={{ minHeight: 280 }}>
              <div className={dashStyles.panelHeader}>
                <div className={dashStyles.panelTitle} style={{ color: "var(--text1)", fontWeight: 800 }}>Distribuição de Faturas</div>
                <div style={{ fontSize: 13, color: "var(--text1)", opacity: 0.8, margin: 0 }}>Proporção de gastos entre cartões</div>
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
                              color: "var(--text1)",
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

                      
                        <div className={styles.usageFooter} style={{ opacity: 1 }}>
                          {fmt(card.balance)} de {fmt(card.limit)} de limite
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Utilização dos limites */}
            <div className={dashStyles.panel} style={{ minHeight: 280 }}>
              <div className={dashStyles.panelHeader}>
                <div className={dashStyles.panelTitle} style={{ color: "var(--text1)", fontWeight: 800 }}>Utilização dos Limites</div>
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

          {/* ── Últimas Transações no Cartão ── */}
          <div className={dashStyles.panel} style={{ marginBottom: 22 }}>
            <div className={dashStyles.panelHeader}>
              <div className={dashStyles.panelTitle}>Últimas Transações no Cartão</div>
              <button 
                className={dashStyles.panelLink} 
                onClick={() => navigate("/transacoes", { state: { initialFilter: "card" } })}
              >
                ver todas
              </button>
            </div>
            {cardTransactions.length === 0 ? (
              <div className={dashStyles.empty}>Nenhuma transação no cartão este mês.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '0 32px' }}>
                {cardTransactions.slice(0, 8).map((t) => {
                  const cat = getCat(t.category);
                  return (
                    <div key={t.id} className={dashStyles.transactionRow}>
                      <div
                        className={dashStyles.avatar}
                        style={{
                          background: (cat?.color || "#888") + "18",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CatIcon
                          name={cat?.icon}
                          size={16}
                          color={cat?.color || "#888"}
                        />
                      </div>
                      <div className={dashStyles.info}>
                        <div className={dashStyles.name}>{t.desc}</div>
                        <div className={dashStyles.meta}>
                          <span>
                            {new Date(t.date + "T12:00:00").toLocaleDateString(
                              "pt-BR",
                              { day: "2-digit", month: "2-digit" },
                            )}
                          </span>
                          <span
                            className={dashStyles.dot}
                            style={{ background: cat?.color || "#888" }}
                          />
                          <span style={{ color: cat?.color || "var(--text3)" }}>
                            {cat?.label}
                          </span>
                        </div>
                      </div>
                      
                      <span
                        className={`${dashStyles.badge} ${t.paid !== false ? dashStyles.badgeSuccess : dashStyles.badgeWarning}`}
                        onClick={() => togglePaid(t.id)}
                      >
                        {t.paid !== false ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Pago
                            <BsCheckCircleFill />
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Pendente
                            <MdOutlineAccessTime />
                          </span>
                        )}
                      </span>

                      <div
                        className={dashStyles.amount}
                        style={{ color: "var(--red)" }}
                      >
                        -{fmt(t.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* MODAL DE GERENCIAMENTO (Editar/Excluir) */}
      {showManageModal && (
        <ManageCardModal 
          cards={cards}
          onEdit={openEditCard}
          onRemove={removeCard}
          onClose={() => setShowManageModal(false)}
        />
      )}
    </>
  );
}
