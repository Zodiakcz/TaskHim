import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireUser } from '../middleware/user'

const router = Router()
router.use(requireUser)

router.get('/', async (_req, res) => {
  const tasks = await prisma.task.findMany({
    where: { status: 'OTEVRENY' },
    include: { subtasks: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })
  res.json(tasks)
})

router.post('/', async (req, res) => {
  const { title, notes, location, effort, priority, dueDate, recurrenceInterval, recurrenceUnit, subtasks } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Název je povinný' })

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      notes: notes?.trim() || null,
      location: location || 'DOMA',
      effort: effort || 'STREDNI',
      priority: priority || 'NORMALNI',
      dueDate: dueDate ? new Date(dueDate) : null,
      recurrenceInterval: recurrenceInterval ? Number(recurrenceInterval) : null,
      recurrenceUnit: recurrenceUnit || null,
      createdBy: req.userName,
      subtasks: subtasks?.length
        ? { create: subtasks.map((text: string, i: number) => ({ text, order: i })) }
        : undefined,
    },
    include: { subtasks: { orderBy: { order: 'asc' } } },
  })
  res.status(201).json(task)
})

router.get('/:id', async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      subtasks: { orderBy: { order: 'asc' } },
      completions: { orderBy: { completedAt: 'desc' } },
    },
  })
  if (!task) return res.status(404).json({ error: 'Úkol nenalezen' })
  res.json(task)
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { title, notes, location, effort, priority, dueDate, recurrenceInterval, recurrenceUnit, subtasks } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Název je povinný' })

  await prisma.subtask.deleteMany({ where: { taskId: id } })

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: title.trim(),
      notes: notes?.trim() || null,
      location,
      effort,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      recurrenceInterval: recurrenceInterval ? Number(recurrenceInterval) : null,
      recurrenceUnit: recurrenceUnit || null,
      subtasks: subtasks?.length
        ? { create: subtasks.map((text: string, i: number) => ({ text, order: i })) }
        : undefined,
    },
    include: { subtasks: { orderBy: { order: 'asc' } } },
  })
  res.json(task)
})

router.delete('/:id', async (req, res) => {
  await prisma.task.delete({ where: { id: Number(req.params.id) } })
  res.json({ ok: true })
})

router.post('/:id/complete', async (req, res) => {
  const id = Number(req.params.id)
  const { note } = req.body

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Úkol nenalezen' })

  const now = new Date()

  if (task.recurrenceInterval && task.recurrenceUnit) {
    const newDueDate = advanceDate(now, task.recurrenceInterval, task.recurrenceUnit)
    await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: { dueDate: newDueDate, activeSince: now },
      }),
      prisma.subtask.updateMany({ where: { taskId: id }, data: { checked: false } }),
      prisma.completion.create({ data: { taskId: id, userName: req.userName, note: note?.trim() || null } }),
    ])
  } else {
    await prisma.$transaction([
      prisma.task.update({ where: { id }, data: { status: 'HOTOVY' } }),
      prisma.completion.create({ data: { taskId: id, userName: req.userName, note: note?.trim() || null } }),
    ])
  }

  res.json({ ok: true })
})

router.patch('/:id/subtasks/:subtaskId', async (req, res) => {
  const subtask = await prisma.subtask.update({
    where: { id: Number(req.params.subtaskId) },
    data: { checked: req.body.checked },
  })
  res.json(subtask)
})

function advanceDate(from: Date, interval: number, unit: string): Date {
  if (unit === 'months') {
    return new Date(from.getFullYear(), from.getMonth() + interval, from.getDate())
  }
  const days = unit === 'weeks' ? interval * 7 : interval
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
}

export default router
