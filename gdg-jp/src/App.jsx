import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Activity, Loader2, AlertTriangle, Info, ShieldCheck, Zap,
  Menu, X, BrainCircuit, Globe, FileSearch,
  Target, Gauge, Eye, TrendingUp, Sparkles, CheckCircle2, XCircle, AlertCircle,
  Mic, Square, ImagePlus
} from 'lucide-react';

// ==========================================
// GLOBAL STYLES & ANIMATIONS
// ==========================================
const globalStyles = `
  @keyframes float {
    0% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
    100% { transform: translateY(0px) scale(1); }
  }
  @keyframes truthReveal {
    0% { width: 0%; }
    100% { width: var(--truth-width); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.5) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes micPulse {
    0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70%  { transform: scale(1.05); box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
    100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  @keyframes waveBar {
    0%, 100% { transform: scaleY(0.3); }
    50%       { transform: scaleY(1); }
  }
  @keyframes imgScan {
    0%   { top: 0%; opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes borderDance {
    0%   { border-color: rgba(45,212,191,0.6); box-shadow: 0 0 20px rgba(45,212,191,0.3); }
    50%  { border-color: rgba(168,85,247,0.6);  box-shadow: 0 0 20px rgba(168,85,247,0.3); }
    100% { border-color: rgba(45,212,191,0.6); box-shadow: 0 0 20px rgba(45,212,191,0.3); }
  }
  .animate-float { animation: float 8s ease-in-out infinite; }
  .animate-float-delayed { animation: float 10s ease-in-out infinite 2s; }
  .mic-recording { animation: micPulse 1.4s ease-in-out infinite; }
  .img-border-dance { animation: borderDance 2s ease-in-out infinite; }

  body { background-color: #09050F; }
  .cyber-grid {
    background-color: #09050F;
    background-size: 50px 50px;
    background-image:
      linear-gradient(to right, rgba(168, 85, 247, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(168, 85, 247, 0.06) 1px, transparent 1px);
  }
  .glass-card {
    background: rgba(15, 10, 25, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(168, 85, 247, 0.2);
    box-shadow: 0 10px 40px 0 rgba(0,0,0,0.6), inset 0 0 20px rgba(168,85,247,0.05);
  }
  .glass-card:hover {
    border: 1px solid rgba(45,212,191,0.5);
    box-shadow: 0 15px 50px 0 rgba(168,85,247,0.2), inset 0 0 30px rgba(45,212,191,0.1);
  }
  .truth-score-pop {
    animation: countUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: 1s;
    opacity: 0;
  }
  .wave-bar {
    display: inline-block;
    width: 3px;
    border-radius: 2px;
    background: #EF4444;
    transform-origin: bottom;
  }
  .wave-bar:nth-child(1) { animation: waveBar 0.6s ease-in-out infinite 0.0s; }
  .wave-bar:nth-child(2) { animation: waveBar 0.6s ease-in-out infinite 0.1s; }
  .wave-bar:nth-child(3) { animation: waveBar 0.6s ease-in-out infinite 0.2s; }
  .wave-bar:nth-child(4) { animation: waveBar 0.6s ease-in-out infinite 0.3s; }
  .wave-bar:nth-child(5) { animation: waveBar 0.6s ease-in-out infinite 0.4s; }
  .img-scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(45,212,191,0.9), transparent);
    animation: imgScan 1.6s ease-in-out infinite;
  }
`;

// ==========================================
// SHARED UI
// ==========================================
const Button = ({ children, variant = 'primary', className = '', onClick, type = "button", disabled = false }) => {
  const base = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all focus:outline-none relative overflow-hidden group";
  if (variant === 'primary') {
    return (
      <motion.button type={type} onClick={onClick} disabled={disabled}
        whileHover={!disabled ? { scale: 1.05 } : {}} whileTap={!disabled ? { scale: 0.95 } : {}}
        className={`${base} ${disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]'} ${className}`}>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {!disabled && <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />}
      </motion.button>
    );
  }
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, backgroundColor: "rgba(168,85,247,0.1)", borderColor: "rgba(168,85,247,0.5)" } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`${base} ${disabled ? 'cursor-not-allowed opacity-50' : 'bg-slate-900/50 text-white border border-slate-700 shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]'} ${className}`}>
      {children}
    </motion.button>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.05, y: -10 }}
    className="glass-card p-6 rounded-2xl group relative overflow-hidden transition-all duration-300">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-pink-500/20 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-[2]" />
    <div className="w-14 h-14 bg-[#0B0510]/80 rounded-xl flex items-center justify-center mb-5 border border-purple-500/30 group-hover:border-teal-400 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.5)] transition-all duration-300">
      <Icon className="w-7 h-7 text-teal-400 group-hover:text-white transition-colors" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">{title}</h3>
    <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
  </motion.div>
);

