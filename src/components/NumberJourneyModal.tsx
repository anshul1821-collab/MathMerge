import React from 'react';
import { useEducation } from '../hooks/useEducation';

interface NumberJourneyModalProps {
    onClose: () => void;
}

export const NumberJourneyModal: React.FC<NumberJourneyModalProps> = ({ onClose }) => {
    const { stats } = useEducation();

    const sequence = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <h2>Your Number Journey</h2>
                <p>Each successful merge moves you one step forward in understanding numbers!</p>
                
                <div className="journey-track">
                    {sequence.map(num => (
                        <div 
                            key={num} 
                            className={`journey-node ${stats.highestNumber >= num ? 'unlocked' : ''} ${stats.highestNumber === num ? 'current' : ''}`}
                        >
                            {num}
                        </div>
                    ))}
                </div>

                <h3>What You Learned</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="label">Highest Number</div>
                        <div className="val">{stats.highestNumber || '-'}</div>
                    </div>
                    <div className="stat-item">
                        <div className="label">Total Merges</div>
                        <div className="val">{stats.totalMerges}</div>
                    </div>
                    <div className="stat-item">
                        <div className="label">Quick Challenges</div>
                        <div className="val">{stats.correctChallenges} / {stats.totalChallenges}</div>
                    </div>
                </div>

                <ul className="concept-checklist">
                    <li className={stats.conceptsUnlocked.addition ? 'learned' : ''}>
                        {stats.conceptsUnlocked.addition ? '✅' : '🔒'} Addition
                    </li>
                    <li className={stats.conceptsUnlocked.subtraction ? 'learned' : ''}>
                        {stats.conceptsUnlocked.subtraction ? '✅' : '🔒'} Subtraction
                    </li>
                    <li className={stats.conceptsUnlocked.multiplication ? 'learned' : ''}>
                        {stats.conceptsUnlocked.multiplication ? '✅' : '🔒'} Multiplication
                    </li>
                    <li className={stats.conceptsUnlocked.division ? 'learned' : ''}>
                        {stats.conceptsUnlocked.division ? '✅' : '🔒'} Division
                    </li>
                    <li className={stats.conceptsUnlocked.doubling ? 'learned' : ''}>
                        {stats.conceptsUnlocked.doubling ? '✅' : '🔒'} Number doubling
                    </li>
                    <li className={stats.conceptsUnlocked.powersOf2 ? 'learned' : ''}>
                        {stats.conceptsUnlocked.powersOf2 ? '✅' : '🔒'} Powers of 2
                    </li>
                </ul>

                <h3>Your Badges</h3>
                <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className={`stat-item ${stats.badges?.additionAce ? 'unlocked-badge' : 'locked-badge'}`} style={{ opacity: stats.badges?.additionAce ? 1 : 0.5 }}>
                        <div className="label">Addition Ace ➕</div>
                        <div className="val" style={{ fontSize: '0.9rem' }}>{stats.badges?.additionAce ? 'Earned!' : '10 correct in a row'}</div>
                    </div>
                    <div className={`stat-item ${stats.badges?.subtractionSniper ? 'unlocked-badge' : 'locked-badge'}`} style={{ opacity: stats.badges?.subtractionSniper ? 1 : 0.5 }}>
                        <div className="label">Subtraction Sniper ➖</div>
                        <div className="val" style={{ fontSize: '0.9rem' }}>{stats.badges?.subtractionSniper ? 'Earned!' : '10 correct in a row'}</div>
                    </div>
                    <div className={`stat-item ${stats.badges?.multiplicationMaster ? 'unlocked-badge' : 'locked-badge'}`} style={{ opacity: stats.badges?.multiplicationMaster ? 1 : 0.5 }}>
                        <div className="label">Multiplication Master ✖️</div>
                        <div className="val" style={{ fontSize: '0.9rem' }}>{stats.badges?.multiplicationMaster ? 'Earned!' : '10 correct in a row'}</div>
                    </div>
                    <div className={`stat-item ${stats.badges?.divisionDynamo ? 'unlocked-badge' : 'locked-badge'}`} style={{ opacity: stats.badges?.divisionDynamo ? 1 : 0.5 }}>
                        <div className="label">Division Dynamo ➗</div>
                        <div className="val" style={{ fontSize: '0.9rem' }}>{stats.badges?.divisionDynamo ? 'Earned!' : '10 correct in a row'}</div>
                    </div>
                    <div className={`stat-item ${stats.badges?.predictionPro ? 'unlocked-badge' : 'locked-badge'}`} style={{ opacity: stats.badges?.predictionPro ? 1 : 0.5, gridColumn: 'span 2' }}>
                        <div className="label">Prediction Pro 🔮</div>
                        <div className="val" style={{ fontSize: '0.9rem' }}>{stats.badges?.predictionPro ? 'Earned!' : '20 total correct challenges'}</div>
                    </div>
                </div>

                <button className="btn btn-primary modal-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};
