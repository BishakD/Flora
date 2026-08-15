import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Footer } from "@/components/Footer";
import { InfoRequestForm } from "@/components/Forms";
import { Hero } from "@/components/Hero";
import { BlurRevealImage, ParallaxImage, RevealSection, ScrollRevealText, SectionTitleScript } from "@/components/Motion";
import { RoomShowcase } from "@/components/Rooms";
import { services } from "@/data/hotel";
import { getRooms } from "@/lib/rooms";

export default async function HomePage() {
  await connection();
  const rooms = await getRooms();

  return (
    <main id="main-content">
      <Hero poster="/images/hero-palazzo.jpg" videoSrc="/hero.mp4" />

      <div className="relative z-10">
      <section id="palace" className="botanical florence-art bg-flora-cream pb-28 pt-48 md:pb-44 md:pt-56">
        <div className="container-shell">
          <RevealSection>
            <p className="mx-auto max-w-[820px] text-center font-display text-[clamp(1.8rem,3.7vw,3.35rem)] uppercase leading-[1.13] tracking-[0.012em]">
              Flora is a luxury boutique palazzo in the historic heart of Florence, created to offer a truly personal experience.
            </p>
          </RevealSection>

          <div className="mt-28 grid items-end gap-12 md:mt-40 md:grid-cols-[0.95fr_1.05fr] md:gap-16">
            <div>
              <SectionTitleScript className="relative z-10 mb-[-0.12em] text-center text-[clamp(4.8rem,10vw,8rem)] md:text-left">Welcome</SectionTitleScript>
              <BlurRevealImage src="/images/room-05.jpg" alt="A refined suite with draped windows and a chaise, an editorial placeholder for Flora" className="arch-frame mx-auto aspect-[0.76] w-[min(100%,390px)]" imageClassName="object-[55%_center]" />
            </div>
            <div className="pb-5 md:pb-12">
              <p className="eyebrow text-flora-slate">A palazzo with a noble soul</p>
              <ScrollRevealText className="mt-6 max-w-xl text-[clamp(1.2rem,1.9vw,1.55rem)] leading-[1.72]">
                Flora was born in Florence, set in a historical context with timeless charm. Every room, salon and ritual creates a quiet dialogue between past and present: romantic in spirit, contemporary in comfort, and always deeply personal.
              </ScrollRevealText>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-flora-cream pb-32 md:pb-48" aria-labelledby="location-title">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:gap-20">
          <div className="lg:order-2">
            <BlurRevealImage src="/images/florence-rooftops.jpg" alt="Florentine rooftops and historic architecture, placeholder location photography" className="aspect-[0.92]" imageClassName="object-center" />
          </div>
          <div className="lg:order-1">
            <p className="eyebrow text-flora-gold">At the centre of Florence</p>
            <h2 id="location-title" className="mt-5 max-w-xl font-display text-[clamp(2.9rem,5.8vw,5.5rem)] leading-[0.98]">The city, held close.</h2>
            <ScrollRevealText className="mt-8 max-w-xl text-[clamp(1.15rem,1.85vw,1.5rem)] leading-[1.75]">
              From [FLORA PALAZZO ADDRESS], the Duomo, Uffizi and the ateliers of Via de’ Tornabuoni are intended to unfold on foot. Final walking times, airport transfers and rail connections will be published when the hotel address and partners are confirmed.
            </ScrollRevealText>
            <a href="#contact" className="luxury-button mt-9 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Plan your arrival</a>
          </div>
        </div>
      </section>

      <section id="rooms" className="botanical botanical-emphasis textured bg-flora-blush py-28 md:py-44">
        <div className="container-shell">
          <SectionTitleScript className="mx-auto max-w-max text-center text-[clamp(4.4rem,9vw,8rem)]">Rooms and Suites</SectionTitleScript>

          <div className="mt-16 grid items-center gap-12 md:mt-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <BlurRevealImage src="/images/room-01.jpg" alt="A Flora guest room with fresco-inspired colour and collected furniture" className="arch-frame mx-auto aspect-[0.76] w-[min(100%,390px)]" />
            <div>
              <p className="eyebrow text-flora-terracotta">Original character, quietly reinterpreted</p>
              <ScrollRevealText className="mt-6 max-w-xl text-[clamp(1.18rem,1.9vw,1.5rem)] leading-[1.76]">
                Every room at Flora is imagined around delicate historic detail, fine fabrics and a sense of collected calm. Each category carries a distinct mood while preserving the intimacy of a private Florentine residence, with exact room facts and photography ready to be replaced by the final property survey.
              </ScrollRevealText>
            </div>
          </div>

          <div className="mt-24 md:mt-36">
            <BlurRevealImage src="/images/room-09.jpg" alt="An ornate palazzo passage, editorial hospitality placeholder" className="aspect-[1.78] w-full" imageClassName="object-[center_46%]" />
            <RevealSection className="py-12 text-center md:py-16">
              <p className="eyebrow text-flora-slate">The art of receiving</p>
              <h2 className="mx-auto mt-4 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.02]">An authentic hospitality experience</h2>
            </RevealSection>
          </div>

          <RoomShowcase rooms={rooms} />
        </div>
      </section>

      <div className="relative bg-flora-navy">
        <section className="sticky top-[var(--nav-height)] h-[74svh] overflow-hidden bg-flora-navy" aria-label="Florence rooftop at dusk">
          <div className="relative size-full">
            <Image src="/images/duomo-sunset.jpg" alt="Florence Cathedral above the city at dusk, rooftop dining placeholder" fill sizes="100vw" className="object-cover object-[58%_center]" />
            <div className="absolute inset-0 bg-flora-navy/12" />
          </div>
        </section>

        <section id="dining" className="botanical florence-art textured relative z-10 bg-flora-ice py-28 md:py-44">
          <div className="container-shell">
          <SectionTitleScript className="script-no-swash mx-auto max-w-max text-center text-[clamp(5rem,10vw,8.5rem)]">Dining</SectionTitleScript>
          <div className="mt-12 grid items-center gap-12 md:mt-16 md:grid-cols-[0.92fr_1.08fr] md:gap-16">
            <BlurRevealImage src="/images/dining-02.jpg" alt="A blue-toned restaurant salon, placeholder for Flora dining" className="arch-frame mx-auto aspect-[0.76] w-[min(100%,390px)]" />
            <div>
              <p className="eyebrow text-flora-slate">A dreamer’s experience</p>
              <ScrollRevealText className="mt-6 max-w-xl text-[clamp(1.2rem,1.95vw,1.55rem)] leading-[1.75]">
                A refined multisensory journey through a collection of distinctive dining venues, united by one quiet thread: Florence at the table, interpreted with imagination, season and an instinct for beauty.
              </ScrollRevealText>
              <Link href="/dining" className="luxury-button mt-9 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Explore dining</Link>
            </div>
          </div>

          <div className="pt-32 md:pt-48">
            <h2 className="text-center font-display text-[clamp(4.2rem,10vw,8.2rem)] uppercase leading-none tracking-[0.01em] text-flora-gold">Segreto</h2>
            <div className="mt-14 grid items-center gap-10 md:grid-cols-[0.95fr_1.05fr] md:gap-16">
              <BlurRevealImage src="/images/dining-03.jpg" alt="An intimate restaurant interior with blue seating" className="aspect-[1.42]" />
              <div>
                <p className="eyebrow text-flora-slate">Segreto restaurant</p>
                <ScrollRevealText className="mt-5 text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.74]">
                  Behind the palazzo, Segreto is imagined as an intimate garden restaurant of candlelight, aromatic leaves and contemporary Tuscan plates. Indoors, the Sala della Musica carries the evening into a blue-toned salon for aperitivi and quiet acoustic moments.
                </ScrollRevealText>
              </div>
            </div>
            <div className="mt-16 grid gap-5 md:grid-cols-[0.82fr_1.18fr] md:items-start">
              <BlurRevealImage src="/images/dining-06.jpg" alt="A candlelit dining detail" className="aspect-[1.05] md:mt-20" />
              <BlurRevealImage src="/images/dining-07.jpg" alt="An elegant restaurant table and lounge detail" className="aspect-[1.42]" />
            </div>
          </div>

          <div className="pt-32 md:pt-48">
            <div className="relative mx-auto max-w-[880px] pt-16">
              <SectionTitleScript className="script-no-swash absolute left-1/2 top-0 z-10 w-full -translate-x-1/2 text-center text-[clamp(4.1rem,8vw,7rem)] text-flora-gold">Sotto le Stelle</SectionTitleScript>
              <BlurRevealImage src="/images/florence-dusk.jpg" alt="Florence at blue hour, rooftop restaurant placeholder" className="aspect-[1.58]" />
            </div>
            <div className="mx-auto mt-14 max-w-2xl text-center">
              <p className="eyebrow text-flora-slate">Dining above Florence</p>
              <ScrollRevealText className="mt-5 text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.75]">
                Above the roofs, dinner gathers around the silhouette of Florence. Lanterns glow, glasses catch the last light, and the city becomes part of every course.
              </ScrollRevealText>
            </div>
          </div>
          </div>
        </section>
      </div>

      <section className="bg-flora-sage px-4 pt-4 md:px-8 md:pt-8" aria-label="Flora spa treatment room">
        <BlurRevealImage src="/images/spa-05.jpg" alt="Botanical oils and candlelight prepared for a Flora wellness ritual" className="mx-auto aspect-[2.08] max-w-[1400px]" imageClassName="object-[center_58%]" />
      </section>

      <section id="spa" className="botanical florence-art textured bg-flora-sage py-28 md:py-44">
        <div className="container-shell">
          <SectionTitleScript className="script-no-swash mx-auto max-w-max text-center text-[clamp(4.8rem,10vw,8.2rem)]">The Spa</SectionTitleScript>
          <div className="mt-14 grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <BlurRevealImage src="/images/spa-palazzo.jpg" alt="A softly illuminated arched treatment room in pale mineral plaster" className="arch-frame mx-auto aspect-[0.76] w-[min(100%,390px)]" />
            <div>
              <p className="eyebrow text-flora-slate">Wellness rituals</p>
              <ScrollRevealText className="mt-6 max-w-xl text-[clamp(1.2rem,1.95vw,1.55rem)] leading-[1.75]">
                Through meticulous attention to touch, scent and material, Flora’s spa is conceived as an immersive pause: pale stone, warm brass, folded linen and rituals shaped around the rhythm of each guest.
              </ScrollRevealText>
              <Link href="/spa" className="luxury-button mt-9 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Discover the spa</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="botanical florence-art bg-flora-cream py-28 md:py-44">
        <div className="container-shell">
          <SectionTitleScript className="script-no-swash mx-auto max-w-max text-center text-[clamp(3.9rem,8vw,7rem)]">Experiential Hotel</SectionTitleScript>
          <ParallaxImage src="/images/ponte-vecchio.jpg" alt="The Arno and Ponte Vecchio at golden hour" className="mt-10 aspect-[1.55] md:mt-14" />
          <div className="mx-auto mt-14 max-w-2xl text-center">
            <p className="eyebrow text-flora-gold">Florence, personally arranged</p>
            <ScrollRevealText className="mt-5 text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.75]">
              Flora opens the city through encounters chosen for curiosity rather than checklist travel: private atelier visits, early museum access, market mornings, garden walks and tables that rarely appear in guidebooks.
            </ScrollRevealText>
          </div>
        </div>
      </section>

      <section className="border-y border-flora-line bg-flora-cream pb-32 md:pb-44" aria-labelledby="services-title">
        <div className="container-shell">
          <p className="eyebrow text-flora-gold">Beyond the room</p>
          <h2 id="services-title" className="mt-4 font-display text-[clamp(3rem,6vw,5.8rem)] leading-none">Exclusive services</h2>
          <ul className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => <li key={service} className="border-t border-flora-line pt-5"><span className="font-sans text-[0.52rem] tracking-[0.15em] text-flora-gold">0{index + 1}</span><p className="mt-3 text-base leading-relaxed">{service}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="botanical botanical-emphasis bg-flora-cream px-4 py-28 md:py-40"><InfoRequestForm /></section>
      <Footer />
      </div>
    </main>
  );
}
