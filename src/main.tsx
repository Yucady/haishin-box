import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (
  'serviceWorker' in navigator &&
  import.meta.env.PROD
) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl =
      `${import.meta.env.BASE_URL}sw.js`

    navigator.serviceWorker
      .register(serviceWorkerUrl)
      .then((registration) => {
        console.log(
          'Service Worker가 등록되었습니다.',
          registration.scope,
        )
      })
      .catch((error) => {
        console.error(
          'Service Worker 등록에 실패했습니다.',
          error,
        )
      })
  })
}