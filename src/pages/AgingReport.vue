<template>
  <div class="container">
    <h2 class="title">Creditor Aging Report</h2>
    <div class="button-row">
      <!-- <SearchBox :searchTerm="searchTerm" @update:searchTerm="handleSearchChange" /> -->
      <SearchBox v-model="searchTerm" />
      <button class="print-button" @click="handlePrint">Print Report</button>
    </div>

    <Pagination
      v-if="!isPrinting"
      :totalPages="totalPages"
      :currentPage="currentPage"
      @page-change="handlePageChange"
    />

    <div ref="printRef">
      <table class="report-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Due Date</th>
            <th>Invoice Code</th>
            <th>Reference</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Aging Bucket</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in itemsToDisplay" :key="invoice.code">
            <td>{{ invoice.contractor?.company_name }}</td>
            <td>{{ formatDate(invoice.due_at.toString()) }}</td>
            <td>{{ invoice.code }}</td>
            <td>{{ invoice.ref }}</td>
            <td>${{ invoice.cost || 0 }}</td>
            <td>${{ invoice.totalPaid.toFixed(2) }}</td>
            <td>${{ invoice.amountDue.toFixed(2) }}</td>
            <td>{{ invoice.agingBucket }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import SearchBox from '../components/SearchBox.vue';
import Pagination from '../components/Pagination.vue';
import { fetchAgingReport as fa } from '../api';
import type { AgeInvoice } from '../models';

export default defineComponent({
  name: 'AgingReport',
  components: {
    SearchBox,
    Pagination
  },
  setup() {
    const invoices = ref<AgeInvoice[]>([]);
    const loading = ref(true);
    const searchTerm = ref('');
    const isPrinting = ref(false);
    const printRef = ref<HTMLDivElement | null>(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const fetchAgingReport = async () => {
      loading.value = true;
      let data: AgeInvoice[] = [];
      try {
        data = await fa();
        if (!data || !Array.isArray(data)) {
        console.error("Invalid data format");
        loading.value = false;
        return;
      }
    } catch (error) {
      console.error("Error importing fetchAgingReport:", error);
      loading.value = false;
      return;
    }
   

      const today = new Date();
      const invoicesProcessed = data.map((invoice: any) => {
        const totalPaid = invoice.pay 
          ? invoice.pay.reduce((sum: number, p: any) => sum + p.amount, 0) 
          : 0;
        const amountDue = invoice.cost - totalPaid;

        let agingBucket;
        const daysPastDue = (new Date(invoice.due_at as string).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        if (daysPastDue >= 0) agingBucket = "Current";
        else if (daysPastDue >= -30) agingBucket = "1-30 Days";
        else if (daysPastDue >= -60) agingBucket = "31-60 Days";
        else if (daysPastDue >= -90) agingBucket = "60+ Days";
        else agingBucket = "90+ Days";

        return {
          ...invoice,
          totalPaid,
          amountDue,
          agingBucket,
        };
      });

      invoices.value = invoicesProcessed;
      loading.value = false;
    };

    onMounted(() => {
      fetchAgingReport();
    });

    const displayedInvoices = computed(() => {
      return invoices.value.filter(invoice => 
        invoice.contractor?.company_name?.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    });

    const paginatedReport = computed(() => {
      return displayedInvoices.value.slice(
        (currentPage.value - 1) * itemsPerPage.value,
        currentPage.value * itemsPerPage.value
      );
    });

    const totalPages = computed(() => {
      return Math.ceil(displayedInvoices.value.length / itemsPerPage.value);
    });

    const itemsToDisplay = computed(() => {
      return isPrinting.value ? displayedInvoices.value : paginatedReport.value;
    });

    const handleSearchChange = (value: string) => {
      searchTerm.value = value;
      currentPage.value = 1; // Reset to first page when searching
    };

    const handlePrint = () => {
      isPrinting.value = true;
      setTimeout(() => {
        window.print();
        isPrinting.value = false;
      }, 100);
    };

    const handlePageChange = (newPage: number) => {
      currentPage.value = newPage;
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
    };

    return {
      invoices,
      loading,
      searchTerm,
      isPrinting,
      printRef,
      currentPage,
      itemsPerPage,
      displayedInvoices,
      paginatedReport,
      totalPages,
      itemsToDisplay,
      handleSearchChange,
      handlePrint,
      handlePageChange,
      formatDate
    };
  }
});
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

.print-button {
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

.print-button:hover {
  background-color: #0056b3;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  font-size: 1rem;
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

@media print {
  .print-button, .button-row {
    display: none;
  }
}

@media (max-width: 1000px) {
  .report-table {
    font-size: 0.6rem;
  }
  
  th, td {
    padding: 0.3rem;
    font-size: 0.6rem;
  }
}
</style>