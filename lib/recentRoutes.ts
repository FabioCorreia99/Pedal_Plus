import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_ROUTES_KEY = 'recent_routes';
const MAX_RECENT_ROUTES = 10;

export interface RecentRoute {
  id: string;
  originLabel: string;
  destinationLabel: string;
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  distanceMeters: number;
  durationMinutes: number;
  timestamp: string;
  thumbnailUrl?: string;
}

export const saveRecentRoute = async (route: Omit<RecentRoute, 'id' | 'timestamp'>) => {
  try {
    const data = await AsyncStorage.getItem(RECENT_ROUTES_KEY);
    const routes: RecentRoute[] = data ? JSON.parse(data) : [];
    const newRoute: RecentRoute = {
      ...route,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const existingIndex = routes.findIndex(
      r => r.originLabel === route.originLabel && 
           r.destinationLabel === route.destinationLabel
    );
    if (existingIndex !== -1) {
      routes.splice(existingIndex, 1);
    }
    routes.unshift(newRoute);
    const trimmedRoutes = routes.slice(0, MAX_RECENT_ROUTES);
    await AsyncStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(trimmedRoutes));
  } catch (error) {
    console.error('Error saving recent route:', error);
  }
};

export const getRecentRoutes = async (): Promise<RecentRoute[]> => {
  try {
    const data = await AsyncStorage.getItem(RECENT_ROUTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading recent routes:', error);
    return [];
  }
};

export const clearRecentRoutes = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_ROUTES_KEY);
  } catch (error) {
    console.error('Error clearing recent routes:', error);
  }
};

export const removeRecentRouteById = async (id: string) => {
  try {
    const data = await AsyncStorage.getItem(RECENT_ROUTES_KEY);
    const routes: RecentRoute[] = data ? JSON.parse(data) : [];
    const updatedRoutes = routes.filter(route => route.id !== id);
    await AsyncStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(updatedRoutes));
  } catch (error) {
    console.error('Error removing recent route:', error);
  }
};