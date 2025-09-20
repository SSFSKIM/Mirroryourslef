import React, { useMemo } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Smart Nudges</CardTitle>
          <CardDescription>Personalised guidance you can act on right now.</CardDescription>
        </div>
        <BellRing className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {nudges.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Upload your watch history to activate AI nudges and goal suggestions.
          </p>
        ) : (
          nudges.map((nudge, index) => (
            <div
              key={`${nudge.type}-${index}`}
              className="rounded-md border p-3 text-sm shadow-sm"
            >
              <div className="flex items-start space-x-2">
                {nudge.type === "celebration" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                ) : (
                  <Badge variant="secondary">Nudge</Badge>
                )}
                <p className="leading-relaxed text-muted-foreground">{nudge.message}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default InAppNudges;
