<template>
  <v-container>
    <template v-if="role !== 'hr'">
      <v-sheet height="300px" class="d-flex align-center justify-center">
        <v-alert type="error" prominent>
          You are not authorized to view this page.
        </v-alert>
      </v-sheet>
    </template>

    <template v-else>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 my-3 primary--text">Payroll Management</h1>
          
          <!-- Tabs -->
          <v-tabs v-model="tabValue" class="mb-3">
            <v-tab @click="fetchPayrolls">Payroll Summary</v-tab>
            <v-tab>Add Payroll</v-tab>
          </v-tabs>

          <!-- Tab Content -->
          <v-tabs-items v-model="tabValue">
            <!-- Payroll Summary Tab -->
            <v-tab-item v-if="tabValue === 0">
              <v-card>
                <v-card-title>
                  Payroll Summary
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="secondary" 
                    outlined 
                    @click="handleExportCSV"
                    class="mr-2"
                  >
                    Export CSV
                  </v-btn>
                  <v-text-field
                    v-model="search"
                    label="Search Employee Name or Period"
                    single-line
                    hide-details
                    @input="handleSearch"
                  ></v-text-field>
                </v-card-title>

                <v-data-table
                  :headers="headers"
                  :items="filteredData"
                  :items-per-page="rowsPerPage"
                  :page.sync="page"
             
                  :sort-desc.sync="sortDesc"
                  class="elevation-1"
                  @page-count="pageCount = $event"
                >
                  <template v-slot:item.view="{ item }">
                    <v-btn 
                      small 
                      outlined 
                      @click="handleViewPayroll(item)"
                    >
                      View
                    </v-btn>
                  </template>

                  <template v-slot:item.gross_pay="{ item }">
                    ${{ Number(item.gross_pay || 0).toFixed(2) }}
                  </template>

                  <template v-slot:item.tax="{ item }">
                    ${{ Number(item.tax || 0).toFixed(2) }}
                  </template>

                  <template v-slot:item.super="{ item }">
                    ${{ Number(item.super || 0).toFixed(2) }}
                  </template>

                  <template v-slot:item.net_pay="{ item }">
                    ${{ Number(item.net_pay || 0).toFixed(2) }}
                  </template>

                  <template v-slot:item.holiday_pay="{ item }">
                    ${{ Number(item.holiday_pay || 0).toFixed(2) }}
                  </template>
                </v-data-table>
              </v-card>
            </v-tab-item>

            <!-- Add Payroll Tab -->
            <v-tab-item v-if="tabValue === 1">
              <v-card class="mt-3">
                <v-card-title class="text-h6 font-weight-bold">Add Payrolls</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="From Date"
                        type="date"
                        v-model="from_date"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="To Date"
                        type="date"
                        v-model="to_date"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="selectedEmployee"
                        :items="employees"
                        item-title="name"
                        item-value="id"
                        label="Select Employee"
                        return-object
                        outlined
                        >
                        <template v-slot:item="{ props, item }">
                            <v-list-item
                            v-bind="props"
                            :title="`${item.raw.name} (${item.raw.position}) ($${item.raw.salary})`"
                            ></v-list-item>
                        </template>
                      </v-select>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="Base Hour"
                        type="number"
                        v-model="baseHour"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="Overtime 1.5"
                        type="number"
                        v-model="overtime15"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="Overtime 2.0"
                        type="number"
                        v-model="overtime20"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="Bonus"
                        type="number"
                        v-model="bonus"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="Holiday Pay"
                        type="number"
                        v-model="holidayPay"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="Other Pay"
                        type="number"
                        v-model="others"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="Note"
                        type="text"
                        v-model="note"
                        outlined
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <h3>Total Hours: {{ hours.toFixed(2) }}</h3>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <h3>Total Gross Pay: ${{ grossPay.toFixed(2) }}</h3>
                    </v-col>

                    <v-col cols="12">
                      <v-divider class="my-4"></v-divider>
                    </v-col>

                    <v-col cols="12" class="text-center">
                      <v-btn 
                        color="primary" 
                        @click="handleAddPayroll"
                        class="mr-4"
                      >
                        Add Payroll
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>

          <!-- Payslip Dialog -->
          <v-dialog v-model="openDialog" max-width="800px">
            <v-card id="payslip">
              <v-card-title class="text-center">{{ company?.company_name }}</v-card-title>
              <v-card-subtitle class="text-right">ABN: {{ company?.abn }}</v-card-subtitle>
              
              <v-card-text>
                <p><strong>Pay Slip For:</strong> {{ selectedPayroll?.employee.name }}</p>
                <p><strong>Hourly Rate:</strong> {{ selectedPayroll?.employee.salary ? (selectedPayroll.employee.salary / 38).toFixed(2) : 'no entry' }}</p>
                <p><strong>Pay Period:</strong> {{ selectedPayroll?.period }}</p>
                <p class="text-h6 text-center primary--text">Don't worry, be happy!</p>

                <v-table density="compact" class="mt-4">
                  <thead>
                    <tr>
                      <th class="text-left" style="width: 20%">Description</th>
                      <th class="text-right" style="width: 20%">Gross Pay</th>
                      <th class="text-right" style="width: 20%">Net Pay to Bank</th>
                      <th class="text-right" style="width: 20%">Super</th>
                      <th class="text-right" style="width: 20%">PYAG withholding</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="text-left">This Pay</td>
                      <td class="text-right">${{ Number(selectedPayroll?.gross_pay).toFixed(2) || "-" }}</td>
                      <td class="text-right">${{ Number(selectedPayroll?.net_pay).toFixed(2) || "-" }}</td>
                      <td class="text-right">${{ Number(selectedPayroll?.super).toFixed(2) || "-" }}</td>
                      <td class="text-right">${{ Number(selectedPayroll?.tax).toFixed(2) || "-" }}</td>
                    </tr>
                    <tr>
                      <td class="text-left">Ytd</td>
                      <td class="text-right">${{ Number(ytd.gross_total).toFixed(2) || "-" }}</td>
                      <td class="text-right">${{ Number(ytd.net_total).toFixed(2) || "-" }}</td>
                      <td class="text-right">${{ Number(ytd.super_total).toFixed(2) || "-" }}</td>
                      <td class="text-right">${{ Number(ytd.tax_total).toFixed(2) || "-" }}</td>
                    </tr>
                  </tbody>
                </v-table>

                <div class="text-right mt-4">
                  <p class="text-h6">Gross Pay: ${{ Number(selectedPayroll?.gross_pay).toFixed(2) || "-" }}</p>
                  <p class="text-h6">Net Pay: ${{ Number(selectedPayroll?.net_pay).toFixed(2) || "-" }}</p>
                </div>
              </v-card-text>

              <v-card-actions class="no-print">
                <v-spacer></v-spacer>
                <v-btn color="secondary" @click="openDialog = false">Close</v-btn>
                <v-btn color="primary" @click="handlePrint">Print</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchCompany as fcompany, fetchPayroll, createPayroll, fetchEmployee as fetchEmployeesApi } from '../api';
