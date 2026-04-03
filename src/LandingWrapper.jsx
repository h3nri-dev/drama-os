import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import App from "./App.jsx";

// ── Supabase client ──────────────────────────────────────────────────────────
// localStorage credentials take priority over env vars (allows runtime config)
const SUPA_URL = localStorage.getItem("SUPABASE_URL") || import.meta.env.VITE_SUPABASE_URL || "";
const SUPA_KEY = localStorage.getItem("SUPABASE_ANON_KEY") || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = SUPA_URL && SUPA_KEY ? createClient(SUPA_URL, SUPA_KEY) : null;

// ── Shared styles ────────────────────────────────────────────────────────────
const LANDING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#09090b;--bg2:#111116;--bg3:#18181f;--bg4:#1f2028;--bg5:#252830;
  --ln:rgba(255,255,255,0.055);--ln2:rgba(255,255,255,0.03);
  --t1:#e8e8f0;--t2:#9da5bb;--t3:#525870;--t4:#2e3244;
  --gold:#c9a84c;--gold2:#e8c96e;--gold3:#f5e8c0;
  --red:#d05050;--red2:#ff8888;
  --green:#4aad75;--green2:#80d4a8;
  --gG:rgba(201,168,76,0.10);--gR:rgba(208,80,80,0.10);
  --bG:rgba(201,168,76,0.18);--bR:rgba(208,80,80,0.18);
}
html,body,#root{height:100%;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t1);font-size:16px;line-height:1.6;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--bg5);border-radius:2px;}
::selection{background:rgba(201,168,76,0.25);}

/* ── LAYOUT ── */
.lp-wrap{min-height:100vh;display:flex;flex-direction:column;}
.lp-nav{height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;border-bottom:1px solid var(--ln);background:rgba(9,9,11,0.9);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100;}
.lp-logo{font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--gold2);font-weight:700;letter-spacing:0.5px;cursor:pointer;}
.lp-logo span{color:var(--t3);font-weight:300;font-style:italic;font-size:16px;margin-left:6px;}
.lp-nav-r{display:flex;gap:10px;align-items:center;}

/* ── HERO ── */
.lp-hero{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;text-align:center;position:relative;overflow:hidden;}
.lp-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(201,168,76,0.06) 0%,transparent 70%);pointer-events:none;}
.lp-eyebrow{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-family:'JetBrains Mono',monospace;margin-bottom:20px;}
.lp-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(52px,8vw,96px);font-weight:700;color:var(--t1);line-height:1.0;letter-spacing:-1px;margin-bottom:12px;}
.lp-h1 em{color:var(--gold2);font-style:italic;}
.lp-sub{font-size:clamp(16px,2.5vw,20px);color:var(--t2);max-width:560px;margin:0 auto 40px;line-height:1.65;font-weight:300;}
.lp-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}

/* ── FEATURES ── */
.lp-features{padding:80px 40px;max-width:1100px;margin:0 auto;width:100%;}
.lp-section-label{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-family:'JetBrains Mono',monospace;margin-bottom:10px;text-align:center;}
.lp-section-title{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,5vw,52px);color:var(--t1);text-align:center;margin-bottom:12px;font-weight:600;}
.lp-section-sub{color:var(--t2);text-align:center;max-width:540px;margin:0 auto 48px;font-size:17px;line-height:1.6;}
.lp-feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;}
.lp-feat-card{background:var(--bg2);border:1px solid var(--ln);border-radius:14px;padding:28px;transition:border-color .15s,transform .15s;}
.lp-feat-card:hover{border-color:rgba(201,168,76,0.25);transform:translateY(-2px);}
.lp-feat-icon{font-size:32px;margin-bottom:16px;}
.lp-feat-title{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--gold2);font-weight:600;margin-bottom:8px;}
.lp-feat-desc{font-size:15px;color:var(--t2);line-height:1.6;}

