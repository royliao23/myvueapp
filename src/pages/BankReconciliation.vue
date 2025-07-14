<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">Bank Reconciliation</v-card-title>
          
          <!-- Upload Section -->
          <v-card-text>
            <v-card outlined class="mb-6">
              <v-card-title class="text-h6">Upload Bank Statement</v-card-title>
              <v-card-text>
                <CSVUploader @upload="handleUpload" />
              </v-card-text>
            </v-card>

            <!-- Bank Transactions Table -->
            <v-card outlined class="mb-6">
              <v-card-title class="text-h6">Bank Transactions</v-card-title>
              <v-data-table
                :headers="bankHeaders"
                :items="bankRecords"
                :items-per-page="10"
                class="elevation-1"
              ></v-data-table>
            </v-card>

            <!-- Invoices Table -->
            <v-card outlined class="mb-6">
              <v-card-title class="text-h6">Invoices</v-card-title>
              <v-progress-linear
                v-if="loading"
                indeterminate
                color="primary"
              ></v-progress-linear>
              <v-alert
                v-else-if="error"
                type="error"
              >
                {{ error }}
              </v-alert>
              <v-data-table
                v-else
                :headers="invoiceHeaders"
                :items="invoices"
                :items-per-page="10"
                class="elevation-1"
              >
                <template #[`item.code`]="{ item }">
                  <span :class="{ 'text-decoration-line-through text-grey': isMatched(item) }">
                    {{ item.code }}
                  </span>
                </template>
                <template #[`item.amount`]="{ item }">
                  <span :class="{ 'text-decoration-line-through text-grey': isMatched(item) }">
                    ${{ calculateDueAmount(item) }}
                  </span>
                </template>
                <template #[`item.due_at`]="{ item }">
                  {{ formatDate(item.due_at) }}
                </template>
                <template #[`item.actions`]="{ item }">
                  <v-btn
                    v-for="record in getMatchingRecords(item)"
                    :key="record.id"
                    color="primary"
                    small
                    class="ma-1"
                    @click="handleMatch(record.id, item)"
                  >
                    Match with Bank #{{ record.id }}
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>

            <!-- Matched Payments Table -->
            <v-card outlined>
              <v-card-title class="text-h6">Matched Payments</v-card-title>
              <v-data-table
                :headers="paymentHeaders"
                :items="payRecords"
                :items-per-page="10"
                class="elevation-1"
              >
                <template #[`item.create_at`]="{ item }">
                  {{ formatDate(item.create_at) }}
                </template>
              </v-data-table>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import CSVUploader from '../components/BankUpload.vue';
import { fetchUnpaidInvoice, createPay } from '../api';
import type { Invoice, BankRecord, Pay } from '../models';

export default defineComponent({
  name: 'BankReconciliation',
  components: {
    CSVUploader
  },
  setup() {
    const payRecords = ref<Pay[]>([]);
    const invoices = ref<Invoice[]>([]);
    const loading = ref<boolean>(true);
    const error = ref<string | null>(null);
    const bankRecords = ref<BankRecord[]>([
      { id: 1, date: "2024-02-20", amount: 101.00, description: "Bank Transfer ABC" },
      { id: 2, date: "2024-02-18", amount: 550.00, description: "Bank Deposit XYZ" },
      { id: 3, date: "2024-02-18", amount: 24, description: "Bank Deposit XYZ" },
      { id: 4, date: "2024-03-18", amount: 900.25, description: "Bank Deposit abc" },
    ]);

    const bankHeaders = [
      { text: 'ID', value: 'id' },
      { text: 'Date', value: 'date' },
      { text: 'Amount', value: 'amount' },
      { text: 'Description', value: 'description' },
    ];

    const invoiceHeaders = [
      { text: 'ID', value: 'code' },
      { text: 'Amount', value: 'amount' },
      { text: 'Due Date', value: 'due_at' },
      { text: 'Actions', value: 'actions', sortable: false },
    ];

    const paymentHeaders = [
      { text: 'Code', value: 'invoice_id' },
      { text: 'Pay Via', value: 'pay_via' },
      { text: 'Amount', value: 'amount' },
      { text: 'Supply Invoice', value: 'supply_invoice' },
      { text: 'Note', value: 'note' },
      { text: 'Approved By', value: 'approved_by' },
      { text: 'Created At', value: 'create_at' },
    ];

    const fetchInvoices = async () => {
      try {
        const data = await fetchUnpaidInvoice();
        invoices.value = data;
      } catch (err) {
        error.value = "Failed to fetch invoices.";
        console.error("Error fetching invoices:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchInvoices();
    });

    const handleMatch = async (bankId: number, invoice: Invoice) => {
      const newPayRecord: any = {
        invoice_id: invoice.code,
        pay_via: "Bank Transfer",
        amount: Number(invoice.cost) || 0,
        supply_invoice: `SI-${invoice.ref}`,
        note: `Matched with Bank ID ${bankId}`,
        approved_by: "Admin",
        create_at: new Date(),
        updated_at: new Date(),
      };

      try {
        const data = await createPay(newPayRecord);


        payRecords.value = [...payRecords.value, newPayRecord];
        alert("Payment successfully matched!");
      } catch (err) {
        console.error("Error in handleMatch:", err);
      }
    };

    const handleUpload = (records: BankRecord[]) => {
      bankRecords.value = records;
      console.log("Bank Records:", records);
    };

    const isMatched = (invoice: Invoice) => {
      return payRecords.value.some(p => p.invoice_id === invoice.code);
    };

    const calculateDueAmount = (invoice: Invoice) => {
      return invoice.cost - (invoice.paid ?? 0);
    };

    const getMatchingRecords = (invoice: Invoice) => {
      const dueAmount = calculateDueAmount(invoice);
      return bankRecords.value.filter(
        record => record.amount === dueAmount && !isMatched(invoice)
      );
    };

    const formatDate = (dateString: string | Date) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    return {
      payRecords,
      invoices,
      loading,
      error,
      bankRecords,
      bankHeaders,
      invoiceHeaders,
      paymentHeaders,
      handleMatch,
      handleUpload,
      isMatched,
      calculateDueAmount,
      getMatchingRecords,
      formatDate
    };
  }
});
</script>

<style scoped>
/* Custom styles can be added here if needed */
</style>