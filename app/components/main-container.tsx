import { ReactNode } from "react"

interface MainContainerProps {
  children: ReactNode
}

export function MainContainer({children} :MainContainerProps) {
  return (
    <main className="w-4/5 mx-auto my-20">
      {children}
    </main>
  )
}
