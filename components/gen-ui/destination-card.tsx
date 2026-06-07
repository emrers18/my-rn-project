import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { DestinationCardData } from '@/src/domain/entities/ai-response';
import { MapWidget } from './map-widget';

interface Props {
  data: DestinationCardData;
  index?: number;
}

export function DestinationCard({ data, index = 0 }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={styles.card}>
      {/* Header gradient simulation */}
      <View style={styles.header}>
        <View style={styles.locationBadge}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationCountry}>{data.country}</Text>
        </View>
        {data.weather && (
          <View style={styles.weatherBadge}>
            <Text style={styles.weatherText}>
              {data.weather.temperature}°C · {data.weather.condition}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.cityName}>{data.name}</Text>
      <Text style={styles.description}>{data.description}</Text>

      {data.highlights.length > 0 && (
        <View style={styles.chips}>
          {data.highlights.slice(0, 4).map((h, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{h}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Destination Map Visual */}
      <View style={styles.mapContainer}>
        <MapWidget
          stops={[{ name: data.name, latitude: data.latitude, longitude: data.longitude }]}
          title={data.name}
        />
      </View>

      <View style={styles.actionRow}>
        <View style={styles.exploreBtn}>
          <Text style={styles.exploreBtnText}>Keşfet</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: 16,
      overflow: 'hidden',
      marginVertical: 4,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    header: {
      backgroundColor: colors.primaryContainer,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    mapContainer: {
      paddingHorizontal: 14,
      paddingBottom: 10,
    },
    locationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationIcon: { fontSize: 13 },
    locationCountry: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    weatherBadge: {
      backgroundColor: colors.tint,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    weatherText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    cityName: {
      color: colors.primary,
      fontSize: 20,
      fontWeight: '800',
      paddingHorizontal: 14,
      paddingTop: 12,
      letterSpacing: -0.3,
    },
    description: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 10,
      opacity: 0.85,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      paddingHorizontal: 14,
      paddingBottom: 12,
    },
    chip: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
    },
    chipText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
    actionRow: {
      borderTopWidth: 1,
      borderTopColor: colors.surfaceContainer,
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: 'flex-end',
    },
    exploreBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 7,
    },
    exploreBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  });
