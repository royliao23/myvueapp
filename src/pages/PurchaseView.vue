<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import emailjs from '@emailjs/browser';
import { fetchJobDetails, fetchContractorDetails, fetchProjectDetails } from '../services/DetailService'; // Assuming these services are framework-agnostic JS functions
import { useSelectedPurchase } from '../composables/useGlobalState';
import { useCurrentPage } from '../composables/useGlobalState';

interface Project {
  code: number;
  project_name: string;
  manager: string;
  description: string;
  status: string;
}

interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
}

interface Contractor {
  code: number;
  contact_person: string;
  company_name: string;
  phone_number: string;
  email: string;
  bsb: string;
  account_no: string;
  account_name: string;
  address: string;
}

const currentPage = useCurrentPage();

const handleBack = () => {
  currentPage.value = 'PurchaseComp'; // or whatever your main view is called
};

// --- Environment Variables (using Vite's import.meta.env) ---
const emailJsKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const emailJsServiceId = import.meta.env.VITE_SERVICE_ID;
const emailJsTemplateId = import.meta.env.VITE_OTID;

if (!emailJsKey || !emailJsServiceId || !emailJsTemplateId) {
  throw new Error("Missing environment variables. Check .env or .env.local configuration.");
}


const selectedPurchase = useSelectedPurchase();

const purchase = computed(() => selectedPurchase.value);

if (!purchase.value) {
  console.warn('No selected purchase found!');
}

// --- Reactive State ---
const jobDetails = ref<Job>({
  code: 0,
  job_category_id: 0,
  name: "",
  description: "",
});

const projectDetails = ref<Project>({
  code: 0,
  project_name: "",
  manager: "",
  description: "",
  status: "",
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
});

// --- Helper Functions ---
const formatDate = (date: Date | undefined) => {
  return date ? new Date(date).toLocaleDateString() : '';
};

