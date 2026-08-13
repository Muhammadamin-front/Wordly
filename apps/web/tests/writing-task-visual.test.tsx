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

  it("renders every non-chart Task 1 visual instead of an empty prompt", () => {
    const { rerender } = render(
      <WritingTaskVisual
        visual={{
          kind: "process",
          title: "Chocolate production",
          categories: ["Harvest pods", "Dry beans", "Package bars"],
          series: [],
        }}
      />
    );

    expect(screen.getByRole("list", { name: "Chocolate production" })).toBeInTheDocument();
    expect(screen.getByText("Package bars")).toBeInTheDocument();

    rerender(
      <WritingTaskVisual
        visual={{
          kind: "map-pair",
          title: "Coastal town",
          categories: [],
          series: [],
          maps: [
            {
              title: "1980",
              features: [
                { name: "Sea", kind: "water", x: 0, y: 70, width: 100, height: 30 },
              ],
            },
            {
              title: "Today",
              features: [
                { name: "Marina", kind: "water", x: 10, y: 70, width: 30, height: 20 },
              ],
            },
          ],
        }}
      />
    );

    expect(screen.getByRole("img", { name: "Coastal town: 1980" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Coastal town: Today" })).toBeInTheDocument();
  });

  it("renders paired pie charts with percentages", () => {
    render(
      <WritingTaskVisual
        visual={{
          kind: "pie-pair",
          title: "Household spending",
          categories: [],
          series: [],
          pies: [
            { title: "1990", slices: [{ name: "Housing", value: 30 }, { name: "Other", value: 70 }] },
            { title: "2020", slices: [{ name: "Housing", value: 40 }, { name: "Other", value: 60 }] },
          ],
        }}
      />
    );

    expect(screen.getByRole("img", { name: "Household spending: 1990" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Household spending: 2020" })).toBeInTheDocument();
    expect(screen.getByText("Housing 30%")).toBeInTheDocument();
  });
});
