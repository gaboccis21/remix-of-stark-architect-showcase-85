import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, Info, Zap, CheckCircle, XCircle, Music, Lightbulb, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Validator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeStates, setActiveStates] = useState(['q0']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chordHistory, setChordHistory] = useState<any[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // NFA State definitions
  const states: Record<string, { name: string; color: string; position: { x: number; y: number } }> = {
    q0: { name: 'START', color: 'bg-purple-500', position: { x: 80, y: 280 } },
    q1: { name: 'I (Tonic)', color: 'bg-blue-500', position: { x: 250, y: 280 } },
    q2: { name: 'IV (Subdominant)', color: 'bg-green-500', position: { x: 420, y: 120 } },
    q3: { name: 'V (Dominant)', color: 'bg-orange-500', position: { x: 590, y: 280 } },
    q4: { name: 'ii (Supertonic)', color: 'bg-teal-500', position: { x: 420, y: 440 } },
    q5: { name: 'vi (Submediant)', color: 'bg-pink-500', position: { x: 250, y: 440 } },
    accept: { name: 'ACCEPT', color: 'bg-emerald-500', position: { x: 760, y: 280 } },
  };

  // Chord to frequency mapping
  const chordFrequencies: Record<string, number[]> = {
    'C': [261.63, 329.63, 392.00],
    'Dm': [293.66, 349.23, 440.00],
    'Em': [329.63, 392.00, 493.88],
    'F': [349.23, 440.00, 523.25],
    'G': [392.00, 493.88, 587.33],
    'G7': [392.00, 493.88, 587.33, 698.46],
    'Am': [440.00, 523.25, 659.25],
    'Bdim': [493.88, 587.33, 698.46],
  };

  // NFA Transitions
  const transitions: Record<string, Record<string, string[]>> = {
    q0: { 'C': ['q1'], 'Am': ['q5'] },
    q1: { 'Dm': ['q4'], 'F': ['q2'], 'G': ['q3'], 'G7': ['q3'], 'Am': ['q5'], 'C': ['q1'] },
    q2: { 'G': ['q3'], 'G7': ['q3'], 'C': ['accept'], 'Dm': ['q4'] },
    q3: { 'C': ['accept'], 'Am': ['q5'] },
    q4: { 'G': ['q3'], 'G7': ['q3'], 'F': ['q2'] },
    q5: { 'Dm': ['q4'], 'F': ['q2'], 'C': ['q1'] },
  };

  const examples = [
    { name: 'I-IV-V-I (Classic)', chords: 'C, F, G, C' },
    { name: 'I-vi-IV-V (Pop)', chords: 'C, Am, F, G' },
    { name: 'ii-V-I (Jazz)', chords: 'Dm, G7, C' },
    { name: 'I-V-vi-IV (Modern)', chords: 'C, G, Am, F' },
  ];

  const playChord = async (frequencies: number[]) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    frequencies.forEach(freq => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      oscillator.start(now);
      oscillator.stop(now + 0.8);
    });
  };

  const playProgression = async (chords: string[]) => {
    setIsPlaying(true);
    for (let chord of chords) {
      if (chordFrequencies[chord]) {
        await playChord(chordFrequencies[chord]);
        await new Promise(resolve => setTimeout(resolve, 900));
      }
    }
    setIsPlaying(false);
  };

  const validateProgression = (inputStr: string) => {
    const chords = inputStr.split(',').map(c => c.trim()).filter(c => c);
    if (chords.length === 0) {
      setResult(null);
      setActiveStates(['q0']);
      setChordHistory([]);
      return;
    }

    let currentStates = ['q0'];
    const history: any[] = [];

    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i];
      const nextStates: string[] = [];
      currentStates.forEach(state => {
        if (transitions[state] && transitions[state][chord]) {
          nextStates.push(...transitions[state][chord]);
        }
      });

      if (nextStates.length === 0) {
        setResult({
          valid: false,
          message: `Invalid transition at chord "${chord}"`,
          explanation: `The chord "${chord}" cannot follow the previous progression according to Western tonal harmony rules.`,
          failedAt: i,
          chords: chords,
        });
        setActiveStates([]);
        setChordHistory(history);
        return;
      }

      history.push({ chord, states: [...nextStates] });
      currentStates = [...new Set(nextStates)];
    }

    const isValid = currentStates.includes('accept');
    setActiveStates(currentStates);
    setChordHistory(history);

    if (isValid) {
      setResult({
        valid: true,
        message: 'Valid Progression!',
        explanation: analyzeProgression(chords),
        chords: chords,
      });
    } else {
      setResult({
        valid: false,
        message: 'Incomplete Progression',
        explanation: 'Your progression is harmonically valid so far, but needs proper resolution. Try adding a final tonic chord (C) to complete the cadence.',
        chords: chords,
        suggestions: getSuggestions(currentStates),
      });
    }
  };

  const analyzeProgression = (chords: string[]) => {
    const analysis: Record<string, string> = {
      'C': 'Tonic - establishes key center and stability',
      'Dm': 'Supertonic - creates forward motion toward dominant',
      'Em': 'Mediant - transitional function',
      'F': 'Subdominant - pre-dominant, moves toward dominant',
      'G': 'Dominant - creates tension, resolves to tonic',
      'G7': 'Dominant seventh - stronger pull to tonic',
      'Am': 'Submediant - relative minor, deceptive resolution',
      'Bdim': 'Leading tone diminished - strong pull to tonic',
    };

    return chords.map((chord, i) => 
      `${i + 1}. ${chord} - ${analysis[chord] || 'Harmonic function'}`
    ).join('\n');
  };

  const getSuggestions = (currentStates: string[]) => {
    const suggestions = new Set<string>();
    currentStates.forEach(state => {
      if (transitions[state]) {
        Object.keys(transitions[state]).forEach(chord => suggestions.add(chord));
      }
    });
    return Array.from(suggestions);
  };

  useEffect(() => {
    validateProgression(input);
  }, [input]);

  const handleExample = (chords: string) => {
    setInput(chords);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="text-white p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <Link
              to="/"
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
            >
              <Home className="w-4 h-4" />
              Exit
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Chord Validator
              </h1>
            </div>
            <p className="text-gray-300 text-lg">Powered by NFA Technology - Real-time Harmonic Validation</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Input Section */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold">Enter Chord Progression</h2>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="C, Dm, G7, C"
                className="w-full h-32 bg-slate-900/50 border border-purple-500/30 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-lg"
              />
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Separate chords with commas. Examples: C, Dm, G7, C
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setInput('')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
                {result?.valid && result.chords.length > 0 && (
                  <button
                    onClick={() => playProgression(result.chords)}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                    Play Progression
                  </button>
                )}
              </div>

              {/* Examples */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Examples:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleExample(ex.chords)}
                      className="text-left p-3 bg-slate-900/50 hover:bg-purple-900/30 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all"
                    >
                      <div className="text-xs text-purple-400 font-semibold">{ex.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-1">{ex.chords}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* NFA Visualization */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold mb-4">NFA State Diagram</h2>
              <div className="relative bg-slate-900/50 rounded-xl border border-purple-500/20 overflow-hidden">
                <svg viewBox="0 0 840 560" className="w-full h-auto">
                  {/* Draw connections */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" />
                    </marker>
                    <marker id="arrowhead-green" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
                    </marker>
                  </defs>
                  
                  <g>
                    {/* q0 -> q1 */}
                    <line x1="120" y1="280" x2="200" y2="280" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    {/* q1 -> q2 */}
                    <line x1="280" y1="250" x2="380" y2="160" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    {/* q1 -> q4 */}
                    <line x1="280" y1="310" x2="380" y2="400" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    {/* q2 -> q3 */}
                    <line x1="460" y1="150" x2="550" y2="250" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    {/* q4 -> q3 */}
                    <line x1="460" y1="410" x2="550" y2="310" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    {/* q3 -> accept */}
                    <line x1="640" y1="280" x2="710" y2="280" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead-green)" />
                  </g>

                  {/* Draw states */}
                  {Object.entries(states).map(([key, state]) => {
                    const isActive = activeStates.includes(key);
                    const isStart = key === 'q0';
                    return (
                      <g key={key}>
                        <circle
                          cx={state.position.x}
                          cy={state.position.y}
                          r="45"
                          fill={isActive ? (key === 'accept' ? '#10b981' : '#6b7280') : '#4b5563'}
                          strokeWidth={isActive ? "4" : "2"}
                          stroke={isStart ? "#fbbf24" : isActive ? "#fbbf24" : "#64748b"}
                          className="transition-all duration-300"
                        />
                        <text
                          x={state.position.x}
                          y={state.position.y}
                          textAnchor="middle"
                          dy=".3em"
                          className="text-sm font-bold fill-white"
                        >
                          {state.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chord History */}
              {chordHistory.length > 0 && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Transition Path:</h3>
                  <div className="flex flex-wrap gap-2">
                    {chordHistory.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-600 rounded-full text-sm font-mono">
                          {item.chord}
                        </span>
                        {i < chordHistory.length - 1 && (
                          <span className="text-purple-400">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className={`bg-slate-800/50 backdrop-blur rounded-2xl p-6 border ${
              result.valid ? 'border-emerald-500/50' : 'border-red-500/50'
            } mb-6`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${result.valid ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {result.valid ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-2 ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.message}
                  </h3>
                  <p className="text-gray-300 mb-4">{result.explanation}</p>
                  {result.valid && (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-emerald-500/20">
                      <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Harmonic Analysis:
                      </h4>
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                        {result.explanation}
                      </pre>
                    </div>
                  )}

                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="mt-4 bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Suggested next chords:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestions.map((chord: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setInput(input + (input.trim() ? ', ' : '') + chord)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-full text-sm font-mono transition-colors"
                          >
                            {chord}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center text-gray-400 text-sm mb-8">
            <p>Powered by Nondeterministic Finite Automaton (NFA) • Group 4 BSCS 3-2 • COSC-302</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Validator;
