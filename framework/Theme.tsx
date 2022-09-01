import { createContext, ReactNode, useContext, useState } from 'react'

export enum ThemeE {
    Light = 'light',
    Dark = 'dark',
}

function themeInit() {
    let theme = localStorage.getItem('theme') as ThemeE

    if (!theme || theme !== ThemeE.Dark) {
        theme = ThemeE.Light
    }

    if (theme === ThemeE.Dark) {
        document.documentElement.classList.add('pf-theme-dark')
    }
}
themeInit()

interface IThemeState {
    theme?: ThemeE
    setTheme?: (theme: ThemeE) => void
}
const ThemeContext = createContext<IThemeState>({})

export function ThemeProvider(props: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeE>(
        document.documentElement.classList.contains('pf-theme-dark') ? ThemeE.Dark : ThemeE.Light
    )
    function setTheme(newTheme: ThemeE) {
        switch (newTheme) {
            case ThemeE.Light:
                document.documentElement.classList.remove('pf-theme-dark')
                localStorage.removeItem('theme')
                break
            case ThemeE.Dark:
                document.documentElement.classList.add('pf-theme-dark')
                localStorage.setItem('theme', ThemeE.Dark)
                break
        }
        setThemeState(newTheme)
    }
    return <ThemeContext.Provider value={{ theme, setTheme }}>{props.children}</ThemeContext.Provider>
}

export function useTheme(): [ThemeE | undefined, ((theme: ThemeE) => void) | undefined] {
    const { theme, setTheme } = useContext(ThemeContext)
    return [theme, setTheme]
}

// export function ThemeSwitcher() {
//     const [theme, setTheme] = useTheme()
//     const toggleTheme = () => setTheme?.(theme === ThemeE.Light ? ThemeE.Dark : ThemeE.Light)
//     return <Button onClick={toggleTheme} variant="plain" icon={theme === ThemeE.Light ? <SunIcon /> : <MoonIcon />} />
// }
