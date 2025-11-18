/**
 * ProgressBar Component Test
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("ラベルと値が正しく表示されること", () => {
    render(<ProgressBar label="理解度" value={4.2} />);

    expect(screen.getByText("理解度")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("デフォルトで青色のバーが表示されること", () => {
    const { container } = render(<ProgressBar label="理解度" value={4.2} />);

    const progressBar = container.querySelector(
      ".bg-blue-500.dark\\:bg-blue-400",
    );
    expect(progressBar).toBeInTheDocument();
  });

  it("緑色のバーが表示されること", () => {
    const { container } = render(
      <ProgressBar label="満足度" value={4.5} color="green" />,
    );

    const progressBar = container.querySelector(
      ".bg-green-500.dark\\:bg-green-400",
    );
    expect(progressBar).toBeInTheDocument();
  });

  it("パーセンテージが正しく計算されること", () => {
    const { container } = render(<ProgressBar label="理解度" value={2.5} />);

    // 2.5 / 5 = 50%
    const progressBar = container.querySelector(
      ".bg-blue-500.dark\\:bg-blue-400",
    );
    expect(progressBar).toHaveStyle({ width: "50%" });
  });

  it("最大値（5.0）で100%になること", () => {
    const { container } = render(<ProgressBar label="理解度" value={5.0} />);

    const progressBar = container.querySelector(
      ".bg-blue-500.dark\\:bg-blue-400",
    );
    expect(progressBar).toHaveStyle({ width: "100%" });
  });

  it("最小値（1.0）で20%になること", () => {
    const { container } = render(<ProgressBar label="理解度" value={1.0} />);

    const progressBar = container.querySelector(
      ".bg-blue-500.dark\\:bg-blue-400",
    );
    expect(progressBar).toHaveStyle({ width: "20%" });
  });

  it("値が小数点第1位まで表示されること", () => {
    const { container } = render(<ProgressBar label="テスト" value={3.789} />);

    // 小数点第1位まで表示される（3.789 → 3.8）
    expect(container.textContent).toContain("3.8");
  });
});
