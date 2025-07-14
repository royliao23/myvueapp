<template>
  <v-card>
    <v-container>
      <v-card-title class="text-h4 primary--text mb-4">
        Employee Management
      </v-card-title>

      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Search Employee Name"
            outlined
            clearable
            @input="handleSearch"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="text-right">
          <v-btn color="primary" @click="openAddModal">
            <v-icon left>mdi-plus</v-icon>
            Add Employee
          </v-btn>
        </v-col>
      </v-row>

      <!-- Employee Table -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :page.sync="page"
        :items-per-page="rowsPerPage"
        :server-items-length="filteredEmployees.length"
        class="elevation-1"
        :footer-props="{
          'items-per-page-options': [5, 10, 25],
          'show-current-page': true
        }"
      >
        <template v-slot:item.name="{ item }">
          {{ item.first_name }} {{ item.last_name }}
        </template>
        <template v-slot:item.department="{ item }">
          {{ getDepartmentName(item.department) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            color="primary"
            small
            class="mr-2"
            @click="handleEdit(item)"
          >
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            color="error"
            small
            @click="confirmDelete(item)"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Add/Edit Dialog -->
      <v-dialog v-model="showModal" max-width="1200" persistent scrollable>
        <v-card>
          <v-card-title class="headline">
            {{ editingId ? 'Edit Employee' : 'Add Employee' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.first_name"
                    label="First Name"
                    :rules="[requiredRule]"
                    outlined
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.last_name"
                    label="Last Name"
                    :rules="[requiredRule]"
                    outlined
                    class="mb-4"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    :rules="[requiredRule, emailRule]"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.contact"
                    label="Mobile Number"
                    :rules="[requiredRule]"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.salary"
                    label="Salary"
                    type="number"
                    :rules="[requiredRule]"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.position"
                    label="Position"
                    :rules="[requiredRule]"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.department"
                    :items="departments"
                    item-text="department_name"
                    item-value="id"
                    label="Department"
                    :rules="[requiredRule]"
                    outlined
                    
                  ></v-select>
                  
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.role"
                    label="Role"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.employment_type"
                    label="Employment Type"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.super_rate"
                    label="Super Rate (%)"
                    type="number"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-subheader class="pl-0">Bank Details</v-subheader>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.bsb"
                    label="BSB"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.account_no"
                    label="Account Number"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.account_name"
                    label="Account Name"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.bank_name"
                    label="Bank Name"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.address"
                    label="Address"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-subheader class="pl-0">Superannuation Details</v-subheader>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.super_company_name"
                    label="Super Company Name"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.super_account_name"
                    label="Super Account Name"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.super_usi"
                    label="Super USI"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.super_fund_abn"
                    label="Super Fund ABN"
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.super_member_no"
                    label="Super Member No"
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey darken-1" text @click="handleCloseModal">
                  Cancel
                </v-btn>
                <v-btn color="primary" type="submit">
                  {{ editingId ? 'Update' : 'Save' }}
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="500">
        <v-card>
          <v-card-title class="headline">Confirm Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete this employee?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="showDeleteDialog = false">
              Cancel
            </v-btn>
            <v-btn color="error" text @click="handleDelete">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  createEmployee, 
  updateEmployee, 
  fetchEmployee, 
  deleteEmployee, 
  fetchDepartment 
} from '../api'

interface Employee {
  id: number
  name: string
  first_name?: string
  last_name?: string
  email: string
  contact: string
  department: number | null
  salary: number | null
  position: string | null
  bsb: string | null
  account_no: string | null
  account_name: string | null
  bank_name: string | null
  address: string | null
  super_rate: number | null
  employment_type: string | null
  role: string | null
  super_company_name: string | null
  super_fund_abn: string | null
  super_usi: string | null
  super_account_name: string | null
  super_member_no: string | null
}

interface Department {
  id: number
  department_name: string
}

interface EmployeeFormData {
  id?: number
  first_name: string
  last_name: string
  email: string
  contact: string | null
  department: number | null
  salary: number | null
  position: string | null
  bsb: string | null
  account_no: string | null
  account_name: string | null
  bank_name: string | null
  address: string | null
  super_rate: number | null
  employment_type: string | null
  role: string | null
  super_company_name?: string | null
  super_fund_abn?: string | null
  super_usi?: string | null
  super_account_name?: string | null
  super_member_no?: string | null
}

// State
const employees = ref<Employee[]>([])
const departments = ref<Department[]>([])
const formData = ref<EmployeeFormData>({
  first_name: '',
  last_name: '',
  email: '',
  contact: null,
  department: null,
  salary: null,
  position: null,
  bsb: null,
  account_no: null,
  account_name: null,
  bank_name: null,
  address: null,
  super_rate: null,
  employment_type: null,
  role: null,
})
const editingId = ref<number | null>(null)
const showModal = ref(false)
const showDeleteDialog = ref(false)
const employeeToDelete = ref<number | null>(null)
const page = ref(1)
const rowsPerPage = ref(5)
const search = ref('')
const form = ref<any>(null)

// Validation rules
const requiredRule = (v: string) => !!v || 'This field is required'
const emailRule = (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'

// Table headers
const headers = [
  { text: 'Name', value: 'name' },
  { text: 'Email', value: 'email' },
  { text: 'Contact', value: 'contact' },
  { text: 'Department', value: 'department' },
  { text: 'Salary', value: 'salary' },
  { text: 'Position', value: 'position' },
  { text: 'Actions', value: 'actions', sortable: false }
]

// Computed properties
const filteredEmployees = computed(() => {
  if (!search.value) return employees.value
  return employees.value.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.value.toLowerCase())
  )
})

// Methods
const getDepartmentName = (deptId: number | null) => {
  if (!deptId) return 'N/A'
  const dept = departments.value.find(d => d.id === deptId)
  return dept ? dept.department_name : 'N/A'
}

const fetchEmployees = async () => {
  try {
    const data = await fetchEmployee()
    employees.value = (data || []).map((employee: any) => ({
      ...employee,
      department: employee.department_info?.id || null
    }))
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

const fetchDepartmentsList = async () => {
  try {
    const data = await fetchDepartment()
    departments.value = data || []
  } catch (error) {
    console.error('Error fetching departments:', error)
  }
}

const openAddModal = () => {
  editingId.value = null
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    contact: null,
    department: null,
    salary: null,
    position: null,
    bsb: null,
    account_no: null,
    account_name: null,
    bank_name: null,
    address: null,
    super_rate: null,
    employment_type: null,
    role: null,
  }
  showModal.value = true
}

const handleEdit = (employee: any) => {
  editingId.value = employee.id
  formData.value = { ...employee }
  showModal.value = true
}

const confirmDelete = (employee: Employee) => {
  employeeToDelete.value = employee.id
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!employeeToDelete.value) return

  try {
    await deleteEmployee(employeeToDelete.value)
    await fetchEmployees()
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Error deleting employee:', error)
  }
}

const handleSubmit = async () => {
  if (!form.value.validate()) return

  try {
    const payload = {
      ...formData.value,
      name: `${formData.value.first_name} ${formData.value.last_name}`
    }

    if (editingId.value !== null) {
      await updateEmployee(editingId.value, payload)
    } else {
      await createEmployee(payload)
    }
    await fetchEmployees()
    handleCloseModal()
  } catch (error) {
    console.error('Error saving employee:', error)
  }
}

const handleCloseModal = () => {
  showModal.value = false
  if (form.value) form.value.reset()
}

const handleSearch = () => {
  page.value = 1
}

// Lifecycle hooks
onMounted(() => {
  fetchEmployees()
  fetchDepartmentsList()
})
</script>

<style scoped>
.v-card {
  margin: 20px;
}
.v-data-table {
  margin-top: 20px;
}
</style>