import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Calendar, CheckCircle } from "lucide-react";
import EventCard from "@/components/EventCard";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Tables<"events">[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Tables<"events">[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [interests, setInterests] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [socialLink, setSocialLink] = useState("");

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (data) {
      setProfile(data);
      setName(data.name);
      setInterests((data.interests || []).join(", "));
      setWhatsapp((data as any).whatsapp || "");
      setSocialLink((data as any).social_link || "");
    }
  };

  const fetchEvents = async () => {
    if (!user) return;
    const { data: created } = await supabase.from("events").select("*").eq("created_by", user.id).order("event_date", { ascending: false });
    if (created) setCreatedEvents(created);

    const { data: participations } = await supabase.from("event_participants").select("event_id").eq("user_id", user.id);
    if (participations && participations.length > 0) {
      const ids = participations.map((p) => p.event_id);
      const { data: joined } = await supabase.from("events").select("*").in("id", ids).order("event_date", { ascending: false });
      if (joined) setJoinedEvents(joined);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchEvents();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const interestsArr = interests.split(",").map((i) => i.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").update({ name: name.trim(), interests: interestsArr, whatsapp: whatsapp.trim(), social_link: socialLink.trim() } as any).eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      setEditing(false);
      fetchProfile();
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile card */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-card">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-secondary border-border" maxLength={100} />
                    </div>
                    <div>
                      <Label>Interests (comma-separated)</Label>
                      <Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Cruiser, Touring, Off-road" className="mt-1 bg-secondary border-border" maxLength={500} />
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+1 234 567 890" className="mt-1 bg-secondary border-border" maxLength={20} />
                    </div>
                    <div>
                      <Label>Social Link</Label>
                      <Input value={socialLink} onChange={(e) => setSocialLink(e.target.value)} placeholder="https://instagram.com/..." className="mt-1 bg-secondary border-border" maxLength={200} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="bg-gradient-fire text-primary-foreground hover:opacity-90" size="sm">Save</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="font-heading text-3xl font-bold text-foreground">{profile?.name || "Rider"}</h1>
                    <p className="mt-1 text-muted-foreground">{profile?.email}</p>
                    {profile?.interests && profile.interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {profile.interests.map((int) => (
                          <span key={int} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{int}</span>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(true)}>Edit Profile</Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Created Events */}
          <div className="mt-12">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
              <Calendar className="h-6 w-6 text-primary" /> Events Created
            </h2>
            {createdEvents.length === 0 ? (
              <p className="mt-4 text-muted-foreground">You haven't created any events yet.</p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {createdEvents.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            )}
          </div>

          {/* Joined Events */}
          <div className="mt-12">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
              <CheckCircle className="h-6 w-6 text-primary" /> Events Joined
            </h2>
            {joinedEvents.length === 0 ? (
              <p className="mt-4 text-muted-foreground">You haven't joined any events yet.</p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {joinedEvents.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
