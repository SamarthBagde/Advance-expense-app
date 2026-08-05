import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import vosk from "vosk";
import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { AppError } from "../utils/appError.js";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const MODEL_DIR = path.resolve(process.cwd(), "models");
const MODEL_PATH = path.join(MODEL_DIR, "vosk-model-small-en-us-0.15");

let voskModel: vosk.Model | null = null;

export const ensureVoskModel = async (): Promise<vosk.Model> => {
  if (voskModel) return voskModel;

  if (!fs.existsSync(MODEL_PATH)) {
    if (!fs.existsSync(MODEL_DIR)) {
      fs.mkdirSync(MODEL_DIR, { recursive: true });
    }

    const zipPath = path.join(MODEL_DIR, "vosk-model-small-en-us-0.15.zip");
    const modelUrl = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip";

    console.log("Downloading Vosk Speech Recognition Model (~40MB)...");

    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(zipPath);
      const request = (url: string) => {
        https.get(url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            request(response.headers.location!);
          } else if (response.statusCode === 200) {
            response.pipe(fileStream);
            fileStream.on("finish", () => {
              fileStream.close(() => resolve());
            });
          } else {
            reject(new AppError(`Failed to download Vosk model (HTTP ${response.statusCode})`, 500));
          }
        }).on("error", reject);
      };
      request(modelUrl);
    });

    console.log("Extracting Vosk model...");
    try {
      if (process.platform === "win32") {
        execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${MODEL_DIR}' -Force"`);
      } else {
        execSync(`unzip -o "${zipPath}" -d "${MODEL_DIR}"`);
      }
    } catch (err: any) {
      throw new AppError(`Failed to extract Vosk model zip: ${err.message}`, 500);
    } finally {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
    }
    console.log("Vosk model successfully installed!");
  }

  vosk.setLogLevel(-1);
  voskModel = new vosk.Model(MODEL_PATH);
  return voskModel;
};

export const transcribeAudioWithVosk = async (inputFilePath: string): Promise<string> => {
  const model = await ensureVoskModel();
  const sampleRate = 16000;
  const outputWavPath = `${inputFilePath}-converted.wav`;

  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .outputOptions([
        "-ac 1",            // Mono channel
        "-ar 16000",        // 16kHz sample rate
        "-f wav",           // WAV container
        "-acodec pcm_s16le" // 16-bit PCM
      ])
      .on("error", (err) => {
        if (fs.existsSync(outputWavPath)) fs.unlinkSync(outputWavPath);
        reject(new AppError(`Audio conversion failed: ${err.message}`, 500));
      })
      .on("end", () => {
        try {
          const rec = new vosk.Recognizer({ model: model, sampleRate: sampleRate });
          const stream = fs.createReadStream(outputWavPath, { highWaterMark: 4096 });

          stream.on("data", (chunk: Buffer) => {
            rec.acceptWaveform(chunk);
          });

          stream.on("end", () => {
            const finalResult = rec.finalResult();
            rec.free();

            if (fs.existsSync(outputWavPath)) {
              fs.unlinkSync(outputWavPath);
            }

            const transcript = (finalResult.text || "").trim();
            resolve(transcript);
          });

          stream.on("error", (err) => {
            rec.free();
            if (fs.existsSync(outputWavPath)) fs.unlinkSync(outputWavPath);
            reject(new AppError(`Error reading converted audio: ${err.message}`, 500));
          });
        } catch (error: any) {
          if (fs.existsSync(outputWavPath)) fs.unlinkSync(outputWavPath);
          reject(new AppError(`Vosk transcription error: ${error?.message || "Unknown error"}`, 500));
        }
      })
      .save(outputWavPath);
  });
};
