<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import GeneralModal from '../components/GeneralModal.vue'; // Your generic modal
import JobModalComp from '../components/JobModal.vue'; // Your Job specific modal
import SearchBox from '../components/SearchBox.vue'; // Basic SearchBox
import Dropdown from '../components/DropDown.vue'; // Basic Dropdown

// Interfaces (adjust paths as necessary for your project structure)
import type { Purchase, Contractor,  InvoiceShort } from '../models'; // Assuming these are defined here
import {
  createPO, updatePO, fetchPO, deletePO,
  fetchCategories as fetchJobCategoriesApi, createCategory as createCategoryApi,
  fetchJobs as fetchJobsApi, createJob as createJobApi,
  fetchProjects as fetchProjectsApi,
  fetchContractors as fetchContractorsApi, createContractor as createContractorApi,
  createInvoice as createInvoiceApi, fetchPoandInv
} from '../api';
import { useNavigationService } from '../composables/useNavigationService';
// --- Styled Components Replacements (CSS variables or direct CSS) ---
// For brevity, these are integrated directly into the <style scoped> block below.
// In a larger app, you might use a CSS framework or separate CSS files.

// --- Navigation Service (simplified for Vue) ---
// In a real Vue app, you'd use vue-router for navigation
const navigateTo = (path: string, params: any = {}) => {
  console.log(`Navigating to: ${path} with params:`, params);
  // Example: router.push({ name: path, params: params });
  // For now, we'll just log and potentially stringify for URL
  if (path === 'PurchaseView' && params.purchase) {
    alert(`Viewing Purchase: ${JSON.stringify(params.purchase.code)}`);
  } else if (path === 'view-invoice' && params.invoice) {
    alert(`Viewing Invoice: ${JSON.stringify(params.invoice.code)}`);
  }
};
// const useNavigationServices = () => ({
//   handleViewPurchase: (purchase: Purchase) => navigateTo('view-purchase', { purchase }),
//   handleViewInvoice: (invoice: InvoiceShort) => navigateTo('view-invoice', { invoice }),
// });
const { handleViewPurchase} = useNavigationService();
const viewPurchaseDetail = (purchase: Purchase) => {
  handleViewPurchase(purchase);
  // navigateTo('PurchaseView', purchase.code.toString());
};
// --- Reactive State ---
const purchases = ref<Purchase[]>([]);
const originalCost = ref<number>(0);
const formData = reactive<Omit<Purchase, "code">>({
  job_id: 0,
  by_id: 0,
  project_id: 0,
  ref: "",
  cost: 0,
  contact: "",
  description: "",
  note: "",
  create_at: new Date(),
  updated_at: new Date(),
  due_at: new Date(),
  invoice: []
});

const formContractorData = reactive<Omit<Contractor, "code">>({
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
});

const editingCode = ref<number | null>(null);
const contractoreditingCode = ref<number | null>(null);

const isMobileView = ref<boolean>(window.innerWidth < 1000);
const isModalOpen = ref<boolean>(false);
const isContractorModalOpen = ref<boolean>(false);
const searchTerm = ref<string>("");

const isJobModalOpen = ref<boolean>(false);
const formJobData = reactive({
  name: "",
  job_category_id: 0,
  description: "",
});
const editingJobCode = ref<number | null>(null);
const jobCategoryOptions = ref<{ value: number; label: string }[]>([]);

const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(5);

const projectOptions = ref<{ value: number; label: string }[]>([]);
const contractorOptions = ref<{ value: number; label: string }[]>([]);
const jobOptions = ref<{ value: number; label: string }[]>([]);

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchPurchases();
  fetchJobCategories();
  fetchProjects();
  fetchContractors();
  fetchJobs();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  document.body.classList.remove("no-scroll"); // Ensure cleanup
});

// Watch for modal open state to control body scroll
watch(isModalOpen, (newValue) => {
  if (newValue) {
    document.body.classList.add("no-scroll");
  } else {
    document.body.classList.remove("no-scroll");
  }
});

// --- Computed Properties ---
const paginatedPurchases = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPurchases.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredPurchases.value.length / itemsPerPage.value);
});

