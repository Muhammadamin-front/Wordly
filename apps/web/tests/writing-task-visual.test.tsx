import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WritingTaskVisual } from "@/components/ielts/writing-task-visual";

describe("WritingTaskVisual", () => {
  it("renders a readable line chart with its legend", () => {
    render(
      <WritingTaskVisual
        visual={{
          kind: "line",
          title: "Language students",
          categories: ["2020", "2030"],
          series: [
            { name: "English", values: [500, 700] },
            { name: "Spanish", values: [200, 450] },
          ],
        }}
      />
    );

    expect(screen.getByRole("img", { name: "Language students" })).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
  });

  it("renders table data and the paired bar-pie visual", () => {
    const { rerender } = render(
      <WritingTaskVisual
        visual={{
          kind: "table",
          title: "Airport visitors",
          categories: ["1998", "2003"],
          series: [{ name: "Heathrow", values: [27.2, 45.6] }],
        }}
      />
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("45.6")).toBeInTheDocument();

    rerender(
      <WritingTaskVisual
        visual={{
          kind: "bar-pie",
          title: "Film preferences",
          categories: ["Action", "Comedy"],
          series: [
            { name: "Men", values: [40, 20] },
            { name: "Women", values: [25, 20] },
          ],
          pie: [
            { name: "Action", value: 70 },
            { name: "Comedy", value: 30 },
          ],
        }}
      />
    );

    expect(screen.getByRole("img", { name: "Film preferences" })).toBeInTheDocument();
    expect(screen.getByText("Action 70%")).toBeInTheDocument();
  });
});
