<template>
  <v-card>
    <v-container>
      <v-card-title class="text-h4 primary--text">
        Department Management
      </v-card-title>
      
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            label="Search Department"
            outlined
            v-model="search"
            @input="handleSearch"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="text-right">
          <v-btn color="primary" @click="showModal = true">
            Add Department
          </v-btn>
        </v-col>
      </v-row>

      <v-dialog v-model="showModal" max-width="800">
        <v-card>
          <v-card-title>
            {{ editingId ? 'Edit Department' : 'Add Department' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="formData.department_name"
                label="Department Name"
                required
                outlined
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="formData.description"
                label="Description"
                required
                outlined
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="formData.manager"
                label="Manager"
                required
                outlined
                class="mb-4"
              ></v-text-field>
              
              <v-btn type="submit" color="primary" class="mr-2">
                {{ editingId ? 'Update' : 'Add' }}
              </v-btn>
              <v-btn @click="handleCloseModal">
                Cancel
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-data-table
        :headers="headers"
        :items="filteredDepartments"
        :page.sync="page"
        :items-per-page="rowsPerPage"
        :server-items-length="filteredDepartments.length"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn
            color="primary"
            small
            class="mr-2"
            @click="handleEdit(item)"
          >
            Edit
          </v-btn>
          <v-btn
            color="error"
            small
            @click="handleDelete(item.id)"
          >
            Delete
          </v-btn>
        </template>
      </v-data-table>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { createDepartment, updateDepartment, fetchDepartment, deleteDepartment } from '../api'



const departments = ref<Department[]>([])
const formData = ref<DeptFormData>({
  department_name: '',
  description: '',
  manager: ''
})
const editingId = ref<number | null>(null)
const showModal = ref(false)
const page = ref(1)
const rowsPerPage = ref(5)
const search = ref('')

const headers = [
  { text: 'Name', value: 'department_name' },
  { text: 'Description', value: 'description' },
  { text: 'Manager', value: 'manager' },
  { text: 'Actions', value: 'actions', sortable: false }
]

import type { Department, DeptFormData } from '../models'

// Check if the screen width is less than 1000px
// const isSmallScreen = useMediaQuery('(max-width:1450px)')



onMounted(() => {
  fetchDepartments()
})

const fetchDepartments = async () => {
    try {
        const data = await fetchDepartment()
        departments.value = data || []
    } catch (error) {
        console.error('Error fetching departments:', error)
    }
  
}

const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const { name, value } = target
  formData.value = {
    ...formData.value,
    [name]: value
  }
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  try {
    if (editingId.value !== null) {
      await updateDepartment(editingId.value, formData.value)
    } else {
      await createDepartment(formData.value)
    }
    fetchDepartments()
    handleCloseModal()
  } catch (error) {
    console.error('Error saving employee:', error)
  }
}

const handleEdit = (dept: Department) => {
  editingId.value = dept.id
  formData.value = { ...dept }
  showModal.value = true
}

const handleDelete = async (id: number) => {
  await deleteDepartment(id)
  departments.value = departments.value.filter((dept) => dept.id !== id)
  fetchDepartments()
}

const handleCloseModal = () => {
  editingId.value = null
  formData.value = {
    department_name: '',
    description: '',
    manager: ''
  }
  showModal.value = false
}

const handleChangePage = (newPage: number) => {
  page.value = newPage
}

const handleChangeRowsPerPage = (event: Event) => {
  const target = event.target as HTMLInputElement
  rowsPerPage.value = parseInt(target.value, 10)
  page.value = 0
}

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  page.value = 0
  search.value = target.value
}

const filteredDepartments = computed(() => {
  return departments.value.filter((dept) =>
    dept.department_name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const paginatedDepartments = computed(() => {
  return filteredDepartments.value.slice(
    page.value * rowsPerPage.value,
    page.value * rowsPerPage.value + rowsPerPage.value
  )
})
</script>