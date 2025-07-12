<template>
  <v-container class="pay-view-container">
    <v-card elevation="3" class="pa-8">
      <!-- Header -->
      <v-row justify="center" class="mb-6">
        <v-col cols="12" class="text-center">
          <h1 class="text-h4 font-weight-bold">Remittance Advice</h1>
        </v-col>
      </v-row>

      <!-- Company Info -->
      <v-row justify="center" class="mb-6">
        <v-col cols="auto" v-for="(info, index) in companyInfo" :key="index">
          <span class="text-body-2">{{ info }}</span>
        </v-col>
      </v-row>

      <!-- Pay Content -->
      <v-card elevation="3" class="pa-8">
        <v-row justify="space-between" class="mb-6">
          <!-- Supplier Info -->
          <v-col cols="6">
            <p class="text-body-2">{{ contractorDetails.company_name }}</p>
            <p class="text-body-2">Account: {{ contractorDetails.account_no }}</p>
            <p class="text-body-2">ABN: {{ contractorDetails.abn }}</p>
            <p class="text-body-2">GST Registered: {{ contractorDetails.gst_registered ? 'Yes' : 'No' }}</p>
            <p class="text-body-2">Address: {{ contractorDetails.address }}</p>
            <p class="text-body-2">Contact: {{ contractorDetails.contact_person }}</p>
            <p class="text-body-2">Phone: {{ contractorDetails.phone_number }}</p>
          </v-col>

          <!-- Pay Details -->
          <v-col cols="4" class="text-right">
            <p class="text-body-1">Pay #: {{ pay?.code }}</p>
            <p class="text-body-1">For Invoice #: {{ pay?.jobby?.code }}</p>
            <p class="text-body-1">Pay Date: {{ formatDate(pay?.create_at || '') }}</p>
            <p class="text-body-1">Due Date: {{ formatDate(pay?.jobby?.due_at || '') }}</p>
            <p class="text-body-1">Invoiced Amount: ${{ pay?.jobby?.cost || 0 }}</p>
            <p class="text-body-1">Pay Amount: ${{ pay?.amount || 0 }}</p>
          </v-col>
        </v-row>

        <!-- Pay Table -->
        <v-table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Description</th>
              <th class="text-right">Unit Cost (Including GST)</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ projectDetails.project_name }}</td>
              <td>Job: {{ jobDetails.name }}, {{ jobDetails.description }}, Ref: {{ pay?.jobby?.ref }}</td>
              <td class="text-right">{{ pay?.jobby?.cost || 0 }}</td>
              <td class="text-right">1</td>
              <td class="text-right">{{ pay?.jobby?.cost || 0 }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- Totals -->
        <v-row justify="end" class="mt-4">
          <v-col cols="4">
            <p class="text-body-1">GST: ${{ calculateGST(pay?.amount || 0) }}</p>
            <p class="text-body-1">Together with GST: ${{ pay?.amount || 0 }}</p>
            <p class="text-body-1">Amount Paid: ${{ pay?.amount || 0 }}</p>
          </v-col>
        </v-row>

        <!-- Terms -->
        <v-divider class="my-8"></v-divider>
        <v-row justify="center">
          <v-col cols="12" class="text-center">
            <p class="text-body-1">TERMS</p>
            <p class="text-body-1">Please Assure the Highest Quality!</p>
          </v-col>
        </v-row>

        <!-- Action Buttons -->
        <v-row justify="center" class="mt-8 print-hide">
          <v-col cols="auto">
            <v-btn color="primary" @click="handlePrint">Print</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" @click="handleEmail">Email</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" @click="goBack">Back</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
// import { useRoute, useRouter } from 'vue-router';
import emailjs from '@emailjs/browser';
import type { Pay, Contractor, Project, Job } from '../models';
import {
  fetchJobDetails,
  fetchContractorDetails,
  fetchProjectDetails
} from '../services/DetailService';
import {  useSelectedPay, useCurrentPage } from '../composables/useGlobalState';
// Router
// const route = useRoute();
// const router = useRouter();

// State
const selectedPay = useSelectedPay();
const pay = computed(() => selectedPay.value);
const currentPage = useCurrentPage();
const jobDetails = ref<Job>({
  code: 0,
  job_category_id: 0,
  name: "",
  description: ""
});
const projectDetails = ref<Project>({
  id: 0,
  project_name: "",
  manager: "",
  description: "",
  status: ""
});
const contractorDetails = ref<Contractor>({
  code: 0,
  contact_person: "",
  company_name: "",
  phone_number: "",
  email: "",
  bsb: "",
  account_no: "",
  account_name: "",
  address: "",
  abn: "",
  gst_registered: false
});

const companyInfo = ref([
  'Green Real Pty Ltd',
  'ABN: 344 555 3445',
  'Level 3 109 Gladstone St',
  'Kogarah NSW 2217',
  'Phone: (02) 9555-5588'
]);

// Methods
const formatDate = (date: Date | string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB');
};

const calculateGST = (amount: number) => {
  return contractorDetails.value.gst_registered ? (amount / 11).toFixed(2) : '0.00';
};

const handlePrint = () => {
  window.print();
};

const handleEmail = async () => {
  try {
    const templateParams = {
      to_name: contractorDetails.value.contact_person,
      from_name: "Green Real Pty Ltd",
      company_name: contractorDetails.value.company_name,
      invoice_number: pay.value?.code,
      amount: Number(pay.value?.amount).toFixed(2),
      gst: ((pay.value?.amount || 0) / 11).toFixed(2),
      description: `Job:${jobDetails.value.name}, ${jobDetails.value.description}. Your Ref:${pay.value?.jobby.ref}. Our ref:${pay.value?.code}`,
      project_name: projectDetails.value.project_name,
      to_email: "yunzhi.liao@me.com" // contractorDetails.value.email,
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    alert('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
    alert('Failed to send email. Please try again.');
  }
};

const goBack = () => {
  currentPage.value = 'PayComp'; // Navigate back to PayComp

};

// Fetch data
const fetchData = async () => {
  try {

    await Promise.all([
      fetchJobDetails(pay.value?.jobby?.job_id || 0).then(data => jobDetails.value = data),
      fetchContractorDetails(pay.value?.jobby?.by_id?.code || pay.value?.jobby?.by_id || 0).then(data => contractorDetails.value = data),
      fetchProjectDetails(pay.value?.jobby?.project_id || 0).then(data => projectDetails.value = data)
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.pay-view-container {
  background-color: #f0f0f0;
  padding: 32px;
}

@media print {
  .print-hide {
    display: none !important;
  }
  
  .pay-view-container {
    padding: 0;
    background-color: white;
  }
}
</style>