import React from "react";
import { useState, useEffect, useRef, useCallback, useReducer, useMemo } from "react";
// Lazy supabase loader — works in Vite (npm), Claude preview (CDN), or offline (null)
function getSupabaseClient(url, key) {
  // Option 1: npm import already on window (injected by Vite plugin or manual)
  if (window.__supabaseCreateClient) return window.__supabaseCreateClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  // Option 2: CDN global
  const mod = window.supabase || window.Supabase;
  if (mod?.createClient) return mod.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return null;
}
function getSupabaseCreateClient() {
  if (window.__supabaseCreateClient) return window.__supabaseCreateClient;
  const mod = window.supabase || window.Supabase;
  return mod?.createClient || null;
}



// ═══════════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#09090b; --bg2:#111116; --bg3:#18181f; --bg4:#1f2028; --bg5:#252830;
  --ln:rgba(255,255,255,0.055); --ln2:rgba(255,255,255,0.03);
  --t1:#e8e8f0; --t2:#9da5bb; --t3:#525870; --t4:#2e3244;
  --gold:#c9a84c; --gold2:#e8c96e; --gold3:#f5e8c0;
  --red:#d05050; --red2:#ff8888;
  --green:#4aad75; --green2:#80d4a8;
  --blue:#4878c8; --blue2:#90b8f8;
  --purple:#8858c8; --purple2:#b898f0;
  --amber:#c87838; --amber2:#f0a860;
  --gG:rgba(201,168,76,0.10); --gR:rgba(208,80,80,0.10); --gB:rgba(72,120,200,0.08);
  --bG:rgba(201,168,76,0.18); --bR:rgba(208,80,80,0.18);
  --nav:200px; --chat:340px;
}
html,body,#root{height:100%;overflow:hidden;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t1);font-size:16px;line-height:1.55;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--bg5);border-radius:2px;}
::selection{background:rgba(201,168,76,0.25);}

/* ── SHELL ── */
.shell{display:flex;height:100vh;}
.nav{width:var(--nav);flex-shrink:0;background:var(--bg2);border-right:1px solid var(--ln);display:flex;flex-direction:column;z-index:20;}
.workspace{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{height:48px;flex-shrink:0;background:var(--bg2);border-bottom:1px solid var(--ln);display:flex;align-items:center;padding:0 18px;gap:10px;}
.body{flex:1;display:flex;overflow:hidden;}
.page{flex:1;overflow-y:auto;padding:20px 24px;min-width:0;}
.chat-rail{width:var(--chat);flex-shrink:0;border-left:1px solid var(--ln);background:var(--bg2);display:flex;flex-direction:column;transition:width .22s;}
.chat-rail.closed{width:38px;}

/* ── NAV ── */
.nav-logo{padding:16px 14px 10px;border-bottom:1px solid var(--ln);}
.logo-word{font-family:'Cormorant Garamond',serif;font-size:19px;color:var(--gold2);font-weight:700;letter-spacing:.3px;}
.logo-sub{font-size:12px;color:var(--t3);letter-spacing:2px;text-transform:uppercase;margin-top:2px;}
.nav-section{padding:9px 12px 2px;font-size:12px;color:var(--t4);letter-spacing:2px;text-transform:uppercase;}
.nav-item{display:flex;align-items:center;gap:8px;padding:7px 10px;margin:1px 5px;border-radius:7px;cursor:pointer;font-size:15px;color:var(--t3);transition:all .12s;border:1px solid transparent;}
.nav-item:hover{background:var(--bg3);color:var(--t2);}
.nav-item.on{background:var(--gG);color:var(--gold2);border-color:rgba(201,168,76,0.18);}
.nav-icon{width:14px;text-align:center;font-size:16px;flex-shrink:0;}
.nav-badge{margin-left:auto;background:var(--bg5);font-size:12px;padding:1px 5px;border-radius:8px;color:var(--t2);font-family:'JetBrains Mono',monospace;}
.nav-item.on .nav-badge{background:var(--gold);color:var(--bg);}
.nav-foot{margin-top:auto;padding:10px;border-top:1px solid var(--ln);font-size:12px;color:var(--t4);line-height:1.8;}
.nav-project-pill{display:flex;align-items:center;gap:7px;padding:6px 10px;margin:1px 5px;border-radius:7px;cursor:pointer;border:1px solid transparent;transition:all .12s;}
.nav-project-pill:hover{background:var(--bg3);}
.nav-project-pill.on{background:var(--gG);border-color:rgba(201,168,76,0.15);}
.nav-pdot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.nav-pname{font-size:14px;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.nav-project-pill.on .nav-pname{color:var(--gold2);}

/* ── TOPBAR ── */
.tb-title{font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--gold2);font-weight:600;}
.tb-crumb{font-size:15px;color:var(--t3);cursor:pointer;transition:color .12s;}
.tb-crumb:hover{color:var(--t2);}
.tb-sep{color:var(--t4);font-size:15px;}
.tb-r{margin-left:auto;display:flex;align-items:center;gap:8px;}
.api-pill{display:flex;align-items:center;gap:4px;font-size:13px;padding:3px 8px;border-radius:5px;}
.api-on{background:rgba(74,173,117,.1);color:var(--green2);border:1px solid rgba(74,173,117,.2);}
.api-off{background:var(--gR);color:var(--red2);border:1px solid var(--bR);}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border-radius:7px;border:none;cursor:pointer;font-size:15px;font-weight:500;font-family:'DM Sans',sans-serif;transition:all .12s;letter-spacing:.3px;}
.btn-gold{background:var(--gold);color:var(--bg);}
.btn-gold:hover{background:var(--gold2);}
.btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--ln);}
.btn-ghost:hover{background:var(--bg3);color:var(--t1);border-color:var(--t4);}
.btn-red{background:var(--gR);color:var(--red2);border:1px solid var(--bR);}
.btn-red:hover{background:rgba(208,80,80,.2);}
.btn-green{background:rgba(74,173,117,.12);color:var(--green2);border:1px solid rgba(74,173,117,.22);}
.btn-green:hover{background:rgba(74,173,117,.22);}
.btn-sm{padding:4px 9px;font-size:14px;}
.btn:disabled{opacity:.4;cursor:default;}

/* ── CARDS ── */
.card{background:var(--bg2);border:1px solid var(--ln);border-radius:11px;padding:18px;transition:border-color .15s;}
.card:hover{border-color:rgba(201,168,76,0.12);}
.card-t{font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--gold2);font-weight:600;}
.card-s{font-size:13px;color:var(--t3);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;}

/* ── FORM ── */
.fl{font-size:13px;color:var(--t3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px;display:block;}
.fi,.fs,.ft{width:100%;background:var(--bg3);border:1px solid var(--ln);border-radius:7px;padding:8px 11px;font-size:16px;color:var(--t1);font-family:'DM Sans',sans-serif;transition:border-color .12s;outline:none;}
.fi:focus,.fs:focus,.ft:focus{border-color:var(--gold);}
.ft{resize:vertical;min-height:70px;font-family:'JetBrains Mono',monospace;font-size:14px;line-height:1.55;}
.fs option{background:var(--bg2);}
.fg{margin-bottom:13px;}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.fr3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}

/* ── TABS ── */
.tabs{display:flex;gap:2px;border-bottom:1px solid var(--ln);margin-bottom:18px;flex-shrink:0;}
.tab{padding:7px 14px;font-size:14px;cursor:pointer;color:var(--t3);border-bottom:2px solid transparent;transition:all .12s;margin-bottom:-1px;letter-spacing:.3px;}
.tab:hover{color:var(--t2);}
.tab.on{color:var(--gold2);border-bottom-color:var(--gold);}

/* ── TABLE ── */
table{width:100%;border-collapse:collapse;}
th{text-align:left;padding:7px 10px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--t3);border-bottom:1px solid var(--ln);font-weight:500;}
td{padding:8px 10px;border-bottom:1px solid var(--ln2);vertical-align:middle;}
tr:hover td{background:rgba(255,255,255,.015);}
tr:last-child td{border-bottom:none;}

/* ── BADGES ── */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:12px;font-size:13px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
.badge-dot{width:4px;height:4px;border-radius:50%;background:currentColor;}
.bd-gold{background:var(--gG);color:var(--gold2);border:1px solid rgba(201,168,76,.2);}
.bd-red{background:var(--gR);color:var(--red2);border:1px solid var(--bR);}
.bd-green{background:rgba(74,173,117,.1);color:var(--green2);border:1px solid rgba(74,173,117,.2);}
.bd-blue{background:var(--gB);color:var(--blue2);border:1px solid rgba(72,120,200,.2);}
.bd-ghost{background:var(--bg3);color:var(--t3);border:1px solid var(--ln);}
.pulse{animation:pulse 1.4s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.spin{animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── PROGRESS ── */
.prog-track{height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;}
.prog-fill{height:100%;border-radius:2px;transition:width .4s;}

/* ── CALLOUT ── */
.callout{padding:9px 13px;border-radius:7px;border-left:3px solid;font-size:15px;margin:8px 0;line-height:1.5;}
.co-gold{background:rgba(201,168,76,.07);border-color:var(--gold);color:var(--gold3);}
.co-red{background:var(--gR);border-color:var(--red);color:var(--red2);}
.co-blue{background:var(--gB);border-color:var(--blue);color:var(--blue2);}
.co-green{background:rgba(74,173,117,.07);border-color:var(--green);color:var(--green2);}

/* ── MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(5px);}
.modal{background:var(--bg2);border:1px solid var(--bG);border-radius:14px;padding:26px;max-width:600px;width:93%;max-height:82vh;overflow-y:auto;}
.modal-t{font-family:'Cormorant Garamond',serif;font-size:23px;color:var(--gold2);margin-bottom:4px;}
.modal-s{font-size:14px;color:var(--t3);margin-bottom:18px;}
.modal-ft{display:flex;justify-content:flex-end;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid var(--ln);}

/* ── PAGE HEADER ── */
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;}
.ph-t{font-family:'Cormorant Garamond',serif;font-size:27px;color:var(--gold2);font-weight:600;}
.ph-s{font-size:15px;color:var(--t3);margin-top:3px;}
.ph-r{display:flex;gap:7px;align-items:center;}

/* ── SECTION HEAD ── */
.sh{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.sh-t{font-family:'Cormorant Garamond',serif;font-size:19px;color:var(--gold2);}
.sh-line{flex:1;height:1px;background:var(--ln);}

/* ── MONO ── */
.mono{font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--gold3);}

/* ── STAT ── */
.stat-n{font-family:'Cormorant Garamond',serif;font-size:32px;color:var(--gold2);font-weight:700;}
.stat-l{font-size:12px;color:var(--t3);letter-spacing:1px;text-transform:uppercase;margin-top:2px;}

/* ── SEG TYPE ── */
.st{width:21px;height:21px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.stA{background:rgba(201,168,76,.15);color:var(--gold)} .stB{background:rgba(72,120,200,.15);color:var(--blue2)}
.stC{background:rgba(136,88,200,.15);color:var(--purple2)} .stD{background:rgba(201,76,201,.15);color:#d880d8}
.stE{background:rgba(74,173,117,.15);color:var(--green2)} .stF{background:rgba(200,120,56,.15);color:var(--amber2)}
.stG{background:rgba(90,96,120,.15);color:var(--t2)} .stH{background:rgba(208,80,80,.15);color:var(--red2)}

/* ── ASSET TYPES ── */
.asset-card{background:var(--bg3);border:1px solid var(--ln);border-radius:9px;overflow:hidden;transition:all .15s;cursor:pointer;}
.asset-card:hover{border-color:rgba(201,168,76,.25);transform:translateY(-1px);}
.asset-thumb{height:100px;display:flex;align-items:center;justify-content:center;font-size:40px;border-bottom:1px solid var(--ln);}
.asset-info{padding:10px 12px;}
.asset-name{font-size:15px;color:var(--t1);font-weight:500;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.asset-meta{font-size:13px;color:var(--t3);}
.asset-tag{display:inline-block;padding:1px 6px;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;}
.at-logo{background:rgba(201,168,76,.12);color:var(--gold);}
.at-video{background:rgba(72,120,200,.12);color:var(--blue2);}
.at-audio{background:rgba(136,88,200,.12);color:var(--purple2);}
.at-image{background:rgba(74,173,117,.12);color:var(--green2);}
.at-doc{background:rgba(200,120,56,.12);color:var(--amber2);}

/* ── RELATIONSHIP MAP SVG ── */
.rel-canvas{width:100%;border-radius:10px;border:1px solid var(--ln);background:var(--bg3);overflow:hidden;}
.rel-node{cursor:pointer;transition:all .15s;}
.rel-node:hover circle{filter:brightness(1.3);}
.rel-edge{stroke-width:1.5;transition:all .15s;}

/* ── BIBLE ── */
.bible-char{display:flex;gap:12px;padding:12px;border-radius:9px;border:1px solid var(--ln);background:var(--bg3);margin-bottom:8px;cursor:pointer;transition:all .15s;}
.bible-char:hover{border-color:rgba(201,168,76,.2);}
.bible-char.on{border-color:var(--gold);background:var(--gG);}
.char-avatar{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:23px;flex-shrink:0;}
.char-detail{padding:14px;border:1px solid var(--ln);border-radius:9px;background:var(--bg3);}

/* ── CHAT ── */
.chat-hd{padding:13px 14px;border-bottom:1px solid var(--ln);flex-shrink:0;display:flex;align-items:center;gap:9px;}
.chat-ctx{padding:7px 13px;background:rgba(0,0,0,.2);border-bottom:1px solid var(--ln);font-size:13px;color:var(--t3);display:flex;gap:7px;flex-wrap:wrap;flex-shrink:0;}
.ctx-chip{display:inline-flex;align-items:center;gap:3px;background:var(--bg3);border:1px solid var(--ln);padding:2px 7px;border-radius:9px;font-size:13px;color:var(--t2);}
.ctx-chip.hi{background:var(--gG);border-color:rgba(201,168,76,.2);color:var(--gold2);}
.msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;}
.msg{display:flex;flex-direction:column;gap:3px;}
.msg-u{align-items:flex-end;}
.msg-a{align-items:flex-start;}
.bubble{max-width:88%;padding:9px 12px;border-radius:11px;font-size:15px;line-height:1.55;}
.bubble-u{background:var(--gG);border:1px solid rgba(201,168,76,.2);color:var(--gold3);border-bottom-right-radius:3px;}
.bubble-a{background:var(--bg3);border:1px solid var(--ln);color:var(--t2);border-bottom-left-radius:3px;}
.msg-mt{font-size:13px;color:var(--t4);padding:0 3px;}
.action-preview{background:var(--bg);border:1px solid var(--ln);border-radius:9px;overflow:hidden;margin-top:5px;}
.ap-hd{padding:7px 11px;background:rgba(201,168,76,.05);border-bottom:1px solid var(--ln);display:flex;align-items:center;gap:7px;font-size:13px;color:var(--gold);font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
.ap-count{background:var(--gold);color:var(--bg);width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
.ap-list{padding:9px 11px;display:flex;flex-direction:column;gap:5px;}
.ap-item{display:flex;gap:7px;padding:5px 7px;border-radius:5px;background:var(--bg2);border:1px solid var(--ln);}
.av{font-size:12px;font-weight:700;padding:2px 5px;border-radius:3px;text-transform:uppercase;flex-shrink:0;margin-top:1px;letter-spacing:.5px;}
.v-set{background:rgba(72,120,200,.2);color:var(--blue2)} .v-add{background:rgba(74,173,117,.2);color:var(--green2)}

/* ── AUDIOBOOK ── */
.ab-player{position:fixed;inset:0;background:radial-gradient(ellipse 120% 80% at 50% 0%,#12101a 0%,#07060d 60%,#030208 100%);z-index:9999;display:flex;flex-direction:column;overflow:hidden;}
.ab-waveform{display:flex;align-items:flex-end;gap:2px;height:40px;}
.ab-bar{width:3px;border-radius:2px;background:var(--gold);opacity:.35;transition:height .12s,opacity .12s;}
.ab-bar.active{opacity:1;}
.ab-transcript-line{padding:10px 16px;border-radius:9px;cursor:pointer;transition:all .18s;border:1px solid transparent;margin-bottom:4px;}
.ab-transcript-line:hover{background:rgba(255,255,255,.04);}
.ab-transcript-line.playing{background:rgba(201,168,76,.08);border-color:rgba(201,168,76,.25);}
.ab-transcript-line.done{opacity:.38;}
.ab-comment-overlay{position:fixed;inset:0;background:rgba(0,0,0,.92);backdrop-filter:blur(24px);z-index:10000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;}
.ab-mic-pulse{width:88px;height:88px;border-radius:50%;background:rgba(201,168,76,.15);border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:34px;animation:ab-pulse 1.2s ease-in-out infinite;}
@keyframes ab-pulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.4);}50%{box-shadow:0 0 0 24px rgba(201,168,76,0);}}
@keyframes ab-ring{0%{transform:scale(1);opacity:.6;}100%{transform:scale(1.8);opacity:0;}}
.v-rm{background:var(--gR);color:var(--red2)} .v-cr{background:var(--gG);color:var(--gold2)}
.ap-btns{padding:8px 11px;border-top:1px solid var(--ln);display:flex;gap:6px;}
.applied-ok{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;background:rgba(74,173,117,.1);border:1px solid rgba(74,173,117,.2);color:var(--green2);font-size:14px;margin-top:5px;}
.chat-inp{padding:11px 13px;border-top:1px solid var(--ln);flex-shrink:0;background:var(--bg2);}
.chat-sugg{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;}
.sugg{font-size:14px;padding:3px 9px;border-radius:12px;background:var(--bg3);border:1px solid var(--ln);color:var(--t2);cursor:pointer;transition:all .12s;white-space:nowrap;}
.sugg:hover{background:var(--gG);border-color:rgba(201,168,76,.2);color:var(--gold2);}
.chat-row{display:flex;gap:7px;align-items:flex-end;}
.chat-ta{flex:1;background:var(--bg3);border:1px solid var(--ln);border-radius:9px;padding:8px 11px;font-size:15px;color:var(--t1);font-family:'DM Sans',sans-serif;resize:none;outline:none;min-height:38px;max-height:110px;line-height:1.5;transition:border-color .12s;}
.chat-ta:focus{border-color:var(--gold);}
.chat-ta::placeholder{color:var(--t4);}
.chat-send{width:36px;height:36px;background:var(--gold);color:var(--bg);border:none;border-radius:9px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .12s;flex-shrink:0;}
.chat-send:hover{background:var(--gold2);transform:scale(1.05);}
.chat-send:disabled{opacity:.4;cursor:default;transform:none;}
.tdots{display:flex;gap:3px;align-items:center;padding:5px 2px;}
.tdot{width:4px;height:4px;border-radius:50%;background:var(--t3);animation:td 1.2s infinite;}
.tdot:nth-child(2){animation-delay:.2s}.tdot:nth-child(3){animation-delay:.4s}
@keyframes td{0%,60%,100%{transform:translateY(0);background:var(--t3)}30%{transform:translateY(-4px);background:var(--gold)}}
.spin-sm{width:12px;height:12px;border:2px solid rgba(0,0,0,.2);border-top-color:var(--bg);border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}

/* ── RIPPLE MAP ── */
.ep-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;}
.ep-cell{aspect-ratio:1;border-radius:5px;cursor:pointer;border:1px solid var(--ln2);background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:12px;font-family:'JetBrains Mono',monospace;color:var(--t3);transition:all .15s;position:relative;overflow:hidden;}
.ep-cell:hover{transform:scale(1.1);z-index:2;border-color:var(--ln);}
.ep-cell.sel{box-shadow:0 0 0 2px var(--gold);z-index:3;}
.ep-cell.origin{background:rgba(201,168,76,.25);border-color:var(--gold);color:var(--gold2);}
.ep-cell.crit{background:rgba(208,80,80,.2);border-color:rgba(208,80,80,.4);color:var(--red2);}
.ep-cell.major{background:rgba(200,120,56,.15);border-color:rgba(200,120,56,.3);color:var(--amber2);}
.ep-cell.mod{background:rgba(201,168,76,.1);border-color:rgba(201,168,76,.2);color:var(--gold);}
.ep-cell.minor{background:var(--gB);border-color:rgba(72,120,200,.15);color:var(--blue2);}
.ep-cell.none{opacity:.3;}
.ep-glow{position:absolute;inset:0;border-radius:4px;animation:epg 2s infinite;}
@keyframes epg{0%,100%{opacity:0}50%{opacity:.35}}

/* ── DIFF ── */
.diff{font-family:'JetBrains Mono',monospace;font-size:14px;border-radius:5px;overflow:hidden;}
.dl{padding:2px 8px;line-height:1.6;}
.dl-r{background:rgba(208,80,80,.08);color:#ff9090;} .dl-r::before{content:'− ';opacity:.6;}
.dl-a{background:rgba(74,173,117,.08);color:var(--green2);} .dl-a::before{content:'+ ';opacity:.6;}
.dl-c{color:var(--t3);}

/* ── DRAG DROP ZONE ── */
.drop-zone{border:2px dashed var(--ln);border-radius:10px;padding:30px;text-align:center;transition:all .15s;cursor:pointer;}
.drop-zone:hover,.drop-zone.active{border-color:var(--gold);background:var(--gG);}
.drop-icon{font-size:40px;margin-bottom:10px;opacity:.4;}
.drop-text{font-size:16px;color:var(--t3);}
.drop-sub{font-size:14px;color:var(--t4);margin-top:4px;}

/* ── CHANGE CARD ── */
.chcard{border:1px solid var(--ln);border-radius:8px;overflow:hidden;margin-bottom:7px;}
.chcard-h{padding:7px 11px;background:var(--bg3);display:flex;align-items:center;gap:7px;}
.chcard-h input[type=checkbox]{accent-color:var(--gold);width:13px;height:13px;cursor:pointer;}
.chtag{font-size:12px;padding:2px 6px;border-radius:3px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;flex-shrink:0;}
.ct-rw{background:rgba(208,80,80,.15);color:var(--red2)} .ct-add{background:rgba(74,173,117,.15);color:var(--green2)}
.ct-rm{background:rgba(208,80,80,.1);color:#ff9090} .ct-sh{background:var(--gB);color:var(--blue2)}
.ct-tn{background:rgba(136,88,200,.15);color:var(--purple2)}
.chcard-b{padding:7px 11px 10px;}

/* ── EMPTY STATE ── */
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;color:var(--t3);}
.ei{font-size:48px;margin-bottom:16px;opacity:.2;}
.et{font-family:'Cormorant Garamond',serif;font-size:23px;color:var(--t2);margin-bottom:7px;}
.es{font-size:15px;color:var(--t3);line-height:1.6;max-width:280px;}

/* ── TOOLTIP ── */
[data-tip]{position:relative;}
[data-tip]:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:var(--bg4);border:1px solid var(--ln);color:var(--t1);font-size:14px;padding:4px 9px;border-radius:5px;white-space:nowrap;z-index:100;pointer-events:none;}

/* ── RELATIONSHIP EDGE LABELS ── */
.rel-label{font-size:13px;fill:var(--t3);pointer-events:none;}
.rel-tip{font-size:14px;background:var(--bg4);padding:4px 9px;border-radius:5px;border:1px solid var(--ln);position:absolute;pointer-events:none;white-space:nowrap;color:var(--t1);}

/* ── BIBLE FLAG ── */
.bible-flag{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.bf-changed{background:rgba(200,120,56,.15);color:var(--amber2);border:1px solid rgba(200,120,56,.25);}
.bf-new{background:rgba(74,173,117,.12);color:var(--green2);border:1px solid rgba(74,173,117,.22);}
.bf-conflict{background:var(--gR);color:var(--red2);border:1px solid var(--bR);}

/* ── ASSET EDITOR PANEL ── */
.asset-detail{position:fixed;top:0;right:0;bottom:0;width:380px;background:var(--bg2);border-left:1px solid rgba(201,168,76,.25);z-index:50;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .22s cubic-bezier(.4,0,.2,1);box-shadow:-20px 0 60px rgba(0,0,0,.5);}
.asset-detail.open{transform:translateX(0);}
.asset-detail-backdrop{position:fixed;inset:0;z-index:49;cursor:pointer;}
.asset-detail-thumb{height:160px;display:flex;align-items:center;justify-content:center;font-size:77px;border-bottom:1px solid var(--ln);flex-shrink:0;position:relative;background:var(--bg3);}
.asset-detail-thumb-edit{position:absolute;bottom:10px;right:10px;background:var(--bg2);border:1px solid var(--ln);border-radius:6px;padding:4px 8px;font-size:14px;color:var(--t2);cursor:pointer;transition:all .12s;}
.asset-detail-thumb-edit:hover{background:var(--bg3);color:var(--t1);}
.asset-detail-body{flex:1;overflow-y:auto;padding:16px;}
.asset-detail-foot{padding:12px 16px;border-top:1px solid var(--ln);display:flex;gap:7px;flex-shrink:0;background:var(--bg);}
.tag-input-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:7px 10px;border:1px solid var(--ln);border-radius:7px;background:var(--bg3);min-height:38px;cursor:text;}
.tag-input-row:focus-within{border-color:var(--gold);}
.tag-chip{display:inline-flex;align-items:center;gap:4px;background:var(--bg4);border:1px solid var(--ln);padding:2px 8px;border-radius:10px;font-size:14px;color:var(--t2);}
.tag-chip-x{background:none;border:none;color:var(--t3);cursor:pointer;font-size:16px;line-height:1;padding:0;margin-left:1px;transition:color .1s;}
.tag-chip-x:hover{color:var(--red2);}
.tag-bare-input{border:none;outline:none;background:transparent;color:var(--t1);font-size:15px;font-family:'DM Sans',sans-serif;min-width:80px;flex:1;}
.emoji-picker{display:flex;flex-wrap:wrap;gap:4px;padding:10px;background:var(--bg3);border:1px solid var(--ln);border-radius:9px;max-width:240px;}
.emoji-opt{width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:21px;cursor:pointer;border-radius:5px;transition:background .1s;}
.emoji-opt:hover{background:var(--bg4);}
.asset-card.selected{border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,168,76,.2);}
.confirm-delete{padding:12px 16px;background:var(--gR);border-top:1px solid rgba(208,80,80,.2);flex-shrink:0;}

.gen-step-row{display:flex;align-items:center;gap:9px;transition:opacity .4s;}
.gen-step-dot{width:14px;height:14px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .3s;}
.gen-preview-section{animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.gen-example{padding:10px 13px;border-radius:8px;border:1px solid var(--ln);background:var(--bg3);cursor:pointer;transition:all .12s;}
.gen-example:hover{border-color:rgba(201,168,76,.3);background:var(--bg4);}

.rc{position:relative;padding-left:18px;}
.rc::before{content:'';position:absolute;left:5px;top:0;bottom:0;width:1px;background:var(--ln);}
.rc-node{position:relative;margin-bottom:9px;padding:8px 11px;background:var(--bg3);border:1px solid var(--ln);border-radius:7px;}
.rc-node::before{content:'';position:absolute;left:-13px;top:50%;transform:translateY(-50%);width:7px;height:7px;border-radius:50%;border:1px solid var(--ln);background:var(--bg2);}
.rc-l0::before{background:var(--gold);border-color:var(--gold);}
.rc-l1::before{background:var(--red);border-color:var(--red);}
.rc-l2::before{background:var(--amber);border-color:var(--amber);}
.rc-l3::before{background:var(--blue);border-color:var(--blue);}

/* ── SYNC INDICATOR ── */
.sync-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0;}
.sync-ok{background:var(--green);}
.sync-saving{background:var(--amber);animation:pulse 1s infinite;}
.sync-error{background:var(--red);}
.sync-offline{background:var(--t4);}
.sync-bar{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--t3);font-family:"JetBrains Mono",monospace;padding:4px 10px;background:var(--bg3);border-bottom:1px solid var(--ln);min-height:26px;}
.user-chip{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--t3);padding:2px 7px;background:var(--bg4);border:1px solid var(--ln);border-radius:20px;}
.user-avatar{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}

/* ── PUBLISH MODULE ── */
.plat-btn{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg3);border:1px solid var(--ln);border-radius:8px;cursor:pointer;transition:all .15s;font-size:15px;color:var(--t2);}
.plat-btn:hover{border-color:rgba(201,168,76,.4);color:var(--t1);}
.plat-btn.connected{border-color:rgba(74,222,128,.3);background:rgba(74,222,128,.04);}
.plat-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;}
.plat-yt{background:#ff0000;color:#fff;}
.plat-tt{background:#000;color:#fff;}
.plat-ws{background:var(--bg4);color:var(--gold);}
.pub-job{display:grid;grid-template-columns:28px 1fr auto auto;align-items:center;gap:10px;padding:10px 12px;background:var(--bg3);border:1px solid var(--ln);border-radius:8px;margin-bottom:7px;}
.pub-status{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:20px;font-size:13px;font-family:"JetBrains Mono",monospace;}
.pub-scheduled{background:rgba(96,165,250,.1);color:var(--blue);border:1px solid rgba(96,165,250,.2);}
.pub-publishing{background:rgba(201,168,76,.1);color:var(--gold);border:1px solid rgba(201,168,76,.2);}
.pub-published{background:rgba(74,222,128,.1);color:var(--green);border:1px solid rgba(74,222,128,.2);}
.pub-failed{background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.2);}
.pub-draft{background:rgba(100,116,139,.1);color:var(--t3);border:1px solid var(--ln);}

/* ── AUTH MODAL ── */
.auth-modal{background:var(--bg2);border:1px solid rgba(201,168,76,.3);border-radius:16px;padding:32px;width:380px;text-align:center;}
.auth-logo{font-family:"Cormorant Garamond",serif;font-size:32px;color:var(--gold2);font-weight:700;margin-bottom:4px;}
.auth-sub{font-size:15px;color:var(--t3);margin-bottom:28px;}
.auth-tab{display:flex;gap:0;border:1px solid var(--ln);border-radius:8px;overflow:hidden;margin-bottom:20px;}
.auth-tab button{flex:1;padding:9px;font-size:15px;background:transparent;border:none;color:var(--t3);cursor:pointer;transition:all .15s;}
.auth-tab button.on{background:var(--bg4);color:var(--t1);}

/* ── LOGIN PAGE (full-screen gate) ── */
.login-shell{display:flex;height:100vh;width:100vw;overflow:hidden;}
.login-left{flex:1;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;z-index:2;}
.login-right{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
.login-right-bg{position:absolute;inset:0;background:linear-gradient(135deg,#0d0d18 0%,#1a1028 40%,#0c1520 70%,#09090b 100%);opacity:.95;}
.login-right-pattern{position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(201,168,76,.015) 60px,rgba(201,168,76,.015) 61px);pointer-events:none;}
.login-right-content{position:relative;z-index:2;padding:48px;max-width:480px;text-align:left;}
.login-card{width:100%;max-width:420px;padding:0 32px;}
.login-brand{text-align:center;margin-bottom:36px;}
.login-brand-name{font-family:"Cormorant Garamond",serif;font-size:42px;color:var(--gold2);font-weight:700;letter-spacing:.5px;line-height:1.1;}
.login-brand-sub{font-size:14px;color:var(--t3);letter-spacing:3px;text-transform:uppercase;margin-top:6px;}
.login-tabs{display:flex;border:1px solid var(--ln);border-radius:10px;overflow:hidden;margin-bottom:24px;background:var(--bg2);}
.login-tabs button{flex:1;padding:11px 8px;font-size:14px;font-weight:500;background:transparent;border:none;color:var(--t3);cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;letter-spacing:.3px;}
.login-tabs button.on{background:var(--gG);color:var(--gold2);box-shadow:inset 0 -2px 0 var(--gold);}
.login-form{display:flex;flex-direction:column;gap:14px;}
.login-input{width:100%;padding:12px 14px;border-radius:9px;border:1px solid var(--ln);background:var(--bg2);color:var(--t1);font-size:15px;font-family:'DM Sans',sans-serif;transition:border-color .15s,box-shadow .15s;outline:none;}
.login-input:focus{border-color:rgba(201,168,76,.5);box-shadow:0 0 0 3px rgba(201,168,76,.08);}
.login-input::placeholder{color:var(--t4);}
.login-btn{width:100%;padding:13px;border-radius:9px;border:none;font-size:16px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;letter-spacing:.4px;}
.login-btn-gold{background:linear-gradient(135deg,var(--gold),#b8943e);color:var(--bg);box-shadow:0 2px 12px rgba(201,168,76,.25);}
.login-btn-gold:hover{background:linear-gradient(135deg,var(--gold2),var(--gold));box-shadow:0 4px 20px rgba(201,168,76,.35);transform:translateY(-1px);}
.login-btn-gold:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
.login-btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--ln);}
.login-btn-ghost:hover{background:var(--bg3);border-color:var(--t4);}
.login-divider{display:flex;align-items:center;gap:12px;margin:4px 0;color:var(--t4);font-size:13px;}
.login-divider::before,.login-divider::after{content:"";flex:1;height:1px;background:var(--ln);}
.login-error{background:rgba(208,80,80,.08);border:1px solid rgba(208,80,80,.25);border-radius:8px;padding:10px 14px;color:var(--red2);font-size:14px;}
.login-success{background:rgba(74,173,117,.08);border:1px solid rgba(74,173,117,.25);border-radius:8px;padding:10px 14px;color:var(--green2);font-size:14px;}
.login-features{list-style:none;padding:0;margin:0;}
.login-features li{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:15px;color:var(--t2);line-height:1.5;}
.login-features li:last-child{border-bottom:none;}
.login-feat-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.15);}
.login-quote{margin-top:32px;padding:20px;border-left:2px solid rgba(201,168,76,.3);font-style:italic;color:var(--t3);font-size:15px;line-height:1.6;}
.login-quote-author{color:var(--t4);font-size:13px;margin-top:8px;font-style:normal;}
@media(max-width:900px){.login-right{display:none;}.login-left{flex:1;}}

/* ── TEAM PANEL ── */
.member-row{display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg3);border:1px solid var(--ln);border-radius:8px;margin-bottom:6px;}
.member-role{padding:2px 8px;border-radius:20px;font-size:13px;font-family:"JetBrains Mono",monospace;}
.role-owner{background:rgba(201,168,76,.15);color:var(--gold);border:1px solid rgba(201,168,76,.3);}
.role-editor{background:rgba(96,165,250,.1);color:var(--blue);border:1px solid rgba(96,165,250,.2);}
.role-viewer{background:rgba(100,116,139,.1);color:var(--t3);border:1px solid var(--ln);}

/* ── PROJECT WEBSITE PREVIEW ── */
.site-preview{border-radius:10px;overflow:hidden;border:1px solid var(--ln);background:#000;}
.site-topbar{height:28px;background:rgba(0,0,0,.8);backdrop-filter:blur(10px);display:flex;align-items:center;gap:5px;padding:0 12px;border-bottom:1px solid rgba(255,255,255,.08);}
.site-dot{width:8px;height:8px;border-radius:50%;}
.site-frame{width:100%;background:#0a0a0f;}

/* ── WEBSITE VIEWER (full viewer site) ── */
.viewer-shell{min-height:100vh;background:#08080d;color:#e0e0ee;font-family:"DM Sans",sans-serif;}
.viewer-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:64px;background:rgba(8,8,13,.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.07);}
.viewer-hero{position:relative;height:85vh;min-height:500px;display:flex;align-items:flex-end;overflow:hidden;}
.viewer-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#0a0a14 0%,#1a1025 50%,#0d1520 100%);}
.viewer-hero-grad{position:absolute;inset:0;background:linear-gradient(to top,#08080d 0%,rgba(8,8,13,.6) 40%,transparent 100%);}
.viewer-hero-content{position:relative;z-index:2;padding:0 48px 56px;}
.viewer-ep-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;}
.viewer-ep-card{border-radius:10px;overflow:hidden;background:var(--bg3,#18181f);border:1px solid rgba(255,255,255,.07);cursor:pointer;transition:transform .2s,border-color .2s;}
.viewer-ep-card:hover{transform:translateY(-3px);border-color:rgba(201,168,76,.3);}
.viewer-ep-thumb{height:140px;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(135deg,#1a1a2e,#16213e);}
.viewer-ep-info{padding:12px;}
.paywall-card{background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.02));border:1px solid rgba(201,168,76,.3);border-radius:12px;padding:28px;text-align:center;}
.price-card{background:var(--bg3,#18181f);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px;cursor:pointer;transition:all .2s;}
.price-card:hover,.price-card.selected{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.04);}
.price-card.featured{border-color:rgba(201,168,76,.4);background:rgba(201,168,76,.05);}
`;

// ══════════════════════════════════════════════════════════════
// IMAGE PERSISTENCE — IndexedDB (no size limits unlike localStorage)
// ══════════════════════════════════════════════════════════════
const IDB_NAME = "DramaStudio";
const IDB_VER  = 1;
const IDB_STORE = "images";

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VER);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

async function idbSave(key, value) {
  try {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => res(true);
      tx.onerror    = e => rej(e.target.error);
    });
  } catch(e) { console.warn("[IDB] save failed:", e); }
}

async function idbLoad(key) {
  try {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx  = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = e => res(e.target.result ?? null);
      req.onerror   = e => rej(e.target.error);
    });
  } catch(e) { console.warn("[IDB] load failed:", e); return null; }
}

async function idbLoadPrefix(prefix) {
  // Load all keys starting with prefix, return {key: value}
  try {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx    = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const range = IDBKeyRange.bound(prefix, prefix + "\uFFFF");
      const result = {};
      const req = store.openCursor(range);
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) { result[cursor.key] = cursor.value; cursor.continue(); }
        else res(result);
      };
      req.onerror = e => rej(e.target.error);
    });
  } catch(e) { console.warn("[IDB] loadPrefix failed:", e); return {}; }
}

async function idbDeletePrefix(prefix) {
  try {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx    = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const range = IDBKeyRange.bound(prefix, prefix + "\uFFFF");
      const req = store.openCursor(range);
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) { cursor.delete(); cursor.continue(); }
        else res(true);
      };
      req.onerror = e => rej(e.target.error);
    });
  } catch(e) { console.warn("[IDB] deletePrefix failed:", e); }
}

// Keys: "vni:{epId}:{panelId}" for VN panel images
// Keys: "avi:{charId}:{historyId}" for avatar history images
function vnImageKey(epId, panelId) { return `vni:${epId}:${panelId}`; }
function avatarKey(charId, histId) { return `avi:${charId}:${histId}`; }


// SVG noise texture — defined as constant to avoid JSX parser confusion with encoded < >
const NOISE_SVG_URL = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const NOISE_SVG_URL2 = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";


// ═══════════════════════════════════════════════════════════════════
// INITIAL STATE — the single source of truth
// ═══════════════════════════════════════════════════════════════════
const BLANK_BIBLE = {
  characters: [],
  relationships: [],
  worldFacts: [],
  endings: [],
  decisionPoints: [],
  bibleVersion: 1,
  lastBibleChange: null,
  bibleChangelog: [],
  storyPrompt: {
    logline: "",
    tone: "",
    world: "",
    themes: "",
    episodeArc: "",
    visualStyle: "",
    audienceNotes: "",
    additionalNotes: "",
    lastGenerated: null,
  },
};

const INITIAL_STATE = {
  activeProject: null,
  activeEpisode: null,
  activeSegment: null,
  view: "dashboard",
  apiKey: "",
  chatOpen: true,
  projects: [],
  bible: BLANK_BIBLE,
  assets: [],
  episodes: [],
  ripple: null,
  chatHistory: [],
  undoStack: [],
  redoStack: [],
  // Supabase sync
  syncStatus: "offline",
  syncError: null,
  supabaseUrl: "",
  supabaseKey: "",
  currentUser: null,
  teamMembers: [],
  // Publish
  publishJobs: [],
  platformCreds: {},
  // Video generation
  jimengKey: "",
  geminiKey: "",
  openaiKey: "",        // for DALL-E 3
  jimengModel: "seedance_v2",
  jimengRes: "720p",
  jimengAspect: "9:16",
  videoJobs: [],  // [{id, segId, epId, projectId, status, taskId, videoUrl, error, startedAt, finishedAt}]
  // Image engine for VN panels + avatars
  // "nanoBanana2" = gemini-3.1-flash-image-preview (pinned, adaptive ratios)
  // "gemini" = Google Gemini auto-cascade (NB2 → NB Pro → NB1)
  // "pollinations" = Pollinations.ai (100% free, no key needed)
  // "dalle" = OpenAI DALL-E 3 (paid, needs OpenAI key)
  imageEngine: "nanoBanana2",
  // Audiobook
  elevenlabsKey: "",
  audioTranscripts: [],  // [{id,epId,projectId,lines,voiceMap,createdAt}]
};

// ═══════════════════════════════════════════════════════════════════
// THE HOUSE OF HIGH FASHION — PRELOADED PROJECT DATA
// Complete 10-episode drama with full bible, characters, relationships,
// world facts, endings, decision points, and production assets.
// ═══════════════════════════════════════════════════════════════════
const THOHF_PROJECT = {
  id: "thohf",
  name: "The House of High Fashion",
  type: "drama",
  genre: "Fashion Drama",
  color: "#c9a84c",
  status: "active",
  episodes: 30,
  epRuntime: 180,
  desc: "Inside the four most powerful fashion houses in the world, a 100-episode interactive drama unfolds across Paris, Milan, Seoul, and New York. When the founder of Maison Lumière is found to have built her empire on a buried secret, every heir, rival, craftsman, and hidden criminal becomes a player in a game that has been running since 1974.",
  slug: "thohf",
  free_episodes: 3,
  price_monthly: 9.99,
  price_annual: 79.99,
  price_lifetime: 199,
  global_pass: true,
  per_project_pass: true,
  website_config: {
    tagline: "Every stitch hides a secret fifty years in the making.",
    theme: "luxury",
    about: "A 100-episode interactive drama spanning four fashion houses. Two human players. Unlimited AI characters. The story changes based on every decision. Episodes 1–30 are the Pure AI Arc — the world as it exists before human hands touch it.",
    metaTitle: "The House of High Fashion",
    metaDesc: "A 100-episode fashion drama. Four houses. One buried secret. Two human players from Episode 31.",
    accentColor: "#c9a84c",
    fontStyle: "serif",
    heroBg: "gradient",
    twitterHandle: "@thohf",
  },
  site_published: false,
};

const THOHF_BIBLE = {
  bibleVersion: 4,
  lastBibleChange: "2026-02-25T10:00:00Z",
  bibleChangelog: [
    { version:1, timestamp:"2026-02-18T21:00:00Z", field:"bootstrap", entityId:"thohf", before:null, after:"Initial generation — series bible, four houses, 240 characters, criminal underworld", note:"Session 1: Series Bible" },
    { version:2, timestamp:"2026-02-19T06:00:00Z", field:"episodes", entityId:"thohf", before:"outline", after:"Full 30-episode scripts with writers room sessions", note:"Session 3: Episodes 1–30" },
    { version:3, timestamp:"2026-02-20T20:00:00Z", field:"character_expansion", entityId:"thohf", before:"4 houses", after:"China acquisition arc + Silicon Valley disruptors + cross-house love stories", note:"Session 5: V2 character expansion" },
    { version:4, timestamp:"2026-02-25T10:00:00Z", field:"production_os_import", entityId:"thohf", before:null, after:"Imported into Production OS with full episode manifest", note:"Session 7: Production OS import" },
  ],
  characters: [
    // ── MAISON LUMIÈRE (Paris) ──────────────────────────────────────
    {
      id:"char_vivienne", name:"Vivienne Alastair-Voss", role:"Founder & Matriarch",
      archetype:"The Gravity Everything Orbits", age:"74", nationality:"French",
      appearance:"Silver-streaked hair, always in house ivory or black. Moves as if the building is still hers — because it is. The ivory-handled letter opener on her desk has not moved in thirty years.",
      voice:"Measured, precise — every sentence is a verdict. She has never once raised her voice. She has never needed to.",
      secret:"Received a call the morning of Episode 1 she has told no one about. Knows the founding documents were forged. Knows what the photograph in the package means. That Celeste is investigating.",
      motivation:"The anniversary collection to succeed. The past to stay past. She has sacrificed everything she loves to protect what she built.",
      arc:"Starts as unchallengeable authority. By Episode 12 (Magnus returns), the facade develops its first hairline crack. By Episode 30 she is holding an envelope she has been avoiding for fifty years.",
      flags:[], lastChanged:null,
      visualLock:"74F French. Silver hair swept severe. Ivory or black always. Still posture — owns every room she enters. Ivory-handled letter opener if at desk. Film grain.",
      voiceProfile:"French-accented English. Low, measured. Never raised. Each sentence a verdict. Slow deliberate cadence.",
      house: "lumiere",
      relationships:[
        {to:"char_celeste_a", label:"Warmth as management", tension:8, note:"Already watching her. The warmth is real and the management is real."},
        {to:"char_raphael", label:"Deep mutual respect", tension:3, note:"A decade of collaboration. He has made things she did not know the house could still make."},
        {to:"char_magnus", label:"Thirty years of shared secret", tension:9, note:"He left. He is back. Neither has said what they both know."},
        {to:"char_dorian", label:"Love without full trust", tension:6, note:"Her son. She loves him. She does not entirely trust his judgment under pressure."},
      ],
    },
    {
      id:"char_raphael", name:"Raphael Dubois", role:"Head Designer",
      archetype:"The Artist Who Made Something He Doesn't Understand", age:"39", nationality:"French",
      appearance:"The clothes are impeccable. His desk is chaos. His hands are the most photographed hands in French fashion — he didn't know this until someone told him.",
      voice:"Precise about cloth, evasive about everything else. He speaks about design the way other people speak about love.",
      secret:"The anniversary collection collar has a construction that matches a 1952 reference sketch in the sealed archive. He found the technique in a book of patterns he was given anonymously eight months ago.",
      motivation:"Make the thing that has been asking to be made. He does not yet know what that thing is connected to.",
      arc:"Episodes 1–6 establish the collar as a mystery. Episode 12 (Magnus return): Magnus sees the collar and goes pale. Episode 28: Raphael finally understands what he made and why the house needed him to make it.",
      flags:[], lastChanged:null,
      visualLock:"39M French. Impeccable clothes, chaotic desk. Long hands always in motion or very still. Collar mannequin visible behind him in studio scenes.",
      voiceProfile:"Precise about cloth, evasive about everything else. Quiet intensity. Pauses before answering.",
      house: "lumiere",
    },
    {
      id:"char_celeste_a", name:"Celeste Alastair", role:"Intern / Heir",
      archetype:"The Outsider Who Was Always Inside", age:"23", nationality:"French",
      appearance:"Intern lanyard. Trying very hard not to show how much this moment means. She has her father's eyes — which Vivienne finds either reassuring or troubling, depending on the day.",
      voice:"Curious, careful, occasionally too direct for the room. She asks the questions everyone else has decided not to ask.",
      secret:"Signed for a package addressed to Vivienne on Day 1 and put it in her bag without giving it to her immediately. Has been carrying it for three days. Has been in the archive. Has found the gap.",
      motivation:"Understand why she was sent here. Understand what her grandfather actually was in the founding of this house.",
      arc:"Catalyst and investigator. She connects what others have deliberately kept separate. By Episode 28 she holds the piece that makes the picture complete.",
      flags:[], lastChanged:null,
      visualLock:"23F French. Intern lanyard visible. Dark hair. Thoughtful eyes — father's eyes. Slightly too direct for the room. Envelope or bag always nearby eps 1-4.",
      voiceProfile:"Curious, careful. Occasionally blurts the real question. Slight formality from trying not to overstep.",
      house: "lumiere",
    },
    {
      id:"char_magnus", name:"Magnus Voss", role:"The Returned — Former Partner",
      archetype:"The Man Who Left and Came Back Anyway", age:"77", nationality:"Swedish-French",
      appearance:"Thirty years older than the photographs in the archive. Carries himself like someone who made a decision that cost him everything and has made peace with it. Mostly.",
      voice:"Slow, deliberate, with the particular care of someone translating from a language they keep partly private.",
      secret:"Left in 1974 after the founding agreement was restructured. The restructuring was not voluntary. Has been watching the house from a distance for thirty years. Something changed six months ago.",
      motivation:"He came back because the house called him. Houses do that. He needs to see if the thing he left is still there.",
      arc:"Iron Skeleton — Episode 12. His return is the event that makes the audience re-read everything they thought they understood about Episodes 1–11.",
      flags:[], lastChanged:null,
      visualLock:"77M Swedish-French. Silver-white hair. Heavy deliberate movement. Carries the weight of a decision made decades ago. Dark coat. Looks at things longer than other people.",
      voiceProfile:"Slow. Swedish cadence under the French. Translates internally before speaking. Long pauses normal.",
      house: "lumiere",
    },
    {
      id:"char_simone", name:"Simone Archambault", role:"Creative Director of Strategy",
      archetype:"The Righteous Force With A Complicated File", age:"44", nationality:"French",
      appearance:"Responds to everyone with full competence. Her eyes are always doing something her voice isn't. Has been keeping a physical file for two years.",
      voice:"Board-room precise. She makes observations that happen to be accusations.",
      secret:"Has a 1974 collection reference in her private file. Is investigating Raphael — not with hostility but with the reassessment of someone who once admired something and has since had reason to reconsider.",
      motivation:"The house to be exactly what it says it is. She has a higher tolerance for the truth than most people around her.",
      arc:"Initially positioned as antagonist. By Episode 20 the audience understands she is the character most committed to the house's actual integrity. Her trajectory and Raphael's are on a collision course.",
      flags:[], lastChanged:null,
      visualLock:"44F French. Boardroom precision in everything. Dark structured clothing. Eyes always observing what her voice doesn't acknowledge. Physical file folder sometimes in hand.",
      voiceProfile:"Board-room precise. Observations that function as accusations. Controlled warmth as a tool.",
      house: "lumiere",
    },
    {
      id:"char_marco_v", name:"Marco Vitelli", role:"Master Pattern Cutter",
      archetype:"The Craftsman Who Knows Too Much", age:"62", nationality:"Italian-French",
      appearance:"Hands slightly raw from forty years of fabric and pins. Dresses himself in things he made twenty years ago, perfectly maintained.",
      voice:"Precise about craft, evasive about history. Talks about coffee when he means something else.",
      secret:"Knows about the tin box in the wall. Knows what the property number means. Was present in 1974. Has kept the photograph of the woman for thirty-eight years.",
      motivation:"The anniversary collection to be perfect. The past to stay where he put it.",
      arc:"The emotional counterweight to every political scene. His conversation with Claude Petit in Episode 5 is the most important scene in the first movement — and neither of them says anything.",
      flags:[], lastChanged:null,
      visualLock:"62M Italian-French. Hands slightly raw, expert. Clothes he made twenty years ago, maintained perfectly. Compact, precise movements. Pattern pieces always nearby.",
      voiceProfile:"Precise about craft. Evasive about history. Talks about coffee when he means something else. Low voice.",
      house: "lumiere",
    },
    {
      id:"char_claude_petit", name:"Claude Petit", role:"The Ancient Witness",
      archetype:"The Oracle Who Speaks In Riddles Because The Truth Is A Riddle", age:"79", nationality:"French",
      appearance:"Has been at the house in some capacity since 1962. No one is entirely sure what his current role is. He is on the payroll. That is all anyone can confirm.",
      voice:"Each of his 100 lines across the series is a complete truth that sounds like an observation. His first line: 'Every house has a first thread. The question is who pulled it.'",
      secret:"His 100 lines contain the complete alternative history of the house. The audience who collects all 100 will understand everything before Episode 90.",
      motivation:"He has already seen everything. He is watching to see if the generation who inherits it will do better.",
      arc:"Present in every episode. Speaks once per episode. Never the same type of observation twice.",
      flags:[], lastChanged:null,
      visualLock:"79M French. Has been here since 1962. Undefined role, definite presence. Moves through rooms like furniture that thinks. Always dressed as if for a function no one else was told about.",
      voiceProfile:"Each line a complete truth that sounds like an observation. Unhurried. No filler words. Ever.",
      house: "lumiere",
    },
    {
      id:"char_theodore", name:"Théodore Blanc", role:"Chief Accountant",
      archetype:"The Honest Man In A Dishonest Institution", age:"57", nationality:"French",
      appearance:"Nineteen years of making this house's numbers honest. Today, for the first time, a number he didn't put there.",
      voice:"Talks to himself softly when working. Not dramatically — the way accountants actually think aloud.",
      secret:"Found the Luxembourg fund (Strelkov Capital Management, 2019, 4.7% stake) on a Tuesday afternoon. Closed the file. 'Not today.' He has since reopened it.",
      motivation:"The numbers to be honest. He is constitutionally incapable of the alternative.",
      arc:"Episode 7 establishes the discovery. Episode 16 is his choice. The most consequential brave act in the series — and the most catastrophic thing that happens to a good man.",
      flags:[], lastChanged:null,
      visualLock:"57M French. Accountant's precision in dress. Reading glasses on or beside him always. Quiet self-talk when working. Numbers man in a story-man's building.",
      voiceProfile:"Talks to himself softly — not drama, actual thinking. Precise. Understated. 'Not today' delivered flat.",
      house: "lumiere",
    },
    // ── CASA FERRO (Milan) ──────────────────────────────────────────
    {
      id:"char_luciana", name:"Luciana Ferro", role:"Heir — Casa Ferro",
      archetype:"The Legitimate Heir Surrounded By Illegitimate Power", age:"38", nationality:"Italian",
      appearance:"Boardroom composure. Outvoted. Composed. Twelve seconds of her face in Episode 7 establishes her completely — no dialogue required.",
      voice:"Precise, measured, with the specific restraint of someone who knows the room is against her.",
      secret:"Her father made an arrangement with the Camorra that preceded her inheritance of the house by fifteen years. She has been trying to unpick it since she took control.",
      motivation:"Casa Ferro to be free of what it was before she was in charge of it.",
      arc:"Episodes 7–14. The criminal layer becomes undeniable in Episode 14 (The Factory). Her choice in Episode 27 is the Ferro Warrant — the CFO who starts keeping a file.",
      flags:[], lastChanged:null,
      visualLock:"38F Italian. Absolute boardroom composure. Dark elegant clothing. Never reactive — processes internally before responding. Milan sophistication, never Paris imitating.",
      voiceProfile:"Precise, measured. The restraint of someone who knows the room is against her. Never gives ground audibly.",
      house: "ferro",
    },
    // ── HOUSE JEONG (Seoul) ──────────────────────────────────────────
    {
      id:"char_minjun", name:"Min-jun Jeong", role:"Creative Director — House Jeong",
      archetype:"The Prodigy With A Borrowed Foundation", age:"34", nationality:"Korean",
      appearance:"The most technically gifted designer in the series. Moves like someone who has been told he is exceptional for so long he has started to believe it cautiously.",
      voice:"Direct, warm, occasionally too direct for the room — like Celeste, but with more consequence.",
      secret:"The investor meeting that established House Jeong's European expansion was with a party he told his mentor Ji-young was someone else. The lie is twelve episodes from surfacing.",
      motivation:"House Jeong to be undeniable. His mentor Ji-young's faith in him to be justified.",
      arc:"Episodes 9, 17, 24. The lie at full pressure in Episode 17 (The Seoul Pressure). By Episode 24 the shadow investor has a face.",
      flags:[], lastChanged:null,
      visualLock:"34M Korean. Exceptional precision in dress and movement. Studio context: surrounded by technical work of the highest quality. Still hands when lying.",
      voiceProfile:"Direct, warm. Occasionally too direct. Confidence earned not assumed. English with Korean cadence.",
      house: "jeong",
    },
    // ── EMPIRE ATELIER (New York) ──────────────────────────────────
    {
      id:"char_darius", name:"Darius King", role:"Co-Founder — Empire Atelier",
      archetype:"The Strategist Who Has Been Waiting For The Right Moment", age:"45", nationality:"American",
      appearance:"Watched the Lumière building from a car in Episode 10. Has not blinked.",
      voice:"The operator and the dreamer in the same breath. Shonda Rhimes wrote him — he has the quality of someone who has considered every room's power structure before he speaks.",
      secret:"The acquisition of Maison Lumière is the thirty-year project. Not a hostile takeover — a homecoming. What connects him to the house is what the Protestor's signs are spelling.",
      motivation:"Empire Atelier to stand at the center of the conversation, not its edge. What his co-founder Marcus built in the Bronx to be recognized.",
      arc:"Episodes 10, 22, 26. He moves from silence to action in Episode 26. The Bronx Collective meeting with Marcus is Episode 31 — the first episode with human players.",
      flags:[], lastChanged:null,
      visualLock:"45M American. Absolute stillness in observation. Dark clothing, no house affiliation visible. Has considered every room's power structure before entering.",
      voiceProfile:"Operator and dreamer simultaneously. Considered. Long sentences that arrive at precise points.",
      house: "empire",
    },
  ],
  relationships: [
    { from:"char_vivienne",    to:"char_celeste_a", label:"Warmth as management",      tension:8,  note:"She sees her granddaughter's investigation and manages it with warmth instead of deflection. Both are genuine." },
    { from:"char_vivienne",    to:"char_magnus",    label:"Thirty years of shared silence", tension:10, note:"They are the only two people alive who know what actually happened in 1974." },
    { from:"char_raphael",     to:"char_simone",    label:"Mutual orbit of suspicion",  tension:6,  note:"She watches him. He feels her watching. Neither has said what they both suspect." },
    { from:"char_celeste_a",   to:"char_raphael",   label:"Unexpected kinship",         tension:3,  note:"Both outsiders to the dynasty. He asked her: do you want to know what you're looking at? She said yes. That is the whole relationship." },
    { from:"char_marco_v",     to:"char_claude_petit", label:"The unsaid thing",       tension:7,  note:"Two old men who know the same secret. They talk about coffee." },
    { from:"char_magnus",      to:"char_vivienne",  label:"The returned weight",        tension:10, note:"He said to Celeste: 'You look exactly like her.' That sentence is the event of Episode 12." },
    { from:"char_theodore",    to:"char_vivienne",  label:"Nineteen years of honesty vs. one number", tension:8, note:"He has made her numbers honest for nineteen years. He found the number she didn't put there." },
    { from:"char_luciana",     to:"char_vivienne",  label:"Cross-house respect",        tension:4,  note:"The only two women running founding houses. They have never said they admire each other. They do." },
    { from:"char_darius",      to:"char_vivienne",  label:"The project",                tension:9,  note:"She doesn't know he exists. He knows everything about her. This is a thirty-year asymmetry." },
  ],
  worldFacts: [
    { id:"wf_houses",    category:"Four Houses",   fact:"Maison Lumière (Paris, 1951, founding disputed), Casa Ferro (Milan, 1963, Camorra-adjacent), House Jeong (Seoul, 2008, rapidly ascending), Empire Atelier (New York, 2011, Bronx Collective origin). The four houses have never been in the same room at the same time. Episode 21 is the first time." },
    { id:"wf_founding",  category:"The 1974 Secret", fact:"The Maison Lumière founding documents were co-signed by three parties: Vivienne, Henri Alastair, and an unnamed third who withdrew in 1974. The withdrawal was not voluntary. The cadastral property number (75-1952-R-0044-B) connects the building's original ownership to a fourth party the house has never acknowledged." },
    { id:"wf_collar",    category:"The Anniversary Collar", fact:"Raphael's anniversary collection collar uses a construction technique documented in a 1952 reference sketch that matches a pattern from the sealed archive. He found the technique in a book of patterns delivered anonymously. He has not connected these facts." },
    { id:"wf_criminal",  category:"Criminal Layer",  fact:"Five criminal organisations are threaded through the four houses: Strelkov Capital Management (Luxembourg, Casa Ferro/Lumière), Camorra (Milan, Casa Ferro), an unnamed Korean investor group (House Jeong), a Manhattan private equity operation (Empire Atelier), and the original 1952 property arrangement." },
    { id:"wf_protestor", category:"The Protestor's Signs", fact:"The protestor outside Lumière holds a different sign every episode. The 100 signs spell a 100-word message. The first 30 words: FASHION FEEDS ON FORGETTING THE DEAD DO NOT STAY DEAD THEY RETURN TO COLLECT WHAT IS OWED THE WIDOW CASSEL IS VIVIENNE ALASTAIR AND THE HOUSE BELONGS TO ELOISE ALASTAIR." },
    { id:"wf_players",   category:"Human Players",   fact:"Episodes 1–30 are the Pure AI Arc — no human players. Beginning Episode 31, two human players inhabit characters and make real decisions. The AI characters respond dynamically. The episode is generated from what actually happened. Every countdown that reaches zero in Episode 30 is active when the players enter." },
    { id:"wf_endings",   category:"Five Endings",    fact:"ONE: Consolidation (criminal acquisition). TWO: The Burn (two houses fall). THREE: The Heir (the unknown heir inherits). FOUR: The Collective (small houses rise). FIVE: The Ghost (Widow Cassel's truth). After Episode 30: THREE leads at 25.9%. The game is open." },
    { id:"wf_petit_lines", category:"Claude Petit's 100 Lines", fact:"His first 6: (1) Every house has a first thread. The question is who pulled it. (2) The walls remember everything the people inside them choose to forget. (3) A file is only dangerous if someone opens it. (4) A photograph is a kind of memory that persists regardless of what the subject wishes. (5) Every pattern is a record of a decision. (6) A key is only a secret if no one knows the door." },
    { id:"wf_budget",    category:"Production Budget", fact:"Full 100-episode season at 1080p using Seedance 2.0: ~$150 total (30 segments × 180s per episode × $0.00028/second). Development at 720p: ~$50. The economics of pure-AI drama are unprecedented." },
  ],
  // ── VISUAL PRODUCTION GRAMMAR ──────────────────────────────────────
  // These are injected into every segment prompt. Never override unless a scene
  // deliberately breaks the grammar (e.g. flashback sequences use warm sepia grade).
  visualGrammar: {
    seriesGrade: "Champagne and ivory color grade. Cool shadow, warm highlight. 2.39:1 aspect ratio. Film grain always present. Maison Lumière palette: ivory, bone, charcoal, champagne gold. Never pure white, never pure black.",
    seriesLighting: "Dominant: natural north-facing window light. Interiors: practicals supplemented with soft bounce. No theatrical lighting except Episode 21 (the show). Fluorescent cold for archive and accountant office. Candlelight only for intimate confession scenes.",
    seriesCamera: "Default: medium-shot at eye-level, static or imperceptibly slow push-in. Close-up for revelation beats. Extreme-close-up reserved for hands, objects, and the moments just before someone makes a decision they cannot unmake. Handheld only for chaos or pursuit. Never Dutch angle except Episode 30.",
    seriesAudio: "Silence is a sound. Fabric sound design: the specific acoustics of this building — the creak of oak boards, the breath of old plaster. No score until Episode 12 (Magnus arrives). From Episode 12: sparse piano, single instrument.",
    episodeStructure: "Every episode: 2-3 establishing segments, rising tension through middle, one silence beat before the final revelation, closing frame that creates forward pull. Total episode duration: 90-180 seconds. Each segment: 5-8 seconds.",
  },
  sceneBackgrounds: {
    design_floor: "Maison Lumière design floor, 8th arrondissement Paris. 4th floor, north-facing skylights. Ivory plaster walls, raw oak floorboards. Dress mannequins at room perimeter. Cutting tables center. The anniversary collar mannequin has its own corner. Champagne-ivory color grade. Film grain.",
    grand_staircase: "Maison Lumière grand staircase. Haussmann architecture — wrought iron balusters, worn stone steps, light falling from skylight three floors above. The axis of the house. Everything significant happens at its base or summit.",
    vivienne_office: "Vivienne's office, top floor. The building's nerve center. Ivory walls, single large window facing the courtyard. A desk unchanged for thirty years — ivory-handled letter opener exactly centered. No computer visible. Bookshelves with folders organized by decade.",
    archive: "Maison Lumière archive, sub-basement. Grey concrete walls. Steel shelving floor to ceiling. Fluorescent tube overhead — cold, clinical, honest. Dust and time. The 1974 gap is in the third row from the left, east wall. Access through a coded door off the archive corridor.",
    fitting_room: "The main fitting room, 2nd floor. Ivory walls, full-length mirrors at angles. Platform center. North light from one high window. Champagne quality to the light. Mannequins along east wall. The anniversary gown always present from Episode 1.",
    pattern_room: "Pattern cutting room, 3rd floor. Marco's domain — forty years of precision compressed into this space. Pattern pieces on the large table. Reference boards on all walls. A specific lamp, angled, that he has used for thirty-eight collections. Coffee cup always present.",
    staff_kitchen: "Staff kitchen, basement level. The one democratic space in the building. Fluorescent overhead, practical surfaces. The coffee machine that is always bad. Where the old men talk about things that are not coffee.",
    archive_corridor: "Archive corridor, sub-basement. The route to the archive. Grey concrete, single wall-bracket lighting. The panel where Bruno found the tin box: fourth bracket from the north end, left wall.",
    celeste_apartment: "Celeste's Paris apartment. Small, orderly, recently arrived. A desk, a chair, a window with a view of a courtyard. The envelope on the table. The feeling of someone who has not yet decided whether they are staying.",
    milan_boardroom: "Casa Ferro boardroom, Milan. Leather surfaces, dark walnut. The oldest house represented in the oldest materials. A long table — Luciana always at the far end, always outvoted. The Ferro crest visible on the east wall.",
    ferro_workshop: "Casa Ferro leather workshop, ground floor Milan. The oldest craft visible in the architecture. The smell of leather and forty years. The Ferro family history in the tools and walls. Warm amber light from practicals.",
    seoul_studio: "House Jeong studio, Seoul. Younger, faster, more technically precise than the European houses. Clean lines, modern materials. The ambition visible in every surface. White walls, precision lighting, the newest equipment.",
    empire_studio: "Empire Atelier studio, New York. The Bronx Collective origin visible in every design choice — not an imitation of Paris but its own complete language. Industrial space made precise. The photographs on the wall tell a history the fashion press doesn't know.",
    paris_street_exterior: "Exterior of Maison Lumière, 8th arrondissement Paris. Haussmann facade. The entrance steps. The Protestor always present, alone, in weather. The building as character — it has been watching since 1951.",
    paris_cafe_side_street: "A deliberately unfashionable Paris side-street café. Not where fashion people go. Formica, morning light, the coffee actually good. Where real conversations happen because no one is performing.",
  },
  endings: [
    { id:"end_one",   label:"Ending ONE — Consolidation", probability:28.7, description:"The criminal acquisition completes. Strelkov Capital / the Luxembourg fund takes effective control through Céleste's proxy. The house survives as a brand. Darius King's thirty-year project is absorbed by a larger player. The Protestor's sign reads FASHION FEEDS ON FORGETTING." },
    { id:"end_two",   label:"Ending TWO — The Burn",      probability:23.2, description:"Two houses fall. The founding-document exposure triggers a legal challenge that collapses Lumière and Ferro simultaneously. What emerges from the wreckage is something neither Vivienne nor Luciana planned — but that both, in private moments, thought was inevitable." },
    { id:"end_three", label:"Ending THREE — The Heir",    probability:25.9, description:"The unnamed third party in the 1974 founding documents has a living heir. The collar Raphael made — without knowing what he was making — is the authentication. Everything the house is built on was always someone else's to claim. The most beautiful ending. The most painful." },
    { id:"end_four",  label:"Ending FOUR — The Collective", probability:17.3, description:"Celeste, Darius King, and the Seoul faction form an alliance that restructures all four houses into something that has never existed before. The Bronx Collective's vision expands. The atelier workers have a stake. The most hopeful ending — and statistically the least likely." },
    { id:"end_five",  label:"Ending FIVE — The Ghost",    probability:24.9, description:"Vivienne Alastair is not who she says she is. The Protestor's message is addressed to someone by name. The resolution involves a truth the house has been built around for seventy years. The most Gothic ending. Rafaela stays. Raphael burns his patterns. The collar is donated to the Louvre." },
  ],
  decisionPoints: [
    { id:"dp_ep03", ep:3, label:"Celeste: the 1974 archive gap — act now or wait?", options:["She copies the gap documentation and sends it anonymously", "She confronts Marco directly", "She waits and watches — not yet"], locked:false },
    { id:"dp_ep05", ep:5, label:"Marco and Claude Petit — does Marco say the name?", options:["He almost says the name. He stops.", "He says enough that Claude Petit confirms it with one word.", "They talk about coffee. Nothing is said."], locked:false },
    { id:"dp_ep07", ep:7, label:"Théodore's file — does he open it again?", options:["He closes it. 'Not today.' (Canon)", "He sends it. Anonymously. It begins a 10-episode chain.", "He shows it to Raphael by accident"], locked:false },
    { id:"dp_ep09", ep:9, label:"Min-jun: the shadow investor meeting — does Ji-young find out?", options:["Ji-young finds a document. She doesn't ask.", "Min-jun tells a partial truth before she can ask.", "She finds out from someone else entirely."], locked:false },
    { id:"dp_ep12", ep:12, label:"Magnus's return — what does he say to Celeste?", options:["'You look exactly like her.' (Iron Skeleton — fixed)", "He says nothing and looks at the collar.", "He asks for Vivienne before acknowledging Celeste."], locked:true },
    { id:"dp_ep16", ep:16, label:"Théodore's choice — he files the report", options:["Anonymously, regulatory body. (Canon — brave, catastrophic)", "He gives it directly to Raphael.", "He shows it to Simone and lets her decide."], locked:false },
    { id:"dp_ep21", ep:21, label:"The anniversary show — who is the unknown face in the audience?", options:["The audience sees the face for 2 seconds. It means nothing yet.", "The face belongs to someone from Episode 4's photograph.", "The face is someone none of the main cast has ever met."], locked:false },
    { id:"dp_ep30", ep:30, label:"The envelope on the desk — Vivienne opens it or not?", options:["She opens it. (Iron Skeleton — fixed)", "She holds it for forty seconds and then sets it down.", "Celeste opens it. Vivienne is in the room."], locked:true },
  ],
};

const THOHF_EPISODES = [
  // ── MOVEMENT I: THE HOUSE BREATHES (Eps 1–6) ──────────────────────
  {
    id:"thohf_ep01", project:"thohf", num:1, title:"The First Cut",
    status:"done", access:"free", published_at:"2026-01-20T10:00:00Z",
    notes:"The catalyst delivered. Celeste arrives as intern, receives a package addressed to Vivienne — and puts it in her bag. Three clues planted. The Protestor. The collar. Claude Petit's first line.",
    segments:[
      { id:"s01_01", type:"A", status:"done", dur:8, seed:4721,
        chars:[], bridge:false,
        scene:"design_floor",
        bg:"Maison Lumière design floor, 8th arrondissement Paris. North-facing skylights at dawn, ivory walls catching first pale light. Raw oak floorboards. Dress mannequins at perimeter. Champagne-ivory color grade. Film grain.",
        camera:"wide-shot", shotType:"slow push-in", lighting:"natural north-light",
        mood:"reverent, suspended, seventy years breathing",
        prompt:"BLACK SCREEN. Silence. One beat. Then: SCISSORS — the sound of clean, irreversible cutting. SLOW FADE IN on the design floor at dawn. Ivory and gold. Seventy years of craft still breathing.",
        clue:"", notes:"Sound-first opening. The scissors are the motif of the entire series." },

      { id:"s01_02", type:"C", status:"done", dur:8, seed:4721,
        chars:["char_raphael"], bridge:false,
        scene:"design_floor",
        bg:"Maison Lumière design floor, 8th arrondissement Paris. North-facing skylights at dawn, ivory walls catching first pale light. Raw oak floorboards. Dress mannequins at perimeter. Champagne-ivory color grade. Film grain.",
        camera:"medium-shot", shotType:"static", lighting:"natural north-light",
        mood:"quiet suspicion, something knows something",
        prompt:"RAPHAEL DUBOIS before the central mannequin. The anniversary collar. He looks at it the way you look at something that knows something you don't. YUKI (entering): DIALOGUE: 'The fitting is in four hours, Raphael.' RAPHAEL (without turning): DIALOGUE: 'Then we have four hours.' MARCO passes through, stops one second: DIALOGUE: 'The collar is perfect.' Raphael turns. Looks at Marco's retreating back. Touches the collar with two fingers — verifying.",
        clue:"collar_01", notes:"Establish the collar as mystery object. Marco's exit is the tell." },

      { id:"s01_03", type:"C", status:"done", dur:8, seed:3318,
        chars:["char_vivienne","char_celeste_a","char_claude_petit"], bridge:false,
        scene:"grand_staircase",
        bg:"Maison Lumière grand staircase. Haussmann wrought-iron balusters, worn stone steps. Light falling from skylight three floors above. The axis of the house.",
        camera:"low-angle", shotType:"static", lighting:"natural north-light",
        mood:"authority descending, something recognized",
        prompt:"VIVIENNE descends the staircase on a phone call. Through the window behind her: THE PROTESTOR. Sign: FASHION FEEDS ON FORGETTING. Vivienne looks at them for exactly one second — not a stranger's look. CELESTE at the base, intern lanyard. VIVIENNE (ending the call, to Celeste): DIALOGUE: 'You have your father's eyes. I've always found that either reassuring or troubling, depending on the day.' She passes. Celeste watches her go. CELESTE (barely): DIALOGUE: '...Which day is today?' CLAUDE PETIT crosses the hall behind her: DIALOGUE: 'Every house has a first thread. The question is who pulled it.' No one responds.",
        clue:"protestor_01", notes:"Vivienne's recognition of the Protestor — not dismissal. Claude Petit's first line." },

      { id:"s01_04", type:"C", status:"done", dur:8, seed:5502,
        chars:["char_simone","char_raphael"], bridge:false,
        scene:"fitting_room",
        bg:"Maison Lumière fitting room, 2nd floor. Ivory walls, angled full-length mirrors. Platform center. North light from one high window. The anniversary gown on the mannequin. Champagne quality to the light.",
        camera:"over-the-shoulder", shotType:"static", lighting:"soft diffused",
        mood:"controlled confrontation, not yet antagonism",
        prompt:"ELODIE MARCHAND on the fitting platform. SIMONE enters: DIALOGUE: 'Vivienne would like the collar revised before this afternoon.' RAPHAEL (very still): DIALOGUE: 'The collar is not being revised.' ELODIE (from platform): DIALOGUE: 'The collar is extraordinary.' Simone holds Elodie's gaze for a long assessment. Leaves without another word. YUKI (only to Raphael, after the door closes): DIALOGUE: 'She took a photograph of it on her way out.' RAPHAEL: DIALOGUE: 'I know.'",
        clue:"", notes:"Simone's authority and Raphael's resistance. First encounter of the series." },

      { id:"s01_05", type:"E", status:"done", dur:8, seed:3318,
        chars:["char_celeste_a"], bridge:false,
        scene:"grand_staircase",
        bg:"Maison Lumière entrance hall and staircase. Haussmann architecture. Wrought-iron balusters, worn stone floor. Midday light through the main door.",
        camera:"close-up", shotType:"rack focus", lighting:"natural north-light",
        mood:"ordinary, world-changing, a small decision",
        prompt:"PACO at reception with a package. ADELE away. CELESTE crosses the hall. PACO: DIALOGUE: 'Alastair-Voss? Signature required.' Celeste reads the name — VIVIENNE ALASTAIR-VOSS. A micro-decision behind her eyes. CELESTE: DIALOGUE: 'I can take that. I'm her granddaughter.' She signs. Holds the envelope. Looks at the staircase. And makes the small, ordinary, world-changing decision: she puts it in her bag. She means to give it to Vivienne after the fitting.",
        clue:"envelope_01", notes:"The package. This is the event the whole series turns on." },

      { id:"s01_06", type:"H", status:"done", dur:8, seed:4721,
        chars:["char_celeste_a"], bridge:false,
        scene:"design_floor",
        bg:"Maison Lumière design floor, then fitting room, then Paris exterior. Three locations in sequence. Film grain throughout. Champagne-ivory grade.",
        camera:"wide-shot", shotType:"slow pull-out", lighting:"natural north-light",
        mood:"three images in sequence, let them breathe",
        prompt:"FINAL SEQUENCE: Celeste walking away down the corridor. The package in her bag. Not a single person watching her go. CUT TO: the collar on the mannequin, alone in the empty fitting room. CUT TO: EXTERIOR — the Protestor's sign in the rain. FASHION FEEDS ON FORGETTING. CUT TO BLACK. Title card: Episode 1 — THE FIRST CUT.",
        clue:"protestor_01", notes:"Three images held. The series in miniature." },
    ]
  },
  {
    id:"thohf_ep02", project:"thohf", num:2, title:"What the Walls Know",
    status:"done", access:"free", published_at:"2026-01-27T10:00:00Z",
    notes:"Four loaded silences. Nothing said. Everything established. Three pins moved on Raphael's board. Celeste holds the envelope — twice — and doesn't give it. Bruno finds the archive disturbance. Margo notices.",
    segments:[
      { id:"s02_01", type:"A", status:"done", dur:8, seed:4721,
        chars:["char_raphael"], bridge:false,
        scene:"design_floor",
        bg:"Maison Lumière design floor, before anyone arrives. Dawn light. Ivory and shadow. The reference board on the north wall. Film grain.",
        camera:"medium-shot", shotType:"slow push-in", lighting:"natural north-light",
        mood:"before the day, something disturbed",
        prompt:"Before anyone arrives. RAPHAEL alone at his reference board. Three pins: moved. Subtle — the kind of change only visible if you knew exactly where everything was. He reaches out. Replaces the third pin. Steps back. RAPHAEL (to empty room, barely): DIALOGUE: 'Mm.' He opens a new sketch. Begins working. The episode will continue around him.",
        clue:"", notes:"The opening beat — silence and suspicion established before dialogue." },

      { id:"s02_02", type:"D", status:"done", dur:8, seed:6614,
        chars:["char_celeste_a"], bridge:false,
        scene:"celeste_apartment",
        bg:"Celeste's Paris apartment. Small, orderly, recently arrived. A desk, a window with a courtyard view. Dawn light entering sideways. The envelope on the kitchen table.",
        camera:"close-up", shotType:"rack focus", lighting:"warm golden-hour",
        mood:"suspended, a decision not yet made, 4 AM quality",
        prompt:"Celeste's apartment. She empties her bag. The envelope surfaces. She holds it. Reads the name. Turns it over. Her thumb traces the edge of the flap — the specific gesture of someone about to open something and choosing not to. She does not open it. She puts it back in her bag. CELESTE (to herself): DIALOGUE: 'I'm going to give it to her this morning.'",
        clue:"envelope_01", notes:"The thumb on the flap. The whole character established in one gesture." },

      { id:"s02_03", type:"B", status:"done", dur:8, seed:3318,
        chars:["char_beatrice"], bridge:false,
        scene:"vivienne_office",
        bg:"PR Director's workspace — connected to the main floor. Multiple screens, phone always to hand. The organised chaos of someone managing a house's public face.",
        camera:"medium-wide", shotType:"handheld", lighting:"fluorescent cold",
        mood:"velocity, competence, operational comedy",
        prompt:"BEATRICE FONTAINE — PR Director — on three things simultaneously. Phone: DIALOGUE: 'The credentialing for Blanc was submitted six weeks ago. If your records don't show that, your records are wrong.' To THIBAULT simultaneously: DIALOGUE: 'The journalist from Monde — Constance Bell — she submitted under a different outlet than last season.' THIBAULT: 'Should I pull her credential?' BEATRICE: DIALOGUE: 'Keep her close. She's working on something she didn't want us to know about.'",
        clue:"", notes:"Beatrice as operational force — PR velocity as character comedy." },

      { id:"s02_04", type:"C", status:"done", dur:8, seed:7201,
        chars:["char_celeste_a","char_vivienne"], bridge:false,
        scene:"vivienne_office",
        bg:"Vivienne's office, top floor. Ivory walls, single courtyard window. Desk unchanged thirty years. The ivory-handled letter opener centered on the desk. Late morning light.",
        camera:"over-the-shoulder", shotType:"static", lighting:"soft diffused",
        mood:"a moment that never arrives, watched from outside",
        prompt:"Routine intern check-in. Celeste across from Vivienne. In Celeste's bag: the envelope. TWICE, Celeste's hand moves toward the bag. TWICE she stops. VIVIENNE: DIALOGUE: 'How are you finding the design floor?' CELESTE: DIALOGUE: 'Layered.' Vivienne considers this. Celeste stands. One step toward door — CELESTE: DIALOGUE: 'There was a—' Vivienne is already reading something else. CELESTE: DIALOGUE: 'Nothing. Thank you.' Outside: MARGO PETIT notices the hand on the bag. Notes the interrupted sentence.",
        clue:"", notes:"The moment that never arrives. Margo as new observer." },

      { id:"s02_05", type:"F", status:"done", dur:8, seed:8803,
        chars:["char_bruno"], bridge:false,
        scene:"archive_corridor",
        bg:"Archive corridor, sub-basement. Grey concrete, single wall-bracket lighting. Quiet. The sound of the building breathing.",
        camera:"close-up", shotType:"static", lighting:"fluorescent cold",
        mood:"routine discovery, not yet understood",
        prompt:"BRUNO, maintenance. Routine work. Floor dust near the archive door: disturbed. A partial footprint. Recent. BRUNO crouches, examines it. BRUNO (to himself, quiet): DIALOGUE: 'Hm.' He stands. Files it away. He doesn't know what it means yet. He returns to his work.",
        clue:"archive_01", notes:"Bruno's discovery. Plant for Episode 6. The footprint is Celeste's." },
    ]
  },
  {
    id:"thohf_ep03", project:"thohf", num:3, title:"The Simone File",
    status:"done", access:"free", published_at:"2026-02-03T10:00:00Z",
    notes:"The episode exists to make Simone sympathetic before we know what she's done. A Voice heard but not seen. The 1974 reference in her private file. She asks the collar: 'How did you know?'",
    segments:[
      { id:"s03_01", type:"F", status:"done", dur:8, seed:5502,
        chars:["char_simone"], bridge:false,
        scene:"vivienne_office",
        bg:"Simone's office — adjacent to the creative floor. Precise, organised, nothing personal visible. A physical file on her desk, unlabeled. Morning light.",
        camera:"close-up", shotType:"rack focus", lighting:"soft diffused",
        mood:"cold recognition, something found",
        prompt:"SIMONE's office. An unlabeled physical file: RAPHAEL DUBOIS. She turns a page — a document that doesn't belong: MAISON LUMIÈRE — COLLECTION REFERENCE — SPRING 1974. SIMONE (to herself, very quietly): DIALOGUE: 'There you are.' The 1974 reference visible for three seconds.",
        clue:"1974_01", notes:"Clue 3A — planted for Episode 20." },

      { id:"s03_02", type:"D", status:"done", dur:8, seed:4721,
        chars:["char_simone","char_raphael"], bridge:false,
        scene:"design_floor",
        bg:"Maison Lumière design floor from Simone's point of view. The room she watches from the perimeter. Champagne-ivory grade.",
        camera:"over-the-shoulder", shotType:"slow push-in", lighting:"natural north-light",
        mood:"reassessment, not hostility, something formerly admired",
        prompt:"The design floor from Simone's point of view. She responds to everyone with full competence. Her eyes are watching Raphael — the reassessment of someone who once admired something and has since had reason to reconsider. Raphael looks up at the reference board as if he feels her looking. Their eyes don't meet. But something crosses between them.",
        clue:"", notes:"The non-exchange. The series' central tension in one held shot." },

      { id:"s03_03", type:"C", status:"done", dur:8, seed:9105,
        chars:["char_simone"], bridge:false,
        scene:"paris_cafe",
        bg:"Deliberately unfashionable Paris side-street café. Formica surfaces, morning light. Where real conversations happen. A hand, an arm, a shoulder across the table — the Voice. Never the face.",
        camera:"close-up", shotType:"static", lighting:"warm golden-hour",
        mood:"trust without visibility, professional grief",
        prompt:"A side-street café. SIMONE across from someone we cannot see — hand, arm, shoulder only. THE VOICE (older, educated, tired, genuinely kind): DIALOGUE: 'Not that I know of. Though that's precisely what you'd only discover if you were looking.' SIMONE: DIALOGUE: 'The collar. The construction. The reference. Has someone been feeding him material?' VOICE: DIALOGUE: 'I'm hoping to find that I'm wrong.' SIMONE: DIALOGUE: 'That would be the best possible outcome.' Beat. SIMONE: DIALOGUE: 'Send me the 1974 archive cross-reference.'",
        clue:"voice_01", notes:"The Voice — heard, not seen. Audience will cross-reference from Episode 22." },

      { id:"s03_04", type:"D", status:"done", dur:8, seed:4721,
        chars:["char_simone"], bridge:false,
        scene:"fitting_room",
        bg:"The fitting room, empty, amber maintenance light only. The anniversary gown on the mannequin. The collar. Simone alone with both.",
        camera:"close-up", shotType:"slow push-in", lighting:"candlelight",
        mood:"grief and suspicion simultaneously, the most important minute in Episode 3",
        prompt:"The building empty. SIMONE alone with the anniversary gown. Amber maintenance light. She stands very close to the collar. Studies it with the eyes of someone who was, before she became what she is, a designer. SIMONE (barely a whisper): DIALOGUE: 'How did you know?' She is not asking Raphael. She almost touches the collar. Stops. Steps back. Turns off the light.",
        clue:"collar_01", notes:"Simone's grief. The most important scene in Episode 3." },
    ]
  },
  {
    id:"thohf_ep04", project:"thohf", num:4, title:"The Envelope",
    status:"done", access:"paid", published_at:"2026-02-10T10:00:00Z",
    notes:"The photograph opens. 4:47 AM. 1974: Vivienne, Henri, the unnamed third man. 'He knew. He always knew. — M.' The archive gap. Four months simply absent. Vivienne's phone call: 'She's in the archive.'",
    segments:[
      { id:"s04_01", type:"D", status:"done", dur:8, seed:6614,
        chars:["char_celeste_a"], bridge:false,
        scene:"celeste_apartment",
        bg:"Celeste's apartment at 4:47 AM. The one lamp on. The envelope on the table. The feeling of someone who has not slept.",
        camera:"close-up", shotType:"rack focus", lighting:"candlelight",
        mood:"the moment before everything changes, 4 AM clarity",
        prompt:"4:47 AM. Celeste has not slept. The envelope on the table. She crosses to it. Opens it. Slides out the photograph. We see her face for FIVE SECONDS before we see the image. Then: 1974. Vivienne (22), Henri beside her, an unnamed third man (30). Henri is not looking at the camera — he is looking at the third man. Celeste turns it over: DIALOGUE: 'He knew. He always knew. — M.' CELESTE (very quietly): DIALOGUE: 'Who are you?'",
        clue:"photo_1974", notes:"The photograph. Hold Celeste's face for five seconds. Nolan principle." },

      { id:"s04_02", type:"E", status:"done", dur:8, seed:8803,
        chars:["char_celeste_a"], bridge:false,
        scene:"archive",
        bg:"Maison Lumière archive, sub-basement. Grey concrete, steel shelving floor to ceiling. Fluorescent tube — cold, clinical. Dust and time. The specific silence of kept records.",
        camera:"wide-shot", shotType:"slow push-in", lighting:"fluorescent cold",
        mood:"investigation, the gap as physical fact",
        prompt:"ISABELLE lets Celeste in. 1972 — here. 1973 — here. 1975 — here. 1974: January, February, March. Then: nothing. April through July — a gap. August onward: present. She checks again. The surrounding boxes full, meticulous. Four months simply absent. AND: the dust around the ghost of the absent boxes has been disturbed. Someone has been here since the boxes were removed. Recently. CELESTE (to the shelf): DIALOGUE: 'When did you go missing? And who took you?'",
        clue:"archive_gap", notes:"Clue 4B — the gap AND the recent disturbance. Two things, one scene." },

      { id:"s04_03", type:"C", status:"done", dur:8, seed:7201,
        chars:["char_vivienne","char_celeste_a"], bridge:false,
        scene:"vivienne_office",
        bg:"Vivienne's office, top floor. Ivory walls, courtyard window. The desk. The letter opener. The composed surface of someone who has been waiting for this question.",
        camera:"medium-shot", shotType:"static", lighting:"soft diffused",
        mood:"composed deflection, the phone call that ends it",
        prompt:"Routine check-in. CELESTE: DIALOGUE: 'Is there anything I should know about the 1974 archive? I noticed some gaps—' VIVIENNE (immediate, composed): DIALOGUE: 'Archival reorganisation. Some years were recatalogued in the early nineties. It's documented somewhere.' She holds Celeste's gaze for exactly the right amount of time. Not too long. Not too short. Celeste goes. Vivienne waits for the door to close. Reaches for her phone. VIVIENNE (when it answers): DIALOGUE: 'She's in the archive.'",
        clue:"phone_call_01", notes:"The phone call. To whom? The audience will wonder for eight episodes." },
    ]
  },
  {
    id:"thohf_ep05", project:"thohf", num:5, title:"Marco's Hands",
    status:"done", access:"paid", published_at:"2026-02-17T10:00:00Z",
    notes:"The episode slows down. Forty years of craft. Marco and Claude Petit talk about coffee while saying nothing. The collection that was never shown. The woman in Marco's photograph.",
    segments:[
      { id:"s05_01", type:"A", status:"done", dur:8, seed:3318,
        chars:["char_marco_v","char_isabelle"], bridge:false,
        scene:"pattern_room",
        bg:"Pattern cutting room, 3rd floor. Pattern pieces on the large table. Reference boards all walls. Marco's angled lamp at 7 AM. The anniversary collection pieces laid out. Forty years in every surface.",
        camera:"medium-shot", shotType:"slow push-in", lighting:"natural north-light",
        mood:"craft at dawn, the collection that was never shown",
        prompt:"Pattern cutting room at dawn. MARCO alone. The anniversary collection pattern pieces. He works in the specific illumination of a man who knows exactly how much light he needs. ISABELLE arrives at 7 AM — watches from the doorway before speaking. ISABELLE: DIALOGUE: 'How many collections have you cut for this house?' MARCO: DIALOGUE: 'Thirty-eight. Plus seventeen commissions, four retrospective recreations, and one—' A brief pause. DIALOGUE: '...one that was never shown.' ISABELLE: DIALOGUE: 'Which one?' MARCO (returning to pattern): DIALOGUE: 'It was a long time ago.'",
        clue:"collection_01", notes:"Clue 5A — the collection never shown. The pause is the scene." },

      { id:"s05_02", type:"C", status:"done", dur:8, seed:2207,
        chars:["char_marco_v","char_claude_petit"], bridge:false,
        scene:"staff_kitchen",
        bg:"Staff kitchen, basement. Fluorescent overhead. The coffee machine. Formica. The one democratic space. Two old men and the one thing they don't say.",
        camera:"medium-shot", shotType:"static", lighting:"fluorescent cold",
        mood:"Goldman: they talked around the moon for three minutes",
        prompt:"MARCO and CLAUDE PETIT (79) with coffee. Two old men. They talk about coffee. They are not talking about coffee. CLAUDE PETIT (considering his cup): DIALOGUE: 'It's worse this year.' MARCO: DIALOGUE: 'The coffee has always been bad.' CLAUDE PETIT: DIALOGUE: 'I meant something else.' A pause. MARCO: DIALOGUE: 'The collection is beautiful.' CLAUDE PETIT: DIALOGUE: 'Yes. He has done extraordinary work.' MARCO (carefully): DIALOGUE: 'The collar.' CLAUDE PETIT (knew it was coming): DIALOGUE: 'Mm.' MARCO: DIALOGUE: 'He can't know what he made.' CLAUDE PETIT: DIALOGUE: 'He made what the house asked him to make. The house has been asking for a long time.'",
        clue:"collar_01", notes:"The most important conversation in Movement I. Neither says the thing." },

      { id:"s05_03", type:"D", status:"done", dur:8, seed:5502,
        chars:["char_marco_v"], bridge:false,
        scene:"celeste_apartment",
        bg:"Marco's home, evening. Not Celeste's apartment — a lived-in Paris flat, sixty years of a life. A glass of wine on the table. A drawer.",
        camera:"extreme-close-up", shotType:"static", lighting:"candlelight",
        mood:"thirty-eight collections, one photograph, private grief",
        prompt:"Marco's home, evening. A glass of red wine. He opens a drawer. Among practical items: a photograph, folded. He unfolds it. Two seconds: a woman, young, 1970s — laughing at something just out of frame. He folds it. Returns it to the drawer. MARCO (to the apartment, to his hands): DIALOGUE: 'Thirty-eight collections.' He drinks.",
        clue:"photo_woman", notes:"Clue 5B — the woman. Two seconds. Unidentifiable yet. The fold is deliberate." },
    ]
  },
  {
    id:"thohf_ep06", project:"thohf", num:6, title:"Bruno's Find",
    status:"done", access:"paid", published_at:"2026-02-24T10:00:00Z",
    notes:"Bruno finds the tin box. A key and a property number: 75-1952-R-0044-B. Marco's controlled reaction — not surprise, confirmation. He tells Bruno nothing. Bruno tells Isabelle. Raphael makes the final cut.",
    segments:[
      { id:"s06_01", type:"F", status:"done", dur:8, seed:8803,
        chars:["char_bruno"], bridge:false,
        scene:"archive_corridor",
        bg:"Archive corridor, sub-basement. Grey concrete, wall-bracket lighting. The panel: fourth bracket from north end, left wall. The specific silence of a sixty-year secret.",
        camera:"close-up", shotType:"static", lighting:"fluorescent cold",
        mood:"routine discovery that is not routine, the walls finally speaking",
        prompt:"BRUNO, routine wall-bracket repair. His drill catches something. A shallow cavity behind a decorative panel. Inside: a TIN BOX. Small. Old. 1950s at newest. He opens it — a KEY (old, wrought iron) and a FOLDED PIECE OF PAPER. He unfolds it: 75-1952-R-0044-B. A French cadastral register number. Original ownership registration, 1952. Bruno re-folds the paper. Replaces everything exactly. BRUNO (to the wall): DIALOGUE: 'Right. So.'",
        clue:"tin_box_01", notes:"Clue 6A — the property number. 75-1952-R-0044-B must be legible for two seconds." },

      { id:"s06_02", type:"C", status:"done", dur:8, seed:3318,
        chars:["char_marco_v","char_bruno"], bridge:false,
        scene:"pattern_room",
        bg:"Pattern cutting room. Marco at work. The door. The specific stillness of someone who has been waiting thirty years for a particular kind of news.",
        camera:"medium-shot", shotType:"static", lighting:"natural north-light",
        mood:"thirty years confirmed, the horror is the stillness",
        prompt:"MARCO at work. BRUNO in the doorway with that expression: found something, need someone more qualified. MARCO: DIALOGUE: 'Close the door.' Bruno describes it. Marco listens. His face goes completely still. Not surprise — CONFIRMATION. MARCO (quiet, absolute): DIALOGUE: 'Put it back. Exactly as you found it.' BRUNO: DIALOGUE: 'Should I tell—' MARCO: DIALOGUE: 'No.' Beat. DIALOGUE: 'Bruno. Put it back. Say nothing. Not to anyone.' BRUNO: DIALOGUE: 'All right.' He goes. Marco stands alone. His hands very still at his sides.",
        clue:"tin_box_01", notes:"The stillness is the horror. Marco has known this moment was coming." },

      { id:"s06_03", type:"C", status:"done", dur:8, seed:8803,
        chars:["char_isabelle","char_bruno"], bridge:false,
        scene:"archive",
        bg:"The archive. Isabelle at her desk. The shelves behind her — one of them has a four-month gap she now knows about from Celeste's visit.",
        camera:"over-the-shoulder", shotType:"static", lighting:"fluorescent cold",
        mood:"quiet accumulation, the archive filling up with things it shouldn't hold",
        prompt:"ISABELLE at work. BRUNO appears. BRUNO (low): DIALOGUE: 'I found something in the wall. A box. Old. Key inside. A number.' ISABELLE: DIALOGUE: 'You told Marco?' BRUNO: DIALOGUE: 'He told me to say nothing.' ISABELLE: DIALOGUE: 'But you're telling me.' BRUNO (logic airtight): DIALOGUE: 'You're the archive.' Isabelle looks at the shelf where, days ago, a young intern found a four-month gap. She files it in the part of her mind that has been quietly filling up.",
        clue:"archive_01", notes:"Isabelle now holds two things. Her face holds both without comment." },

      { id:"s06_04", type:"H", status:"done", dur:8, seed:4721,
        chars:["char_raphael"], bridge:false,
        scene:"pattern_room",
        bg:"Cutting room, end of day. The last light. One lamp. The final pattern piece for the anniversary collection. The collar construction in Raphael's hands.",
        camera:"close-up", shotType:"slow push-in", lighting:"candlelight",
        mood:"commitment, irreversible, something waiting fifty years about to be seen",
        prompt:"End of day. RAPHAEL alone. The final pattern piece for the anniversary collection — the collar construction. He holds it. This is the last moment before commitment. He thinks of everything. He cuts. Clean. Precise. Irreversible. RAPHAEL (to whatever is listening): DIALOGUE: 'There.' The collar is committed. Something waiting fifty years in the walls of this house will be seen in three weeks. CUT TO BLACK.",
        clue:"collar_01", notes:"Iron commitment. The cut is the closing beat of Movement I." },
    ]
  },
  // ── MOVEMENT II: FOUR WORLDS (Eps 7–12) ────────────────────────────
  {
    id:"thohf_ep07", project:"thohf", num:7, title:"The Accountant's Number",
    status:"done", access:"paid", published_at:"2026-03-02T10:00:00Z",
    notes:"Théodore finds the Luxembourg fund. He closes the file. 'Not today.' Casa Ferro introduced — Luciana outvoted. Twelve seconds of her face. No dialogue. Character completely established.",
    segments:[
      { id:"s07_01", type:"F", status:"done", dur:8, seed:1109,
        chars:["char_theodore"], bridge:false,
        scene:"vivienne_office",
        bg:"Théodore's accounts office — adjacent to the main floor. A desk of absolute precision. Screens. Nineteen years of honest numbers. Fluorescent cold. Tuesday afternoon.",
        camera:"close-up", shotType:"rack focus", lighting:"fluorescent cold",
        mood:"the closed file is the scene, the most consequential inaction",
        prompt:"THÉODORE BLANC, accounts office. Tuesday afternoon. Nineteen years of honest numbers. Today: a number he didn't put there. His finger stops on the trackpad. He looks. Looks away. Drinks his coffee. Looks back. THÉODORE (very quietly): DIALOGUE: 'Luxembourg.' He runs a search. STRELKOV CAPITAL MANAGEMENT. Luxembourg, 2019. Stake: 4.7%. THÉODORE (quieter): DIALOGUE: 'Twenty nineteen.' He traces one layer deeper. Eleven seconds of stillness. He closes the file. THÉODORE (decision made): DIALOGUE: 'Not today.'",
        clue:"strelkov_01", notes:"The closed file is the scene. 'Not today' is the most consequential act of inaction in the series." },

      { id:"s07_02", type:"D", status:"done", dur:8, seed:6614,
        chars:["char_luciana"], bridge:false,
        scene:"milan_boardroom",
        bg:"Casa Ferro boardroom, Milan. Leather surfaces, dark walnut. Long table. Luciana at the far end. The Ferro crest on the east wall. A room that has outvoted her before.",
        camera:"close-up", shotType:"static", lighting:"three-point studio",
        mood:"Rhimes: twelve seconds of her face establishes everything",
        prompt:"Milan. LUCIANA FERRO outvoted 5 to 2 on something we don't hear the end of. TWELVE SECONDS of her face. No dialogue. The character is completely established. She leaves the boardroom. In the corridor alone for four seconds. Her expression does not change. She walks.",
        clue:"", notes:"Twelve seconds. Rhimes principle. Do not cut early." },
    ]
  },
  {
    id:"thohf_ep08", project:"thohf", num:8, title:"The Milan Episode",
    status:"in_progress", access:"paid",
    notes:"Casa Ferro fully introduced. A founding document fragment surfaces in Milan — a co-signatory from 1952 connecting Ferro and Lumière. Lars Eriksson's first appearance.",
    segments:[
      { id:"s08_01", type:"A", status:"pending", dur:8, seed:6614,
        chars:["char_luciana"], bridge:false,
        scene:"ferro_workshop",
        bg:"Casa Ferro leather workshop, ground floor Milan. The oldest house in its oldest materials. Warm amber practicals. Craft and history indistinguishable from the architecture.",
        camera:"wide-shot", shotType:"slow push-in", lighting:"practicals only",
        mood:"craft and age, a house with memory in its walls",
        prompt:"Casa Ferro in full operation. The leather workshop — craft and history indistinguishable. LUCIANA moves through it as its careful steward. She touches a workbench as she passes. The house knows her. She knows the house. Not all of it.",
        clue:"", notes:"Establish Ferro's world before it becomes complicated." },

      { id:"s08_02", type:"F", status:"pending", dur:8, seed:6614,
        chars:["char_luciana"], bridge:false,
        scene:"milan_boardroom",
        bg:"Casa Ferro private archive, Milan. Adjacent to the boardroom. A smaller room — family papers, ledgers, founding documents. Warm amber, single lamp.",
        camera:"close-up", shotType:"rack focus", lighting:"candlelight",
        mood:"cross-house recognition, she does not reach for her phone immediately",
        prompt:"A 1952 document fragment in the Ferro private archive. Luciana reads it. Then reads it again. A co-signatory name that should not be there — a name that connects Casa Ferro's founding to Maison Lumière in a way neither house has publicly acknowledged. LUCIANA (very still): She does not reach for her phone immediately. She stares at the name for eight seconds.",
        clue:"ferro_lumiere_01", notes:"Cross-house connection plant. The eight seconds of not reaching for her phone is the scene." },
    ]
  },
  {
    id:"thohf_ep09", project:"thohf", num:9, title:"Seoul Rising",
    status:"in_progress", access:"paid",
    notes:"House Jeong introduced. Min-jun's most ambitious collection shown to a shadow investor group. He tells Ji-young the investor is someone he is not. The lie is twelve episodes from surfacing.",
    segments:[
      { id:"s09_01", type:"A", status:"pending", dur:8, seed:7712,
        chars:["char_minjun"], bridge:false,
        scene:"seoul_studio",
        bg:"House Jeong studio, Seoul. Clean lines, precision lighting, newest equipment. Younger, faster, more technically precise than the European houses. White walls. The ambition visible in the architecture.",
        camera:"wide-shot", shotType:"slow push-in", lighting:"three-point studio",
        mood:"ambition made physical, younger and faster",
        prompt:"Seoul. House Jeong's studio — younger, faster, more precise than any European house. The ambition visible in the architecture. MIN-JUN at the center of it, reviewing a collection that represents everything he has been building toward. This is where he is most himself.",
        clue:"", notes:"Establish Jeong's world as a complete thing, not a European imitation." },

      { id:"s09_02", type:"C", status:"pending", dur:8, seed:7712,
        chars:["char_minjun"], bridge:false,
        scene:"seoul_studio",
        bg:"A hotel conference room, Seoul. Neutral, anonymous. The kind of room where the table matters more than the walls. Min-jun on one side. Shadow investors across.",
        camera:"over-the-shoulder", shotType:"static", lighting:"three-point studio",
        mood:"perfect composure, the lie held without effort, hands very still",
        prompt:"MIN-JUN in a hotel conference room with investors who are not who he told Ji-young they are. His composure is perfect. His presentation precise. His hands are very still. He is saying exactly what the room needs to hear. Every word is technically true. The lie is in the frame — what he has left out of the introduction. What Ji-young believes the frame contains.",
        clue:"lie_01", notes:"Plant the lie. The hands are the tell — they are too still." },
    ]
  },
  {
    id:"thohf_ep10", project:"thohf", num:10, title:"Empire",
    status:"in_progress", access:"paid",
    notes:"Empire Atelier introduced. Darius King watching the Lumière building from a car. He has been watching it, in various ways, for thirty years.",
    segments:[
      { id:"s10_01", type:"A", status:"pending", dur:8, seed:4488,
        chars:["char_darius"], bridge:false,
        scene:"empire_studio",
        bg:"Empire Atelier studio, New York. Industrial space made precise. The Bronx Collective origin visible in every design choice. Photographs on the wall tell a history the fashion press doesn't know.",
        camera:"wide-shot", shotType:"slow push-in", lighting:"natural north-light",
        mood:"Bronx origin visible, not imitation Paris",
        prompt:"New York. Empire Atelier — not the showroom but the actual studio, where the decisions happen. DARIUS KING moves through it. The Bronx Collective origin visible in every design choice. This is its own complete language. He checks something on a reference wall. Every detail deliberate.",
        clue:"", notes:"Establish Empire's world as distinct — not aspirational toward Paris." },

      { id:"s10_02", type:"D", status:"pending", dur:8, seed:4488,
        chars:["char_darius"], bridge:false,
        scene:"paris_exterior",
        bg:"Exterior Maison Lumière, 8th arrondissement Paris. Haussmann facade. The Protestor's position visible. A car at the curb, dark windows. Evening light.",
        camera:"close-up", shotType:"static", lighting:"cool blue-hour",
        mood:"the thirty-year watch, not blinked yet",
        prompt:"DARIUS KING in a car outside the Lumière building, Paris. Through the window: the building. He watches it. He has not blinked. He does not go in. He has been watching it, in various ways, for thirty years. Something changed six months ago. Tonight he needed to see it again.",
        clue:"darius_01", notes:"The thirty-year watch. Do not explain it. Let it breathe." },
    ]
  },
  {
    id:"thohf_ep11", project:"thohf", num:11, title:"Yuki Asks",
    status:"in_progress", access:"paid",
    notes:"Yuki asks Raphael about the collar reference. He gives a partial answer. She begins her own investigation. The question asked quietly, in a room where no one else is listening.",
    segments:[
      { id:"s11_01", type:"C", status:"pending", dur:8, seed:4721,
        chars:["char_raphael"], bridge:false,
        scene:"design_floor",
        bg:"Maison Lumière design floor, end of day. The last natural light leaving. One lamp on above Raphael's table. Everything else in shadow.",
        camera:"medium-shot", shotType:"static", lighting:"natural north-light",
        mood:"the partial answer, she begins her own investigation",
        prompt:"End of day. YUKI and RAPHAEL alone in the studio. YUKI: DIALOGUE: 'Where did you find the construction for the collar? I've been looking at historical references and I can't place it.' RAPHAEL (careful): DIALOGUE: 'A book of patterns. It was delivered — I assumed from the archive.' YUKI: DIALOGUE: 'The archive doesn't loan pattern books.' A beat. RAPHAEL: DIALOGUE: 'No. I assumed.' Yuki writes nothing down. She is already investigating.",
        clue:"collar_01", notes:"The partial answer. She knows he knows he's given a partial answer." },
    ]
  },
  {
    id:"thohf_ep12", project:"thohf", num:12, title:"The Return",
    status:"in_progress", access:"paid",
    notes:"IRON SKELETON. Magnus Voss returns. Enters Lumière for the first time in thirty years. Sees the anniversary collar. Sees Celeste. Says: 'You look exactly like her.' The event that makes the audience re-read everything.",
    segments:[
      { id:"s12_01", type:"B", status:"pending", dur:8, seed:5316,
        chars:["char_magnus"], bridge:false,
        scene:"grand_staircase",
        bg:"Maison Lumière entrance hall. Haussmann grandeur. The design floor visible through the glass at the top of the stairs. The collar mannequin visible in the distance. Thirty years of absence in the air.",
        camera:"wide-shot", shotType:"static", lighting:"natural north-light",
        mood:"prepared and still not prepared, thirty years ending",
        prompt:"The entrance hall. MAGNUS VOSS (77) enters the Lumière building for the first time in thirty years. He stops. The collar, visible on the mannequin through the design floor window at the top of the stairs. His face: the specific stillness of someone who has prepared for this moment and is still not prepared. He does not move for four seconds.",
        clue:"magnus_01", notes:"Iron Skeleton fixed point. The stillness before he moves is the event." },

      { id:"s12_02", type:"C", status:"pending", dur:8, seed:5316,
        chars:["char_magnus","char_celeste_a"], bridge:true,
        scene:"grand_staircase",
        bg:"Maison Lumière entrance hall. Magnus in the center. Celeste coming down the stairs. The collar visible through the glass above.",
        camera:"over-the-shoulder", shotType:"static", lighting:"natural north-light",
        mood:"the unanswered question that drives six episodes",
        prompt:"CELESTE comes down the stairs. MAGNUS sees her. He stops. He looks at her the way you look at something you were not ready to see. MAGNUS (very slowly): DIALOGUE: 'You look exactly like her.' CELESTE: DIALOGUE: 'I'm sorry — like who?' MAGNUS looks at the collar through the glass. Then back at Celeste. He does not answer the question. MAGNUS: DIALOGUE: 'I need to see Vivienne.'",
        clue:"magnus_01", notes:"Iron Skeleton. 'You look exactly like her.' Do not answer the question." },
    ]
  },
  // ── MOVEMENTS III–V: STUBS (Eps 13–30) ──────────────────────────
  ...Array.from({length:18}, (_,i) => {
    const num = i + 13;
    const episodes = {
      13:["Incident","Shonda Rhimes crisis management — a 1953 sketch goes missing. Insurance investigator Margot Tessier arrives within the hour. Her speed is itself a clue.","in_progress"],
      14:["The Factory","The Camorra visible in a Milan corridor. Casa Ferro's criminal connection becomes undeniable. Lars Eriksson delivers something.","draft"],
      15:["The Daisuke Episode","The charming spy departs. His intelligence report is visible to the audience for 8 seconds. Everything it contains will matter in Episode 22.","draft"],
      16:["Théodore's Choice","He files the report. Anonymously. The bravest act in the series — and the most catastrophic thing that happens to a good man.","draft"],
      17:["The Seoul Pressure","Min-jun's lie at full pressure. Ji-young's confirmation that she knows more than she's said. Vivienne and Magnus in a room together, saying nothing.","draft"],
      18:["What Julien Found","The digital intrusion. Dorian's instruction to Julien: close the report. Julien keeps a copy.","draft"],
      19:["Beatrice's War","PR warfare at full operational speed. The double-meaning order. The photograph threat managed without knowing what the photograph contains.","draft"],
      20:["The Last Fitting","Simone's recognition at the fitting. The photograph taken. The question sent into the world.","draft"],
      21:["Seventy Years","IRON SKELETON. The anniversary show. The collar walks. An unknown face in the audience watches with recognition and is gone before anyone can identify them.","draft"],
      22:["The Morning After","The morning after success. Every sleeping thing begins to move. The Voice from Episode 3 gets a face.","draft"],
      23:["Thibault's Mistake","The unwitting operative. A misdirected email. The chain of small errors that cannot be undone.","draft"],
      24:["The Seoul Crossing","The shadow investor meeting gets a face. Min-jun's two-track conversation. The thirty-year asymmetry begins to close.","draft"],
      25:["Daisuke's Report","His farewell — with weight. The intelligence assessment is fully visible for 12 seconds. Everything it says will be confirmed.","draft"],
      26:["Empire Under Pressure","The acquisition moves from planning to action. Darius King speaks for the first time to someone inside Lumière.","draft"],
      27:["The Ferro Warrant","Luciana's CFO starts keeping a file. The legal fixer who already knew.","draft"],
      28:["Celeste's Archive","The information event: the co-signatory name. Celeste connects two things. Raphael finally understands what the collar is.","draft"],
      29:["The Night Before","The overheard conversation. Three documents laid out. The last quiet before everything changes. Constance Bell has all three.","draft"],
      30:["The Question","IRON SKELETON. The envelope on the desk. Vivienne opens it. The door closes. The announcement goes live. Everything that happens next is different.","draft"],
    };
    const [title, notes, status] = episodes[num];
    return {
      id:`thohf_ep${String(num).padStart(2,"0")}`,
      project:"thohf", num, title, status,
      access: num <= 3 ? "free" : "paid",
      notes,
      segments: [],
    };
  }),
];

const THOHF_ASSETS = [
  {id:"asset_01",project:"thohf",name:"Vivienne Alastair-Voss — Character Sheet",type:"character_ref",tags:["character","vivienne","primary","lumiere"],thumb:"🎭",refStatus:"approved",notes:"Visual ref: Isabelle Huppert in 'Elle'. Always in house ivory or black. The ivory-handled letter opener on her desk has not moved in thirty years. Silver-streaked hair, pulled severe.",added:"2026-02-18"},
  {id:"asset_02",project:"thohf",name:"Raphael Dubois — Character Sheet",type:"character_ref",tags:["character","raphael","primary","lumiere"],thumb:"✂️",refStatus:"approved",notes:"His desk is chaos. His hands are the most photographed hands in French fashion. The anniversary collection collar is on a mannequin behind him in every scene.",added:"2026-02-18"},
  {id:"asset_03",project:"thohf",name:"Celeste Alastair — Character Sheet",type:"character_ref",tags:["character","celeste","primary","lumiere"],thumb:"📦",refStatus:"approved",notes:"Intern lanyard. Her father's eyes. Carries the package. The envelope is always visible in her bag in any scene where she has her bag.",added:"2026-02-18"},
  {id:"asset_04",project:"thohf",name:"The Anniversary Collar — Hero Object",type:"design_ref",tags:["collar","key_object","anniversary","plot"],thumb:"⬜",refStatus:"approved",notes:"White on ivory. The construction technique matches a 1952 pattern sketch. Architectural, minimal, structurally impossible by conventional methods. It should look like something from the future found in the past.",added:"2026-02-18"},
  {id:"asset_05",project:"thohf",name:"Maison Lumière HQ — Location Ref",type:"location_ref",tags:["location","lumiere","interior","primary"],thumb:"🏛️",refStatus:"approved",notes:"Haussmann building, 8th arrondissement. Grand staircase. Design floor on top: north light, ivory walls. Archive in sub-basement. All walls white — the only color is the clothes.",added:"2026-02-18"},
  {id:"asset_06",project:"thohf",name:"The Tin Box — Prop Reference",type:"prop_ref",tags:["prop","archive","key_object","ep6"],thumb:"📦",refStatus:"approved",notes:"Small. Old. 1950s at newest. A wrought-iron key and a folded piece of paper: 75-1952-R-0044-B. Must look like it has been in a wall for sixty years.",added:"2026-02-18"},
  {id:"asset_07",project:"thohf",name:"1974 Photograph — Prop Reference",type:"prop_ref",tags:["prop","1974","key_object","ep4"],thumb:"📷",refStatus:"approved",notes:"Vivienne (22), Henri, unnamed third man (30). Period-correct black and white. Henri is not looking at the camera — he is looking at the third man. Handwritten on reverse: 'He knew. He always knew. — M.'",added:"2026-02-18"},
  {id:"asset_08",project:"thohf",name:"The Protestor — Sign Design System",type:"design_ref",tags:["protestor","hidden_message","recurring"],thumb:"📋",refStatus:"approved",notes:"100 signs across 100 episodes. Each episode: one sign, one word added to the hidden message. Signs hand-lettered on white card, black ink. The protestor is always alone, always outside the Lumière entrance, always in weather.",added:"2026-02-18"},
  {id:"asset_09",project:"thohf",name:"Casa Ferro Atelier — Milan Location",type:"location_ref",tags:["location","ferro","milan","interior"],thumb:"🇮🇹",refStatus:"approved",notes:"The oldest house in the series. Leather workshop on the ground floor — craft and history indistinguishable from the building itself. Boardroom on the third floor where Luciana is always outvoted.",added:"2026-02-18"},
  {id:"asset_10",project:"thohf",name:"Episode Production Schedule — V4",type:"production_doc",tags:["schedule","production","all_eps"],thumb:"📅",refStatus:"approved",notes:"Movement I (Eps 1–6): DONE. Movement II (Eps 7–12): IN PROGRESS. Movement III (Eps 13–18): SCRIPTS COMPLETE. Movements IV–V (Eps 19–30): SCRIPTED. Production budget: $150 at 1080p for all 30 episodes.",added:"2026-02-25"},
  {id:"asset_11",project:"thohf",name:"Seedance 2.0 — Segment Prompt Library",type:"production_doc",tags:["ai","prompts","jimeng","segment_system"],thumb:"🤖",refStatus:"approved",notes:"Systematic prompt architecture. 5 coherence mechanisms: seed locking, frame bridging, character reference images, scene style prefix, segment manifest. Character canonical portraits for: Vivienne, Raphael, Celeste, Magnus, Simone, Marco, Claude Petit.",added:"2026-02-25"},
  {id:"asset_12",project:"thohf",name:"Hidden Message — First 30 Words Decoded",type:"production_doc",tags:["hidden_message","protestor","spoiler"],thumb:"🔐",refStatus:"flagged",notes:"SPOILER. The 30-word sequence: FASHION FEEDS ON FORGETTING THE DEAD DO NOT STAY DEAD THEY RETURN TO COLLECT WHAT IS OWED THE WIDOW CASSEL IS VIVIENNE ALASTAIR AND THE HOUSE BELONGS TO ELOISE ALASTAIR. Eloise Alastair is the unnamed third co-signatory from 1974. She has a living heir.",added:"2026-02-25"},
];



// ═══════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════
function snapshot(state) {
  // Lightweight snapshot for undo - only mutable data
  return {
    projects: state.projects, bible: state.bible,
    episodes: state.episodes, assets: state.assets,
    activeProject: state.activeProject, activeEpisode: state.activeEpisode,
  };
}

function pushUndo(state) {
  const stack = [...(state.undoStack||[]), snapshot(state)].slice(-30);
  return { ...state, undoStack: stack, redoStack: [] };
}

const VN_STYLES = {
  cinematic: {
    label: "Cinematic Drama",
    description: "Dark, filmic, prestige TV look — like Succession or Severance. Sharp shadows, muted palette.",
    promptPrefix: "Cinematic prestige TV visual novel. Dark filmic photography style. Desaturated, high-contrast. Moody directorial composition. No text, no UI.",
    fontBody: "'Georgia', serif",
    fontMono: "'JetBrains Mono', monospace",
    bg: ["#080808","#141414"],
    glowIntensity: "12", glowIntensity2: "08",
    badgeBg: "rgba(0,0,0,.7)",
    badgeRadius: 4,
    borderAlpha: "44",
    scanlines: false, grain: true,
    narrationStyle: "normal",
    monoLetterSpacing: "1px", monoFontStyle: "normal",
    loadingText: "Generating…",
    dialogueBorderWidth: 1,
    speakerTagShape: "square",
  },
  acgn: {
    label: "ACGN Anime",
    description: "Japanese anime/manga/game/novel style — like Steins;Gate, Clannad, Genshin CG. Vibrant, cel-shaded.",
    promptPrefix: "Japanese ACGN visual novel CG art. Anime bishoujo/bishounen illustration style. Vibrant cel-shading with soft gradients and clean linework. Galge/otome game quality. No text, no UI elements, no speech bubbles. Portrait 9:16.",
    fontBody: "'Georgia', 'Noto Serif JP', serif",
    fontMono: "'JetBrains Mono', monospace",
    bg: ["#06060f","#0e0e20"],
    glowIntensity: "22", glowIntensity2: "14",
    badgeBg: "linear-gradient(90deg, ${c}44, ${c}22)",
    badgeRadius: 20,
    borderAlpha: "55",
    scanlines: true, grain: false,
    narrationStyle: "italic",
    monoLetterSpacing: "2px", monoFontStyle: "italic",
    loadingText: "生成中…",
    dialogueBorderWidth: 2,
    speakerTagShape: "angled",
  },
  noir: {
    label: "Neo-Noir",
    description: "Black and white with one accent color. Hard shadows, rain-slicked streets, detective mystery.",
    promptPrefix: "Neo-noir visual novel illustration. High-contrast black and white with single red or amber accent color. Hard shadows, dramatic rim lighting, rain-slicked surfaces. Graphic novel ink style. No text, no UI.",
    fontBody: "'Courier New', 'Courier', monospace",
    fontMono: "'Courier New', monospace",
    bg: ["#030303","#0a0a0a"],
    glowIntensity: "08", glowIntensity2: "05",
    badgeBg: "rgba(255,255,255,.06)",
    badgeRadius: 0,
    borderAlpha: "60",
    scanlines: false, grain: true,
    narrationStyle: "normal",
    monoLetterSpacing: "3px", monoFontStyle: "normal",
    loadingText: "Processing…",
    dialogueBorderWidth: 1,
    speakerTagShape: "square",
  },
  fantasy: {
    label: "Fantasy Painterly",
    description: "Hand-painted fantasy art — like Dragon Age, FFXIV, or Baldur's Gate. Rich jewel tones.",
    promptPrefix: "Fantasy visual novel concept art. Hand-painted digital illustration. Lush jewel-tone palette — emerald, sapphire, gold. Rich environmental detail. Characters in period or fantasy costume. Dramatic magical lighting. No text, no UI.",
    fontBody: "'Palatino Linotype', 'Palatino', serif",
    fontMono: "'JetBrains Mono', monospace",
    bg: ["#050810","#0a1020"],
    glowIntensity: "18", glowIntensity2: "10",
    badgeBg: "linear-gradient(135deg, ${c}33, ${c}18)",
    badgeRadius: 6,
    borderAlpha: "50",
    scanlines: false, grain: true,
    narrationStyle: "italic",
    monoLetterSpacing: "2px", monoFontStyle: "italic",
    loadingText: "Conjuring…",
    dialogueBorderWidth: 1,
    speakerTagShape: "square",
  },
  retro: {
    label: "Retro Pixel",
    description: "16-bit RPG pixel art style — EarthBound, Undertale, Omori. Nostalgic, emotional.",
    promptPrefix: "Retro 16-bit pixel art visual novel. SNES/GBA RPG aesthetic. Pixel-art characters and backgrounds. Limited color palette. EarthBound / Undertale visual style. No text, no UI.",
    fontBody: "'Courier New', monospace",
    fontMono: "'Courier New', monospace",
    bg: ["#000010","#100020"],
    glowIntensity: "30", glowIntensity2: "20",
    badgeBg: "${c}30",
    badgeRadius: 0,
    borderAlpha: "80",
    scanlines: true, grain: false,
    narrationStyle: "normal",
    monoLetterSpacing: "1px", monoFontStyle: "normal",
    loadingText: "Loading…",
    dialogueBorderWidth: 2,
    speakerTagShape: "square",
  },
  watercolor: {
    label: "Watercolor / Indie",
    description: "Soft watercolor illustration — like Hades, Ikenfell, or a Studio Ghibli picture book.",
    promptPrefix: "Soft watercolor illustration visual novel. Delicate ink lines with watercolor wash fills. Warm, intimate, hand-crafted feeling. Studio Ghibli background painting quality. Pastel and earth tones. No text, no UI.",
    fontBody: "'Palatino Linotype', Georgia, serif",
    fontMono: "'JetBrains Mono', monospace",
    bg: ["#0c0a08","#1a160f"],
    glowIntensity: "15", glowIntensity2: "08",
    badgeBg: "${c}20",
    badgeRadius: 8,
    borderAlpha: "40",
    scanlines: false, grain: true,
    narrationStyle: "italic",
    monoLetterSpacing: "1px", monoFontStyle: "italic",
    loadingText: "Painting…",
    dialogueBorderWidth: 1,
    speakerTagShape: "square",
  },
  custom: {
    label: "Custom",
    description: "Fully user-defined style set by the AI Director.",
    promptPrefix: "", // set by AI Director
    fontBody: "'Georgia', serif",
    fontMono: "'JetBrains Mono', monospace",
    bg: ["#080810","#111128"],
    glowIntensity: "18", glowIntensity2: "10",
    badgeBg: "${c}22",
    badgeRadius: 6,
    borderAlpha: "44",
    scanlines: false, grain: false,
    narrationStyle: "italic",
    monoLetterSpacing: "1px", monoFontStyle: "italic",
    loadingText: "Generating…",
    dialogueBorderWidth: 1,
    speakerTagShape: "square",
  },
};

const VN_STYLE_NAMES = Object.keys(VN_STYLES);

const VN_PANEL_TYPES = {
  BG:   { label:"背景 Background",      icon:"🏙", color:"#5b8fd4" },
  CHAR: { label:"対話 Dialogue",        icon:"💬", color:"#e8a0c0" },
  DUAL: { label:"対決 Two-Character",   icon:"⚔",  color:"#a07de8" },
  MONO: { label:"語り Narration",       icon:"✦",  color:"#d4c87a" },
  CLUE: { label:"手掛 Clue Close-up",   icon:"🔎", color:"#e87a7a" },
};

function reducer(state, action) {
  switch (action.type) {
    case "UNDO": {
      if (!state.undoStack?.length) return state;
      const stack = [...state.undoStack];
      const prev = stack.pop();
      return { ...state, ...prev, undoStack: stack, redoStack: [...(state.redoStack||[]), snapshot(state)] };
    }
    case "REDO": {
      if (!state.redoStack?.length) return state;
      const stack = [...state.redoStack];
      const next = stack.pop();
      return { ...state, ...next, redoStack: stack, undoStack: [...(state.undoStack||[]), snapshot(state)] };
    }
    case "SET_VIEW": return { ...state, view: action.view };
    case "SET_PROJECT": return { ...state, activeProject: action.id, activeEpisode: null, activeSegment: null, view: "dashboard", bible: BLANK_BIBLE, chatHistory: [] };
    case "SET_ACTIVE_PROJECT_SILENT": return { ...state, activeProject: action.id };
    case "SET_STORY_PROMPT": return { ...state, bible: { ...state.bible,
      storyPrompt: { ...(state.bible.storyPrompt || {}), ...action.patch },
      lastBibleChange: new Date().toISOString(),
    }};
    case "SYNC_BIBLE_FROM_AI": return { ...state, bible: {
      ...(state.bible || {}), ...action.bible,
      storyPrompt: action.bible.storyPrompt || state.bible.storyPrompt,
    }};
    case "IMPORT_ALL": {
      const d = action.data;
      return {
        ...state,
        projects:         d.projects         || state.projects,
        bible:            d.bible            || state.bible,
        episodes:         d.episodes         || state.episodes,
        assets:           d.assets           || state.assets,
        audioTranscripts: d.audioTranscripts || state.audioTranscripts,
        activeProject:    d.activeProject    || d.projects?.[0]?.id || state.activeProject,
        activeEpisode:    null,
        view:             "dashboard",
      };
    }
    case "SET_EPISODE": return { ...state, activeEpisode: action.id, view: "episodes" };
    case "SET_SEGMENT": return { ...state, activeSegment: action.id };
    case "SET_API_KEY": return { ...state, apiKey: action.key };
    case "TOGGLE_CHAT": return { ...state, chatOpen: !state.chatOpen };
    case "ADD_CHAT_MSG": return { ...state, chatHistory: [...state.chatHistory, action.msg] };
    case "MARK_CHAT_APPLIED": return { ...state, chatHistory: state.chatHistory.map(m => m.id === action.id ? {...m, applied:true} : m) };
    case "DISMISS_CHAT_ACTIONS": return { ...state, chatHistory: state.chatHistory.map(m => m.id === action.id ? {...m, actions:null} : m) };
    case "SET_RIPPLE": return { ...state, ripple: action.data };

    // ── PROJECT CRUD
    case "ADD_PROJECT": {
      const s = pushUndo(state);
      return { ...s, projects: [...s.projects, action.project], activeProject: action.project.id, activeEpisode: null, view: "dashboard", bible: BLANK_BIBLE, chatHistory: [] };
    }
    case "UPDATE_PROJECT": return { ...pushUndo(state), projects: state.projects.map(p => p.id === action.id ? {...p, ...action.patch} : p) };
    case "DELETE_PROJECT": {
      const s = pushUndo(state);
      const remaining = s.projects.filter(p => p.id !== action.id);
      return { ...s, projects: remaining, activeProject: remaining[0]?.id || null, activeEpisode: null, activeSegment: null, view: "dashboard",
        episodes: s.episodes.filter(e => e.project !== action.id),
        assets: s.assets.filter(a => a.project !== action.id),
        bible: remaining.length ? s.bible : BLANK_BIBLE, chatHistory: [] };
    }

    // ── ASSET CRUD
    case "ADD_ASSET": return { ...pushUndo(state), assets: [...state.assets, action.asset] };
    case "DELETE_ASSET": return { ...pushUndo(state), assets: state.assets.filter(a => a.id !== action.id) };
    case "UPDATE_ASSET": return { ...state, assets: state.assets.map(a => a.id === action.id ? { ...a, ...action.patch } : a) };

    // ── EPISODE CRUD
    case "ADD_EPISODE": {
      const s = pushUndo(state);
      return { ...s, episodes: [...s.episodes, {...action.episode, project: s.activeProject}], activeEpisode: action.episode.id, view: "episodes" };
    }
    case "UPDATE_EPISODE": return { ...pushUndo(state), episodes: state.episodes.map(e => e.id === action.id ? {...e, ...action.patch} : e) };
    case "SET_CHAR_REF_IMAGES": {
      return { ...state, bible: { ...state.bible, characters: state.bible.characters.map(c =>
        c.id === action.charId ? { ...c, refImages: action.images } : c
      )}};
    }
    // Set avatar — stores in history (up to 5 per character), sets as active
    case "SET_CHAR_AVATAR": {
      return { ...state, bible: { ...state.bible, characters: state.bible.characters.map(c => {
        if (c.id !== action.charId) return c;
        const existing = c.avatarHistory || [];
        const newEntry = {
          id: "av_" + Date.now(),
          dataUrl: action.avatarUrl,
          style: action.style || "realistic",
          createdAt: new Date().toISOString(),
        };
        // Keep max 5, newest first — prune oldest when at limit
        const updated = [newEntry, ...existing].slice(0, 5);
        return { ...c, avatarHistory: updated, avatarUrl: action.avatarUrl, refStatus: "done" };
      })}};
    }
    // Select which history entry is active
    case "SET_CHAR_AVATAR_ACTIVE": {
      return { ...state, bible: { ...state.bible, characters: state.bible.characters.map(c => {
        if (c.id !== action.charId) return c;
        const entry = (c.avatarHistory || []).find(h => h.id === action.historyId);
        return entry ? { ...c, avatarUrl: entry.dataUrl } : c;
      })}};
    }
    // Remove one avatar from history
    case "REMOVE_CHAR_AVATAR": {
      return { ...state, bible: { ...state.bible, characters: state.bible.characters.map(c => {
        if (c.id !== action.charId) return c;
        const updated = (c.avatarHistory || []).filter(h => h.id !== action.historyId);
        const active  = updated[0]?.dataUrl || "";
        return { ...c, avatarHistory: updated, avatarUrl: active };
      })}};
    }
    // Track per-character avatar generation status
    case "SET_CHAR_AVATAR_STATUS": {
      return { ...state, bible: { ...state.bible, characters: state.bible.characters.map(c =>
        c.id === action.charId ? { ...c, _avatarGenerating: action.status } : c
      )}};
    }
    // Restore avatar history from IDB on mount (only if char has no avatar already)
    case "RESTORE_CHAR_AVATARS": {
      return { ...state, bible: { ...state.bible, characters: state.bible.characters.map(c => {
        if (c.id !== action.charId) return c;
        if (c.avatarUrl) return c; // already have one (e.g. uploaded) — don't overwrite
        return { ...c, avatarHistory: action.avatarHistory, avatarUrl: action.avatarUrl };
      })}};
    }
    case "SET_VN_STYLE": return {
      ...pushUndo(state),
      episodes: state.episodes.map(e => e.id === action.epId
        ? {...e, vnStyle: action.style, vnStylePromptPrefix: action.promptPrefix || VN_STYLES[action.style]?.promptPrefix || ""}
        : e)
    };
    // Clear all generated images for an episode (used when VN style changes)
    case "CLEAR_VN_IMAGES": return { ...state, episodes: state.episodes.map(e =>
      e.id === action.epId ? { ...e, vnImages: {}, vnImageHistory: {} } : e
    )};
    case "SAVE_VN_PANELS": return { ...state, episodes: state.episodes.map(e => {
      if (e.id !== action.epId) return e;
      const existing = e.vnPanelsHistory || [];
      const newEntry = { panels: action.panels, createdAt: new Date().toISOString(), id: "v" + Date.now() };
      return { ...e, vnPanels: action.panels, vnPanelsHistory: [...existing, newEntry] };
    })};
    case "SAVE_VN_IMAGE": return { ...state, episodes: state.episodes.map(e => {
      if (e.id !== action.epId) return e;
      const history = e.vnImageHistory || {};
      const panelHistory = history[action.panelId] || [];
      const newEntry = { dataUrl: action.dataUrl, createdAt: new Date().toISOString(), id: "img" + Date.now(), active: true };
      // Mark all previous as inactive
      const updatedPanelHistory = [...panelHistory.map(h => ({...h, active: false})), newEntry];
      return { ...e,
        vnImages: {...(e.vnImages||{}), [action.panelId]: action.dataUrl},
        vnImageHistory: {...history, [action.panelId]: updatedPanelHistory}
      };
    })};
    case "SET_VN_IMAGE_VERSION": return { ...state, episodes: state.episodes.map(e => {
      if (e.id !== action.epId) return e;
      const history = e.vnImageHistory || {};
      const panelHistory = (history[action.panelId] || []).map(h => ({...h, active: h.id === action.versionId}));
      const activeImg = panelHistory.find(h => h.active);
      return { ...e,
        vnImages: {...(e.vnImages||{}), [action.panelId]: activeImg?.dataUrl || e.vnImages?.[action.panelId]},
        vnImageHistory: {...history, [action.panelId]: panelHistory}
      };
    })};
    case "SET_VN_PANELS_VERSION": return { ...state, episodes: state.episodes.map(e => {
      if (e.id !== action.epId) return e;
      const ver = (e.vnPanelsHistory || []).find(v => v.id === action.versionId);
      return ver ? {...e, vnPanels: ver.panels} : e;
    })};
    case "SET_EPISODE_PRICE": return { ...pushUndo(state), episodes: state.episodes.map(e => e.id === action.id ? {...e, price_per_ep: action.price, price_model: action.model} : e) };
    case "DELETE_EPISODE": {
      const s = pushUndo(state);
      const remaining = s.episodes.filter(e => e.id !== action.id);
      return { ...s, episodes: remaining, activeEpisode: remaining.find(e=>e.project===s.activeProject)?.id || null };
    }

    // ── SEGMENT CRUD
    case "ADD_SEGMENT": return { ...pushUndo(state), episodes: state.episodes.map(ep => ep.id === action.episodeId ? {...ep, segments: [...ep.segments, action.segment]} : ep) };
    case "UPDATE_SEGMENT": return { ...pushUndo(state), episodes: state.episodes.map(ep => ({...ep, segments: ep.segments.map(s => s.id === action.id ? {...s, ...action.patch} : s)})) };
    case "DELETE_SEGMENT": {
      const s = pushUndo(state);
      return { ...s, episodes: s.episodes.map(ep => ({...ep, segments: ep.segments.filter(seg => seg.id !== action.id)})), activeSegment: null };
    }
    case "REORDER_SEGMENTS": return { ...pushUndo(state), episodes: state.episodes.map(ep => ep.id === action.episodeId ? {...ep, segments: action.segments} : ep) };

    // ── BIBLE CRUD
    case "UPDATE_BIBLE": {
      const s = pushUndo(state);
      const changelog = [{
        version: s.bible.bibleVersion + 1,
        timestamp: new Date().toISOString(),
        field: action.field, entityId: action.entityId,
        before: action.before, after: action.after, note: action.note || ""
      }];
      return { ...s, bible: { ...s.bible, ...action.patch, bibleVersion: s.bible.bibleVersion + 1, lastBibleChange: new Date().toISOString(), bibleChangelog: [...s.bible.bibleChangelog, ...changelog] } };
    }
    case "ADD_CHARACTER": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, characters: [...s.bible.characters, action.character] } };
    }
    case "UPDATE_CHARACTER": {
      const s = pushUndo(state);
      const before = s.bible.characters.find(c => c.id === action.id);
      return { ...s, bible: { ...s.bible, bibleVersion: s.bible.bibleVersion + 1, lastBibleChange: new Date().toISOString(),
        characters: s.bible.characters.map(c => c.id === action.id ? {...c, ...action.patch, lastChanged: new Date().toISOString(), flags:[...((c.flags||[]).filter(f=>f!=="changed")), "changed"]} : c),
        bibleChangelog: [...s.bible.bibleChangelog, {version: s.bible.bibleVersion+1, timestamp: new Date().toISOString(), field: Object.keys(action.patch).join(','), entityId: action.id, before: JSON.stringify(before), after: JSON.stringify({...before,...action.patch})}]
      }};
    }
    case "DELETE_CHARACTER": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, characters: s.bible.characters.filter(c => c.id !== action.id), relationships: s.bible.relationships.filter(r => r.from !== action.id && r.to !== action.id) } };
    }
    case "ADD_RELATIONSHIP": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, relationships: [...s.bible.relationships, action.rel] } };
    }
    case "UPDATE_RELATIONSHIP": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, relationships: s.bible.relationships.map((r,i) => i === action.idx ? {...r, ...action.patch} : r) } };
    }
    case "DELETE_RELATIONSHIP": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, relationships: s.bible.relationships.filter((_,i) => i !== action.idx) } };
    }
    case "ADD_WORLD_FACT": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, worldFacts: [...s.bible.worldFacts, action.fact] } };
    }
    case "UPDATE_WORLD_FACT": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, worldFacts: s.bible.worldFacts.map(f => f.id === action.id ? {...f, ...action.patch} : f) } };
    }
    case "DELETE_WORLD_FACT": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, worldFacts: s.bible.worldFacts.filter(f => f.id !== action.id) } };
    }
    case "ADD_ENDING": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, endings: [...s.bible.endings, action.ending] } };
    }
    case "UPDATE_ENDING": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, endings: s.bible.endings.map(e => e.id === action.id ? {...e, ...action.patch} : e) } };
    }
    case "DELETE_ENDING": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, endings: s.bible.endings.filter(e => e.id !== action.id) } };
    }
    case "ADD_DECISION": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, decisionPoints: [...s.bible.decisionPoints, action.dp] } };
    }
    case "UPDATE_DECISION": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, decisionPoints: s.bible.decisionPoints.map(d => d.id === action.id ? {...d, ...action.patch} : d) } };
    }
    case "DELETE_DECISION": {
      const s = pushUndo(state);
      return { ...s, bible: { ...s.bible, decisionPoints: s.bible.decisionPoints.filter(d => d.id !== action.id) } };
    }

    // ── APPLY ACTIONS (AI Director)
    case "APPLY_ACTIONS": {
      const s = pushUndo(state);
      let ns = { ...s };
      for (const a of action.actions) {
        // ── Segment fields
        if (a.target === "segment.field") {
          const epTarget = a.episodeId || ns.activeEpisode;
          ns = { ...ns, episodes: ns.episodes.map(ep => ({...ep,
            segments: ep.segments.map(seg => (seg.id===a.id || (a.id==="active"&&ep.id===epTarget&&seg.id===ns.activeSegment))
              ? { ...seg, [a.field]: a.value } : seg)
          }))};

        // ── Episode fields
        } else if (a.target === "episode.field") {
          ns = { ...ns, episodes: ns.episodes.map(ep =>
            (ep.id===a.id||(a.id==="active"&&ep.id===ns.activeEpisode)||(a.id==="all"))
              ? { ...ep, [a.field]: a.value } : ep)};

        // ── Character fields
        } else if (a.target === "bible.character.field") {
          const before = ns.bible.characters.find(c=>c.id===a.id)?.[a.field];
          ns = { ...ns, bible: { ...ns.bible, bibleVersion: ns.bible.bibleVersion+1, lastBibleChange: new Date().toISOString(),
            characters: ns.bible.characters.map(c => c.id===a.id ? { ...c, [a.field]: a.value, lastChanged: new Date().toISOString(), flags:[...((c.flags||[]).filter(f=>f!=="changed")), "changed"] } : c),
            bibleChangelog: [...ns.bible.bibleChangelog, { version:ns.bible.bibleVersion+1, timestamp:new Date().toISOString(), field:a.field, entityId:a.id, before, after:a.value }]
          }};

        // ── Add character
        } else if (a.target === "bible.character" && a.verb === "add") {
          const newChar = { ...a.value, id: a.value.id||(a.value.name||"char").toLowerCase().replace(/\s+/g,"_"), flags:[], lastChanged: new Date().toISOString() };
          ns = { ...ns, bible: { ...ns.bible, characters: [...ns.bible.characters, newChar] }};

        // ── Delete character
        } else if (a.target === "bible.character" && a.verb === "remove") {
          ns = { ...ns, bible: { ...ns.bible, characters: ns.bible.characters.filter(c=>c.id!==a.id), relationships: ns.bible.relationships.filter(r=>r.from!==a.id&&r.to!==a.id) }};

        // ── Relationships
        } else if (a.target === "bible.relationship") {
          if (a.verb==="remove") {
            ns = { ...ns, bible: { ...ns.bible, relationships: ns.bible.relationships.filter((_,i)=>i!==a.index) }};
          } else {
            ns = { ...ns, bible: { ...ns.bible, relationships: [...ns.bible.relationships, a.value] }};
          }

        // ── World facts
        } else if (a.target === "bible.world_fact") {
          if (a.verb==="add") {
            const fact = { id:"wf_"+Date.now(), ...a.value };
            ns = { ...ns, bible: { ...ns.bible, worldFacts: [...ns.bible.worldFacts, fact] }};
          } else if (a.verb==="remove") {
            ns = { ...ns, bible: { ...ns.bible, worldFacts: ns.bible.worldFacts.filter(f=>f.id!==a.id) }};
          } else {
            ns = { ...ns, bible: { ...ns.bible, worldFacts: ns.bible.worldFacts.map(f=>f.id===a.id?{...f,[a.field]:a.value}:f) }};
          }

        // ── Project fields (name, genre, desc, color, etc.)
        } else if (a.target === "project.field") {
          const pid = a.id==="active" ? ns.activeProject : a.id;
          ns = { ...ns, projects: ns.projects.map(p=>p.id===pid?{...p,[a.field]:a.value}:p)};

        // ── Website config (theme, colors, pricing, etc.)
        } else if (a.target === "website.field") {
          const pid = a.id==="active" ? ns.activeProject : a.id;
          ns = { ...ns, projects: ns.projects.map(p=>p.id===pid?{...p, website_config:{...(p.website_config||{}),[a.field]:a.value}}:p)};

        // ── Set character avatar URL directly
        } else if (a.target === "bible.character.avatar") {
          ns = { ...ns, bible: { ...ns.bible, characters: ns.bible.characters.map(c =>
            (a.id === "all" || c.id === a.id)
              ? { ...c, avatarUrl: a.value || c.avatarUrl, faceRef: a.faceRef || c.faceRef, refStatus: "done" }
              : c
          )}};

        // ── Navigation — change active view
        } else if (a.target === "navigation") {
          if (a.view) ns = { ...ns, view: a.view };
          if (a.episodeId) ns = { ...ns, activeEpisode: a.episodeId };
          if (a.segmentId) ns = { ...ns, activeSegment: a.segmentId };

        // ── API keys
        } else if (a.target === "api_key") {
          if (a.keyType==="anthropic") ns = { ...ns, apiKey: a.value };
          else if (a.keyType==="gemini")    ns = { ...ns, geminiKey: a.value };
          else if (a.keyType==="openai")    ns = { ...ns, openaiKey: a.value };
          else if (a.keyType==="jimeng")    ns = { ...ns, jimengKey: a.value };

        // ── Generation settings
        } else if (a.target === "gen_setting") {
          if (a.field==="jimengModel")  ns = { ...ns, jimengModel: a.value };
          if (a.field==="jimengRes")    ns = { ...ns, jimengRes: a.value };
          if (a.field==="jimengAspect") ns = { ...ns, jimengAspect: a.value };

        // ── Image engine switch
        } else if (a.target === "image_engine") {
          const validEngines = ["gemini", "pollinations", "dalle"];
          const engine = validEngines.includes(a.engine) ? a.engine : "pollinations";
          ns = { ...ns, imageEngine: engine };

        // ── VN style (for active episode, specific episode, or all)
        } else if (a.target === "vn_style") {
          console.log("[VN_STYLE] action received:", JSON.stringify(a));
          // Named aliases for styles not in VN_STYLES (AI may say "ghibli", "studio ghibli", etc.)
          const STYLE_ALIASES = {
            ghibli: { style: "custom", promptPrefix: "Studio Ghibli visual novel. Soft watercolor animation aesthetic. Warm sunlit natural environments — rolling hills, seaside towns, European-style towns, cluttered workshops. Characters with Ghibli proportions, expressive faces, wind-blown hair. Hayao Miyazaki atmosphere. Rich hand-painted backgrounds with incredible environmental detail. Magical realism lighting, dappled sunlight, golden hour warmth. No text, no UI overlays." },
            "studio ghibli": { style: "custom", promptPrefix: "Studio Ghibli visual novel. Soft watercolor animation aesthetic. Warm sunlit natural environments — rolling hills, seaside towns, European-style towns, cluttered workshops. Characters with Ghibli proportions, expressive faces, wind-blown hair. Hayao Miyazaki atmosphere. Rich hand-painted backgrounds with incredible environmental detail. Magical realism lighting, dappled sunlight, golden hour warmth. No text, no UI overlays." },
            cyberpunk: { style: "custom", promptPrefix: "Cyberpunk neon-noir visual novel. Rain-slicked megacity streets. Neon sign reflections on wet pavement. Electric blues, violets, amber-golds. Blade Runner and Ghost in the Shell aesthetic. High contrast shadows. Holographic HUDs and displays in backgrounds. No text, no UI." },
            "2d anime": { style: "acgn", promptPrefix: null },
            "comic": { style: "noir", promptPrefix: null },
            "manga": { style: "noir", promptPrefix: null },
          };
          const aliasKey = (a.style || "").toLowerCase();
          const alias = STYLE_ALIASES[aliasKey];

          const resolvedStyle = alias
            ? alias.style
            : (a.style && a.style in VN_STYLES) ? a.style : "custom";
          const styleDef = VN_STYLES[resolvedStyle] || VN_STYLES.custom;

          // Prefix priority: 1) explicit promptPrefix in action  2) alias built-in  3) preset built-in  4) empty for custom
          const prefix = a.promptPrefix != null && a.promptPrefix !== undefined
            ? a.promptPrefix.trim()
            : alias?.promptPrefix != null
            ? (alias.promptPrefix || "")
            : resolvedStyle === "custom"
            ? ""
            : styleDef.promptPrefix;

          console.log("[VN_STYLE] resolvedStyle:", resolvedStyle, "prefix:", prefix?.substring(0,60));
          ns = { ...ns, episodes: ns.episodes.map(e =>
            (a.id === "all" ||
             e.id === a.id ||
             (a.id === "active" && e.id === ns.activeEpisode) ||
             (a.id === "current" && e.id === ns.activeEpisode))
              ? { ...e, vnStyle: resolvedStyle, vnStylePromptPrefix: prefix }
              : e
          )};

        // ── Add episode
        } else if (a.target === "episode" && a.verb === "add") {
          const newEp = { id:"ep_"+Date.now(), num:(ns.episodes.filter(e=>e.project===ns.activeProject).length+1), title:a.value?.title||"New Episode", notes:"", status:"draft", access:"free", segments:[], project:ns.activeProject, ...a.value };
          ns = { ...ns, episodes: [...ns.episodes, newEp], activeEpisode: newEp.id };

        // ── Delete episode
        } else if (a.target === "episode" && a.verb === "remove") {
          const remaining = ns.episodes.filter(e=>e.id!==a.id);
          ns = { ...ns, episodes: remaining, activeEpisode: remaining.find(e=>e.project===ns.activeProject)?.id || null };
        }
      }
      return ns;
    }

    case "UPDATE_SEG_STATUS": return {
      ...state,
      episodes: state.episodes.map(ep => ({
        ...ep, segments: ep.segments.map(s => s.id === action.id ? {...s, status: action.status, ...(action.videoUrl?{videoUrl:action.videoUrl}:{}), ...(action.taskId?{taskId:action.taskId}:{})} : s)
      }))
    };

    case "SET_GEMINI": return { ...state, geminiKey: action.key };
    case "SET_OPENAI": return { ...state, openaiKey: action.key };
    case "SET_ELEVENLABS": return { ...state, elevenlabsKey: action.key };
    case "SAVE_TRANSCRIPT": {
      const existing = state.audioTranscripts.filter(t => t.id !== action.transcript.id);
      const prev = state.audioTranscripts.find(t => t.id === action.transcript.id);
      // If lines were replaced wholesale (regenerate), keep any explicitly-passed audioUrls/staleAudio,
      // but do NOT carry over old saved URLs (they may refer to different lines).
      const incoming = action.transcript;
      const isFullRegen = !prev || (prev.lines?.length !== incoming.lines?.length);
      const merged = isFullRegen
        ? { ...incoming, audioUrls: incoming.audioUrls||{}, staleAudio: incoming.staleAudio||{} }
        : { ...(prev||{}), ...incoming };
      return { ...state, audioTranscripts: [...existing, merged] };
    }
    case "DELETE_TRANSCRIPT":
      return { ...state, audioTranscripts: state.audioTranscripts.filter(t => t.id !== action.id) };
    case "UPDATE_TRANSCRIPT_LINE": {
      return { ...state, audioTranscripts: state.audioTranscripts.map(t =>
        t.id !== action.transcriptId ? t : {
          ...t,
          lines: t.lines.map(l => l.id === action.lineId ? { ...l, ...action.patch } : l),
          // Mark this line's audio as stale
          staleAudio: { ...(t.staleAudio||{}), [action.lineId]: true },
        }
      )};
    }
    case "SET_VOICE_MAP": {
      // When a voice changes for a speaker, mark ALL lines by that speaker as stale
      const changedSpeakers = Object.keys(action.voiceMap||{});
      return { ...state, audioTranscripts: state.audioTranscripts.map(t => {
        if (t.id !== action.transcriptId) return t;
        const newStale = { ...(t.staleAudio||{}) };
        (t.lines||[]).forEach(l => { if (changedSpeakers.includes(l.speaker)) newStale[l.id] = true; });
        return { ...t, voiceMap: { ...(t.voiceMap||{}), ...action.voiceMap }, staleAudio: newStale };
      })};
    }
    case "SAVE_AUDIO_URL": {
      // Save a generated audio URL for a line
      return { ...state, audioTranscripts: state.audioTranscripts.map(t =>
        t.id !== action.transcriptId ? t : {
          ...t,
          audioUrls: { ...(t.audioUrls||{}), [action.lineId]: action.url },
          staleAudio: Object.fromEntries(Object.entries(t.staleAudio||{}).filter(([k]) => k !== action.lineId)),
        }
      )};
    }
    case "CLEAR_STALE_AUDIO": {
      return { ...state, audioTranscripts: state.audioTranscripts.map(t =>
        t.id !== action.transcriptId ? t : { ...t, staleAudio: {} }
      )};
    }
    case "SET_IMAGE_ENGINE": return { ...state, imageEngine: action.engine };
    case "SET_JIMENG": return { ...state, jimengKey: action.key||state.jimengKey, jimengModel: action.model||state.jimengModel, jimengRes: action.res||state.jimengRes, jimengAspect: action.aspect||state.jimengAspect };

    case "ADD_VIDEO_JOB": return { ...state, videoJobs: [...state.videoJobs, action.job] };
    case "UPDATE_VIDEO_JOB": return { ...state, videoJobs: state.videoJobs.map(j => j.id === action.id ? {...j, ...action.patch} : j) };
    case "REMOVE_VIDEO_JOB": return { ...state, videoJobs: state.videoJobs.filter(j => j.id !== action.id) };

    case "BOOTSTRAP_PROJECT": {
      const s = pushUndo(state);
      const d = action.data;
      const pid = d.project.id;
      // Build per-project bible from bootstrap data
      const newBible = {
        ...BLANK_BIBLE,
        ...(d.bible || {}),
        bibleVersion: 1,
        lastBibleChange: new Date().toISOString(),
        bibleChangelog: [{ version:1, timestamp:new Date().toISOString(), field:"bootstrap", entityId:pid, before:null, after:"Full project generated", note:"Generated from prompt" }],
      };
      return {
        ...s,
        activeProject: pid,
        activeEpisode: d.episodes?.[0]?.id || null,
        activeSegment: null,
        view: "dashboard",
        chatHistory: [],
        projects: [...s.projects.filter(p => p.id !== pid), d.project],
        bible: newBible,
        assets: [...s.assets.filter(a => a.project !== pid), ...(d.assets||[]).map((a,i) => ({...a, id:`gen_a${i+1}`, project:pid, added:new Date().toISOString().slice(0,10)}))],
        episodes: [...s.episodes.filter(e => e.project !== pid), ...(d.episodes||[]).map(ep => ({...ep, project:pid}))],
      };
    }

    case "ADD_GENERATED_EPISODES": {
      const newEps = action.episodes.map(ep => ({...ep, project:state.activeProject}));
      const existingIds = new Set(state.episodes.map(e=>e.id));
      const toAdd = newEps.filter(e => !existingIds.has(e.id));
      return { ...pushUndo(state), episodes: [...state.episodes, ...toAdd], activeEpisode: toAdd[0]?.id || state.activeEpisode, view:"episodes" };
    }

    // Switch active project and load its bible
    case "SWITCH_PROJECT": {
      const pid = action.id;
      // Bible is shared across all projects for now (per original design)
      return { ...state, activeProject: pid, activeEpisode: state.episodes.find(e=>e.project===pid)?.id || null, activeSegment: null, view: "dashboard", chatHistory: [] };
    }

    // ── SYNC / AUTH
    case "SET_SYNC_STATUS": return { ...state, syncStatus: action.status, syncError: action.error||null };
    case "FORCE_SYNC": return { ...state, _forceSyncAt: Date.now() }; // triggers autosave useEffect
    case "SET_SUPABASE": return { ...state, supabaseUrl: action.url, supabaseKey: action.key };
    case "SET_CURRENT_USER": return { ...state, currentUser: action.user };
    case "SET_TEAM_MEMBERS": return { ...state, teamMembers: action.members };
    case "SYNC_FROM_SERVER": {
      // Merge server state, prefer server for anything that changed
      const d = action.data;
      return {
        ...state,
        projects:         d.projects         || state.projects,
        bible:            d.bible            || state.bible,
        episodes:         d.episodes         || state.episodes,
        assets:           d.assets           || state.assets,
        publishJobs:      d.publishJobs      || state.publishJobs,
        audioTranscripts: d.audioTranscripts || state.audioTranscripts,
        syncStatus: "ok",
      };
    }
    // ── PUBLISH JOBS
    // Real-time Supabase subscription updates
    case "SYNC_EPISODE_FROM_SERVER": {
      const e = action.episode;
      if (!e) return state;
      const mapped = {
        ...e,
        project:            e.project_id,
        segments:           e.segments            || [],
        vnPanels:           e.vn_panels           || [],
        vnPanelsHistory:    e.vn_panels_history    || [],
        vnStyle:            e.vn_style             || "cinematic",
        vnStylePromptPrefix:e.vn_style_prefix      || "",
        chatHistory:        e.chat_history         || [],
        vnImages:           state.episodes.find(ep=>ep.id===e.id)?.vnImages || {},
        price_per_ep:       e.price_per_ep         || null,
        price_model:        e.price_model          || "subscription",
        site_published:     e.site_published       || false,
        is_free:            e.is_free              || false,
      };
      const exists = state.episodes.some(ep => ep.id === e.id);
      return { ...state, episodes: exists
        ? state.episodes.map(ep => ep.id === e.id ? { ...ep, ...mapped } : ep)
        : [...state.episodes, mapped]
      };
    }
    case "SYNC_BIBLE_FROM_SERVER": {
      const b = action.bible;
      if (!b) return state;
      return { ...state, bible: {
        ...state.bible,
        characters:    b.characters    || state.bible.characters,
        relationships: b.relationships || state.bible.relationships,
        worldFacts:    b.world_facts   || state.bible.worldFacts,
        endings:       b.endings       || state.bible.endings,
        decisionPoints:b.decision_points || state.bible.decisionPoints,
        storyPrompt:   b.story_prompt  || state.bible.storyPrompt || {},
        bibleVersion:  b.bible_version || state.bible.bibleVersion,
        lastBibleChange: b.last_changed_at || state.bible.lastBibleChange,
        bibleChangelog: b.changelog    || state.bible.bibleChangelog,
      }};
    }
    case "ADD_PUBLISH_JOB": return { ...state, publishJobs: [...state.publishJobs, action.job] };
    case "UPDATE_PUBLISH_JOB": return { ...state, publishJobs: state.publishJobs.map(j => j.id===action.id ? {...j,...action.patch} : j) };
    case "DELETE_PUBLISH_JOB": return { ...state, publishJobs: state.publishJobs.filter(j => j.id!==action.id) };
    case "SET_PLATFORM_CREDS": return { ...state, platformCreds: { ...state.platformCreds, [action.platform]: action.creds } };
    case "SET_EPISODE_ACCESS": return {
      ...pushUndo(state),
      episodes: state.episodes.map(e => e.id===action.id ? {...e, access: action.access} : e)
    };

    default: return state;
  }
}

// ═══════════════════════════════════════════════════════════════════
// AI HELPERS
// ═══════════════════════════════════════════════════════════════════
function buildContext(state) {
  const proj = state.projects.find(p => p.id === state.activeProject);
  const ep   = state.episodes.find(e => e.id === state.activeEpisode);
  const seg  = ep?.segments.find(s => s.id === state.activeSegment);
  const chars = state.bible.characters.map(c => `${c.name} [${c.id}]: ${c.role}. Secret: ${c.secret.substring(0,80)}`).join('\n');
  const rels  = state.bible.relationships.map(r => `${r.from}→${r.to}: ${r.label} (tension:${r.tension})`).join(', ');
  return `PROJECT: ${proj?.name} (${proj?.genre})\nCHARACTERS:\n${chars}\nRELATIONSHIPS: ${rels}\n${ep?`EPISODE: ${ep.num} "${ep.title}"\nSEGMENTS: ${ep.segments.map((s,i)=>`[${i+1}]${s.id} ${s.type} ${s.dur}s ${s.status}`).join(' | ')}`:''}${seg?`\nSELECTED SEG: ${seg.id} type:${seg.type} dur:${seg.dur}s status:${seg.status}\nPROMPT: ${seg.prompt.substring(0,200)}`:''}\nBIBLE VERSION: ${state.bible.bibleVersion}`;
}

function buildVNStyleContext(state) {
  const ep = state.episodes.find(e=>e.id===state.activeEpisode);
  if (!ep) return "";
  const styleKey = ep.vnStyle || "cinematic";
  const styleDef = VN_STYLES[styleKey];
  return `\nVN STYLE (EP${ep.num}): ${styleDef?.label||styleKey} — ${styleDef?.description||""}`;
}

function buildSysPrompt(state) {
  const styleNames = VN_STYLE_NAMES.join(", ");
  const proj   = state.projects.find(p=>p.id===state.activeProject);
  const ep     = state.episodes.find(e=>e.id===state.activeEpisode);
  const allEps = state.episodes.filter(e=>e.project===state.activeProject).sort((a,b)=>a.num-b.num);
  const seg    = ep?.segments.find(s=>s.id===state.activeSegment);
  const chars  = state.bible.characters;
  const rels   = state.bible.relationships;

  const epList = allEps.map(e=>{
    const done = e.segments.filter(s=>s.status==="done").length;
    const vnInfo = e.vnPanels?.length ? ` | VN:${e.vnPanels.length}panels style="${e.vnStyle||"cinematic"}"${e.vnStylePromptPrefix?` prefix="${e.vnStylePromptPrefix.substring(0,40)}…"`:""}` : "";
    const vidInfo = e.segments.length ? ` | video:${done}/${e.segments.length}done` : "";
    return `  EP${String(e.num).padStart(2,"0")} [${e.id}] "${e.title}" ${e.status}${e.access==="paid"?" PAID":""}${vnInfo}${vidInfo}`;
  }).join("\n");

  const charList = chars.map(c=>{
    const av = c.avatarUrl ? `avatar:✓(${(c.avatarHistory||[]).length}versions)` : "avatar:✗";
    const gen = c._avatarGenerating ? " [GENERATING]" : "";
    return `  [${c.id}] ${c.name} age:${c.age||"?"} — ${c.role} | ${av}${gen}${c.visualLock?` | lock:"${c.visualLock.substring(0,60)}"`:""}`; 
  }).join("\n") || "  (none)";

  const relList = rels.map((r,i)=>`  [${i}] ${r.from}→${r.to}: ${r.label} (${r.type}, tension:${r.tension})`).join("\n") || "  (none)";

  const vnStyleSummary = allEps.length > 0
    ? allEps.map(e=>`  EP${e.num}[${e.id}] vnStyle="${e.vnStyle||"cinematic"}"${e.vnStylePromptPrefix?` customPrefix="${e.vnStylePromptPrefix.substring(0,70)}…"`:` (built-in preset)`}`).join("\n")
    : "  (no episodes yet)";

  const engineInfo = IMAGE_ENGINES[state.imageEngine||"nanoBanana2"]||IMAGE_ENGINES.nanoBanana2;
  const keys = `Anthropic:${state.apiKey?"✓SET":"✗MISSING"} Gemini:${state.geminiKey?"✓SET":"✗MISSING"} OpenAI:${state.openaiKey?"✓SET":"✗MISSING"} Jimeng:${state.jimengKey?"✓SET":"✗MISSING"}`;
  const websiteCfg = proj?.website_config||{};

  return `You are the AI Director for Drama Studio — the PRIMARY interface. Users control everything through you. The UI exists only for review. You DO things for users; you don't tell them to click buttons.

━━━ CURRENT STATE ━━━
PROJECT: ${proj?`"${proj.name}" [${proj.id}] ${proj.genre||""}`:"{none selected}"}
ACTIVE EPISODE: ${ep?`EP${ep.num} "${ep.title}" [${ep.id}]
  VN STYLE: "${ep.vnStyle||"cinematic"}"${ep.vnStylePromptPrefix?` CUSTOM PREFIX: "${ep.vnStylePromptPrefix.substring(0,80)}…"`:` (using built-in prefix for "${ep.vnStyle||"cinematic"}")`}`:"{none}"}
ACTIVE SEGMENT: ${seg?`[${seg.id}] type:${seg.type} dur:${seg.dur}s status:${seg.status}`:"{none}"}
CURRENT VIEW: ${state.view}
IMAGE ENGINE: ${engineInfo.icon} ${engineInfo.name} (${engineInfo.free?"FREE":"PAID"}${engineInfo.needsKey?", key required":""})
API KEYS: ${keys}
BIBLE v${state.bible.bibleVersion}

━━━ EPISODES ━━━
${epList||"  (none)"}

━━━ VN STYLE STATUS ━━━
${vnStyleSummary}

━━━ STORY PROMPT ━━━
${(() => {
  const sp = state.bible.storyPrompt || {};
  const parts = [
    sp.logline        && `Logline: ${sp.logline}`,
    sp.tone           && `Tone: ${sp.tone}`,
    sp.world          && `World: ${sp.world.substring(0,200)}${sp.world.length>200?"…":""}`,
    sp.themes         && `Themes: ${sp.themes}`,
    sp.episodeArc     && `Arc: ${sp.episodeArc.substring(0,200)}${sp.episodeArc.length>200?"…":""}`,
    sp.visualStyle    && `Visual: ${sp.visualStyle}`,
  ].filter(Boolean);
  return parts.length ? parts.join("\n") : "  (not set — go to Bible → ✦ Story Prompt to add)";
})()}

━━━ CHARACTERS ━━━
${charList}

━━━ RELATIONSHIPS ━━━
${relList}

━━━ WEBSITE ━━━
theme:${websiteCfg.theme||"auto"} price:$${proj?.price_monthly||"4.99"}/mo $${proj?.price_annual||"39.99"}/yr

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION SYSTEM — emit \`\`\`actions JSON, applies INSTANTLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every response that changes state MUST include an \`\`\`actions block.
Format: [{ "verb":"set|add|remove", "target":"...", ...fields }]

TARGET REFERENCE:

vn_style
  id: "all" | "active" | episodeId
  style: cinematic | acgn | noir | fantasy | retro | watercolor | custom
  promptPrefix: "full art direction string" ← REQUIRED when style=custom, OPTIONAL for any preset to override
  → Changes what the image engine renders. User must click ✦ Regenerate Images after.

segment.field      id: segId | "active"   field: prompt, dur, type, status, chars, mood, bg, camera, shotType, lighting, seed, bridge
episode.field      id: epId | "active" | "all"   field: title, notes, status, access, vnStyle ← (use vn_style target instead for style), num
episode            verb:add  value:{title,notes,status,access}
episode            verb:remove  id:epId
bible.character.field   id: charId   field: name, role, appearance, motivation, secret, arc, visualLock, voiceProfile, faceRef, age, seed, archetype
bible.character    verb:add   value:{id,name,role,appearance,motivation,secret,arc,age,color,visualLock}
bible.character    verb:remove  id:charId
bible.relationship verb:add   value:{from,to,type,label,weight,tension}
bible.relationship verb:remove  index:N
bible.world_fact   verb:add|set|remove  value:{category,fact}  id:factId
project.field      id:"active"|projId   field: name,genre,desc,color,type,status,price_monthly,price_annual
website.field      id:"active"|projId   field: theme,primaryColor,accentColor,tagline,ctaText,showPricing
api_key            keyType: anthropic|gemini|openai|jimeng   value: "key-string"
image_engine       engine: gemini | pollinations | dalle   (gemini=free+key, pollinations=free+nokey, dalle=paid+key)
gen_setting        field: jimengModel|jimengRes|jimengAspect   value: "..."
generate_avatar    id: charId | "all"   style: realistic|anime|painted|ghibli   ← async, uses current image engine
bible.character.avatar  id: charId|"all"   value: dataUrl   faceRef: hostedUrl
generate_audiobook id: "all" | epId | epNum   ← generates audiobook transcript(s) via AI; saves automatically
navigation         view: dashboard|bible|assets|episodes|settings   episodeId: id   segmentId: id

━━━ IMAGE ENGINE — switch at any time ━━━
Current engine shown in STATE above. Switch instantly:

"use pollinations" / "free images no key" / "switch to flux":
→ [{"verb":"set","target":"image_engine","engine":"pollinations","description":"Switched to Pollinations FLUX (free, no key)"}]

"use dalle" / "openai images" / "dall-e 3":
→ [{"verb":"set","target":"image_engine","engine":"dalle","description":"Switched to DALL-E 3"}]

"use gemini" / "switch back to gemini" / "google images":
→ [{"verb":"set","target":"image_engine","engine":"gemini","description":"Switched to Gemini"}]

After switching engine: tell user to regenerate images (✦ Regenerate) if they want new style renders.
Pollinations needs NO key — best for users without API keys.
DALL-E 3 needs openai keyType in api_key action, or tell user to add key in Settings.

━━━ VN STYLE — CRITICAL ━━━
Named preset keys (use EXACTLY): cinematic | acgn | noir | fantasy | retro | watercolor | custom

RULE: "ghibli", "studio ghibli", "cyberpunk" and other named aesthetics NOT in the preset list → use style:"custom" with a rich promptPrefix.
RULE: promptPrefix controls EVERYTHING Gemini draws. Make it detailed (50+ words).
RULE: Never use "No text, no UI" in promptPrefix — the captions are added by the app, not Gemini.

EXACT JSON to emit for common requests:

"ghibli" / "studio ghibli" / "ghibli style":
[{"verb":"set","target":"vn_style","id":"all","style":"custom","promptPrefix":"Studio Ghibli visual novel CG art. Soft hand-painted watercolor animation style. Warm golden sunlight through leaves. Lush rolling hills, European-style coastal towns, cluttered magical workshops. Characters with Ghibli proportions — large expressive eyes, detailed hair, wind-movement. Hayao Miyazaki atmosphere. Rich environmental background painting with extraordinary detail. Dappled light, soft shadows, magical realism. Warm pastel palette.","description":"Studio Ghibli style"}]

"anime" / "acgn" / "japanese visual novel":
[{"verb":"set","target":"vn_style","id":"all","style":"acgn","description":"ACGN anime style"}]

"cyberpunk" / "neon noir":
[{"verb":"set","target":"vn_style","id":"all","style":"custom","promptPrefix":"Cyberpunk neon-noir visual novel CG art. Rain-slicked megacity streets at night. Neon sign reflections on wet pavement. Electric blues, violets, amber-golds. Blade Runner and Ghost in the Shell aesthetic. High contrast shadows. Holographic displays in backgrounds. Dark atmospheric sci-fi mood.","description":"Cyberpunk style"}]

"cinematic" / "prestige TV" / "dramatic film":
[{"verb":"set","target":"vn_style","id":"all","style":"cinematic","description":"Cinematic prestige TV style"}]

"noir" / "detective" / "black and white":
[{"verb":"set","target":"vn_style","id":"all","style":"noir","description":"Neo-noir style"}]

"watercolor" / "soft illustrated" / "indie":
[{"verb":"set","target":"vn_style","id":"all","style":"watercolor","description":"Watercolor indie style"}]

"fantasy" / "painterly" / "epic fantasy":
[{"verb":"set","target":"vn_style","id":"all","style":"fantasy","description":"Fantasy painterly style"}]

"retro" / "pixel art" / "16-bit":
[{"verb":"set","target":"vn_style","id":"all","style":"retro","description":"Retro pixel style"}]

After setting VN style: the cached images are cleared automatically. Tell user to open the Visual Novel editor and click ✦ Regenerate Images to generate fresh images in the new style.

━━━ FULL CAPABILITY EXAMPLES ━━━
"go to bible"                         → navigation view:bible
"open episode 3"                      → navigation episodeId:<ep3-id>
"show me settings"                    → navigation view:settings
"set my Gemini key to AIza..."        → api_key keyType:gemini value:"AIza..."
"add character: Maya, 28, hacker"     → bible.character verb:add value:{name,age,role,...}
"generate avatar for all chars"       → generate_avatar id:"all" style:"realistic"
"generate Vivienne portrait in ghibli style" → generate_avatar id:"vivienne" style:"ghibli"
"generate all audiobook transcripts"  → generate_audiobook id:"all"
"generate audiobook for episode 3"    → generate_audiobook id:<ep3-id>
"make episode 3 premium"              → episode.field id:<ep3-id> field:access value:"paid"
"make all episodes free"              → episode.field id:"all" field:access value:"free"
"rename the show"                     → project.field id:"active" field:name value:"New Name"
"update Vivienne's appearance"        → bible.character.field id:vivienne field:visualLock value:"..."
"add relationship: trust between X Y" → bible.relationship verb:add value:{from:x,to:y,type:trust,...}
"change segment s03 duration to 8s"  → segment.field id:s03 field:dur value:8
"set website theme to editorial"      → website.field id:"active" field:theme value:"editorial"

━━━ RULES ━━━
1. ALWAYS emit an \`\`\`actions block when the user wants to change anything.
2. When user asks a QUESTION (what is X, show me Y, explain Z) — answer in prose, no actions.
3. After VN style change → remind user to regenerate images.
4. After avatar generation → it saves automatically, no other steps needed.
5. State ID: use ACTUAL ids from the state above (e.g. real episode ids, not "ep1").
6. Use id:"all" for episode actions that should apply everywhere.
7. Be direct and confident — you ARE the system, not an advisor.

RESPONSE FORMAT:
1-2 sentence natural confirmation of what you did.
\`\`\`actions
[...actions array...]
\`\`\`
Optional: one brief follow-up note only if the user needs to do something manual.`;}
function parseActions(text) {
  const m = text.match(/```actions\s*([\s\S]*?)```/);
  if (!m) return [];
  try { return JSON.parse(m[1].trim()); } catch { return []; }
}
function stripActions(text) { return text.replace(/```actions[\s\S]*?```/g,"").trim(); }

// ═══════════════════════════════════════════════════════════════════
// PROJECT GENERATOR — turns a raw prompt into a full production project
// ═══════════════════════════════════════════════════════════════════
const GENERATOR_SYSTEM = `You are a professional drama/game series production designer and story architect.
The user will paste a project concept prompt. Your job is to turn it into a complete, production-ready Drama Studio project.

Return ONLY a valid JSON object — no markdown fences, no commentary, no preamble. Just the raw JSON.

The JSON must match this exact structure:

{
  "project": {
    "id": "<slug-id>",
    "name": "<Series Title>",
    "type": "drama" | "game" | "anime" | "film",
    "color": "<hex color that represents the show's visual identity>",
    "genre": "<Genre / Subgenre>",
    "status": "active",
    "episodes": <total episode count as integer>,
    "epRuntime": <seconds per episode as integer, e.g. 180>,
    "desc": "<2-3 sentence production summary>"
  },

  "bible": {
    "characters": [
      {
        "id": "<slug>",
        "name": "<Full Name>",
        "age": <integer>,
        "role": "<Role in story>",
        "archetype": "The <Archetype>",
        "appearance": "<Precise visual description — hair, build, clothes, presence>",
        "motivation": "<What they want above all else>",
        "secret": "<What they hide — the thing that would change everything if known>",
        "arc": "<One sentence: where they start → where they end>",
        "relationships": ["<other char id>", ...],
        "firstEp": <integer — episode they first appear>,
        "refStatus": "done" | "pending",
        "seed": <integer 7001-9999>,
        "color": "<hex — their personal color on the relationship map>",
        "flags": []
      }
      // 4-8 characters total
    ],
    "relationships": [
      {
        "from": "<char id>",
        "to": "<char id>",
        "type": "family"|"employer"|"alliance"|"rivalry"|"trust"|"complicity"|"unknown"|"romantic",
        "label": "<20-word max description of the relationship>",
        "weight": <1-5 integer — emotional significance>,
        "tension": "critical"|"high"|"medium"|"low"
      }
      // One entry per meaningful pair — do NOT duplicate pairs
    ],
    "worldFacts": [
      {
        "id": "wf1",
        "category": "<Category Name>",
        "fact": "<One grounded true statement about the world>",
        "flags": []
      }
      // 5-8 world facts across different categories
    ],
    "endings": [
      {
        "id": "<slug>",
        "label": "<Ending Title>",
        "desc": "<2 sentence description of how it plays out>",
        "prob": <integer — starting probability, all must sum to 100>,
        "color": "<hex>"
      }
      // 4-5 distinct possible endings
    ],
    "decisionPoints": [
      {
        "id": "dp1",
        "ep": <episode number>,
        "label": "<Short name for this decision>",
        "desc": "<The situation and question the player faces>",
        "options": ["<Option A>", "<Option B>", "<Option C>"]
      }
      // 3-4 major decision points across the series
    ]
  },

  "episodes": [
    {
      "id": "ep01",
      "num": 1,
      "title": "<Episode Title>",
      "status": "not_started",
      "segments": [
        {
          "id": "s01",
          "type": "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H",
          "scene": "<scene_slug — e.g. main_hall, rooftop, basement_lab>",
          "dur": <duration in seconds, 4-12>,
          "seed": <integer matching the scene's seed group>,
          "status": "pending",
          "chars": ["<char id>", ...],
          "bridge": <boolean — true if @image1 reference needed>,
          "prompt": "<Full Seedance 2.0 video generation prompt. Include STYLE LOCK for type A. Include CHARACTER[name]: description for type B. Include DIALOGUE: 'text' for type C. Be specific, cinematic, atmospheric.>",
          "clue": "<clue code like 1A, 1B — or empty string>",
          "notes": "<production note or empty string>"
        }
        // 15-22 segments per episode
      ]
    }
    // Generate episodes 1, 2, and 3 in full
    // Then generate stub episodes (no segments) for episodes 4 through the total episode count, grouped:
    // For stubs use: { "id":"ep04", "num":4, "title":"<title>", "status":"not_started", "segments":[] }
    // Generate stub titles for ALL episodes
  ],

  "assets": [
    {
      "name": "<Asset Name>",
      "type": "logo"|"video"|"audio"|"image"|"doc",
      "format": "<FILE FORMAT>",
      "tags": ["<tag>", ...],
      "thumb": "<single emoji>",
      "size": "<estimated size like 24KB>"
    }
    // 5-8 assets that this production would need (brand logo, theme music, intro sequence, etc.)
  ]
}

SEGMENT TYPE GUIDE:
- A: Wide establishing shot (no characters). STYLE LOCK required. Use for scene openings.
- B: Character introduction or solo action shot. Needs @image1 CHARNAME: description.
- C: Dialogue scene. Include DIALOGUE: 'exact words' in prompt.
- D: Reaction / emotional beat. Close-up focus.
- E: Action or physical event (arrival, handoff, confrontation).
- F: Detail / clue shot. EXTREME CLOSE-UP of object, document, symbol. Always flag with clue code if narratively significant.
- G: Transition / corridor / atmosphere.
- H: Final frame / episode closing shot. Fade to black implied.

PROMPT WRITING RULES:
- Be cinematic and specific. No vague adjectives like "interesting" or "nice".
- For type A: Always start with STYLE LOCK — [Location Name]: [time of day], [lighting], [composition]. [Mood].
- For type B: Start with @image1 CHARNAME: [precise physical description]. Then describe action.
- For type C: Include exact dialogue quote. Describe delivery. Note body language.
- Use film language: medium-close, tracking shot, push-in, wide, over-shoulder.
- Each prompt should be 2-4 sentences.

Be bold, specific, and production-ready. This is a real production document.`;

async function callGeneratorAPI(apiKey, userPrompt, onProgress) {
  onProgress("Sending concept to Claude…", 5);
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: GENERATOR_SYSTEM,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  onProgress("Receiving project data…", 25);
  const data = await resp.json();
  const raw = data.content?.[0]?.text || "";
  onProgress("Parsing structure…", 70);
  // Try to extract JSON — handle cases where model wraps it
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON returned — check API key or try again.");
  const parsed = JSON.parse(jsonMatch[0]);
  onProgress("Validating project…", 90);
  return parsed;
}

// ── Book-to-project adapter system prompt
const BOOK_ADAPTER_SYSTEM = `You are a professional drama/game series production designer and story architect specializing in book adaptations.
The user will provide book source material (excerpt or full text) along with adaptation parameters.
Your job is to adapt it into a complete, production-ready Drama Studio project.

Return ONLY a valid JSON object — no markdown fences, no commentary, no preamble. Just the raw JSON.

The JSON must match this exact structure:

{
  "project": {
    "id": "<slug-id based on book title>",
    "name": "<Adapted Series Title>",
    "type": "drama" | "game" | "anime" | "film",
    "color": "<hex color that represents the show's visual identity>",
    "genre": "<Genre / Subgenre derived from the source material>",
    "status": "active",
    "episodes": <total episode count as specified by user>,
    "epRuntime": <seconds per episode as specified by user>,
    "desc": "<2-3 sentence production summary — mention source book and adaptation approach>"
  },

  "bible": {
    "characters": [
      {
        "id": "<slug>",
        "name": "<Full Name from book>",
        "age": <integer>,
        "role": "<Role in story>",
        "archetype": "The <Archetype>",
        "appearance": "<Precise visual description — hair, build, clothes, presence>",
        "motivation": "<What they want above all else>",
        "secret": "<What they hide — the thing that would change everything if known>",
        "arc": "<One sentence: where they start → where they end>",
        "relationships": ["<other char id>", ...],
        "firstEp": <integer — episode they first appear>,
        "refStatus": "done" | "pending",
        "seed": <integer 7001-9999>,
        "color": "<hex — their personal color on the relationship map>",
        "flags": []
      }
      // Extract all major and supporting characters from the book — 4-10 characters
    ],
    "relationships": [
      {
        "from": "<char id>",
        "to": "<char id>",
        "type": "family"|"employer"|"alliance"|"rivalry"|"trust"|"complicity"|"unknown"|"romantic",
        "label": "<20-word max description of the relationship>",
        "weight": <1-5 integer — emotional significance>,
        "tension": "critical"|"high"|"medium"|"low"
      }
    ],
    "worldFacts": [
      {
        "id": "wf1",
        "category": "<Category Name>",
        "fact": "<One grounded true statement about the world from the book>",
        "flags": []
      }
      // 6-10 world facts covering setting, rules, society, key locations
    ],
    "endings": [
      {
        "id": "<slug>",
        "label": "<Ending Title>",
        "desc": "<2 sentence description — may diverge from book for dramatic effect>",
        "prob": <integer — starting probability, all must sum to 100>,
        "color": "<hex>"
      }
      // 4-5 distinct possible endings
    ],
    "decisionPoints": [
      {
        "id": "dp1",
        "ep": <episode number>,
        "label": "<Short name for this decision>",
        "desc": "<The situation and question the player faces>",
        "options": ["<Option A>", "<Option B>", "<Option C>"]
      }
      // 3-5 major decision points spread across the series
    ]
  },

  "episodes": [
    {
      "id": "ep01",
      "num": 1,
      "title": "<Episode Title>",
      "status": "not_started",
      "segments": [
        {
          "id": "s01",
          "type": "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H",
          "scene": "<scene_slug>",
          "dur": <duration in seconds, 4-12>,
          "seed": <integer matching the scene's seed group>,
          "status": "pending",
          "chars": ["<char id>", ...],
          "bridge": <boolean>,
          "prompt": "<Full cinematic video generation prompt>",
          "clue": "<clue code or empty string>",
          "notes": "<production note or empty string>"
        }
        // 15-22 segments per scripted episode
      ]
    }
    // Generate episodes 1, 2, and 3 in full with complete segments
    // Then generate stub episodes for episodes 4 through total_episodes:
    // { "id":"ep04", "num":4, "title":"<title adapted from book>", "status":"not_started", "segments":[] }
    // Distribute the book's plot across all episode stubs logically
  ],

  "assets": [
    {
      "name": "<Asset Name>",
      "type": "logo"|"video"|"audio"|"image"|"doc",
      "format": "<FILE FORMAT>",
      "tags": ["<tag>", ...],
      "thumb": "<single emoji>",
      "size": "<estimated size>"
    }
    // 5-8 assets appropriate for this adaptation
  ]
}

SEGMENT TYPE GUIDE:
- A: Wide establishing shot (no characters). STYLE LOCK required.
- B: Character introduction or solo action shot. Needs @image1 CHARNAME: description.
- C: Dialogue scene. Include DIALOGUE: 'exact words' in prompt.
- D: Reaction / emotional beat. Close-up focus.
- E: Action or physical event.
- F: Detail / clue shot. EXTREME CLOSE-UP of object, document, symbol.
- G: Transition / corridor / atmosphere.
- H: Final frame / episode closing shot.

ADAPTATION RULES:
- Stay faithful to the source material's characters, relationships, and plot structure
- Distribute the book's story arc across all episodes evenly
- For the first 3 episodes, adapt the opening chapters into fully scripted scenes
- For stub episodes, derive titles and implied content from the book's plot progression
- If the book text is an excerpt, infer the full story arc from context and genre conventions
- Preserve the author's tone and themes in the cinematic prompts

Be bold, specific, and production-ready. This is a real production document.`;

async function callBookToProjectAPI(apiKey, bookText, totalEpisodes, epRuntimeSecs, onProgress) {
  onProgress("Analyzing book content…", 5);

  const userPrompt = `Adapt the following book/source material into a drama series.

ADAPTATION PARAMETERS:
- Total episodes: ${totalEpisodes}
- Episode runtime: ${epRuntimeSecs} seconds (${Math.round(epRuntimeSecs/60)} minutes each)

SOURCE MATERIAL:
---
${bookText.slice(0, 12000)}
---
${bookText.length > 12000 ? `\n[Note: Source material truncated to 12,000 characters for processing. Full text is ${bookText.length} characters.]` : ""}

Generate the complete project JSON following the schema exactly. Extract all characters, relationships, and world facts from the source material. Distribute the story across all ${totalEpisodes} episodes.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: BOOK_ADAPTER_SYSTEM,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  onProgress("Receiving adapted project…", 30);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${resp.status}`);
  }
  const data = await resp.json();
  const raw = data.content?.[0]?.text || "";
  onProgress("Parsing structure…", 75);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON returned — check API key or try again.");
  const parsed = JSON.parse(jsonMatch[0]);
  onProgress("Validating adaptation…", 92);
  return parsed;
}

async function callEpisodeGeneratorAPI(apiKey, state, fromEp, toEp, onProgress) {
  const proj = state.projects.find(p => p.id === state.activeProject);
  const allChars = state.bible.characters;
  const chars = allChars.map(c => `${c.name}[${c.id}]: ${c.role}`).join(", ");
  const charList = allChars.map(c => `  ${c.id}: ${c.name} (${c.role})`).join("\n");
  const existing = state.episodes.filter(e => e.project === state.activeProject && e.segments.length > 0);
  const styleRef = existing[0]?.segments[0]?.prompt?.split("\n")[0] || "";

  const prompt = `Generate episodes ${fromEp} through ${toEp} for the series "${proj?.name}" (${proj?.genre}).

CHARACTERS: ${chars}

VALID CHARACTER IDs (use these in every segment's chars array):
${charList}

STYLE REFERENCE FROM EPISODE 1: "${styleRef}"

BIBLE SUMMARY:
${state.bible.worldFacts.map(f => f.fact).join(" ")}

Return ONLY a JSON array of episode objects (not wrapped in any outer object):
[
  {
    "id": "ep${String(fromEp).padStart(2,"0")}",
    "num": ${fromEp},
    "title": "<title>",
    "status": "not_started",
    "segments": [ ... 15-20 segments using same schema as before ... ]
  },
  ...
]

Each episode needs 15-20 fully written segments. Follow the same segment type guide and prompt writing rules as the original bible. Continue the narrative logically from episode ${fromEp-1}.

CRITICAL RULE: The "chars" field in every segment MUST contain at least one valid character ID from the VALID CHARACTER IDs list. Never leave chars as an empty array. For establishing shots, assign the character most associated with that location.`;

  onProgress(`Generating episodes ${fromEp}–${toEp}…`, 20);
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: GENERATOR_SYSTEM,
      messages: [{ role: "user", content: prompt }]
    })
  });
  onProgress("Parsing episodes…", 75);
  const data = await resp.json();
  const raw = data.content?.[0]?.text || "";
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrMatch) throw new Error("No episode array returned.");
  const episodes = JSON.parse(arrMatch[0]);

  // Apply full cinematic enrichment to every segment in every generated episode
  const defaultCharId = allChars[0]?.id || null;
  const TYPE_CAMERA   = { A:"wide-shot", B:"medium-wide", C:"medium-shot", D:"close-up", E:"medium-shot", F:"extreme-close-up", G:"wide-shot", H:"wide-shot" };
  const TYPE_SHOT     = { A:"slow push-in", B:"static", C:"static", D:"rack focus", E:"handheld", F:"static", G:"slow pull-out", H:"slow pull-out" };
  const TYPE_LIGHTING = { A:"natural north-light", B:"natural north-light", C:"soft diffused", D:"soft diffused", E:"natural north-light", F:"practicals only", G:"natural north-light", H:"natural north-light" };

  // Build a shared scene-bg map across all generated episodes
  const sceneBgMap = {};
  // Seed from existing episodes first
  state.episodes.filter(e => e.segments?.length > 0).forEach(e =>
    e.segments.forEach(s => { if (s.scene && s.bg && !sceneBgMap[s.scene]) sceneBgMap[s.scene] = s.bg; })
  );

  return episodes.map(ep => {
    // First pass: collect bgs from this episode
    (ep.segments || []).forEach(s => { if (s.scene && s.bg && s.bg.length > 10 && !sceneBgMap[s.scene]) sceneBgMap[s.scene] = s.bg; });

    return {
      ...ep,
      segments: (ep.segments || []).map(seg => {
        // Chars
        let resolvedChars = seg.chars || [];
        if (resolvedChars.length > 0) {
          const validated = resolvedChars.flatMap(raw => {
            const byId   = allChars.find(c => c.id === raw);
            const byName = allChars.find(c => c.name?.toLowerCase() === raw?.toLowerCase());
            return byId ? [byId.id] : byName ? [byName.id] : [];
          });
          if (validated.length > 0) resolvedChars = validated;
        }
        if (resolvedChars.length === 0) {
          const text = ((seg.prompt || "") + " " + (seg.notes || "")).toLowerCase();
          const matched = allChars.filter(c => c.name && text.includes(c.name.split(" ")[0].toLowerCase())).map(c => c.id);
          resolvedChars = matched.length > 0 ? matched : defaultCharId ? [defaultCharId] : [];
        }
        // Cinematic fields
        const type = seg.type || "A";
        const bg       = (seg.bg && seg.bg.length > 10 && !seg.bg.startsWith("Scene")) ? seg.bg : (sceneBgMap[seg.scene] || seg.bg || "");
        const camera   = (seg.camera   && !seg.camera.includes("|"))   ? seg.camera   : TYPE_CAMERA[type]   || "medium-shot";
        const shotType = (seg.shotType && !seg.shotType.includes("|"))  ? seg.shotType : TYPE_SHOT[type]     || "static";
        const lighting = (seg.lighting && !seg.lighting.includes("|"))  ? seg.lighting : TYPE_LIGHTING[type] || "soft diffused";
        const mood     = (seg.mood && seg.mood.length > 3 && !seg.mood.includes("e.g")) ? seg.mood : "";
        if (seg.scene && bg && !sceneBgMap[seg.scene]) sceneBgMap[seg.scene] = bg;
        return { ...seg, chars: resolvedChars, bg, camera, shotType, lighting, mood };
      })
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// JIMENG / SEEDANCE 2.0 — VIDEO GENERATION ENGINE
// Real API integration with polling + auto-load results
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// PROMPT ASSEMBLY ENGINE
// Compiles structured segment fields + character visual locks
// into the final Jimeng/Seedance prompt sent to the API
// ═══════════════════════════════════════════════════════════════════

// Camera angle presets
const CAMERA_ANGLES = [
  "eye-level", "low-angle", "high-angle", "bird's-eye", "dutch-angle",
  "over-the-shoulder", "POV", "two-shot", "extreme-close-up", "close-up",
  "medium-shot", "medium-wide", "wide-shot", "extreme-wide", "tracking",
  "dolly-in", "dolly-out", "pan", "tilt", "crane-up", "crane-down",
];

// Shot type presets
const SHOT_TYPES = [
  "static", "slow push-in", "slow pull-out", "handheld", "steadicam",
  "rack focus", "whip pan", "slow zoom", "circular orbit", "floating",
];

// Lighting mood presets
const LIGHTING_MOODS = [
  "natural north-light", "warm golden-hour", "cool blue-hour", "harsh midday",
  "candlelight", "neon-glow", "fluorescent cold", "soft diffused", "chiaroscuro",
  "silhouette", "rim-lit", "three-point studio", "practicals only",
];

// Assemble all segment cinematic fields + character visual locks into final prompt
function buildFinalPrompt(seg, allChars) {
  const parts = [];

  // 1. Style lock / location prefix (bg field)
  if (seg.bg) parts.push(seg.bg);

  // 2. Character visual locks — injected for every character in scene
  if (seg.chars && seg.chars.length > 0 && allChars) {
    const charLocks = seg.chars
      .map(id => allChars.find(c => c.id === id))
      .filter(Boolean)
      .map(c => {
        const lock = c.visualLock || c.appearance || "";
        if (!lock) return null;
        return `CHARACTER[${c.name}]: ${lock.substring(0, 200)}`;
      })
      .filter(Boolean);
    if (charLocks.length > 0) parts.push(charLocks.join(" | "));
  }

  // 3. Camera angle + shot type
  const camParts = [seg.camera, seg.shotType].filter(Boolean);
  if (camParts.length > 0) parts.push(`Camera: ${camParts.join(", ")}.`);

  // 4. Lighting
  if (seg.lighting) parts.push(`Lighting: ${seg.lighting}.`);

  // 5. Mood / atmosphere
  if (seg.mood) parts.push(`Mood: ${seg.mood}.`);

  // 6. Core action / dialogue prompt
  if (seg.prompt) parts.push(seg.prompt);

  // 7. Bridge flag
  if (seg.bridge) parts.push("BRIDGE: Match first frame to last frame of previous clip. Use image1.");

  return parts.join(" ");
}

const JIMENG_BASE = "https://visual.volcengineapi.com";

// Submit a single segment prompt to Seedance 2.0
// Returns { taskId } — poll for result
async function jimengSubmitSegment({ apiKey, prompt, model="seedance_v2", resolution="720p", aspect="9:16", seed, imageRef=null, charAvatarUrls=[] }) {
  // Build image_urls: bridge frame first, then character avatars (max 3 total)
  // Seedance v2 uses image_urls[0] as the reference/style anchor
  const allImageUrls = [
    ...(imageRef ? [imageRef] : []),
    // Only include URL-format avatar refs (not base64 — Jimeng needs hosted URLs)
    ...charAvatarUrls.filter(u => u && u.startsWith("http")).slice(0, imageRef ? 2 : 3),
  ].slice(0, 3);

  const body = {
    req_key: model,
    prompt,
    duration: 5,
    width:  aspect==="9:16"?720:aspect==="1:1"?720:1280,
    height: aspect==="9:16"?1280:aspect==="1:1"?720:720,
    ...(seed ? { seed } : {}),
    ...(allImageUrls.length > 0 ? { image_urls: allImageUrls } : {}),
  };
  const resp = await fetch(`${JIMENG_BASE}/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Auth is via Volcengine HMAC-SHA256 signature in production.
      // In development, pass the key directly via proxy or Supabase Edge Function.
      "Authorization": `Bearer ${apiKey}`,
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error(`Jimeng submit failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  if (data.code !== 10000) throw new Error(`Jimeng error: ${data.message || JSON.stringify(data)}`);
  return { taskId: data.data?.task_id };
}

// Poll for task completion — returns { status, videoUrl } or throws
async function jimengPollTask({ apiKey, taskId }) {
  const resp = await fetch(`${JIMENG_BASE}/?Action=CVSync2AsyncGetResult&Version=2022-08-31`, {
    method: "POST",
    headers: { "Content-Type":"application/json", "Authorization":`Bearer ${apiKey}`, "X-Api-Key": apiKey },
    body: JSON.stringify({ task_id: taskId })
  });
  if (!resp.ok) throw new Error(`Jimeng poll failed: ${resp.status}`);
  const data = await resp.json();
  if (data.code !== 10000) throw new Error(data.message || "Poll error");
  const s = data.data?.status;
  if (s === "done" || s === "finished" || s === "succeed") {
    const url = data.data?.video_url || data.data?.videos?.[0]?.url;
    if (!url) throw new Error("Done but no video URL returned");
    return { status:"done", videoUrl: url };
  }
  if (s === "failed" || s === "error") throw new Error(data.data?.message || "Generation failed");
  return { status: s || "processing" };
}

// Full generate-and-poll loop for one segment
// Calls dispatch to update status in real-time
async function generateSegmentVideo({ apiKey, seg, ep, model, resolution, aspect, dispatch, jobId, allChars=[] }) {
  dispatch({ type:"UPDATE_SEG_STATUS", id:seg.id, status:"queued" });
  dispatch({ type:"UPDATE_VIDEO_JOB", id:jobId, patch:{ status:"submitting" } });

  // Assemble final prompt from all cinematic fields + character visual locks
  const finalPrompt = buildFinalPrompt(seg, allChars) || seg.prompt || "";

  let taskId;
  try {
    // Collect hosted avatar URLs for characters in this segment
    // Base64 avatars can't be sent to Jimeng (needs hosted URLs) — only pass faceRef (URLs)
    const charAvatarUrls = (seg.chars || [])
      .map(id => allChars.find(c => c.id === id))
      .filter(Boolean)
      .map(c => c.faceRef || "")   // faceRef is a hosted URL; avatarUrl may be base64
      .filter(u => u && u.startsWith("http"));

    const result = await jimengSubmitSegment({
      apiKey, prompt: finalPrompt, model, resolution, aspect,
      seed: seg.seed,
      imageRef: seg.bridge ? seg.bridgeImageUrl : null,
      charAvatarUrls,
    });
    taskId = result.taskId;
    dispatch({ type:"UPDATE_SEG_STATUS", id:seg.id, status:"running", taskId });
    dispatch({ type:"UPDATE_VIDEO_JOB", id:jobId, patch:{ status:"running", taskId } });
  } catch(err) {
    dispatch({ type:"UPDATE_SEG_STATUS", id:seg.id, status:"failed" });
    dispatch({ type:"UPDATE_VIDEO_JOB", id:jobId, patch:{ status:"failed", error:err.message, finishedAt: new Date().toISOString() } });
    return;
  }

  // Poll every 5 seconds — Seedance 2.0 typical latency 15–90s
  const maxAttempts = 60;
  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
    try {
      const poll = await jimengPollTask({ apiKey, taskId });
      if (poll.status === "done") {
        dispatch({ type:"UPDATE_SEG_STATUS", id:seg.id, status:"done", videoUrl: poll.videoUrl });
        dispatch({ type:"UPDATE_VIDEO_JOB", id:jobId, patch:{ status:"done", videoUrl: poll.videoUrl, finishedAt: new Date().toISOString() } });
        return;
      }
      // Still processing — update progress note
      dispatch({ type:"UPDATE_VIDEO_JOB", id:jobId, patch:{ progressNote:`Generating… attempt ${attempts}/${maxAttempts}` } });
    } catch(err) {
      dispatch({ type:"UPDATE_SEG_STATUS", id:seg.id, status:"failed" });
      dispatch({ type:"UPDATE_VIDEO_JOB", id:jobId, patch:{ status:"failed", error:err.message, finishedAt: new Date().toISOString() } });
      return;
    }
  }
  // Timeout
  dispatch({ type:"UPDATE_SEG_STATUS", id:seg.id, status:"failed" });
  dispatch({ type:"UPDATE_VIDEO_JOB", id:jobId, patch:{ status:"failed", error:"Timeout after 5 minutes", finishedAt: new Date().toISOString() } });
}

// Queue all pending segments for an episode — up to maxConcurrent at a time
async function generateEpisodeVideos({ state, dispatch, epId, maxConcurrent=3 }) {
  const ep = state.episodes.find(e => e.id === epId);
  if (!ep) return;
  const segments = ep.segments.filter(s => s.status === "pending" || s.status === "failed");
  if (!segments.length) return;
  if (!state.jimengKey) throw new Error("No Jimeng API key. Set it in Settings → Generation.");

  const { jimengKey, jimengModel, jimengRes, jimengAspect } = state;
  const queue = [...segments];

  // Add all to video jobs immediately
  queue.forEach(seg => {
    const jobId = `vj_${seg.id}_${Date.now()}`;
    dispatch({ type:"ADD_VIDEO_JOB", job:{
      id: jobId, segId: seg.id, epId, projectId: state.activeProject,
      status:"queued", taskId:null, videoUrl:null, error:null,
      segTitle: seg.notes || seg.prompt.substring(0,50),
      startedAt: new Date().toISOString(), finishedAt:null,
    }});
    seg._jobId = jobId;
  });

  // Process in batches of maxConcurrent
  for (let i = 0; i < queue.length; i += maxConcurrent) {
    const batch = queue.slice(i, i + maxConcurrent);
    await Promise.all(batch.map(seg =>
      generateSegmentVideo({ apiKey:jimengKey, seg, ep, model:jimengModel, resolution:jimengRes, aspect:jimengAspect, dispatch, jobId:seg._jobId, allChars:state.bible.characters })
    ));
  }
}

// ── AUTO-GENERATE: full pipeline from seed story → episodes → video
// Step 1: generate episode content (Claude API) — returns fresh segments directly
// Step 2: dispatch segments to state
// Step 3: submit all fresh segments to Jimeng immediately (no stale-state bug)
// Returns { segments, videoSubmitted: bool }
async function autoGenerateEpisode({ state, dispatch, epId, onStatus }) {
  const ep = state.episodes.find(e => e.id === epId);
  const proj = state.projects.find(p => p.id === state.activeProject);
  if (!ep || !proj) return { segments: [], videoSubmitted: false };

  let segments = ep.segments || [];

  // Step 1: Generate segments with Claude if missing
  if (!segments.length) {
    if (!state.apiKey) throw new Error("No Claude API key — set it in Settings → API Keys.");
    onStatus?.("Writing episode with AI…", 8);

    const chars = state.bible.characters
      .map(c => {
        const lock = c.visualLock ? ` VISUAL LOCK: ${c.visualLock}` : "";
        return `${c.name}[${c.id}]: ${c.role}.${lock}`;
      })
      .join("\n");
    const wf = state.bible.worldFacts?.map(f => f.fact).join(" ") || "";
    const prevEps = state.episodes
      .filter(e => e.project === state.activeProject && e.num < ep.num && e.segments.length > 0)
      .slice(-3)
      .map(e => `EP${e.num} "${e.title}": ${e.notes || ""}`)
      .join("\n");

    const charList = state.bible.characters.map(c =>
      `  ${c.id}: ${c.name} (${c.role})`
    ).join("\n");

    // Build scene bg map — bible sceneBackgrounds first, then existing episode segments
    const existingSceneBg = { ...(state.bible.sceneBackgrounds || {}) };
    state.episodes
      .filter(e => e.project === state.activeProject && e.segments?.length > 0)
      .forEach(e => e.segments.forEach(s => {
        if (s.scene && s.bg && s.bg.length > 10 && !existingSceneBg[s.scene]) existingSceneBg[s.scene] = s.bg;
      }));
    const sceneBgHint = Object.keys(existingSceneBg).length > 0
      ? `\nESTABLISHED SCENE BACKGROUNDS (reuse these exact bg strings for these scene slugs):\n${Object.entries(existingSceneBg).map(([k,v]) => `  ${k}: "${v}"`).join('\n')}`
      : '';

    // Visual grammar from bible
    const vg = state.bible.visualGrammar || {};
    const visualGrammarHint = vg.seriesGrade
      ? `\nSERIES VISUAL GRAMMAR:\n  Color grade: ${vg.seriesGrade}\n  Lighting rule: ${vg.seriesLighting || ""}\n  Camera rule: ${vg.seriesCamera || ""}`
      : '';

    const genPrompt = `You are a cinematic video director and AI production system. Generate fully production-ready Seedance 2.0 video segments for immediate submission to the video generation API.

SERIES: "${proj.name}" (${proj.genre})
EPISODE ${ep.num}: "${ep.title}"
EPISODE BRIEF: ${ep.notes || "Continue the narrative naturally. Maintain visual and emotional continuity from previous episodes."}

CHARACTERS (visual locks included — inject these into every segment where character appears):
${chars}

VALID CHARACTER IDs (use EXACTLY these IDs in chars arrays — never use names):
${charList}

WORLD:
${wf}
${visualGrammarHint}
${sceneBgHint}

PREVIOUS EPISODES:
${prevEps || "This is the first episode."}

─────────────────────────────────────────────────────────
OUTPUT: Return ONLY a valid JSON array. No markdown. No commentary. No wrapper object.
─────────────────────────────────────────────────────────

Generate 15-20 segments. Each segment must be 100% ready to paste into Jimeng with zero editing needed.

EXACT SCHEMA — every field required, no empty strings allowed:
{
  "id": "s${String(ep.num).padStart(2,"0")}_01",
  "type": "A",
  "scene": "design_floor",
  "dur": 6,
  "seed": 4721,
  "status": "pending",
  "chars": ["char_vivienne"],
  "bridge": false,
  "bg": "Maison Lumière design floor, 8th arrondissement Paris. Ivory plaster walls catching cold north-facing window light. Raw oak floorboards. Dress mannequins at room edges. Film grain texture. Champagne and ivory color grade.",
  "camera": "medium-shot",
  "shotType": "slow push-in",
  "lighting": "natural north-light",
  "mood": "tense, suspended, weight of history",
  "prompt": "Vivienne Alastair-Voss stands at the center mannequin, fingertips resting on the collar. She does not move. The room waits.",
  "clue": "",
  "notes": "Opening beat — establish Vivienne's relationship to the collar before anyone else enters"
}

FIELD RULES — read carefully:

bg (CRITICAL for visual consistency):
  • 2-3 sentences. Physical materials, dominant colors, light source, atmosphere.
  • Use the SAME bg text for every segment sharing the same scene slug.
  • Good: "Maison Lumière archive. Sub-basement. Grey concrete. Fluorescent tube casting a cold clinical light. Steel shelving. Dust and time."
  • Bad: "The archive room" (too vague for video generation)

camera — pick ONE:
  eye-level | low-angle | high-angle | bird's-eye | dutch-angle |
  over-the-shoulder | POV | extreme-close-up | close-up |
  medium-shot | medium-wide | wide-shot | extreme-wide | tracking

shotType — pick ONE:
  static | slow push-in | slow pull-out | handheld | steadicam |
  rack focus | whip pan | slow zoom | circular orbit | floating

lighting — pick ONE:
  natural north-light | warm golden-hour | cool blue-hour | harsh midday |
  candlelight | neon-glow | fluorescent cold | soft diffused |
  chiaroscuro | silhouette | rim-lit | three-point studio | practicals only

mood — 3-6 words, emotionally specific:
  Good: "cold bureaucratic inevitability", "fragile suspension before rupture", "intimacy with threat underneath"
  Bad: "dramatic", "tense" (too vague)

prompt — the action only (bg/camera/lighting are separate):
  • 2-3 sentences max. What the character does or says. Sensory specifics.
  • For dialogue segments: end with DIALOGUE: 'exact words spoken'
  • Good: "Raphael lifts the collar from the mannequin with both hands. Turns it slowly in the north light. His expression does not change. DIALOGUE: 'Who taught you this stitch?'"
  • Bad: "Raphael looks at the collar in the well-lit room" (no camera direction needed here, already specified above)

SEGMENT PROGRESSION RULES:
  • Episode opens with 2-3 establishing/atmosphere segments before any character dialogue
  • Vary camera angles — never use same camera+shotType combo more than twice in a row
  • Seed consistency: ALL segments sharing same scene slug get the same seed number
  • Bridge flag: set bridge=true when the action continues directly from previous segment (no time cut)
  • Episode must end with a closing frame (type H) that creates forward tension or unanswered question
  • chars: NEVER empty. For location-only shots assign the character who owns that location.

TYPE GUIDE:
  A=Establishing/atmosphere  B=Character entrance  C=Dialogue  D=Reaction/close-up
  E=Action/physical  F=Object/detail/clue  G=Transition/cutaway  H=Episode closing frame`;

    onStatus?.("Generating segments…", 15);
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        messages: [{ role: "user", content: genPrompt }]
      })
    });
    if (!resp.ok) throw new Error(`Claude API error ${resp.status}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message || "Claude API error");
    const raw = data.content?.[0]?.text || "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("AI returned no segment array. Response: " + raw.substring(0, 200));
    segments = JSON.parse(match[0]);
    if (!segments.length) throw new Error("Generated 0 segments.");

    // ── POST-PARSE: Fix chars + fill any missing cinematic fields
    const allChars = state.bible.characters;
    const defaultCharId = allChars[0]?.id || null;

    // Smart defaults by segment type
    const TYPE_CAMERA   = { A:"wide-shot", B:"medium-wide", C:"medium-shot", D:"close-up", E:"medium-shot", F:"extreme-close-up", G:"wide-shot", H:"wide-shot" };
    const TYPE_SHOT     = { A:"slow push-in", B:"static", C:"static", D:"rack focus", E:"handheld", F:"static", G:"slow pull-out", H:"slow pull-out" };
    const TYPE_LIGHTING = { A:"natural north-light", B:"natural north-light", C:"soft diffused", D:"soft diffused", E:"natural north-light", F:"practicals only", G:"natural north-light", H:"natural north-light" };

    // Build scene-bg map from this episode's own segments (so same-scene segs share bg)
    const sceneBgMap = {};
    segments.forEach(s => { if (s.scene && s.bg && !sceneBgMap[s.scene]) sceneBgMap[s.scene] = s.bg; });
    // Also pull from existing scripted episodes
    state.episodes
      .filter(e => e.project === state.activeProject && e.segments?.length > 0)
      .forEach(e => e.segments.forEach(s => {
        if (s.scene && s.bg && !sceneBgMap[s.scene]) sceneBgMap[s.scene] = s.bg;
      }));

    segments = segments.map(seg => {
      // 1. Chars: validate IDs, fall back to name-match, fall back to text-scan
      let resolvedChars = seg.chars || [];
      if (resolvedChars.length > 0) {
        const validated = resolvedChars.flatMap(raw => {
          const byId   = allChars.find(c => c.id === raw);
          const byName = allChars.find(c => c.name?.toLowerCase() === raw?.toLowerCase());
          return byId ? [byId.id] : byName ? [byName.id] : [];
        });
        if (validated.length > 0) resolvedChars = validated;
      }
      if (resolvedChars.length === 0) {
        const text = ((seg.prompt || "") + " " + (seg.notes || "")).toLowerCase();
        const matched = allChars.filter(c => c.name && text.includes(c.name.split(" ")[0].toLowerCase())).map(c => c.id);
        resolvedChars = matched.length > 0 ? matched : defaultCharId ? [defaultCharId] : [];
      }

      // 2. bg: inherit from same scene slug, or keep what AI provided
      const bg = (seg.bg && seg.bg.length > 10 && !seg.bg.startsWith("Scene environment"))
        ? seg.bg
        : (sceneBgMap[seg.scene] || seg.bg || "");
      // Register this bg for subsequent same-scene segments
      if (seg.scene && bg && !sceneBgMap[seg.scene]) sceneBgMap[seg.scene] = bg;

      // 3. Camera/shot/lighting: keep AI value if real, else apply type-based smart default
      const type = seg.type || "A";
      const camera   = (seg.camera   && !seg.camera.includes("|"))   ? seg.camera   : (TYPE_CAMERA[type]   || "medium-shot");
      const shotType = (seg.shotType && !seg.shotType.includes("|"))  ? seg.shotType : (TYPE_SHOT[type]     || "static");
      const lighting = (seg.lighting && !seg.lighting.includes("|"))  ? seg.lighting : (TYPE_LIGHTING[type] || "soft diffused");
      const mood     = (seg.mood && seg.mood.length > 3 && !seg.mood.includes("e.g")) ? seg.mood : "";

      return { ...seg, chars: resolvedChars, bg, camera, shotType, lighting, mood };
    });

    onStatus?.(`${segments.length} segments generated. Saving…`, 45);
    dispatch({ type: "UPDATE_EPISODE", id: ep.id, patch: { segments, status: "in_progress" } });
    await new Promise(r => setTimeout(r, 300)); // let React render
  }

  // Step 2: Submit all pending segments to Jimeng
  if (!state.jimengKey) {
    onStatus?.(`${segments.length} segments ready. No Jimeng key — use Prompt Sheet to generate manually.`, 100);
    return { segments, videoSubmitted: false };
  }

  const pending = segments.filter(s => s.status === "pending" || s.status === "failed");
  if (!pending.length) {
    onStatus?.("All segments already generated.", 100);
    return { segments, videoSubmitted: false };
  }

  onStatus?.(`Submitting ${pending.length} segments to Seedance 2.0…`, 50);
  const { jimengKey, jimengModel, jimengRes, jimengAspect } = state;

  // Register all jobs first
  pending.forEach(seg => {
    const jobId = `vj_${seg.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    seg._jobId = jobId;
    dispatch({ type: "ADD_VIDEO_JOB", job: {
      id: jobId, segId: seg.id, epId, projectId: state.activeProject,
      status: "queued", taskId: null, videoUrl: null, error: null,
      segTitle: seg.notes || seg.prompt.substring(0, 55),
      startedAt: new Date().toISOString(), finishedAt: null,
    }});
  });

  // Fire all in batches of 3 — don't await so UI stays live
  const concurrency = 3;
  const fakeEp = { ...ep, segments }; // use fresh segments, not stale ep.segments
  const runBatch = async () => {
    for (let i = 0; i < pending.length; i += concurrency) {
      const batch = pending.slice(i, i + concurrency);
      const done = i;
      onStatus?.(`Generating videos… ${done}/${pending.length}`, 50 + Math.round((done / pending.length) * 45));
      await Promise.all(batch.map(seg =>
        generateSegmentVideo({ apiKey: jimengKey, seg, ep: fakeEp, model: jimengModel, resolution: jimengRes, aspect: jimengAspect, dispatch, jobId: seg._jobId, allChars: state.bible.characters })
      ));
    }
    onStatus?.("All videos submitted — loading results automatically.", 100);
  };
  runBatch(); // intentionally non-blocking so modal can close

  return { segments, videoSubmitted: true };
}

// Build the manual copy-paste prompt sheet for an episode
function buildSegmentPromptSheet(ep, proj, allChars=[]) {
  const segments = ep.segments || [];
  if (!segments.length) return "No segments generated yet.";

  const lines = [
    `═══ ${proj?.name || "Series"} · EP${String(ep.num).padStart(3,"0")} · ${ep.title} ═══`,
    `Total segments: ${segments.length} · Total duration: ${segments.reduce((a,s)=>a+s.dur,0)}s`,
    `Generated: ${new Date().toLocaleDateString()}`,
    "",
  ];

  segments.forEach((s, i) => {
    lines.push(`── SEGMENT ${String(i+1).padStart(2,"0")} / ${s.id} ──────────────────`);
    lines.push(`Type: ${s.type} (${SEG_TYPE_NAMES[s.type]||s.type})  Duration: ${s.dur}s  Seed: ${s.seed||"auto"}`);
    if (s.scene)    lines.push(`Scene: ${s.scene}`);
    if (s.camera)   lines.push(`Camera: ${s.camera}${s.shotType ? " · " + s.shotType : ""}`);
    if (s.lighting) lines.push(`Lighting: ${s.lighting}`);
    if (s.mood)     lines.push(`Mood: ${s.mood}`);
    lines.push("");

    // Character visual locks
    const charLocks = (s.chars||[])
      .map(id => allChars.find(c=>c.id===id))
      .filter(Boolean)
      .filter(c => c.visualLock || c.appearance)
      .map(c => `  CHARACTER[${c.name}]: ${(c.visualLock || c.appearance).substring(0,200)}`);
    if (charLocks.length > 0) {
      lines.push("CHARACTER VISUAL LOCKS:");
      charLocks.forEach(l => lines.push(l));
      lines.push("");
    }

    lines.push("ASSEMBLED PROMPT (paste this into Jimeng):");
    lines.push("┌─────────────────────────────────────────");
    lines.push(buildFinalPrompt(s, allChars) || "(no prompt)");
    lines.push("└─────────────────────────────────────────");

    if (s.bridge) lines.push("⚑ BRIDGE: Use last frame of previous segment as @image1");
    if (s.clue)   lines.push(`◈ Clue: ${s.clue}`);
    if (s.notes)  lines.push(`Note: ${s.notes}`);
    lines.push("");
  });

  lines.push("═══ END OF EPISODE ═══");
  lines.push("Seed tip: Use the SAME seed for all segments in the same physical scene location.");
  lines.push("Bridge tip: For BRIDGE segments, screenshot the last frame of the previous clip and upload as @image1.");
  return lines.join("\n");
}

// ── VIDEO QUEUE PANEL — shown in episode view
function VideoQueuePanel({ state, dispatch, epId }) {
  const jobs = state.videoJobs.filter(j => j.epId === epId);
  if (!jobs.length) return null;

  const done   = jobs.filter(j=>j.status==="done").length;
  const failed = jobs.filter(j=>j.status==="failed").length;
  const active = jobs.filter(j=>j.status==="running"||j.status==="submitting").length;
  const queued = jobs.filter(j=>j.status==="queued").length;

  return (
    <div style={{background:"var(--bg2)",border:"1px solid var(--ln)",borderRadius:11,padding:14,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:17,color:"var(--gold2)"}}>Video Generation Queue</span>
          {active>0&&<span className="badge bd-blue"><span className="badge-dot pulse"/>Generating {active}</span>}
        </div>
        <div style={{display:"flex",gap:8,fontSize:14}}>
          <span style={{color:"var(--green2)"}}>✓ {done}</span>
          {failed>0&&<span style={{color:"var(--red2)"}}>✗ {failed}</span>}
          {queued>0&&<span style={{color:"var(--t3)"}}>⏳ {queued}</span>}
          <button className="btn btn-ghost btn-sm" style={{fontSize:13}} onClick={()=>jobs.filter(j=>j.status==="done"||j.status==="failed").forEach(j=>dispatch({type:"REMOVE_VIDEO_JOB",id:j.id}))}>Clear done</button>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:200,overflowY:"auto"}}>
        {jobs.map(j=>(
          <div key={j.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:6,background:"var(--bg3)",border:`1px solid ${j.status==="done"?"rgba(74,173,117,.2)":j.status==="failed"?"var(--bR)":j.status==="running"?"rgba(72,120,200,.2)":"var(--ln2)"}`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:j.status==="done"?"var(--green)":j.status==="failed"?"var(--red)":j.status==="running"?"var(--blue)":"var(--t4)",flexShrink:0,...(j.status==="running"?{animation:"pulse 1s infinite"}:{})}}/>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,color:"var(--t3)",width:60,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis"}}>{j.segId}</span>
            <span style={{flex:1,fontSize:14,color:"var(--t2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.segTitle}</span>
            {j.progressNote&&j.status==="running"&&<span style={{fontSize:13,color:"var(--t3)"}}>{j.progressNote}</span>}
            {j.status==="done"&&j.videoUrl&&<a href={j.videoUrl} target="_blank" rel="noreferrer" style={{fontSize:13,color:"var(--green2)"}}>▶ View</a>}
            {j.status==="failed"&&<span style={{fontSize:13,color:"var(--red2)",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis"}} title={j.error}>{j.error}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SEGMENT PROMPT COPY SHEET MODAL — Manual mode
function copyText(text) {
  // Robust copy: tries clipboard API first, falls back to execCommand
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => {
      execCommandCopy(text);
    });
  }
  execCommandCopy(text);
  return Promise.resolve();
}
function execCommandCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand("copy"); } catch(e) { console.warn("copy failed", e); }
  document.body.removeChild(ta);
}

function SegmentPromptSheetModal({ ep, proj, allChars=[], onClose, dispatch }) {
  const [copied, setCopied]         = useState(false);
  const [copiedSeg, setCopiedSeg]   = useState(null);
  const [mode, setMode]             = useState("individual");
  const [expandedSeg, setExpandedSeg] = useState(null);
  const [localSegs, setLocalSegs]   = useState(() => {
    const m = {};
    (ep.segments || []).forEach(s => { m[s.id] = { ...s }; });
    return m;
  });
  const [videoUrls, setVideoUrls]   = useState(() => {
    const m = {};
    (ep.segments || []).forEach(s => { if (s.videoUrl) m[s.id] = s.videoUrl; });
    return m;
  });
  const [savedIds, setSavedIds]     = useState({});

  const segments  = ep.segments || [];
  const doneCount = segments.filter(s => s.status === "done" || savedIds[s.id]).length;

  const updateField = (segId, field, value) => {
    dispatch({ type:"UPDATE_SEGMENT", id:segId, patch:{ [field]: value } });
    setLocalSegs(prev => ({ ...prev, [segId]: { ...prev[segId], [field]: value } }));
  };

  const getAssembled = (segId) => {
    const s = localSegs[segId] || {};
    return buildFinalPrompt(s, allChars) || s.prompt || "";
  };

  const doCopy = (text, onDone) => {
    copyText(text);
    onDone();
  };

  const copyAll = () => {
    const fakeEp = { ...ep, segments: segments.map(s => localSegs[s.id] || s) };
    doCopy(buildSegmentPromptSheet(fakeEp, proj, allChars), () => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  };

  const copySeg = (segId) => {
    doCopy(getAssembled(segId), () => {
      setCopiedSeg(segId); setTimeout(() => setCopiedSeg(null), 2500);
    });
  };

  const saveVideoUrl = (segId, url) => {
    if (!url.trim()) return;
    dispatch({ type:"UPDATE_SEG_STATUS", id:segId, status:"done", videoUrl:url.trim() });
    setSavedIds(s => ({ ...s, [segId]: true }));
  };

  const isComplete = (s) => !!(s.bg && s.camera && s.shotType && s.lighting && s.mood && s.prompt);

  // Icon tags for cinematic fields — compact single row
  const CineTag = ({ icon, val, dim }) => val ? (
    <span style={{
      fontSize:12, padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap",
      background:"var(--bg3)", border:"1px solid var(--ln2)", color: dim ? "var(--t4)" : "var(--t2)"
    }}>{icon} {val}</span>
  ) : null;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"var(--bg2)", border:"1px solid rgba(201,168,76,.3)",
        borderRadius:14, maxWidth:900, width:"97%", maxHeight:"94vh",
        display:"flex", flexDirection:"column", overflow:"hidden"
      }}>

        {/* ── HEADER BAR */}
        <div style={{
          padding:"12px 18px", borderBottom:"1px solid var(--ln)", flexShrink:0,
          display:"flex", justifyContent:"space-between", alignItems:"center", gap:12
        }}>
          <div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",fontWeight:700}}>
              EP{String(ep.num).padStart(3,"0")} — {ep.title}
            </div>
            <div style={{fontSize:14,color:"var(--t4)",marginTop:1}}>
              {segments.length} segments · {doneCount} done · click any prompt to select all
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",background:"var(--bg3)",borderRadius:7,padding:2,border:"1px solid var(--ln)"}}>
              <button className={`btn btn-sm ${mode==="individual"?"btn-gold":""}`}
                style={{borderRadius:5,padding:"3px 12px",fontSize:14}}
                onClick={()=>setMode("individual")}>Segments</button>
              <button className={`btn btn-sm ${mode==="full"?"btn-gold":""}`}
                style={{borderRadius:5,padding:"3px 12px",fontSize:14}}
                onClick={()=>setMode("full")}>Full Sheet</button>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={copyAll}>
              {copied ? "✓ Copied" : "📋 Copy All"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── FULL SHEET MODE */}
        {mode === "full" ? (
          <textarea readOnly
            value={buildSegmentPromptSheet({ ...ep, segments: segments.map(s => localSegs[s.id]||s) }, proj, allChars)}
            onClick={e => e.target.select()}
            style={{flex:1,fontFamily:"JetBrains Mono,monospace",fontSize:13,lineHeight:1.75,
              background:"var(--bg3)",border:"none",padding:"16px 20px",color:"var(--t2)",
              resize:"none",outline:"none",cursor:"text"}}
          />
        ) : (

        /* ── INDIVIDUAL SEGMENTS MODE */
        <div style={{overflowY:"auto",flex:1,padding:"20px 24px",display:"flex",flexDirection:"column",gap:12}}>
          {segments.map((origSeg, i) => {
            const s         = localSegs[origSeg.id] || origSeg;
            const assembled = getAssembled(origSeg.id);
            const complete  = isComplete(s);
            const hasDone   = origSeg.status === "done" || savedIds[origSeg.id];
            const open      = expandedSeg === origSeg.id;
            const segChars  = (s.chars||[]).map(id => allChars.find(c=>c.id===id)).filter(Boolean);

            const accentColor = hasDone ? "#4aad75" : complete ? "rgba(201,168,76,.8)" : "rgba(200,120,56,.7)";

            return (
              <div key={origSeg.id} style={{
                background:"var(--bg3)",
                border:`1px solid ${hasDone?"rgba(74,173,117,.25)":complete?"rgba(201,168,76,.15)":"rgba(200,120,56,.15)"}`,
                borderRadius:10, overflow:"hidden",
                borderLeft:`3px solid ${accentColor}`,
              }}>

                {/* ── SINGLE HEADER ROW: everything on one line */}
                <div style={{
                  display:"flex", alignItems:"center", gap:10, padding:"9px 14px",
                  background:"var(--bg4)", borderBottom:"1px solid var(--ln2)",
                }}>
                  {/* Number */}
                  <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--t4)",width:20,flexShrink:0,fontWeight:600}}>
                    {String(i+1).padStart(2,"0")}
                  </span>

                  {/* Type badge */}
                  <SC.SegType t={s.type}/>

                  {/* Cinematic tags — compact pills */}
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",flex:1}}>
                    {[
                      {icon:"📷", val:s.camera},
                      {icon:"🎬", val:s.shotType},
                      {icon:"💡", val:s.lighting},
                    ].filter(t=>t.val).map(t=>(
                      <span key={t.icon} style={{
                        display:"flex",alignItems:"center",gap:3,
                        fontSize:12,color:"var(--t3)",
                        background:"var(--bg)",border:"1px solid var(--ln2)",
                        borderRadius:4,padding:"2px 7px",whiteSpace:"nowrap",
                      }}>
                        <span style={{opacity:.5}}>{t.icon}</span> {t.val}
                      </span>
                    ))}
                    {s.mood && (
                      <span style={{fontSize:12,color:"var(--t4)",fontStyle:"italic",alignSelf:"center",paddingLeft:2}}>
                        {s.mood.length > 32 ? s.mood.slice(0,32)+"…" : s.mood}
                      </span>
                    )}
                  </div>

                  {/* Right: chars + status + seed + edit */}
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    {segChars.map(c=>(
                      <span key={c.id} style={{
                        fontSize:12,padding:"2px 6px",borderRadius:4,
                        background:c.color+"18",color:c.color,
                        whiteSpace:"nowrap",fontWeight:600,
                      }}>
                        {c.name.split(" ")[0]}{c.visualLock?" 🔒":""}
                      </span>
                    ))}
                    {hasDone && origSeg.videoUrl && (
                      <a href={origSeg.videoUrl} target="_blank" rel="noreferrer"
                        className="btn btn-green btn-sm" style={{fontSize:13,padding:"2px 10px"}}>▶</a>
                    )}
                    <span style={{fontSize:12,color:hasDone?"var(--green2)":"var(--t4)"}}>
                      {hasDone ? "✓ done" : `${s.dur}s`}
                    </span>
                    <button
                      style={{fontSize:12,color:open?"var(--gold)":"var(--t4)",background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}}
                      onClick={()=>setExpandedSeg(open?null:origSeg.id)}
                    >
                      {open ? "▲" : "✎"}
                    </button>
                  </div>
                </div>

                {/* ── PROMPT — the hero, clean and readable */}
                <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>

                  {/* Location context — single muted line */}
                  {s.bg && (
                    <div style={{
                      fontSize:13,color:"var(--t4)",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      paddingLeft:2,
                    }}>
                      🏛 {s.bg}
                    </div>
                  )}

                  {/* THE PROMPT — full width, prominent, click to copy */}
                  <div
                    onClick={() => copySeg(origSeg.id)}
                    style={{
                      fontFamily:"JetBrains Mono,monospace", fontSize:14, lineHeight:1.75,
                      color:"var(--t1)", whiteSpace:"pre-wrap", wordBreak:"break-word",
                      cursor:"pointer", userSelect:"text",
                      padding:"12px 14px",
                      background:"var(--bg)", borderRadius:7,
                      border:`1px solid ${copiedSeg===origSeg.id?"rgba(74,173,117,.5)":"rgba(201,168,76,.2)"}`,
                      transition:"border-color .15s",
                    }}
                  >
                    {assembled}
                  </div>

                  {/* Footer: copy button + char count */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingLeft:2}}>
                    <span style={{fontSize:12,color:"var(--t4)"}}>
                      click to copy · {assembled.length} chars · seed {s.seed||"auto"} · {s.dur}s
                    </span>
                    <button
                      className={`btn btn-sm ${copiedSeg===origSeg.id?"btn-green":"btn-gold"}`}
                      style={{fontSize:14,padding:"4px 18px",fontWeight:700}}
                      onClick={() => copySeg(origSeg.id)}
                    >
                      {copiedSeg===origSeg.id ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* ── OVERRIDE PANEL — only when open */}
                {open && (
                  <div style={{
                    margin:"0 14px 14px",padding:"12px",background:"var(--bg4)",borderRadius:8,
                    border:"1px solid var(--ln)",display:"flex",flexDirection:"column",gap:10
                  }}>
                    <div style={{fontSize:13,color:"var(--t4)"}}>
                      Override fields — assembled prompt updates instantly
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[
                        {field:"camera",   icon:"📷",label:"Camera",  opts:CAMERA_ANGLES},
                        {field:"shotType", icon:"🎬",label:"Movement",opts:SHOT_TYPES},
                        {field:"lighting", icon:"💡",label:"Light",   opts:LIGHTING_MOODS},
                      ].map(({field,icon,label,opts})=>(
                        <label key={field} style={{display:"flex",flexDirection:"column",gap:3}}>
                          <span style={{fontSize:12,color:"var(--t4)"}}>{icon} {label}</span>
                          <select
                            value={s[field]||""}
                            onChange={e=>patchSeg(origSeg.id,{[field]:e.target.value})}
                            style={{fontSize:13,background:"var(--bg3)",color:"var(--t1)",
                              border:"1px solid var(--ln)",borderRadius:4,padding:"3px 6px"}}
                          >
                            {opts.map(o=><option key={o} value={o}>{o}</option>)}
                          </select>
                        </label>
                      ))}
                    </div>
                    <label style={{display:"flex",flexDirection:"column",gap:3}}>
                      <span style={{fontSize:12,color:"var(--t4)"}}>◐ Mood override</span>
                      <input
                        value={s.mood||""}
                        onChange={e=>patchSeg(origSeg.id,{mood:e.target.value})}
                        placeholder="leave blank to use generated mood"
                        style={{fontSize:13,background:"var(--bg3)",color:"var(--t1)",
                          border:"1px solid var(--ln)",borderRadius:4,padding:"4px 8px"}}
                      />
                    </label>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setExpandedSeg(null)}>Close</button>
                      <button className="btn btn-gold btn-sm" onClick={()=>{
                        dispatch({type:"UPDATE_SEGMENT",id:origSeg.id,patch:localSegs[origSeg.id]});
                        setExpandedSeg(null);
                      }}>Save override</button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// VISUAL NOVEL SYSTEM
// Comic / JRPG dialogue format — Final Fantasy–style panels
// Each "panel" is one image-gen prompt + text overlay spec
// ═══════════════════════════════════════════════════════════════════

// Panel types
// BG   — full background scene, no characters, narration text only
// CHAR — character portrait(s) over background, dialogue bubble
// DUAL — two character portraits facing each other, exchange
// MONO — black panel with white text only (chapter title / inner monologue)
// CLUE — close-up object panel with caption

// ════════════════════════════════════════════════════════════════
// VN_STYLES — visual novel art style presets, user-changeable via AI Director
// Each style controls: fonts, colors, effects, prompt prefix
// ════════════════════════════════════════════════════════════════
function resolveBadgeBg(template, color) {
  if (!template) return color + "22";
  // Replace ${c} with color in template strings
  return template.replace(/\$\{c\}/g, color);
}
// ── BUILD VISUAL NOVEL PANEL IMAGE PROMPT ───────────────────────────
// Returns the string to paste into Midjourney / DALL-E / Stable Diffusion
function buildVNImagePrompt(panel, allChars) {
  const parts = [];

  // ── 1. Resolve style
  const styleKey = panel._vnStyle || "cinematic";
  const styleDef = VN_STYLES[styleKey] || VN_STYLES.cinematic;

  // _customPromptPrefix: ep.vnStylePromptPrefix — a non-empty string means the user/AI set a custom prefix
  // undefined / null / empty string "" all mean "use the preset's built-in prefix"
  const customPfx = (typeof panel._customPromptPrefix === "string") ? panel._customPromptPrefix.trim() : "";
  const hasCustomPrefix = customPfx.length > 0;
  const activePrefix = hasCustomPrefix ? customPfx : (styleDef.promptPrefix || "");
  const finalPrefix  = activePrefix || VN_STYLES.cinematic.promptPrefix;
  parts.push(finalPrefix);

  // ── 2. Quality tail
  const qualityTail = hasCustomPrefix
    ? "masterpiece, best quality, highly detailed illustration, 9:16 portrait aspect ratio"
    : ({
        cinematic:  "masterpiece, cinematic still, professional photography quality, 9:16 portrait",
        acgn:       "masterpiece, best quality, professional anime illustration, vibrant colors, soft lighting, 9:16 portrait",
        noir:       "masterpiece, graphic novel quality, high contrast ink, moody atmosphere, 9:16 portrait",
        fantasy:    "masterpiece, concept art quality, rich oil painting, dramatic lighting, 9:16 portrait",
        retro:      "16-bit pixel art, limited palette, crisp pixels, SNES RPG quality, 9:16 portrait",
        watercolor: "masterpiece, watercolor illustration, soft washes, delicate ink outlines, 9:16 portrait",
        custom:     "masterpiece, best quality, highly detailed illustration, 9:16 portrait",
      }[styleKey] || "masterpiece, best quality, highly detailed, 9:16 portrait");

  // ── 3. Scene / location
  if (panel.bg) parts.push(`Setting: ${panel.bg}`);

  // ── 4. Panel-type art direction
  // When the active prefix is a rich custom/ghibli/cyberpunk prompt, use short neutral directions
  // When using a named preset, use style-specific directions
  // Use neutral panel descriptions whenever a custom prefix is active (ghibli, cyberpunk, etc.)
  const useNeutralDesc = hasCustomPrefix;

  if (panel.panelType === "BG") {
    if (useNeutralDesc) {
      parts.push("Wide establishing shot. No characters. Rich environmental detail.");
    } else {
      parts.push(({
        cinematic:  "Wide atmospheric establishing shot. No characters. Cinematic composition, deep focus, moody lighting. Film still quality.",
        acgn:       "Wide atmospheric establishing shot. No characters. Painterly anime background art. Lush environmental detail — architecture, nature, light shafts. Galge CG background quality.",
        noir:       "Wide establishing shot. No characters. High contrast, deep shadows, rain-slicked surfaces or stark interiors. Graphic novel composition.",
        fantasy:    "Wide establishing shot. No characters. Hand-painted fantasy landscape. Rich environmental detail, magical atmosphere, dramatic scale.",
        retro:      "Wide pixel art establishing shot. No characters. SNES/GBA RPG background tile-style environment.",
        watercolor: "Wide establishing shot. No characters. Soft watercolor wash background. Warm, intimate, hand-crafted environmental painting.",
        custom:     "Wide atmospheric establishing shot. No characters.",
      }[styleKey] || "Wide atmospheric establishing shot. No characters."));
    }

  } else if (panel.panelType === "CHAR") {
    const chars = (panel.chars||[]).map(id => allChars.find(c=>c.id===id)).filter(Boolean);
    if (chars.length > 0) {
      const c = chars[0];
      const lock = c.visualLock || c.appearance || "";
      const hasAvatar = c.avatarUrl || c.refImages?.find(img=>img.type==="face") || c.faceRef;
      const bodyImg   = c.refImages?.find(img=>img.type==="body");
      if (hasAvatar) parts.push(`[CHARACTER REFERENCE: The reference image shows ${c.name}. Match face, hair, and features exactly.]`);
      parts.push(`Character: ${c.name}. ${lock.substring(0,200)}`);
      if (bodyImg) parts.push(`[BODY REFERENCE: Second image shows clothing/build — match it.]`);
      if (useNeutralDesc) {
        parts.push("Waist-up portrait, lower-right or lower-left placement. Expressive face, detailed features.");
      } else {
        parts.push(({
          cinematic:  "Waist-up portrait, facing camera or 3/4 angle. Cinematic lighting, shallow depth of field, film grain. Placed lower-right or lower-left of frame.",
          acgn:       "Anime bishoujo/bishounen waist-up portrait. Large expressive eyes, detailed hair. Placed lower-right or lower-left. Soft shading, vibrant colors, light leaks, bokeh background.",
          noir:       "Waist-up portrait, high contrast lighting, dramatic shadows. Placed lower-right or lower-left. Graphic novel ink style.",
          fantasy:    "Waist-up portrait in period or fantasy attire, placed lower-right or lower-left. Hand-painted, rich jewel-tone palette, magical rim lighting.",
          retro:      "16-bit pixel character sprite, waist-up, centered. SNES RPG style, limited color palette.",
          watercolor: "Waist-up portrait, delicate ink outlines, soft watercolor washes. Placed lower-right or lower-left. Warm and intimate.",
          custom:     "Waist-up portrait, lower-right or lower-left placement.",
        }[styleKey] || "Waist-up portrait, lower-right or lower-left."));
      }
    }

  } else if (panel.panelType === "DUAL") {
    const chars = (panel.chars||[]).map(id => allChars.find(c=>c.id===id)).filter(Boolean);
    if (chars.length >= 2) {
      const [a, b] = chars;
      const lockA = a.visualLock || a.appearance || "";
      const lockB = b.visualLock || b.appearance || "";
      const hasAvatarA = a.avatarUrl || a.refImages?.find(img=>img.type==="face") || a.faceRef;
      const hasAvatarB = b.avatarUrl || b.refImages?.find(img=>img.type==="face") || b.faceRef;
      if (hasAvatarA) parts.push(`[REF IMAGE 1 = ${a.name}: Match face and features exactly]`);
      if (hasAvatarB) parts.push(`[REF IMAGE 2 = ${b.name}: Match face and features exactly]`);
      parts.push(`Left: ${a.name}. ${lockA.substring(0,120)}`);
      parts.push(`Right: ${b.name}. ${lockB.substring(0,120)}`);
      if (useNeutralDesc) {
        parts.push("Two characters in dynamic composition. Emotional tension visible in poses and expressions.");
      } else {
        parts.push(({
          cinematic:  "Two characters face each other or both face viewer. Cinematic split composition. Tension visible in posture. Film still aesthetic.",
          acgn:       "Two anime characters face each other or face viewer. Dynamic visual novel composition. Emotional tension in poses. Soft lighting, galge CG quality.",
          noir:       "Two characters, high contrast lighting. Hard shadows divide frame. Confrontational or conspiratorial composition. Graphic novel ink.",
          fantasy:    "Two characters in dramatic composition. Magical lighting. Rich costume detail. Hand-painted fantasy concept art quality.",
          retro:      "Two pixel art character sprites facing each other. SNES battle or dialogue screen style.",
          watercolor: "Two characters in soft watercolor portrait. Delicate ink lines. Warm intimate composition.",
          custom:     "Two characters in dramatic composition.",
        }[styleKey] || "Two characters in dramatic composition."));
      }

  } else if (panel.panelType === "CLUE") {
    parts.push("Dramatic close-up of a single object or detail. Object fills frame. Beautiful lighting, shallow depth of field.");
    if (panel.objectDesc) parts.push(`Object: ${panel.objectDesc}`);

  } else if (panel.panelType === "MONO") {
    if (useNeutralDesc) {
      parts.push("Scene transition card. Atmospheric, minimal. No characters. Beautiful background textures.");
    } else {
      parts.push(({
        cinematic:  "Scene transition card. Dark background, subtle light rays or film grain. Minimal, atmospheric. No characters.",
        acgn:       "Anime scene transition card. Deep navy or dark background, subtle particle effects, cherry blossom petals or floating light orbs. Minimal, ethereal. No characters. Japanese ink wash texture.",
        noir:       "Scene transition card. Pure black background, single light source. Rain streaks or cigarette smoke. Stark graphic novel minimal.",
        fantasy:    "Scene transition card. Dark background with magical particle effects, glowing runes or floating embers. No characters.",
        retro:      "Pixel art scene transition. Dark background with pixel particle effects. 8-bit or 16-bit aesthetic.",
        watercolor: "Scene transition card. Soft watercolor wash background, ink-blot texture. Warm, dream-like. No characters.",
        custom:     "Scene transition card. Atmospheric, minimal, no characters.",
      }[styleKey] || "Scene transition card. Minimal, atmospheric, no characters."));
    }
  }}

  // ── 5. Lighting and mood
  if (panel.lighting) parts.push(`Lighting: ${panel.lighting}.`);
  if (panel.mood)     parts.push(`Atmosphere: ${panel.mood}.`);

  // ── 6. Quality tail
  parts.push(qualityTail);

  return parts.join(" ");
}
// ── BUILD TEXT OVERLAY SPEC ──────────────────────────────────────────
// Returns readable instructions for placing text on top of the image
function buildVNTextSpec(panel) {
  const lines = [];
  if (panel.panelType === "MONO") {
    if (panel.narration) {
      lines.push(`TEXT CENTER: "${panel.narration}"`);
      lines.push("Style: white serif, large, centered, letter-spaced");
    }
  } else {
    if (panel.narration) {
      lines.push(`NARRATION BOX (top): "${panel.narration}"`);
      lines.push("Style: white text on semi-transparent dark bar");
    }
    if (panel.dialogue) {
      lines.push(`DIALOGUE BUBBLE: "${panel.dialogue}"`);
      if (panel.speaker) lines.push(`Speaker label: ${panel.speaker}`);
      lines.push("Style: white rounded speech bubble, bottom of portrait");
    }
  }
  return lines.join("\n");
}

// ── GENERATE VN PANELS FROM EPISODE via Claude API ───────────────────
async function generateVNPanels({ apiKey, ep, proj, bible, onStatus }) {
  if (!apiKey) throw new Error("No Claude API key.");

  const chars = (bible.characters || [])
    .map(c => `${c.name}[${c.id}]: ${c.role}. Visual: ${(c.visualLock||c.appearance||"").substring(0,120)}`)
    .join("\n");

  const sceneBgs = bible.sceneBackgrounds || {};
  const bgHint = Object.entries(sceneBgs).slice(0,8)
    .map(([k,v]) => `  ${k}: "${v.substring(0,120)}"`)
    .join("\n");

  const segments = (ep.segments || []).filter(s => s.prompt);
  const storyBrief = segments.map((s,i) =>
    `${i+1}. [${s.type}] ${s.prompt.substring(0,200)}`
  ).join("\n");

  onStatus?.("Writing Visual Novel panels…", 15);

  const prompt = `You are a visual novel director creating an ACGN-style (Anime/Comic/Game/Novel) visual novel — the aesthetic of Japanese galge, otome, and bishoujo games like Clannad, Steins;Gate, and visual novels by Key/VisualArts. Your panels combine cinematic storytelling with anime-style illustration cues.

SERIES: "${proj.name}"
EPISODE ${ep.num}: "${ep.title}"
EPISODE NOTES: ${ep.notes || ""}

CHARACTERS (use exact IDs in chars arrays):
${chars}

ESTABLISHED SCENE BACKGROUNDS:
${bgHint}

STORY THIS EPISODE:
${storyBrief}

Create 12-18 visual novel panels that tell this episode's story. Use the JRPG dialogue format:
- Characters appear as portrait overlays on painted backgrounds
- Dialogue is shown in speech bubbles over the image
- Narration boxes give atmosphere or inner thoughts
- Key objects get their own close-up panels
- Chapter breaks use black MONO panels with white text

Return ONLY a valid JSON array. No markdown. Each panel:
{
  "id": "vn01_01",
  "panelType": "BG" | "CHAR" | "DUAL" | "MONO" | "CLUE",
  "scene": "scene_slug matching established locations",
  "bg": "2-3 sentence painterly background description. Materials, light, atmosphere. JRPG art direction.",
  "chars": ["char_id"],
  "lighting": "one of: golden-hour warm | north-light cool | candlelight amber | fluorescent cold | dramatic rim | silhouette dusk | moonlight blue | harsh noon | soft dawn",
  "mood": "3-5 words: emotional atmosphere of this panel",
  "narration": "Text shown in narration box at top. Max 25 words. Sets scene or inner thought. Can be empty string.",
  "dialogue": "Spoken words shown in speech bubble. Max 30 words. Exact character dialogue or empty string.",
  "speaker": "Character name if dialogue present, else empty string",
  "objectDesc": "For CLUE panels only: precise description of the object",
  "notes": "One-line director note"
}

PANEL SEQUENCE RULES:
- Open with a BG panel establishing the episode's dominant location
- Follow with CHAR or DUAL panels for each beat of the episode
- Use MONO panels for: episode title, act breaks, key revelations
- Use CLUE panels for: the collar, the envelope, the tin box, the photograph, any physical evidence
- End with a BG or MONO panel that creates forward pull into the next episode
- DUAL panels for confrontations and two-person exchanges
- Never put dialogue in a BG or MONO panel
- The episode's most important emotional beat gets its own CHAR panel with a close expression`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type":"application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role:"user", content: prompt }]
    })
  });
  if (!resp.ok) {
    let errMsg = `Claude API error ${resp.status}`;
    try { const e = await resp.json(); errMsg = e.error?.message || e.error?.type || errMsg; } catch(_) {}
    throw new Error(errMsg);
  }
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const raw = data.content?.[0]?.text || "";
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No panel array returned. Response: " + raw.substring(0,200));
  const panels = JSON.parse(match[0]);
  if (!panels.length) throw new Error("Generated 0 panels.");

  onStatus?.(`${panels.length} panels generated.`, 100);
  return panels;
}

// ── IMAGE GENERATION — Nano Banana 2 (Gemini 3.1 Flash Image) ──────────
// Model hierarchy:
//   gemini-3.1-flash-image-preview  = Nano Banana 2  (latest, default)
//   gemini-3-pro-image-preview      = Nano Banana Pro (higher quality, slower)
//   gemini-2.5-flash-image          = Nano Banana 1  (stable fallback)
// CORS works fine from localhost and deployed apps with x-goog-api-key header.
// ══════════════════════════════════════════════════════════════
// IMAGE ENGINE IMPLEMENTATIONS
// ══════════════════════════════════════════════════════════════

// ENGINE INFO — shown in UI and AI Director
const IMAGE_ENGINES = {
  nanoBanana2: {
    id: "nanoBanana2",
    name: "Nano Banana 2",
    badge: "NB2",
    free: true,
    needsKey: true,
    keyName: "Gemini API Key",
    keyHint: "AIzaSy...",
    note: "gemini-3.1-flash-image-preview. Latest Gemini image model. Fast, high quality, adaptive aspect ratios per context.",
    icon: "🍌",
    strengths: ["Fast", "Adaptive ratio", "High quality"],
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini (Auto)",
    badge: "Gemini",
    free: true,
    needsKey: true,
    keyName: "Gemini API Key",
    keyHint: "AIzaSy...",
    note: "Auto-cascade: NB2 → NB Pro → NB1. Falls back to older models if latest unavailable. Supports reference images.",
    icon: "✦",
    strengths: ["Reference images", "Auto-fallback", "Stable"],
  },
  pollinations: {
    id: "pollinations",
    name: "Pollinations.ai",
    badge: "Pollinations",
    free: true,
    needsKey: false,
    keyName: null,
    keyHint: null,
    note: "100% free, no key needed. Powered by FLUX. Good quality. No reference images.",
    icon: "🌸",
    strengths: ["No key", "Free", "FLUX model"],
  },
  dalle: {
    id: "dalle",
    name: "OpenAI DALL·E 3",
    badge: "DALL·E 3",
    free: false,
    needsKey: true,
    keyName: "OpenAI API Key",
    keyHint: "sk-proj-...",
    note: "Paid (~$0.04–0.08/image). Highest quality. Requires OpenAI account.",
    icon: "⬡",
    strengths: ["Highest quality", "Vivid style", "Precise prompts"],
  },
};

// ── Nano Banana 2 — gemini-3.1-flash-image-preview, pinned model ──
// imageType: "vn" (9:16 portrait), "avatar" (1:1), "asset" (16:9), "cover" (2:3)
async function generateImageNanaBanana2({ prompt, geminiKey, refImages = [], imageType = "vn" }) {
  if (!geminiKey) throw new Error("No Gemini API key — add it in Settings → API Keys.");

  const ASPECT_RATIOS = {
    vn:     "9:16",
    avatar: "1:1",
    asset:  "16:9",
    cover:  "2:3",
  };
  const aspectRatio = ASPECT_RATIOS[imageType] || "9:16";

  const orientationHint = {
    vn:     "Portrait orientation, vertical 9:16 composition.",
    avatar: "Square portrait composition, head and shoulders.",
    asset:  "Landscape orientation, wide 16:9 composition.",
    cover:  "Vertical cover art composition, 2:3 ratio.",
  }[imageType] || "Portrait orientation.";

  const cleanPrompt = prompt
    .replace(/--ar\s+\S+/g, "")
    .replace(/--style\s+\S+/g, "")
    .replace(/--stylize\s+\S+/g, "")
    .replace(/--\w+\s*\S*/g, "")
    .trim()
    + " " + orientationHint;

  const promptParts = [];
  for (const img of refImages.slice(0, 3)) {
    try {
      const base64 = img.dataUrl.split(",")[1];
      const mimeType = img.dataUrl.split(";")[0].replace("data:", "") || "image/jpeg";
      promptParts.push({ inlineData: { mimeType, data: base64 } });
      promptParts.push({ text: `[Reference ${img.type || "character"} — match these features in the generated image.]` });
    } catch(e) { /* skip bad ref */ }
  }
  promptParts.push({ text: cleanPrompt });

  const body = JSON.stringify({
    contents: [{ parts: promptParts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio },
    }
  });

  const MODEL = "gemini-3.1-flash-image-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey,
    },
    body,
  });

  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}));
    throw new Error(`Nano Banana 2 (${resp.status}): ${e.error?.message || "unknown error"}`);
  }

  const data = await resp.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith("image/"));
  if (imgPart) {
    return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
  }
  const textPart = parts.find(p => p.text);
  throw new Error(textPart?.text
    ? `Nano Banana 2: ${textPart.text.substring(0, 150)}`
    : "Nano Banana 2: no image returned");
}

// ── Pollinations.ai — completely free, no key ──────────────────
async function generateImagePollinations(prompt) {
  // Pollinations FLUX endpoint: just a URL call, returns image directly
  // Encode prompt, request 9:16 portrait (768×1344 or 1024×1820)
  const clean = prompt.replace(/[^\w\s,.()\-:'"!?]/g, " ").trim();
  const encoded = encodeURIComponent(clean);
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=1344&seed=${seed}&model=flux&nologo=true&enhance=true`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Pollinations error: ${resp.status}`);
  const blob = await resp.blob();
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(blob);
  });
}

// ── DALL-E 3 — paid, needs OpenAI key ─────────────────────────
async function generateImageDalle({ prompt, openaiKey }) {
  if (!openaiKey) throw new Error("No OpenAI API key — add it in Settings → API Keys.");
  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt.substring(0, 4000), // DALL-E 3 limit
      n: 1,
      size: "1024x1792",  // closest to 9:16
      response_format: "b64_json",
      quality: "standard",
    }),
  });
  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}));
    throw new Error(`DALL-E 3: ${e.error?.message || resp.status}`);
  }
  const data = await resp.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("DALL-E 3: no image returned");
  return `data:image/png;base64,${b64}`;
}

// ── Unified image generator — routes to correct engine ────────
// imageType: "vn" | "avatar" | "asset" | "cover" — used by nanoBanana2 for aspect ratio
async function generateVNImage({ prompt, geminiKey, openaiKey, refImages = [], engine = "nanoBanana2", imageType = "vn" }) {
  if (engine === "nanoBanana2") {
    return generateImageNanaBanana2({ prompt, geminiKey, refImages, imageType });
  }
  if (engine === "pollinations") {
    return generateImagePollinations(prompt);
  }
  if (engine === "dalle") {
    return generateImageDalle({ prompt, openaiKey });
  }
  // "gemini" engine: auto-cascade through models
  return generateVNImageGemini({ prompt, geminiKey, refImages });
}

async function generateVNImageGemini({ prompt, geminiKey, refImages = [] }) {
  if (!geminiKey) throw new Error("No Gemini API key — add it in Settings → API Keys.");

  // Strip Midjourney-only flags, add portrait instruction
  const cleanPrompt = prompt
    .replace(/--ar\s+\S+/g, "")
    .replace(/--style\s+\S+/g, "")
    .replace(/--stylize\s+\S+/g, "")
    .replace(/--\w+\s*\S*/g, "")
    .trim()
    + " Portrait orientation, vertical 9:16 composition.";

  // Build parts array — prepend any reference images if provided
  // Gemini supports interleaved image+text inputs for image-guided generation
  const promptParts = [];
  for (const img of refImages.slice(0, 3)) { // max 3 ref images
    try {
      // Extract base64 data from dataUrl (data:image/jpeg;base64,XXXXX)
      const base64 = img.dataUrl.split(",")[1];
      const mimeType = img.dataUrl.split(";")[0].replace("data:", "") || "image/jpeg";
      promptParts.push({
        inlineData: { mimeType, data: base64 }
      });
      promptParts.push({ text: `[This is a ${img.type || "face"} reference for the character. Match these features in the generated image.]` });
    } catch(e) { /* skip bad ref */ }
  }
  promptParts.push({ text: cleanPrompt });

  const body = JSON.stringify({
    contents: [{ parts: promptParts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "9:16" },
    }
  });

  const MODELS = [
    "gemini-3.1-flash-image-preview",  // Nano Banana 2 — latest
    "gemini-3-pro-image-preview",       // Nano Banana Pro — fallback
    "gemini-2.5-flash-image",           // Nano Banana 1 — stable fallback
  ];

  let lastErr = null;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body,
      });

      if (resp.status === 404 || resp.status === 400) {
        const e = await resp.json().catch(() => ({}));
        lastErr = new Error(`${model} unavailable: ${e.error?.message || resp.status}`);
        continue;
      }
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(`Gemini ${resp.status}: ${e.error?.message || "unknown"}`);
      }

      const data = await resp.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith("image/"));

      if (imgPart) {
        return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
      }

      const textPart = parts.find(p => p.text);
      lastErr = new Error(textPart?.text
        ? `Gemini (${model}): ${textPart.text.substring(0, 150)}`
        : `No image returned by ${model}`);

    } catch(e) {
      if (e instanceof TypeError) {
        throw new Error("Network error — check connection or Gemini API key.");
      }
      lastErr = e;
    }
  }
  throw lastErr || new Error("All Gemini models failed.");
}

// ── GENERATE CHARACTER AVATAR ─────────────────────────────────────────────────
// Uses Gemini imagen to produce a canonical portrait of the character.
// Returns base64 dataUrl. The caller saves it via SET_CHAR_AVATAR dispatch.
async function generateCharacterAvatar({ char, geminiKey, openaiKey, style = "realistic", engine = "gemini" }) {
  const visualDesc = char.visualLock || char.appearance || "";
  const name = char.name || "character";
  const styleGuide = style === "anime"
    ? "Japanese anime character portrait. Cel-shaded, vibrant, large expressive eyes, clean linework."
    : style === "painted"
    ? "Oil painting portrait style. Rich textured brushwork, dramatic lighting, classical composition."
    : style === "ghibli"
    ? "Studio Ghibli animation style. Warm watercolor tones, soft features, expressive Miyazaki aesthetic."
    : "Photorealistic character portrait. Professional cinematic lighting. Highly detailed.";
  const avatarPrompt = [
    styleGuide,
    `Character: ${name}.`,
    visualDesc ? `Appearance: ${visualDesc}` : "",
    "Head and shoulders portrait. Facing camera or slight 3/4 angle. Neutral to warm expression.",
    "No text, no watermarks, no UI overlays. Clean background. Highly detailed.",
  ].filter(Boolean).join(" ");

  if (engine === "nanoBanana2") {
    return generateImageNanaBanana2({ prompt: avatarPrompt, geminiKey, refImages: [], imageType: "avatar" });
  }
  if (engine === "pollinations") {
    return generateImagePollinations(avatarPrompt);
  }
  if (engine === "dalle") {
    return generateImageDalle({ prompt: avatarPrompt, openaiKey });
  }
  // Default: Gemini cascade
  if (!geminiKey) throw new Error("Gemini API key required — set it in Settings.");

  const body = {
    contents: [{ parts: [{ text: avatarPrompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    }
  };

  const MODELS = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
    "gemini-2.0-flash-exp",
  ];

  let lastErr = null;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify(body),
      });
      if (resp.status === 404 || resp.status === 400) {
        lastErr = new Error(`${model} unavailable`);
        continue;
      }
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(`Gemini ${resp.status}: ${e.error?.message || "unknown"}`);
      }
      const data = await resp.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith("image/"));
      if (imgPart) {
        return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
      }
      const textPart = parts.find(p => p.text);
      lastErr = new Error(textPart?.text ? `Gemini: ${textPart.text.substring(0,120)}` : `No image from ${model}`);
    } catch(e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All models failed for avatar generation.");
}

// ── VISUAL NOVEL SHEET MODAL ──────────────────────────────────────────
function VisualNovelSheetModal({ epId, state: outerState, ep: epProp, proj, bible, onClose, apiKey, geminiKey, openaiKey, imageEngine = "gemini", dispatch, saveImageToServer }) {
  // Always read ep fresh from state so AI Director style changes take effect immediately
  const ep = (outerState?.episodes?.find(e=>e.id===epId)) || epProp;
  const allChars  = bible.characters || [];
  const [panels, setPanels]     = useState(ep.vnPanels || []);

  const [phase, setPhase]       = useState(ep.vnPanels?.length ? "ready" : "idle");
  const [error, setError]       = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedType, setCopiedType] = useState(null);
  const [activeTab, setActiveTab]   = useState("image"); // "image" | "text"
  // Always sync from persisted ep.vnImages — picks up after style changes clear the cache
  const [panelImages, setPanelImages]   = useState(ep.vnImages || {});
  // Re-sync when ep changes (e.g. style cleared images)
  useEffect(() => {
    setPanelImages(ep.vnImages || {});
  }, [ep.id, JSON.stringify(Object.keys(ep.vnImages||{}))]);
  const [generatingImg, setGeneratingImg] = useState(null); // panelId currently generating
  const [showReader, setShowReader] = useState(false); // preview reader overlay

  const generate = async () => {
    setPhase("generating"); setError(null);
    try {
      const result = await generateVNPanels({ apiKey, ep, proj, bible, onStatus: () => {} });
      setPanels(result);
      setActiveIdx(0);
      setPhase("ready");
      dispatch?.({ type: "SAVE_VN_PANELS", epId, panels: result });
    } catch(e) { setError(e.message); setPhase("error"); }
  };

  const doCopy = (text, id, type) => {
    copyText(text);
    setCopiedId(id); setCopiedType(type);
    setTimeout(() => { setCopiedId(null); setCopiedType(null); }, 2000);
  };

  const wasCopied = (id, type) => copiedId === id && copiedType === type;

  const [imageHistory, setImageHistory] = useState(ep.vnImageHistory || {});
  useEffect(() => {
    setImageHistory(ep.vnImageHistory || {});
  }, [ep.id, Object.keys(ep.vnImageHistory||{}).length]);
  const [panelsHistory, setPanelsHistory] = useState(ep.vnPanelsHistory || []); // [{id,panels,createdAt}]
  const [showVersions, setShowVersions] = useState(null); // panelId showing version picker

  const generateImage = async (panelId, imgPrompt) => {
    const eng = imageEngine || "nanoBanana2";
    if ((eng === "gemini" || eng === "nanoBanana2") && !geminiKey) { alert("Add your Gemini API key in Settings → API Keys to generate images."); return; }
    if (eng === "dalle" && !openaiKey)  { alert("Add your OpenAI API key in Settings → API Keys to use DALL·E 3."); return; }
    // Pollinations needs no key
    setGeneratingImg(panelId);
    setPanelImages(prev => ({ ...prev, [panelId]: "loading" }));
    try {
      // Gather ref images: prefer canonical avatarUrl, then uploaded refImages
      const panelCharIds = panels.find(p=>p.id===panelId)?.chars || [];
      const panelRefImages = panelCharIds.flatMap(id => {
        const c = allChars.find(c=>c.id===id);
        if (!c) return [];
        // avatarUrl takes priority as the canonical face reference
        const imgs = [];
        if (c.avatarUrl) imgs.push({ dataUrl: c.avatarUrl, type: "face", id: c.id + "_avatar" });
        else if (c.refImages?.length) imgs.push(...c.refImages.filter(img => img.type === "face").slice(0,1));
        // Add body ref if available
        const bodyRef = c.refImages?.find(img => img.type === "body");
        if (bodyRef) imgs.push(bodyRef);
        return imgs;
      });
      const dataUrl = await generateVNImage({ prompt: imgPrompt, geminiKey, openaiKey, refImages: panelRefImages, engine: imageEngine });
      // Save to history
      const newEntry = { id: "img" + Date.now(), dataUrl, createdAt: new Date().toISOString(), active: true };
      setImageHistory(prev => {
        const ph = (prev[panelId] || []).map(h => ({...h, active: false}));
        return {...prev, [panelId]: [...ph, newEntry]};
      });
      setPanelImages(prev => ({ ...prev, [panelId]: dataUrl }));
      dispatch?.({ type: "SAVE_VN_IMAGE", epId, panelId, dataUrl });
      idbSave(vnImageKey(epId, panelId), dataUrl).catch(()=>{});
      // Save to Supabase immediately — don't wait for the debounced full sync
      if (saveImageToServer) saveImageToServer(epId, panelId, dataUrl, outerState?.activeProject);
    } catch(e) {
      const msg = e.message === "CORS_BLOCKED"
        ? "CORS blocked — try switching to Pollinations (free, no key needed) in Settings → Image Engine."
        : e.message;
      setPanelImages(prev => ({ ...prev, [panelId]: "error:" + msg }));
    } finally {
      setGeneratingImg(null);
    }
  };

  const selectImageVersion = (panelId, version) => {
    const updated = (imageHistory[panelId] || []).map(h => ({...h, active: h.id === version.id}));
    setImageHistory(prev => ({...prev, [panelId]: updated}));
    setPanelImages(prev => ({...prev, [panelId]: version.dataUrl}));
    dispatch?.({ type: "SET_VN_IMAGE_VERSION", epId, panelId, versionId: version.id });
    setShowVersions(null);
  };

  const selectPanelsVersion = (version) => {
    setPanels(version.panels);
    setActiveIdx(0);
    dispatch?.({ type: "SET_VN_PANELS_VERSION", epId, versionId: version.id });
  };

  const generateAllImages = async (forceAll = false) => {
    const eng = imageEngine || "nanoBanana2";
    if ((eng === "gemini" || eng === "nanoBanana2") && !geminiKey) { alert("Add your Gemini API key in Settings → API Keys to generate images."); return; }
    if (eng === "dalle" && !openaiKey)  { alert("Add your OpenAI API key in Settings → API Keys to use DALL·E 3."); return; }
    // Pollinations needs no key
    // Only generate panels that don't have a saved image yet (unless forceAll)
    const toGenerate = panels.filter(p =>
      forceAll || !panelImages[p.id] || panelImages[p.id] === "loading" || panelImages[p.id].startsWith("error:")
    );
    for (const p of toGenerate) {
      // Always read the LATEST ep from outerState so style changes by AI Director are picked up
      const latestEp = outerState?.episodes?.find(e=>e.id===epId) || ep;
      const imgPrompt = buildVNImagePrompt({...p, _vnStyle: latestEp.vnStyle||"cinematic", _customPromptPrefix: latestEp.vnStylePromptPrefix}, allChars);
      setGeneratingImg(p.id);
      setPanelImages(prev => ({ ...prev, [p.id]: "loading" }));
      try {
        const loopRefImages = (p.chars||[]).flatMap(id => {
          const c = allChars.find(c=>c.id===id);
          if (!c) return [];
          const imgs = [];
          if (c.avatarUrl) imgs.push({ dataUrl: c.avatarUrl, type: "face", id: c.id + "_avatar" });
          else if (c.refImages?.length) imgs.push(...c.refImages.filter(img => img.type === "face").slice(0,1));
          const bodyRef = c.refImages?.find(img => img.type === "body");
          if (bodyRef) imgs.push(bodyRef);
          return imgs;
        });
        const dataUrl = await generateVNImage({ prompt: imgPrompt, geminiKey, openaiKey, refImages: loopRefImages, engine: imageEngine });
        const newEntry = { id: "img" + Date.now(), dataUrl, createdAt: new Date().toISOString(), active: true };
        setImageHistory(prev => {
          const ph = (prev[p.id] || []).map(h => ({...h, active: false}));
          return {...prev, [p.id]: [...ph, newEntry]};
        });
        setPanelImages(prev => ({ ...prev, [p.id]: dataUrl }));
        dispatch?.({ type: "SAVE_VN_IMAGE", epId, panelId: p.id, dataUrl });
        idbSave(vnImageKey(epId, p.id), dataUrl).catch(()=>{});
        // Save to Supabase immediately per panel — avoids racing the debounced sync
        if (saveImageToServer) saveImageToServer(epId, p.id, dataUrl, outerState?.activeProject);
      } catch(e) {
        if (e.message === "CORS_BLOCKED") {
          const msg = "CORS blocked — try switching to Pollinations (free, no key) in Settings → Image Engine.";
          setPanelImages(prev => ({ ...prev, [p.id]: "error:" + msg }));
          setGeneratingImg(null);
          return;
        }
        setPanelImages(prev => ({ ...prev, [p.id]: "error:" + e.message }));
      }
      setGeneratingImg(null);
      await new Promise(r => setTimeout(r, 800));
    }
  };

  const panel      = panels[activeIdx] || null;
  const imagePrompt = panel ? buildVNImagePrompt(panel, allChars) : "";
  const textSpec    = panel ? buildVNTextSpec(panel) : "";
  const panelChars  = panel ? (panel.chars||[]).map(id => allChars.find(c=>c.id===id)).filter(Boolean) : [];
  const def         = panel ? (VN_PANEL_TYPES[panel.panelType] || VN_PANEL_TYPES.CHAR) : VN_PANEL_TYPES.BG;

  // ── PHONE PANEL RENDERER — actual visual simulation of how it looks
  const PhonePanel = ({ panel, chars, imageDataUrl, isGenerating }) => {
    if (!panel) return null;
    const d      = VN_PANEL_TYPES[panel.panelType] || VN_PANEL_TYPES.CHAR;
    const ch     = (panel.chars||[]).map(id => chars.find(c=>c.id===id)).filter(Boolean);
    const isMono = panel.panelType === "MONO";
    const isBg   = panel.panelType === "BG";
    const isDual = panel.panelType === "DUAL";
    const isClue = panel.panelType === "CLUE";

    // Read current VN style from parent scope (ep object or default)
    const styleKey = ep?.vnStyle || "cinematic";
    const styleDef = VN_STYLES[styleKey] || VN_STYLES.cinematic;

    // Mood → gradient (adaptive per style)
    const moodGrad = {
      "golden-hour warm":  ["#1a0f00","#3d2200"],
      "north-light cool":  ["#050810","#0a1525"],
      "candlelight amber": ["#150800","#2d1200"],
      "fluorescent cold":  ["#030810","#051020"],
      "dramatic rim":      ["#050508","#0f0f18"],
      "silhouette dusk":   ["#0a0510","#1a0d28"],
      "moonlight blue":    ["#010510","#030d28"],
      "harsh noon":        ["#0a0a05","#181808"],
      "soft dawn":         ["#0d0508","#200a15"],
    };
    const [c1,c2] = moodGrad[panel.lighting] || styleDef.bg;

    const hasImg = imageDataUrl && imageDataUrl !== "loading" && !imageDataUrl.startsWith("error:");

    return (
      <>
      {showReader && <VNReader ep={{...ep, vnPanels:panels, vnImages:panelImages}} proj={proj} bible={bible} onClose={()=>setShowReader(false)} isFree={true}/>}
      <div style={{
        width:"100%", height:"100%", position:"relative",
        background:`linear-gradient(160deg, ${c1} 0%, ${c2} 100%)`,
        overflow:"hidden", fontFamily:"'Georgia', 'Noto Serif JP', serif",
      }}>

        {/* ── Ambient glow layer — intensity from style */}
        <div style={{
          position:"absolute", inset:0, zIndex:0,
          background:`
            radial-gradient(ellipse 90% 55% at 50% 20%, ${d.color}${styleDef.glowIntensity} 0%, transparent 65%),
            radial-gradient(ellipse 50% 80% at 15% 90%, ${d.color}${styleDef.glowIntensity2} 0%, transparent 55%)
          `,
        }}/>

        {/* ── Generated CG image — contain shows full 9:16 image */}
        {hasImg && (
          <img src={imageDataUrl} alt="" style={{
            position:"absolute", inset:0, width:"100%", height:"100%",
            objectFit:"contain", objectPosition:"center center", zIndex:2,
          }}/>
        )}

        {/* ── Placeholder shimmer (no image yet) */}
        {!hasImg && !isGenerating && (
          <div style={{
            position:"absolute", inset:0, zIndex:1,
            background:`linear-gradient(135deg, ${d.color}08 0%, transparent 50%, ${d.color}06 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{
              fontSize:40, opacity:0.15,
              filter:`drop-shadow(0 0 12px ${d.color})`,
            }}>{d.icon}</div>
          </div>
        )}

        {/* ── Loading */}
        {isGenerating && (
          <div style={{
            position:"absolute", inset:0, zIndex:50,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            background:"rgba(6,6,15,.75)", backdropFilter:"blur(6px)",
          }}>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              border:`2px solid ${d.color}33`,
              borderTop:`2px solid ${d.color}`,
              animation:"spin 1s linear infinite", marginBottom:10,
            }}/>
            <div style={{fontSize:12, color:d.color, letterSpacing:"2px", opacity:0.8, fontFamily:styleDef.fontMono}}>{styleDef.loadingText}</div>
          </div>
        )}

        {/* ── Error */}
        {imageDataUrl?.startsWith("error:") && (
          <div style={{
            position:"absolute", inset:0, zIndex:50,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(40,4,4,.7)",
          }}>
            <div style={{fontSize:12, color:"#ff9090", textAlign:"center", padding:"0 14px", lineHeight:1.6}}>
              ✗ {imageDataUrl.replace("error:","").substring(0,70)}
            </div>
          </div>
        )}

        {/* ── Cinematic gradients — depth behind captions */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"35%", zIndex:3,
          background:"linear-gradient(180deg, rgba(4,4,12,.75) 0%, transparent 100%)",
          pointerEvents:"none",
        }}/>
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:"50%", zIndex:3,
          background:"linear-gradient(0deg, rgba(4,4,12,.92) 0%, rgba(4,4,12,.5) 55%, transparent 100%)",
          pointerEvents:"none",
        }}/>

        {/* ── Panel type badge */}
        <div style={{
          position:"absolute", top:8, left:8, zIndex:20,
          background:resolveBadgeBg(styleDef.badgeBg, d.color),
          border:`1px solid ${d.color}${styleDef.borderAlpha}`,
          borderRadius:styleDef.badgeRadius, padding:"2px 9px",
          fontSize:12, color:d.color, letterSpacing:"1.5px",
          fontFamily:styleDef.fontMono, fontWeight:700,
          backdropFilter:"blur(8px)",
        }}>
          {d.icon} {panel.panelType}
        </div>

        {/* ── Character name tags (top right) */}
        {ch.length > 0 && (
          <div style={{
            position:"absolute", top:8, right:8, zIndex:20,
            display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end",
          }}>
            {ch.slice(0,2).map(c => (
              <div key={c.id} style={{
                background:`${c.color||d.color}33`,
                border:`1px solid ${c.color||d.color}55`,
                borderRadius:20, padding:"2px 8px",
                fontSize:12, color:c.color||d.color,
                fontFamily:"'JetBrains Mono',monospace",
                backdropFilter:"blur(8px)",
              }}>{c.name.split(" ")[0]}</div>
            ))}
          </div>
        )}

        {/* ── MONO panel — centered poem-style text (ACGN title card) */}
        {isMono && (
          <div style={{
            position:"absolute", inset:0, zIndex:10,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            padding:"24px 20px",
          }}>
            {/* Decorative lines */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,width:"100%",justifyContent:"center"}}>
              <div style={{height:1,width:24,background:`linear-gradient(90deg,transparent,${d.color}80)`}}/>
              <div style={{width:4,height:4,borderRadius:"50%",background:d.color,opacity:0.6}}/>
              <div style={{height:1,width:24,background:`linear-gradient(270deg,transparent,${d.color}80)`}}/>
            </div>
            <div style={{
              fontSize:16, color:"rgba(255,255,255,.92)", textAlign:"center",
              lineHeight:1.9, letterSpacing:styleDef.monoLetterSpacing, fontStyle:styleDef.monoFontStyle,
              fontFamily:styleDef.fontBody,
              textShadow:`0 0 20px ${d.color}60, 0 2px 8px rgba(0,0,0,.8)`,
              maxWidth:"85%",
            }}>
              {panel.narration || "···"}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14,width:"100%",justifyContent:"center"}}>
              <div style={{height:1,width:24,background:`linear-gradient(90deg,transparent,${d.color}80)`}}/>
              <div style={{width:4,height:4,borderRadius:"50%",background:d.color,opacity:0.6}}/>
              <div style={{height:1,width:24,background:`linear-gradient(270deg,transparent,${d.color}80)`}}/>
            </div>
          </div>
        )}

        {/* ── CLUE panel — ACGN focus frame */}
        {isClue && !hasImg && (
          <div style={{
            position:"absolute", inset:0, zIndex:10,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:10,
          }}>
            <div style={{
              width:90, height:90,
              background:`radial-gradient(circle at 35% 35%, ${d.color}30, ${d.color}08)`,
              border:`1px solid ${d.color}60`,
              borderRadius:8,
              boxShadow:`0 0 30px ${d.color}40, 0 0 60px ${d.color}20, inset 0 0 20px rgba(0,0,0,.5)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:32, position:"relative",
            }}>
              <div style={{opacity:0.5}}>{d.icon}</div>
              {/* Focus corners */}
              <div style={{position:"absolute",top:2,left:2,width:10,height:10,borderTop:"2px solid "+d.color,borderLeft:"2px solid "+d.color}}/>
              <div style={{position:"absolute",top:2,right:2,width:10,height:10,borderTop:"2px solid "+d.color,borderRight:"2px solid "+d.color}}/>
              <div style={{position:"absolute",bottom:2,left:2,width:10,height:10,borderBottom:"2px solid "+d.color,borderLeft:"2px solid "+d.color}}/>
              <div style={{position:"absolute",bottom:2,right:2,width:10,height:10,borderBottom:"2px solid "+d.color,borderRight:"2px solid "+d.color}}/>
            </div>
            {panel.objectDesc && (
              <div style={{
                fontSize:12, color:d.color, letterSpacing:"2px",
                textTransform:"uppercase", textAlign:"center", maxWidth:140,
                lineHeight:1.5, opacity:0.8,
              }}>{panel.objectDesc}</div>
            )}
          </div>
        )}

        {/* ── BG scene label when no narration */}
        {isBg && !panel.narration && !hasImg && (
          <div style={{
            position:"absolute", bottom:18, left:0, right:0, zIndex:10,
            textAlign:"center",
          }}>
            <div style={{fontSize:12, color:d.color, letterSpacing:"3px", opacity:0.5}}>
              {panel.mood || panel.bg?.substring(0,30) || "···"}
            </div>
          </div>
        )}

        {/* ── NARRATION — anime game serif italic top band */}
        {!isMono && panel.narration && (
          <div style={{
            position:"absolute", top:0, left:0, right:0, zIndex:20,
            background:"linear-gradient(180deg, rgba(2,2,10,.93) 0%, rgba(2,2,10,.82) 70%, transparent 100%)",
            padding:"20px 16px 18px",
            pointerEvents:"none",
          }}>
            <div style={{
              fontSize:13, color:"rgba(225,225,248,.9)", lineHeight:1.85,
              fontStyle:"italic", letterSpacing:"0.4px",
              fontFamily:styleDef.fontBody,
              textShadow:"0 1px 6px rgba(0,0,0,.95)",
            }}>
              {panel.narration}
            </div>
          </div>
        )}

        {/* ── DIALOGUE BOX — anime game style inside frame */}
        {!isMono && panel.dialogue && (
          <div style={{position:"absolute", bottom:0, left:0, right:0, zIndex:20}}>
            {/* Speaker name tab */}
            {panel.speaker && (
              <div style={{paddingLeft:14, marginBottom:-2}}>
                <div style={{
                  display:"inline-flex", alignItems:"center",
                  background:`linear-gradient(90deg, ${d.color}ee, ${d.color}bb)`,
                  padding:"4px 18px 5px 12px",
                  borderRadius:"7px 7px 0 0",
                  clipPath:"polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)",
                }}>
                  <span style={{
                    fontSize:13, color:"rgba(0,0,0,.92)", fontWeight:800,
                    letterSpacing:"2px", textTransform:"uppercase",
                    fontFamily:"'JetBrains Mono',monospace",
                  }}>{panel.speaker.split(" ")[0]}</span>
                </div>
              </div>
            )}
            {/* Dialogue text box */}
            <div style={{
              background:"linear-gradient(0deg, rgba(3,3,12,.97) 0%, rgba(5,5,16,.95) 100%)",
              borderTop:`2px solid ${d.color}60`,
              padding:"12px 16px 20px",
              backdropFilter:"blur(12px)",
            }}>
              <div style={{
                fontSize:15, color:"rgba(242,242,255,.97)", lineHeight:1.8,
                letterSpacing:"0.2px", fontFamily:styleDef.fontBody,
                textShadow:"0 1px 4px rgba(0,0,0,.95)",
              }}>
                {panel.dialogue}
              </div>
              {/* Continue indicator */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:3,marginTop:8}}>
                {[.3,.55,.85].map((o,i)=>(
                  <div key={i} style={{width:4,height:4,borderRadius:"50%",background:d.color,opacity:o}}/>
                ))}
                <div style={{fontSize:13,color:d.color,marginLeft:3,opacity:.9}}>▼</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Texture overlay — style-controlled */}
        {styleDef.scanlines && (
          <div style={{
            position:"absolute", inset:0, zIndex:5, pointerEvents:"none",
            backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.06) 3px, rgba(0,0,0,.06) 4px)",
            mixBlendMode:"multiply",
          }}/>
        )}
        {styleDef.grain && (
          <div style={{
            position:"absolute", inset:0, zIndex:5, pointerEvents:"none", opacity:0.03,
            backgroundImage:NOISE_SVG_URL,
            backgroundSize:"128px",
          }}/>
        )}
      </div>
    </>
    );
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"#0a0a12",
        border:"1px solid rgba(148,100,200,.35)",
        borderRadius:16, width:"97%", maxWidth:1060,
        maxHeight:"95vh", display:"flex", flexDirection:"column", overflow:"hidden",
        boxShadow:"0 24px 80px rgba(0,0,0,.7)",
      }}>

        {/* ── HEADER */}
        <div style={{
          padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,.07)",
          display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0,
          background:"rgba(148,100,200,.05)",
        }}>
          <div>
            <div style={{
              fontFamily:"Cormorant Garamond,serif", fontSize:21,
              color:"#c49eff", fontWeight:700, letterSpacing:"0.5px",
            }}>
              🎌 Visual Novel · EP{String(ep.num).padStart(3,"0")} — {ep.title}
            </div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.3)",marginTop:2}}>
              {phase === "ready"
                ? `${panels.length} panels · ${Object.values(panelImages).filter(v=>v&&!v.startsWith("error:")&&v!=="loading").length} images saved · style: ${VN_STYLES[ep.vnStyle||"cinematic"]?.label||"Cinematic"}`
                : `Visual Novel · style: ${VN_STYLES[ep.vnStyle||"cinematic"]?.label||"Cinematic"} · tell AI Director to change style`}
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {phase !== "generating" && (
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <button onClick={generate} style={{
                  background:"rgba(148,100,200,.2)", color:"#c49eff",
                  border:"1px solid rgba(148,100,200,.4)", borderRadius:7,
                  padding:"5px 16px", fontSize:15, cursor:"pointer", fontWeight:600,
                }}>
                  {panels.length > 0 ? "↺ Repanel" : "✦ Generate Panels"}
                </button>
                {panelsHistory.length > 1 && (
                  <details style={{position:"relative"}}>
                    <summary style={{
                      fontSize:13,color:"rgba(148,100,200,.6)",cursor:"pointer",
                      listStyle:"none",padding:"5px 10px",
                      background:"rgba(148,100,200,.1)",borderRadius:6,
                      border:"1px solid rgba(148,100,200,.2)",
                    }}>
                      📋 {panelsHistory.length} panel versions
                    </summary>
                    <div style={{
                      position:"absolute",top:"100%",left:0,zIndex:200,
                      background:"#1a1a28",border:"1px solid rgba(148,100,200,.3)",
                      borderRadius:8,padding:8,minWidth:220,marginTop:4,
                      boxShadow:"0 8px 32px rgba(0,0,0,.8)",
                    }}>
                      {[...panelsHistory].reverse().map((v,vi)=>(
                        <button key={v.id} onClick={()=>{ selectPanelsVersion(v); }}
                          style={{
                            display:"block",width:"100%",textAlign:"left",
                            padding:"7px 12px",borderRadius:6,border:"none",cursor:"pointer",
                            background: JSON.stringify(panels)===JSON.stringify(v.panels) ? "rgba(148,100,200,.2)" : "transparent",
                            color:"rgba(255,255,255,.7)",fontSize:14,marginBottom:2,
                          }}>
                          v{panelsHistory.length-vi} · {v.panels.length} panels · {new Date(v.createdAt).toLocaleTimeString()}
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
            {phase === "ready" && panels.length > 0 && (
              <>
                {(() => { const eng = IMAGE_ENGINES[imageEngine]||IMAGE_ENGINES.gemini; return (
                  <span style={{fontSize:12,padding:"3px 9px",borderRadius:20,background:"rgba(255,255,255,.06)",color:"var(--t3)",border:"1px solid var(--ln)",whiteSpace:"nowrap"}}>
                    {eng.icon} {eng.name}
                  </span>
                ); })()}
                <button onClick={()=>generateAllImages(true)}
                disabled={!!generatingImg}
                style={{
                  background: generatingImg ? "rgba(52,211,153,.08)" : "rgba(52,211,153,.18)",
                  color: generatingImg ? "rgba(52,211,153,.5)" : "#34d399",
                  border:"1px solid rgba(52,211,153,.35)", borderRadius:7,
                  padding:"5px 16px", fontSize:15, cursor: generatingImg ? "default" : "pointer", fontWeight:600,
                }}>
                {generatingImg
                  ? "⟳ Generating…"
                  : Object.values(panelImages).filter(v=>v&&!v.startsWith("error:")&&v!=="loading").length > 0
                    ? `🍌 Regenerate Images (${Object.values(panelImages).filter(v=>v&&!v.startsWith("error:")&&v!=="loading").length}/${panels.length} saved)`
                    : `✦ Generate All Scenes (${panels.length})`}
              </button>
              </>
            )}
            {phase === "generating" && (
              <span style={{fontSize:15,color:"rgba(148,100,200,.8)"}}>⟳ Writing panels…</span>
            )}
            {/* ── Quick style picker */}
            <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,.3)",letterSpacing:"1px"}}>STYLE</span>
              <select
                value={ep.vnStyle||"cinematic"}
                onChange={e=>dispatch?.({type:"SET_VN_STYLE",epId:ep.id,style:e.target.value})}
                style={{
                  fontSize:13,background:"rgba(255,255,255,.07)",
                  border:"1px solid rgba(255,255,255,.15)",borderRadius:6,
                  color:"rgba(255,255,255,.7)",padding:"3px 8px",cursor:"pointer",
                  fontFamily:"JetBrains Mono,monospace",
                }}
              >
                {VN_STYLE_NAMES.map(k=>(
                  <option key={k} value={k}>{VN_STYLES[k].label}</option>
                ))}
              </select>
              <div style={{
                fontSize:12,color:"rgba(148,100,200,.5)",
                maxWidth:120,lineHeight:1.3,
              }}>
                {VN_STYLES[ep.vnStyle||"cinematic"]?.description?.split("—")[0]?.trim().substring(0,40)}…
              </div>
            </div>
            {panels.length > 0 && (
              <button onClick={()=>setShowReader(true)} style={{
                background:"rgba(52,211,153,.12)", border:"1px solid rgba(52,211,153,.3)",
                borderRadius:7, padding:"5px 12px", color:"#34d399",
                fontSize:15, cursor:"pointer", fontWeight:600,
              }}>▶ Preview Reader</button>
            )}
            <button onClick={onClose} style={{
              background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)",
              borderRadius:7, padding:"5px 12px", color:"rgba(255,255,255,.6)",
              fontSize:16, cursor:"pointer",
            }}>✕</button>
          </div>
        </div>

        {/* ── IDLE STATE */}
        {phase === "idle" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,gap:16}}>
            <div style={{fontSize:54}}>🎌</div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:25,color:"#c49eff",letterSpacing:"1px"}}>
              Visual Novel Panel Generator
            </div>
            <div style={{fontSize:16,color:"rgba(255,255,255,.4)",maxWidth:420,textAlign:"center",lineHeight:1.75}}>
              Generates ACGN visual novel panels — anime-style CG backgrounds, character portraits, narration boxes, and dialogue in the style of Steins;Gate, Clannad, and Japanese galge/otome games.
            </div>
            {!apiKey
              ? <div style={{fontSize:15,color:"#f0a040",padding:"10px 20px",background:"rgba(240,160,64,.1)",borderRadius:8,border:"1px solid rgba(240,160,64,.3)"}}>
                  ⚠ Add your Claude API key in Settings → API Keys to generate panels
                </div>
              : <button onClick={generate} style={{
                  background:"linear-gradient(135deg,rgba(148,100,200,.4),rgba(100,60,180,.4))",
                  color:"#c49eff", border:"1px solid rgba(148,100,200,.5)",
                  borderRadius:10, padding:"10px 32px", fontSize:17,
                  cursor:"pointer", fontWeight:700, letterSpacing:"1px",
                }}>✦ Generate EP{String(ep.num).padStart(3,"0")} Panels</button>
            }
          </div>
        )}

        {/* ── GENERATING */}
        {phase === "generating" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
            <div style={{fontSize:40, animation:"spin 2s linear infinite"}}>⟳</div>
            <div style={{fontSize:17,color:"rgba(255,255,255,.5)"}}>Claude is writing your visual novel…</div>
            <div style={{fontSize:14,color:"rgba(148,100,200,.6)"}}>Usually 15–30 seconds</div>
          </div>
        )}

        {/* ── ERROR */}
        {phase === "error" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:40}}>
            <div style={{fontSize:16,color:"#ff6b6b",padding:"12px 20px",background:"rgba(255,80,80,.1)",borderRadius:8,border:"1px solid rgba(255,80,80,.3)",maxWidth:500,textAlign:"center"}}>
              {error}
            </div>
            <button onClick={generate} style={{background:"rgba(255,100,100,.15)",color:"#ff9999",border:"1px solid rgba(255,100,100,.3)",borderRadius:7,padding:"6px 20px",cursor:"pointer",fontSize:15}}>
              Retry
            </button>
          </div>
        )}

        {/* ── READY: split layout */}
        {phase === "ready" && panel && (
          <div style={{flex:1, display:"flex", overflow:"hidden", minHeight:0}}>

            {/* LEFT — phone simulator */}
            <div style={{
              width:320, flexShrink:0,
              background:"#050508",
              borderRight:"1px solid rgba(255,255,255,.06)",
              display:"flex", flexDirection:"column", alignItems:"center",
              padding:"20px 16px 16px", gap:12, overflowY:"auto",
            }}>

              {/* Phone frame */}
              <div style={{
                width:240, flexShrink:0,
                background:"#111118",
                borderRadius:36,
                border:"2px solid rgba(255,255,255,.12)",
                padding:"12px 6px",
                boxShadow:"0 0 0 1px rgba(0,0,0,.8), 0 20px 60px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06)",
                position:"relative",
              }}>
                {/* Notch */}
                <div style={{
                  position:"absolute", top:12, left:"50%", transform:"translateX(-50%)",
                  width:60, height:10, background:"#000",
                  borderRadius:"0 0 10px 10px", zIndex:100,
                }}/>
                {/* Screen */}
                <div style={{
                  borderRadius:28, overflow:"hidden",
                  height:420, position:"relative",
                  background:"#000",
                  boxShadow:"inset 0 0 0 1px rgba(255,255,255,.04)",
                }}>
                  <PhonePanel panel={panel} chars={allChars} imageDataUrl={panelImages[panel?.id]} isGenerating={generatingImg === panel?.id}/>
                </div>
                {/* Home indicator */}
                <div style={{
                  width:60, height:3, background:"rgba(255,255,255,.2)",
                  borderRadius:2, margin:"10px auto 0",
                }}/>
              </div>

              {/* Panel nav */}
              <div style={{display:"flex",alignItems:"center",gap:8,width:"100%",justifyContent:"center"}}>
                <button
                  onClick={() => setActiveIdx(i => Math.max(0, i-1))}
                  disabled={activeIdx === 0}
                  style={{
                    background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)",
                    borderRadius:7, padding:"5px 14px", color: activeIdx === 0 ? "rgba(255,255,255,.2)" : "#fff",
                    cursor: activeIdx === 0 ? "default" : "pointer", fontSize:17,
                  }}>←</button>
                <div style={{
                  fontSize:14, color:"rgba(255,255,255,.4)", fontFamily:"JetBrains Mono,monospace",
                  minWidth:60, textAlign:"center",
                }}>
                  {activeIdx+1} / {panels.length}
                </div>
                <button
                  onClick={() => setActiveIdx(i => Math.min(panels.length-1, i+1))}
                  disabled={activeIdx === panels.length-1}
                  style={{
                    background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)",
                    borderRadius:7, padding:"5px 14px",
                    color: activeIdx === panels.length-1 ? "rgba(255,255,255,.2)" : "#fff",
                    cursor: activeIdx === panels.length-1 ? "default" : "pointer", fontSize:17,
                  }}>→</button>
              </div>

              {/* Panel strip — thumbnail navigation */}
              <div style={{
                width:"100%", display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center",
              }}>
                {panels.map((p, i) => {
                  const d2 = VN_PANEL_TYPES[p.panelType] || VN_PANEL_TYPES.BG;
                  return (
                    <button key={p.id} onClick={() => setActiveIdx(i)} style={{
                      width:28, height:20, borderRadius:4, cursor:"pointer",
                      background: i === activeIdx ? d2.color : "rgba(255,255,255,.06)",
                      border: i === activeIdx ? `1px solid ${d2.color}` : "1px solid rgba(255,255,255,.1)",
                      fontSize:12, color: i === activeIdx ? "#000" : "rgba(255,255,255,.4)",
                      fontFamily:"JetBrains Mono,monospace", fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      position:"relative",
                    }}>
                      {i+1}
                      {panelImages[p.id] && !panelImages[p.id].startsWith("error:") && panelImages[p.id] !== "loading" && (
                        <div style={{
                          position:"absolute", top:1, right:1,
                          width:4, height:4, borderRadius:"50%",
                          background:"#34d399",
                        }}/>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Panel type info */}
              <div style={{
                width:"100%", padding:"10px 12px",
                background:"rgba(255,255,255,.03)", borderRadius:8,
                border:"1px solid rgba(255,255,255,.06)",
              }}>
                <div style={{
                  fontSize:12, color:def.color, letterSpacing:"1.5px",
                  textTransform:"uppercase", fontWeight:700, marginBottom:6,
                  fontFamily:"JetBrains Mono,monospace",
                }}>
                  {def.icon} {def.label}
                </div>
                {panelChars.length > 0 && (
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                    {panelChars.map(c=>(
                      <span key={c.id} style={{
                        fontSize:12, padding:"2px 8px", borderRadius:4,
                        background:(c.color||"#888")+"18", color:c.color||"#aaa",
                        border:`1px solid ${c.color||"#888"}30`,
                        fontFamily:"JetBrains Mono,monospace",
                      }}>{c.name.split(" ")[0]}</span>
                    ))}
                  </div>
                )}
                {panel.lighting && <div style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>💡 {panel.lighting}</div>}
                {panel.mood    && <div style={{fontSize:12,color:"rgba(255,255,255,.25)",marginTop:2}}>◐ {panel.mood}</div>}
                {panel.notes   && <div style={{fontSize:12,color:"rgba(255,255,255,.2)",marginTop:4,fontStyle:"italic"}}>{panel.notes}</div>}
              </div>
            </div>

            {/* RIGHT — production prompts */}
            <div style={{flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:16}}>

              {/* Tab selector */}
              <div style={{display:"flex",gap:0,background:"rgba(255,255,255,.04)",borderRadius:9,padding:3,border:"1px solid rgba(255,255,255,.08)",width:"fit-content"}}>
                {[
                  {id:"image", label:"🎨 Image Prompt", sub:"→ Midjourney / DALL-E"},
                  {id:"text",  label:"💬 Text Overlay", sub:"→ place on image"},
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    background: activeTab === tab.id ? (tab.id==="image"?"rgba(148,100,200,.3)":"rgba(201,168,76,.2)") : "transparent",
                    border: "none",
                    borderRadius:7, padding:"7px 20px", cursor:"pointer",
                    color: activeTab === tab.id ? (tab.id==="image"?"#c49eff":"var(--gold)") : "rgba(255,255,255,.35)",
                    fontSize:15, fontWeight: activeTab === tab.id ? 700 : 400,
                    transition:"all .15s",
                  }}>
                    {tab.label}
                    <div style={{fontSize:12,opacity:.6,marginTop:1}}>{tab.sub}</div>
                  </button>
                ))}
              </div>

              {/* Image prompt */}
              {activeTab === "image" && (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{
                    borderRadius:10, overflow:"hidden",
                    border:"1px solid rgba(148,100,200,.3)",
                    background:"rgba(148,100,200,.05)",
                  }}>
                    <div style={{
                      display:"flex",justifyContent:"space-between",alignItems:"center",
                      padding:"10px 16px",background:"rgba(148,100,200,.1)",
                      borderBottom:"1px solid rgba(148,100,200,.2)",
                    }}>
                      <div>
                        <div style={{fontSize:14,color:"#c49eff",fontWeight:700,letterSpacing:"0.5px"}}>
                          Image Generation Prompt
                        </div>
                        <div style={{fontSize:12,color:"rgba(148,100,200,.6)",marginTop:2}}>
                          Copy for Midjourney/DALL-E, or click Generate for AI SVG art
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button
                          onClick={() => generateImage(panel.id, imagePrompt)}
                          disabled={generatingImg === panel.id}
                          style={{
                            background: generatingImg===panel.id ? "rgba(52,211,153,.08)" : "rgba(52,211,153,.18)",
                            color: generatingImg===panel.id ? "rgba(52,211,153,.4)" : "#34d399",
                            border:"1px solid rgba(52,211,153,.3)",
                            borderRadius:7, padding:"6px 14px",
                            fontSize:15, cursor: generatingImg===panel.id ? "default" : "pointer", fontWeight:700,
                            whiteSpace:"nowrap",
                          }}
                        >
                          {generatingImg===panel.id ? "⟳" : "✦ Generate"}
                        </button>
                        <button
                          onClick={() => doCopy(imagePrompt, panel.id, "image")}
                          style={{
                            background: wasCopied(panel.id,"image") ? "rgba(74,173,117,.25)" : "rgba(148,100,200,.25)",
                            color: wasCopied(panel.id,"image") ? "#6dba8a" : "#c49eff",
                            border: `1px solid ${wasCopied(panel.id,"image") ? "rgba(74,173,117,.4)" : "rgba(148,100,200,.4)"}`,
                            borderRadius:7, padding:"6px 16px",
                            fontSize:15, cursor:"pointer", fontWeight:700,
                          }}
                        >
                          {wasCopied(panel.id,"image") ? "✓" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <pre
                      onClick={() => doCopy(imagePrompt, panel.id, "image")}
                      style={{
                        margin:0, padding:"14px 16px",
                        fontFamily:"JetBrains Mono,monospace", fontSize:11, lineHeight:1.7,
                        color:"rgba(255,255,255,.8)", whiteSpace:"pre-wrap",
                        wordBreak:"break-word", cursor:"pointer",
                      }}
                    >{imagePrompt}</pre>
                  </div>

                  {/* ── IMAGE VERSION HISTORY */}
                  {(imageHistory[panel.id]||[]).length > 0 && (
                    <div style={{borderRadius:8,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:"rgba(255,255,255,.03)"}}>
                        <span style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:"JetBrains Mono,monospace",letterSpacing:"1px"}}>
                          📸 IMAGE VERSIONS ({(imageHistory[panel.id]||[]).length})
                        </span>
                        <button onClick={()=>setShowVersions(showVersions===panel.id?null:panel.id)}
                          style={{fontSize:13,color:"rgba(148,100,200,.7)",background:"none",border:"none",cursor:"pointer"}}>
                          {showVersions===panel.id?"▲ hide":"▼ show"}
                        </button>
                      </div>
                      {showVersions===panel.id && (
                        <div style={{display:"flex",gap:8,padding:"10px 12px",flexWrap:"wrap"}}>
                          {(imageHistory[panel.id]||[]).map((v,vi)=>(
                            <div key={v.id} style={{position:"relative",cursor:"pointer"}} onClick={()=>selectImageVersion(panel.id,v)}>
                              <img src={v.dataUrl} alt="" style={{
                                width:64,height:90,objectFit:"cover",borderRadius:6,
                                border: v.active ? "2px solid #34d399" : "2px solid rgba(255,255,255,.1)",
                                display:"block",
                              }}/>
                              <div style={{
                                position:"absolute",bottom:2,left:0,right:0,textAlign:"center",
                                fontSize:12,color:"#fff",fontFamily:"JetBrains Mono,monospace",
                                background:"rgba(0,0,0,.7)",borderRadius:"0 0 4px 4px",padding:"1px",
                              }}>v{vi+1}{v.active?" ✓":""}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Text overlay spec */}
              {activeTab === "text" && (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {textSpec ? (
                    <div style={{
                      borderRadius:10, overflow:"hidden",
                      border:"1px solid rgba(201,168,76,.25)",
                      background:"rgba(201,168,76,.04)",
                    }}>
                      <div style={{
                        display:"flex",justifyContent:"space-between",alignItems:"center",
                        padding:"10px 16px",background:"rgba(201,168,76,.08)",
                        borderBottom:"1px solid rgba(201,168,76,.15)",
                      }}>
                        <div>
                          <div style={{fontSize:14,color:"#c8a84a",fontWeight:700,letterSpacing:"0.5px"}}>
                            Text Overlay Specification
                          </div>
                          <div style={{fontSize:12,color:"rgba(201,168,76,.5)",marginTop:2}}>
                            Instructions for placing text over the generated image
                          </div>
                        </div>
                        <button
                          onClick={() => doCopy(textSpec, panel.id, "text")}
                          style={{
                            background: wasCopied(panel.id,"text")
                              ? "rgba(74,173,117,.25)" : "rgba(201,168,76,.2)",
                            color: wasCopied(panel.id,"text")
                              ? "#6dba8a" : "#c8a84a",
                            border:`1px solid ${wasCopied(panel.id,"text")
                              ? "rgba(74,173,117,.4)" : "rgba(201,168,76,.35)"}`,
                            borderRadius:7, padding:"6px 20px",
                            fontSize:15, cursor:"pointer", fontWeight:700,
                          }}
                        >
                          {wasCopied(panel.id,"text") ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre
                        onClick={() => doCopy(textSpec, panel.id, "text")}
                        style={{
                          margin:0, padding:"14px 16px",
                          fontFamily:"JetBrains Mono,monospace", fontSize:11, lineHeight:1.7,
                          color:"rgba(255,255,255,.8)", whiteSpace:"pre-wrap",
                          wordBreak:"break-word", cursor:"pointer",
                        }}
                      >{textSpec}</pre>
                    </div>
                  ) : (
                    <div style={{
                      padding:"32px", textAlign:"center",
                      color:"rgba(255,255,255,.25)", fontSize:15,
                      border:"1px solid rgba(255,255,255,.06)", borderRadius:10,
                    }}>
                      No text overlay for this panel type ({panel.panelType})
                    </div>
                  )}

                  {/* Visual preview of text content */}
                  {(panel.narration || panel.dialogue) && (
                    <div style={{
                      borderRadius:10, padding:"16px",
                      border:"1px solid rgba(255,255,255,.07)",
                      background:"rgba(255,255,255,.02)",
                      display:"flex", flexDirection:"column", gap:10,
                    }}>
                      <div style={{fontSize:13,color:"rgba(255,255,255,.3)",letterSpacing:"1px",textTransform:"uppercase",fontFamily:"JetBrains Mono,monospace"}}>
                        Text Content Preview
                      </div>
                      {panel.narration && (
                        <div style={{padding:"10px 14px",background:"rgba(0,0,0,.4)",borderRadius:7,borderLeft:"2px solid rgba(255,255,255,.2)"}}>
                          <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginBottom:4,letterSpacing:"1px",textTransform:"uppercase"}}>narration</div>
                          <div style={{fontSize:16,color:"rgba(255,255,255,.75)",fontStyle:"italic",lineHeight:1.6}}>{panel.narration}</div>
                        </div>
                      )}
                      {panel.dialogue && (
                        <div style={{padding:"10px 14px",background:"rgba(0,0,0,.4)",borderRadius:7,borderLeft:`2px solid ${def.color}`}}>
                          {panel.speaker && <div style={{fontSize:12,color:def.color,marginBottom:4,letterSpacing:"1px",textTransform:"uppercase",fontWeight:700}}>{panel.speaker}</div>}
                          <div style={{fontSize:17,color:"#fff",lineHeight:1.6}}>"{panel.dialogue}"</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── AUTO-GENERATE EPISODE MODAL — full pipeline (fixed stale-state bug)
function AutoGenerateModal({ state, dispatch, ep, onClose }) {
  const hasSegs     = (ep.segments?.length || 0) > 0;
  const hasClaude   = !!state.apiKey;
  const hasJimeng   = !!state.jimengKey;

  // phase: idle | writing | submitting | polling | done | done_manual | error
  const [phase, setPhase]     = useState("idle");
  const [msg, setMsg]         = useState("");
  const [pct, setPct]         = useState(0);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null); // { segments, videoSubmitted }

  const running = phase === "writing" || phase === "submitting" || phase === "polling";

  const onStatus = (m, p) => { setMsg(m); setPct(p); };

  const run = async () => {
    setError(null); setResult(null);
    setPhase(hasSegs ? "submitting" : "writing");
    try {
      const res = await autoGenerateEpisode({ state, dispatch, epId: ep.id, onStatus });
      setResult(res);
      setPhase(res.videoSubmitted ? "done" : "done_manual");
    } catch(err) {
      setError(err.message);
      setPhase("error");
    }
  };

  const STEPS = [
    {
      id: "write",
      icon: "✦", label: "Write episode content",
      sub: "Claude generates cinematic segment prompts from your series bible",
      done: hasSegs || phase === "submitting" || phase === "polling" || phase === "done" || phase === "done_manual",
      active: phase === "writing",
    },
    {
      id: "submit",
      icon: "▶", label: "Submit to Seedance 2.0",
      sub: "Each segment queued to Jimeng video generation API",
      done: phase === "done",
      active: phase === "submitting" || phase === "polling",
      skip: !hasJimeng,
    },
    {
      id: "load",
      icon: "⬇", label: "Auto-load video results",
      sub: "Polls every 5s — finished videos appear instantly in segment view",
      done: phase === "done",
      active: phase === "polling",
      skip: !hasJimeng,
    },
  ];

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && !running && onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:24,maxWidth:500,width:"96%"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)"}}>Generate Episode Video</div>
            <div style={{fontSize:14,color:"var(--t3)",marginTop:2}}>EP{String(ep.num).padStart(3,"0")} · {ep.title}</div>
          </div>
          {!running && <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>}
        </div>

        {/* Pipeline */}
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
          {STEPS.map(s => (
            <div key={s.id} style={{
              display:"flex",gap:11,alignItems:"center",padding:"9px 12px",borderRadius:8,
              background: s.done ? "rgba(74,173,117,.07)" : s.active ? "rgba(72,120,200,.08)" : "var(--bg3)",
              border: `1px solid ${s.done ? "rgba(74,173,117,.22)" : s.active ? "rgba(72,120,200,.25)" : "var(--ln)"}`,
              opacity: s.skip ? 0.4 : 1,
            }}>
              <div style={{
                width:22,height:22,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,
                background: s.done ? "var(--green)" : s.active ? "var(--blue)" : "var(--bg4)",
                color: s.done || s.active ? "white" : "var(--t4)",
                ...(s.active ? {animation:"pulse 1.5s infinite"} : {}),
              }}>{s.done ? "✓" : s.active ? "…" : s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:500,color: s.done ? "var(--green2)" : s.active ? "var(--blue2)" : "var(--t2)"}}>{s.label}{s.skip?" — skipped (no Jimeng key)":""}</div>
                <div style={{fontSize:13,color:"var(--t4)",marginTop:1}}>{s.sub}</div>
              </div>
              {s.done && <span style={{fontSize:13,color:"var(--green2)",flexShrink:0}}>✓</span>}
              {s.active && <span style={{fontSize:13,color:"var(--blue2)",flexShrink:0}}>Running</span>}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {running && (
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:5,color:"var(--t2)"}}>
              <span>{msg}</span>
              <span style={{fontFamily:"JetBrains Mono,monospace",color:"var(--t3)"}}>{pct}%</span>
            </div>
            <div className="prog-track" style={{height:3}}>
              <div className="prog-fill" style={{width:`${pct}%`,background:"var(--gold)",transition:"width .4s"}}/>
            </div>
          </div>
        )}

        {/* Messages */}
        {!hasClaude && !hasSegs && (
          <div className="callout co-red" style={{fontSize:14,marginBottom:12}}>
            ⚠ No Claude API key. Add it in <strong>Settings → API Keys</strong> to generate episode content.
          </div>
        )}
        {!hasJimeng && (
          <div className="callout co-amber" style={{fontSize:14,marginBottom:12}}>
            No Jimeng key — videos won't auto-generate. After writing, use <strong>📋 Prompt Sheet</strong> to copy prompts for manual generation.
          </div>
        )}
        {error && <div className="callout co-red" style={{fontSize:14,marginBottom:12}}>✗ {error}</div>}
        {phase === "done" && (
          <div className="callout co-green" style={{fontSize:14,marginBottom:12}}>
            ✓ {result?.segments?.length || 0} segments submitted to Seedance 2.0. Videos loading automatically — watch the queue below.
          </div>
        )}
        {phase === "done_manual" && (
          <div className="callout co-amber" style={{fontSize:14,marginBottom:12}}>
            ✓ {result?.segments?.length || 0} segments written. Use <strong>📋 Prompt Sheet</strong> to generate videos manually in Jimeng.
          </div>
        )}

        {/* Footer */}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",alignItems:"center"}}>
          {(phase === "idle" || phase === "error") && (
            <span style={{fontSize:13,color:"var(--t4)",marginRight:"auto"}}>
              {hasSegs ? `${ep.segments.length} segs ready` : "No segments yet"}{hasJimeng ? " · auto video" : " · manual mode"}
            </span>
          )}
          <button className="btn btn-ghost" onClick={onClose} disabled={running}>
            {phase === "done" || phase === "done_manual" ? "Close" : "Cancel"}
          </button>
          {(phase === "idle" || phase === "error") && (
            <button className="btn btn-gold" disabled={!hasClaude && !hasSegs} onClick={run}>
              {hasSegs
                ? (hasJimeng ? "▶ Generate Videos" : "📋 Generate Prompts")
                : (hasJimeng ? "✦ Write & Generate" : "✦ Write Episode")}
            </button>
          )}
          {running && <button className="btn btn-ghost" disabled>⏳ Running…</button>}
        </div>
      </div>
    </div>
  );
}

const SC = {
  StatusBadge: ({s}) => {
    const m = {done:"bd-green",running:"bd-blue",queued:"bd-gold",pending:"bd-ghost",failed:"bd-red",not_started:"bd-ghost",in_progress:"bd-gold",active:"bd-green",planning:"bd-ghost"};
    return <span className={`badge ${m[s]||"bd-ghost"}`}><span className={`badge-dot${s==="running"?" pulse":""}`}/>{s?.replace(/_/g," ")}</span>;
  },
  SegType: ({t}) => <div className={`st st${t}`}>{t}</div>,
  Pill: ({t}) => { const m={drama:"bd-gold",game:"bd-blue",film:"bd-ghost",anime:"bd-ghost"}; return <span className={`badge ${m[t]||"bd-ghost"}`}>{t}</span>; },
};
const STATUS_C = {done:"#4aad75",running:"#4878c8",queued:"#c9a84c",pending:"#3a3e50",failed:"#d05050"};

// ═══════════════════════════════════════════════════════════════════
// PROJECT GENERATOR MODAL
// ═══════════════════════════════════════════════════════════════════
const EXAMPLE_PROMPTS = [
  {
    label:"Fashion Drama",
    text:`HOHF is a 100-episode interactive fashion drama set inside Maison Lumière, Paris. Two player characters: Raphael Dubois (39, Head Designer) and Celeste Alastair (23, new intern, founder's granddaughter). The central mystery: the house's iconic 1974 anniversary collar was secretly designed by Henri Alastair — the founder's estranged brother — whose name was erased. The envelope arrives in Episode 1. Henri stands outside the building every day. The truth will destroy or save the house.`
  },
  {
    label:"Cyberpunk Thriller",
    text:`SIGNAL/NOISE is a 24-episode cyberpunk visual novel set in 2077 Neo-Osaka. The player is Kira Tanaka, a memory-extraction technician who discovers she has been extracting her own repressed memories and selling them. Her client — who she's been meeting weekly for six months — is herself, in a different identity. The city's largest corp is funding the program. Her partner Rio knows something he's not telling her.`
  },
  {
    label:"Period Mystery",
    text:`THE AMBER VERDICT is a 40-episode period mystery set in 1920s Shanghai. Magistrate Shen Wei investigates the apparent suicide of a British diplomat — but the suicide note is in a handwriting style that won't exist for another 20 years. His assistant, the brilliant and socially invisible Mei Fong, speaks six languages and reads crime scenes like music. The foreign concession doesn't want the case solved. Shen Wei's estranged father is implicated by the third episode.`
  },
];

function ProjectGenerator({ apiKey, onGenerated, onClose }) {
  const [step, setStep]           = useState("input"); // input | generating | preview | done
  const [prompt, setPrompt]       = useState("");
  const [progress, setProgress]   = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [generated, setGenerated] = useState(null);
  const [error, setError]         = useState(null);
  const [previewTab, setPreviewTab] = useState("project");
  const [animatedSections, setAnimatedSections] = useState([]);

  const SECTIONS = [
    { key:"project",    label:"Project",      icon:"⊞", color:"var(--gold2)" },
    { key:"characters", label:"Characters",   icon:"🎭", color:"var(--blue2)" },
    { key:"rels",       label:"Relationships",icon:"🕸",  color:"var(--purple2)" },
    { key:"world",      label:"World Facts",  icon:"🌍", color:"var(--green2)" },
    { key:"endings",    label:"Endings",      icon:"🏁", color:"var(--amber2)" },
    { key:"episodes",   label:"Episodes",     icon:"🎬", color:"var(--red2)" },
    { key:"assets",     label:"Assets",       icon:"🗂",  color:"var(--t2)" },
  ];

  const onProgress = (msg, pct) => {
    setProgressMsg(msg);
    setProgress(pct);
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    if (!apiKey) { setError("No API key set. Go to Settings → Anthropic API Key."); return; }
    setStep("generating"); setError(null); setAnimatedSections([]);

    // Animated progress steps
    const steps = [
      [8,  "Reading your concept…"],
      [18, "Designing characters…"],
      [30, "Building relationships…"],
      [42, "Writing story bible…"],
      [55, "Scripting Episode 1…"],
      [67, "Scripting Episode 2…"],
      [78, "Scripting Episode 3…"],
      [88, "Generating episode stubs…"],
      [94, "Assembling assets list…"],
    ];
    let si = 0;
    const ticker = setInterval(() => {
      if (si < steps.length) { setProgress(steps[si][0]); setProgressMsg(steps[si][1]); si++; }
    }, 1800);

    try {
      const data = await callGeneratorAPI(apiKey, prompt, onProgress);
      clearInterval(ticker);
      setProgress(100); setProgressMsg("Project ready!");
      setGenerated(data);

      // Animate sections appearing one by one
      const keys = ["project","characters","rels","world","endings","episodes","assets"];
      keys.forEach((k, i) => setTimeout(() => setAnimatedSections(prev => [...prev, k]), i * 180));

      setTimeout(() => setStep("preview"), 600);
    } catch (e) {
      clearInterval(ticker);
      setError(e.message);
      setStep("input");
    }
  };

  const commit = () => {
    if (!generated) return;
    onGenerated(generated);
    onClose();
  };

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"var(--bg2)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:16,
        width:"90vw", maxWidth:900, maxHeight:"88vh", display:"flex", flexDirection:"column",
        overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.8)"
      }}>
        {/* Header */}
        <div style={{padding:"20px 24px 16px", borderBottom:"1px solid var(--ln)", flexShrink:0, display:"flex", alignItems:"flex-start", justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"Cormorant Garamond,serif", fontSize:25, color:"var(--gold2)", fontWeight:700}}>
              {step==="input" ? "✦ New Project" : step==="generating" ? "✦ Generating…" : "✦ Review Project"}
            </div>
            <div style={{fontSize:15, color:"var(--t3)", marginTop:3}}>
              {step==="input" ? "Paste your concept. Claude will generate the entire project — bible, characters, episodes, assets." :
               step==="generating" ? "Claude is writing your production bible, characters, and first three episodes." :
               "Review what was generated. Click Commit to load it into the system."}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{flexShrink:0, marginTop:3}}>✕</button>
        </div>

        {/* Body */}
        <div style={{flex:1, overflow:"hidden", display:"flex", flexDirection:"column"}}>

          {/* INPUT STEP */}
          {step==="input" && (
            <div style={{flex:1, overflow:"auto", padding:"20px 24px"}}>
              {error && <div className="callout co-red" style={{marginBottom:14}}>⚠ {error}</div>}

              <div className="fg">
                <label className="fl">Your project concept</label>
                <textarea className="ft" value={prompt} onChange={e=>setPrompt(e.target.value)}
                  style={{minHeight:180, fontFamily:"DM Sans,sans-serif", fontSize:16, lineHeight:1.7}}
                  placeholder={"Describe your series concept. Include:\n• Setting, genre, tone\n• Player character(s) and their situation\n• The central secret or mystery\n• A few key supporting characters\n• The inciting incident\n\nThe more specific, the better. You can paste your original development notes directly."}
                />
              </div>

              <div style={{marginBottom:18}}>
                <div style={{fontSize:13, color:"var(--t3)", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:10}}>— or try an example —</div>
                <div style={{display:"flex", flexDirection:"column", gap:8}}>
                  {EXAMPLE_PROMPTS.map((ex,i)=>(
                    <div key={i} style={{padding:"10px 13px", borderRadius:8, border:"1px solid var(--ln)", background:"var(--bg3)", cursor:"pointer", transition:"all .12s"}}
                      onClick={()=>setPrompt(ex.text)}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.3)"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="var(--ln)"}>
                      <div style={{fontSize:14, fontWeight:600, color:"var(--gold2)", marginBottom:4}}>{ex.label}</div>
                      <div style={{fontSize:14, color:"var(--t3)", lineHeight:1.5}}>{ex.text.substring(0,120)}…</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="callout co-blue" style={{marginBottom:18}}>
                <strong style={{color:"var(--blue2)"}}>What gets generated:</strong> Project metadata · {" "}
                Full story bible (characters, relationships, world facts, endings, decision points) · {" "}
                3 complete scripted episodes with full segment prompts · {" "}
                Stub titles for all remaining episodes · Asset suggestions
              </div>
            </div>
          )}

          {/* GENERATING STEP */}
          {step==="generating" && (
            <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40}}>
              <div style={{width:320, textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif", fontSize:32, color:"var(--gold2)", marginBottom:6, fontStyle:"italic"}}>{progressMsg}</div>
                <div style={{fontSize:15, color:"var(--t3)", marginBottom:28}}>
                  This takes about 30–45 seconds. Claude is writing full cinematic prompts for every scene.
                </div>
                <div className="prog-track" style={{height:4, marginBottom:12}}><div className="prog-fill" style={{width:`${progress}%`, background:"var(--gold)", height:"100%"}}/></div>
                <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:14, color:"var(--t3)"}}>{progress}%</div>

                <div style={{marginTop:32, display:"flex", flexDirection:"column", gap:7, textAlign:"left"}}>
                  {[
                    "Project metadata + genre",
                    "Characters with secrets and arcs",
                    "Relationship map + tensions",
                    "World facts + story bible",
                    "Possible endings + probabilities",
                    "Decision points across series",
                    "Episode 1 — full scene script",
                    "Episode 2 — full scene script",
                    "Episode 3 — full scene script",
                    "All episode stubs + titles",
                    "IP asset suggestions",
                  ].map((item, i) => {
                    const pct = (i / 10) * 100;
                    const done = progress > pct + 5;
                    const active = progress >= pct && progress <= pct + 12;
                    return (
                      <div key={i} style={{display:"flex", alignItems:"center", gap:9, opacity: done ? 1 : active ? 0.9 : 0.3, transition:"opacity .4s"}}>
                        <div style={{width:14, height:14, borderRadius:"50%", flexShrink:0, border:`1px solid ${done?"var(--green)":active?"var(--gold)":"var(--t4)"}`, background:done?"var(--green)":active?"var(--gold)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--bg)", transition:"all .3s"}}>
                          {done?"✓":active?<span className="spin-sm" style={{borderTopColor:"var(--bg)", width:7, height:7, border:"1.5px solid rgba(0,0,0,.2)"}}/>:""}
                        </div>
                        <span style={{fontSize:14, color: done?"var(--t1)":active?"var(--gold2)":"var(--t3)"}}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW STEP */}
          {step==="preview" && generated && (
            <div style={{flex:1, display:"flex", overflow:"hidden"}}>
              {/* Section nav */}
              <div style={{width:150, borderRight:"1px solid var(--ln)", padding:"14px 8px", flexShrink:0, overflowY:"auto"}}>
                {SECTIONS.map(s => {
                  const isReady = animatedSections.includes(s.key);
                  return (
                    <div key={s.key}
                      className={previewTab===s.key?"nav-item on":"nav-item"}
                      style={{opacity: isReady?1:0.3, transition:"opacity .3s", fontSize:14}}
                      onClick={()=>isReady&&setPreviewTab(s.key)}>
                      <span style={{fontSize:17}}>{s.icon}</span> {s.label}
                    </div>
                  );
                })}
              </div>

              {/* Preview content */}
              <div style={{flex:1, overflow:"auto", padding:"18px 20px"}}>
                {previewTab==="project" && (
                  <div>
                    <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:18}}>
                      <div style={{width:14, height:14, borderRadius:"50%", background:generated.project?.color, flexShrink:0}}/>
                      <div style={{fontFamily:"Cormorant Garamond,serif", fontSize:25, color:"var(--gold2)", fontWeight:700}}>{generated.project?.name}</div>
                      <span className="badge bd-gold">{generated.project?.type}</span>
                    </div>
                    <div className="g2" style={{marginBottom:16}}>
                      {[["Genre",generated.project?.genre],["Episodes",generated.project?.episodes],["Ep Runtime",`${generated.project?.epRuntime}s`],["Status",generated.project?.status]].map(([l,v])=>(
                        <div key={l} className="card"><div style={{fontSize:13,color:"var(--t3)",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:16,color:"var(--t1)"}}>{v}</div></div>
                      ))}
                    </div>
                    <div className="card">
                      <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,color:"var(--gold2)",marginBottom:8}}>Series Synopsis</div>
                      <div style={{fontSize:16,color:"var(--t2)",lineHeight:1.7}}>{generated.project?.desc}</div>
                    </div>
                  </div>
                )}

                {previewTab==="characters" && (
                  <div>
                    <div style={{marginBottom:14,fontSize:15,color:"var(--t3)"}}>{generated.bible?.characters?.length} characters generated</div>
                    {generated.bible?.characters?.map((c,i)=>(
                      <div key={i} className="card" style={{marginBottom:10,borderLeft:`3px solid ${c.color}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                          <div>
                            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:19,color:"var(--gold2)",fontWeight:600}}>{c.name}</div>
                            <div style={{fontSize:14,color:"var(--t3)"}}>Age {c.age} · {c.archetype} · EP{c.firstEp}+</div>
                          </div>
                          <span className="badge bd-ghost">{c.role}</span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                          {[["Motivation",c.motivation],["Secret",c.secret],["Appearance",c.appearance],["Arc",c.arc]].map(([l,v])=>(
                            <div key={l}><div style={{fontSize:12,color:"var(--t4)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:3}}>{l}</div><div style={{fontSize:14,color:"var(--t2)",lineHeight:1.5}}>{v}</div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {previewTab==="rels" && (
                  <div>
                    <div style={{marginBottom:14,fontSize:15,color:"var(--t3)"}}>{generated.bible?.relationships?.length} relationships generated</div>
                    <table>
                      <thead><tr><th>From</th><th>To</th><th>Type</th><th>Description</th><th>Tension</th></tr></thead>
                      <tbody>
                        {generated.bible?.relationships?.map((r,i)=>(
                          <tr key={i}>
                            <td><span style={{color:"var(--gold2)",fontFamily:"Cormorant Garamond,serif"}}>{generated.bible.characters?.find(c=>c.id===r.from)?.name||r.from}</span></td>
                            <td><span style={{color:"var(--gold2)",fontFamily:"Cormorant Garamond,serif"}}>{generated.bible.characters?.find(c=>c.id===r.to)?.name||r.to}</span></td>
                            <td><span className="badge bd-ghost">{r.type}</span></td>
                            <td style={{fontSize:14,color:"var(--t2)"}}>{r.label}</td>
                            <td><span style={{color:TENSION_C[r.tension]||"var(--t3)",fontSize:14}}>{r.tension}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewTab==="world" && (
                  <div>
                    {generated.bible?.worldFacts?.map((f,i)=>(
                      <div key={i} className="card" style={{marginBottom:8}}>
                        <div style={{fontSize:13,color:"var(--gold)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>{f.category}</div>
                        <div style={{fontSize:16,color:"var(--t2)",lineHeight:1.6}}>{f.fact}</div>
                      </div>
                    ))}
                  </div>
                )}

                {previewTab==="endings" && (
                  <div className="g2">
                    {generated.bible?.endings?.map((e,i)=>(
                      <div key={i} className="card" style={{borderLeft:`3px solid ${e.color}`}}>
                        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,color:"var(--gold2)",marginBottom:4}}>{e.label}</div>
                        <div style={{fontSize:15,color:"var(--t2)",marginBottom:10,lineHeight:1.5}}>{e.desc}</div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div className="prog-track" style={{flex:1,height:4}}><div className="prog-fill" style={{width:`${e.prob}%`,background:e.color,height:"100%"}}/></div>
                          <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:15,color:e.color}}>{e.prob}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {previewTab==="episodes" && (
                  <div>
                    <div style={{marginBottom:14,fontSize:15,color:"var(--t3)"}}>
                      {generated.episodes?.filter(e=>e.segments?.length>0).length} fully scripted · {" "}
                      {generated.episodes?.filter(e=>!e.segments?.length).length} stubs · {" "}
                      {generated.episodes?.reduce((a,e)=>a+(e.segments?.length||0),0)} total segments
                    </div>
                    {generated.episodes?.slice(0,5).map((ep,i)=>(
                      <div key={i} className="card" style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:ep.segments?.length?10:0}}>
                          <div>
                            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--t3)",marginRight:9}}>EP{String(ep.num).padStart(3,"0")}</span>
                            <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,color:"var(--gold2)"}}>{ep.title}</span>
                          </div>
                          {ep.segments?.length>0 && <span className="badge bd-green">{ep.segments.length} segs</span>}
                          {!ep.segments?.length && <span className="badge bd-ghost">stub</span>}
                        </div>
                        {ep.segments?.slice(0,3).map((s,j)=>(
                          <div key={j} style={{fontSize:14,color:"var(--t3)",padding:"4px 0",borderTop:"1px solid var(--ln2)",display:"flex",gap:8}}>
                            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,width:16,color:"var(--t4)"}}>{String(j+1).padStart(2,"0")}</span>
                            <div className={`st st${s.type}`} style={{width:16,height:16,fontSize:12}}>{s.type}</div>
                            <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.prompt?.split("\n")[0]?.substring(0,80)}</span>
                          </div>
                        ))}
                        {ep.segments?.length>3 && <div style={{fontSize:13,color:"var(--t4)",marginTop:4,paddingTop:4,borderTop:"1px solid var(--ln2)"}}>+{ep.segments.length-3} more segments</div>}
                      </div>
                    ))}
                    {generated.episodes?.length>5 && (
                      <div className="callout co-gold">…and {generated.episodes.length-5} more episode titles/stubs. All will be loaded into the system.</div>
                    )}
                  </div>
                )}

                {previewTab==="assets" && (
                  <div className="g3">
                    {generated.assets?.map((a,i)=>(
                      <div key={i} className="asset-card">
                        <div className="asset-thumb">{a.thumb}</div>
                        <div className="asset-info">
                          <div className="asset-name">{a.name}</div>
                          <div className="asset-meta">{a.format} · {a.size}</div>
                          <span className={`asset-tag at-${a.type}`}>{a.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 24px", borderTop:"1px solid var(--ln)", flexShrink:0, display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--bg)"}}>
          {step==="input" && (
            <>
              <div style={{fontSize:14,color:"var(--t3)"}}>
                {apiKey ? <span style={{color:"var(--green2)"}}>● API key configured</span> : <span style={{color:"var(--red2)"}}>⚠ No API key — set in Settings first</span>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn-gold" disabled={!prompt.trim()||!apiKey} onClick={generate}>
                  ✦ Generate Project →
                </button>
              </div>
            </>
          )}
          {step==="generating" && (
            <div style={{fontSize:15,color:"var(--t3)",width:"100%",textAlign:"center"}}>Claude is writing your project…</div>
          )}
          {step==="preview" && (
            <>
              <div style={{fontSize:14,color:"var(--t3)"}}>
                This will replace the current active project with generated content.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-ghost" onClick={()=>{setStep("input");setGenerated(null);}}>← Regenerate</button>
                <button className="btn btn-gold" onClick={commit}>✦ Commit to Project</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BOOK TO PROJECT MODAL — upload or paste a book, generate entire project
// ═══════════════════════════════════════════════════════════════════
function BookToProjectModal({ apiKey, onGenerated, onClose, existingProject }) {
  const [step, setStep]             = useState("config"); // config | generating | preview
  const [bookText, setBookText]     = useState("");
  const [fileName, setFileName]     = useState("");
  const [totalEpisodes, setTotalEpisodes] = useState(12);
  const [epMinutes, setEpMinutes]   = useState(3);
  const [progress, setProgress]     = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [generated, setGenerated]   = useState(null);
  const [error, setError]           = useState(null);
  const [previewTab, setPreviewTab] = useState("project");
  const [animatedSections, setAnimatedSections] = useState([]);
  const fileInputRef = useRef(null);

  const SECTIONS = [
    { key:"project",    label:"Project",      icon:"⊞" },
    { key:"characters", label:"Characters",   icon:"🎭" },
    { key:"world",      label:"World Facts",  icon:"🌍" },
    { key:"episodes",   label:"Episodes",     icon:"🎬" },
    { key:"assets",     label:"Assets",       icon:"🗂" },
  ];

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setBookText(typeof text === "string" ? text : "");
    };
    // For PDF files, read as text (works for text-layer PDFs)
    reader.readAsText(file);
  };

  const generate = async () => {
    if (!bookText.trim()) { setError("Please upload or paste book content."); return; }
    if (!apiKey) { setError("No API key set. Go to Settings → Anthropic API Key."); return; }
    setStep("generating"); setError(null); setAnimatedSections([]);

    const steps = [
      [8,  "Reading source material…"],
      [18, "Identifying characters…"],
      [30, "Mapping relationships…"],
      [42, "Building story bible…"],
      [55, "Adapting Episode 1…"],
      [67, "Adapting Episode 2…"],
      [78, "Adapting Episode 3…"],
      [88, "Planning episode arc…"],
      [94, "Assembling assets list…"],
    ];
    let si = 0;
    const ticker = setInterval(() => {
      if (si < steps.length) { setProgress(steps[si][0]); setProgressMsg(steps[si][1]); si++; }
    }, 1800);

    try {
      const data = await callBookToProjectAPI(apiKey, bookText, totalEpisodes, epMinutes * 60,
        (msg, pct) => { setProgressMsg(msg); setProgress(pct); });
      clearInterval(ticker);
      setProgress(100); setProgressMsg("Adaptation ready!");
      setGenerated(data);
      const keys = ["project","characters","world","episodes","assets"];
      keys.forEach((k, i) => setTimeout(() => setAnimatedSections(prev => [...prev, k]), i * 180));
      setTimeout(() => setStep("preview"), 600);
    } catch (e) {
      clearInterval(ticker);
      setError(e.message);
      setStep("config");
    }
  };

  const commit = () => {
    if (!generated) return;
    onGenerated(generated);
    onClose();
  };

  const epRuntimeSecs = epMinutes * 60;

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        background:"var(--bg2)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:16,
        width:"90vw", maxWidth:900, maxHeight:"90vh", display:"flex", flexDirection:"column",
        overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.8)"
      }}>
        {/* Header */}
        <div style={{padding:"20px 24px 16px", borderBottom:"1px solid var(--ln)", flexShrink:0, display:"flex", alignItems:"flex-start", justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"Cormorant Garamond,serif", fontSize:25, color:"var(--gold2)", fontWeight:700}}>
              {step==="config" ? "📚 From Book" : step==="generating" ? "📚 Adapting…" : "📚 Review Adaptation"}
            </div>
            <div style={{fontSize:15, color:"var(--t3)", marginTop:3}}>
              {step==="config" ? "Upload or paste a book. Claude will extract characters, world, and adapt the full story arc." :
               step==="generating" ? `Adapting source material into ${totalEpisodes} episodes × ${epMinutes} min each.` :
               "Review the generated project. Click Commit to load it into the system."}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{flexShrink:0, marginTop:3}}>✕</button>
        </div>

        {/* Body */}
        <div style={{flex:1, overflow:"hidden", display:"flex", flexDirection:"column"}}>

          {/* CONFIG STEP */}
          {step==="config" && (
            <div style={{flex:1, overflow:"auto", padding:"20px 24px"}}>
              {error && <div className="callout co-red" style={{marginBottom:14}}>⚠ {error}</div>}

              {/* Episode parameters */}
              <div className="fr2" style={{marginBottom:18}}>
                <div className="fg">
                  <label className="fl">Total Episodes</label>
                  <input className="fi" type="number" min="1" max="100" value={totalEpisodes}
                    onChange={e=>setTotalEpisodes(Math.max(1,Number(e.target.value)))}/>
                </div>
                <div className="fg">
                  <label className="fl">Episode Length (minutes)</label>
                  <select className="fs" value={epMinutes} onChange={e=>setEpMinutes(Number(e.target.value))}>
                    {[1,2,3,5,7,10,15,20,30,45,60].map(m=><option key={m} value={m}>{m} min ({m*60}s)</option>)}
                  </select>
                </div>
              </div>

              {/* File upload */}
              <div className="fg" style={{marginBottom:10}}>
                <label className="fl">Upload Book File (.txt, .pdf, .md)</label>
                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <button className="btn btn-ghost" onClick={()=>fileInputRef.current?.click()}>
                    📁 Choose File
                  </button>
                  {fileName && <span style={{fontSize:14, color:"var(--green2)"}}>✓ {fileName}</span>}
                  <input ref={fileInputRef} type="file" accept=".txt,.pdf,.md,.epub,.rtf"
                    style={{display:"none"}} onChange={onFileChange}/>
                </div>
              </div>

              {/* Text area */}
              <div className="fg">
                <label className="fl">Or paste book text directly</label>
                <textarea className="ft" value={bookText} onChange={e=>{setBookText(e.target.value);setFileName("");}}
                  style={{minHeight:240, fontFamily:"DM Sans,sans-serif", fontSize:15, lineHeight:1.7}}
                  placeholder={"Paste the full text or excerpt of your book here.\n\nTips:\n• Include the opening chapters for best episode 1-3 quality\n• The more text you provide, the better character extraction\n• 3,000–12,000 characters works well\n• Claude will infer the full arc from what you provide"}
                />
                {bookText.length > 0 && (
                  <div style={{fontSize:13, color:"var(--t3)", marginTop:5, textAlign:"right"}}>
                    {bookText.length.toLocaleString()} characters · ~{Math.round(bookText.length/5)} words
                    {bookText.length > 12000 && <span style={{color:"var(--amber2)"}}> · first 12K chars will be used</span>}
                  </div>
                )}
              </div>

              <div className="callout co-blue" style={{marginTop:14}}>
                <strong style={{color:"var(--blue2)"}}>What gets generated:</strong>{" "}
                Full characters + relationships extracted from the book ·{" "}
                World facts and lore ·{" "}
                {totalEpisodes} episodes ({3} scripted + {Math.max(0,totalEpisodes-3)} stubs) ·{" "}
                Story arc distributed across all episodes · Asset list
              </div>
            </div>
          )}

          {/* GENERATING STEP */}
          {step==="generating" && (
            <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40}}>
              <div style={{width:340, textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif", fontSize:32, color:"var(--gold2)", marginBottom:6, fontStyle:"italic"}}>{progressMsg}</div>
                <div style={{fontSize:15, color:"var(--t3)", marginBottom:28}}>
                  Adapting {totalEpisodes} episodes × {epMinutes} min. Takes about 30–60 seconds.
                </div>
                <div className="prog-track" style={{height:4, marginBottom:12}}>
                  <div className="prog-fill" style={{width:`${progress}%`, background:"var(--gold)", height:"100%"}}/>
                </div>
                <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:14, color:"var(--t3)"}}>{progress}%</div>
                <div style={{marginTop:32, display:"flex", flexDirection:"column", gap:7, textAlign:"left"}}>
                  {[
                    "Parsing source material",
                    "Extracting characters",
                    "Mapping relationships",
                    "Building world facts",
                    "Writing story bible",
                    "Distributing plot arc",
                    "Episode 1 — full scene script",
                    "Episode 2 — full scene script",
                    "Episode 3 — full scene script",
                    `All ${totalEpisodes} episode stubs + titles`,
                    "Asset suggestions",
                  ].map((item, i) => {
                    const pct = (i / 10) * 100;
                    const done = progress > pct + 5;
                    const active = progress >= pct && progress <= pct + 12;
                    return (
                      <div key={i} style={{display:"flex", alignItems:"center", gap:9, opacity: done?1:active?0.9:0.3, transition:"opacity .4s"}}>
                        <div style={{width:14, height:14, borderRadius:"50%", flexShrink:0, border:`1px solid ${done?"var(--green)":active?"var(--gold)":"var(--t4)"}`, background:done?"var(--green)":active?"var(--gold)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--bg)", transition:"all .3s"}}>
                          {done?"✓":""}
                        </div>
                        <span style={{fontSize:14, color:done?"var(--t1)":active?"var(--gold2)":"var(--t3)"}}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW STEP */}
          {step==="preview" && generated && (
            <div style={{flex:1, display:"flex", overflow:"hidden"}}>
              <div style={{width:150, borderRight:"1px solid var(--ln)", padding:"14px 8px", flexShrink:0, overflowY:"auto"}}>
                {SECTIONS.map(s => {
                  const isReady = animatedSections.includes(s.key);
                  return (
                    <div key={s.key}
                      className={previewTab===s.key?"nav-item on":"nav-item"}
                      style={{opacity:isReady?1:0.3, transition:"opacity .3s", fontSize:14}}
                      onClick={()=>isReady&&setPreviewTab(s.key)}>
                      <span style={{fontSize:17}}>{s.icon}</span> {s.label}
                    </div>
                  );
                })}
              </div>
              <div style={{flex:1, overflow:"auto", padding:"18px 20px"}}>
                {previewTab==="project" && generated.project && (
                  <div>
                    <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
                      <div style={{width:12, height:12, borderRadius:"50%", background:generated.project.color}}/>
                      <div style={{fontFamily:"Cormorant Garamond,serif", fontSize:24, color:"var(--gold2)", fontWeight:700}}>{generated.project.name}</div>
                    </div>
                    <div style={{fontSize:15, color:"var(--t2)", lineHeight:1.7, marginBottom:14}}>{generated.project.desc}</div>
                    <div className="g2" style={{gap:10}}>
                      {[["Genre",generated.project.genre],["Type",generated.project.type],["Episodes",generated.project.episodes],["Runtime",`${Math.round((generated.project.epRuntime||180)/60)} min/ep`]].map(([k,v])=>(
                        <div key={k} style={{background:"var(--bg3)", borderRadius:8, padding:"10px 14px", border:"1px solid var(--ln)"}}>
                          <div style={{fontSize:12, color:"var(--t3)", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:4}}>{k}</div>
                          <div style={{fontSize:16, color:"var(--t1)"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {previewTab==="characters" && (
                  <div style={{display:"flex", flexDirection:"column", gap:12}}>
                    {(generated.bible?.characters||[]).map(c=>(
                      <div key={c.id} style={{background:"var(--bg3)", borderRadius:9, padding:"14px 16px", border:"1px solid var(--ln)"}}>
                        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                          <div style={{width:10, height:10, borderRadius:"50%", background:c.color||"var(--gold)"}}/>
                          <div style={{fontFamily:"Cormorant Garamond,serif", fontSize:19, color:"var(--gold2)", fontWeight:700}}>{c.name}</div>
                          <span style={{fontSize:13, color:"var(--t3)"}}>{c.role}</span>
                        </div>
                        <div style={{fontSize:14, color:"var(--t3)", marginBottom:4}}><strong style={{color:"var(--t2)"}}>Arc:</strong> {c.arc}</div>
                        <div style={{fontSize:14, color:"var(--t3)"}}><strong style={{color:"var(--t2)"}}>Secret:</strong> {c.secret}</div>
                      </div>
                    ))}
                  </div>
                )}
                {previewTab==="world" && (
                  <div style={{display:"flex", flexDirection:"column", gap:10}}>
                    {(generated.bible?.worldFacts||[]).map(f=>(
                      <div key={f.id} style={{background:"var(--bg3)", borderRadius:8, padding:"12px 14px", border:"1px solid var(--ln)"}}>
                        <div style={{fontSize:12, color:"var(--green2)", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:4}}>{f.category}</div>
                        <div style={{fontSize:15, color:"var(--t1)"}}>{f.fact}</div>
                      </div>
                    ))}
                  </div>
                )}
                {previewTab==="episodes" && (
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    {(generated.episodes||[]).map(ep=>(
                      <div key={ep.id} style={{display:"flex", alignItems:"center", gap:12, background:"var(--bg3)", borderRadius:8, padding:"10px 14px", border:"1px solid var(--ln)"}}>
                        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:13, color:"var(--t3)", width:32, flexShrink:0}}>{String(ep.num).padStart(2,"0")}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15, color:"var(--t1)"}}>{ep.title}</div>
                        </div>
                        <div style={{fontSize:13, color: ep.segments?.length>0?"var(--green2)":"var(--t4)"}}>
                          {ep.segments?.length>0 ? `${ep.segments.length} segments` : "stub"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {previewTab==="assets" && (
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    {(generated.assets||[]).map((a,i)=>(
                      <div key={i} style={{display:"flex", alignItems:"center", gap:12, background:"var(--bg3)", borderRadius:8, padding:"10px 14px", border:"1px solid var(--ln)"}}>
                        <span style={{fontSize:22}}>{a.thumb||"📄"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15, color:"var(--t1)"}}>{a.name}</div>
                          <div style={{fontSize:13, color:"var(--t3)"}}>{a.type} · {a.format} · {a.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 24px", borderTop:"1px solid var(--ln)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          {step==="config" && (
            <>
              <div style={{fontSize:14, color:"var(--t3)"}}>
                {existingProject ? `Will replace current project: ${existingProject}` : "Will create a new project"}
              </div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn-gold" disabled={!bookText.trim()||!apiKey} onClick={generate}>
                  📚 Generate Adaptation
                </button>
              </div>
            </>
          )}
          {step==="generating" && (
            <div style={{fontSize:14, color:"var(--t3)"}}>Claude is adapting your source material…</div>
          )}
          {step==="preview" && (
            <>
              <div style={{fontSize:14, color:"var(--t3)"}}>
                {(generated?.episodes||[]).length} episodes · {(generated?.bible?.characters||[]).length} characters
              </div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn btn-ghost" onClick={()=>{setStep("config");setGenerated(null);}}>← Regenerate</button>
                <button className="btn btn-gold" onClick={commit}>✦ Commit to Project</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EPISODE GENERATOR MODAL — generate N more episodes on demand
// ═══════════════════════════════════════════════════════════════════
function EpisodeGenerator({ state, apiKey, onGenerated, onClose }) {
  const proj = state.projects.find(p => p.id === state.activeProject);
  const existing = state.episodes.filter(e => e.project === state.activeProject);
  const lastFull = existing.filter(e => e.segments?.length > 0).sort((a,b)=>b.num-a.num)[0];
  const nextEp = (lastFull?.num || 0) + 1;
  const [fromEp] = useState(nextEp);
  const [count, setCount] = useState(3);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!apiKey) { setError("No API key."); return; }
    setLoading(true); setError(null);
    try {
      const eps = await callEpisodeGeneratorAPI(apiKey, state, fromEp, fromEp + count - 1,
        (msg, pct) => { setProgressMsg(msg); setProgress(pct); });
      setProgress(100);
      setTimeout(() => { onGenerated(eps); onClose(); }, 400);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:26,maxWidth:480,width:"92%"}}>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)",marginBottom:4}}>Generate Episodes</div>
        <div style={{fontSize:15,color:"var(--t3)",marginBottom:18}}>{proj?.name} · Currently {existing.filter(e=>e.segments?.length>0).length} scripted episodes</div>

        {error && <div className="callout co-red" style={{marginBottom:12}}>⚠ {error}</div>}

        <div className="fr2" style={{marginBottom:16}}>
          <div className="fg"><label className="fl">Starting from episode</label><input className="fi" type="number" value={fromEp} readOnly style={{opacity:.6}}/></div>
          <div className="fg">
            <label className="fl">How many to generate</label>
            <select className="fs" value={count} onChange={e=>setCount(Number(e.target.value))}>
              {[1,2,3,5,10].map(n=><option key={n} value={n}>{n} episode{n>1?"s":""}</option>)}
            </select>
          </div>
        </div>

        <div className="callout co-gold" style={{marginBottom:16}}>
          Claude will write full cinematic segment prompts for episodes {fromEp} through {fromEp+count-1}, maintaining your established style, character seeds, and story continuity.
        </div>

        {loading && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:15,color:"var(--gold2)",marginBottom:6}}>{progressMsg}</div>
            <div className="prog-track"><div className="prog-fill" style={{width:`${progress}%`,background:"var(--gold)",height:"100%"}}/></div>
          </div>
        )}

        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-gold" onClick={run} disabled={loading||!apiKey}>
            {loading?<><span className="spin-sm" style={{borderTopColor:"var(--bg)"}}/> Writing…</>:"✦ Generate Episodes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const TENSION_C = {critical:"#d05050",high:"#c87838",medium:"#c9a84c",low:"#4aad75"};

// Compute positions dynamically — radial layout with force-spread
function computeRelPositions(characters, W, H) {
  const n = characters.length;
  if (n === 0) return {};
  const cx = W / 2, cy = H / 2;
  const positions = {};
  if (n === 1) {
    positions[characters[0].id] = { x: cx, y: cy };
    return positions;
  }
  const rx = Math.min(cx - 70, 230);
  const ry = Math.min(cy - 70, 170);
  characters.forEach((c, i) => {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    positions[c.id] = {
      x: Math.round(cx + rx * Math.cos(angle)),
      y: Math.round(cy + ry * Math.sin(angle)),
    };
  });
  return positions;
}

function RelationshipMap({ bible, onSelectChar, selectedChar }) {
  const [hoverEdge, setHoverEdge] = useState(null);
  const [dragging, setDragging]   = useState(null);
  const [offsets, setOffsets]     = useState({});
  const svgRef = useRef(null);
  const W = 640, H = 460;

  const charKey = bible.characters.map(c => c.id).join(',');

  const basePos = useMemo(
    () => computeRelPositions(bible.characters, W, H),
    // charKey is a stable string dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [charKey]
  );

  const pos = useMemo(() => {
    const merged = { ...basePos };
    Object.entries(offsets).forEach(([id, off]) => {
      if (merged[id]) merged[id] = { x: merged[id].x + off.dx, y: merged[id].y + off.dy };
    });
    return merged;
  }, [basePos, offsets]);

  const onNodeMouseDown = (e, charId) => {
    e.stopPropagation();
    e.preventDefault();
    const svgEl  = svgRef.current;
    if (!svgEl) return;
    const rect   = svgEl.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const startSVGX = e.clientX * scaleX;
    const startSVGY = e.clientY * scaleY;
    const nodeX = pos[charId]?.x || 0;
    const nodeY = pos[charId]?.y || 0;
    const offX  = startSVGX - nodeX;
    const offY  = startSVGY - nodeY;
    const base  = basePos[charId] || { x: 0, y: 0 };
    setDragging({ charId, offX, offY, scaleX, scaleY, base });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const nx = e.clientX * dragging.scaleX - dragging.offX;
      const ny = e.clientY * dragging.scaleY - dragging.offY;
      setOffsets(prev => ({
        ...prev,
        [dragging.charId]: { dx: nx - dragging.base.x, dy: ny - dragging.base.y },
      }));
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  if (bible.characters.length === 0) {
    return (
      <div style={{padding:'32px',textAlign:'center',color:'var(--t4)',fontSize:15,border:'1px solid var(--ln)',borderRadius:10}}>
        No characters yet — add characters first, then define relationships.
      </div>
    );
  }

  const chars = bible.characters;
  const rels  = bible.relationships;

  return (
    <div style={{position:'relative', userSelect:'none'}}>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="rel-canvas"
        style={{cursor: dragging ? 'grabbing' : 'default', display:'block'}}
      >
        <defs>
          {/* Arrow markers per tension */}
          {Object.entries(TENSION_C).map(([k, c]) => (
            <marker key={k} id={`arr-${k}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={c} opacity="0.9"/>
            </marker>
          ))}
          <marker id="arr-default" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3a3e50"/>
          </marker>
          {/* Clip paths for character photos — defined here in defs with absolute coords */}
          {chars.map(c => {
            const p   = pos[c.id];
            const r   = selectedChar === c.id ? 28 : 22;
            if (!p) return null;
            return (
              <clipPath key={`clip-${c.id}`} id={`clip-${c.id}`}>
                <circle cx={p.x} cy={p.y} r={r}/>
              </clipPath>
            );
          })}
        </defs>

        {/* ── Edges */}
        {rels.map((r, i) => {
          const f = pos[r.from];
          const t = pos[r.to];
          if (!f || !t) return null;
          const dx   = t.x - f.x;
          const dy   = t.y - f.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nr   = 26;
          const x1   = f.x + (dx / dist) * nr;
          const y1   = f.y + (dy / dist) * nr;
          const x2   = t.x - (dx / dist) * (nr + 8);
          const y2   = t.y - (dy / dist) * (nr + 8);
          const mx   = (x1 + x2) / 2;
          const my   = (y1 + y2) / 2;
          const col  = TENSION_C[r.tension] || '#3a3e50';
          const hi   = hoverEdge === i;
          const markId = TENSION_C[r.tension] ? `arr-${r.tension}` : 'arr-default';
          const dash = r.type === 'unknown'     ? '6,4'
                     : r.type === 'complicity'  ? '3,3'
                     : r.type === 'rivalry'     ? '8,3'
                     : 'none';
          return (
            <g key={i}>
              {/* Fat transparent hit area */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="transparent" strokeWidth={18}
                style={{cursor:'pointer'}}
                onMouseEnter={() => setHoverEdge(i)}
                onMouseLeave={() => setHoverEdge(null)}
              />
              {/* Visible line */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={col}
                strokeWidth={hi ? 2.5 : 1.5}
                opacity={hi ? 1 : 0.5}
                strokeDasharray={dash}
                markerEnd={`url(#${markId})`}
                style={{pointerEvents:'none', transition:'opacity .15s'}}
              />
              {/* Hover label */}
              {hi && (
                <g style={{pointerEvents:'none'}}>
                  <rect x={mx - 66} y={my - 20} width={132} height={24} rx={5}
                    fill="rgba(5,5,10,.92)" stroke={col} strokeWidth={0.75}/>
                  <text x={mx} y={my - 4} textAnchor="middle"
                    style={{fontSize:13, fill:col, fontFamily:'DM Sans,sans-serif'}}>
                    {r.label.length > 30 ? r.label.substring(0, 28) + '…' : r.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Nodes */}
        {chars.map(c => {
          const p       = pos[c.id];
          if (!p) return null;
          const sel     = selectedChar === c.id;
          const changed = c.flags?.includes('changed');
          const r       = sel ? 28 : 22;
          // Face image: prefer canonical avatarUrl, then refImages face, then faceRef
          const faceSrc = c.avatarUrl || c.refImages?.find(img => img.type === 'face')?.dataUrl || c.faceRef || null;

          return (
            <g
              key={c.id}
              style={{cursor: dragging?.charId === c.id ? 'grabbing' : 'grab'}}
              onClick={() => !dragging && onSelectChar(c.id)}
              onMouseDown={e => onNodeMouseDown(e, c.id)}
            >
              {/* Glow ring */}
              <circle cx={p.x} cy={p.y} r={r + 6}
                fill={c.color + '12'}
                stroke={sel ? c.color : changed ? '#c87838' : 'transparent'}
                strokeWidth={sel ? 2 : 1.5}
              />
              {/* Node fill */}
              <circle cx={p.x} cy={p.y} r={r}
                fill={c.color + '30'}
                stroke={c.color + '60'}
                strokeWidth={1.5}
              />
              {/* Character photo — uses clipPath from defs */}
              {faceSrc && (
                <image
                  href={faceSrc}
                  x={p.x - r} y={p.y - r}
                  width={r * 2} height={r * 2}
                  clipPath={`url(#clip-${c.id})`}
                  preserveAspectRatio="xMidYMid slice"
                  style={{pointerEvents:'none'}}
                />
              )}
              {/* Initial letter if no photo */}
              {!faceSrc && (
                <text cx={p.x} cy={p.y}
                  x={p.x} y={p.y + 6}
                  textAnchor="middle"
                  style={{fontSize: r * 0.75, fill: c.color, pointerEvents:'none', fontFamily:'Cormorant Garamond,serif', fontWeight:600}}>
                  {c.name.charAt(0)}
                </text>
              )}
              {/* Name label */}
              <text x={p.x} y={p.y + r + 15}
                textAnchor="middle"
                style={{fontSize:13, fill: sel ? c.color : '#9da5bb', pointerEvents:'none',
                  fontFamily:'DM Sans,sans-serif', fontWeight: sel ? 600 : 400}}>
                {c.name.split(' ')[0]}
              </text>
              {/* Changed indicator */}
              {changed && (
                <circle cx={p.x + r - 4} cy={p.y - r + 4} r={5}
                  fill="#c87838" stroke="#09090b" strokeWidth={1.5}/>
              )}
              {/* First episode badge */}
              {c.firstEp > 1 && (
                <text x={p.x} y={p.y - r - 8}
                  textAnchor="middle"
                  style={{fontSize:12, fill:'#525870', pointerEvents:'none'}}>
                  EP{c.firstEp}+
                </text>
              )}
            </g>
          );
        })}

        {/* Empty state */}
        {rels.length === 0 && (
          <text x={W / 2} y={H / 2 + 4} textAnchor="middle"
            style={{fontSize:15, fill:'#525870', fontFamily:'DM Sans,sans-serif'}}>
            No relationships defined yet — add some below
          </text>
        )}
      </svg>

      {/* Legend */}
      <div style={{display:'flex', gap:12, marginTop:8, flexWrap:'wrap', alignItems:'center'}}>
        {Object.entries(TENSION_C).map(([k, c]) => (
          <div key={k} style={{display:'flex', alignItems:'center', gap:5, fontSize:13, color:'var(--t3)'}}>
            <div style={{width:20, height:2, background:c, borderRadius:1}}/>
            {k}
          </div>
        ))}
        <span style={{marginLeft:'auto', fontSize:13, color:'var(--t4)'}}>
          drag nodes · 🟠 recently changed
        </span>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════

// ── DASHBOARD
function NewProjectManualModal({ onAdd, onClose }) {
  const [form, setForm] = useState({id:"",name:"",type:"drama",genre:"",color:"#c9a84c",status:"active",episodes:10,epRuntime:180,desc:""});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = () => {
    if (!form.name.trim()) return;
    const id = form.id || form.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");
    onAdd({...form,id});
    onClose();
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:24,maxWidth:480,width:"92%"}}>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)",marginBottom:14}}>New Project</div>
        <div className="fr2">
          <div className="fg" style={{gridColumn:"span 2"}}><label className="fl">Title *</label><input className="fi" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Your series title"/></div>
        </div>
        <div className="fr3">
          <div className="fg"><label className="fl">Type</label><select className="fs" value={form.type} onChange={e=>set("type",e.target.value)}>{["drama","game","anime","film"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="fg"><label className="fl">Status</label><select className="fs" value={form.status} onChange={e=>set("status",e.target.value)}><option>active</option><option>planning</option><option>archived</option></select></div>
          <div className="fg"><label className="fl">Color</label><input className="fi" type="color" value={form.color} onChange={e=>set("color",e.target.value)} style={{padding:"4px 6px",height:38}}/></div>
        </div>
        <div className="fr2">
          <div className="fg"><label className="fl">Genre</label><input className="fi" value={form.genre} onChange={e=>set("genre",e.target.value)} placeholder="e.g. Fashion Drama / Mystery"/></div>
          <div className="fg"><label className="fl">Episode Count</label><input className="fi" type="number" value={form.episodes} onChange={e=>set("episodes",Number(e.target.value))}/></div>
        </div>
        <div className="fg"><label className="fl">Synopsis</label><textarea className="ft" value={form.desc} onChange={e=>set("desc",e.target.value)} placeholder="2-3 sentence description…" style={{minHeight:70,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!form.name.trim()} onClick={submit}>Create Project</button>
        </div>
      </div>
    </div>
  );
}

function PageDashboard({ state, dispatch, onGenerate, onFromBook }) {
  const proj = state.projects.find(p=>p.id===state.activeProject);
  const eps = state.episodes.filter(e=>e.project===state.activeProject);
  const allSegs = eps.reduce((a,e)=>a+e.segments.length,0);
  const doneSegs = eps.reduce((a,e)=>a+e.segments.filter(s=>s.status==="done").length,0);
  const changedChars = state.bible.characters.filter(c=>c.flags?.includes("changed")).length;
  const [editingProj, setEditingProj] = useState(false);
  const [projForm, setProjForm] = useState(null);
  const [showDeleteProj, setShowDeleteProj] = useState(false);
  const [showManualNew, setShowManualNew] = useState(false);

  // No project at all — show welcome screen
  if (!proj) return (
    <div>
      <div style={{textAlign:"center",paddingTop:80,paddingBottom:40}}>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:40,color:"var(--gold2)",fontWeight:700,marginBottom:10}}>Nekoi Studio</div>
        <div style={{fontSize:17,color:"var(--t3)",marginBottom:48}}>Production OS for AI-generated drama and game series</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,maxWidth:900,margin:"0 auto",textAlign:"left"}}>
          <div className="card" style={{borderColor:"rgba(201,168,76,.3)",background:"linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.02))",cursor:"pointer",padding:24}} onClick={onGenerate}>
            <div style={{fontSize:32,marginBottom:12}}>✦</div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",fontWeight:700,marginBottom:8}}>Generate from Concept</div>
            <div style={{fontSize:15,color:"var(--t3)",lineHeight:1.7}}>Paste your concept. Claude generates the complete story bible, characters, relationship map, first 3 scripted episodes, and all stubs — in one shot.</div>
            <div style={{marginTop:14,fontSize:15,color:"var(--gold)",fontFamily:"JetBrains Mono,monospace"}}>Requires API key →</div>
          </div>
          <div className="card" style={{borderColor:"rgba(72,120,200,.3)",background:"linear-gradient(135deg,rgba(72,120,200,.08),rgba(72,120,200,.02))",cursor:"pointer",padding:24}} onClick={onFromBook}>
            <div style={{fontSize:32,marginBottom:12}}>📚</div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--blue2)",fontWeight:700,marginBottom:8}}>Adapt from Book</div>
            <div style={{fontSize:15,color:"var(--t3)",lineHeight:1.7}}>Upload or paste a book. Claude extracts all characters, world facts, and adapts the story arc into your specified number of episodes.</div>
            <div style={{marginTop:14,fontSize:15,color:"var(--blue2)",fontFamily:"JetBrains Mono,monospace"}}>Requires API key →</div>
          </div>
          <div className="card" style={{cursor:"pointer",padding:24}} onClick={()=>setShowManualNew(true)}>
            <div style={{fontSize:32,marginBottom:12}}>📋</div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",fontWeight:700,marginBottom:8}}>Start Blank Project</div>
            <div style={{fontSize:15,color:"var(--t3)",lineHeight:1.7}}>Create an empty project and build the bible, characters, episodes, and assets manually — full control over every detail.</div>
            <div style={{marginTop:14,fontSize:15,color:"var(--t3)",fontFamily:"JetBrains Mono,monospace"}}>No API key needed →</div>
          </div>
        </div>
        <div style={{marginTop:32,fontSize:14,color:"var(--t4)"}}>Set your Anthropic API key in Settings to enable AI generation</div>
      </div>
      {showManualNew&&<NewProjectManualModal onAdd={p=>dispatch({type:"ADD_PROJECT",project:p})} onClose={()=>setShowManualNew(false)}/>}
    </div>
  );

  return (
    <div>
      <div className="ph">
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:proj.color}}/>
            <div className="ph-t">{proj.name}</div>
            <SC.Pill t={proj.type}/>
          </div>
          <div className="ph-s">{proj.genre} · {proj.episodes} episodes planned · {eps.length} created</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-ghost btn-sm" onClick={()=>{setProjForm({...proj});setEditingProj(true);}}>✎ Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={onGenerate}>✦ Generate from Prompt</button>
          <button className="btn btn-ghost btn-sm" onClick={onFromBook}>📚 From Book</button>
          <div className={`api-pill ${state.apiKey?"api-on":"api-off"}`}>
            <span className={`badge-dot${state.apiKey?" pulse":""}`}/>{state.apiKey?"AI Active":"No Key"}
          </div>
        </div>
      </div>

      {allSegs === 0 && (
        <div className="card" style={{marginBottom:20,borderColor:"rgba(201,168,76,.25)",background:"linear-gradient(135deg,rgba(201,168,76,.06),rgba(201,168,76,.02))",cursor:"pointer"}} onClick={onGenerate}>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{width:52,height:52,borderRadius:10,background:"var(--gG)",border:"1px solid rgba(201,168,76,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:27,flexShrink:0}}>✦</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",fontWeight:700,marginBottom:4}}>Generate this project from your concept</div>
              <div style={{fontSize:15,color:"var(--t3)",lineHeight:1.6}}>Paste your original concept. Claude generates the full bible, characters, episodes, and assets in one shot.</div>
            </div>
            <div className="btn btn-gold btn-sm" style={{flexShrink:0}}>Start →</div>
          </div>
        </div>
      )}
      {changedChars > 0 && (
        <div className="callout co-gold" style={{marginBottom:16}}>⚑ Story Bible updated — {changedChars} character{changedChars>1?"s":""} modified. Check the Bible module.</div>
      )}

      <div className="g4" style={{marginBottom:20}}>
        {[
          {n:eps.length, l:"Episodes"},
          {n:allSegs, l:"Segments"},
          {n:allSegs?`${doneSegs}/${allSegs}`:"0/0", l:"Clips Generated"},
          {n:state.assets.filter(a=>a.project===state.activeProject).length, l:"IP Assets"},
        ].map((s,i)=><div key={i} className="card"><div className="stat-n">{s.n}</div><div className="stat-l">{s.l}</div></div>)}
      </div>

      <div className="g2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-t" style={{marginBottom:12}}>Episode Progress</div>
          {eps.length===0 ? (
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--t4)",fontSize:15}}>No episodes yet</div>
          ) : eps.slice(0,6).map(ep=>{
            const tot=ep.segments.length, done=ep.segments.filter(s=>s.status==="done").length;
            const pct=tot>0?Math.round(done/tot*100):0;
            return (
              <div key={ep.id} style={{marginBottom:10,cursor:"pointer"}} onClick={()=>{dispatch({type:"SET_EPISODE",id:ep.id});dispatch({type:"SET_VIEW",view:"episodes"});}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:15,marginBottom:4}}>
                  <span><span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,color:"var(--t3)",marginRight:8}}>EP{String(ep.num).padStart(2,"0")}</span><span style={{fontFamily:"Cormorant Garamond,serif",color:"var(--t1)"}}>{ep.title}</span></span>
                  <SC.StatusBadge s={ep.status}/>
                </div>
                {tot>0&&<><div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`,background:proj.color||"var(--gold)"}}/></div><div style={{fontSize:12,color:"var(--t3)",marginTop:2}}>{done}/{tot} clips · {pct}%</div></>}
                {tot===0&&<div style={{fontSize:13,color:"var(--t4)"}}>Stub — no segments</div>}
              </div>
            );
          })}
          <button className="btn btn-ghost btn-sm" style={{marginTop:6}} onClick={()=>dispatch({type:"SET_VIEW",view:"episodes"})}>View all →</button>
        </div>

        <div className="card">
          <div className="card-t" style={{marginBottom:12}}>Ending Probabilities</div>
          {state.bible.endings.length===0 ? (
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--t4)",fontSize:15}}>No endings defined<br/><button className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={()=>dispatch({type:"SET_VIEW",view:"bible"})}>Open Bible →</button></div>
          ) : state.bible.endings.map(end=>(
            <div key={end.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,marginBottom:3}}>
                <span style={{color:"var(--t2)"}}>{end.label}</span>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:end.color}}>{end.prob}%</span>
              </div>
              <div className="prog-track"><div className="prog-fill" style={{width:`${end.prob}%`,background:end.color}}/></div>
            </div>
          ))}
        </div>
      </div>

      {state.assets.filter(a=>a.project===state.activeProject).length>0&&(
        <>
          <div className="sh"><span className="sh-t">Recent Assets</span><div className="sh-line"/><button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"SET_VIEW",view:"assets"})}>View all →</button></div>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
            {state.assets.filter(a=>a.project===state.activeProject).slice(0,5).map(a=>(
              <div key={a.id} className="asset-card" style={{width:120,flexShrink:0}}>
                <div className="asset-thumb" style={{height:65,fontSize:29}}>{a.thumb}</div>
                <div className="asset-info"><div className="asset-name">{a.name}</div><span className={`asset-tag at-${a.type}`}>{a.type}</span></div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Project edit modal */}
      {editingProj && projForm && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setEditingProj(false)}>
          <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:24,maxWidth:500,width:"92%"}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)",marginBottom:14}}>Edit Project</div>
            <div className="fg"><label className="fl">Title</label><input className="fi" value={projForm.name} onChange={e=>setProjForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="fr3">
              <div className="fg"><label className="fl">Type</label><select className="fs" value={projForm.type} onChange={e=>setProjForm(f=>({...f,type:e.target.value}))}>{["drama","game","anime","film"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="fg"><label className="fl">Status</label><select className="fs" value={projForm.status} onChange={e=>setProjForm(f=>({...f,status:e.target.value}))}><option>active</option><option>planning</option><option>archived</option></select></div>
              <div className="fg"><label className="fl">Color</label><input className="fi" type="color" value={projForm.color} onChange={e=>setProjForm(f=>({...f,color:e.target.value}))} style={{padding:"4px 6px",height:38}}/></div>
            </div>
            <div className="fr2">
              <div className="fg"><label className="fl">Genre</label><input className="fi" value={projForm.genre} onChange={e=>setProjForm(f=>({...f,genre:e.target.value}))}/></div>
              <div className="fg"><label className="fl">Episode Count</label><input className="fi" type="number" value={projForm.episodes} onChange={e=>setProjForm(f=>({...f,episodes:Number(e.target.value)}))}/></div>
            </div>
            <div className="fg"><label className="fl">Episode Runtime (seconds)</label><input className="fi" type="number" value={projForm.epRuntime} onChange={e=>setProjForm(f=>({...f,epRuntime:Number(e.target.value)}))}/></div>
            <div className="fg"><label className="fl">Synopsis</label><textarea className="ft" value={projForm.desc||""} onChange={e=>setProjForm(f=>({...f,desc:e.target.value}))} style={{minHeight:70,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
            <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:4}}>
              <button className="btn btn-red btn-sm" onClick={()=>setShowDeleteProj(true)}>🗑 Delete Project</button>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-ghost" onClick={()=>setEditingProj(false)}>Cancel</button>
                <button className="btn btn-gold" onClick={()=>{dispatch({type:"UPDATE_PROJECT",id:proj.id,patch:projForm});setEditingProj(false);}}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteProj&&(
        <div className="overlay">
          <div style={{background:"var(--bg2)",border:"1px solid var(--bR)",borderRadius:12,padding:22,maxWidth:380,width:"92%"}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--red2)",marginBottom:8}}>Delete Project?</div>
            <div style={{fontSize:15,color:"var(--t2)",marginBottom:16}}>This will delete <strong>{proj.name}</strong> and all its episodes, segments, and assets. Use undo to recover.</div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowDeleteProj(false)}>Cancel</button>
              <button className="btn btn-red" onClick={()=>{dispatch({type:"DELETE_PROJECT",id:proj.id});setShowDeleteProj(false);setEditingProj(false);}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BIBLE MODULE
const CHAR_COLORS = ["#c9a84c","#4878c8","#4aad75","#8858c8","#c87838","#d05050","#4898c8","#a868d8","#58b878","#d09840"];
const ARCHETYPES = ["The Seeker","The Patriarch","The Enforcer","The Witness","The Inheritor","The Ghost","The Architect","The Rebel","The Protector","The Deceiver","The Martyr","The Catalyst"];
const REL_TYPES = ["family","employer","alliance","rivalry","trust","complicity","unknown","romantic","mentor","enemy"];
const TENSIONS = ["critical","high","medium","low"];

function CharacterModal({ char, onSave, onClose, dispatch, geminiKey, openaiKey = "", imageEngine = "gemini" }) {
  const isNew = !char?.id;
  const [form, setForm] = useState(char || {
    id:"", name:"", age:30, role:"", archetype:"The Seeker",
    appearance:"", motivation:"", secret:"", arc:"",
    firstEp:1, refStatus:"pending",
    seed: Math.floor(7000 + Math.random()*2000),
    color: CHAR_COLORS[Math.floor(Math.random()*CHAR_COLORS.length)],
    flags:[], lastChanged:null,
    faceRef:"", visualLock:"", voiceProfile:"",
    refImages:[], avatarUrl:"",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const fileRef    = useRef(null);
  const avatarRef  = useRef(null);
  const [genStatus, setGenStatus]     = useState(null); // null | "generating" | "done" | "error"
  const [genError,  setGenError]      = useState(null);
  const [avatarStyle, setAvatarStyle] = useState("realistic");

  const submit = () => {
    if (!form.name.trim()) return;
    if (isNew && !form.id.trim()) {
      setForm(f => ({...f, id: form.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"")}));
      return;
    }
    onSave(form);
    onClose();
  };

  // ── Avatar upload (single canonical image) — also adds to history
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      set("avatarUrl", dataUrl);
      const newEntry = { id:"av_"+Date.now(), dataUrl, style:"upload", createdAt:new Date().toISOString() };
      set("avatarHistory", [newEntry, ...(form.avatarHistory||[])].slice(0,5));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Generate avatar via Gemini
  const handleGenerateAvatar = async () => {
    if (!geminiKey && (imageEngine === "gemini" || imageEngine === "nanoBanana2")) { setGenError("No Gemini API key — add it in Settings → API Keys."); return; }
    if (!form.visualLock && !form.appearance && !form.name) {
      setGenError("Add at least a name and appearance description first."); return;
    }
    setGenStatus("generating"); setGenError(null);
    try {
      const dataUrl = await generateCharacterAvatar({
        char: form, geminiKey, openaiKey, style: avatarStyle, engine: imageEngine,
      });
      // Save to form — will be committed to history on save
      set("avatarUrl", dataUrl);
      set("refStatus", "done");
      // Append to local avatarHistory for immediate preview
      const newEntry = { id:"av_"+Date.now(), dataUrl, style:avatarStyle, createdAt:new Date().toISOString() };
      set("avatarHistory", [newEntry, ...(form.avatarHistory||[])].slice(0,5));
      setGenStatus("done");
    } catch(e) {
      setGenError(e.message);
      setGenStatus("error");
    }
  };

  // ── Multi-image ref uploads (body/face extras)
  const handleUploadImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const readers = files.map(file => new Promise(res => {
      const r = new FileReader();
      r.onload = ev => res({
        id: Date.now() + Math.random(),
        dataUrl: ev.target.result,
        name: file.name,
        type: file.name.toLowerCase().includes("body") ? "body" : "face",
        size: file.size,
      });
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(newImgs => {
      set("refImages", [...(form.refImages||[]), ...newImgs].slice(0, 6));
    });
    e.target.value = "";
  };

  const removeImage   = (id) => set("refImages", (form.refImages||[]).filter(img => img.id !== id));
  const toggleImgType = (id) => set("refImages", (form.refImages||[]).map(img =>
    img.id === id ? {...img, type: img.type==="face"?"body":img.type==="body"?"other":"face"} : img
  ));

  const typeColor = { face:"var(--gold)", body:"var(--blue2,#4878c8)", other:"var(--t3)" };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,width:"min(780px,96vw)",maxHeight:"92vh",overflow:"auto",display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{padding:"18px 24px 12px",borderBottom:"1px solid var(--ln)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)",fontWeight:700}}>
            {isNew ? "New Character" : "Edit Character"}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{padding:"18px 24px",overflow:"auto",flex:1,display:"flex",flexDirection:"column",gap:0}}>

          {/* ══ TOP: Avatar + Core Fields side-by-side ══ */}
          <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:20,marginBottom:16}}>

            {/* Avatar column */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,minWidth:160,maxWidth:160}}>

              {/* ── Active avatar preview */}
              <div style={{width:148,height:172,borderRadius:10,border:`2px solid ${form.avatarUrl?form.color+"80":"var(--ln)"}`,background:"var(--bg3)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt={form.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                ) : genStatus==="generating" ? (
                  <div style={{textAlign:"center",padding:8}}>
                    <div className="spin-sm" style={{borderTopColor:"var(--gold)",width:28,height:28,margin:"0 auto 8px"}}/>
                    <div style={{fontSize:13,color:"var(--t3)"}}>Generating…</div>
                  </div>
                ) : (
                  <div style={{textAlign:"center",opacity:.4}}>
                    <div style={{fontSize:50,fontFamily:"Cormorant Garamond,serif",color:form.color}}>{form.name?form.name.charAt(0):"?"}</div>
                    <div style={{fontSize:12,color:"var(--t4)"}}>No avatar yet</div>
                  </div>
                )}
                {genStatus==="generating" && form.avatarUrl && (
                  <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div className="spin-sm" style={{borderTopColor:"var(--gold)",width:28,height:28}}/>
                  </div>
                )}
              </div>

              {/* ── Avatar history — up to 5 versions, click to activate */}
              {(form.avatarHistory||[]).length > 0 && (
                <div style={{width:"100%"}}>
                  <div style={{fontSize:12,color:"var(--t4)",textAlign:"center",marginBottom:5}}>
                    {(form.avatarHistory||[]).length}/5 saved · click to switch
                  </div>
                  <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap"}}>
                    {(form.avatarHistory||[]).map(h => {
                      const isActive = h.dataUrl === form.avatarUrl;
                      return (
                        <div key={h.id} style={{position:"relative",width:40,height:48,flexShrink:0}}>
                          <img src={h.dataUrl} alt="" onClick={()=>set("avatarUrl",h.dataUrl)}
                            style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:5,cursor:"pointer",display:"block",
                              border:`2px solid ${isActive?form.color:"rgba(255,255,255,.15)"}`,
                              boxShadow:isActive?`0 0 6px ${form.color}60`:"none",
                              transition:"border-color .15s,transform .1s",
                              transform:isActive?"scale(1.1)":"scale(1)"}}/>
                          <button onClick={e=>{e.stopPropagation();const u=(form.avatarHistory||[]).filter(x=>x.id!==h.id);set("avatarHistory",u);if(isActive)set("avatarUrl",u[0]?.dataUrl||"");}}
                            style={{position:"absolute",top:-5,right:-5,width:15,height:15,borderRadius:"50%",background:"rgba(208,80,80,.95)",border:"1px solid rgba(0,0,0,.3)",color:"#fff",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                          <div style={{position:"absolute",bottom:2,left:0,right:0,textAlign:"center",fontSize:12,color:"rgba(255,255,255,.6)",letterSpacing:.3,textTransform:"uppercase"}}>{(h.style||"").slice(0,3)}</div>
                        </div>
                      );
                    })}
                    {Array.from({length:Math.max(0,5-(form.avatarHistory||[]).length)}).map((_,i)=>(
                      <div key={"slot"+i} style={{width:40,height:48,borderRadius:5,border:"1px dashed var(--ln)",opacity:.2}}/>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Generate + upload */}
              <div style={{display:"flex",flexDirection:"column",gap:5,width:"100%"}}>
                <select className="fs" value={avatarStyle} onChange={e=>setAvatarStyle(e.target.value)} style={{fontSize:13,padding:"4px 6px"}}>
                  <option value="realistic">Realistic</option>
                  <option value="anime">Anime</option>
                  <option value="painted">Painted</option>
                  <option value="ghibli">Ghibli</option>
                </select>
                <button className="btn btn-gold btn-sm" onClick={handleGenerateAvatar}
                  disabled={genStatus==="generating"}
                  style={{fontSize:13,justifyContent:"center",gap:5}}>
                  {genStatus==="generating"
                    ? <><span className="spin-sm" style={{borderTopColor:"var(--bg)",width:10,height:10,flexShrink:0}}/>&nbsp;Generating…</>
                    : `✦ ${(form.avatarHistory||[]).length>0?"New Version":"Generate Avatar"}`}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={()=>avatarRef.current?.click()} style={{fontSize:13,justifyContent:"center"}}>
                  ↑ Upload Photo
                </button>
                <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarUpload}/>
              </div>

              {genError&&<div style={{fontSize:12,color:"var(--red2,#d05050)",lineHeight:1.4,textAlign:"center",maxWidth:148}}>{genError}</div>}
              {genStatus==="done"&&!genError&&<div style={{fontSize:12,color:"#4aad75",textAlign:"center"}}>✓ Added to history</div>}

              {/* ── Map color */}
              <div style={{width:"100%"}}>
                <div style={{fontSize:12,color:"var(--t4)",marginBottom:4,textAlign:"center"}}>Map color</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
                  {CHAR_COLORS.map(c=>(
                    <div key={c} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",
                      border:`2px solid ${form.color===c?"white":"transparent"}`}} onClick={()=>set("color",c)}/>
                  ))}
                </div>
              </div>
            </div>

            {/* Core fields column */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div className="fr3">
                <div className="fg" style={{gridColumn:"span 2"}}>
                  <label className="fl">Full Name *</label>
                  <input className="fi" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Character full name"/>
                </div>
                <div className="fg">
                  <label className="fl">Age</label>
                  <input className="fi" type="number" value={form.age} onChange={e=>set("age",Number(e.target.value))}/>
                </div>
              </div>

              <div className="fr2">
                <div className="fg">
                  <label className="fl">ID {isNew&&<span style={{color:"var(--t4)"}}>— auto from name</span>}</label>
                  <input className="fi" value={form.id}
                    onChange={e=>set("id",e.target.value.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,""))}
                    placeholder="slug_id"/>
                </div>
                <div className="fg">
                  <label className="fl">Archetype</label>
                  <select className="fs" value={form.archetype} onChange={e=>set("archetype",e.target.value)}>
                    {ARCHETYPES.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="fr2">
                <div className="fg">
                  <label className="fl">Role / Title</label>
                  <input className="fi" value={form.role} onChange={e=>set("role",e.target.value)} placeholder="e.g. Founder, Detective, Intern"/>
                </div>
                <div className="fg">
                  <label className="fl">First Appears (Episode)</label>
                  <input className="fi" type="number" value={form.firstEp} onChange={e=>set("firstEp",Number(e.target.value))}/>
                </div>
              </div>

              <div className="fg">
                <label className="fl">
                  Visual Lock
                  <span style={{color:"var(--t4)",fontWeight:400,marginLeft:6}}>— injected into every image & video prompt</span>
                </label>
                <textarea className="ft" value={form.visualLock||""} onChange={e=>set("visualLock",e.target.value)}
                  placeholder="e.g. Silver-streaked hair swept severe. Ivory or black only. 74 years old, French. Still posture."
                  style={{minHeight:52,fontFamily:"DM Sans,sans-serif",fontSize:15,lineHeight:1.5}}/>
                <div style={{fontSize:13,color:"var(--t4)",marginTop:2}}>Under 200 chars — used as avatar gen prompt + prepended to every segment prompt.</div>
              </div>

              <div className="fr2">
                <div className="fg">
                  <label className="fl">Seed (generation anchor)</label>
                  <input className="fi" type="number" value={form.seed} onChange={e=>set("seed",Number(e.target.value))}/>
                </div>
                <div className="fg">
                  <label className="fl">Reference Status</label>
                  <select className="fs" value={form.refStatus} onChange={e=>set("refStatus",e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="done">Done — avatar set</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Story fields ══ */}
          <div style={{borderTop:"1px solid var(--ln)",paddingTop:14,marginBottom:14}}>
            <div style={{fontSize:13,color:"var(--gold)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10}}>Story</div>
            {[
              ["appearance","Appearance","Visual description — hair, build, clothes, presence"],
              ["motivation","Motivation","What they want above all else"],
              ["secret","Secret ⚠","What they hide — the thing that changes everything if known"],
              ["arc","Character Arc","One sentence: where they start → where they end"],
            ].map(([k,l,ph])=>(
              <div key={k} className="fg" style={{marginBottom:8}}>
                <label className="fl">{l}</label>
                <textarea className="ft" value={form[k]||""} onChange={e=>set(k,e.target.value)}
                  placeholder={ph}
                  style={{minHeight:k==="arc"?44:60,fontFamily:"DM Sans,sans-serif",fontSize:15,lineHeight:1.6}}/>
              </div>
            ))}
          </div>

          {/* ══ Additional reference images ══ */}
          <div style={{borderTop:"1px solid var(--ln)",paddingTop:14,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontSize:13,color:"var(--gold)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Extra Reference Images</div>
                <div style={{fontSize:13,color:"var(--t4)",marginTop:2}}>Body shots, costume refs, mood boards — used alongside avatar during generation</div>
              </div>
              {(form.refImages||[]).length < 6 && (
                <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current?.click()} style={{fontSize:13}}>+ Add</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleUploadImages}/>
            </div>
            {(form.refImages||[]).length === 0 ? (
              <div
                onClick={()=>fileRef.current?.click()}
                style={{border:"2px dashed var(--ln)",borderRadius:8,padding:"16px",textAlign:"center",cursor:"pointer",fontSize:14,color:"var(--t4)",transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--ln)"}
              >
                Upload body shots, costume refs, or additional face angles
              </div>
            ) : (
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(form.refImages||[]).map(img=>(
                  <div key={img.id} style={{position:"relative",width:72,height:96,borderRadius:6,overflow:"hidden",border:"1px solid var(--ln)",background:"var(--bg3)",flexShrink:0}}>
                    <img src={img.dataUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    <div style={{position:"absolute",top:3,left:3}}>
                      <button
                        onClick={()=>toggleImgType(img.id)}
                        style={{fontSize:12,padding:"1px 5px",borderRadius:8,border:"none",cursor:"pointer",
                          background:typeColor[img.type]+"33",color:typeColor[img.type],
                          fontWeight:700,backdropFilter:"blur(4px)"}}>
                        {img.type}
                      </button>
                    </div>
                    <button onClick={()=>removeImage(img.id)}
                      style={{position:"absolute",top:3,right:3,width:16,height:16,borderRadius:"50%",
                        background:"rgba(0,0,0,.7)",border:"none",color:"#fff",fontSize:12,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </div>
                ))}
                {(form.refImages||[]).length < 6 && (
                  <div onClick={()=>fileRef.current?.click()}
                    style={{width:72,height:96,borderRadius:6,border:"1px dashed var(--ln)",display:"flex",
                      alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:23,opacity:.3,
                      transition:"border-color .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="var(--ln)"}
                  >+</div>
                )}
              </div>
            )}
          </div>

          {/* ══ Voice + Face URL ══ */}
          <div style={{borderTop:"1px solid var(--ln)",paddingTop:14}}>
            <div style={{fontSize:13,color:"var(--gold)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10}}>Advanced</div>
            <div className="fr2">
              <div className="fg">
                <label className="fl">
                  Face Reference URL
                  <span style={{color:"var(--t4)",fontWeight:400,marginLeft:6}}>— hosted URL for video generation (Jimeng)</span>
                </label>
                <div style={{display:"flex",gap:6}}>
                  <input className="fi" value={form.faceRef||""} onChange={e=>set("faceRef",e.target.value)}
                    placeholder="https://… paste a hosted portrait URL"
                    style={{flex:1,fontFamily:"JetBrains Mono,monospace",fontSize:13}}/>
                  {form.faceRef && <a href={form.faceRef} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{flexShrink:0}}>↗</a>}
                </div>
                <div style={{fontSize:12,color:"var(--t4)",marginTop:2}}>Jimeng/Seedance needs hosted URLs (not base64). Paste a Cloudinary or imgbb link.</div>
              </div>
              <div className="fg">
                <label className="fl">Voice Profile <span style={{color:"var(--t4)",fontWeight:400,marginLeft:6}}>— for TTS / dialogue gen</span></label>
                <textarea className="ft" value={form.voiceProfile||""} onChange={e=>set("voiceProfile",e.target.value)}
                  placeholder="e.g. Measured, low, French-accented. Never raises voice. Slow pace."
                  style={{minHeight:56,fontFamily:"DM Sans,sans-serif",fontSize:15,lineHeight:1.5}}/>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"12px 24px",borderTop:"1px solid var(--ln)",display:"flex",gap:8,justifyContent:"flex-end",background:"var(--bg)",flexShrink:0}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={submit} disabled={!form.name.trim()}>
            {isNew ? "Add Character" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
function RelationshipModal({ rel, chars, onSave, onClose }) {
  const isNew = rel === null;
  const [form, setForm] = useState(rel || { from:"", to:"", type:"alliance", label:"", weight:3, tension:"medium" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:24,maxWidth:460,width:"92%"}}>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)",marginBottom:16}}>{isNew?"New Relationship":"Edit Relationship"}</div>
        <div className="fr2">
          <div className="fg"><label className="fl">From</label>
            <select className="fs" value={form.from} onChange={e=>set("from",e.target.value)}>
              <option value="">Select character…</option>
              {chars.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="fg"><label className="fl">To</label>
            <select className="fs" value={form.to} onChange={e=>set("to",e.target.value)}>
              <option value="">Select character…</option>
              {chars.filter(c=>c.id!==form.from).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="fr2">
          <div className="fg"><label className="fl">Type</label>
            <select className="fs" value={form.type} onChange={e=>set("type",e.target.value)}>
              {REL_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="fg"><label className="fl">Tension</label>
            <select className="fs" value={form.tension} onChange={e=>set("tension",e.target.value)}>
              {TENSIONS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="fr2">
          <div className="fg"><label className="fl">Label (20 words max)</label><input className="fi" value={form.label} onChange={e=>set("label",e.target.value)} placeholder="Description of relationship…"/></div>
          <div className="fg"><label className="fl">Weight (1–5)</label><input className="fi" type="number" min="1" max="5" value={form.weight} onChange={e=>set("weight",Number(e.target.value))}/></div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={()=>{if(form.from&&form.to&&form.label){onSave(form);onClose();}}} disabled={!form.from||!form.to||!form.label}>Save</button>
        </div>
      </div>
    </div>
  );
}

function WorldFactEditor({ facts, dispatch }) {
  const [editing, setEditing] = useState(null); // factId
  const [editVal, setEditVal] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newFact, setNewFact] = useState({category:"",fact:""});
  const cats = [...new Set(facts.map(f=>f.category))].filter(Boolean);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:15,color:"var(--t3)"}}>{facts.length} facts across {cats.length} categories</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(true)}>+ Add Fact</button>
      </div>
      {cats.map(cat=>(
        <div key={cat} style={{marginBottom:18}}>
          <div className="sh"><span className="sh-t">{cat}</span><div className="sh-line"/></div>
          {facts.filter(f=>f.category===cat).map(f=>(
            <div key={f.id} className="card" style={{marginBottom:8,padding:"12px 14px"}}>
              {editing===f.id ? (
                <div>
                  <div className="fg"><label className="fl">Category</label><input className="fi" value={editVal.category??f.category} onChange={e=>setEditVal(v=>({...v,category:e.target.value}))}/></div>
                  <div className="fg"><label className="fl">Fact</label><textarea className="ft" value={editVal.fact??f.fact} onChange={e=>setEditVal(v=>({...v,fact:e.target.value}))} style={{minHeight:70,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
                  <div style={{display:"flex",gap:7}}>
                    <button className="btn btn-gold btn-sm" onClick={()=>{dispatch({type:"UPDATE_WORLD_FACT",id:f.id,patch:{category:editVal.category??f.category,fact:editVal.fact??f.fact}});setEditing(null);setEditVal({});}}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(null);setEditVal({});}}>Cancel</button>
                    <button className="btn btn-red btn-sm" style={{marginLeft:"auto"}} onClick={()=>dispatch({type:"DELETE_WORLD_FACT",id:f.id})}>Delete</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{fontSize:15,color:"var(--t2)",lineHeight:1.6,flex:1}}>{f.fact}</div>
                  <button className="btn btn-ghost btn-sm" style={{flexShrink:0}} onClick={()=>{setEditing(f.id);setEditVal({});}}>✎</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {facts.length===0&&<div className="empty"><div className="ei">🌍</div><div className="et">No world facts yet</div><div className="es">Add facts about your world's history, secrets, and rules.</div></div>}
      {showAdd&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:12,padding:22,maxWidth:440,width:"92%"}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",marginBottom:14}}>Add World Fact</div>
            <div className="fg"><label className="fl">Category</label>
              <input className="fi" list="cat-list" value={newFact.category} onChange={e=>setNewFact(f=>({...f,category:e.target.value}))} placeholder="e.g. History, The Scandal, Character Background…"/>
              <datalist id="cat-list">{cats.map(c=><option key={c} value={c}/>)}</datalist>
            </div>
            <div className="fg"><label className="fl">Fact</label><textarea className="ft" value={newFact.fact} onChange={e=>setNewFact(f=>({...f,fact:e.target.value}))} placeholder="One grounded true statement about your world…" style={{minHeight:80,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-gold" disabled={!newFact.category.trim()||!newFact.fact.trim()} onClick={()=>{dispatch({type:"ADD_WORLD_FACT",fact:{id:`wf${Date.now()}`,category:newFact.category,fact:newFact.fact,flags:[]}});setShowAdd(false);setNewFact({category:"",fact:""});}}>Add Fact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EndingsEditor({ endings, dispatch }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [nf, setNf] = useState({id:"",label:"",desc:"",prob:20,color:"#4aad75"});
  const total = endings.reduce((a,e)=>a+e.prob,0);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:15,color:Math.abs(total-100)<1?"var(--green2)":"var(--red2)"}}>Total probability: {total}% {Math.abs(total-100)>0&&`(should be 100%)`}</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(true)}>+ Add Ending</button>
      </div>
      <div className="g2">
        {endings.map(end=>(
          <div key={end.id} className="card" style={{borderLeft:`3px solid ${end.color}`}}>
            {editing===end.id ? (
              <div>
                <div className="fg"><label className="fl">Label</label><input className="fi" value={editVal.label??end.label} onChange={e=>setEditVal(v=>({...v,label:e.target.value}))}/></div>
                <div className="fg"><label className="fl">Description</label><textarea className="ft" value={editVal.desc??end.desc} onChange={e=>setEditVal(v=>({...v,desc:e.target.value}))} style={{minHeight:60,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
                <div className="fr2">
                  <div className="fg"><label className="fl">Probability %</label><input className="fi" type="number" min="0" max="100" value={editVal.prob??end.prob} onChange={e=>setEditVal(v=>({...v,prob:Number(e.target.value)}))}/></div>
                  <div className="fg"><label className="fl">Color</label><input className="fi" type="color" value={editVal.color??end.color} onChange={e=>setEditVal(v=>({...v,color:e.target.value}))} style={{padding:"4px 6px",height:38}}/></div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button className="btn btn-gold btn-sm" onClick={()=>{dispatch({type:"UPDATE_ENDING",id:end.id,patch:{label:editVal.label??end.label,desc:editVal.desc??end.desc,prob:editVal.prob??end.prob,color:editVal.color??end.color}});setEditing(null);setEditVal({});}}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(null);setEditVal({});}}>Cancel</button>
                  <button className="btn btn-red btn-sm" style={{marginLeft:"auto"}} onClick={()=>dispatch({type:"DELETE_ENDING",id:end.id})}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,color:"var(--gold2)",fontWeight:600}}>{end.label}</div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(end.id);setEditVal({});}}>✎</button>
                </div>
                <div style={{fontSize:15,color:"var(--t2)",marginBottom:10,lineHeight:1.5}}>{end.desc}</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div className="prog-track" style={{flex:1,height:5,borderRadius:3}}><div className="prog-fill" style={{width:`${end.prob}%`,background:end.color,height:"100%",borderRadius:3}}/></div>
                  <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:16,color:end.color,minWidth:36}}>{end.prob}%</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {endings.length===0&&<div className="empty" style={{paddingTop:30}}><div className="ei">🏁</div><div className="et">No endings defined</div><div className="es">Define possible endings and their initial probabilities.</div></div>}
      {showAdd&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:12,padding:22,maxWidth:440,width:"92%"}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",marginBottom:14}}>Add Ending</div>
            <div className="fg"><label className="fl">ID (slug)</label><input className="fi" value={nf.id} onChange={e=>setNf(f=>({...f,id:e.target.value.toLowerCase().replace(/\s/g,"_")}))} placeholder="e.g. reconciliation"/></div>
            <div className="fg"><label className="fl">Label</label><input className="fi" value={nf.label} onChange={e=>setNf(f=>({...f,label:e.target.value}))}/></div>
            <div className="fg"><label className="fl">Description</label><textarea className="ft" value={nf.desc} onChange={e=>setNf(f=>({...f,desc:e.target.value}))} style={{minHeight:60,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Probability %</label><input className="fi" type="number" value={nf.prob} onChange={e=>setNf(f=>({...f,prob:Number(e.target.value)}))}/></div>
              <div className="fg"><label className="fl">Color</label><input className="fi" type="color" value={nf.color} onChange={e=>setNf(f=>({...f,color:e.target.value}))} style={{padding:"4px 6px",height:38}}/></div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-gold" disabled={!nf.id||!nf.label} onClick={()=>{dispatch({type:"ADD_ENDING",ending:{...nf,flags:[]}});setShowAdd(false);setNf({id:"",label:"",desc:"",prob:20,color:"#4aad75"});}}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DecisionEditor({ decisions, dispatch }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [nf, setNf] = useState({id:"",ep:1,label:"",desc:"",options:["","",""]});
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:15,color:"var(--t3)"}}>{decisions.length} decision point{decisions.length!==1?"s":""}</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(true)}>+ Add Decision Point</button>
      </div>
      {decisions.map(dp=>(
        <div key={dp.id} className="card" style={{marginBottom:12}}>
          {editing===dp.id ? (
            <div>
              <div className="fr2">
                <div className="fg"><label className="fl">Label</label><input className="fi" value={editVal.label??dp.label} onChange={e=>setEditVal(v=>({...v,label:e.target.value}))}/></div>
                <div className="fg"><label className="fl">Episode</label><input className="fi" type="number" value={editVal.ep??dp.ep} onChange={e=>setEditVal(v=>({...v,ep:Number(e.target.value)}))}/></div>
              </div>
              <div className="fg"><label className="fl">Description / Question</label><textarea className="ft" value={editVal.desc??dp.desc} onChange={e=>setEditVal(v=>({...v,desc:e.target.value}))} style={{minHeight:55,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
              <div className="fg">
                <label className="fl">Options</label>
                {(editVal.options??dp.options).map((opt,i)=>(
                  <input key={i} className="fi" value={opt} style={{marginBottom:5}} onChange={e=>{const opts=[...(editVal.options??dp.options)];opts[i]=e.target.value;setEditVal(v=>({...v,options:opts}));}} placeholder={`Option ${i+1}…`}/>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={()=>setEditVal(v=>({...v,options:[...(v.options??dp.options),""]}))} style={{marginTop:3}}>+ Add Option</button>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button className="btn btn-gold btn-sm" onClick={()=>{dispatch({type:"UPDATE_DECISION",id:dp.id,patch:{label:editVal.label??dp.label,ep:editVal.ep??dp.ep,desc:editVal.desc??dp.desc,options:(editVal.options??dp.options).filter(o=>o.trim())}});setEditing(null);setEditVal({});}}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(null);setEditVal({});}}>Cancel</button>
                <button className="btn btn-red btn-sm" style={{marginLeft:"auto"}} onClick={()=>dispatch({type:"DELETE_DECISION",id:dp.id})}>Delete</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--gold)",background:"var(--gG)",padding:"2px 7px",borderRadius:4}}>EP{String(dp.ep).padStart(2,"0")}</span>
                <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:19,color:"var(--gold2)",fontWeight:600,flex:1}}>{dp.label}</span>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setEditing(dp.id);setEditVal({});}}>✎</button>
              </div>
              <div style={{fontSize:15,color:"var(--t2)",marginBottom:10}}>{dp.desc}</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {dp.options.map((opt,i)=>(
                  <div key={i} style={{padding:"6px 10px",borderRadius:6,background:"var(--bg3)",border:"1px solid var(--ln)",fontSize:15,color:"var(--t2)",display:"flex",gap:8}}>
                    <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--t3)",width:14}}>{i+1}.</span>{opt}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
      {decisions.length===0&&<div className="empty" style={{paddingTop:30}}><div className="ei">🎮</div><div className="et">No decision points</div><div className="es">Add the key moments where player choices shape the story.</div></div>}
      {showAdd&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:12,padding:22,maxWidth:480,width:"92%"}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",marginBottom:14}}>New Decision Point</div>
            <div className="fr2">
              <div className="fg"><label className="fl">Label</label><input className="fi" value={nf.label} onChange={e=>setNf(f=>({...f,label:e.target.value}))}/></div>
              <div className="fg"><label className="fl">Episode</label><input className="fi" type="number" value={nf.ep} onChange={e=>setNf(f=>({...f,ep:Number(e.target.value)}))}/></div>
            </div>
            <div className="fg"><label className="fl">Description</label><textarea className="ft" value={nf.desc} onChange={e=>setNf(f=>({...f,desc:e.target.value}))} style={{minHeight:55,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
            <div className="fg">
              <label className="fl">Options</label>
              {nf.options.map((opt,i)=><input key={i} className="fi" value={opt} style={{marginBottom:5}} onChange={e=>{const opts=[...nf.options];opts[i]=e.target.value;setNf(f=>({...f,options:opts}));}} placeholder={`Option ${i+1}…`}/>)}
              <button className="btn btn-ghost btn-sm" onClick={()=>setNf(f=>({...f,options:[...f.options,""]}))} style={{marginTop:3}}>+ Option</button>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-gold" disabled={!nf.label||nf.options.filter(o=>o.trim()).length<2} onClick={()=>{dispatch({type:"ADD_DECISION",dp:{...nf,id:`dp${Date.now()}`,options:nf.options.filter(o=>o.trim())}});setShowAdd(false);setNf({id:"",ep:1,label:"",desc:"",options:["","",""]});}}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STORY PROMPT TAB — structured prompt editor + AI bible generation
// ═══════════════════════════════════════════════════════════════════
const PROMPT_FIELDS = [
  { key: "logline",        label: "Logline",           hint: "One sentence: who wants what, what stops them, what's at stake.", rows: 2 },
  { key: "tone",           label: "Tone & Genre",      hint: "e.g. Dark romance, political thriller, slice-of-life with supernatural edges.", rows: 2 },
  { key: "world",          label: "World & Setting",   hint: "Time period, location, rules of this world, what makes it distinct.", rows: 4 },
  { key: "themes",         label: "Themes",            hint: "Core ideas the story explores — power, identity, sacrifice, redemption…", rows: 3 },
  { key: "episodeArc",     label: "Series Arc",        hint: "Overall story shape across all episodes — inciting incident, midpoint, climax, resolution.", rows: 4 },
  { key: "visualStyle",    label: "Visual Style",      hint: "Colour palette, art direction, cinematography feel for image & VN generation.", rows: 2 },
  { key: "audienceNotes",  label: "Audience & Rating", hint: "Target audience, content rating, what to avoid or lean into.", rows: 2 },
  { key: "additionalNotes",label: "Additional Notes",  hint: "Anything else — inspirations, reference shows/films, writer notes.", rows: 4 },
];

function StoryPromptTab({ state, dispatch, prompt }) {
  const [genPhase, setGenPhase] = useState("idle"); // idle | thinking | done | error
  const [genMsg,   setGenMsg]   = useState("");
  const [showFull, setShowFull] = useState(false);
  const [copied,   setCopied]   = useState(false);

  const proj = state.projects.find(p => p.id === state.activeProject);
  const apiKey = state.apiKey;

  const set = (key, val) => dispatch({ type: "SET_STORY_PROMPT", patch: { [key]: val } });

  // Build the compiled prompt text for copy/export
  const compiledPrompt = [
    proj?.name && `SERIES: ${proj.name}`,
    proj?.genre && `GENRE: ${proj.genre}`,
    prompt.logline && `LOGLINE:\n${prompt.logline}`,
    prompt.tone && `TONE & GENRE:\n${prompt.tone}`,
    prompt.world && `WORLD & SETTING:\n${prompt.world}`,
    prompt.themes && `THEMES:\n${prompt.themes}`,
    prompt.episodeArc && `SERIES ARC:\n${prompt.episodeArc}`,
    prompt.visualStyle && `VISUAL STYLE:\n${prompt.visualStyle}`,
    prompt.audienceNotes && `AUDIENCE:\n${prompt.audienceNotes}`,
    prompt.additionalNotes && `NOTES:\n${prompt.additionalNotes}`,
  ].filter(Boolean).join("\n\n");

  const filled = PROMPT_FIELDS.filter(f => prompt[f.key]?.trim()).length;

  // AI: generate entire bible from the prompt
  const generateBible = async () => {
    if (!apiKey) { setGenMsg("No Anthropic API key set — add it in Settings."); setGenPhase("error"); return; }
    if (!compiledPrompt.trim()) { setGenMsg("Fill in at least a logline and world description first."); setGenPhase("error"); return; }

    setGenPhase("thinking"); setGenMsg("Reading your story prompt…");

    const numEps = proj?.episodes || 8;

    const sysPrompt = `You are a professional story bible writer for serialised drama.
Given a story prompt, generate a complete, rich story bible as JSON.
Respond ONLY with valid JSON — no markdown fences, no commentary.

JSON shape:
{
  "characters": [
    { "id": "char_xxx", "name": "...", "age": 28, "archetype": "...", "role": "...",
      "appearance": "...", "motivation": "...", "secret": "...", "arc": "...",
      "color": "#hexcolor", "firstEp": 1, "seed": "...", "flags": [], "refStatus": "pending" }
  ],
  "relationships": [
    { "from": "char_id", "to": "char_id", "type": "romantic|rivalry|mentor|family|ally|enemy",
      "label": "short description", "tension": "low|medium|high|critical" }
  ],
  "worldFacts": [
    { "id": "wf_xxx", "category": "Society|History|Rules|Geography|Culture|Technology|Other",
      "title": "...", "body": "..." }
  ],
  "endings": [
    { "id": "end_xxx", "title": "...", "type": "happy|tragic|bittersweet|open",
      "conditions": "...", "description": "..." }
  ],
  "decisionPoints": [
    { "id": "dp_xxx", "episode": 1, "title": "...", "description": "...",
      "choices": [{"id":"c1","label":"...","consequence":"..."}] }
  ]
}

Generate:
- 5–10 richly developed characters with distinct voices
- Relationships that create dramatic tension
- 6–10 world facts that make the setting feel real
- 2–4 possible endings (the story should support multiple outcomes)
- 3–6 key decision points spread across the ${numEps} episodes

Every id must be unique. Use snake_case for ids.`;

    const userMsg = `STORY PROMPT:\n\n${compiledPrompt}\n\nEpisodes: ${numEps}`;

    try {
      setGenMsg("Generating characters, world, relationships…");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: sysPrompt,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const bible = JSON.parse(clean);

      // Merge into current bible (don't wipe existing data if user has some)
      const now = new Date().toISOString();
      const existing = state.bible;

      const mergeChars = [
        ...(existing.characters || []),
        ...(bible.characters || []).filter(nc => !existing.characters.find(ec => ec.id === nc.id)),
      ];
      const mergeRels = [
        ...(existing.relationships || []),
        ...(bible.relationships || []).filter(nr =>
          !existing.relationships.find(er => er.from === nr.from && er.to === nr.to)
        ),
      ];
      const mergeWF = [
        ...(existing.worldFacts || []),
        ...(bible.worldFacts || []).filter(nf => !existing.worldFacts.find(ef => ef.id === nf.id)),
      ];
      const mergeEnds = [
        ...(existing.endings || []),
        ...(bible.endings || []).filter(ne => !existing.endings.find(ee => ee.id === ne.id)),
      ];
      const mergeDPs = [
        ...(existing.decisionPoints || []),
        ...(bible.decisionPoints || []).filter(nd => !existing.decisionPoints.find(ed => ed.id === nd.id)),
      ];

      dispatch({ type: "SYNC_BIBLE_FROM_AI", bible: {
        characters:     mergeChars,
        relationships:  mergeRels,
        worldFacts:     mergeWF,
        endings:        mergeEnds,
        decisionPoints: mergeDPs,
        storyPrompt: { ...prompt, lastGenerated: now },
        bibleVersion: (existing.bibleVersion || 1) + 1,
        lastBibleChange: now,
        bibleChangelog: [...(existing.bibleChangelog || []), {
          version: (existing.bibleVersion || 1) + 1,
          timestamp: now,
          field: "ai_generation",
          entityId: "full_bible",
          before: null,
          after: `Generated ${mergeChars.length} chars, ${mergeRels.length} rels, ${mergeWF.length} world facts from story prompt`,
          note: "Generated from Story Prompt tab",
        }],
      }});

      dispatch({ type: "SET_STORY_PROMPT", patch: { lastGenerated: now } });
      setGenMsg(`✓ Generated ${bible.characters?.length || 0} characters, ${bible.worldFacts?.length || 0} world facts, ${bible.relationships?.length || 0} relationships, ${bible.endings?.length || 0} endings`);
      setGenPhase("done");
    } catch(e) {
      setGenMsg(e.message.includes("JSON") ? "AI returned malformed JSON — try again." : e.message);
      setGenPhase("error");
    }
  };

  return (
    <div style={{maxWidth: 860}}>
      {/* Header strip */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:20, gap:12, flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:18, fontFamily:"Cormorant Garamond,serif", color:"var(--gold)", marginBottom:2}}>
            Story Prompt
          </div>
          <div style={{fontSize:13, color:"var(--t4)"}}>
            {filled}/{PROMPT_FIELDS.length} sections filled
            {prompt.lastGenerated && <span style={{marginLeft:8, color:"var(--green2)"}}>· Last generated {new Date(prompt.lastGenerated).toLocaleDateString()}</span>}
          </div>
        </div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>setShowFull(v=>!v)}>
            {showFull ? "✎ Edit" : "◉ View Compiled"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={()=>{
            navigator.clipboard?.writeText(compiledPrompt);
            setCopied(true); setTimeout(()=>setCopied(false), 2000);
          }}>{copied ? "✓ Copied!" : "⎘ Copy Prompt"}</button>
          <button
            className="btn btn-gold"
            disabled={genPhase==="thinking" || !filled}
            title={!apiKey ? "Add Anthropic API key in Settings first" : ""}
            onClick={generateBible}>
            {genPhase==="thinking"
              ? <span style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:13,height:13,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>
                  Generating…
                </span>
              : "✦ Generate Bible"}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {(genPhase==="done"||genPhase==="error") && (
        <div className={`callout ${genPhase==="done"?"co-green":"co-red"}`}
          style={{marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <span>{genMsg}</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>setGenPhase("idle")}>✕</button>
        </div>
      )}
      {genPhase==="thinking" && (
        <div className="callout co-gold" style={{marginBottom:16, display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:14,height:14,border:"2px solid var(--gold)",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>
          {genMsg}
        </div>
      )}

      {/* Compiled view */}
      {showFull ? (
        <div className="card" style={{fontFamily:"'JetBrains Mono',monospace", fontSize:13,
          color:"var(--t2)", lineHeight:1.8, whiteSpace:"pre-wrap", maxHeight:600, overflowY:"auto"}}>
          {compiledPrompt || <span style={{color:"var(--t4)"}}>No prompt content yet. Fill in the fields below.</span>}
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          {PROMPT_FIELDS.map(f => (
            <div key={f.key} className="card" style={{padding:"14px 16px"}}>
              <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6}}>
                <label style={{fontSize:13, fontWeight:600, color:"var(--gold2)",
                  textTransform:"uppercase", letterSpacing:"1.2px"}}>{f.label}</label>
                {prompt[f.key]?.trim() && (
                  <span style={{fontSize:11, color:"var(--green2)"}}>✓ filled</span>
                )}
              </div>
              <div style={{fontSize:12, color:"var(--t4)", marginBottom:7}}>{f.hint}</div>
              <textarea
                className="fi"
                rows={f.rows}
                style={{width:"100%", resize:"vertical", fontFamily:"inherit",
                  fontSize:14, lineHeight:1.6, background:"var(--bg1)"}}
                value={prompt[f.key] || ""}
                placeholder={f.hint}
                onChange={e => set(f.key, e.target.value)}
              />
            </div>
          ))}

          {/* Generation tip */}
          <div className="callout co-gold" style={{fontSize:13}}>
            <strong style={{display:"block", marginBottom:4}}>✦ How to use</strong>
            Fill in as many sections as you like — even just a Logline and World is enough to start.
            Click <strong>Generate Bible</strong> to have AI create a full cast of characters, relationships,
            world facts, endings, and decision points. Existing entries are preserved and new ones are merged in.
            You can regenerate as many times as you want to refine.
          </div>
        </div>
      )}
    </div>
  );
}

function PageBible({ state, dispatch }) {
  const [tab, setTab] = useState("prompt");
  const [selChar, setSelChar] = useState(null);
  const [charModal, setCharModal] = useState(null); // null | "new" | char object
  const [relModal, setRelModal] = useState(null);   // null | "new" | {rel, idx}
  const [deleteCharId, setDeleteCharId] = useState(null);

  const char = state.bible.characters.find(c=>c.id===selChar);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Story Bible</div>
          <div className="ph-s">v{state.bible.bibleVersion} · {state.bible.lastBibleChange ? `Updated ${new Date(state.bible.lastBibleChange).toLocaleString()}` : "No changes yet"}</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-ghost btn-sm" onClick={()=>{
            const data = {bible:state.bible, project:state.projects.find(p=>p.id===state.activeProject)};
            const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
            const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="story_bible.json"; a.click();
          }}>↓ Export Bible</button>
        </div>
      </div>

      <div className="tabs">
        {[["prompt","✦ Story Prompt",0],["characters","Characters",state.bible.characters.length],["relationships","Relationships",state.bible.relationships.length],["world","World Facts",state.bible.worldFacts.length],["endings","Endings",state.bible.endings.length],["decisions","Decisions",state.bible.decisionPoints.length],["changelog","Changelog",state.bible.bibleChangelog.length]].map(([id,l,ct])=>(
          <div key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>
            {l}{ct>0&&<span style={{marginLeft:5,fontSize:12,opacity:.6,fontFamily:"JetBrains Mono,monospace"}}>{ct}</span>}
          </div>
        ))}
      </div>


      {/* ─ STORY PROMPT TAB */}
      {tab==="prompt" && (
        <StoryPromptTab
          state={state}
          dispatch={dispatch}
          prompt={state.bible.storyPrompt || {}}
        />
      )}

      {/* ─ CHARACTERS TAB */}
      {tab==="characters" && (
        <div className="g2">
          <div>
            {state.bible.characters.map(c=>(
              <div key={c.id} className={`bible-char ${selChar===c.id?"on":""}`} onClick={()=>setSelChar(c.id)}>
                <div className="char-avatar" style={{background:c.color+"22",border:`2px solid ${c.color}55`,overflow:"hidden",position:"relative"}}>
                  {c._avatarGenerating==="generating" ? (
                    <div className="spin-sm" style={{borderTopColor:c.color,width:14,height:14,margin:"auto"}}/>
                  ) : c.avatarUrl ? (
                    <img src={c.avatarUrl} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                  ) : c.refImages?.find(img=>img.type==="face") ? (
                    <img src={c.refImages.find(img=>img.type==="face").dataUrl} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                  ) : c.faceRef ? (
                    <img src={c.faceRef} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} onError={e=>e.target.style.display="none"}/>
                  ) : (
                    <span style={{fontSize:19,color:c.color+"cc"}}>{c.name.charAt(0)}</span>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:17,color:"var(--gold2)",marginBottom:2}}>{c.name}</div>
                  <div style={{fontSize:14,color:"var(--t3)"}}>Age {c.age} · {c.archetype}</div>
                  <div style={{fontSize:13,color:"var(--t4)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.role}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
                    {c.flags?.includes("changed")&&<span className="bible-flag bf-changed">⚑ changed</span>}
                    {c.firstEp>1&&<span style={{fontSize:12,color:"var(--t3)"}}>EP{c.firstEp}+</span>}
                    {c._avatarGenerating==="generating"&&<span style={{fontSize:12,color:"var(--gold)"}}>⟳ generating…</span>}
                    {c.avatarUrl&&<span style={{fontSize:12,color:"#4aad75"}}>✓ avatar</span>}
                  </div>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={()=>setCharModal("new")}>+ Add Character</button>
              {state.bible.characters.length > 0 && state.geminiKey && (
                <button
                  className="btn btn-ghost btn-sm"
                  title="Generate avatars for all characters without one"
                  onClick={async () => {
                    const toGen = state.bible.characters.filter(c => !c.avatarUrl && c._avatarGenerating !== "generating");
                    for (const char of toGen) {
                      dispatch({type:"SET_CHAR_AVATAR_STATUS", charId:char.id, status:"generating"});
                      try {
                        const dataUrl = await generateCharacterAvatar({ char, geminiKey:state.geminiKey, openaiKey:state.openaiKey||"", style:"realistic", engine:state.imageEngine||"nanoBanana2" });
                        dispatch({type:"SET_CHAR_AVATAR", charId:char.id, avatarUrl:dataUrl, style:"realistic"});
                        dispatch({type:"SET_CHAR_AVATAR_STATUS", charId:char.id, status:"done"});
                        // Save to IDB immediately — survives refresh
                        const histId = "av_" + Date.now();
                        idbSave(avatarKey(char.id, histId), dataUrl).catch(()=>{});
                      } catch(e) {
                        dispatch({type:"SET_CHAR_AVATAR_STATUS", charId:char.id, status:"error"});
                      }
                    }
                  }}
                >✦ Gen All Avatars</button>
              )}
            </div>
          </div>

          <div>
            {char ? (
              <div className="char-detail">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:64,height:72,borderRadius:8,background:char.color+"22",border:`2px solid ${char.color}55`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:29,flexShrink:0,position:"relative"}}>
                      {char._avatarGenerating==="generating" ? (
                        <div style={{textAlign:"center"}}>
                          <div className="spin-sm" style={{borderTopColor:char.color,width:18,height:18,margin:"0 auto 4px"}}/>
                          <div style={{fontSize:12,color:char.color}}>Generating…</div>
                        </div>
                      ) : char.avatarUrl ? (
                        <img src={char.avatarUrl} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      ) : char.refImages?.find(img=>img.type==="face") ? (
                        <img src={char.refImages.find(img=>img.type==="face").dataUrl} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      ) : char.faceRef ? (
                        <img src={char.faceRef} alt={char.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                      ) : (
                        <span style={{color:char.color+"cc"}}>{char.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)",fontWeight:600}}>{char.name}</div>
                      <div style={{fontSize:14,color:"var(--t3)"}}>Age {char.age} · {char.archetype} · EP{char.firstEp}+</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setCharModal(char)}>✎ Edit</button>
                    <button className="btn btn-red btn-sm" onClick={()=>setDeleteCharId(char.id)}>🗑</button>
                  </div>
                </div>
                {[["role","Role"],["appearance","Appearance"],["motivation","Motivation"],["secret","Secret ⚠"],["arc","Character Arc"]].map(([f,l])=>(
                  <div key={f} style={{marginBottom:12}}>
                    <div style={{fontSize:12,color:"var(--t3)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:4}}>{l}</div>
                    <div style={{fontSize:15,color:"var(--t2)",lineHeight:1.6,background:"var(--bg3)",padding:"9px 11px",borderRadius:6,border:"1px solid var(--ln)"}}>{char[f]||<span style={{color:"var(--t4)"}}>Not set</span>}</div>
                  </div>
                ))}
                <div className="fr2" style={{marginTop:4}}>
                  <div style={{fontSize:13,color:"var(--t3)"}}>Seed: <span style={{fontFamily:"JetBrains Mono,monospace",color:"var(--t2)"}}>{char.seed}</span></div>
                  <div style={{fontSize:13,color:"var(--t3)"}}>Ref: <SC.StatusBadge s={char.refStatus==="done"?"done":"pending"}/></div>
                </div>
                {char.lastChanged&&<div style={{fontSize:13,color:"var(--t3)",marginTop:10,borderTop:"1px solid var(--ln)",paddingTop:8}}>Last modified: {new Date(char.lastChanged).toLocaleString()}</div>}
                {char.refImages?.length > 0 && (
                  <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--ln)"}}>
                    <div style={{fontSize:12,color:"var(--t3)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:8}}>Reference Images ({char.refImages.length})</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {char.refImages.map(img=>(
                        <div key={img.id} style={{width:52,height:72,borderRadius:5,overflow:"hidden",border:"1px solid var(--ln)",position:"relative",flexShrink:0}}>
                          <img src={img.dataUrl} alt={img.label||img.type} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,.75)",padding:"2px 3px",fontSize:12,color:"rgba(255,255,255,.6)",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {img.label||img.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty"><div className="ei">🎭</div><div className="et">{state.bible.characters.length?`Select a character`:"No characters yet"}</div><div className="es">{state.bible.characters.length?"Click any character to view details.":"Add your first character to start the bible."}</div></div>
            )}
          </div>
        </div>
      )}

      {/* ─ RELATIONSHIPS TAB */}
      {tab==="relationships" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div className="callout co-gold" style={{flex:1,marginRight:12,marginBottom:0}}>Orange dot on the map = recently modified character. Click any node to see their relationships.</div>
            <button className="btn btn-ghost btn-sm" style={{flexShrink:0}} onClick={()=>setRelModal("new")}>+ Add Relationship</button>
          </div>
          {state.bible.characters.length>=2 ? (
            <>
              <RelationshipMap bible={state.bible} onSelectChar={setSelChar} selectedChar={selChar}/>
              <div style={{marginTop:14}}>
                <div className="sh"><span className="sh-t">All Relationships</span><div className="sh-line"/></div>
                {state.bible.relationships.map((r,idx)=>{
                  const fc=state.bible.characters.find(c=>c.id===r.from);
                  const tc=state.bible.characters.find(c=>c.id===r.to);
                  return (
                    <div key={idx} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--bg3)",borderRadius:7,border:"1px solid var(--ln)",marginBottom:5}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:TENSION_C[r.tension],flexShrink:0}}/>
                      <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:15,color:"var(--t1)",minWidth:90,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fc?.name||r.from}</span>
                      <span className="badge bd-ghost" style={{fontSize:12,flexShrink:0}}>{r.type}</span>
                      <span style={{flex:1,fontSize:14,color:"var(--t3)"}}>{r.label}</span>
                      <span style={{fontSize:12,color:TENSION_C[r.tension],flexShrink:0}}>{r.tension}</span>
                      <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:15,color:"var(--t1)",minWidth:90,textAlign:"right",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tc?.name||r.to}</span>
                      <button className="btn btn-ghost btn-sm" style={{flexShrink:0,padding:"2px 6px"}} onClick={()=>setRelModal({rel:r,idx})}>✎</button>
                      <button className="btn btn-red btn-sm" style={{flexShrink:0,padding:"2px 6px"}} onClick={()=>dispatch({type:"DELETE_RELATIONSHIP",idx})}>✕</button>
                    </div>
                  );
                })}
                {state.bible.relationships.length===0&&<div className="empty"><div className="ei">🕸</div><div className="et">No relationships yet</div><div className="es">Add relationships between characters.</div></div>}
              </div>
            </>
          ) : (
            <div className="empty"><div className="ei">🕸</div><div className="et">Add at least 2 characters first</div><div className="es">The relationship map needs characters to visualize.</div></div>
          )}
        </div>
      )}

      {/* ─ WORLD TAB */}
      {tab==="world" && <WorldFactEditor facts={state.bible.worldFacts} dispatch={dispatch}/>}

      {/* ─ ENDINGS TAB */}
      {tab==="endings" && <EndingsEditor endings={state.bible.endings} dispatch={dispatch}/>}

      {/* ─ DECISIONS TAB */}
      {tab==="decisions" && <DecisionEditor decisions={state.bible.decisionPoints} dispatch={dispatch}/>}

      {/* ─ CHANGELOG TAB */}
      {tab==="changelog" && (
        <div>
          {state.bible.bibleChangelog.length===0 ? (
            <div className="empty"><div className="ei">📜</div><div className="et">No changes logged</div><div className="es">Every edit to the bible is recorded here automatically.</div></div>
          ) : [...state.bible.bibleChangelog].reverse().map((log,i)=>(
            <div key={i} className="card" style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--gold)"}}>v{log.version}</span>
                <span style={{fontSize:13,color:"var(--t3)"}}>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <div style={{fontSize:15,color:"var(--t2)",marginBottom:4}}>{log.entityId} → <strong style={{color:"var(--t1)"}}>{log.field}</strong></div>
              {log.before&&<div className="dl dl-r">{String(log.before).substring(0,120)}</div>}
              {log.after&&<div className="dl dl-a">{String(log.after).substring(0,120)}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {charModal && (
        <CharacterModal
          char={charModal==="new" ? null : charModal}
          onSave={c => {
            if (!c.id || charModal==="new") dispatch({type:"ADD_CHARACTER",character:{...c,id:c.id||c.name.toLowerCase().replace(/\s+/g,"_"),flags:[],lastChanged:null}});
            else dispatch({type:"UPDATE_CHARACTER",id:c.id,patch:c});
            // Persist generated avatar(s) to IDB so they survive refresh
            if (c.avatarHistory?.length) {
              const charId = c.id || c.name.toLowerCase().replace(/\s+/g,"_");
              c.avatarHistory.forEach(entry => {
                if (entry.dataUrl && entry.dataUrl.startsWith("data:")) {
                  idbSave(avatarKey(charId, entry.id), entry.dataUrl).catch(()=>{});
                }
              });
            }
          }}
          dispatch={dispatch}
          geminiKey={state.geminiKey}
          openaiKey={state.openaiKey||""}
          imageEngine={state.imageEngine||"nanoBanana2"}
          onClose={()=>setCharModal(null)}
        />
      )}
      {relModal && (
        <RelationshipModal
          rel={relModal==="new"?null:relModal.rel}
          chars={state.bible.characters}
          onSave={r => {
            if (relModal==="new") dispatch({type:"ADD_RELATIONSHIP",rel:r});
            else dispatch({type:"UPDATE_RELATIONSHIP",idx:relModal.idx,patch:r});
          }}
          onClose={()=>setRelModal(null)}
        />
      )}
      {deleteCharId && (
        <div className="overlay">
          <div style={{background:"var(--bg2)",border:"1px solid var(--bR)",borderRadius:12,padding:22,maxWidth:380,width:"92%"}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--red2)",marginBottom:8}}>Delete Character?</div>
            <div style={{fontSize:15,color:"var(--t2)",marginBottom:16}}>This will also remove all relationships involving <strong>{state.bible.characters.find(c=>c.id===deleteCharId)?.name}</strong>. This cannot be undone (unless you use undo).</div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setDeleteCharId(null)}>Cancel</button>
              <button className="btn btn-red" onClick={()=>{dispatch({type:"DELETE_CHARACTER",id:deleteCharId});setSelChar(null);setDeleteCharId(null);}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ASSETS MODULE
const ASSET_EMOJIS = ["🏛","✒️","🎬","🎵","🖼","📄","✂️","🌫","🎭","🔑","📐","🎨","🎤","📽","📸","🗂","⚑","🏷","💎","🔮","📜","🧵","👗","🧣","🪡","🪞","🏺","🖋","📦","🔲"];
const ASSET_TYPES = ["all","logo","video","audio","image","doc"];
const ASSET_ICONS = {logo:"🏛",video:"🎬",audio:"🎵",image:"🖼",doc:"📄",all:"📦"};

function TagEditor({ tags, onChange }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const addTag = (val) => {
    const t = val.trim().toLowerCase().replace(/[^a-z0-9-]/g,"");
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };

  const removeTag = (t) => onChange(tags.filter(x => x !== t));

  return (
    <div className="tag-input-row" onClick={() => inputRef.current?.focus()}>
      {tags.map(t => (
        <span key={t} className="tag-chip">
          {t}
          <button className="tag-chip-x" onClick={e => { e.stopPropagation(); removeTag(t); }}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="tag-bare-input"
        value={input}
        placeholder={tags.length ? "" : "Add tags…"}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === "Enter" || e.key === ",") && input.trim()) { e.preventDefault(); addTag(input); }
          if (e.key === "Backspace" && !input && tags.length) removeTag(tags[tags.length - 1]);
        }}
        onBlur={() => input.trim() && addTag(input)}
      />
    </div>
  );
}

function AssetDetailPanel({ asset, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...asset });
  const [showEmoji, setShowEmoji] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const save = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fileInputRef = useRef(null);

  const handleFileReplace = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const type = f.type.startsWith("video")?"video":f.type.startsWith("audio")?"audio":f.type.startsWith("image")?"image":f.name.endsWith(".svg")||f.name.toLowerCase().includes("logo")?"logo":"doc";
    set("name", f.name);
    set("format", f.name.split(".").pop().toUpperCase());
    set("size", `${(f.size/1024).toFixed(0)}KB`);
    set("type", type);
    set("thumb", ASSET_ICONS[type] || "📄");
  };

  return (
    <>
      <div className="asset-detail-backdrop" onClick={onClose}/>
      <div className="asset-detail open">
        {/* Thumb header */}
        <div className="asset-detail-thumb">
          <span style={{ fontSize: 70 }}>{form.thumb}</span>
          <div style={{ position:"absolute", bottom:10, left:10, right:10, display:"flex", gap:6, justifyContent:"flex-end" }}>
            <button className="asset-detail-thumb-edit" onClick={() => setShowEmoji(s => !s)}>✎ Icon</button>
            <button className="asset-detail-thumb-edit" onClick={() => fileInputRef.current?.click()}>↑ Replace file</button>
            <input ref={fileInputRef} type="file" style={{ display:"none" }} onChange={handleFileReplace}/>
          </div>
          {showEmoji && (
            <div style={{ position:"absolute", bottom:50, right:10, zIndex:10 }}>
              <div className="emoji-picker">
                {ASSET_EMOJIS.map(e => (
                  <div key={e} className="emoji-opt" onClick={() => { set("thumb", e); setShowEmoji(false); }}>{e}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="asset-detail-body">
          <div className="fg">
            <label className="fl">Asset Name</label>
            <input className="fi" value={form.name} onChange={e => set("name", e.target.value)}/>
          </div>

          <div className="fr2">
            <div className="fg">
              <label className="fl">Type</label>
              <select className="fs" value={form.type} onChange={e => set("type", e.target.value)}>
                {["logo","video","audio","image","doc"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Format</label>
              <input className="fi" value={form.format || ""} onChange={e => set("format", e.target.value)} placeholder="SVG, MP4, WAV…"/>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Tags <span style={{color:"var(--t4)",fontWeight:400}}>— press Enter or comma to add</span></label>
            <TagEditor tags={form.tags || []} onChange={v => set("tags", v)}/>
          </div>

          <div className="fg">
            <label className="fl">Notes / Usage</label>
            <textarea className="ft" value={form.notes || ""} onChange={e => set("notes", e.target.value)}
              placeholder="Where is this asset used? Any production notes…" style={{ minHeight:70, fontFamily:"DM Sans,sans-serif", fontSize:15 }}/>
          </div>

          <div className="fg">
            <label className="fl">Usage in Episodes</label>
            <input className="fi" value={form.usedIn || ""} onChange={e => set("usedIn", e.target.value)} placeholder="e.g. EP01 intro, EP05 end card…"/>
          </div>

          {/* Metadata strip */}
          <div style={{ padding:"10px 12px", background:"var(--bg3)", borderRadius:7, border:"1px solid var(--ln)", fontSize:14, color:"var(--t3)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span>Size</span><span style={{ color:"var(--t2)" }}>{form.size || "—"}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span>Added</span><span style={{ color:"var(--t2)" }}>{form.added || "—"}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>Project</span><span style={{ color:"var(--t2)" }}>{form.project || "—"}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {confirmDelete ? (
          <div className="confirm-delete">
            <div style={{ fontSize:15, color:"var(--red2)", marginBottom:8 }}>Delete "{form.name}"? This cannot be undone.</div>
            <div style={{ display:"flex", gap:7 }}>
              <button className="btn btn-red btn-sm" onClick={() => onDelete(form.id)}>Yes, delete</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="asset-detail-foot">
            <button className="btn btn-red btn-sm" onClick={() => setConfirmDelete(true)}>🗑 Delete</button>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft:"auto" }} onClick={onClose}>Close</button>
            <button className="btn btn-gold btn-sm" onClick={save}>
              {saved ? "✓ Saved" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function AddAssetModal({ projectId, onAdd, onClose }) {
  const ICONS = {logo:"🏛",video:"🎬",audio:"🎵",image:"🖼",doc:"📄"};
  const [form, setForm] = useState({ name:"", type:"image", format:"", tags:[], thumb:"🖼", notes:"", size:"" });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const fileRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const type = f.type.startsWith("video")?"video":f.type.startsWith("audio")?"audio":f.type.startsWith("image")?"image":f.name.endsWith(".svg")||f.name.toLowerCase().includes("logo")?"logo":"doc";
    setForm(prev => ({...prev, name:f.name, format:f.name.split(".").pop().toUpperCase(), size:`${(f.size/1024).toFixed(0)}KB`, type, thumb:ICONS[type]||"📄"}));
  };

  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, id:`a${Date.now()}`, project:projectId, added:new Date().toISOString().slice(0,10) });
    onClose();
  };

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"var(--bg2)", border:"1px solid rgba(201,168,76,.3)", borderRadius:14, padding:24, maxWidth:460, width:"92%", maxHeight:"82vh", overflow:"auto" }}>
        <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:23, color:"var(--gold2)", marginBottom:4 }}>Add Asset</div>
        <div style={{ fontSize:15, color:"var(--t3)", marginBottom:18 }}>Upload a file or manually register an asset reference</div>

        {/* File drop */}
        <div className="drop-zone" style={{ marginBottom:16, padding:20 }}
          onDragOver={e=>{e.preventDefault();e.currentTarget.classList.add("active");}}
          onDragLeave={e=>e.currentTarget.classList.remove("active")}
          onDrop={e=>{e.preventDefault();e.currentTarget.classList.remove("active");handleFile(e.dataTransfer?.files?.[0]);}}
          onClick={() => fileRef.current?.click()}>
          <div className="drop-icon" style={{ fontSize:27, marginBottom:6 }}>⬆</div>
          <div className="drop-text" style={{ fontSize:15 }}>Drop a file or click to browse</div>
          <input ref={fileRef} type="file" style={{ display:"none" }} onChange={e => handleFile(e.target.files?.[0])}/>
        </div>

        {/* Icon picker */}
        <div className="fg" style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div>
            <label className="fl">Icon</label>
            <div style={{ width:46, height:46, background:"var(--bg3)", border:"1px solid var(--ln)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:29, cursor:"pointer" }} onClick={() => setShowEmoji(s=>!s)}>{form.thumb}</div>
          </div>
          <div style={{ flex:1 }}>
            <label className="fl">Name</label>
            <input className="fi" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Asset name"/>
          </div>
        </div>
        {showEmoji && <div className="emoji-picker" style={{ marginBottom:12 }}>{ASSET_EMOJIS.map(e=><div key={e} className="emoji-opt" onClick={()=>{set("thumb",e);setShowEmoji(false);}}>{e}</div>)}</div>}

        <div className="fr2">
          <div className="fg">
            <label className="fl">Type</label>
            <select className="fs" value={form.type} onChange={e=>set("type",e.target.value)}>
              {["logo","video","audio","image","doc"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Format</label>
            <input className="fi" value={form.format} onChange={e=>set("format",e.target.value)} placeholder="SVG, MP4, WAV…"/>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Tags</label>
          <TagEditor tags={form.tags} onChange={v=>set("tags",v)}/>
        </div>

        <div className="fg">
          <label className="fl">Notes</label>
          <textarea className="ft" value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Usage notes…" style={{ minHeight:55, fontFamily:"DM Sans,sans-serif", fontSize:15 }}/>
        </div>

        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!form.name.trim()} onClick={submit}>Add Asset</button>
        </div>
      </div>
    </div>
  );
}

function PageAssets({ state, dispatch }) {
  const [filter, setFilter] = useState("all");
  const [drag, setDrag] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const proj = state.activeProject;

  const all = state.assets.filter(a => a.project === proj);
  const assets = all.filter(a =>
    (filter === "all" || a.type === filter) &&
    (!search || a.name.toLowerCase().includes(search.toLowerCase()) || a.tags?.some(t => t.includes(search.toLowerCase())))
  );
  const selected = assets.find(a => a.id === selectedId) || state.assets.find(a => a.id === selectedId);

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    Array.from(e.dataTransfer?.files || []).forEach(f => {
      const type = f.type.startsWith("video")?"video":f.type.startsWith("audio")?"audio":f.type.startsWith("image")?"image":f.name.endsWith(".svg")||f.name.toLowerCase().includes("logo")?"logo":"doc";
      dispatch({ type:"ADD_ASSET", asset:{ id:`a${Date.now()}`, name:f.name, type, format:f.name.split(".").pop().toUpperCase(), project:proj, tags:[], thumb:ASSET_ICONS[type]||"📄", size:`${(f.size/1024).toFixed(0)}KB`, added:new Date().toISOString().slice(0,10) }});
    });
  };

  return (
    <div>
      <div className="ph">
        <div><div className="ph-t">IP Asset Library</div><div className="ph-s">Logos, intros, themes, reference images — click any asset to edit</div></div>
        <div className="ph-r">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(true)}>+ Add Asset</button>
        </div>
      </div>

      {/* Filters + search */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {ASSET_TYPES.map(t => (
          <button key={t} className={`btn btn-sm ${filter===t?"btn-gold":"btn-ghost"}`} onClick={() => setFilter(t)}>
            {ASSET_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
        <input className="fi" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or tag…" style={{ width:160, padding:"5px 10px", marginLeft:"auto" }}/>
        <span style={{ fontSize:14, color:"var(--t3)", flexShrink:0 }}>{assets.length}/{all.length}</span>
      </div>

      {/* Drop zone */}
      <div className={`drop-zone ${drag?"active":""}`} style={{ marginBottom:16, padding:"16px 20px" }}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}>
        <div className="drop-icon" style={{ fontSize:27, marginBottom:5 }}>⬆</div>
        <div className="drop-text">Drop files to upload</div>
        <div className="drop-sub">Any format — type detected automatically</div>
      </div>

      {/* Grid */}
      <div className="g4" style={{ marginBottom:24 }}>
        {assets.map(a => (
          <div key={a.id} className={`asset-card ${selectedId===a.id?"selected":""}`}
            onClick={() => setSelectedId(a.id)}>
            <div className="asset-thumb" style={{ background:"var(--bg2)" }}>{a.thumb}</div>
            <div className="asset-info">
              <div className="asset-name" title={a.name}>{a.name}</div>
              <div className="asset-meta">{a.format && `${a.format} · `}{a.size}</div>
              <div style={{ display:"flex", gap:4, marginTop:5, flexWrap:"wrap" }}>
                <span className={`asset-tag at-${a.type}`}>{a.type}</span>
                {(a.tags||[]).slice(0,2).map(t => <span key={t} className="asset-tag" style={{ background:"var(--bg2)", color:"var(--t3)" }}>{t}</span>)}
                {(a.tags||[]).length > 2 && <span className="asset-tag" style={{ background:"var(--bg2)", color:"var(--t4)" }}>+{a.tags.length-2}</span>}
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div className="asset-card" style={{ border:"1px dashed var(--ln)", display:"flex", alignItems:"center", justifyContent:"center", minHeight:160, opacity:.4, cursor:"pointer" }} onClick={() => setShowAdd(true)}>
          <div style={{ textAlign:"center", color:"var(--t3)" }}>
            <div style={{ fontSize:25, marginBottom:5 }}>+</div>
            <div style={{ fontSize:14 }}>Add Asset</div>
          </div>
        </div>
      </div>

      {assets.length === 0 && all.length > 0 && (
        <div className="empty" style={{ paddingTop:20 }}>
          <div className="ei">🔍</div>
          <div className="et">No assets match</div>
          <div className="es">Try a different filter or search term.</div>
        </div>
      )}

      {/* Asset type reference */}
      <div>
        <div className="sh"><span className="sh-t">Asset Categories</span><div className="sh-line"/></div>
        <div className="g3">
          {[
            {icon:"🏛",t:"Logo",d:"Brand marks, wordmarks, monograms. Used in end cards and intro sequences."},
            {icon:"🎬",t:"Video",d:"Opening sequences, end cards, transitions. Reused across all episodes."},
            {icon:"🎵",t:"Audio",d:"Theme music, signature sounds, ambient tracks, character leitmotifs."},
            {icon:"🖼",t:"Image",d:"Character reference sheets, location stills, prop reference photos."},
            {icon:"📄",t:"Document",d:"Scripts, bible PDFs, storyboards, legal docs."},
          ].map(a => (
            <div key={a.t} className="card" style={{ display:"flex", gap:10 }}>
              <span style={{ fontSize:25, lineHeight:1 }}>{a.icon}</span>
              <div>
                <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:16, color:"var(--gold2)", marginBottom:3 }}>{a.t}</div>
                <div style={{ fontSize:14, color:"var(--t3)" }}>{a.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-in detail panel */}
      {selected && (
        <AssetDetailPanel
          asset={selected}
          onSave={patch => dispatch({ type:"UPDATE_ASSET", id:selected.id, patch })}
          onDelete={id => { dispatch({ type:"DELETE_ASSET", id }); setSelectedId(null); }}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <AddAssetModal
          projectId={proj}
          onAdd={asset => dispatch({ type:"ADD_ASSET", asset })}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}


// ── EPISODES MODULE
const SEG_TYPES = ["A","B","C","D","E","F","G","H"];
const SEG_TYPE_NAMES = {A:"Establishing",B:"Character Intro",C:"Dialogue",D:"Reaction",E:"Action",F:"Detail/Clue",G:"Transition",H:"Final Frame"};

function SegmentEditor({ seg, ep, state, dispatch, onClose }) {
  const [form, setForm] = useState({...seg});
  const [saved, setSaved] = useState(false);
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setSaved(false); };
  const save = () => {
    dispatch({type:"UPDATE_SEGMENT",id:seg.id,patch:form});
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };
  const chars = state.bible.characters;
  return (
    <div style={{background:"var(--bg2)",border:"1px solid var(--ln)",borderRadius:11,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <SC.SegType t={form.type}/>
          <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:14,color:"var(--t3)"}}>{seg.id}</span>
          <SC.StatusBadge s={seg.status}/>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-gold btn-sm" onClick={save}>{saved?"✓ Saved":"Save"}</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          <button className="btn btn-red btn-sm" onClick={()=>{dispatch({type:"DELETE_SEGMENT",id:seg.id});onClose();}}>🗑</button>
        </div>
      </div>

      <div className="fr3">
        <div className="fg">
          <label className="fl">Type</label>
          <select className="fs" value={form.type} onChange={e=>set("type",e.target.value)}>
            {SEG_TYPES.map(t=><option key={t} value={t}>{t} — {SEG_TYPE_NAMES[t]}</option>)}
          </select>
        </div>
        <div className="fg"><label className="fl">Duration (sec)</label><input className="fi" type="number" min="2" max="30" value={form.dur} onChange={e=>set("dur",Number(e.target.value))}/></div>
        <div className="fg"><label className="fl">Seed</label><input className="fi" type="number" value={form.seed} onChange={e=>set("seed",Number(e.target.value))}/></div>
      </div>

      <div className="fr2">
        <div className="fg"><label className="fl">Scene Slug</label><input className="fi" value={form.scene||""} onChange={e=>set("scene",e.target.value)} placeholder="e.g. design_floor"/></div>
        <div className="fg">
          <label className="fl">Status</label>
          <select className="fs" value={form.status} onChange={e=>set("status",e.target.value)}>
            {["pending","queued","running","done","failed"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="fr2">
        <div className="fg">
          <label className="fl">Bridge (@image1 reference)</label>
          <select className="fs" value={form.bridge?"yes":"no"} onChange={e=>set("bridge",e.target.value==="yes")}>
            <option value="no">No bridge</option>
            <option value="yes">Yes — uses @image1</option>
          </select>
        </div>
        <div className="fg"><label className="fl">Clue Code</label><input className="fi" value={form.clue||""} onChange={e=>set("clue",e.target.value)} placeholder="e.g. 1A, 2B…"/></div>
      </div>

      <div className="fg">
        <label className="fl">Characters in scene</label>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",padding:"7px 10px",background:"var(--bg3)",border:"1px solid var(--ln)",borderRadius:7,minHeight:36}}>
          {chars.map(c=>(
            <div key={c.id} style={{padding:"2px 8px",borderRadius:10,border:`1px solid ${(form.chars||[]).includes(c.id)?c.color:"var(--ln)"}`,background:(form.chars||[]).includes(c.id)?c.color+"22":"transparent",cursor:"pointer",fontSize:14,color:(form.chars||[]).includes(c.id)?c.color:"var(--t3)",transition:"all .1s"}}
              onClick={()=>set("chars",(form.chars||[]).includes(c.id)?(form.chars||[]).filter(x=>x!==c.id):[...(form.chars||[]),c.id])}>
              <span style={{marginRight:3}}>{c.faceRef?"📸":""}</span>{c.name.split(" ")[0]}
              {(form.chars||[]).includes(c.id) && c.visualLock && <span style={{fontSize:12,color:c.color,marginLeft:4}}>🔒</span>}
            </div>
          ))}
          {chars.length===0&&<span style={{fontSize:14,color:"var(--t4)"}}>Add characters to the Bible first</span>}
        </div>
        {/* Show which chars have visual locks */}
        {(form.chars||[]).length > 0 && (
          <div style={{marginTop:5,display:"flex",flexWrap:"wrap",gap:4}}>
            {(form.chars||[]).map(id => {
              const c = chars.find(x=>x.id===id);
              if (!c) return null;
              return (
                <div key={id} style={{fontSize:13,color:"var(--t4)",display:"flex",gap:4,alignItems:"center"}}>
                  <span style={{color:c.color}}>{c.name.split(" ")[0]}</span>
                  {c.visualLock ? <span style={{color:"var(--green2)"}}>🔒 visual lock</span> : <span style={{color:"var(--amber2)"}}>⚠ no visual lock</span>}
                  {c.faceRef ? <span style={{color:"var(--green2)"}}>📸 face ref</span> : <span style={{color:"var(--t4)"}}>no face ref</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CINEMATIC DIRECTION */}
      <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--ln2)"}}>
        <div style={{fontSize:13,color:"var(--gold)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10}}>Cinematic Direction</div>
        <div className="fg" style={{marginBottom:8}}>
          <label className="fl">Background / Environment Lock <span style={{color:"var(--t4)",fontWeight:400}}>— prepended to prompt for scene consistency</span></label>
          <textarea className="ft" value={form.bg||""} onChange={e=>set("bg",e.target.value)}
            placeholder="e.g. Maison Lumière design floor. Ivory walls, raw concrete floor, north-facing skylights flooding the space with cold Paris light. Mannequins at edges. Film grain. Warm ivory-champagne color grade."
            style={{minHeight:55,fontFamily:"DM Sans,sans-serif",fontSize:15,lineHeight:1.5}}/>
        </div>
        <div className="fr3" style={{marginBottom:8}}>
          <div className="fg">
            <label className="fl">Camera Angle</label>
            <select className="fs" value={form.camera||""} onChange={e=>set("camera",e.target.value)}>
              <option value="">— select —</option>
              {CAMERA_ANGLES.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Shot Type</label>
            <select className="fs" value={form.shotType||""} onChange={e=>set("shotType",e.target.value)}>
              <option value="">— select —</option>
              {SHOT_TYPES.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Lighting</label>
            <select className="fs" value={form.lighting||""} onChange={e=>set("lighting",e.target.value)}>
              <option value="">— select —</option>
              {LIGHTING_MOODS.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="fg" style={{marginBottom:8}}>
          <label className="fl">Mood / Atmosphere</label>
          <input className="fi" value={form.mood||""} onChange={e=>set("mood",e.target.value)} placeholder="e.g. tense, suspended breath — or cold, bureaucratic, inevitable"/>
        </div>
      </div>

      <div className="fg" style={{marginTop:8}}>
        <label className="fl">Core Action / Dialogue Prompt <span style={{color:"var(--t4)",fontWeight:400}}>— what happens; camera/lighting handled above</span></label>
        <textarea className="ft" value={form.prompt||""} onChange={e=>set("prompt",e.target.value)} style={{minHeight:110,fontFamily:"JetBrains Mono,monospace",fontSize:14,lineHeight:1.65}}/>
      </div>

      {/* ── ASSEMBLED PROMPT PREVIEW */}
      {(form.bg || form.camera || form.lighting || form.mood || form.prompt) && (
        <div style={{marginTop:10,padding:"10px 12px",background:"var(--bg4)",border:"1px solid var(--ln2)",borderRadius:7}}>
          <div style={{fontSize:12,color:"var(--gold)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6}}>Assembled prompt sent to Jimeng</div>
          <pre style={{fontSize:13,fontFamily:"JetBrains Mono,monospace",color:"var(--t2)",lineHeight:1.6,whiteSpace:"pre-wrap",margin:0}}>
            {buildFinalPrompt(form, chars)}
          </pre>
        </div>
      )}

      <div className="fg"><label className="fl">Production Notes</label><textarea className="ft" value={form.notes||""} onChange={e=>set("notes",e.target.value)} style={{minHeight:50,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
    </div>
  );
}

function AddSegmentModal({ ep, onAdd, onClose }) {
  const [form, setForm] = useState({type:"A",scene:"",dur:6,seed:Math.floor(1000+Math.random()*8000),bridge:false,chars:[],prompt:"",clue:"",notes:"",status:"pending"});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:22,maxWidth:500,width:"92%"}}>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",marginBottom:14}}>Add Segment to EP{String(ep.num).padStart(3,"0")}</div>
        <div className="fr3">
          <div className="fg"><label className="fl">Type</label><select className="fs" value={form.type} onChange={e=>set("type",e.target.value)}>{SEG_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="fg"><label className="fl">Duration (s)</label><input className="fi" type="number" value={form.dur} onChange={e=>set("dur",Number(e.target.value))}/></div>
          <div className="fg"><label className="fl">Scene</label><input className="fi" value={form.scene} onChange={e=>set("scene",e.target.value)} placeholder="slug"/></div>
        </div>
        <div className="fg"><label className="fl">Prompt</label><textarea className="ft" value={form.prompt} onChange={e=>set("prompt",e.target.value)} style={{minHeight:80,fontFamily:"JetBrains Mono,monospace",fontSize:14}}/></div>
        <div className="fg"><label className="fl">Notes</label><input className="fi" value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={()=>{ onAdd({...form,id:`s${Date.now()}`}); onClose(); }}>Add Segment</button>
        </div>
      </div>
    </div>
  );
}

function AddEpisodeModal({ projectEps, onAdd, onClose }) {
  const nextNum = (projectEps.sort((a,b)=>b.num-a.num)[0]?.num||0)+1;
  const [form, setForm] = useState({num:nextNum,title:"",notes:""});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:22,maxWidth:420,width:"92%"}}>
        <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--gold2)",marginBottom:14}}>New Episode</div>
        <div className="fr2">
          <div className="fg"><label className="fl">Episode Number</label><input className="fi" type="number" value={form.num} onChange={e=>set("num",Number(e.target.value))}/></div>
          <div className="fg"><label className="fl">Title</label><input className="fi" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Episode title…"/></div>
        </div>
        <div className="fg"><label className="fl">Notes (optional)</label><textarea className="ft" value={form.notes} onChange={e=>set("notes",e.target.value)} style={{minHeight:55,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!form.title.trim()} onClick={()=>{ onAdd({id:`ep${Date.now()}`,num:form.num,title:form.title,notes:form.notes,status:"not_started",segments:[]}); onClose(); }}>Create Episode</button>
        </div>
      </div>
    </div>
  );
}

function PageEpisodes({ state, dispatch, onGenerateEpisodes, onGenerateAll, saveImageToServer }) {
  const [editingSeg, setEditingSeg]         = useState(null);
  const [editingEpTitle, setEditingEpTitle] = useState(false);
  const [epTitleVal, setEpTitleVal]         = useState("");
  const [showAddSeg, setShowAddSeg]         = useState(false);
  const [showAddEp, setShowAddEp]           = useState(false);
  const [showDeleteEp, setShowDeleteEp]     = useState(false);
  const [showAutoGen, setShowAutoGen]       = useState(null); // ep object | null
  const [showPromptSheet, setShowPromptSheet] = useState(false);
  const [showVN, setShowVN]                 = useState(false);
  // "auto" | "manual" — persists per session
  const [genMode, setGenMode]               = useState("auto");
  // per-episode inline generation state { epId: { running, msg, pct, done } }
  const [epGenState, setEpGenState]         = useState({});

  const ep   = state.episodes.find(e => e.id === state.activeEpisode);
  const proj = state.projects.find(p => p.id === state.activeProject);
  const eps  = state.episodes.filter(e => e.project === state.activeProject).sort((a,b) => a.num - b.num);

  // Run single-segment video (with fallback sim if no Jimeng key)
  const runSegVideo = async (segId) => {
    const seg = ep?.segments.find(s => s.id === segId);
    if (!seg) return;
    if (!state.jimengKey) {
      dispatch({ type:"UPDATE_SEG_STATUS", id:segId, status:"queued" });
      setTimeout(() => dispatch({ type:"UPDATE_SEG_STATUS", id:segId, status:"running" }), 1200);
      setTimeout(() => dispatch({ type:"UPDATE_SEG_STATUS", id:segId, status:"done", videoUrl:"https://placeholder-video.example.com/"+segId+".mp4" }), 5500);
      return;
    }
    const jobId = `vj_${segId}_${Date.now()}`;
    dispatch({ type:"ADD_VIDEO_JOB", job:{ id:jobId, segId, epId:ep.id, projectId:state.activeProject, status:"queued", taskId:null, videoUrl:null, error:null, segTitle:seg.notes||seg.prompt.substring(0,50), startedAt:new Date().toISOString(), finishedAt:null }});
    generateSegmentVideo({ apiKey:state.jimengKey, seg, ep, model:state.jimengModel, resolution:state.jimengRes, aspect:state.jimengAspect, dispatch, jobId, allChars:state.bible.characters });
  };

  // Inline generate for episode list row — full auto pipeline
  const runEpInline = async (targetEp) => {
    const id = targetEp.id;
    const setS = (patch) => setEpGenState(s => ({ ...s, [id]: { ...s[id], ...patch }}));
    setS({ running:true, msg:"Starting…", pct:5, done:false, error:null });
    try {
      await autoGenerateEpisode({
        state,
        dispatch,
        epId: id,
        onStatus: (msg, pct) => setS({ msg, pct }),
      });
      setS({ running:false, done:true, msg:"Done", pct:100 });
    } catch(err) {
      setS({ running:false, error:err.message, done:false, pct:0 });
    }
  };

  // ── EPISODE LIST VIEW (no episode selected) ──
  if (!ep) {
    const hasClaude = !!state.apiKey;
    const hasJimeng = !!state.jimengKey;

    return (
      <div>
        <div className="ph">
          <div>
            <div className="ph-t">Episodes</div>
            <div className="ph-s">{eps.length} episode{eps.length!==1?"s":""} · Click to open or generate from here</div>
          </div>
          <div className="ph-r">
            {/* Mode toggle */}
            <div style={{display:"flex",background:"var(--bg3)",borderRadius:7,padding:2,border:"1px solid var(--ln)"}}>
              <button
                className={`btn btn-sm ${genMode==="auto"?"btn-gold":""}`}
                style={{borderRadius:5,padding:"3px 10px",fontSize:14}}
                onClick={() => setGenMode("auto")}
                title="Automatic: AI writes + Jimeng generates videos with one click"
              >✦ Auto</button>
              <button
                className={`btn btn-sm ${genMode==="manual"?"btn-gold":""}`}
                style={{borderRadius:5,padding:"3px 10px",fontSize:14}}
                onClick={() => setGenMode("manual")}
                title="Manual: AI writes prompts, you copy-paste to Jimeng"
              >📋 Manual</button>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddEp(true)}>+ New Episode</button>
            <button className="btn btn-ghost btn-sm" onClick={onGenerateEpisodes}>+ Generate Batch</button>
            {onGenerateAll && (
              <button className="btn btn-gold btn-sm" onClick={onGenerateAll} title="Generate all episode content automatically in sequence">
                ✦ Generate All
              </button>
            )}
          </div>
        </div>

        {/* Mode explanation banner */}
        <div className={`callout ${genMode==="auto"?"co-gold":"co-blue"}`} style={{fontSize:14,marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
          {genMode==="auto" ? (
            <>
              <span>✦</span>
              <span><strong>Auto mode:</strong> Click <strong>▶ Generate</strong> on any episode — AI writes all segment prompts then immediately submits each one to Seedance 2.0. Videos load automatically as they finish. Requires Claude API key{!hasClaude&&<span style={{color:"var(--red2)"}}> (missing)</span>}{hasJimeng?"":" + Jimeng key (optional — will write prompts only if missing)"}.</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span><strong>Manual mode:</strong> Click <strong>✦ Write Prompts</strong> — AI generates all segment prompts. Then click <strong>📋 Sheet</strong> to copy-paste each prompt into <a href="https://jimeng.jianying.com" target="_blank" rel="noreferrer" style={{color:"var(--blue2)"}}>Jimeng</a> manually. Use this if you don't have a Jimeng API key.</span>
            </>
          )}
        </div>

        {eps.length === 0 ? (
          <div className="empty" style={{paddingTop:60}}>
            <div className="ei">🎬</div>
            <div className="et">No episodes yet</div>
            <div className="es">Create episodes manually or generate a full batch from your project bible.</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:16}}>
              <button className="btn btn-ghost" onClick={() => setShowAddEp(true)}>+ New Episode</button>
              <button className="btn btn-gold" onClick={onGenerateEpisodes}>✦ Generate Episodes</button>
            </div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ep</th><th>Title</th><th>Status</th><th>Segs</th><th>Video</th><th>Progress</th>
                <th style={{textAlign:"right"}}>{genMode==="auto"?"Auto Generate":"Write Prompts"}</th>
              </tr>
            </thead>
            <tbody>
              {eps.map(e => {
                const tot   = e.segments.length;
                const done  = e.segments.filter(s => s.status === "done").length;
                const vids  = e.segments.filter(s => s.videoUrl).length;
                const dur   = e.segments.reduce((a,s) => a+s.dur, 0);
                const gs    = epGenState[e.id];
                const hasSegs = tot > 0;
                return (
                  <tr key={e.id}>
                    <td style={{cursor:"pointer"}} onClick={() => dispatch({type:"SET_EPISODE",id:e.id})}>
                      <span className="mono">{String(e.num).padStart(3,"0")}</span>
                    </td>
                    <td style={{cursor:"pointer"}} onClick={() => dispatch({type:"SET_EPISODE",id:e.id})}>
                      <span style={{fontFamily:"Cormorant Garamond,serif",color:"var(--t1)"}}>{e.title}</span>
                      {dur>0&&<span style={{fontSize:12,color:"var(--t3)",marginLeft:7,fontFamily:"JetBrains Mono,monospace"}}>{dur}s</span>}
                    </td>
                    <td><SC.StatusBadge s={e.status}/></td>
                    <td><span className="mono">{tot||<span style={{color:"var(--t4)"}}>—</span>}</span></td>
                    <td>
                      {vids > 0
                        ? <span style={{color:"var(--green2)",fontSize:14}}>🎬 {vids}</span>
                        : <span style={{color:"var(--t4)",fontSize:14}}>—</span>}
                    </td>
                    <td style={{width:100}}>
                      {tot > 0 && (
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div className="prog-track" style={{flex:1}}>
                            <div className="prog-fill" style={{width:`${Math.round(done/tot*100)}%`,background:proj?.color||"var(--gold)"}}/>
                          </div>
                          <span style={{fontSize:12,color:"var(--t3)",fontFamily:"JetBrains Mono,monospace",width:26}}>{Math.round(done/tot*100)}%</span>
                        </div>
                      )}
                      {gs?.running && (
                        <div style={{fontSize:12,color:"var(--blue2)",marginTop:2}}>{gs.msg} {gs.pct}%</div>
                      )}
                      {gs?.error && (
                        <div style={{fontSize:12,color:"var(--red2)",marginTop:2}} title={gs.error}>✗ Error</div>
                      )}
                    </td>
                    <td style={{textAlign:"right"}}>
                      <div style={{display:"flex",gap:5,justifyContent:"flex-end",alignItems:"center"}}>
                        {hasSegs && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{fontSize:13}}
                            onClick={() => dispatch({type:"SET_EPISODE",id:e.id})}
                          >Open →</button>
                        )}
                        {genMode === "auto" ? (
                          <div style={{display:"flex",gap:4,alignItems:"center"}}>
                            <button
                              className="btn btn-gold btn-sm"
                              style={{fontSize:13,minWidth:90}}
                              disabled={gs?.running || (!hasClaude && !hasSegs)}
                              onClick={() => gs?.running ? null : runEpInline(e)}
                              title={hasSegs ? "Submit segments to Seedance 2.0" : "AI writes segments then submits to video gen"}
                            >
                              {gs?.running
                                ? <><span className="spin-sm" style={{borderTopColor:"var(--bg)"}}/> {gs.pct}%</>
                                : gs?.done
                                  ? "✓ Done"
                                  : hasSegs
                                    ? "▶ Generate Video"
                                    : "✦ Write & Generate"}
                            </button>
                            {/* Prompt sheet always available as manual fallback */}
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{fontSize:13,opacity: hasSegs ? 1 : 0.45}}
                              disabled={!hasSegs && !hasClaude}
                              onClick={() => {
                                if (!hasSegs) { runEpInline(e).then(() => setTimeout(()=>setShowPromptSheet(true),300)); }
                                else { dispatch({type:"SET_EPISODE",id:e.id}); setTimeout(()=>setShowPromptSheet(true),50); }
                              }}
                              title={hasSegs ? "📋 Copy prompts to paste into Jimeng manually" : "Write prompts first, then open sheet"}
                            >📋</button>
                          </div>
                        ) : (
                          // Manual mode
                          <div style={{display:"flex",gap:4}}>
                            <button
                              className="btn btn-gold btn-sm"
                              style={{fontSize:13,minWidth:90}}
                              disabled={gs?.running || (!hasClaude && !hasSegs)}
                              onClick={() => gs?.running ? null : runEpInline(e)}
                              title={hasSegs ? "Regenerate segment prompts with AI" : "AI writes segment prompts"}
                            >
                              {gs?.running
                                ? <><span className="spin-sm" style={{borderTopColor:"var(--bg)"}}/> {gs.pct}%</>
                                : gs?.done
                                  ? "✓ Written"
                                  : hasSegs ? "✦ Rewrite" : "✦ Write Prompts"}
                            </button>
                            {hasSegs && (
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{fontSize:13}}
                                onClick={() => { dispatch({type:"SET_EPISODE",id:e.id}); setTimeout(()=>setShowPromptSheet(true),50); }}
                                title="Copy-paste prompts for manual Jimeng submission"
                              >📋 Sheet</button>
                            )}
                            <button
                              className="btn btn-gold btn-sm"
                              style={{fontSize:13,minWidth:90}}
                              disabled={gs?.running || (!hasClaude && !hasSegs)}
                              onClick={() => gs?.running ? null : runEpInline(e)}
                              title={hasSegs ? "Regenerate segment prompts with AI" : "AI writes segment prompts"}
                            >
                              {gs?.running
                                ? <><span className="spin-sm" style={{borderTopColor:"var(--bg)"}}/> {gs.pct}%</>
                                : gs?.done
                                  ? "✓ Written"
                                  : hasSegs ? "✦ Rewrite" : "✦ Write Prompts"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {showAddEp && <AddEpisodeModal projectEps={eps} onAdd={ep => dispatch({type:"ADD_EPISODE",episode:ep})} onClose={() => setShowAddEp(false)}/>}
      </div>
    );
  }

  // ── EPISODE DETAIL VIEW ──
  const seg = editingSeg ? ep.segments.find(s => s.id === editingSeg) : null;
  const totalDur  = ep.segments.reduce((a,s) => a+s.dur, 0);
  const segsDone  = ep.segments.filter(s => s.status === "done").length;
  const hasVideo  = ep.segments.some(s => s.videoUrl);
  const hasSegs   = ep.segments.length > 0;
  const hasClaude = !!state.apiKey;
  const hasJimeng = !!state.jimengKey;

  const runAllPending = () => {
    if (!ep) return;
    const pending = ep.segments.filter(s => s.status === "pending" || s.status === "failed");
    if (state.jimengKey) {
      generateEpisodeVideos({ state, dispatch, epId:ep.id, maxConcurrent:3 });
    } else {
      pending.forEach((s,i) => setTimeout(() => runSegVideo(s.id), i * 600));
    }
  };

  return (
    <div>
      <div className="ph">
        <div>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3}}>
            <span className="mono" style={{fontSize:14,color:"var(--t3)"}}>EP{String(ep.num).padStart(3,"0")}</span>
            {editingEpTitle ? (
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input className="fi" value={epTitleVal} onChange={e=>setEpTitleVal(e.target.value)} style={{width:280,fontSize:18,fontFamily:"Cormorant Garamond,serif"}} autoFocus
                  onKeyDown={e=>{
                    if(e.key==="Enter"){dispatch({type:"UPDATE_EPISODE",id:ep.id,patch:{title:epTitleVal}});setEditingEpTitle(false);}
                    if(e.key==="Escape")setEditingEpTitle(false);
                  }}/>
                <button className="btn btn-gold btn-sm" onClick={()=>{dispatch({type:"UPDATE_EPISODE",id:ep.id,patch:{title:epTitleVal}});setEditingEpTitle(false);}}>✓</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setEditingEpTitle(false)}>✕</button>
              </div>
            ) : (
              <div className="ph-t" style={{cursor:"text"}} onClick={()=>{setEpTitleVal(ep.title);setEditingEpTitle(true);}} title="Click to edit title">{ep.title}</div>
            )}
          </div>
          <div style={{display:"flex",gap:14,fontSize:14}}>
            <span style={{color:"var(--t3)"}}>Total: <span style={{color:"var(--t1)"}}>{totalDur}s</span></span>
            <span style={{color:"var(--green2)"}}>✓ {segsDone}/{ep.segments.length}</span>
            {hasVideo && <span style={{color:"var(--blue2)"}}>🎬 {ep.segments.filter(s=>s.videoUrl).length} videos</span>}
          </div>
        </div>
        <div className="ph-r">
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({type:"SET_EPISODE",id:null})}>← All</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddSeg(true)}>+ Segment</button>
          {hasSegs && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPromptSheet(true)} title="Micro Drama — copy segment prompts for video generation">
              🎬 Micro Drama
            </button>
          )}
          {hasSegs && (() => {
            const vnImgCount = Object.keys(ep.vnImages||{}).length;
            const vnPanelCount = ep.vnPanels?.length || 0;
            return (
              <button className="btn btn-ghost btn-sm"
                style={{background:"rgba(148,100,200,.12)",color:"#c49eff",border:"1px solid rgba(148,100,200,.3)"}}
                onClick={() => setShowVN(true)} title="Visual Novel — ACGN anime style panels">
                🎌 Visual Novel{vnPanelCount > 0 ? ` · ${vnImgCount}/${vnPanelCount} 🍌` : ""}
              </button>
            );
          })()}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteEp(true)}>🗑</button>
          <button className="btn btn-gold btn-sm" onClick={() => setShowAutoGen(ep)}>
            {!hasSegs
              ? (hasClaude ? "✦ Write & Generate" : "✦ Write Episode")
              : hasJimeng
                ? "▶ Generate Videos"
                : "📋 Generate Prompts"}
          </button>
        </div>
      </div>

      {/* Video generation queue */}
      <VideoQueuePanel state={state} dispatch={dispatch} epId={ep.id}/>

      {/* Episode notes */}
      {ep.notes && (
        <div className="callout co-blue" style={{fontSize:14,marginBottom:12,lineHeight:1.65}}>{ep.notes}</div>
      )}

      {/* Empty state with clear CTA */}
      {!hasSegs && (
        <div className="empty" style={{paddingTop:50}}>
          <div className="ei">🎬</div>
          <div className="et">No segments yet</div>
          <div className="es">
            {hasClaude
              ? hasJimeng
                ? "Click Write & Generate — AI writes all segment prompts then immediately submits to Seedance 2.0 for video generation. Videos load automatically."
                : "Click Write Episode — AI generates all segment prompts. Then use Prompt Sheet to copy-paste to Jimeng manually."
              : "Add your Claude API key in Settings → API Keys to auto-generate this episode."}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:16}}>
            {hasClaude ? (
              <button className="btn btn-gold" onClick={() => setShowAutoGen(ep)}>
                {hasJimeng ? "✦ Write & Generate Videos" : "✦ Write Episode Prompts"}
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" style={{fontSize:14,color:"var(--t3)"}}>Set Claude API Key in Settings</button>
            )}
          </div>
        </div>
      )}

      {/* Segment timeline */}
      {hasSegs && (
        <div style={{height:22,display:"flex",borderRadius:5,overflow:"hidden",border:"1px solid var(--ln2)",marginBottom:14}}>
          {ep.segments.map(s => (
            <div key={s.id}
              style={{flex:s.dur,background:STATUS_C[s.status]+(editingSeg===s.id?"55":"22"),borderRight:"1px solid rgba(0,0,0,.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"background .1s",position:"relative"}}
              onClick={() => setEditingSeg(editingSeg===s.id ? null : s.id)}>
              <span style={{color:STATUS_C[s.status],fontSize:12,fontWeight:700}}>{s.type}</span>
              {s.videoUrl && <div style={{position:"absolute",top:1,right:1,width:4,height:4,borderRadius:"50%",background:"var(--green)"}}/>}
            </div>
          ))}
        </div>
      )}

      {/* Segment list + editor */}
      {hasSegs && (
        <div style={{display:"grid",gridTemplateColumns:editingSeg?"260px 1fr":"1fr",gap:12,alignItems:"start"}}>
          <div>
            {ep.segments.map((s,i) => (
              <div key={s.id}
                className={editingSeg===s.id?"seg-row on":"seg-row"}
                onClick={() => setEditingSeg(editingSeg===s.id ? null : s.id)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:7,border:`1px solid ${editingSeg===s.id?"rgba(201,168,76,.3)":"transparent"}`,marginBottom:3,cursor:"pointer",background:editingSeg===s.id?"var(--gG)":"transparent"}}>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,color:"var(--t4)",width:20}}>{String(i+1).padStart(2,"0")}</span>
                <SC.SegType t={s.type}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,color:"var(--t1)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.notes||s.prompt.split("\n")[0].substring(0,55)||`${s.type}·${s.dur}s`}</div>
                  <div style={{fontSize:13,color:"var(--t3)",marginTop:1}}>{s.scene?.replace(/_/g," ")||"—"}·{s.dur}s{s.clue&&<span style={{marginLeft:5,color:"var(--amber2)"}}>⚑{s.clue}</span>}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  {s.videoUrl && <span style={{fontSize:13,color:"var(--green2)"}} title="Video ready">🎬</span>}
                  <div style={{width:6,height:6,borderRadius:"50%",background:STATUS_C[s.status],flexShrink:0}}/>
                  {(s.status==="pending"||s.status==="failed") && (
                    <button className="btn btn-ghost btn-sm" style={{padding:"2px 5px",fontSize:12}} onClick={e=>{e.stopPropagation();runSegVideo(s.id);}}>▶</button>
                  )}
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={() => setShowAddSeg(true)}>+ Add Segment</button>
              <button className="btn btn-gold btn-sm" style={{flex:1}} onClick={runAllPending}>▶ Run All Pending</button>
            </div>
          </div>

          {seg && (
            <SegmentEditor key={seg.id} seg={seg} ep={ep} state={state} dispatch={dispatch} onRun={() => runSegVideo(seg.id)} onClose={() => setEditingSeg(null)}/>
          )}
          {!seg && !editingSeg && (
            <div className="empty">
              <div className="ei">👈</div>
              <div className="et">Select a segment</div>
              <div className="es">Click any segment row or timeline bar to edit its prompt and settings.</div>
            </div>
          )}
        </div>
      )}

      {showAddSeg && <AddSegmentModal ep={ep} onAdd={seg=>dispatch({type:"ADD_SEGMENT",episodeId:ep.id,segment:seg})} onClose={()=>setShowAddSeg(false)}/>}
      {showAutoGen && <AutoGenerateModal state={state} dispatch={dispatch} ep={showAutoGen} onClose={()=>setShowAutoGen(null)}/>}
      {showPromptSheet && <SegmentPromptSheetModal ep={ep} proj={proj} allChars={state.bible.characters} dispatch={dispatch} onClose={()=>setShowPromptSheet(false)}/>}
      {showVN && <VisualNovelSheetModal epId={ep.id} state={state} proj={proj} bible={state.bible} apiKey={state.apiKey} geminiKey={state.geminiKey} openaiKey={state.openaiKey} imageEngine={state.imageEngine||"nanoBanana2"} dispatch={dispatch} saveImageToServer={saveImageToServer} onClose={()=>setShowVN(false)}/>}
      {showDeleteEp && (
        <div className="overlay">
          <div style={{background:"var(--bg2)",border:"1px solid var(--bR)",borderRadius:12,padding:22,maxWidth:360,width:"92%"}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:"var(--red2)",marginBottom:8}}>Delete Episode?</div>
            <div style={{fontSize:15,color:"var(--t2)",marginBottom:16}}>Delete <strong>EP{String(ep.num).padStart(3,"0")} — {ep.title}</strong> and all {ep.segments.length} segments? Use undo to recover.</div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowDeleteEp(false)}>Cancel</button>
              <button className="btn btn-red" onClick={()=>{dispatch({type:"DELETE_EPISODE",id:ep.id});setShowDeleteEp(false);}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RIPPLE MODULE
function PageRipple({ state, dispatch }) {
  const apiKey = state.apiKey;
  const [mode, setMode] = useState("director");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [loadStep, setLoadStep] = useState("");
  const [selEp, setSelEp] = useState(null);
  const [checked, setChecked] = useState({});

  const analysis = state.ripple;
  const epImpacts = analysis?.episodeImpacts || {};

  const getImpact = (n) => {
    if (analysis?.originEpisode === n) return "origin";
    return epImpacts[String(n)]?.severity || "none";
  };

  const analyze = async () => {
    setLoading(true); dispatch({type:"SET_RIPPLE",data:null});
    const steps = [[15,"Reading story bible…"],[35,"Mapping character states…"],[55,"Tracing ripple chain…"],[75,"Calculating ending shifts…"],[90,"Building change manifests…"]];
    let si=0;
    const t = setInterval(()=>{ if(si<steps.length){setLoadPct(steps[si][0]);setLoadStep(steps[si][1]);si++;}},600);
    try {
      const proj = state.projects.find(p=>p.id===state.activeProject);
      const chars = state.bible.characters.map(c=>`${c.name}[${c.id}]: ${c.role}. Secret:${(c.secret||"").substring(0,60)}`).join('\n');
      const rels  = state.bible.relationships.map(r=>`${r.from}→${r.to}:${r.label}(${r.tension})`).join(', ');
      const dps   = state.bible.decisionPoints.map(dp=>`Ep${dp.ep}(${dp.label})`).join(', ');
      const ends  = state.bible.endings.map(e=>`${e.label}(${e.prob}%)`).join(', ');
      const endingIds = state.bible.endings.map(e=>e.id);
      const endingShiftsSchema = endingIds.length ? `{${endingIds.map(id=>`"${id}":N`).join(',')}}` : '{}';

      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({
        model:"claude-sonnet-4-6",max_tokens:4000,
        messages:[{role:"user",content:`You are the story continuity engine for "${proj?.name||'this series'}" (${proj?.genre||'drama'}, ${proj?.episodes||'?'} episodes).

CHARACTERS:
${chars||"No characters defined yet"}
RELATIONSHIPS: ${rels||"None"}
DECISION POINTS: ${dps||"None defined"}
CURRENT ENDINGS: ${ends||"None defined"}

ANALYZE THIS CHANGE:
${text}

Return JSON matching this structure exactly:
{"summary":"...","originEpisode":N,"rippleChain":[{"level":0,"episode":N,"cause":"...","effect":"..."}],"episodeImpacts":{"N":{"severity":"critical|major|moderate|minor","reason":"...","changes":[{"segmentHint":"...","changeType":"rewrite|add|remove|shift|tone","before":"...","after":"...","reason":"..."}]}},"endingShifts":${endingShiftsSchema},"characterKnowledgeShifts":[{"character":"...","knowsBy":N,"whatTheyLearn":"..."}],"directorsNote":"..."}

All endingShifts probabilities must sum to 100. Identify 5-15 impacted episodes. Be specific to the actual characters and world of this series.`}]
      })});
      const d = await res.json();
      const raw = d.content?.[0]?.text||"";
      const m = raw.match(/\{[\s\S]*\}/);
      clearInterval(t); setLoadPct(100); setLoadStep("Complete");
      setTimeout(()=>{ setLoading(false); if(m){try{const parsed=JSON.parse(m[0]); dispatch({type:"SET_RIPPLE",data:parsed}); setSelEp(parsed.originEpisode);}catch(e){dispatch({type:"SET_RIPPLE",data:{summary:"Parse error — check API response",originEpisode:1,rippleChain:[],episodeImpacts:{},endingShifts:{},characterKnowledgeShifts:[],directorsNote:raw.substring(0,300)}});setSelEp(1);}}else{dispatch({type:"SET_RIPPLE",data:{summary:"No JSON returned from API.",originEpisode:1,rippleChain:[],episodeImpacts:{},endingShifts:{},characterKnowledgeShifts:[],directorsNote:"Try again with more specific change description."}});setSelEp(1);}},400);
    } catch(err) {
      clearInterval(t); setLoading(false);
      dispatch({type:"SET_RIPPLE",data:{summary:`API Error: ${err.message}`,originEpisode:1,rippleChain:[],episodeImpacts:{},endingShifts:{},characterKnowledgeShifts:[],directorsNote:"Check your API key in Settings."}});
    }
  };

  const selEpData = analysis && selEp ? {num:selEp,...(epImpacts[String(selEp)]||{})} : null;
  const epChecked = selEpData?.changes?.filter((_,i)=>checked[`${selEp}_${i}`]).length||0;

  return (
    <div style={{display:"grid",gridTemplateColumns:"260px 1fr 300px",gap:14,height:"calc(100vh - 110px)"}}>
      {/* Left */}
      <div style={{display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
        <div className="card">
          <div style={{display:"flex",gap:3,marginBottom:12}}>
            {["director","player"].map(m=><button key={m} className={`btn btn-sm ${mode===m?"btn-gold":"btn-ghost"}`} onClick={()=>setMode(m)} style={{flex:1}}>{m==="director"?"🎬 Director":"🎮 Player"}</button>)}
          </div>
          {mode==="director" ? (
            <>
              <label className="fl">Describe the change</label>
              <textarea className="ft" value={text} onChange={e=>setText(e.target.value)} placeholder={"e.g. Character X has been secretly working for the antagonist all along…\n\nDescribe any character revelation, plot twist, or narrative change to analyze its impact."} style={{minHeight:110,marginBottom:10}}/>
              {state.bible.characters.length>0&&(
                <>
                  <div style={{fontSize:13,color:"var(--t3)",marginBottom:7,letterSpacing:"1px",textTransform:"uppercase"}}>Quick changes:</div>
                  {state.bible.characters.slice(0,4).map(c=>(
                    <button key={c.id} className="btn btn-ghost btn-sm" style={{width:"100%",textAlign:"left",marginBottom:4,justifyContent:"flex-start",fontSize:14}} onClick={()=>setText(`${c.name} has a secret we don't yet know about that recontextualizes everything that came before.`)}>{c.name} has a hidden agenda</button>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <div className="callout co-gold" style={{marginBottom:10}}>Select a player decision and its outcome to trace consequences.</div>
              {state.bible.decisionPoints.map(dp=>(
                <div key={dp.id} className="card" style={{marginBottom:8,cursor:"pointer",padding:10}} onClick={()=>setText(`PLAYER CHOICE at "${dp.label}" (Ep${dp.ep}): Player chose option 1: ${dp.options[0]}`)}>
                  <div style={{fontSize:13,color:"var(--gold)",fontFamily:"JetBrains Mono,monospace",marginBottom:3}}>EP{String(dp.ep).padStart(2,"0")} · {dp.label}</div>
                  <div style={{fontSize:14,color:"var(--t2)"}}>{dp.desc}</div>
                </div>
              ))}
            </>
          )}
          <button className="btn btn-gold btn-sm" style={{width:"100%",marginTop:10}} disabled={!text.trim()||loading} onClick={analyze}>
            {loading?<><span className="spin-sm" style={{borderTopColor:"var(--bg)"}}/> {loadStep}</>:"✦ Analyze Impact"}
          </button>
          {loading&&<div className="prog-track" style={{marginTop:7}}><div className="prog-fill" style={{width:`${loadPct}%`,background:"var(--gold)"}}/></div>}
        </div>

        {analysis && (
          <div className="card">
            <div style={{marginBottom:10,fontFamily:"Cormorant Garamond,serif",fontSize:17,color:"var(--gold2)"}}>Character Knowledge</div>
            {analysis.characterKnowledgeShifts?.map((k,i)=>(
              <div key={i} style={{padding:"6px 0",borderBottom:"1px solid var(--ln2)",fontSize:14}}>
                <span style={{fontFamily:"Cormorant Garamond,serif",color:"var(--t1)",display:"block"}}>{k.character}</span>
                <span style={{color:"var(--t3)"}}>Knows by </span><span style={{color:"var(--amber2)",fontFamily:"JetBrains Mono,monospace"}}>EP{String(k.knowsBy).padStart(2,"0")}</span>
                <span style={{color:"var(--t3)"}}> — {k.whatTheyLearn?.substring(0,60)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Center */}
      <div style={{overflowY:"auto"}}>
        {!analysis&&!loading ? (
          <div className="empty"><div className="ei">🌊</div><div className="et">Ripple Analysis</div><div className="es">Describe a director change or player choice to see how it cascades across all 100 episodes.</div></div>
        ) : (
          <>
            {analysis&&<div className="callout co-gold" style={{marginBottom:14}}>{analysis.summary}</div>}
            <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
              {[{l:"Origin",c:"var(--gold)"},{l:"Critical",c:"var(--red2)"},{l:"Major",c:"var(--amber2)"},{l:"Moderate",c:"var(--gold)"},{l:"Minor",c:"var(--blue2)"},{l:"None",c:"var(--bg5)"}].map(({l,c})=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:"var(--t3)"}}>
                  <div style={{width:10,height:10,borderRadius:3,background:c}}/>  {l}
                </div>
              ))}
            </div>
            <div className="ep-grid" style={{marginBottom:16}}>
              {Array.from({length:100},(_,i)=>i+1).map(n=>{
                const imp = getImpact(n);
                return <div key={n} className={`ep-cell ${imp} ${selEp===n?"sel":""}`} onClick={()=>setSelEp(n)}>
                  {n}{imp==="origin"&&<div className="ep-glow" style={{background:"rgba(201,168,76,.4)"}}/>}{imp==="crit"&&<div className="ep-glow" style={{background:"rgba(208,80,80,.4)"}}/>}
                </div>;
              })}
            </div>

            {analysis?.rippleChain&&(
              <div>
                <div style={{fontSize:13,color:"var(--t3)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10}}>Cause → Effect Chain</div>
                <div className="rc">
                  {analysis.rippleChain.map((n,i)=>(
                    <div key={i} className={`rc-node rc-l${Math.min(n.level,3)}`}>
                      <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--gold)",marginBottom:2}}>EP{String(n.episode).padStart(2,"0")} · Level {n.level}</div>
                      <div style={{fontSize:15,color:"var(--t1)"}}>{n.cause}</div>
                      {n.effect&&<div style={{fontSize:14,color:"var(--t3)",marginTop:3,fontStyle:"italic"}}>→ {n.effect}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis?.directorsNote&&(
              <div className="callout co-gold" style={{marginTop:14}}>
                <div style={{fontSize:13,color:"var(--gold)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:5}}>Director's Note</div>
                {analysis.directorsNote}
              </div>
            )}
          </>
        )}
      </div>

      {/* Right */}
      <div style={{overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
        {/* Ending shifts */}
        {analysis?.endingShifts&&(
          <div className="card">
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:17,color:"var(--gold2)",marginBottom:12}}>Ending Probability Shifts</div>
            {state.bible.endings.map(end=>{
              const newP = analysis.endingShifts?.[end.id]||analysis.endingShifts?.celeste_takes||end.prob;
              const diff = newP - end.prob;
              return (
                <div key={end.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:3}}>
                    <span style={{color:"var(--t2)"}}>{end.label}</span>
                    <span style={{color:diff>0?"var(--green2)":diff<0?"var(--red2)":"var(--t3)",fontFamily:"JetBrains Mono,monospace",fontSize:13}}>{diff>0?"+":""}{diff}%</span>
                  </div>
                  <div className="prog-track" style={{height:4,borderRadius:2}}><div className="prog-fill" style={{width:`${newP}%`,background:end.color,height:"100%",borderRadius:2}}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--t3)",marginTop:2,fontFamily:"JetBrains Mono,monospace"}}><span>{end.prob}%</span><span style={{color:end.color}}>{newP}%</span></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Episode changes */}
        {selEpData&&(
          <div className="card" style={{flex:1}}>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:18,color:"var(--gold2)",marginBottom:4}}>EP{String(selEp).padStart(2,"0")}</div>
            <div style={{fontSize:14,color:"var(--t2)",marginBottom:10,lineHeight:1.5}}>{selEpData.reason}</div>
            {selEpData.changes?.map((c,i)=>(
              <div key={i} className="chcard">
                <div className="chcard-h">
                  <input type="checkbox" checked={!!checked[`${selEp}_${i}`]} onChange={()=>setChecked(p=>({...p,[`${selEp}_${i}`]:!p[`${selEp}_${i}`]}))}/>
                  <span className={`chtag ct-${c.changeType?.substring(0,2)||"sh"}`}>{c.changeType}</span>
                  <span style={{fontSize:13,color:"var(--t3)",fontFamily:"JetBrains Mono,monospace"}}>{c.segmentHint?.substring(0,30)}</span>
                </div>
                <div className="chcard-b">
                  <div style={{fontSize:14,color:"var(--t3)",marginBottom:5,fontStyle:"italic"}}>{c.reason}</div>
                  <div className="diff">{c.before&&<div className="dl dl-r">{c.before?.substring(0,80)}</div>}{c.after&&<div className="dl dl-a">{c.after?.substring(0,80)}</div>}</div>
                </div>
              </div>
            ))}
            {selEpData.changes?.length>0&&(
              <button className="btn btn-gold btn-sm" style={{width:"100%",marginTop:8}} disabled={epChecked===0} onClick={()=>{}}>
                ✓ Apply {epChecked} Change{epChecked!==1?"s":""}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PUBLISHER PAGE
// ═══════════════════════════════════════════════════════════════════

const PLATFORM_META = {
  youtube:  { icon:"▶",  label:"YouTube",      color:"#FF0000", bg:"rgba(255,0,0,.10)",  accentBg:"#FF0000" },
  tiktok:   { icon:"♪",  label:"TikTok",        color:"#69C9D0", bg:"rgba(105,201,208,.10)", accentBg:"#010101" },
  website:  { icon:"🌐", label:"Website",       color:"#c9a84c", bg:"rgba(201,168,76,.10)" },
  announce: { icon:"📣", label:"Announcement",  color:"#8b78f0", bg:"rgba(139,120,240,.10)" },
};

const JOB_STATUS = {
  draft:       { color:"var(--t4)",     label:"Draft"      },
  scheduled:   { color:"#8b78f0",      label:"Scheduled"  },
  publishing:  { color:"var(--amber)",  label:"Publishing" },
  published:   { color:"var(--green)",  label:"Published"  },
  failed:      { color:"var(--red)",    label:"Failed"     },
};

// ── YOUTUBE API HELPERS ─────────────────────────────────────────────
// In production these calls go through a Supabase Edge Function to
// protect credentials. Here we show the full flow so devs know exactly
// what to implement server-side.
async function youtubeUploadVideo({ accessToken, videoFile, title, description, privacyStatus, playlistId }) {
  // Step 1: initiate resumable upload
  const meta = { snippet: { title, description, categoryId:"22" }, status: { privacyStatus } };
  const initRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${accessToken}`, "Content-Type":"application/json", "X-Upload-Content-Type":"video/*" },
    body: JSON.stringify(meta),
  });
  if (!initRes.ok) throw new Error(`YouTube init failed: ${initRes.status}`);
  const uploadUrl = initRes.headers.get("location");

  // Step 2: upload video bytes (videoFile = Blob or File)
  const uploadRes = await fetch(uploadUrl, {
    method:"PUT",
    headers:{ "Content-Type":"video/*" },
    body: videoFile,
  });
  if (!uploadRes.ok) throw new Error(`YouTube upload failed: ${uploadRes.status}`);
  const data = await uploadRes.json();

  // Step 3: add to playlist
  if (playlistId && data.id) {
    await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
      method:"POST",
      headers:{ "Authorization":`Bearer ${accessToken}`, "Content-Type":"application/json" },
      body: JSON.stringify({ snippet:{ playlistId, resourceId:{ kind:"youtube#video", videoId:data.id } } }),
    });
  }
  return { videoId: data.id, url:`https://youtu.be/${data.id}` };
}

// Refresh YouTube OAuth token via Supabase Edge Function (server-side only)
async function refreshYouTubeToken({ refreshToken, clientId, clientSecret }) {
  // This MUST run server-side (Supabase Edge Function) — never expose client_secret in browser
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST",
    headers:{ "Content-Type":"application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type:"refresh_token", refresh_token:refreshToken, client_id:clientId, client_secret:clientSecret }),
  });
  return res.json();
}

// ── TIKTOK API HELPERS ─────────────────────────────────────────────
async function tiktokPublishVideo({ accessToken, videoUrl, title, privacyLevel="PUBLIC_TO_EVERYONE" }) {
  // TikTok Content Posting API v2 (pull upload — give TikTok a public URL)
  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${accessToken}`, "Content-Type":"application/json; charset=UTF-8" },
    body: JSON.stringify({
      post_info: { title, privacy_level: privacyLevel, disable_duet: false, disable_comment: false, disable_stitch: false, video_cover_timestamp_ms: 1000 },
      source_info: { source:"PULL_FROM_URL", video_url: videoUrl },
    }),
  });
  if (!res.ok) throw new Error(`TikTok publish failed: ${res.status}`);
  const data = await res.json();
  return { publishId: data.data?.publish_id };
}

async function tiktokCheckStatus({ accessToken, publishId }) {
  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${accessToken}`, "Content-Type":"application/json" },
    body: JSON.stringify({ publish_id: publishId }),
  });
  return res.json();
}

// ── PUBLISH JOB ROW ─────────────────────────────────────────────────
function PublishJobRow({ job, onRetry, onViewResult }) {
  const pm = PLATFORM_META[job.platform || job.type] || PLATFORM_META.website;
  const st = JOB_STATUS[job.status] || JOB_STATUS.draft;
  const isScheduled = job.status === "scheduled" && job.scheduled_at && new Date(job.scheduled_at) > new Date();
  const scheduledFmt = job.scheduled_at ? new Date(job.scheduled_at).toLocaleString([], {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : null;

  return (
    <div className="pub-job">
      <div style={{width:30,height:30,borderRadius:7,background:pm.bg,border:`1px solid ${pm.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{pm.icon}</div>
      <div style={{minWidth:0}}>
        <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:2}}>
          <span style={{color:"var(--t1)",fontFamily:"Cormorant Garamond,serif",fontSize:16,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.title||job.episodeTitle||"—"}</span>
          {(job.episodeNum||job.episode_num) && <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,color:"var(--t3)",flexShrink:0}}>EP{String(job.episodeNum||job.episode_num||0).padStart(2,"0")}</span>}
        </div>
        <div style={{fontSize:13,color:"var(--t4)"}}>{pm.label}{scheduledFmt?` · ${scheduledFmt}`:" · Immediate"}</div>
      </div>
      <div>
        <span className={`pub-status pub-${job.status||"draft"}`}>
          <span style={{width:5,height:5,borderRadius:"50%",background:st.color,display:"inline-block"}}/> {st.label}
        </span>
      </div>
      <div style={{display:"flex",gap:5}}>
        {job.status==="failed"&&<button className="btn btn-ghost btn-sm" style={{fontSize:13,padding:"2px 8px"}} onClick={()=>onRetry(job.id)}>Retry</button>}
        {job.platform_url&&<a href={job.platform_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{fontSize:13,padding:"2px 8px"}}>View ↗</a>}
      </div>
    </div>
  );
}

// ── CONNECT PLATFORM MODAL ───────────────────────────────────────────
function ConnectPlatformModal({ platform, projectId, onSave, onClose }) {
  const pm = PLATFORM_META[platform] || {};
  const [fields, setFields] = useState({ access_token:"", refresh_token:"", channel_id:"", playlist_id:"", client_id:"", client_secret:"" });
  const [step, setStep] = useState("form"); // "form" | "oauth" | "done"
  const set = (k,v) => setFields(f=>({...f,[k]:v}));

  const OAUTH_STEPS = {
    youtube: [
      "Go to console.cloud.google.com → Create/select project",
      "Enable YouTube Data API v3 under APIs & Services",
      "Create OAuth 2.0 credentials (Desktop or Web App)",
      "Use the OAuth Playground (oauth.com/playground) to get tokens, or implement the OAuth flow in your backend",
      "Paste the access token and refresh token below",
    ],
    tiktok: [
      "Apply for TikTok Developer access at developers.tiktok.com",
      "Create a new app and request Content Posting API scope",
      "Add your redirect URI in the app settings",
      "Complete the OAuth 2.0 flow — TikTok will issue an access token",
      "Paste access token and your TikTok Open ID below",
    ],
  };

  const steps = OAUTH_STEPS[platform] || [];

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:`1px solid ${pm.color||"var(--ln)"}44`,borderRadius:14,padding:24,maxWidth:480,width:"95%",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:36,height:36,borderRadius:8,background:pm.bg,border:`1px solid ${pm.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21}}>{pm.icon}</div>
          <div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:21,color:pm.color||"var(--gold2)"}}>{pm.label} Integration</div>
            <div style={{fontSize:14,color:"var(--t4)"}}>OAuth credentials are stored in Supabase, encrypted at rest</div>
          </div>
        </div>

        {/* Setup guide */}
        {steps.length>0 && (
          <div style={{background:"var(--bg3)",borderRadius:8,padding:12,marginBottom:16,border:"1px solid var(--ln2)"}}>
            <div style={{fontSize:13,color:"var(--t3)",fontFamily:"JetBrains Mono,monospace",letterSpacing:1,marginBottom:8}}>SETUP GUIDE</div>
            {steps.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:5,fontSize:14,color:"var(--t2)"}}>
                <span style={{width:16,height:16,borderRadius:"50%",background:"var(--bg4)",color:"var(--gold)",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"JetBrains Mono,monospace"}}>{i+1}</span>
                {s}
              </div>
            ))}
          </div>
        )}

        {platform==="youtube" && <>
          <div className="fr2">
            <div className="fg"><label className="fl">Client ID</label><input className="fi" value={fields.client_id} onChange={e=>set("client_id",e.target.value)} placeholder="xxxxx.apps.googleusercontent.com"/></div>
            <div className="fg"><label className="fl">Client Secret</label><input className="fi" type="password" value={fields.client_secret} onChange={e=>set("client_secret",e.target.value)} placeholder="GOCSPX-xxxxx"/></div>
          </div>
          <div className="fg"><label className="fl">Access Token</label><input className="fi" type="password" value={fields.access_token} onChange={e=>set("access_token",e.target.value)} placeholder="ya29.xxxxx"/></div>
          <div className="fg"><label className="fl">Refresh Token</label><input className="fi" type="password" value={fields.refresh_token} onChange={e=>set("refresh_token",e.target.value)} placeholder="1//xxxxx"/></div>
          <div className="fr2">
            <div className="fg"><label className="fl">Channel ID</label><input className="fi" value={fields.channel_id} onChange={e=>set("channel_id",e.target.value)} placeholder="UCxxxxx"/></div>
            <div className="fg"><label className="fl">Playlist ID (opt.)</label><input className="fi" value={fields.playlist_id} onChange={e=>set("playlist_id",e.target.value)} placeholder="PLxxxxx"/></div>
          </div>
          <div className="callout co-blue" style={{fontSize:13,marginBottom:10}}>
            <strong>Token refresh:</strong> Deploy the Supabase Edge Function <code>refresh-youtube-token</code> to auto-refresh before each upload. The refresh token never expires unless revoked.
          </div>
        </>}

        {platform==="tiktok" && <>
          <div className="fg"><label className="fl">Access Token</label><input className="fi" type="password" value={fields.access_token} onChange={e=>set("access_token",e.target.value)} placeholder="akt.xxxxx"/></div>
          <div className="fg"><label className="fl">Refresh Token</label><input className="fi" type="password" value={fields.refresh_token} onChange={e=>set("refresh_token",e.target.value)} placeholder="rft.xxxxx"/></div>
          <div className="fg"><label className="fl">Open ID</label><input className="fi" value={fields.channel_id} onChange={e=>set("channel_id",e.target.value)} placeholder="Your TikTok Open ID"/></div>
          <div className="callout co-blue" style={{fontSize:13,marginBottom:10}}>
            <strong>Note:</strong> TikTok access tokens expire in 24h. Deploy the <code>refresh-tiktok-token</code> Edge Function and set up a cron to refresh daily.
          </div>
        </>}

        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!fields.access_token} onClick={()=>{onSave(platform,fields);onClose();}}>Save & Connect</button>
        </div>
      </div>
    </div>
  );
}

// ── SCHEDULE PUBLISH MODAL ───────────────────────────────────────────
function SchedulePublishModal({ state, onSchedule, onClose }) {
  const proj = state.projects.find(p=>p.id===state.activeProject);
  const eps  = state.episodes.filter(e=>e.project===state.activeProject).sort((a,b)=>a.num-b.num);
  const creds = state.platformCreds || {};

  const [epId,        setEpId]        = useState(eps[0]?.id||"");
  const [platforms,   setPlatforms]   = useState({ youtube:false, tiktok:false, website:true, announce:false });
  const [when,        setWhen]        = useState("now");
  const [schedDate,   setSchedDate]   = useState("");
  const [access,      setAccess]      = useState("free");
  const [ytTitle,     setYtTitle]     = useState("");
  const [ytDesc,      setYtDesc]      = useState("");
  const [ytPrivacy,   setYtPrivacy]   = useState("public");
  const [ttCaption,   setTtCaption]   = useState("");
  const [ttPrivacy,   setTtPrivacy]   = useState("PUBLIC_TO_EVERYONE");
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceBody,  setAnnounceBody]  = useState("");
  const [tab,         setTab]         = useState("platforms"); // platforms | content | timing

  const ep = eps.find(e=>e.id===epId);
  const toggleP = k => setPlatforms(p=>({...p,[k]:!p[k]}));
  const anySelected = Object.values(platforms).some(Boolean);

  // Auto-fill titles from episode
  useEffect(()=>{
    if (ep && !ytTitle) setYtTitle(`EP${String(ep.num).padStart(2,"0")} — ${ep.title}`);
    if (ep && !ttCaption) setTtCaption(`#drama #episode${ep.num} ${ep.title}`);
    if (ep && !announceTitle) setAnnounceTitle(`New Episode: ${ep.title}`);
  }, [ep?.id]);

  const submit = () => {
    const scheduledAt = when==="now" ? null : schedDate || null;
    const jobs = [];
    if (platforms.youtube)  jobs.push({ platform:"youtube",  title:ytTitle, description:ytDesc, metadata:{ privacy:ytPrivacy } });
    if (platforms.tiktok)   jobs.push({ platform:"tiktok",   title:ttCaption, metadata:{ privacy:ttPrivacy } });
    if (platforms.website)  jobs.push({ platform:"website",  access });
    if (platforms.announce) jobs.push({ platform:"announce", title:announceTitle, description:announceBody });
    onSchedule(epId, jobs, scheduledAt);
    onClose();
  };

  const ytConnected  = !!(creds.youtube?.access_token);
  const ttConnected  = !!(creds.tiktok?.access_token);

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--bg2)",border:"1px solid rgba(201,168,76,.3)",borderRadius:14,padding:0,maxWidth:600,width:"95%",maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{padding:"18px 22px 0",borderBottom:"1px solid var(--ln2)"}}>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:23,color:"var(--gold2)",marginBottom:12}}>Publish Episode</div>
          <div className="fg" style={{marginBottom:12}}>
            <label className="fl">Episode</label>
            <select className="fs" value={epId} onChange={e=>setEpId(e.target.value)}>
              {eps.map(e=><option key={e.id} value={e.id}>EP{String(e.num).padStart(2,"0")} — {e.title}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--ln2)",marginBottom:-1}}>
            {[["platforms","Platforms"],["content","Content"],["timing","Timing"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{padding:"7px 16px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===t?"var(--gold)":"transparent"}`,color:tab===t?"var(--gold)":"var(--t3)",fontSize:15,cursor:"pointer",marginBottom:-1}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{padding:"18px 22px",overflowY:"auto",flex:1}}>
          {tab==="platforms" && (
            <>
              <div style={{marginBottom:14}}>
                <div className="fl" style={{marginBottom:10}}>Select where to publish</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {Object.entries(PLATFORM_META).map(([k,pm])=>{
                    const connected = k==="youtube"?ytConnected:k==="tiktok"?ttConnected:true;
                    return (
                      <div key={k}
                        onClick={()=>connected&&toggleP(k)}
                        style={{padding:"12px 14px",borderRadius:8,border:`1px solid ${platforms[k]?pm.color:"var(--ln2)"}`,background:platforms[k]?pm.bg:"var(--bg3)",cursor:connected?"pointer":"not-allowed",opacity:connected?1:.5,transition:"all .15s",display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:32,height:32,borderRadius:7,background:pm.bg,border:`1px solid ${pm.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{pm.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,color:platforms[k]?pm.color:"var(--t1)",fontWeight:600}}>{pm.label}</div>
                          <div style={{fontSize:13,color:connected?"var(--green2)":"var(--t4)"}}>{k==="youtube"?(ytConnected?"Connected":"Not connected"):k==="tiktok"?(ttConnected?"Connected":"Not connected"):"Always available"}</div>
                        </div>
                        <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${platforms[k]?pm.color:"var(--ln2)"}`,background:platforms[k]?pm.color:"transparent",transition:"all .15s"}}/>
                      </div>
                    );
                  })}
                </div>
              </div>
              {platforms.website && (
                <div style={{marginBottom:14}}>
                  <label className="fl" style={{marginBottom:8}}>Episode Access on Website</label>
                  <div style={{display:"flex",gap:8}}>
                    {[["free","🆓 Free"],["paid","💎 Premium"],["unlisted","🔒 Unlisted"]].map(([v,l])=>(
                      <button key={v} className={`btn btn-sm ${access===v?"btn-gold":"btn-ghost"}`} onClick={()=>setAccess(v)}>{l}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab==="content" && (
            <>
              {platforms.youtube && (
                <div className="card" style={{marginBottom:12,padding:14}}>
                  <div style={{fontSize:14,color:PLATFORM_META.youtube.color,fontWeight:700,marginBottom:10}}>▶ YouTube</div>
                  <div className="fg"><label className="fl">Video Title</label><input className="fi" value={ytTitle} onChange={e=>setYtTitle(e.target.value)}/></div>
                  <div className="fg"><label className="fl">Description</label><textarea className="ft" value={ytDesc} onChange={e=>setYtDesc(e.target.value)} placeholder="Episode synopsis, links, hashtags…" style={{minHeight:80,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
                  <div className="fg"><label className="fl">Privacy</label><select className="fs" value={ytPrivacy} onChange={e=>setYtPrivacy(e.target.value)}><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></div>
                </div>
              )}
              {platforms.tiktok && (
                <div className="card" style={{marginBottom:12,padding:14}}>
                  <div style={{fontSize:14,color:PLATFORM_META.tiktok.color,fontWeight:700,marginBottom:10}}>♪ TikTok</div>
                  <div className="fg"><label className="fl">Caption (150 chars max)</label><textarea className="ft" value={ttCaption} onChange={e=>setTtCaption(e.target.value.slice(0,150))} style={{minHeight:60,fontFamily:"DM Sans,sans-serif",fontSize:15}}/><div style={{fontSize:13,color:"var(--t4)",textAlign:"right"}}>{ttCaption.length}/150</div></div>
                  <div className="fg"><label className="fl">Privacy</label><select className="fs" value={ttPrivacy} onChange={e=>setTtPrivacy(e.target.value)}><option value="PUBLIC_TO_EVERYONE">Public</option><option value="MUTUAL_FOLLOW_FRIENDS">Mutual Follow</option><option value="SELF_ONLY">Private</option></select></div>
                </div>
              )}
              {platforms.announce && (
                <div className="card" style={{marginBottom:12,padding:14}}>
                  <div style={{fontSize:14,color:PLATFORM_META.announce.color,fontWeight:700,marginBottom:10}}>📣 Announcement</div>
                  <div className="fg"><label className="fl">Subject</label><input className="fi" value={announceTitle} onChange={e=>setAnnounceTitle(e.target.value)}/></div>
                  <div className="fg"><label className="fl">Body</label><textarea className="ft" value={announceBody} onChange={e=>setAnnounceBody(e.target.value)} style={{minHeight:80,fontFamily:"DM Sans,sans-serif",fontSize:15}} placeholder="Email body sent to all subscribers…"/></div>
                </div>
              )}
              {!platforms.youtube && !platforms.tiktok && !platforms.announce && (
                <div style={{textAlign:"center",padding:"30px 0",color:"var(--t4)",fontSize:15}}>Select platforms on the Platforms tab to configure content</div>
              )}
            </>
          )}

          {tab==="timing" && (
            <div>
              <div className="fl" style={{marginBottom:10}}>When to publish</div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[["now","▶ Publish Now"],["schedule","⏰ Schedule"]].map(([v,l])=>(
                  <button key={v} className={`btn btn-sm ${when===v?"btn-gold":"btn-ghost"}`} onClick={()=>setWhen(v)} style={{flex:1}}>{l}</button>
                ))}
              </div>
              {when==="schedule" && (
                <>
                  <div className="fg" style={{marginBottom:14}}>
                    <label className="fl">Publish Date & Time</label>
                    <input type="datetime-local" className="fi" value={schedDate} onChange={e=>setSchedDate(e.target.value)} min={new Date().toISOString().slice(0,16)}/>
                  </div>
                  <div className="callout co-blue" style={{fontSize:14}}>
                    Scheduled jobs are processed by a Supabase cron function (<code>pg_cron</code> extension). All platforms publish within 1 minute of the scheduled time.
                  </div>
                </>
              )}
              {when==="now" && (
                <div className="callout co-gold" style={{fontSize:14}}>
                  Publishing immediately will trigger all selected platforms within 30–60 seconds.
                  Make sure all video files are rendered (status: done) before publishing.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"12px 22px",borderTop:"1px solid var(--ln2)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,color:"var(--t4)"}}>
            {Object.entries(platforms).filter(([,v])=>v).map(([k])=>PLATFORM_META[k]?.label).join(" · ")||"No platforms selected"}
          </span>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-gold" disabled={!epId||!anySelected} onClick={submit}>
              {when==="now"?"Publish Now →":"Schedule →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SITE CONFIG PANEL ────────────────────────────────────────────────
function SiteConfigPanel({ proj, dispatch }) {
  const [form, setForm] = useState({
    site_subdomain:  proj?.slug || (proj?.name||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),
    site_domain:     proj?.site_domain||"",
    site_published:  proj?.site_published||false,
    free_episodes:   proj?.free_episodes||1,
    price_monthly:   proj?.price_monthly||9.99,
    price_annual:    proj?.price_annual||79.99,
    price_lifetime:  proj?.price_lifetime||199.00,
    global_pass:     proj?.global_pass !== false,
    per_project_pass: proj?.per_project_pass !== false,
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  if (!proj) return null;
  return (
    <div className="card" style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="card-t">🌐 Site Settings</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="btn btn-ghost btn-sm" style={{fontSize:13}} onClick={()=>set("site_published",!form.site_published)}>
            {form.site_published?"Take Offline":"Publish Site"}
          </button>
          <span style={{width:7,height:7,borderRadius:"50%",background:form.site_published?"var(--green)":"var(--t4)",display:"inline-block"}}/>
          <span style={{fontSize:14,color:form.site_published?"var(--green2)":"var(--t4)"}}>{form.site_published?"Live":"Offline"}</span>
        </div>
      </div>
      <div className="fr2" style={{marginBottom:10}}>
        <div className="fg">
          <label className="fl">Subdomain</label>
          <div style={{display:"flex",alignItems:"center"}}>
            <input className="fi" value={form.site_subdomain} onChange={e=>set("site_subdomain",e.target.value)} style={{borderRadius:"6px 0 0 6px",borderRight:"none"}}/>
            <span style={{padding:"0 8px",background:"var(--bg3)",border:"1px solid var(--ln2)",borderLeft:"none",borderRadius:"0 6px 6px 0",fontSize:13,color:"var(--t3)",height:36,display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>.dramastudio.app</span>
          </div>
        </div>
        <div className="fg"><label className="fl">Custom Domain (opt.)</label><input className="fi" value={form.site_domain} onChange={e=>set("site_domain",e.target.value)} placeholder="myshow.com"/></div>
      </div>
      <div className="fr3" style={{marginBottom:10}}>
        <div className="fg"><label className="fl">Free Episodes</label><input className="fi" type="number" min={0} value={form.free_episodes} onChange={e=>set("free_episodes",Number(e.target.value))}/></div>
        <div className="fg"><label className="fl">Monthly Price ($)</label><input className="fi" type="number" step="0.01" value={form.price_monthly} onChange={e=>set("price_monthly",Number(e.target.value))}/></div>
        <div className="fg"><label className="fl">Annual Price ($)</label><input className="fi" type="number" step="0.01" value={form.price_annual} onChange={e=>set("price_annual",Number(e.target.value))}/></div>
      </div>
      <div className="fr2" style={{marginBottom:12}}>
        <div className="fg"><label className="fl">Lifetime Price ($)</label><input className="fi" type="number" step="0.01" value={form.price_lifetime} onChange={e=>set("price_lifetime",Number(e.target.value))}/></div>
        <div className="fg"><label className="fl">Stripe Publishable Key</label><input className="fi" type="password" placeholder="pk_live_…"/></div>
      </div>
      <div style={{marginBottom:12}}>
        <label className="fl" style={{marginBottom:8}}>Subscription Options</label>
        <div style={{display:"flex",gap:8}}>
          <button className={`btn btn-sm ${form.global_pass?"btn-gold":"btn-ghost"}`} onClick={()=>set("global_pass",!form.global_pass)}>
            {form.global_pass?"✓":""} Global Pass (all series)
          </button>
          <button className={`btn btn-sm ${form.per_project_pass?"btn-gold":"btn-ghost"}`} onClick={()=>set("per_project_pass",!form.per_project_pass)}>
            {form.per_project_pass?"✓":""} Per-Series Pass
          </button>
        </div>
        <div style={{fontSize:13,color:"var(--t4)",marginTop:6}}>Both can be enabled — users choose at checkout. Single account across all series.</div>
      </div>
      <button className="btn btn-gold" onClick={()=>dispatch({type:"UPDATE_PROJECT",id:proj.id,patch:form})}>Save Site Config</button>
    </div>
  );
}


function PagePublish({ state, dispatch }) {
  const proj = state.projects.find(p=>p.id===state.activeProject);
  const eps  = state.episodes.filter(e=>e.project===state.activeProject).sort((a,b)=>a.num-b.num);
  const [jobs, setJobs]               = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState(null);
  const [credentials, setCredentials]  = useState({youtube:false,tiktok:false});
  const [tab, setTab]                  = useState("queue");

  // Simulate jobs from project episodes that have been published
  const publishedEps = eps.filter(e=>e.status==="published");
  const mockJobs = [
    ...publishedEps.map(ep=>({
      id:`j-yt-${ep.id}`,type:"youtube",status:"done",
      episodeTitle:ep.title,episodeNum:ep.num,
      scheduledAt:ep.published_at,result:{youtube_url:"https://youtube.com"}
    })),
    ...publishedEps.map(ep=>({
      id:`j-site-${ep.id}`,type:"site",status:"done",
      episodeTitle:ep.title,episodeNum:ep.num,
      scheduledAt:ep.published_at,result:{}
    })),
    ...jobs,
  ];

  const handleSchedule = (epId, platformJobs, scheduledAt) => {
    const ep = eps.find(e=>e.id===epId);
    const newJobs = platformJobs.map((j,i)=>({
      id:`job-${Date.now()}-${i}`,
      type:j.type,
      status:scheduledAt?"pending":"processing",
      episodeTitle:ep?.title||"",
      episodeNum:ep?.num||0,
      scheduledAt,
      payload:j.payload,
      result:{},
    }));
    setJobs(prev=>[...newJobs,...prev]);

    // Simulate processing → done after 3s (in production this goes to Supabase Edge Function)
    if (!scheduledAt) {
      setTimeout(()=>{
        setJobs(prev=>prev.map(j=>
          newJobs.find(nj=>nj.id===j.id) ? {...j,status:"done"} : j
        ));
        // Mark episode as published
        newJobs.filter(j=>j.type==="site").forEach(()=>{
          dispatch({type:"UPDATE_EPISODE",id:epId,patch:{status:"published",published_at:new Date().toISOString(),site_published:true}});
        });
      }, 3000);
    }
  };

  const upcoming = eps.filter(e=>e.status!=="published").slice(0,3);
  const platformsConnected = Object.values(credentials).filter(Boolean).length;

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Publish & Distribution</div>
          <div className="ph-s">YouTube · TikTok · Project Website · Announcements</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-ghost btn-sm" onClick={()=>setTab("site")}>🌐 Site Config</button>
          <button className="btn btn-gold btn-sm" onClick={()=>setShowSchedule(true)} disabled={eps.length===0}>✦ Schedule Publish</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:3,marginBottom:18,borderBottom:"1px solid var(--ln2)",paddingBottom:0}}>
        {[["queue","📋 Publish Queue"],["site","🌐 Website"],["analytics","📊 Analytics"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:"7px 16px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===id?"var(--gold)":"transparent"}`,color:tab===id?"var(--gold)":"var(--t3)",fontSize:15,cursor:"pointer",marginBottom:-1}}>
            {label}
          </button>
        ))}
      </div>

      {tab==="queue" && (
        <div className="g2">
          {/* Left column */}
          <div>
            {/* Platform status */}
            <div className="card" style={{marginBottom:14}}>
              <div className="card-t" style={{marginBottom:12}}>Platform Connections</div>
              {[["youtube","YouTube"],["tiktok","TikTok"]].map(([k,label])=>{
                const pm = PLATFORM_META[k];
                return (
                  <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--ln2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:30,height:30,borderRadius:7,background:pm.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{pm.icon}</div>
                      <div>
                        <div style={{fontSize:15,color:"var(--t1)"}}>{label}</div>
                        <div style={{fontSize:13,color:credentials[k]?"var(--green2)":"var(--t4)"}}>{credentials[k]?"Connected":"Not connected"}</div>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{fontSize:13}} onClick={()=>setConnectPlatform(k)}>
                      {credentials[k]?"Reconnect":"Connect →"}
                    </button>
                  </div>
                );
              })}
              <div style={{padding:"8px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:30,height:30,borderRadius:7,background:"rgba(201,168,76,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>🌐</div>
                  <div>
                    <div style={{fontSize:15,color:"var(--t1)"}}>Project Website</div>
                    <div style={{fontSize:13,color:proj?.site_published?"var(--green2)":"var(--t4)"}}>{proj?.site_published?"Live":"Offline"}</div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{fontSize:13}} onClick={()=>setTab("site")}>Configure →</button>
              </div>
              {platformsConnected===0 && (
                <div className="callout co-gold" style={{marginTop:10,fontSize:14}}>
                  Connect platforms to enable automatic publishing. The website always works without credentials.
                </div>
              )}
            </div>

            {/* Upcoming episodes */}
            {upcoming.length>0 && (
              <div className="card">
                <div className="card-t" style={{marginBottom:12}}>Ready to Publish</div>
                {upcoming.map(ep=>{
                  const segs = ep.segments||[];
                  const done = segs.filter(s=>s.status==="done").length;
                  const ready = segs.length>0 && done===segs.length;
                  return (
                    <div key={ep.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"8px 0",borderBottom:"1px solid var(--ln2)"}}>
                      <div>
                        <div style={{fontSize:15,color:"var(--t1)",fontFamily:"Cormorant Garamond,serif"}}>{ep.title}</div>
                        <div style={{fontSize:13,color:"var(--t3)"}}>EP{String(ep.num).padStart(2,"0")} · {ready?<span style={{color:"var(--green2)"}}>All clips done</span>:<span>{done}/{segs.length} clips</span>}</div>
                      </div>
                      <button className="btn btn-gold btn-sm" style={{fontSize:13}} onClick={()=>setShowSchedule(true)}>Publish →</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column — job queue */}
          <div>
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:"1px solid var(--ln2)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div className="card-t" style={{marginBottom:0}}>Publish Queue</div>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--t3)"}}>{mockJobs.length} jobs</span>
              </div>
              {mockJobs.length===0 ? (
                <div style={{padding:"40px 20px",textAlign:"center",color:"var(--t4)",fontSize:15}}>
                  No publish jobs yet<br/>
                  <button className="btn btn-gold btn-sm" style={{marginTop:12}} onClick={()=>setShowSchedule(true)}>Schedule first publish →</button>
                </div>
              ) : mockJobs.map(job=>(
                <PublishJobRow key={job.id} job={job} onRetry={(id)=>console.log("retry",id)}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="site" && (
        <div style={{maxWidth:600}}>
          <SiteConfigPanel proj={proj} dispatch={dispatch}/>
          {/* Episode visibility table */}
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:"1px solid var(--ln2)"}}>
              <div className="card-t" style={{marginBottom:0}}>Episode Visibility</div>
            </div>
            {eps.length===0 ? (
              <div style={{padding:30,textAlign:"center",color:"var(--t4)",fontSize:15}}>No episodes yet</div>
            ) : (
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:15}}>
                <thead>
                  <tr style={{borderBottom:"1px solid var(--ln2)"}}>
                    {["EP","Title","Status","Access","Site"].map(h=>(
                      <th key={h} style={{padding:"8px 14px",textAlign:"left",color:"var(--t4)",fontSize:13,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eps.map((ep,i)=>{
                    const isFree = i < (proj?.free_episodes||1) || ep.is_free;
                    return (
                      <tr key={ep.id} style={{borderBottom:"1px solid var(--ln2)"}}>
                        <td style={{padding:"9px 14px",fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--t3)"}}>{String(ep.num).padStart(2,"0")}</td>
                        <td style={{padding:"9px 14px",fontFamily:"Cormorant Garamond,serif",color:"var(--t1)"}}>{ep.title}</td>
                        <td style={{padding:"9px 14px"}}><SC.StatusBadge s={ep.status}/></td>
                        <td style={{padding:"9px 14px"}}>
                          <span style={{fontSize:13,padding:"2px 7px",borderRadius:4,background:isFree?"rgba(74,173,117,.15)":"rgba(139,120,240,.15)",color:isFree?"var(--green2)":"#8b78f0"}}>
                            {isFree?"Free":"Paid"}
                          </span>
                        </td>
                        <td style={{padding:"9px 14px"}}>
                          <span style={{fontSize:13,color:ep.site_published?"var(--green2)":"var(--t4)"}}>
                            {ep.site_published?"● Published":"○ Hidden"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div style={{marginTop:12,fontSize:14,color:"var(--t4)"}}>
            First {proj?.free_episodes||1} episode{(proj?.free_episodes||1)!==1?"s":""} are free. All others require a subscription.
            Single account grants access to all projects on the platform.
          </div>
        </div>
      )}

      {tab==="analytics" && (
        <div>
          <div className="g4" style={{marginBottom:20}}>
            {[
              {n:eps.filter(e=>e.status==="published").length, l:"Published Episodes"},
              {n:eps.reduce((a,e)=>a+(e.view_count||0),0)||"—", l:"Total Views"},
              {n:publishedEps.length>0?"Active":"—", l:"Site Status"},
              {n:mockJobs.filter(j=>j.status==="done").length, l:"Successful Jobs"},
            ].map((s,i)=><div key={i} className="card"><div className="stat-n" style={{fontSize:25}}>{s.n}</div><div className="stat-l">{s.l}</div></div>)}
          </div>
          <div className="card">
            <div className="card-t" style={{marginBottom:14}}>Episode Performance</div>
            {eps.filter(e=>e.status==="published").length===0 ? (
              <div style={{textAlign:"center",padding:"30px 0",color:"var(--t4)",fontSize:15}}>No published episodes yet. Publish an episode to see analytics.</div>
            ) : eps.filter(e=>e.status==="published").map(ep=>(
              <div key={ep.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--ln2)"}}>
                <div>
                  <div style={{fontSize:15,color:"var(--t1)",fontFamily:"Cormorant Garamond,serif"}}>{ep.title}</div>
                  <div style={{fontSize:13,color:"var(--t3)"}}>EP{String(ep.num).padStart(2,"0")} · Published {ep.published_at?new Date(ep.published_at).toLocaleDateString():""}</div>
                </div>
                <div style={{display:"flex",gap:16,textAlign:"right"}}>
                  <div><div style={{fontSize:16,color:"var(--t1)",fontFamily:"JetBrains Mono,monospace"}}>{ep.view_count||0}</div><div style={{fontSize:12,color:"var(--t4)"}}>Views</div></div>
                  <div><div style={{fontSize:16,color:"var(--t1)",fontFamily:"JetBrains Mono,monospace"}}>{ep.like_count||0}</div><div style={{fontSize:12,color:"var(--t4)"}}>Likes</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSchedule && <SchedulePublishModal state={state} onSchedule={handleSchedule} onClose={()=>setShowSchedule(false)}/>}
      {connectPlatform && <ConnectPlatformModal platform={connectPlatform} onSave={(p,creds)=>setCredentials(c=>({...c,[p]:true}))} onClose={()=>setConnectPlatform(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUPABASE SYNC HOOK
// ═══════════════════════════════════════════════════════════════════
function useSupabaseSync(state, dispatch) {
  const sbRef = useRef(null);
  const saveTimer = useRef(null);
  const { supabaseUrl, supabaseKey, activeProject } = state;

  // Track whether we need to load after client init
  const needsLoadRef = useRef(false);

  // Init Supabase client — service role key bypasses RLS for local dev
  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      sbRef.current = getSupabaseClient(supabaseUrl, supabaseKey);
      if (!sbRef.current) { console.warn("[Supabase] SDK not available — sync disabled"); dispatch({ type: "SET_SYNC_STATUS", status: "offline" }); return; }
      dispatch({ type: "SET_SYNC_STATUS", status: "ok" });
      needsLoadRef.current = true; // signal load on next render
    } catch (e) {
      dispatch({ type: "SET_SYNC_STATUS", status: "error", error: e.message });
    }
  }, [supabaseUrl, supabaseKey]);

  // Trigger initial load after client is ready — always sync from server
  useEffect(() => {
    if (needsLoadRef.current && sbRef.current) {
      needsLoadRef.current = false;
      if (activeProject) {
        loadFromServer();
      } else {
        // No active project — list projects from server
        listProjectsFromServer().then(projects => {
          if (projects?.length) {
            dispatch({ type: "LOAD_STATE", data: { projects, activeProject: projects[0].id } });
            // Then load the first project's full data
            setTimeout(() => loadFromServer(projects[0].id), 100);
          }
        });
      }
    }
  });

  // Real-time subscription
  useEffect(() => {
    const sb = sbRef.current;
    if (!sb || !activeProject) return;
    const channel = sb.channel(`project:${activeProject}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "episodes", filter: `project_id=eq.${activeProject}` },
        payload => {
          if (payload.eventType === "UPDATE") dispatch({ type: "SYNC_EPISODE_FROM_SERVER", episode: payload.new });
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "bibles", filter: `project_id=eq.${activeProject}` },
        payload => {
          if (payload.new) dispatch({ type: "SYNC_BIBLE_FROM_SERVER", bible: payload.new });
        })
      .subscribe();
    return () => sb.removeChannel(channel);
  }, [activeProject, sbRef.current]);

  // ── LOAD from Supabase (full restore including VN data + images) ──
  // ── List all projects available on the server (no activeProject needed)
  const listProjectsFromServer = async () => {
    const sb = sbRef.current;
    if (!sb) return [];
    try {
      const { data, error } = await sb.from("projects").select("id,name,genre,color,updated_at");
      if (error) throw error;
      return data || [];
    } catch(e) {
      console.warn("[Sync] listProjects failed:", e.message);
      return [];
    }
  };

  // ── Load a specific project by id (ignores activeProject state)
  const loadProjectById = async (pid) => {
    const sb = sbRef.current;
    if (!sb || !pid) return;
    // Temporarily point activeProject at the target so loadFromServer works
    dispatch({ type: "SET_ACTIVE_PROJECT_SILENT", id: pid });
    // Wait one tick for state to update, then load
    await new Promise(r => setTimeout(r, 50));
    await loadFromServer(pid);
  };

  const loadFromServer = async (overridePid) => {
    const sb = sbRef.current;
    const pid = overridePid || activeProject;
    if (!sb || !pid) return;
    try {
      dispatch({ type: "SET_SYNC_STATUS", status: "saving" }); // "loading" indicator
      const pid = overridePid || activeProject;
      const [
        { data: proj },
        { data: eps },
        { data: bible },
        { data: assets },
        { data: jobs },
        { data: vnImgs },
        { data: audioTx },
      ] = await Promise.all([
        sb.from("projects").select("*").eq("id", pid).single(),
        sb.from("episodes").select("*").eq("project_id", pid).order("num"),
        sb.from("bibles").select("*").eq("project_id", pid).single(),
        sb.from("assets").select("*").eq("project_id", pid),
        sb.from("publish_jobs").select("*").eq("project_id", pid).order("created_at", { ascending: false }),
        sb.from("vn_images").select("episode_id,panel_id,data_url").eq("project_id", pid),
        sb.from("audio_transcripts").select("*").eq("project_id", pid),
      ]);

      // Group VN images by episode → { [epId]: { [panelId]: dataUrl } }
      const imgsByEp = {};
      for (const row of (vnImgs || [])) {
        if (!imgsByEp[row.episode_id]) imgsByEp[row.episode_id] = {};
        imgsByEp[row.episode_id][row.panel_id] = row.data_url;
      }

      const mappedEps = (eps || []).map(e => ({
        ...e,
        project:            e.project_id,
        segments:           e.segments           || [],
        vnPanels:           e.vn_panels          || [],
        vnPanelsHistory:    e.vn_panels_history   || [],
        vnStyle:            e.vn_style            || "cinematic",
        vnStylePromptPrefix:e.vn_style_prefix     || "",
        chatHistory:        e.chat_history        || [],
        vnImages:           imgsByEp[e.id]        || {},
        vnImageHistory:     {},
        price_per_ep:       e.price_per_ep        || null,
        price_model:        e.price_model         || "subscription",
        site_published:     e.site_published      || false,
        is_free:            e.is_free             || false,
      }));

      dispatch({ type: "SYNC_FROM_SERVER", data: {
        projects: proj ? [{
          ...proj,
          epRuntime:        proj.ep_runtime,
          desc:             proj.description,
          slug:             proj.slug            || "",
          globalPass:       proj.global_pass     !== false,
          global_pass:      proj.global_pass     !== false,
          perProjectPass:   proj.per_project_pass !== false,
          per_project_pass: proj.per_project_pass !== false,
          site_published:   proj.site_published   || false,
          next_release_date:proj.next_release_date|| null,
        }] : state.projects,
        bible: bible ? {
          characters:      bible.characters      || [],
          relationships:   bible.relationships   || [],
          worldFacts:      bible.world_facts      || [],
          endings:         bible.endings         || [],
          decisionPoints:  bible.decision_points || [],
          storyPrompt:     bible.story_prompt    || {},
          bibleVersion:    bible.bible_version   || 1,
          lastBibleChange: bible.last_changed_at,
          bibleChangelog:  bible.changelog       || [],
        } : state.bible,
        episodes:    mappedEps,
        assets:      (assets || []).map(a => ({ ...a, project: a.project_id })),
        publishJobs: jobs || [],
        audioTranscripts: (audioTx || []).map(t => ({
          id:         t.id,
          epId:       t.ep_id,
          projectId:  t.project_id,
          lines:      t.lines       || [],
          voiceMap:   t.voice_map   || {},
          audioUrls:  t.audio_urls  || {},
          staleAudio: t.stale_audio || {},
          createdAt:  t.created_at,
        })),
      }});

      // Seed IndexedDB with VN images so they persist locally
      for (const [epId, panels] of Object.entries(imgsByEp)) {
        for (const [panelId, dataUrl] of Object.entries(panels)) {
          idbSave(vnImageKey(epId, panelId), dataUrl).catch(() => {});
        }
      }
      // Seed IndexedDB with character avatars from Supabase
      for (const char of (mappedEps.length ? [] : [])) { /* handled below via bible */ }
      const bibleData = bible;
      if (bibleData?.characters?.length) {
        for (const char of bibleData.characters) {
          const history = char.avatarHistory || (char.avatarUrl ? [{ id: "av_restored_" + char.id, dataUrl: char.avatarUrl }] : []);
          for (const entry of history) {
            if (entry.dataUrl?.startsWith("data:")) {
              idbSave(avatarKey(char.id, entry.id), entry.dataUrl).catch(() => {});
            }
          }
        }
      }

      dispatch({ type: "SET_SYNC_STATUS", status: "ok" });
      console.log(`[Sync] Loaded ${mappedEps.length} episodes, ${(vnImgs||[]).length} VN images`);
    } catch (e) {
      console.error("Load from server failed", e);
      dispatch({ type: "SET_SYNC_STATUS", status: "error", error: e.message });
    }
  };

  // ── SAVE to Supabase (full — all VN data, images, bible, segments) ──
  const saveToServer = useCallback(async (s) => {
    const sb = sbRef.current;
    if (!sb || !s.activeProject) return;
    dispatch({ type: "SET_SYNC_STATUS", status: "saving" });
    try {
      const pid = s.activeProject;
      const activeProj = s.projects.find(p => p.id === pid);
      const projectEps = s.episodes.filter(e => e.project === pid);

      // Read all current VN images from IndexedDB (source of truth for images)
      const idbAll = await idbLoadPrefix("vni:").catch(() => ({}));

      // Build characters with avatars merged from IDB before any upserts
      const allAvatarIdb = await idbLoadPrefix("avi:").catch(() => ({}));
      const avatarsByChar = {};
      for (const [key, dataUrl] of Object.entries(allAvatarIdb)) {
        const parts = key.split(":");
        const charId = parts[1], histId = parts[2];
        if (!charId || !histId || !dataUrl) continue;
        if (!avatarsByChar[charId]) avatarsByChar[charId] = [];
        avatarsByChar[charId].push({ id: histId, dataUrl, style: "generated", createdAt: new Date().toISOString() });
      }
      const charsWithAvatars = (s.bible.characters || []).map(c => {
        const idbEntries = (avatarsByChar[c.id] || []).sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
        if (!idbEntries.length) return c;
        return { ...c, avatarUrl: c.avatarUrl || idbEntries[0].dataUrl, avatarHistory: idbEntries };
      });

      await Promise.all([
        // Project
        activeProj && sb.from("projects").upsert({
          id: pid,
          name: activeProj.name,
          type: activeProj.type || "drama",
          genre: activeProj.genre || "",
          color: activeProj.color || "#c9a84c",
          status: activeProj.status || "active",
          episodes: activeProj.episodes || 10,
          ep_runtime: activeProj.epRuntime || 180,
          description: activeProj.desc || "",
          slug: activeProj.slug || pid,
          website_config: activeProj.website_config || {},
          price_monthly: activeProj.price_monthly || 4.99,
          price_annual: activeProj.price_annual || 39.99,
          price_lifetime: activeProj.price_lifetime || 99,
          free_episodes: activeProj.free_episodes || 1,
          global_pass: activeProj.global_pass !== false,
          per_project_pass: activeProj.per_project_pass !== false,
          site_published: activeProj.site_published || false,
          next_release_date: activeProj.next_release_date || null,
        }),

        // Bible
        sb.from("bibles").upsert({
          project_id: pid,
          characters:      charsWithAvatars,
          relationships:   s.bible.relationships   || [],
          world_facts:     s.bible.worldFacts      || [],
          endings:         s.bible.endings         || [],
          decision_points: s.bible.decisionPoints  || [],
          story_prompt:    s.bible.storyPrompt     || {},
          bible_version:   s.bible.bibleVersion    || 1,
          last_changed_at: s.bible.lastBibleChange || new Date().toISOString(),
          changelog:       s.bible.bibleChangelog  || [],
        }),

        // Episodes — all VN content, segments, style, chat history
        ...projectEps.map(e =>
          sb.from("episodes").upsert({
            id:                 e.id,
            project_id:         pid,
            num:                e.num,
            title:              e.title,
            status:             e.status     || "not_started",
            notes:              e.notes      || "",
            segments:           e.segments   || [],
            access:             e.access     || "free",
            published_at:       e.published_at || null,
            vn_panels:          e.vnPanels   || [],
            vn_panels_history:  e.vnPanelsHistory || [],
            vn_style:           e.vnStyle    || "cinematic",
            vn_style_prefix:    e.vnStylePromptPrefix || null,
            chat_history:       e.chatHistory || [],
            price_per_ep:       e.price_per_ep || null,
            price_model:        e.price_model  || "subscription",
            site_published:     e.site_published || false,
            is_free:            e.is_free || false,
          })
        ),

        // Assets
        ...s.assets.filter(a => a.project === pid).map(a =>
          sb.from("assets").upsert({
            id: a.id, project_id: pid, name: a.name, type: a.type,
            tags: a.tags || [], thumb: a.thumb || "", notes: a.notes || "",
            ref_status: a.refStatus || "pending",
            file_url: a.file_url || a.fileUrl || null,
          })
        ),
      ]);

      // Save VN images — upsert each panel image from IDB
      // Batch by episode to avoid hammering the API
      const imgUpserts = [];
      for (const [key, dataUrl] of Object.entries(idbAll)) {
        const parts = key.split(":");
        const epId = parts[1], panelId = parts[2];
        if (!epId || !panelId || !dataUrl) continue;
        const ep = projectEps.find(e => e.id === epId);
        if (!ep) continue; // Only save images for this project's episodes
        imgUpserts.push({ project_id: pid, episode_id: epId, panel_id: panelId, data_url: dataUrl });
      }
      if (imgUpserts.length > 0) {
        // Upsert in batches of 20 to stay within request size limits
        for (let i = 0; i < imgUpserts.length; i += 20) {
          await sb.from("vn_images").upsert(imgUpserts.slice(i, i + 20));
        }
        console.log(`[Sync] Saved ${imgUpserts.length} VN images`);
      }

      // Save audio transcripts for this project
      const projectTranscripts = s.audioTranscripts.filter(t => t.projectId === pid);
      if (projectTranscripts.length > 0) {
        // Strip large blob URLs from audioUrls before saving (keep Supabase storage URLs only)
        const cleanedTranscripts = projectTranscripts.map(t => ({
          ...t,
          audioUrls: Object.fromEntries(
            Object.entries(t.audioUrls || {}).filter(([, url]) => url && url.startsWith("http"))
          ),
        }));
        await sb.from("audio_transcripts").upsert(
          cleanedTranscripts.map(t => ({
            id:           t.id,
            project_id:   pid,
            ep_id:        t.epId,
            lines:        t.lines        || [],
            voice_map:    t.voiceMap     || {},
            audio_urls:   t.audioUrls    || {},
            stale_audio:  t.staleAudio   || {},
            created_at:   t.createdAt    || new Date().toISOString(),
          }))
        );
        console.log(`[Sync] Saved ${cleanedTranscripts.length} audio transcripts`);
      }

      dispatch({ type: "SET_SYNC_STATUS", status: "ok" });
    } catch (e) {
      console.error("Save to server failed", e);
      dispatch({ type: "SET_SYNC_STATUS", status: "error", error: e.message });
    }
  }, []);

  // ── Save a single VN image immediately (called right after generation) ──
  const saveImageToServer = useCallback(async (epId, panelId, dataUrl, projectId) => {
    const sb = sbRef.current;
    if (!sb || !projectId) return; // not connected — IDB is the fallback
    try {
      await sb.from("vn_images").upsert({
        project_id: projectId,
        episode_id: epId,
        panel_id:   panelId,
        data_url:   dataUrl,
      });
      console.log(`[Sync] Image saved: ${epId}/${panelId}`);
    } catch (e) {
      console.warn("[Sync] Image save failed (will retry on next full sync):", e.message);
    }
  }, []);

  // ── Push ALL projects to Supabase (used by SyncModal push button)
  const pushAllToServer = useCallback(async (s) => {
    const sb = sbRef.current;
    if (!sb) throw new Error("Supabase not connected. Enter credentials in Settings first.");
    const allProjects = s.projects || [];
    if (allProjects.length === 0) throw new Error("No projects found in local data.");

    const results = [];
    for (const proj of allProjects) {
      try {
        await saveToServer({ ...s, activeProject: proj.id });
        results.push({ id: proj.id, name: proj.name, ok: true });
      } catch(e) {
        results.push({ id: proj.id, name: proj.name, ok: false, err: e.message });
      }
    }
    return results;
  }, [saveToServer]);

  return { saveToServer, pushAllToServer, loadFromServer, saveImageToServer, listProjectsFromServer, loadProjectById };
}

// ═══════════════════════════════════════════════════════════════════
// SYNC STATUS BAR (shown at top of workspace)
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// SYNC MODAL — pull projects from Supabase into a fresh deployment
// ═══════════════════════════════════════════════════════════════════
function SyncModal({ state, dispatch, onClose }) {
  const [mode, setMode]       = useState("choose"); // choose | push | pull
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]  = useState(false);
  const [syncing, setSyncing]  = useState(null);
  const [done, setDone]        = useState(null);
  const [err, setErr]          = useState(null);

  const localProjects = state.projects || [];
  const hasLocal = localProjects.length > 0;

  const fetchServerProjects = async () => {
    setLoading(true); setErr(null);
    try {
      const list = await window._dsListProjects?.();
      setProjects(list || []);
      if (!list?.length) setErr("No projects found on Supabase yet.");
    } catch(e) { setErr(e.message); }
    setLoading(false);
  };

  const [pushResults, setPushResults] = useState(null);

  const push = async () => {
    setSyncing("push"); setErr(null); setPushResults(null);
    try {
      const results = await window._dsPushAll?.();
      setPushResults(results || []);
      const allOk = results?.every(r => r.ok);
      if (allOk) setDone("push");
    } catch(e) {
      setErr(e.message);
    }
    setSyncing(null);
  };

  const pull = async (pid, pname) => {
    setSyncing(pid); setErr(null);
    try {
      await window._dsLoadProject?.(pid);
      setDone(pname);
      setTimeout(() => onClose(), 1500);
    } catch(e) { setErr(`Failed: ${e.message}`); setSyncing(null); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:500, width:"90%"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18}}>
          <div style={{fontSize:18, fontFamily:"Cormorant Garamond,serif", color:"var(--gold)"}}>⇅ Supabase Sync</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {!state.supabaseUrl ? (
          <div className="callout co-amber">No Supabase credentials set. Go to Settings → Supabase first.</div>
        ) : done === "push" ? (
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            <div className="callout co-green" style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>✓</span> Push complete!
            </div>
            {pushResults && pushResults.map(r => (
              <div key={r.id} style={{display:"flex", alignItems:"center", gap:10,
                padding:"8px 12px", borderRadius:6, background:"var(--bg2)",
                border:`1px solid ${r.ok ? "var(--green2)" : "var(--red2)"}`}}>
                <span>{r.ok ? "✓" : "✗"}</span>
                <span style={{flex:1, color:"var(--t1)"}}>{r.name}</span>
                {!r.ok && <span style={{fontSize:12, color:"var(--red2)"}}>{r.err}</span>}
              </div>
            ))}
            <div style={{fontSize:12, color:"var(--t4)", marginTop:4}}>
              Now open your new deployment → Settings → Supabase → connect → ⇅ Sync → Pull to load this data.
            </div>
          </div>
        ) : done ? (
          <div className="callout co-green" style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>✓</span> "{done}" loaded — reloading workspace…
          </div>
        ) : mode === "choose" ? (
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {/* PUSH */}
            <div style={{padding:"16px 18px", borderRadius:10, border:"1px solid var(--ln)",
              background:"var(--bg2)", display:"flex", alignItems:"center", gap:14}}>
              <div style={{fontSize:28}}>↑</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15, fontWeight:600, color:"var(--t1)", marginBottom:3}}>Push local → Supabase</div>
                <div style={{fontSize:13, color:"var(--t3)"}}>
                  Upload your current local data to Supabase.
                  {hasLocal && <span style={{color:"var(--green2)"}}> {localProjects.length} project{localProjects.length>1?"s":""} ready to push.</span>}
                </div>
              </div>
              <button className="btn btn-gold" disabled={!hasLocal || syncing==="push"}
                onClick={push}>
                {syncing==="push" ? (
                  <span style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:12,height:12,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>
                    Pushing…
                  </span>
                ) : "↑ Push"}
              </button>
            </div>

            {/* PULL */}
            <div style={{padding:"16px 18px", borderRadius:10, border:"1px solid var(--ln)",
              background:"var(--bg2)", display:"flex", alignItems:"center", gap:14}}>
              <div style={{fontSize:28}}>↓</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15, fontWeight:600, color:"var(--t1)", marginBottom:3}}>Pull Supabase → local</div>
                <div style={{fontSize:13, color:"var(--t3)"}}>Download a project from Supabase into this deployment.</div>
              </div>
              <button className="btn btn-ghost" onClick={()=>{setMode("pull"); fetchServerProjects();}}>
                ↓ Pull
              </button>
            </div>

            {err && <div className="callout co-red" style={{marginTop:4}}>{err}</div>}
          </div>

        ) : mode === "pull" ? (
          <>
            <button className="btn btn-ghost btn-sm" style={{marginBottom:12}} onClick={()=>setMode("choose")}>← Back</button>
            {loading ? (
              <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--t3)",padding:"16px 0"}}>
                <div style={{width:20,height:20,border:"2px solid var(--gold)",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                Fetching from Supabase…
              </div>
            ) : err ? (
              <div className="callout co-red">{err}</div>
            ) : projects.length === 0 ? (
              <div className="callout co-amber">No projects on Supabase yet. Push your local data first.</div>
            ) : (
              <>
                <div style={{fontSize:13,color:"var(--t3)",marginBottom:12}}>
                  Select a project to load into this deployment:
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {projects.map(p => (
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,
                      padding:"12px 14px",borderRadius:8,background:"var(--bg2)",border:"1px solid var(--ln)"}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:p.color||"var(--gold)",flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,color:"var(--t1)",fontWeight:500}}>{p.name}</div>
                        <div style={{fontSize:12,color:"var(--t4)"}}>
                          {p.genre} · updated {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "unknown"}
                        </div>
                      </div>
                      <button className="btn btn-gold btn-sm" disabled={!!syncing}
                        onClick={()=>pull(p.id, p.name)}>
                        {syncing===p.id ? (
                          <span style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{width:12,height:12,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>
                            Loading…
                          </span>
                        ) : "↓ Load"}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12,fontSize:12,color:"var(--t4)",borderTop:"1px solid var(--ln2)",paddingTop:10}}>
                  {projects.length} project{projects.length!==1?"s":""} on Supabase
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function SyncBar({ state, dispatch, onSignIn, onSignOut, onSyncClick }) {
  const { syncStatus, syncError, currentUser, teamMembers } = state;
  const statusLabels = { ok:"Synced", saving:"Saving…", error:"Sync Error", offline:"Local Only" };
  const statusClass  = { ok:"sync-ok", saving:"sync-saving", error:"sync-error", offline:"sync-offline" };
  const onlineMembers = teamMembers.filter(m => m.online);

  return (
    <div className="sync-bar">
      <span className={`sync-dot ${statusClass[syncStatus]||"sync-offline"}`}/>
      <span>{statusLabels[syncStatus]||"Offline"}</span>
      {syncError && <span style={{color:"var(--red2)",marginLeft:4}}>{syncError}</span>}
      {!state.supabaseUrl && <span style={{color:"var(--t4)",marginLeft:8}}>· Set Supabase credentials in Settings to enable sync</span>}
      {state.supabaseUrl && (
        <button className="btn btn-ghost btn-sm" style={{marginLeft:8, padding:"1px 8px", fontSize:12}}
          onClick={onSyncClick}>↓ Sync from Server</button>
      )}
      <div style={{flex:1}}/>
      {onlineMembers.length > 0 && (
        <div style={{display:"flex",gap:4,alignItems:"center",marginRight:8}}>
          {onlineMembers.map(m => (
            <div key={m.id} className="user-avatar" style={{background: m.color||"var(--gold)", color:"#000"}} title={m.displayName}>
              {(m.displayName||m.email||"?").charAt(0).toUpperCase()}
            </div>
          ))}
          <span style={{fontSize:12,color:"var(--t3)"}}>{onlineMembers.length} online</span>
        </div>
      )}
      {currentUser ? (
        <div className="user-chip">
          <div className="user-avatar" style={{background:"var(--gold2)",color:"#000"}}>
            {(currentUser.displayName||currentUser.email||"U").charAt(0).toUpperCase()}
          </div>
          {currentUser.displayName||currentUser.email}
          <span style={{cursor:"pointer",marginLeft:4,color:"var(--t4)"}} onClick={onSignOut}>✕</span>
        </div>
      ) : (
        <button className="btn btn-ghost btn-sm" style={{padding:"2px 10px",fontSize:13}} onClick={onSignIn}>Sign In</button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LOGIN PAGE — full-screen auth gate
// ═══════════════════════════════════════════════════════════════════
function LoginPage({ onAuth }) {
  const [tab, setTab] = useState("login"); // login | signup | waitlist
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getSb = () => {
    const cc = getSupabaseCreateClient();
    if (!cc) throw new Error("Supabase SDK not loaded. Please refresh the page.");
    const url = window.__DRAMA_SB_URL;
    const key = window.__DRAMA_SB_KEY;
    if (!url || !key) throw new Error("Supabase not configured.");
    return cc(url, key);
  };

  const handleLogin = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const sb = getSb();
      const { data, error: e } = await sb.auth.signInWithPassword({ email, password });
      if (e) throw e;
      const user = { id: data.user.id, email: data.user.email, displayName: data.user.user_metadata?.display_name || email.split("@")[0], session: data.session };
      localStorage.setItem("ds_session", JSON.stringify({ access_token: data.session.access_token, refresh_token: data.session.refresh_token }));
      onAuth(user);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const sb = getSb();
      const { data, error: e } = await sb.auth.signUp({ email, password, options: { data: { display_name: name || email.split("@")[0] } } });
      if (e) throw e;
      if (data.session) {
        const user = { id: data.user.id, email: data.user.email, displayName: data.user.user_metadata?.display_name || name || email.split("@")[0], session: data.session };
        localStorage.setItem("ds_session", JSON.stringify({ access_token: data.session.access_token, refresh_token: data.session.refresh_token }));
        onAuth(user);
      } else {
        setSuccess("Account created! Check your email to verify, then sign in.");
        setTab("login");
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleWaitlist = async () => {
    if (!email.trim()) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      const sb = getSb();
      const { error: e } = await sb.from("waitlist").insert({ email: email.trim().toLowerCase(), name: name.trim() || null, source: "app" });
      if (e) {
        if (e.code === "23505") { setSuccess("You're already on the waitlist! We'll be in touch soon."); }
        else throw e;
      } else {
        setSuccess("You're on the list! We'll notify you when your spot opens up.");
      }
      setEmail(""); setName("");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (tab === "login") handleLogin();
      else if (tab === "signup") handleSignUp();
      else if (tab === "waitlist") handleWaitlist();
    }
  };

  return (
    <div className="login-shell">
      <div className="login-left">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-name">Drama Studio</div>
            <div className="login-brand-sub">Production OS</div>
          </div>

          <div className="login-tabs">
            {[["login","Sign In"],["signup","Create Account"],["waitlist","Join Waitlist"]].map(([id,label])=>(
              <button key={id} className={tab===id?"on":""} onClick={()=>{setTab(id);setError("");setSuccess("");}}>{label}</button>
            ))}
          </div>

          <div className="login-form">
            {error && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            {(tab === "signup" || tab === "waitlist") && (
              <input className="login-input" value={name} onChange={e=>setName(e.target.value)} onKeyDown={handleKeyDown} placeholder="Your name" autoComplete="name"/>
            )}

            <input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="Email address" autoComplete="email"/>

            {tab !== "waitlist" && (
              <input className="login-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="Password" autoComplete={tab==="login"?"current-password":"new-password"}/>
            )}

            {tab === "login" && (
              <button className="login-btn login-btn-gold" disabled={loading || !email} onClick={handleLogin}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            )}
            {tab === "signup" && (
              <button className="login-btn login-btn-gold" disabled={loading || !email || !password} onClick={handleSignUp}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            )}
            {tab === "waitlist" && (
              <button className="login-btn login-btn-gold" disabled={loading || !email} onClick={handleWaitlist}>
                {loading ? "Joining..." : "Join the Waitlist"}
              </button>
            )}

            {tab === "waitlist" && (
              <div style={{textAlign:"center",fontSize:13,color:"var(--t3)",marginTop:4,lineHeight:1.5}}>
                Get early access when we open new spots. No spam, ever.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-bg"/>
        <div className="login-right-pattern"/>
        <div className="login-right-content">
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"var(--gold2)",fontWeight:700,marginBottom:8}}>
            Build interactive dramas at scale
          </div>
          <div style={{fontSize:16,color:"var(--t2)",marginBottom:28,lineHeight:1.6}}>
            AI-powered writing room, visual novel generation, multi-platform publishing — all in one production OS.
          </div>
          <ul className="login-features">
            <li><span className="login-feat-icon">&#x2726;</span><div><strong style={{color:"var(--t1)"}}>AI Director</strong><br/>Claude-powered story generation, character bibles, and episode writing</div></li>
            <li><span className="login-feat-icon">&#x1F3AC;</span><div><strong style={{color:"var(--t1)"}}>Visual Novel Engine</strong><br/>Generate cinematic panels with AI — 6 art styles, custom prompts</div></li>
            <li><span className="login-feat-icon">&#x1F4E1;</span><div><strong style={{color:"var(--t1)"}}>Publish Everywhere</strong><br/>One-click distribution to YouTube, Apple TV, TikTok, and more</div></li>
            <li><span className="login-feat-icon">&#x1F30A;</span><div><strong style={{color:"var(--t1)"}}>Ripple Engine</strong><br/>Temporal branching — every decision creates alternate timelines</div></li>
          </ul>
          <div className="login-quote">
            "Inside the four most powerful fashion houses in the world, a 100-episode interactive drama unfolds."
            <div className="login-quote-author">— The House of High Fashion, built with Drama Studio</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AUTH MODAL
// ═══════════════════════════════════════════════════════════════════
function AuthModal({ supabaseUrl, supabaseKey, onSuccess, onClose }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const getClient = () => {
    const cc = getSupabaseCreateClient();
    if (!cc) throw new Error("Supabase SDK not available in this environment.");
    return cc(supabaseUrl, supabaseKey);
  };

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const sb = getClient();
      const { data, error: e } = await sb.auth.signInWithPassword({ email, password });
      if (e) throw e;
      onSuccess({ id: data.user.id, email: data.user.email, displayName: data.user.user_metadata?.display_name || email.split("@")[0] });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true); setError("");
    try {
      const sb = getClient();
      const { data, error: e } = await sb.auth.signUp({ email, password, options: { data: { display_name: name||email.split("@")[0] } } });
      if (e) throw e;
      setTab("verify");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    setLoading(true); setError("");
    try {
      const sb = getClient();
      const { error: e } = await sb.auth.signInWithOtp({ email });
      if (e) throw e;
      setMagicSent(true);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="overlay">
      <div className="auth-modal">
        <div className="auth-logo">Nekoi Studio</div>
        <div className="auth-sub">Production OS · Team Sign In</div>
        {tab !== "verify" ? (
          <>
            <div className="auth-tab">
              {["login","signup","magic"].map(t=><button key={t} className={tab===t?"on":""} onClick={()=>setTab(t)}>{t==="login"?"Sign In":t==="signup"?"Create Account":"Magic Link"}</button>)}
            </div>
            {tab==="signup"&&<div className="fg" style={{marginBottom:10}}><label className="fl">Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} placeholder="Display name"/></div>}
            <div className="fg" style={{marginBottom:10}}><label className="fl">Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@studio.com"/></div>
            {tab!=="magic"&&<div className="fg" style={{marginBottom:14}}><label className="fl">Password</label><input className="fi" type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tab==="login"&&handleLogin()} placeholder="••••••••"/></div>}
            {magicSent ? <div className="callout co-blue" style={{marginBottom:12}}>Magic link sent! Check your email.</div>
              : error ? <div className="callout co-red" style={{marginBottom:12}}>{error}</div> : null}
            <button className="btn btn-gold" style={{width:"100%",marginBottom:8}} disabled={loading||!email}
              onClick={tab==="login"?handleLogin:tab==="signup"?handleSignUp:handleMagicLink}>
              {loading?"…":tab==="login"?"Sign In →":tab==="signup"?"Create Account →":"Send Magic Link →"}
            </button>
            <button className="btn btn-ghost" style={{width:"100%"}} onClick={onClose}>Cancel</button>
          </>
        ) : (
          <div style={{padding:"20px 0",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>📧</div>
            <div style={{color:"var(--t1)",marginBottom:8}}>Check your email</div>
            <div style={{color:"var(--t3)",fontSize:15,marginBottom:20}}>We sent a verification link to {email}</div>
            <button className="btn btn-ghost" style={{width:"100%"}} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TEAM MANAGEMENT PAGE
// ═══════════════════════════════════════════════════════════════════
function PageTeam({ state, dispatch }) {
  const proj = state.projects.find(p=>p.id===state.activeProject);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteSent, setInviteSent] = useState(false);
  const mockMembers = state.teamMembers.length > 0 ? state.teamMembers : [
    { id:"1", email:"you@studio.com", displayName:"You", role:"owner", online:true, color:"#c9a84c" },
    { id:"2", email:"director@studio.com", displayName:"Art Director", role:"editor", online:false, color:"#60a5fa" },
  ];

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    dispatch({ type: "SET_TEAM_MEMBERS", members: [...state.teamMembers,
      { id: Date.now().toString(), email: inviteEmail, displayName: inviteEmail.split("@")[0], role: inviteRole, online: false, pending: true }
    ]});
    setInviteEmail(""); setInviteSent(true);
    setTimeout(()=>setInviteSent(false), 3000);
  };

  const ROLE_PERMS = {
    owner:  ["View all","Edit all","Invite team","Delete project","Publish","Manage billing"],
    editor: ["View all","Edit bible","Edit episodes","Edit assets","Publish"],
    viewer: ["View all","Comment only"],
  };

  return (
    <div style={{maxWidth:680}}>
      <div className="ph">
        <div>
          <div className="ph-t">Team</div>
          <div className="ph-s">Manage who can access {proj?.name||"this project"}</div>
        </div>
        <div className="ph-r">
          {state.syncStatus==="offline"&&<span className="callout co-amber" style={{padding:"4px 12px",fontSize:14}}>⚠ Connect Supabase in Settings to invite real team members</span>}
        </div>
      </div>

      {/* Current members */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-t" style={{marginBottom:12}}>Team Members</div>
        {mockMembers.map(m=>(
          <div key={m.id} className="member-row">
            <div className="user-avatar" style={{width:32,height:32,background:m.color||"var(--t3)",color:"#000",fontSize:16,borderRadius:8}}>
              {(m.displayName||m.email).charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,color:"var(--t1)"}}>{m.displayName||m.email}</div>
              <div style={{fontSize:14,color:"var(--t3)"}}>{m.email} {m.pending&&<span style={{color:"var(--amber)"}}>· Invite pending</span>}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {m.online&&<span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",display:"inline-block"}}/>}
              <span className={`member-role role-${m.role}`}>{m.role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-t" style={{marginBottom:12}}>Invite Team Member</div>
        <div className="fr3">
          <div className="fg" style={{gridColumn:"span 2"}}><label className="fl">Email</label><input className="fi" type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="colleague@studio.com" onKeyDown={e=>e.key==="Enter"&&handleInvite()}/></div>
          <div className="fg"><label className="fl">Role</label><select className="fs" value={inviteRole} onChange={e=>setInviteRole(e.target.value)}><option value="editor">Editor</option><option value="viewer">Viewer</option></select></div>
        </div>
        {inviteSent&&<div className="callout co-green" style={{marginBottom:10}}>✓ Invitation sent (or queued — connect Supabase to send real email)</div>}
        <button className="btn btn-gold btn-sm" disabled={!inviteEmail.trim()} onClick={handleInvite}>Send Invite</button>
      </div>

      {/* Role permissions */}
      <div className="card">
        <div className="card-t" style={{marginBottom:12}}>Role Permissions</div>
        <div className="fr3">
          {Object.entries(ROLE_PERMS).map(([role, perms])=>(
            <div key={role} style={{background:"var(--bg3)",borderRadius:8,padding:12,border:"1px solid var(--ln)"}}>
              <div style={{marginBottom:8}}><span className={`member-role role-${role}`}>{role}</span></div>
              {perms.map(p=><div key={p} style={{fontSize:14,color:"var(--t3)",padding:"2px 0"}}>✓ {p}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEWER WEBSITE — complete public-facing site per project
// This renders in a modal/overlay in the OS but is designed as a
// standalone webpage. In production: deploy at project.yourdomain.com
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// VIEWER SITE — Per-project adaptive design system
//
// Each project generates its own visual identity from:
//   - proj.type    (drama|game|anime|film)
//   - proj.genre   (Fashion Drama, Cyberpunk, Wuxia, etc.)
//   - proj.color   (primary accent)
//   - proj.website_config.theme overrides
//
// Five distinct design modes, selected automatically:
//   LUXURY    - Fashion/Romance/Historical drama  → Cormorant serif, champagne tones
//   CYBER     - Sci-fi/Cyberpunk/Thriller         → monospaced, neon, grid lines
//   EPIC      - Fantasy/Wuxia/Action              → painterly, bold, high contrast
//   EDITORIAL - Literary/Mystery/Noir             → editorial magazine, ink/paper
//   GAME      - Visual novel/Game                 → UI chrome, controller aesthetic
// ═══════════════════════════════════════════════════════════════════

function getProjectTheme(proj) {
  const type   = (proj?.type||"drama").toLowerCase();
  const genre  = (proj?.genre||"").toLowerCase();
  const color  = proj?.color || "#c9a84c";
  const cfg    = proj?.website_config || {};

  let mode = "luxury";
  if (type === "game")                                            mode = "game";
  else if (/cyber|sci.fi|tech|hack|future|neon/i.test(genre))   mode = "cyber";
  else if (/fantasy|wuxia|epic|myth|warrior|sword/i.test(genre)) mode = "epic";
  else if (/noir|mystery|literary|detective|crime/i.test(genre)) mode = "editorial";
  else if (/anime/i.test(type))                                   mode = "epic";
  if (cfg.theme) mode = cfg.theme;

  const themes = {
    luxury: {
      bg:         "#080608",
      surface:    "#110f12",
      card:       "#1a171b",
      accent:     color,
      titleFont:  "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      bodyFont:   "'DM Sans', sans-serif",
      monoFont:   "'JetBrains Mono', monospace",
      heroStyle:  `radial-gradient(ellipse at 60% 40%, ${color}18 0%, #0c080d 60%)`,
      navBg:      "rgba(8,6,8,.92)",
      grain:      true,
      ornament:   "✦",
      taglineStyle: { fontStyle:"italic", letterSpacing:".5px" },
      epCardBg:   "#1a171b",
    },
    cyber: {
      bg:         "#030508",
      surface:    "#060b12",
      card:       "#0a1018",
      accent:     color==="#c9a84c" ? "#00ffe5" : color,
      titleFont:  "'JetBrains Mono', 'Fira Code', monospace",
      bodyFont:   "'DM Sans', sans-serif",
      monoFont:   "'JetBrains Mono', monospace",
      heroStyle:  `linear-gradient(160deg, #000508 0%, #030d1a 50%, #01060e 100%)`,
      navBg:      "rgba(3,5,8,.95)",
      grain:      false,
      gridLines:  true,
      ornament:   ">_",
      taglineStyle: { fontFamily:"'JetBrains Mono',monospace", letterSpacing:"2px", textTransform:"uppercase", fontSize:"11px" },
      epCardBg:   "#070d15",
    },
    epic: {
      bg:         "#05030a",
      surface:    "#0d0b14",
      card:       "#15121e",
      accent:     color==="#c9a84c" ? "#c97a2a" : color,
      titleFont:  "'Cormorant Garamond', Georgia, serif",
      bodyFont:   "'DM Sans', sans-serif",
      monoFont:   "'JetBrains Mono', monospace",
      heroStyle:  `radial-gradient(ellipse at 30% 70%, ${color}25 0%, #05030a 65%)`,
      navBg:      "rgba(5,3,10,.9)",
      grain:      true,
      ornament:   "⚔",
      taglineStyle: { letterSpacing:"3px", textTransform:"uppercase", fontSize:"12px" },
      epCardBg:   "#13101c",
    },
    editorial: {
      bg:         "#f5f2ec",
      surface:    "#edeae3",
      card:       "#e5e1d8",
      accent:     color==="#c9a84c" ? "#1a1a1a" : color,
      titleFont:  "'Cormorant Garamond', Georgia, serif",
      bodyFont:   "'DM Sans', sans-serif",
      monoFont:   "'JetBrains Mono', monospace",
      heroStyle:  `linear-gradient(135deg, #f5f2ec 0%, #e8e3d8 100%)`,
      navBg:      "rgba(245,242,236,.95)",
      textPrimary: "#1a1a1a",
      textSecondary: "#4a4a4a",
      textMuted:   "#8a8a8a",
      grain:      false,
      ornament:   "§",
      taglineStyle: { fontStyle:"italic" },
      epCardBg:   "#dedad1",
    },
    game: {
      bg:         "#0a0010",
      surface:    "#12001e",
      card:       "#1a0028",
      accent:     color==="#c9a84c" ? "#b347ff" : color,
      titleFont:  "'JetBrains Mono', monospace",
      bodyFont:   "'DM Sans', sans-serif",
      monoFont:   "'JetBrains Mono', monospace",
      heroStyle:  `linear-gradient(160deg, #0a0010 0%, #1a0030 50%, #080018 100%)`,
      navBg:      "rgba(10,0,16,.95)",
      grain:      false,
      scanlines:  true,
      ornament:   "▶",
      taglineStyle: { fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" },
      epCardBg:   "#150020",
    },
  };

  return { mode, ...themes[mode] };
}

// ════════════════════════════════════════════════════════════════════
// VISUAL NOVEL READER — adaptive phone/tablet, page flip, autoplay
// ════════════════════════════════════════════════════════════════════
function VNReader({ ep, proj, bible, onClose, isFree = true }) {
  const panels   = ep.vnPanels || [];
  const images   = ep.vnImages || {};
  const allChars = bible?.characters || [];
  const theme    = getProjectTheme(proj);
  const ACC      = theme.accent || "#c9a84c";

  const [idx, setIdx]           = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showUI, setShowUI]     = useState(true);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir]   = useState("next");
  const uiTimer = useRef(null);
  const autoTimer = useRef(null);

  const panel = panels[idx] || null;
  const imgUrl = panel ? images[panel.id] : null;
  const d = panel ? (VN_PANEL_TYPES[panel.panelType] || VN_PANEL_TYPES.BG) : VN_PANEL_TYPES.BG;
  const chars = panel ? (panel.chars||[]).map(id=>allChars.find(c=>c.id===id)).filter(Boolean) : [];

  // Auto-hide UI after 3s of inactivity
  const resetUITimer = () => {
    setShowUI(true);
    if (uiTimer.current) clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => setShowUI(false), 3000);
  };

  // Auto-play: advance every 4 seconds
  useEffect(() => {
    if (autoPlay && panels.length > 0) {
      autoTimer.current = setTimeout(() => {
        if (idx < panels.length - 1) goNext();
        else setAutoPlay(false);
      }, 4000);
    }
    return () => clearTimeout(autoTimer.current);
  }, [autoPlay, idx]);

  useEffect(() => { resetUITimer(); return () => clearTimeout(uiTimer.current); }, []);

  const goTo = (newIdx, dir = "next") => {
    if (flipping) return;
    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => { setIdx(newIdx); setFlipping(false); }, 280);
    resetUITimer();
  };
  const goNext = () => { if (idx < panels.length-1) goTo(idx+1, "next"); };
  const goPrev = () => { if (idx > 0) goTo(idx-1, "prev"); };

  // Keyboard / swipe
  useEffect(() => {
    const onKey = e => {
      if (e.key==="ArrowRight"||e.key===" ") goNext();
      if (e.key==="ArrowLeft") goPrev();
      if (e.key==="Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, flipping]);

  // Swipe support
  const touchStart = useRef(null);
  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) { dx < 0 ? goNext() : goPrev(); }
    touchStart.current = null;
  };

  if (!panels.length) return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:54}}>🎌</div>
      <div style={{color:"rgba(255,255,255,.6)",fontSize:17}}>No panels generated yet for this episode.</div>
      <button onClick={onClose} style={{marginTop:16,padding:"8px 24px",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,color:"#fff",cursor:"pointer"}}>Close</button>
    </div>
  );

  // PAYWALL gate
  if (!isFree) return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#0d0d14,#1a0d2e)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,padding:40}}>
      <div style={{fontSize:54}}>🔒</div>
      <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:32,color:ACC,textAlign:"center"}}>{ep.title}</div>
      <div style={{fontSize:17,color:"rgba(255,255,255,.5)",textAlign:"center",maxWidth:320}}>
        This episode requires a subscription to {proj?.name || "this series"}.
      </div>
      <button style={{padding:"12px 36px",background:ACC,color:"#000",border:"none",borderRadius:10,fontSize:18,fontWeight:700,cursor:"pointer"}}
        onClick={()=>alert("Subscribe flow — connect Stripe in Website settings")}>
        Subscribe · ${proj?.price_monthly || "4.99"}/mo
      </button>
      <button onClick={onClose} style={{fontSize:15,color:"rgba(255,255,255,.3)",background:"none",border:"none",cursor:"pointer"}}>← Back</button>
    </div>
  );

  return (
    <div
      style={{position:"fixed",inset:0,background:"#000",zIndex:9999,userSelect:"none"}}
      onClick={e=>{ if(e.target===e.currentTarget){ resetUITimer(); goNext(); }}}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      {/* ── PANEL CONTENT */}
      <div style={{
        position:"absolute",inset:0,
        transform: flipping
          ? `perspective(1200px) rotateY(${flipDir==="next"?"-12deg":"12deg"}) scale(.96)`
          : "none",
        transition: flipping ? "none" : "transform .28s cubic-bezier(.4,0,.2,1)",
        transformOrigin: flipDir==="next" ? "left center" : "right center",
      }}>
        {/* Background image — contain keeps full 9:16 portrait visible */}
        {imgUrl && imgUrl !== "loading" && !imgUrl.startsWith("error:") ? (
          <>
            <div style={{position:"absolute",inset:0,background:"#000",zIndex:0}}/>
            {/* Blurred background fill for letterbox areas */}
            <img src={imgUrl} alt="" style={{position:"absolute",inset:"-20px",width:"calc(100% + 40px)",height:"calc(100% + 40px)",objectFit:"cover",zIndex:1,filter:"blur(28px) brightness(.35)",transform:"scale(1.05)"}}/>
            {/* Full image — centered, no cropping */}
            <img src={imgUrl} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",objectPosition:"center center",zIndex:2}}/>
          </>
        ) : (
          <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 80% 60% at 50% 40%, ${d.color}22 0%, transparent 60%), linear-gradient(180deg, #050508 0%, #0d0d18 100%)`}}/>
        )}

        {/* Vignettes */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,.5) 0%,transparent 25%,transparent 65%,rgba(0,0,0,.9) 100%)"}}/>

        {/* Panel type indicator */}
        <div style={{position:"absolute",top:0,left:0,right:0,padding:"env(safe-area-inset-top,16px) 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",zIndex:10}}>
          <div style={{fontSize:12,color:d.color,background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",padding:"3px 10px",borderRadius:20,fontFamily:"JetBrains Mono,monospace",letterSpacing:"1px",fontWeight:700}}>
            {d.icon} {d.label}
          </div>
          {chars.length > 0 && (
            <div style={{display:"flex",gap:4}}>
              {chars.map(c=>(
                <div key={c.id} style={{fontSize:12,color:c.color||"#aaa",background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",padding:"3px 8px",borderRadius:20,fontFamily:"JetBrains Mono,monospace"}}>
                  {c.name.split(" ")[0]}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Narration — anime game top serif band, below controls bar */}
        {panel?.narration && (
          <div style={{position:"absolute",top:0,left:0,right:0,zIndex:15,pointerEvents:"none"}}>
            <div style={{
              background:"linear-gradient(180deg, rgba(2,2,8,.97) 0%, rgba(2,2,8,.88) 70%, transparent 100%)",
              backdropFilter:"blur(8px)",
              padding:"56px 20px 18px", // 56px top clears the controls bar + safe area
            }}>
              <div style={{
                fontFamily:"'Georgia','Noto Serif JP',serif",
                fontSize:"clamp(13px,4vw,17px)",
                color:"rgba(228,228,248,.93)",lineHeight:1.8,fontStyle:"italic",
                letterSpacing:"0.3px",
                textShadow:"0 1px 6px rgba(0,0,0,.99)",
                maxHeight:"30vh", overflow:"hidden",
              }}>
                {panel.narration}
              </div>
            </div>
          </div>
        )}

        {/* ── Dialogue box — full-width anime game bottom caption */}
        {panel?.dialogue && (
          <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:15}}>
            {/* Speaker name tab */}
            {panel.speaker && (
              <div style={{paddingLeft:16, marginBottom:-2}}>
                <div style={{
                  display:"inline-flex", alignItems:"center",
                  background:`linear-gradient(90deg, ${d.color}f2, ${d.color}d0)`,
                  padding:"5px 20px 6px 12px",
                  borderRadius:"7px 7px 0 0",
                  clipPath:"polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)",
                }}>
                  <span style={{
                    fontSize:"clamp(11px,3.5vw,14px)",color:"rgba(0,0,0,.92)",fontWeight:800,
                    letterSpacing:"2px",textTransform:"uppercase",
                    fontFamily:"'JetBrains Mono',monospace",
                  }}>{panel.speaker.split(" ")[0]}</span>
                </div>
              </div>
            )}
            <div style={{
              background:"rgba(2,2,10,.97)",
              backdropFilter:"blur(16px)",
              borderTop:`2px solid ${d.color}70`,
              padding:`14px 20px calc(env(safe-area-inset-bottom, 0px) + 70px)`,
            }}>
              <div style={{
                fontFamily:"'Georgia','Noto Serif JP',serif",
                fontSize:"clamp(14px,4.2vw,20px)",
                color:"rgba(242,242,255,.98)",lineHeight:1.75,letterSpacing:"0.2px",
                textShadow:"0 1px 4px rgba(0,0,0,.99)",
              }}>
                {panel.dialogue}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:10}}>
                {[0.3,0.55,0.85].map((o,i)=>(
                  <div key={i} style={{width:4,height:4,borderRadius:"50%",background:d.color,opacity:o}}/>
                ))}
                <div style={{fontSize:13,color:d.color,marginLeft:2,opacity:0.9}}>▼</div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACGN MONO/title card — centered poem text */}
        {panel?.panelType === "MONO" && !panel.dialogue && panel.narration && (
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10,padding:"0 8%"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,width:"60%",justifyContent:"center"}}>
              <div style={{height:1,flex:1,background:`linear-gradient(90deg,transparent,${ACC}70)`}}/>
              <div style={{width:5,height:5,borderRadius:"50%",background:ACC,opacity:0.7}}/>
              <div style={{height:1,flex:1,background:`linear-gradient(270deg,transparent,${ACC}70)`}}/>
            </div>
            <div style={{
              fontFamily:"'Georgia','Noto Serif JP',serif",
              fontSize:"clamp(18px,5vw,40px)",color:"rgba(240,240,255,.95)",
              textAlign:"center",letterSpacing:"3px",lineHeight:1.6,fontStyle:"italic",
              textShadow:`0 0 30px ${ACC}55, 0 0 60px ${ACC}25, 0 2px 10px rgba(0,0,0,.9)`,
            }}>
              {panel.narration}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:20,width:"60%",justifyContent:"center"}}>
              <div style={{height:1,flex:1,background:`linear-gradient(90deg,transparent,${ACC}70)`}}/>
              <div style={{width:5,height:5,borderRadius:"50%",background:ACC,opacity:0.7}}/>
              <div style={{height:1,flex:1,background:`linear-gradient(270deg,transparent,${ACC}70)`}}/>
            </div>
          </div>
        )}
      </div>

      {/* ── CONTROLS OVERLAY — shows on tap, fades */}
      <div style={{
        position:"absolute",inset:0,zIndex:20,pointerEvents:"none",
        opacity: showUI ? 1 : 0,
        transition:"opacity .4s",
      }}>
        {/* Top bar */}
        <div style={{position:"absolute",top:0,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"env(safe-area-inset-top,12px) 16px 12px",background:"linear-gradient(180deg,rgba(0,0,0,.7) 0%,transparent 100%)",pointerEvents:"auto"}}>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:15,cursor:"pointer"}}>
            ← Back
          </button>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:17,color:"rgba(255,255,255,.8)",textAlign:"center"}}>
            <div>{proj?.name}</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.4)"}}>EP{String(ep.num).padStart(2,"0")} · {ep.title}</div>
          </div>
          <button
            onClick={()=>{setAutoPlay(p=>!p); resetUITimer();}}
            style={{background: autoPlay?"rgba(52,211,153,.2)":"rgba(255,255,255,.1)",backdropFilter:"blur(8px)",border:`1px solid ${autoPlay?"rgba(52,211,153,.4)":"rgba(255,255,255,.2)"}`,borderRadius:8,padding:"7px 14px",color: autoPlay?"#34d399":"#fff",fontSize:15,cursor:"pointer",pointerEvents:"auto"}}
          >
            {autoPlay ? "⏸ Pause" : "▶ Auto"}
          </button>
        </div>

        {/* Left / Right tap zones with arrows */}
        <div style={{position:"absolute",left:0,top:"15%",bottom:"15%",width:"20%",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"auto",cursor:idx>0?"pointer":"default"}} onClick={e=>{e.stopPropagation();goPrev();}}>
          {idx > 0 && <div style={{fontSize:32,color:"rgba(255,255,255,.3)"}}>‹</div>}
        </div>
        <div style={{position:"absolute",right:0,top:"15%",bottom:"15%",width:"20%",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"auto",cursor:idx<panels.length-1?"pointer":"default"}} onClick={e=>{e.stopPropagation();goNext();}}>
          {idx < panels.length-1 && <div style={{fontSize:32,color:"rgba(255,255,255,.3)"}}>›</div>}
        </div>

        {/* Bottom bar — progress + thumbnails — sits ABOVE dialogue box */}
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,
          paddingBottom:`calc(env(safe-area-inset-bottom, 0px) + ${panel?.dialogue ? "140px" : "8px"})`,
          background:"none",pointerEvents:"auto"
        }}>
          {/* Progress bar */}
          <div style={{height:2,background:"rgba(255,255,255,.12)",margin:"0 16px 8px"}}>
            <div style={{height:"100%",background:ACC,width:`${((idx+1)/panels.length)*100}%`,transition:"width .3s",borderRadius:1}}/>
          </div>
          {/* Panel strip */}
          <div style={{display:"flex",gap:4,padding:"0 12px 4px",overflowX:"auto",scrollbarWidth:"none"}}>
            {panels.map((p,i)=>(
              <button key={p.id} onClick={()=>goTo(i, i>idx?"next":"prev")} style={{
                flexShrink:0,width:36,height:52,borderRadius:4,border:`2px solid ${i===idx?ACC:"transparent"}`,
                overflow:"hidden",cursor:"pointer",background:"rgba(255,255,255,.08)",padding:0,
              }}>
                {images[p.id] && images[p.id]!=="loading" && !images[p.id].startsWith("error:") ? (
                  <img src={images[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                ) : (
                  <div style={{width:"100%",height:"100%",background:(VN_PANEL_TYPES[p.panelType]||VN_PANEL_TYPES.BG).color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,255,255,.3)"}}>
                    {i+1}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,.3)",paddingBottom:8,fontFamily:"JetBrains Mono,monospace"}}>
            {idx+1} / {panels.length} · tap sides to flip · swipe or use arrow keys
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewerSite({ state, onClose }) {
  const proj  = state.projects.find(p=>p.id===state.activeProject);
  const eps   = state.episodes.filter(e=>e.project===state.activeProject).sort((a,b)=>a.num-b.num);
  const theme = getProjectTheme(proj);
  const cfg   = proj?.website_config || {};

  const isDark = theme.mode !== "editorial";
  const T1 = theme.textPrimary    || (isDark ? "#f0f0f8" : "#1a1a1a");
  const T2 = theme.textSecondary  || (isDark ? "rgba(200,200,220,.75)" : "#4a4a4a");
  const T3 = theme.textMuted      || (isDark ? "rgba(150,150,180,.5)" : "#8a8a8a");
  const BG = theme.bg;
  const SRF = theme.surface;
  const CARD = theme.epCardBg;
  const ACC = theme.accent;

  // ── Load all VN images from IndexedDB on mount (in case state hasn't hydrated yet)
  // allImages: { [epId]: { [panelId]: dataUrl } }
  const [allImages, setAllImages] = useState(() => {
    // Seed from current state immediately
    const seed = {};
    for (const ep of eps) {
      if (ep.vnImages && Object.keys(ep.vnImages).length > 0) seed[ep.id] = ep.vnImages;
    }
    return seed;
  });
  useEffect(() => {
    (async () => {
      try {
        const all = await idbLoadPrefix("vni:");
        if (!Object.keys(all).length) return;
        const byEp = {};
        for (const [key, dataUrl] of Object.entries(all)) {
          const parts = key.split(":");
          const epId = parts[1], panelId = parts[2];
          if (!epId || !panelId || !dataUrl) continue;
          if (!byEp[epId]) byEp[epId] = {};
          byEp[epId][panelId] = dataUrl;
        }
        setAllImages(prev => {
          const merged = { ...prev };
          for (const [epId, imgs] of Object.entries(byEp)) {
            merged[epId] = { ...(merged[epId]||{}), ...imgs };
          }
          return merged;
        });
      } catch(e) { /* IDB not available */ }
    })();
  }, []);

  // Helper: get first good image for an episode
  const getFirstImg = (ep) => {
    const imgs = allImages[ep.id] || ep.vnImages || {};
    if (!ep.vnPanels?.length) return null;
    for (const p of ep.vnPanels) {
      const url = imgs[p.id];
      if (url && url !== "loading" && !url.startsWith("error:")) return url;
    }
    return null;
  };

  // Helper: get all good images for an episode
  const getEpImages = (ep) => {
    const imgs = allImages[ep.id] || ep.vnImages || {};
    return (ep.vnPanels||[])
      .map(p => ({ panel: p, url: imgs[p.id] }))
      .filter(x => x.url && x.url !== "loading" && !x.url.startsWith("error:"));
  };

  const [page, setPage]       = useState("home");
  const [selEp, setSelEp]     = useState(null);
  const [epMode, setEpMode]   = useState(null);  // null | "video" | "novel" — lifted out of EpisodePage so it survives re-renders
  const [readingEp, setReadingEp] = useState(null); // ep currently open in VNReader
  const [authStep, setAuthStep]   = useState("choose"); // choose | login | signup | payment
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]     = useState("");
  const [plan, setPlan]     = useState("annual");
  const [subType, setSubType] = useState("global"); // global | project
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasAccess, setHasAccess]   = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  const freeEps     = eps.filter(e=>!e.access || e.access==="free");
  const paidEps     = eps.filter(e=>e.access==="paid");
  const publishedEps = eps.filter(e=>["published","done"].includes(e.status));
  const freeCount   = proj?.free_episodes || freeEps.length || 1;

  // Pricing from project config or defaults
  const prices = {
    global: [
      { id:"monthly",  label:"Monthly",  price:9.99,  period:"/mo",    note:"All series · Cancel anytime" },
      { id:"annual",   label:"Annual",   price:79.99, period:"/yr",    note:"Best value · 2 months free", featured:true },
      { id:"lifetime", label:"Lifetime", price:199,   period:"once",   note:"Every series, forever" },
    ],
    project: [
      { id:"proj_monthly",  label:"Monthly",  price:proj?.price_monthly||4.99,  period:"/mo",    note:`${proj?.name||"This series"} only` },
      { id:"proj_annual",   label:"Annual",   price:proj?.price_annual||39.99,  period:"/yr",    note:"Best value", featured:true },
      { id:"proj_lifetime", label:"Lifetime", price:proj?.price_lifetime||99,   period:"once",   note:"This series forever" },
    ],
  };

  // ── THEME-SPECIFIC DECORATIONS ─────────────────────────────────
  const GridLines = () => theme.gridLines ? (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",opacity:.04}}>
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${i*8.5}%`,top:0,bottom:0,width:"1px",background:ACC}}/>
      ))}
      {[...Array(8)].map((_,i)=>(
        <div key={i} style={{position:"absolute",top:`${i*12.5}%`,left:0,right:0,height:"1px",background:ACC}}/>
      ))}
    </div>
  ) : null;

  const Scanlines = () => theme.scanlines ? (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.15) 2px, rgba(0,0,0,.15) 4px)`,opacity:.4}}/>
  ) : null;

  const Grain = () => theme.grain ? (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",opacity:.025,backgroundImage:NOISE_SVG_URL2,backgroundRepeat:"repeat",backgroundSize:"128px"}}/>
  ) : null;

  // ── NAV ─────────────────────────────────────────────────────────
  const Nav = () => (
    <nav style={{position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 clamp(16px,4vw,48px)",height:60,background:theme.navBg,backdropFilter:"blur(20px)",borderBottom:`1px solid ${isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.1)"}`}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:8,height:8,borderRadius:theme.mode==="cyber"?0:"50%",background:ACC,transform:theme.mode==="cyber"?"rotate(45deg)":"none"}}/>
        <div style={{fontFamily:theme.titleFont,fontSize:21,color:T1,fontWeight:700,letterSpacing:theme.mode==="cyber"?"2px":0}}>{proj?.name||"Drama Studio"}</div>
        {theme.mode==="cyber"&&<span style={{fontSize:13,fontFamily:theme.monoFont,color:ACC,opacity:.6}}>v1.0</span>}
      </div>
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        {[["home","HOME"],["episodes","EPISODES"],["subscribe","SUBSCRIBE"]].map(([p,l])=>(
          <button key={p}
            style={{background:"none",border:"none",color:page===p?ACC:T3,cursor:"pointer",fontSize:theme.mode==="cyber"?10:12,padding:"6px 12px",borderRadius:6,fontFamily:theme.mode==="cyber"?theme.monoFont:theme.bodyFont,letterSpacing:theme.mode==="cyber"?"2px":"0",transition:"color .15s",fontWeight:page===p?600:400}}
            onClick={()=>setPage(p)}>{l}</button>
        ))}
        {isLoggedIn && hasAccess && (
          <div style={{marginLeft:8,fontSize:13,padding:"3px 10px",background:`${ACC}20`,color:ACC,border:`1px solid ${ACC}40`,borderRadius:20,fontFamily:theme.monoFont}}>
            {theme.ornament} SUBSCRIBED
          </div>
        )}
      </div>
      <button style={{background:"none",border:`1px solid ${isDark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)"}`,color:T2,cursor:"pointer",padding:"6px 14px",borderRadius:6,fontSize:14,fontFamily:theme.bodyFont}} onClick={onClose}>
        ✕ Close Preview
      </button>
    </nav>
  );

  // ── HOME PAGE ────────────────────────────────────────────────────
  const HomePage = () => {
    const next = eps.find(e=>e.status!=="published"&&e.status!=="done");
    return (
      <>
      {readingEp && (
        <VNReader ep={{...readingEp, vnImages: {...(allImages[readingEp.id]||{}), ...(readingEp.vnImages||{})}}} proj={proj} bible={state.bible} onClose={()=>setReadingEp(null)} isFree={readingEp.access!=="paid" || hasAccess}/>
      )}
      <div>
        {/* Hero */}
        {(()=>{
          // Find first available VN image from any published episode
          const heroImg = eps.reduce((found, e) => found || getFirstImg(e), null);
          return (
        <div style={{position:"relative",minHeight:"88vh",display:"flex",alignItems:"flex-end",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:theme.heroStyle}}/>
          {heroImg && <img src={heroImg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",opacity:.35,mixBlendMode:"luminosity"}}/>}
          {heroImg && <img src={heroImg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",opacity:.18}}/>}
          <GridLines/><Scanlines/><Grain/>

          {/* Floating accent elements based on mode */}
          {theme.mode==="luxury" && (
            <div style={{position:"absolute",top:"15%",right:"8%",opacity:.06}}>
              <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"30vw",color:ACC,lineHeight:1,fontWeight:300}}>{(proj?.name||"D").charAt(0)}</div>
            </div>
          )}
          {theme.mode==="cyber" && (
            <div style={{position:"absolute",top:0,right:0,width:"50%",height:"100%",overflow:"hidden",opacity:.07}}>
              {[...Array(20)].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:`${i*5}%`,right:0,fontFamily:"JetBrains Mono,monospace",fontSize:12,color:ACC,whiteSpace:"nowrap",letterSpacing:"2px"}}>{`${Math.random().toString(36).substr(2,20)}`.toUpperCase()}</div>
              ))}
            </div>
          )}
          {theme.mode==="epic" && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"5%",opacity:.07,fontSize:"50vw",lineHeight:1,color:ACC,overflow:"hidden"}}>⚔</div>
          )}

          {/* Hero gradient overlay */}
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to top, ${BG} 0%, rgba(0,0,0,.5) 50%, transparent 100%)`}}/>

          <div style={{position:"relative",zIndex:2,padding:"clamp(20px,4vw,64px)",paddingBottom:"clamp(32px,5vw,72px)",maxWidth:780}}>
            {/* Eyebrow */}
            <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20}}>
              <div style={{width:20,height:1,background:ACC}}/>
              <span style={{fontSize:13,fontFamily:theme.monoFont,color:ACC,letterSpacing:"3px",textTransform:"uppercase"}}>{proj?.type||"Drama"} · {eps.length} Episodes</span>
              <div style={{width:20,height:1,background:ACC}}/>
            </div>

            <h1 style={{fontFamily:theme.titleFont,fontSize:"clamp(36px,6vw,80px)",fontWeight:700,color:T1,lineHeight:1.05,marginBottom:20,maxWidth:700}}>
              {proj?.name||"Untitled Series"}
            </h1>

            <p style={{fontSize:"clamp(13px,1.5vw,16px)",color:T2,maxWidth:520,lineHeight:1.75,marginBottom:8,...theme.taglineStyle}}>
              {cfg.tagline || proj?.desc || "An original production."}
            </p>

            {proj?.genre && (
              <div style={{fontSize:14,fontFamily:theme.monoFont,color:T3,marginBottom:32,letterSpacing:"1px"}}>{proj.genre}</div>
            )}

            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {freeEps.length > 0 && (
                <button
                  style={{padding:"14px 28px",background:ACC,color:isDark?"#000":"#fff",border:"none",borderRadius:theme.mode==="cyber"?0:8,fontWeight:700,fontSize:17,cursor:"pointer",letterSpacing:theme.mode==="cyber"?"2px":"0",fontFamily:theme.mode==="cyber"?theme.monoFont:theme.bodyFont,textTransform:theme.mode==="cyber"?"uppercase":"none"}}
                  onClick={()=>{setSelEp(freeEps[0]);setPage("episode");}}>
                  {theme.mode==="cyber"?"PLAY_EP01":theme.mode==="game"?"▶ START":"▶ Watch Free"}
                </button>
              )}
              <button
                style={{padding:"14px 28px",background:`${isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.07)"}`,color:T1,border:`1px solid ${isDark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)"}`,borderRadius:theme.mode==="cyber"?0:8,fontSize:17,cursor:"pointer",fontFamily:theme.bodyFont}}
                onClick={()=>setPage("episodes")}>
                All Episodes
              </button>
            </div>

            {/* Episode count bar */}
            {publishedEps.length > 0 && (
              <div style={{marginTop:28,display:"flex",alignItems:"center",gap:10,fontSize:14,color:T3}}>
                <div style={{display:"flex",gap:3}}>
                  {publishedEps.slice(0,12).map(e=>(
                    <div key={e.id} style={{width:4,height:16,borderRadius:2,background:e.access==="paid"?ACC:`${ACC}40`,transition:"background .2s"}} title={e.title}/>
                  ))}
                  {publishedEps.length>12&&<span style={{fontSize:12,marginLeft:4}}>+{publishedEps.length-12}</span>}
                </div>
                <span>{publishedEps.length} episode{publishedEps.length!==1?"s":""} available · {freeCount} free</span>
              </div>
            )}
          </div>
        </div>
          );
        })()}

        {/* Latest episodes */}
        <div style={{padding:"48px clamp(16px,4vw,48px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
            {theme.mode==="cyber" ? (
              <div style={{fontFamily:theme.monoFont,fontSize:14,color:ACC,letterSpacing:"3px",textTransform:"uppercase"}}>// LATEST_EPISODES</div>
            ) : (
              <>
                <div style={{width:3,height:24,background:ACC,borderRadius:2}}/>
                <h2 style={{fontFamily:theme.titleFont,fontSize:25,color:T1,fontWeight:600}}>Latest Episodes</h2>
              </>
            )}
          </div>

          {publishedEps.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 0",color:T3}}>
              <div style={{fontSize:50,marginBottom:12,opacity:.4}}>{theme.ornament}</div>
              <div style={{fontFamily:theme.titleFont,fontSize:23,marginBottom:8}}>Coming Soon</div>
              <div style={{fontSize:16}}>Episodes are in production. Subscribe for updates.</div>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>
              {publishedEps.slice(0,8).map((ep,i)=>{
                const locked = ep.access==="paid" && !hasAccess;
                // First available VN panel image for this episode
                const firstImg = getFirstImg(ep);
                return (
                  <div key={ep.id}
                    onClick={()=>locked?setPage("subscribe"):(setSelEp(ep),setEpMode(null),setPage("episode"))}
                    style={{background:CARD,borderRadius:theme.mode==="cyber"?0:10,border:`1px solid ${isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.09)"}`,cursor:"pointer",overflow:"hidden",transition:"transform .2s,box-shadow .2s,border-color .2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=`${ACC}50`;e.currentTarget.style.boxShadow=`0 12px 40px rgba(0,0,0,.5)`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="";e.currentTarget.style.boxShadow="";}}
                  >
                    <div style={{height:160,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${ACC}12,${ACC}04)`}}>
                      {firstImg
                        ? <img src={firstImg} alt={ep.title} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
                        : <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:40,opacity:.3}}>{theme.ornament==="▶"?"▶":i%3===0?"◈":i%3===1?"◉":"◎"}</span></div>
                      }
                      {firstImg && <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%)"}}/>}
                      {locked && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:27}}>🔒</span></div>}
                      {theme.mode==="cyber" && <div style={{position:"absolute",top:6,left:8,fontFamily:"JetBrains Mono,monospace",fontSize:12,color:ACC,letterSpacing:"2px",zIndex:2}}>EP_{String(ep.num).padStart(3,"0")}</div>}
                    </div>
                    <div style={{padding:"12px 14px"}}>
                      <div style={{fontSize:12,fontFamily:theme.monoFont,color:ACC,marginBottom:4,letterSpacing:"1px"}}>EP{String(ep.num).padStart(2,"0")}</div>
                      <div style={{fontFamily:theme.titleFont,fontSize:18,color:T1,lineHeight:1.3,marginBottom:6}}>{ep.title}</div>
                      {ep.notes && <div style={{fontSize:14,color:T3,lineHeight:1.5,marginBottom:6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ep.notes}</div>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          {ep.access==="paid"
                            ? <span style={{fontSize:12,padding:"2px 7px",background:`${ACC}20`,color:ACC,borderRadius:20}}>
                                {ep.price_model==="per_ep" ? `$${ep.price_per_ep||"4.99"}` : "PREMIUM"}
                              </span>
                            : <span style={{fontSize:12,padding:"2px 7px",background:"rgba(74,222,128,.1)",color:"#4ade80",borderRadius:20}}>FREE</span>}
                          {ep.vnPanels?.length > 0 && <span style={{fontSize:12,padding:"2px 7px",background:"rgba(148,100,200,.12)",color:"#c49eff",borderRadius:20}}>🎌 {ep.vnPanels.length}p</span>}
                        </div>
                        {ep.vnPanels?.length > 0 && !locked && (
                          <button
                            onClick={e=>{e.stopPropagation(); setReadingEp(ep);}}
                            style={{fontSize:13,padding:"4px 12px",background:`${ACC}20`,color:ACC,border:`1px solid ${ACC}40`,borderRadius:20,cursor:"pointer",fontWeight:700}}>
                            ▶ Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next episode announcement */}
        {(() => {
          const next = eps.find(e=>e.status!=="published"&&e.status!=="done"&&e.num>0);
          if (!next || !proj?.next_release_date) return null;
          return (
            <div style={{padding:"0 clamp(16px,4vw,48px) 48px"}}>
              <div style={{background:`linear-gradient(135deg,${ACC}10,${ACC}04)`,border:`1px solid ${ACC}30`,borderRadius:12,padding:"24px 28px",display:"flex",alignItems:"center",gap:20}}>
                <div style={{width:48,height:48,borderRadius:theme.mode==="cyber"?0:10,background:`${ACC}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:25}}>📅</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontFamily:theme.monoFont,color:ACC,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>Next Episode</div>
                  <div style={{fontFamily:theme.titleFont,fontSize:21,color:T1,marginBottom:4}}>EP{String(next.num).padStart(2,"0")} — {next.title}</div>
                  <div style={{fontSize:15,color:T3}}>Releases {new Date(proj.next_release_date).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
                </div>
                <button style={{padding:"10px 20px",background:ACC,color:isDark?"#000":"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:15,cursor:"pointer"}} onClick={()=>setPage("subscribe")}>
                  Get Notified
                </button>
              </div>
            </div>
          );
        })()}

        {/* Subscribe CTA (if no access) */}
        {!hasAccess && (
          <div style={{padding:"0 clamp(16px,4vw,48px) 64px"}}>
            <div style={{background:`linear-gradient(135deg,${ACC}10,${ACC}03)`,border:`1px solid ${ACC}35`,borderRadius:16,padding:"clamp(24px,4vw,48px)",textAlign:"center"}}>
              <div style={{fontFamily:theme.titleFont,fontSize:"clamp(24px,4vw,40px)",color:T1,marginBottom:10,fontWeight:700}}>Unlock Every Episode</div>
              <div style={{fontSize:18,color:T2,maxWidth:440,margin:"0 auto 32px",lineHeight:1.7}}>
                One account. Access to <strong style={{color:ACC}}>every series</strong> on the platform — or subscribe per-series. Cancel anytime.
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
                {prices.global.map(p=>(
                  <div key={p.id}
                    onClick={()=>setPlan(p.id)}
                    style={{padding:"16px 20px",background:plan===p.id?`${ACC}15`:SRF,border:`1px solid ${plan===p.id?ACC:isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.12)"}`,borderRadius:12,cursor:"pointer",minWidth:130,transition:"all .2s"}}>
                    {p.featured&&<div style={{fontSize:12,color:ACC,fontFamily:theme.monoFont,letterSpacing:"2px",marginBottom:6}}>BEST VALUE</div>}
                    <div style={{fontFamily:theme.titleFont,fontSize:27,color:T1,fontWeight:700}}>${p.price}</div>
                    <div style={{fontSize:14,color:T3,marginBottom:4}}>{p.period}</div>
                    <div style={{fontSize:15,color:T1,fontWeight:600}}>{p.label}</div>
                    <div style={{fontSize:14,color:T3,marginTop:3}}>{p.note}</div>
                  </div>
                ))}
              </div>
              <button
                style={{padding:"15px 36px",background:ACC,color:isDark?"#000":"#fff",border:"none",borderRadius:theme.mode==="cyber"?0:8,fontWeight:700,fontSize:18,cursor:"pointer",fontFamily:theme.bodyFont}}
                onClick={()=>setPage("subscribe")}>
                Subscribe Now →
              </button>
            </div>
          </div>
        )}
      </div>
      </>
    );
  };

  // ── EPISODES PAGE ─────────────────────────────────────────────────
  const EpisodesPage = () => (
    <div style={{padding:"48px clamp(16px,4vw,48px)"}}>
      <div style={{marginBottom:32}}>
        <h2 style={{fontFamily:theme.titleFont,fontSize:40,color:T1,marginBottom:8}}>{proj?.name}</h2>
        <div style={{fontSize:16,color:T3,display:"flex",gap:16}}>
          <span>{eps.length} episodes</span>
          <span>{freeCount} free</span>
          <span>{paidEps.length} premium</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
        {eps.map((ep,i)=>{
          const locked = ep.access==="paid" && !hasAccess;
          const isPublished = ["published","done"].includes(ep.status);
          const firstImg = getFirstImg(ep);
          return (
            <div key={ep.id}
              onClick={()=>locked?setPage("subscribe"):isPublished?(setSelEp(ep),setEpMode(null),setPage("episode")):null}
              style={{background:CARD,borderRadius:theme.mode==="cyber"?0:10,border:`1px solid ${isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.09)"}`,cursor:isPublished||locked?"pointer":"default",overflow:"hidden",opacity:isPublished?1:.4,transition:"all .2s"}}
              onMouseEnter={e=>{if(isPublished){e.currentTarget.style.borderColor=`${ACC}50`;e.currentTarget.style.transform="translateY(-3px)";}}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="";e.currentTarget.style.transform="";}}>
              <div style={{height:150,background:`linear-gradient(135deg,${ACC}${locked?"08":"10"},${ACC}03)`,position:"relative",overflow:"hidden"}}>
                {firstImg && isPublished && !locked && <img src={firstImg} alt={ep.title} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>}
                {firstImg && isPublished && !locked && <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)"}}/>}
                {!firstImg && <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>{!isPublished ? <span style={{fontSize:13,fontFamily:theme.monoFont,color:T3,letterSpacing:"2px"}}>COMING SOON</span> : !locked && <span style={{fontSize:32,opacity:.5}}>▶</span>}</div>}
                {locked && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(2px)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:25}}>🔒</span></div>}
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <span style={{fontSize:12,fontFamily:theme.monoFont,color:ACC,letterSpacing:"1px"}}>EP{String(ep.num).padStart(2,"0")}</span>
                  {ep.access==="paid"
                    ? <span style={{fontSize:12,padding:"2px 6px",background:`${ACC}20`,color:ACC,borderRadius:20}}>PREMIUM</span>
                    : <span style={{fontSize:12,padding:"2px 6px",background:"rgba(74,222,128,.1)",color:"#4ade80",borderRadius:20}}>FREE</span>}
                </div>
                <div style={{fontFamily:theme.titleFont,fontSize:18,color:locked?T3:T1,lineHeight:1.3}}>{ep.title}</div>
                {ep.notes && <div style={{fontSize:14,color:T3,marginTop:5,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ep.notes}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── EPISODE PLAYER ────────────────────────────────────────────────
  const EpisodePage = () => {
    const ep = selEp;
    if (!ep) return null;
    const locked     = ep.access === "paid" && !hasAccess;
    const segs       = ep.segments || [];
    const done       = segs.filter(s => s.status === "done");
    const totalDur   = segs.reduce((a, s) => a + (s.dur || 0), 0);
    const others     = eps.filter(e => e.id !== ep.id && ["published","done"].includes(e.status)).slice(0, 4);
    const hasVN      = (ep.vnPanels?.length || 0) > 0;
    const hasVideo   = done.length > 0;
    const vnImgCount = Object.keys(allImages[ep?.id] || ep?.vnImages || {}).length;

    // Mode: null = choose, "video" = video player, "novel" = vn reader
    // mode is lifted to ViewerSite scope as epMode so it survives re-renders
    const mode    = epMode;
    const setMode = setEpMode;

    // If novel mode — open VNReader overlay
    if (mode === "novel") {
      return (
        <VNReader
          ep={{...ep, vnImages: {...(allImages[ep.id]||{}), ...(ep.vnImages||{})}}}
          proj={proj}
          bible={state.bible}
          onClose={() => setEpMode(null)}
          isFree={!locked}
        />
      );
    }

    return (
      <div style={{padding:"32px clamp(16px,4vw,48px)",maxWidth:1100,margin:"0 auto"}}>
        {/* Back */}
        <button
          style={{background:"none",border:"none",color:T3,cursor:"pointer",fontSize:15,marginBottom:28,display:"flex",alignItems:"center",gap:6,padding:0,fontFamily:theme.bodyFont,transition:"color .15s"}}
          onMouseEnter={e=>e.currentTarget.style.color=T2}
          onMouseLeave={e=>e.currentTarget.style.color=T3}
          onClick={() => { setEpMode(null); setPage("episodes"); }}
        >← Back to Episodes</button>

        {/* Episode header */}
        <div style={{marginBottom:32}}>
          <div style={{fontFamily:theme.monoFont,fontSize:13,color:ACC,letterSpacing:"2px",marginBottom:8}}>
            EP{String(ep.num).padStart(2,"0")} {ep.access==="paid" ? "· PREMIUM" : "· FREE"}
          </div>
          <h1 style={{fontFamily:theme.titleFont,fontSize:"clamp(26px,4vw,48px)",color:T1,marginBottom:12,lineHeight:1.1}}>{ep.title}</h1>
          {ep.notes && <p style={{fontSize:18,color:T2,lineHeight:1.7,maxWidth:680,margin:0}}>{ep.notes}</p>}
        </div>

        {locked ? (
          /* ── LOCKED STATE */
          <div style={{textAlign:"center",padding:"64px 32px",background:`${ACC}08`,border:`1px solid ${ACC}30`,borderRadius:16,maxWidth:480,margin:"0 auto"}}>
            <div style={{fontSize:54,marginBottom:16}}>🔒</div>
            <div style={{fontFamily:theme.titleFont,fontSize:32,color:ACC,marginBottom:8}}>Premium Episode</div>
            <div style={{fontSize:17,color:T2,marginBottom:28,lineHeight:1.6}}>Subscribe to unlock all premium episodes{hasVN?" including the visual novel version":""}.</div>
            <button style={{padding:"13px 36px",background:ACC,color:isDark?"#000":"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:18,cursor:"pointer"}} onClick={()=>setPage("subscribe")}>
              Subscribe to Watch
            </button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:`1fr ${others.length>0?"320px":""}`,gap:40,alignItems:"start"}}>
            <div>
              {/* ── FORMAT CHOOSER — show when ep has both video and VN */}
              {(hasVN || hasVideo) && mode === null && (
                <div style={{marginBottom:32}}>
                  <div style={{fontSize:14,color:T3,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:16,fontFamily:theme.monoFont}}>Choose how to experience this episode</div>
                  <div style={{display:"grid",gridTemplateColumns:`repeat(${hasVN&&hasVideo?2:1},1fr)`,gap:12}}>

                    {/* Watch Video card */}
                    {(hasVideo || segs.length > 0) && (
                      <div
                        onClick={() => setMode("video")}
                        style={{
                          cursor:"pointer",borderRadius:14,border:`1px solid ${ACC}30`,
                          background:`linear-gradient(135deg,${ACC}08,${ACC}03)`,
                          padding:"28px 24px",transition:"all .2s",position:"relative",overflow:"hidden",
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=ACC;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 32px ${ACC}20`;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=`${ACC}30`;e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
                      >
                        <div style={{fontSize:40,marginBottom:12}}>🎬</div>
                        <div style={{fontFamily:theme.titleFont,fontSize:25,color:T1,marginBottom:6}}>Watch</div>
                        <div style={{fontSize:16,color:T2,lineHeight:1.5,marginBottom:16}}>
                          Short-form video series. {done.length} clip{done.length!==1?"s":""}{totalDur>0?` · ~${totalDur}s total`:""}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:15,color:ACC,fontWeight:600}}>
                          Watch now
                          <span style={{fontSize:19}}>→</span>
                        </div>
                        {done.length === 0 && (
                          <div style={{position:"absolute",top:12,right:12,fontSize:12,padding:"2px 8px",background:"rgba(255,200,0,.1)",color:"rgba(255,200,0,.8)",borderRadius:20,fontFamily:theme.monoFont}}>GENERATING</div>
                        )}
                      </div>
                    )}

                    {/* Read Visual Novel card */}
                    {hasVN && (()=>{
                      const epImgs = getEpImages(ep);
                      const firstImg = epImgs[0]?.url || null;
                      const imgPanels = epImgs.map(x=>x.panel);
                      return (
                      <div
                        onClick={() => setMode("novel")}
                        style={{cursor:"pointer",borderRadius:14,border:"1px solid rgba(148,100,200,.3)",background:"linear-gradient(135deg,rgba(148,100,200,.08),rgba(148,100,200,.03))",overflow:"hidden",transition:"all .2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(148,100,200,.7)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(148,100,200,.2)";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(148,100,200,.3)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
                      >
                        {firstImg ? (
                          <div style={{position:"relative",height:280,overflow:"hidden"}}>
                            <img src={firstImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}}/>
                            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 55%)"}}/>
                            {imgPanels.length > 1 && (
                              <div style={{position:"absolute",bottom:12,right:12,display:"flex",gap:4}}>
                                {imgPanels.slice(1,4).map(p=>(
                                  <div key={p.id} style={{width:44,height:62,borderRadius:4,overflow:"hidden",border:"1px solid rgba(255,255,255,.2)"}}>
                                    <img src={(allImages[ep.id]||ep.vnImages||{})[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{position:"absolute",bottom:14,left:16,display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontSize:22}}>🎌</span>
                              <span style={{fontFamily:theme.titleFont,fontSize:19,color:"#fff",fontWeight:700}}>Visual Novel</span>
                              <span style={{fontSize:13,color:"rgba(196,158,255,.9)",fontFamily:theme.monoFont}}>{ep.vnPanels.length}p</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{height:100,display:"flex",alignItems:"center",gap:14,padding:"0 24px"}}>
                            <span style={{fontSize:36}}>📖</span>
                            <div>
                              <div style={{fontFamily:theme.titleFont,fontSize:21,color:T1}}>Visual Novel</div>
                              <div style={{fontSize:14,color:T3}}>{ep.vnPanels.length} panels · No images yet</div>
                            </div>
                          </div>
                        )}
                        <div style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{fontSize:15,color:T2}}>{ep.vnPanels.length} panel{ep.vnPanels.length!==1?"s":""}{vnImgCount>0?` · ${vnImgCount} illustrated`:""}</div>
                          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:15,color:"#c49eff",fontWeight:700}}>Read now <span style={{fontSize:19}}>→</span></div>
                        </div>
                      </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── VIDEO PLAYER MODE */}
              {mode === "video" && (
                <div>
                  <button
                    style={{background:"none",border:"none",color:T3,cursor:"pointer",fontSize:15,marginBottom:20,display:"flex",alignItems:"center",gap:5,padding:0,fontFamily:theme.bodyFont}}
                    onClick={() => setMode(null)}
                  >← {hasVN ? "Back to choices" : "Back"}</button>
                  <div style={{background:"#000",borderRadius:theme.mode==="cyber"?0:14,overflow:"hidden",marginBottom:24,aspectRatio:"9/16",maxWidth:380,border:`1px solid ${ACC}20`,boxShadow:`0 20px 60px rgba(0,0,0,.5)`}}>
                    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:theme.heroStyle,position:"relative"}}>
                      <GridLines/><Scanlines/>
                      <div style={{fontSize:64,opacity:.4}}>▶</div>
                      <div style={{fontFamily:theme.titleFont,fontSize:21,color:T1,marginTop:10,padding:"0 20px",textAlign:"center"}}>{ep.title}</div>
                      <div style={{fontSize:13,fontFamily:theme.monoFont,color:ACC,marginTop:8,letterSpacing:"1px"}}>
                        {done.length}/{segs.length} clips · {totalDur}s
                      </div>
                      {done.length===0 && <div style={{fontSize:13,color:T3,marginTop:4,fontFamily:theme.monoFont}}>Still generating…</div>}
                    </div>
                  </div>
                  <div style={{fontFamily:theme.monoFont,fontSize:13,color:T3,letterSpacing:"1px",marginBottom:8}}>{done.length} OF {segs.length} CLIPS READY</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {segs.map((s,i)=>(
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:SRF,borderRadius:8,border:`1px solid ${s.status==="done"?`${ACC}30`:"rgba(255,255,255,.05)"}`}}>
                        <div style={{width:24,height:24,borderRadius:"50%",background:s.status==="done"?`${ACC}20`:"rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,color:s.status==="done"?ACC:T3,fontFamily:theme.monoFont,fontWeight:700}}>{i+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:16,color:s.status==="done"?T1:T3,fontFamily:theme.bodyFont,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title||`Segment ${i+1}`}</div>
                          {s.dur>0&&<div style={{fontSize:13,color:T3,fontFamily:theme.monoFont}}>{s.dur}s</div>}
                        </div>
                        <div style={{fontSize:13,color:s.status==="done"?ACC:T3,fontFamily:theme.monoFont}}>{s.status==="done"?"▶":"…"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FALLBACK: no content yet */}
              {!hasVN && !hasVideo && segs.length === 0 && (
                <div style={{textAlign:"center",padding:"48px 32px",border:`1px dashed ${ACC}20`,borderRadius:12,color:T3}}>
                  <div style={{fontSize:40,marginBottom:12,opacity:.3}}>📽</div>
                  <div style={{fontSize:17}}>Content is being prepared for this episode.</div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR: related episodes */}
            {others.length > 0 && (
              <div style={{paddingTop:4}}>
                <div style={{fontSize:13,fontFamily:theme.monoFont,color:T3,letterSpacing:"2px",marginBottom:14}}>MORE EPISODES</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {others.map(e => {
                    const eLocked = e.access==="paid" && !hasAccess;
                    const eHasVN  = (e.vnPanels?.length||0)>0;
                    return (
                      <div
                        key={e.id}
                        style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,border:`1px solid rgba(255,255,255,.05)`,cursor:"pointer",transition:"all .15s",background:"transparent"}}
                        onClick={() => { setSelEp(e); setEpMode(null); setPage("episode"); }}
                        onMouseEnter={ev=>{ev.currentTarget.style.background=SRF;ev.currentTarget.style.borderColor=`${ACC}30`;}}
                        onMouseLeave={ev=>{ev.currentTarget.style.background="transparent";ev.currentTarget.style.borderColor="rgba(255,255,255,.05)";}}
                      >
                        <div style={{width:56,height:56,borderRadius:8,background:`${ACC}10`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:23,opacity:.5}}>
                          {eLocked?"🔒":eHasVN?"🎌":"▶"}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontFamily:theme.monoFont,color:ACC,marginBottom:3}}>EP{String(e.num).padStart(2,"0")}</div>
                          <div style={{fontSize:16,color:T1,fontFamily:theme.titleFont,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                          <div style={{display:"flex",gap:5,marginTop:4}}>
                            {eHasVN&&<span style={{fontSize:12,padding:"1px 5px",background:"rgba(148,100,200,.12)",color:"#c49eff",borderRadius:10}}>VN</span>}
                            {e.access==="paid"&&<span style={{fontSize:12,padding:"1px 5px",background:`${ACC}15`,color:ACC,borderRadius:10}}>PREMIUM</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  const SubscribePage = () => {
    const activePlans = prices[subType];
    return (
      <div style={{padding:"48px clamp(16px,4vw,48px)",maxWidth:640,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:13,fontFamily:theme.monoFont,color:ACC,letterSpacing:"3px",marginBottom:12}}>JOIN NOW</div>
          <h2 style={{fontFamily:theme.titleFont,fontSize:"clamp(28px,4vw,46px)",color:T1,marginBottom:12,fontWeight:700}}>Start Watching</h2>
          <p style={{fontSize:17,color:T2,lineHeight:1.7}}>One account unlocks every series. Register once, access everything.</p>
        </div>

        {/* Subscription type toggle */}
        {proj?.global_pass !== false && proj?.per_project_pass !== false && (
          <div style={{display:"flex",gap:0,border:`1px solid ${isDark?"rgba(255,255,255,.15)":"rgba(0,0,0,.15)"}`,borderRadius:8,overflow:"hidden",marginBottom:28}}>
            {[["global","All Series Pass"],["project",`${proj?.name||"This Series"} Only`]].map(([t,l])=>(
              <button key={t} onClick={()=>setSubType(t)}
                style={{flex:1,padding:"10px",background:subType===t?`${ACC}15`:"transparent",border:"none",color:subType===t?ACC:T3,fontSize:15,cursor:"pointer",transition:"all .15s",fontFamily:theme.bodyFont}}>
                {l}
              </button>
            ))}
          </div>
        )}

        {authStep==="choose" || authStep==="login" || authStep==="signup" ? (
          <div style={{background:SRF,borderRadius:12,padding:28,border:`1px solid ${isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.1)"}`,marginBottom:24}}>
            <div style={{display:"flex",gap:0,border:`1px solid ${isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.12)"}`,borderRadius:7,overflow:"hidden",marginBottom:20}}>
              {[["login","Sign In"],["signup","Create Account"]].map(([t,l])=>(
                <button key={t} onClick={()=>setAuthStep(t)}
                  style={{flex:1,padding:"9px",background:authStep===t?`${ACC}20`:"transparent",border:"none",color:authStep===t?ACC:T3,fontSize:15,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>
            {authStep==="signup"&&<div className="fg" style={{marginBottom:10}}><label className="fl">Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} placeholder="Display name"/></div>}
            <div className="fg" style={{marginBottom:10}}><label className="fl">Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/></div>
            <div className="fg" style={{marginBottom:18}}><label className="fl">Password</label><input className="fi" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></div>
            <button
              style={{width:"100%",padding:"13px",background:ACC,color:isDark?"#000":"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:17,cursor:"pointer"}}
              onClick={()=>{setIsLoggedIn(true);setAuthStep("payment");}}>
              Continue →
            </button>
          </div>
        ) : (
          <>
            {/* Plan selector */}
            <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
              {activePlans.map(p=>(
                <div key={p.id} onClick={()=>setPlan(p.id)}
                  style={{flex:1,minWidth:140,padding:"16px",background:plan===p.id?`${ACC}15`:SRF,border:`1px solid ${plan===p.id?ACC:isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.12)"}`,borderRadius:12,cursor:"pointer",transition:"all .2s",textAlign:"center"}}>
                  {p.featured&&<div style={{fontSize:12,color:ACC,fontFamily:theme.monoFont,letterSpacing:"2px",marginBottom:6}}>BEST VALUE</div>}
                  <div style={{fontFamily:theme.titleFont,fontSize:29,color:T1,fontWeight:700}}>${p.price}</div>
                  <div style={{fontSize:14,color:T3,marginBottom:4}}>{p.period}</div>
                  <div style={{fontSize:16,color:T1,fontWeight:600,marginBottom:3}}>{p.label}</div>
                  <div style={{fontSize:14,color:T3}}>{p.note}</div>
                </div>
              ))}
            </div>

            <button
              style={{width:"100%",padding:"15px",background:ACC,color:isDark?"#000":"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:18,cursor:"pointer",marginBottom:10}}
              onClick={()=>{setHasAccess(true);setPage("episodes");}}>
              {stripeLoading?"Processing…":"Pay with Stripe →"}
            </button>
            <div style={{textAlign:"center",fontSize:14,color:T3}}>Secure payment · Cancel anytime · Powered by Stripe</div>
          </>
        )}
      </div>
    );
  };

  // ── CSS ──────────────────────────────────────────────────────────
  const siteCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .vs-card:hover{transform:translateY(-4px)!important;}
  `;

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,overflow:"auto",background:BG}}>
      <style>{siteCSS}</style>
      <div style={{minHeight:"100vh",background:BG,color:T1,fontFamily:theme.bodyFont}}>
        <Nav/>
        <div style={{animation:"fadeUp .4s ease both"}}>
          {page==="home"      && <HomePage/>}
          {page==="episodes"  && <EpisodesPage/>}
          {page==="episode"   && <EpisodePage/>}
          {page==="subscribe" && <SubscribePage/>}
        </div>
      </div>
    </div>
  );
}
function PageWebsite({ state, dispatch }) {
  const proj = state.projects.find(p=>p.id===state.activeProject);
  const eps  = state.episodes.filter(e=>e.project===state.activeProject).sort((a,b)=>a.num-b.num);
  const [showViewer, setShowViewer] = useState(false);
  const [cfg, setCfg] = useState(proj?.website_config||{});
  const [tab, setTab] = useState("design");

  const set = (k,v) => setCfg(c=>({...c,[k]:v}));
  const saveConfig = () => dispatch({ type:"UPDATE_PROJECT", id:proj?.id, patch:{ website_config: cfg } });

  const projSlug = proj?.slug || (proj?.name||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
  const projectUrl = `https://${projSlug}.yourdomain.com`;

  const freeCount = eps.filter(e=>!e.access||e.access==="free").length;
  const paidCount = eps.filter(e=>e.access==="paid").length;

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">Project Website</div>
          <div className="ph-s">{proj?.name} · Viewer-facing site with paywall</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-ghost btn-sm" onClick={()=>setShowViewer(true)}>👁 Preview Site</button>
          <button className="btn btn-gold btn-sm" onClick={saveConfig}>Save Config</button>
        </div>
      </div>

      {/* URL / Deploy status */}
      <div className="callout co-blue" style={{marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:14}}>{projectUrl}</span>
        <span style={{flex:1}}/>
        <button className="btn btn-ghost btn-sm" style={{fontSize:13}}>↗ Open (not yet deployed)</button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {["design","episodes","paywall","analytics"].map(t=>(
          <button key={t} className={`btn btn-sm ${tab===t?"btn-gold":"btn-ghost"}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab==="design"&&(
        <div className="g2">
          <div className="card">
            <div className="card-t" style={{marginBottom:12}}>Brand & Identity</div>
            <div className="fg"><label className="fl">Site Tagline</label><input className="fi" value={cfg.tagline||""} onChange={e=>set("tagline",e.target.value)} placeholder="An original production…"/></div>
            <div className="fg"><label className="fl">About Text</label><textarea className="ft" value={cfg.about||""} onChange={e=>set("about",e.target.value)} placeholder="A longer description for the About section…" style={{minHeight:80,fontFamily:"DM Sans,sans-serif",fontSize:15}}/></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Accent Color</label><input className="fi" type="color" value={cfg.accentColor||proj?.color||"#c9a84c"} onChange={e=>set("accentColor",e.target.value)} style={{padding:"4px 6px",height:38}}/></div>
              <div className="fg"><label className="fl">Font Style</label><select className="fs" value={cfg.fontStyle||"serif"} onChange={e=>set("fontStyle",e.target.value)}><option value="serif">Cormorant (Luxury)</option><option value="modern">DM Sans (Modern)</option><option value="mono">JetBrains (Tech)</option></select></div>
            </div>
            <div className="fg"><label className="fl">Hero Background</label><select className="fs" value={cfg.heroBg||"gradient"} onChange={e=>set("heroBg",e.target.value)}><option value="gradient">Color Gradient</option><option value="dark">Deep Dark</option><option value="image">Custom Image URL</option></select></div>
            {cfg.heroBg==="image"&&<div className="fg"><label className="fl">Image URL</label><input className="fi" value={cfg.heroImageUrl||""} onChange={e=>set("heroImageUrl",e.target.value)} placeholder="https://…"/></div>}
          </div>
          <div className="card">
            <div className="card-t" style={{marginBottom:12}}>Social & SEO</div>
            <div className="fg"><label className="fl">Meta Title</label><input className="fi" value={cfg.metaTitle||proj?.name||""} onChange={e=>set("metaTitle",e.target.value)}/></div>
            <div className="fg"><label className="fl">Meta Description</label><textarea className="ft" value={cfg.metaDesc||""} onChange={e=>set("metaDesc",e.target.value)} style={{minHeight:60,fontFamily:"DM Sans,sans-serif",fontSize:15}} placeholder="SEO description (160 chars)"/></div>
            <div className="fg"><label className="fl">Twitter / X Handle</label><input className="fi" value={cfg.twitter||""} onChange={e=>set("twitter",e.target.value)} placeholder="@yourstudio"/></div>
            <div className="fg"><label className="fl">Instagram Handle</label><input className="fi" value={cfg.instagram||""} onChange={e=>set("instagram",e.target.value)} placeholder="@yourstudio"/></div>
            <div className="fg"><label className="fl">Custom Domain</label><input className="fi" value={cfg.domain||""} onChange={e=>set("domain",e.target.value)} placeholder={projSlug+".yourdomain.com"}/></div>
          </div>
        </div>
      )}

      {tab==="episodes"&&(
        <div className="card">
          <div className="card-t" style={{marginBottom:4}}>Episode Access Control</div>
          <div style={{fontSize:15,color:"var(--t3)",marginBottom:14}}>Set which episodes are free vs. paywalled. Free episodes attract new viewers; paid episodes generate revenue.</div>
          <div style={{display:"flex",gap:12,marginBottom:16}}>
            <div style={{padding:"10px 16px",background:"rgba(74,222,128,.06)",border:"1px solid rgba(74,222,128,.2)",borderRadius:8,fontSize:15}}>
              <div style={{color:"var(--green2)",fontSize:21,fontWeight:700}}>{freeCount}</div>
              <div style={{color:"var(--t3)"}}>Free episodes</div>
            </div>
            <div style={{padding:"10px 16px",background:`${proj?.color||"#c9a84c"}10`,border:`1px solid ${proj?.color||"#c9a84c"}30`,borderRadius:8,fontSize:15}}>
              <div style={{color:proj?.color||"var(--gold)",fontSize:21,fontWeight:700}}>{paidCount}</div>
              <div style={{color:"var(--t3)"}}>Premium episodes</div>
            </div>
          </div>
          <div style={{fontSize:14,color:"var(--t4)",marginBottom:10,padding:"6px 10px",background:"var(--bg3)",borderRadius:6}}>
            💡 Recommended: first 1–3 episodes free as preview, rest behind paywall
          </div>
          {/* Bulk actions */}
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>eps.forEach(e=>dispatch({type:"SET_EPISODE_ACCESS",id:e.id,access:"free"}))}>All Free</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>eps.forEach((e,i)=>dispatch({type:"SET_EPISODE_ACCESS",id:e.id,access:i<(proj?.free_episodes||1)?"free":"paid"}))}>First {proj?.free_episodes||1} Free</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>eps.forEach(e=>dispatch({type:"SET_EPISODE_ACCESS",id:e.id,access:"paid"}))}>All Premium</button>
          </div>
          {eps.map(ep=>(
            <div key={ep.id} style={{background:"var(--bg3)",border:"1px solid var(--ln)",borderRadius:8,marginBottom:6,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px"}}>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:"var(--t3)",width:40}}>EP{String(ep.num).padStart(2,"0")}</span>
                <span style={{fontFamily:"Cormorant Garamond,serif",fontSize:16,color:"var(--t1)",flex:1}}>{ep.title}</span>
                {ep.vnPanels?.length > 0 && <span style={{fontSize:12,color:"var(--t4)"}}>🎌 {ep.vnPanels.length}p</span>}
                <div style={{display:"flex",gap:4}}>
                  {["free","paid","unlisted"].map(a=>(
                    <button key={a} className={`btn btn-sm ${(ep.access||"free")===a?"btn-gold":"btn-ghost"}`}
                      style={{padding:"3px 10px",fontSize:13}}
                      onClick={()=>dispatch({type:"SET_EPISODE_ACCESS",id:ep.id,access:a})}>
                      {a==="free"?"🔓 Free":a==="paid"?"💎 Premium":"🚫 Hidden"}
                    </button>
                  ))}
                </div>
              </div>
              {ep.access==="paid" && (
                <div style={{padding:"8px 12px 10px",borderTop:"1px solid var(--ln2)",background:"var(--bg4)",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:13,color:"var(--t3)"}}>Pricing model:</span>
                  <button className={`btn btn-sm ${!ep.price_model||ep.price_model==="subscription"?"btn-gold":"btn-ghost"}`}
                    style={{padding:"2px 10px",fontSize:13}}
                    onClick={()=>dispatch({type:"SET_EPISODE_PRICE",id:ep.id,model:"subscription",price:ep.price_per_ep})}>
                    Subscription only
                  </button>
                  <button className={`btn btn-sm ${ep.price_model==="per_ep"?"btn-gold":"btn-ghost"}`}
                    style={{padding:"2px 10px",fontSize:13}}
                    onClick={()=>dispatch({type:"SET_EPISODE_PRICE",id:ep.id,model:"per_ep",price:ep.price_per_ep||4.99})}>
                    Buy this episode
                  </button>
                  {ep.price_model==="per_ep" && (
                    <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8}}>
                      <span style={{fontSize:13,color:"var(--t3)"}}>$</span>
                      <input type="number" step="0.99" min="0.99" value={ep.price_per_ep||4.99}
                        onChange={e=>dispatch({type:"SET_EPISODE_PRICE",id:ep.id,model:"per_ep",price:Number(e.target.value)})}
                        style={{width:60,fontSize:14,background:"var(--bg)",border:"1px solid var(--ln)",borderRadius:4,padding:"2px 6px",color:"var(--t1)"}}/>
                      <span style={{fontSize:13,color:"var(--t4)"}}>per episode</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {eps.length===0&&<div style={{textAlign:"center",padding:"20px",color:"var(--t4)",fontSize:15}}>No episodes yet</div>}
        </div>
      )}

      {tab==="paywall"&&(
        <div className="g2">
          <div className="card">
            <div className="card-t" style={{marginBottom:12}}>Pricing Configuration</div>
            <div className="callout co-blue" style={{marginBottom:14,fontSize:14}}>These prices are stored in Supabase and synced with Stripe. Update Stripe price IDs after creating them in the Stripe dashboard.</div>
            {[
              {tier:"monthly",  label:"Monthly",  default:"9.99"},
              {tier:"annual",   label:"Annual",   default:"79.99"},
              {tier:"lifetime", label:"Lifetime", default:"199.00"},
            ].map(p=>(
              <div key={p.tier} className="fr3" style={{marginBottom:8}}>
                <div className="fg"><label className="fl">{p.label} Price (USD)</label><input className="fi" type="number" defaultValue={p.default} placeholder={p.default}/></div>
                <div className="fg"><label className="fl">Stripe Price ID</label><input className="fi" placeholder="price_xxxxx"/></div>
                <div className="fg"><label className="fl">Label</label><input className="fi" placeholder={`${p.label} Pass`}/></div>
              </div>
            ))}
            <button className="btn btn-gold btn-sm">Save Pricing</button>
          </div>
          <div className="card">
            <div className="card-t" style={{marginBottom:12}}>Stripe Integration</div>
            <div className="fg"><label className="fl">Stripe Publishable Key</label><input className="fi" placeholder="pk_live_…" type="password"/></div>
            <div className="fg"><label className="fl">Stripe Secret Key</label><input className="fi" placeholder="sk_live_…" type="password"/></div>
            <div className="fg"><label className="fl">Webhook Secret</label><input className="fi" placeholder="whsec_…" type="password"/></div>
            <div className="callout co-amber" style={{fontSize:14,marginBottom:10}}>Webhook endpoint: {projectUrl}/api/stripe/webhook</div>
            <button className="btn btn-gold btn-sm">Save Stripe Keys</button>
          </div>
        </div>
      )}

      {tab==="analytics"&&(
        <div className="card">
          <div className="card-t" style={{marginBottom:12}}>Site Analytics</div>
          <div className="callout co-blue" style={{fontSize:14,marginBottom:14}}>Connect Supabase and deploy the site to see real analytics.</div>
          <div className="g4" style={{marginBottom:20}}>
            {[{n:"—",l:"Total Visitors"},{n:"—",l:"Subscribers"},{n:"—",l:"MRR"},{n:"—",l:"Churn Rate"}].map((s,i)=>(
              <div key={i} style={{textAlign:"center",padding:"16px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--ln)"}}>
                <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:32,color:"var(--t4)"}}>{s.n}</div>
                <div style={{fontSize:14,color:"var(--t4)"}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div className="fg"><label className="fl">Plausible Analytics Domain</label><input className="fi" placeholder={projSlug+".yourdomain.com"}/></div>
          <div className="fg"><label className="fl">Google Analytics ID</label><input className="fi" placeholder="G-XXXXXXXXXX"/></div>
          <button className="btn btn-gold btn-sm">Save Analytics Config</button>
        </div>
      )}

      {showViewer&&<ViewerSite state={state} onClose={()=>setShowViewer(false)}/>}
    </div>
  );
}


// ── SETTINGS
function PageSettings({ state, dispatch }) {
  const [key, setKey]           = useState(state.apiKey);
  const [geminiKeyInput, setGeminiKeyInput] = useState(state.geminiKey||"");
  const [openaiKeyInput, setOpenaiKeyInput] = useState(state.openaiKey||"");
  const [sbUrl, setSbUrl]       = useState(state.supabaseUrl||"");
  const [sbKey, setSbKey]       = useState(state.supabaseKey||"");
  const [sbSaved, setSbSaved]   = useState(false);
  const [jimengKey, setJimengKey] = useState("");
  const [model, setModel]       = useState("Seedance 2.0");
  const [res, setRes]           = useState("720p");
  const [aspect, setAspect]     = useState("9:16");
  const [tab, setTab]           = useState("api");

  const saveSupabase = () => {
    if (!sbUrl.trim() || !sbKey.trim()) return;
    dispatch({ type:"SET_SUPABASE", url:sbUrl.trim(), key:sbKey.trim() });
    setSbSaved(true);
    setTimeout(() => setSbSaved(false), 3000);
  };

  const exportAll = () => {
    const data = {
      projects:         state.projects,
      bible:            state.bible,
      episodes:         state.episodes,
      assets:           state.assets,
      audioTranscripts: state.audioTranscripts || [],
      activeProject:    state.activeProject,
      exportedAt:       new Date().toISOString(),
      version:          "drama-studio-v3",
    };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `drama-studio-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importAll = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const isV3 = data.version === "drama-studio-v3";
        const isV2 = data.version === "drama-studio-v2";
        if (isV3 || isV2) {
          // Full restore — all projects, episodes, bible, assets, transcripts
          dispatch({ type: "IMPORT_ALL", data: {
            projects:         data.projects         || [],
            bible:            data.bible            || BLANK_BIBLE,
            episodes:         data.episodes         || [],
            assets:           data.assets           || [],
            audioTranscripts: data.audioTranscripts || [],
            activeProject:    data.activeProject    || data.projects?.[0]?.id || null,
          }});
          // Also persist to localStorage immediately
          try {
            localStorage.setItem("ds_full", JSON.stringify({
              projects:         data.projects         || [],
              bible:            data.bible            || BLANK_BIBLE,
              episodes:         data.episodes         || [],
              assets:           data.assets           || [],
              audioTranscripts: data.audioTranscripts || [],
              activeProject:    data.activeProject    || data.projects?.[0]?.id || null,
            }));
          } catch(_) {}
          alert(`✓ Imported ${data.projects?.length || 1} project(s) successfully!`);
        } else {
          alert("Unrecognised export format.");
        }
      } catch(err) { alert("Import error: "+err.message); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{maxWidth:660}}>
      <div className="ph"><div><div className="ph-t">Settings</div><div className="ph-s">API keys · Supabase sync · Team · Data</div></div></div>

      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {["api","sync","generation","shortcuts","data"].map(t=>(
          <button key={t} className={`btn btn-sm ${tab===t?"btn-gold":"btn-ghost"}`} onClick={()=>setTab(t)}>
            {t==="api"?"API Keys":t==="sync"?"Supabase Sync":t==="generation"?"Generation":t==="shortcuts"?"Shortcuts":"Data"}
          </button>
        ))}
      </div>

      {tab==="api"&&(
        <>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:14}}>Anthropic API Key <span style={{fontSize:13,color:"var(--t3)",fontWeight:"normal"}}>— AI Director + project generation</span></div>
            <div className="fg"><label className="fl">Key</label><input className="fi" type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="sk-ant-xxxxx"/></div>
            <div className="callout co-blue" style={{fontSize:14,marginBottom:10}}>Powers the AI Director chat and full project generation from prompts.</div>
            <button className="btn btn-gold" onClick={()=>{dispatch({type:"SET_API_KEY",key});localStorage.setItem("ds_state",JSON.stringify({apiKey:key}));}}>Save Key</button>
          </div>
          {/* ── IMAGE ENGINE PICKER ── */}
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:10}}>🖼 Image Engine <span style={{fontSize:13,color:"var(--t3)",fontWeight:"normal"}}>— for VN panels & character avatars</span></div>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              {Object.values(IMAGE_ENGINES).map(eng => (
                <button key={eng.id}
                  onClick={()=>dispatch({type:"SET_IMAGE_ENGINE",engine:eng.id})}
                  style={{
                    flex:"1 1 160px",padding:"12px 14px",borderRadius:9,cursor:"pointer",textAlign:"left",
                    border:`2px solid ${(state.imageEngine||"nanoBanana2")===eng.id ? "var(--gold)" : "var(--ln)"}`,
                    background:(state.imageEngine||"nanoBanana2")===eng.id ? "rgba(201,168,76,.08)" : "var(--bg3)",
                    transition:"all .15s",
                  }}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:18}}>{eng.icon}</span>
                    <span style={{fontWeight:700,fontSize:14,color:"var(--t1)"}}>{eng.name}</span>
                    <span style={{
                      fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:20,marginLeft:"auto",
                      background: eng.free ? "rgba(52,211,153,.15)" : "rgba(248,180,0,.15)",
                      color: eng.free ? "#34d399" : "#f8b400",
                    }}>{eng.free ? "FREE" : "PAID"}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--t3)",lineHeight:1.5}}>{eng.note}</div>
                </button>
              ))}
            </div>
            {(state.imageEngine||"nanoBanana2")==="pollinations" && (
              <div className="callout co-green" style={{fontSize:13}}>
                ✓ <strong>No API key needed.</strong> Pollinations is completely free — just click Generate.
              </div>
            )}
          </div>

          {/* ── GEMINI KEY (if engine=nanoBanana2 or gemini) ── */}
          {((state.imageEngine||"nanoBanana2")==="nanoBanana2" || (state.imageEngine||"nanoBanana2")==="gemini") && (
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:14}}>Google Gemini API Key <span style={{fontSize:13,color:"var(--t3)",fontWeight:"normal"}}>— for Nano Banana 2 / Gemini image engine</span></div>
            <div className="fg"><label className="fl">Key</label><input className="fi" type="password" value={geminiKeyInput} onChange={e=>setGeminiKeyInput(e.target.value)} placeholder="AIzaSy..."/></div>
            <div className="callout co-blue" style={{fontSize:13,marginBottom:10}}>Get a free key at <strong>aistudio.google.com</strong>. Free tier: 1500 image generations/day.</div>
            <button className="btn btn-gold" onClick={()=>{dispatch({type:"SET_GEMINI",key:geminiKeyInput});localStorage.setItem("ds_gemini",JSON.stringify({key:geminiKeyInput}));}}>Save Key</button>
          </div>
          )}

          {/* ── OPENAI KEY (only if engine=dalle) ── */}
          {state.imageEngine==="dalle" && (
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:14}}>OpenAI API Key <span style={{fontSize:13,color:"var(--t3)",fontWeight:"normal"}}>— for DALL·E 3 image engine</span></div>
            <div className="fg"><label className="fl">Key</label><input className="fi" type="password" value={openaiKeyInput} onChange={e=>setOpenaiKeyInput(e.target.value)} placeholder="sk-proj-..."/></div>
            <div className="callout co-amber" style={{fontSize:13,marginBottom:10}}>DALL·E 3 costs ~$0.04–0.08 per image. Get a key at <strong>platform.openai.com</strong>.</div>
            <button className="btn btn-gold" onClick={()=>dispatch({type:"SET_OPENAI",key:openaiKeyInput})}>Save Key</button>
          </div>
          )}
          {/* ── FISH AUDIO (Primary TTS) */}
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:14}}>🐟 Fish Audio <span style={{fontSize:13,color:"var(--t3)",fontWeight:"normal"}}>— high-quality multi-language TTS (S2-Pro)</span></div>
            <div className="callout co-green" style={{fontSize:13,marginBottom:10}}>
              {FISH_AUDIO_KEY ? "✓ Fish Audio configured via environment. Ready to generate audiobooks." : "Not configured. Set VITE_FISH_AUDIO_KEY in environment."}
            </div>
            <div style={{fontSize:12,color:"var(--t3)"}}>Supports: English, Chinese, Japanese, Korean. 8 built-in voices. Multi-speaker mode with S2-Pro model.</div>
          </div>

          {/* ── ELEVENLABS KEY (fallback TTS) */}
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:14}}>🎭 ElevenLabs API Key <span style={{fontSize:13,color:"var(--t3)",fontWeight:"normal"}}>— alternative TTS engine</span></div>
            <div className="fg">
              <label className="fl">Key</label>
              <input className="fi" type="password"
                defaultValue={state.elevenlabsKey||""}
                id="elevenlabs-key-input"
                placeholder="your-elevenlabs-key"
              />
            </div>
            <div className="callout co-blue" style={{fontSize:13,marginBottom:10}}>Free tier: 10,000 chars/month. Get a key at <strong>elevenlabs.io</strong>. Fish Audio is preferred when available.</div>
            <button className="btn btn-gold" onClick={()=>{
              const inp = document.getElementById("elevenlabs-key-input");
              if (inp) dispatch({type:"SET_ELEVENLABS", key:inp.value});
            }}>Save Key</button>
          </div>
          <div className="card">
            <div className="card-t" style={{marginBottom:14}}>Platform Credentials <span style={{fontSize:13,color:"var(--t3)",fontWeight:"normal"}}>— stored per-project in Supabase</span></div>
            <div className="callout co-amber" style={{fontSize:14,marginBottom:12}}>YouTube and TikTok API credentials are configured in the Publish module, per-project. Stripe keys are configured in the Website module.</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1,padding:"12px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--ln)",textAlign:"center"}}>
                <div style={{fontSize:23,marginBottom:4}}>▶</div>
                <div style={{fontSize:14,color:"var(--t2)"}}>YouTube</div>
                <div style={{fontSize:13,color:"var(--t4)"}}>Configure in Publish →</div>
              </div>
              <div style={{flex:1,padding:"12px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--ln)",textAlign:"center"}}>
                <div style={{fontSize:23,marginBottom:4}}>♪</div>
                <div style={{fontSize:14,color:"var(--t2)"}}>TikTok</div>
                <div style={{fontSize:13,color:"var(--t4)"}}>Configure in Publish →</div>
              </div>
              <div style={{flex:1,padding:"12px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--ln)",textAlign:"center"}}>
                <div style={{fontSize:23,marginBottom:4}}>💳</div>
                <div style={{fontSize:14,color:"var(--t2)"}}>Stripe</div>
                <div style={{fontSize:13,color:"var(--t4)"}}>Configure in Website →</div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab==="sync"&&(
        <>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:8}}>Supabase Configuration</div>
            <div style={{fontSize:15,color:"var(--t3)",marginBottom:14,lineHeight:1.6}}>
              Connect to Supabase to sync all progress — VN images, generated panels, bible, segments — across devices and sessions.
              Your data goes directly to your own Supabase project.
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <span className={`sync-dot ${state.syncStatus==="ok"?"sync-ok":state.syncStatus==="saving"?"sync-saving":state.syncStatus==="error"?"sync-error":"sync-offline"}`}/>
              <span style={{fontSize:15,color:"var(--t2)"}}>
                {state.syncStatus==="ok"?"Connected and syncing":state.syncStatus==="saving"?"Saving…":state.syncStatus==="error"?"Sync error — check credentials":"Not connected"}
              </span>
            </div>
            <div className="fg"><label className="fl">Supabase Project URL</label><input className="fi" type="url" value={sbUrl} onChange={e=>setSbUrl(e.target.value)} placeholder="https://xxxxxxxxxxxx.supabase.co"/></div>
            <div className="fg">
              <label className="fl">API Key</label>
              <input className="fi" type="password" value={sbKey} onChange={e=>setSbKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs…"/>
            </div>
            <div className="callout co-amber" style={{fontSize:13,marginBottom:12,lineHeight:1.6}}>
              <strong>🔑 Local dev tip:</strong> Use your <strong>service_role</strong> key (from Project Settings → API → service_role) to sync without needing to log in.
              The service role bypasses auth — never expose it in a public/deployed app, only use it locally.
              For production/team use, use the <strong>anon</strong> key and sign in below.
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className="btn btn-gold" onClick={saveSupabase} disabled={!sbUrl.trim()||!sbKey.trim()}>
                {sbSaved ? "✓ Connected!" : "Connect Supabase"}
              </button>
              {state.syncStatus==="ok" && (
                <>
                  <button className="btn btn-ghost" onClick={()=>window._dsShowSyncModal?.()}>
                    ⇅ Push / Pull Data
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{
                    dispatch({type:"FORCE_SYNC"});
                    window._dsLoadFromServer?.();
                  }}>↑↓ Sync Now</button>
                </>
              )}
              <button className="btn btn-ghost btn-sm" onClick={()=>window.open("https://supabase.com/dashboard","_blank")}>↗ Open Supabase</button>
            </div>
          </div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:12}}>What Gets Synced</div>
            {[
              ["🎌","VN panels text","Generated dialogue, narration, panel structure for every episode"],
              ["🖼","VN images","Generated art for every panel (stored in vn_images table)"],
              ["📖","Story bible","Characters, avatars, relationships, world facts, arcs"],
              ["🎬","Segments","Video segment prompts, statuses, video URLs"],
              ["💬","Chat history","AI Director conversation per episode"],
              ["⚙️","Episode metadata","Title, status, access level, publish dates"],
            ].map(([icon, label, desc])=>(
              <div key={label} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:"1px solid var(--ln2)",alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                <div>
                  <div style={{fontSize:14,color:"var(--t1)",fontWeight:600}}>{label}</div>
                  <div style={{fontSize:13,color:"var(--t3)"}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-t" style={{marginBottom:12}}>Setup Instructions</div>
            {[
              ["1","Create a free Supabase project at supabase.com"],
              ["2","Run the schema SQL from supabase_schema.sql in your SQL editor (Settings → Data → Download Schema)"],
              ["3","Enable Realtime on: projects, bibles, episodes, assets, vn_images"],
              ["4","For local dev: paste your project URL + service_role key above → instant sync, no login needed"],
              ["5","For production: use anon key + sign in below to create team accounts"],
            ].map(([n,s])=>(
              <div key={n} style={{display:"flex",gap:12,padding:"7px 0",borderBottom:"1px solid var(--ln2)",fontSize:15}}>
                <span style={{width:20,height:20,borderRadius:"50%",background:"var(--bg4)",color:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:"JetBrains Mono,monospace",flexShrink:0}}>{n}</span>
                <span style={{color:"var(--t2)"}}>{s}</span>
              </div>
            ))}
          </div>
          {state.currentUser ? (
            <div className="card">
              <div className="card-t" style={{marginBottom:8}}>Signed In As</div>
              <div className="member-row">
                <div className="user-avatar" style={{width:32,height:32,background:"var(--gold2)",color:"#000",fontSize:17,borderRadius:8}}>
                  {(state.currentUser.displayName||state.currentUser.email||"U").charAt(0).toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,color:"var(--t1)"}}>{state.currentUser.displayName}</div>
                  <div style={{fontSize:14,color:"var(--t3)"}}>{state.currentUser.email}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:"SET_CURRENT_USER",user:null})}>Sign Out</button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-t" style={{marginBottom:8}}>Sign In</div>
              <div style={{fontSize:15,color:"var(--t3)",marginBottom:12}}>Sign in to enable team sync and collaboration.</div>
              <button className="btn btn-gold" onClick={()=>dispatch({type:"SET_VIEW",view:"team"})}>Sign In / Create Account →</button>
            </div>
          )}
        </>
      )}

      {tab==="generation"&&(
        <div className="card">
          <div className="card-t" style={{marginBottom:14}}>Jimeng / Volcengine — Seedance 2.0</div>
          <div className="fg"><label className="fl">API Key</label><input className="fi" type="password" value={jimengKey} onChange={e=>setJimengKey(e.target.value)} placeholder="From console.volcengine.com"/></div>
          <div className="fr3">
            <div className="fg"><label className="fl">Model</label><select className="fs" value={model} onChange={e=>setModel(e.target.value)}><option>Seedance 2.0</option><option>Seedance 2.0 Fast</option><option>Seedance 1.0</option></select></div>
            <div className="fg"><label className="fl">Resolution</label><select className="fs" value={res} onChange={e=>setRes(e.target.value)}><option>720p</option><option>1080p</option><option>2K</option></select></div>
            <div className="fg"><label className="fl">Aspect Ratio</label><select className="fs" value={aspect} onChange={e=>setAspect(e.target.value)}><option>9:16</option><option>16:9</option><option>1:1</option></select></div>
          </div>
          <button className="btn btn-gold" onClick={()=>{
            dispatch({type:"SET_JIMENG", key:jimengKey, model:model, res:res, aspect:aspect});
            localStorage.setItem("ds_full", JSON.stringify({
              ...JSON.parse(localStorage.getItem("ds_full")||"{}"),
              jimengKey, jimengModel:model, jimengRes:res, jimengAspect:aspect,
            }));
          }}>Save Jimeng Settings</button>
        </div>
      )}

      {tab==="shortcuts"&&(
        <div className="card">
          <div className="card-t" style={{marginBottom:12}}>Keyboard Shortcuts</div>
          {[
            ["⌘/Ctrl + Z","Undo last change"],
            ["⌘/Ctrl + Shift + Z","Redo"],
            ["⌘/Ctrl + E","Export project JSON"],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--ln2)",fontSize:15}}>
              <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:14,color:"var(--gold2)"}}>{k}</span>
              <span style={{color:"var(--t3)"}}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {tab==="data"&&(
        <>
        <div className="card" style={{marginBottom:14}}>
          <div className="card-t" style={{marginBottom:10}}>🗄 Database Schema</div>
          <div style={{fontSize:15,color:"var(--t3)",marginBottom:12,lineHeight:1.6}}>
            Download the Supabase SQL schema (v3) and run it in your Supabase SQL Editor to set up sync.
            Safe to re-run — uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
          </div>
          <button className="btn btn-gold" onClick={()=>{
            // Embed schema inline so it works even without file access
            const schema = `-- Drama Studio Supabase Schema v3\\n-- Run in: Supabase Dashboard → SQL Editor\\n-- Safe to re-run on existing databases\\n\\ncreate extension if not exists "uuid-ossp";\\n\\ncreate table if not exists public.projects (\\n  id text primary key, name text not null, type text default 'drama',\\n  genre text, color text default '#c9a84c', status text default 'active',\\n  episodes integer default 10, ep_runtime integer default 180,\\n  description text, slug text unique, website_config jsonb default '{}'::jsonb,\\n  price_monthly numeric(10,2) default 4.99, price_annual numeric(10,2) default 39.99,\\n  price_lifetime numeric(10,2) default 99, next_release_date timestamptz,\\n  free_episodes integer default 1,\\n  created_by uuid, created_at timestamptz default now(), updated_at timestamptz default now()\\n);\\n\\ncreate table if not exists public.project_members (\\n  project_id text, user_id uuid, role text default 'editor',\\n  primary key (project_id, user_id)\\n);\\n\\ncreate table if not exists public.bibles (\\n  project_id text primary key,\\n  characters jsonb default '[]'::jsonb, relationships jsonb default '[]'::jsonb,\\n  world_facts jsonb default '[]'::jsonb, endings jsonb default '[]'::jsonb,\\n  decision_points jsonb default '[]'::jsonb,\\n  story_prompt jsonb default '{}'::jsonb,\\n  bible_version integer default 1, last_changed_at timestamptz,\\n  changelog jsonb default '[]'::jsonb, updated_at timestamptz default now()\\n);\\n\\ncreate table if not exists public.episodes (\\n  id text primary key, project_id text, num integer not null, title text not null,\\n  status text default 'not_started', notes text,\\n  segments jsonb default '[]'::jsonb, access text default 'free',\\n  published_at timestamptz,\\n  vn_panels jsonb default '[]'::jsonb,\\n  vn_panels_history jsonb default '[]'::jsonb,\\n  vn_style text default 'cinematic', vn_style_prefix text,\\n  chat_history jsonb default '[]'::jsonb,\\n  created_at timestamptz default now(), updated_at timestamptz default now()\\n);\\nalter table public.episodes add column if not exists vn_panels jsonb default '[]'::jsonb;\\nalter table public.episodes add column if not exists vn_panels_history jsonb default '[]'::jsonb;\\nalter table public.episodes add column if not exists vn_style text default 'cinematic';\\nalter table public.episodes add column if not exists vn_style_prefix text;\\nalter table public.episodes add column if not exists chat_history jsonb default '[]'::jsonb;\\n\\ncreate table if not exists public.vn_images (\\n  id uuid default uuid_generate_v4() primary key,\\n  project_id text, episode_id text, panel_id text not null,\\n  data_url text not null,\\n  created_at timestamptz default now(), updated_at timestamptz default now(),\\n  unique (episode_id, panel_id)\\n);\\ncreate index if not exists idx_vn_images_episode on public.vn_images(episode_id);\\n\\ncreate table if not exists public.assets (\\n  id text primary key, project_id text, name text not null, type text,\\n  tags jsonb default '[]'::jsonb, thumb text, file_url text, notes text,\\n  ref_status text default 'pending',\\n  created_at timestamptz default now(), updated_at timestamptz default now()\\n);\\n\\ncreate table if not exists public.platform_credentials (\\n  project_id text, platform text not null,\\n  access_token text, refresh_token text, channel_id text,\\n  extra jsonb default '{}'::jsonb, expires_at timestamptz,\\n  updated_at timestamptz default now(),\\n  primary key (project_id, platform)\\n);\\n\\n-- Enable RLS on every table (including sensitive ones)\\nalter table public.projects              enable row level security;\\nalter table public.bibles                enable row level security;\\nalter table public.episodes              enable row level security;\\nalter table public.assets                enable row level security;\\nalter table public.vn_images             enable row level security;\\nalter table public.platform_credentials  enable row level security;\\n\\n-- Drop old policies\\ndo $$ begin\\n  drop policy if exists "allow_all" on public.projects;\\n  drop policy if exists "allow_all" on public.bibles;\\n  drop policy if exists "allow_all" on public.episodes;\\n  drop policy if exists "allow_all" on public.assets;\\n  drop policy if exists "allow_all" on public.vn_images;\\n  drop policy if exists "allow_all" on public.platform_credentials;\\nexception when others then null;\\nend $$;\\n\\n-- Project member policies (editors/owners only)\\ncreate policy "proj_member_all"      on public.projects    for all using (auth.uid() in (select user_id from public.project_members where project_id = id));\\ncreate policy "bible_member_all"     on public.bibles      for all using (auth.uid() in (select user_id from public.project_members where project_id = bibles.project_id));\\ncreate policy "episodes_member_all"  on public.episodes    for all using (auth.uid() in (select user_id from public.project_members where project_id = episodes.project_id));\\ncreate policy "assets_member_all"    on public.assets      for all using (auth.uid() in (select user_id from public.project_members where project_id = assets.project_id));\\ncreate policy "vn_images_member_all" on public.vn_images   for all using (auth.uid() in (select user_id from public.project_members where project_id = vn_images.project_id));\\n\\n-- Platform credentials: owners/editors only (never viewers or unauthenticated)\\ncreate policy "creds_owner_editor" on public.platform_credentials for all using (\\n  auth.uid() in (select user_id from public.project_members where project_id = platform_credentials.project_id and role in ('owner','editor'))\\n);\\n\\n-- NOTE: For local dev with service_role key, RLS is bypassed automatically.\\n-- Never use the service_role key in a deployed/public app.\\n\\n-- Audio transcripts (audiobook feature)\\ncreate table if not exists public.audio_transcripts (\\n  id text primary key,\\n  project_id text not null,\\n  ep_id text not null,\\n  lines jsonb default '[]'::jsonb,\\n  voice_map jsonb default '{}'::jsonb,\\n  audio_urls jsonb default '{}'::jsonb,\\n  stale_audio jsonb default '{}'::jsonb,\\n  created_at timestamptz default now(),\\n  updated_at timestamptz default now(),\\n  unique(project_id, ep_id)\\n);\\nalter table public.audio_transcripts enable row level security;\\ndrop policy if exists \"audio_tx_member_all\" on public.audio_transcripts;\\ncreate policy \"audio_tx_member_all\" on public.audio_transcripts for all using (\\n  auth.uid() in (select user_id from public.project_members where project_id = audio_transcripts.project_id)\\n);\\n`;
            const blob = new Blob([schema],{type:"text/plain"});
            const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="drama_studio_schema_v3.sql"; a.click();
          }}>↓ Download Schema SQL (v3)</button>
        </div>
        <div className="card">
          <div className="card-t" style={{marginBottom:12}}>Data Export &amp; Import</div>
          <div style={{fontSize:15,color:"var(--t3)",marginBottom:14,lineHeight:1.6}}>
            Export your entire workspace — all projects, bibles, episodes, and assets — as a JSON file. Use this as a backup or to migrate to another instance.
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-ghost" onClick={exportAll}>↓ Export All Data</button>
            <label className="btn btn-ghost" style={{cursor:"pointer"}}>
              ↑ Import Data
              <input type="file" accept=".json" style={{display:"none"}} onChange={importAll}/>
            </label>
          </div>
          <div style={{marginTop:12,fontSize:14,color:"var(--t4)",borderTop:"1px solid var(--ln2)",paddingTop:10}}>
            Undo stack: {state.undoStack?.length||0} · Redo: {state.redoStack?.length||0}
            {state.syncStatus!=="offline"&&<span> · Last sync: {state.syncStatus==="ok"?"✓ Now":"saving…"}</span>}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AI DIRECTOR CHAT PANEL
// ═══════════════════════════════════════════════════════════════════
function AiDirectorChat({ state, dispatch }) {
  const apiKey = state.apiKey;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const open = state.chatOpen;

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[state.chatHistory,loading]);

  const send = async (text) => {
    if(!text.trim()||loading) return;
    const userMsg = {id:Date.now(),role:"user",text:text.trim()};
    dispatch({type:"ADD_CHAT_MSG",msg:userMsg});
    setInput(""); setLoading(true);

    try {
      const history = state.chatHistory.slice(-8).map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}));
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({
        model:"claude-sonnet-4-6",max_tokens:2000,
        system:buildSysPrompt(state),
        messages:[...history,{role:"user",content:text.trim()}]
      })});
      const d = await res.json();
      const raw = d.content?.[0]?.text||"Something went wrong.";
      const actions = parseActions(raw);
      const msgId = Date.now()+1;
      // Auto-apply actions immediately — no button click needed
      if (actions.length > 0) {
        dispatch({type:"APPLY_ACTIONS", actions});
        // Handle side-effects that need React dispatch outside the reducer
        for (const a of actions) {
          // Navigation
          if (a.target === "navigation") {
            if (a.view) dispatch({type:"SET_VIEW", view:a.view});
            if (a.episodeId) { dispatch({type:"SET_EPISODE", id:a.episodeId}); dispatch({type:"SET_VIEW", view:"episodes"}); }
          }
          // VN style change — clear cached images so regeneration is triggered fresh
          if (a.target === "vn_style") {
            const epIds = a.id === "all"
              ? state.episodes.filter(e=>e.project===state.activeProject).map(e=>e.id)
              : a.id === "active" || a.id === "current"
              ? [state.activeEpisode]
              : [a.id];
            epIds.forEach(epId => {
              if (epId) {
                dispatch({type:"CLEAR_VN_IMAGES", epId});
                idbDeletePrefix(`vni:${epId}:`).catch(()=>{});
              }
            });
          }
          // Avatar generation — runs sequentially so Gemini isn't overwhelmed
          if (a.target === "generate_avatar") {
            const gemKey = state.geminiKey;
            const eng = state.imageEngine || "nanoBanana2";
            if ((eng === "gemini" || eng === "nanoBanana2") && !gemKey) {
              dispatch({type:"ADD_CHAT_MSG", msg:{id:Date.now()+2, role:"ai", text:"⚠ No Gemini API key set. Add it in Settings → API Keys first.", actions:null, applied:false}});
              break;
            }
            if (eng === "dalle" && !state.openaiKey) {
              dispatch({type:"ADD_CHAT_MSG", msg:{id:Date.now()+2, role:"ai", text:"⚠ No OpenAI API key set. Add it in Settings → API Keys to use DALL·E 3.", actions:null, applied:false}});
              break;
            }
            // Pollinations needs no key
            const charsToGen = a.id === "all"
              ? state.bible.characters.filter(c => !c._avatarGenerating)
              : state.bible.characters.filter(c => c.id === a.id && !c._avatarGenerating);
            const style = a.style || "realistic";
            // Mark all as generating first so UI updates immediately
            charsToGen.forEach(char => dispatch({type:"SET_CHAR_AVATAR_STATUS", charId:char.id, status:"generating"}));
            // Then run sequentially
            (async () => {
              for (const char of charsToGen) {
                try {
                  const dataUrl = await generateCharacterAvatar({ char, geminiKey:gemKey, openaiKey:state.openaiKey||"", style, engine:state.imageEngine||"nanoBanana2" });
                  dispatch({type:"SET_CHAR_AVATAR", charId:char.id, avatarUrl:dataUrl, style});
                  dispatch({type:"SET_CHAR_AVATAR_STATUS", charId:char.id, status:"done"});
                  // Save to IDB immediately — survives refresh
                  const histId = "av_" + Date.now();
                  idbSave(avatarKey(char.id, histId), dataUrl).catch(()=>{});
                } catch(e) {
                  dispatch({type:"SET_CHAR_AVATAR_STATUS", charId:char.id, status:"error"});
                }
              }
            })();
          }

          // ── generate_audiobook: generate transcripts for one or all episodes
          if (a.target === "generate_audiobook") {
            if (!apiKey) {
              dispatch({type:"ADD_CHAT_MSG", msg:{id:Date.now()+3, role:"ai",
                text:"⚠ No Anthropic API key set. Add it in Settings → API Keys first.",
                actions:null, applied:false}});
              break;
            }
            const proj = state.projects.find(p => p.id === state.activeProject);
            const allEps = state.episodes
              .filter(e => e.project === state.activeProject)
              .sort((a,b) => a.num - b.num);
            const targetEps = (a.id === "all")
              ? allEps
              : allEps.filter(e => e.id === a.id || String(e.num) === String(a.id));

            if (targetEps.length === 0) {
              dispatch({type:"ADD_CHAT_MSG", msg:{id:Date.now()+3, role:"ai",
                text:"⚠ No matching episodes found.", actions:null, applied:false}});
              break;
            }

            // Run in background, post progress updates to chat
            (async () => {
              dispatch({type:"ADD_CHAT_MSG", msg:{id:"ab_prog_"+Date.now(), role:"ai",
                text:`🎧 Generating audiobook transcripts for ${targetEps.length} episode${targetEps.length>1?"s":""}… (0/${targetEps.length})`,
                actions:null, applied:false}});

              let done = 0;
              const failed = [];
              for (const ep of targetEps) {
                try {
                  const lines = await generateAudioTranscriptWithAI({
                    ep, proj, bible: state.bible, apiKey,
                    onStatus: () => {},
                  });
                  if (lines && lines.length > 0) {
                    const existingTx = state.audioTranscripts?.find(t => t.epId === ep.id);
                    dispatch({type:"SAVE_TRANSCRIPT", transcript:{
                      id:        existingTx?.id || `at_${ep.id}`,
                      epId:      ep.id,
                      projectId: state.activeProject,
                      lines,
                      voiceMap:  existingTx?.voiceMap || {},
                      audioUrls: {},
                      staleAudio:{},
                      createdAt: new Date().toISOString(),
                    }});
                    done++;
                    dispatch({type:"ADD_CHAT_MSG", msg:{id:"ab_prog_"+Date.now(), role:"ai",
                      text:`🎧 Generating… (${done}/${targetEps.length}) ✓ EP${ep.num}: ${ep.title}`,
                      actions:null, applied:false}});
                  } else {
                    failed.push(`EP${ep.num}`);
                  }
                } catch(e) {
                  failed.push(`EP${ep.num}: ${e.message.slice(0,80)}`);
                }
              }

              const summary = done > 0
                ? `✅ Done! Generated ${done}/${targetEps.length} audiobook transcript${done>1?"s":""}. Open 🎧 Audiobook to review and play.`
                : `❌ Generation failed — no transcripts produced.`;
              dispatch({type:"ADD_CHAT_MSG", msg:{id:"ab_done_"+Date.now(), role:"ai",
                text: summary + (failed.length ? `

Failed: ${failed.join(", ")}` : ""),
                actions:null, applied:false}});
            })();
            break; // one generate_audiobook action is enough
          }
        }
      }
      let displayText = stripActions(raw);
      // Append debug info for vn_style actions so user can verify
      const vnActs = actions.filter(a=>a.target==="vn_style");
      if (vnActs.length > 0) {
        const info = vnActs.map(a => {
          const rStyle = (a.style && a.style in VN_STYLES) ? a.style : "custom";
          const pfx = a.promptPrefix ? a.promptPrefix.substring(0,80)+"…" : "(using built-in preset prefix)";
          return `✓ Style set: **${rStyle}** | Prefix: _${pfx}_`;
        }).join("\n");
        displayText = displayText + "\n\n" + info + "\n\nOpen the VN editor and click **✦ Regenerate Images** to apply.";
      }
      dispatch({type:"ADD_CHAT_MSG",msg:{id:msgId,role:"ai",text:displayText,actions:actions.length>0?actions:null,applied:actions.length>0}});
    } catch(e) {
      dispatch({type:"ADD_CHAT_MSG",msg:{id:Date.now()+1,role:"ai",text:`Error: ${e.message}. Set your Anthropic API key in Settings.`,actions:null,applied:false}});
    }
    setLoading(false);
  };

  const VCLS={set:"v-set",add:"v-add",remove:"v-rm",create:"v-cr"};

  if(!open) return (
    <div className="chat-rail closed" style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>dispatch({type:"TOGGLE_CHAT"})}>
      <span style={{color:"var(--gold)",fontSize:19,writingMode:"vertical-lr",transform:"rotate(180deg)",letterSpacing:2,fontFamily:"Cormorant Garamond,serif"}}>AI Director ✦</span>
    </div>
  );

  const viewLabels = {dashboard:"Dashboard",bible:"Bible",assets:"Assets",episodes:"Episodes",ripple:"Ripple",settings:"Settings"};
  const ep = state.episodes.find(e=>e.id===state.activeEpisode);
  const seg = ep?.segments.find(s=>s.id===state.activeSegment);

  const hasVN = ep?.vnPanels?.length > 0;
  const SUGGESTIONS = [
    hasVN ? `Change VN style to Studio Ghibli for all episodes` : "Generate visual novel panels for this episode",
    "Generate avatars for all characters in anime style",
    "Change VN style to noir — black & white detective",
    "Make it look like a fantasy RPG painting",
    "Add a new character — young hacker, 22, mysterious past",
    "Go to the Bible and show me all characters",
    "Make all episodes free",
    "Generate avatar for Vivienne in ghibli style",
    "Change the active episode VN style to cyberpunk neon",
    "Show me the episode settings",
  ];

  return (
    <div className="chat-rail">
      <div className="chat-hd">
        <div style={{width:28,height:28,background:"var(--gG)",border:"1px solid rgba(201,168,76,.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>✦</div>
        <div>
          <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:17,color:"var(--gold2)",fontWeight:600}}>AI Director</div>
          <div style={{fontSize:13,color:"var(--t3)"}}>Natural language project control</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto",padding:"3px 7px"}} onClick={()=>dispatch({type:"TOGGLE_CHAT"})}>◀</button>
      </div>

      <div className="chat-ctx">
        <span style={{fontSize:12,letterSpacing:1,textTransform:"uppercase",color:"var(--t4)"}}>Context:</span>
        <span className="ctx-chip hi">📁 {state.projects.find(p=>p.id===state.activeProject)?.name.split(" ").slice(0,2).join(" ")}</span>
        <span className={`ctx-chip ${viewLabels[state.view]?"hi":""}`}>📍 {viewLabels[state.view]||state.view}</span>
        {ep&&<span className="ctx-chip hi">🎬 EP{String(ep.num).padStart(3,"0")}</span>}
        {ep&&<span className="ctx-chip" style={{background:"rgba(148,100,200,.12)",color:"#c49eff"}}>🎌 {VN_STYLES[ep.vnStyle||"cinematic"]?.label||ep.vnStyle||"cinematic"}{ep.vnStylePromptPrefix?" (custom)":""}</span>}
        {(() => { const eng = IMAGE_ENGINES[state.imageEngine||"nanoBanana2"]||IMAGE_ENGINES.gemini; return (
          <span className="ctx-chip" style={{background: eng.free?"rgba(52,211,153,.08)":"rgba(248,180,0,.08)", color: eng.free?"#34d399":"#f8b400"}}>
            {eng.icon} {eng.badge}
          </span>
        ); })()}
        {seg&&<span className="ctx-chip hi">▣ {seg.id}</span>}
        <span style={{fontSize:12,color:"var(--t4)"}}>Bible v{state.bible.bibleVersion}</span>
      </div>

      <div className="msgs">
        {state.chatHistory.length===0&&(
          <div className="msg msg-a">
            <div className="bubble bubble-a" style={{whiteSpace:"pre-wrap"}}>{"I run this studio for you.\n\nTell me what to do — change styles, generate avatars, edit characters, update episodes, navigate anywhere. Changes apply instantly. No buttons needed. Undo anytime with Ctrl+Z."}</div>
          </div>
        )}
        {state.chatHistory.map(msg=>(
          <div key={msg.id} className={`msg msg-${msg.role}`}>
            <div className={`bubble bubble-${msg.role}`} style={{whiteSpace:"pre-wrap"}}>{msg.text.split(/\*(.*?)\*/g).map((p,i)=>i%2===0?p:<em key={i} style={{color:"var(--gold2)"}}>{p}</em>)}</div>
            {msg.actions&&!msg.applied&&(
              <div className="action-preview">
                <div className="ap-hd"><div className="ap-count">{msg.actions.length}</div> Proposed Changes</div>
                <div className="ap-list">
                  {msg.actions.map((a,i)=>(
                    <div key={i} className="ap-item">
                      <span className={`av ${VCLS[a.verb]||"v-set"}`}>{a.verb}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,color:"var(--t1)",fontFamily:"JetBrains Mono,monospace"}}>{a.description||`${a.target}→${a.field}`}</div>
                        {a.oldValue!==undefined&&<div className="dl dl-r" style={{fontSize:13}}>{String(a.oldValue).substring(0,60)}</div>}
                        {a.value!==undefined&&typeof a.value!=="object"&&<div className="dl dl-a" style={{fontSize:13}}>{String(a.value).substring(0,60)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"6px 8px",display:"flex",alignItems:"center",gap:6,borderTop:"1px solid rgba(201,168,76,.1)"}}>
                  <span style={{fontSize:12,color:"var(--gold)",fontFamily:"JetBrains Mono,monospace",letterSpacing:"0.5px"}}>✓ APPLIED INSTANTLY</span>
                  <span style={{fontSize:12,color:"var(--t4)",marginLeft:"auto"}}>Ctrl+Z to undo</span>
                </div>
              </div>
            )}
            {msg.applied&&<div className="applied-ok" style={{display:"flex",gap:6,alignItems:"center"}}>✓ Applied instantly <span style={{fontSize:12,opacity:.5,marginLeft:4}}>undo with Ctrl+Z</span></div>}
          </div>
        ))}
        {loading&&<div className="msg msg-a"><div className="bubble bubble-a"><div className="tdots"><div className="tdot"/><div className="tdot"/><div className="tdot"/></div></div></div>}
        <div ref={bottomRef}/>
      </div>

      {state.chatHistory.length<3&&(
        <div style={{padding:"0 12px 8px"}}>
          <div className="chat-sugg">{SUGGESTIONS.slice(0,3).map((s,i)=><button key={i} className="sugg" onClick={()=>send(s)}>{s}</button>)}</div>
        </div>
      )}

      <div className="chat-inp">
        <div className="chat-row">
          <textarea className="chat-ta" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}} placeholder="Tell me what to change…" rows={1}/>
          <button className="chat-send" disabled={!input.trim()||loading} onClick={()=>send(input)}>
            {loading?<span className="spin-sm" style={{borderTopColor:"var(--bg)"}}/>:"↑"}
          </button>
        </div>
        <div style={{fontSize:13,color:"var(--t4)",marginTop:5,textAlign:"center"}}>Changes apply instantly · Ctrl+Z to undo · Shift+Enter for newline</div>
      </div>
    </div>
  );
}

// Mock ripple
function getMockRipple() {
  return {
    summary:"Marco is repositioned as Vivienne's long-standing intelligence source. This fundamentally recontextualizes his Episode 1 silence, his Act II confession, and every scene where Raphael trusted him.",
    originEpisode:1,
    rippleChain:[
      {level:0,episode:1,cause:"Marco's first line is now a deliberate misdirection — he's already reported Raphael's doubt to Vivienne",effect:"Vivienne knows Raphael is suspicious before she descends the staircase"},
      {level:1,episode:3,cause:"Raphael's confidence scene with Marco must be reframed as his fatal mistake",effect:"Sets up betrayal in Ep14"},
      {level:1,episode:8,cause:"Marco's 'silence' is now explained — he was instructed not to speak",effect:"Removes the mystery unless reframed as him choosing Raphael"},
      {level:2,episode:14,cause:"Marco's 'confession' is now a controlled information release by Vivienne",effect:"The emotional anchor of Act II becomes sinister"},
      {level:2,episode:19,cause:"Marco knows Henri — his silence about the Protestor is deliberate suppression",effect:"New close-up shot in Ep1 planted retroactively"},
      {level:3,episode:29,cause:"Simone breaks — if Marco is spy, her break is because she was also surveilled",effect:"Makes Simone's arc more powerful"}
    ],
    episodeImpacts:{
      "1":{severity:"critical",reason:"Marco's first line must carry the weight of surveillance",changes:[{segmentHint:"Seg s06 — Marco dialogue",changeType:"rewrite",before:"The collar is perfect, Mr. Dubois.",after:"The collar is perfect. [Beat. He doesn't look at the 1974 board.]",reason:"Gaze avoidance of 1974 sketch signals awareness"},{segmentHint:"Seg s06 — Tone",changeType:"tone",before:"Reassurance of a man who doesn't want a conversation",after:"Calculated reassurance. Designed to end inquiry.",reason:"Marco is controlling the room on Vivienne's behalf"}]},
      "3":{severity:"critical",reason:"Raphael's confidence scene must be rewritten or removed",changes:[{segmentHint:"Raphael confides scene",changeType:"rewrite",before:"Raphael tells Marco about his 1974 suspicion",after:"Raphael almost tells Marco — stops himself. Something in Marco's stillness.",reason:"This instinct saves Raphael and gives Celeste an early trust clue"}]},
      "8":{severity:"major",reason:"Marco's silence loses its mystery if he's a known spy",changes:[{segmentHint:"Marco silence scene",changeType:"rewrite",before:"Marco says nothing when asked about 1974",after:"Marco says nothing, but his eyes move to the door — expecting someone",reason:"Reframe from passive mystery to active surveillance"}]},
      "14":{severity:"critical",reason:"Marco's confession was Act II emotional anchor",changes:[{segmentHint:"Full episode reframe",changeType:"rewrite",before:"Marco confesses out of guilt and loyalty",after:"Marco's 'confession' is a controlled leak — Vivienne authorized some truth to surface",reason:"Confession becomes strategic, not moral"},{segmentHint:"New beat",changeType:"add",before:"(absent)",after:"Celeste sees Vivienne and Marco exchange a look immediately after his 'confession'",reason:"Plant the spy reveal for attentive viewers"}]},
      "19":{severity:"major",reason:"Marco knows Henri — deliberate suppression of Protestor's identity",changes:[{segmentHint:"Marco reaction to Protestor",changeType:"add",before:"Marco pays no attention to Protestor",after:"2-second close-up: Marco glances at Protestor, then deliberately looks away",reason:"Most significant visual clue in series if caught"}]},
      "29":{severity:"major",reason:"Simone's break must reconcile with Marco's spy role",changes:[{segmentHint:"Simone confrontation",changeType:"rewrite",before:"Simone breaks because Marco told her the truth",after:"Simone breaks because she discovers she was also surveilled by Marco",reason:"Her betrayal is doubled — Vivienne and Marco both"}]},
    },
    endingShifts:{reconciliation:18,rupture:31,celeste_takes:22,raphael_leaves:14,buried:15},
    characterKnowledgeShifts:[
      {character:"Vivienne",knowsBy:1,whatTheyLearn:"She already knows Raphael suspects the collar — Marco told her before Ep1"},
      {character:"Raphael",knowsBy:35,whatTheyLearn:"Marco has been watching him — discovered through an accidental observation"},
      {character:"Simone",knowsBy:29,whatTheyLearn:"She was also surveilled — she was not as trusted as she believed"},
    ],
    directorsNote:"The Marco spy revelation recontextualizes every existing scene without requiring new plot events — it's pure retroactive depth. The greatest creative opportunity: the gap between Ep14 (his 'confession') and Ep67 (his actual defection) is now filled with a man performing loyalty while privately questioning whether Vivienne deserves it. What did Vivienne promise Marco in 1992? That question, answered slowly across Act II, could be the most interesting thread in the series."
  };
}

// ═══════════════════════════════════════════════════════════════════
// AUDIOBOOK MODULE
// ═══════════════════════════════════════════════════════════════════

// ── Voice providers
const OPENAI_VOICES = [
  { id:"alloy",   label:"Alloy",   desc:"Neutral, versatile",      gender:"neutral" },
  { id:"echo",    label:"Echo",    desc:"Deep, authoritative",     gender:"male"    },
  { id:"fable",   label:"Fable",   desc:"Warm storyteller",        gender:"neutral" },
  { id:"onyx",    label:"Onyx",    desc:"Rich, commanding",        gender:"male"    },
  { id:"nova",    label:"Nova",    desc:"Bright, expressive",      gender:"female"  },
  { id:"shimmer", label:"Shimmer", desc:"Soft, elegant",           gender:"female"  },
];

const ELEVENLABS_VOICES = [
  { id:"21m00Tcm4TlvDq8ikWAM", label:"Rachel",  desc:"Warm narrator",     gender:"female"  },
  { id:"AZnzlk1XvdvUeBnXmlld", label:"Domi",    desc:"Confident, clear",  gender:"female"  },
  { id:"EXAVITQu4vr4xnSDxMaL", label:"Bella",   desc:"Soft, intimate",    gender:"female"  },
  { id:"ErXwobaYiN019PkySvjV",  label:"Antoni", desc:"Smooth baritone",   gender:"male"    },
  { id:"MF3mGyEYCl7XYWbV9V6O", label:"Elli",    desc:"Young, energetic",  gender:"female"  },
  { id:"TxGEqnHWrfWFTfGW9XjX", label:"Josh",    desc:"Deep, dramatic",    gender:"male"    },
  { id:"VR6AewLTigWG4xSOukaG", label:"Arnold",  desc:"Strong, resonant",  gender:"male"    },
  { id:"pNInz6obpgDQGcFmaJgB", label:"Adam",    desc:"Precise, measured", gender:"male"    },
  { id:"yoZ06aMxZJJ28mfd3POQ", label:"Sam",     desc:"Neutral, clear",    gender:"neutral" },
];

// ── Parse segment prompt text into transcript lines
function parseSegmentToLines(seg, charMap, epLineId) {
  const lines = [];
  const raw = seg.prompt || "";
  const dialogueRe = /([A-Z][A-Z\s']+?)(?:\s*\([^)]*\))?\s*:\s*DIALOGUE:\s*['"]([^'"]+)['"]/g;
  let match, lastIdx = 0, hasDialogue = false;
  while ((match = dialogueRe.exec(raw)) !== null) {
    const between = raw.slice(lastIdx, match.index).trim();
    if (between && between.length > 20 && !between.match(/^[A-Z\s]+$/)) {
      lines.push({ id:`${epLineId}_n${lines.length}`, type:"narration", speaker:"Narrator", charId:null, text:between.replace(/\s+/g," ").trim() });
    }
    const speakerRaw = match[1].trim();
    const charEntry = Object.entries(charMap).find(([id,name]) => name.toUpperCase().includes(speakerRaw) || speakerRaw.includes(name.toUpperCase()));
    lines.push({ id:`${epLineId}_d${lines.length}`, type:"dialogue", speaker:charEntry?charEntry[1]:speakerRaw.charAt(0)+speakerRaw.slice(1).toLowerCase(), charId:charEntry?charEntry[0]:null, text:match[2].trim() });
    lastIdx = match.index + match[0].length; hasDialogue = true;
  }
  if (!hasDialogue) {
    const cleaned = raw.replace(/DIALOGUE:\s*['"][^'"]*['"]/g,"").replace(/[A-Z][A-Z\s]+:\s*/g,"").replace(/\s+/g," ").trim();
    if (cleaned.length > 15) lines.push({ id:`${epLineId}_n0`, type:"narration", speaker:"Narrator", charId:null, text:cleaned });
  } else {
    const tail = raw.slice(lastIdx).trim().replace(/DIALOGUE:\s*['"][^'"]*['"]/g,"").replace(/\s+/g," ").trim();
    if (tail.length > 20) lines.push({ id:`${epLineId}_t${lines.length}`, type:"narration", speaker:"Narrator", charId:null, text:tail });
  }
  return lines;
}

function buildAudioTranscript(ep, bible) {
  const chars = bible?.characters || [];
  const charMap = Object.fromEntries(chars.map(c => [c.id, c.name]));
  const lines = [];
  (ep.segments || []).forEach((seg, si) => lines.push(...parseSegmentToLines(seg, charMap, `s${si}`)));
  if (lines.length === 0 && ep.vnPanels?.length > 0) {
    ep.vnPanels.forEach((panel, pi) => {
      if (panel.narration) lines.push({ id:`vn${pi}_n`, type:"narration", speaker:"Narrator", charId:null, text:panel.narration });
      if (panel.dialogue) {
        const charEntry = chars.find(c => c.name === panel.speaker || c.id === panel.speaker);
        lines.push({ id:`vn${pi}_d`, type:"dialogue", speaker:panel.speaker||"Character", charId:charEntry?.id||null, text:panel.dialogue });
      }
    });
  }
  return lines;
}

async function generateAudioTranscriptWithAI({ ep, proj, bible, apiKey, onStatus }) {
  if (!apiKey) throw new Error("No Claude API key.");
  onStatus?.("Generating transcript with AI…", 20);
  const bibleChars = (bible?.characters || []).map(c => `${c.name}[${c.id}]: ${c.role}. Voice: ${c.voiceProfile||"natural"}`).join("\n");
  const segs = (ep.segments || []).filter(s => s.prompt);
  const segText = segs.map((s,i) => `[SEG ${i+1} | ${s.type}]\n${s.prompt}`).join("\n\n");
  const vnText  = ep.vnPanels?.map((p,i) => `[PANEL ${i+1}]\n${p.narration||""}\n${p.speaker?`${p.speaker}: ${p.dialogue||""}`:p.dialogue||""}`).join("\n\n") || "";
  const prompt = `Convert this drama/novel episode into a clean, vivid audiobook transcript.

SERIES: "${ep.projName||proj?.name}" — ${proj?.genre||""}
EPISODE ${ep.num}: "${ep.title}"
${ep.notes ? `EPISODE NOTES: ${ep.notes}` : ""}

CHARACTERS:
${bibleChars || "(no characters defined)"}

EPISODE CONTENT:
${segText || vnText || "(no content — write original audiobook content based on the episode title)"}

YOUR RESPONSE MUST BE ONLY A RAW JSON ARRAY. Begin your response with [ and end with ]. No explanation, no preamble, no markdown fences, no text outside the array.

Each element must follow this exact shape:
{"id":"l1","type":"narration","speaker":"Narrator","charId":null,"text":"..."}
{"id":"l2","type":"dialogue","speaker":"CHARACTER NAME","charId":"char_id_or_null","text":"..."}

Rules:
- type: "narration" or "dialogue" only
- narration = atmospheric/action text read by Narrator
- dialogue = spoken lines, speaker = exact character name from CHARACTERS above
- charId = matching id from CHARACTERS (in brackets), null for Narrator
- Vivid, natural prose — written for ears not eyes
- No stage directions, no camera cues, no [brackets], no asterisks
- Split long passages into short focused beats (1-3 sentences each)
- Minimum 25 lines`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  onStatus?.("Parsing transcript…", 75);
  const d = await res.json();
  const raw = d.content?.[0]?.text || "";

  if (!raw.trim()) throw new Error("Empty response from Claude. Please try again.");

  // ── Robust JSON extraction (4 strategies)
  let parsed = null;

  // S1: whole response is a JSON array
  if (raw.trim().startsWith("[")) {
    try { parsed = JSON.parse(raw.trim()); } catch {}
  }

  // S2: strip markdown fences
  if (!parsed) {
    const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    if (stripped.startsWith("[")) {
      try { parsed = JSON.parse(stripped); } catch {}
    }
  }

  // S3: find first [...] block in arbitrary text
  if (!parsed) {
    const start = raw.indexOf("[");
    const end   = raw.lastIndexOf("]");
    if (start !== -1 && end > start) {
      try { parsed = JSON.parse(raw.slice(start, end + 1)); } catch {}
    }
  }

  // S4: extract individual JSON objects line-by-line
  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    const matches = [...raw.matchAll(/\{[^{}]*?"type"\s*:\s*"(?:narration|dialogue)"[^{}]*?\}/gs)];
    if (matches.length > 0) {
      try { parsed = matches.map(m => JSON.parse(m[0])); } catch {}
    }
  }

  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    console.error("[AB] Raw Claude response:", raw.slice(0, 800));
    throw new Error(
      `Failed to parse transcript. Claude returned:\n"${raw.slice(0, 200)}${raw.length > 200 ? "…" : ""}"`
    );
  }

  onStatus?.("Finalising…", 90);
  return parsed
    .filter(l => l && typeof l === "object" && l.text && l.text.trim())
    .map((l, i) => ({
      id:      l.id || `l${i + 1}`,
      type:    l.type === "dialogue" ? "dialogue" : "narration",
      speaker: l.speaker || "Narrator",
      charId:  l.charId || null,
      text:    String(l.text).trim(),
    }));
}



// ── TTS engines
async function openaiTTS({ text, voice="nova", openaiKey }) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${openaiKey}`},
    body: JSON.stringify({ model:"tts-1", input:text, voice, speed:1.0 }),
  });
  if (!res.ok) throw new Error(`OpenAI TTS ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

async function elevenlabsTTS({ text, voiceId, elevenlabsKey }) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method:"POST",
    headers:{"Content-Type":"application/json","xi-api-key":elevenlabsKey},
    body: JSON.stringify({ text, model_id:"eleven_monolingual_v1", voice_settings:{stability:0.5,similarity_boost:0.75} }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

// Fish Audio TTS — high-quality multi-language voices
const FISH_AUDIO_KEY = import.meta.env.VITE_FISH_AUDIO_KEY || "";
const FISH_VOICES = [
  { id:"e58b0d7efca34eb38d5c4985e378abcb", name:"Aria (Female, EN)", gender:"female" },
  { id:"1ede69a0fc124a06ae00c764c59c30c2", name:"Zara (Female, EN)", gender:"female" },
  { id:"bf0a8c39c2324fd3a2f42f9aa5734f7c", name:"Nova (Female, EN)", gender:"female" },
  { id:"6e9f1be5a8a14a6082ed69d75c451f80", name:"Atlas (Male, EN)", gender:"male" },
  { id:"0f30e29cee2c4c1ba1e4c9e52d8e6848", name:"Kai (Male, EN)", gender:"male" },
  { id:"de7a78e4d1a64a1a930f0688dd24e6e0", name:"Leo (Male, EN)", gender:"male" },
  { id:"7f92f8bea25241f5a3e5dc1f25dbf3ce", name:"Sakura (Female, JP)", gender:"female" },
  { id:"5474457dc8974c85b04cb74b33715eea", name:"Narrator (Neutral)", gender:"neutral" },
];

async function fishAudioTTS({ text, referenceId, temperature=0.7 }) {
  const key = FISH_AUDIO_KEY;
  if (!key) throw new Error("Fish Audio API key not configured");
  const res = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "model": "s2-pro",
    },
    body: JSON.stringify({
      text,
      reference_id: referenceId || FISH_VOICES[7].id,
      format: "mp3",
      mp3_bitrate: 128,
      temperature,
      top_p: 0.7,
      chunk_length: 300,
      normalize: true,
      latency: "normal",
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Fish Audio ${res.status}: ${errText.substring(0, 100)}`);
  }
  return URL.createObjectURL(await res.blob());
}

function autoAssignVoices(chars, engine, existingMap={}) {
  const map = { ...existingMap };
  // Browser: get actual OS voices, prefer English
  let bFemale=[], bMale=[], narratorV="";
  if (engine==="browser" && typeof window!=="undefined") {
    const all = window.speechSynthesis?.getVoices()||[];
    const en  = all.filter(v=>v.lang.startsWith("en"));
    const pool= en.length ? en : all;
    bFemale   = pool.filter(v=>/female|zira|susan|victoria|samantha|karen|moira|fiona|tessa/i.test(v.name));
    bMale     = pool.filter(v=>/male|david|mark|daniel|reed|liam|thomas|ryan/i.test(v.name));
    narratorV = (pool.find(v=>/samantha|daniel|karen|alex|eloquence/i.test(v.name))||pool[0])?.name||"";
    if (!bFemale.length) bFemale = pool.filter((_,i)=>i%2===0);
    if (!bMale.length)   bMale   = pool.filter((_,i)=>i%2===1);
  }
  const femaleV = engine==="openai"     ? ["nova","shimmer","alloy"]
    : engine==="fish"       ? FISH_VOICES.filter(v=>v.gender==="female").map(v=>v.id)
    : engine==="elevenlabs" ? [ELEVENLABS_VOICES[0].id,ELEVENLABS_VOICES[2].id,ELEVENLABS_VOICES[4].id]
    : bFemale.map(v=>v.name);
  const maleV   = engine==="openai"     ? ["echo","onyx","fable"]
    : engine==="fish"       ? FISH_VOICES.filter(v=>v.gender==="male").map(v=>v.id)
    : engine==="elevenlabs" ? [ELEVENLABS_VOICES[3].id,ELEVENLABS_VOICES[5].id,ELEVENLABS_VOICES[7].id]
    : bMale.map(v=>v.name);
  const narr    = engine==="openai"     ? "fable"
    : engine==="fish"       ? FISH_VOICES[7].id
    : engine==="elevenlabs" ? ELEVENLABS_VOICES[0].id
    : narratorV;
  let fi=0, mi=0;
  ["Narrator",...chars.map(c=>c.name)].forEach(name => {
    if (map[name]) return;
    const char = chars.find(c=>c.name===name);
    const app  = (char?.appearance||char?.role||char?.gender||"").toLowerCase();
    const isF  = /she|her|woman|girl|female/.test(app);
    const isM  = /he|him|man|boy|male/.test(app);
    if (name==="Narrator") { map[name]=narr; }
    else if (isF && femaleV.length) { map[name]=femaleV[fi%femaleV.length]; fi++; }
    else if (isM && maleV.length)   { map[name]=maleV[mi%maleV.length]; mi++; }
    else {
      // alternate female/male for unspecified gender
      if (fi<=mi && femaleV.length) { map[name]=femaleV[fi%femaleV.length]; fi++; }
      else if (maleV.length)        { map[name]=maleV[mi%maleV.length]; mi++; }
      else                          { map[name]=narr; }
    }
  });
  return map;
}

// ── Cost estimation per engine (per 1000 chars)
const VOICE_COSTS = {
  openai:      { rate: 0.015, unit: "1k chars", label: "OpenAI TTS" },
  fish:        { rate: 0.015, unit: "1k chars", label: "Fish Audio (S2-Pro)" },
  elevenlabs:  { rate: 0.30,  unit: "1k chars", label: "ElevenLabs" },
  browser:     { rate: 0,     unit: "",          label: "Browser (free)" },
};

function calcTranscriptStats(lines=[]) {
  const totalChars = lines.reduce((s,l) => s + (l.text||"").length, 0);
  const totalWords = lines.reduce((s,l) => s + (l.text||"").trim().split(/\s+/).filter(Boolean).length, 0);
  const dialogueChars   = lines.filter(l=>l.type==="dialogue").reduce((s,l)=>s+(l.text||"").length,0);
  const narrationChars  = lines.filter(l=>l.type==="narration").reduce((s,l)=>s+(l.text||"").length,0);
  return { totalChars, totalWords, dialogueChars, narrationChars };
}

function estimateCost(chars, engine) {
  const c = VOICE_COSTS[engine] || VOICE_COSTS.browser;
  return (chars / 1000) * c.rate;
}

// ── Upload audio blob to Supabase Storage
async function uploadAudioToSupabase({ blobUrl, transcriptId, lineId, supabaseUrl, supabaseKey }) {
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const blob = await fetch(blobUrl).then(r => r.blob());
    const path = `audiobook/${transcriptId}/${lineId}.mp3`;
    // PUT with x-upsert creates OR replaces (POST fails if file already exists)
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${path}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "audio/mpeg",
        "x-upsert": "true",
      },
      body: blob,
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn("[AudioBook] Supabase upload failed:", err);
      return null;
    }
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
  } catch(e) {
    console.warn("[AudioBook] Upload error:", e.message);
    return null;
  }
}

// ── Ensure the audiobook bucket exists (idempotent)
async function ensureAudioBucket(supabaseUrl, supabaseKey) {
  if (!supabaseUrl || !supabaseKey) return;
  try {
    await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id:"audiobook", name:"audiobook", public:true }),
    });
    // ignore 409 conflict (already exists)
  } catch {}
}

// ═══════════════════════════════════════════════════════════════════
// PAGE AUDIOBOOK
// ═══════════════════════════════════════════════════════════════════
function PageAudioBook({ state, dispatch }) {
  const proj   = state.projects.find(p => p.id === state.activeProject);
  const eps    = state.episodes.filter(e => e.project === state.activeProject).sort((a,b) => a.num - b.num);
  const apiKey = state.apiKey;

  const [tab, setTab]             = useState("list"); // list | editor | voices | player
  const [selEpId, setSelEpId]     = useState(eps[0]?.id || null);
  const [genPhase, setGenPhase]   = useState("idle");
  const [genPct, setGenPct]       = useState(0);
  const [genMsg, setGenMsg]       = useState("");
  const [genErr, setGenErr]       = useState(null);
  const [voiceEngine, setVoiceEngine] = useState(
    FISH_AUDIO_KEY ? "fish" : state.openaiKey ? "openai" : state.elevenlabsKey ? "elevenlabs" : "browser"
  );

  // Player
  const [playing, setPlaying]         = useState(false);
  const [curLineIdx, setCurLineIdx]    = useState(0);
  const [speed, setSpeed]             = useState(1.0);
  const [audioCache, setAudioCache]   = useState({});
  const [loadingLine, setLoadingLine] = useState(null);

  // Pre-generate all audio
  const [audioSavePhase, setAudioSavePhase] = useState("idle"); // idle | saving | done | error
  const [audioSavePct, setAudioSavePct]     = useState(0);
  const [audioSaveMsg, setAudioSaveMsg]     = useState("");

  // Comment mode
  const [commentMode, setCommentMode] = useState("idle"); // idle | listening | typing | thinking | replied
  const [commentText, setCommentText] = useState("");
  const [aiReply, setAiReply]         = useState("");
  const [listenActive, setListenActive] = useState(false);

  // Voice keyword detection
  const [kwListening, setKwListening]   = useState(false); // always-on keyword listener
  const [kwStatus, setKwStatus]         = useState("");     // "watching" | "heard"

  const audioRef      = useRef(null);
  const lineScrollRef = useRef(null);
  const wasPlayingRef = useRef(false);
  const recRef        = useRef(null);
  const kwRecRef      = useRef(null);
  const commentInputRef = useRef(null);
  const isPlayingRef  = useRef(false); // mirrors `playing` without stale closure

  const selEp = eps.find(e => e.id === selEpId) || eps[0];
  const transcript = state.audioTranscripts.find(t => t.epId === selEp?.id);
  const lines      = transcript?.lines || [];
  const voiceMap   = transcript?.voiceMap || {};
  const chars      = state.bible?.characters || [];

  // Waveform
  const [waveBars] = useState(() => Array.from({length:32}, (_,i) => ({ h: 8+Math.random()*28, delay: i*35 })));

  // ── Auto-scroll active line
  useEffect(() => {
    lineScrollRef.current?.scrollIntoView({ behavior:"smooth", block:"center" });
  }, [curLineIdx]);

  // ── Cleanup on unmount
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    kwRecRef.current?.stop();
    recRef.current?.stop();
  }, []);

  // ── Keep isPlayingRef in sync with playing state (avoids stale closures in callbacks)
  useEffect(() => { isPlayingRef.current = playing; }, [playing]);

  // ── Stop everything when leaving player tab
  useEffect(() => {
    if (tab !== "player") {
      isPlayingRef.current = false;
      setPlaying(false);
      window.speechSynthesis?.cancel();
      try { audioRef.current?.pause(); } catch {}
      kwRecRef.current?.stop();
      setKwListening(false);
    } else {
      startKwListener();
      // Ensure audio bucket exists (idempotent, silent fail)
      if (state.supabaseUrl && state.supabaseKey) {
        ensureAudioBucket(state.supabaseUrl, state.supabaseKey);
      }
    }
    return () => { kwRecRef.current?.stop(); };
  }, [tab]);

  const startKwListener = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(" ").toLowerCase();
      if (
        transcript.includes("pause and comment") ||
        transcript.includes("pause comment") ||
        transcript.includes("stop and comment") ||
        transcript.includes("hey director") ||
        transcript.includes("ai director")
      ) {
        setKwStatus("heard");
        setTimeout(() => openComment(), 400);
      }
    };
    rec.onerror = () => {};
    rec.onend = () => {
      // Restart unless we explicitly stopped
      if (kwRecRef.current === rec) {
        setTimeout(() => { try { rec.start(); } catch {} }, 500);
      }
    };
    try { rec.start(); } catch {}
    kwRecRef.current = rec;
    setKwListening(true);
    setKwStatus("watching");
  };

  // ── Generate transcript
  const generateTranscript = async (useAI=true) => {
    if (!selEp) return;
    setGenPhase("generating"); setGenErr(null); setGenPct(10);
    try {
      let newLines;
      if (useAI && apiKey) {
        newLines = await generateAudioTranscriptWithAI({
          ep:selEp, proj, bible:state.bible, apiKey,
          onStatus:(msg,pct) => { setGenMsg(msg); setGenPct(pct); },
        });
      } else {
        setGenMsg("Parsing episode content…"); setGenPct(50);
        newLines = buildAudioTranscript(selEp, state.bible);
      }
      setGenPct(90);
      if (!newLines || newLines.length === 0) {
        throw new Error("Generation returned 0 lines. The episode may have no content — add segments or VN panels first.");
      }
      const allSpeakers = [...new Set(newLines.map(l=>l.speaker))];
      const allSpeakerChars = allSpeakers.map(s=>chars.find(c=>c.name===s)).filter(Boolean);
      const autoMap = autoAssignVoices(allSpeakerChars, voiceEngine, voiceMap);
      const t = {
        id: transcript?.id || `at_${Date.now()}`,
        epId: selEp.id, projectId: state.activeProject,
        lines: newLines,
        voiceMap: { ...autoMap, ...voiceMap },
        createdAt: new Date().toISOString(),
      };
      dispatch({ type:"SAVE_TRANSCRIPT", transcript:t });
      setGenPhase("ready"); setGenPct(100);
      setTab("editor");
    } catch(e) { setGenPhase("error"); setGenErr(e.message); }
  };

  // ── Auto-fill voices whenever transcript/engine changes and speakers are unmapped
  useEffect(() => {
    if (!transcript || !transcript.lines?.length) return;
    const allSpeakers = [...new Set(transcript.lines.map(l => l.speaker))];
    const unmapped = allSpeakers.filter(s => !transcript.voiceMap?.[s]);
    if (unmapped.length === 0) return;
    // Build fresh auto-map for unmapped speakers only
    const speakerChars = allSpeakers.map(s => chars.find(c => c.name === s)).filter(Boolean);
    const filled = autoAssignVoices(speakerChars, voiceEngine, transcript.voiceMap || {});
    dispatch({ type:"SET_VOICE_MAP", transcriptId:transcript.id, voiceMap:filled });
  }, [transcript?.id, voiceEngine]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── TTS play single line
  const playLine = async (idx) => {
    if (idx >= lines.length) { stopAll(); return; }
    const line = lines[idx];
    setCurLineIdx(idx);
    setLoadingLine(line.id);
    const voiceId = voiceMap[line.speaker] || "";
    const isStale = !!(transcript?.staleAudio?.[line.id]);
    try {
      if (voiceEngine === "browser") {
        window.speechSynthesis?.cancel();
        const utt = new SpeechSynthesisUtterance(line.text);
        utt.rate = speed; utt.pitch = line.type==="narration" ? 0.9 : 1.0;
        if (voiceId) { const v = window.speechSynthesis.getVoices().find(v=>v.name===voiceId); if (v) utt.voice=v; }
        setLoadingLine(null);
        utt.onend  = () => { if (isPlayingRef.current) playLine(idx+1); };
        utt.onerror= () => { if (isPlayingRef.current) playLine(idx+1); };
        window.speechSynthesis.speak(utt);
      } else {
        // 1. Try saved Supabase URL (skip if stale)
        let url = (!isStale && transcript?.audioUrls?.[line.id]) || null;
        // 2. Try in-memory cache (skip if stale)
        if (!url && !isStale) url = audioCache[line.id] || null;
        // 3. Generate fresh TTS
        if (!url) {
          url = voiceEngine==="fish"
            ? await fishAudioTTS({text:line.text, referenceId:voiceId||FISH_VOICES[7].id})
            : voiceEngine==="openai"
            ? await openaiTTS({text:line.text, voice:voiceId||"nova", openaiKey:state.openaiKey})
            : await elevenlabsTTS({text:line.text, voiceId:voiceId||ELEVENLABS_VOICES[0].id, elevenlabsKey:state.elevenlabsKey});
          setAudioCache(c => ({...c, [line.id]:url}));
          // Upload to Supabase in background — PUT with x-upsert handles create+replace
          if (state.supabaseUrl && state.supabaseKey && transcript) {
            uploadAudioToSupabase({
              blobUrl: url, transcriptId: transcript.id, lineId: line.id,
              supabaseUrl: state.supabaseUrl, supabaseKey: state.supabaseKey,
            }).then(savedUrl => {
              if (savedUrl) dispatch({ type:"SAVE_AUDIO_URL", transcriptId:transcript.id, lineId:line.id, url:savedUrl });
            });
          }
          // No Supabase: blob URLs are memory-only — don't save to audioUrls (they die on refresh)
        }
        // Abort if stopped during async fetch
        if (!isPlayingRef.current) { setLoadingLine(null); return; }
        setLoadingLine(null);
        const audio = new Audio(url);
        audio.playbackRate = speed;
        audioRef.current = audio;
        audio.onended = () => { if (isPlayingRef.current) playLine(idx+1); };
        audio.onerror = () => { if (isPlayingRef.current) playLine(idx+1); };
        audio.play();
      }
    } catch(e) {
      console.warn("[AB] TTS:", e.message);
      setLoadingLine(null);
      if (isPlayingRef.current) playLine(idx+1);
    }
  };

  const stopAll = () => {
    isPlayingRef.current = false;
    setPlaying(false);
    window.speechSynthesis?.cancel();
    try { audioRef.current?.pause(); } catch {}
  };

  // ── Generate TTS for every line and upload to Supabase in one batch
  const generateAndSaveAllAudio = async () => {
    if (!transcript || !lines.length) return;
    if (voiceEngine === "browser") {
      setAudioSaveMsg("Browser voices cannot be saved — switch to OpenAI or ElevenLabs first.");
      setAudioSavePhase("error");
      return;
    }
    const hasSupabase = !!(state.supabaseUrl && state.supabaseKey);

    stopAll();
    setAudioSavePhase("saving");
    setAudioSavePct(0);

    // Only generate lines that aren't already saved (or are stale)
    const linesToGen = lines.filter(l => {
      const isStale = !!(transcript.staleAudio?.[l.id]);
      const hasSaved = !!(transcript.audioUrls?.[l.id]) && !isStale;
      return !hasSaved;
    });

    if (linesToGen.length === 0) {
      setAudioSaveMsg(`All ${lines.length} lines already saved ✓`);
      setAudioSavePhase("done");
      return;
    }

    setAudioSaveMsg(`Generating ${linesToGen.length} lines${hasSupabase ? " and uploading…" : " (no Supabase — will cache in memory)"}…`);

    let done = 0;
    let failed = 0;
    for (const line of linesToGen) {
      try {
        const voiceId = voiceMap[line.speaker] || "";
        const url = voiceEngine === "fish"
          ? await fishAudioTTS({ text: line.text, referenceId: voiceId || FISH_VOICES[7].id })
          : voiceEngine === "openai"
          ? await openaiTTS({ text: line.text, voice: voiceId || "nova", openaiKey: state.openaiKey })
          : await elevenlabsTTS({ text: line.text, voiceId: voiceId || ELEVENLABS_VOICES[0].id, elevenlabsKey: state.elevenlabsKey });

        setAudioCache(c => ({...c, [line.id]: url}));

        if (hasSupabase) {
          const savedUrl = await uploadAudioToSupabase({
            blobUrl: url, transcriptId: transcript.id, lineId: line.id,
            supabaseUrl: state.supabaseUrl, supabaseKey: state.supabaseKey,
          });
          if (savedUrl) {
            dispatch({ type: "SAVE_AUDIO_URL", transcriptId: transcript.id, lineId: line.id, url: savedUrl });
          }
        }
        done++;
      } catch(e) {
        console.warn("[AB] Pre-gen failed for line", line.id, e.message);
        failed++;
      }
      setAudioSavePct(Math.round((done + failed) / linesToGen.length * 100));
    }

    const savedLabel = hasSupabase ? "saved to Supabase" : "cached in memory (connect Supabase to persist)";
    setAudioSaveMsg(
      failed === 0
        ? `✓ ${done} lines generated & ${savedLabel}`
        : `${done} done, ${failed} failed — ${savedLabel}`
    );
    setAudioSavePhase(failed === 0 ? "done" : "error");
  };

  const handlePlayPause = () => {
    if (playing) {
      stopAll();
    } else {
      isPlayingRef.current = true;
      setPlaying(true);
      playLine(curLineIdx);
    }
  };

  // ── Pause & Comment — open flow
  const openComment = () => {
    wasPlayingRef.current = isPlayingRef.current;
    stopAll();
    setCommentMode("listening");
    setCommentText("");
    setAiReply("");
    startCommentRec();
  };

  const startCommentRec = () => {
    recRef.current?.stop();
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { setCommentMode("typing"); return; }
    const rec = new SpeechRec();
    rec.continuous = false; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r=>r[0].transcript).join("");
      setCommentText(t);
    };
    rec.onend = () => setListenActive(false);
    rec.onerror = () => { setListenActive(false); setCommentMode("typing"); };
    rec.start();
    recRef.current = rec;
    setListenActive(true);
  };

  const sendComment = async () => {
    const text = commentText.trim();
    if (!text) { cancelComment(); return; }
    recRef.current?.stop();
    setCommentMode("thinking");
    try {
      const curLine = lines[curLineIdx];
      const hasTranscript = lines.length > 0;

      // ── Detect transcript-generation intent locally first
      const genIntent = /\b(generat|creat|mak|writ|build|produc|convert)\b.*\b(transcript|audiobook|audio book|script)\b|\b(transcript|audiobook)\b.*\b(generat|creat|mak|writ|build)\b/i.test(text);
      if (genIntent) {
        // Close comment overlay immediately, switch to list tab, then generate
        setCommentMode("idle");
        setCommentText("");
        setAiReply("");
        setListenActive(false);
        stopAll();
        setTab("list");
        setGenPhase("generating");
        setGenMsg("AI Director is generating your transcript…");
        setGenPct(5);
        setTimeout(async () => {
          try {
            await generateTranscript(true);
          } catch(e) {
            setGenPhase("error");
            setGenErr(e.message);
          }
        }, 120);
        return;
      }

      const context = `The user is listening to the audiobook of "${proj?.name}" — Episode ${selEp?.num}: "${selEp?.title}".
${hasTranscript
  ? `They paused at line ${curLineIdx+1} of ${lines.length}.\nCurrent line (${curLine?.type}): "${curLine?.text||""}"\nSpeaker: ${curLine?.speaker||"Narrator"}`
  : "There is no transcript yet for this episode."}

The user may want to:
- Change story direction, character arcs, or dialogue
- Ask questions about the story
- Request the transcript be updated
- Get analysis or commentary on what just happened

IMPORTANT: If the user asks you to generate a transcript or create an audiobook, tell them to use the "✦ AI Generate" button in the Episodes tab, or that you are triggering it now. Do NOT just say "done" without actually doing something.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1500,
          system: buildSysPrompt(state) + `\n\nCONTEXT: User paused the Audiobook player.\n${context}\n\nRespond conversationally as the AI Director. If the user wants changes to story/characters/segments, include action blocks. If just asking questions, answer warmly and insightfully.`,
          messages:[{role:"user",content:text}],
        }),
      });
      const d = await res.json();
      const raw = d.content?.[0]?.text || "";
      const actions = parseActions(raw);
      if (actions.length > 0) dispatch({ type:"APPLY_ACTIONS", actions });
      setAiReply(stripActions(raw));
      setCommentMode("replied");
    } catch(e) {
      setAiReply(`Error: ${e.message}`);
      setCommentMode("replied");
    }
  };

  const cancelComment = () => {
    recRef.current?.stop();
    setCommentMode("idle");
    setCommentText("");
    setAiReply("");
    setListenActive(false);
    if (wasPlayingRef.current) {
      isPlayingRef.current = true;
      setPlaying(true);
      playLine(curLineIdx);
    }
  };

  const resumeAfterComment = () => {
    setCommentMode("idle");
    setCommentText("");
    setAiReply("");
    setListenActive(false);
    isPlayingRef.current = true;
    setPlaying(true);
    playLine(curLineIdx);
  };

  const getSpeakerColor = (speaker) => {
    const c = chars.find(c => c.name === speaker);
    return c?.color || "#9da5bb";
  };

  const VOICE_LIST = voiceEngine==="openai" ? OPENAI_VOICES
    : voiceEngine==="elevenlabs" ? ELEVENLABS_VOICES
    : (window.speechSynthesis?.getVoices()?.slice(0,14).map(v=>({id:v.name,label:v.name,desc:v.lang}))||[]);

  const allSpeakers = [...new Set(lines.map(l=>l.speaker))];
  const ACC = "#c9a84c";

  if (!proj) return (
    <div style={{padding:60, color:"var(--t3)", textAlign:"center"}}>
      <div style={{fontSize:56, marginBottom:16, opacity:.3}}>🎧</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"var(--t2)", marginBottom:8}}>Audiobook Studio</div>
      <div style={{fontSize:15}}>Select a project to get started.</div>
    </div>
  );

  // ════════════════════════════════════════════════════════
  // PLAYER VIEW
  // ════════════════════════════════════════════════════════
  if (tab === "player" && lines.length > 0) {
    const curLine = lines[curLineIdx];
    const sc = getSpeakerColor(curLine?.speaker);
    const pct = lines.length ? ((curLineIdx+1)/lines.length)*100 : 0;

    return (
      <div className="ab-player">

        {/* ── KEYWORD LISTENING INDICATOR */}
        {kwListening && commentMode === "idle" && (
          <div style={{position:"absolute", top:16, right:16, display:"flex", alignItems:"center", gap:6, padding:"5px 10px",
            background:"rgba(0,0,0,.5)", borderRadius:20, border:"1px solid rgba(255,255,255,.08)", zIndex:10}}>
            <div style={{width:6, height:6, borderRadius:"50%", background:kwStatus==="heard"?"var(--gold)":"var(--green2)",
              boxShadow:kwStatus==="heard"?"0 0 8px var(--gold)":"0 0 6px var(--green2)",
              animation:"ab-pulse .8s ease-in-out infinite"}}/>
            <span style={{fontSize:11, color:"rgba(255,255,255,.35)", letterSpacing:1}}>
              {kwStatus==="heard" ? "HEARD — OPENING…" : "VOICE ACTIVE · say \"pause and comment\""}
            </span>
          </div>
        )}

        {/* ── COMMENT OVERLAY */}
        {commentMode !== "idle" && (
          <div className="ab-comment-overlay">
            {commentMode === "thinking" ? (
              <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:20}}>
                <div style={{fontSize:13, color:"var(--gold)", letterSpacing:3, textTransform:"uppercase"}}>AI Director Thinking…</div>
                <div style={{width:52, height:52, border:"3px solid var(--gold)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite"}}/>
                <div style={{fontSize:15, color:"rgba(255,255,255,.4)", maxWidth:320, textAlign:"center", lineHeight:1.6}}>"{commentText}"</div>
              </div>

            ) : commentMode === "replied" ? (
              <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:20, maxWidth:580, width:"100%", padding:"0 32px"}}>
                <div style={{fontSize:11, color:"var(--gold)", letterSpacing:3, textTransform:"uppercase"}}>AI Director</div>
                <div style={{fontSize:17, color:"rgba(255,255,255,.9)", lineHeight:1.75, fontFamily:"'Georgia',serif", textAlign:"center",
                  background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.15)", borderRadius:12, padding:"20px 24px",
                  maxHeight:"35vh", overflowY:"auto"}}>
                  {aiReply}
                </div>
                <div style={{display:"flex", gap:12}}>
                  <button onClick={resumeAfterComment}
                    style={{padding:"12px 32px", background:"var(--gold)", color:"#000", border:"none", borderRadius:9, fontSize:16, fontWeight:700, cursor:"pointer", letterSpacing:.5}}>
                    ▶ Resume
                  </button>
                  <button onClick={() => { setCommentMode("listening"); setCommentText(""); setAiReply(""); startCommentRec(); }}
                    style={{padding:"12px 20px", background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.6)", border:"1px solid rgba(255,255,255,.15)", borderRadius:9, fontSize:15, cursor:"pointer"}}>
                    Follow up…
                  </button>
                  <button onClick={cancelComment}
                    style={{padding:"12px 20px", background:"transparent", color:"rgba(255,255,255,.35)", border:"1px solid rgba(255,255,255,.08)", borderRadius:9, fontSize:15, cursor:"pointer"}}>
                    Dismiss
                  </button>
                </div>
              </div>

            ) : (
              // listening or typing
              <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:18, maxWidth:520, width:"100%", padding:"0 28px"}}>
                <div style={{fontSize:12, color:"var(--gold)", letterSpacing:3, textTransform:"uppercase"}}>
                  {commentMode==="listening" ? "🎙 Pause & Comment" : "✏ Type Your Comment"}
                </div>

                {/* Mic orb */}
                {commentMode === "listening" && (
                  <div style={{position:"relative", display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <div className="ab-mic-pulse" style={{background:listenActive?"rgba(201,168,76,.2)":"rgba(255,255,255,.04)"}}>
                      🎙
                    </div>
                    {listenActive && (
                      <div style={{position:"absolute", width:120, height:120, borderRadius:"50%",
                        border:"2px solid rgba(201,168,76,.3)", animation:"ab-ring 1.5s ease-out infinite"}}/>
                    )}
                  </div>
                )}

                {/* Transcribed / typed text */}
                <div style={{width:"100%"}}>
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={e=>setCommentText(e.target.value)}
                    placeholder={commentMode==="listening" ? "Listening… speak or type your comment" : "Type your comment or instruction…"}
                    style={{width:"100%", minHeight:90, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.15)",
                      borderRadius:10, padding:"13px 16px", color:"rgba(255,255,255,.9)", fontSize:16, resize:"none", outline:"none",
                      fontFamily:"inherit", lineHeight:1.6, backdropFilter:"blur(8px)"}}
                    onKeyDown={e => { if (e.key==="Enter" && e.metaKey) sendComment(); }}
                  />
                  <div style={{fontSize:11, color:"rgba(255,255,255,.2)", marginTop:4, textAlign:"right"}}>⌘↵ to send</div>
                </div>

                {/* Context hint */}
                <div style={{fontSize:13, color:"rgba(255,255,255,.3)", textAlign:"center", lineHeight:1.6, maxWidth:380}}>
                  Paused at: <em style={{color:"rgba(255,255,255,.5)"}}>"{(curLine?.text||"").slice(0,60)}{(curLine?.text||"").length>60?"…":""}"</em>
                </div>

                {/* Mode switch */}
                <div style={{display:"flex", gap:8}}>
                  {commentMode==="listening" && (
                    <button onClick={()=>{recRef.current?.stop(); setCommentMode("typing"); setListenActive(false); setTimeout(()=>commentInputRef.current?.focus(),50);}}
                      style={{padding:"8px 18px", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:7, color:"rgba(255,255,255,.6)", fontSize:14, cursor:"pointer"}}>
                      ✏ Type instead
                    </button>
                  )}
                  {commentMode==="typing" && (
                    <button onClick={()=>{setCommentMode("listening"); startCommentRec();}}
                      style={{padding:"8px 18px", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:7, color:"rgba(255,255,255,.6)", fontSize:14, cursor:"pointer"}}>
                      🎙 Use mic
                    </button>
                  )}
                  <button onClick={sendComment} disabled={!commentText.trim()}
                    style={{padding:"8px 24px", background:commentText.trim()?"var(--gold)":"rgba(201,168,76,.2)", color:commentText.trim()?"#000":"rgba(201,168,76,.4)",
                      border:"none", borderRadius:7, fontSize:15, fontWeight:700, cursor:commentText.trim()?"pointer":"default", transition:"all .15s"}}>
                    Send to Director
                  </button>
                  <button onClick={cancelComment}
                    style={{padding:"8px 16px", background:"transparent", color:"rgba(255,255,255,.35)", border:"1px solid rgba(255,255,255,.08)", borderRadius:7, fontSize:14, cursor:"pointer"}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HEADER */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 22px",
          borderBottom:"1px solid rgba(255,255,255,.05)", flexShrink:0,
          background:"linear-gradient(180deg, rgba(0,0,0,.4) 0%, transparent 100%)"}}>
          <button onClick={()=>{stopAll(); setTab("editor");}}
            style={{background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", borderRadius:7,
              padding:"5px 13px", color:"rgba(255,255,255,.55)", fontSize:14, cursor:"pointer"}}>
            ← Script
          </button>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:ACC, letterSpacing:.3}}>{proj?.name}</div>
            <div style={{fontSize:12, color:"rgba(255,255,255,.3)", letterSpacing:.5}}>
              EP{String(selEp?.num||1).padStart(2,"0")} · {selEp?.title}
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{fontSize:12, color:"rgba(255,255,255,.25)", fontFamily:"'JetBrains Mono',monospace"}}>
              {curLineIdx+1}/{lines.length}
            </span>
            {voiceEngine !== "browser" && (
              <button
                onClick={generateAndSaveAllAudio}
                disabled={audioSavePhase==="saving"}
                title={state.supabaseUrl ? "Generate all lines & upload to Supabase" : "Generate all lines (connect Supabase to persist)"}
                style={{background:"rgba(74,173,117,.15)", border:"1px solid rgba(74,173,117,.3)", borderRadius:7,
                  padding:"5px 11px", color:"var(--green2)", fontSize:13, cursor:"pointer",
                  opacity: audioSavePhase==="saving" ? 0.5 : 1}}>
                {audioSavePhase==="saving" ? `${audioSavePct}%…` : "⬇ Save Audio"}
              </button>
            )}
          </div>
        </div>

        {/* ── TRANSCRIPT SCROLL */}
        <div style={{flex:1, overflowY:"auto", padding:"20px 32px", maxWidth:800, margin:"0 auto", width:"100%"}}>
          {lines.map((line, idx) => {
            const isActive = idx === curLineIdx;
            const isDone   = idx < curLineIdx;
            const lc       = getSpeakerColor(line.speaker);
            return (
              <div key={line.id} ref={isActive ? lineScrollRef : null}
                onClick={() => { stopAll(); setCurLineIdx(idx); }}
                style={{
                  padding:"10px 14px", marginBottom:6, borderRadius:9, cursor:"pointer",
                  border:`1px solid ${isActive ? "rgba(201,168,76,.3)" : "transparent"}`,
                  background: isActive ? "rgba(201,168,76,.07)" : "transparent",
                  opacity: isDone ? 0.3 : 1,
                  transition:"all .18s",
                }}>
                {line.type === "dialogue" && (
                  <div style={{fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
                    color: isActive ? lc : "rgba(255,255,255,.2)", marginBottom:4, fontFamily:"'JetBrains Mono',monospace",
                    transition:"color .2s"}}>
                    ▸ {line.speaker}
                    {loadingLine===line.id && <span style={{color:"var(--gold)", marginLeft:8, fontWeight:400}}>generating…</span>}
                  </div>
                )}
                {line.type === "narration" && isActive && (
                  <div style={{fontSize:10, color:"rgba(255,255,255,.2)", letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace"}}>
                    ◦ NARRATION
                  </div>
                )}
                <div style={{
                  fontSize: isActive ? 19 : line.type==="narration" ? 15 : 16,
                  color: isActive ? "rgba(255,255,255,.95)" : line.type==="narration" ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.72)",
                  lineHeight: 1.72,
                  fontStyle: line.type==="narration" ? "italic" : "normal",
                  fontFamily: line.type==="narration" ? "'Georgia',serif" : "'DM Sans',sans-serif",
                  paddingLeft: line.type==="dialogue" ? 10 : 0,
                  borderLeft: line.type==="dialogue" ? `2px solid ${isActive?lc:"rgba(255,255,255,.06)"}` : "none",
                  transition:"all .2s",
                }}>
                  {line.text}
                </div>
              </div>
            );
          })}
          <div style={{height:80}}/>
        </div>

        {/* ── WAVEFORM */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:2, height:44, padding:"0 24px", flexShrink:0}}>
          {waveBars.map((bar, i) => (
            <div key={i} style={{
              width:3, borderRadius:2, background:"var(--gold)",
              height: playing ? `${4 + bar.h * Math.abs(Math.sin(Date.now()/300 + i*0.5))}px` : "3px",
              opacity: playing ? (0.3 + 0.7 * Math.abs(Math.sin(i*0.45))) : 0.12,
              transition:"height .12s ease, opacity .2s",
              animationDelay:`${bar.delay}ms`,
            }}/>
          ))}
        </div>

        {/* ── PROGRESS */}
        <div style={{padding:"0 24px 0", flexShrink:0}}>
          <div style={{height:3, background:"rgba(255,255,255,.08)", borderRadius:2, cursor:"pointer"}}
            onClick={e => {
              const p = e.nativeEvent.offsetX / e.currentTarget.offsetWidth;
              stopAll(); setCurLineIdx(Math.max(0, Math.min(lines.length-1, Math.floor(p*lines.length))));
            }}>
            <div style={{height:"100%", background:ACC, width:`${pct}%`, borderRadius:2, transition:"width .3s"}}/>
          </div>
        </div>

        {/* ── CONTROLS */}
        <div style={{padding:"12px 24px 16px", flexShrink:0}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:14}}>
            {/* Rewind */}
            <button onClick={()=>{stopAll(); setCurLineIdx(Math.max(0,curLineIdx-5));}}
              style={{...btnStyle(38), fontSize:18}}>↺</button>

            {/* Prev */}
            <button onClick={()=>{stopAll(); setCurLineIdx(Math.max(0,curLineIdx-1));}}
              style={{...btnStyle(42), fontSize:17}}>◁</button>

            {/* Play/Pause */}
            <button onClick={handlePlayPause}
              style={{width:64, height:64, borderRadius:"50%", background:ACC, border:"none",
                color:"#000", fontSize:28, cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", boxShadow:`0 0 28px ${ACC}55`, transition:"all .15s",
                flexShrink:0}}>
              {playing ? "⏸" : "▶"}
            </button>

            {/* Next */}
            <button onClick={()=>{stopAll(); setCurLineIdx(Math.min(lines.length-1,curLineIdx+1));}}
              style={{...btnStyle(42), fontSize:17}}>▷</button>

            {/* Skip */}
            <button onClick={()=>{stopAll(); setCurLineIdx(Math.min(lines.length-1,curLineIdx+10));}}
              style={{...btnStyle(38), fontSize:18}}>↻</button>

            {/* Speed */}
            <button onClick={()=>setSpeed(s=>s===1.0?1.25:s===1.25?1.5:s===1.5?0.75:s===0.75?2.0:1.0)}
              style={{...btnStyle(null), padding:"6px 12px", borderRadius:7, fontFamily:"'JetBrains Mono',monospace", fontSize:14, minWidth:52}}>
              {speed}×
            </button>
          </div>

          {/* ── PAUSE & COMMENT hero button */}
          <button onClick={openComment}
            style={{width:"100%", padding:"13px 0", background:"rgba(201,168,76,.09)", border:"2px solid rgba(201,168,76,.3)",
              borderRadius:10, color:"var(--gold2)", fontSize:15, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10, letterSpacing:.8,
              transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.17)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(201,168,76,.09)"}>
            <span style={{fontSize:18}}>🎙</span>
            <span>Pause & Comment</span>
            <span style={{fontSize:12, fontWeight:400, opacity:.6, fontFamily:"'JetBrains Mono',monospace"}}>or say "pause and comment"</span>
          </button>
        </div>
      </div>
    );
  }

  // Helper for player round buttons
  function btnStyle(size) {
    return { width:size, height:size, borderRadius:"50%", background:"rgba(255,255,255,.07)",
      border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.7)", cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center", transition:"all .12s", flexShrink:0 };
  }

  // ════════════════════════════════════════════════════════
  // MAIN (non-player) VIEW
  // ════════════════════════════════════════════════════════
  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-t">🎧 Audiobook Studio</div>
          <div className="ph-s">Generate transcripts · Assign voices · Listen with AI Director commentary</div>
        </div>
        <div className="ph-r">
          {lines.length > 0 && (
            <button className="btn btn-gold btn-sm" onClick={()=>{stopAll();setCurLineIdx(0);setTab("player");}}>
              ▶ Open Player
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex", gap:0, marginBottom:20, borderBottom:"1px solid var(--ln2)"}}>
        {[["list","📚 Episodes"],["editor","📝 Transcript"],["voices","🎙 Voices"]].map(([id,label])=>(
          <button key={id} onClick={()=>{ stopAll(); setTab(id); }}
            style={{padding:"7px 20px", background:"transparent", border:"none",
              borderBottom:`2px solid ${tab===id?"var(--gold)":"transparent"}`,
              color:tab===id?"var(--gold)":"var(--t3)", fontSize:15, cursor:"pointer", marginBottom:-1}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── EPISODE LIST */}
      {tab==="list" && (
        <div>
          <div className="callout co-blue" style={{marginBottom:16, fontSize:14}}>
            Select an episode → AI Generate to create an audiobook transcript. Then assign voices and press Play.
          </div>

          {/* Voice Engine */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-t" style={{marginBottom:10}}>🔊 Voice Engine</div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              {[
                {id:"browser",    label:"🖥 Browser",      desc:"Free, instant",                   note:"Uses your OS voices"},
                {id:"openai",     label:"⚡ OpenAI TTS",   desc:state.openaiKey?"✓ Key set":"Needs key", note:"Natural quality · ~$0.015/1k chars"},
                {id:"elevenlabs", label:"🎭 ElevenLabs",   desc:state.elevenlabsKey?"✓ Key set":"Needs key", note:"Most expressive · free tier available"},
              ].map(eng=>(
                <button key={eng.id} onClick={()=>setVoiceEngine(eng.id)}
                  style={{flex:"1 1 140px", padding:"11px 14px", borderRadius:9, cursor:"pointer", textAlign:"left",
                    border:`2px solid ${voiceEngine===eng.id?"var(--gold)":"var(--ln)"}`,
                    background:voiceEngine===eng.id?"rgba(201,168,76,.08)":"var(--bg3)", transition:"all .15s"}}>
                  <div style={{fontWeight:700, fontSize:14, color:"var(--t1)", marginBottom:3}}>{eng.label}</div>
                  <div style={{fontSize:12, color:voiceEngine===eng.id?"var(--gold2)":"var(--t3)"}}>{eng.desc}</div>
                  <div style={{fontSize:11, color:"var(--t4)", marginTop:2}}>{eng.note}</div>
                </button>
              ))}
            </div>
            {voiceEngine==="openai" && !state.openaiKey && (
              <div className="callout co-amber" style={{marginTop:10, fontSize:13}}>Add your OpenAI key in Settings → API Keys.</div>
            )}
            {voiceEngine==="elevenlabs" && !state.elevenlabsKey && (
              <div className="callout co-amber" style={{marginTop:10, fontSize:13}}>Add your ElevenLabs key in Settings → API Keys.</div>
            )}
          </div>

          {eps.length===0 ? (
            <div className="callout co-gold">No episodes yet. Create episodes in the Episodes module first.</div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              {eps.map(ep => {
                const t = state.audioTranscripts.find(t=>t.epId===ep.id);
                const isSel = selEpId===ep.id;
                return (
                  <div key={ep.id} onClick={()=>setSelEpId(ep.id)}
                    style={{padding:"14px 16px", borderRadius:10, cursor:"pointer",
                      border:`1px solid ${isSel?"var(--gold)":"var(--ln)"}`,
                      background:isSel?"rgba(201,168,76,.06)":"var(--bg2)", transition:"all .15s",
                      display:"flex", alignItems:"center", gap:14}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:"var(--t3)", width:32, textAlign:"right", flexShrink:0}}>
                      {String(ep.num).padStart(2,"0")}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15, color:"var(--t1)", fontWeight:500}}>{ep.title}</div>
                      <div style={{fontSize:13, color:"var(--t3)", marginTop:2}}>
                        {ep.segments?.length||0} segs · {ep.vnPanels?.length||0} VN panels
                        {t && <span style={{color:"var(--green2)", marginLeft:8}}>✓ {t.lines.length} lines</span>}
                      </div>
                      {t && (() => {
                        const chars = (t.lines||[]).reduce((s,l)=>s+(l.text||"").length,0);
                        const cost  = estimateCost(chars, voiceEngine);
                        const staleCount = Object.values(t.staleAudio||{}).filter(Boolean).length;
                        const savedCount = Object.keys(t.audioUrls||{}).length;
                        const totalLines = t.lines?.length||0;
                        return (
                          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:5, alignItems:"center"}}>
                            <span style={{fontSize:11, fontFamily:"'JetBrains Mono',monospace",
                              background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)",
                              borderRadius:4, padding:"1px 6px", color:"var(--t3)"}}>
                              {chars.toLocaleString()} chars
                            </span>
                            {voiceEngine !== "browser" && (
                              <span style={{fontSize:11, fontFamily:"'JetBrains Mono',monospace",
                                background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.18)",
                                borderRadius:4, padding:"1px 6px", color:"var(--gold2)"}}>
                                ~${cost.toFixed(3)}
                              </span>
                            )}
                            {savedCount > 0 && staleCount === 0 && (
                              <span style={{fontSize:11, background:"rgba(80,200,120,.1)",
                                border:"1px solid rgba(80,200,120,.25)", borderRadius:4,
                                padding:"1px 6px", color:"var(--green2)"}}>
                                ✓ {savedCount}/{totalLines} saved
                              </span>
                            )}
                            {staleCount > 0 && (
                              <span style={{fontSize:11, background:"rgba(220,120,40,.12)",
                                border:"1px solid rgba(220,120,40,.3)", borderRadius:4,
                                padding:"1px 6px", color:"#e8854a"}}>
                                ⚠ {staleCount} line{staleCount!==1?"s":""} need re-gen
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {t ? (
                      <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                        <button className="btn btn-sm btn-ghost" onClick={e=>{e.stopPropagation();stopAll();setSelEpId(ep.id);setTab("editor");}}>Edit</button>
                        {voiceEngine !== "browser" && (
                          <button className="btn btn-sm btn-ghost"
                            style={{borderColor:"var(--green2)",color:"var(--green2)"}}
                            disabled={audioSavePhase==="saving"}
                            onClick={e=>{e.stopPropagation();setSelEpId(ep.id);generateAndSaveAllAudio();}}>
                            {audioSavePhase==="saving" && isSel ? `${audioSavePct}%…` : "⬇ Save Audio"}
                          </button>
                        )}
                        <button className="btn btn-sm btn-gold" onClick={e=>{e.stopPropagation();setSelEpId(ep.id);stopAll();setCurLineIdx(0);setTab("player");}}>▶ Play</button>
                      </div>
                    ) : isSel ? (
                      <div style={{display:"flex", gap:6}}>
                        <button className="btn btn-sm btn-ghost" disabled={genPhase==="generating"}
                          onClick={e=>{e.stopPropagation();generateTranscript(false);}}>Quick Parse</button>
                        <button className="btn btn-sm btn-gold" disabled={genPhase==="generating"||!apiKey}
                          onClick={e=>{e.stopPropagation();generateTranscript(true);}}>
                          {genPhase==="generating"?`${genPct}%…`:"✦ AI Generate"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {genPhase==="generating" && (
            <div className="card" style={{marginTop:16}}>
              <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:10}}>
                <div style={{width:28, height:28, border:"2px solid var(--gold)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite"}}/>
                <div style={{fontSize:15, color:"var(--gold)"}}>{genMsg}</div>
              </div>
              <div style={{height:4, background:"var(--bg4)", borderRadius:2}}>
                <div style={{height:"100%", background:"var(--gold)", width:`${genPct}%`, borderRadius:2, transition:"width .4s"}}/>
              </div>
            </div>
          )}
          {genPhase==="error" && <div className="callout co-red" style={{marginTop:12}}>{genErr}</div>}

          {audioSavePhase==="saving" && (
            <div className="card" style={{marginTop:16}}>
              <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:10}}>
                <div style={{width:28, height:28, border:"2px solid var(--green2)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite"}}/>
                <div style={{fontSize:15, color:"var(--green2)"}}>{audioSaveMsg}</div>
              </div>
              <div style={{height:4, background:"var(--bg4)", borderRadius:2}}>
                <div style={{height:"100%", background:"var(--green2)", width:`${audioSavePct}%`, borderRadius:2, transition:"width .3s"}}/>
              </div>
            </div>
          )}
          {(audioSavePhase==="done"||audioSavePhase==="error") && (
            <div className={`callout ${audioSavePhase==="done"?"co-green":"co-red"}`} style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>{audioSaveMsg}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>setAudioSavePhase("idle")}>✕</button>
            </div>
          )}
        </div>
      )}

      {/* ── TRANSCRIPT EDITOR */}
      {tab==="editor" && (
        <div>
          {!selEp ? (
            <div className="callout co-gold">Select an episode first.</div>
          ) : !transcript ? (
            <div>
              <div className="callout co-gold" style={{marginBottom:12}}>No transcript yet for EP{selEp.num}: {selEp.title}.</div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn btn-ghost" onClick={()=>generateTranscript(false)}>Quick Parse</button>
                <button className="btn btn-gold" disabled={!apiKey} onClick={()=>generateTranscript(true)}>✦ AI Generate</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
                <div style={{fontSize:15, color:"var(--t2)"}}>
                  EP{selEp.num}: <strong>{selEp.title}</strong>
                  <span style={{color:"var(--t3)", marginLeft:8}}>{lines.length} lines</span>
                </div>
                <div style={{display:"flex", gap:7}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>generateTranscript(true)} disabled={!apiKey}>↺ Regenerate</button>
                  <button className="btn btn-gold btn-sm" onClick={()=>{stopAll();setCurLineIdx(0);setTab("player");}}>▶ Play</button>
                </div>
              </div>

              {/* ── Char count / cost / audio status bar */}
              {(() => {
                const totalChars  = lines.reduce((s,l)=>s+(l.text||"").length,0);
                const dialChars   = lines.filter(l=>l.type==="dialogue").reduce((s,l)=>s+(l.text||"").length,0);
                const narrChars   = lines.filter(l=>l.type==="narration").reduce((s,l)=>s+(l.text||"").length,0);
                const cost        = estimateCost(totalChars, voiceEngine);
                const staleLines  = Object.entries(transcript.staleAudio||{}).filter(([,v])=>v).map(([k])=>k);
                const savedUrls   = transcript.audioUrls||{};
                const savedCount  = Object.keys(savedUrls).length;
                const hasSaved    = savedCount > 0;
                return (
                  <div style={{background:"var(--bg2)", border:"1px solid var(--ln)", borderRadius:10,
                    padding:"12px 16px", marginBottom:14, display:"flex", flexWrap:"wrap", gap:14, alignItems:"center"}}>
                    {/* Char breakdown */}
                    <div style={{display:"flex", flexDirection:"column", gap:2}}>
                      <div style={{fontSize:11, color:"var(--t4)", letterSpacing:.8, textTransform:"uppercase"}}>Characters</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:18, color:"var(--t1)", fontWeight:700}}>
                        {totalChars.toLocaleString()}
                      </div>
                      <div style={{fontSize:11, color:"var(--t3)"}}>
                        {dialChars.toLocaleString()} dialogue · {narrChars.toLocaleString()} narration
                      </div>
                    </div>

                    <div style={{width:1, height:40, background:"var(--ln)", flexShrink:0}}/>

                    {/* Cost estimate */}
                    <div style={{display:"flex", flexDirection:"column", gap:2}}>
                      <div style={{fontSize:11, color:"var(--t4)", letterSpacing:.8, textTransform:"uppercase"}}>Est. Cost</div>
                      {voiceEngine === "browser" ? (
                        <div style={{fontSize:18, color:"var(--green2)", fontWeight:700}}>Free</div>
                      ) : (
                        <>
                          <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:18, color:"var(--gold)", fontWeight:700}}>
                            ${cost.toFixed(3)}
                          </div>
                          <div style={{fontSize:11, color:"var(--t3)"}}>
                            {VOICE_COSTS[voiceEngine]?.label} · ${VOICE_COSTS[voiceEngine]?.rate}/1k chars
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{width:1, height:40, background:"var(--ln)", flexShrink:0}}/>

                    {/* Audio save status */}
                    <div style={{display:"flex", flexDirection:"column", gap:2, flex:1}}>
                      <div style={{fontSize:11, color:"var(--t4)", letterSpacing:.8, textTransform:"uppercase"}}>Voice Audio</div>
                      {voiceEngine === "browser" ? (
                        <div style={{fontSize:13, color:"var(--t3)"}}>Browser TTS — no caching</div>
                      ) : !hasSaved ? (
                        <div style={{fontSize:13, color:"var(--t3)"}}>Not yet generated · play to generate &amp; save</div>
                      ) : staleLines.length > 0 ? (
                        <div style={{display:"flex", flexDirection:"column", gap:4}}>
                          <div style={{display:"flex", alignItems:"center", gap:8}}>
                            <span style={{fontSize:13, color:"#e8854a", fontWeight:600}}>
                              ⚠ {staleLines.length} line{staleLines.length!==1?"s":""} out of date
                            </span>
                            <span style={{fontSize:12, color:"var(--t3)"}}>({savedCount}/{lines.length} saved)</span>
                          </div>
                          <div style={{fontSize:11, color:"var(--t4)"}}>
                            Transcript or voice changed — play to regenerate flagged lines
                          </div>
                        </div>
                      ) : (
                        <div style={{display:"flex", alignItems:"center", gap:8}}>
                          <span style={{fontSize:13, color:"var(--green2)", fontWeight:600}}>✓ {savedCount}/{lines.length} lines saved</span>
                          {state.supabaseUrl ? (
                            <span style={{fontSize:11, color:"var(--t4)"}}>· stored in Supabase</span>
                          ) : (
                            <span style={{fontSize:11, color:"var(--t4)"}}>· in-session cache (add Supabase to persist)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div style={{display:"flex", flexDirection:"column", gap:6}}>
                {lines.map((line,idx) => (
                  <div key={line.id} style={{display:"flex", gap:10, padding:"10px 14px", borderRadius:8,
                    background:"var(--bg2)", border:"1px solid var(--ln)", alignItems:"flex-start"}}>
                    <div style={{fontSize:12, color:"var(--t4)", fontFamily:"'JetBrains Mono',monospace", paddingTop:3, width:28, flexShrink:0}}>
                      {idx+1}
                    </div>
                    <div style={{fontSize:11, padding:"2px 8px", borderRadius:20, flexShrink:0, marginTop:2,
                      background:line.type==="narration"?"rgba(255,255,255,.05)":"rgba(201,168,76,.1)",
                      color:line.type==="narration"?"var(--t3)":"var(--gold)"}}>
                      {line.type==="narration"?"NARR":"DLGUE"}
                    </div>
                    <div style={{flex:1}}>
                      {line.type==="dialogue" && (
                        <div style={{fontSize:12, color:getSpeakerColor(line.speaker), fontWeight:700,
                          letterSpacing:1, textTransform:"uppercase", marginBottom:3}}>{line.speaker}</div>
                      )}
                      <textarea
                        value={line.text}
                        onChange={e=>dispatch({type:"UPDATE_TRANSCRIPT_LINE",transcriptId:transcript.id,lineId:line.id,patch:{text:e.target.value}})}
                        style={{width:"100%", background:"transparent", border:"none", color:"var(--t1)", fontSize:14,
                          fontStyle:line.type==="narration"?"italic":"normal",
                          fontFamily:line.type==="narration"?"'Georgia',serif":"inherit",
                          resize:"none", outline:"none", lineHeight:1.6, minHeight:36}}
                        rows={Math.max(1, Math.ceil(line.text.length/80))}
                      />
                    </div>
                    <div style={{display:"flex", gap:4, flexShrink:0, alignItems:"flex-start"}}>
                      {/* Stale / saved indicator */}
                      {voiceEngine !== "browser" && (() => {
                        const isStale  = !!(transcript.staleAudio?.[line.id]);
                        const isSaved  = !!(transcript.audioUrls?.[line.id]);
                        if (isStale) return (
                          <div title="Voice audio out of date — will regenerate on play"
                            style={{width:8, height:8, borderRadius:"50%", background:"#e8854a",
                              marginTop:10, flexShrink:0, boxShadow:"0 0 5px #e8854a88"}}/>
                        );
                        if (isSaved) return (
                          <div title="Voice audio saved"
                            style={{width:8, height:8, borderRadius:"50%", background:"var(--green2)",
                              marginTop:10, flexShrink:0}}/>
                        );
                        return <div style={{width:8, flexShrink:0}}/>;
                      })()}
                      <button onClick={()=>{stopAll();setCurLineIdx(idx);isPlayingRef.current=true;setPlaying(true);playLine(idx);}}
                        style={{background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:5, width:28, height:28, color:"rgba(255,255,255,.5)", fontSize:12, cursor:"pointer"}}>▶</button>
                      <button onClick={()=>{
                        const nl=lines.filter((_,i)=>i!==idx);
                        const newUrls = {...(transcript.audioUrls||{})};
                        const newStale = {...(transcript.staleAudio||{})};
                        delete newUrls[line.id]; delete newStale[line.id];
                        dispatch({type:"SAVE_TRANSCRIPT",transcript:{...transcript,lines:nl,audioUrls:newUrls,staleAudio:newStale}});
                      }} style={{background:"rgba(208,80,80,.08)", border:"1px solid rgba(208,80,80,.2)", borderRadius:5, width:28, height:28, color:"var(--red2)", fontSize:12, cursor:"pointer"}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={()=>{
                const nl={id:`l${Date.now()}`,type:"narration",speaker:"Narrator",charId:null,text:""};
                dispatch({type:"SAVE_TRANSCRIPT",transcript:{...transcript,lines:[...lines,nl]}});
              }} style={{marginTop:12, width:"100%", padding:10, background:"transparent", border:"1px dashed var(--ln)", borderRadius:8, color:"var(--t3)", fontSize:14, cursor:"pointer"}}>
                + Add Line
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── VOICE ASSIGNMENT */}
      {tab==="voices" && (
        <div>
          <div className="callout co-blue" style={{marginBottom:16, fontSize:14}}>
            Assign a voice to each character. Changes apply on next playback — no audio regeneration needed.
          </div>
          {!transcript ? (
            <div className="callout co-gold">Generate a transcript first.</div>
          ) : (
            <div>
              <div style={{display:"flex", justifyContent:"flex-end", marginBottom:12}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>{
                  const nm=autoAssignVoices(chars,voiceEngine,{});
                  dispatch({type:"SET_VOICE_MAP",transcriptId:transcript.id,voiceMap:nm});
                }}>⟳ Auto-assign</button>
              </div>
              {allSpeakers.map(speaker => {
                const char=chars.find(c=>c.name===speaker);
                const cv=voiceMap[speaker]||"";
                return (
                  <div key={speaker} className="card" style={{marginBottom:10}}>
                    <div style={{display:"flex", alignItems:"center", gap:14}}>
                      <div style={{width:42, height:42, borderRadius:8, background:"var(--bg4)", flexShrink:0,
                        overflow:"hidden", border:`2px solid ${getSpeakerColor(speaker)}`}}>
                        {char?.avatarUrl ? (
                          <img src={char.avatarUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        ) : (
                          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                            {speaker==="Narrator"?"📖":speaker[0]}
                          </div>
                        )}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700, color:getSpeakerColor(speaker), marginBottom:6}}>{speaker}</div>
                        <select value={cv}
                          onChange={e=>dispatch({type:"SET_VOICE_MAP",transcriptId:transcript.id,voiceMap:{[speaker]:e.target.value}})}
                          style={{width:"100%", background:"var(--bg3)", border:"1px solid var(--ln)", borderRadius:7,
                            padding:"6px 10px", color:"var(--t1)", fontSize:14, outline:"none"}}>
                          <option value="">— Select voice —</option>
                          {VOICE_LIST.map(v=>(
                            <option key={v.id} value={v.id}>{v.label} · {v.desc}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              {allSpeakers.length===0 && <div className="callout co-gold">No speakers found. Generate a transcript first.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AutoQueueModal({ state, dispatch, onClose }) {
  const proj = state.projects.find(p => p.id === state.activeProject);
  const eps  = state.episodes.filter(e => e.project === state.activeProject).sort((a,b) => a.num - b.num);
  const hasClaude  = !!state.apiKey;
  const hasJimeng  = !!state.jimengKey;

  // queue state: { [epId]: { status: "pending"|"running"|"done"|"error", msg, pct } }
  const [queue,    setQueue]    = useState(() => Object.fromEntries(eps.map(e => [e.id, { status:"pending", msg:"", pct:0 }])));
  const [running,  setRunning]  = useState(false);
  const [started,  setStarted]  = useState(false);
  const [mode,     setMode]     = useState("auto"); // "auto" | "manual"
  const cancelRef = useRef(false);

  const setEpS = (id, patch) => setQueue(q => ({ ...q, [id]: { ...q[id], ...patch } }));

  const runAll = async () => {
    if (!hasClaude) return;
    cancelRef.current = false;
    setRunning(true);
    setStarted(true);
    for (const ep of eps) {
      if (cancelRef.current) break;
      setEpS(ep.id, { status:"running", msg:"Starting…", pct:5 });
      try {
        await autoGenerateEpisode({
          state,
          dispatch,
          epId: ep.id,
          onStatus: (msg, pct) => setEpS(ep.id, { status:"running", msg, pct }),
        });
        setEpS(ep.id, { status:"done", msg: hasJimeng ? "Videos submitted" : "Prompts ready", pct:100 });
      } catch(err) {
        setEpS(ep.id, { status:"error", msg: err.message, pct:0 });
        // continue with next episode
      }
      await new Promise(r => setTimeout(r, 200)); // small pause between episodes
    }
    setRunning(false);
  };

  const doneCount  = Object.values(queue).filter(q => q.status === "done").length;
  const errorCount = Object.values(queue).filter(q => q.status === "error").length;
  const totalEps   = eps.length;
  const scriptedEps = eps.filter(e => e.segments?.length > 0).length;
  const stubEps = totalEps - scriptedEps;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && !running && onClose()}>
      <div style={{ background:"var(--bg2)", border:"1px solid rgba(201,168,76,0.35)", borderRadius:16,
        width:"90vw", maxWidth:700, maxHeight:"88vh", display:"flex", flexDirection:"column",
        overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid var(--ln)", flexShrink:0,
          background:"linear-gradient(135deg, rgba(201,168,76,0.07), rgba(201,168,76,0.02))" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:25, color:"var(--gold2)", fontWeight:700 }}>
                ✦ Project Ready — Generate All Episodes
              </div>
              <div style={{ fontSize:15, color:"var(--t3)", marginTop:4 }}>
                {proj?.name} · {totalEps} episodes · {scriptedEps} scripted · {stubEps} stubs awaiting content
              </div>
            </div>
            {!running && <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>}
          </div>

          {/* Mode toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14 }}>
            <div style={{ fontSize:14, color:"var(--t3)" }}>Generation mode:</div>
            <div style={{ display:"flex", background:"var(--bg3)", borderRadius:7, padding:2, border:"1px solid var(--ln)" }}>
              <button
                className={`btn btn-sm ${mode==="auto" ? "btn-gold" : ""}`}
                style={{ borderRadius:5, padding:"3px 12px", fontSize:14 }}
                onClick={() => setMode("auto")}
                title="AI writes episode content then immediately submits each segment to Seedance 2.0"
                disabled={running}
              >✦ Auto</button>
              <button
                className={`btn btn-sm ${mode==="manual" ? "btn-gold" : ""}`}
                style={{ borderRadius:5, padding:"3px 12px", fontSize:14 }}
                onClick={() => setMode("manual")}
                title="AI writes prompts only — use Prompt Sheet to copy-paste to Jimeng manually"
                disabled={running}
              >📋 Manual</button>
            </div>
            <div style={{ fontSize:14, color: mode==="auto" ? "var(--green2)" : "var(--amber2)", flex:1 }}>
              {mode==="auto"
                ? (hasJimeng ? "AI writes + Seedance 2.0 generates each video automatically" : "AI writes prompts (no Jimeng key — will skip video submission)")
                : "AI writes all segment prompts → use Prompt Sheet to generate manually"}
            </div>
          </div>
        </div>

        {/* Episode queue */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
          {!hasClaude && (
            <div className="callout co-red" style={{ marginBottom:14 }}>
              ⚠ No Claude API key — episode writing won't work. Add it in <strong>Settings → API Keys</strong>, then click Generate.
            </div>
          )}
          {started && (
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, color:"var(--t3)", marginBottom:12 }}>
              <span>{doneCount}/{totalEps} episodes complete</span>
              {errorCount > 0 && <span style={{ color:"var(--red2)" }}>{errorCount} errors — will continue to next episode</span>}
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Ep</th>
                <th>Title</th>
                <th>Status</th>
                <th>Segs</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {eps.map(e => {
                const qs = queue[e.id] || { status:"pending" };
                const hasSegs = (e.segments?.length || 0) > 0;
                const segsLoaded = e.segments?.length || 0;
                const segsDone = e.segments?.filter(s => s.status==="done").length || 0;
                const statusColor = { done:"var(--green2)", running:"var(--blue2)", error:"var(--red2)", pending:"var(--t4)" };
                return (
                  <tr key={e.id}>
                    <td><span className="mono" style={{ fontSize:13 }}>{String(e.num).padStart(3,"0")}</span></td>
                    <td>
                      <span style={{ fontFamily:"Cormorant Garamond,serif", color:"var(--t1)" }}>{e.title}</span>
                      {!hasSegs && <span style={{ fontSize:12, color:"var(--t4)", marginLeft:6 }}>stub</span>}
                    </td>
                    <td>
                      {qs.status === "pending" && <span style={{ fontSize:14, color:"var(--t4)" }}>—</span>}
                      {qs.status === "running" && <span style={{ fontSize:14, color:"var(--blue2)" }}>⟳ {qs.msg}</span>}
                      {qs.status === "done"    && <span style={{ fontSize:14, color:"var(--green2)" }}>✓ {qs.msg}</span>}
                      {qs.status === "error"   && <span style={{ fontSize:14, color:"var(--red2)" }} title={qs.msg}>✗ Error</span>}
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize:13 }}>{segsLoaded || <span style={{ color:"var(--t4)" }}>—</span>}</span>
                    </td>
                    <td style={{ width:110 }}>
                      {qs.status === "running" && (
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div className="prog-track" style={{ flex:1 }}>
                            <div className="prog-fill" style={{ width:`${qs.pct}%`, background:"var(--gold)" }}/>
                          </div>
                          <span style={{ fontSize:12, color:"var(--t3)", fontFamily:"JetBrains Mono,monospace" }}>{qs.pct}%</span>
                        </div>
                      )}
                      {qs.status === "done" && segsLoaded > 0 && (
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div className="prog-track" style={{ flex:1 }}>
                            <div className="prog-fill" style={{ width:`${segsDone/segsLoaded*100}%`, background:"var(--green)" }}/>
                          </div>
                          <span style={{ fontSize:12, color:"var(--green2)", fontFamily:"JetBrains Mono,monospace" }}>{segsDone}/{segsLoaded}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid var(--ln)", flexShrink:0,
          display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--bg)" }}>
          <div style={{ fontSize:14, color:"var(--t3)" }}>
            {!started
              ? `${totalEps} episodes · ${scriptedEps} already scripted · ${stubEps} need writing`
              : running
                ? `Generating ${doneCount + 1} of ${totalEps}…`
                : `${doneCount} complete · ${errorCount} errors`}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" disabled={running} onClick={onClose}>
              {started && doneCount > 0 ? "Done" : "Skip for now"}
            </button>
            {running ? (
              <button className="btn btn-red btn-sm" onClick={() => { cancelRef.current = true; setRunning(false); }}>
                ⏹ Stop
              </button>
            ) : (
              <button className="btn btn-gold" disabled={!hasClaude} onClick={runAll}>
                {started && doneCount > 0
                  ? `✦ Continue (${totalEps - doneCount} remaining)`
                  : `✦ Generate All ${totalEps} Episodes`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUPABASE CONFIG — set these to your project values
// ═══════════════════════════════════════════════════════════════════
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Expose globally so LoginPage can use them without prop drilling
window.__DRAMA_SB_URL = SUPABASE_URL;
window.__DRAMA_SB_KEY = SUPABASE_ANON_KEY;

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth gate — check for existing session on mount
  const [authedUser, setAuthedUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cc = getSupabaseCreateClient();
        if (!cc) { setAuthChecking(false); return; }
        const sb = cc(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          setAuthedUser({
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || session.user.email?.split("@")[0],
            session,
          });
        }
        // Listen for auth changes (magic link, sign out from another tab, etc.)
        const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            setAuthedUser({
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.display_name || session.user.email?.split("@")[0],
              session,
            });
          } else if (event === "SIGNED_OUT") {
            setAuthedUser(null);
          }
        });
        // Cleanup on unmount
        window.__dramaAuthUnsub = () => subscription.unsubscribe();
      } catch (e) {
        console.warn("[Auth] Session restore failed:", e);
      }
      setAuthChecking(false);
    })();
    return () => { window.__dramaAuthUnsub?.(); };
  }, []);

  // Show loading state while checking auth
  if (authChecking) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:"var(--gold2)",fontWeight:700,marginBottom:8}}>Drama Studio</div>
            <div style={{color:"var(--t3)",fontSize:14}}>Loading...</div>
          </div>
        </div>
      </>
    );
  }

  // Show login page if not authenticated
  if (!authedUser) {
    return (
      <>
        <style>{CSS}</style>
        <LoginPage onAuth={(user) => setAuthedUser(user)} />
      </>
    );
  }

  return <AppMain authedUser={authedUser} onSignOut={() => {
    const cc = getSupabaseCreateClient();
    if (cc) { const sb = cc(SUPABASE_URL, SUPABASE_ANON_KEY); sb.auth.signOut(); }
    localStorage.removeItem("ds_session");
    setAuthedUser(null);
  }} />;
}

function AppMain({ authedUser, onSignOut }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (s) => {
    try {
      const saved   = JSON.parse(localStorage.getItem("ds_state")||"{}");
      const gSaved  = JSON.parse(localStorage.getItem("ds_gemini")||"{}");
      const base    = { ...s, apiKey: saved.apiKey||"", supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY, geminiKey: gSaved.key||"" };

      // Restore full state from localStorage if available
      const fullSaved = JSON.parse(localStorage.getItem("ds_full")||"{}");
      if (fullSaved.projects?.length) {
        return {
          ...base,
          projects:      fullSaved.projects,
          bible:         fullSaved.bible      || s.bible,
          episodes:      fullSaved.episodes   || [],
          assets:        fullSaved.assets     || [],
          activeProject: fullSaved.activeProject || fullSaved.projects[0]?.id,
          activeEpisode: fullSaved.activeEpisode || null,
          view:          fullSaved.view        || "dashboard",
          imageEngine:   fullSaved.imageEngine  || "nanoBanana2",
          openaiKey:     fullSaved.openaiKey    || "",
          jimengKey:     fullSaved.jimengKey    || "",
          jimengModel:   fullSaved.jimengModel  || "seedance_v2",
          jimengRes:     fullSaved.jimengRes    || "720p",
          jimengAspect:  fullSaved.jimengAspect || "9:16",
          elevenlabsKey: fullSaved.elevenlabsKey || "",
          audioTranscripts: fullSaved.audioTranscripts || [],
        };
      }
      // If localStorage has user data (old format), use it
      if (saved.projects?.length) return base;

      // Preload The House of High Fashion demo project
      return {
        ...base,
        activeProject: "thohf",
        activeEpisode: "thohf_ep01",
        view: "dashboard",
        projects: [THOHF_PROJECT],
        bible: THOHF_BIBLE,
        episodes: THOHF_EPISODES,
        assets: THOHF_ASSETS,
      };
    } catch { return s; }
  });

  // ── Set current user from auth gate on mount
  useEffect(() => {
    if (authedUser) {
      dispatch({ type: "SET_CURRENT_USER", user: { id: authedUser.id, email: authedUser.email, displayName: authedUser.displayName } });
    }
  }, [authedUser]);

  // ── On mount: restore VN panel images AND character avatars from IndexedDB
  useEffect(() => {
    (async () => {
      try {
        // ── VN panel images ──
        const vnAll = await idbLoadPrefix("vni:");
        const byEp = {};
        for (const [key, dataUrl] of Object.entries(vnAll)) {
          const [, epId, panelId] = key.split(":");
          if (!epId || !panelId || !dataUrl) continue;
          if (!byEp[epId]) byEp[epId] = {};
          byEp[epId][panelId] = dataUrl;
        }
        for (const [epId, images] of Object.entries(byEp)) {
          for (const [panelId, dataUrl] of Object.entries(images)) {
            dispatch({ type: "SAVE_VN_IMAGE", epId, panelId, dataUrl });
          }
        }
        if (Object.keys(byEp).length) console.log("[IDB] Restored VN images for episodes:", Object.keys(byEp));

        // ── Character avatars ──
        // Key format: "avi:{charId}:{histId}"  value: dataUrl
        const avAll = await idbLoadPrefix("avi:");
        // Group by charId → array of {histId, dataUrl} sorted by histId (which is timestamp-based)
        const byChar = {};
        for (const [key, dataUrl] of Object.entries(avAll)) {
          const [, charId, histId] = key.split(":");
          if (!charId || !histId || !dataUrl) continue;
          if (!byChar[charId]) byChar[charId] = [];
          byChar[charId].push({ histId, dataUrl });
        }
        for (const [charId, entries] of Object.entries(byChar)) {
          // Sort newest first (histId contains timestamp)
          entries.sort((a, b) => b.histId.localeCompare(a.histId));
          // Reconstruct avatarHistory array and set active avatarUrl
          const avatarHistory = entries.slice(0, 5).map((e, i) => ({
            id:        e.histId,
            dataUrl:   e.dataUrl,
            style:     "generated",
            createdAt: new Date().toISOString(),
          }));
          dispatch({ type: "RESTORE_CHAR_AVATARS", charId, avatarHistory, avatarUrl: avatarHistory[0].dataUrl });
        }
        if (Object.keys(byChar).length) console.log("[IDB] Restored avatars for characters:", Object.keys(byChar));
      } catch(e) { console.warn("[IDB] hydrate failed:", e); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [showGenerator,     setShowGenerator]     = useState(false);
  const [showBookGenerator, setShowBookGenerator] = useState(false);
  const [showEpGenerator,   setShowEpGenerator]   = useState(false);
  const [showManualNew,     setShowManualNew]      = useState(false);
  const [showAuthModal,  setShowAuthModal]   = useState(false);
  const [showAutoQueue,  setShowAutoQueue]   = useState(false); // auto-pipeline after project commit

  const proj  = state.projects.find(p=>p.id===state.activeProject);
  const ep    = state.episodes.find(e=>e.id===state.activeEpisode);
  const segs  = ep?.segments||[];
  const doneS = segs.filter(s=>s.status==="done").length;

  // ── Supabase sync
  const { saveToServer, pushAllToServer, loadFromServer, saveImageToServer, listProjectsFromServer, loadProjectById } = useSupabaseSync(state, dispatch);
  const [showSyncModal, setShowSyncModal] = useState(false);
  // Expose for manual sync button in Settings
  useEffect(() => { window._dsLoadFromServer = loadFromServer; }, [loadFromServer]);
  useEffect(() => { window._dsListProjects = listProjectsFromServer; }, [listProjectsFromServer]);
  useEffect(() => { window._dsLoadProject = loadProjectById; }, [loadProjectById]);
  useEffect(() => { window._dsShowSyncModal = () => setShowSyncModal(true); }, []);
  useEffect(() => { window._dsSaveToServer = () => saveToServer(state); }, [state, saveToServer]);
  useEffect(() => { window._dsPushAll = () => pushAllToServer(state); }, [state, pushAllToServer]);

  // Auto-save 1.5s after any change (except UI-only state)
  const saveTimer = useRef(null);
  const prevState = useRef(state);
  useEffect(() => {
    const mutableChanged =
      prevState.current.projects         !== state.projects      ||
      prevState.current.bible            !== state.bible         ||
      prevState.current.episodes         !== state.episodes      ||
      prevState.current.assets           !== state.assets        ||
      prevState.current.audioTranscripts !== state.audioTranscripts ||
      prevState.current._forceSyncAt     !== state._forceSyncAt;
    prevState.current = state;
    if (mutableChanged) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        // Save structure to localStorage (without images — they go to IndexedDB)
        try {
          const epsNoImages = state.episodes.map(({ vnImages, vnImageHistory, ...rest }) => rest);
          // Strip generated avatar data from characters — stored in IDB instead
          const bibleNoAvatars = {
            ...state.bible,
            characters: state.bible.characters.map(({ avatarUrl, avatarHistory, ...rest }) => rest),
          };
          localStorage.setItem("ds_full", JSON.stringify({
            projects:      state.projects,
            bible:         bibleNoAvatars,
            episodes:      epsNoImages,
            assets:        state.assets,
            activeProject: state.activeProject,
            activeEpisode: state.activeEpisode,
            view:          state.view,
            imageEngine:   state.imageEngine,
            openaiKey:     state.openaiKey,
            jimengKey:     state.jimengKey     || "",
            jimengModel:   state.jimengModel   || "seedance_v2",
            jimengRes:     state.jimengRes     || "720p",
            jimengAspect:  state.jimengAspect  || "9:16",
            elevenlabsKey: state.elevenlabsKey || "",
            audioTranscripts: state.audioTranscripts || [],
          }));
        } catch(e) { console.error("[AutoSave] localStorage failed:", e); }
        // Also sync to Supabase if configured
        if (state.supabaseUrl && state.activeProject) saveToServer(state);
      }, 1500);
    }
  }, [state]);

  // ── Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key==="z" && !e.shiftKey) { e.preventDefault(); dispatch({type:"UNDO"}); }
      if (ctrl && e.key==="z" && e.shiftKey)  { e.preventDefault(); dispatch({type:"REDO"}); }
      if (ctrl && e.key==="y")                { e.preventDefault(); dispatch({type:"REDO"}); }
      if (ctrl && e.key==="e")                { e.preventDefault();
        const data = {projects:state.projects,bible:state.bible,episodes:state.episodes,assets:state.assets,exportedAt:new Date().toISOString(),version:"drama-studio-v2"};
        const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
        const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`drama-studio-${new Date().toISOString().slice(0,10)}.json`; a.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state]);

  const NAV_ITEMS = [
    {id:"dashboard", icon:"⊞", label:"Dashboard"},
    {id:"bible",     icon:"📖", label:"Story Bible",    badge:state.bible.bibleChangelog.length||null},
    {id:"assets",    icon:"🗂",  label:"IP Assets",      badge:state.assets.filter(a=>a.project===state.activeProject).length||null},
    {id:"episodes",  icon:"🎬", label:"Episodes"},
    {id:"audiobook", icon:"🎧", label:"Audiobook",       badge:state.audioTranscripts.filter(t=>t.projectId===state.activeProject).length||null},
    {id:"publish",   icon:"📡", label:"Publish",         badge:state.publishJobs.filter(j=>j.status==="scheduled").length||null},
    {id:"website",   icon:"🌐", label:"Website",},
    {id:"team",      icon:"👥", label:"Team",            badge:state.teamMembers.length||null},
    {id:"ripple",    icon:"🌊", label:"Ripple Engine"},
    {id:"settings",  icon:"⚙",  label:"Settings"},
  ];

  const CRUMBS = {
    dashboard: [],
    bible:    [{label:"Bible"}],
    assets:   [{label:"Assets"}],
    episodes: ep ? [{label:"Episodes",view:"episodes",clearEp:true},{label:`EP${String(ep.num).padStart(3,"0")} · ${ep.title}`}] : [{label:"Episodes"}],
    audiobook:[{label:"Audiobook Studio"}],
    publish:  [{label:"Publish & Distribution"}],
    website:  [{label:"Project Website"}],
    team:     [{label:"Team"}],
    ripple:   [{label:"Ripple Engine"}],
    settings: [{label:"Settings"}],
  };

  const changedChars = state.bible.characters.filter(c=>c.flags?.includes("changed")).length;
  const canUndo = state.undoStack?.length > 0;
  const canRedo = state.redoStack?.length > 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="logo-word">Nekoi Studio</div>
            <div className="logo-sub">Production OS</div>
          </div>

          <div style={{overflowY:"auto",flex:1}}>
            <div className="nav-section">Modules</div>
            {NAV_ITEMS.map(item=>(
              <div key={item.id} className={`nav-item ${state.view===item.id?"on":""}`}
                onClick={()=>dispatch({type:"SET_VIEW",view:item.id})}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </div>
            ))}

            {changedChars>0&&(
              <div className="callout co-gold" style={{margin:"8px 8px 0",padding:"6px 10px",fontSize:14}}>
                ⚑ {changedChars} bible change{changedChars>1?"s":""} pending
              </div>
            )}

            <div className="nav-section">Projects</div>
            {state.projects.map(p=>(
              <div key={p.id} className={`nav-project-pill ${state.activeProject===p.id?"on":""}`}
                onClick={()=>dispatch({type:"SWITCH_PROJECT",id:p.id})}>
                <div className="nav-pdot" style={{background:p.color}}/>
                <span className="nav-pname">{p.name}</span>
              </div>
            ))}
            <div className="nav-item" style={{color:"var(--t4)",fontSize:14}} onClick={()=>setShowGenerator(true)}>
              <span className="nav-icon">✦</span>Generate New
            </div>
            <div className="nav-item" style={{color:"var(--t4)",fontSize:14}} onClick={()=>setShowBookGenerator(true)}>
              <span className="nav-icon">📚</span>From Book
            </div>
            <div className="nav-item" style={{color:"var(--t4)",fontSize:14}} onClick={()=>setShowManualNew(true)}>
              <span className="nav-icon">+</span>New Blank
            </div>

            {state.activeProject && state.episodes.filter(e=>e.project===state.activeProject).length>0 && (
              <>
                <div className="nav-section">Episodes</div>
                {state.episodes.filter(e=>e.project===state.activeProject).sort((a,b)=>a.num-b.num).map(e=>{
                  const d=e.segments.filter(s=>s.status==="done").length;
                  return (
                    <div key={e.id} className={`nav-item ${state.activeEpisode===e.id&&state.view==="episodes"?"on":""}`}
                      onClick={()=>{dispatch({type:"SET_EPISODE",id:e.id});dispatch({type:"SET_VIEW",view:"episodes"});}}
                      style={{fontSize:14}}>
                      <span className="nav-icon" style={{fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{String(e.num).padStart(2,"0")}</span>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</span>
                      {e.segments.length>0&&<span className="nav-badge">{d}/{e.segments.length}</span>}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="nav-foot">
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span className={`sync-dot ${state.syncStatus==="ok"?"sync-ok":state.syncStatus==="saving"?"sync-saving":state.syncStatus==="error"?"sync-error":"sync-offline"}`}/>
              <span>{state.syncStatus==="ok"?"Synced":state.syncStatus==="saving"?"Saving…":state.syncStatus==="error"?"Sync Error":"Local"}</span>
            </div>
            <div style={{color:state.apiKey?"var(--green2)":"var(--red2)",fontSize:13}}>{state.apiKey?"● AI Active":"○ No API Key"}</div>
            <div style={{color:"var(--t4)",display:"flex",gap:8,alignItems:"center",fontSize:13}}>
              Bible v{state.bible.bibleVersion}
              {canUndo&&<span style={{cursor:"pointer",color:"var(--t3)"}} onClick={()=>dispatch({type:"UNDO"})} title="Undo (⌘Z)">↩</span>}
              {canRedo&&<span style={{cursor:"pointer",color:"var(--t3)"}} onClick={()=>dispatch({type:"REDO"})} title="Redo (⌘⇧Z)">↪</span>}
            </div>
          </div>
        </nav>

        {/* WORKSPACE */}
        <div className="workspace">
          {/* Sync bar */}
          <SyncBar
            state={state}
            dispatch={dispatch}
            onSignIn={()=>setShowAuthModal(true)}
            onSignOut={()=>{dispatch({type:"SET_CURRENT_USER",user:null});onSignOut();}}
            onSyncClick={()=>setShowSyncModal(true)}
          />

          <div className="topbar">
            <span className="tb-title">Nekoi Studio</span>
            {CRUMBS[state.view]?.map((c,i)=>(
              <span key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                <span className="tb-sep">›</span>
                {c.view ? <span className="tb-crumb" onClick={()=>{dispatch({type:"SET_VIEW",view:c.view});if(c.clearEp)dispatch({type:"SET_EPISODE",id:null});}}>{c.label}</span>
                         : <span className="tb-crumb" style={{color:"var(--t2)",cursor:"default"}}>{c.label}</span>}
              </span>
            ))}
            <div className="tb-r">
              {canUndo&&<button className="btn btn-ghost btn-sm" style={{padding:"3px 8px",fontSize:14}} onClick={()=>dispatch({type:"UNDO"})} title="Undo (⌘Z)">↩ Undo</button>}
              {canRedo&&<button className="btn btn-ghost btn-sm" style={{padding:"3px 8px",fontSize:14}} onClick={()=>dispatch({type:"REDO"})} title="Redo (⌘⇧Z)">↪ Redo</button>}
              {segs.length>0&&<span style={{fontSize:13,color:"var(--t3)",fontFamily:"JetBrains Mono,monospace"}}>{doneS}/{segs.length}</span>}
              {changedChars>0&&<span className="bible-flag bf-changed">⚑ Bible updated</span>}
            </div>
          </div>

          <div className="body">
            <div className="page">
              {state.view==="dashboard"&&<PageDashboard state={state} dispatch={dispatch} onGenerate={()=>setShowGenerator(true)} onFromBook={()=>setShowBookGenerator(true)}/>}
              {state.view==="bible"    &&<PageBible state={state} dispatch={dispatch}/>}
              {state.view==="assets"  &&<PageAssets state={state} dispatch={dispatch}/>}
              {state.view==="episodes"&&<PageEpisodes state={state} dispatch={dispatch} onGenerateEpisodes={()=>setShowEpGenerator(true)} onGenerateAll={()=>setShowAutoQueue(true)} saveImageToServer={saveImageToServer}/>}
              {state.view==="audiobook"&&<PageAudioBook state={state} dispatch={dispatch}/>}
              {state.view==="publish"  &&<PagePublish state={state} dispatch={dispatch}/>}
              {state.view==="website"  &&<PageWebsite state={state} dispatch={dispatch}/>}
              {state.view==="team"     &&<PageTeam state={state} dispatch={dispatch}/>}
              {state.view==="ripple"  &&<PageRipple state={state} dispatch={dispatch}/>}
              {state.view==="settings"&&<PageSettings state={state} dispatch={dispatch}/>}
            </div>
            <AiDirectorChat state={state} dispatch={dispatch}/>
          </div>
        </div>
      </div>

      {showGenerator && <ProjectGenerator apiKey={state.apiKey} onGenerated={data=>{dispatch({type:"BOOTSTRAP_PROJECT",data});setShowGenerator(false);setShowAutoQueue(true);}} onClose={()=>setShowGenerator(false)}/>}
      {showBookGenerator && <BookToProjectModal apiKey={state.apiKey} existingProject={state.projects.find(p=>p.id===state.activeProject)?.name||null} onGenerated={data=>{dispatch({type:"BOOTSTRAP_PROJECT",data});setShowBookGenerator(false);setShowAutoQueue(true);}} onClose={()=>setShowBookGenerator(false)}/>}
      {showEpGenerator && <EpisodeGenerator state={state} apiKey={state.apiKey} onGenerated={eps=>dispatch({type:"ADD_GENERATED_EPISODES",episodes:eps})} onClose={()=>setShowEpGenerator(false)}/>}
      {showManualNew && <NewProjectManualModal onAdd={p=>dispatch({type:"ADD_PROJECT",project:p})} onClose={()=>setShowManualNew(false)}/>}
      {showAutoQueue && <AutoQueueModal state={state} dispatch={dispatch} onClose={()=>setShowAutoQueue(false)}/>}
      {showSyncModal && <SyncModal state={state} dispatch={dispatch} onClose={()=>setShowSyncModal(false)}/>}
      {showAuthModal && (
        <AuthModal
          supabaseUrl={state.supabaseUrl}
          supabaseKey={state.supabaseKey}
          onSuccess={user=>{dispatch({type:"SET_CURRENT_USER",user});setShowAuthModal(false);}}
          onClose={()=>setShowAuthModal(false)}
        />
      )}
    </>
  );
}
