import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DestinationCardData } from '@/src/domain/entities/ai-response';

interface Props {
  data: DestinationCardData;
  index?: number;
}

export function DestinationCard({ data, index = 0 }: Props) {
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

      <View style={styles.actionRow}>
        <View style={styles.exploreBtn}>
          <Text style={styles.exploreBtnText}>Keşfet →</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 4,
    shadowColor: '#002D72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    backgroundColor: '#0052CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    backgroundColor: '#00B4FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  weatherText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cityName: {
    color: '#002D72',
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingTop: 12,
    letterSpacing: -0.3,
  },
  description: {
    color: '#4A5568',
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  chip: {
    backgroundColor: '#F4F7FA',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: { color: '#0052CC', fontSize: 11, fontWeight: '600' },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  exploreBtn: {
    backgroundColor: '#0052CC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  exploreBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
