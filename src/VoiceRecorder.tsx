import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

export function VoiceRecorder() {
	const [loaded, setLoaded] = useState(false);
	const [recording, setRecording] = useState(false);
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
	const ffmpegRef = useRef(new FFmpeg());
	const messageRef = useRef<HTMLParagraphElement | null>(null)
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);

	const load = async () => {
		const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
		const ffmpeg = ffmpegRef.current;

		ffmpeg.on("log", ({ message }) => {
			if (messageRef.current) messageRef.current.innerHTML = message;
		});

		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(
				`${baseURL}/ffmpeg-core.wasm`,
				"application/wasm"
			),
			workerURL: await toBlobURL(
				`${baseURL}/ffmpeg-core.worker.js`,
				"text/javascript"
			),
		});

		setLoaded(true);
	};

	const startRecording = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const mediaRecorder = new MediaRecorder(stream);
		mediaRecorderRef.current = mediaRecorder;

		const audioChunks: Blob[] = [];
		mediaRecorder.ondataavailable = (event) => {
			audioChunks.push(event.data);
		};

		mediaRecorder.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
			setRecordedAudio(audioBlob);
			const url = URL.createObjectURL(audioBlob);
			setAudioURL(url);
		};

		mediaRecorder.start();
		setRecording(true);
	};

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();
		setRecording(false);
	};

	const transcodeToMp3AndSend = async () => {
		if (!recordedAudio) return;

		const ffmpeg = ffmpegRef.current;

		await ffmpeg.writeFile("input.wav", await fetchFile(recordedAudio));
		await ffmpeg.exec(["-i", "input.wav", "output.mp3"]);

		const fileData = await ffmpeg.readFile('output.mp3');
		const data = new Uint8Array(fileData as ArrayBuffer);
		const mp3Blob = new Blob([data.buffer], { type: 'audio/mp3' });

		const formData = new FormData();
		formData.append('file', mp3Blob, 'audio.mp3');

		try {
			const response = await fetch('/send-message', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				console.log("Файл успешно отправлен на сервер");
			} else {
				console.error("Ошибка при отправке файла на сервер", response.statusText);
			}
		} catch (error) {
			console.error("Ошибка в процессе отправки файла:", error);
		}
	};

	return (
		<div>
			{loaded ? (
				<>
					<button onClick={recording ? stopRecording : startRecording}>
						{recording ? "Stop Recording" : "Start Recording"}
					</button>

					{audioURL && (
						<audio src={audioURL} controls />
					)}

					{recordedAudio && (
						<button onClick={transcodeToMp3AndSend}>Convert to MP3</button>
					)}
				</>
			) : (
				<button onClick={load}>Load FFmpeg</button>
			)}
		</div>
	);
}
