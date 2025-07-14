<template>
  <input 
    type="file" 
    accept=".csv" 
    @change="handleFileChange"
    class="csv-uploader"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { BankRecord } from '../models';

export default defineComponent({
  name: 'CSVUploader',
  emits: ['upload'],
  setup(props, { emit }) {
    const handleFileChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").slice(1); // Skip header
        const records = lines.map((line: string, index: number) => {
          const [date, amount, description] = line.split(",");
          return {
            id: index + 1,
            date: date?.trim() || '',
            amount: parseFloat(amount || '0') || 0,
            description: description?.trim() || '',
          } as BankRecord;
        }).filter(record => record.date);

        emit('upload', records);
      };
      reader.readAsText(file);
    };

    return {
      handleFileChange
    };
  }
});
</script>

<style scoped>
.csv-uploader {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>