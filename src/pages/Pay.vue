<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h2>Pay Management</h2>
        <v-btn color="primary" @click="openModal">Add Pay</v-btn>
      </v-card-title>

      <v-text-field
        v-model="searchTerm"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        @update:modelValue="handleSearch"
      />

      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        @update:modelValue="handlePageChange"
      />

      <v-data-table
        v-if="!isMobileView"
        :headers="headers"
        :items="paginatedPays"
        :items-per-page="itemsPerPage"
        class="elevation-1"
      >
        <template v-slot:item.code="{ item }">
          <v-btn variant="text" color="primary" @click="viewPay(item)">{{ item.code }}</v-btn>
        </template>
        <template v-slot:item.invoice_id="{ item }">
          <v-btn variant="text" color="primary" @click="viewInvoice(item)">{{ item.invoice_id || item.jobby?.code }}</v-btn>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" color="primary" @click="openModal(item)"></v-btn>
          <v-btn icon="mdi-delete" variant="text" color="error" @click="removePay(item.code)"></v-btn>
        </template>
      </v-data-table>

      <v-list v-else>
        <v-list-item v-for="pay in paginatedPays" :key="pay.code">
          <v-list-item-title>
            <v-btn variant="text" color="primary" @click="viewPay(pay)">Pay #: {{ pay.code }}</v-btn>
          </v-list-item-title>
          <v-list-item-subtitle>
            <strong>Invoice ID:</strong> 
            <v-btn variant="text" color="primary" @click="viewInvoice(pay)">{{ pay.invoice_id || pay.jobby?.code }}</v-btn>
          </v-list-item-subtitle>
          <v-list-item-subtitle><strong>Pay Via:</strong> {{ pay.pay_via }}</v-list-item-subtitle>
          <v-list-item-subtitle><strong>Supplier Invoice:</strong> {{ pay.supply_invoice }}</v-list-item-subtitle>
          <v-list-item-subtitle><strong>Price:</strong> {{ pay.amount || 0 }}</v-list-item-subtitle>
          <v-list-item-subtitle><strong>Note:</strong> {{ pay.note }}</v-list-item-subtitle>
          <v-list-item-subtitle><strong>Approved By:</strong> {{ pay.approved_by }}</v-list-item-subtitle>
          <v-btn color="primary" @click="openModal(pay)">Edit</v-btn>
          <v-btn color="error" @click="removePay(pay.code)">Delete</v-btn>
        </v-list-item>
      </v-list>

      <v-dialog v-model="isModalOpen" max-width="600">
        <v-card>
          <v-card-title>
            {{ editingCode ? 'Edit Pay' : 'Add Pay' }}
            <v-btn icon="mdi-close" class="float-right" @click="closeModal"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitPay">
              <v-select
                v-model="formData.pay_via"
                :items="paymentOptions"
                label="Pay Via"
                required
              ></v-select>

              <v-select
                v-model="formData.invoice_id"
                :items="invoiceOptions"
                item-title="label"
                item-value="value"
                label="Invoice"
                required
              ></v-select>

              <v-text-field
                v-model="formData.amount"
                type="number"
                label="Amount"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.supply_invoice"
                label="Supplier Invoice"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.note"
                label="Note"
              ></v-text-field>

              <v-text-field
                v-model="formData.approved_by"
                label="Approved By"
                required
              ></v-text-field>

              <v-btn type="submit" color="primary">Save Pay</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { 
  fetchPay, 
  createPay, 
  updatePay, 
  deletePay, 
  fetchInNPay 
} from '../api'
import type { Pay } from '../models'
import { useNavigationService } from '../composables/useNavigationService';

// State
const pays = ref<Pay[]>([])
const formData = ref<Omit<Pay, 'code' | 'jobby'>>({
  invoice_id: 0,
  pay_via: '',
  amount: 0,
  supply_invoice: '',
  note: '',
  approved_by: '',
  create_at: new Date(),
  updated_at: new Date()
})
const editingCode = ref<number | null>(null)
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const isModalOpen = ref(false)
const invoiceOptions = ref<Array<{value: number, label: string}>>([{ value: 0, label: '' }])
const paymentOptions = [
  'Credit Card',
  'EFT',
  'Check',
  'Cash',
  'Credit Note',
  'Others'
]

const { mobile } = useDisplay()
const isMobileView = computed(() => mobile.value)

