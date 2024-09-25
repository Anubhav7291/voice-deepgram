"use client";
import React, { useState, useRef } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const deepgramApiKey = "";
const deepgramUrl = "wss://api.deepgram.com/v1/listen";

const VoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcript, setTranscript] = useState("");
  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef  = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const socket = new WebSocket(deepgramUrl, ["token", deepgramApiKey]);

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener("dataavailable", async (event) => {
          if (event.data.size > 0 && socket.readyState === 1) {
            audioChunksRef.current.push(event.data)
            socket.send(event.data);
          }
        });

        mediaRecorder.start(250);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.channel && data.channel.alternatives) {
          setTranscript(
            (prev) => prev + " " + data.channel.alternatives[0].transcript
          );
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket closed");
        setIsRecording(false);
        // Stop the audio tracks when the WebSocket closes
        if (mediaStreamRef.current) {
          const audioBlob = new Blob( audioChunksRef.current, {
            type: "audio/wav",
          });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudio(url);
          audioChunksRef.current = [];
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    const audioBlob = new Blob( audioChunksRef.current, {
      type: "audio/wav",
    });
    const url = URL.createObjectURL(audioBlob);
    setRecordedAudio(url);
    setIsRecording(false);
    setIsPaused(false); // Reset paused state
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  console.log("recoded", recordedAudio);

  return (
    <Box
      sx={{
        padding: 4,
        borderRadius: 2,
        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: 500,
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Voice to Text
      </Typography>
      <Typography
        variant="body1"
        sx={{
          padding: 2,
          backgroundColor: "#fff",
          borderRadius: 1,
          minHeight: 100,
        }}
      >
        {transcript || "Your voice input will appear here."}
      </Typography>
      <Box sx={{ marginTop: 3 }}>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant="contained"
          color={isRecording ? "error" : "primary"}
          startIcon={isRecording ? <MicOffIcon /> : <MicIcon />}
          sx={{ marginRight: 2 }}
        >
          {isRecording ? "Stop Microphone" : "Start Microphone"}
        </Button>
        {isRecording && !isPaused && (
          <IconButton
            onClick={pauseRecording}
            color="warning"
            sx={{ marginRight: 2 }}
          >
            <PauseIcon />
          </IconButton>
        )}
        {isPaused && (
          <IconButton onClick={resumeRecording} color="success">
            <PlayArrowIcon />
          </IconButton>
        )}
      </Box>
      <audio controls src={recordedAudio} />
    </Box>
  );
};

export default VoiceRecognition;
