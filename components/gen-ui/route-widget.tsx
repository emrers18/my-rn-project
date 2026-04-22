import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { RouteWidgetData } from '@/src/domain/entities/ai-response';

interface Props {
  data: RouteWidgetData;
  index?: number;
}

export function RouteWidget({ data, index = 0 }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{data.title}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>⏱ {data.totalDuration}</Text>
          </View>
        </View>
      </View>

      {/* Stops */}
      <View style={styles.stops}>
        {data.stops.map((stop, i) => {
          const isLast = i === data.stops.length - 1;
          return (
            <View key={i} style={styles.stopRow}>
              {/* Timeline indicator */}
              <View style={styles.timeline}>
                <View style={styles.pin}>
                  <Text style={styles.pinNumber}>{i + 1}</Text>
                </View>
                {!isLast && <View style={styles.connector} />}
              </View>

              {/* Stop content */}
              <View style={[styles.stopContent, isLast && styles.stopContentLast]}>
                <View style={styles.stopHeader}>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  <View style={styles.stopDuration}>
                    <Text style={styles.stopDurationText}>{stop.duration}</Text>
                  </View>
                </View>
                <Text style={styles.stopDescription}>{stop.description}</Text>
              </View>
            </View>
          );
        })}
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  mapIcon: { fontSize: 24 },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  durationBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  stops: { padding: 14 },
  stopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeline: {
    alignItems: 'center',
    width: 28,
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumber: { color: '#fff', fontSize: 12, fontWeight: '800' },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
    minHeight: 16,
  },
  stopContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stopContentLast: { paddingBottom: 4 },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  stopName: {
    flex: 1,
    color: '#002D72',
    fontSize: 14,
    fontWeight: '700',
  },
  stopDuration: {
    backgroundColor: '#F4F7FA',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stopDurationText: { color: '#0052CC', fontSize: 10, fontWeight: '700' },
  stopDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
  },
});
