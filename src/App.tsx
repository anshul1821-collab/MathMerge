import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { useEducation } from './hooks/useEducation';
import { GameBoard } from './components/GameBoard';
import { EducationOverlay } from './components/EducationOverlay';
import { NumberJourneyModal } from './components/NumberJourneyModal';
import { LevelIntroModal } from './components/LevelIntroModal';
import { PracticeModeModal } from './components/PracticeModeModal';
import { audio } from './utils/audio';
import { LEVELS } from './utils/levels';
import './index.css';

const ChallengeDropdown = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    const [open, setOpen] = useState(false);
    
    const options = [
        { val: 5, label: 'Frequent (5)' },
        { val: 10, label: 'Normal (10)' },
        { val: 20, label: 'Rare (20)' },
        { val: 0, label: 'Off' },
    ];
    
    const selected = options.find(o => o.val === value);
    
    return (
        <div style={{ position: 'relative' }}>
            <div 
                onClick={() => setOpen(!open)}
                style={{ 
                    marginLeft: '5px', 
                    background: value > 0 ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#334155', 
                    color: '#ffffff', 
                    borderRadius: '12px', 
                    padding: '6px 16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: value > 0 ? '0 2px 10px rgba(139, 92, 246, 0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                {selected?.label} <span style={{ fontSize: '0.7em', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </div>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
                    <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '8px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '12px', overflow: 'hidden', zIndex: 100, minWidth: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                        {options.map(opt => (
                            <div 
                                key={opt.val}
                                onClick={() => { onChange(opt.val); setOpen(false); }}
                                style={{
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    color: opt.val === value ? '#60a5fa' : '#e2e8f0',
                                    background: opt.val === value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    fontWeight: opt.val === value ? 'bold' : 'normal',
                                    transition: 'background 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = opt.val === value ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

function App() {
    const [isLocked, setIsLocked] = useState(false);
    const { stats, registerMerge, registerChallengeAnswer } = useEducation();
    
    const { 
        board, score, gameOver, won, keptGoing, setKeptGoing,
        restart, move, currentLevel, levelConfig, playLevel, playPractice,
        isPredictMode, togglePredictMode, predictionChallenge, resolvePrediction,
        isAdaptiveMode, toggleAdaptiveMode
    } = useGame(-2, isLocked, stats, registerChallengeAnswer);
    
    const [showValues, setShowValues] = useState(() => localStorage.getItem('nf_showValues') === 'true');
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showLevelSelect, setShowLevelSelect] = useState(false);
    const [showPracticeMode, setShowPracticeMode] = useState(false);
    const [showJourney, setShowJourney] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('nf_soundEnabled') !== 'false');
    const [hasStarted, setHasStarted] = useState(false);
    const [showLevelIntro, setShowLevelIntro] = useState(false);
    const [showTargetBreakdown, setShowTargetBreakdown] = useState(false);
    const [showFeatureIntro, setShowFeatureIntro] = useState(false);
    const [solvedEquations, setSolvedEquations] = useState<{id: string, text: string, isChallenge: boolean, count: number}[]>([]);
    const [lockFrequency, setLockFrequency] = useState(() => parseInt(localStorage.getItem('nf_lockFrequency') || '10', 10));

    useEffect(() => { localStorage.setItem('nf_showValues', String(showValues)); }, [showValues]);
    useEffect(() => { localStorage.setItem('nf_soundEnabled', String(soundEnabled)); }, [soundEnabled]);
    useEffect(() => { localStorage.setItem('nf_lockFrequency', lockFrequency.toString()); }, [lockFrequency]);

    const educationEnabled = currentLevel > 0;

    useEffect(() => {
        audio.toggleSound(soundEnabled);
    }, []);

    useEffect(() => {
        if (score === 0) setSolvedEquations([]);
    }, [score, currentLevel]);

    useEffect(() => {
        if (hasStarted && !showFeatureIntro && !sessionStorage.getItem('nf_seenFeatures_session')) {
            setShowFeatureIntro(true);
            sessionStorage.setItem('nf_seenFeatures_session', 'true');
        } else if (hasStarted && !showFeatureIntro && educationEnabled && currentLevel > 0) {
            setShowLevelIntro(true);
        } else if (!educationEnabled || currentLevel <= 0) {
            setShowLevelIntro(false);
        }
    }, [currentLevel, hasStarted, showFeatureIntro, educationEnabled]);

    const toggleSound = (enabled: boolean) => {
        setSoundEnabled(enabled);
        audio.toggleSound(enabled);
    };

    if (!hasStarted) {
        return (
            <div className="start-screen-container">
                <div className="start-screen-content">
                    <h1 className="bouncy-title">Number Fusion</h1>
                    <p className="start-description">Combine math tiles and reach the target to win!</p>
                    <button className="btn btn-primary pulse-btn" onClick={() => setHasStarted(true)}>
                        Play Now! 🚀
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container" style={{ maxWidth: '820px' }}>
            <header>
                <div className="header-top">
                    <h1>Number Fusion</h1>
                    <div className="scores">
                        <div className="score-box level-box" onClick={() => setShowLevelSelect(true)} title="Click to change level">
                            <div className="score-label">{currentLevel === 0 ? 'PRACTICE' : currentLevel === -2 ? 'CLASSIC' : isAdaptiveMode ? 'ADAPTIVE' : `LEVEL ${currentLevel}`}</div>
                            <div className="score-value">🎯 {levelConfig.targetValue}</div>
                        </div>
                        <div className="score-box">
                            <div className="score-label">SCORE</div>
                            <div className="score-value">{score}</div>
                        </div>
                    </div>
                </div>
                <div className="header-bottom">
                    <div style={{position: 'relative'}}>
                        <p className="subtitle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Match tiles! Next target: {levelConfig.targetValue}
                            {educationEnabled && (
                                <span 
                                    onClick={() => setShowTargetBreakdown(prev => !prev)}
                                    style={{ cursor: 'pointer', background: '#3b82f6', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}
                                    title="How to make this number?"
                                >?</span>
                            )}
                        </p>
                        {showTargetBreakdown && educationEnabled && (
                            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', padding: '10px 15px', borderRadius: '8px', border: '1px solid #3b82f6', zIndex: 10, minWidth: '200px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                                <p style={{margin: '0 0 8px 0', fontWeight: 'bold', color: '#60a5fa'}}>Ways to make {levelConfig.targetValue}:</p>
                                <ul style={{margin: 0, paddingLeft: '20px', color: '#cbd5e1', textAlign: 'left', fontSize: '0.9rem'}}>
                                    <li>{levelConfig.targetValue / 2} + {levelConfig.targetValue / 2}</li>
                                    <li>{levelConfig.targetValue + 10} - 10</li>
                                    <li>{levelConfig.targetValue * 2} ÷ 2</li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="controls">
                        <button className="btn btn-secondary" onClick={() => setShowHowToPlay(true)}>Help</button>
                        <button className={`btn ${currentLevel === -2 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => playLevel(-2)}>Classic</button>
                        <button className={`btn ${currentLevel > 0 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowLevelSelect(true)}>Levels</button>
                        <button className={`btn ${currentLevel === 0 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowPracticeMode(true)}>Practice</button>
                        <button className="btn btn-secondary" onClick={() => setShowJourney(true)}>Journey</button>
                        <button className="btn btn-primary" onClick={restart}>Restart</button>
                    </div>
                </div>
                <div className="settings-toggle" style={{ overflowX: 'auto', textAlign: 'center', paddingBottom: '10px', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap', width: '100%' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', fontSize: '0.8rem', padding: '0 10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: showValues ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '20px', border: showValues ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', boxShadow: showValues ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none' }}>
                        <input 
                            type="checkbox" 
                            checked={showValues} 
                            onChange={e => setShowValues(e.target.checked)} 
                            style={{ accentColor: '#3b82f6', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: showValues ? '#f8fafc' : '#94a3b8' }}>Show Values (Easy)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: soundEnabled ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '20px', border: soundEnabled ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', boxShadow: soundEnabled ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none' }}>
                        <input 
                            type="checkbox" 
                            checked={soundEnabled} 
                            onChange={e => toggleSound(e.target.checked)} 
                            style={{ accentColor: '#3b82f6', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: soundEnabled ? '#f8fafc' : '#94a3b8' }}>Sound</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: educationEnabled ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.2))' : 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '20px', border: educationEnabled ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', boxShadow: educationEnabled ? '0 0 15px rgba(139, 92, 246, 0.3)' : 'none' }}>
                        <input 
                            type="checkbox" 
                            checked={educationEnabled} 
                            onChange={e => {
                                if (e.target.checked) {
                                    playLevel(1);
                                } else {
                                    playLevel(-2);
                                }
                            }} 
                            style={{ accentColor: '#d946ef', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '600', color: educationEnabled ? '#f8fafc' : '#94a3b8' }}>Education Mode</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: isAdaptiveMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '20px', border: isAdaptiveMode ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                        <input 
                            type="checkbox" 
                            checked={isAdaptiveMode} 
                            onChange={e => {
                                toggleAdaptiveMode(e.target.checked);
                            }} 
                            style={{ accentColor: '#10b981', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: isAdaptiveMode ? '#f8fafc' : '#94a3b8' }}>Adaptive Difficulty</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: isPredictMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '20px', border: isPredictMode ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                        <input 
                            type="checkbox" 
                            checked={isPredictMode} 
                            onChange={e => togglePredictMode(e.target.checked)} 
                            style={{ accentColor: '#ec4899', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: isPredictMode ? '#f8fafc' : '#94a3b8' }}>Predict Mode</span>
                    </label>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
                <main className="game-container" style={{ margin: 0, flex: '1 1 100%', maxWidth: '500px', width: '100%' }}>
                    {educationEnabled && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '0.85rem' }}>Lock Challenge:</span>
                                <ChallengeDropdown 
                                    value={lockFrequency}
                                    onChange={val => {
                                        setLockFrequency(val);
                                        localStorage.setItem('nf_lockFrequency', String(val));
                                    }}
                                />
                            </label>
                        </div>
                    )}
                    {isLocked && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '10px', textAlign: 'center', zIndex: 5, fontWeight: 'bold', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                            🔒 Board Locked! Solve the challenge to continue.
                        </div>
                    )}
                    <GameBoard board={board} showValue={showValues} onMove={move} educationEnabled={educationEnabled} />
                    <EducationOverlay 
                        board={board} 
                        enabled={educationEnabled} 
                        level={currentLevel}
                        lockFrequency={lockFrequency}
                        onLock={setIsLocked}
                        registerMerge={registerMerge}
                        registerChallengeAnswer={registerChallengeAnswer}
                        onMerge={(text, isChallenge) => setSolvedEquations(prev => {
                            const existingIdx = prev.findIndex(eq => eq.text === text);
                            if (existingIdx >= 0) {
                                const newArr = [...prev];
                                const item = newArr.splice(existingIdx, 1)[0];
                                return [{ ...item, count: item.count + 1 }, ...newArr];
                            }
                            return [{ id: Math.random().toString(), text, isChallenge, count: 1 }, ...prev].slice(0, 50);
                        })}
                    />

                    {(gameOver || (won && !keptGoing)) && (
                        <div className="game-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', padding: '30px', borderRadius: '12px' }}>
                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: won && !keptGoing ? '#4ade80' : '#f87171' }}>
                                {won && !keptGoing ? 'Level Complete! 🎉' : 'Game Over!'}
                            </h2>
                            <p style={{ fontSize: '1.2rem', marginBottom: '25px' }}>
                                {won && !keptGoing ? `You successfully synthesized the target value: ${levelConfig.targetValue}!` : 'No more fusions possible on the board.'}
                            </p>
                            
                            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '25px', width: '100%', border: '1px solid #3b82f6' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#60a5fa' }}>📊 Learning Report</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.totalMerges}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Total Fusions</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc' }}>
                                            {stats.totalChallenges > 0 ? Math.round((stats.correctChallenges / stats.totalChallenges) * 100) : 0}%
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Accuracy</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.highestNumber}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Highest Target</div>
                                    </div>
                                </div>
                            </div>

                            <div className="overlay-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                {won && !keptGoing && (
                                    <button className="btn btn-secondary" onClick={() => setKeptGoing(true)}>Keep Playing</button>
                                )}
                                {won && !keptGoing && currentLevel > 0 && currentLevel < 20 && (
                                    <button className="btn btn-primary" onClick={() => playLevel(currentLevel + 1)}>Next Level →</button>
                                )}
                                <button className="btn btn-primary" onClick={restart}>Retry Level ↺</button>
                            </div>
                        </div>
                    )}
                </main>
                
                <aside className="solved-equations-box" style={{ flex: '1 1 250px', maxWidth: '500px', width: '100%', background: '#1e293b', borderRadius: '8px', padding: '15px', border: '1px solid #3b82f6', maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
                        <h3 style={{ marginTop: 0, color: '#60a5fa', fontSize: '1.1rem', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                            Solved Equations ({solvedEquations.length})
                        </h3>
                        {solvedEquations.length === 0 ? (
                            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', fontStyle: 'italic' }}>Merge tiles to see the math here!</p>
                        ) : (
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#f8fafc', fontSize: '0.95rem' }}>
                                {solvedEquations.map((eq) => (
                                    <li key={eq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '6px 0', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {eq.isChallenge && <span title="Challenge Solved" style={{ fontSize: '0.8rem' }}>🔒</span>}
                                        <span>{eq.text}</span>
                                        {eq.count > 1 && (
                                            <span style={{ background: '#3b82f6', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                x{eq.count}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </aside>
            </div>

            {showHowToPlay && (
                <div className="modal-backdrop" onClick={() => setShowHowToPlay(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2>How to Play</h2>
                        <p><strong>The Twist:</strong> Tiles display math expressions instead of plain numbers!</p>
                        <ul>
                            <li>Use <strong>Arrow Keys</strong> or <strong>Swipe</strong> to slide tiles.</li>
                            <li>Two tiles merge if their expressions <strong>evaluate to the same value</strong>.</li>
                            <li>Example: <strong>"4 + 4"</strong> merges with <strong>"16 ÷ 2"</strong> (both equal 8).</li>
                            <li>Synthesize the <strong>Target Value</strong> to win!</li>
                        </ul>
                        
                        <h3 style={{ margin: '20px 0 10px 0', color: '#60a5fa' }}>Game Modes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                <strong style={{ color: '#f8fafc' }}>🎮 Classic Mode</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>The default mode. A pure race to 2048 using mixed math operations (Addition, Subtraction, Multiplication, Division).</p>
                            </div>
                            <div style={{ background: 'rgba(217, 70, 239, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #d946ef' }}>
                                <strong style={{ color: '#d946ef' }}>🎓 Education Mode</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Designed for learning! Explains the math when tiles merge, gives fun math facts, and challenges you with periodic "lock" equations.</p>
                            </div>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <strong style={{ color: '#60a5fa' }}>📈 Progressive Levels</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Play through 20 handcrafted levels. Starts easy with just Addition and scales up to Algebra and Square Roots!</p>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <strong style={{ color: '#10b981' }}>🧠 Adaptive Difficulty</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>The game dynamically adjusts the math operators and targets based on how accurately you solve challenges.</p>
                            </div>
                            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #ec4899' }}>
                                <strong style={{ color: '#ec4899' }}>🔮 Predict Mode</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>When toggled on, the game will pause mid-merge and ask you to predict the result of combining two expressions for bonus points.</p>
                            </div>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                <strong style={{ color: '#f59e0b' }}>🎯 Practice Mode</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Create a custom sandbox by selecting exactly which math operators you want to practice with.</p>
                            </div>
                        </div>

                        <button className="btn btn-primary modal-close" onClick={() => setShowHowToPlay(false)} style={{ marginTop: '20px' }}>Got it!</button>
                    </div>
                </div>
            )}

            {showLevelSelect && (
                <div className="modal-backdrop" onClick={() => setShowLevelSelect(false)}>
                    <div className="modal-content level-modal" onClick={e => e.stopPropagation()}>
                        <h2>Select Level</h2>
                        <div className="level-grid">
                            {LEVELS.map(l => (
                                <button 
                                    key={l.level} 
                                    className={`btn level-btn ${l.level === currentLevel ? 'active' : ''}`}
                                    onClick={() => {
                                        playLevel(l.level);
                                        setShowLevelSelect(false);
                                    }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
                                >
                                    <span>{l.level}</span>
                                    {educationEnabled && (
                                        <span style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px', textAlign: 'center', lineHeight: '1.2' }}>
                                            {l.ops.length <= 2 ? l.ops.join(', ') : 'Mixed'}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-primary modal-close" onClick={() => setShowLevelSelect(false)}>Close</button>
                    </div>
                </div>
            )}

            {showFeatureIntro && (
                <div className="modal-backdrop">
                    <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'left' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🌟 Welcome to Number Fusion!</h2>
                        <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '20px' }}>Customize your learning experience with these special modes in the top menu:</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ background: 'rgba(217, 70, 239, 0.1)', border: '1px solid rgba(217, 70, 239, 0.3)', padding: '15px', borderRadius: '8px' }}>
                                <strong style={{ color: '#d946ef', fontSize: '1.1rem' }}>🎓 Education Mode</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#e2e8f0' }}>Unlocks math facts, lock challenges, and tracks your solved equations as you merge tiles.</p>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '15px', borderRadius: '8px' }}>
                                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>📈 Adaptive Difficulty</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#e2e8f0' }}>Automatically introduces harder math operations based on your accuracy and skill level.</p>
                            </div>
                            <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '15px', borderRadius: '8px' }}>
                                <strong style={{ color: '#ec4899', fontSize: '1.1rem' }}>🔮 Predict Mode</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#e2e8f0' }}>Predict the outcome of your merges to earn bonus points and hone your quick math skills.</p>
                            </div>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '15px', borderRadius: '8px' }}>
                                <strong style={{ color: '#60a5fa', fontSize: '1.1rem' }}>🏆 Number Journey</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#e2e8f0' }}>Click "Journey" to check your stats, streaks, and view earned badges!</p>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', fontSize: '1.1rem', padding: '12px' }}
                            onClick={() => {
                                setShowFeatureIntro(false);
                            }}
                        >
                            Let's Play! 🚀
                        </button>
                    </div>
                </div>
            )}

            {showPracticeMode && (
                <PracticeModeModal 
                    onClose={() => setShowPracticeMode(false)}
                    onSelectMode={(ops) => {
                        playPractice(ops);
                        setShowPracticeMode(false);
                    }}
                />
            )}

            {showLevelIntro && hasStarted && educationEnabled && (
                <LevelIntroModal 
                    levelConfig={levelConfig} 
                    onStart={() => setShowLevelIntro(false)} 
                />
            )}

            {predictionChallenge && (
                <div className="modal-backdrop edu-challenge">
                    <div className="modal-content" style={{ border: '2px solid #ec4899' }}>
                        <h2>🔮 Predict the Merge!</h2>
                        <p>What do these two expressions evaluate to?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', margin: '20px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>{predictionChallenge.expr1}</span>
                            <span>+</span>
                            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>{predictionChallenge.expr2}</span>
                        </div>
                        <p style={{ textAlign: 'center', marginBottom: '15px', color: '#cbd5e1' }}>Select the correct value:</p>
                        <div className="challenge-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            {predictionChallenge.options.map(opt => (
                                <button 
                                    key={opt}
                                    className="challenge-option-btn"
                                    onClick={() => resolvePrediction(opt === predictionChallenge.value)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showJourney && <NumberJourneyModal onClose={() => setShowJourney(false)} />}
        </div>
    );
}

export default App;
