<template>
  <div class="container">
    <h2 class="title">Invoice Management</h2>
    
    <div class="button-row">
      <SearchBox :searchTerm="searchTerm" @search-change="handleSearchChange" />
      
      <div class="button-row-flex">
        <button class="btn" @click="handleOpenModal()">Add Invoice</button>
        <button class="btn" @click="exportToCSV">Export to CSV</button>
        <button class="btn" @click="exportToExcel">Export to Excel</button>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-container">
      <button 
        v-for="page in totalPages" 
        :key="page"
        class="btn"
        @click="handlePageChange(page)"
        :style="{
          backgroundColor: currentPage === page ? '#007bff' : '#ddd'
        }"
      >
        {{ page }}
      </button>
      
      <button 
        class="btn bg-blue-500 text-white px-4 py-2 rounded-md"
        @click="handleToggleOutstanding"
      >
        {{ showOutstanding ? "Show All Invoices" : "Show Outstanding" }}
      </button>
    </div>

    <div v-if="isMobileView">
      <ul class="list">
        <li v-for="invoice in paginatedInvoices" :key="invoice.code" class="list-item">
          <button @click="handleViewInv(invoice)" class="text-blue-500">
            Inv#:{{ invoice.code }}
          </button><br />
          <strong>Contact Person:</strong> {{ invoice.contact }} <br />
          <strong>Project:</strong> {{ getProjectLabel(invoice.project_id) }} <br />
          <strong>Supplier Name:</strong> {{ getContractorLabel(invoice.by_id) }} <br />
          <strong>Price:</strong> {{ invoice.cost || 0 }} <br />
          <strong>Job:</strong> {{ getJobLabel(invoice.job_id) }} <br />
          <strong>PO:</strong> 
          <span class="text-blue-500" @click="handleViewPO(invoice.po_id)">
            {{ invoice.po_id }}
          </span> <br />
          <strong>Paid:</strong>
          <span v-if="invoice.pay && invoice.pay.length > 0">
            <span v-for="p in invoice.pay" :key="p.code" class="invoiceList">
              {{ p.amount ? '$' + Number(p.amount)?.toFixed(2) : 0 }}
              <button
                @click="handleViewPay(p.code)"
                class="text-blue-500 cursor-pointer"
              >
                {{ p.code ? 'pay#' + p.code : '' }}
              </button>
            </span>
          </span><br />
          <strong>Outstanding:</strong> $ {{ invoice?.outstanding?.toFixed(2) }} <br />
          <button class="btn" @click="handleOpenModal(invoice)">Edit</button>
          <button class="delete-btn" @click="handleDelete(invoice.code)">Delete</button>
        </li>
      </ul>
    </div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Inv#</th>
          <th>Contact Person</th>
          <th>Project</th>
          <th>Job</th>
          <th>Price</th>
          <th>Supplier</th>
          <th>Ref</th>
          <th>PO</th>
          <th>Paid</th>
          <th>Outstanding</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="invoice in paginatedInvoices" :key="invoice.code">
          <td>
            <button @click="handleViewInv(invoice)" class="text-blue-500">
              {{ invoice.code }}
            </button>
          </td>
          <td>{{ invoice.contact }}</td>
          <td>{{ getProjectLabel(invoice.project_id) }}</td>
          <td>{{ getJobLabel(invoice.job_id) }}</td>
          <td>{{ invoice.cost || 0 }}</td>
          <td>{{ getContractorLabel(invoice.by_id) }}</td>
          <td>{{ invoice.ref }}</td>
          <td>
            <span class="text-blue-500" @click="handleViewPO(invoice.po_id)">
              {{ invoice.po_id }}
            </span>
          </td>
          <td>
            <span v-if="invoice.pay && invoice.pay.length > 0">
              <span v-for="p in invoice.pay" :key="p.code" class="invoiceList">
                ${{ p.amount || 0 }}
                <button 
                  @click="handleViewPay(p.code)"
                  class="text-blue-500 cursor-pointer"
                >
                  {{ p.code }}
                </button>
              </span>
            </span>
          </td>
          <td>
            $ {{ invoice.outstanding?.toFixed(2) }}
          </td>
          <td>
            <button class="btn" @click="handleOpenModal(invoice)">Edit</button>
          </td>
          <td>
            <button class="delete-btn" @click="handleDelete(invoice.code)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Invoice Modal -->
    <div class="modal" v-if="isModalOpen">
      <div class="modal-content">
        <button class="close-btn" @click="handleCloseModal">&times;</button>
        <form @submit.prevent="handleSubmit">
          <div>
            <label for="contact">Contact Person</label>
            <input
              id="contact"
              type="text"
              name="contact"
              v-model="formData.contact"
              placeholder="Contact Person"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="project">Supplier</label>
            <Dropdown
              name="by_id"
              v-model="formData.by_id"
              :options="contractorOptions"
              placeholder="Select Contractor"
              required
            />
            <span @click="handleContractorOpenModal" class="addModal"> +</span>
          </div>

          <div>
            <label for="project">Select Project</label>
            <Dropdown
              name="project_id"
              v-model="formData.project_id"
              :options="projectOptions"
              placeholder="Select Project"
              required
            />
          </div>
          <div>
            <label for="job">Job</label>
            <Dropdown
              name="job_id"
              v-model="formData.job_id"
              :options="jobOptions"
              placeholder="Select Job"
              required
            />
            <span @click="handleJobOpenModal" class="addModal"> +</span>
          </div>

          <div>
            <label for="cost">Cost</label>
            <input
              id="cost"
              type="number"
              name="cost"
              v-model="formData.cost"
              placeholder="Cost"
              autocomplete="off"
              required
              step="0.01"
              class="input"
            />
          </div>

          <div>
            <label for="due_at">Due Date</label>
            <input
              id="due_at"
              type="date"
              name="due_at"
              v-model="formData.due_at"
              placeholder="Due Date"
              autocomplete="off"
            />
          </div>
          <div>
            <label for="description">Description</label>
            <input
              id="description"
              type="text"
              name="description"
              v-model="formData.description"
              placeholder="Description"
              autocomplete="off"
            />
          </div>
          <div>
            <label for="note">Note</label>
            <input
              id="note"
              type="text"
              name="note"
              v-model="formData.note"
              placeholder="Note"
              autocomplete="off"
            />
          </div>
          
          <div>
            <label for="ref">Reference</label>
            <input
              id="ref"
              type="text"
              name="ref"
              v-model="formData.ref"
              placeholder="Ref"
              autocomplete="off"
            />
          </div>

          <button type="submit" class="btn">Save Invoice</button>
        </form>
      </div>
    </div>

    <!-- Job Modal -->
    <JobModal
      :show="isJobModalOpen"
      @close="handleJobCloseModal"
      @submit="handleJobSubmit"
      :formData="formJobData"
      :jobCategoryOptions="jobCategoryOptions"
      :isEditing="editingJobCode !== null"
      @add-category="handleAddCategory"
    />

    <!-- Contractor Modal -->
    <div class="modal" v-if="isContractorModalOpen">
      <div class="modal-content">
        <button class="close-btn" @click="handleContractorCloseModal">&times;</button>
        <form @submit.prevent="handleContractorSubmit">
          <div>
            <label for="contact_person">Contact Person</label>
            <input
              id="contact_person"
              type="text"
              name="contact_person"
              v-model="formContractorData.contact_person"
              placeholder="Contact Person"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="company_name">Company Name</label>
            <input
              id="company_name"
              type="text"
              name="company_name"
              v-model="formContractorData.company_name"
              placeholder="Company Name"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="phone_number">Phone Number</label>
            <input
              id="phone_number"
              type="text"
              name="phone_number"
              v-model="formContractorData.phone_number"
              placeholder="Phone Number"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              v-model="formContractorData.email"
              placeholder="Email"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="bsb">BSB</label>
            <input
              id="bsb"
              type="text"
              name="bsb"
              v-model="formContractorData.bsb"
              placeholder="BSB"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="account_no">Account Number</label>
            <input
              id="account_no"
              type="text"
              name="account_no"
              v-model="formContractorData.account_no"
              placeholder="Account Number"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="account_name">Account Name</label>
            <input
              id="account_name"
              type="text"
              name="account_name"
              v-model="formContractorData.account_name"
              placeholder="Account Name"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              v-model="formContractorData.address"
              placeholder="Address"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="abn">ABN</label>
            <input
              id="abn"
              type="text"
              name="abn"
              v-model="formContractorData.abn"
              placeholder="ABN"
              autocomplete="off"
              required
            />
          </div>

          <div>
            <label for="gst_registered">GST Registered</label>
            <input
              id="gst_registered"
              type="checkbox"
              name="gst_registered"
              v-model="formContractorData.gst_registered"
              placeholder="GST Registered"
              autocomplete="off"
            />
          </div>

          <button type="submit" class="btn">Save Contractor</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import SearchBox from '../components/SearchBox.vue';