import { fetchSingleUserRole } from '../services/DetailService';

interface Employee {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  salary?: number;
  position?: string;
  super_rate?: number;
  employee?: any;
}

interface Payroll {
  id: number;
  employee: Employee;
  period: string;
  gross_pay: number;
  tax: number;
  super: number;
  net_pay: number;
  base_hour: number;
  overtime_15: number;
  overtime_20: number;
  bonus: number;
  other_pay: number;
  holiday_pay: number;
  note: string;
}

interface Company {
  company_name: string;
  abn: string;
}

interface YTD {
  gross_total: number;
  tax_total: number;
  super_total: number;
  net_total: number;
}

// Reactive state
const payrollData = ref<Payroll[]>([]);
const search = ref('');
const page = ref(1);
const rowsPerPage = ref(5);
const sortBy = ref('employee');
const sortDesc = ref(false);
const employees = ref<Employee[]>([]);
const selectedEmployee = ref<Employee>({
  id: 0,
  name: '',
  email: ''
});
const payPeriod = ref('');
const from_date = ref('');
const to_date = ref('');
const note = ref('');
const basePay = ref(0);
const baseHour = ref(0);
const overtime15 = ref(0);
const overtime20 = ref(0);
const bonus = ref(0);
const holidayPay = ref(0);
const others = ref(0);
const grossPay = ref(0);
const hours = ref(0);
const tabValue = ref(0);
const selectedPayroll = ref<Payroll | null>(null);
const openDialog = ref(false);
const ytd = ref<YTD>({ gross_total: 0, tax_total: 0, super_total: 0, net_total: 0 });
const company = ref<Company | null>(null);
const role = ref('');
const pageCount = ref(0);

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'View', value: 'view', sortable: false },
  { text: 'Employee', value: 'employee.name' },
  { text: 'Period', value: 'period' },
  { text: 'Gross Pay ($)', value: 'gross_pay' },
  { text: 'Base Hour', value: 'base_hour' },
  { text: 'Overtime 1.5', value: 'overtime_15' },
  { text: 'Overtime 2.0', value: 'overtime_20' },
  { text: 'Bonus ($)', value: 'bonus' },
  { text: 'Other Pay ($)', value: 'other_pay' },
  { text: 'Tax ($)', value: 'tax' },
  { text: 'Super ($)', value: 'super' },
  { text: 'Net Pay ($)', value: 'net_pay' },
  { text: 'Holiday Pay ($)', value: 'holiday_pay' },
  { text: 'Note', value: 'note' },
];

