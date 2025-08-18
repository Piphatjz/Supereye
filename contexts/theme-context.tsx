"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      let newActualTheme: "light" | "dark"

      if (theme === "system") {
        newActualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      } else {
        newActualTheme = theme
      }

      setActualTheme(newActualTheme)

      // Update document class
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newActualTheme)

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", newActualTheme === "dark" ? "#1f2937" : "#ffffff")
      }
    }

    updateTheme()

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", updateTheme)
      return () => mediaQuery.removeEventListener("change", updateTheme)
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
