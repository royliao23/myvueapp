<template>
  <v-container class="invoice-container">
    <v-card elevation="3" class="pa-8">
      <!-- Header -->
      <v-row justify="center" class="mb-6">
        <v-col cols="12" class="text-center">
          <h1 class="text-h4 font-weight-bold">PURCHASE INVOICE</h1>
        </v-col>
      </v-row>

      <!-- Company Info -->
      <v-row justify="center" class="mb-6">
        <v-col cols="auto" v-for="(info, index) in companyInfo" :key="index">
          <span class="text-body-2">{{ info }}</span>
        </v-col>
      </v-row>

      <!-- Invoice Content -->
      <v-card elevation="3" class="pa-8">
        <v-row justify="space-between" class="mb-6">
          <!-- Supplier Info -->
          <v-col cols="6">
            <p class="text-body-2">{{ contractorDetails.company_name }}</p>
            <p class="text-body-2">ABN: {{ contractorDetails.abn }}</p>
            <p class="text-body-2">GST Registered: {{ contractorDetails.gst_registered ? 'Yes' : 'No' }}</p>
            <p class="text-body-2">Account: {{ contractorDetails.account_no }}</p>
            <p class="text-body-2">{{ contractorDetails.address }}</p>
            <p class="text-body-2">Contact: {{ contractorDetails.contact_person }}</p>
            <p class="text-body-2">Phone: {{ contractorDetails.phone_number }}</p>
          </v-col>

          <!-- Invoice Details -->
          <v-col cols="4" class="text-right">
            <p class="text-body-1">Invoice #: {{ invoice?.code }}</p>
            <p class="text-body-1">Create Date: {{ formatDate(invoice?.create_at ?? '') }}</p>
            <p class="text-body-1">Due Date: {{ formatDate(invoice?.due_at ?? '') }}</p>
            <p class="text-body-1">Amount: ${{ invoice?.cost || 0 }}</p>
          </v-col>
        </v-row>

        <!-- Invoice Table -->
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
              <td>Job: {{ jobDetails.name }}, {{ jobDetails.description }}, Ref: {{ invoice?.ref }}</td>
              <td class="text-right">{{ invoice?.cost || 0 }}</td>
              <td class="text-right">1</td>
              <td class="text-right">{{ invoice?.cost || 0 }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- Totals -->
        <v-row justify="end" class="mt-4">
          <v-col cols="4">
            <p class="text-body-1">GST: ${{ calculateGST(invoice?.cost || 0) }}</p>
            <p class="text-body-1">Together with GST: ${{ invoice?.cost || 0 }}</p>
            <p class="text-body-1">Amount Paid: ${{ invoice?.paid || 0 }}</p>
            <p class="text-body-1 font-weight-bold">
              Outstanding: ${{ ((invoice?.cost || 0) - (invoice?.paid || 0)).toFixed(2) }}
            </p>
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
      </v-card>

      <!-- Action Buttons -->
      <v-row justify="center" class="mt-8 print-hide">
        <v-col cols="auto">
          <v-btn color="primary" @click="handlePrint">Print</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" @click="goBack">Back</v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchJobDetails, fetchContractorDetails, fetchProjectDetails } from '../services/DetailService'; // Assuming these services are framework-agnostic JS functions
import type { Invoice, Job, Project, Contractor } from '../models';
import { useSelectedInvoice } from '../composables/useGlobalState';
import { useCurrentPage } from '../composables/useGlobalState';
// Props
const props = defineProps<{
  code: string;
}>();
const currentPage = useCurrentPage();

const goBack = () => {
  currentPage.value = 'InvoiceComp'; // or whatever your main view is called
};
const selectedInvoice = useSelectedInvoice();

const invoice = computed(() => selectedInvoice.value);

if (!invoice.value) {
  console.warn('No selected invoice found!');
}
// State
const safeInvoice = computed(() => invoice.value || {
  code: 0,
  job_id: 0,
  by_id: 0,
  project_id: 0,
  cost: 0,
  ref: '',
  create_at: new Date(),
  updated_at: new Date(),
  due_at: new Date(),
  pay: [],
  paid: 0
});

const jobDetails = ref<Job>({
  code: 0,
  job_category_id: 0,
  name: "",
  description: "",
});

const projectDetails = ref<Project>({
  id: 0,
  project_name: "",
  manager: "",
  description: "",
  status: "",
});

const contractorDetails = ref<any>({
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
  gst_registered: false,
}
);

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



// Fetch data
const fetchInvoiceData = async () => {
  try {
    // In a real app, you would fetch the invoice data based on props.code
    // For now, we'll use the passed invoice data
    
    // Fetch related data
    await Promise.all([
      fetchJobDetails(invoice?.value?.job_id || 0).then(data => jobDetails.value = data),
      // fetchContractorDetails(invoice?.value?.by_id || 0).then(data => contractorDetails.value = data),
      fetchProjectDetails(invoice?.value?.project_id || 0).then(data => projectDetails.value = data)
    ]);
    
    // Calculate paid amount
    safeInvoice.value.paid = invoice?.value?.pay?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0;
  } catch (error) {
    console.error("Error fetching invoice data:", error);
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchInvoiceData();
  contractorDetails.value = invoice?.value?.by_id || {
    code: 0,
    contact_person: '',
    company_name: '',
    phone_number: '',
    email: '',
    bsb: '',
    account_no: '',
    account_name: '',
    address: '',
    abn: '',
    gst_registered: false
  };    
});
</script>

<style scoped>
.invoice-container {
  background-color: #f0f0f0;
  padding: 32px;
}

@media print {
  .print-hide {
    display: none !important;
  }
  
  .invoice-container {
    padding: 0;
    background-color: white;
  }
}
</style>