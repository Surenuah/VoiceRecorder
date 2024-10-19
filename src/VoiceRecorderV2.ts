import {createFFmpeg} from "@ffmpeg/ffmpeg";

export async function VoiceRecorderV2(webmBlob: Blob): Promise<Blob> {
    const ffmpeg = createFFmpeg({log: false});
    await ffmpeg.load();

    const inputName = 'input.webm';
    const outputName = 'output.mp3';


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ffmpeg.FS('writeFile', inputName, <Uint8Array>await fetch(webmBlob).then((res) => res.arrayBuffer()));

    await ffmpeg.run('-i', inputName, outputName);

    const outputData = ffmpeg.FS('readFile', outputName);
    return new Blob([outputData.buffer], {type: 'audio/mp3'});
}
