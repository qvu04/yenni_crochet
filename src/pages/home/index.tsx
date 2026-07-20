import { Suspense } from "react"
import Home from "./Home"
export const HomePage = () => {
  return (
    <Suspense>
      <Home />
    </Suspense>
  )
}