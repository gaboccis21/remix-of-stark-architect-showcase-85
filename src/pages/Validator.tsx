import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, Info, Zap, CheckCircle, XCircle, Music, Lightbulb, RotateCcw, BookOpen, X, Code, Cpu, GraduationCap } from 'lucide-react';

interface ChordSuggestion {
  chord: string;
  function: string;
}

interface ChordHistoryItem {
  chord: string;
  function: string;
  states: string[];
}

interface ValidationResult {
  valid: boolean;
  message: string;
  explanation: string;
  failedAt?: number;
  chords?: string[];
  rule?: string;
  functions?: string[];
  suggestions?: ChordSuggestion[];
  incomplete?: boolean;
}

const Validator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [activeStates, setActiveStates] = useState(['q0']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chordHistory, setChordHistory] = useState<ChordHistoryItem[]>([]);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<ChordSuggestion[]>([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [selectedKey, setSelectedKey] = useState('C');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // NFA State definitions - Following Functional Harmony Rules
  const states: Record<string, { name: string; color: string; position: { x: number; y: number } }> = {
    q0: { name: 'START', color: 'bg-cyan-500', position: { x: 80, y: 180 } },
    q1: { name: 'TONIC', color: 'bg-sky-500', position: { x: 220, y: 180 } },
    q2: { name: 'PREDOM', color: 'bg-teal-500', position: { x: 360, y: 80 } },
    q3: { name: 'DOM', color: 'bg-blue-500', position: { x: 360, y: 280 } },
    q_reject: { name: 'REJECT', color: 'bg-red-500', position: { x: 500, y: 180 } },
  };

  // Chord to frequency mapping - expanded for all keys
  const chordFrequencies: Record<string, number[]> = {
    // C Major
    'C': [261.63, 329.63, 392.00], 'Dm': [293.66, 349.23, 440.00], 'Em': [329.63, 392.00, 493.88],
    'F': [349.23, 440.00, 523.25], 'G': [392.00, 493.88, 587.33], 'G7': [392.00, 493.88, 587.33, 698.46],
    'Am': [440.00, 523.25, 659.25], 'Bdim': [493.88, 587.33, 698.46],
    // G Major
    'Bm': [493.88, 587.33, 739.99], 'D': [293.66, 369.99, 440.00], 'D7': [293.66, 369.99, 440.00, 523.25],
    'F#dim': [369.99, 440.00, 523.25],
    // D Major
    'F#m': [369.99, 440.00, 554.37], 'A': [440.00, 554.37, 659.25], 'A7': [440.00, 554.37, 659.25, 783.99],
    'C#dim': [277.18, 329.63, 392.00],
    // A Major
    'C#m': [277.18, 329.63, 415.30], 'E': [329.63, 415.30, 493.88], 'E7': [329.63, 415.30, 493.88, 587.33],
    'G#dim': [415.30, 493.88, 587.33],
    // E Major
    'G#m': [415.30, 493.88, 622.25], 'B': [493.88, 622.25, 739.99], 'B7': [493.88, 622.25, 739.99, 880.00],
    'D#dim': [311.13, 369.99, 440.00],
    // F Major
    'Gm': [392.00, 466.16, 587.33], 'Bb': [466.16, 587.33, 698.46], 'C7': [261.63, 329.63, 392.00, 466.16],
    'Edim': [329.63, 392.00, 466.16],
    // Bb Major
    'Cm': [261.63, 311.13, 392.00], 'Eb': [311.13, 392.00, 466.16], 'F7': [349.23, 440.00, 523.25, 622.25],
    'Adim': [440.00, 523.25, 622.25],
    // Eb Major
    'Fm': [349.23, 415.30, 523.25], 'Ab': [415.30, 523.25, 622.25], 'Bb7': [466.16, 587.33, 698.46, 830.61],
    'Ddim': [293.66, 349.23, 415.30],
  };

  // Available major keys
  const majorKeys = [
    { key: 'C', name: 'C Major' },
    { key: 'G', name: 'G Major' },
    { key: 'D', name: 'D Major' },
    { key: 'A', name: 'A Major' },
    { key: 'E', name: 'E Major' },
    { key: 'F', name: 'F Major' },
    { key: 'Bb', name: 'B♭ Major' },
    { key: 'Eb', name: 'E♭ Major' },
  ];

  // Get scale degrees for any major key
  const getScaleDegrees = (key: string): string[] => {
    const scales: Record<string, string[]> = {
      'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
      'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
      'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
      'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
      'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
      'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
      'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
      'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
    };
    return scales[key] || scales['C'];
  };

  // Get chord-to-function mapping for selected key
  const getChordToFunction = (key: string): Record<string, string> => {
    const degrees = getScaleDegrees(key);
    return {
      [degrees[0]]: 'I', [degrees[5]]: 'vi', [degrees[2]]: 'iii',
      [degrees[3]]: 'IV', [degrees[1]]: 'ii',
      [degrees[4]]: 'V', [`${degrees[4]}7`]: 'V', [degrees[6]]: 'vii°',
    };
  };

  const chordToFunction = getChordToFunction(selectedKey);

  // NFA Transitions
  const transitions: Record<string, Record<string, string[]>> = {
    q0: { 'I': ['q1'], 'vi': ['q1'], 'iii': ['q1'] },
    q1: {
      'I': ['q1'], 'vi': ['q1'], 'iii': ['q1'],
      'IV': ['q2'], 'ii': ['q2'],
      'V': ['q3'], 'vii°': ['q3'],
    },
    q2: { 'V': ['q3'], 'vii°': ['q3'] },
    q3: {
      'V': ['q3'], 'vii°': ['q3'],
      'I': ['q1'], 'vi': ['q1'], 'iii': ['q1'],
    },
  };

  // Dynamic examples based on selected key
  const getExamples = () => {
    const d = getScaleDegrees(selectedKey);
    return [
      { name: 'Authentic Cadence', chords: `${d[0]}, ${d[4]}, ${d[0]}`, desc: 'I → V → I' },
      { name: 'Full Sequence', chords: `${d[0]}, ${d[3]}, ${d[4]}, ${d[0]}`, desc: 'I → IV → V → I' },
      { name: 'With Predominant', chords: `${d[0]}, ${d[1]}, ${d[4]}, ${d[0]}`, desc: 'I → ii → V → I' },
      { name: 'Tonic Prolongation', chords: `${d[0]}, ${d[0]}, ${d[4]}, ${d[0]}`, desc: 'I → I → V → I' },
    ];
  };

  const getInvalidExamples = () => {
    const d = getScaleDegrees(selectedKey);
    return [
      { name: 'Wrong Starting Chord', chords: `${d[4]}, ${d[0]}`, desc: 'Must start with Tonic' },
      { name: 'Plagal Without Dom', chords: `${d[0]}, ${d[3]}, ${d[0]}`, desc: 'IV → I directly' },
      { name: 'Retrograde Motion', chords: `${d[0]}, ${d[4]}, ${d[3]}`, desc: 'V → IV prohibited' },
    ];
  };

  const handleKeyChange = (newKey: string) => {
    setSelectedKey(newKey);
    setInput('');
    setHasValidated(false);
    setResult(null);
    setActiveStates(['q0']);
    setChordHistory([]);
    setLiveSuggestions([]);
    setIsAnimating(false);
    setCurrentStep(0);
  };

  const playChord = async (frequencies: number[]) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setActiveStates(['q0']);
    setChordHistory([]);
    await new Promise(resolve => setTimeout(resolve, 300));

    let currentStates = ['q0'];
    const history: ChordHistoryItem[] = [];

    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i];
      const chordFunction = chordToFunction[chord];

      if (!chordFunction) {
        setIsPlaying(false);
        return;
      }

      const nextStates: string[] = [];
      let shouldReject = false;

      currentStates.forEach(state => {
        if (transitions[state] && transitions[state][chordFunction]) {
          nextStates.push(...transitions[state][chordFunction]);
        } else if (state === 'q0' && (chordFunction === 'IV' || chordFunction === 'ii' || chordFunction === 'V' || chordFunction === 'vii°')) {
          shouldReject = true;
          nextStates.push('q_reject');
        } else if (state === 'q3' && (chordFunction === 'IV' || chordFunction === 'ii')) {
          shouldReject = true;
          nextStates.push('q_reject');
        } else if (state === 'q2' && (chordFunction === 'I' || chordFunction === 'vi' || chordFunction === 'iii')) {
          shouldReject = true;
          nextStates.push('q_reject');
        } else if (!transitions[state] || !transitions[state][chordFunction]) {
          shouldReject = true;
          nextStates.push('q_reject');
        }
      });

      const uniqueNextStates = [...new Set(nextStates)];
      setActiveStates(uniqueNextStates);
      const newHistoryItem: ChordHistoryItem = { chord: chord, function: chordFunction, states: [...uniqueNextStates] };
      history.push(newHistoryItem);
      setChordHistory([...history]);

      if (chordFrequencies[chord]) {
        playChord(chordFrequencies[chord]);
      }

      if (shouldReject || uniqueNextStates.includes('q_reject')) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsPlaying(false);
        return;
      }

      currentStates = uniqueNextStates;
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsPlaying(false);
  };

  const animateValidation = async (inputStr: string) => {
    const chords = inputStr.split(',').map(c => c.trim()).filter(c => c);
    if (chords.length === 0) {
      setResult(null);
      setActiveStates(['q0']);
      setChordHistory([]);
      setIsAnimating(false);
      return;
    }

    let currentStates = ['q0'];
    const history: ChordHistoryItem[] = [];
    let rejectionReason: { rule: string; explanation: string } | null = null;

    setActiveStates(['q0']);
    setChordHistory([]);
    await new Promise(resolve => setTimeout(resolve, 600));

    for (let i = 0; i < chords.length; i++) {
      setCurrentStep(i + 1);
      const chordSymbol = chords[i];
      const chordFunction = chordToFunction[chordSymbol];

      if (!chordFunction) {
        setResult({
          valid: false,
          message: `Unknown chord: "${chordSymbol}"`,
          explanation: `The chord "${chordSymbol}" is not recognized. Please use supported chord symbols from the selected key.`,
          failedAt: i,
          chords: chords,
        });
        setActiveStates([]);
        setChordHistory(history);
        setIsAnimating(false);
        return;
      }

      const nextStates: string[] = [];
      currentStates.forEach(state => {
        if (transitions[state] && transitions[state][chordFunction]) {
          nextStates.push(...transitions[state][chordFunction]);
        } else if (state === 'q0' && (chordFunction === 'IV' || chordFunction === 'ii' || chordFunction === 'V' || chordFunction === 'vii°')) {
          rejectionReason = {
            rule: 'Must Start with Tonic',
            explanation: `Chord progressions must begin with a Tonic chord (I, vi, or iii). Starting with ${chordSymbol} (${chordFunction}) is not permitted in functional harmony.`,
          };
          nextStates.push('q_reject');
        } else if (state === 'q3' && (chordFunction === 'IV' || chordFunction === 'ii')) {
          rejectionReason = {
            rule: 'Retrograde Prohibition',
            explanation: `Cannot move from Dominant (${chords[i-1]}) to Predominant (${chordSymbol}). This creates a "retrograde" motion which weakens the harmonic resolution.`,
          };
          nextStates.push('q_reject');
        } else if (state === 'q2' && (chordFunction === 'I' || chordFunction === 'vi' || chordFunction === 'iii')) {
          rejectionReason = {
            rule: 'Predominant Must Resolve Through Dominant',
            explanation: `Predominant function cannot resolve directly to Tonic. It must first move to Dominant (V or vii°).`,
          };
          nextStates.push('q_reject');
        }
      });

      if (nextStates.length === 0 || nextStates.includes('q_reject')) {
        const reason = rejectionReason || {
          rule: 'Invalid Transition',
          explanation: `The chord "${chordSymbol}" (${chordFunction}) cannot follow the previous chord(s) according to functional harmony rules.`,
        };

        setActiveStates(['q_reject']);
        const newHistory: ChordHistoryItem[] = [...history, { chord: chordSymbol, function: chordFunction, states: ['q_reject'] }];
        setChordHistory(newHistory);
        await new Promise(resolve => setTimeout(resolve, 800));

        setResult({
          valid: false,
          message: `❌ Invalid Progression`,
          explanation: `${reason.rule}: ${reason.explanation}`,
          failedAt: i,
          chords: chords,
          rule: reason.rule,
        });
        setIsAnimating(false);
        return;
      }

      const uniqueNextStates = [...new Set(nextStates)];
      setActiveStates(uniqueNextStates);
      const newHistory: ChordHistoryItem[] = [...history, { chord: chordSymbol, function: chordFunction, states: [...uniqueNextStates] }];
      setChordHistory(newHistory);
      history.push({ chord: chordSymbol, function: chordFunction, states: [...uniqueNextStates] });
      currentStates = uniqueNextStates;
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const isValid = currentStates.includes('q1');
    setActiveStates(currentStates);
    setChordHistory(history);

    if (isValid) {
      setResult({
        valid: true,
        message: '✓ Valid Progression - Accepted!',
        explanation: analyzeProgression(history),
        chords: chords,
        functions: history.map((h) => h.function),
      });
    } else {
      setResult({
        valid: false,
        message: '⚠ Incomplete Progression',
        explanation: `Your progression follows harmonic rules but doesn't end on Tonic. Current state: ${getCurrentStateName(currentStates)}. Add a Tonic chord to complete.`,
        chords: chords,
        suggestions: getSuggestions(currentStates),
        incomplete: true,
      });
    }
    setIsAnimating(false);
  };

  const analyzeProgression = (history: ChordHistoryItem[]) => {
    const functionDescriptions: Record<string, string> = {
      'I': 'Tonic (I) - Establishes key center',
      'vi': 'Tonic function (vi) - Relative minor',
      'iii': 'Tonic function (iii) - Mediant',
      'IV': 'Predominant (IV) - Subdominant',
      'ii': 'Predominant (ii) - Supertonic',
      'V': 'Dominant (V) - Maximum tension',
      'vii°': 'Dominant function (vii°) - Leading tone',
    };
    const analysis = history.map((item, i) => {
      const desc = functionDescriptions[item.function] || 'Harmonic function';
      return `${i + 1}. ${item.chord} → ${desc}`;
    }).join('\n');

    let cadenceType = '';
    if (history.length >= 2) {
      const lastTwo = [history[history.length - 2].function, history[history.length - 1].function];
      if ((lastTwo[0] === 'V' || lastTwo[0] === 'vii°') && (lastTwo[1] === 'I' || lastTwo[1] === 'vi' || lastTwo[1] === 'iii')) {
        cadenceType = '\n\n✓ Authentic Cadence: Dominant → Tonic';
      }
    }
    return analysis + cadenceType;
  };

  const getCurrentStateName = (stateList: string[]) => {
    const stateNames: Record<string, string> = { 'q0': 'START', 'q1': 'TONIC', 'q2': 'PREDOMINANT', 'q3': 'DOMINANT', 'q_reject': 'REJECTED' };
    return stateList.map(s => stateNames[s]).join(' or ');
  };

  const getSuggestions = (currentStates: string[]): ChordSuggestion[] => {
    const suggestedFunctions = new Set<string>();
    currentStates.forEach(state => {
      if (transitions[state]) {
        Object.keys(transitions[state]).forEach(func => suggestedFunctions.add(func));
      }
    });

    const suggestions: ChordSuggestion[] = [];
    const degrees = getScaleDegrees(selectedKey);
    const funcToChord: Record<string, string[]> = {
      'I': [degrees[0]],
      'vi': [degrees[5]],
      'iii': [degrees[2]],
      'IV': [degrees[3]],
      'ii': [degrees[1]],
      'V': [degrees[4], `${degrees[4]}7`],
      'vii°': [degrees[6]],
    };

    suggestedFunctions.forEach(func => {
      if (funcToChord[func]) {
        funcToChord[func].forEach(chord => {
          suggestions.push({ chord, function: func });
        });
      }
    });
    return suggestions;
  };

  const getLiveSuggestions = (inputStr: string): ChordSuggestion[] => {
    const chords = inputStr.split(',').map(c => c.trim()).filter(c => c);
    if (chords.length === 0) return getSuggestions(['q0']);

    let currentStates = ['q0'];
    for (let i = 0; i < chords.length; i++) {
      const chordSymbol = chords[i];
      const chordFunction = chordToFunction[chordSymbol];
      if (!chordFunction) return [];

      const nextStates: string[] = [];
      currentStates.forEach(state => {
        if (transitions[state] && transitions[state][chordFunction]) {
          nextStates.push(...transitions[state][chordFunction]);
        }
      });
      if (nextStates.length === 0) return [];
      currentStates = [...new Set(nextStates)];
    }
    return getSuggestions(currentStates);
  };

  const handleValidate = () => {
    setHasValidated(true);
    setIsAnimating(true);
    setCurrentStep(0);
    animateValidation(input);
  };

  useEffect(() => {
    const suggestions = getLiveSuggestions(input);
    setLiveSuggestions(suggestions);
    if (hasValidated) {
      setHasValidated(false);
      setResult(null);
      setActiveStates(['q0']);
      setChordHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleExample = (chords: string) => {
    setInput(chords);
    setHasValidated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-[hsl(215,28%,14%)] to-secondary text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-20"></div>
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chord Validator
            </h1>
          </div>
          <button
            onClick={() => setShowLearnMore(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-all hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Learn More</span>
          </button>
        </div>

        <p className="text-center text-muted-foreground text-sm mb-6">Powered by NFA Technology - Real-time Harmonic Validation</p>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Input Section */}
          <div className="bg-secondary/50 backdrop-blur rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold">Enter Chord Progression</h2>
              </div>
              {/* Key Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Key:</span>
                <select
                  value={selectedKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className="bg-secondary/50 border border-primary/30 rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {majorKeys.map(k => (
                    <option key={k.key} value={k.key}>{k.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Example: ${getScaleDegrees(selectedKey).slice(0, 4).join(', ')}`}
              className="w-full h-28 bg-secondary/50 border border-primary/30 rounded-xl p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-lg"
            />

            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Current key: <strong className="text-primary">{majorKeys.find(k => k.key === selectedKey)?.name}</strong>
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={handleValidate}
                disabled={!input.trim() || isAnimating}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
              >
                <Zap className="w-4 h-4" />
                {isAnimating ? 'Validating...' : 'Validate'}
              </button>
              <button
                onClick={() => {
                  setInput('');
                  setHasValidated(false);
                  setResult(null);
                  setActiveStates(['q0']);
                  setChordHistory([]);
                  setLiveSuggestions([]);
                  setIsAnimating(false);
                  setCurrentStep(0);
                }}
                disabled={isAnimating}
                className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
              {input.trim() && (
                <button
                  onClick={() => {
                    if (!hasValidated) {
                      setHasValidated(true);
                    }
                    const chords = input.split(',').map(c => c.trim()).filter(c => c);
                    playProgression(chords);
                  }}
                  disabled={isPlaying || isAnimating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                  Play
                </button>
              )}
            </div>

            {/* Live Suggestions */}
            {input.trim() && liveSuggestions.length > 0 && !hasValidated && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-primary/20">
                <h3 className="text-xs font-semibold text-primary mb-2 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  Suggested next chords:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {liveSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(input + (input.trim().endsWith(',') ? ' ' : ', ') + suggestion.chord)}
                      className="px-3 py-1.5 bg-primary/50 hover:bg-primary rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                    >
                      <span className="font-bold">{suggestion.chord}</span>
                      <span className="text-accent text-[10px]">({suggestion.function})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Quick Examples in {selectedKey} Major:</h3>
              <div className="grid grid-cols-2 gap-2">
                {getExamples().map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleExample(ex.chords)}
                    className="text-left p-2.5 bg-secondary/50 hover:bg-primary/20 rounded-lg border border-primary/20 hover:border-primary/50 transition-all"
                  >
                    <div className="text-xs text-primary font-semibold">{ex.name}</div>
                    <div className="text-[10px] text-muted-foreground">{ex.desc}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{ex.chords}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Invalid Examples */}
            <div className="mt-3">
              <h3 className="text-xs font-semibold text-red-400 mb-2">❌  Invalid Examples:</h3>
              <div className="grid grid-cols-3 gap-2">
                {getInvalidExamples().map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleExample(ex.chords)}
                    className="text-left p-2.5 bg-secondary/50 hover:bg-red-900/20 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all"
                  >
                    <div className="text-xs text-red-400 font-semibold">{ex.name}</div>
                    <div className="text-[10px] text-muted-foreground">{ex.desc}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{ex.chords}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NFA Visualization */}
          <div className="bg-secondary/50 backdrop-blur rounded-2xl p-5 border border-primary/20">
            <h2 className="text-lg font-semibold mb-4">NFA State Diagram</h2>
            <div className="relative bg-secondary/50 rounded-xl border border-primary/20 overflow-hidden" style={{ height: '360px' }}>
              {!hasValidated && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Zap className="w-10 h-10 text-primary mx-auto mb-2 animate-pulse" />
                    <p className="text-muted-foreground text-sm">Click "Validate" to see NFA states</p>
                  </div>
                </div>
              )}
              {isAnimating && (
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur px-4 py-2 rounded-lg z-20 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-primary-foreground">Processing Step {currentStep}...</span>
                </div>
              )}
              <svg viewBox="0 0 580 360" className="w-full h-full">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#38bdf8" />
                  </marker>
                  <marker id="arrowhead-active" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#67e8f9" />
                  </marker>
                  <marker id="arrowhead-red" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Connection lines */}
                {/* q0 -> q1 */}
                <line x1="115" y1="180" x2="180" y2="180" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="147" y="170" textAnchor="middle" className="fill-muted-foreground text-[10px]">I,vi,iii</text>

                {/* q1 -> q2 (curved up) */}
                <path d="M 235 155 Q 270 100 330 90" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="265" y="105" textAnchor="middle" className="fill-muted-foreground text-[10px]">IV,ii</text>

                {/* q1 -> q3 (curved down) */}
                <path d="M 235 205 Q 280 270 330 270" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="265" y="265" textAnchor="middle" className="fill-muted-foreground text-[10px]">V,vii°</text>

                {/* q2 -> q3 */}
                <line x1="360" y1="115" x2="360" y2="245" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="375" y="180" textAnchor="start" className="fill-muted-foreground text-[10px]">V,vii°</text>

                {/* q3 -> q1 (curved back) */}
                <path d="M 328 295 Q 220 350 210 215" fill="none" stroke="#14b8a6" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="240" y="330" textAnchor="middle" className="fill-teal-400 text-[10px]">I,vi,iii ✓</text>

                {/* q1 self-loop */}
                <path d="M 200 158 Q 200 90 230 150" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="210" y="115" textAnchor="middle" className="fill-muted-foreground text-[9px]">I,vi,iii</text>

                {/* q3 self-loop */}
                <path d="M 392 270 Q 430 260 392 300" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="400" y="260" textAnchor="start" className="fill-muted-foreground text-[9px]">V,vii°</text>

                {/* Reject paths (dashed) */}
                <path d="M 90 165 Q 295 -100 510 150" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrowhead-red)" />
                <text x="300" y="25" textAnchor="middle" className="fill-red-400 text-[9px] font-semibold">IV,ii,V,vii°</text>
                <path d="M 352 90 Q 400 70 500 150" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrowhead-red)" />
                <text x="420" y="115" textAnchor="middle" className="fill-red-400 text-[9px]">I,vi,iii</text>
                <path d="M 352 280 Q 440 300 500 210" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arrowhead-red)" />
                <text x="470" y="270" textAnchor="middle" className="fill-red-400 text-[9px]">IV,ii</text>

                {/* Draw states */}
                {Object.entries(states).map(([key, state]) => {
                  const isActive = activeStates.includes(key);
                  const isAccept = key === 'q1';
                  const colors: Record<string, { fill: string; stroke: string }> = {
                    'q0': { fill: '#06b6d4', stroke: '#22d3ee' },
                    'q1': { fill: '#0ea5e9', stroke: '#38bdf8' },
                    'q2': { fill: '#14b8a6', stroke: '#2dd4bf' },
                    'q3': { fill: '#3b82f6', stroke: '#60a5fa' },
                    'q_reject': { fill: '#ef4444', stroke: '#f87171' },
                  };
                  const color = colors[key];

                  return (
                    <g key={key}>
                      {isAccept && (
                        <circle
                          cx={state.position.x}
                          cy={state.position.y}
                          r="38"
                          fill="none"
                          stroke={isActive ? "#67e8f9" : "#38bdf8"}
                          strokeWidth="1.5"
                        />
                      )}
                      {isActive && !isAccept && (
                        <circle
                          cx={state.position.x}
                          cy={state.position.y}
                          r="38"
                          fill="none"
                          stroke="#67e8f9"
                          strokeWidth="3"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={state.position.x}
                        cy={state.position.y}
                        r="32"
                        fill={isActive ? color.fill : '#374151'}
                        stroke={isActive ? '#67e8f9' : color.stroke}
                        strokeWidth={isActive ? 3 : 2}
                        className="transition-all duration-300"
                      />
                      <text
                        x={state.position.x}
                        y={state.position.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-[11px] font-bold"
                      >
                        {state.name}
                      </text>
                      <text
                        x={state.position.x}
                        y={state.position.y + 50}
                        textAnchor="middle"
                        className="fill-gray-500 text-[9px]"
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                {/* Start arrow */}
                <line x1="20" y1="180" x2="45" y2="180" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                <text x="10" y="170" className="fill-primary text-[10px]">start</text>
              </svg>
            </div>

            {/* Chord History */}
            {chordHistory.length > 0 && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-primary/20">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Transition Path:</h3>
                <div className="flex flex-wrap items-center gap-1">
                  {chordHistory.map((item, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2.5 py-1 bg-primary rounded-full text-xs font-mono text-primary-foreground">
                        {item.chord} <span className="text-accent">({item.function})</span>
                      </span>
                      {i < chordHistory.length - 1 && (
                        <span className="text-primary text-xs">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className={`bg-secondary/50 backdrop-blur rounded-2xl p-5 border ${
            result.valid ? 'border-teal-500/50' : 'border-red-500/50'
          } mb-6`}>
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-full ${result.valid ? 'bg-teal-500/20' : 'bg-red-500/20'}`}>
                {result.valid ? (
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${result.valid ? 'text-teal-400' : 'text-red-400'}`}>
                  {result.message}
                </h3>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{result.explanation}</p>

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="mt-4 bg-secondary/50 rounded-lg p-3 border border-primary/20">
                    <h4 className="font-semibold text-primary text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Suggested next chords to complete:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(input + (input.trim() ? ', ' : '') + suggestion.chord)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                        >
                          <span className="font-bold">{suggestion.chord}</span>
                          <span className="text-accent text-[10px]">({suggestion.function})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-muted-foreground text-xs">
          <p>Powered by NFA • Group 4 BSCS 3-2 • COSC-302</p>
        </div>
      </div>

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-secondary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-primary/30">
            <div className="sticky top-0 bg-secondary border-b border-primary/30 p-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                How It Works
              </h2>
              <button
                onClick={() => setShowLearnMore(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* What is NFA */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary">What is an NFA?</h3>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 border border-primary/20">
                  <p className="text-muted-foreground text-sm mb-3">
                    A <strong className="text-primary">Nondeterministic Finite Automaton (NFA)</strong> is a mathematical 
                    model that processes sequences of symbols according to predefined rules, perfect for modeling chord progressions.
                  </p>
                  <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                    <p className="text-teal-400">M = (Q, Σ, δ, q₀, F)</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• <strong>Q</strong>: States (Tonic, Dominant, etc.)</li>
                      <li>• <strong>Σ</strong>: Input alphabet (C, Dm, G7...)</li>
                      <li>• <strong>δ</strong>: Transition function</li>
                      <li>• <strong>q₀</strong>: Start state</li>
                      <li>• <strong>F</strong>: Accept states</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Validation Process */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-sky-600/20 rounded-lg">
                    <Code className="w-5 h-5 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-bold text-sky-400">Validation Process</h3>
                </div>
                <div className="grid gap-3">
                  {['Tokenization - Parse chord symbols', 'State Transitions - Follow NFA rules', 'Acceptance Check - Verify resolution'].map((step, i) => (
                    <div key={i} className="bg-secondary/50 rounded-xl p-3 border border-sky-500/20 flex items-center gap-3">
                      <div className="w-7 h-7 bg-sky-600 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</div>
                      <p className="text-muted-foreground text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Music Theory */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-teal-600/20 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-bold text-teal-400">Music Theory</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-xl p-4 border border-teal-500/20">
                    <h4 className="font-semibold text-teal-400 mb-2 text-sm">Harmonic Functions</h4>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li><strong className="text-sky-400">I (Tonic)</strong> - Home, stability</li>
                      <li><strong className="text-teal-400">IV (Subdominant)</strong> - Pre-dominant</li>
                      <li><strong className="text-blue-400">V (Dominant)</strong> - Maximum tension</li>
                      <li><strong className="text-cyan-400">ii (Supertonic)</strong> - Common pre-dominant</li>
                    </ul>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 border border-teal-500/20">
                    <h4 className="font-semibold text-teal-400 mb-2 text-sm">Common Progressions</h4>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li><strong>I-IV-V-I</strong> - Most common</li>
                      <li><strong>I-vi-IV-V</strong> - 50s progression</li>
                      <li><strong>ii-V-I</strong> - Jazz cadence</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Academic Context */}
              <section>
                <div className="bg-secondary/50 rounded-xl p-4 border border-amber-500/20">
                  <h4 className="font-semibold text-amber-400 mb-2 text-sm">Academic Context</h4>
                  <p className="text-muted-foreground text-xs mb-2">
                    COSC-302: Automata and Language Theory
                  </p>
                  <p className="text-muted-foreground text-xs">
                    <strong>Group 4 | BSCS 3-2</strong> • Bernabe, Bolante, Fortus, Petero, Punzalan, Salazar, Vicedo
                  </p>
                </div>
              </section>
            </div>
            <div className="sticky bottom-0 bg-secondary border-t border-primary/30 p-4">
              <button
                onClick={() => setShowLearnMore(false)}
                className="w-full py-2.5 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl font-semibold transition-colors text-sm"
              >
                Got It - Start Validating!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validator;
