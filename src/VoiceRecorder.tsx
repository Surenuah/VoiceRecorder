import { ReactMediaRecorder } from 'react-media-recorder';
import { VoiceRecorderV2 } from './VoiceRecorderV2';

export const AudioRecorder = () => {
	const uploadBlob = async (audioBlob: Blob, fileType: string) => {
		const formData = new FormData();
		formData.append('audio_data', audioBlob, 'file');
		formData.append('type', fileType || 'mp3');

		const apiUrl = "http://localhost:3000/upload/audio";
		const response = await fetch(apiUrl, {
			method: 'POST',
			cache: 'no-cache',
			body: formData
		});

		return response.json();
	};

	return (
		<div>
			<h2>Запись аудиосообщений</h2>
			<ReactMediaRecorder
				audio
				render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
					<div>
						<p>Статус: {status}</p>
						{status !== 'recording' && <button onClick={startRecording}>Начать запись</button>}
						{status === 'recording' && <button onClick={stopRecording}>Остановить запись</button>}
						{mediaBlobUrl && (
							<div>
								<audio src={mediaBlobUrl} controls />
								<button
									onClick={async () => {
										const response = await fetch(mediaBlobUrl);
										const webmBlob = await response.blob();

										const mp3Blob = await VoiceRecorderV2(webmBlob);

										await uploadBlob(mp3Blob, 'mp3');
										alert('Запись загружена на сервер!');
									}}
								>
									Загрузить запись
								</button>
								<a href={mediaBlobUrl} download="audio-recording.webm">Скачать запись</a>
							</div>
						)}
					</div>
				)}
			/>
		</div>
	);
};
