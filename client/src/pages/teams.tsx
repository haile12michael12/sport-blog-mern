import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Users } from "lucide-react";
import type { Team } from "@shared/schema";

export default function Teams() {
  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  return (
    <div className="min-h-screen" data-testid="page-teams">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Teams</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore professional sports teams and their profiles
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
        ) : teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link key={team.id} href={`/team/${team.slug}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-team-${team.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {team.logo && (
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-16 h-16 object-contain"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                        <Badge className="mb-3">{team.sport}</Badge>
                        {team.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {team.bio}
                          </p>
                        )}
                        {team.foundedYear && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Founded: {team.foundedYear}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No teams available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