// Computed properties
const filteredPays = computed(() => {
  if (!searchTerm.value) return pays.value
  
  const term = searchTerm.value.toLowerCase()
  if (term.includes('=')) {
    return pays.value.filter(pay => pay.amount === Number(term.substring(1)))
  } else if (term.includes('>')) {
    return pays.value.filter(pay => pay.amount > Number(term.substring(1)))
  } else if (term.includes('<')) {
    return pays.value.filter(pay => pay.amount < Number(term.substring(1)))
  }
  
  return pays.value.filter(pay => 
    (pay.jobby?.contact?.toString() || '').includes(term) ||
    (pay.invoice_id === Number(term)) ||
    (pay.approved_by?.toLowerCase() || '').includes(term) ||
    (pay.supply_invoice?.toLowerCase() || '').includes(term)
  )
})

const totalPages = computed(() => 
  Math.ceil(filteredPays.value.length / itemsPerPage)
)

const paginatedPays = computed(() => 
  filteredPays.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
)

const headers = [
  { title: 'Pay #', key: 'code' },
  { title: 'Invoice ID', key: 'invoice_id' },
  { title: 'Supplier Name', key: 'jobby.by_id.company_name' },
  { title: 'Pay Via', key: 'pay_via' },
  { title: 'Supplier Invoice', key: 'supply_invoice' },
  { title: 'Price', key: 'amount' },
  { title: 'Note', key: 'note' },
  { title: 'Approved By', key: 'approved_by' },
  { title: 'Actions', key: 'actions' }
]

// Methods
const fetchPays = async () => {
  try {
    const data = await fetchPay()
    pays.value = data || []
  } catch (error) {
    console.error('Error fetching pays:', error)
  }
}

const fetchInvoiceOptions = async () => {
  try {
    const data = await fetchInNPay()
    
    if (!data || data.length === 0) {
      invoiceOptions.value = [{ value: 0, label: 'No invoices found' }]
      return
    }

    invoiceOptions.value = data.map(item => {
      const totalPaid = item.pay?.reduce((sum:number, p:any) => sum + Number(p.amount), 0) || 0
      const balance = Math.max(0, Number(item.cost) - Number(totalPaid))
      
      return {
        value: item.code,
        label: `inv#${item.code} ➡ $${item.cost || 0} | Paid: $${Number(totalPaid).toFixed(2)} | Balance: $${balance.toFixed(2)}`
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
  }
}

const openModal = (pay?: Pay) => {
  if (pay) {
    editingCode.value = pay.code
    formData.value = {
      invoice_id: pay.invoice_id || pay.jobby?.code || 0,
      pay_via: pay.pay_via,
      amount: pay.amount,
      supply_invoice: pay.supply_invoice,
      note: pay.note,
      approved_by: pay.approved_by,
      create_at: pay.create_at,
      updated_at: pay.updated_at
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  formData.value = {
    invoice_id: 0,
    pay_via: '',
    amount: 0,
    supply_invoice: '',
    note: '',
    approved_by: '',
    create_at: new Date(),
    updated_at: new Date()
  }
  editingCode.value = null
  isModalOpen.value = false
}

const submitPay = async () => {
  try {
    if (formData.value.amount <= 0) {
      throw new Error('Amount must be positive')
    }

    if (editingCode.value) {
      await updatePay(editingCode.value, formData.value)
    } else {
      await createPay(formData.value)
    }

    await Promise.all([fetchPays(), fetchInvoiceOptions()])
    closeModal()
  } catch (error) {
    console.error('Payment error:', error)
    alert(error instanceof Error ? error.message : 'Payment failed')
  }
}

const removePay = async (code: number) => {
  try {
    await deletePay(code)
    fetchPays()
  } catch (error) {
    console.error('Error deleting pay:', error)
  }
}
const { handleViewInvoice, handleViewPay } = useNavigationService();
const viewPay = (pay: Pay) => {
  // Implement navigation to pay view
  console.log('View pay:', pay)
  handleViewPay(pay);
}

const viewInvoice = async (pay:any) => {
    try {
    if (!pay) {
        console.error(`Invoice record not found `);
        return;
    }
    handleViewInvoice(pay.jobby);
    } catch (error) {
    console.error("Error fetching invoice details:", error);
    }
};


const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage
}

// Lifecycle hooks
onMounted(() => {
  fetchPays()
  fetchInvoiceOptions()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>