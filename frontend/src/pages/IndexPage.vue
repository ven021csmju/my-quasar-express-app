<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">
      Task List (Express + Prisma + Supabase)
    </div>

    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn
        color="primary"
        label="Reload Tasks"
        :loading="loading"
        @click="fetchTasks"
      />
      <span v-if="errorMessage" class="text-negative">
        {{ errorMessage }}
      </span>
    </div>

    <q-spinner v-if="loading" size="2em" />

    <div v-else>
      <div v-if="tasks.length === 0" class="text-grey">
        ยังไม่มีงานในระบบ ลองสร้างด้วย curl / Postman ก่อน
      </div>

      <q-list v-else bordered separator>
        <q-item v-for="task in tasks" :key="task.id">
          <q-item-section>
            <q-item-label>{{ task.title }}</q-item-label>
            <q-item-label caption>{{ task.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label caption>
              {{ new Date(task.createdAt).toLocaleString() }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const tasks = ref([])
const loading = ref(false)
const errorMessage = ref('')

const fetchTasks = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const res = await axios.get(`${API_URL}/api/tasks`)
    tasks.value = res.data.data   // ✅ ตรงกับ backend
  } catch (err) {
    console.error(err)
    errorMessage.value = 'โหลดงานจากฐานข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(fetchTasks)
</script>
