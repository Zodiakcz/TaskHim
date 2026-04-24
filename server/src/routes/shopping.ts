import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireUser } from '../middleware/user'

const router = Router()
router.use(requireUser)

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

router.get('/', async (_req, res) => {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS)
  const items = await prisma.shoppingItem.findMany({
    where: {
      OR: [{ checked: false }, { checkedAt: { gt: cutoff } }],
    },
    orderBy: [{ checked: 'asc' }, { createdAt: 'asc' }],
  })
  res.json(items)
})

router.post('/', async (req, res) => {
  const { name, note } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Název je povinný' })

  const item = await prisma.shoppingItem.create({
    data: { name: name.trim(), note: note?.trim() || null, addedBy: req.userName },
  })
  res.status(201).json(item)
})

router.patch('/:id/check', async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.shoppingItem.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Položka nenalezena' })

  const item = await prisma.shoppingItem.update({
    where: { id },
    data: { checked: !existing.checked, checkedAt: !existing.checked ? new Date() : null },
  })
  res.json(item)
})

router.delete('/:id', async (req, res) => {
  await prisma.shoppingItem.delete({ where: { id: Number(req.params.id) } })
  res.json({ ok: true })
})

export default router