/* ── PAYWALL BANNER ── */
.lp-paywall{background:linear-gradient(135deg,rgba(201,168,76,0.08) 0%,rgba(201,168,76,0.04) 100%);border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:48px;text-align:center;max-width:700px;margin:0 auto 80px;width:calc(100% - 48px);}
.lp-paywall-t{font-family:'Cormorant Garamond',serif;font-size:32px;color:var(--gold2);font-weight:700;margin-bottom:10px;}
.lp-paywall-s{color:var(--t2);font-size:16px;margin-bottom:28px;line-height:1.6;}

/* ── FOOTER ── */
.lp-footer{border-top:1px solid var(--ln);padding:24px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.lp-footer-brand{font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--t3);font-weight:600;}
.lp-footer-links{display:flex;gap:20px;}
.lp-footer-link{font-size:14px;color:var(--t3);cursor:pointer;transition:color .12s;text-decoration:none;}
.lp-footer-link:hover{color:var(--t2);}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:8px;border:none;cursor:pointer;font-size:16px;font-weight:500;font-family:'DM Sans',sans-serif;transition:all .15s;letter-spacing:.2px;text-decoration:none;}
.btn-gold{background:var(--gold);color:#0a0a0c;}
.btn-gold:hover{background:var(--gold2);}
.btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--ln);}
.btn-ghost:hover{background:var(--bg3);color:var(--t1);border-color:var(--t4);}
.btn-sm{padding:7px 15px;font-size:14px;}
.btn:disabled{opacity:.4;cursor:default;}

/* ── MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(6px);}
.modal{background:var(--bg2);border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:32px;max-width:460px;width:93%;max-height:90vh;overflow-y:auto;}
.modal-t{font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--gold2);margin-bottom:6px;font-weight:700;}
.modal-s{font-size:14px;color:var(--t3);margin-bottom:24px;}
.modal-ft{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--ln);}

/* ── FORM ── */
.fl{font-size:12px;color:var(--t3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px;display:block;}
.fi{width:100%;background:var(--bg3);border:1px solid var(--ln);border-radius:8px;padding:10px 13px;font-size:16px;color:var(--t1);font-family:'DM Sans',sans-serif;transition:border-color .12s;outline:none;}
.fi:focus{border-color:var(--gold);}
.fg{margin-bottom:16px;}

/* ── CALLOUT ── */
.co-green{background:rgba(74,173,117,.07);border-left:3px solid var(--green);border-radius:6px;padding:10px 14px;color:#80d4a8;font-size:15px;}
.co-red{background:rgba(208,80,80,.07);border-left:3px solid var(--red);border-radius:6px;padding:10px 14px;color:#ff8888;font-size:15px;}
.co-gold{background:rgba(201,168,76,.07);border-left:3px solid var(--gold);border-radius:6px;padding:10px 14px;color:var(--gold3);font-size:15px;}

/* ── PAGE (Terms, etc.) ── */
.lp-page{max-width:780px;margin:0 auto;padding:60px 24px;}
.lp-page h1{font-family:'Cormorant Garamond',serif;font-size:42px;color:var(--gold2);font-weight:700;margin-bottom:8px;}
.lp-page .subtitle{color:var(--t3);font-size:14px;margin-bottom:40px;}
.lp-page h2{font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--t1);margin:32px 0 12px;font-weight:600;}
.lp-page p{color:var(--t2);font-size:16px;line-height:1.75;margin-bottom:14px;}
.lp-page ul{color:var(--t2);font-size:16px;line-height:1.75;padding-left:22px;margin-bottom:14px;}
.lp-page ul li{margin-bottom:6px;}

/* ── LOADING ── */
.lp-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);}
.lp-spin{width:36px;height:36px;border:2px solid var(--ln);border-top-color:var(--gold);border-radius:50%;animation:lp-spin .7s linear infinite;}
@keyframes lp-spin{to{transform:rotate(360deg)}}

