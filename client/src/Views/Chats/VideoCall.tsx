import React, { useEffect, useRef, useState } from "react";
import SocketStore from "../../store/SocketStore";
import Peer, { Instance, SignalData } from "simple-peer";
import { useAuthContext } from "../../Auth/AuthProvider";

type CallStatus = "idle" | "calling" | "receiving" | "in-call";

const VideoCall = () => {
  const { user } = useAuthContext();
  const { socket } = SocketStore();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);
  const [incomingSignal, setIncomingSignal] = useState<SignalData | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Instance | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: { from: string; signal: SignalData }) => {
      setCallStatus("receiving");
      setIncomingCallId(data.from);
      setIncomingSignal(data.signal); // Store signal but don't accept yet
    };

    const handleCallAccepted = (signal: SignalData) => {
      if (peerRef.current) {
        peerRef.current.signal(signal);
        setCallStatus("in-call");
      }
    };

    const handleEndCall = () => {
      resetCall();
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("end-call", handleEndCall);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("end-call", handleEndCall);
    };
  }, [socket]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleRemoteStream = (stream: MediaStream) => {
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const startCall = () => {
    if (!targetUserId || !localStream) return;

    setCallStatus("calling");

    peerRef.current = new Peer({
      initiator: true,
      trickle: false,
      stream: localStream,
    });

    peerRef.current.on("signal", (signal) => {
      socket.emit("start-call", {
        to: targetUserId,
        signal,
      });
    });

    peerRef.current.on("stream", handleRemoteStream);
  };

  const acceptCall = () => {
    if (!incomingCallId || !incomingSignal || !localStream) {
      console.error("Cannot accept call: Missing data.");
      return;
    }

    setCallStatus("in-call");

    peerRef.current = new Peer({
      initiator: false,
      trickle: false,
      stream: localStream,
    });

    peerRef.current.on("signal", (signal) => {
      socket.emit("accept-call", {
        to: incomingCallId,
        signal,
      });
    });

    peerRef.current.on("stream", handleRemoteStream);

    // Accept stored incoming signal
    peerRef.current.signal(incomingSignal);
  };

  const endCall = () => {
    if (socket && (targetUserId || incomingCallId)) {
      socket.emit("end-call", { to: targetUserId || incomingCallId });
    }
    resetCall();
  };

  const resetCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setCallStatus("idle");
    setIncomingCallId(null);
    setIncomingSignal(null);
    setRemoteStream(null);
  };

  return (
    <div className="video-call-container">
      <div className="video-container flex gap-2">
        <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
        <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
      </div>

      <div className="controls">
        {callStatus === "idle" && (
          <div className="call-init">
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <button onClick={startCall}>Call</button>
          </div>
        )}

        {callStatus === "receiving" && (
          <div className="incoming-call">
            <p>Incoming call from {incomingCallId}</p>
            <button onClick={acceptCall}>Answer</button>
            <button onClick={resetCall}>Decline</button>
          </div>
        )}

        {(callStatus === "calling" || callStatus === "in-call") && (
          <div className="active-call">
            <p>
              {callStatus === "calling"
                ? `Calling ${targetUserId}...`
                : `In call with ${incomingCallId || targetUserId}`}
            </p>
            <button onClick={endCall}>End Call</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