const CyberRobot = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const headRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const h = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  let headT = { x: 0, y: 0, rotate: 0 }, eyeT = { x: 0, y: 0 };
  if (isMounted && headRef.current) {
    const r = headRef.current.getBoundingClientRect();
    const dx = mousePos.x - (r.left + r.width / 2), dy = mousePos.y - (r.top + r.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy), angle = Math.atan2(dy, dx), mf = Math.min(dist / 400, 1);
    headT = { x: Math.cos(angle) * 30 * mf, y: Math.sin(angle) * 30 * mf, rotate: (dx / window.innerWidth) * 35 };
    eyeT = { x: Math.cos(angle) * 18 * mf, y: Math.sin(angle) * 18 * mf };
  }
  return (
    <div className="relative w-full h-full flex items-center justify-center z-20">
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex flex-col items-center justify-end scale-100 sm:scale-110 lg:scale-125 mt-10">
        <div className="absolute inset-0 bg-purple-600/20 blur-[80px] rounded-full scale-150" />
        <motion.div ref={headRef} animate={headT} transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.5 }}
          className="relative w-36 h-44 bg-[#0B0510] border-2 border-purple-500/60 rounded-[2rem] shadow-[0_0_40px_rgba(168,85,247,0.4),inset_0_0_20px_rgba(168,85,247,0.2)] z-20 flex flex-col items-center justify-center overflow-visible">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-16 bg-[#05020A] border-2 border-purple-500/50 rounded-l-lg" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-16 bg-[#05020A] border-2 border-purple-500/50 rounded-r-lg" />
          <div className="absolute inset-2 bg-[#05020A] rounded-3xl border border-teal-400/20 overflow-hidden flex flex-col items-center justify-center">
            <motion.div animate={{ y: ['-100%', '400%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-transparent via-teal-400/20 to-transparent" />
            <motion.div animate={eyeT} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="flex gap-4 mb-3">
              <div className="w-10 h-3.5 bg-teal-400 rounded-full shadow-[0_0_25px_rgba(45,212,191,1)] overflow-hidden"><div className="inset-0 bg-white/40 w-full h-full animate-pulse" /></div>
              <div className="w-10 h-3.5 bg-teal-400 rounded-full shadow-[0_0_25px_rgba(45,212,191,1)] overflow-hidden"><div className="inset-0 bg-white/40 w-full h-full animate-pulse" /></div>
            </motion.div>
            <div className="flex gap-1.5 mt-6">
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} animate={{ height: [4, Math.random() * 14 + 6, 4] }} transition={{ duration: 0.4 + Math.random(), repeat: Infinity }}
                  className="w-1.5 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)] rounded-full" />
              ))}
            </div>
          </div>
        </motion.div>
        <div className="w-12 h-16 bg-[#0B0510] border-x-2 border-purple-500/50 z-10 -mt-5 flex flex-col gap-1.5 items-center py-3">
          {[0, 1, 2].map(i => <div key={i} className="w-8 h-1 bg-purple-500/40 rounded-full" />)}
        </div>
        <div className="w-64 h-32 bg-[#0B0510] border-t-2 border-purple-500/60 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(168,85,247,0.2)] z-20 overflow-hidden flex flex-col items-center pt-5">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-full border-2 border-teal-400/60 bg-purple-950/60 shadow-[0_0_30px_rgba(45,212,191,0.6)] flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-teal-400 shadow-[0_0_25px_rgba(45,212,191,1)]" />
          </motion.div>
          <div className="w-40 h-1 bg-purple-500/30 rounded-full mt-5" />
          <div className="w-48 h-1 bg-purple-500/20 rounded-full mt-2" />
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// TRUTH RATING
// ==========================================
const TruthRating = ({ factCheckVerdict, explanation, manipulationScore }) => {
  const computeTruthScore = () => {
    const ms = manipulationScore || 0, v = (factCheckVerdict || 'UNVERIFIED').toUpperCase();
    if (v === 'FAKE') return Math.max(1, Math.min(2, Math.round(2 - (ms - 72) / 23)));
    if (v === 'MISLEADING') return 3;
    if (v === 'REAL') return ms < 10 ? 10 : ms < 20 ? 9 : 8;
    return Math.max(1, Math.min(7, Math.round(7 - (ms / 95) * 6)));
  };
  const score = computeTruthScore();
  const getTheme = s => {
    if (s >= 8) return { color: '#10B981', glow: 'rgba(16,185,129,0.7)', label: 'LIKELY TRUE',        icon: CheckCircle2, bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', bar: 'from-emerald-400 to-teal-400' };
    if (s >= 6) return { color: '#34D399', glow: 'rgba(52,211,153,0.6)',  label: 'MOSTLY CREDIBLE',   icon: CheckCircle2, bg: 'bg-teal-500/10',    border: 'border-teal-500/40',    bar: 'from-teal-400 to-cyan-400' };
    if (s >= 4) return { color: '#F59E0B', glow: 'rgba(245,158,11,0.7)',  label: 'MISLEADING',        icon: AlertCircle,  bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   bar: 'from-amber-400 to-orange-400' };
    if (s >= 2) return { color: '#F97316', glow: 'rgba(249,115,22,0.7)',  label: 'MANIPULATED',       icon: AlertTriangle,bg: 'bg-orange-500/10',  border: 'border-orange-500/40',  bar: 'from-orange-500 to-red-400' };
    return              { color: '#EF4444', glow: 'rgba(239,68,68,0.7)',   label: 'LIKELY FAKE',       icon: XCircle,      bg: 'bg-red-500/10',     border: 'border-red-500/40',     bar: 'from-red-500 to-pink-500' };
  };
  const cfg = getTheme(score);
  const barPct = (score / 10) * 100;
  const IconComp = cfg.icon;

  // Strip the "[Image: ...]" prefix that pollutes the explanation
  const cleanExplanation = explanation
    ? explanation.replace(/^\[Image:[^\]]*\]\s*/i, '').trim()
    : null;

  // Extract fact-check reason from the end of the explanation
  const factReasonMatch = cleanExplanation?.match(/Fact-check:\s*\w+\s*—\s*(.+)$/i);
  const factReason = factReasonMatch ? factReasonMatch[1].trim() : null;

  // The main explanation text (without the appended fact-check sentence)
  const mainExplanation = cleanExplanation
    ? cleanExplanation.replace(/\s*Fact-check:\s*\w+\s*—\s*.+$/i, '').trim()
    : null;

  const pips = Array.from({ length: 10 }, (_, i) => i + 1);

  const scaleLegend = [
    { range: '1–3', label: 'Fake',       color: 'text-red-400',     dot: 'bg-red-400' },
    { range: '4–6', label: 'Unclear',    color: 'text-amber-400',   dot: 'bg-amber-400' },
    { range: '7–8', label: 'Likely True',color: 'text-teal-400',    dot: 'bg-teal-400' },
    { range: '9–10',label: 'Verified',   color: 'text-emerald-400', dot: 'bg-emerald-400' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.7, type: 'spring' }}
      className={`glass-card rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden border ${cfg.border}`}>

      {/* Background glow */}
      <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full blur-[60px] opacity-20 pointer-events-none"
        style={{ background: cfg.color }} />

      {/* ── HEADER: title + verdict badge (wraps on small screens) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-slate-400" />Truth Rating
        </h3>
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shrink-0 ${cfg.bg} ${cfg.border}`}
          style={{ color: cfg.color, boxShadow: `0 0 15px ${cfg.glow}` }}>
          <IconComp className="w-3.5 h-3.5" />{cfg.label}
        </motion.div>
      </div>

      {/* ── SCORE BOX + BAR ── */}
      <div className="flex items-center gap-5 mb-6 relative z-10">
        {/* Score box */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 relative overflow-hidden"
          style={{ borderColor: cfg.color, boxShadow: `0 0 25px ${cfg.glow}` }}>
          <div className="absolute inset-0 opacity-10" style={{ background: cfg.color }} />
          <motion.span className="truth-score-pop text-4xl md:text-5xl font-black relative z-10"
            style={{ color: cfg.color, filter: `drop-shadow(0 0 12px ${cfg.glow})` }}>{score}</motion.span>
          <span className="text-slate-500 text-xs font-bold relative z-10">/ 10</span>
        </div>

        {/* Pip dots + progress bar */}
        <div className="flex-1 min-w-0">
          {/* Pips */}
          <div className="flex gap-1 mb-3">
            {pips.map(pip => (
              <motion.div key={pip}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: pip <= score ? 1 : 0.15 }}
                transition={{ delay: 0.6 + pip * 0.07, type: 'spring', stiffness: 400 }}
                className="flex-1 h-2 rounded-full"
                style={{
                  background: pip <= score ? `linear-gradient(90deg,${cfg.color},${cfg.color}bb)` : 'rgba(255,255,255,0.06)',
                  boxShadow: pip <= score ? `0 0 6px ${cfg.glow}` : 'none'
                }} />
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${barPct}%` }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} relative`}
              style={{ boxShadow: `0 0 12px ${cfg.glow}` }}>
              <div className="absolute inset-0 bg-white/20 rounded-full" />
            </motion.div>
          </div>

          {/* Bar end labels — use padding so VERIFIED never overflows */}
          <div className="flex justify-between mt-1.5 px-0.5">
            <span className="text-slate-500 text-[15px] font-bold tracking-wide">FAKE</span>
            <span className="text-slate-500 text-[15px] font-bold tracking-wide">VERIFIED</span>
          </div>
        </div>
      </div>



      {/* ── SCALE LEGEND ── */}
<div className="relative z-10 grid grid-cols-4 gap-2 pt-4 border-t border-slate-800/60">
  {scaleLegend.map(item => (
    <div key={item.range}
      className="flex flex-col items-center gap-2 bg-slate-900/30 rounded-xl py-3 px-2">
      <div className={`w-4.5 h-4.5 rounded-full ${item.dot}`} />
      <span className={`text-s font-black ${item.color}`}>{item.range}</span>
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide text-center leading-tight">
        {item.label}
      </span>
    </div>
  ))}
</div>  
    </motion.div>
  );
};

