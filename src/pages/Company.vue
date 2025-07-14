<template>
  <v-container class="company-container">
    <v-card elevation="3" class="pa-4">
      <v-card-title>
        <h2>Company Information</h2>
      </v-card-title>

      <v-card-text v-if="company">
        <div class="company-details">
          <p><strong>Name:</strong> {{ company.company_name }}</p>
          <p><strong>Address:</strong> {{ company.address }}</p>
          <p><strong>ABN:</strong> {{ company.abn }}</p>
          <p><strong>Director:</strong> {{ company.director }}</p>
          <p><strong>Phone:</strong> {{ company.phone }}</p>
          <p><strong>Email:</strong> {{ company.email }}</p>
        </div>

        <div class="text-right mt-4">
          <v-btn color="primary" @click="openModal">Edit</v-btn>
        </div>
      </v-card-text>

      <v-card-text v-else class="text-center">
        <p>Loading company details...</p>
      </v-card-text>

      <!-- Edit Modal -->
      <v-dialog v-model="isModalOpen" max-width="600">
        <v-card>
          <v-card-title>
            Edit Company Information
            <v-btn icon="mdi-close" class="float-right" @click="closeModal"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitForm">
              <v-text-field
                v-model="formData.company_name"
                label="Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.address"
                label="Address"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.abn"
                label="ABN"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.director"
                label="Director"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.phone"
                label="Phone"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.email"
                label="Email"
                required
                type="email"
              ></v-text-field>

              <v-btn type="submit" color="primary">Save Changes</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Company as CompanyI } from '../models';
import { fetchCompany, updateCompany } from '../api';

// State
const company = ref<CompanyI | null>(null);
const isModalOpen = ref(false);
const formData = ref<CompanyI>({
  id: 0,
  company_name: '',
  address: '',
  abn: '',
  director: '',
  phone: '',
  email: ''
});

// Methods
const loadCompany = async () => {
  try {
    const data: any = await fetchCompany();
    console.log("Company data loaded:", data);
    if (data && data.length > 0) {
      company.value = data[0] as CompanyI;
      console.log("Company data set:", company.value);
      formData.value = { ...data[0] || {
        id: 0,
        company_name: '',
        address: '',
        abn: '',
        director: '',
        phone: '',
        email: ''
      } };
      console.log("Form data initialized:", formData.value);
    }
    else {
      alert("No company data found.");
    }
  } catch (error) {
    console.error("Error fetching company:", error);
  }
};

const openModal = () => {
  if (company.value) {
    formData.value = { ...company.value };
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const submitForm = async () => {
  try {
    await updateCompany(formData.value);
    company.value = { ...formData.value };
    closeModal();
  } catch (error) {
    console.error("Error updating company:", error);
  }
};

// Lifecycle
onMounted(() => {
  loadCompany();
});
</script>

<style scoped>
.company-container {
  max-width: 800px;
  margin: 2rem auto;
}

.company-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  margin: 2rem 0;
  gap: 0.5rem;
}

.company-details p {
  margin: 0.25rem 0;
}
</style>