const filteredPurchases = computed(() => {
  if (!searchTerm.value) {
    return purchases.value;
  }

  const term = searchTerm.value.toLowerCase();
  if (term.startsWith("=")) {
    const cost = Number(term.substring(1));
    return purchases.value.filter(purchase => purchase.cost === cost);
  } else if (term.startsWith(">")) {
    const cost = Number(term.substring(1));
    return purchases.value.filter(purchase => purchase.cost > cost);
  } else if (term.startsWith("<")) {
    const cost = Number(term.substring(1));
    return purchases.value.filter(purchase => purchase.cost < cost);
  } else {
    return purchases.value.filter(purchase => {
      const contractor = contractorOptions.value.find((c) => c.value === purchase.by_id);
      const project = projectOptions.value.find((p) => p.value === purchase.project_id);
      const job = jobOptions.value.find((j) => j.value === purchase.job_id);

      return (
        (contractor?.label?.toLowerCase() || "").includes(term) ||
        (purchase.ref?.toLowerCase() || "").includes(term) ||
        (purchase.contact?.toLowerCase() || "").includes(term) ||
        (purchase.code === Number(term)) ||
        (project?.label?.toLowerCase() || "").includes(term) ||
        (job?.label?.toLowerCase() || "").includes(term)
      );
    });
  }
});

// --- API Fetching Functions ---
const fetchPurchases = async () => {
  try {
    const data = await fetchPO();
    purchases.value = data || [];
    console.log("Purchases state updated:", purchases.value);
  } catch (error) {
    console.error("Error fetching purchases:", error);
  }
};

