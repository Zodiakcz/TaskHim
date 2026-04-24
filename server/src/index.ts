import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import taskRoutes from './routes/tasks'
import completionRoutes from './routes/completions'
import shoppingRoutes from './routes/shopping'

const app = express()
const PORT = Number(process.env.PORT) || 3000
const isProd = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)
app.use(helmet())
app.use(rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }))
app.use(cors({ origin: isProd ? false : 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.use('/api/tasks', taskRoutes)
app.use('/api/completions', completionRoutes)
app.use('/api/shopping', shoppingRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: 'Interní chyba serveru' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TaskHim server běží na portu ${PORT}`)
})
