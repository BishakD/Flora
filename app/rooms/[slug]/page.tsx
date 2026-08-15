import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BookingBar } from "@/components/BookingBar";
import { Footer } from "@/components/Footer";
import { RevealSection, ScrollRevealText } from "@/components/Motion";
import { AmenityList, RateCard, RoomGallery } from "@/components/Rooms";
import { getRoomBySlug, getRooms } from "@/lib/rooms";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  return room
    ? { title: room.name, description: `${room.summary} Explore room details and available rates at Flora Florence.` }
    : { title: "Room not found" };
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const [room, rooms] = await Promise.all([getRoomBySlug(slug), getRooms()]);
  if (!room) notFound();

  return (
    <main id="main-content" className="mt-[var(--nav-height)]">
      <header className="bg-flora-blush pb-24 pt-8 md:pb-32">
        <div className="grid h-[52svh] min-h-[440px] grid-cols-[0.7fr_1.6fr_0.7fr] gap-2 overflow-hidden md:gap-4">
          {room.images.slice(0, 3).map((image, index) => (
            <div key={image} className="relative overflow-hidden">
              <Image src={image} alt={`${room.name}, editorial placeholder header view ${index + 1}`} fill sizes={index === 1 ? "60vw" : "24vw"} preload={index === 1} className="object-cover transition-transform duration-[8s] ease-linear hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-flora-navy/5" />
            </div>
          ))}
        </div>
        <div className="container-shell relative z-10 -mt-10 text-center md:-mt-14">
          <div className="mx-auto max-w-4xl bg-flora-ivory px-6 py-10 shadow-soft md:px-14 md:py-14">
            <p className="eyebrow text-flora-gold">{room.eyebrow}</p>
            <h1 className="display-title mt-5 text-[clamp(4rem,9vw,8.5rem)]">{room.name}</h1>
            <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-3 font-sans text-[0.58rem] uppercase tracking-[0.13em] text-flora-slate">
              <span>{room.size}</span><span>{room.occupancy}</span><span>{room.bed}</span><span>{room.view}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="botanical section-pad bg-flora-cream">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-flora-terracotta">Inside the room</p>
            <ScrollRevealText className="mt-6 text-[clamp(1.35rem,2.35vw,2rem)] leading-[1.72]">{room.description}</ScrollRevealText>
          </div>
          <div className="mt-14">
            <BookingBar compact />
          </div>
        </div>
      </section>

      <section className="section-pad bg-flora-ivory">
        <div className="container-shell grid items-start gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="space-y-12 lg:sticky lg:top-28">
            <AmenityList room={room} />
            <div>
              <p className="eyebrow text-flora-gold">At a glance</p>
              <dl className="mt-5 divide-y divide-flora-line border-y border-flora-line">
                {[["Size", room.size], ["Guests", room.occupancy], ["Bed", room.bed], ["Outlook", room.view]].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 py-3.5"><dt className="eyebrow text-[0.56rem] text-flora-grey">{label}</dt><dd className="text-right text-lg">{value}</dd></div>
                ))}
              </dl>
            </div>
          </div>
          <div>
            <RoomGallery images={room.images} roomName={room.name} />
            <div className="mt-4 grid grid-cols-3 gap-4">
              {room.images.slice(1, 4).map((image, index) => <div key={image} className="relative aspect-square overflow-hidden"><Image src={image} alt={`${room.name} detail ${index + 2}`} fill sizes="20vw" className="object-cover" /></div>)}
            </div>
            <p className="mt-5 text-sm italic text-flora-grey">All room photography is a swappable editorial placeholder. Replace it with final property-specific imagery before publication.</p>
          </div>
        </div>
      </section>

      <section className="botanical textured section-pad bg-flora-blush" aria-labelledby="rates-title">
        <div className="container-shell">
          <RevealSection className="max-w-3xl">
            <p className="eyebrow text-flora-terracotta">Your stay, your rhythm</p>
            <h2 id="rates-title" className="display-title mt-4 text-[clamp(3.2rem,6vw,6rem)]">Choose the rhythm of your stay</h2>
            <p className="mt-6 text-xl leading-relaxed text-flora-grey">Compare Flora's available rate plans and choose the terms that best suit your stay.</p>
          </RevealSection>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {room.rates.map((rate) => <RateCard key={rate.id} room={room} rate={rate} />)}
          </div>
        </div>
      </section>

      <section className="section-pad bg-flora-cream text-center">
        <div className="container-shell">
          <p className="eyebrow text-flora-gold">Continue exploring</p>
          <h2 className="display-title mx-auto mt-4 max-w-3xl text-[clamp(3rem,6vw,5.6rem)]">Every room carries a different shade of Florence</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {rooms.filter((item) => item.slug !== room.slug).map((item) => <Link key={item.slug} href={`/rooms/${item.slug}`} className="luxury-button border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">{item.name}</Link>)}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
