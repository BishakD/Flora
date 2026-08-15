import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { BookingFlow } from "@/components/BookingFlow";
import { Footer } from "@/components/Footer";
import { getRooms } from "@/lib/rooms";

export const metadata: Metadata = {
  title: "Book Your Stay",
  description: "Choose your Flora room, stay dates and rate, then send a secure reservation request.",
};

type BookingSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BookingPage({ searchParams }: { searchParams: BookingSearchParams }) {
  await connection();
  const rooms = await getRooms();

  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : undefined;

  return (
    <main id="main-content" className="mt-[var(--nav-height)]">
      <header className="relative min-h-[52svh] overflow-hidden bg-flora-navy text-flora-cream">
        <Image src="/images/room-05.jpg" alt="A refined suite interior, placeholder for Flora booking" fill preload sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-flora-navy/58" />
        <div className="container-shell relative z-10 flex min-h-[52svh] flex-col justify-center py-20">
          <p className="eyebrow text-flora-gold">Stay at Flora</p>
          <h1 className="display-title mt-4 max-w-4xl text-[clamp(4rem,9vw,8rem)]">Shape your Florence stay</h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-flora-cream/82">Choose your dates, compare the available room rates and send your reservation request to Flora.</p>
        </div>
      </header>
      <BookingFlow
        rooms={rooms}
        initialAdults={Number(value("adults")) || 2}
        initialChildren={Number(value("children")) || 0}
        initialCheckIn={value("checkIn")}
        initialCheckOut={value("checkOut")}
        initialRoom={value("room")}
        initialRate={value("rate")}
      />
      <Footer />
    </main>
  );
}
