<template>
  <div class="container">
    <table class="table">
      <thead>
        <tr>
          <th class="th">Projects</th>
          <th class="th">Total</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="proj in projects" :key="proj.code">
          <tr>
            <td class="td">
              <button
                class="expand-button"
                @click="toggleProject(proj.code)"
                :aria-expanded="expandedProjects[proj.code] || false"
              >
                {{ expandedProjects[proj.code] ? '-' : '+' }}
              </button>
              {{ proj.project_name }}
            </td>
            <td class="td">${{ calculateProjectTotal(projectDetails[proj.code] || getDefaultProject()).toFixed(2) }}</td>
          </tr>
          <template v-if="expandedProjects[proj.code] && projectDetails[proj.code]">
            <template v-for="cat in projectDetails[proj.code]?.categories?.filter(cat => calculateCategoryTotal(cat) > 0)" :key="`${proj.code}-${cat.code}`">
              <tr>
                <td class="td" style="padding-left: 2rem">
                  <button
                    class="expand-button"
                    @click="toggleCategory(proj.code, cat.code)"
                    :aria-expanded="expandedCategories[`${proj.code}-${cat.code}`] || false"
                  >
                    {{ expandedCategories[`${proj.code}-${cat.code}`] ? '-' : '+' }}
                  </button>
                  {{ cat.name }}
                </td>
                <td class="td">${{ calculateCategoryTotal(cat).toFixed(2) }}</td>
              </tr>
              <template v-if="expandedCategories[`${proj.code}-${cat.code}`]">
                <template v-for="job in cat.jobs?.filter(job => calculateJobTotal(job) > 0)" :key="`${proj.code}-${cat.code}-${job.code}`">
                  <tr>
                    <td class="td" style="padding-left: 4rem">
                      <button
                        class="expand-button"
                        @click="toggleJob(proj.code, cat.code, job.code)"
                        :aria-expanded="expandedJobs[`${proj.code}-${cat.code}-${job.code}`] || false"
                      >
                        {{ expandedJobs[`${proj.code}-${cat.code}-${job.code}`] ? '-' : '+' }}
                      </button>
                      {{ job.name }}
                    </td>
                    <td class="td">${{ calculateJobTotal(job).toFixed(2) }}</td>
                  </tr>
                  <template v-if="expandedJobs[`${proj.code}-${cat.code}-${job.code}`]">
                    <tr v-for="invoice in job.details" :key="`${proj.code}-${cat.code}-${job.code}-${invoice.id}`" style="color: blue">
                      <td class="td" style="padding-left: 6rem">Supplier Reference: {{ invoice.description }}</td>
                      <td class="td">inv#:{{ invoice.id }}: ${{ Number(invoice.amount).toFixed(2) }}</td>
                    </tr>
                  </template>
                </template>
              </template>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { getAllProjectCodes, getForLedgerSingle } from '../services/fastApiLedgerServices';

// Define types
export interface InvoiceLedger {
  id: number;
  amount: number;
  description: string;
}

interface Categ {
  code: number;
  name: string;
  jobs?: Job[];
}

export interface Project {
  code: number;
  project_name: string;
  manager: string;
  description: string;
  status: string;
  categories?: Categ[]; 
}

export interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
  details?: InvoiceLedger[]; 
}

export default defineComponent({
  name: 'LedgerCategory',
  setup() {
    const projects = ref<any[]>([]);
    const expandedProjects = ref<{ [key: number]: boolean }>({});
    const expandedCategories = ref<{ [key: string]: boolean }>({});
    const expandedJobs = ref<{ [key: string]: boolean }>({});
    const projectDetails = ref<{ [key: number]: Project }>({});
    const loading = ref(true);
    const error = ref<string | null>(null);

    const getDefaultProject = (): Project => ({
      code: 0,
      project_name: '',
      manager: '',
      description: '',
      status: '',
      categories: []
    });
    // Fetch all project codes on component mount
    const fetchProjects = async () => {
      try {
        const projectCodes = await getAllProjectCodes();
        projects.value = projectCodes;
      } catch (err) {
        console.error('Error fetching project codes:', err);
        error.value = 'Failed to fetch project codes. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    // Fetch details for a specific project when expanded
    const fetchProjectDetails = async (projectCode: number) => {
      try {
        const details = await getForLedgerSingle(projectCode);
        projectDetails.value = {
          ...projectDetails.value,
          [projectCode]: details[0], 
        };
      } catch (err) {
        console.error('Error fetching project details:', err);
        error.value = 'Failed to fetch project details. Please try again later.';
      }
    };

    // Toggle expanded state for projects
    const toggleProject = (projectCode: number) => {
      expandedProjects.value = {
        ...expandedProjects.value,
        [projectCode]: !expandedProjects.value[projectCode],
      };

      if (!projectDetails.value[projectCode]) {
        fetchProjectDetails(projectCode);
      }
    };

    // Toggle expanded state for categories
    const toggleCategory = (projectCode: number, categoryCode: number) => {
      const key = `${projectCode}-${categoryCode}`;
      expandedCategories.value = {
        ...expandedCategories.value,
        [key]: !expandedCategories.value[key],
      };
    };

    // Toggle expanded state for jobs
    const toggleJob = (projectCode: number, categoryCode: number, jobCode: number) => {
      const key = `${projectCode}-${categoryCode}-${jobCode}`;
      expandedJobs.value = {
        ...expandedJobs.value,
        [key]: !expandedJobs.value[key],
      };
    };

    // Function to calculate the total for a job
    const calculateJobTotal = (job: Job) => {
      return job.details?.reduce((total, invoice) => total + invoice.amount, 0) || 0;
    };

    // Function to calculate the total for a category
    const calculateCategoryTotal = (category: Categ) => {
      return category.jobs?.reduce((total, job) => total + calculateJobTotal(job), 0) || 0;
    };

    // Function to calculate the total for a project
    const calculateProjectTotal = (project: Project) => {
      return project.categories?.reduce((total, category) => total + calculateCategoryTotal(category), 0) || 0;
    };

    onMounted(() => {
      fetchProjects();
    });

    return {
      projects,
      expandedProjects,
      expandedCategories,
      expandedJobs,
      projectDetails,
      loading,
      error,
      toggleProject,
      toggleCategory,
      toggleJob,
      calculateJobTotal,
      calculateCategoryTotal,
      calculateProjectTotal,
      getDefaultProject
    };
  },
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.th {
  background-color: #007bff;
  color: white;
  padding: 0.8rem;
  text-align: left;
}

.td {
  padding: 0.8rem;
  border: 1px solid #ddd;
}

.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}
</style>