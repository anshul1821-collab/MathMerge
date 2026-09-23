import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';
import { EducationOverlay } from './components/EducationOverlay';
import { NumberJourneyModal } from './components/NumberJourneyModal';
import { audio } from './utils/audio';
import { LEVELS } from './utils/levels';
import './index.css';

function App() {
    const { 
        board, score, gameOver, won, keptGoing, 
        restart, move, currentLevel, levelConfig, playLevel 
    } = useGame();
    
    const [showValues, setShowValues] = useState(false);
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showLevelSelect, setShowLevelSelect] = useState(false);
    const [showJourney, setShowJourney] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [educationEnabled, setEducationEnabled] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

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
        <div className="app-container">
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
                    <p className="subtitle">Match tiles! Next target: {levelConfig.targetValue}</p>
                    <div className="controls">
                        <button className="btn btn-secondary" onClick={() => setShowHowToPlay(true)}>Help</button>
                        <button className="btn btn-secondary" onClick={() => setShowLevelSelect(true)}>Levels</button>
                        <button className="btn btn-secondary" onClick={() => setShowJourney(true)}>Journey</button>
                        <button className="btn btn-primary" onClick={restart}>Restart</button>
                    </div>
                </div>
                <div className="settings-toggle">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={showValues} 
                            onChange={e => setShowValues(e.target.checked)} 
                        />
                        <span>Show Values (Easy)</span>
                    </label>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={soundEnabled} 
                            onChange={e => toggleSound(e.target.checked)} 
                        />
                        <span>Sound</span>
                    </label>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={educationEnabled} 
                            onChange={e => setEducationEnabled(e.target.checked)} 
                        />
                        <span>Education Mode</span>
                    </label>
                </div>
            </header>

            <main className="game-container">
                <GameBoard board={board} showValue={showValues} onMove={move} />
                <EducationOverlay board={board} enabled={educationEnabled} />

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
                                >
                                    {l.level}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-primary modal-close" onClick={() => setShowLevelSelect(false)}>Close</button>
                    </div>
                </div>
            )}

            {showJourney && <NumberJourneyModal onClose={() => setShowJourney(false)} />}
        </div>
    );
}

export default App;
