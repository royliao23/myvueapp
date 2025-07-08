// src/api/index.ts
import axios from 'axios'
import type {
  Todo,
  Article,
  Author,
  Categ,
  Project,
  Job,
  JobBudget,
  InvoiceShort,
  Purchase,
  Contractor,
  Invoice,
  InvoiceDeep,
  AgeInvoice,
  Pay,
  BankRecord,
  Company,
  InvoiceFilter
} from '@/models'

const API_BASE_URL = import.meta.env.VITE_API_NODE
if (!API_BASE_URL) {
  throw new Error('VITE_API_NODE is not defined in .env')
}

// Create axios instance with auth token
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
})

// Helper function for delete responses
const handleDeleteResponse = async (action: string, response: any) => {
  try {
    return await response.json()
  } catch (error) {
    console.warn(`Received non-JSON response for successful ${action} delete`, error)
    return { message: `${action} deleted successfully (non-JSON response)` }
  }
}

// Project API
export const fetchProjects = async (): Promise<Project[]> => {
  const response = await authAxios.get('/high/projects')
  return response.data.projects || response.data
}

export const createProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
  const response = await authAxios.post('/high/projects/', projectData)
  return response.data
}

export const updateProject = async (id: number, projectData: Omit<Project, 'id'>): Promise<Project> => {
  const response = await authAxios.put(`/high/projects/${id}/`, projectData)
  return response.data
}

export const deleteProject = async (id: number): Promise<void> => {
  await authAxios.delete(`/high/projects/${id}/`)
}

// Contractor API
export const fetchContractors = async (): Promise<Contractor[]> => {
  const response = await authAxios.get('/high/contractor/')
  return response.data
}

export const createContractor = async (contractorData: Omit<Contractor, 'code'>): Promise<Contractor> => {
  const response = await authAxios.post('/high/contractor/', contractorData)
  return response.data
}

export const updateContractor = async (code: number, contractorData: Omit<Contractor, 'code'>): Promise<Contractor> => {
  const response = await authAxios.put(`/high/contractor/${code}/`, contractorData)
  return response.data
}

export const deleteContractor = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/contractor/${code}/`)
}

// Category API
export const fetchCategories = async (): Promise<Categ[]> => {
  const response = await authAxios.get('/high/categ/')
  return response.data
}

export const createCategory = async (categoryData: Omit<Categ, 'code'>): Promise<Categ> => {
  const response = await authAxios.post('/high/categ/', categoryData)
  return response.data
}

export const updateCategory = async (code: number, categoryData: Omit<Categ, 'code'>): Promise<Categ> => {
  const response = await authAxios.put(`/high/categ/${code}/`, categoryData)
  return response.data
}

export const deleteCategory = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/categ/${code}/`)
}

// Job API
export const fetchJobs = async (): Promise<Job[]> => {
  const response = await authAxios.get('/high/job/')
  return response.data
}

export const createJob = async (jobData: Omit<Job, 'code'>): Promise<Job> => {
  const response = await authAxios.post('/high/job/', jobData)
  return response.data
}

export const updateJob = async (code: number, jobData: Omit<Job, 'code'>): Promise<Job> => {
  const response = await authAxios.put(`/high/job/${code}/`, jobData)
  return response.data
}

export const deleteJob = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/job/${code}/`)
}

// Purchase Order API
export const fetchPO = async (): Promise<Purchase[]> => {
  const response = await authAxios.get('/high/po/')
  return response.data
}

export const fetchPoandInv = async (code: number): Promise<any> => {
  const response = await authAxios.get(`/high/po/inv/${code}/`)
  return response.data
}

export const createPO = async (poData: any): Promise<any> => {
  const response = await authAxios.post('/high/po/', poData)
  return response.data
}

export const updatePO = async (code: number, poData: any): Promise<any> => {
  const response = await authAxios.put(`/high/po/${code}/`, poData)
  return response.data
}

export const deletePO = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/po/${code}/`)
}

// Invoice API
export const fetchInvoice = async (): Promise<Invoice[]> => {
  const response = await authAxios.get('/high/invoice/')
  return response.data
}

export const fetchUnpaidInvoice = async (): Promise<Invoice[]> => {
  const response = await authAxios.get('/high/invoice/unpaid/')
  return response.data
}

export const fetchInNPay = async (): Promise<any[]> => {
  const response = await authAxios.get('/high/invoice/invnpay/')
  return response.data
}

export const createInvoice = async (invoiceData: any): Promise<Invoice> => {
  const response = await authAxios.post('/high/invoice/', invoiceData)
  return response.data
}

export const updateInvoice = async (code: number, invoiceData: any): Promise<Invoice> => {
  const response = await authAxios.put(`/high/invoice/${code}/`, invoiceData)
  return response.data
}

export const updateInvoiceStatus = async (code: number, statusData: any): Promise<Invoice> => {
  const response = await authAxios.put(`/high/invoice/status/${code}/`, statusData)
  return response.data
}

