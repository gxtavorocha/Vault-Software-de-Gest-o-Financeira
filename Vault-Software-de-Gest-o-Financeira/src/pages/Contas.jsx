import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useAppContext } from "../context/AppContext";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { fmt } from "../utils/format";
import { IoAdd, IoWalletOutline } from "react-icons/io5";
import { RiBankCardLine, RiBankLine } from "react-icons/ri";
import { MdOutlineAttachMoney } from "react-icons/md";
import { BANK_CARDS } from "../constants";
import ManageAccountModal from "../components/modals/ManageAccountModal";
import styles from "./Cartoes.module.css";
import dashStyles from "./Dashboard.module.css";

const limitName = (name, maxLength = 12) =>
  name.length > maxLength ? name.slice(0, maxLength) + "…" : name;

function AccountCard({ account }) {
  const bank = BANK_CARDS.find(b => b.id === account.bankId) 
    || BANK_CARDS.find(b => b.colors[0] === account.grad?.[0]) 
    || BANK_CARDS[0];

  return (
    <div className={styles.cardContainer}>
      <div
        className={styles.creditCard}
        style={{
          background: `linear-gradient(135deg,${bank.colors[0]},${bank.colors[1]})`,
          color: bank.textColor,
          border: bank.border || "none",
        }}
      >
        <div className={styles.cardSec1} />

        <div className={styles.cardHeader} style={{ alignItems: "flex-start", marginBottom: 12 }}>
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
            <div className={styles.cardName} style={{ marginTop: 2, color: bank.textColor }}>{account.name || bank.name}</div>
          </div>
          <div style={{ color: bank.textColor, opacity: 0.95 }}>
            <RiBankLine size={32} />
          </div>
        </div>

        <div className={styles.cardNumber} style={{ opacity: 0.85, fontSize: 13, letterSpacing: "2px", marginBottom: 16 }}>
          Conta {account.type}
        </div>

        <div className={styles.cardFooter} style={{ color: bank.textColor, marginTop: 10 }}>
          <div>
            <div className={styles.footerLabel} style={{ color: bank.textColor, opacity: 0.8 }}>Saldo Disponível</div>
            <div className={styles.footerValue} style={{ color: bank.textColor, fontSize: 18 }}>
              R$ {account.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Contas() {
  const [showManageModal, setShowManageModal] = useState(false);
  const { accountHook } = useFinance();
  const { showToast } = useAppContext();
  
  if (!accountHook) return null; // Fallback se contexto quebrar

  const { accounts, openNewAccount, openEditAccount } = accountHook;

  const removeAccount = (id) => {
    if (accountHook.removeAccount(id)) showToast("Conta bancária removida permanentemente.", "err");
  };

  // Totalizadores
  const totalBalance = accounts.reduce((sum, c) => sum + c.balance, 0);

  // Gráfico de Pizza (Apenas contas com saldo positivo)
  const chartData = accounts
    .filter(c => c.balance > 0)
    .map((c) => ({
      name: limitName(c.name || c.bankId),
      saldo: c.balance,
      grad: c.grad || BANK_CARDS[0].colors,
  }));

  const summaryCards = [
    {
      label: "Patrimônio Total (Contas)",
      value: totalBalance,
      color: totalBalance >= 0 ? "var(--green)" : "var(--red)",
      icon: <MdOutlineAttachMoney />,
    },
    {
      label: "Nº de Contas",
      value: accounts.length,
      color: "var(--text)",
      icon: <IoWalletOutline />,
      isRaw: true 
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
        <div className="pg-title">Contas Bancárias</div>
        <button onClick={openNewAccount} className={styles.btnAddCard}>
          Nova Conta
        </button>
      </div>
      <div className="pg-sub">
        Gestão unificada de contas correntes, poupanças e corretoras · {accounts.length} conta
        {accounts.length !== 1 ? "s" : ""} cadastrada
        {accounts.length !== 1 ? "s" : ""}
      </div>

      {accounts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <RiBankCardLine />
          </div>
          <div className={styles.emptyTitle}>Nenhuma conta bancária</div>
          <div className={styles.emptyDesc}>
            Adicione sua primeira conta para vincular suas despesas e receitas, centralizando seu patrimônio de forma automatizada.
          </div>
          <button onClick={openNewAccount} className={styles.btnFirstCard}>
            Conectar primeira conta
          </button>
        </div>
      )}

      {accounts.length > 0 && (
        <>
          <div className={styles.cardGrid}>
            {accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
            
            {/* ── Pseudo-Cartão de Gerenciamento ── */}
            <div 
              className={styles.cardContainer} 
              style={{ 
                cursor: "pointer", 
                display: "flex", 
                flexDirection: "column", 
                gap: 12, 
                height: "100%", 
                minHeight: 218,
                justifyContent: "center", 
                alignItems: "center", 
                border: "1px solid rgba(150, 150, 150, 0.25)", 
                borderRadius: 20, 
                background: "rgba(150, 150, 150, 0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                opacity: 0.85
              }} 
              onClick={() => setShowManageModal(true)}
              onMouseEnter={(e) => { 
                e.currentTarget.style.opacity = 1; 
                e.currentTarget.style.background = "rgba(150, 150, 150, 0.2)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.08)";
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.opacity = 0.85; 
                e.currentTarget.style.background = "rgba(150, 150, 150, 0.1)";
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.05)";
              }}
            >
              <IoAdd size={56} color="var(--text2)" />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Gerenciar Contas</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>Editar ou Excluir contas</div>
              </div>
            </div>
          </div>

          <div className={dashStyles.grid2}>
            
            <div className={dashStyles.panel}>
              <div className={dashStyles.panelHeader}>
                <div className={dashStyles.panelTitle}>Ativos em Contas</div>
                <div className={styles.emptyDesc} style={{ margin: 0 }}>Distribuição do seu patrimônio</div>
              </div>
              
              {chartData.length === 0 ? (
                <div style={{ color: "var(--text2)", textAlign: "center", paddingTop: 40, opacity: 0.7 }}>
                  Nenhum saldo positivo consolidado.
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ flexShrink: 0, position: "relative", width: 160, height: 160 }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="saldo"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {chartData.map((c, i) => (
                            <Cell key={i} fill={c.grad[0]} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Total centralizado */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text2)", letterSpacing: "1px", textTransform: "uppercase" }}>Total Líquido</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{fmt(totalBalance)}</div>
                    </div>
                  </div>

                  <div className={styles.legendContainer}>
                    {chartData.map((acc, i) => {
                      const sharePct = totalBalance > 0 ? ((acc.saldo / totalBalance) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={i}>
                          <div className={styles.legendHeader}>
                            <div className={styles.usageInfo}>
                              <div className={styles.usageDot} style={{ background: acc.grad[0], width: 10, height: 10, borderRadius: 3 }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{acc.name}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: acc.grad[0] }}>{sharePct}%</span>
                          </div>
                          <div className={styles.usageTrack} style={{ height: 6 }}>
                            <div className={styles.usageFill} style={{ width: `${sharePct}%`, background: `linear-gradient(90deg, ${acc.grad[0]}, ${acc.grad[1] || acc.grad[0]})`, boxShadow: `0 0 6px ${acc.grad[0]}66` }} />
                          </div>
                          <div className={styles.usageFooter}>{fmt(acc.saldo)} consolidados</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className={dashStyles.panel} style={{ flex: 1, minWidth: 280 }}>
              <div className={dashStyles.panelHeader}>
                <div className={dashStyles.panelTitle}>Síntese Financeira</div>
              </div>
              <div style={{ paddingTop: 10 }}>
                {summaryCards.map((s, i) => (
                  <div key={i} style={{ marginBottom: i === summaryCards.length -1 ? 0: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg3)", display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                      <div>
                         <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{s.label}</div>
                         <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.isRaw ? s.value : fmt(s.value)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {showManageModal && (
        <ManageAccountModal 
          accounts={accounts}
          onEdit={openEditAccount}
          onRemove={removeAccount}
          onClose={() => setShowManageModal(false)}
        />
      )}
    </>
  );
}