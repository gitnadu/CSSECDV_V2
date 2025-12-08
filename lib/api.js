class ApiClient {
  async request(endpoint, options = {}) {
    try {
      const res = await fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        },
        credentials: "include", // VERY IMPORTANT → sends cookies
      });

      const data = await res.json();

      if (!res.ok) {
        const error = new Error(data.error || "Request failed");
        error.status = res.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Only log unexpected errors (not client errors like 400, 401, 404)
      // Client errors are expected user mistakes (wrong password, etc.)
      const isClientError = err.status >= 400 && err.status < 500;
      
      if (process.env.NODE_ENV === 'development' && !isClientError) {
        console.error(`[API ERROR] ${endpoint}:`, err);
      }
      throw err;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export default new ApiClient();
