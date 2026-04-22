import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TicketCardData } from '@/src/domain/entities/ai-response';

interface Props {
  data: TicketCardData;
  index?: number;
}

export function TicketCard({ data, index = 0 }: Props) {
  const formattedPrice = new Intl.NumberFormat('tr-TR').format(data.price);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={styles.card}>
      {/* Airline header */}
      <View style={styles.header}>
        <Text style={styles.airlineIcon}>✈️</Text>
        <Text style={styles.airlineName}>{data.airline}</Text>
        <View style={styles.classBadge}>
          <Text style={styles.classText}>{data.class}</Text>
        </View>
      </View>

      {/* Flight route */}
      <View style={styles.routeRow}>
        {/* Departure */}
        <View style={styles.airport}>
          <Text style={styles.airportTime}>{data.departureTime}</Text>
          <Text style={styles.airportCode}>{data.from}</Text>
        </View>

        {/* Arrow + duration */}
        <View style={styles.durationCol}>
          <Text style={styles.durationText}>{data.duration}</Text>
          <View style={styles.lineContainer}>
            <View style={styles.dot} />
            <View style={styles.dashedLine} />
            <Text style={styles.arrowIcon}>✈</Text>
          </View>
          <Text style={styles.directText}>Direkt</Text>
        </View>

        {/* Arrival */}
        <View style={[styles.airport, { alignItems: 'flex-end' }]}>
          <Text style={styles.airportTime}>{data.arrivalTime}</Text>
          <Text style={styles.airportCode}>{data.to}</Text>
        </View>
      </View>

      {/* Footer: price + buy */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Bilet fiyatı</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formattedPrice}</Text>
            <Text style={styles.currency}> {data.currency}</Text>
          </View>
        </View>
        <View style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Satın Al</Text>
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
    backgroundColor: '#002D72',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  airlineIcon: { fontSize: 16 },
  airlineName: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  classBadge: {
    backgroundColor: '#00B4FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  classText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  airport: { flex: 1, alignItems: 'flex-start' },
  airportTime: {
    color: '#002D72',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  airportCode: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  durationCol: { alignItems: 'center', flex: 1 },
  durationText: { color: '#94A3B8', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0052CC',
  },
  dashedLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 2,
  },
  arrowIcon: { color: '#0052CC', fontSize: 12 },
  directText: { color: '#00B4FF', fontSize: 9, fontWeight: '700', marginTop: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  priceLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '600', marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { color: '#002D72', fontSize: 22, fontWeight: '800' },
  currency: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  buyBtn: {
    backgroundColor: '#0052CC',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  buyBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
