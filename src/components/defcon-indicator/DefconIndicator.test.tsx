import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DefconIndicator } from "./DefconIndicator";

describe("DefconIndicator", () => {
  it("renders level, trend, and timestamp", () => {
    render(
      <DefconIndicator
        summary={{
          level: 2,
          score: 68,
          trend: "down",
          updatedAt: "2026-03-04T11:05:00.000Z"
        }}
      />
    );

    expect(screen.getByText("DEFCON 2")).toBeInTheDocument();
    expect(screen.getByText("Trend: down")).toBeInTheDocument();
    expect(screen.getByText("Updated: 2026-03-04 11:05 UTC")).toBeInTheDocument();
  });
});
