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
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (err) {
      // Log only in development mode
      if (process.env.NODE_ENV === 'development') {
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
