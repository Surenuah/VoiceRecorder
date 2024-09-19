import { ReactMediaRecorder } from 'react-media-recorder';
import { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export const VoiceRecorder = () => {
    const ffmpegRef = useRef(new FFmpeg());
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const [mp3BlobUrl, setMp3BlobUrl] = useState<string | null>(null);

    const handleUpload = async (audioBlob: Blob) => {
        setAudioBlobUrl(URL.createObjectURL(audioBlob));

        const mp3Url = await convertWebmToMp3(audioBlob);
        setMp3BlobUrl(mp3Url);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch('api', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('Successfully uploaded');
            } else {
                console.error('Upload error');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const convertWebmToMp3 = async (audioBlob: Blob) => {
        const ffmpeg = ffmpegRef.current;

        if (!ffmpeg.loaded) {
            await ffmpeg.load();
        }

        await ffmpeg.writeFile('input.webm', await fetchFile(audioBlob));
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp3']);

        const data = await ffmpeg.readFile('output.mp3');
        const mp3Blob = new Blob([data], { type: 'audio/mp3' });

        return URL.createObjectURL(mp3Blob);
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md max-w-lg mx-auto">
            <ReactMediaRecorder
                audio
                render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                    <div className="w-full">
                        <p className="text-lg font-semibold mb-4 text-gray-700">Status: {status}</p>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => {
                                    setIsRecording(true);
                                    startRecording();
                                }}
                                onMouseUp={() => setIsRecording(false)}
                                className={`px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                    ${isRecording ? 'animate-shake' : ''}`}
                            >
                                Start Recording
                            </button>
                            <button
                                onClick={() => {
                                    setIsRecording(false);
                                    stopRecording();
                                    fetch(mediaBlobUrl!)
                                        .then((response) => response.blob())
                                        .then(handleUpload);
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Stop and Upload
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <audio
                                src={mediaBlobUrl}
                                controls
                                className="w-full max-w-md mt-4 border border-gray-300 rounded-lg"
                            />
                        </div>
                        {audioBlobUrl && (
                            <a
                                href={audioBlobUrl}
                                download="recording.webm"
                                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                Download WebM
                            </a>
                        )}
                        {mp3BlobUrl && (
                            <a
                                href={mp3BlobUrl}
                                download="recording.mp3"
                                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                Download MP3
                            </a>
                        )}
                    </div>
                )}
            />
        </div>
    );
};
