import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MapPin } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Bikers riding at sunset"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="container relative z-10 px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-5xl font-bold leading-tight text-foreground sm:text-7xl"
          >
            Ride Together.
            <br />
            <span className="text-gradient-fire">Explore Events.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Join the ultimate biker community. Discover rides, connect with fellow enthusiasts, and hit the open road.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/events">
              <Button size="lg" className="bg-gradient-fire text-primary-foreground hover:opacity-90 shadow-glow animate-pulse-glow">
                Explore Events <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container px-4">
          <h2 className="text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Why <span className="text-gradient-fire">Throttle Up?</span>
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { icon: Calendar, title: "Discover Events", desc: "Find rides, meetups, and rallies near you. Never miss a gathering." },
              { icon: Users, title: "Build Your Crew", desc: "Connect with bikers who share your passion. Grow your network." },
              { icon: MapPin, title: "Ride New Routes", desc: "Explore new destinations with organized group rides across the country." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-lg border border-border bg-card p-8 text-center shadow-card"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
