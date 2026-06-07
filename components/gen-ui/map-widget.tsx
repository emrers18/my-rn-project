import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { geocodeLocation } from '@/lib/map-utils';

interface MapStop {
  name: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  stops: MapStop[];
  title?: string;
}

// Dark mode style configuration for Google Maps on Android
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1f2937' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e5e7eb' }],
  },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#374151' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2937' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4b5563' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2937' }],
  },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3f4f6' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4b5563' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
];

export function MapWidget({ stops, title = 'Seyahat Rotası' }: Props) {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const mapRef = useRef<MapView>(null);

  const [resolvedStops, setResolvedStops] = useState<
    (MapStop & { latitude: number; longitude: number })[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Check if we are running in Dark Mode to apply custom styles
  const isDarkTheme = colors.surfaceContainerLow === Colors.dark.surfaceContainerLow;

  useEffect(() => {
    let active = true;

    async function resolveCoordinates() {
      setLoading(true);
      const resolved: (MapStop & { latitude: number; longitude: number })[] = [];

      for (const stop of stops) {
        if (stop.latitude !== undefined && stop.longitude !== undefined) {
          resolved.push({
            ...stop,
            latitude: stop.latitude,
            longitude: stop.longitude,
          });
        } else {
          // Attempt client-side geocoding fallback
          const coords = await geocodeLocation(stop.name);
          if (coords) {
            resolved.push({
              ...stop,
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }
        }
      }

      if (active) {
        setResolvedStops(resolved);
        setLoading(false);
      }
    }

    resolveCoordinates();

    return () => {
      active = false;
    };
  }, [stops]);

  useEffect(() => {
    if (resolvedStops.length > 0 && mapRef.current) {
      const timer = setTimeout(() => {
        if (resolvedStops.length === 1) {
          mapRef.current?.animateToRegion(
            {
              latitude: resolvedStops[0].latitude,
              longitude: resolvedStops[0].longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            },
            600
          );
        } else {
          mapRef.current?.fitToCoordinates(
            resolvedStops.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
            {
              edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
              animated: true,
            }
          );
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [resolvedStops]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.webText}>Harita görseli mobil uygulamada desteklenmektedir.</Text>
      </View>
    );
  }

  // Initial region centered on the first resolved stop, or fallback to Turkey coordinates
  const initialRegion =
    resolvedStops.length > 0
      ? {
          latitude: resolvedStops[0].latitude,
          longitude: resolvedStops[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      : {
          latitude: 39.92077,
          longitude: 32.85411,
          latitudeDelta: 10,
          longitudeDelta: 10,
        };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={styles.loadingText}>Konumlar yükleniyor...</Text>
        </View>
      ) : resolvedStops.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Konum bilgileri haritalandırılabilir değil.</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          customMapStyle={isDarkTheme ? darkMapStyle : undefined}
          showsUserLocation={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {resolvedStops.map((stop, i) => (
            <Marker
              key={`${stop.name}-${i}`}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.name}
            >
              <View style={styles.markerCircle}>
                <Text style={styles.markerText}>{i + 1}</Text>
              </View>
            </Marker>
          ))}

          {resolvedStops.length > 1 && (
            <Polyline
              coordinates={resolvedStops.map((s) => ({
                latitude: s.latitude,
                longitude: s.longitude,
              }))}
              strokeColor={colors.primary}
              strokeWidth={3}
              lineDashPattern={[6, 3]}
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      height: 220,
      width: '100%',
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
      marginVertical: 8,
    },
    webContainer: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
      marginVertical: 8,
      gap: 10,
    },
    titleText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    webText: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      opacity: 0.7,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceContainerLow,
      padding: 16,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.text,
      opacity: 0.8,
    },
    errorText: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      opacity: 0.8,
    },
    markerCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 4,
    },
    markerText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: 'bold',
    },
  });
