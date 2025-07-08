<template>
  <div class="container">
    <h2 class="title">Project Management</h2>
    <div class="button-row">
      <SearchBox :modelValue="searchTerm" @update:modelValue="handleSearchChange" />
      <button class="btn" @click="handleOpenModal()">Add Project</button>
    </div>

    <div v-if="isMobileView">
      <ul class="list">
        <li v-for="project in filteredProjects" :key="project.id" class="list-item">
          <strong>Project ID:</strong> {{ project.id }} <br />
          <strong>Project Name:</strong> {{ project.project_name }} <br />
          <strong>Manager:</strong> {{ project.manager }} <br />
          <strong>Description:</strong> {{ project.description }} <br />
          <strong>Status:</strong> {{ project.status }} <br />
          <button class="btn" @click="handleOpenModal(project)">Edit</button>
          <button class="delete-btn" @click="handleDelete(project)">Delete</button>
        </li>
      </ul>
    </div>

    <table v-else class="table">
      <thead>
        <tr>
          <th class="th">Code</th>
          <th class="th">Project Name</th>
          <th class="th">Manager</th>
          <th class="th">Description</th>
          <th class="th">Status</th>
          <th class="th">Edit</th>
          <th class="th">Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in filteredProjects" :key="project.id">
          <td class="td">{{ project.id }}</td>
          <td class="td">{{ project.project_name }}</td>
          <td class="td">{{ project.manager }}</td>
          <td class="td">{{ project.description }}</td>
          <td class="td">{{ project.status }}</td>
          <td class="td">
            <button class="btn" @click="handleOpenModal(project)">Edit</button>
          </td>
          <td class="td">
            <button class="delete-btn" @click="handleDelete(project)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <Modal :show="isModalOpen" @close="handleCloseModal">
      <form class="form" @submit.prevent="handleSubmit">
        <div>
          <label for="project_name">Project Name</label>
          <input
            id="project_name"
            type="text"
            v-model="formData.project_name"
            placeholder="Project Name"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="manager">Manager</label>
          <input
            id="manager"
            type="text"
            v-model="formData.manager"
            placeholder="Manager"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="description">Description</label>
          <input
            id="description"
            type="text"
            v-model="formData.description"
            placeholder="Description"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="status">Status</label>
          <input
            id="status"
            type="text"
            v-model="formData.status"
            placeholder="Status"
            autocomplete="off"
            class="input"
          />
        </div>

        <button type="submit" class="btn">Save Project</button>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Project } from '../models'
import { createProject, deleteProject, fetchProjects, updateProject } from '../api'
import SearchBox from '../components/SearchBox.vue'
import Modal from '../components/Modal.vue'

const projects = ref<Project[]>([])
const formData = ref({
  id: null as number | null,
  project_name: "",
  manager: "",
  description: "",
  status: ""
})
const editingCode = ref<number | null>(null)
const isMobileView = ref(window.innerWidth < 1000)
const isModalOpen = ref(false)
const searchTerm = ref("")

const fetchProjectsData = async () => {
  try {
    const data = await fetchProjects()
    projects.value = data || []
  } catch (error) {
    console.error("Error fetching projects:", error)
  }
}

onMounted(() => {
  fetchProjectsData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.body.classList.remove("no-scroll")
})

const handleResize = () => {
  isMobileView.value = window.innerWidth < 1000
}

const handleSearchChange = (value: string) => {
  searchTerm.value = value.toLowerCase()
}

const handleOpenModal = (project?: Project) => {
  if (project) {
    handleEdit(project)
  }
  isModalOpen.value = true
  document.body.classList.add("no-scroll")
}

const handleCloseModal = () => {
  formData.value = {
    id: null,
    project_name: "",
    manager: "",
    description: "",
    status: ""
  }
  editingCode.value = null
  isModalOpen.value = false
  document.body.classList.remove("no-scroll")
}

const handleEdit = (project: Project) => {
  editingCode.value = project.id
  formData.value = {
    id: project.id,
    project_name: project.project_name,
    manager: project.manager,
    description: project.description,
    status: project.status
  }
}

const handleSubmit = async () => {
  try {
    if (editingCode.value !== null) {
      await updateProject(editingCode.value, formData.value)
    } else {
      await createProject(formData.value)
    }
    fetchProjectsData()
    handleCloseModal()
  } catch (error) {
    console.error("Error saving project:", error)
  }
}

const handleDelete = async (project: Project) => {
  try {
    await deleteProject(project.id)
    fetchProjectsData()
  } catch (error) {
    console.error("Error deleting project:", error)
  }
}

const filteredProjects = computed(() => {
  return projects.value.filter((project: { project_name: string; manager: string; description: string; status: string }) => {
    return (
      project.project_name.toLowerCase().includes(searchTerm.value) ||
      project.manager.toLowerCase().includes(searchTerm.value) ||
      project.description.toLowerCase().includes(searchTerm.value) ||
      project.status.toLowerCase().includes(searchTerm.value)
    )
  })
})
</script>

<style scoped>
.container {
  max-width: 1500px;
  margin: 2rem auto;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #f9f9f9;
}

.title {
  text-align: left;
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

.btn {
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
}

.th {
  padding: 0.8rem;
  background-color: #007bff;
  color: #fff;
}

.td {
  padding: 0.8rem;
  text-align: center;
  border: 1px solid #ddd;
}

.delete-btn {
  padding: 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c82333;
}

.list {
  list-style-type: none;
  padding: 0;
  margin-top: 2rem;
}

.list-item {
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: #fff;
}
</style>