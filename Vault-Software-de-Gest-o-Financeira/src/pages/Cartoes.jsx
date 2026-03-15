import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "../components/ChartTooltip";
import { fmt } from "../utils/format";
import { IoAdd } from "react-icons/io5";
import { MdOutlineCreditScore } from "react-icons/md";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoCard } from "react-icons/io5";
import { MdAddCard } from "react-icons/md";

const truncateName = (name, maxLength = 12) =>
  name.length > maxLength ? name.slice(0, maxLength) + "…" : name;

const calcUsagePct = (balance, limit) =>
  limit > 0 ? (balance / limit) * 100 : 0;

function CreditCard({ card, onEdit, onRemove }) {
  const usagePct = calcUsagePct(card.balance, card.limit);

  return (
    <div style={{ position: "relative" }}>
      <div
        className="cc"
        style={{
          background: `linear-gradient(135deg,${card.grad[0]},${card.grad[1]})`,
        }}
      >
        <div className="cc-s" />
        <div className="cc-s2" />

        {}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            display: "flex",
            gap: 6,
            zIndex: 2,
          }}
        >
          <button
            onClick={() => onEdit(card)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            ✎
          </button>
          <button
            onClick={() => onRemove(card.id)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(232,122,109,0.25)",
              border: "1px solid rgba(232,122,109,0.4)",
              color: "#fca5a5",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Bandeira e nome */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 3,
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              {card.flag}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                paddingRight: 70,
              }}
            >
              {card.name}
            </div>
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.6)",
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          >
            ▣
          </div>
        </div>

        {/* Número mascarado */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "3px",
            marginBottom: 16,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          •••• •••• •••• {card.digits}
        </div>

        {/* Fatura e limite */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 2,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Fatura Atual
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
              R$ {card.balance.toLocaleString("pt-BR")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 2,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Limite
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              R$ {card.limit.toLocaleString("pt-BR")}
            </div>
            {card.due && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
                Vence dia {card.due}
              </div>
            )}
          </div>
        </div>

        {/* Barra de uso */}
        <div
          style={{
            marginTop: 12,
            height: 4,
            borderRadius: 99,
            background: "rgba(255,255,255,0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(usagePct, 100)}%`,
              borderRadius: 99,
              background: "rgba(255,255,255,0.75)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
            fontSize: 10,
            color: "rgba(255,255,255,0.65)",
          }}
        >
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
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 7,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: card.grad[0],
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontWeight: 600,
              maxWidth: 140,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.name}
          </span>
        </div>
        <span
          style={{
            fontWeight: 800,
            color: warn ? "var(--red)" : "var(--green)",
            flexShrink: 0,
          }}
        >
          {pct.toFixed(0)}%
        </span>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: "var(--surface3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(pct, 100)}%`,
            borderRadius: 99,
            background: warn
              ? `linear-gradient(90deg,${card.grad[0]},var(--red))`
              : `linear-gradient(90deg,${card.grad[0]},var(--green))`,
            transition: "width 0.8s",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--text2)",
          marginTop: 4,
        }}
      >
        <span>R$ {card.balance.toLocaleString("pt-BR")} usado</span>
        {card.due && <span>Vence dia {card.due}</span>}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Cartoes({
  cards,
  openNewCard,
  openEditCard,
  removeCard,
}) {
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
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <div className="pg-title">Meus Cartões</div>
        <button
          onClick={openNewCard}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg,var(--gold),var(--gold2))",
            border: "none",
            color: "#0A0B0E",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "var(--font)",
            boxShadow: "0 4px 20px rgba(232,184,109,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          Adicionar Cartão
        </button>
      </div>
      <div className="pg-sub">
        Controle de faturas e limites · {cards.length} cartão
        {cards.length !== 1 ? "s" : ""} cadastrado
        {cards.length !== 1 ? "s" : ""}
      </div>

      {/* ── Empty state ── */}
      {cards.length === 0 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px dashed rgba(232,184,109,0.25)",
            borderRadius: 18,
            padding: 48,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}><MdAddCard /></div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text2)",
              marginBottom: 8,
            }}
          >
            Nenhum cartão cadastrado
          </div>
          <div
            style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}
          >
            Adicione seus cartões para controlar faturas e limites
          </div>
          <button
            onClick={openNewCard}
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              background: "var(--gold3)",
              border: "1px solid rgba(232,184,109,0.3)",
              color: "var(--gold)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font)",
            }}
          >
            Adicionar primeiro cartão
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <>
          {/* ── Cards visuais ── */}
          <div className="cg2">
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
          <div className="g2">
            {/* Distribuição de gastos entre cartões */}
            <div className="panel">
              <div className="ph">
                <div className="pt">Distribuição de Faturas</div>
                <div className="pdesc">Proporção de gastos entre cartões</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {/* Donut chart */}
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

                {/* Legenda com detalhes por cartão */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {cards.map((card) => {
                    const sharePct =
                      totalFatura > 0
                        ? ((card.balance / totalFatura) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <div key={card.id}>
                        {/* Nome e percentual */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 3,
                                background: card.grad[0],
                                flexShrink: 0,
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

                        {/* Barra proporcional */}
                        <div
                          style={{
                            height: 6,
                            borderRadius: 99,
                            background: "var(--surface3)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${sharePct}%`,
                              borderRadius: 99,
                              background: `linear-gradient(90deg, ${card.grad[0]}, ${card.grad[1]})`,
                              transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
                              boxShadow: `0 0 6px ${card.grad[0]}66`,
                            }}
                          />
                        </div>

                        {/* Valor abaixo */}
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: "var(--text2)",
                          }}
                        >
                          {fmt(card.balance)} de {fmt(card.limit)} de limite
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Utilização dos limites */}
            <div className="panel">
              <div className="ph">
                <div className="pt">Utilização dos Limites</div>
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
          <div className="g3">
            {summaryCards.map((s, i) => (
              <div key={i} className="sc">
                <span
                  style={{ fontSize: 20, marginBottom: 12, display: "block" }}
                >
                  {s.icon}
                </span>
                <div className="sc-lbl">{s.label}</div>
                <div
                  className="sc-val"
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