// ==========================================
// MIC BUTTON
// ==========================================
const MicButton = ({ onTranscript, isAnalyzing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [permDenied, setPermDenied] = useState(false);
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-IN';
    r.onresult = e => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' '; else interim += t;
      }
      if (final) onTranscript(final, 'append'); if (interim) setInterimText(interim);
    };
    r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setPermDenied(true); setIsRecording(false); setInterimText(''); };
    r.onend = () => { setIsRecording(false); setInterimText(''); };
    recognitionRef.current = r; return () => r.abort();
  }, []);
  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); setInterimText(''); }
    else {
      setPermDenied(false);
      try { recognitionRef.current.start(); setIsRecording(true); }
      catch { recognitionRef.current.stop(); setTimeout(() => { recognitionRef.current.start(); setIsRecording(true); }, 200); }
    }
  }, [isRecording]);
  if (!isSupported) return null;
  return (
    <div className="flex items-center gap-3">
      <AnimatePresence>
        {isRecording && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-950/40 border border-red-500/30">
            <div className="flex items-end gap-[3px] h-5">{[...Array(5)].map((_, i) => <div key={i} className="wave-bar h-5" />)}</div>
            <span className="text-red-400 text-xs font-black uppercase tracking-widest ml-1">{interimText ? 'Listening…' : 'Recording'}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{permDenied && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400 font-bold">Mic access denied</motion.span>}</AnimatePresence>
      <motion.button type="button" onClick={toggle} disabled={isAnalyzing}
        whileHover={!isAnalyzing ? { scale: 1.1 } : {}} whileTap={!isAnalyzing ? { scale: 0.9 } : {}}
        title={isRecording ? 'Stop recording' : 'Speak to fill input'}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${isAnalyzing ? 'bg-slate-800 cursor-not-allowed opacity-40' : isRecording ? 'bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] mic-recording' : 'bg-[#0B0510] border border-purple-500/50 hover:border-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]'}`}>
        {isRecording ? <Square className="w-4 h-4 text-red-400 fill-red-400" /> : <Mic className="w-5 h-5 text-purple-400" />}
      </motion.button>
    </div>
  );
};

// ==========================================
// IMAGE UPLOAD BUTTON
// ==========================================
const ImageUploadButton = ({ onImageSelect, isAnalyzing }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = e => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => onImageSelect({ file, dataUrl: ev.target.result, base64: ev.target.result.split(',')[1], mimeType: file.type });
    reader.readAsDataURL(file); e.target.value = '';
  };
  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <motion.button type="button" disabled={isAnalyzing} onClick={() => fileInputRef.current?.click()}
        whileHover={!isAnalyzing ? { scale: 1.1 } : {}} whileTap={!isAnalyzing ? { scale: 0.9 } : {}}
        title="Upload an image to analyze"
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${isAnalyzing ? 'bg-slate-800 cursor-not-allowed opacity-40' : 'bg-[#0B0510] border border-purple-500/50 hover:border-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]'}`}>
        <ImagePlus className="w-5 h-5 text-purple-400" />
      </motion.button>
    </>
  );
};

