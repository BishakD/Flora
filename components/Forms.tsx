"use client";

import { useState } from "react";
import { BrandMark } from "./BrandMark";

export function InfoRequestForm() {
  const [status, setStatus] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Demo only — your details were not sent. Connect this form to the hotel CRM before launch.");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl border border-flora-line bg-flora-ivory p-7 shadow-soft sm:p-12" aria-labelledby="request-title">
      <div className="flex flex-col items-center text-center">
        <BrandMark />
        <p className="eyebrow mt-5 text-flora-gold">Your stay, considered</p>
        <h2 id="request-title" className="mt-3 font-display text-[clamp(2.8rem,6vw,5rem)] leading-none">Info request</h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-flora-grey">Share the shape of your Florence stay. This editorial prototype does not send data yet.</p>
      </div>
      <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <label className="block"><span className="eyebrow text-flora-grey">Name</span><input required name="name" autoComplete="name" className="field" placeholder="Your name" /></label>
        <label className="block"><span className="eyebrow text-flora-grey">Email</span><input required name="email" type="email" autoComplete="email" className="field" placeholder="you@example.com" /></label>
        <label className="block"><span className="eyebrow text-flora-grey">Preferred arrival</span><input name="arrival" type="date" className="field" /></label>
        <label className="block"><span className="eyebrow text-flora-grey">Preferred departure</span><input name="departure" type="date" className="field" /></label>
        <label className="block sm:col-span-2"><span className="eyebrow text-flora-grey">Message</span><textarea required name="message" className="field min-h-28 resize-y" placeholder="Tell us what would make the stay feel entirely yours." /></label>
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <button type="submit" className="luxury-button border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Send request</button>
        <p className="max-w-xl text-center font-sans text-[0.58rem] leading-relaxed tracking-[0.08em] text-flora-grey">By submitting, you agree to the final hotel privacy notice once supplied. No information is transmitted in this prototype.</p>
        {status ? <p className="rounded-full bg-flora-cream px-5 py-3 text-center text-sm text-flora-slate" role="status">{status}</p> : null}
      </div>
    </form>
  );
}
