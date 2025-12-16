import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

/**
 * CREATE
 * POST /api/tasks
 */
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'กรุณาระบุ title ให้ถูกต้อง' })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
      },
    })

    res.status(201).json({ data: task })
  } catch (err) {
    console.error('CREATE TASK ERROR:', err)
    res.status(500).json({
      message: 'ไม่สามารถสร้างงานได้',
      error: String(err),
    })
  }
})

/**
 * READ ALL
 * GET /api/tasks
 */
router.get('/', async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    })

    res.json({ data: tasks })
  } catch (err) {
    console.error('READ ALL TASKS ERROR:', err)
    res.status(500).json({
      message: 'ไม่สามารถดึงรายการได้',
      error: String(err),
    })
  }
})

/**
 * READ ONE
 * GET /api/tasks/:id
 */
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'id ไม่ถูกต้อง' })
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id },
    })

    if (!task) {
      return res.status(404).json({ message: 'ไม่พบงาน' })
    }

    res.json({ data: task })
  } catch (err) {
    console.error('READ TASK ERROR:', err)
    res.status(500).json({
      message: 'ไม่สามารถดึงข้อมูลได้',
      error: String(err),
    })
  }
})

/**
 * UPDATE
 * PATCH /api/tasks/:id
 */
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { title, description } = req.body

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'id ไม่ถูกต้อง' })
  }

  if (title !== undefined && typeof title !== 'string') {
    return res.status(400).json({ message: 'title ต้องเป็น string' })
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    })

    res.json({ data: task })
  } catch (err: any) {
    console.error('UPDATE TASK ERROR:', err)

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'ไม่พบงาน' })
    }

    res.status(500).json({
      message: 'ไม่สามารถอัปเดตได้',
      error: String(err),
    })
  }
})

/**
 * DELETE
 * DELETE /api/tasks/:id
 */
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'id ไม่ถูกต้อง' })
  }

  try {
    await prisma.task.delete({
      where: { id },
    })

    res.json({ message: 'ลบงานสำเร็จ' })
  } catch (err: any) {
    console.error('DELETE TASK ERROR:', err)

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'ไม่พบงาน' })
    }

    res.status(500).json({
      message: 'ไม่สามารถลบได้',
      error: String(err),
    })
  }
})

export default router
