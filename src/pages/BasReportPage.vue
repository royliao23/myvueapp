<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">Business Activity Statement (BAS) Report</v-card-title>
          
          <v-card-text>
            <!-- Report Period Selection -->
            <v-radio-group v-model="reportPeriod" row @change="handlePeriodChange">
              <v-radio label="Quarterly" value="quarterly"></v-radio>
              <v-radio label="Half-Yearly" value="half-yearly"></v-radio>
              <v-radio label="Annually" value="annually"></v-radio>
            </v-radio-group>

            <!-- Date Range Selection -->
            <v-row>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="startDateFormatted"
                  label="Start Date"
                  type="date"
                  :disabled="!reportPeriod"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="endDateFormatted"
                  label="End Date"
                  type="date"
                  :disabled="!reportPeriod"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-btn
                  color="primary"
                  @click="fetchData"
                  :disabled="!startDate || !endDate || loading"
                  :loading="loading"
                >
                  Generate Report Data
                </v-btn>
              </v-col>
            </v-row>

            <!-- Report Type Tabs -->
            <v-tabs v-model="reportType" grow>
              <v-tab>GST Report</v-tab>
              <v-tab>TPAR Report</v-tab>
            </v-tabs>

            <v-tabs-items v-model="reportType">
              <!-- GST Report Tab -->
              <v-tab-item v-if='reportType === 0'>
                <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                <v-alert v-else-if="invoices.length === 0 && !loading" type="info" class="mt-4">
                  No invoices found.
                </v-alert>

                <template v-if="invoices.length > 0">
                  <v-data-table
                    :headers="gstHeaders"
                    :items="invoices"
                    :items-per-page="10"
                    class="elevation-1 mt-4"
                    :mobile-breakpoint="0"
                  >
                    <template #[`item.create_at`]="{ item }">
                      {{ formatDate(item.create_at) }}
                    </template>
                    <template #[`item.contractor.company_name`]="{ item }">
                      {{ item.contractor?.company_name || 'N/A' }}
                    </template>
                    <template #[`item.cost`]="{ item }">
                      {{ formatNumber(item.cost) }}
                    </template>
                    <template #[`item.gst`]="{ item }">
                      {{ formatNumber(calculateGST2(item.cost, item.contractor?.gst_registered ?? false)) }}
                    </template>
                  </v-data-table>
                </template>
              </v-tab-item>

              <!-- TPAR Report Tab -->
              <v-tab-item v-if='reportType === 1'>
                <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                <v-alert v-else-if="invoices.length === 0 && !loading" type="info" class="mt-4">
                  No invoices found for the selected period.
                </v-alert>

                <template v-if="invoices.length > 0">
                  <v-data-table
                    :headers="tparHeaders"
                    :items="invoices"
                    :items-per-page="10"
                    class="elevation-1 mt-4"
                    :mobile-breakpoint="0"
                  >
                    <template #[`item.create_at`]="{ item }">
                      {{ formatDate(item.create_at) }}
                    </template>
                    <template #[`item.contractor.company_name`]="{ item }">
                      {{ item.contractor?.company_name || 'N/A' }}
                    </template>
                    <template #[`item.contractor.abn`]="{ item }">
                      {{ item.contractor?.abn || 'N/A' }}
                    </template>
                    <template #[`item.cost`]="{ item }">
                      {{ formatNumber(item.cost) }}
                    </template>
                    <template #[`item.gst`]="{ item }">
                      {{ formatNumber(calculateGST2(item.cost, item.contractor?.gst_registered ?? false)) }}
                    </template>
                  </v-data-table>
                </template>
              </v-tab-item>
            </v-tabs-items>

            <!-- Export Buttons -->
            <v-row class="mt-4">
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="primary"
                  block
                  @click="handleExportATO"
                  :disabled="invoices.length === 0"
                >
                  Export for ATO
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="secondary"
                  block
                  @click="handleExportMYOB"
                  :disabled="invoices.length === 0"
                >
                  Export for MYOB
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import type { DataTableHeader } from 'vuetify';
import { fetchBasReport } from '../api';
import type { InvoiceDeep } from '../models';