// --- Handlers ---
const handlePrint = () => {
  // Create a clone of the printable content
  const printContent = document.querySelector('.invoice-paper')?.cloneNode(true) as HTMLElement;
  
  if (!printContent) return;

  // Create a print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Add styles to the print window
  printWindow.document.write(`
    <html>
      <head>
        <title>Purchase Order #${purchase.value?.code || ''}</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .invoice-paper {
            padding: 20mm;
            width: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th, td {
            border: 1px solid #e0e0e0;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
          }
          .text-right {
            text-align: right;
          }
          .summary-section, .terms-section {
            margin-top: 32px;
          }
          .no-print {
            display: none;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 200);
};

const handleEmail = async () => {
  if (!purchase.value) {
    alert('No purchase data available to send email.');
    return;
  }
  try {
    const templateParams = {
      to_name: contractorDetails.value.contact_person,
      from_name: "Green Real Pty Ltd",
      company_name: contractorDetails.value.company_name,
      invoice_number: purchase.value.code,
      amount: Number(purchase.value.cost).toFixed(2),
      gst: (purchase.value.cost / 11).toFixed(2),
      description: `Job:${jobDetails.value.name}, ${jobDetails.value.description}`,
      project_name: projectDetails.value.project_name,
      to_email: "yunzhi.liao@me.com", // Replace with contractorDetails.value.email in production
    };

    await emailjs.send(
      emailJsServiceId as string,
      emailJsTemplateId as string,
      templateParams,
      emailJsKey as string
    );

    alert('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
    alert('Failed to send email. Please try again.');
  }
};

// --- Data Fetching Logic ---
const fetchAllDetails = async () => {
  if (!purchase.value) {
    console.error("No purchase data to fetch details for.");
    return;
  }
  const projectData = await fetchProjectDetails(purchase.value.project_id);
  if (projectData) projectDetails.value = projectData;

  const jobData = await fetchJobDetails(purchase.value.job_id);
  if (jobData) jobDetails.value = jobData;

  const contractorData = await fetchContractorDetails(purchase.value.by_id);
  if (contractorData) contractorDetails.value = contractorData;

  
};

// --- Lifecycle Hook ---
onMounted(() => {
  fetchAllDetails();
});

// --- Computed Properties for Display ---
const createDateFormatted = computed(() => formatDate(purchase.value?.create_at));
const dueDateFormatted = computed(() => formatDate(purchase.value?.due_at));
const gstAmount = computed(() => (purchase.value && purchase.value.cost / 11) ? (purchase.value.cost / 11).toFixed(2) : '0.00');
const totalCost = computed(() => purchase.value?.cost ? purchase.value.cost.toFixed(2) : '0.00');
</script>

<template>
  <div class="purchase-view-container">
    <h1 class="purchase-view-title">PURCHASE ORDER</h1>

    <div class="company-info-bar">
      <p>Green Real Pty Ltd</p>
      <p>ABN: 344 555 3445</p>
      <p>Level 3 109 Gladstone St</p>
      <p>Kogarah NSW 2217</p>
      <p>Phone: (02) 9555-5588</p>
    </div>

    <div class="invoice-paper">
      <div class="invoice-header">
        <div class="contractor-details">
          <p>{{ contractorDetails.company_name }}</p>
          <p>Account: {{ contractorDetails.account_no }}</p>
          <p>{{ contractorDetails.address }}</p>
          <p>Contact: {{ contractorDetails.contact_person }}</p>
          <p>Phone: {{ contractorDetails.phone_number }}</p>
        </div>
        <div class="purchase-info">
          <p>Purchase #: {{ purchase?.code }}</p>
          <p>Create Date: {{ createDateFormatted }}</p>
          <p>Order Expiry Date: {{ dueDateFormatted }}</p>
        </div>
      </div>

      <div class="table-container">
        <table>
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
              <td>Job:{{ jobDetails.name }}, {{ jobDetails.description }}, Ref:{{ purchase?.ref }}</td>
              <td class="text-right">{{ totalCost }}</td>
              <td class="text-right">1</td>
              <td class="text-right">{{ totalCost }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-section">
        <p>GST: ${{ gstAmount }}</p>
        <p class="total-amount">Together with GST: ${{ totalCost }}</p>
      </div>

      <div class="terms-section">
        <p>TERMS</p>
        <p>Please Assure the Highest Quality!</p>
      </div>

      <div class="print-hide-box no-print">
        <button class="button-contained" @click="handlePrint">Print</button>
        <button class="button-contained" @click="handleEmail">Email</button>
        <button class="button-contained" @click="handleBack">Back</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main container styles */
.purchase-view-container {
  padding: 32px; /* p: 4 in MUI */
  background-color: #f0f0f0;
}

/* Title styles (h4, fontWeight="bold", center alignment) */
.purchase-view-title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px; /* mb: 4 */
  font-size: 2.125rem; /* Equivalent to h4 in MUI default */
  font-weight: bold;
  text-align: center;
}

/* Company info bar */
.company-info-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px; /* mb: 4 */
  gap: 16px; /* gap: 16px */
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
}

.company-info-bar p {
  font-size: 0.875rem; /* body2 */
  margin: 0;
}

/* Invoice container (Paper elevation={3}) */
.invoice-paper {
  padding: 64px; /* p: 8 */
  background-color: white;
  box-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12); /* Mimics elevation={3} */
}

/* Invoice header (display: flex, justifyContent: space-between, alignItems: center) */
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Adjust to flex-start for top alignment of text blocks */
  margin-bottom: 32px; /* mb: 4 */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  gap: 20px; /* Space between details blocks */
}

.contractor-details p,
.purchase-info p {
  margin: 0; /* Remove default paragraph margins */
  padding: 2px 0; /* Small vertical padding */
  font-size: 1rem; /* body1 */
}

.purchase-info {
  text-align: right;
}

/* Table styles */
.table-container {
  overflow-x: auto; /* Ensures table is scrollable on small screens */
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px; /* Similar to margin-top on TableContainer */
}

th, td {
  border: 1px solid #e0e0e0; /* TableCell borders */
  padding: 12px 16px; /* Similar to TableCell default padding */
  text-align: left;
  font-size: 0.875rem; /* body2 */
}

th {
  background-color: #f5f5f5; /* TableHead background */
  font-weight: 500; /* Medium weight for headers */
}

.text-right {
  text-align: right;
}

/* Summary section */
.summary-section {
  margin-top: 32px; /* mt: 4 */
  text-align: right;
  font-size: 1rem; /* body1 */
}

.total-amount {
  font-weight: bold;
}

/* Terms section */
.terms-section {
  margin-top: 64px; /* mt: 8 */
  border-top: 1px solid gray; /* borderTop={1} borderColor="gray" */
  padding-top: 32px; /* pt: 4 */
  text-align: center;
  font-size: 1rem; /* body1 */
}

/* PrintHideBox equivalent */
.print-hide-box {
  display: flex;
  justify-content: center;
  gap: 16px; /* gap: 16px */
  margin-top: 64px; /* marginTop: 64px */
}

/* Button styles (variant="contained") */
.button-contained {
  padding: 8px 22px; /* Similar to MUI Button padding */
  background-color: #1976d2; /* Primary blue color */
  color: white;
  border: none;
  border-radius: 4px; /* Default border radius */
  cursor: pointer;
  font-size: 0.875rem; /* Equivalent to button font size */
  font-weight: 500;
  text-transform: uppercase; /* Default MUI Button text transform */
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12); /* Small shadow */
}

.button-contained:hover {
  background-color: #115293; /* Darker blue on hover */
  box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12); /* Larger shadow on hover */
}

.button-contained:active {
  box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12); /* Pressed state */
}
@media print {
  body * {
    visibility: hidden;
  }
  .purchase-view-container,
  .purchase-view-container * {
    visibility: visible;
  }
  .purchase-view-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    margin: 0;
    background: white;
  }
  .print-hide-box {
    display: none !important;
    visibility: hidden !important;
  }

}

</style>