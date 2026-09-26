import type { Scramble } from "@everyday-nautilus/core";
import { ftoScrambleProvider } from "@everyday-nautilus/scrambler";
import { useState } from "react";

export function App() {
  const [scramble, setScramble] = useState<Scramble | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateScramble() {
    setIsGenerating(true);
    setError(null);
    try {
      setScramble(await ftoScrambleProvider.generate());
    } catch (cause) {
      console.error("FTO scramble generation failed", cause);
      setError("スクランブルを生成できませんでした。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main>
      <header className="brand">
        <span className="brand-mark" aria-hidden="true">
          ◇
        </span>
        <span>Everyday Nautilus</span>
        <span className="badge">FTO PRACTICE</span>
      </header>
      <section className="intro" aria-labelledby="intro-title">
        <p className="eyebrow">A LITTLE PRACTICE, EVERY DAY.</p>
        <h1 id="intro-title">FTOを、毎日の習慣に。</h1>
        <p>スクランブルを作って、今日の練習を始めよう。</p>
      </section>
      <section className="scramble-card" aria-labelledby="scramble-title">
        <div className="card-heading">
          <div>
            <p className="eyebrow">FREE PRACTICE</p>
            <h2 id="scramble-title">通常スクランブル</h2>
          </div>
          <span className="pill">Random state</span>
        </div>
        <div className="scramble" aria-live="polite" aria-busy={isGenerating}>
          {scramble ? (
            <p data-testid="scramble-moves">{scramble.moves}</p>
          ) : (
            <p className="empty">
              準備ができたら、スクランブルを生成してください。
            </p>
          )}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="card-footer">
          <p>
            各面を120°回転。<span className="notation">′</span> は逆方向。
          </p>
          <button
            type="button"
            onClick={generateScramble}
            disabled={isGenerating}
          >
            {isGenerating
              ? "生成中…"
              : scramble
                ? "次のスクランブル"
                : "スクランブルを生成"}
          </button>
        </div>
      </section>
      <footer>
        <span>一回ずつ、少しずつ。</span>
        <a href="https://nautilusfto.com/" target="_blank" rel="noreferrer">
          Nautilus 解法ガイド ↗
        </a>
      </footer>
    </main>
  );
}
