import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import DemoVideo from '../components/DemoVideo'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
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
        <DemoVideo />
        <Features />
        <HowItWorks />
        <Privacy />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
