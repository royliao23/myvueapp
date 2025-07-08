<!-- src/components/SearchBox.vue -->
<template>
  <input
    type="text"
    class="search-input"
    placeholder="Search ..."
    :value="modelValue"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
// Using Vue's recommended v-model pattern
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.search-input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
}
</style>