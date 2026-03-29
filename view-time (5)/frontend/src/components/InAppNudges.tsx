import React, { useMemo } from "react";
import { EditorialPanel } from "components/EditorialPanel";
import useWatchHistoryStore from "utils/watchHistoryStore";

interface NudgeMessage {
  type: "insight" | "celebration";
  message: string;
}

interface InAppNudgesProps {
  className?: string;
}

export const InAppNudges: React.FC<InAppNudgesProps> = ({ className = "" }) => {
  const { analytics } = useWatchHistoryStore();

  const nudges = useMemo((): NudgeMessage[] => {
    if (!analytics) {
      return [];
    }

    const messages: NudgeMessage[] = [];
    const algorithmicShare = analytics.algorithmic_view_share ?? 0;
    const dailyAverage = analytics.daily_average_minutes ?? 0;
    const shortsShare = analytics.shorts_share ?? 0;
    const avgShortsStreak = analytics.average_shorts_streak_minutes ?? 0;
    const longestSession = analytics.longest_session_minutes ?? 0;
    const shortsMinutes = analytics.shorts_total_minutes ?? 0;
    const intentionalMinutes = analytics.intentional_minutes ?? 0;

    if (algorithmicShare > 0.6) {
      messages.push({
        type: "insight",
        message: "Over 60% of your viewing is driven by recommendations. Try setting a goal to watch one intentional video after each recommendation streak.",
      });
    }

    if (shortsShare > 0.4 || shortsMinutes > 120) {
      messages.push({
        type: "insight",
        message: "Shorts take up a large slice of your week. Consider limiting Shorts streaks to 15 minutes and switching to long-form learning after.",
      });
    }

    if (dailyAverage > 180) {
      messages.push({
        type: "insight",
        message: "You're averaging more than 3 hours per day on YouTube. Set a nightly cut-off time or reduce one content category by 20%.",
      });
    }

    if (longestSession > 90) {
      messages.push({
        type: "insight",
        message: "One of your recent sessions ran past 90 minutes. Try a mid-session stretch reminder or break the session into chapters.",
      });
    }

    if (avgShortsStreak < 8 && algorithmicShare < 0.5) {
      messages.push({
        type: "celebration",
        message: "Nice balance! Your Shorts streaks stay short and you already split time between recommendations and purposeful viewing.",
      });
    }

    if (intentionalMinutes > 150) {
      messages.push({
        type: "celebration",
        message: "You spent over 2.5 hours on intentional content. Capture that focus by setting next week's learning goal now!",
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: "celebration",
        message: "You're in control of your watch habits. Keep the momentum by setting a stretch goal for the coming week!",
      });
    }

    return messages;
  }, [analytics]);

  if (nudges.length === 0) {
    return (
      <EditorialPanel tone="quiet" className={className}>
        <div className="empty-state py-4 text-center">
          <p className="font-finding text-base text-muted-foreground">
            Upload your watch history to reveal what your viewing patterns say about you.
          </p>
        </div>
      </EditorialPanel>
    );
  }

  return (
    <EditorialPanel tone="quiet" className={`space-y-0 ${className}`}>
      <div className="section-eyebrow mb-4">
        <span>What Stands Out</span>
      </div>

      {nudges.map((nudge, index) => (
        <div
          key={`${nudge.type}-${index}`}
          className="editorial-note py-4 border-t border-border-rule last:border-b last:border-border-rule"
        >
          <p className="font-finding text-base leading-relaxed text-foreground sm:text-lg">
            {nudge.type === "celebration" && (
              <span className="mr-2 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                Positive
              </span>
            )}
            {nudge.type === "insight" && (
              <span className="mr-2 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-signal">
                Observation
              </span>
            )}
            {nudge.message}
          </p>
        </div>
      ))}
    </EditorialPanel>
  );
};

export default InAppNudges;