import Dropdown from '../components/DropDown.vue';
import JobModal from '../components/JobModal.vue';
import { createInvoice, updateInvoice, deleteInvoice, fetchInvoice, fetchInNPay, fetchCategories as fc, createCategory as ccateg, fetchJobs as fj, createJob as cj, fetchProjects as fp, fetchContractors as ft, createContractor as cc } from "../api";
import { fetchPurchaseDetails, fetchPayDetails } from "../services/DetailService";
import { useCurrentPage, useCurrentRouteParam } from '../composables/useGlobalState';
import { useNavigationService } from '../composables/useNavigationService';

export default {
  components: {
    SearchBox,
    Dropdown,
    JobModal
  },
  setup() {
    // State
    const invoices = ref([]);
    const formData = ref({
      job_id: 0,
      by_id: 0,
      project_id: 0,
      ref: "",
      cost: 0,
      contact: "",
      create_at: new Date(),
      updated_at: new Date(),
      due_at: new Date(),
      note: "",
      description: "",
    });
    const formContractorData = ref({
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
    const formJobData = ref({
      name: "",
      job_category_id: 0,
      description: "",
    });
    const editingCode = ref(null);
    const contractoreditingCode = ref(null);
    const editingJobCode = ref(null);
    const showOutstanding = ref(false);
    const isMobileView = ref(window.innerWidth < 1000);
    const isModalOpen = ref(false);
    const isContractorModalOpen = ref(false);
    const isJobModalOpen = ref(false);
    const searchTerm = ref("");
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const jobCategoryOptions = ref([{ value: 0, label: "" }]);
    const projectOptions = ref([{ value: 0, label: "" }]);
    const contractorOptions = ref([{ value: 0, label: "" }]);
    const jobOptions = ref([{ value: 0, label: "" }]);

    // Computed properties
    const filteredInvoices = computed(() => {
      return invoices.value.filter(invoice => {
        const contractor = contractorOptions.value.find(c => c.value === invoice.by_id);
        const project = projectOptions.value.find(p => p.value === invoice.project_id);
        const job = jobOptions.value.find(j => j.value === invoice.job_id);
        
        if (searchTerm.value.includes("="))
          return (invoice.cost === Number(searchTerm.value.substring(1)));
        else if (searchTerm.value.includes(">"))
          return (invoice.cost > Number(searchTerm.value.substring(1)));
        else if (searchTerm.value.includes("<"))
          return (invoice.cost < Number(searchTerm.value.substring(1)));
        else
          return (
            (invoice.code === Number(searchTerm.value)) ||
            (invoice.ref?.toLowerCase() || "").includes(searchTerm.value.toLowerCase()) ||
            (invoice.contact?.toLowerCase() || "").includes(searchTerm.value.toLowerCase()) ||
            (contractor?.label?.toLowerCase() || "").includes(searchTerm.value.toLowerCase()) ||
            (project?.label?.toLowerCase() || "").includes(searchTerm.value.toLowerCase()) ||
            (job?.label?.toLowerCase() || "").includes(searchTerm.value.toLowerCase())
          );
      });
    });

    const displayedInvoices = computed(() => {
      return showOutstanding.value
        ? filteredInvoices.value.filter(invoice => (invoice.outstanding ?? 0) > 0)
        : filteredInvoices.value;
    });

    const paginatedInvoices = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = currentPage.value * itemsPerPage;
      return displayedInvoices.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(displayedInvoices.value.length / itemsPerPage);
    });

    // Methods
    const fetchInvoices = async () => {
      try {
        const data = await fetchInNPay();
        if (data.error) throw data.error;

        const invoicesWithPaid = data.map(invoice => ({
          ...invoice,
          paid: invoice.pay?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0,
          outstanding: (Number(invoice.cost) || 0) - (invoice.pay?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0)
        }));

        invoices.value = invoicesWithPaid;
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const data = await fp();
        const transformedData = data.map(item => ({
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
        const data = await ft();
        const transformedData = data.map(item => ({
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
        const jobData = await fj();
        const transformedData = jobData?.map(item => ({
          value: item.code,
          label: item.name,
        }));
        jobOptions.value = transformedData || [];
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await fc();
        const transformedData = data.map(item => ({
          value: item.code,
          label: item.name,
        }));
        jobCategoryOptions.value = transformedData;
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const handlePageChange = (newPage) => {
      currentPage.value = newPage;
    };

    const handleToggleOutstanding = () => {
      showOutstanding.value = !showOutstanding.value;
    };

    const handleSearchChange = (e) => {
      currentPage.value = 1;
      searchTerm.value = e.target.value.toLowerCase();
    };

    const handleOpenModal = (invoice = null) => {
      if (invoice) {
        handleEdit(invoice);
      }
      isModalOpen.value = true;
    };

    const handleCloseModal = () => {
      formData.value = {
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
      };
      editingCode.value = null;
      isModalOpen.value = false;
    };

    const handleContractorCloseModal = () => {
      formContractorData.value = {
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
      };
      contractoreditingCode.value = null;
      isContractorModalOpen.value = false;
    };

    const handleJobOpenModal = () => {
      isJobModalOpen.value = true;
    };

    const handleJobCloseModal = () => {
      formJobData.value = {
        name: "",
        job_category_id: 0,
        description: "",
      };
      editingJobCode.value = null;
      isJobModalOpen.value = false;
    };

    const handleSubmit = async () => {
      try {
        if (editingCode.value !== null) {
          const data = await updateInvoice(editingCode.value, formData.value);
          if (data.error) {
            alert('Only current month transactions are allowed to be updated or there are no matching rows');
            throw data.error;
          }
          alert("Invoice updated successfully");
          editingCode.value = null;
        } else {
          const data = await createInvoice(formData.value);
          if (data.error) {
            alert('failed to add Invoice, please check the data or try again later');
          }
          alert("Invoice added successfully");
        }
        fetchInvoices();
        handleCloseModal();
      } catch (error) {
        console.error("Error saving Invoice:", error);
      }
    };

    const handleContractorSubmit = async () => {
      try {
        const data = await cc(formContractorData.value);
        if (data.error) {
          alert('failed to add contractor, please check the data or try again later');
          throw data.error;
        }
        fetchContractors();
        handleContractorCloseModal();
      } catch (error) {
        console.error("Error saving contractor:", error);
      }
    };

    const handleContractorOpenModal = () => {
      isContractorModalOpen.value = true;
    };

    const handleEdit = (invoice) => {
      editingCode.value = invoice.code;
      formData.value = {
        job_id: invoice.job_id,
        by_id: invoice.by_id,
        project_id: invoice.project_id,
        ref: invoice.ref,
        cost: invoice.cost,
        contact: invoice.contact,
        description: invoice.description,
        note: invoice.note,
        create_at: invoice.create_at,
        updated_at: invoice.updated_at,
        due_at: invoice.due_at,
      };
    };

    const handleDelete = async (code) => {
      try {
        const data = await deleteInvoice(code);
        // if (data.error) {
        //   alert('cannot delete Invoice, please check the data or try again later');
        //   throw data.error;
        // }
        alert("Invoice deleted successfully");
        fetchInvoices();
      } catch (error) {
        console.error("Error deleting Invoice:", error);
      }
    };

    const handleJobSubmit = async () => {
      try {
        const data = await cj(formJobData.value);
        if (data.error) {
          alert('failed to add job, please check the data or try again later');
          throw data.error;
        }
        handleJobCloseModal();
        fetchJobs();
      } catch (error) {
        console.error("Error saving job:", error);
      }
    };

    const handleAddCategory = async (newCategory) => {
      try {
        const data = await ccateg({ name: newCategory.label });
        if (data.error) {
          alert('failed to add category, please check the data or try again later');
        }
        if (data && data.length > 0) {
          const addedCategory = data[0];
          jobCategoryOptions.value = [
            ...jobCategoryOptions.value,
            { value: addedCategory.code, label: addedCategory.name },
          ];
        }
        fetchCategories();
      } catch (error) {
        console.error("Error adding category:", error);
      }
    };

    const exportToCSV = () => {
      const headers = ["Inv#", "Contact Person", "Project", "Job", "Price", "Supplier", "Ref", "PO", "Paid Total", "Outstanding","Paid History"];
      
      const csvRows = [
          headers.join(","),
          ...displayedInvoices.value.map(invoice => [
              invoice.code,
              invoice.contact,
              getProjectLabel(invoice.project_id),
              getJobLabel(invoice.job_id),
              invoice.cost || 0,
              getContractorLabel(invoice.by_id),
              invoice.ref,
              invoice.po_id,
              invoice.pay?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0,
              invoice.outstanding || 0,
              invoice.pay?.map(p => `$${p.amount || 0} (pay#${p.code})`).join(" | ") || "N/A",
          ].join(","))
      ].join("\n");

      const blob = new Blob([csvRows], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Invoices.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const exportToExcel = () => {
      const ws = XLSX.utils.json_to_sheet(
        displayedInvoices.value.map(invoice => ({
          "Inv#": invoice.code,
          "Contact Person": invoice.contact,
          "Project": getProjectLabel(invoice.project_id),
          "Job": getJobLabel(invoice.job_id),
          "Price": invoice.cost || 0,
          "Supplier": getContractorLabel(invoice.by_id),
          "Ref": invoice.ref,
          "PO": invoice.po_id,
          "Paid Total": invoice.pay?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0,
          "Outstanding": invoice.outstanding || 0,
          "Paid History": invoice.pay?.map(p => `$${p.amount || 0} (pay#${p.code})`).join(" | ") || "N/A",
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Invoices");
      XLSX.writeFile(wb, "Invoices.xlsx");
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const getProjectLabel = (id) => {
      const project = projectOptions.value.find(option => option.value === id);
      return project ? project.label : "Unknown";
    };

    const getContractorLabel = (id) => {
      const contractor = contractorOptions.value.find(option => option.value === id);
      return contractor ? contractor.label : "Unknown";
    };

    const getJobLabel = (id) => {
      const job = jobOptions.value.find(option => option.value === id);
      return job ? job.label : "Unknown";
    };
    const { handleViewPurchase } = useNavigationService();
    const handleViewPO = async (poId) => {
      try {
        const purchase = await fetchPurchaseDetails(poId || 0);
   
        console.log("Purchase details in invoice page:", purchase);
        if (!purchase) {
          console.error(`Purchase record not found for PO code: ${poId}`);
          return;
        } else if (typeof purchase.cost === "string") {
          purchase.cost = parseFloat(purchase.cost);
        }
        handleViewPurchase(purchase);
      } catch (error) {
        console.error("Error fetching purchase details:", error);
      }
    };

    const { handleViewInvoice } = useNavigationService();
    const handleViewInv = async (invoice) => {
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


    const handleViewPay = async (payId) => {
      try {
        const pay = await fetchPayDetails(payId);
        if (pay) {
          handleViewPay(pay);
        } else {
          console.error(`Pay record not found for pay code: ${payId}`);
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchInvoices();
      fetchProjects();
      fetchContractors();
      fetchJobs();
      fetchCategories();

      const handleResize = () => {
        isMobileView.value = window.innerWidth < 1000;
      };
      window.addEventListener('resize', handleResize);
    });

    return {
      // State
      invoices,
      formData,
      formContractorData,
      formJobData,
      editingCode,
      contractoreditingCode,
      editingJobCode,
      showOutstanding,
      isMobileView,
      isModalOpen,
      isContractorModalOpen,
      isJobModalOpen,
      searchTerm,
      currentPage,
      itemsPerPage,
      jobCategoryOptions,
      projectOptions,
      contractorOptions,
      jobOptions,
      
      // Computed
      filteredInvoices,
      displayedInvoices,
      paginatedInvoices,
      totalPages,
      
      // Methods
      fetchInvoices,
      fetchProjects,
      fetchContractors,
      fetchJobs,
      fetchCategories,
      handlePageChange,
      handleToggleOutstanding,
      handleSearchChange,
      handleOpenModal,
      handleCloseModal,
      handleContractorCloseModal,
      handleJobOpenModal,
      handleJobCloseModal,
      handleSubmit,
      handleContractorSubmit,
      handleContractorOpenModal,
      handleEdit,
      handleDelete,
      handleJobSubmit,
      handleAddCategory,
      exportToCSV,
      exportToExcel,
      formatDate,
      getProjectLabel,
      getContractorLabel,
      getJobLabel,
      handleViewPO,
      handleViewPay,
      handleViewInv,
    };
  },
};
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

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn {
  padding: 0.8rem;
  margin-right: 1rem;
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
  flex-wrap: wrap;
}

.button-row-flex {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 1000px) {
  .button-row {
    flex-direction: column;
    align-items: stretch;
  }
  .button-row-flex {
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
}

th {
  padding: 0.8rem;
  background-color: #007bff;
  color: #fff;
}

td {
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  margin-top: 50px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.addModal {
  cursor: pointer;
  color: #007bff;
  font-weight: bold;
  margin-left: 0.5rem;
}

.invoiceList {
  margin-right: 0.5rem;
}

.text-blue-500 {
  color: #3b82f6;
}

.cursor-pointer {
  cursor: pointer;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }
}
</style>