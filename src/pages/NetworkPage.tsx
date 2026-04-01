import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Sparkles,
  UserPlus,
  Clock,
  CheckCircle,
  X,
  Lock,
  Phone,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  interests: string[] | null;
  avatar_url: string | null;
  whatsapp: string | null;
  social_link: string | null;
}

interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
}

export default function NetworkPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const [profilesRes, connectionsRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("connections" as any).select("*") as unknown as { data: Connection[] | null },
    ]);

    if (profilesRes.data) {
      const me = (profilesRes.data as Profile[]).find(
        (p) => p.user_id === user.id
      );
      setMyInterests(me?.interests ?? []);
      setProfiles(
        (profilesRes.data as Profile[]).filter((p) => p.user_id !== user.id)
      );
    }

    if (connectionsRes.data) {
      setConnections(connectionsRes.data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getConnectionState = (
    profileUserId: string
  ): {
    state: "none" | "pending_sent" | "pending_received" | "connected";
    connection?: Connection;
  } => {
    if (!user) return { state: "none" };
    const conn = connections.find(
      (c) =>
        (c.sender_id === user.id && c.receiver_id === profileUserId) ||
        (c.sender_id === profileUserId && c.receiver_id === user.id)
    );
    if (!conn) return { state: "none" };
    if (conn.status === "accepted") return { state: "connected", connection: conn };
    if (conn.sender_id === user.id)
      return { state: "pending_sent", connection: conn };
    return { state: "pending_received", connection: conn };
  };

  const sendRequest = async (receiverId: string) => {
    if (!user) return;
    setActionLoading(receiverId);
    const { error } = await (supabase.from("connections" as any) as any).insert({
      sender_id: user.id,
      receiver_id: receiverId,
    });
    if (error) {
      toast.error("Failed to send request");
    } else {
      toast.success("Connection request sent!");
      await fetchData();
    }
    setActionLoading(null);
  };

  const acceptRequest = async (connectionId: string) => {
    setActionLoading(connectionId);
    const { error } = await (supabase.from("connections" as any) as any)
      .update({ status: "accepted" })
      .eq("id", connectionId);
    if (error) {
      toast.error("Failed to accept request");
    } else {
      toast.success("Connection accepted!");
      await fetchData();
    }
    setActionLoading(null);
  };

  const ignoreRequest = async (connectionId: string) => {
    setActionLoading(connectionId);
    const { error } = await (supabase.from("connections" as any) as any)
      .delete()
      .eq("id", connectionId);
    if (error) {
      toast.error("Failed to remove request");
    } else {
      toast.success("Request removed");
      await fetchData();
    }
    setActionLoading(null);
  };

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
            Discover fellow bikers who share your passion. Send connection
            requests and unlock contact info.
          </p>
        </motion.div>

        {!user && (
          <p className="text-center text-muted-foreground">
            Please sign in to view the biker network.
          </p>
        )}

        {user && loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl bg-card"
              />
            ))}
          </div>
        ) : user && profiles.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No other riders found yet. Invite your crew!
          </p>
        ) : user ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, idx) => {
              const matches = getMatchingInterests(profile.interests);
              const { state, connection } = getConnectionState(
                profile.user_id
              );
              const isConnected = state === "connected";
              const isLoading =
                actionLoading === profile.user_id ||
                actionLoading === connection?.id;

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
                        <Badge className="gap-1 bg-gradient-fire border-0 text-primary-foreground">
                          <Sparkles className="h-3 w-3" />
                          Match
                        </Badge>
                      </div>
                    )}
                    <CardContent className="flex flex-col items-center p-6 pt-8 text-center">
                      <Avatar className="mb-4 h-16 w-16 ring-2 ring-primary/20 transition-all group-hover:ring-primary/50">
                        <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold text-foreground">
                        {profile.name || "Anonymous Rider"}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {profile.email}
                      </p>

                      {/* Interests */}
                      {profile.interests && profile.interests.length > 0 && (
                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                          {profile.interests.map((interest) => (
                            <Badge
                              key={interest}
                              variant={
                                matches.includes(interest)
                                  ? "default"
                                  : "outline"
                              }
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

                      {/* Social / Contact — locked unless connected */}
                      <div className="mt-4 w-full rounded-lg border border-border/50 bg-secondary/30 p-3">
                        {isConnected ? (
                          <div className="space-y-1.5 text-sm">
                            {profile.whatsapp ? (
                              <div className="flex items-center justify-center gap-2 text-foreground">
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                <span>{profile.whatsapp}</span>
                              </div>
                            ) : null}
                            {profile.social_link ? (
                              <div className="flex items-center justify-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-primary" />
                                <a
                                  href={profile.social_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate max-w-[180px]"
                                >
                                  {profile.social_link}
                                </a>
                              </div>
                            ) : null}
                            {!profile.whatsapp && !profile.social_link && (
                              <p className="text-xs text-muted-foreground">
                                No contact info shared yet
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Lock className="h-3.5 w-3.5" />
                            Connect to view contact info
                          </div>
                        )}
                      </div>

                      {/* Connection action */}
                      <div className="mt-4 w-full">
                        {state === "none" && (
                          <Button
                            onClick={() => sendRequest(profile.user_id)}
                            disabled={isLoading}
                            className="w-full bg-gradient-fire text-primary-foreground hover:opacity-90"
                            size="sm"
                          >
                            <UserPlus className="mr-1.5 h-4 w-4" />
                            {isLoading ? "Sending…" : "Connect"}
                          </Button>
                        )}
                        {state === "pending_sent" && (
                          <Button
                            variant="outline"
                            disabled
                            className="w-full cursor-default border-primary/30 text-primary"
                            size="sm"
                          >
                            <Clock className="mr-1.5 h-4 w-4" />
                            Pending
                          </Button>
                        )}
                        {state === "pending_received" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => acceptRequest(connection!.id)}
                              disabled={isLoading}
                              className="flex-1 bg-gradient-fire text-primary-foreground hover:opacity-90"
                              size="sm"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => ignoreRequest(connection!.id)}
                              disabled={isLoading}
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {state === "connected" && (
                          <Button
                            variant="outline"
                            disabled
                            className="w-full cursor-default border-green-500/30 text-green-400"
                            size="sm"
                          >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Connected
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
