import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListeningAudioLibrary } from "@/components/ielts/listening-audio-library";

describe("ListeningAudioLibrary", () => {
  it("lists the supplied conversation tracks and filters them", () => {
    render(<ListeningAudioLibrary />);

    expect(screen.getByText("100 real-world listening conversations")).toBeInTheDocument();
    expect(screen.getAllByText("At Home 1")).toHaveLength(2);

    fireEvent.change(screen.getByPlaceholderText("Search a conversation"), { target: { value: "reservation" } });

    expect(screen.getByText("Making A Reservation")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search a conversation")).toHaveValue("reservation");
  });
});
