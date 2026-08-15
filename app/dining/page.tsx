import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { BlurRevealImage, ParallaxImage, RevealSection, ScrollRevealText, SectionTitleScript } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Dining",
  description: "Discover Flora's intimate garden restaurant, music salon and rooftop dining concept in Florence.",
};

export default function DiningPage() {
  return (
    <main id="main-content" className="mt-[var(--nav-height)]">
      <section className="relative min-h-[82svh] overflow-hidden bg-flora-navy text-flora-cream">
        <ParallaxImage src="/images/dining-03.jpg" alt="A warmly lit restaurant interior, editorial placeholder for Flora dining" className="absolute inset-0" priority />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,42,63,.76),rgba(27,42,63,.12),rgba(27,42,63,.54))]" />
        <div className="container-shell relative z-10 flex min-h-[82svh] items-center py-24">
          <div className="max-w-3xl">
            <p className="eyebrow text-flora-cream/72">Flora at the table</p>
            <SectionTitleScript as="h1" className="mt-4 text-[clamp(6rem,16vw,13rem)] text-flora-gold">Dining</SectionTitleScript>
            <p className="mt-7 max-w-xl font-body text-[clamp(1.3rem,2.3vw,2rem)] leading-relaxed text-flora-cream/88">Three distinct settings, one unhurried expression of contemporary Florence.</p>
          </div>
        </div>
      </section>

      <section className="botanical section-pad bg-flora-cream">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
          <div>
            <p className="eyebrow text-flora-terracotta">A dreamer’s experience</p>
            <h2 className="display-title mt-4 text-[clamp(3.4rem,6.5vw,6.5rem)]">A sense of place, served slowly</h2>
            <ScrollRevealText className="mt-7 text-[clamp(1.25rem,2.05vw,1.75rem)] leading-[1.75]">
              Flora’s dining collection is imagined as a sequence of moods: a garden hidden from the street, a blue salon alive with music, and a rooftop held beneath the Florentine sky. Menus, opening hours and reservation partners remain placeholders until the operating team confirms them.
            </ScrollRevealText>
          </div>
          <BlurRevealImage src="/images/dining-01.jpg" alt="An elegant table set for dinner, editorial placeholder" className="arch-frame aspect-[0.86] w-full max-w-[620px] justify-self-end" />
        </div>
      </section>

      <section className="botanical botanical-gold textured section-pad bg-flora-navy text-flora-cream">
        <div className="container-shell">
          <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-24">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow text-flora-gold">The secret garden</p>
              <SectionTitleScript className="mt-3 text-[clamp(5.2rem,11vw,9.2rem)] text-flora-gold">Segreto</SectionTitleScript>
              <h2 className="mt-4 font-display text-[clamp(2.8rem,5vw,4.6rem)] leading-none">Tuscan memory, newly composed</h2>
              <ScrollRevealText dark className="mt-7 text-[clamp(1.2rem,2vw,1.65rem)] leading-[1.75]">
                Segreto is conceived around the quiet theatre of the garden. Aromatic leaves, candlelight and refined seasonal plates meet a room of deep blue and aged brass, allowing dinner to move almost imperceptibly from day into evening.
              </ScrollRevealText>
              <a href="#dining-request" className="luxury-button mt-8 border-flora-gold text-flora-gold [--button-fill:var(--flora-gold)] [--button-ink:var(--flora-navy)]">Request a table</a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <BlurRevealImage src="/images/dining-02.jpg" alt="Dark restaurant with warm brass accents, placeholder for Segreto" className="col-span-2 aspect-[1.45]" />
              <BlurRevealImage src="/images/dining-06.jpg" alt="A cocktail poured over hand-cut ice" className="aspect-[0.8]" />
              <BlurRevealImage src="/images/dining-07.jpg" alt="A refined dining detail, editorial placeholder" className="mt-16 aspect-[0.8]" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-flora-blush">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-flora-slate">Sala della Musica</p>
            <h2 className="display-title mt-4 text-[clamp(3.5rem,7vw,6.8rem)]">The evening has a rhythm of its own</h2>
            <ScrollRevealText className="mt-7 text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.75]">
              Beyond the dining room, the music salon is imagined for aperitivi, rare spirits and intimate acoustic sets. The programme is deliberately light: a beautiful room, thoughtful sound and enough space for conversation.
            </ScrollRevealText>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
            <BlurRevealImage src="/images/dining-05.jpg" alt="A candlelit lounge, placeholder for the Sala della Musica" className="aspect-[1.45]" />
            <BlurRevealImage src="/images/dining-08.jpg" alt="A plated seasonal dish, editorial placeholder" className="aspect-[0.95]" />
          </div>
        </div>
      </section>

      <section className="relative min-h-[88svh] overflow-hidden bg-flora-navy text-flora-cream">
        <ParallaxImage src="/images/hero-palazzo.jpg" alt="Florence at night, placeholder view from Flora's rooftop" className="absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,42,63,.10),rgba(27,42,63,.72))]" />
        <div className="container-shell relative z-10 flex min-h-[88svh] items-end py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-flora-gold">On the rooftop</p>
            <SectionTitleScript className="mt-2 text-[clamp(4.7rem,11vw,9.6rem)] text-flora-gold">Sotto le Stelle</SectionTitleScript>
            <ScrollRevealText dark className="mt-6 text-[clamp(1.3rem,2.15vw,1.8rem)] leading-[1.75]">
              The final course belongs to the view. At Sotto le Stelle, a small number of tables face the city while the menu follows the light, the season and the quiet drama of Florence after dusk.
            </ScrollRevealText>
          </div>
        </div>
      </section>

      <section id="dining-request" className="botanical section-pad bg-flora-cream">
        <RevealSection className="container-shell flex flex-col items-center text-center">
          <p className="eyebrow text-flora-gold">Dining enquiries</p>
          <h2 className="display-title mt-4 max-w-4xl text-[clamp(3.3rem,7vw,6.5rem)]">Let us shape the table around your evening</h2>
          <p className="mt-7 max-w-2xl text-xl leading-relaxed text-flora-grey">Dining reservations are not live in this prototype. Use the hotel enquiry form and replace [DINING EMAIL] before launch.</p>
          <Link href="/#contact" className="luxury-button mt-8 border-flora-slate text-flora-slate [--button-fill:var(--flora-slate-blue-deep)]">Contact Flora</Link>
        </RevealSection>
      </section>
      <Footer />
    </main>
  );
}