// ==========================================
// IMAGE PREVIEW CARD
// ==========================================
const ImagePreview = ({ imageData, isAnalyzing, onRemove }) => {
  if (!imageData) return null;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }} transition={{ type: 'spring', stiffness: 300 }}
      className="mt-5 relative inline-flex">
      <div className={`relative rounded-2xl overflow-hidden border-2 ${isAnalyzing ? 'img-border-dance' : 'border-purple-500/60'}`}
        style={{ width: 128, height: 96 }}>
        <img src={imageData.dataUrl} alt="Uploaded for analysis" className="w-full h-full object-cover" />
        {isAnalyzing && <div className="img-scan-line" />}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-[#09050F]/60 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
          <p className="text-[9px] text-teal-400 font-bold uppercase tracking-wider truncate">{imageData.file?.name || 'image'}</p>
        </div>
      </div>
      {!isAnalyzing && (
        <motion.button onClick={onRemove} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)] hover:bg-red-400 transition-colors z-10"
          title="Remove image">
          <X className="w-3.5 h-3.5 text-white" />
        </motion.button>
      )}
    </motion.div>
  );
};

// ==========================================
// HOME PAGE
// ==========================================
const Home = ({ navigateTo }) => {
  const features = [
    { icon: Zap, title: "Real-Time Detection", description: "Analyzes messages instantly for manipulation signals before they go viral." },
    { icon: BrainCircuit, title: "Pattern Recognition", description: "Detects subtle fear appeals, urgency triggers, and polarization tactics." },
    { icon: Globe, title: "Multilingual AI", description: "Purpose-built for India's diverse language ecosystem and code-mixed text." },
    { icon: FileSearch, title: "Explainable AI", description: "Shows exactly why a message is flagged, providing transparent reasoning." }
  ];
  return (
    <div className="relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[150px] animate-float -z-10 pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-teal-600/10 blur-[150px] animate-float-delayed -z-10 pointer-events-none" />
      <section className="relative pt-12 pb-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            <div className="w-full md:w-[55%] text-center md:text-left order-1 relative z-30">
              <motion.div initial={{ opacity: 0, y: -30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, type: "spring" }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-purple-500/40 text-teal-400 text-sm font-bold mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <ShieldCheck className="w-4 h-4 text-teal-400" />Active Threat Monitoring
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: "easeOut" }}
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
                Detect Fake & Manipulative Messages <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400">Before They Go VIRAL</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed pr-0 md:pr-8">
                Detect psychological manipulation in WhatsApp forwards, tweets, and news messages before misinformation shapes public opinion.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Button onClick={() => navigateTo('analyzer')} className="w-full sm:w-auto text-lg px-8 py-4">Try CIVIS AI <Zap className="w-5 h-5 ml-1" /></Button>
                <Button variant="secondary" onClick={() => navigateTo('about')} className="w-full sm:w-auto text-lg px-8 py-4">Learn More</Button>
              </motion.div>
            </div>
            <div className="w-full md:w-[45%] relative h-[350px] md:h-[500px] lg:h-[600px] flex items-center justify-center order-2 z-20">
              <CyberRobot />
            </div>
          </div>
        </div>
      </section>
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Enterprise-Grade Intelligence</h2>
            <p className="text-purple-300/70 max-w-2xl mx-auto text-xl">Advanced cognitive security infrastructure to protect democratic discourse.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.15} />)}
          </div>
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How It Works</h2>
            <p className="text-purple-300/70 max-w-2xl mx-auto text-xl">Three simple steps to neutralise manipulative content.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative">
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[3px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            {[{ step: 1, title: "Paste Message", desc: "Input any suspicious text, tweet, or forwarded message into the analyzer." }, { step: 2, title: "AI Analysis", desc: "CIVIS processes the syntax, semantics, and emotional triggers in real-time.", active: true }, { step: 3, title: "Get Risk Score", desc: "Review the manipulation risk, detected techniques, and highlighted phrases." }].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -15, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}
                className={`relative z-10 flex flex-col items-center glass-card p-10 rounded-[2rem] border-t border-l ${item.active ? 'border-teal-400/50 shadow-[0_20px_50px_rgba(45,212,191,0.15)]' : 'border-white/5'}`}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-2xl ${item.active ? 'bg-gradient-to-br from-purple-500 to-teal-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)]' : 'bg-[#0B0510] text-teal-400 border border-slate-700'}`}>{item.step}</div>
                <h3 className={`text-2xl font-bold mb-4 ${item.active ? 'text-teal-400' : 'text-white'}`}>{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="py-32 relative overflow-hidden text-center z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-[#0B0510] rounded-[3rem] p-16 md:p-24 relative overflow-hidden border border-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.15)] group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,#09050F_100%)] z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Ready to defend the truth?</h2>
              <p className="text-2xl text-teal-400 mb-12 max-w-2xl mx-auto">Start analyzing messages instantly. No registration required.</p>
              <Button onClick={() => navigateTo('analyzer')} className="text-xl px-12 py-5 rounded-2xl">Analyze a Message Now <Zap className="w-6 h-6 ml-2" /></Button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

// ==========================================
// ANALYZER
// ==========================================
const TechniquesBarChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;
  const techniques = Object.entries(data).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: typeof value === 'number' ? value : 0 }));
  const colors = { Fear: 'bg-cyan-400', Urgency: 'bg-purple-500', Polarization: 'bg-pink-500', Authority: 'bg-orange-500', Emotion: 'bg-red-500' };
  return (
    <div className="glass-card rounded-3xl p-8 shadow-lg relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full blur-[60px] opacity-10 bg-purple-500 pointer-events-none" />
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-teal-400" />Manipulation Techniques Graph
      </h3>
      <div className="relative z-10 bg-[#05020A]/80 rounded-2xl p-8 border border-slate-800">
        <div className="flex items-flex-end justify-between gap-8 h-72 relative">
          <div className="flex flex-col justify-between text-right pr-4 -mt-2 text-xs text-slate-600 font-mono w-8">
            {['80', '60', '40', '20', '0'].map(l => <span key={l}>{l}</span>)}
          </div>
          <div className="absolute left-16 right-0 top-0 bottom-8 pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => <div key={i} className="absolute w-full border-b border-slate-800/40" style={{ bottom: `${(i / 4) * 100}%` }} />)}
          </div>
          <div className="flex flex-1 items-flex-end justify-between gap-6 relative z-10 h-full">
            {techniques.map((tech, idx) => (
              <motion.div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}>
                <div className="w-full h-full bg-slate-900/50 rounded-lg overflow-hidden relative group border border-slate-700 hover:border-teal-400/50 transition-colors">
                  <motion.div className={`w-full ${colors[tech.name] || 'bg-purple-500'} rounded-lg absolute bottom-0 flex items-center justify-center`}
                    initial={{ height: 0 }} animate={{ height: `${(tech.value / 100) * 100}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 + idx * 0.1 }}>
                    <span className="text-white font-black text-lg drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">{tech.value}</span>
                  </motion.div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide text-center">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-20 left-16 right-8 h-[2px] bg-gradient-to-r from-slate-700 to-transparent" />
      </div>
    </div>
  );
};

