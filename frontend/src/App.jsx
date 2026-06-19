import { AuthProvider } from './app/core/context/AuthProvider'
import { AppRouter } from './app/router/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