/* ── DIVIDER ── */
.lp-divider{height:1px;background:var(--ln);margin:0 40px;}
`;

// ── Helper: inject CSS once ──────────────────────────────────────────────────
function useCSS(id, css) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
}

// ── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="lp-loading">
      <div className="lp-spin" />
    </div>
  );
}

// ── Login Modal ──────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess, onSwitchToWaitlist, onConfig }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase) { setError("Auth service not configured. Use the ⚙ gear icon in the footer to add Supabase credentials."); return; }
    setLoading(true);
    setError("");
    try {
      let result;
      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({ email, password });
      }
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setError("");
        setMode("confirm");
      } else {
        onSuccess(result.data.session?.user);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "confirm") {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-t">Check your email</div>
          <div className="modal-s">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.</div>
          <div className="modal-ft">
            <button className="btn btn-gold" onClick={() => setMode("login")}>Back to sign in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-t">{mode === "login" ? "Sign in" : "Create account"}</div>
        <div className="modal-s">Access Nekoi Studio</div>
        {error && (
          <div className="co-red" style={{ marginBottom: 16 }}>
            {error}
            {!supabase && onConfig && (
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-gold btn-sm" onClick={() => { onClose(); onConfig(); }}>
                  Configure Supabase →
                </button>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="fl">Email</label>
            <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="fg">
            <label className="fl">Password</label>
            <input className="fi" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Create account" : "Sign in instead"}
            </button>
            <button className="btn btn-gold" type="submit" disabled={loading}>
              {loading ? "…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </div>
        </form>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--ln)", textAlign: "center" }}>
          <span style={{ color: "var(--t3)", fontSize: 14 }}>Don't have access yet? </span>
          <span style={{ color: "var(--gold)", cursor: "pointer", fontSize: 14 }} onClick={onSwitchToWaitlist}>Join the waitlist</span>
        </div>
      </div>
    </div>
  );
}

// ── Waitlist Modal ───────────────────────────────────────────────────────────
function WaitlistModal({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); // "" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setErrorMsg("");
    try {
      if (supabase) {
        const { error } = await supabase
          .from("nekoi_waitlist")
          .insert([{ name: name.trim(), email: email.trim().toLowerCase(), role: role.trim() }]);
        if (error) {
          if (error.code === "23505") {
            setErrorMsg("This email is already on the waitlist.");
            setStatus("error");
          } else {
            throw error;
          }
        } else {
          setStatus("success");
        }
      } else {
        // No Supabase configured — still show success (log for demo)
        console.log("[Waitlist] Signup:", { name, email, role });
        setStatus("success");
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-t">You're on the list!</div>
          <div className="modal-s">We'll reach out to <strong>{email}</strong> when your spot is ready.</div>
          <div className="co-green" style={{ marginBottom: 20 }}>
            Thank you for your interest in Nekoi Studio. We'll be in touch soon.
          </div>
          <div className="modal-ft">
            <button className="btn btn-gold" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-t">Join the waitlist</div>
        <div className="modal-s">Be among the first to access Nekoi Studio when we launch.</div>
        {status === "error" && <div className="co-red" style={{ marginBottom: 16 }}>{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="fl">Full name</label>
            <input className="fi" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
          </div>
          <div className="fg">
            <label className="fl">Email address</label>
            <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="fg">
            <label className="fl">Your role (optional)</label>
            <input className="fi" type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Writer, Producer, Director" />
          </div>
          <div className="modal-ft">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Join waitlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Config Modal (admin: set Supabase credentials at runtime) ────────────────
function ConfigModal({ onClose, reason = "" }) {
  const [url, setUrl] = useState(localStorage.getItem("SUPABASE_URL") || "");
  const [key, setKey] = useState(localStorage.getItem("SUPABASE_ANON_KEY") || "");
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    if (url.trim()) localStorage.setItem("SUPABASE_URL", url.trim());
    else localStorage.removeItem("SUPABASE_URL");
    if (key.trim()) localStorage.setItem("SUPABASE_ANON_KEY", key.trim());
    else localStorage.removeItem("SUPABASE_ANON_KEY");
    setSaved(true);
    setTimeout(() => window.location.reload(), 800);
  }

  function handleClear() {
    localStorage.removeItem("SUPABASE_URL");
    localStorage.removeItem("SUPABASE_ANON_KEY");
    setUrl("");
    setKey("");
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-t">Configure Auth</div>
        <div className="modal-s">Set Supabase credentials. Saved to localStorage — takes effect on reload.</div>
        {reason && <div className="co-gold" style={{ marginBottom: 16 }}>{reason}</div>}
        {saved && <div className="co-green" style={{ marginBottom: 16 }}>Saved! Reloading…</div>}
        <form onSubmit={handleSave}>
          <div className="fg">
            <label className="fl">Supabase URL</label>
            <input className="fi" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-project.supabase.co" />
          </div>
          <div className="fg">
            <label className="fl">Supabase Anon Key</label>
            <input className="fi" type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="eyJ…" />
          </div>
          <div className="modal-ft">
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleClear}>Clear</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" type="submit">Save &amp; Reload</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Terms & Conditions Page ──────────────────────────────────────────────────
function TermsPage({ onBack }) {
  return (
    <div className="lp-wrap">
      <nav className="lp-nav">
        <span className="lp-logo" onClick={onBack}>Nekoi <em>Studio</em></span>
        <div className="lp-nav-r">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        </div>
      </nav>
      <div className="lp-page">
        <h1>Terms &amp; Conditions</h1>
        <p className="subtitle">Last updated: April 2, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Nekoi Studio ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions of this agreement, you may not access or use the Service.</p>

        <h2>2. Description of Service</h2>
        <p>Nekoi Studio is a creative production platform designed for writers, producers, and storytellers to develop, manage, and publish their projects. The Service provides tools for story development, episode management, asset creation, and publishing workflows.</p>

        <h2>3. Access and Accounts</h2>
        <p>Access to Nekoi Studio is currently by invitation or waitlist approval only. To use the Service:</p>
        <ul>
          <li>You must create an account using a valid email address and password.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You agree to notify us immediately of any unauthorized use of your account.</li>
          <li>Each account is for a single user; sharing accounts is not permitted.</li>
        </ul>

        <h2>4. Waitlist</h2>
        <p>By joining our waitlist, you agree to receive communications from Nekoi Studio regarding your access status and product updates. You may unsubscribe at any time. We will not share your information with third parties without your consent.</p>

        <h2>5. Subscription and Payments</h2>
        <p>Nekoi Studio may offer paid subscription tiers. By subscribing:</p>
        <ul>
          <li>You agree to pay all applicable fees as described at the time of purchase.</li>
          <li>Subscriptions automatically renew unless cancelled before the renewal date.</li>
          <li>Refunds are provided at our discretion, typically within 7 days of purchase for unused portions.</li>
          <li>We reserve the right to change pricing with 30 days' notice to subscribers.</li>
        </ul>

        <h2>6. Content and Intellectual Property</h2>
        <p>You retain all ownership rights to the content you create using Nekoi Studio. By using the Service, you grant Nekoi Studio a limited, non-exclusive license to store and process your content solely to provide the Service. We will not sell or share your creative work.</p>
        <p>The Nekoi Studio platform, software, branding, and all associated intellectual property are owned by Nekoi Studio and may not be copied or reproduced without permission.</p>

        <h2>7. Prohibited Uses</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Violate any applicable laws or regulations.</li>
          <li>Infringe upon the intellectual property rights of others.</li>
          <li>Create, upload, or share content that is unlawful, harmful, defamatory, or obscene.</li>
          <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
          <li>Reverse-engineer, decompile, or disassemble any portion of the Service.</li>
          <li>Use automated scripts to scrape, crawl, or collect data from the Service.</li>
        </ul>

        <h2>8. Disclaimers</h2>
        <p>The Service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components. We are not responsible for any loss of data or content.</p>

        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Nekoi Studio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business interruption, arising from your use of the Service.</p>

        <h2>10. Termination</h2>
        <p>We reserve the right to terminate or suspend your account at our discretion, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>

        <h2>11. Changes to Terms</h2>
        <p>We may update these Terms from time to time. We will notify you of significant changes by posting a notice on the platform or sending an email. Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.</p>

        <h2>12. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction.</p>

        <h2>13. Contact</h2>
        <p>For questions about these Terms, please contact us through the Nekoi Studio platform.</p>
      </div>
      <footer className="lp-footer">
        <span className="lp-footer-brand">Nekoi Studio</span>
        <div className="lp-footer-links">
          <span className="lp-footer-link" onClick={onBack}>Home</span>
        </div>
      </footer>
    </div>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "✦", title: "Story Bible", desc: "Craft rich, interconnected story bibles with characters, lore, and world-building that stays consistent across every episode." },
  { icon: "◈", title: "Episode Studio", desc: "Write, structure, and produce episodes with AI-assisted generation, visual novel panels, and integrated audiobook tools." },
  { icon: "⬡", title: "Asset Manager", desc: "Organize all your characters, locations, props, and visual assets in one place with version history and tagging." },
  { icon: "◎", title: "AI Director", desc: "An AI creative collaborator trained on storytelling craft to help you develop ideas, overcome blocks, and refine your work." },
  { icon: "⧉", title: "Publishing Pipeline", desc: "One-click export to multiple formats — web, audiobook, PDF, and social — with built-in distribution workflows." },
  { icon: "⬟", title: "Team Collaboration", desc: "Invite co-writers, editors, and producers to collaborate in real-time with granular role-based permissions." },
];

function LandingPage({ onLogin, onWaitlist, onTerms, onConfig, supabaseConfigured }) {
  return (
    <div className="lp-wrap">
      {!supabaseConfigured && (
        <div style={{ background: "rgba(201,168,76,0.12)", borderBottom: "1px solid rgba(201,168,76,0.3)", padding: "10px 24px", textAlign: "center", fontSize: 14, color: "var(--gold3)" }}>
          Auth is not configured.{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 500 }} onClick={onConfig}>
            Click here to add Supabase credentials
          </span>
          {" "}to enable sign-in.
        </div>
      )}
      <nav className="lp-nav">
        <span className="lp-logo">Nekoi <em>Studio</em></span>
        <div className="lp-nav-r">
          <button className="btn btn-ghost btn-sm" onClick={onWaitlist}>Join waitlist</button>
          <button className="btn btn-gold btn-sm" onClick={onLogin}>Sign in</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-eyebrow">Creative Production Platform</div>
        <h1 className="lp-h1">Where stories<br/><em>come alive.</em></h1>
        <p className="lp-sub">
          Nekoi Studio is the all-in-one platform for writers, producers, and storytellers
          to develop, produce, and publish their creative work.
        </p>
        <div className="lp-cta">
          <button className="btn btn-gold" onClick={onWaitlist} style={{ padding: "13px 32px", fontSize: 17 }}>
            Join the waitlist
          </button>
          <button className="btn btn-ghost" onClick={onLogin} style={{ padding: "13px 32px", fontSize: 17 }}>
            Sign in
          </button>
        </div>
      </section>

      <div className="lp-divider" />

      {/* Features */}
      <section className="lp-features">
        <div className="lp-section-label">What's inside</div>
        <h2 className="lp-section-title">Everything you need to create</h2>
        <p className="lp-section-sub">From first concept to final publish — Nekoi Studio has every tool your production needs.</p>
        <div className="lp-feat-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="lp-feat-card">
              <div className="lp-feat-icon" style={{ color: "var(--gold2)" }}>{f.icon}</div>
              <div className="lp-feat-title">{f.title}</div>
              <div className="lp-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Paywall CTA */}
      <div style={{ padding: "0 24px" }}>
        <div className="lp-paywall">
          <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", fontFamily: "'JetBrains Mono',monospace", marginBottom: 14 }}>Early access</div>
          <div className="lp-paywall-t">Ready to start creating?</div>
          <div className="lp-paywall-s">
            Nekoi Studio is currently in private access. Join the waitlist to reserve your spot,
            or sign in if you already have an account.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={onWaitlist} style={{ padding: "12px 28px" }}>Join the waitlist</button>
            <button className="btn btn-ghost" onClick={onLogin} style={{ padding: "12px 28px" }}>I have an account</button>
          </div>
        </div>
      </div>

      <footer className="lp-footer">
        <span className="lp-footer-brand">© 2026 Nekoi Studio</span>
        <div className="lp-footer-links">
          <span className="lp-footer-link" onClick={onTerms}>Terms & Conditions</span>
          <span className="lp-footer-link" onClick={onWaitlist}>Join Waitlist</span>
          <span className="lp-footer-link" onClick={onLogin}>Sign In</span>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
          <span className="lp-footer-link" onClick={onConfig} style={{ opacity: supabaseConfigured ? 0.3 : 1, fontSize: supabaseConfigured ? 12 : 13, color: supabaseConfigured ? undefined : "var(--gold)" }}>
            {supabaseConfigured ? "⚙" : "⚙ Configure"}
=======
          <span className="lp-footer-link" onClick={onConfig} style={{ opacity: supabase ? 0.3 : 1, fontSize: supabase ? 12 : 13, color: supabase ? undefined : "var(--gold)" }}>
            {supabase ? "⚙" : "⚙ Configure"}
>>>>>>> covibing/task-762ec8d5-b3dd-416c-93cf-f65bddc75d5a
=======
          <span className="lp-footer-link" onClick={onConfig} style={{ opacity: supabaseConfigured ? 0.3 : 1, fontSize: supabaseConfigured ? 12 : 13, color: supabaseConfigured ? undefined : "var(--gold)" }}>
            {supabaseConfigured ? "⚙" : "⚙ Configure"}
>>>>>>> covibing/task-96ea528a-45ab-42f5-ba98-85b0b40c868d
=======
          <span className="lp-footer-link" onClick={onConfig} style={{ opacity: supabase ? 0.3 : 1, fontSize: supabase ? 12 : 13, color: supabase ? undefined : "var(--gold)" }}>
            {supabase ? "⚙" : "⚙ Configure"}
>>>>>>> covibing/task-af8df14c-b5f6-48f7-971f-75059048fac2
          </span>
        </div>
      </footer>
    </div>
  );
}

// ── Root Wrapper ─────────────────────────────────────────────────────────────
export default function LandingWrapper() {
  useCSS("nekoi-landing-css", LANDING_CSS);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("landing"); // "landing" | "terms"
  const [showLogin, setShowLogin] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [configReason, setConfigReason] = useState(""); // why config modal was opened

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user || null);
        setLoading(false);
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      return () => listener?.subscription?.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingScreen />;

  // Authenticated — show the full app
  if (user) return <App />;

  // Terms page
  if (page === "terms") return <TermsPage onBack={() => setPage("landing")} />;

  function handleLoginClick() {
    if (!supabase) {
      setConfigReason("Supabase credentials are required to sign in. Enter your project URL and anon key below.");
      setShowConfig(true);
    } else {
      setShowLogin(true);
    }
  }

  // Landing page with optional modals
  return (
    <>
      <LandingPage
        onLogin={handleLoginClick}
        onWaitlist={() => setShowWaitlist(true)}
        onTerms={() => setPage("terms")}
        onConfig={() => { setConfigReason(""); setShowConfig(true); }}
        supabaseConfigured={!!supabase}
      />
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={u => { setUser(u); setShowLogin(false); }}
          onSwitchToWaitlist={() => { setShowLogin(false); setShowWaitlist(true); }}
          onConfig={() => { setShowLogin(false); setShowConfig(true); }}
        />
      )}
      {showWaitlist && (
        <WaitlistModal onClose={() => setShowWaitlist(false)} />
      )}
      {showConfig && (
        <ConfigModal
          onClose={() => { setShowConfig(false); setConfigReason(""); }}
          reason={configReason}
        />
      )}
    </>
  );
}
