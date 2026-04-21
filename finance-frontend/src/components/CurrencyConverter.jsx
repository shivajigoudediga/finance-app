import { useState, useEffect, useCallback } from "react";
import { getRates } from "../api/financeApi";
import "./CurrencyConverter.css";

const CURRENCIES = {
  USD: { name: "US Dollar",       symbol: "$",  flag: "🇺🇸" },
  EUR: { name: "Euro",            symbol: "€",  flag: "🇪🇺" },
  GBP: { name: "British Pound",   symbol: "£",  flag: "🇬🇧" },
  INR: { name: "Indian Rupee",    symbol: "₹",  flag: "🇮🇳" },
  JPY: { name: "Japanese Yen",    symbol: "¥",  flag: "🇯🇵" },
  AED: { name: "UAE Dirham",      symbol: "د.إ",flag: "🇦🇪" },
  SGD: { name: "Singapore Dollar",symbol: "S$", flag: "🇸🇬" },
  CAD: { name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  AUD: { name: "Australian Dollar",symbol: "A$",flag: "🇦🇺" },
  CHF: { name: "Swiss Franc",     symbol: "Fr", flag: "🇨🇭" },
};

const SUPPORTED = Object.keys(CURRENCIES);

function fmt(value, code) {
  const digits = ["JPY"].includes(code) ? 0 : 2;
  return value.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export default function CurrencyConverter() {
  const [from, setFrom]           = useState("INR");
  const [to, setTo]               = useState("USD");
  const [amount, setAmount]       = useState("1000");
  const [rates, setRates]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [updated, setUpdated]     = useState(null);
  const [activeTab, setActiveTab] = useState("converter");

  const fetchRates = useCallback((base) => {
    setLoading(true);
    setError(null);
    getRates(base)
      .then((r) => {
        const filtered = {};
        SUPPORTED.forEach((c) => { if (r[c]) filtered[c] = r[c]; });
        setRates(filtered);
        setUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      })
      .catch(() => setError("Live rates unavailable. Showing last cached data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRates(from); }, [from, fetchRates]);

  const parsed  = parseFloat(amount) || 0;
  const result  = rates?.[to] ? parsed * rates[to] : 0;
  const rate    = rates?.[to] ?? null;

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="cc-wrap">
      <div className="cc-tabs">
        <button className={`cc-tab ${activeTab === "converter" ? "active" : ""}`}
          onClick={() => setActiveTab("converter")}>Converter</button>
        <button className={`cc-tab ${activeTab === "allrates" ? "active" : ""}`}
          onClick={() => setActiveTab("allrates")}>All Rates</button>
      </div>

      {error && <div className="cc-error-banner">{error}</div>}

      {activeTab === "converter" && (
        <div className="cc-converter">
          <div className="cc-field">
            <div className="cc-field-label">
              <span className="cc-flag-lg">{CURRENCIES[from].flag}</span>
              <div>
                <span className="cc-currency-code">{from}</span>
                <span className="cc-currency-name">{CURRENCIES[from].name}</span>
              </div>
              <select className="cc-select" value={from} onChange={(e) => setFrom(e.target.value)}>
                {SUPPORTED.map((c) => <option key={c} value={c}>{c} — {CURRENCIES[c].name}</option>)}
              </select>
            </div>
            <div className="cc-input-row">
              <span className="cc-sym">{CURRENCIES[from].symbol}</span>
              <input
                type="number"
                className="cc-input"
                value={amount}
                min="0"
                step="any"
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>

          <button className="cc-swap" onClick={handleSwap} title="Swap">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 8l-3 3 3 3M15 12l3-3-3-3M2 11h16M2 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="cc-field cc-result-field">
            <div className="cc-field-label">
              <span className="cc-flag-lg">{CURRENCIES[to].flag}</span>
              <div>
                <span className="cc-currency-code">{to}</span>
                <span className="cc-currency-name">{CURRENCIES[to].name}</span>
              </div>
              <select className="cc-select" value={to} onChange={(e) => setTo(e.target.value)}>
                {SUPPORTED.map((c) => <option key={c} value={c}>{c} — {CURRENCIES[c].name}</option>)}
              </select>
            </div>
            <div className="cc-input-row">
              <span className="cc-sym cc-sym-result">{CURRENCIES[to].symbol}</span>
              {loading
                ? <span className="cc-loading-text">Fetching…</span>
                : <span className="cc-result-num">{fmt(result, to)}</span>
              }
            </div>
          </div>

          {!loading && rate && (
            <div className="cc-rate-strip">
              <span>1 {CURRENCIES[from].symbol} {from} = {CURRENCIES[to].symbol} {fmt(rate, to)} {to}</span>
              {updated && <span className="cc-updated-badge">Live · {updated}</span>}
              <button className="cc-refresh-btn" onClick={() => fetchRates(from)} title="Refresh rates">↻</button>
            </div>
          )}
        </div>
      )}

      {activeTab === "allrates" && (
        <div className="cc-allrates">
          <div className="cc-allrates-header">
            <span>Base currency:</span>
            <select className="cc-select cc-base-select" value={from} onChange={(e) => setFrom(e.target.value)}>
              {SUPPORTED.map((c) => <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>)}
            </select>
            <input
              className="cc-input cc-base-input"
              type="number"
              value={amount}
              min="0"
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>
          {loading ? (
            <div className="cc-skeleton-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="cc-skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="cc-rates-grid">
              {SUPPORTED.filter((c) => c !== from).map((code) => {
                const val = rates?.[code] ? (parsed || 1) * rates[code] : null;
                return (
                  <div
                    key={code}
                    className={`cc-rate-card ${code === to ? "cc-rate-card--active" : ""}`}
                    onClick={() => { setTo(code); setActiveTab("converter"); }}
                  >
                    <div className="cc-rate-card-top">
                      <span className="cc-rate-flag">{CURRENCIES[code].flag}</span>
                      <span className="cc-rate-code">{code}</span>
                    </div>
                    <div className="cc-rate-val">
                      {val !== null ? `${CURRENCIES[code].symbol}${fmt(val, code)}` : "—"}
                    </div>
                    <div className="cc-rate-name">{CURRENCIES[code].name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}