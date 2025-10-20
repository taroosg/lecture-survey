/**
 * Question Definitions Service - Pure Functions
 *
 * アンケート質問定義に関するPure関数群
 * 本プロジェクトの質問: gender, ageGroup, understanding, satisfaction
 */

/**
 * 性別の選択肢を取得
 */
export function getGenderOptions(): string[] {
  return ["male", "female", "other", "preferNotToSay"];
}

/**
 * 年代の選択肢を取得
 */
export function getAgeGroupOptions(): string[] {
  return ["10s", "20s", "30s", "40s", "50s", "60s", "70s"];
}

/**
 * 理解度・満足度のレベルを取得（1-5の文字列）
 */
export function getSatisfactionLevels(): string[] {
  return ["1", "2", "3", "4", "5"];
}

/**
 * 性別分布を初期化（全選択肢を0で初期化）
 */
export function initializeGenderDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  getGenderOptions().forEach((option) => {
    distribution[option] = 0;
  });
  return distribution;
}

/**
 * 年代分布を初期化（全選択肢を0で初期化）
 */
export function initializeAgeDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  getAgeGroupOptions().forEach((option) => {
    distribution[option] = 0;
  });
  return distribution;
}

/**
 * 理解度・満足度分布を初期化（1-5を0で初期化）
 */
export function initializeSatisfactionDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  getSatisfactionLevels().forEach((level) => {
    distribution[level] = 0;
  });
  return distribution;
}

/**
 * 性別×満足度のクロス集計データ構造を初期化
 */
export function initializeGenderBySatisfaction(): {
  understanding: {
    male: Record<string, number>;
    female: Record<string, number>;
    other: Record<string, number>;
    preferNotToSay: Record<string, number>;
  };
  satisfaction: {
    male: Record<string, number>;
    female: Record<string, number>;
    other: Record<string, number>;
    preferNotToSay: Record<string, number>;
  };
} {
  const satisfactionLevels = getSatisfactionLevels();
  const genderOptions = getGenderOptions();

  const understanding: Record<string, Record<string, number>> = {};
  const satisfaction: Record<string, Record<string, number>> = {};

  genderOptions.forEach((genderOption) => {
    understanding[genderOption] = {};
    satisfaction[genderOption] = {};
    satisfactionLevels.forEach((level) => {
      understanding[genderOption][level] = 0;
      satisfaction[genderOption][level] = 0;
    });
  });

  return {
    understanding: understanding as {
      male: Record<string, number>;
      female: Record<string, number>;
      other: Record<string, number>;
      preferNotToSay: Record<string, number>;
    },
    satisfaction: satisfaction as {
      male: Record<string, number>;
      female: Record<string, number>;
      other: Record<string, number>;
      preferNotToSay: Record<string, number>;
    },
  };
}

/**
 * 年代×満足度のクロス集計データ構造を初期化
 */
export function initializeAgeBySatisfaction(): {
  understanding: Record<string, Record<string, number>>;
  satisfaction: Record<string, Record<string, number>>;
} {
  const satisfactionLevels = getSatisfactionLevels();
  const ageOptions = getAgeGroupOptions();

  const understanding: Record<string, Record<string, number>> = {};
  const satisfaction: Record<string, Record<string, number>> = {};

  ageOptions.forEach((ageOption) => {
    understanding[ageOption] = {};
    satisfaction[ageOption] = {};
    satisfactionLevels.forEach((level) => {
      understanding[ageOption][level] = 0;
      satisfaction[ageOption][level] = 0;
    });
  });

  return {
    understanding,
    satisfaction,
  };
}
