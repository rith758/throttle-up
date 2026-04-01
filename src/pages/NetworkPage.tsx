import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Sparkles } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export default function NetworkPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*");
      if (data) {
        const me = data.find((p) => p.user_id === user?.id);
        setMyInterests(me?.interests ?? []);
        setProfiles(data.filter((p) => p.user_id !== user?.id));
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const getMatchingInterests = (interests: string[] | null) => {
    if (!interests || myInterests.length === 0) return [];
    return interests.filter((i) => myInterests.includes(i));
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Users className="h-4 w-4" />
            Biker Network
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
            Connect with <span className="text-gradient-fire">Riders</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Discover fellow bikers who share your passion. Matching interests are highlighted automatically.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-center text-muted-foreground">No other riders found yet. Invite your crew!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, idx) => {
              const matches = getMatchingInterests(profile.interests);
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-glow">
                    {matches.length > 0 && (
                      <div className="absolute right-3 top-3 z-10">
                        <Badge className="gap-1 bg-gradient-fire text-primary-foreground border-0">
                          <Sparkles className="h-3 w-3" />
                          Matching Interest
                        </Badge>
                      </div>
                    )}
                    <CardContent className="flex flex-col items-center p-6 pt-8 text-center">
                      <Avatar className="mb-4 h-16 w-16 ring-2 ring-primary/20 transition-all group-hover:ring-primary/50">
                        <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold text-foreground">{profile.name || "Anonymous Rider"}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>

                      {profile.interests && profile.interests.length > 0 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                          {profile.interests.map((interest) => (
                            <Badge
                              key={interest}
                              variant={matches.includes(interest) ? "default" : "outline"}
                              className={
                                matches.includes(interest)
                                  ? "bg-primary/20 text-primary border-primary/30"
                                  : "text-muted-foreground"
                              }
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
