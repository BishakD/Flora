import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { BlurRevealImage, ParallaxImage, RevealSection, ScrollRevealText, SectionTitleScript } from "@/components/Motion";

export const metadata: Metadata = {
  title: "The Spa",
  description: "Explore Flora's quiet wellness rituals, treatment rooms and restorative spa concept in Florence.",
};

const rituals = [
  ["01", "Flora Signature", "A whole-body ritual imagined around warm botanical oils, slow pressure and an aromatic Florence-inspired finish."],
  ["02", "Stone & Light", "A restorative treatment using gentle heat and cooling touch to release the pace of travel."],
  ["03", "Palazzo Facial", "A tailored facial ritual focused on hydration, calm and luminous skin after a day in the city."],
  ["04", "Private Pause", "An unhurried hour reserved for the spa suite, with a ritual selected together on arrival."],
];

export default function SpaPage() {
  return (
    <main id="main-content" className="mt-[var(--nav-height)]">
      <section className="relative min-h-[82svh] overflow-hidden bg-flora-blue text-flora-cream">
        <ParallaxImage src="/images/spa-04.jpg" alt="A calm luxury wellness setting, editorial placeholder for Flora Spa" className="absolute inset-0" priority />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(63,80,100,.78),rgba(63,80,100,.18),rgba(27,42,63,.45))]" />
        <div className="container-shell relative z-10 flex min-h-[82svh] items-center py-24">
          <div className="max-w-3xl">
            <p className="eyebrow text-flora-cream/72">Below the palazzo</p>
            <SectionTitleScript as="h1" className="mt-3 text-[clamp(5.8rem,15vw,12rem)]">The Spa</SectionTitleScript>
            <p className="mt-7 max-w-xl text-[clamp(1.3rem,2.3vw,2rem)] leading-relaxed text-flora-cream/88">A quiet architecture of stone, linen, warmth and time.</p>
          </div>
        </div>
      </section>

      <section className="botanical textured section-pad bg-flora-blue text-flora-cream">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow text-flora-cream/70">Wellness rituals</p>
            <h2 className="display-title mt-4 text-[clamp(3.4rem,6.7vw,6.6rem)]">Return to your own rhythm</h2>
            <ScrollRevealText dark className="mt-7 text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.75]">
              Flora’s wellness rooms are imagined as a sensory counterpoint to the city: pale mineral surfaces, warm brass sconces, folded white linen and treatments guided by how the guest arrives that day. Final treatment names, durations and practitioners remain to be confirmed.
            </ScrollRevealText>
          </div>
          <BlurRevealImage src="/images/spa-06.jpg" alt="A serene spa interior in cool blue-grey tones, editorial placeholder" className="arch-frame aspect-[0.82] w-full max-w-[600px] justify-self-end" />
        </div>
      </section>

      <section className="section-pad bg-flora-cream">
        <div className="container-shell">
          <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div className="grid grid-cols-2 gap-4">
              <BlurRevealImage src="/images/spa-02.jpg" alt="Spa pool and relaxation atmosphere, placeholder" className="col-span-2 aspect-[1.5]" />
              <BlurRevealImage src="/images/spa-01.jpg" alt="Folded towel and floral spa detail" className="aspect-[0.9]" />
              <BlurRevealImage src="/images/spa-03.jpg" alt="Hot stone wellness ritual" className="mt-16 aspect-[0.9]" />
            </div>
            <div className="lg:pb-12">
              <p className="eyebrow text-flora-gold">The material of calm</p>
              <h2 className="display-title mt-4 text-[clamp(3.2rem,5.7vw,5.8rem)]">Stone, water and attentive hands</h2>
              <ScrollRevealText className="mt-7 text-[clamp(1.2rem,1.9vw,1.6rem)] leading-[1.75]">
                Rather than an exhaustive menu, the spa begins with a short conversation. Temperature, fragrance, pressure and duration are then composed into a ritual that belongs to the moment.
              </ScrollRevealText>
            </div>
          </div>
        </div>
      </section>

      <section className="botanical section-pad bg-flora-blush">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitleScript className="text-[clamp(4.5rem,9vw,8rem)] text-flora-terracotta">Rituals</SectionTitleScript>
            <h2 className="display-title mt-4 text-[clamp(3rem,6vw,5.6rem)]">A small, thoughtful collection</h2>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden border border-flora-line bg-flora-line md:grid-cols-2">
            {rituals.map(([number, title, description]) => (
              <article key={title} className="bg-flora-ivory p-7 sm:p-10">
                <p className="eyebrow text-flora-gold">{number}</p>
                <h3 className="mt-5 font-display text-[clamp(2rem,4vw,3.5rem)] leading-none">{title}</h3>
                <p className="mt-5 text-lg leading-relaxed text-flora-grey">{description}</p>
                <p className="mt-6 font-sans text-[0.58rem] uppercase tracking-[0.11em] text-flora-terracotta">Duration and price [to confirm]</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[70svh] overflow-hidden bg-flora-navy text-flora-cream">
        <ParallaxImage src="/images/spa-08.jpg" alt="A restorative wellness moment, editorial placeholder" className="absolute inset-0" />
        <div className="absolute inset-0 bg-flora-navy/55" />
        <div className="container-shell relative z-10 flex min-h-[70svh] items-center justify-center py-24 text-center">
          <RevealSection className="max-w-3xl">
            <p className="eyebrow text-flora-gold">A private pause</p>
            <h2 className="display-title mt-4 text-[clamp(3.5rem,8vw,7rem)]">The city can wait a little longer</h2>
            <p className="mt-7 text-xl leading-relaxed text-flora-cream/82">Spa reservations are an enquiry-only prototype until the treatment catalogue and booking provider are supplied.</p>
            <Link href="/#contact" className="luxury-button mt-8 border-flora-gold text-flora-gold [--button-fill:var(--flora-gold)] [--button-ink:var(--flora-navy)]">Request a ritual</Link>
          </RevealSection>
        </div>
      </section>
      <Footer />
    </main>
  );
}
