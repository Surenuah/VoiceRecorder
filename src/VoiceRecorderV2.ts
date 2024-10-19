import {createFFmpeg} from "@ffmpeg/ffmpeg";

export async function VoiceRecorderV2(webmBlob: Blob): Promise<Blob> {
    if (webmBlob.size === 0) {
        throw new Error("Получен пустой Blob");
    }

    const ffmpeg = createFFmpeg({ log: false });
    await ffmpeg.load();

    const inputName = 'input.webm';
    const outputName = 'output.mp3';

    const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(webmBlob);
    });

    ffmpeg.FS('writeFile', inputName, new Uint8Array(arrayBuffer as unknown as Uint8Array));

    await ffmpeg.run('-i', inputName, outputName);

    const outputData = ffmpeg.FS('readFile', outputName);
    return new Blob([outputData.buffer], { type: 'audio/mp3' });
}
