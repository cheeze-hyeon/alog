import type { CharacterProgress } from "@/types";

interface CharacterSectionProps {
  characterProgress: CharacterProgress;
}

export default function CharacterSection({ characterProgress }: CharacterSectionProps) {
  const { currentLevel, nextLevel, currentAmount, progressPercentage, amountToNextLevel } =
    characterProgress;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4">
      <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">캐릭터 성장</h2>

      {/* 캐릭터 레벨 표시 */}
      <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="text-6xl md:text-7xl mb-2">{currentLevel.emoji}</div>
          <div className="text-xl md:text-2xl font-bold text-slate-900">{currentLevel.name}</div>
          <div className="text-sm text-slate-500 mt-1">레벨 {currentLevel.level}</div>
        </div>
      </div>

      {/* 진행 바 */}
      {nextLevel && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">다음 레벨까지</span>
            <span className="text-sm font-bold text-emerald-600">
              {amountToNextLevel.toLocaleString()}원
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-500">{progressPercentage.toFixed(1)}%</span>
            <span className="text-xs text-slate-500">
              {nextLevel.name} 레벨까지 남았어요
            </span>
          </div>
        </div>
      )}

      {/* 통계 정보 */}
      <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200">
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-slate-900">
            {currentAmount.toLocaleString()}원
          </div>
          <div className="text-xs text-slate-500 mt-1">누적 구매 금액</div>
        </div>
        {nextLevel ? (
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-emerald-600">
              {nextLevel.level}
            </div>
            <div className="text-xs text-slate-500 mt-1">다음 레벨</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-emerald-600">최고 레벨!</div>
            <div className="text-xs text-slate-500 mt-1">축하합니다 🎉</div>
          </div>
        )}
      </div>
    </div>
  );
}
