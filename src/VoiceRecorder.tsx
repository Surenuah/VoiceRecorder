import { ReactMediaRecorder } from 'react-media-recorder';
import { useState } from 'react';

export const VoiceRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

    const handleUpload = async (audioBlob: Blob) => {
        setAudioBlobUrl(URL.createObjectURL(audioBlob));

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch('api', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('Успешно');
            } else {
                console.error('Ошибка');
            }
        } catch (err) {
            console.error('Ошибка:', err);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md max-w-lg mx-auto">
            <ReactMediaRecorder
                audio
                render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                    <div className="w-full">
                        <p className="text-lg font-semibold mb-4 text-gray-700">Статус: {status}</p>
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
                                Начать запись
                            </button>
                            <button
                                onClick={() => {
                                    setIsRecording(false);
                                    stopRecording();
                                    fetch(mediaBlobUrl!)
                                        .then(response => response.blob())
                                        .then(handleUpload);
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Остановить и отправить запись
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
                                Скачать аудиозапись
                            </a>
                        )}
                    </div>
                )}
            />
        </div>
    );
};
