import useThemeStore from '../store/themeStore'

const useTheme = () => {
  const { isDark, toggleTheme, setDark, init } = useThemeStore()
  return { isDark, toggleTheme, setDark, init }
}

export default useTheme
