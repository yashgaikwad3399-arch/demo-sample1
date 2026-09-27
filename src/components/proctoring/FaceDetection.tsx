import { useEffect, useRef, useState } from "react";
import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

interface FaceDetectionProps {
  onFaceCountChange?: (count: number) => void;
}

export default function FaceDetection({
  onFaceCountChange,
}: FaceDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [faceCount, setFaceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function initializeProctoring() {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------
        // 1. Start camera
        // -----------------------------------------
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Your browser does not support camera access."
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user",
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await new Promise<void>((resolve) => {
            if (!videoRef.current) {
              resolve();
              return;
            }

            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });

          await videoRef.current.play();
        }

        // -----------------------------------------
        // 2. Load MediaPipe
        // -----------------------------------------
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        // -----------------------------------------
        // 3. Create Face Detector
        // -----------------------------------------
        const detector = await FaceDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
              delegate: "GPU",
            },

            runningMode: "VIDEO",

            minDetectionConfidence: 0.5,
          }
        );

        if (!isMounted) {
          detector.close();
          return;
        }

        detectorRef.current = detector;

        setLoading(false);

        // -----------------------------------------
        // 4. Detect faces continuously
        // -----------------------------------------
        const detectFaces = () => {
          if (!isMounted) {
            return;
          }

          const video = videoRef.current;
          const detectorInstance = detectorRef.current;

          if (
            video &&
            detectorInstance &&
            video.readyState >= 2
          ) {
            try {
              const result =
                detectorInstance.detectForVideo(
                  video,
                  performance.now()
                );

              const count = result.detections.length;

              setFaceCount(count);

              if (onFaceCountChange) {
                onFaceCountChange(count);
              }
            } catch (detectionError) {
              console.error(
                "Face detection error:",
                detectionError
              );
            }
          }

          animationFrameRef.current =
            requestAnimationFrame(detectFaces);
        };

        detectFaces();
      } catch (err) {
        console.error(
          "Proctoring initialization error:",
          err
        );

        setLoading(false);

        setError(
          "Camera or face detection could not be started. Please allow camera permission and try again."
        );
      }
    }

    initializeProctoring();

    // -----------------------------------------
    // Cleanup
    // -----------------------------------------
    return () => {
      isMounted = false;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      if (detectorRef.current) {
        detectorRef.current.close();
        detectorRef.current = null;
      }
    };
  }, [onFaceCountChange]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
      
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          AI Proctoring
        </h3>

        {!loading && !error && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            Camera Active
          </span>
        )}
      </div>

      {/* Camera */}
      <video
        ref={videoRef}
        className="w-full rounded-lg bg-black"
        autoPlay
        muted
        playsInline
      />

      {/* Loading */}
      {loading && (
        <p className="mt-3 text-blue-600">
          Initializing camera and face detection...
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-red-700">
          <p className="font-semibold">
            Proctoring Error
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>
        </div>
      )}

      {/* Face Detection Result */}
      {!loading && !error && (
        <div className="mt-3">

          {/* One face */}
          {faceCount === 1 && (
            <div className="rounded-lg bg-green-50 p-3 text-green-700">
              <p className="font-semibold">
                ✓ Face detected
              </p>

              <p className="text-sm">
                One candidate detected.
              </p>
            </div>
          )}

          {/* No face */}
          {faceCount === 0 && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              <p className="font-semibold">
                ⚠ No face detected
              </p>

              <p className="text-sm">
                Please remain visible in front of the camera.
              </p>
            </div>
          )}

          {/* Multiple faces */}
          {faceCount > 1 && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              <p className="font-semibold">
                ⚠ Multiple faces detected
              </p>

              <p className="text-sm">
                Only one candidate should be visible during
                the examination.
              </p>
            </div>
          )}

          <p className="mt-2 text-sm text-gray-600">
            Faces detected: {faceCount}
          </p>

        </div>
      )}
    </div>
  );
}