const fetchJobCategories = async () => {
  try {
    const data = await fetchJobCategoriesApi();
    const transformedData = data.map((item: any) => ({
      value: item.code,
      label: item.name,
    }));
    jobCategoryOptions.value = transformedData;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const fetchProjects = async () => {
  try {
    const data = await fetchProjectsApi();
    const transformedData = data.map((item: any) => ({
      value: item.id,
      label: item.project_name,
    }));
    projectOptions.value = transformedData;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const fetchContractors = async () => {
  try {
    const data = await fetchContractorsApi();
    const transformedData = data.map((item: any) => ({
      value: item.code,
      label: item.company_name,
    }));
    contractorOptions.value = transformedData;
  } catch (error) {
    console.error("Error fetching contractors:", error);
  }
};

const fetchJobs = async () => {
  try {
    const jobData = await fetchJobsApi();
    const transformedData = jobData?.map((item: any) => ({
      value: item.code,
      label: item.name,
    }));
    jobOptions.value = transformedData || [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

// --- Event Handlers ---
const handleResize = () => {
  isMobileView.value = window.innerWidth < 1000;
};

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
};

const handleSearchChange = (value: string) => {
  currentPage.value = 1;
  searchTerm.value = value;
};

// --- Main Purchase Modal Handlers ---
const handleOpenModal = (purchase?: Purchase) => {
  if (purchase) {
    // Populate form data for editing
    Object.assign(formData, {
      job_id: purchase.job_id,
      by_id: purchase.by_id,
      project_id: purchase.project_id,
      ref: purchase.ref,
      cost: purchase.cost,
      contact: purchase.contact,
      description: purchase.description,
      note: purchase.note,
      create_at: new Date(purchase.create_at), // Ensure Date objects
      updated_at: new Date(),
      due_at: new Date(purchase.due_at), // Ensure Date objects
      invoice: purchase.invoice || []
    });
    originalCost.value = purchase.cost; // Store original cost for invoice logic
    editingCode.value = purchase.code;
  } else {
    // Reset form for adding new
    Object.assign(formData, {
      job_id: 0,
      by_id: 0,
      project_id: 0,
      ref: "",
      description: "",
      note: "",
      cost: 0,
      contact: "",
      create_at: new Date(),
      updated_at: new Date(),
      due_at: new Date(),
      invoice: []
    });
    originalCost.value = 0;
    editingCode.value = null;
  }
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  // Reset form data after closing, using Object.assign for reactive object
  Object.assign(formData, {
    job_id: 0, by_id: 0, project_id: 0, ref: "", cost: 0, contact: "", description: "", note: "",
    create_at: new Date(), updated_at: new Date(), due_at: new Date(), invoice: []
  });
  editingCode.value = null;
  originalCost.value = 0;
};

const handleInputChange = (event: Event) => {
  const { name, value, type, checked } = event.target as HTMLInputElement;
  if (name in formData) {
    (formData as any)[name] = type === 'number' ? parseFloat(value) : value;
  }
};

const handleDropChange = (event: Event) => {
  const { name, value } = event.target as HTMLSelectElement;
  if (name in formData) {
    (formData as any)[name] = parseInt(value); // Assuming dropdown values are IDs
  }
};

const handleSubmit = async () => {
  try {
    const payload: Omit<Purchase, "code"> = { ...formData };
    // The `invoice` field should not be sent with the purchase update/create payload if it's a nested object from Supabase.
    // Ensure it's not included in the payload sent to createPO/updatePO
    delete (payload as any).invoice;

    if (editingCode.value !== null) {
      await updatePO(editingCode.value, payload);
      alert("Purchase updated successfully");
    } else {
      await createPO(payload);
      alert("Purchase added successfully");
    }
    fetchPurchases();
    handleCloseModal();
  } catch (error) {
    console.error("Error saving purchase:", error);
    alert(`Error saving purchase: ${error}`);
  }
};

// --- Job Modal Handlers ---
const handleJobOpenModal = () => {
  isJobModalOpen.value = true;
};

const handleJobCloseModal = () => {
  Object.assign(formJobData, {
    name: "",
    job_category_id: 0,
    description: "",
  });
  editingJobCode.value = null;
  isJobModalOpen.value = false;
};

const handleJobInputChange = (event: Event) => {
  const { name, value } = event.target as HTMLInputElement;
  if (name in formJobData) {
    (formJobData as any)[name] = value;
  }
};

const handleJobDropChange = (event: Event) => {
  const { name, value } = event.target as HTMLSelectElement;
  if (name in formJobData) {
    (formJobData as any)[name] = parseInt(value);
  }
};

const handleJobSubmit = async () => {
  try {
    const data = await createJobApi(formJobData);
    if (!data) throw new Error("Failed to create job");
    handleJobCloseModal();
    fetchJobs(); // Refresh job list
  } catch (error) {
    console.error("Error adding job:", error);
    alert(`Error adding job: ${error}`);
  }
};

const handleAddCategory = async (newCategoryLabel: string) => {
  try {
    await createCategoryApi({ name: newCategoryLabel });
    fetchJobCategories(); // Refresh categories list
  } catch (error) {
    console.error("Error adding category:", error);
    alert(`Error adding category: ${error}`);
  }
};

// --- Contractor Modal Handlers ---
const handleContractorOpenModal = () => {
  isContractorModalOpen.value = true;
};

const handleContractorCloseModal = () => {
  Object.assign(formContractorData, {
    contact_person: "", company_name: "", phone_number: "", email: "", bsb: "",
    account_no: "", account_name: "", address: "", abn: "", gst_registered: false,
  });
  contractoreditingCode.value = null;
  isContractorModalOpen.value = false;
};

const handleContractorInputChange = (event: Event) => {
  const { name, value } = event.target as HTMLInputElement;
  if (name in formContractorData) {
    (formContractorData as any)[name] = value;
  }
};

const handleContractorCheckBoxChange = (event: Event) => {
  const { name, checked } = event.target as HTMLInputElement;
  if (name in formContractorData) {
    (formContractorData as any)[name] = checked;
  }
};

const handleContractorSubmit = async () => {
  try {
    await createContractorApi(formContractorData);
    fetchContractors(); // Refresh contractor list
    handleContractorCloseModal();
    alert("Contractor added successfully!");
  } catch (error) {
    console.error("Error saving contractor:", error);
    alert(`Error saving contractor: ${error}`);
  }
};

// --- Delete Handler ---
const handleDelete = async (code: number) => {
  if (confirm("Are you sure you want to delete this purchase order?")) {
    try {
      await deletePO(code);
      fetchPurchases();
      alert("Purchase deleted successfully");
    } catch (error) {
      console.error("Error deleting purchase:", error);
      alert(`Error deleting purchase: ${error}`);
    }
  }
};
const { handleViewInvoice } = useNavigationService();
const handleViewInv = async (invoice:any) => {
  try {
    if (!invoice) {
      console.error(`Invoice record not found for ID: ${invoice.code}`);
      return;
    }
    
    handleViewInvoice(invoice);
  } catch (error) {
    console.error("Error fetching invoice details:", error);
  }
};


// --- Invoice Creation ---
const handleCreateInvoice = async (balance: number) => {
  if (!editingCode.value) {
    alert("Please select a purchase order to create an invoice.");
    return;
  }
  if (formData.cost > balance) {
    alert("Invoice amount cannot exceed the balance amount.");
    return;
  }
  

  const invoicePayload = {
    po_id: editingCode.value,
    job_id: formData.job_id,
    by_id: formData.by_id,
    project_id: formData.project_id,
    paid: 0, // Assuming initial paid amount is 0
    note: formData.note,
    description: formData.description,
    ref: formData.ref,
    cost: formData.cost, // Cost for the new invoice
    contact: formData.contact,
    due_at: formData.due_at,
    create_at: new Date(),
  };

  try {
    const data = await createInvoiceApi(invoicePayload);

    // Small delay to ensure DB update before refetching
    setTimeout(() => {
      alert("Invoice created successfully");
      fetchPurchases();
      handleCloseModal();
    }, 100);
  } catch (error) {
    console.error("Error creating invoice:", error);
    alert(`Error creating invoice: ${error}`);
  }
};

</script>

<template>
  <div class="container">
    <h2 class="title">Purchase Order Management</h2>
    <div class="button-row">
      <SearchBox :modelValue="searchTerm" @update:modelValue="handleSearchChange" />
      <button class="button" @click="handleOpenModal()">Add Purchase</button>
    </div>

    <div class="pagination-container">
      <button
        v-for="index in totalPages"
        :key="index"
        @click="handlePageChange(index)"
        :class="{ 'button': true, 'active-page': currentPage === index }"
      >
        {{ index }}
      </button>
    </div>

    <ul v-if="isMobileView" class="list">
      <li v-for="purchase in paginatedPurchases" :key="purchase.code" class="list-item">
        <button @click="viewPurchaseDetail(purchase)" class="text-blue-500 underline">
          PO#: {{ purchase.code }}
        </button><br />
        <strong>Contact Person:</strong> {{ purchase.contact }} <br />
        <strong>Project:</strong> {{ projectOptions.find((option) => option.value === purchase.project_id)?.label || "Unknown" }} <br />
        <strong>Supplier Name:</strong> {{ contractorOptions.find((option) => option.value === purchase.by_id)?.label || "Unknown" }} <br />
        <strong>Price:</strong> {{ purchase.cost || 0 }} <br />
        <strong>Job:</strong> {{ jobOptions.find((option) => option.value === purchase.job_id)?.label || "Unknown" }} <br />
        <strong>Invoices:</strong>
        <span v-for="(inv, index) in purchase.invoice" :key="index"
              class="invoice-list-item text-blue-500" @click="handleViewInv(inv)"
              >
          Inv#{{ inv.code }}: ${{ inv.cost || 0 }}
        </span>
        <p>
          <button class="button" @click="handleOpenModal(purchase)">Edit</button>
          <button class="delete-button" @click="handleDelete(purchase.code)">Delete</button>
        </p>
      </li>
    </ul>

    <table v-else class="table">
      <thead>
        <tr>
          <th class="th">PO #</th>
          <th class="th">Contact Person</th>
          <th class="th">Project</th>
          <th class="th">Job</th>
          <th class="th">Price</th>
          <th class="th">Supplier</th>
          <th class="th">Ref</th>
          <th class="th">Invoice</th>
          <th class="th">Edit</th>
          <th class="th">Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="purchase in paginatedPurchases" :key="purchase.code">
          <td class="td">
            <button @click="viewPurchaseDetail(purchase)" class="text-blue-500">
              {{ purchase.code }}
            </button>
          </td>
          <td class="td">{{ purchase.contact }}</td>
          <td class="td">{{ projectOptions.find((option) => option.value === purchase.project_id)?.label || "Unknown" }}</td>
          <td class="td">{{ jobOptions.find((option) => option.value === purchase.job_id)?.label || "Unknown" }}</td>
          <td class="td">{{ purchase.cost || 0 }}</td>
          <td class="td">{{ contractorOptions.find((option) => option.value === purchase.by_id)?.label || "Unknown" }}</td>
          <td class="td">{{ purchase.ref }}</td>
          <td class="td text-blue-500">
            <span v-for="(inv, index) in purchase.invoice" :key="index"
                  class="invoice-list-item"
                  @click="handleViewInv(inv)">
              Inv#{{ inv.code }}: ${{ inv.cost || 0 }}
            </span>
          </td>
          <td class="td">
            <button class="button" @click="handleOpenModal(purchase)">Edit</button>
          </td>
          <td class="td">
            <button class="delete-button" @click="handleDelete(purchase.code)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div :class="{ 'modal': true, 'show': isModalOpen }">
      <div class="modal-content-styled">
        <button class="close-button" @click="handleCloseModal">&times;</button>
        <form @submit.prevent="handleSubmit">
          <div>
            <label htmlFor="contact">Contact Person</label>
            <input
              id="contact"
              type="text"
              name="contact"
              v-model="formData.contact"
              placeholder="Contact Person"
              autocomplete="off"
              required
              class="input"
            />
          </div>

          <div>
            <label htmlFor="by_id">Supplier</label>
            <Dropdown
              name="by_id"
              :modelValue="formData.by_id"
              @update:modelValue="value => formData.by_id = Number(value)"
              :options="contractorOptions"
              placeholder="Select Contractor"
              required
              class="dropdown-modal"
            />
            <span @click="handleContractorOpenModal" class="add-modal-icon"> +</span>
          </div>

          <div>
            <label htmlFor="project_id">Select Project</label>
            <Dropdown
              name="project_id"
              :modelValue="formData.project_id"
              @update:modelValue="value => formData.project_id = Number(value)"
              :options="projectOptions"
              placeholder="Select Project"
              required
              class="dropdown-modal"
            />
          </div>
          <div>
            <label htmlFor="job_id">Job</label>
            <Dropdown
              name="job_id"
              :modelValue="formData.job_id"
              @update:modelValue="value => formData.job_id = Number(value)"
              :options="jobOptions"
              placeholder="Select Job"
              required
              class="dropdown-modal"
            />
            <span @click="handleJobOpenModal" class="add-modal-icon"> +</span>
          </div>

          <input
            id="cost"
            type="number"
            name="cost"
            v-model.number="formData.cost"
            placeholder="Cost"
            autocomplete="off"
            required
            step="0.01"
            class="input"
          />


          <div>
            <label htmlFor="ref">Reference</label>
            <input
              id="ref"
              type="text"
              name="ref"
              v-model="formData.ref"
              placeholder="Ref"
              autocomplete="off"
              class="input"
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              name="description"
              v-model="formData.description"
              placeholder="Description"
              autocomplete="off"
              class="input"
            />
          </div>

          <div>
            <label htmlFor="note">Note</label>
            <input
              id="note"
              type="text"
              name="note"
              v-model="formData.note"
              placeholder="Note"
              autocomplete="off"
              class="input"
            />
          </div>

          <div>
            <strong>Total Already Invoiced Amount:</strong>
            {{ (formData.invoice || []).reduce((total, inv) => total + (inv.cost || 0), 0).toFixed(2) }}
          </div>

          <div>
            <strong>Balance:</strong>
            {{ (originalCost - (formData.invoice || []).reduce((total, inv) => total + (inv.cost || 0), 0)).toFixed(2) }}
          </div>

          <button type="submit" class="button">Save Purchase</button>

          <button
            v-if="(formData.invoice || []).reduce((total, inv) => total + (inv.cost || 0), 0) < originalCost"
            @click.prevent="handleCreateInvoice(originalCost - (formData.invoice || []).reduce((total, inv) => total + (inv.cost || 0), 0))"
            class="button"
          >
            Create Invoice
          </button>
        </form>
      </div>
    </div>

    <JobModalComp
      :show="isJobModalOpen"
      @close="handleJobCloseModal"
      @submit="handleJobSubmit"
      :form-data="formJobData"
      @update:form-data-input="handleJobInputChange"
      @update:form-data-drop="handleJobDropChange"
      :job-category-options="jobCategoryOptions"
      :is-editing="editingJobCode !== null"
      @add-category="handleAddCategory"
    />

    <GeneralModal :show="isContractorModalOpen" @close="handleContractorCloseModal">
      <form @submit.prevent="handleContractorSubmit" class="contractor-form">
        <h3>{{ contractoreditingCode ? 'Edit' : 'Add' }} Contractor</h3>
        <div>
          <label htmlFor="contact_person">Contact Person</label>
          <input
            id="contact_person"
            type="text"
            name="contact_person"
            v-model="formContractorData.contact_person"
            placeholder="Contact Person"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label htmlFor="company_name">Company Name</label>
          <input
            id="company_name"
            type="text"
            name="company_name"
            v-model="formContractorData.company_name"
            placeholder="Company Name"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label htmlFor="phone_number">Phone Number</label>
          <input
            id="phone_number"
            type="text"
            name="phone_number"
            v-model="formContractorData.phone_number"
            placeholder="Phone Number"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            v-model="formContractorData.email"
            placeholder="Email"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label htmlFor="bsb">BSB</label>
          <input
            id="bsb"
            type="text"
            name="bsb"
            v-model="formContractorData.bsb"
            placeholder="BSB"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label htmlFor="account_no">Account Number</label>
          <input
            id="account_no"
            type="text"
            name="account_no"
            v-model="formContractorData.account_no"
            placeholder="Account Number"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label htmlFor="account_name">Account Name</label>
          <input
            id="account_name"
            type="text"
            name="account_name"
            v-model="formContractorData.account_name"
            placeholder="Account Name"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label htmlFor="address">Address</label>
          <input
            id="address"
            type="text"
            name="address"
            v-model="formContractorData.address"
            placeholder="Address"
            autocomplete="off"
            required
            class="input"
          />
        </div>
        <div>
            <label htmlFor="abn">ABN</label>
            <input
              id="abn"
              type="text"
              name="abn"
              v-model="formContractorData.abn"
              placeholder="ABN"
              autocomplete="off"
              required
              class="input"
            />
          </div>

          <div>
            <label htmlFor="gst_registered">GST Registered</label>
            <input
              id="gst_registered"
              type="checkbox"
              name="gst_registered"
              v-model="formContractorData.gst_registered"
              class="checkbox-input"
            />
          </div>

        <button type="submit" class="button">Save Contractor</button>
      </form>
    </GeneralModal>
  </div>
</template>

<style scoped>
/* Base Container Styles */
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
  margin-bottom: 1.5rem;
}

/* Button Row for Search and Add */
.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem; /* Space between search and button */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

/* Form Styles (used in modals) */
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input,
.dropdown-modal {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box; /* Ensures padding doesn't increase width */
}

.checkbox-input {
    width: auto; /* Checkbox should not take full width */
    margin-right: 0.5rem;
}

.button {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: #0056b3;
}

.delete-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5rem; /* Space from other buttons */
  transition: background-color 0.2s ease;
}

.delete-button:hover {
  background-color: #c82333;
}

/* Table Styles (Desktop View) */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden; /* Ensures rounded corners are applied */
}

.th {
  padding: 0.8rem;
  background-color: #007bff;
  color: #fff;
  text-align: left; /* Align headers with content */
}

.td {
  padding: 0.8rem;
  text-align: left; /* Align content left */
  border-bottom: 1px solid #ddd;
}

.table tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

/* List Styles (Mobile View) */
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.list-item strong {
  margin-right: 0.5rem;
}

/* Modal Styles (GeneralModal-like styling for main Purchase modal) */
.modal {
  display: none; /* Hidden by default */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal.show {
  display: flex; /* Show when 'show' class is present */
}

.modal-content-styled {
  background: white;
  margin-top: 50px; /* Adjust as needed */
  padding: 2rem;
  border-radius: 8px;
  max-height: 90vh;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto; /* Enable scrolling for modal content */
}

@media (max-width: 768px) {
  .modal-content-styled {
    width: 95%;
  }
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
}

/* Pagination Specific Styles */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.pagination-container .button {
  margin: 0 5px;
  background-color: #ddd;
  color: #333;
  min-width: 35px; /* Ensures consistent button size */
}

.pagination-container .button.active-page {
  background-color: #007bff;
  color: #fff;
}

/* Inline Elements for + icon next to dropdowns */
.add-modal-icon {
  display: inline-block;
  font-size: 1.5rem;
  cursor: pointer;
  color: #007bff;
  font-weight: bold;
  vertical-align: middle;
  margin-left: 5px; /* Space from dropdown */
}
.add-modal-icon:hover {
  color: #0056b3;
}

.dropdown-modal {
  width: calc(100% - 30px); /* Adjust width to make space for the + icon */
  display: inline-block; /* Keep it inline with the icon */
  vertical-align: middle;
}

/* Styling for invoice list items within table/list */
.invoice-list-item {
  cursor: pointer;
  text-decoration: underline;
  margin-right: 5px;
}
.invoice-list-item:hover {
  color: #0056b3;
}
.text-blue-500 { /* Tailwind-like class for blue text */
  color: #3b82f6; /* A common shade of blue */
}
.underline {
  text-decoration: underline;
}
</style>