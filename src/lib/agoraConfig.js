import AgoraRTC from 'agora-rtc-sdk-ng';

export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || '';
export const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
