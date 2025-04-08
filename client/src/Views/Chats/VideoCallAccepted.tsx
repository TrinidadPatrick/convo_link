import React, { useEffect, useRef, useState } from "react";
import SocketStore from "../../store/SocketStore";
import Peer, { Instance, SignalData } from "simple-peer";
import { useAuthContext } from "../../Auth/AuthProvider";
import { useParams } from "react-router-dom";
import VideoCallStore from "../../store/VideoCallStore";

type CallStatus = "idle" | "calling" | "receiving" | "in-call";

const VideoCallAccepted = () => {
  const {vcObject, setVcObject} = VideoCallStore()
  const {_id} = useParams();
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

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(()=>{
    if(vcObject)
    {
      setIncomingCallId(vcObject.incomingCallId)
      setIncomingSignal(vcObject.incomingSignal)
      setCallStatus(vcObject.callStatus)
    }
    
  },[vcObject])
  console.log(vcObject)

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: { from: string; signal: SignalData }) => {
      setCallStatus("receiving");
      setIncomingCallId(data.from);
      setIncomingSignal(data.signal); 
    };

    const handleCallAccepted = (signal: SignalData) => {
      console.log(signal)
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

    if (!_id || !localStream) return;
    setCallStatus("calling");
    console.log("start")
    peerRef.current = new Peer({
      initiator: true,
      trickle: false,
      stream: localStream,
    });



    peerRef.current.on("signal", (signal) => {
      socket.emit("start-call", {
        to: _id,
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

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled; // Toggle track state
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled; // Toggle track state
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  // useEffect(() => {
  //   if(_id)
  //   {
  //     startCall()
  //   }
  // }, [_id])

  return (
    <div className="video-call-container w-full h-[100svh] flex flex-col">
      <div className="video-container w-full h-full bg-black justify-center flex gap-2 relative">
        <div className="h-full w-full flex relative">
          <div className="h-full w-full flex ">
            <video width="100%" height="auto" ref={remoteVideoRef} autoPlay playsInline className="local-video object-fill" />
          </div>
            
          <div className="absolute h-[150px] aspect-video z-20 bg-red-100 top-10 right-10">
            <video ref={localVideoRef} autoPlay playsInline className="remote-video " />
          </div>
        </div>
      </div>

      <div className="controls absolute bg-white w-full flex justify-center py-3 bottom-0">

        {/* End call button & mute button & show video button */}
        {/* <div className="flex gap-4 w-fit">
          <button onClick={toggleVideo} style={{backgroundColor: 'rgba(255,255,255,0.1)'}} className=" h-[50px] rounded-full aspect-square flex justify-center items-center">
            {
              videoEnabled ? <svg className="ml-0.5" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24"><path fill="white" d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11z"/></svg>

              :
              <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24"><path fill="white" d="M3.27 2L2 3.27L4.73 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12c.2 0 .39-.08.54-.18L19.73 21L21 19.73M21 6.5l-4 4V7a1 1 0 0 0-1-1H9.82L21 17.18z"/></svg>
            }
          </button>
          <button onClick={toggleAudio} style={{backgroundColor: 'rgba(255,255,255,0.1)'}} className=" h-[50px] rounded-full aspect-square flex justify-center items-center">
            {
              !audioEnabled ? <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24"><path fill="white" d="M17.75 14.95L16.3 13.5q.35-.575.525-1.2T17 11h2q0 1.1-.325 2.088t-.925 1.862m-2.95-3L9 6.15V5q0-1.25.875-2.125T12 2t2.125.875T15 5v6q0 .275-.062.5t-.138.45M11 21v-3.1q-2.6-.35-4.3-2.312T5 11h2q0 2.075 1.463 3.538T12 16q.85 0 1.613-.262T15 15l1.425 1.425q-.725.575-1.588.963T13 17.9V21zm8.8 1.6L1.4 4.2l1.4-1.4l18.4 18.4z"/></svg>
              :
              <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 16 16"><path fill="white" d="M7.5 11A2.5 2.5 0 0 0 10 8.5v-6a2.5 2.5 0 1 0-5 0v6A2.5 2.5 0 0 0 7.5 11M11 7v1.5a3.5 3.5 0 1 1-7 0V7H3v1.5a4.5 4.5 0 0 0 4 4.472V15H5v1h5v-1H8v-2.028A4.5 4.5 0 0 0 12 8.5V7z"/></svg>
            }
          </button>
          <button onClick={startCall} style={{backgroundColor: 'rgba(255,255,255,0.1)'}} className=" h-[50px] rounded-full aspect-square flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24"><path fill="red" d="M12 8q2.95 0 5.813 1.188T22.9 12.75q.3.3.3.7t-.3.7l-2.3 2.25q-.275.275-.638.3t-.662-.2l-2.9-2.2q-.2-.15-.3-.35t-.1-.45v-2.85q-.95-.3-1.95-.475T12 10t-2.05.175T8 10.65v2.85q0 .25-.1.45t-.3.35l-2.9 2.2q-.3.225-.663.2t-.637-.3l-2.3-2.25q-.3-.3-.3-.7t.3-.7q2.2-2.375 5.075-3.562T12 8"/></svg>
          </button>
        </div> */}

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

export default VideoCallAccepted;
