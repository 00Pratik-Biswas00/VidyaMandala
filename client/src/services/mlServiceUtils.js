// services/mlServiceUtils.js
export const mlServiceUtils = {
  isMLServiceAvailable: false,
  lastChecked: null,
  
  async checkHealth() {
    try {
      // Only check once every minute to avoid excessive requests
      const now = Date.now();
      if (this.lastChecked && now - this.lastChecked < 60000) {
        return this.isMLServiceAvailable;
      }
      
      console.log("Checking ML service health...");
      
      // Try the root endpoint first if health endpoint fails
      try {
        const response = await fetch(`${import.meta.env.VITE_ML_API_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          this.isMLServiceAvailable = true;
          this.lastChecked = now;
          console.log('ML service health check successful');
          return true;
        }
        
        // If health endpoint fails, try the root endpoint
        console.log('Health endpoint failed, trying root endpoint');
        const rootResponse = await fetch(`${import.meta.env.VITE_ML_API_URL}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        this.isMLServiceAvailable = rootResponse.ok;
      } catch (error) {
        console.log("ML service is unavailable:", error.message);
        this.isMLServiceAvailable = false;
      }
      
      this.lastChecked = now;
      console.log(`ML service is ${this.isMLServiceAvailable ? 'available' : 'unavailable'}`);
      return this.isMLServiceAvailable;
    } catch (error) {
      console.log("ML service health check failed:", error.message);
      this.isMLServiceAvailable = false;
      this.lastChecked = Date.now();
      return false;
    }
  },
  
  async checkSpecificEndpoint(endpoint) {
    try {
      if (!this.isMLServiceAvailable) {
        await this.checkHealth();
        if (!this.isMLServiceAvailable) return false;
      }
      
      console.log(`Checking specific endpoint: ${endpoint}`);
      const response = await fetch(`${import.meta.env.VITE_ML_API_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const available = response.status !== 404;
      console.log(`Endpoint ${endpoint} is ${available ? 'available' : 'unavailable'}`);
      return available;
    } catch (error) {
      console.log(`Endpoint ${endpoint} check failed:`, error.message);
      return false;
    }
  }
};