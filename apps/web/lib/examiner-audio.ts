/** Playing the examiner's voice without paying to synthesize it twice.
 *
 *  The server decides which of the two it is (see
 *  apps/api/app/services/examiner_script.py): a reply that reproduces one of
 *  the examiner's scripted lines comes back as `static` with an id, and its
 *  audio is already rendered and cached server-side. Everything else is
 *  written for this learner and has to be voiced live.
 *
 *  Nothing here decides routing on its own — matching phrases in the client
 *  would put the same rule in two places and let them drift.
 */
import { API_URL } from "@/lib/api";
import type { TurnResponse } from "@/lib/coach";

/** Pre-rendered audio for one scripted line. Immutable and shared by every
 *  learner, so the browser and any cache in front of it keep it. */
export function examinerPhraseUrl(staticAudioId: string): string {
  return `${API_URL}/api/v1/tts/examiner/${encodeURIComponent(staticAudioId)}`;
}

export type VoicePlan =
  | { kind: "static"; url: string; text: string }
  | { kind: "dynamic"; text: string };

/** What to play for one examiner turn. */
export function planVoice(turn: TurnResponse): VoicePlan {
  if (turn.audio_type === "static" && turn.static_audio_id) {
    return { kind: "static", url: examinerPhraseUrl(turn.static_audio_id), text: turn.reply };
  }
  // Includes the case where the server said "static" but sent no id: falling
  // back to live synthesis is always correct, just not free.
  return { kind: "dynamic", text: turn.reply };
}