// Computed properties
const filteredData = computed(() => {
  return payrollData.value.filter((payroll: Payroll) => {
    const employeeName = `${payroll.employee?.first_name?.toLowerCase().trim()} ${payroll.employee?.last_name?.toLowerCase().trim()}`;
    return (
      employeeName.includes(search.value.toLowerCase()) ||
      payroll.period.toLowerCase().includes(search.value.toLowerCase())
    );
  });
});

// Watchers
watch([from_date, to_date, selectedEmployee, baseHour, overtime15, overtime20, bonus, holidayPay, others], () => {
  const computedBasePay = baseHour.value * (selectedEmployee.value.salary ? selectedEmployee.value.salary / 38 : 23);
  const computedOvertime15 = overtime15.value * (selectedEmployee.value.salary ? selectedEmployee.value.salary / 38 * 1.5 : 34.5);
  const computedOvertime20 = overtime20.value * (selectedEmployee.value.salary ? selectedEmployee.value.salary / 38 * 2 : 46);
  const computedHours = baseHour.value + overtime15.value + overtime20.value;
  const computedGrossPay = parseFloat((computedBasePay + computedOvertime15 + computedOvertime20 + bonus.value + holidayPay.value + others.value).toFixed(2));
  
  payPeriod.value = from_date.value + " -- " + to_date.value;
  basePay.value = computedBasePay;
  hours.value = computedHours;
  grossPay.value = computedGrossPay;
});

// Methods
async function fetchPayrolls() {
  try {
    const data = await fetchPayroll();
    if (data ) {
      payrollData.value = data;
    } else {
      console.error("Error fetching payroll data:");
    }
  } catch (error) {
    console.error("Error fetching payroll:", error);
  }
}

async function fetchCompany() {
  try {
    const data:any = await fcompany();
    if (!data) throw new Error("Company not found");
    
    company.value = data[0] || null;
    console.log("Company data fetched successfully:", company.value);
  } catch (error) {
    console.error("Error fetching company:", error);
  }
}