const ScoreGauge = ({ score }) => {
  const cfg = score >= 60
    ? { colorClass: 'text-[#EF4444]', strokeColor: '#EF4444', bgClass: 'bg-[#EF4444]/10', shadowClass: 'drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]', label: 'HIGH RISK' }
    : score >= 30
      ? { colorClass: 'text-[#F59E0B]', strokeColor: '#F59E0B', bgClass: 'bg-[#F59E0B]/10', shadowClass: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]', label: 'MODERATE' }
      : { colorClass: 'text-[#10B981]', strokeColor: '#10B981', bgClass: 'bg-[#10B981]/10', shadowClass: 'drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]', label: 'LOW RISK' };
  const R = 55, circ = 2 * Math.PI * R, offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl h-full relative overflow-hidden">
      <div className={`absolute inset-0 opacity-10 blur-3xl ${cfg.bgClass}`} />
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10">Manipulation Score</h3>
      <div className="relative flex items-center justify-center z-10">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle cx="96" cy="96" r={R} stroke="#1E293B" strokeWidth="12" fill="transparent" />
          <motion.circle cx="96" cy="96" r={R} stroke={cfg.strokeColor} strokeWidth="12" fill="transparent"
            strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.3 }} strokeLinecap="round" className={cfg.shadowClass} />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 0.6, type: "spring" }}
            className={`text-6xl font-black ${cfg.colorClass} ${cfg.shadowClass}`}>{score}</motion.span>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.5 }}
        className={`mt-8 px-6 py-2 rounded-full text-sm font-black tracking-widest ${cfg.bgClass} ${cfg.colorClass} relative z-10`}>
        {cfg.label}
      </motion.div>
    </div>
  );
};

