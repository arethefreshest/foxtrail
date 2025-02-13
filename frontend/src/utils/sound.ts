class SoundEffect {
  private audio: HTMLAudioElement | null = null;
  private volume: number = 0.7;

  constructor(frequency: number, duration: number) {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      gainNode.gain.value = this.volume;

      oscillator.start();
      setTimeout(() => oscillator.stop(), duration);
    }
  }

  setVolume(volume: number) {
    this.volume = volume / 100;
  }
}

export const sounds = {
  correct: () => new SoundEffect(800, 200),   // Higher pitch for correct
  incorrect: () => new SoundEffect(300, 400), // Lower pitch for incorrect
}; 