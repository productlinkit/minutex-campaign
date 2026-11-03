import { usePath } from './lib/router'
import Navbar from './components/Navbar'
import RecallSection from './components/RecallSection'
import CheckoutPage from './pages/CheckoutPage'

export default function App() {
  const path = usePath()
  if (path === '/checkout') return <CheckoutPage />
  return (
    <>
      <Navbar />
      <RecallSection />
    </>
  )
}
