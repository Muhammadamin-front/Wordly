import { apiFetch } from "@/lib/api";

export interface Friend {
  user_id: string;
  display_name: string;
  level: number;
  current_streak: number;
}

export interface PendingRequest {
  friendship_id: string;
  user_id: string;
  display_name: string;
  level: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  level: number;
  xp: number;
  current_streak: number;
  is_me: boolean;
}

export interface PublicProfile {
  user_id: string;
  code: string;
  display_name: string;
  level: number;
  xp: number;
  current_streak: number;
  longest_streak: number;
  achievements: string[];
}

export interface WordChainInvitation {
  invitation_id: string;
  sender_id: string;
  sender_name: string;
  room_code: string;
  expires_at: string;
  created_at: string;
}

export interface WordChainInvitationJoin {
  room_code: string;
}

interface Message {
  message: string;
}

export const socialApi = {
  friends: () => apiFetch<Friend[]>("/friends", { auth: true }),

  pending: () => apiFetch<PendingRequest[]>("/friends/pending", { auth: true }),

  leaderboard: () => apiFetch<LeaderboardEntry[]>("/friends/leaderboard", { auth: true }),

  request: (code: string) =>
    apiFetch<Message>("/friends/request", { method: "POST", body: { code }, auth: true }),

  accept: (friendshipId: string) =>
    apiFetch<Message>(`/friends/${friendshipId}/accept`, { method: "POST", body: {}, auth: true }),

  decline: (friendshipId: string) =>
    apiFetch<Message>(`/friends/${friendshipId}/decline`, { method: "POST", body: {}, auth: true }),

  remove: (otherId: string) =>
    apiFetch<Message>(`/friends/${otherId}`, { method: "DELETE", auth: true }),

  friendCode: () => apiFetch<Message>("/me/friend-code", { auth: true }),

  profile: (code: string) => apiFetch<PublicProfile>(`/profile/${code}`, { auth: true }),

  wordChainInvites: () => apiFetch<WordChainInvitation[]>("/word-chain/invitations", { auth: true }),

  inviteToWordChain: (inviteeId: string, roomCode: string) =>
    apiFetch<WordChainInvitation>("/word-chain/invitations", {
      method: "POST",
      body: { invitee_id: inviteeId, room_code: roomCode },
      auth: true,
    }),

  acceptWordChainInvite: (invitationId: string) =>
    apiFetch<WordChainInvitationJoin>(`/word-chain/invitations/${invitationId}/accept`, {
      method: "POST",
      body: {},
      auth: true,
    }),

  declineWordChainInvite: (invitationId: string) =>
    apiFetch<Message>(`/word-chain/invitations/${invitationId}/decline`, {
      method: "POST",
      body: {},
      auth: true,
    }),
};
