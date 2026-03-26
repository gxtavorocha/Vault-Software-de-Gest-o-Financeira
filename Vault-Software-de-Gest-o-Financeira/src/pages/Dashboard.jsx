import { useFinance } from "../context/FinanceContext";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "../components/ChartTooltip";
import { MONTHS } from "../constants";
import { fmt, fmtPct } from "../utils/format";
import { MdOutlineAttachMoney } from "react-icons/md";
import { RxLapTimer } from "react-icons/rx";
import { FaArrowTrendDown } from "react-icons/fa6";
import { FaMoneyBillWave } from "react-icons/fa6";
import { CatIcon } from "../constants/CatIcon";
import { MdOutlineAccessTime, MdRepeat, MdTimeline } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { BsGraphUp } from "react-icons/bs";
import { FaWallet } from "react-icons/fa6";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    month, year, categoryHook, txHook, budgetHook, monthlyHistory, byCategory, pieData
  } = useFinance();

  const { filtered, totalIncome, totalPending, projectedBalance, savePctProjected, deficitPctProjected, totalExpense, balance, savePct, totalExpensePending, toggleReceived, togglePaid } = txHook;
  const { budgetGroups, activePlan, activePlanId } = budgetHook;
  const { getCat } = categoryHook;
  const totalInvested = filtered
    .filter((t) => {
      const cat = getCat(t.category);
      return (
        cat?.label?.toLowerCase().includes("investimento") && t.paid !== false
      );
    })
    .reduce((acc, t) => acc + t.value, 0);

  const totalSubscriptions = filtered
    .filter((t) => 
      t.type === "expense" && 
      (t.desc.toLowerCase().includes("assinatura") || t.desc.toLowerCase().includes("recorrente"))
    )
    .reduce((acc, t) => acc + t.value, 0);

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const daysPassed = isCurrentMonth 
    ? now.getDate() 
    : (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth()) 
        ? daysInMonth(month, year) 
        : 1);

  const dailyAverage = totalExpense / daysPassed;
    
  const investedPct =
    totalIncome > 0
      ? Math.min(100, (totalInvested / totalIncome) * 100).toFixed(1)
      : "0.0";

  return (
    <>
      <div className="pg-title">Visão Geral</div>
      <div className="pg-sub">
        {MONTHS[month]} {year} · {filtered.length} transações · Plano{" "}
        <strong style={{ color: "var(--gold)" }}>{activePlan?.name}</strong>
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.grid5}>
        <div className={styles.statCard}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <FaMoneyBillWave />
          </span>
          <div className={styles.label}>Entradas</div>
          <div className={styles.value} style={{ color: "var(--green)" }}>
            {fmt(totalIncome)}
          </div>
          <div className={styles.subLabel}>
            {
              filtered.filter(
                (t) => t.type === "income" && t.received !== false,
              ).length
            }{" "}
            confirmadas
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <FaArrowTrendDown />
          </span>
          <div className={styles.label}>Despesas</div>
          <div className={styles.value} style={{ color: "var(--red)" }}>
            {fmt(totalExpense)}
          </div>
          <div className={styles.subLabel}>
            {totalIncome > 0
              ? fmtPct((totalExpense / totalIncome) * 100) + " da renda"
              : "—"}
          </div>
        </div>

        <div className={styles.statCard}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <MdRepeat />
          </span>
          <div className={styles.label}>Assinaturas</div>
          <div className={styles.value} style={{ color: "var(--red)" }}>
            {fmt(totalSubscriptions)}
          </div>
          <div className={styles.subLabel}>
            {
              filtered.filter(
                (t) => 
                  t.type === "expense" && 
                  (t.desc.toLowerCase().includes("assinatura") || t.desc.toLowerCase().includes("recorrente"))
              ).length
            }{" "}
            recorrentes
          </div>
        </div>

        <div className={styles.statCard}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <RxLapTimer />
          </span>
          <div className={styles.label}>À Receber</div>
          <div className={styles.value} style={{ color: "var(--gold)" }}>
            {fmt(totalPending)}
          </div>
          <div className={styles.subLabel}>
            {
              filtered.filter(
                (t) => t.type === "income" && t.received === false,
              ).length
            }{" "}
            pendentes
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <RxLapTimer />
          </span>
          <div className={styles.label}>À pagar</div>
          <div className={styles.value} style={{ color: "var(--red)" }}>
            {fmt(totalExpensePending)}
          </div>
          <div className={styles.subLabel}>
            {
              filtered.filter((t) => t.type === "expense" && t.paid !== true)
                .length
            }{" "}
            pendentes
            <div className={styles.subLabel}>
              {totalIncome > 0
                ? fmtPct((totalExpense / totalIncome) * 100) + " da renda"
                : "—"}
            </div>
          </div>
        </div>
                
          <div className={styles.statCard}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
           <FaWallet />
          </span>
          <div className={styles.label}>Projeção de Saldo</div>
          <div className={styles.value} style={{ color: projectedBalance >= 0 ? "var(--green)" : "var(--red)" }}>
            {fmt(projectedBalance)}
          </div>
          <div className={styles.subLabel}>
            {projectedBalance < 0 ? `-${deficitPctProjected}` : savePctProjected}% da renda projetado para conta corrente
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardGold}`}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <MdOutlineAttachMoney />
          </span>
          <div className={styles.label}>Saldo Disponível Em conta</div>
          <div
            className={styles.value}
            style={{
              color: balance >= 0 ? "var(--gold)" : "var(--red)",
              fontSize: 24,
            }}
          >
            {fmt(balance)}
          </div>
          <div className={styles.subLabel}>
            {savePct}% da renda em conta corrente
          </div>
        </div>

        <div className={styles.statCard}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <MdTimeline />
          </span>
          <div className={styles.label}>Média Diária de Gastos</div>
          <div className={styles.value} style={{ color: "var(--red)" }}>
            {fmt(dailyAverage)}
          </div>
          <div className={styles.subLabel}>
            baseado em {daysPassed} {daysPassed === 1 ? 'dia' : 'dias'}
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.statCardGreen}`} style={{ gridColumn: "1 / -1" }}>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}>
            <BsGraphUp />
          </span>
          <div className={styles.label}>Investido</div>
          <div
            className={styles.value}
            style={{
              color: totalIncome > 0 ? "var(--green)" : "var(--red)",
              fontSize: 24,
            }}
          >
            {totalIncome <= 0 ? "-" : ""}
            {fmt(totalInvested)}
          </div>
          <div className={styles.subLabel}>
            {investedPct}% da renda investida
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className={styles.grid2Large}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Fluxo de Entradas e saídas</div>
              <div
                style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}
              >
                Histórico de 6 meses
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
              {[
                ["Receitas", "var(--green)"],
                ["Despesas", "var(--red)"],
              ].map(([l, c]) => (
                <span
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "var(--text3)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: c,
                      display: "inline-block",
                    }}
                  />
                  {l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthlyHistory} margin={{ left: -10, right: 4 }}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#289e45ff" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#6DE8A0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eb6253" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#E87A6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="m"
                tick={{ fill: "rgba(240,238,232,0.3)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(240,238,232,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="r"
                name="Receitas"
                stroke="#6DE8A0"
                strokeWidth={2.5}
                fill="url(#gr)"
                dot={{ fill: "#6DE8A0", r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="d"
                name="Despesas"
                stroke="#ee6555"
                strokeWidth={2.5}
                fill="url(#gd)"
                dot={{ fill: "#f85947", r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Por Categoria</div>
            <button className={styles.panelLink} onClick={() => navigate("/transacoes")}>
              ver tudo →
            </button>
          </div>
          {pieData.length === 0 ? (
            <div className={styles.empty}>Sem despesas.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  marginTop: 10,
                }}
              >
                {pieData.slice(0, 4).map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        color: "var(--text2)",
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 2,
                          background: d.color,
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      {d.name}
                    </span>
                    <span style={{ fontWeight: 700, color: d.color }}>
                      {fmt(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent txs + Budget goals ── */}
      <div className={styles.grid2}>
        {/* Recent transactions */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Últimas Transações</div>
            <button className={styles.panelLink} onClick={() => navigate("/transacoes")}>
              ver todas
            </button>
          </div>
          {filtered.length === 0 && (
            <div className={styles.empty}>Nenhuma transação neste mês.</div>
          )}
          {[...filtered]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6)
            .map((t) => {
              const cat = getCat(t.category);
              const pend = t.type === "income" && t.received === false;
              return (
                <div key={t.id} className={`${styles.transactionRow}${pend ? ` ${styles.dim}` : ""}`}>
                  <div
                    className={styles.avatar}
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
                  <div className={styles.info}>
                    <div className={styles.name}>{t.desc}</div>
                    <div className={styles.meta}>
                      <span>
                        {new Date(t.date + "T12:00:00").toLocaleDateString(
                          "pt-BR",
                          { day: "2-digit", month: "2-digit" },
                        )}
                      </span>
                      <span
                        className={styles.dot}
                        style={{ background: cat?.color || "#888" }}
                      />
                      <span style={{ color: cat?.color || "var(--text3)" }}>
                        {cat?.label}
                      </span>
                    </div>
                  </div>
                  
                
                  {t.type === "income" && (
                    <span
                      className={`${styles.badge} ${t.received !== false ? styles.badgeSuccess : styles.badgeWarning}`}
                      onClick={() => toggleReceived(t.id)}
                    >
                      {t.received !== false ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Recebido
                          <BsCheckCircleFill />
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Pendente
                          <MdOutlineAccessTime />
                        </span>
                      )}
                    </span>
                  )}
                  
                  {/* TAGS CORRIGIDAS AQUI */}
                  {t.type === "expense" && (
                    <span
                      className={`${styles.badge} ${t.paid !== false ? styles.badgeSuccess : styles.badgeWarning}`}
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
                  )}

                  <div
                    className={styles.amount}
                    style={{
                      color:
                        t.type === "income" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {fmt(t.value)}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Budget goals */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Metas de Orçamento</div>
              <div
                style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}
              >
                % da renda por grupo e categoria
              </div>
            </div>
            <button className={styles.panelLink} onClick={() => navigate("/orcamento")}>
              detalhes →
            </button>
          </div>

          {activePlanId !== "custom" && budgetGroups.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {budgetGroups.map((g) => {
                const realPct =
                  totalIncome > 0
                    ? g.id === "pou"
                      ? (Math.max(0, balance) / totalIncome) * 100
                      : (g.spent / totalIncome) * 100
                    : 0;
                const over = realPct > g.pct;
                return (
                  <div key={g.id} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <CatIcon name={g.icon} size={14} color={g.color} />
                        {g.label}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 10, color: "var(--text3)" }}>
                          meta {g.pct}%
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: over ? "var(--red)" : g.color,
                          }}
                        >
                          {fmtPct(realPct)}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 99,
                        background: "var(--surface3)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          height: "100%",
                          width: `${g.pct}%`,
                          background: g.color + "1a",
                          borderRadius: 99,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          height: "100%",
                          width: `${Math.min(realPct, 100)}%`,
                          background: over ? "var(--red)" : g.color,
                          borderRadius: 99,
                          transition: "width 1s",
                          boxShadow: `0 0 6px ${g.color}66`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                        color: "var(--text3)",
                        marginTop: 3,
                      }}
                    >
                      <span>
                        {fmt(g.id === "pou" ? Math.max(0, balance) : g.spent)}
                      </span>
                      <span>meta: {fmt((g.pct / 100) * totalIncome)}</span>
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "10px 0",
                }}
              />
            </div>
          )}

          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "var(--text3)",
              marginBottom: 10,
            }}
          >
            Detalhamento por Categoria
          </div>
          {byCategory.length === 0 && (
            <div className={styles.empty} style={{ padding: "14px 0" }}>
              Sem despesas neste mês.
            </div>
          )}
          {byCategory.map((cat) => {
            const warn = cat.pctOfInc > 25;
            return (
              <div key={cat.id} className={styles.categoryBar}>
                <div
                  className={styles.categoryEmoji}
                  style={{
                    background: cat.color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CatIcon name={cat.icon} size={16} color={cat.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {cat.label}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: warn ? "var(--red)" : "var(--text3)",
                          fontWeight: warn ? 700 : 400,
                        }}
                      >
                        {fmtPct(cat.pctOfInc)} da renda
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: cat.color,
                        }}
                      >
                        {fmt(cat.total)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(cat.pctOfInc * 2, 100)}%`,
                        background: warn ? "var(--red)" : cat.color,
                        boxShadow: `0 0 6px ${cat.color}55`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}