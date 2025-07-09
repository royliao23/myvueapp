// Contractor.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import Modal from '../components/Modal.vue'; // Assuming you have a Vue Modal component
import SearchBox from '../components/SearchBox.vue'; // Assuming you have a Vue SearchBox component
import {
  createContractor,
  deleteContractor,
  fetchContractors,
  updateContractor,
} from '../api'; // Your existing API functions
import type { Contractor } from '../models'; // Your existing model

// Reactive state
const contractors = ref<Contractor[]>([]);
const formData = ref<Omit<Contractor, 'code'>>({
  contact_person: '',
  company_name: '',
  phone_number: '',
  email: '',
  bsb: '',
  account_no: '',
  account_name: '',
  address: '',
  abn: '',
  gst_registered: false,
});
const editingCode = ref<number | null>(null);
const isMobileView = ref<boolean>(window.innerWidth < 1000);
const isModalOpen = ref<boolean>(false);
const searchTerm = ref<string>('');
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(5);

// --- Data Loading ---
const loadContractors = async () => {
  try {
    const data = await fetchContractors();
    contractors.value = data || [];
  } catch (error) {
    console.error('Error fetching contractors:', error);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  loadContractors();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.body.classList.remove('no-scroll'); // Ensure cleanup on unmount
  window.removeEventListener('resize', handleResize);
});

// Watcher for modal open/close to manage body scroll class
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

const handleSearchChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchTerm.value = target.value?.toLowerCase();
  currentPage.value = 1; // Reset to first page on search
};

const handleOpenModal = (contractor?: Contractor) => {
  if (contractor) {
    handleEdit(contractor);
  } else {
    // Reset form for new contractor
    formData.value = {
      contact_person: '',
      company_name: '',
      phone_number: '',
      email: '',
      bsb: '',
      account_no: '',
      account_name: '',
      address: '',
      abn: '',
      gst_registered: false, // Default for new contractor
    };
    editingCode.value = null;
  }
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  formData.value = {
    contact_person: '',
    company_name: '',
    phone_number: '',
    email: '',
    bsb: '',
    account_no: '',
    account_name: '',
    address: '',
    abn: '',
    gst_registered: false,
  };
  editingCode.value = null;
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  try {
    if (editingCode.value !== null) {
      await updateContractor(editingCode.value, formData.value);
      editingCode.value = null;
    } else {
      await createContractor(formData.value);
    }
    await loadContractors(); // Await data refresh
    handleCloseModal();
  } catch (error) {
    console.error('Error saving contractor:', error);
  }
};

const handleEdit = (contractor: Contractor) => {
  editingCode.value = contractor.code;
  formData.value = { ...contractor }; // Spread to copy all properties
};

const handleDelete = async (code: number) => {
  try {
    await deleteContractor(code);
    await loadContractors(); // Await data refresh
  } catch (error) {
    console.error('Error deleting contractor:', error);
  }
};

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
};

// Handle generic input change (for text inputs)
const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  formData.value = { ...formData.value, [target.name]: target.value };
};

// Handle checkbox input change specifically
const handleContractorCheckBoxChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const { name, type, checked, value } = target;
  formData.value = {
    ...formData.value,
    [name]: type === 'checkbox' ? checked : value,
  };
};

// --- Computed Properties ---
const filteredContractors = computed(() => {
  return contractors.value.filter((contractor) => {
    const term = searchTerm.value;
    return (
      contractor.contact_person.toLowerCase().includes(term) ||
      contractor.company_name.toLowerCase().includes(term) ||
      contractor.email.toLowerCase().includes(term) ||
      contractor.phone_number.includes(term)
    );
  });
});

const paginatedContractors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = currentPage.value * itemsPerPage.value;
  return filteredContractors.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredContractors.value.length / itemsPerPage.value);
});
</script>

<template>
  <div class="container">
    <h2 class="title">Contractor Management</h2>
    <div class="button-row">
      <SearchBox v-model="searchTerm" />
      <button class="button" @click="handleOpenModal()">Add Contractor</button>
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
        <li v-for="contractor in paginatedContractors" :key="contractor.code" class="list-item">
          <strong>Code:</strong> {{ contractor.code }} <br />
          <strong>Contact Person:</strong> {{ contractor.contact_person }} <br />
          <strong>Company Name:</strong> {{ contractor.company_name }} <br />
          <strong>Phone Number:</strong> {{ contractor.phone_number }} <br />
          <strong>Email:</strong> {{ contractor.email }} <br />
          <button class="button" @click="handleOpenModal(contractor)">Edit</button>
          <button class="delete-button" @click="handleDelete(contractor.code)">Delete</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th class="th">Code</th>
            <th class="th">Contact Person</th>
            <th class="th">Company Name</th>
            <th class="th">Phone Number</th>
            <th class="th">Email</th>
            <th class="th">Edit</th>
            <th class="th">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contractor in paginatedContractors" :key="contractor.code">
            <td class="td">{{ contractor.code }}</td>
            <td class="td">{{ contractor.contact_person }}</td>
            <td class="td">{{ contractor.company_name }}</td>
            <td class="td">{{ contractor.phone_number }}</td>
            <td class="td">{{ contractor.email }}</td>
            <td class="td">
              <button class="button" @click="handleOpenModal(contractor)">Edit</button>
            </td>
            <td class="td">
              <button class="delete-button" @click="handleDelete(contractor.code)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :show="isModalOpen" @close="handleCloseModal">
      <form @submit.prevent="handleSubmit" class="form">
        <div>
          <label for="contact_person">Contact Person</label>
          <input
            id="contact_person"
            type="text"
            name="contact_person"
            v-model="formData.contact_person"
            placeholder="Contact Person"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="company_name">Company Name</label>
          <input
            id="company_name"
            type="text"
            name="company_name"
            v-model="formData.company_name"
            placeholder="Company Name"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="phone_number">Phone Number</label>
          <input
            id="phone_number"
            type="text"
            name="phone_number"
            v-model="formData.phone_number"
            placeholder="Phone Number"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            v-model="formData.email"
            placeholder="Email"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="bsb">BSB</label>
          <input
            id="bsb"
            type="text"
            name="bsb"
            v-model="formData.bsb"
            placeholder="BSB"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="account_no">Account Number</label>
          <input
            id="account_no"
            type="text"
            name="account_no"
            v-model="formData.account_no"
            placeholder="Account Number"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="account_name">Account Name</label>
          <input
            id="account_name"
            type="text"
            name="account_name"
            v-model="formData.account_name"
            placeholder="Account Name"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="address">Address</label>
          <input
            id="address"
            type="text"
            name="address"
            v-model="formData.address"
            placeholder="Address"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="abn">ABN</label>
          <input
            id="abn"
            type="text"
            name="abn"
            v-model="formData.abn"
            placeholder="ABN"
            autocomplete="off"
            required
            class="input"
          />
        </div>

        <div>
          <label for="gst_registered">GST Registered</label>
          <input
            id="gst_registered"
            type="checkbox"
            name="gst_registered"
            v-model="formData.gst_registered"
            class="input-checkbox"
          />
        </div>

        <button type="submit" class="button">Save Contractor</button>
      </form>
    </Modal>
  </div>
</template>

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

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

/* Specific style for checkbox input */
.input-checkbox {
  width: auto; /* Checkboxes shouldn't take full width */
  margin-right: 0.5rem; /* Add some spacing */
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