import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LecturesPage from "./page";

// LectureList コンポーネントのモック
vi.mock("../../components/lectures/LectureList", () => ({
  LectureList: () => (
    <div data-testid="lecture-list">
      <h1>講義管理</h1>
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

    // 適切なCSSクラスが適用されていることを確認
    expect(main).toHaveClass(
      "container",
      "mx-auto",
      "min-h-screen",
      "bg-gray-50",
      "p-8",
      "pt-24",
      "dark:bg-gray-900",
    );
  });

  it("LectureListコンポーネントが表示されること", () => {
    render(<LecturesPage />);

    const lectureList = screen.getByTestId("lecture-list");
    expect(lectureList).toBeInTheDocument();
    expect(screen.getByText("講義管理")).toBeInTheDocument();
    expect(screen.getByText("講義一覧コンポーネント")).toBeInTheDocument();
  });

  it("レスポンシブデザインのクラスが適用されていること", () => {
    render(<LecturesPage />);

    const main = screen.getByRole("main");

    // Tailwind CSSのコンテナクラスが適用されていることを確認
    expect(main).toHaveClass("container", "mx-auto");

    // パディングクラスが適用されていることを確認
    expect(main).toHaveClass("p-8", "pt-24");

    // ダークモード対応クラスが適用されていることを確認
    expect(main).toHaveClass("dark:bg-gray-900");
  });
});
