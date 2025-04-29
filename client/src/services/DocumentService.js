const DocumentService = {
  async getAllDocuments() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/document`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      return data.documents;
    } catch (error) {
      console.error('[DocumentService] Get all documents error:', error);
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
        body: formData, // FormData containing file and metadata
      });
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
      const data = await response.json();
      return data.document;
    } catch (error) {
      console.error('[DocumentService] Upload document error:', error);
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
        throw new Error('Failed to update document');
      }
      const data = await response.json();
      return data.document;
    } catch (error) {
      console.error('[DocumentService] Update document error:', error);
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
      
      if (!data.url) {
        throw new Error('Download URL not available');
      }
      
      return data;
    } catch (error) {
      console.error('[DocumentService] Download document error:', error);
      throw error;
    }
  }
};

export default DocumentService;