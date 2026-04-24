import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { requireUser } from '../middleware/user'

const router = Router()

router.post('/login', async (req, res) => {
  const { userName, password } = req.body
  if (!['Dave', 'Anna'].includes(userName) || !password) {
    return res.status(400).json({ error: 'Neplatné přihlašovací údaje' })
  }
  const config = await prisma.config.findUnique({ where: { key: 'passwordHash' } })
  if (!config || !(await bcrypt.compare(password, config.value))) {
    return res.status(401).json({ error: 'Špatné heslo' })
  }
  res.cookie('taskHim_user', userName, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
  })
  res.json({ userName })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('taskHim_user', { path: '/' })
  res.json({ ok: true })
})

router.get('/me', requireUser, (req, res) => {
  res.json({ userName: req.userName })
})

router.post('/change-password', requireUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Nové heslo musí mít alespoň 4 znaky' })
  }
  const config = await prisma.config.findUnique({ where: { key: 'passwordHash' } })
  if (!config || !(await bcrypt.compare(currentPassword, config.value))) {
    return res.status(401).json({ error: 'Špatné současné heslo' })
  }
  const hash = await bcrypt.hash(newPassword, 10)
  await prisma.config.update({ where: { key: 'passwordHash' }, data: { value: hash } })
  res.json({ ok: true })
})

export default router
