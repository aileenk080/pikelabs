"use client";
import { Play, Trash, Upload } from "lucide-react";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const TrainingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const [teleprompterPosition, setTeleprompterPosition] = useState({
    x: 20,
    y: 20,
  });

  // Hardcoded script for training
  const trainingScript =
    "Hello, and welcome to PinkSpeak. This is a sample script for training purposes. Please read this script clearly and naturally. The quick brown rabbit jumps over the lazy frogs with no effort. This is the story of the fox and the rabbit. The End";

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setMediaStream(stream);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings to use this app.",
        });
      }
    };

    getCameraPermission();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScrolling && scrollRef.current) {
      interval = setInterval(() => {
        scrollRef.current!.scrollTop += 1;
      }, 100);
      setIntervalId(interval);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => clearInterval(interval);
  }, [isScrolling]);

  const startScrolling = () => {
    setIsScrolling(true);
  };

  const stopScrolling = () => {
    setIsScrolling(false);
  };

  const resetScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const startRecording = () => {
    if (!mediaStream) return;
    resetScroll();

    const recorder = new MediaRecorder(mediaStream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedVideo(url);

      setIsRecording(false);
      stopScrolling();
    };

    recorder.start();

    setIsRecording(true);
    setRecordingTime(0);
    startScrolling();

    const timerInterval = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);

    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      clearInterval(timerInterval);
    }, 60000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    stopScrolling();
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const uploadVideo = async () => {
    if (!recordedVideo) {
      alert("No video recorded!");
      return;
    }

    setUploadStatus("Uploading...");

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploadStatus("Upload successful!");
  };

  const deleteRecordedVideo = () => {
    setRecordedVideo(null);
  };

  const handleDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX - teleprompterPosition.x;
    const startY = e.clientY - teleprompterPosition.y;

    const handleMove = (e: MouseEvent) => {
      setTeleprompterPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  };

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 100MB.",
      });
      return;
    }

    if (!["video/mp4", "video/webm", "video/mov"].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a valid video file (MP4, WEBM, MOV).",
      });
      return;
    }

    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoUrl;

    video.onloadedmetadata = async () => {
      if (video.duration > 60) {
        const trimmedVideoBlob = await trimVideo(file, 60);
        const trimmedVideoUrl = URL.createObjectURL(trimmedVideoBlob);
        setRecordedVideo(trimmedVideoUrl);
        setUploadedFile(
          new File([trimmedVideoBlob], file.name, { type: file.type })
        );
      } else {
        setRecordedVideo(videoUrl);
        setUploadedFile(file);
      }
    };
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const trimVideo = (videoFile: File, maxDuration: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(videoFile);

      video.onloadedmetadata = () => {
        const duration = Math.min(video.duration, maxDuration);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const startTime = 0;
        const endTime = duration;

        const reader = new FileReader();
        reader.onload = function (event) {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          const videoData = new Uint8Array(uint8Array);
          const videoBlob = new Blob([videoData], { type: videoFile.type });
          resolve(videoBlob);
        };

        reader.onerror = (error) => {
          reject(error);
        };
      };

      video.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleUpload = async () => {
    if (!recordedVideo) {
      toast({
        variant: "destructive",
        title: "No video to upload",
        description: "Please record a video or upload one.",
      });
      return;
    }

    setUploadStatus("Uploading...");

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploadStatus("Upload successful!");
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-8">
      <main className="flex flex-col items-center justify-center flex-grow w-full max-w-2xl">
        <div className="relative w-full">
          <video
            ref={videoRef}
            className="w-full aspect-video rounded-md"
            autoPlay
            muted
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-gray-900 bg-opacity-50 rounded-md p-1 z-10">
            Recording Time: {formatTime(recordingTime)} / 1:00
          </div>
          {!hasCameraPermission && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}

          {/* Teleprompter */}
            <div
              ref={scrollRef}
              className="cursor-move rounded-xl text-center"
              onMouseDown={handleDrag}
              style={{
                position: "absolute",
                top: teleprompterPosition.y,
                left: teleprompterPosition.x,
                zIndex: 10,
            
                width: "350px",
                height: "6rem",
                padding: "1.125rem",
            
                backgroundColor: "rgba(10, 10, 10, 0.85)", // semi-transparent black
                backdropFilter: "blur(20px)" as any,         // THIS is the blur effect
                WebkitBackdropFilter: "blur(20px)" as any,   // for Safari support
            
                color: "rgba(255, 175, 220, 1)",
                fontSize: "1.125rem",
                fontWeight: "bold",
                textShadow: "0 0 1px rgba(255,255,255,0.1)",
            
                overflowY: "hidden",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              <p>{trainingScript}</p>
            </div>
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          {!isRecording ? (
            <Button
              onClick={() => {
                resetScroll();
                startRecording();
              }}
              disabled={isRecording || !hasCameraPermission}
            >
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={() => {
                stopRecording();
              }}
              disabled={!isRecording}
            >
              Stop Recording
            </Button>
          )}
        </div>

        {recordedVideo && (
          <div className="relative mb-4 w-full">
            <video
              src={recordedVideo}
              className="w-full h-auto rounded-md shadow-md"
              controls
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={deleteRecordedVideo}
              className="absolute top-2 right-2 bg-transparent hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete recorded video</span>
            </Button>
          </div>
        )}
        <div className="flex justify-center space-x-4 mb-4">
          <Button onClick={handleUpload} disabled={!recordedVideo}>
            Upload Video
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFileInputClick}>
            <Upload className="h-4 w-4" />
            <span className="sr-only">Upload Video from Device</span>
          </Button>
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        {uploadStatus && (
          <p className="mt-4 text-center text-gray-600">{uploadStatus}</p>
        )}
      </main>

      <footer className="w-full p-4 text-center text-gray-500 border-t border-gray-200">
        {/* Footer content here */}
      </footer>
    </div>
  );
};

export default TrainingPage;
