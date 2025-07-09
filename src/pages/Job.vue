// Job.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import SearchBox from '../components/SearchBox.vue'; // Assuming Vue SearchBox component
import JobModal from '../components/JobModal.vue'; // This will be your Vue JobModal component
import {
  createJob,
  deleteJob,
  fetchJobs as fetchJobsApi,
  updateJob,
  fetchCategories,
  createCategory,
} from '../api'; // Your existing API functions
import type { Job, Categ } from '../models'; // Your existing models

// --- Reactive State ---
const jobs = ref<Job[]>([]);
const formData = ref<Omit<Job, 'code'>>({
  job_category_id: 0,
  name: '',
  description: '',
});

const editingCode = ref<number | null>(null);
const isMobileView = ref<boolean>(window.innerWidth < 1000);
const isModalOpen = ref<boolean>(false);
const searchTerm = ref<string>('');
const jobCategoryOptions = ref<{ value: number; label: string }[]>([]);

const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(5);

// --- Data Loading Functions ---
const fetchJobs = async () => {
  const jobData = await fetchJobsApi();
  if (jobData) jobs.value = jobData;
};

const fetchCategoriesData = async () => {
  try {
    const categoryData = await fetchCategories();
    if (!categoryData) {
      console.error('No categories found');
      jobCategoryOptions.value = [];
      return;
    }

    const transformedData = categoryData.map((item: Categ) => ({
      value: item.code,
      label: item.name,
    }));

    jobCategoryOptions.value = transformedData;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchJobs();
  fetchCategoriesData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.body.classList.remove('no-scroll');
  window.removeEventListener('resize', handleResize);
});

// Watcher for modal open/close to manage body scroll
watch(isModalOpen, (newValue) => {
  if (newValue) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
});

// --- Event Handlers ---
const handleResize = () => {
  isMobileView.value = window.innerWidth < 1000;
};

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
};

const handleSearchChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchTerm.value = target.value.toLowerCase();
  currentPage.value = 1; // Reset to first page on search
};

const handleOpenModal = (job?: Job) => {
  if (job) {
    editingCode.value = job.code;
    formData.value = {
      job_category_id: job.job_category_id,
      name: job.name,
      description: job.description,
    };
  } else {
    editingCode.value = null;
    formData.value = {
      job_category_id: 0, // Reset to default or sensible initial value
      name: '',
      description: '',
    };
  }
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  // Reset form data and editing code when modal closes
  editingCode.value = null;
  formData.value = {
    job_category_id: 0,
    name: '',
    description: '',
  };
};

const handleSubmit = async () => {
  try {
    if (editingCode.value !== null) {
      await updateJob(editingCode.value, formData.value);
    } else {
      await createJob(formData.value);
    }
    await fetchJobs(); // Refresh the list
    handleCloseModal();
  } catch (error) {
    console.error('Error saving job:', error);
  }
};

// This function is passed to the JobModal for text inputs
const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  formData.value = { ...formData.value, [target.name]: target.value };
};

// This function is passed to the JobModal for select (dropdown) inputs
const handleDropChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  formData.value = { ...formData.value, [target.name]: parseInt(target.value) };
};

const handleDelete = async (code: number) => {
  try {
    await deleteJob(code);
    fetchJobs(); // Refresh the list
  } catch (error) {
    console.error('Error deleting job:', error);
  }
};

const handleAddCategory = async (newCategoryName: string) => {
  try {
    const result = await createCategory({
      name: newCategoryName,
    });

    if (result) {
      const addedCategory = result;
      const newOption = { value: addedCategory.code, label: addedCategory.name };

      // Update the local options directly
      jobCategoryOptions.value.push(newOption);
      // No need to fetch all categories again unless absolutely necessary for complex scenarios
    } else {
      console.error('Failed to add category: No data returned.');
    }
  } catch (error) {
    console.error('Error adding category:', error);
  }
};


// --- Computed Properties ---
const filteredJobs = computed(() => {
  const term = searchTerm.value;
  return jobs.value.filter((job) => {
    return (
      (job.name?.toLowerCase() || '').includes(term) ||
      (job.description?.toLowerCase() || '').includes(term) ||
      // Also search by category name if needed
      jobCategoryOptions.value.find(opt => opt.value === job.job_category_id)?.label.toLowerCase().includes(term)
    );
  });
});

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = currentPage.value * itemsPerPage.value;
  return filteredJobs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredJobs.value.length / itemsPerPage.value);
});
</script>

<template>
  <div class="container">
    <h2 class="title">Job Management</h2>
    <div class="button-row">
      <SearchBox v-model="searchTerm" />
      <button class="button" @click="handleOpenModal()">Add Job</button>
    </div>

    <div class="pagination-container">
      <button
        v-for="index in totalPages"
        :key="index"
        @click="handlePageChange(index)"
        :class="{ button: true, active: currentPage === index }"
      >
        {{ index }}
      </button>
    </div>

    <div v-if="isMobileView">
      <ul class="list">
        <li v-for="job in paginatedJobs" :key="job.code" class="list-item">
          <strong>Job Code:</strong> {{ job.code }} <br />
          <strong>Name:</strong> {{ job.name }} <br />
          <strong>Description:</strong> {{ job.description }} <br />
          <strong>Category:</strong>
          {{ jobCategoryOptions.find((option) => option.value === job.job_category_id)?.label || "Unknown" }}
          <br />
          <button class="button" @click="handleOpenModal(job)">Edit</button>
          <button class="delete-button" @click="handleDelete(job.code)">Delete</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th class="th">Job Code</th>
            <th class="th">Job Name</th>
            <th class="th">Description</th>
            <th class="th">Category</th>
            <th class="th">Edit</th>
            <th class="th">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in paginatedJobs" :key="job.code">
            <td class="td">{{ job.code }}</td>
            <td class="td">{{ job.name }}</td>
            <td class="td">{{ job.description }}</td>
            <td class="td">
              {{ jobCategoryOptions.find((option) => option.value === job.job_category_id)?.label || "Unknown" }}
            </td>
            <td class="td">
              <button class="button" @click="handleOpenModal(job)">Edit</button>
            </td>
            <td class="td">
              <button class="delete-button" @click="handleDelete(job.code)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <JobModal
      :show="isModalOpen"
      @close="handleCloseModal"
      @submit="handleSubmit"
      :form-data="formData"
      @update:form-data-input="handleInputChange"
      @update:form-data-drop="handleDropChange"
      :job-category-options="jobCategoryOptions"
      :is-editing="editingCode !== null"
      @add-category="handleAddCategory"
    />
  </div>
</template>

<style scoped>
/* Common styled components */
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

.button {
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
.button:hover {
  background-color: #0056b3;
}

.button.active {
  background-color: #0056b3; /* Darker blue for active pagination button */
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

.delete-button {
  padding: 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5rem;
}
.delete-button:hover {
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

/* Pagination container styles */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.pagination-container .button {
  margin: 0 5px;
  background-color: #ddd; /* Default inactive button background */
  color: #333;
}
</style>