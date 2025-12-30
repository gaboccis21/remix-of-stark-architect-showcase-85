import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Volume2, Info, Zap, CheckCircle, XCircle, Music, Lightbulb, RotateCcw, BookOpen, X, Code, Cpu, GraduationCap, Home } from 'lucide-react';

const Validator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeStates, setActiveStates] = useState(['q0']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chordHistory, setChordHistory] = useState<any[]>([]);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [selectedKey, setSelectedKey] = useState('C');
  const audioContextRef = useRef<AudioContext | null>(null);

  const states: Record<string, { name: string; color: string; position: { x: number; y: number } }> = {
    q0: { name: 'START', color: 'bg-purple-500', position: { x: 80, y: 180 } },
    q1: { name: 'TONIC', color: 'bg-blue-500', position: { x: 220, y: 180 } },
    q2: { name: 'PREDOM', color: 'bg-green-500', position: { x: 360, y: 80 } },
    q3: { name: 'DOM', color: 'bg-orange-500', position: { x: 360, y: 280 } },
    q_reject: { name: 'REJECT', color: 'bg-red-500', position: { x: 500, y: 180 } },
  };

  const chordFrequencies: Record<string, number[]> = {
    'C': [261.63, 329.63, 392.00], 'Dm': [293.66, 349.23, 440.00], 'Em': [329.63, 392.00, 493.88],
    'F': [349.23, 440.00, 523.25], 'G': [392.00, 493.88, 587.33], 'G7': [392.00, 493.88, 587.33, 698.46],
    'Am': [440.00, 523.25, 659.25], 'Bdim': [493.88, 587.33, 698.46],
    'Bm': [493.88, 587.33, 739.99], 'D': [293.66, 369.99, 440.00], 'D7': [293.66, 369.99, 440.00, 523.25],
    'F#dim': [369.99, 440.00, 523.25], 'F#m': [369.99, 440.00, 554.37], 'A': [440.00, 554.37, 659.25],
    'A7': [440.00, 554.37, 659.25, 783.99], 'C#dim': [277.18, 329.63, 392.00], 'C#m': [277.18, 329.63, 415.30],
    'E': [329.63, 415.30, 493.88], 'E7': [329.63, 415.30, 493.88, 587.33], 'G#dim': [415.30, 493.88, 587.33],
    'G#m': [415.30, 493.88, 622.25], 'B': [493.88, 622.25, 739.99], 'B7': [493.88, 622.25, 739.99, 880.00],
    'D#dim': [311.13, 369.99, 440.00], 'Gm': [392.00, 466.16, 587.33], 'Bb': [466.16, 587.33, 698.46],
    'C7': [261.63, 329.63, 392.00, 466.16], 'Edim': [329.63, 392.00, 466.16], 'Cm': [261.63, 311.13, 392.00],
    'Eb': [311.13, 392.00, 466.16], 'F7': [349.23, 440.00, 523.25, 622.25], 'Adim': [440.00, 523.25, 622.25],
    'Fm': [349.23, 415.30, 523.25], 'Ab': [415.30, 523.25, 622.25], 'Bb7': [466.16, 587.33, 698.46, 830.61],
    'Ddim': [293.66, 349.23, 415.30],
  };

  const majorKeys = [
    { key: 'C', name: 'C Major' }, { key: 'G', name: 'G Major' }, { key: 'D', name: 'D Major' },
    { key: 'A', name: 'A Major' }, { key: 'E', name: 'E Major' }, { key: 'F', name: 'F Major' },
    { key: 'Bb', name: 'B♭ Major' }, { key: 'Eb', name: 'E♭ Major' },
  ];

  const getScaleDegrees = (key: string) => {
    const scales: Record<string, string[]> = {
      'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'], 'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
      'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'], 'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
      'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'], 'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
      'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'], 'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
    };
    return scales[key] || scales['C'];
  };

  const getChordToFunction = (key: string) => {
    const degrees = getScaleDegrees(key);
    return {
      [degrees[0]]: 'I', [degrees[5]]: 'vi', [degrees[2]]: 'iii',
      [degrees[3]]: 'IV', [degrees[1]]: 'ii',
      [degrees[4]]: 'V', [`${degrees[4]}7`]: 'V', [degrees[6]]: 'vii°',
    };
  };

  const chordToFunction = getChordToFunction(selectedKey);

  const transitions: Record<string, Record<string, string[]>> = {
    q0: { 'I': ['q1'], 'vi': ['q1'], 'iii': ['q1'] },
    q1: { 'I': ['q1'], 'vi': ['q1'], 'iii': ['q1'], 'IV': ['q2'], 'ii': ['q2'], 'V': ['q3'], 'vii°': ['q3'] },
    q2: { 'V': ['q3'], 'vii°': ['q3'] },
    q3: { 'V': ['q3'], 'vii°': ['q3'], 'I': ['q1'], 'vi': ['q1'], 'iii': ['q1'] },
  };

  const examples = [
    { name: 'Authentic Cadence', getChords: (key: string) => { const d = getScaleDegrees(key); return `${d[0]}, ${d[4]}, ${d[0]}`; }, desc: 'I → V → I' },
    { name: 'Full Sequence', getChords: (key: string) => { const d = getScaleDegrees(key); return `${d[0]}, ${d[3]}, ${d[4]}, ${d[0]}`; }, desc: 'I → IV → V → I' },
    { name: 'With Predominant ii', getChords: (key: string) => { const d = getScaleDegrees(key); return `${d[0]}, ${d[1]}, ${d[4]}, ${d[0]}`; }, desc: 'I → ii → V → I' },
    { name: 'Tonic Prolongation', getChords: (key: string) => { const d = getScaleDegrees(key); return `${d[0]}, ${d[0]}, ${d[4]}, ${d[0]}`; }, desc: 'I → I → V → I' },
  ];

  const playChord = async (frequencies: number[]) => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    frequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc.start(now); osc.stop(now + 0.8);
    });
  };

  const playProgression = async (chords: string[]) => {
    setIsPlaying(true);
    for (let chord of chords) {
      if (chordFrequencies[chord]) { await playChord(chordFrequencies[chord]); await new Promise(r => setTimeout(r, 900)); }
    }
    setIsPlaying(false);
  };

  const validateProgression = (inputStr: string) => {
    const chords = inputStr.split(',').map(c => c.trim()).filter(c => c);
    if (chords.length === 0) { setResult(null); setActiveStates(['q0']); setChordHistory([]); return; }
    let currentStates = ['q0'];
    const history: any[] = [];
    let rejectionReason: any = null;

    for (let i = 0; i < chords.length; i++) {
      const chordSymbol = chords[i];
      const chordFunc = chordToFunction[chordSymbol];
      if (!chordFunc) {
        const degrees = getScaleDegrees(selectedKey);
        setResult({ valid: false, message: `Unknown chord: "${chordSymbol}"`, explanation: `Use: ${degrees.join(', ')}`, failedAt: i, chords });
        setActiveStates([]); setChordHistory(history); return;
      }
      const nextStates: string[] = [];
      currentStates.forEach(state => {
        if (transitions[state]?.[chordFunc]) nextStates.push(...transitions[state][chordFunc]);
        else if (state === 'q3' && (chordFunc === 'IV' || chordFunc === 'ii')) {
          rejectionReason = { rule: 'Retrograde Prohibition', explanation: `Cannot move from Dominant to Predominant (${chordSymbol}).` };
          nextStates.push('q_reject');
        } else if (state === 'q2' && ['I', 'vi', 'iii'].includes(chordFunc)) {
          rejectionReason = { rule: 'Must go through Dominant', explanation: `Predominant cannot resolve directly to Tonic.` };
          nextStates.push('q_reject');
        }
      });
      if (nextStates.length === 0 || nextStates.includes('q_reject')) {
        const reason = rejectionReason || { rule: 'Invalid Transition', explanation: `"${chordSymbol}" cannot follow previous chord.` };
        setResult({ valid: false, message: `❌ Invalid Progression`, explanation: `${reason.rule}: ${reason.explanation}`, failedAt: i, chords, rule: reason.rule });
        setActiveStates(['q_reject']); setChordHistory(history); return;
      }
      history.push({ chord: chordSymbol, function: chordFunc, states: [...nextStates] });
      currentStates = [...new Set(nextStates)];
    }
    const isValid = currentStates.includes('q1');
    setActiveStates(currentStates); setChordHistory(history);
    if (isValid) setResult({ valid: true, message: '✓ Valid Progression - Accepted!', explanation: history.map((h, i) => `${i + 1}. ${h.chord} → ${h.function}`).join('\n'), chords, functions: history.map(h => h.function) });
    else setResult({ valid: false, message: '⚠ Incomplete Progression', explanation: `Doesn't end on Tonic. Add I, vi, or iii.`, chords, suggestions: getSuggestions(currentStates), incomplete: true });
  };

  const getSuggestions = (currentStates: string[]) => {
    const suggestions = new Set<string>();
    currentStates.forEach(state => { if (transitions[state]) Object.keys(transitions[state]).forEach(c => suggestions.add(c)); });
    return Array.from(suggestions);
  };

  const getLiveSuggestions = (inputStr: string) => {
    const chords = inputStr.split(',').map(c => c.trim()).filter(c => c);
    if (chords.length === 0) return getSuggestions(['q0']);
    let currentStates = ['q0'];
    for (let i = 0; i < chords.length; i++) {
      const chordFunc = chordToFunction[chords[i]];
      if (!chordFunc) return [];
      const nextStates: string[] = [];
      currentStates.forEach(state => { if (transitions[state]?.[chordFunc]) nextStates.push(...transitions[state][chordFunc]); });
      if (nextStates.length === 0) return [];
      currentStates = [...new Set(nextStates)];
    }
    return getSuggestions(currentStates);
  };

  const handleValidate = () => { setHasValidated(true); validateProgression(input); };

  useEffect(() => {
    setLiveSuggestions(getLiveSuggestions(input));
    if (hasValidated) { setHasValidated(false); setResult(null); setActiveStates(['q0']); setChordHistory([]); }
  }, [input]);

  const handleExample = (getChords: (key: string) => string) => { setInput(getChords(selectedKey)); setHasValidated(false); };

  const handleKeyChange = (newKey: string) => {
    setSelectedKey(newKey); setInput(''); setHasValidated(false); setResult(null); setActiveStates(['q0']); setChordHistory([]); setLiveSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-blue-900 to-slate-900 text-white p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Link to="/" className="absolute left-0 top-0 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors"><Home className="w-5 h-5" /></Link>
            <Music className="w-12 h-12 text-purple-300" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">Chord Validator</h1>
          </div>
          <p className="text-gray-200 text-lg">Powered by NFA Technology - Real-time Harmonic Validation</p>
          <button onClick={() => setShowLearnMore(true)} className="mt-4 flex items-center gap-2 mx-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-all hover:scale-105">
            <BookOpen className="w-4 h-4" />Learn More
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /><h2 className="text-xl font-semibold">Enter Chord Progression</h2></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Key:</span>
                <select value={selectedKey} onChange={(e) => handleKeyChange(e.target.value)} className="bg-slate-900/50 border border-purple-500/30 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500">
                  {majorKeys.map(k => <option key={k.key} value={k.key}>{k.name}</option>)}
                </select>
              </div>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Example: ${getScaleDegrees(selectedKey).slice(0, 4).join(', ')}`} className="w-full h-32 bg-slate-900/50 border border-purple-500/30 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-lg" />
            <p className="text-sm text-gray-400 mt-2 flex items-center gap-2"><Info className="w-4 h-4" />Current key: <strong className="text-purple-400">{majorKeys.find(k => k.key === selectedKey)?.name}</strong></p>
            <div className="flex gap-3 mt-4">
              <button onClick={handleValidate} disabled={!input.trim()} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 font-semibold"><Zap className="w-5 h-5" />Validate</button>
              <button onClick={() => { setInput(''); setHasValidated(false); setResult(null); setActiveStates(['q0']); setChordHistory([]); }} className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"><RotateCcw className="w-4 h-4" />Clear</button>
              {result?.valid && <button onClick={() => playProgression(result.chords)} disabled={isPlaying} className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">{isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}Play</button>}
            </div>
            {input.trim() && liveSuggestions.length > 0 && !hasValidated && (
              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Suggested next:</h3>
                <div className="flex flex-wrap gap-2">{liveSuggestions.map((c, i) => <button key={i} onClick={() => setInput(input + ', ' + c)} className="px-3 py-1 bg-purple-600/50 hover:bg-purple-600 rounded-full text-sm font-mono">{c}</button>)}</div>
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Examples in {selectedKey} Major:</h3>
              <div className="grid grid-cols-2 gap-2">
                {examples.map((ex, i) => (
                  <button key={i} onClick={() => handleExample(ex.getChords)} className="text-left p-3 bg-slate-900/50 hover:bg-purple-900/30 rounded-lg border border-purple-500/20">
                    <div className="text-xs text-purple-400 font-semibold">{ex.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{ex.desc}</div>
                    <div className="text-xs text-gray-400 font-mono mt-1">{ex.getChords(selectedKey)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold mb-4">NFA State Diagram</h2>
            <div className="relative h-96 bg-slate-900/50 rounded-xl border border-purple-500/20 overflow-hidden">
              {!hasValidated && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10"><div className="text-center"><Zap className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-pulse" /><p className="text-gray-400">Click "Validate" to see NFA states</p></div></div>}
              <svg className="w-full h-full">
                <g>
                  <line x1="120" y1="180" x2="180" y2="180" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arr)" />
                  <line x1="260" y1="160" x2="320" y2="100" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arr)" />
                  <line x1="260" y1="200" x2="320" y2="260" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arr)" />
                  <line x1="360" y1="120" x2="360" y2="240" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arr)" />
                  <path d="M 340 260 Q 280 220 240 180" stroke="#10b981" strokeWidth="3" fill="none" markerEnd="url(#arrG)" />
                  <line x1="400" y1="260" x2="460" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrR)" />
                  <defs>
                    <marker id="arr" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" /></marker>
                    <marker id="arrG" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#10b981" /></marker>
                    <marker id="arrR" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#ef4444" /></marker>
                  </defs>
                </g>
                {Object.entries(states).map(([key, state]) => {
                  const isActive = activeStates.includes(key);
                  return (
                    <g key={key}>
                      <circle cx={state.position.x} cy={state.position.y} r="35" className={`${isActive ? state.color : 'fill-slate-700'} transition-all duration-300`} strokeWidth={isActive ? "4" : "2"} stroke={isActive ? "#fbbf24" : "#64748b"} />
                      <text x={state.position.x} y={state.position.y} textAnchor="middle" dy=".3em" className="text-xs font-bold fill-white">{state.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {chordHistory.length > 0 && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Path:</h3>
                <div className="flex flex-wrap gap-2">{chordHistory.map((item, i) => <div key={i} className="flex items-center gap-2"><div className="px-3 py-1 bg-purple-600 rounded-full text-sm font-mono">{item.chord}</div>{i < chordHistory.length - 1 && <span className="text-purple-400">→</span>}</div>)}</div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className={`bg-slate-800/50 backdrop-blur rounded-2xl p-6 border ${result.valid ? 'border-emerald-500/50' : 'border-red-500/50'} mb-6`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${result.valid ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>{result.valid ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <XCircle className="w-8 h-8 text-red-400" />}</div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold mb-2 ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>{result.message}</h3>
                <p className="text-gray-300">{result.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm"><p>Powered by NFA • Group 4 BSCS 3-2 • COSC-302</p></div>
      </div>

      {showLearnMore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
            <div className="sticky top-0 bg-slate-800 border-b border-purple-500/30 p-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">How It Works</h2>
              <button onClick={() => setShowLearnMore(false)} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <section>
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-600/20 rounded-lg"><Cpu className="w-6 h-6 text-purple-400" /></div><h3 className="text-2xl font-bold text-purple-400">What is an NFA?</h3></div>
                <p className="text-gray-300">A Nondeterministic Finite Automaton processes sequences of symbols according to predefined rules, perfect for modeling chord progressions.</p>
              </section>
              <section>
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-emerald-600/20 rounded-lg"><GraduationCap className="w-6 h-6 text-emerald-400" /></div><h3 className="text-2xl font-bold text-emerald-400">Music Theory</h3></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-emerald-500/20"><h4 className="font-semibold text-emerald-400 mb-3">Harmonic Functions</h4><ul className="space-y-2 text-gray-300 text-sm"><li><strong className="text-blue-400">I (Tonic)</strong> - Stability</li><li><strong className="text-green-400">IV (Subdominant)</strong> - Building tension</li><li><strong className="text-orange-400">V (Dominant)</strong> - Maximum tension</li></ul></div>
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-emerald-500/20"><h4 className="font-semibold text-emerald-400 mb-3">Common Progressions</h4><ul className="space-y-2 text-gray-300 text-sm"><li><strong>I-IV-V-I</strong> - Classic</li><li><strong>I-vi-IV-V</strong> - 50s progression</li><li><strong>ii-V-I</strong> - Jazz cadence</li></ul></div>
                </div>
              </section>
            </div>
            <div className="sticky bottom-0 bg-slate-800 border-t border-purple-500/30 p-6"><button onClick={() => setShowLearnMore(false)} className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold">Got It!</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validator;
