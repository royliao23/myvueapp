// Category.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import Modal from '../components/Modal.vue'; // Assuming you'll create a Vue Modal component
import SearchBox from '../components/SearchBox.vue'; // Assuming you'll create a Vue SearchBox component
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api'; // Your existing API functions
import type { Categ } from '../models'; // Your existing model

// Reactive state
const categories = ref<Categ[]>([]);
const formData = ref<Omit<Categ, 'code'>>({
  name: '',
});
const editingCode = ref<number | null>(null); // Track which category is being edited
const isMobileView = ref<boolean>(window.innerWidth < 1000);
const isModalOpen = ref<boolean>(false);
const searchTerm = ref<string>('');

// Fetch categories data
const fetchCategoriesData = async () => {
  try {
    const data = await fetchCategories();
    categories.value = data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// Lifecycle hook: onMounted is similar to React's useEffect with an empty dependency array
onMounted(() => {
  fetchCategoriesData();
  window.addEventListener('resize', handleResize);
});

// Lifecycle hook: onUnmounted is similar to React's useEffect cleanup
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Watch for changes in isModalOpen to toggle body scroll
const toggleBodyScroll = () => {
  if (isModalOpen.value) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
};

// We need to trigger this effect whenever isModalOpen changes.
// Vue's `watch` or `watchEffect` can be used for this.
// `watch` is more explicit when you care about specific dependencies.
import { watch } from 'vue';
watch(isModalOpen, toggleBodyScroll);

// Handle window resize for mobile view
const handleResize = () => {
  isMobileView.value = window.innerWidth < 1000;
};

// Handle form submission
const handleSubmit = async () => {
  try {
    if (editingCode.value !== null) {
      // Update an existing category
      await updateCategory(editingCode.value, formData.value);
      editingCode.value = null;
    } else {
      // Add a new category
      await createCategory(formData.value);
    }

    // Refresh the list and reset the form
    await fetchCategoriesData(); // Await ensures data is fresh before closing modal
    handleCloseModal();
  } catch (error) {
    console.error('Error saving category:', error);
  }
};

// Handle category deletion
const handleDelete = async (code: number) => {
  try {
    await deleteCategory(code);
    fetchCategoriesData(); // Refresh the list
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

// Open the modal, optionally for editing
const handleOpenModal = (category?: Categ) => {
  if (category) {
    handleEdit(category);
  }
  isModalOpen.value = true;
};

// Close the modal and reset form data
const handleCloseModal = () => {
  formData.value = { name: '' };
  editingCode.value = null;
  isModalOpen.value = false;
};

// Set form data for editing a category
const handleEdit = (category: Categ) => {
  editingCode.value = category.code;
  formData.value = { name: category.name };
};

// Handle search input change
const handleSearchChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchTerm.value = target.value?.toLowerCase();
};

// Filter categories dynamically based on the search term (computed property)
const filteredCategories = computed(() => {
  return categories.value.filter((category) => {
    return category.name?.toLowerCase().includes(searchTerm.value);
  });
});

// Handle form input change
const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  formData.value = { ...formData.value, [target.name]: target.value };
};
</script>

<template>
  <div class="container">
    <h2 class="title">Category Management</h2>
    <div class="button-row">
      <SearchBox v-model="searchTerm" />
      <button class="button" @click="handleOpenModal()">Add Category</button>
    </div>

    <div v-if="isMobileView">
      <ul class="list">
        <li v-for="category in filteredCategories" :key="category.code" class="list-item">
          <strong>Code:</strong> {{ category.code }} <br />
          <strong>Category Name:</strong> {{ category.name }} <br />
          <button class="button" @click="handleOpenModal(category)">Edit</button>
          <button class="delete-button" @click="handleDelete(category.code)">Delete</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th class="th">Code</th>
            <th class="th">Category Name</th>
            <th class="th">Edit</th>
            <th class="th">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in filteredCategories" :key="category.code">
            <td class="td">{{ category.code }}</td>
            <td class="td">{{ category.name }}</td>
            <td class="td">
              <button class="button" @click="handleOpenModal(category)">Edit</button>
            </td>
            <td class="td">
              <button class="delete-button" @click="handleDelete(category.code)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :show="isModalOpen" @close="handleCloseModal">
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            v-model="formData.name"
            placeholder="Name"
            autocomplete="off"
            required
            class="input"
          />
        </div>
        <button type="submit" class="button">Save Category</button>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
/* Styled Components equivalents in Vue's scoped style */
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
  width: 100%; /* Add width for better form input appearance */
  box-sizing: border-box; /* Include padding in the element's total width */
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
  margin-left: 0.5rem; /* Added for spacing */
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
</style>