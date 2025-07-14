<template>
  <div class="pagination-container">
    <button
      v-for="page in totalPages"
      :key="page"
      class="page-button"
      @click="emitPageChange(page)"
      :style="{
        backgroundColor: currentPage === page ? '#007bff' : '#ddd'
      }"
    >
      {{ page }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Pagination',
  props: {
    totalPages: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const emitPageChange = (page: number) => {
      emit('page-change', page);
    };

    return {
      emitPageChange
    };
  }
});
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.page-button {
  margin: 0 5px;
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  transition: background-color 0.3s;
}

.page-button:hover {
  background-color: #007bff;
  color: white;
}
</style>