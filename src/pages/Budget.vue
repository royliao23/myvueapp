<template>
  <v-container class="budget-container">
    <v-card elevation="3" class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h2>Job Budget Management</h2>
        <v-btn color="primary" @click="openModal">Add Job Budget</v-btn>
      </v-card-title>

      <v-text-field
        v-model="searchTerm"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        @update:modelValue="handleSearch"
      />

      <v-data-table
        v-if="!isMobileView"
        :headers="headers"
        :items="filteredJobBudgets"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" color="primary" @click="openModal(item)"></v-btn>
          <v-btn icon="mdi-delete" color="error" @click="deleteBudget(item.code || 0)"></v-btn>
        </template>
      </v-data-table>

      <v-list v-else>
        <v-list-item v-for="item in filteredJobBudgets" :key="item.code">
          <v-list-item-content>
            <v-list-item-title>Project: {{ item.project?.project_name }}</v-list-item-title>
            <v-list-item-subtitle>Job: {{ item.job?.name }}</v-list-item-subtitle>
            <v-list-item-subtitle>Budget: {{ item.budget }}</v-list-item-subtitle>
            <v-list-item-subtitle>Note: {{ item.note }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon="mdi-pencil" color="primary" @click="openModal(item)"></v-btn>
            <v-btn icon="mdi-delete" color="error" @click="deleteBudget(item.code || 0)"></v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-dialog v-model="isModalOpen" max-width="600">
        <v-card>
          <v-card-title>
            {{ editingCode ? 'Edit Job Budget' : 'Add Job Budget' }}
            <v-btn icon="mdi-close" class="float-right" @click="closeModal"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitForm">
              <v-select
                v-model="formData.project_id"
                :items="projectOptions"
                item-title="project_name"
                item-value="id"
                label="Project"
                required
              ></v-select>

              <v-select
                v-model="formData.job_id"
                :items="jobOptions"
                item-title="name"
                item-value="code"
                label="Job"
                required
              ></v-select>

              <v-text-field
                v-model="formData.budget"
                type="number"
                label="Budget"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.note"
                label="Note"
              ></v-text-field>

              <v-btn type="submit" color="primary">Save</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useDisplay } from 'vuetify';
import type { JobBudget, Job, Project } from '../models';
import {
  getJobBudgets,
  createJobBudget,
  updateJobBudget,
  deleteJobBudget,
  fetchJobs,
  fetchProjects
} from '../api';

// State
const jobBudgets = ref<JobBudget[]>([]);
const jobs = ref<Job[]>([]);
const projects = ref<Project[]>([]);
const searchTerm = ref('');
const isModalOpen = ref(false);
const editingCode = ref<number | null>(null);

const formData = ref<Omit<JobBudget, 'code' | 'job' | 'project'> & { code?: number }>({
  job_id: 0,
  project_id: 0,
  budget: 0,
  note: ''
});

// Vuetify display
const { mobile } = useDisplay();
const isMobileView = computed(() => mobile.value);

// Computed properties
const projectOptions = computed(() => projects.value);
const jobOptions = computed(() => jobs.value);

const headers = [
  { title: 'Project', key: 'project.project_name' },
  { title: 'Job', key: 'job.name' },
  { title: 'Budget', key: 'budget' },
  { title: 'Note', key: 'note' },
  { title: 'Actions', key: 'actions' }
];

const filteredJobBudgets = computed(() => {
  if (!searchTerm.value) return jobBudgets.value;
  
  const term = searchTerm.value.toLowerCase();
  return jobBudgets.value.filter(jobBudget => {
    const jobName = jobBudget.job?.name?.toLowerCase() || '';
    const projectName = jobBudget.project?.project_name?.toLowerCase() || '';
    return jobName.includes(term) || projectName.includes(term);
  });
});

// Methods
const fetchData = async () => {
  try {
    const [budgets, jobData, projectData] = await Promise.all([
      getJobBudgets(),
      fetchJobs(),
      fetchProjects()
    ]);

    jobBudgets.value = budgets?.map(item => ({
      code: item.code,
      job_id: item.job_id,
      project_id: item.project_id,
      budget: item.budget,
      note: item.note,
      job: item.job,
      project: item.project
    })) || [];

    jobs.value = jobData || [];
    projects.value = projectData || [];
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const openModal = (jobBudget?: JobBudget) => {
  if (jobBudget) {
    formData.value = {
      code: jobBudget.code,
      job_id: jobBudget.job_id || jobBudget.job?.code || 0,
      project_id: jobBudget.project_id || jobBudget.project?.id || 0,
      budget: jobBudget.budget,
      note: jobBudget.note
    };
    editingCode.value = jobBudget.code || null;
  } else {
    formData.value = {
      job_id: 0,
      project_id: 0,
      budget: 0,
      note: ''
    };
    editingCode.value = null;
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingCode.value = null;
  formData.value = {
    job_id: 0,
    project_id: 0,
    budget: 0,
    note: ''
  };
};

const submitForm = async () => {
  try {
    const payload = {
      job_id: formData.value.job_id ?? 0,
      project_id: formData.value.project_id ?? 0,
      budget: formData.value.budget,
      note: formData.value.note
    };

    if (editingCode.value !== null) {
      await updateJobBudget(editingCode.value, payload);
    } else {
      await createJobBudget(payload);
    }

    fetchData();
    closeModal();
  } catch (error) {
    console.error("Error saving job budget:", error);
  }
};

const deleteBudget = async (code: number) => {
  if (confirm("Are you sure you want to delete this job budget?")) {
    try {
      await deleteJobBudget(code);
      fetchData();
    } catch (error) {
      console.error("Error deleting job budget:", error);
    }
  }
};

const handleSearch = () => {
  // Search is handled automatically by the computed property
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.budget-container {
  max-width: 1500px;
  margin: 2rem auto;
}

@media (max-width: 1000px) {
  .v-data-table {
    display: none;
  }
}

@media (min-width: 1001px) {
  .v-list {
    display: none;
  }
}
</style>