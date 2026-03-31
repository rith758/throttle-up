import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    location: "",
    event_date: "",
  });

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.title.trim() || !form.location.trim() || !form.event_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("events").insert({
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      location: form.location.trim(),
      event_date: new Date(form.event_date).toISOString(),
      created_by: user.id,
    });

    if (error) {
      toast.error("Failed to create event");
    } else {
      toast.success("Event created! 🎉");
      navigate("/events");
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <p className="text-muted-foreground">Please sign in to create events.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-2xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Create <span className="text-gradient-fire">Event</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Organize a new ride for the community</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <Label htmlFor="title">Event Name *</Label>
              <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Weekend Mountain Ride" className="mt-1.5 bg-card border-border" maxLength={200} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell riders what to expect..." className="mt-1.5 bg-card border-border min-h-[120px]" maxLength={2000} />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input id="image_url" value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://example.com/image.jpg" className="mt-1.5 bg-card border-border" maxLength={500} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Highway 101, California" className="mt-1.5 bg-card border-border" maxLength={300} />
              </div>
              <div>
                <Label htmlFor="event_date">Date & Time *</Label>
                <Input id="event_date" type="datetime-local" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} className="mt-1.5 bg-card border-border" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-fire text-primary-foreground hover:opacity-90 shadow-glow" size="lg">
              {loading ? "Creating..." : "Create Event 🏍️"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
