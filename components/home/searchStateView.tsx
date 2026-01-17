import LocationSearchInput from '@/components/home/locationSearchInput';
import { getRecentRoutes, removeRecentRouteById } from '@/lib/recentRoutes';
import React, { RefObject, useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { SwipeListView } from 'react-native-swipe-list-view';

const COLORS = {
  primaryOrange: "#FF9E46",
};

type LatLng = { latitude: number; longitude: number };

interface SearchStateProps {
  originRef: RefObject<GooglePlacesAutocompleteRef | null>;
  destinationRef: RefObject<GooglePlacesAutocompleteRef | null>;
  originLabel: string;
  destinationLabel: string;
  showOriginSearch: boolean;
  showDestinationSearch: boolean;
  onOriginSearchToggle: () => void;
  onDestinationSearchToggle: () => void;
  onOriginSelect: (coords: LatLng, description: string) => void;
  onDestinationSelect: (coords: LatLng, description: string) => void;
}

export default function SearchState({
  originRef,
  destinationRef,
  originLabel,
  destinationLabel,
  showOriginSearch,
  showDestinationSearch,
  onOriginSearchToggle,
  onDestinationSearchToggle,
  onOriginSelect,
  onDestinationSelect,
}: SearchStateProps) {

  const SCREEN_WIDTH: number = Dimensions.get('window').width;
  const SWIPE_WIDTH: number = SCREEN_WIDTH * 0.2; // 20% swipe area

  const [routes, setRoutes] = React.useState<Array<{
    id: string;
    originLabel: string;
    destinationLabel: string;
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    distanceMeters: number;
    durationMinutes: number;
    timestamp: string;
    thumbnailUrl?: string;
  }>>([]);

  useEffect(() => {
    (async () => {
      const routes = await getRecentRoutes();
      setRoutes(routes);
    })();
  }, []);

  const handleRecentRoutePress = (route: {
    id: string;
    originLabel: string;
    destinationLabel: string;
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    distanceMeters: number;
    durationMinutes: number;
    timestamp: string;
    thumbnailUrl?: string;
  }) => {
    onOriginSelect(route.origin, route.originLabel);
    onDestinationSelect(route.destination, route.destinationLabel);
  };

  const handleDeleteRoute = async (id: string) => {
    await removeRecentRouteById(id);
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <View style={[styles.bottomSheet, { height: '55%' }]}>
      <View style={{ paddingHorizontal: 24, marginTop: -30 }}>
        <View style={[styles.card, (showOriginSearch || showDestinationSearch) ? { zIndex: 10000 } : {}]}>
          <LocationSearchInput
            ref={originRef}
            iconColor={COLORS.primaryOrange}
            placeholder="Origem"
            label={originLabel}
            isSearching={showOriginSearch}
            onSearchToggle={onOriginSearchToggle}
            onLocationSelect={(coords, description) => onOriginSelect(coords, description)}
            showCurrentLocationButton={true}
          />

          <LocationSearchInput
            ref={destinationRef}
            iconColor="#ef4444"
            placeholder="Destino"
            label={destinationLabel}
            isSearching={showDestinationSearch}
            onSearchToggle={onDestinationSearchToggle}
            onLocationSelect={(coords, description) => onDestinationSelect(coords, description)}
          />
        </View>
      </View>

      <SwipeListView
        data={routes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routeItem}
            onPress={() => handleRecentRoutePress(item)}
          >
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16 }}
              />
            ) : (
              <View style={styles.routeIcon}>
                <Text style={{ fontSize: 24 }}>📍</Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '300', fontSize: 14 }} numberOfLines={1}>
                {item.originLabel} → {item.destinationLabel}
              </Text>
              <Text style={{ color: '#999', fontSize: 12 }}>
                {(item.distanceMeters / 1000).toFixed(1)}km • {item.durationMinutes}min
              </Text>
            </View>
          </TouchableOpacity>
        )}
        renderHiddenItem={({ item }) => (
          <View
            style={[
              styles.deleteButtonContainer,
              { width: SCREEN_WIDTH * 0.2 } // 20% of screen width
            ]}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </View>
        )}
        rightOpenValue={-SWIPE_WIDTH} // swipe threshold
        stopRightSwipe={-SWIPE_WIDTH}
        onRowOpen={(rowKey) => handleDeleteRoute(rowKey.toString())}
        ListEmptyComponent={() => (
          <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 32 }}>
            Nenhuma rota recente
          </Text>
        )}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, elevation: 20,
  },
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 16,
    elevation: 5, borderWidth: 1, borderColor: '#f3f4f6'
  },
  routeItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 4,
  },
  routeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#FF9E46',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteButtonContainer: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 4,
    height: '91%',  
    position: 'absolute',   
    right: 0,                
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 24,
  },
});
