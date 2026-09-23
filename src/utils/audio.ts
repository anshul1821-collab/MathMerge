export class AudioEngine {
    private ctx: AudioContext | null = null;
    private enabled = true;

    constructor() {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContextClass();
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    public toggleSound(enabled: boolean) {
        this.enabled = enabled;
        if (enabled && this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, vol: number) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    public playSlide() {
        this.playTone(150, 'sine', 0.1, 0.1);
    }

    public playMerge() {
        if (!this.enabled || !this.ctx) return;
        this.playTone(400, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(600, 'sine', 0.1, 0.1), 50);
    }

    public playWin() {
        if (!this.enabled || !this.ctx) return;
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'square', 0.2, 0.1), i * 150);
        });
    }

    public playLose() {
        if (!this.enabled || !this.ctx) return;
        const notes = [400, 350, 300, 250];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sawtooth', 0.3, 0.1), i * 200);
        });
    }
}

export const audio = new AudioEngine();
