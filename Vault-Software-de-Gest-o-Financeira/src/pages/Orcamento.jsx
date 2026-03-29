import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { MONTHS, PRESET_PLANS } from "../constants";
import { fmt, fmtPct } from "../utils/format";
import { GrConfigure } from "react-icons/gr";
import { CatIcon } from "../constants/CatIcon";
import styles from "./Orcamento.module.css";
import dashStyles from "./Dashboard.module.css";
export default function Orcamento() {
  const { month, year, txHook, budgetHook, categoryHook } = useFinance();
  const { showToast } = useAppContext();
  
  const { totalIncome, balance } = txHook;
  const { activePlanId, setActivePlanId, activePlan, customPlans, removePlan, budgetGroups, customRows, customBudget, updCustPct, customTotal, budTab, setBudTab, setShowPlanModal } = budgetHook;
  const { categories } = categoryHook;
  const toast$ = showToast;

  return (
    <>
      <div className="pg-title">Orçamento</div>
      <div className="pg-sub">
        {MONTHS[month]} {year} · Plano:{" "}
        <strong style={{ color: "var(--gold)" }}>{activePlan?.name}</strong> ·
        Renda confirmada:{" "}
        <strong style={{ color: "var(--green)" }}>{fmt(totalIncome)}</strong>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab}${budTab === "planos" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setBudTab("planos")}
        >
          Planos
        </button>
        <button
          className={`${styles.tab}${budTab === "detalhe" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => setBudTab("detalhe")}
        >
          Detalhamento
        </button>
        {activePlanId === "custom" && (
          <button
            className={`${styles.tab}${budTab === "custom" ? ` ${styles.tabActive}` : ""}`}
            onClick={() => setBudTab("custom")}
          >
           Configurar
          </button>
        )}
      </div>

      {/* ── TAB: PLANOS ── */}
      {budTab === "planos" && (
        <>
          <div
            style={{
              fontSize: 11,
              color: "var(--gold)",
              fontWeight: 600,
              letterSpacing: "0.5px",
              marginBottom: 12,
            }}
          >
            PLANOS PREDEFINIDOS
          </div>
          <div className={styles.planGrid}>
            {PRESET_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`${styles.planCard}${activePlanId === plan.id ? ` ${styles.planCardActive}` : ""}`}
                onClick={() => {
                  setActivePlanId(plan.id);
                  toast$(`Plano ${plan.name} ativado! ✓`);
                }}
              >
                {activePlanId === plan.id && <div className={styles.planCheck}>✓</div>}
                <span className={styles.planBadge}>{plan.badge}</span>
                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.planDesc}>{plan.desc}</div>
                <div className={styles.planGrowth}>
                  {plan.groups.map((g) => (
                    <div key={g.id} className={styles.planGrowthRow}>
                      <span
                        style={{
                          fontSize: 10,
                          color: g.color,
                          fontWeight: 700,
                          width: 54,
                          flexShrink: 0,
                        }}
                      >
                        {g.label.slice(0, 9)}
                      </span>
                      <div className={styles.planGrowthBox}>
                        <div
                          className={styles.planGrowthFill}
                          style={{ width: `${g.pct}%`, background: g.color }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: g.color,
                          width: 28,
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {g.pct}%
                      </span>
                    </div>
                  ))}
                </div>
                {activePlanId === plan.id && totalIncome > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {plan.groups.map((g) => (
                      <div
                        key={g.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ color: g.color, fontWeight: 600 }}>
                          {g.label}
                        </span>
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>
                          {fmt((g.pct / 100) * totalIncome)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

       
          <div
            className={`${styles.planCard}${activePlanId === "custom" ? ` ${styles.planCardActive}` : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 12,
            }}
            onClick={() => {
              setActivePlanId("custom");
              setBudTab("custom");
              toast$("Plano personalizado ativado! ✓");
            }}
          >
            {activePlanId === "custom" && <div className={styles.planCheck}>✓</div>}
            <div style={{ fontSize: 28 }}>
             
            </div>
            <div>
              <span className={styles.planBadge}>Meu Plano </span>
               <div className={styles.planName} style={{ fontSize: 18 }}>
                Personalizado   
              </div>
              <div className={styles.planDesc} style={{ margin: 0 }}>
                Defina manualmente o % de cada categoria da sua renda
              </div>
            </div>
          </div>

          {/* User-created plans */}
          {customPlans.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text3)",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  marginBottom: 12,
                  marginTop: 16,
                }}
              >
                MEUS PLANOS CRIADOS
              </div>
              <div className={styles.planGrid}>
                {customPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`${styles.planCard}${activePlanId === plan.id ? ` ${styles.planCardActive}` : ""}`}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        display: "flex",
                        gap: 6,
                        zIndex: 1,
                      }}
                    >
                      {activePlanId === plan.id && (
                        <div className={styles.planCheck} style={{ position: "static" }}>
                          ✓
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlan(plan.id);
                        }}
                        style={{
                          background: "rgba(232,122,109,0.1)",
                          border: "1px solid rgba(232,122,109,0.25)",
                          color: "var(--red)",
                          cursor: "pointer",
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 8,
                          fontWeight: 700,
                          fontFamily: "var(--font)",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div
                      onClick={() => {
                        setActivePlanId(plan.id);
                        toast$(`Plano "${plan.name}" ativado! ✓`);
                      }}
                    >
                      <span className={styles.planBadge}>{plan.badge}</span>
                      <div className={styles.planName}>{plan.name}</div>
                      <div className={styles.planDesc}>{plan.desc}</div>
                      <div className={styles.planGrowth}>
                        {(plan.groups || []).map((g, i) => (
                          <div key={i} className={styles.planGrowthRow}>
                            <span
                              style={{
                                fontSize: 10,
                                color: g.color || "var(--gold)",
                                fontWeight: 700,
                                width: 54,
                                flexShrink: 0,
                              }}
                            >
                              {(g.label || "").slice(0, 9)}
                            </span>
                            <div className={styles.planGrowthBox}>
                              <div
                                className={styles.planGrowthFill}
                                style={{
                                  width: `${g.pct}%`,
                                  background: g.color || "var(--gold)",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: g.color || "var(--gold)",
                                width: 28,
                                textAlign: "right",
                                flexShrink: 0,
                              }}
                            >
                              {g.pct}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => setShowPlanModal(true)}
            style={{
              marginTop: 6,
              padding: "11px 24px",
              borderRadius: 12,
              border: '1px solid var(--glass-border)',
              background: "rgba(109, 197, 232, 0.05)",
              color: "var(--gold)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font)",
            }}
          >
            Criar Novo Plano Personalizado
          </button>
        </>
      )}

      {/* ── TAB: DETALHAMENTO ── */}
      {budTab === "detalhe" &&
        (activePlanId === "custom" ? (
          <>
            <div className={dashStyles.grid3}>
              {[
                {
                  label: "Total Alocado",
                  value: customRows.reduce((s, r) => s + r.limit, 0),
                  color: "var(--gold)",
                },
                {
                  label: "Total Gasto",
                  value: customRows.reduce((s, r) => s + r.spent, 0),
                  color: "var(--red)",
                },
                {
                  label: "Disponível",
                  value: customRows.reduce(
                    (s, r) => s + Math.max(0, r.limit - r.spent),
                    0,
                  ),
                  color: "var(--green)",
                },
              ].map((c, i) => (
                <div key={i} className={dashStyles.statCard}>
                  <div className={dashStyles.label}>{c.label}</div>
                  <div className={dashStyles.value} style={{ color: c.color }}>
                    {fmt(c.value)}
                  </div>
                </div>
              ))}
            </div>
            {customRows.filter((r) => r.allocPct > 0).length === 0 && (
              <div className={styles.empty}>
                Configure o plano na aba Configurar"
              </div>
            )}
            {customRows
              .filter((r) => r.allocPct > 0)
              .map((r) => {
                const over = r.usedPct > 85;
                return (
                  <div key={r.id} className={styles.groupItem}>
                    <div className={styles.groupHeader}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: r.color + "28",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 17,
                          }}
                        >
                          <CatIcon name={r.icon} size={17} color={r.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>
                            {r.label}
                          </div>
                          {/* ← cor da categoria aqui */}
                          <div
                            style={{
                              fontSize: 11,
                              color: r.color,
                              opacity: 0.85,
                              fontWeight: 600,
                              marginTop: 2,
                            }}
                          >
                            {fmtPct(r.allocPct)} da renda · {fmtPct(r.pctOfInc)}{" "}
                            utilizado
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            fontFamily: "var(--display)",
                            color: over ? "var(--red)" : r.color,
                          }}
                        >
                          {fmt(r.spent)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: r.color,
                            opacity: 0.7,
                            fontWeight: 600,
                          }}
                        >
                          de {fmt(r.limit)}
                        </div>
                      </div>
                    </div>
                    <div className={styles.groupTrack}>
                      <div
                        className={styles.groupFill}
                        style={{
                          width: `${r.usedPct}%`,
                          background: over ? "var(--red)" : r.color,
                          boxShadow: over
                            ? "0 0 8px rgba(232,122,109,0.4)"
                            : `0 0 10px ${r.color}88`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                      }}
                    >
                      <span
                        style={{
                          color: over ? "var(--red)" : "var(--green)",
                          fontWeight: 700,
                        }}
                      >
                        {over
                          ? `⚠️ ${fmt(r.limit - r.spent)} restante`
                          : `✓ ${fmt(r.limit - r.spent)} disponível`}
                      </span>
                      {/* ← cor da categoria aqui */}
                      <span
                        style={{
                          color: r.color,
                          opacity: 0.75,
                          fontWeight: 600,
                        }}
                      >
                        {fmtPct(r.usedPct)} do limite
                      </span>
                    </div>
                  </div>
                );
              })}
          </>
        ) : (
          <>
            <div className={dashStyles.grid3}>
              {budgetGroups.map((g) => (
                <div key={g.id} className={dashStyles.statCard}>
                  <span
                    style={{ fontSize: 22, marginBottom: 10, display: "block" }}
                  >
                    <CatIcon name={g.icon} size={22} color={g.color} />
                  </span>
                  <div className={dashStyles.label}>{g.label}</div>
                  <div
                    className={dashStyles.value}
                    style={{ color: g.color, fontSize: 20 }}
                  >
                    {g.id === "pou" ? fmt(Math.max(0, balance)) : fmt(g.spent)}
                  </div>
                  {/* ← meta com cor do grupo */}
                  <div
                    className={dashStyles.subLabel}
                    style={{ color: g.color, opacity: 0.7, fontWeight: 600 }}
                  >
                    meta: {g.pct}% = {fmt(g.limit)}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color:
                        g.id === "pou"
                          ? balance >= (g.pct / 100) * totalIncome
                            ? "var(--green)"
                            : "var(--gold)"
                          : g.spent > g.limit
                            ? "var(--red)"
                            : "var(--green)",
                    }}
                  >
                    {g.id === "pou"
                      ? fmtPct(
                          totalIncome > 0
                            ? (Math.max(0, balance) / totalIncome) * 100
                            : 0,
                        ) + " poupado"
                      : fmtPct(
                          totalIncome > 0 ? (g.spent / totalIncome) * 100 : 0,
                        ) + " da renda"}
                  </div>
                </div>
              ))}
            </div>

            {budgetGroups.map((g) => (
              <div key={g.id} className={styles.groupItem}>
                <div className={styles.groupHeader}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: g.color + "28",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      <CatIcon name={g.icon} size={20} color={g.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>
                        {g.label}
                      </div>
                      {/* ← cor do grupo aqui */}
                      <div
                        style={{
                          fontSize: 11,
                          color: g.color,
                          opacity: 0.8,
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        Meta: {fmtPct(g.pct)} da renda = {fmt(g.limit)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        fontFamily: "var(--display)",
                        color: g.color,
                      }}
                    >
                      {g.id === "pou"
                        ? fmt(Math.max(0, balance))
                        : fmt(g.spent)}
                    </div>
                    {/* ← cor do grupo aqui */}
                    <div
                      style={{
                        fontSize: 11,
                        color: g.color,
                        opacity: 0.7,
                        fontWeight: 600,
                      }}
                    >
                      {g.id === "pou"
                        ? totalIncome > 0
                          ? fmtPct((Math.max(0, balance) / totalIncome) * 100) +
                            " poupado"
                          : "—"
                        : totalIncome > 0
                          ? fmtPct((g.spent / totalIncome) * 100) + " da renda"
                          : "—"}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: 10,
                    borderRadius: 99,
                    background: "var(--surface3)",
                    position: "relative",
                    overflow: "hidden",
                    margin: "12px 0 6px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: `${g.pct}%`,
                      background: g.color + "15",
                      borderRadius: 99,
                    }}
                  />
                  {g.id === "pou" ? (
                    <div
                      style={{
                        position: "absolute",
                        height: "100%",
                        width: `${totalIncome > 0 ? Math.min((Math.max(0, balance) / totalIncome) * 100, 100) : 0}%`,
                        background:
                          balance >= (g.pct / 100) * totalIncome
                            ? "var(--green)"
                            : "var(--gold)",
                        borderRadius: 99,
                        transition: "width 1s",
                        boxShadow: "0 0 10px rgba(109,232,160,0.5)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        height: "100%",
                        width: `${Math.min(g.usedPct, 100)}%`,
                        background: g.spent > g.limit ? "var(--red)" : g.color,
                        borderRadius: 99,
                        transition: "width 1s",
                        boxShadow: `0 0 10px ${g.color}88`,
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    marginBottom: g.cats.length > 0 ? 12 : 0,
                  }}
                >
                  {g.id === "pou" ? (
                    <span
                      style={{
                        color:
                          balance >= (g.pct / 100) * totalIncome
                            ? "var(--green)"
                            : "var(--gold)",
                        fontWeight: 700,
                      }}
                    >
                      {balance >= (g.pct / 100) * totalIncome
                        ? "✓ Meta atingida!"
                        : `Faltam ${fmt(Math.max(0, (g.pct / 100) * totalIncome - balance))} para a meta`}
                    </span>
                  ) : (
                    <span
                      style={{
                        color:
                          g.spent > g.limit ? "var(--red)" : "var(--green)",
                        fontWeight: 700,
                      }}
                    >
                      {g.spent > g.limit
                        ? `⚠️ ${fmt(g.spent - g.limit)} acima do limite`
                        : `✓ ${fmt(g.limit - g.spent)} disponível`}
                    </span>
                  )}
                  {/* ← cor do grupo aqui */}
                  <span
                    style={{ color: g.color, opacity: 0.75, fontWeight: 600 }}
                  >
                    {fmtPct(
                      g.id === "pou"
                        ? totalIncome > 0
                          ? Math.min(
                              (Math.max(0, balance) / totalIncome) * 100,
                              100,
                            )
                          : 0
                        : g.usedPct,
                    )}{" "}
                    do limite
                  </span>
                </div>
                {g.cats.map(
                  (cat) =>
                    cat && (
                      <div key={cat.id} className={styles.groupCategory}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: (cat.color || "#888") + "28",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          <CatIcon name={cat.icon} size={13} color={cat.color} />
                        </div>
                        <div style={{ flex: 1, marginLeft: 4 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{ fontWeight: 600, color: "var(--text)" }}
                            >
                              {cat.label}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              {/* ← cor da categoria aqui */}
                              <span
                                style={{
                                  fontSize: 10,
                                  color: cat.color || g.color,
                                  opacity: 0.8,
                                  fontWeight: 700,
                                }}
                              >
                                {fmtPct(cat.pctOfInc)} da renda
                              </span>
                              <span
                                style={{
                                  fontWeight: 800,
                                  color: cat.color || "var(--gold)",
                                }}
                              >
                                {fmt(cat.spent)}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 99,
                              background: "var(--surface3)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min(cat.pctOfGroup, 100)}%`,
                                borderRadius: 99,
                                background: cat.color || g.color,
                                transition: "width 0.8s",
                                boxShadow: `0 0 6px ${cat.color || g.color}88`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                )}
              </div>
            ))}
          </>
        ))}

      {/* ── TAB: CUSTOM CONFIG ── */}
      {budTab === "custom" && activePlanId === "custom" && (
        <div className={dashStyles.panel}>
          <div className={dashStyles.panelHeader}>
            <div>
              <div className={dashStyles.panelTitle}>Configurar Plano Personalizado</div>
              <div
                style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}
              >
                Defina qual % da sua renda vai para cada categoria
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color:
                    Math.abs(customTotal - 100) < 0.5
                      ? "var(--green)"
                      : customTotal > 100
                        ? "var(--red)"
                        : "var(--gold)",
                }}
              >
                {customTotal.toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>
                {Math.abs(customTotal - 100) < 0.5
                  ? "✓ Total OK"
                  : `${(100 - customTotal).toFixed(1)}% restante`}
              </div>
              <div className="pct-bar" style={{ width: 160, marginTop: 6 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(customTotal, 100)}%`,
                    background:
                      customTotal > 100 ? "var(--red)" : "var(--gold)",
                    borderRadius: 99,
                    transition: "width 0.4s",
                  }}
                />
              </div>
            </div>
          </div>

          {categories.map((cat) => {
            const e = customBudget.find((x) => x.catId === cat.id) || {
              pct: 0,
            };
            return (
              <div key={cat.id} className={styles.customRow}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: cat.color + "28",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  <CatIcon name={cat.icon} size={16} color={cat.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {cat.label}
                  </div>
                  {/* ← cor da categoria aqui */}
                  <div
                    style={{
                      fontSize: 11,
                      color: e.pct > 0 ? cat.color : "var(--text3)",
                      opacity: e.pct > 0 ? 0.85 : 1,
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    {e.pct > 0
                      ? `= ${fmt((e.pct / 100) * totalIncome)} / mês`
                      : "Sem alocação"}
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.percentInput}
                  value={e.pct || ""}
                  onChange={(ev) => {
                    const val = ev.target.value.replace(/[^0-9]/g, "");
                    if (val === "" || (Number(val) >= 0 && Number(val) <= 100)) {
                      updCustPct(cat.id, val);
                    }
                  }}
                  placeholder="0"
                />
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text3)",
                    fontWeight: 600,
                  }}
                >
                  %
                </span>
              </div>
            );
          })}

          {Math.abs(customTotal - 100) < 0.5 && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(109,232,160,0.07)",
                border: "1px solid rgba(109,232,160,0.2)",
                fontSize: 12,
                color: "var(--green)",
                fontWeight: 600,
              }}
            >
              ✓ Plano configurado — {fmt(totalIncome)} distribuídos entre as
              categorias.
            </div>
          )}
        </div>
      )}
    </>
  );
}