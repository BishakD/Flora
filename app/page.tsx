import Link from "next/link";
import { Footer } from "@/components/Footer";
import { InfoRequestForm } from "@/components/Forms";
import { Hero } from "@/components/Hero";
import { BlurRevealImage, ParallaxImage, RevealSection, ScrollRevealText, SectionTitleScript } from "@/components/Motion";
import { RoomShowcase } from "@/components/Rooms";
import { rooms, services } from "@/data/hotel";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero poster="/images/hero-palazzo.jpg" videoSrc="/hero.mp4" />

      <section id="palace" className="botanical section-pad bg-flora-cream pt-44 md:pt-52">
        <div className="container-shell">
          <RevealSection>
            <p className="mx-auto max-w-4xl text-center font-display text-[clamp(2rem,4.6vw,4.4rem)] uppercase leading-[1.06] tracking-[-0.02em]">
              Flora is a boutique palazzo imagined in the historic heart of Florence, created for an entirely personal way of staying.
            </p>
          </RevealSection>

          <div className="mt-24 grid items-center gap-12 md:mt-36 md:grid-cols-[0.88fr_1.12fr] md:gap-20">
            <div>
              <SectionTitleScript className="relative z-10 mb-[-0.16em] text-center text-[clamp(4.5rem,10vw,8.5rem)] text-flora-slate md:text-left">Welcome</SectionTitleScript>
              <BlurRevealImage src="/images/room-05.jpg" alt="A softly lit suite with draped windows and a chaise, an editorial placeholder for Flora" className="arch-frame mx-auto aspect-[0.78] w-[min(100%,460px)]" imageClassName="object-[55%_center]" />
            </div>
            <div className="md:pt-28">
              <p className="eyebrow text-flora-slate">A palazzo with a noble soul</p>
              <ScrollRevealText className="mt-6 max-w-xl text-[clamp(1.35rem,2.25vw,2rem)] leading-[1.72]">
                Flora was born in Florence, set in a historical context with timeless charm. Its rooms, salons and rituals are conceived as a gentle dialogue between past and present: romantic in spirit, contemporary in comfort, and always deeply personal.
              </ScrollRevealText>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-flora-cream" aria-labelledby="location-title">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.16fr_0.84fr] lg:gap-24">
          <BlurRevealImage src="/images/florence-rooftops.jpg" alt="Florence rooftops seen from above, placeholder location photography" className="aspect-[1.18]" imageClassName="object-center" />
          <div>
            <p className="eyebrow text-flora-gold">At the centre of Florence</p>
            <h2 id="location-title" className="display-title mt-4 text-[clamp(3.2rem,6vw,6.4rem)]">A city held close</h2>
            <ScrollRevealText className="mt-7 text-[clamp(1.2rem,2vw,1.7rem)] leading-[1.72]">
              From [FLORA PALAZZO ADDRESS], the Duomo, Uffizi and the ateliers of Via de’ Tornabuoni are intended to unfold on foot. Final walking times, airport transfers and Santa Maria Novella rail access will be published when the hotel address and transport partners are confirmed.
            </ScrollRevealText>
            <a href="#contact" className="luxury-button mt-8 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Plan your arrival</a>
          </div>
        </div>
      </section>

      <section id="rooms" className="botanical textured section-pad bg-flora-blush">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitleScript className="text-[clamp(4.1rem,10vw,8.7rem)] text-flora-espresso">Rooms and Suites</SectionTitleScript>
            <p className="eyebrow mt-8 text-flora-slate">Original character, quietly reinterpreted</p>
            <ScrollRevealText className="mt-6 text-[clamp(1.3rem,2.25vw,1.9rem)] leading-[1.72]">
              Every room at Flora is imagined around delicate historic detail, expressive fabrics and a sense of collected calm. Each category carries a distinct mood while preserving the intimacy of a private Florentine residence.
            </ScrollRevealText>
          </div>

          <div className="mt-24 grid items-end gap-8 md:mt-32 md:grid-cols-[0.72fr_1.28fr]">
            <div className="md:pb-14">
              <p className="eyebrow text-flora-terracotta">The art of receiving</p>
              <h2 className="display-title mt-4 text-[clamp(3.2rem,6.5vw,6.3rem)]">An authentic hospitality experience</h2>
              <ScrollRevealText className="mt-7 text-[clamp(1.15rem,2vw,1.55rem)] leading-[1.75]">
                The most memorable luxury is often almost invisible: a room prepared precisely, a recommendation offered at the right moment, and a place that seems to understand how you want to feel.
              </ScrollRevealText>
            </div>
            <BlurRevealImage src="/images/room-04.jpg" alt="An airy garden salon with chandelier and trees, editorial hospitality placeholder" className="aspect-[1.14]" />
          </div>

          <div className="mt-24 md:mt-36">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="eyebrow text-flora-slate">Four ways to stay</p>
                <h2 className="mt-3 font-display text-[clamp(2.8rem,5.5vw,5rem)] leading-none">Find your room</h2>
              </div>
              <p className="max-w-md text-lg leading-relaxed text-flora-grey">Browse the image sets, open a quick-view overlay, or continue to the full room detail and illustrative rate presentation.</p>
            </div>
            <RoomShowcase rooms={rooms} />
          </div>
        </div>
      </section>

      <section className="relative min-h-[82svh] overflow-hidden bg-flora-navy text-flora-cream">
        <ParallaxImage src="/images/duomo-sunset.jpg" alt="Florence Cathedral above the city, editorial placeholder for rooftop dining" className="absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,42,63,0.80),rgba(27,42,63,0.18),rgba(27,42,63,0.52))]" />
        <div className="container-shell relative z-10 flex min-h-[82svh] items-center py-24">
          <div className="max-w-2xl">
            <SectionTitleScript className="text-[clamp(5rem,13vw,11rem)] text-flora-gold">Dining</SectionTitleScript>
            <p className="eyebrow mt-6 text-flora-cream/70">A dreamer’s experience</p>
            <ScrollRevealText dark className="mt-6 text-[clamp(1.35rem,2.35vw,2.05rem)] leading-[1.72]">
              A refined multisensory journey through a collection of distinctive dining venues, united by one quiet thread: Florence at the table, interpreted with imagination, season and an instinct for beauty.
            </ScrollRevealText>
            <Link href="/dining" className="luxury-button mt-8 border-flora-gold text-flora-gold [--button-fill:var(--flora-gold)] [--button-ink:var(--flora-navy)]">Explore dining</Link>
          </div>
        </div>
      </section>

      <section className="botanical botanical-gold textured section-pad bg-flora-navy text-flora-cream">
        <div className="container-shell">
          <div className="grid items-center gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
            <div>
              <p className="eyebrow text-flora-gold">Garden dining · Salon evenings</p>
              <SectionTitleScript className="mt-3 text-[clamp(4.5rem,9vw,8rem)] text-flora-gold">Segreto</SectionTitleScript>
              <ScrollRevealText dark className="mt-7 max-w-lg text-[clamp(1.2rem,2vw,1.65rem)] leading-[1.72]">
                Behind the palazzo, Segreto is imagined as an intimate garden restaurant of candlelight, aromatic leaves and contemporary Tuscan plates. Indoors, the Sala della Musica carries the evening into a blue-toned salon for aperitivi and live acoustic moments.
              </ScrollRevealText>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <BlurRevealImage src="/images/dining-02.jpg" alt="A dark, gold-accented restaurant interior, placeholder for Segreto" className="col-span-2 aspect-[1.65]" />
              <BlurRevealImage src="/images/dining-06.jpg" alt="A golden cocktail being poured, dining detail placeholder" className="aspect-[0.9]" />
              <BlurRevealImage src="/images/dining-07.jpg" alt="A warmly lit dining detail, editorial placeholder" className="aspect-[0.9]" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-[78svh] overflow-hidden bg-flora-navy text-flora-cream">
        <ParallaxImage src="/images/hero-palazzo.jpg" alt="Florence illuminated under a deep blue sky, placeholder for the rooftop under the stars" className="absolute inset-0" imageClassName="object-[45%_center]" />
        <div className="absolute inset-0 bg-flora-navy/48" />
        <div className="container-shell relative z-10 flex min-h-[78svh] items-end justify-end py-24 text-right">
          <div className="max-w-xl">
            <SectionTitleScript className="text-[clamp(4.5rem,10vw,8.8rem)] text-flora-gold">Sotto le Stelle</SectionTitleScript>
            <ScrollRevealText dark className="mt-6 text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.72]">
              Above the roofs, dinner gathers around the silhouette of Florence. Lanterns glow, glasses catch the last light, and the city becomes part of every course.
            </ScrollRevealText>
          </div>
        </div>
      </section>

      <section id="spa" className="botanical textured section-pad bg-flora-blue text-flora-cream">
        <div className="container-shell">
          <div className="grid items-center gap-12 md:grid-cols-[0.92fr_1.08fr] md:gap-20">
            <div>
              <SectionTitleScript className="text-[clamp(5rem,11vw,9.5rem)]">The Spa</SectionTitleScript>
              <BlurRevealImage src="/images/spa-04.jpg" alt="A serene wellness interior, editorial placeholder for Flora Spa" className="arch-frame mt-4 aspect-[0.78] w-full max-w-[480px]" />
            </div>
            <div>
              <p className="eyebrow text-flora-cream/70">Wellness rituals</p>
              <h2 className="display-title mt-4 text-[clamp(3rem,6vw,5.6rem)]">Time returns to the body</h2>
              <ScrollRevealText dark className="mt-7 text-[clamp(1.3rem,2.25vw,1.9rem)] leading-[1.72]">
                Through meticulous attention to touch, scent and material, Flora’s spa is conceived as an immersive pause: pale stone, warm brass, folded linen and rituals shaped around the rhythm of each guest.
              </ScrollRevealText>
              <Link href="/spa" className="luxury-button mt-8 border-flora-cream text-flora-cream [--button-fill:var(--flora-cream)] [--button-ink:var(--flora-slate-blue-deep)]">Discover the spa</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="botanical section-pad bg-flora-cream">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.16fr_0.84fr] lg:gap-24">
          <ParallaxImage src="/images/ponte-vecchio.jpg" alt="A Florence city view, editorial placeholder for curated experiences" className="aspect-[1.15]" />
          <div>
            <SectionTitleScript className="text-[clamp(4rem,8.5vw,7.4rem)] text-flora-terracotta">Experiential</SectionTitleScript>
            <h2 className="display-title mt-4 text-[clamp(3rem,5vw,5rem)]">Florence, personally arranged</h2>
            <ScrollRevealText className="mt-7 text-[clamp(1.2rem,2vw,1.65rem)] leading-[1.72]">
              Flora opens the city through encounters chosen for curiosity rather than checklist travel: private atelier visits, early museum access, market mornings, garden walks and tables that rarely appear in guidebooks.
            </ScrollRevealText>
            <a href="#contact" className="luxury-button mt-8 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Ask the concierge</a>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-flora-line bg-flora-cream" aria-labelledby="services-title">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="eyebrow text-flora-gold">Beyond the room</p>
            <h2 id="services-title" className="display-title mt-4 text-[clamp(3.4rem,6vw,6rem)]">Exclusive services</h2>
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {services.map((service, index) => (
              <li key={service} className="flex gap-4 border-b border-flora-line py-5">
                <span className="font-sans text-[0.58rem] tracking-[0.1em] text-flora-gold">0{index + 1}</span>
                <span className="text-lg leading-relaxed">{service}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="botanical textured section-pad bg-flora-blush px-4">
        <InfoRequestForm />
      </section>

      <Footer />
    </main>
  );
}
