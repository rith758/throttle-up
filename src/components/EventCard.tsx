import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

interface EventCardProps {
  event: Tables<"events"> & { participant_count?: number };
  onJoin?: () => void;
  joined?: boolean;
  isOwner?: boolean;
}

export default function EventCard({ event, onJoin, joined, isOwner }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-card"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80"}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1">
          {event.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> {event.location}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> {format(new Date(event.event_date), "PPP 'at' p")}
          </span>
          {event.participant_count !== undefined && (
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> {event.participant_count} riders
            </span>
          )}
        </div>
        {onJoin && (
          <Button
            onClick={onJoin}
            disabled={isOwner}
            className={`mt-4 w-full ${
              joined
                ? "border border-primary bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-gradient-fire text-primary-foreground hover:opacity-90"
            }`}
            variant={joined ? "outline" : "default"}
          >
            {isOwner ? "Your Event" : joined ? "Joined ✓" : "Join Ride 🏍️"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
