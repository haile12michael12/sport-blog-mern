import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { User } from "lucide-react";
import type { Player } from "@shared/schema";

export default function Players() {
  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  return (
    <div className="min-h-screen" data-testid="page-players">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Players</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover professional athletes and their achievements
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <Link key={player.id} href={`/player/${player.slug}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-player-${player.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={player.photo || ""} alt={player.name} />
                        <AvatarFallback className="text-2xl">{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold mb-2">{player.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge>{player.sport}</Badge>
                        {player.position && (
                          <Badge variant="outline">{player.position}</Badge>
                        )}
                      </div>
                      {player.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {player.bio}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No players available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
