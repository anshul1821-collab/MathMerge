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

                <button className="btn btn-primary modal-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};