export const deleteInvoice = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/invoice/${code}/`)
}

// Pay API
export const fetchPay = async (): Promise<Pay[]> => {
  const response = await authAxios.get('/high/pay/')
  return response.data
}

export const fetchPayNInv = async (): Promise<any[]> => {
  const response = await authAxios.get('/high/pay/invnpay/')
  return response.data
}

export const createPay = async (payData: any): Promise<Pay> => {
  try {
    const response = await authAxios.post('/high/pay/', payData)
    return response.data
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Error creating pay'
    alert(errorMsg)
    throw new Error(errorMsg)
  }
}

export const updatePay = async (code: number, payData: any): Promise<Pay> => {
  try {
    const response = await authAxios.put(`/high/pay/${code}/`, payData)
    return response.data
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Error updating pay'
    alert(errorMsg)
    throw new Error(errorMsg)
  }
}

export const updateInvStatus = async (code: number, statusData: any): Promise<any> => {
  const response = await authAxios.put(`/high/pay/payupdatestatus/${code}/`, statusData)
  return response.data
}

export const deletePay = async (code: number): Promise<void> => {
  try {
    await authAxios.delete(`/high/pay/${code}/`)
    alert('Deleted successfully')
  } catch (error) {
    alert('Cannot delete, please check the permission and date!')
    throw error
  }
}

// JobBudget API
export const createJobBudget = async (budgetData: Omit<JobBudget, 'code'>): Promise<JobBudget> => {
  const response = await authAxios.post('/high/jobbudgets/', budgetData)
  return response.data
}

export const getJobBudgets = async (): Promise<JobBudget[]> => {
  const response = await authAxios.get('/high/jobbudgets/')
  return response.data
}

export const getJobBudget = async (budgetId: number): Promise<JobBudget> => {
  const response = await authAxios.get(`/high/jobbudgets/${budgetId}/`)
  return response.data
}

export const updateJobBudget = async (budgetId: number, updateData: Partial<JobBudget>): Promise<JobBudget> => {
  const response = await authAxios.put(`/high/jobbudgets/${budgetId}/`, updateData)
  return response.data
}

export const deleteJobBudget = async (budgetId: number): Promise<void> => {
  await authAxios.delete(`/high/jobbudgets/${budgetId}/`)
}

// Company API
export const fetchCompany = async (): Promise<Company> => {
  const response = await authAxios.get('/high/company/')
  return response.data
}

export const updateCompany = async (companyData: Company): Promise<Company> => {
  const response = await authAxios.put(`/high/company/${companyData.id}/`, companyData)
  return response.data
}

// Department API
export const fetchDepartment = async (): Promise<any[]> => {
  const response = await authAxios.get('/high/department/')
  return response.data
}

export const createDepartment = async (departmentData: any): Promise<any> => {
  const response = await authAxios.post('/high/department/', departmentData)
  return response.data
}

export const updateDepartment = async (code: number, departmentData: any): Promise<any> => {
  const response = await authAxios.put(`/high/department/${code}/`, departmentData)
  return response.data
}

export const deleteDepartment = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/department/${code}/`)
}

// Employee API
export const fetchEmployee = async (): Promise<any[]> => {
  const response = await authAxios.get('/high/employee/all/')
  return response.data
}

export const createEmployee = async (employeeData: any): Promise<any> => {
  const response = await authAxios.post('/high/employee/', employeeData)
  return response.data
}

export const updateEmployee = async (code: number, employeeData: any): Promise<any> => {
  const response = await authAxios.put(`/high/employee/${code}/`, employeeData)
  return response.data
}

export const deleteEmployee = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/employee/${code}/`)
}

// User Role API
export const fetchUserRole = async (): Promise<any[]> => {
  const response = await authAxios.get('/high/userrole/')
  return response.data
}

export const updateUserRole = async (roleData: { id: number; role: string }): Promise<any> => {
  const response = await authAxios.put(`/high/userrole/${roleData.id}/`, roleData)
  return response.data
}

export const deleteUserRole = async (id: number): Promise<void> => {
  await authAxios.delete(`/high/userrole/${id}/`)
}

export const createUserRole = async (roleData: { role: string }): Promise<any> => {
  const response = await authAxios.post('/high/userrole/', roleData)
  return response.data
}

// Payroll API
export const fetchPayroll = async (): Promise<any[]> => {
  const response = await authAxios.get('/high/payroll/')
  return response.data
}

export const createPayroll = async (payrollData: any): Promise<any> => {
  const response = await authAxios.post('/high/payroll/', payrollData)
  return response.data
}

export const updatePayroll = async (code: number, payrollData: any): Promise<any> => {
  const response = await authAxios.put(`/high/payroll/${code}/`, payrollData)
  return response.data
}

export const deletePayroll = async (code: number): Promise<void> => {
  await authAxios.delete(`/high/payroll/${code}/`)
}

// Aging Report API
export const fetchAgingReport = async (): Promise<AgeInvoice[]> => {
  const response = await authAxios.get('/high/agingreport/')
  return response.data
}

// BAS Report API
export const fetchBasReport = async (start: Date, end: Date): Promise<any> => {
  const response = await authAxios.post('/high/agingreport/bas/', { start, end })
  return response.data
}

// Export all API functions
export default {
  // Project
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,

  // Contractor
  fetchContractors,
  createContractor,
  updateContractor,
  deleteContractor,

  // Category
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  // Job
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,

  // Purchase Order
  fetchPO,
  fetchPoandInv,
  createPO,
  updatePO,
  deletePO,

  // Invoice
  fetchInvoice,
  fetchUnpaidInvoice,
  fetchInNPay,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,

  // Pay
  fetchPay,
  fetchPayNInv,
  createPay,
  updatePay,
  updateInvStatus,
  deletePay,

  // JobBudget
  createJobBudget,
  getJobBudgets,
  getJobBudget,
  updateJobBudget,
  deleteJobBudget,

  // Company
  fetchCompany,
  updateCompany,

  // Department
  fetchDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  // Employee
  fetchEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,

  // User Role
  fetchUserRole,
  updateUserRole,
  deleteUserRole,
  createUserRole,

  // Payroll
  fetchPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,

  // Reports
  fetchAgingReport,
  fetchBasReport
}