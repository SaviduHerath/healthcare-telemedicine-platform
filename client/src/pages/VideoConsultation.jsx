import React, { useEffect, useRef } from "react";

const VideoConsultation = ({
  roomName = "telemedicine-demo-room",
  userName = "User",
}) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    let api = null;

    const loadJitsi = () => {
      if (jitsiApiRef.current) return;

      // THE FIX: Set height to 100% so it fills the parent container from Telemedicine.jsx
      api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "100%", // Changed from calc to 100%
        userInfo: {
          displayName: userName,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true, // Prevents mobile app redirects
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        },
      });

      jitsiApiRef.current = api;
    };

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = loadJitsi;
      document.body.appendChild(script);
    } else {
      loadJitsi();
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, userName]);

  // THE FIX: Only return the div. No extra padding, headers, or containers.
  // This allows Telemedicine.jsx to control the size perfectly.
  return (
    <div 
      ref={jitsiContainerRef} 
      style={{ height: "100%", width: "100%", backgroundColor: "#000" }} 
    />
  );
};

export default VideoConsultation;