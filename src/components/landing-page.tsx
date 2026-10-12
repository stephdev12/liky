import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { LogosSection } from "@/components/logos-section";
import { Integrations } from "@/components/integrations";
import { ImageGallery } from "@/components/image-gallery";
import { FeatureSection } from "@/components/feature-section";
import { PricingSection } from "@/components/pricing-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Footer } from "@/components/footer";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[var(--lime)] selection:text-black">
			<Header />
			<main className="flex-1">
				<HeroSection />
				<LogosSection />
				<ImageGallery />
				<Integrations />
				<FeatureSection />
				<PricingSection />
				<TestimonialsSection />
			</main>
			<Footer />
		</div>
	);
}
