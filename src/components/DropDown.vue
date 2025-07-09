<script setup lang="ts">
import { computed } from 'vue';

// Define the shape of a dropdown option
interface DropdownOption {
  value: string | number;
  label: string;
}

// Define the props that this component accepts
const props = defineProps<{
  name: string;
  modelValue: string | number; // This is the standard prop name for v-model in Vue 3
  options: DropdownOption[];
  placeholder?: string;
  required?: boolean;
}>();

// Define the events this component can emit
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void; // Standard event for v-model
}>();

// Handle the change event from the <select> element
const handleChange = (event: Event) => {
  // Cast the event target to an HTMLSelectElement to access its value
  const selectedValue = (event.target as HTMLSelectElement).value;
  // Emit the 'update:modelValue' event with the new value
  // This allows v-model to work seamlessly with the component
  emit('update:modelValue', selectedValue);
};

// Computed property to determine the placeholder text, defaulting if not provided
const displayPlaceholder = computed(() => props.placeholder || "Select an option");
</script>

<template>
  <select
    :name="name"
    :value="modelValue"
    @change="handleChange"
    :required="required"
    class="dropdown-select"
  >
    <option value="" disabled selected>
      {{ displayPlaceholder }}
    </option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
/* Basic styling for the dropdown */
.dropdown-select {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box; /* Ensures padding doesn't add to the width */
  background-color: #fff;
  cursor: pointer;
  appearance: none; /* Remove default browser styling for select */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%204%205%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M2%200L0%202h4zm0%205L0%203h4z%22%2F%3E%3C%2Fsvg%3E'); /* Custom arrow */
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%, 0 0;
  background-size: 0.65em auto, 100%;
}

.dropdown-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>