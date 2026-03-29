import React from "react";

interface Props {
  className?: string;
}

export function TopChannelsPreview({ className }: Props) {
  // Mock data for top channels
  const channels = [
    { id: 1, name: "Channel Alpha", watchTime: 75 },
    { id: 2, name: "Channel Beta", watchTime: 68 },
    { id: 3, name: "Channel Gamma", watchTime: 62 },
  ];

  // Find the max watch time for calculating percentages
  const maxWatchTime = Math.max(...channels.map(c => c.watchTime));

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold font-display mb-3 tracking-tight">
        Top Channels
      </h3>
      <div className="space-y-4">
        {channels.map((channel, index) => {
          const percentage = (channel.watchTime / maxWatchTime) * 100;

          return (
            <div key={channel.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-data text-xs text-ink-soft w-4 text-right">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{channel.name}</span>
                </div>
                <span className="font-data text-xs text-ink-soft">
                  {channel.watchTime}h
                </span>
              </div>

              <div className="h-1.5 w-full bg-fog rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: "hsl(var(--signal))",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
