<script setup lang="ts">
import { ref, watch } from 'vue';
// Make sure GeneralModal.vue exists in the same folder, or update the path if it's elsewhere
import GeneralModal from './GeneralModal.vue'; // Your general purpose modal component

// Define the props that this component expects from its parent (Job.vue)
interface JobModalProps {
  show: boolean;
  formData: {
    job_category_id: number;
    name: string;
    description: string;
  };
  jobCategoryOptions: { value: number; label: string }[];
  isEditing: boolean;
}

const props = defineProps<JobModalProps>();

// Define the custom events that this component can emit to its parent
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
  (e: 'update:form-data-input', event: Event): void; // For text inputs
  (e: 'update:form-data-drop', event: Event): void; // For select/dropdown
  (e: 'add-category', newCategoryName: string): void; // When a new category is added
}>();

// --- Local State for Nested Category Modal ---
const isCategoryModalOpen = ref(false); // State for the nested modal
const newCategoryName = ref(''); // State for new category name input

// --- Event Handlers for Job Modal ---
const handleClose = () => {
  emit('close');
};

const handleSubmit = () => {
  emit('submit');
};

const handleInputChange = (event: Event) => {
  emit('update:form-data-input', event);
};

const handleDropChange = (event: Event) => {
  emit('update:form-data-drop', event);
};

// --- Event Handlers for Nested Category Modal ---
const handleOpenCategoryModal = () => {
  isCategoryModalOpen.value = true;
};

const handleCloseCategoryModal = () => {
  isCategoryModalOpen.value = false;
  newCategoryName.value = ''; // Reset the input field
};

const handleAddCategory = () => {
  if (newCategoryName.value.trim()) {
    // Emit the new category name to the parent for actual API call
    emit('add-category', newCategoryName.value.trim());
    handleCloseCategoryModal();
  }
};

// Watch for changes in the 'show' prop to manage body scroll class,
// although it's more common to handle this in the parent for top-level modals.
// If GeneralModal already handles this, you can remove this watch.
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.classList.add("no-scroll");
  } else {
    document.body.classList.remove("no-scroll");
  }
}, { immediate: true }); // Run immediately on component mount
</script>

<template>
  <div class="modal" :class="{ show: show }">
    <div class="modal-content-wrapper">
      <button class="close-button" @click="handleClose">&times;</button>
      <form @submit.prevent="handleSubmit">
        <label>
          Job Category:
          <select
            name="job_category_id"
            :value="formData.job_category_id"
            @change="handleDropChange"
            class="dropdown"
          >
            <option value="0">Please Select</option>
            <option
              v-for="option in jobCategoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <span @click="handleOpenCategoryModal" class="add-modal-icon">+</span>
        </label>

        <label>
          Name:
          <input
            type="text"
            name="name"
            :value="formData.name"
            @input="handleInputChange"
            class="input"
            required
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="description"
            :value="formData.description"
            @input="handleInputChange"
            class="input"
            required
          />
        </label>
        <button type="submit" class="button">
          {{ isEditing ? "Update Job" : "Add Job" }}
        </button>
      </form>
    </div>
  </div>

  <GeneralModal :show="isCategoryModalOpen" @close="handleCloseCategoryModal">
    <h3>Add New Category</h3>
    <input
      type="text"
      placeholder="Enter category name"
      v-model="newCategoryName"
      class="input"
    />
    <button @click="handleAddCategory" class="button">Add Category</button>
  </GeneralModal>
</template>

<style scoped>
/* Styles for the main modal container */
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

.modal-content-wrapper {
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
  .modal-content-wrapper {
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
  z-index: 10; /* Ensure it's above other content */
}

.input, .dropdown {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%; /* Take full width */
  box-sizing: border-box; /* Include padding in width */
  margin-bottom: 1rem; /* Spacing between inputs */
}

.dropdown {
  width: calc(90% - 25px); /* Adjust based on + icon width */
  display: inline-block; /* Allow + icon to be next to it */
  vertical-align: middle; /* Align with the + icon */
}

.button {
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem; /* Spacing above button */
  width: 100%; /* Make button full width */
}
.button:hover {
  background-color: #0056b3;
}

label {
  display: block; /* Make labels take full width for stacking */
  margin-bottom: 0.5rem; /* Spacing between labels/inputs */
  font-weight: bold;
}

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
</style>