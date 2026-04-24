import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireUser } from '../middleware/user'

const router = Router()
router.use(requireUser)

router.get('/', async (req, res) => {
  const { user, from, to } = req.query

  const where: Record<string, unknown> = {}
  if (user) where.userName = user
  if (from || to) {
    where.completedAt = {
      ...(from ? { gte: new Date(from as string) } : {}),
      ...(to ? { lte: new Date(to as string) } : {}),
    }
  }

  const completions = await prisma.completion.findMany({
    where,
    include: { task: { select: { title: true, effort: true, location: true } } },
    orderBy: { completedAt: 'desc' },
    take: 200,
  })
  res.json(completions)
})

router.get('/stats', async (_req, res) => {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const [allTime, thisMonth, thisWeek] = await Promise.all([
    prisma.completion.findMany({ include: { task: { select: { effort: true } } } }),
    prisma.completion.findMany({
      where: { completedAt: { gte: monthStart } },
      include: { task: { select: { effort: true } } },
    }),
    prisma.completion.findMany({
      where: { completedAt: { gte: weekStart } },
      include: { task: { select: { effort: true } } },
    }),
  ])

  res.json({
    allTime: calcScores(allTime),
    thisMonth: calcScores(thisMonth),
    thisWeek: calcScores(thisWeek),
  })
})

const EFFORT_POINTS: Record<string, number> = { KRATKE: 1, STREDNI: 3, DLOUHE: 8 }

function calcScores(completions: { userName: string; task: { effort: string } }[]) {
  const scores: Record<string, { count: number; points: number }> = {}
  for (const c of completions) {
    if (!scores[c.userName]) scores[c.userName] = { count: 0, points: 0 }
    scores[c.userName].count++
    scores[c.userName].points += EFFORT_POINTS[c.task.effort] ?? 1
  }
  return scores
}

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  const result = new Date(d)
  result.setDate(d.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export default router
