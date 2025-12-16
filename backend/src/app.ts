import express from 'express'
import cors from 'cors'
import taskRoutes from './routes/task.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/tasks', taskRoutes)

app.listen(3000, () => {
  console.log('🚀 API running at http://localhost:3000')
})
