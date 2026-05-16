const RECORDING_MS = 3000;

export class PanicSnapCaptureError extends Error {
  constructor(
    message: string,
    readonly code: "permission_denied" | "no_device" | "capture_failed"
  ) {
    super(message);
    this.name = "PanicSnapCaptureError";
  }
}

function pickAudioMimeType(): string | undefined {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

async function waitForVideoFrame(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new PanicSnapCaptureError("Camera failed to start.", "capture_failed"));
    }, 8000);

    video.onloadeddata = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    video.onerror = () => {
      window.clearTimeout(timeout);
      reject(new PanicSnapCaptureError("Camera failed to start.", "capture_failed"));
    };
  });
}

async function capturePhotoFromStream(stream: MediaStream): Promise<Blob> {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  try {
    await video.play();
    await waitForVideoFrame(video);

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new PanicSnapCaptureError("Could not read camera frame.", "capture_failed");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new PanicSnapCaptureError("Could not capture photo.", "capture_failed");
    }
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.88);
    });

    if (!blob || blob.size === 0) {
      throw new PanicSnapCaptureError("Photo capture returned empty data.", "capture_failed");
    }

    return blob;
  } finally {
    video.srcObject = null;
  }
}

async function recordAudioFromStream(
  stream: MediaStream,
  durationMs: number
): Promise<Blob> {
  const mimeType = pickAudioMimeType();
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined
  );
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  await new Promise<void>((resolve, reject) => {
    recorder.onerror = () => {
      reject(
        new PanicSnapCaptureError("Audio recording failed.", "capture_failed")
      );
    };
    recorder.onstop = () => resolve();
    recorder.start(250);

    window.setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, durationMs);
  });

  const audioBlob = new Blob(chunks, {
    type: recorder.mimeType || mimeType || "audio/webm",
  });

  if (audioBlob.size === 0) {
    throw new PanicSnapCaptureError("Audio recording was empty.", "capture_failed");
  }

  return audioBlob;
}

function mapMediaError(err: unknown): PanicSnapCaptureError {
  if (err instanceof PanicSnapCaptureError) return err;

  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      return new PanicSnapCaptureError(
        "Camera and microphone access were denied. Allow permissions in your browser settings, then try again.",
        "permission_denied"
      );
    }
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      return new PanicSnapCaptureError(
        "No camera or microphone was found on this device.",
        "no_device"
      );
    }
  }

  return new PanicSnapCaptureError(
    "Could not capture photo or audio. Try again or call emergency services.",
    "capture_failed"
  );
}

/** Requests camera/mic, captures a JPEG frame and ~3s of audio, then stops tracks. */
export async function capturePanicSnapMedia(): Promise<{
  image: Blob;
  audio: Blob;
}> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new PanicSnapCaptureError(
      "This browser does not support camera or microphone capture.",
      "no_device"
    );
  }

  let stream: MediaStream | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: true,
    });

    const [image, audio] = await Promise.all([
      capturePhotoFromStream(stream),
      recordAudioFromStream(stream, RECORDING_MS),
    ]);

    return { image, audio };
  } catch (err) {
    throw mapMediaError(err);
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
  }
}
