import { describe, it, expect } from "vitest";
import {
  LectureFormData,
  validateLectureForm,
  formatFormData,
  isFormValid,
  getFormSubmitData,
  calculateFormErrors,
} from "./lectureFormUtils";

describe("lectureFormUtils", () => {
  describe("validateLectureForm", () => {
    const validFormData: LectureFormData = {
      title: "プログラミング入門講座",
      lectureDate: "2025-12-01",
      lectureTime: "10:00",
      description: "基本的なプログラミング概念を学習する講座です。",
      surveyCloseDate: "2025-12-01",
      surveyCloseTime: "12:00",
    };

    it("正常なフォームデータでバリデーション成功すること", () => {
      const result = validateLectureForm(validFormData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("必須フィールド不足でエラーメッセージが返されること", () => {
      const invalidFormData: LectureFormData = {
        title: "",
        lectureDate: "",
        lectureTime: "",
        description: "",
        surveyCloseDate: "",
        surveyCloseTime: "",
      };

      const result = validateLectureForm(invalidFormData);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe("講義タイトルは必須です");
      expect(result.errors.lectureDate).toBe("講義日は必須です");
      expect(result.errors.lectureTime).toBe("講義時間は必須です");
      expect(result.errors.surveyCloseDate).toBe("アンケート締切日は必須です");
      expect(result.errors.surveyCloseTime).toBe(
        "アンケート締切時間は必須です",
      );
    });

    it("日付・時刻の形式チェックテスト", () => {
      const invalidFormData: LectureFormData = {
        title: "テスト講義",
        lectureDate: "invalid-date",
        lectureTime: "invalid-time",
        description: "テスト",
        surveyCloseDate: "2024/12/01", // 無効な形式
        surveyCloseTime: "25:00", // 無効な時間
      };

      const result = validateLectureForm(invalidFormData);
      expect(result.isValid).toBe(false);
      expect(result.errors.lectureDate).toBe("有効な日付を入力してください");
      expect(result.errors.lectureTime).toBe("有効な時間を入力してください");
      expect(result.errors.surveyCloseDate).toBe(
        "有効な日付を入力してください",
      );
      expect(result.errors.surveyCloseTime).toBe(
        "有効な時間を入力してください",
      );
    });

    it("締切日時の妥当性チェックテスト", () => {
      const invalidFormData: LectureFormData = {
        title: "テスト講義",
        lectureDate: "2025-12-01",
        lectureTime: "12:00",
        description: "テスト",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "10:00", // 講義時間より前
      };

      const result = validateLectureForm(invalidFormData);
      expect(result.isValid).toBe(false);
      expect(result.errors.general).toBe(
        "アンケート締切日時は講義日時より後に設定してください",
      );
    });

    it("文字数制限のテスト", () => {
      const longTitle = "a".repeat(101); // 101文字
      const longDescription = "a".repeat(501); // 501文字

      const invalidFormData: LectureFormData = {
        title: longTitle,
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: longDescription,
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = validateLectureForm(invalidFormData);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe(
        "講義タイトルは100文字以内で入力してください",
      );
      expect(result.errors.description).toBe(
        "講義説明は500文字以内で入力してください",
      );
    });

    it("説明文が任意項目であることのテスト", () => {
      const formDataWithoutDescription: LectureFormData = {
        title: "テスト講義",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = validateLectureForm(formDataWithoutDescription);
      expect(result.isValid).toBe(true);
      expect(result.errors.description).toBeUndefined();
    });

    it("新規作成モード時は過去の講義日時でエラーになること", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 昨日
      const pastFormData: LectureFormData = {
        title: "過去の講義",
        lectureDate: pastDate.toISOString().split("T")[0],
        lectureTime: "10:00",
        description: "テスト",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = validateLectureForm(pastFormData, false); // isEditMode = false
      expect(result.isValid).toBe(false);
      expect(result.errors.lectureDate).toBe(
        "講義日時は現在時刻より後に設定してください",
      );
    });

    it("編集モード時は過去の講義日時でもエラーにならないこと", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 昨日
      const pastFormData: LectureFormData = {
        title: "過去の講義",
        lectureDate: pastDate.toISOString().split("T")[0],
        lectureTime: "10:00",
        description: "テスト",
        surveyCloseDate: pastDate.toISOString().split("T")[0],
        surveyCloseTime: "12:00",
      };

      const result = validateLectureForm(pastFormData, true); // isEditMode = true
      // 過去の日時でも編集モードではエラーにならない
      expect(result.errors.lectureDate).toBeUndefined();
    });
  });

  describe("formatFormData", () => {
    it("フォーム入力値の正規化テスト", () => {
      const unformattedData: LectureFormData = {
        title: "  テスト講義  ",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "  テスト説明  ",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = formatFormData(unformattedData);
      expect(result.title).toBe("テスト講義");
      expect(result.description).toBe("テスト説明");
      expect(result.lectureDate).toBe("2025-12-01");
      expect(result.lectureTime).toBe("10:00");
    });

    it("空の説明文の処理テスト", () => {
      const dataWithEmptyDescription: LectureFormData = {
        title: "テスト講義",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "   ", // 空白のみ
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = formatFormData(dataWithEmptyDescription);
      expect(result.description).toBeUndefined();
    });
  });

  describe("isFormValid", () => {
    it("フォーム全体の有効性判定テスト", () => {
      const validData: LectureFormData = {
        title: "テスト講義",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "テスト説明",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      expect(isFormValid(validData)).toBe(true);

      const invalidData: LectureFormData = {
        title: "",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "テスト説明",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      expect(isFormValid(invalidData)).toBe(false);
    });

    it("編集モードでは過去の日時でも有効と判定されること", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastData: LectureFormData = {
        title: "過去の講義",
        lectureDate: pastDate.toISOString().split("T")[0],
        lectureTime: "10:00",
        description: "テスト",
        surveyCloseDate: pastDate.toISOString().split("T")[0],
        surveyCloseTime: "12:00",
      };

      expect(isFormValid(pastData, false)).toBe(false); // 新規作成モード
      expect(isFormValid(pastData, true)).toBe(true); // 編集モード
    });
  });

  describe("getFormSubmitData", () => {
    it("送信用データの変換テスト", () => {
      const formData: LectureFormData = {
        title: "  テスト講義  ",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "  テスト説明  ",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = getFormSubmitData(formData);
      expect(result.title).toBe("テスト講義");
      expect(result.description).toBe("テスト説明");
      expect(result.lectureDate).toBe("2025-12-01");
      expect(result.lectureTime).toBe("10:00");
      expect(result.surveyCloseDate).toBe("2025-12-01");
      expect(result.surveyCloseTime).toBe("12:00");
    });

    it("不要なフィールドの除去テスト", () => {
      const formData: LectureFormData = {
        title: "テスト講義",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "", // 空文字
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = getFormSubmitData(formData);
      expect(result.description).toBeUndefined();
    });
  });

  describe("calculateFormErrors", () => {
    it("各フィールドのエラー状態計算テスト", () => {
      const invalidData: LectureFormData = {
        title: "",
        lectureDate: "invalid",
        lectureTime: "10:00",
        description: "テスト説明",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const errors = calculateFormErrors(invalidData);
      expect(errors.title).toBe("講義タイトルは必須です");
      expect(errors.lectureDate).toBe("有効な日付を入力してください");
      expect(errors.lectureTime).toBeUndefined();
      expect(errors.description).toBeUndefined();
    });

    it("エラーメッセージの優先順位テスト", () => {
      const dataWithMultipleErrors: LectureFormData = {
        title: "a".repeat(101), // 長すぎる（エラーメッセージが表示される）
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "テスト説明",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const errors = calculateFormErrors(dataWithMultipleErrors);
      expect(errors.title).toBe("講義タイトルは100文字以内で入力してください");
    });

    it("編集モードでは過去の日時エラーが表示されないこと", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastData: LectureFormData = {
        title: "過去の講義",
        lectureDate: pastDate.toISOString().split("T")[0],
        lectureTime: "10:00",
        description: "テスト",
        surveyCloseDate: pastDate.toISOString().split("T")[0],
        surveyCloseTime: "12:00",
      };

      const createModeErrors = calculateFormErrors(pastData, false);
      expect(createModeErrors.lectureDate).toBe(
        "講義日時は現在時刻より後に設定してください",
      );

      const editModeErrors = calculateFormErrors(pastData, true);
      expect(editModeErrors.lectureDate).toBeUndefined();
    });
  });

  describe("境界値テスト", () => {
    it("タイトルの境界値テスト（100文字ちょうど）", () => {
      const exactLimitTitle = "a".repeat(100);
      const formData: LectureFormData = {
        title: exactLimitTitle,
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: "テスト説明",
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = validateLectureForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors.title).toBeUndefined();
    });

    it("説明文の境界値テスト（500文字ちょうど）", () => {
      const exactLimitDescription = "a".repeat(500);
      const formData: LectureFormData = {
        title: "テスト講義",
        lectureDate: "2025-12-01",
        lectureTime: "10:00",
        description: exactLimitDescription,
        surveyCloseDate: "2025-12-01",
        surveyCloseTime: "12:00",
      };

      const result = validateLectureForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors.description).toBeUndefined();
    });

    it("時刻の境界値テスト", () => {
      const validTimes = ["00:00", "12:00", "23:59"];
      const invalidTimes = ["24:00", "12:60", "25:30"];

      validTimes.forEach((time) => {
        const formData: LectureFormData = {
          title: "テスト講義",
          lectureDate: "2025-12-01",
          lectureTime: time,
          description: "テスト説明",
          surveyCloseDate: "2025-12-01",
          surveyCloseTime: "23:59",
        };

        const result = validateLectureForm(formData);
        expect(result.errors.lectureTime).toBeUndefined();
      });

      invalidTimes.forEach((time) => {
        const formData: LectureFormData = {
          title: "テスト講義",
          lectureDate: "2025-12-01",
          lectureTime: time,
          description: "テスト説明",
          surveyCloseDate: "2025-12-01",
          surveyCloseTime: "23:59",
        };

        const result = validateLectureForm(formData);
        expect(result.errors.lectureTime).toBe("有効な時間を入力してください");
      });
    });
  });
});
