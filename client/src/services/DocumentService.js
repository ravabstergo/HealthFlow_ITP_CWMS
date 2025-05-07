const DocumentService = {
  async getAllDocuments(patientId, doctorId) {
    try {

      console.log('Fetching all documents with patientId:', patientId, 'and doctorId:', doctorId);
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (doctorId) params.append('doctorId', doctorId);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },  
  async getAllDocumentsByDoctor(doctorId) {
    try {
      console.log('Fetching all documents for doctor:', doctorId);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document/doctor/documents?doctorId=${doctorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor documents');
      }

      const result = await response.json();
      return result.documents; // Return the documents array directly
    } catch (error) {
      console.error('Error fetching doctor documents:', error);
      throw error;
    }
  },

  async getDocumentById(id) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      const data = await response.json();
      return data.document;
    } catch (error) {
      console.error('[DocumentService] Get document error:', error);
      throw error;
    }
  },

  async uploadDocument(formData) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      const data = await response.json();
      return data.document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async updateDocument(id, formData) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update document');
      }

      const data = await response.json();
      return data.document;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async deleteDocument(id) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      return true;
    } catch (error) {
      console.error('[DocumentService] Delete document error:', error);
      throw error;
    }
  },

  async updateDocumentStatus(id, doctorid, status) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorid, status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update document status');
      }
      const data = await response.json();
      return data.document;
    } catch (error) {
      console.error('[DocumentService] Update document status error:', error);
      throw error;
    }
  },

  async downloadDocument(id) {
    try {
      console.log('Downloading document with ID:', id);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document/${id}/download`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download document');
      }
      
      const data = await response.json();
      
      if (!data.downloadUrl) {
        throw new Error('Download URL not available');
      }
      
      return {
        url: data.downloadUrl,
        filename: data.filename,
        contentType: data.contentType
      };
    } catch (error) {
      console.error('[DocumentService] Download document error:', error);
      throw error;
    }
  }
};

export default DocumentService;