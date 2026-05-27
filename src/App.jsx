import { useMemo, useState } from "react";

function money(value) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function num(value) {
  return parseFloat(value) || 0;
}

function blankApplicant() {
  return {
    name: "",
    surname: "",
    creditScore: "",
    salaryType: "Fixed",
    grossIncome: "",
    netIncome: "",
    itcDebt: "",
    months: Array.from({ length: 6 }, () => ({
      gross: "",
      net: "",
    })),
  };
}

export default function App() {
  const [applicantCount, setApplicantCount] = useState(1);
  const [bondAmount, setBondAmount] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [applicants, setApplicants] = useState([
    blankApplicant(),
    blankApplicant(),
  ]);

  const updateApplicant = (index, field, value) => {
    const copy = [...applicants];
    copy[index][field] = value;
    setApplicants(copy);
  };

  const updateMonth = (appIndex, monthIndex, field, value) => {
    const copy = [...applicants];
    copy[appIndex].months[monthIndex][field] = value;
    setApplicants(copy);
  };

  const results = useMemo(() => {
    const active = applicants.slice(0, applicantCount);

    const processed = active.map((a) => {
      if (a.salaryType === "Variable") {
        const gross =
          a.months.reduce((s, m) => s + num(m.gross), 0) / 6;

        const net =
          a.months.reduce((s, m) => s + num(m.net), 0) / 6;

        return {
          gross,
          net,
          itcDebt: num(a.itcDebt),
        };
      }

      return {
        gross: num(a.grossIncome),
        net: num(a.netIncome),
        itcDebt: num(a.itcDebt),
      };
    });

    const totalGross = processed.reduce((s, a) => s + a.gross, 0);
    const totalNet = processed.reduce((s, a) => s + a.net, 0);
    const totalDebt = processed.reduce((s, a) => s + a.itcDebt, 0);

    const livingCosts = applicantCount === 1 ? 3500 : 5000;

    const netAfter =
      totalNet - totalDebt - livingCosts;

    const option1 =
      ((totalGross * 0.3) / 9.5) * 1000;

    const option2 =
      (netAfter / 9.5) * 1000;

    const finalAmount =
      Math.min(option1, option2);

    const bondRepayment =
      (num(bondAmount) / 1000) * 9.5;

    const cashLeft =
      netAfter - bondRepayment;

    return {
      totalGross,
      totalNet,
      totalDebt,
      livingCosts,
      netAfter,
      option1,
      option2,
      finalAmount,
      bondRepayment,
      cashLeft,
    };
  }, [applicants, applicantCount, bondAmount]);

  const emailReport = () => {
    const body = `
Property Affordability Report

Final Affordability:
${money(results.finalAmount)}

Option 1:
${money(results.option1)}

Option 2:
${money(results.option2)}

Bond Repayment:
${money(results.bondRepayment)}

Cash Left:
${money(results.cashLeft)}
`;

    window.location.href =
      `mailto:${agentEmail}?subject=Affordability Report&body=${encodeURIComponent(body)}`;
  };

  return (
    <div style={{
      padding: 30,
      fontFamily: "Arial",
      maxWidth: 1200,
      margin: "0 auto"
    }}>
      <h1>Property Affordability Calculator</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Applicants: </label>

        <select
          value={applicantCount}
          onChange={(e) =>
            setApplicantCount(Number(e.target.value))
          }
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </div>

      {applicants.slice(0, applicantCount).map((a, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
        >
          <h2>Applicant {i + 1}</h2>

          <input
            placeholder="Name"
            value={a.name}
            onChange={(e) =>
              updateApplicant(i, "name", e.target.value)
            }
          />

          <br /><br />

          <select
            value={a.salaryType}
            onChange={(e) =>
              updateApplicant(i, "salaryType", e.target.value)
            }
          >
            <option>Fixed</option>
            <option>Variable</option>
          </select>

          <br /><br />

          {a.salaryType === "Fixed" ? (
            <>
              <input
                type="number"
                placeholder="Gross Income"
                value={a.grossIncome}
                onChange={(e) =>
                  updateApplicant(i, "grossIncome", e.target.value)
                }
              />

              <br /><br />

              <input
                type="number"
                placeholder="Net Income"
                value={a.netIncome}
                onChange={(e) =>
                  updateApplicant(i, "netIncome", e.target.value)
                }
              />
            </>
          ) : (
            <>
              {a.months.map((m, mi) => (
                <div key={mi}>
                  <input
                    type="number"
                    placeholder={`Month ${mi + 1} Gross`}
                    value={m.gross}
                    onChange={(e) =>
                      updateMonth(i, mi, "gross", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    placeholder={`Month ${mi + 1} Net`}
                    value={m.net}
                    onChange={(e) =>
                      updateMonth(i, mi, "net", e.target.value)
                    }
                  />

                  <br /><br />
                </div>
              ))}
            </>
          )}

          <input
            type="number"
            placeholder="ITC Debt"
            value={a.itcDebt}
            onChange={(e) =>
              updateApplicant(i, "itcDebt", e.target.value)
            }
          />
        </div>
      ))}

      <div style={{
        border: "1px solid #ddd",
        padding: 20,
        borderRadius: 10
      }}>
        <h2>Results</h2>

        <p>Total Gross: {money(results.totalGross)}</p>
        <p>Total Net: {money(results.totalNet)}</p>
        <p>Net After Deductions: {money(results.netAfter)}</p>

        <p>Option 1: {money(results.option1)}</p>
        <p>Option 2: {money(results.option2)}</p>

        <h2>
          Final Affordability:
          {money(results.finalAmount)}
        </h2>

        <br />

        <input
          type="number"
          placeholder="Bond Amount"
          value={bondAmount}
          onChange={(e) => setBondAmount(e.target.value)}
        />

        <p>Bond Repayment: {money(results.bondRepayment)}</p>

        <p>Cash Left: {money(results.cashLeft)}</p>

        <br />

        <input
          type="email"
          placeholder="Agent Email"
          value={agentEmail}
          onChange={(e) => setAgentEmail(e.target.value)}
        />

        <br /><br />

        <button onClick={emailReport}>
          Email Report
        </button>
      </div>
    </div>
  );
}