export default defineComponent({
  name: 'BASReportPage',
  setup() {
    // Reactive state
    const reportPeriod = ref<'' | 'quarterly' | 'half-yearly' | 'annually'>('');
    const startDate = ref<Date | null>(null);
    const endDate = ref<Date | null>(null);
    const invoices = ref<InvoiceDeep[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const reportType = ref(0); // 0: GST, 1: TPAR

    // Calculate financial year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    let financialYearStartYear = currentYear;
    let financialYearEndYear = currentYear + 1;

    if (currentMonth < 6) {
      financialYearStartYear = currentYear - 1;
      financialYearEndYear = currentYear;
    }

    const financialYearStart = new Date(financialYearStartYear, 6, 1);
    const financialYearEnd = new Date(financialYearEndYear, 5, 30);

    // Computed properties
    const startDateFormatted = computed({
      get: () => startDate.value ? startDate.value.toISOString().split('T')[0] : '',
      set: (val) => {
        startDate.value = val ? new Date(val) : null;
      }
    });

    const endDateFormatted = computed({
      get: () => endDate.value ? endDate.value.toISOString().split('T')[0] : '',
      set: (val) => {
        endDate.value = val ? new Date(val) : null;
      }
    });

    // Table headers
    // Define your headers with proper typing
const gstHeaders: DataTableHeader[] = [
  { 
    key: 'Invoice ID', 
    value: 'code',
    align: 'start',
    sortable: true
  },
  { 
    key: 'Date', 
    value: 'create_at',
    align: 'start',
    sortable: true
  },
  { 
    key: 'Supplier', 
    value: 'contractor.company_name',
    align: 'start',
    sortable: true
  },
  {
    key: 'Gross Amount',
    value: 'cost',
    align: 'end',
    sortable: true
  },
  {
    key: 'GST Amount',
    value: 'gst',
    align: 'end',
    sortable: true
  }
];


const tparHeaders: DataTableHeader[] = [
  {
    key: 'Invoice ID',
    value: 'code',
    align: 'start',
    sortable: true
  },
  {
    key: 'Date',
    value: 'create_at',
    align: 'start',
    sortable: true
  },
  {
    key: 'Contractor',
    value: 'contractor.company_name',
    align: 'start',
    sortable: true
  },
  {
    key: 'ABN',
    value: 'contractor.abn',
    align: 'start',
    sortable: true
  },
  {
    key: 'Gross Amount Paid',
    value: 'cost',
    align: 'end',
    sortable: true
  },
  {
    key: 'GST Paid',
    value: 'gst',
    align: 'end',
    sortable: true
  },
];

    // Methods
    const handlePeriodChange = () => {
      if (!reportPeriod.value) return;
      generateDateRange(reportPeriod.value);
    };

    const generateDateRange = (period: 'quarterly' | 'half-yearly' | 'annually') => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      switch (period) {
        case 'quarterly':
          if (month >= 0 && month <= 2) {
            startDate.value = new Date(year, 0, 1);
            endDate.value = new Date(year, 3, 0);
          } else if (month >= 3 && month <= 5) {
            startDate.value = new Date(year, 3, 1);
            endDate.value = new Date(year, 6, 0);
          } else if (month >= 6 && month <= 8) {
            startDate.value = new Date(year, 6, 1);
            endDate.value = new Date(year, 9, 0);
          } else {
            startDate.value = new Date(year, 9, 1);
            endDate.value = new Date(year, 12, 0);
          }
          break;
        case 'half-yearly':
          if (month >= 0 && month <= 5) {
            startDate.value = new Date(year, 0, 1);
            endDate.value = new Date(year, 6, 0);
          } else {
            startDate.value = new Date(year, 6, 1);
            endDate.value = new Date(year + 1, 0, 0);
          }
          break;
        case 'annually':
          startDate.value = new Date(year, 0, 1);
          endDate.value = new Date(year + 1, 0, 0);
          break;
        default:
          break;
      }
    };

    const fetchData = async () => {
      if (!startDate.value || !endDate.value) return;

      loading.value = true;
      error.value = null;

      try {
        const fetchedInvoices = await fetchBasReport(startDate.value, endDate.value);
        if (!fetchedInvoices || fetchedInvoices.length === 0) {
          error.value = 'No invoices found for the selected period.';
          invoices.value = [];
          return;
        }
        invoices.value = fetchedInvoices;
      } catch (err: any) {
        error.value = err.message || 'Failed to fetch invoice data.';
        invoices.value = [];
      } finally {
        loading.value = false;
      }
    };

    const calculateGST2 = (cost: number, gstRegistered: boolean) => {
      return gstRegistered ? cost / 11 : 0;
    };

    const formatNumber = (num: number | undefined) => {
      if (num === undefined) return '';
      return parseFloat(Number(num).toFixed(2)) || "-";
    };

    const formatDate = (dateString: string | Date) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const handleExportATO = () => {
      if (reportType.value === 0) {
        // GST ATO export
        const gstData = invoices.value.map(invoice => ({
          invoiceId: invoice.code,
          date: formatDate(invoice.create_at),
          supplier: invoice.contractor?.company_name || 'N/A',
          grossAmount: formatNumber(invoice.cost),
          gstAmount: formatNumber(calculateGST2(invoice.cost, invoice.contractor?.gst_registered ?? false)),
        }));
        downloadCSV(gstData, 'gst_report_ato.csv');
      } else {
        // TPAR ATO export
        const tparData = invoices.value.map(invoice => ({
          invoiceId: invoice.code,
          date: formatDate(invoice.create_at),
          contractorABN: invoice.contractor?.abn,
          contractorName: invoice.contractor?.company_name,
          grossAmountPaid: formatNumber(invoice.cost),
          gstPaid: formatNumber(calculateGST2(invoice.cost, invoice.contractor?.gst_registered ?? false)),
        }));
        downloadCSV(tparData, 'tpar_report_ato.csv');
      }
    };

    const handleExportMYOB = () => {
      if (reportType.value === 0) {
        // GST MYOB export
        const gstData = invoices.value.map(invoice => ({
          date: formatDate(invoice.create_at),
          invoiceId: invoice.code,
          supplier: invoice.contractor?.company_name,
          total: formatNumber(invoice.cost),
          gst: formatNumber(calculateGST2(invoice.cost, invoice.contractor?.gst_registered ?? false)),
        }));
        downloadCSV(gstData, 'gst_report_myob.csv');
      } else {
        // TPAR MYOB export
        const tparData = invoices.value.map(invoice => ({
          date: formatDate(invoice.create_at),
          invoiceId: invoice.code,
          contractor: invoice.contractor?.company_name,
          amount: formatNumber(invoice.cost),
          gst: formatNumber(calculateGST2(invoice.cost, invoice.contractor?.gst_registered ?? false)),
        }));
        downloadCSV(tparData, 'tpar_report_myob.csv');
      }
    };

    const downloadCSV = (data: any[], filename: string) => {
      const csvRows = [];
      const headers = Object.keys(data[0] || {});
      csvRows.push(headers.join(','));

      for (const row of data) {
        const values = headers.map(header => String(row[header]).replace(/,/g, ''));
        csvRows.push(values.join(','));
      }

      const csvData = csvRows.join('\n');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };

    return {
      reportPeriod,
      startDate,
      endDate,
      startDateFormatted,
      endDateFormatted,
      invoices,
      loading,
      error,
      reportType,
      gstHeaders,
      tparHeaders,
      handlePeriodChange,
      fetchData,
      calculateGST2,
      formatNumber,
      formatDate,
      handleExportATO,
      handleExportMYOB,
    };
  },
});
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>