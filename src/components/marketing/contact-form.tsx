"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        venue: fd.get("venue"),
        message: fd.get("message"),
        topic: fd.get("topic"),
        product: "leaguepour",
      }),
      headers: { "Content-Type": "application/json" },
    });
    setSent(true);
    form.reset();
  }

  if (sent) {
    return (
      <div className="mt-10 rounded-xl border border-lp-success/40 bg-lp-success/10 p-6 text-sm text-lp-text">
        Sent. We will reply by email.
      </div>
    );
  }

  return (
    <form className="mt-10 space-y-5" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" className="mt-1.5" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          className="mt-1.5"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" name="venue" className="mt-1.5" placeholder="Taproom name, city" />
      </div>
      <div>
        <Label htmlFor="topic">What's this about?</Label>
        <select
          id="topic"
          name="topic"
          className="mt-1.5 w-full rounded-lg border border-lp-border bg-lp-bg px-3 py-2 text-sm text-lp-text focus:outline-none focus:ring-2 focus:ring-lp-accent"
          defaultValue="General question"
        >
          <option>General question</option>
          <option>Feature request / change</option>
          <option>Report a problem</option>
          <option>Billing &amp; upgrades</option>
        </select>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          className="mt-1.5"
          placeholder="What you run, timeline, question..."
        />
      </div>
      <Button type="submit" className="w-full" size="lg">
        Send
      </Button>
    </form>
  );
}
