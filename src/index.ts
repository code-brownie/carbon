import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { serve } from '@hono/node-server'

const app = new Hono()
const prisma = new PrismaClient()


app.get('/students', async (c) => {
  const students = await prisma.student.findMany()
  return c.json(students)
})

app.get('/students/enriched', async (c) => {
  const students = await prisma.student.findMany({
    include: { proctor: true }
  })
  return c.json(students)
})


app.get('/professors', async (c) => {
  const professors = await prisma.professor.findMany()
  return c.json(professors)
})


app.post('/students', async (c) => {
  const data = await c.req.json()
  try {
    const student = await prisma.student.create({ data })
    return c.json(student, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return c.text('Aadhar number exists', 409)
    return c.text('Error', 500)
  }
})


app.post('/professors', async (c) => {
  const data = await c.req.json()
  try {
    const professor = await prisma.professor.create({ data })
    return c.json(professor, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return c.text('Aadhar number exists', 409)
    return c.text('Error', 500)
  }
})


app.get('/professors/:professorId/proctorships', async (c) => {
  const { professorId } = c.req.param()
  const students = await prisma.student.findMany({
    where: { proctorId: professorId }
  })
  return c.json(students)
})


app.patch('/students/:studentId', async (c) => {
  const { studentId } = c.req.param()
  const data = await c.req.json()
  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data
    })
    return c.json(student)
  } catch (e: any) {
    if (e.code === 'P2025') return c.notFound()
    return c.text('Error', 500)
  }
})

app.patch('/professors/:professorId', async (c) => {
  const { professorId } = c.req.param()
  const data = await c.req.json()
  try {
    const professor = await prisma.professor.update({
      where: { id: professorId },
      data
    })
    return c.json(professor)
  } catch (e: any) {
    if (e.code === 'P2025') return c.notFound()
    return c.text('Error', 500)
  }
})


app.delete('/students/:studentId', async (c) => {
  const { studentId } = c.req.param()
  try {
    await prisma.student.delete({ where: { id: studentId } })
    return c.text('Deleted', 200)
  } catch (e: any) {
    if (e.code === 'P2025') return c.notFound()
    return c.text('Error', 500)
  }
})

app.delete('/professors/:professorId', async (c) => {
  const { professorId } = c.req.param()
  try {
    await prisma.professor.delete({ where: { id: professorId } })
    return c.text('Deleted', 200)
  } catch (e: any) {
    if (e.code === 'P2025') return c.notFound()
    return c.text('Error', 500)
  }
})


app.post('/professors/:professorId/proctorships', async (c) => {
  const { professorId } = c.req.param()
  const { studentId } = await c.req.json()

  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { proctorId: professorId }
    })
    return c.json(student)
  } catch (e: any) {
    if (e.code === 'P2025') return c.notFound()
    return c.text('Error', 500)
  }
})


app.get('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param()
  const membership = await prisma.libraryMembership.findUnique({
    where: { studentId }
  })
  return membership ? c.json(membership) : c.notFound()
})


app.post('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param()
  const data = await c.req.json()

  try {
    const membership = await prisma.libraryMembership.create({
      data: { ...data, studentId }
    })
    return c.json(membership, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return c.text('Membership exists', 409)
    return c.text('Error', 500)
  }
})


app.patch('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param()
  const data = await c.req.json()

  try {
    const membership = await prisma.libraryMembership.update({
      where: { studentId },
      data
    })
    return c.json(membership)
  } catch (e: any) {
    if (e.code === 'P2025') return c.notFound()
    return c.text('Error', 500)
  }
})


app.delete('/students/:studentId/library-membership', async (c) => {
  const { studentId } = c.req.param()

  try {
    await prisma.libraryMembership.delete({ where: { studentId } })
    return c.json('Deleted', 200)
  } catch (e: any) {
    if (e.code === 'P2025') return c.notFound()
    return c.text('Error', 500)
  }
})

serve(app);
console.log("server is running on port 3000");