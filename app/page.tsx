import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { FeaturedWorkers } from '@/components/home/FeaturedWorkers'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoriesSection />
        <HowItWorks />
        <FeaturedWorkers />
      </main>
      <Footer />
    </>
  )
}
