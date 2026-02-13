
const fs = require('fs');
const path = require('path');

function createWavFile(filePath, durationSeconds, frequency, type = 'sine') {
    const sampleRate = 44100;
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = Math.floor(sampleRate * durationSeconds * blockAlign);
    const fileSize = 36 + dataSize;

    const buffer = Buffer.alloc(fileSize + 8);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize, 4);
    buffer.write('WAVE', 8);

    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Chunk size
    buffer.writeUInt16LE(1, 20); // Audio format (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(16, 34); // Bits per sample

    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Generate samples
    const volume = 0.2;
    for (let i = 0; i < dataSize / 2; i++) {
        const t = i / sampleRate;
        let sample = 0;

        if (type === 'sine') {
            sample = Math.sin(2 * Math.PI * frequency * t);
        } else if (type === 'square') {
            sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
        } else if (type === 'sawtooth') {
            sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
        } else if (type === 'slide') {
            // Slide from frequency to frequency * 2
            const currentFreq = frequency + (frequency * (t / durationSeconds));
            sample = Math.sin(2 * Math.PI * currentFreq * t);
        }

        // Apply envelope (simple fade in/out)
        if (t < 0.1) sample *= (t / 0.1);
        if (t > durationSeconds - 0.1) sample *= ((durationSeconds - t) / 0.1);

        buffer.writeInt16LE(Math.floor(sample * volume * 32767), 44 + i * 2);
    }

    fs.writeFileSync(filePath, buffer);
    console.log(`Generated ${filePath}`);
}

const soundsDir = path.join(__dirname, '../public/assets/sounds');
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
}

// Generate sounds
createWavFile(path.join(soundsDir, 'lobby_theme.wav'), 5, 440, 'sine'); // A4
createWavFile(path.join(soundsDir, 'training_bgm.wav'), 5, 523, 'sine'); // C5
createWavFile(path.join(soundsDir, 'level_up.wav'), 1, 600, 'slide'); // Slide up
createWavFile(path.join(soundsDir, 'evolution.wav'), 3, 100, 'square'); // Low rumble
