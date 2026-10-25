import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Asteroid {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
      miles_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
      miles: string;
    };
    orbiting_body: string;
  }[];
  orbital_data?: {
    orbit_id: string;
    orbit_determination_date: string;
    first_observation_date: string;
    last_observation_date: string;
    orbital_period: number;
    eccentricity: number;
    inclination: number;
    aphelion_distance: number;
    perihelion_distance: number;
  };
  prediction?: {
    habitabilityScore: number;
    isNewEarthCandidate: boolean;
    riskLevel: string;
    assessmentSummary: string;
    factors: string[];
    mechanics?: {
      deltaVRequiredKps: number;
      estimatedTransferDays: number;
      estimatedMassKg: string;
      miningPotential: {
        platinumTonnes: number;
        waterTonnes: number;
        estimatedValueBillionUSD: number;
      };
    };
  };
}

export interface AlertItem {
  id: string;
  title: string;
  date: string;
  time: string;
  severity: string;
  diameterKm: number;
  velocityKmh: string;
  missDistanceKm: string;
  description: string;
}

export interface GroupedHistoryDay {
  date: string;
  status?: "In Progress" | "Done" | "Overtime";
  tasks?: { title: string; time: string }[];
}

class NasaApiService {
  private client = axios.create({
    baseURL: BACKEND_URL,
    timeout: 15000,
    withCredentials: true,
  });

  async getAsteroidsFeed(startDate: string, endDate?: string): Promise<Asteroid[]> {
    try {
      const response = await this.client.get('/api/asteroids/feed', {
        params: {
          startDate,
          endDate: endDate || startDate,
        },
      });

      if (response.data && Array.isArray(response.data.asteroids)) {
        return response.data.asteroids;
      }
      return [];
    } catch (error) {
      console.error('Error fetching asteroids feed from backend:', error);
      return [];
    }
  }

  async getAsteroidById(id: string): Promise<Asteroid | null> {
    try {
      const response = await this.client.get(`/api/asteroids/${id}`);
      if (response.data && response.data.asteroid) {
        return response.data.asteroid;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching asteroid ${id} from backend:`, error);
      return null;
    }
  }

  async getClosestApproaches(): Promise<Asteroid[]> {
    try {
      const response = await this.client.get('/api/asteroids/closest');
      if (response.data && Array.isArray(response.data.asteroids)) {
        return response.data.asteroids;
      }
      return [];
    } catch (error) {
      console.error('Error fetching closest approaches from backend:', error);
      return [];
    }
  }

  async getHazardousAsteroids(): Promise<Asteroid[]> {
    try {
      const response = await this.client.get('/api/asteroids/hazardous');
      if (response.data && Array.isArray(response.data.asteroids)) {
        return response.data.asteroids;
      }
      return [];
    } catch (error) {
      console.error('Error fetching hazardous asteroids from backend:', error);
      return [];
    }
  }

  async getNewEarthCandidates(): Promise<Asteroid[]> {
    try {
      const response = await this.client.get('/api/asteroids/new-earth-candidates');
      if (response.data && Array.isArray(response.data.candidates)) {
        return response.data.candidates;
      }
      return [];
    } catch (error) {
      console.error('Error fetching New Earth candidates from backend:', error);
      return [];
    }
  }

  async getAlerts(): Promise<AlertItem[]> {
    try {
      const response = await this.client.get('/api/alerts');
      if (response.data && Array.isArray(response.data.alerts)) {
        return response.data.alerts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching alerts from backend:', error);
      return [];
    }
  }

  async getHistory(): Promise<GroupedHistoryDay[]> {
    try {
      const response = await this.client.get('/api/history');
      if (response.data && Array.isArray(response.data.groupedHistory)) {
        return response.data.groupedHistory;
      }
      return [];
    } catch (error) {
      console.error('Error fetching history from backend:', error);
      return [];
    }
  }

  async predictHabitability(asteroidData: Partial<Asteroid>): Promise<any> {
    try {
      const response = await this.client.post('/api/asteroids/predict', asteroidData);
      return response.data;
    } catch (error) {
      console.error('Error calculating prediction from backend:', error);
      return null;
    }
  }
}

export const nasaApi = new NasaApiService();
