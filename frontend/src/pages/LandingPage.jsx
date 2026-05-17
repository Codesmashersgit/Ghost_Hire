import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Reviews from '../components/Reviews'
import Privacy from '../components/Privacy'
import Pricing from '../components/Pricing'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Reviews />
        <Privacy />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
