"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BracketPreview } from "@/components/app/bracket-preview";
import { buildRoundRobinSchedule, buildSingleEliminationRound1, describeBracket, pairNextRound } from "@/lib/tournament";
import type { Participant } from "@/lib/tournament";

/**
 * A "test with sample participants" preview - entirely client-side, computed from the same
 * bracket math the real Start Tournament action uses, but with placeholder names and nothing
 * written to the database. This is the practical stand-in for a full isolated test/preview mode:
 * no real emails, no charges, no production standings touched, no plan slot consumed - it never
 * calls the server at all. Clearly marked SAMPLE throughout so it can't be confused with a real
 * bracket.
 */
export function SampleBracketPreview({ bracketKind }: { bracketKind: "SINGLE_ELIMINATION" | "ROUND_ROBIN" }) {
  const [count, setCount] = useState(8);
  const [shown, setShown] = useState(false);

  const sample: Participant[] = Array.from({ length: count }, (_, i) => ({
    id: String(i),
    name: `Sample team ${i + 1}`,
  }));

  const bracketRows =
    bracketKind === "SINGLE_ELIMINATION"
      ? (() => {
          const rows: { id: string; round: number; homeName: string; awayName: string | null; label: string | null }[] = [];
          let { pairings } = buildSingleEliminationRound1(sample);
          let round = 1;
          let winners: Participant[] = [];
          while (pairings.length > 0) {
            for (const p of pairings) {
              rows.push({
                id: `${round}-${p.slot}`,
                round,
                homeName: p.home.name,
                awayName: p.away?.name ?? null,
                label: null,
              });
            }
            // Sample only - there's no real result to advance on, so the "home" seed of each
            // pairing is carried forward just to keep illustrating bracket shape/round count.
            winners = pairings.map((p) => p.home);
            if (pairings.length === 1) break;
            pairings = pairNextRound(winners);
            round += 1;
          }
          return rows;
        })()
      : (() => {
          const { rounds } = buildRoundRobinSchedule(sample);
          return rounds.flatMap((matches, i) =>
            matches.map((m, j) => ({
              id: `${i}-${j}`,
              round: i + 1,
              homeName: m.home.name,
              awayName: m.away.name,
              label: null,
            })),
          );
        })();

  return (
    <div className="space-y-4 rounded-[10px] border border-dashed border-lp-accent/40 bg-lp-accent/5 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-lp-accent">Sample preview - nothing is saved</p>
        <p className="mt-1 text-sm text-lp-muted">
          See what this format looks like with a sample number of participants before anyone registers. This never
          touches real data, sends email, or charges anyone.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="sample-count">Sample participant count</Label>
          <Input
            id="sample-count"
            type="number"
            min={2}
            max={32}
            value={count}
            onChange={(e) => setCount(Math.min(32, Math.max(2, Number(e.target.value) || 2)))}
            className="mt-1.5 min-h-12 w-32"
          />
        </div>
        <Button type="button" variant="secondary" onClick={() => setShown(true)}>
          Preview sample bracket
        </Button>
      </div>
      {shown ? (
        <div className="space-y-3">
          <ul className="list-disc space-y-1 pl-5 text-sm text-lp-muted">
            {describeBracket(bracketKind, count).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <BracketPreview
            title="Sample bracket"
            matches={bracketRows.map((r) => ({
              id: r.id,
              round: r.round,
              label: r.label,
              homeName: r.homeName,
              awayName: r.awayName,
              homeScore: null,
              awayScore: null,
              completed: false,
            }))}
          />
        </div>
      ) : null}
    </div>
  );
}
