import { describe, expect, it } from "vitest";

import { readTelegramCallback } from "@/lib/telegram-oauth";

// Encodes the way Telegram does: base64url over the JSON payload, unpadded.
function encode(payload: unknown): string {
  return btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const PAYLOAD = {
  id: 8612122129,
  first_name: "Muhammad",
  username: "muhammad_uz",
  photo_url: "https://t.me/i/userpic/320/x.jpg",
  auth_date: 1755620000,
  hash: "a".repeat(64),
};

describe("readTelegramCallback", () => {
  it("reads the signed payload out of the URL fragment", () => {
    const fields = readTelegramCallback(
      new URLSearchParams("lang=uz"),
      `#tgAuthResult=${encode(PAYLOAD)}`
    );
    expect(fields).not.toBeNull();
    // Numbers in the JSON become strings, which is what the API accepts.
    expect(fields).toEqual({
      id: "8612122129",
      first_name: "Muhammad",
      username: "muhammad_uz",
      photo_url: "https://t.me/i/userpic/320/x.jpg",
      auth_date: "1755620000",
      hash: "a".repeat(64),
    });
  });

  it("omits fields Telegram did not send rather than sending them empty", () => {
    // The backend recomputes the HMAC over the fields it receives, so an
    // invented `last_name: ""` would break a signature that never covered it.
    const fields = readTelegramCallback(new URLSearchParams(), `#tgAuthResult=${encode(PAYLOAD)}`);
    expect(fields).not.toHaveProperty("last_name");
  });

  it("still accepts query parameters, the shape the embedded widget posts", () => {
    const search = new URLSearchParams({
      id: "8612122129",
      first_name: "Muhammad",
      auth_date: "1755620000",
      hash: "b".repeat(64),
    });
    expect(readTelegramCallback(search, "")).toEqual({
      id: "8612122129",
      first_name: "Muhammad",
      auth_date: "1755620000",
      hash: "b".repeat(64),
    });
  });

  it("returns null when there is no callback payload at all", () => {
    expect(readTelegramCallback(new URLSearchParams("lang=uz"), "")).toBeNull();
  });

  it("returns null on a payload missing the fields the API requires", () => {
    expect(readTelegramCallback(new URLSearchParams(), `#tgAuthResult=${encode({ id: 1 })}`)).toBeNull();
    expect(
      readTelegramCallback(new URLSearchParams(), `#tgAuthResult=${encode({ hash: "x" })}`)
    ).toBeNull();
  });

  it("returns null instead of throwing on a corrupt fragment", () => {
    expect(readTelegramCallback(new URLSearchParams(), "#tgAuthResult=not-valid-base64!!")).toBeNull();
    expect(readTelegramCallback(new URLSearchParams(), `#tgAuthResult=${btoa("not json")}`)).toBeNull();
  });
});
