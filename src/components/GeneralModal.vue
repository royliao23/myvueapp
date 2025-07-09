<script setup lang="ts">
import { watch } from 'vue';

// Define the props that this component expects
interface GeneralModalProps {
  show: boolean; // Controls modal visibility
}

const props = defineProps<GeneralModalProps>();

// Define the custom events this component can emit
const emit = defineEmits<{
  (e: 'close'): void; // Emitted when the close button is clicked
}>();

// Emit the 'close' event when the close button is clicked
const handleClose = () => {
  emit('close');
};

// Watch for changes in the 'show' prop to manage the 'no-scroll' class on the body
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
}, { immediate: true }); // Run immediately when the component is mounted
</script>

<template>
  <div class="modal-wrapper" :class="{ show: show }">
    <div class="modal-content">
      <button class="close-button" @click="handleClose">&times;</button>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
/* Styling for the modal wrapper (overlay) */
.modal-wrapper {
  display: none; /* Hidden by default */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top of other content */
}

/* Class to show the modal */
.modal-wrapper.show {
  display: flex;
}

/* Styling for the actual modal content box */
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-height: 90vh; /* Max height to allow scrolling for large content */
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto; /* Enable vertical scrolling if content overflows */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }
}

/* Styling for the close button */
.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10; /* Ensure button is above modal content */
}
</style>