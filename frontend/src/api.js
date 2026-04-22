const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(method, endpoint, body = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API Hatası');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth
  register(name, email, password, weight, admin_code) {
    return this.request('POST', '/auth/register', {
      name, email, password, weight, admin_code
    });
  }

  login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  getMe() {
    return this.request('GET', '/auth/me');
  }

  // Patient - Weights
  getWeights() {
    return this.request('GET', '/patient/weights');
  }

  addWeight(weight) {
    return this.request('POST', '/patient/weights', { weight });
  }

  // Patient - Measurements
  getMeasurements() {
    return this.request('GET', '/patient/measurements');
  }

  addMeasurement(data) {
    return this.request('POST', '/patient/measurements', data);
  }

  // Patient - Meals
  getMeals() {
    return this.request('GET', '/patient/meals');
  }

  addMeal(meal) {
    return this.request('POST', '/patient/meals', { meal });
  }

  // Patient - Messages
  getMessages() {
    return this.request('GET', '/patient/messages');
  }

  // Patient - Supplements
  getSupplements() {
    return this.request('GET', '/patient/supplements');
  }

  // Patient - Profile
  getProfile() {
    return this.request('GET', '/patient/profile');
  }

  updateProfile(data) {
    return this.request('PATCH', '/patient/profile', data);
  }

  // Admin - Patients
  getPatients() {
    return this.request('GET', '/admin/patients');
  }

  getPatient(id) {
    return this.request('GET', `/admin/patients/${id}`);
  }

  updatePatientStage(id, stage) {
    return this.request('PATCH', `/admin/patients/${id}/stage`, { stage });
  }

  sendMessage(patient_id, content) {
    return this.request('POST', `/admin/patients/${patient_id}/message`, { content });
  }

  assignSupplement(patient_id, name, dose, usage) {
    return this.request('POST', `/admin/patients/${patient_id}/supplement`, {
      name, dose, usage
    });
  }

  getStats() {
    return this.request('GET', '/admin/stats');
  }
}

export const api = new ApiService();
