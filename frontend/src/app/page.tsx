import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CodeExample } from '@/components/landing/CodeExample';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <CodeExample />
      <Pricing />
      <Footer />
    </main>
  );
}
