import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';
import { EducationOverlay } from './components/EducationOverlay';
import { NumberJourneyModal } from './components/NumberJourneyModal';
import { LevelIntroModal } from './components/LevelIntroModal';
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
    const { 
        board, score, gameOver, won, keptGoing, 
        restart, move, currentLevel, levelConfig, playLevel 
    } = useGame(isLocked);
    
    const [showValues, setShowValues] = useState(() => localStorage.getItem('nf_showValues') === 'true');
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showLevelSelect, setShowLevelSelect] = useState(false);
    const [showJourney, setShowJourney] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('nf_soundEnabled') !== 'false');
    const [educationEnabled, setEducationEnabled] = useState(() => localStorage.getItem('nf_educationEnabled') !== 'false');
    const [hasStarted, setHasStarted] = useState(false);
    const [showLevelIntro, setShowLevelIntro] = useState(false);
    const [showTargetBreakdown, setShowTargetBreakdown] = useState(false);
    const [solvedEquations, setSolvedEquations] = useState<{id: string, text: string, isChallenge: boolean, count: number}[]>([]);
    const [lockFrequency, setLockFrequency] = useState(() => parseInt(localStorage.getItem('nf_lockFrequency') || '10', 10));

    useEffect(() => { localStorage.setItem('nf_showValues', String(showValues)); }, [showValues]);
    useEffect(() => { localStorage.setItem('nf_soundEnabled', String(soundEnabled)); }, [soundEnabled]);
    useEffect(() => { localStorage.setItem('nf_educationEnabled', String(educationEnabled)); }, [educationEnabled]);
    useEffect(() => { localStorage.setItem('nf_lockFrequency', lockFrequency.toString()); }, [lockFrequency]);

    useEffect(() => {
        if (score === 0) setSolvedEquations([]);
    }, [score, currentLevel]);

    useEffect(() => {
        if (hasStarted) {
            setShowLevelIntro(true);
        }
    }, [currentLevel, hasStarted]);

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
        <div className="app-container" style={{ maxWidth: educationEnabled ? '820px' : '500px', transition: 'max-width 0.3s ease' }}>
            <header>
                <div className="header-top">
                    <h1>Number Fusion</h1>
                    <div className="scores">
                        <div className="score-box level-box" onClick={() => setShowLevelSelect(true)} title="Click to change level">
                            <div className="score-label">LEVEL {currentLevel}</div>
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
                        <button className="btn btn-secondary" onClick={() => setShowLevelSelect(true)}>Levels</button>
                        <button className="btn btn-secondary" onClick={() => setShowJourney(true)}>Journey</button>
                        <button className="btn btn-primary" onClick={restart}>Restart</button>
                    </div>
                </div>
                <div className="settings-toggle" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', fontSize: '0.95rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: showValues ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.2)', padding: '6px 14px', borderRadius: '20px', border: showValues ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', boxShadow: showValues ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none' }}>
                        <input 
                            type="checkbox" 
                            checked={showValues} 
                            onChange={e => setShowValues(e.target.checked)} 
                            style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: showValues ? '#f8fafc' : '#94a3b8' }}>Show Values (Easy)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: soundEnabled ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.2)', padding: '6px 14px', borderRadius: '20px', border: soundEnabled ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', boxShadow: soundEnabled ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none' }}>
                        <input 
                            type="checkbox" 
                            checked={soundEnabled} 
                            onChange={e => toggleSound(e.target.checked)} 
                            style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: soundEnabled ? '#f8fafc' : '#94a3b8' }}>Sound</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: educationEnabled ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.2))' : 'rgba(0,0,0,0.2)', padding: '6px 14px', borderRadius: '20px', border: educationEnabled ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', boxShadow: educationEnabled ? '0 0 15px rgba(139, 92, 246, 0.3)' : 'none' }}>
                        <input 
                            type="checkbox" 
                            checked={educationEnabled} 
                            onChange={e => {
                                setEducationEnabled(e.target.checked);
                                localStorage.setItem('nf_educationEnabled', String(e.target.checked));
                            }} 
                            style={{ accentColor: '#d946ef', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '600', color: educationEnabled ? '#f8fafc' : '#94a3b8' }}>Education Mode</span>
                    </label>
                    {educationEnabled && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontWeight: '600', color: '#e2e8f0' }}>Lock Challenge:</span>
                            <ChallengeDropdown 
                                value={lockFrequency}
                                onChange={val => {
                                    setLockFrequency(val);
                                    localStorage.setItem('nf_lockFrequency', String(val));
                                }}
                            />
                        </label>
                    )}
                </div>
            </header>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
                <main className="game-container" style={{ margin: 0, flex: '1 1 350px', maxWidth: '500px' }}>
                    {isLocked && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '10px', textAlign: 'center', zIndex: 5, fontWeight: 'bold', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                            🔒 Board Locked! Solve the challenge to continue.
                        </div>
                    )}
                    <GameBoard board={board} showValue={showValues} onMove={move} />
                    <EducationOverlay 
                        board={board} 
                        enabled={educationEnabled} 
                        level={currentLevel}
                        lockFrequency={lockFrequency}
                        onLock={setIsLocked}
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
                        <div className="game-overlay">
                            <h2>{won && !keptGoing ? 'Level Complete!' : 'Game Over!'}</h2>
                            <p>{won && !keptGoing ? `You fused ${levelConfig.targetValue}!` : 'No more fusions possible.'}</p>
                            <div className="overlay-actions">
                                {won && !keptGoing && currentLevel < 20 && (
                                    <button className="btn btn-primary" onClick={() => playLevel(currentLevel + 1)}>Next Level</button>
                                )}
                                <button className="btn btn-secondary" onClick={restart}>Retry</button>
                            </div>
                        </div>
                    )}
                </main>
                
                {educationEnabled && (
                    <aside className="solved-equations-box" style={{ width: '250px', background: '#1e293b', borderRadius: '8px', padding: '15px', border: '1px solid #3b82f6', maxHeight: '500px', overflowY: 'auto', textAlign: 'left' }}>
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
                )}
            </div>

            {showHowToPlay && (
                <div className="modal-backdrop" onClick={() => setShowHowToPlay(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>How to Play</h2>
                        <p><strong>The Twist:</strong> Tiles display math expressions instead of plain numbers!</p>
                        <ul>
                            <li>Use <strong>Arrow Keys</strong> or <strong>Swipe</strong> to slide tiles.</li>
                            <li>Two tiles merge if their expressions <strong>evaluate to the same value</strong>.</li>
                            <li>Example: <strong>"4 + 4"</strong> merges with <strong>"16 ÷ 2"</strong> (both equal 8).</li>
                            <li>Synthesize the <strong>Target Value</strong> to win the level!</li>
                        </ul>
                        {educationEnabled && (
                            <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'left' }}>
                                <h3 style={{marginTop: 0, marginBottom: '10px', fontSize: '1.1rem', color: '#60a5fa'}}>Current Level Focus</h3>
                                <p style={{margin: '0 0 5px 0', color: '#cbd5e1', fontSize: '0.9rem'}}>You will see expressions using:</p>
                                <ul style={{margin: 0, paddingLeft: '20px', fontSize: '0.9rem'}}>
                                    {levelConfig.ops.includes('ADD') && <li>Addition (e.g., 4 + 4 = 8)</li>}
                                    {levelConfig.ops.includes('SUB') && <li>Subtraction (e.g., 10 - 2 = 8)</li>}
                                    {levelConfig.ops.includes('MUL') && <li>Multiplication (e.g., 4 × 2 = 8)</li>}
                                    {levelConfig.ops.includes('DIV') && <li>Division (e.g., 16 ÷ 2 = 8)</li>}
                                    {levelConfig.ops.includes('SQUARE') && <li>Squares (e.g., 3² - 1 = 8)</li>}
                                    {levelConfig.ops.includes('SQRT') && <li>Square Roots (e.g., √64 = 8)</li>}
                                    {levelConfig.ops.includes('ALGEBRA') && <li>Algebra (e.g., 2x = 16)</li>}
                                </ul>
                            </div>
                        )}
                        <button className="btn btn-primary modal-close" onClick={() => setShowHowToPlay(false)}>Got it!</button>
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

            {showLevelIntro && hasStarted && (
                <LevelIntroModal 
                    levelConfig={levelConfig} 
                    onStart={() => setShowLevelIntro(false)} 
                />
            )}

            {showJourney && <NumberJourneyModal onClose={() => setShowJourney(false)} />}
        </div>
    );
}

export default App;
