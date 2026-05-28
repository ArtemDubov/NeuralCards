import React, { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  faGraduationCap,
  faBolt,
  faXmark,
  faEye,
  faEyeSlash,
  faCheck,
} from "../../utils/icons";

const TEST_LOGIN_A = { email: "aaaaaa@email.com", password: "aaaaaa" };
const TEST_REG_A = { name: "A", email: "aaaaaa@email.com", password: "aaaaaa" };

const TEST_LOGIN_B = { email: "bbbbbb@email.com", password: "bbbbbb" };
const TEST_REG_B = { name: "B", email: "bbbbbb@email.com", password: "bbbbbb" };

const TEST_REG = { name: "Test User", email: `test_${Math.random().toString(36).substring(2, 8)}@email.com`, password: "aaaaaa" };

export default function AuthModal({ mode, onClose }) {
  const [tab, setTab] = useState(mode || "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const t = currentTheme;

  // Блокируем скролл страницы когда модалка открыта
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Обработчик Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const strength = (p) => {
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const str = strength(password);
  const strLabels = ["", "Слабый", "Средний", "Хороший", "Сильный", "Отличный"];
  const strColors = ["", "#e74c3c", "#f39c12", "#3498db", "#2ecc71", "#27ae60"];

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    if (tab === "register") {
      if (password !== confirm) { setError("Пароли не совпадают"); return; }
      if (password.length < 6) { setError("Минимум 6 символов"); return; }
    }
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onClose();
      navigate("/dashboard");
    } catch (err) {
      const m = err.response?.data?.detail;
      setError(Array.isArray(m) ? m.map((x) => x.msg).join(", ") : typeof m === "string" ? m : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [tab, email, password, confirm, name, login, register, onClose, navigate]);

  const fillTestA = () => {
    const d = tab === "login" ? TEST_LOGIN_A : TEST_REG_A;
    setName(d.name || ""); setEmail(d.email); setPassword(d.password);
    if (tab === "register") setConfirm(d.password);
  };

  const fillTestB = () => {
    const d = tab === "login" ? TEST_LOGIN_B : TEST_REG_B;
    setName(d.name || ""); setEmail(d.email); setPassword(d.password);
    if (tab === "register") setConfirm(d.password);
  };

  return ReactDOM.createPortal(
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, background: t.surface, border: `1px solid ${t.border}` }}>
        {/* Header */}
        <div style={{ ...styles.header, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FontAwesomeIcon icon={faGraduationCap} style={{ fontSize: 28, color: t.primary }} />
            <span style={{ fontSize: 20, fontWeight: 800, color: t.text }}>NeuralCards</span>
          </div>
          <button onClick={onClose} style={{ ...styles.closeBtn, color: t.textSecondary }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${t.border}` }}>
          {["login", "register"].map((mode) => (
            <button
              key={mode}
              onClick={() => { setTab(mode); setError(""); }}
              style={{
                ...styles.tab,
                color: tab === mode ? t.primary : t.textSecondary,
                fontWeight: tab === mode ? 700 : 500,
              }}
            >
              {mode === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={styles.body}>
          {error && <div style={{ ...styles.error, background: `${t.error || "var(--nt-error)"}15`, color: t.error || "var(--nt-error)" }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {tab === "register" && (
              <div style={styles.field}>
                <label style={{ ...styles.label, color: t.textSecondary }}>Имя</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" required style={{ ...styles.input, background: t.backgroundSecondary, border: `1px solid ${t.border}`, color: t.text }} />
              </div>
            )}
            <div style={styles.field}>
              <label style={{ ...styles.label, color: t.textSecondary }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required style={{ ...styles.input, background: t.backgroundSecondary, border: `1px solid ${t.border}`, color: t.text }} />
            </div>
            <div style={styles.field}>
              <label style={{ ...styles.label, color: t.textSecondary }}>Пароль</label>
              <div style={{ position: "relative" }}>
                <input type={showP ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tab === "register" ? "Минимум 6 символов" : "Введите пароль"} required minLength={6} style={{ ...styles.input, ...styles.passInput, background: t.backgroundSecondary, border: `1px solid ${t.border}`, color: t.text }} />
                <button type="button" onClick={() => setShowP(!showP)} style={{ ...styles.eyeBtn, color: t.textSecondary }}><FontAwesomeIcon icon={showP ? faEyeSlash : faEye} /></button>
              </div>
              {tab === "register" && (
                <div style={styles.strBar}>
                  {[1,2,3,4,5].map((i) => <div key={i} style={{ ...styles.strSeg, background: password.length > 0 && i <= str ? strColors[str] : `${t.textSecondary}20` }} />)}
                  <span style={{ ...styles.strLabel, color: password.length > 0 ? strColors[str] : t.textSecondary }}>{password.length > 0 ? strLabels[str] : ""}</span>
                </div>
              )}
            </div>
            {tab === "register" && (
              <div style={styles.field}>
                <label style={{ ...styles.label, color: t.textSecondary }}>Подтвердите пароль</label>
                <div style={{ position: "relative" }}>
                  <input type={showC ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Повторите пароль" required minLength={6} style={{ ...styles.input, ...styles.passInput, background: t.backgroundSecondary, border: `1px solid ${t.border}`, color: t.text }} />
                  {confirm && password === confirm && (
                    <div style={styles.matchIcon}>
                      <FontAwesomeIcon icon={faCheck} style={{ color: t.success || "var(--nt-success)", fontSize: 14 }} />
                    </div>
                  )}
                  <button type="button" onClick={() => setShowC(!showC)} style={{ ...styles.eyeBtn, color: t.textSecondary }}><FontAwesomeIcon icon={showC ? faEyeSlash : faEye} /></button>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, background: loading ? t.textSecondary : `linear-gradient(135deg, ${t.primary}, ${t.secondary})`, color: "#fff" }}>
              {loading ? "Загрузка..." : tab === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={fillTestA} style={{ ...styles.testBtn, flex: 1, background: `${t.primary}10`, color: t.primary, border: `1px dashed ${t.primary}40` }}>
              <FontAwesomeIcon icon={faBolt} style={{ marginRight: 6 }} /> Тестовые данные A
            </button>
            <button onClick={fillTestB} style={{ ...styles.testBtn, flex: 1, background: `${t.secondary || t.primary}10`, color: t.secondary || t.primary, border: `1px dashed ${(t.secondary || t.primary)}40` }}>
              <FontAwesomeIcon icon={faBolt} style={{ marginRight: 6 }} /> Тестовые данные B
            </button>
          </div>

          {/* Ссылка на гостевой режим */}
          <div style={{ textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
            <a
              href="/guest"
              style={{
                color: t.primary,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.target.style.textDecoration = "none"}
            >
              <FontAwesomeIcon icon={faGraduationCap} />
              Попробовать без регистрации
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { borderRadius: 20, width: "95%", maxWidth: 440, maxHeight: "90vh", overflow: "auto", boxShadow: "var(--nt-card-shadow, 0 24px 80px rgba(0,0,0,0.2))" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px" },
  closeBtn: { background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4 },
  tab: { flex: 1, padding: "14px", background: "none", border: "none", cursor: "pointer", fontSize: 15, outline: "none", boxShadow: "none", WebkitTapHighlightColor: "transparent" },
  body: { padding: "24px" },
  error: { padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 16 },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 },
  input: { width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 15, outline: "none", boxSizing: "border-box" },
  passInput: { paddingRight: 70 },
  eyeBtn: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4 },
  strBar: { display: "flex", alignItems: "center", gap: 4, marginTop: 8, minHeight: 20 },
  strSeg: { flex: 1, height: 4, borderRadius: 2 },
  strLabel: { fontSize: 12, fontWeight: 500, marginLeft: 8, whiteSpace: "nowrap", minWidth: 60 },
  matchIcon: { position: "absolute", right: 44, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 },
  submitBtn: { width: "100%", padding: 15, borderRadius: 12, border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 },
  testBtn: { marginTop: 14, width: "100%", padding: "11px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer" },
};
