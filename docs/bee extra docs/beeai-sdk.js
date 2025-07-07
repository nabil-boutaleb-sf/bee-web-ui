const axios = require('axios');
const io = require('socket.io-client');

class Bee {
  constructor(options) {
    this.apiKey = options.apiKey;
    this.baseURL = 'https://api.bee.computer';
    this.socket = null;
  }

// Conversation methods
  async getConversations(userId, { page = 1, limit = 10 } = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/v1/${userId}/conversations`, {
        params: { page, limit },
        headers: { 'x-api-key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get conversations: ${error.message}`);
    }
  }

  async getConversation(userId, conversationId) {
    try {
      const response = await axios.get(`${this.baseURL}/v1/${userId}/conversations/${conversationId}`, {
        headers: { 'x-api-key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error.message}`);
    }
  }

  async deleteConversation(userId, conversationId) {
    try {
      const response = await axios.delete(`${this.baseURL}/v1/${userId}/conversations/${conversationId}`, {
        headers: { 'x-api-key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  async endConversation(userId, conversationId) {
    try {
      const response = await axios.post(`${this.baseURL}/v1/${userId}/conversations/${conversationId}/end`, null, {
        headers: { 'x-api-key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to end conversation: ${error.message}`);
    }
  }

  async retryConversation(userId, conversationId) {
    try {
      const response = await axios.post(`${this.baseURL}/v1/${userId}/conversations/${conversationId}/retry`, null, {
        headers: { 'x-api-key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retry conversation: ${error.message}`);
    }
  }

    // Fact methods
    async getFacts(userId, { page = 1, limit = 10, confirmed = true } = {}) {
      try {
        const response = await axios.get(`${this.baseURL}/v1/${userId}/facts`, {
          params: { page, limit, confirmed },
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to get facts: ${error.message}`);
      }
    }
  
    async getFact(userId, factId) {
      try {
        const response = await axios.get(`${this.baseURL}/v1/${userId}/facts/${factId}`, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to get fact: ${error.message}`);
      }
    }
  
    async createFact(userId, fact) {
      try {
        const response = await axios.post(`${this.baseURL}/v1/${userId}/facts`, fact, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to create fact: ${error.message}`);
      }
    }
  
    async updateFact(userId, factId, fact) {
      try {
        const response = await axios.put(`${this.baseURL}/v1/${userId}/facts/${factId}`, fact, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to update fact: ${error.message}`);
      }
    }
  
    async deleteFact(userId, factId) {
      try {
        const response = await axios.delete(`${this.baseURL}/v1/${userId}/facts/${factId}`, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to delete fact: ${error.message}`);
      }
    }
  
    // Todo methods
    async getTodos(userId, { page = 1, limit = 10 } = {}) {
      try {
        const response = await axios.get(`${this.baseURL}/v1/${userId}/todos`, {
          params: { page, limit },
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to get todos: ${error.message}`);
      }
    }
  
    async getTodo(userId, todoId) {
      try {
        const response = await axios.get(`${this.baseURL}/v1/${userId}/todos/${todoId}`, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to get todo: ${error.message}`);
      }
    }
  
    async createTodo(userId, todo) {
      try {
        const response = await axios.post(`${this.baseURL}/v1/${userId}/todos`, todo, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to create todo: ${error.message}`);
      }
    }
  
    async updateTodo(userId, todoId, todo) {
      try {
        const response = await axios.put(`${this.baseURL}/v1/${userId}/todos/${todoId}`, todo, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to update todo: ${error.message}`);
      }
    }
  
    async deleteTodo(userId, todoId) {
      try {
        const response = await axios.delete(`${this.baseURL}/v1/${userId}/todos/${todoId}`, {
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to delete todo: ${error.message}`);
      }
    }
  
    // Location methods
    async getLocations(userId, { page = 1, limit = 10, conversationId = null } = {}) {
      try {
        const response = await axios.get(`${this.baseURL}/v1/${userId}/locations`, {
          params: { page, limit, conversationId },
          headers: { 'x-api-key': this.apiKey }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to get locations: ${error.message}`);
      }
    }
  
  connect() {
    this.socket = io(`${this.baseURL}`, {
      path: '/sdk',
      extraHeaders: {
        'x-api-key': this.apiKey
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

module.exports = Bee;
