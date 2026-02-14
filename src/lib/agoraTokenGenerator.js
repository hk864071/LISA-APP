
import { RtcTokenBuilder, RtcRole } from 'agora-token';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const APP_CERTIFICATE = import.meta.env.VITE_AGORA_CERTIFICATE;

// WARNING: This function allows generating tokens on client-side for MVP/Testing ONLY.
// In a real production app, never expose your APP_CERTIFICATE on the client.
// You should move this logic to a secure backend (e.g., Supabase Edge Functions).
export const generateAgoraToken = (channelName, uid) => {
    if (!APP_ID || !APP_CERTIFICATE) {
        console.error("Agora App ID or Certificate missing in .env");
        return null;
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs
    );

    return token;
};
