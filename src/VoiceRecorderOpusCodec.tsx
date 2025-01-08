import { useState, useRef } from 'react';

const bitrates = [8, 12, 16, 24, 32, 48, 64, 128];

export const VoiceRecorderOpusCodec = () => {
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async (bitrate: number) => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const options = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: bitrate * 1000,
        };

        mediaRecorderRef.current = new MediaRecorder(stream, options);

        mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
        };

        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    return (
        <div>
            <div>
                {bitrates.map((bitrate) => (
                    <button key={bitrate} onClick={() => startRecording(bitrate)}>
                        Start Recording at {bitrate}kb/s
                    </button>
                ))}
            </div>
            <button onClick={recording ? stopRecording : () => {}}>
                {recording ? 'Stop Recording' : 'Select a bitrate to start'}
            </button>
            {audioURL && (
                <audio controls>
                    <source src={audioURL} type="audio/webm" />
                    Your browser does not support the audio element.
                </audio>
            )}
        </div>
    );
};
