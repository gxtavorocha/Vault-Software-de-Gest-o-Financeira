import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import RadialProgress from "../components/RadialProgress";
import ChartTooltip from "../components/ChartTooltip";
import { MONTHS, MONTHLY_HIST } from "../constants";
import { fmt, fmtPct } from "../utils/format";
import { MdOutlineAttachMoney } from "react-icons/md";
import { RxLapTimer } from "react-icons/rx";
import { FaArrowTrendDown } from "react-icons/fa6";
import { FaMoneyBillWave } from "react-icons/fa6";

export default function Dashboard({
  
  month, year, filtered, totalIncome, totalPending, totalExpense,
  balance, savePct, byCategory, pieData, budgetGroups, activePlan,
  activePlanId, getCat, toggleReceived, setView,
}) {
  return (
    <>
      <div className="pg-title">Visão Geral</div>
      <div className="pg-sub">
        {MONTHS[month]} {year} · {filtered.length} transações · Plano{" "}
        <strong style={{ color: "var(--gold)" }}>{activePlan?.name}</strong>
      </div>

      {/* ── Stat cards ── */}
      <div className="g4">
        <div className="sc">
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}><FaMoneyBillWave /></span>
          <div className="sc-lbl">Entradas</div>
          <div className="sc-val" style={{ color: "var(--green)" }}>{fmt(totalIncome)}</div>
          <div className="sc-sub">{filtered.filter(t => t.type === "income" && t.received !== false).length} confirmadas</div>
          
        </div>
        <div className="sc">
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}><RxLapTimer /></span>
          <div className="sc-lbl">A Receber</div>
          <div className="sc-val" style={{ color: "var(--gold)" }}>{fmt(totalPending)}</div>
          <div className="sc-sub">{filtered.filter(t => t.type === "income" && t.received === false).length} pendentes</div>
        </div>
        <div className="sc">
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}><FaArrowTrendDown /></span>
          <div className="sc-lbl">Despesas</div>
          <div className="sc-val" style={{ color: "var(--red)" }}>{fmt(totalExpense)}</div>
          <div className="sc-sub">{totalIncome > 0 ? fmtPct((totalExpense / totalIncome) * 100) + " da renda" : "—"}</div>
        </div>
        <div className="sc gold">
          <div className="ring-w">
            <RadialProgress pct={parseFloat(savePct)} color={balance >= 0 ? "#E8B86D" : "#E87A6D"} size={66} />
            <div className="ring-v" style={{ color: balance >= 0 ? "var(--gold)" : "var(--red)" }}>{savePct}%</div>
          </div>
          <span style={{ fontSize: 20, marginBottom: 14, display: "block" }}><MdOutlineAttachMoney/></span>
          <div className="sc-lbl">Saldo em Conta</div>
          <div className="sc-val" style={{ color: balance >= 0 ? "var(--gold)" : "var(--red)", fontSize: 24 }}>{fmt(balance)}</div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="g2l">
        <div className="panel">
          <div className="ph">
            <div>
              <div className="pt">Fluxo de Entradas e saídas  </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>Histórico de 6 meses</div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
              {[["Receitas", "var(--green)"], ["Despesas", "var(--red)"]].map(([l, c]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text3)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={MONTHLY_HIST} margin={{ left: -10, right: 4 }}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6DE8A0" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#6DE8A0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E87A6D" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#E87A6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fill: "rgba(240,238,232,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(240,238,232,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="r" name="Receitas"  stroke="#6DE8A0" strokeWidth={2.5} fill="url(#gr)" dot={{ fill: "#6DE8A0", r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="d" name="Despesas" stroke="#E87A6D" strokeWidth={2.5} fill="url(#gd)" dot={{ fill: "#E87A6D", r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="ph">
            <div className="pt">Por Categoria</div>
            <button className="pl" onClick={() => setView("transacoes")}>ver tudo →</button>
          </div>
          {pieData.length === 0 ? <div className="empty">Sem despesas.</div> : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text2)" }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: d.color, display: "inline-block", flexShrink: 0 }} />{d.name}
                    </span>
                    <span style={{ fontWeight: 700, color: d.color }}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent txs + Budget goals ── */}
      <div className="g2">
        {/* Recent transactions */}
        <div className="panel">
          <div className="ph">
            <div className="pt">Últimas Transações</div>
            <button className="pl" onClick={() => setView("transacoes")}>ver todas →</button>
          </div>
          {filtered.length === 0 && <div className="empty">Nenhuma transação neste mês.</div>}
          {[...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6).map(t => {
            const cat = getCat(t.category);
            const pend = t.type === "income" && t.received === false;
            return (
              <div key={t.id} className={`tx-row${pend ? " dim" : ""}`}>
                <div className="av" style={{ background: (cat?.color || "#888") + "18" }}>{cat?.icon || "✦"}</div>
                <div className="ti">
                  <div className="tn">{t.desc}</div>
                  <div className="tm">
                    <span>{new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                    <span className="cdot" style={{ background: cat?.color || "#888" }} />
                    <span style={{ color: cat?.color || "var(--text3)" }}>{cat?.label}</span>
                  </div>
                </div>
                {t.type === "income" && (
                  <span className={`tbadge ${t.received !== false ? "bg" : "bo"}`} onClick={() => toggleReceived(t.id)}>
                    {t.received !== false ? "✓ recebido" : "⏳ pendente"}
                  </span>
                )}
                <div className="tamt" style={{ color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                  {t.type === "income" ? "+" : "-"}{fmt(t.value)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Budget goals — % of income */}
        <div className="panel">
          <div className="ph">
            <div>
              <div className="pt">Metas de Orçamento</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>% da renda por grupo e categoria</div>
            </div>
            <button className="pl" onClick={() => setView("orcamento")}>detalhes →</button>
          </div>

          {activePlanId !== "custom" && budgetGroups.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {budgetGroups.map(g => {
                const realPct = totalIncome > 0 ? (g.id === "pou" ? Math.max(0, balance) / totalIncome * 100 : g.spent / totalIncome * 100) : 0;
                const over = realPct > g.pct;
                return (
                  <div key={g.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{g.icon}</span>{g.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "var(--text3)" }}>meta {g.pct}%</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: over ? "var(--red)" : g.color }}>{fmtPct(realPct)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "var(--surface3)", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", height: "100%", width: `${g.pct}%`, background: g.color + "1a", borderRadius: 99 }} />
                      <div style={{ position: "absolute", height: "100%", width: `${Math.min(realPct, 100)}%`, background: over ? "var(--red)" : g.color, borderRadius: 99, transition: "width 1s", boxShadow: `0 0 6px ${g.color}66` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginTop: 3 }}>
                      <span>{fmt(g.id === "pou" ? Math.max(0, balance) : g.spent)}</span>
                      <span>meta: {fmt((g.pct / 100) * totalIncome)}</span>
                    </div>
                  </div>
                );
              })}
              <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
            </div>
          )}

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>
            Detalhamento por Categoria
          </div>
          {byCategory.length === 0 && <div className="empty" style={{ padding: "14px 0" }}>Sem despesas neste mês.</div>}
          {byCategory.map(cat => {
            const warn = cat.pctOfInc > 25;
            return (
              <div key={cat.id} className="cb">
                <div className="cem" style={{ background: cat.color + "18" }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{cat.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: warn ? "var(--red)" : "var(--text3)", fontWeight: warn ? 700 : 400 }}>
                        {fmtPct(cat.pctOfInc)} da renda
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: cat.color }}>{fmt(cat.total)}</span>
                    </div>
                  </div>
                  <div className="btr">
                    <div className="bfi" style={{ width: `${Math.min(cat.pctOfInc * 2, 100)}%`, background: warn ? "var(--red)" : cat.color, boxShadow: `0 0 6px ${cat.color}55` }} />
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
