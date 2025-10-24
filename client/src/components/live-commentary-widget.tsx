import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { LiveCommentary } from "@shared/schema";

export function LiveCommentaryWidget() {
  const [commentary, setCommentary] = useState<LiveCommentary[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function fetchInitialCommentary() {
      try {
        const response = await fetch("/api/live-commentary");
        if (response.ok) {
          const data = await response.json();
          setCommentary(data);
        }
      } catch (error) {
        console.error("Failed to fetch live commentary:", error);
      }
    }

    fetchInitialCommentary();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          ws.send(JSON.stringify({ type: "subscribe", channel: "live-commentary" }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "live-commentary") {
              setCommentary((prev) => [data.data, ...prev].slice(0, 20));
            } else if (data.type === "live-commentary-history") {
              setCommentary(data.data);
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  if (commentary.length === 0) {
    return null;
  }

  const activeMatch = commentary.find((c) => c.isActive);

  return (
    <Card data-testid="widget-live-commentary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">Live Match Updates</CardTitle>
          {isConnected && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Live
            </Badge>
          )}
        </div>
        {activeMatch && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{activeMatch.teamHome}</span>
              <span className="text-2xl font-mono font-bold">{activeMatch.scoreHome}</span>
            </div>
            <span className="text-xs text-muted-foreground">{activeMatch.matchTime}</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold">{activeMatch.scoreAway}</span>
              <span className="font-semibold text-sm">{activeMatch.teamAway}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {commentary.map((item) => (
              <div
                key={item.id}
                className="border-l-2 border-primary pl-3 py-2 hover-elevate rounded-r-md pr-2"
                data-testid={`commentary-item-${item.id}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">{item.matchTime}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                </div>
                <p className="text-sm">{item.commentary}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
