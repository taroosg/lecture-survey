import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LecturesPage from "./page";

// LectureList コンポーネントのモック
vi.mock("../../components/lectures/LectureList", () => ({
  LectureList: () => (
    <div data-testid="lecture-list">
      <p>講義一覧コンポーネント</p>
    </div>
  ),
}));

describe("LecturesPage", () => {
  afterEach(() => {
    cleanup();
  });
  it("講義一覧ページが正しくレンダリングされること", () => {
    render(<LecturesPage />);

    // main要素が存在することを確認
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    // 適切なCSSクラスが適用されていることを確認（統一されたレイアウト）
    expect(main).toHaveClass("p-8", "flex", "flex-col", "gap-8");

    // h2タイトルが表示されることを確認
    expect(
      screen.getByRole("heading", { level: 2, name: "講義一覧" }),
    ).toBeInTheDocument();
  });

  it("LectureListコンポーネントが表示されること", () => {
    render(<LecturesPage />);

    const lectureList = screen.getByTestId("lecture-list");
    expect(lectureList).toBeInTheDocument();
    expect(screen.getByText("講義一覧コンポーネント")).toBeInTheDocument();
  });

  it("レスポンシブデザインのクラスが適用されていること", () => {
    render(<LecturesPage />);

    const main = screen.getByRole("main");

    // パディングクラスが適用されていることを確認
    expect(main).toHaveClass("p-8");

    // Flexboxレイアウトクラスが適用されていることを確認
    expect(main).toHaveClass("flex", "flex-col", "gap-8");

    // コンテナ要素が存在することを確認
    const container = main.querySelector(".max-w-4xl.mx-auto.w-full");
    expect(container).toBeInTheDocument();
  });
});
