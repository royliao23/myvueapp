<template>
  <div class="dashboard-container" :class="{ 'mobile-layout': isMobile }">
    <!-- Buttons Panel -->
    <v-card class="buttons-panel" :class="{ 'mobile-width': isMobile }">
      <v-card-title class="text-center">Project Payment Status</v-card-title>
      <v-card-actions class="button-stack">
        <v-btn
          :variant="chartType === 'project' ? 'tonal' : 'outlined'"
          @click="setChartType('project')"
        >
          Project
        </v-btn>
        <v-btn
          :variant="chartType === 'payee' ? 'tonal' : 'outlined'"
          @click="setChartType('payee')"
        >
          Payee
        </v-btn>
      </v-card-actions>

      <v-divider class="my-4"></v-divider>

      <v-card-title class="text-center">Project Jobs Status</v-card-title>
      <v-card-actions class="button-stack">
        <v-btn
          v-for="proj in projList"
          :key="proj.project_name"
          :variant="chartType === `project-job-${proj.code}` ? 'tonal' : 'outlined'"
          @click="handleProjectJobClick(proj)"
        >
          {{ proj.project_name }}
        </v-btn>
      </v-card-actions>

      <v-divider class="my-4"></v-divider>

      <v-card-title class="text-center">Project Category Status</v-card-title>
      <v-card-actions class="button-stack">
        <v-btn
          v-for="proj in projList"
          :key="proj.project_name"
          :variant="chartType === `project-categ-${proj.code}` ? 'tonal' : 'outlined'"
          @click="handleProjectCategoryClick(proj)"
        >
          {{ proj.project_name }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Chart Panel -->
    <v-card class="chart-panel">
      <v-card-title class="text-center">
        {{ getChartTitle() }}
      </v-card-title>
      <div class="chart-container">
        <BarChart :chart-data="projData" />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import {
  getProjectData,
  getJobDataByProject,
  getPayeeData,
  getAllProjectCodes,
  getJobCategoryData
} from '../services/chartDataServices';
import BarChart from '../components/BarChart.vue';

interface Project {
  code: number;
  project_name: string;
}

interface ChartDataItem {
  name: string;
  invoiced: number;
  paid: number;
  budget?: number;
}

export default defineComponent({
  name: 'ChartDashboard',
  components: {
    BarChart
  },
  setup() {
    const { mobile } = useDisplay();
    const isMobile = ref(mobile.value);

    const chartType = ref('project');
    const selectedProject = ref<Project>({
      code: 4,
      project_name: 'Plaza NewTown'
    });
    const projList = ref<Project[]>([{ code: 0, project_name: '' }]);
    const projData = ref<ChartDataItem[]>([
      { name: 'Job A', invoiced: 20000, paid: 18000 },
      { name: 'Job B', invoiced: 35000, paid: 32000 }
    ]);

    const fetchData = async () => {
      try {
        if (chartType.value === 'project') {
          projData.value = await getProjectData();
        } else if (chartType.value.startsWith('project-categ')) {
          projData.value = await getJobCategoryData(selectedProject.value.code);
          console.log('categ projData:', projData.value);
        } else if (chartType.value.startsWith('project-job')) {
          projData.value = await getJobDataByProject(selectedProject.value.code);
          console.log('job projData:', projData.value);
        } else {
          projData.value = await getPayeeData();
        }
        
        const projects = await getAllProjectCodes();
        projList.value = projects;
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    const setChartType = (type: string) => {
      chartType.value = type;
    };

    const handleProjectJobClick = (proj: Project) => {
      selectedProject.value = proj;
      setChartType(`project-job-${proj.code}`);
    };

    const handleProjectCategoryClick = (proj: Project) => {
      selectedProject.value = proj;
      setChartType(`project-categ-${proj.code}`);
    };

    const getChartTitle = () => {
      if (chartType.value === 'project') {
        return 'Project Invoiced vs Paid';
      } else if (chartType.value === 'payee') {
        return 'Payee Invoiced vs Paid';
      } else {
        return `Invoiced vs Paid vs budget for Project: ${selectedProject.value?.project_name} - ${
          chartType.value.includes('project-categ') ? 'Category' : 'Job'
        }`;
      }
    };

    onMounted(() => {
      fetchData();
    });

    watch([chartType, selectedProject], () => {
      fetchData();
    });

    return {
      isMobile,
      chartType,
      selectedProject,
      projList,
      projData,
      setChartType,
      handleProjectJobClick,
      handleProjectCategoryClick,
      getChartTitle
    };
  }
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
  gap: 24px;
  padding: 24px;
}

.mobile-layout {
  flex-direction: column;
}

.buttons-panel {
  padding: 16px;
  text-align: center;
  width: 250px;
}

.mobile-width {
  width: 100% !important;
}

.button-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.chart-panel {
  padding: 16px;
  flex: 1;
}

.chart-container {
  width: 100%;
  height: 400px;
}

@media (max-width: 1000px) {
  .dashboard-container {
    flex-direction: column;
  }

  .button-stack {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .buttons-panel {
    width: 100%;
  }
}
</style>