async function fetchEmployees() {
  try {
    const dataEmp = await fetchEmployeesApi();
    
    employees.value = dataEmp || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

function calculateAustralianTax(weeklyGrossPay: number): number {
  const annualGrossPay = weeklyGrossPay * 52;

  if (annualGrossPay <= 18200) {
    return 0;
  } else if (annualGrossPay <= 45000) {
    return ((annualGrossPay - 18200) * 0.19) / 52;
  } else if (annualGrossPay <= 120000) {
    return (5092 + (annualGrossPay - 45000) * 0.325) / 52;
  } else if (annualGrossPay <= 180000) {
    return (29467 + (annualGrossPay - 120000) * 0.37) / 52;
  } else {
    return (51667 + (annualGrossPay - 180000) * 0.45) / 52;
  }
}

async function handleAddPayroll() {
  if (!selectedEmployee.value || !from_date.value || !to_date.value || grossPay.value <= 0) {
    alert("Fill all needed fields!");
    return;
  }

  const tax = calculateAustralianTax(grossPay.value);
  const superAmount = parseFloat(
    (grossPay.value * (selectedEmployee.value?.employee?.super_rate ? selectedEmployee.value.employee.super_rate : 0.1)).toFixed(2)
  );
  const net_pay = parseFloat((grossPay.value - tax).toFixed(2));

  const newPayroll = {
    employee_id: selectedEmployee.value.id,
    period: payPeriod.value,
    gross_pay: grossPay.value,
    tax: tax,
    super: superAmount,
    net_pay: net_pay,
    base_hour: baseHour.value,
    overtime_15: overtime15.value,
    overtime_20: overtime20.value,
    bonus: bonus.value,
    holiday_pay: holidayPay.value,
    other_pay: others.value,
    from_date: from_date.value,
    to_date: to_date.value,
    note: note.value
  };

  const data = await createPayroll(newPayroll);

  if (data.error) {
    console.error("Error adding payroll:", data.error);
    alert("Failed to add payroll!");
  } else {
    alert("Payroll added successfully!");
    resetForm();
    await fetchPayrolls();
  }
}

function resetForm() {
  selectedEmployee.value = { id: 0, name: "", email: "" };
  payPeriod.value = "";
  grossPay.value = 0;
  bonus.value = 0;
  overtime15.value = 0;
  overtime20.value = 0;
  others.value = 0;
  baseHour.value = 0;
  holidayPay.value = 0;
  note.value = "";
  from_date.value = "";
  to_date.value = "";
}

function calculateAnnualSalary(employee: Employee, payrollData: Payroll[]): YTD {
  const employeePayrolls = payrollData.filter(
    (payroll) => payroll.employee.id === employee.id
  );

  const totals = employeePayrolls.reduce(
    (acc, payroll) => {
      acc.gross_total += Number(payroll.gross_pay) || 0;
      acc.tax_total += Number(payroll.tax) || 0;
      acc.super_total += Number(payroll.super) || 0;
      acc.net_total += Number(payroll.net_pay) || 0;
      return acc;
    },
    { gross_total: 0, tax_total: 0, super_total: 0, net_total: 0 }
  );
  
  return totals;
}

function handleSearch() {
  page.value = 1;
}

function handleViewPayroll(payroll: Payroll) {
  selectedPayroll.value = payroll;
  openDialog.value = true;
  ytd.value = calculateAnnualSalary(payroll.employee, payrollData.value);
}

function handlePrint() {
  window.print();
}

function handleExportCSV() {
  const csvContent =
    "ID,Employee,Period,Gross Pay,Tax,Super,Net Pay,Base Hour,Overtime 15,Overtime 20, Holiday Pay,Bonus,Other Pay, Note\n" +
    payrollData.value
      .map((p) => `${p.id},${p.employee.name},${p.period},${p.gross_pay},${p.tax},${p.super},${p.net_pay},${p.base_hour},${p.overtime_15},${p.overtime_20},${p.holiday_pay},${p.bonus},${p.other_pay}, ${p.note}`)
      .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "payroll_report.csv";
  link.click();
}

// Lifecycle hooks
onMounted(async () => {
  const id = localStorage.getItem("id") || "0";
  try {
    const roleData = await fetchSingleUserRole(parseInt(id));
    if (roleData.error) {
      console.error("Error fetching user role:", roleData.error);
      return;
    }
    role.value = roleData?.role || "";
    
    if (role.value === "hr") {
      await Promise.all([fetchPayrolls(), fetchEmployees(), fetchCompany()]);
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
});
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  
  #payslip {
    padding: 20px;
    background: white !important;
  }
}
</style>