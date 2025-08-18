"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, User, Settings, Heart, LogOut, Bell, Menu, X, Languages, Sun, Moon, Monitor } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "@/contexts/theme-context"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      case "system":
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EyeAnalyzer</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Eye Disease Detection</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {t("nav.analyzeImage")}
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {t("nav.analysisHistory")}
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {t("nav.diseaseInfo")}
            </Button>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <Heart className="w-4 h-4 mr-2" />
              {t("nav.credits")}
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  {getThemeIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className={theme === "light" ? "bg-blue-50 dark:bg-blue-900" : ""}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  {t("theme.light")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className={theme === "dark" ? "bg-blue-50 dark:bg-blue-900" : ""}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  {t("theme.dark")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className={theme === "system" ? "bg-blue-50 dark:bg-blue-900" : ""}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  {t("theme.system")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span className="text-sm font-medium">{language === "th" ? "ไทย" : "EN"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLanguage("th")}
                  className={language === "th" ? "bg-blue-50 dark:bg-blue-900" : ""}
                >
                  <span className="mr-2">🇹🇭</span>
                  ภาษาไทย
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-blue-50 dark:bg-blue-900" : ""}
                >
                  <span className="mr-2">🇺🇸</span>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                2
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{t("nav.doctor")}</p>
                    <p className="text-xs leading-none text-muted-foreground">{t("nav.email")}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("nav.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("nav.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>{t("nav.credits")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("nav.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="justify-start text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                {t("nav.analyzeImage")}
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                {t("nav.analysisHistory")}
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                {t("nav.diseaseInfo")}
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                <Heart className="w-4 h-4 mr-2" />
                {t("nav.credits")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
