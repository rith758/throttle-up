import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type EventWithCount = Tables<"events"> & { participant_count: number };

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (eventsData) {
      // Get participant counts
      const { data: counts } = await supabase
        .from("event_participants")
        .select("event_id");

      const countMap: Record<string, number> = {};
      counts?.forEach((p) => {
        countMap[p.event_id] = (countMap[p.event_id] || 0) + 1;
      });

      setEvents(
        eventsData.map((e) => ({ ...e, participant_count: countMap[e.id] || 0 }))
      );
    }
    setLoading(false);
  };

  const fetchJoined = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("event_participants")
      .select("event_id")
      .eq("user_id", user.id);
    if (data) setJoinedIds(new Set(data.map((d) => d.event_id)));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchJoined();
  }, [user]);

  const handleJoin = async (eventId: string) => {
    if (!user) {
      toast.error("Please sign in to join events");
      return;
    }
    if (joinedIds.has(eventId)) {
      await supabase.from("event_participants").delete().eq("event_id", eventId).eq("user_id", user.id);
      toast.success("Left the ride");
    } else {
      await supabase.from("event_participants").insert({ event_id: eventId, user_id: user.id });
      toast.success("Joined the ride! 🏍️");
    }
    fetchEvents();
    fetchJoined();
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Upcoming <span className="text-gradient-fire">Rides</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Browse and join exciting biking events</p>

          <div className="relative mt-8 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">No events found. Be the first to create one!</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <EventCard
                  event={event}
                  joined={joinedIds.has(event.id)}
                  isOwner={user?.id === event.created_by}
                  onJoin={() => handleJoin(event.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
