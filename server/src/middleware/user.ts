import { Request, Response, NextFunction } from 'express'

const VALID_USERS = ['Dave', 'Anna']

declare global {
  namespace Express {
    interface Request {
      userName: string
    }
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const name = req.cookies?.taskHim_user
  if (!name || !VALID_USERS.includes(name)) {
    return res.status(401).json({ error: 'Nejste přihlášeni' })
  }
  req.userName = name
  next()
}
