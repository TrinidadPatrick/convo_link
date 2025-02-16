import React, { useEffect, useRef, useState } from "react";
import SocketStore from "../../store/SocketStore";
import Peer, { Instance, SignalData } from 'simple-peer';
import { useAuthContext } from "../../Auth/AuthProvider";

type CallStatus = 'idle' | 'calling' | 'receiving' | 'in-call';

const VideoCall = () => {
  const {user} = useAuthContext()
  const {socket} = SocketStore()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Instance>();

  console.log(socket)

    // Initialize socket connection
    useEffect(() => { 
    
        socket?.on('connect', () => {
          console.log('Connected to signaling server');
        });
    
        socket?.on('incoming-call', (data: { from: string, signal: SignalData }) => {
          setCallStatus('receiving');
          setIncomingCallId(data.from);
          if (peerRef.current) return;
    
          // Create peer instance for receiving call
          peerRef.current = new Peer({ initiator: false, trickle: false });
    
          peerRef.current.on('signal', (signal) => {
            socket?.current?.emit('accept-call', { 
              to: data.from, 
              signal 
            });
          });
    
          peerRef.current.on('stream', handleRemoteStream);
          peerRef.current.signal(data.signal);
        });
    
        socket?.on('call-accepted', (signal: SignalData) => {
          if (peerRef.current) {
            peerRef.current.signal(signal);
            setCallStatus('in-call');
          }
        });
    
        socket?.on('end-call', () => {
          resetCall();
        });
    
        return () => {
          socket?.disconnect();
        };
    }, [socket]);

    // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [socket]);

  const handleRemoteStream = (stream: MediaStream) => {
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

//   console.log(new Peer({ initiator: true, trickle: false }))

  const startCall = async () => {
    if (!targetUserId) return;

    setCallStatus('calling');
    const peer = new Peer({ initiator: true, trickle: false });

    console.log(peer)

    peer.on('signal', (signal) => {
      socket?.emit('start-call', {
        to: targetUserId,
        signal
      });
    });

    peer.on('stream', handleRemoteStream);
    
    if (localStream) {
      peer.addStream(localStream);
    }

    peerRef.current = peer;
  };

  const acceptCall = () => {
    setCallStatus('in-call');
    if (peerRef.current && incomingCallId) {
      // The peer instance was already created in the incoming-call handler
      // Just update UI state
    }
  };

  const endCall = () => {
    socket?.current?.emit('end-call', { to: targetUserId || incomingCallId });
    resetCall();
  };

  const resetCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = undefined;
    }
    setCallStatus('idle');
    setIncomingCallId(null);
    setTargetUserId('');
    setRemoteStream(null);
  };

  return (
    <div className="video-call-container">
      <div className="video-container flex gap-2">
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className="local-video"
        />
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          className="remote-video"
        />
      </div>

      <div className="controls">
        {callStatus === 'idle' && (
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

        {callStatus === 'receiving' && (
          <div className="incoming-call">
            <p>Incoming call from {incomingCallId}</p>
            <button onClick={acceptCall}>Answer</button>
            <button onClick={resetCall}>Decline</button>
          </div>
        )}

        {(callStatus === 'calling' || callStatus === 'in-call') && (
          <div className="active-call">
            <p>
              {callStatus === 'calling' 
                ? `Calling ${targetUserId}...` 
                : `In call with ${targetUserId || incomingCallId}`}
            </p>
            <button onClick={endCall}>End Call</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoCall