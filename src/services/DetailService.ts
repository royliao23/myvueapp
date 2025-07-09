const API_BASE_URL = import.meta.env.VITE_API_NODE
if (!API_BASE_URL) {
  throw new Error('VITE_API_NODE is not defined in .env')
}


export const fetchJobDetails = async (jobId: number) => { const response = await fetch(`${API_BASE_URL}/high/job/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching job details');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchProjectDetails = async (code: number) => { const response = await fetch(`${API_BASE_URL}/high/projects/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching project details');
  const data = await response.json();
  return data; 
};


export const fetchContractorDetails = async (code: number) => { const response = await fetch(`${API_BASE_URL}/high/contractor/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching contractor details');
  const data = await response.json();
  return data; 
};

export const fetchPurchaseDetails = async (code: number) => { const response = await fetch(`${API_BASE_URL}/high/po/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po details');
  const data = await response.json();
  
  return  data.po || data; 
};

export const fetchInvoiceDetails =  async (code: number) => { 
  try {
  const response = await fetch(`${API_BASE_URL}/high/invoice/singleinvpay/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po details');
  const invoice = await response.json();
  if (invoice.error) throw new Error('Error fetching invoice details');
  console.log("Fetched invoice payment details:", invoice.pay);
  const paid = invoice.pay?.reduce((sum:number, payment:any) => sum + parseFloat(payment.amount), 0) || 0;

  return {
      ...invoice,
      paid,  // Ensure 'paid' is part of the returned object
    };
} catch (error) {
  console.error("Error fetching invoice details:", error);
}
};

export const fetchInvoicePayDetails = async (invoiceId: number) => {
  const response = await fetch(`${API_BASE_URL}/high/invoice/singleinvpay/${invoiceId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching invoice and payment details');
  const data = await response.json();
  return data; 
};

export const fetchPayDetails = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/pay/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching pay details');
  const data = await response.json();
  return data; 
};

export const fetchSingleUserRole = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/userrole/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching user role');
  const data = await response.json();
  return data; 
};