const Analyzer = () => {
  const [text, setText]             = useState('');
  const [imageData, setImageData]   = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults]       = useState(null);

  const handleTranscript = useCallback((transcript) => {
    setText(prev => { const t = prev.trimEnd(); return t + (t ? ' ' : '') + transcript.trim(); });
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim() && !imageData) return;
    setIsAnalyzing(true); setResults(null);
    try {
      const body = { text: text.trim() };
      if (imageData) body.image = { base64: imageData.base64, mimeType: imageData.mimeType };
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      setResults(await response.json());
    } catch (error) {
      console.error(error); alert("Failed to connect to CIVIS AI server");
    } finally { setIsAnalyzing(false); }
  };

  const getViralityBadge = level => {
    switch (level?.toUpperCase()) {
      case 'HIGH':   return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      case 'MEDIUM': return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'LOW':    return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      default:       return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
      <div className="absolute top-[-20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[150px] animate-float -z-10 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Intelligence Dashboard</h1>
        <p className="text-teal-200/70 text-xl">Analyze text or images for psychological manipulation patterns.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-[2rem] p-3 shadow-2xl mb-16 border-t border-l border-purple-500/30">
        <div className="bg-[#0B0510]/90 rounded-[1.5rem] p-8">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={imageData ? "Add context text (optional) alongside your image…" : "Paste a tweet, WhatsApp forward, or news message — or use the 🎙️ mic / 📷 image upload"}
            className="w-full h-44 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-0 text-xl leading-relaxed"
            disabled={isAnalyzing} />

          {/* Image preview */}
          <AnimatePresence>
            {imageData && <ImagePreview imageData={imageData} isAnalyzing={isAnalyzing} onRemove={() => setImageData(null)} />}
          </AnimatePresence>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-slate-800 gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <div className="text-sm text-teal-400 font-bold flex items-center gap-2 bg-teal-900/20 px-4 py-2 rounded-full border border-teal-500/30">
                <ShieldCheck className="w-5 h-5" />Secure Encrypted Analysis
              </div>
              <MicButton onTranscript={handleTranscript} isAnalyzing={isAnalyzing} />
              <ImageUploadButton onImageSelect={setImageData} isAnalyzing={isAnalyzing} />
            </div>
            <Button onClick={handleAnalyze} disabled={(!text.trim() && !imageData) || isAnalyzing} className="w-full sm:w-auto text-lg py-4 px-8">
              {isAnalyzing
                ? <><Loader2 className="w-6 h-6 animate-spin" />Analyzing...</>
                : <><Zap className="w-6 h-6" />Analyze {imageData && !text.trim() ? 'Image' : 'Message'}</>}
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="py-32 flex flex-col items-center justify-center text-slate-300 relative">
            <div className="absolute inset-0 bg-purple-600/10 blur-[100px] rounded-full" />
            <div className="relative mb-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-4 border-transparent border-t-teal-400 border-b-purple-500 rounded-full" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-4 border-transparent border-l-teal-300 border-r-pink-400 rounded-full" />
              <Zap className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_white]" />
            </div>
            <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">
              Decoding psychological patterns...
            </motion.p>
          </motion.div>
        )}

        {!isAnalyzing && results && (
          <motion.div key="results" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: "spring" }} className="space-y-8">

            {/* Extracted image text banner */}
            {results.extractedImageText && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 border border-teal-500/30 flex items-start gap-4 bg-teal-900/10">
                <Eye className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-teal-400 uppercase tracking-widest mb-1.5">Text Extracted from Image</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{results.extractedImageText}</p>
                </div>
              </motion.div>
            )}

            {/* Row 1: Score + Virality + Techniques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1"><ScoreGauge score={results.manipulationScore} /></div>
              <div className="md:col-span-2 flex flex-col gap-8">
                <div className="glass-card rounded-3xl p-8 flex justify-between items-center shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Virality Risk Forecast</h3>
                  <span className={`px-6 py-2 rounded-full text-sm font-black border ${getViralityBadge(results.viralityRisk)}`}>{results.viralityRisk}</span>
                </div>
                <div className="glass-card rounded-3xl p-8 flex-1 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-purple-400" />Detected Techniques
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(results.techniques || []).map((tech, idx) => (
                      <motion.span key={idx} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                        className="px-5 py-3 bg-[#0B0510]/80 border border-purple-700 text-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:border-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all rounded-xl text-sm font-bold flex items-center gap-3 cursor-default">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-teal-400 to-purple-500 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Truth Rating */}
            <TruthRating factCheckVerdict={results.factCheckVerdict} explanation={results.explanation} manipulationScore={results.manipulationScore} />

            {/* Row 3: AI Explanation */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              className="glass-card bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-3xl p-8 flex items-start gap-5 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-purple-500/10 blur-[50px] rounded-full" />
              <Info className="w-8 h-8 text-teal-400 shrink-0 mt-1 drop-shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-teal-300 uppercase tracking-widest mb-3">AI Analysis Explanation</h3>
                <p className="text-slate-300 leading-relaxed text-xl">
                  {typeof results.explanation === "string" ? results.explanation.replace(/^\[Image:[^\]]*\]\s*/i, "").trim() : "AI detected psychological manipulation patterns in the message."}
                </p>
              </div>
            </motion.div>

            {/* Row 4: Bar chart */}
            {results.techniqueIntensity && <TechniquesBarChart data={results.techniqueIntensity} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// ABOUT
// ==========================================
const About = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 relative z-10">
    <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[150px] animate-float -z-10 pointer-events-none" />
    <div className="mb-20 text-center">
      <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">About CIVIS</h1>
      <p className="text-2xl text-teal-200/70">Defending democratic discourse through cognitive security.</p>
    </div>
    <div className="space-y-12">
      {[
        { icon: ShieldCheck, color: "text-teal-400", shadow: "shadow-[0_0_15px_rgba(45,212,191,0.5)]", title: "Mission", content: "CIVIS protects democratic discourse by detecting psychological manipulation signals in digital content. We believe that an informed public requires transparency not just in facts, but in the emotional mechanics used to influence them." },
        { icon: AlertTriangle, color: "text-pink-500", shadow: "shadow-[0_0_15px_rgba(236,72,153,0.5)]", title: "The Problem", content: "Political misinformation spreads faster than traditional fact-checking systems can respond. Bad actors exploit human psychology—using fear, manufactured urgency, and in-group/out-group polarization—to bypass critical thinking and trigger viral sharing." },
        { icon: Zap, color: "text-purple-400", shadow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]", title: "The Solution", content: "CIVIS flips the paradigm. Instead of checking facts after the fact, our AI analyzes the emotional triggers and propaganda techniques embedded in text before they influence public opinion. By exposing the invisible architecture of manipulation, we inoculate users against cognitive threats." }
      ].map((s, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay: idx * 0.2 }}
          className="glass-card rounded-3xl p-10 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className={`absolute left-0 top-0 bottom-0 w-2 ${s.title === 'Mission' ? 'bg-teal-400' : s.title === 'The Problem' ? 'bg-pink-500' : 'bg-purple-400'}`} />
          <h2 className="text-3xl font-black text-white mb-5 flex items-center gap-4"><s.icon className={`w-8 h-8 ${s.color} ${s.shadow}`} />{s.title}</h2>
          <p className="text-xl text-slate-300 leading-relaxed">{s.content}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

// ==========================================
// FEATURES
// ==========================================
const Features = () => {
  const featureList = [
    { icon: Zap, title: "1. Real-Time Manipulation Detection", description: "CIVIS analyzes messages instantly to detect psychological manipulation signals.", example: (<><div className="text-slate-400 mb-1">Example output:</div><div className="text-white">Manipulation Risk Score: <span className="text-teal-400 font-bold">82</span></div><div className="text-white">Risk Level: <span className="text-pink-500 font-bold">HIGH</span></div></>), tagline: "Instant defense against cognitive threats", color: "teal" },
    { icon: Target, title: "2. Propaganda Technique Identification", description: "Detects targeted propaganda techniques like Fear Appeals, Urgency Triggers, and Polarization.", example: (<><div className="text-slate-400 mb-1">Detected Techniques:</div><ul className="text-white list-disc list-inside pl-2"><li>Fear Appeal</li><li>Urgency Trigger</li><li>Polarization</li></ul></>), tagline: "Much smarter than normal fake-news detectors", color: "purple" },
    { icon: Gauge, title: "3. Manipulation Risk Score", description: "Generates a risk score from 0–100 showing how manipulative the content is designed to be.", example: (<div className="grid grid-cols-2 gap-2 text-white"><div className="text-teal-400">0–30:</div><div>Low risk</div><div className="text-purple-400">30–60:</div><div>Moderate risk</div><div className="text-pink-500">60–100:</div><div>High manipulation</div></div>), tagline: "Easy for any user to understand", color: "pink" },
    { icon: Eye, title: "4. Highlighted Manipulation Phrases", description: "Scans and highlights the exact phrases that are actively causing manipulation.", example: (<><div className="text-white italic">"Share this before they delete it"</div><div className="text-teal-400 mt-1 font-bold">↑ Urgency trigger detected</div></>), tagline: "Explainable AI that judges love", color: "teal" },
    { icon: TrendingUp, title: "5. Virality Risk Prediction", description: "Predicts if a message is likely to spread rapidly by checking emotional intensity and urgency.", example: (<><div className="text-white">Virality Risk: <span className="text-pink-500 font-bold">HIGH</span></div><div className="text-slate-300">Reason: Urgency + Fear trigger</div></>), tagline: "Stop viral manipulation before it peaks", color: "purple" },
    { icon: Sparkles, title: "6. Explainable AI Analysis", description: "Uses natural language to clearly explain why a specific message is risky.", example: (<div className="text-slate-300 italic border-l-2 border-pink-500 pl-3">"The message uses urgency framing and distrust cues to provoke emotional sharing before critical thinking."</div>), tagline: "Builds deep trust in the AI system", color: "pink" },
    { icon: Globe, title: "7. Multilingual Analysis", description: "Purpose-built for India's diverse language ecosystem. Supports English, Hindi, and Hinglish.", example: (<div className="text-slate-300">Misinformation spreads heavily in regional contexts. Multilingual detection ensures zero blind spots.</div>), tagline: "Designed for real-world diverse ecosystems", color: "teal" },
    { icon: BrainCircuit, title: "8. Cognitive Threat Detection", description: "Detects psychological influence patterns, not just misinformation.", example: (<div className="text-slate-300">Detects the <span className="text-purple-400 font-bold">intent to manipulate</span>, even if the underlying facts are technically true but weaponized.</div>), tagline: "More advanced than traditional fact-checking tools", color: "purple" }
  ];
  const cMap = { teal: { border: 'border-teal-500/30', bg: 'bg-teal-500/10', text: 'text-teal-400' }, purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' }, pink: { border: 'border-pink-500/30', bg: 'bg-pink-500/10', text: 'text-pink-400' } };
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
      <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-teal-600/10 blur-[150px] animate-float -z-10 pointer-events-none" />
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">Core AI Features</h1>
        <p className="text-2xl text-purple-300/70 max-w-3xl mx-auto">Beyond traditional fact-checking. Exposing the invisible architecture of psychological manipulation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {featureList.map((f, idx) => { const t = cMap[f.color]; return (
          <motion.div key={idx} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: (idx % 2) * 0.2 }}
            className="glass-card p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
            <div className={`absolute -right-12 -top-12 w-48 h-48 ${t.bg} rounded-full blur-[60px] opacity-40 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-[#09050F] border ${t.border}`}><f.icon className={`w-8 h-8 ${t.text}`} /></div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">{f.title}</h3>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">{f.description}</p>
            <div className="bg-[#040208]/80 border border-slate-800/80 rounded-2xl p-5 mb-8 font-mono text-sm shadow-inner">{f.example}</div>
            <div className={`text-sm font-black tracking-widest uppercase ${t.text}`}>✦ {f.tagline}</div>
          </motion.div>
        ); })}
      </div>
    </div>
  );
};

