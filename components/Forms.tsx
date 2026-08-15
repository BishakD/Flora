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
    <form onSubmit={submit} className="relative mx-auto max-w-[900px] border border-flora-line/70 bg-flora-ivory px-7 py-9 shadow-[0_14px_50px_rgba(43,32,22,.06)] sm:px-12 sm:py-11" aria-labelledby="request-title">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-flora-blue">Your stay, considered</p>
          <h2 id="request-title" className="mt-2 font-display text-[clamp(2.3rem,5vw,4.4rem)] uppercase leading-none tracking-[0.03em]">Info request</h2>
        </div>
        <div className="border border-dashed border-flora-blue/60 bg-flora-blue p-2 text-flora-ivory shadow-soft"><BrandMark inverse className="scale-[.65]" /></div>
      </div>

      <div className="mt-10 grid gap-9 md:grid-cols-[0.92fr_1.08fr] md:gap-12">
        <label className="block"><span className="eyebrow text-flora-grey">Message</span><textarea required name="message" className="mt-3 min-h-[270px] w-full resize-y border border-flora-line bg-transparent p-4 outline-none transition-colors focus:border-flora-slate" placeholder="Tell us what would make the stay feel entirely yours." /></label>

        <div className="relative grid content-start gap-x-6 gap-y-5 sm:grid-cols-2">
          <label className="block"><span className="eyebrow text-flora-grey">Name</span><input required name="name" autoComplete="given-name" className="field" /></label>
          <label className="block"><span className="eyebrow text-flora-grey">Surname</span><input required name="surname" autoComplete="family-name" className="field" /></label>
          <label className="block"><span className="eyebrow text-flora-grey">Check in</span><input name="arrival" type="date" className="field" /></label>
          <label className="block"><span className="eyebrow text-flora-grey">Check out</span><input name="departure" type="date" className="field" /></label>
          <label className="block"><span className="eyebrow text-flora-grey">Guests</span><input name="guests" type="number" min="1" max="8" className="field" /></label>
          <label className="block"><span className="eyebrow text-flora-grey">Rooms</span><input name="rooms" type="number" min="1" max="4" className="field" /></label>
          <label className="block sm:col-span-2"><span className="eyebrow text-flora-grey">Email</span><input suppressHydrationWarning required name="email" type="email" autoComplete="email" className="field" /></label>
          <label className="block sm:col-span-2"><span className="eyebrow text-flora-grey">Mobile</span><input name="mobile" type="tel" autoComplete="tel" className="field" /></label>
          <label className="mt-1 flex items-start gap-3 font-sans text-[0.55rem] leading-relaxed tracking-[0.07em] text-flora-grey sm:col-span-2"><input required type="checkbox" className="mt-1 accent-flora-slate" />I agree to the final privacy notice once supplied. No information is transmitted in this prototype.</label>
          <div className="sm:col-span-2 sm:text-center"><button type="submit" className="notched-button min-w-[142px] border border-flora-slate bg-flora-cream px-7 py-3 font-sans text-[0.58rem] uppercase tracking-[0.14em] text-flora-slate transition-colors hover:bg-flora-slate hover:text-flora-ivory">Send</button></div>
        </div>
      </div>
      {status ? <p className="mt-7 border-l-2 border-flora-blue pl-4 text-sm text-flora-slate" role="status">{status}</p> : null}
    </form>
  );
}