// ==========================================
// NAVBAR
// ==========================================
const Navbar = ({ currentRoute, navigateTo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);
  const NavLink = ({ route, label }) => (
    <button onClick={() => { navigateTo(route); setIsOpen(false); }}
      className={`text-sm font-bold uppercase tracking-wider transition-all ${currentRoute === route ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'text-slate-400 hover:text-white'}`}>{label}</button>
  );
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#09050F]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent py-2'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4 cursor-pointer group" onClick={() => navigateTo('home')}>
            <div className="bg-gradient-to-br from-teal-400 to-purple-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-shadow duration-300">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">CIVIS</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-10">
            <NavLink route="home" label="Home" /><NavLink route="about" label="About" /><NavLink route="features" label="Features" />
            <Button variant="primary" onClick={() => navigateTo('analyzer')} className="py-2.5 px-8 text-sm uppercase tracking-widest">Try AI</Button>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-teal-400 transition-colors p-2">
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#09050F]/95 backdrop-blur-2xl border-b border-purple-600/20 px-6 pt-4 pb-8 shadow-2xl overflow-hidden">
            <div className="flex flex-col space-y-8 mt-4">
              <NavLink route="home" label="Home" /><NavLink route="about" label="About" /><NavLink route="features" label="Features" />
              <Button variant="primary" onClick={() => { navigateTo('analyzer'); setIsOpen(false); }} className="w-full py-4 text-lg">Try AI</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ==========================================
// FOOTER
// ==========================================
const Footer = ({ navigateTo }) => (
  <footer className="bg-[#05020A] border-t border-purple-900/30 py-12 mt-auto relative z-10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
      <div className="flex items-center gap-3"><ShieldAlert className="w-6 h-6 text-purple-500" /><span className="text-xl font-black text-white tracking-tighter">CIVIS</span></div>
      <div className="flex gap-10 text-sm font-bold uppercase tracking-widest text-slate-500">
        <button onClick={() => navigateTo('home')} className="hover:text-teal-400 transition-colors">Home</button>
        <button onClick={() => navigateTo('about')} className="hover:text-teal-400 transition-colors">About</button>
        <button onClick={() => navigateTo('features')} className="hover:text-teal-400 transition-colors">Features</button>
      </div>
      <div className="text-sm font-bold tracking-widest text-slate-600">&copy; 2026 CIVIS AI</div>
    </div>
  </footer>
);

// ==========================================
// APP ROOT
// ==========================================
export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');
  useEffect(() => { window.scrollTo(0, 0); }, [currentRoute]);
  const renderPage = () => {
    switch (currentRoute) {
      case 'home':     return <Home navigateTo={setCurrentRoute} />;
      case 'analyzer': return <Analyzer />;
      case 'about':    return <About />;
      case 'features': return <Features />;
      default:         return <Home navigateTo={setCurrentRoute} />;
    }
  };
  return (
    <>
      <style>{globalStyles}</style>
      <div className="min-h-screen bg-[#09050F] cyber-grid font-sans text-white selection:bg-purple-600/30 flex flex-col overflow-x-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.08),transparent_70%)] pointer-events-none" />
        <Navbar currentRoute={currentRoute} navigateTo={setCurrentRoute} />
        <main className="flex-grow flex flex-col pt-16">
          <AnimatePresence mode="wait">
            <motion.div key={currentRoute}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: "circOut" }} className="flex-grow flex flex-col">
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer navigateTo={setCurrentRoute} />
      </div>
    </>
  );
}