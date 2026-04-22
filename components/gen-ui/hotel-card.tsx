import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HotelCardData } from '@/src/domain/entities/ai-response';

interface Props {
  data: HotelCardData;
  index?: number;
}

function StarRating({ stars }: { stars: number }) {
  return (
    <View style={starStyles.row}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text key={i} style={[starStyles.star, i < stars ? starStyles.filled : starStyles.empty]}>
          ★
        </Text>
      ))}
    </View>
  );
}

export function HotelCard({ data, index = 0 }: Props) {
  const formattedPrice = new Intl.NumberFormat('tr-TR').format(data.pricePerNight);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={styles.card}>
      {/* Top accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.body}>
        {/* Name + stars */}
        <View style={styles.nameRow}>
          <Text style={styles.hotelName} numberOfLines={2}>
            {data.name}
          </Text>
          <StarRating stars={data.stars} />
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{data.location}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {data.description}
        </Text>

        {/* Amenities */}
        {data.amenities.length > 0 && (
          <View style={styles.amenities}>
            {data.amenities.slice(0, 4).map((a, i) => (
              <View key={i} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price + Book */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Gecelik</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formattedPrice}</Text>
              <Text style={styles.currency}> {data.currency}</Text>
            </View>
          </View>
          <View style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>Rezervasyon</Text>
          </View>
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
  accentBar: {
    height: 4,
    backgroundColor: '#0052CC',
  },
  body: { padding: 14 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  hotelName: {
    flex: 1,
    color: '#002D72',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationIcon: { fontSize: 12 },
  locationText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  description: {
    color: '#4A5568',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityChip: {
    backgroundColor: '#F4F7FA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amenityText: { color: '#0052CC', fontSize: 10, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
    paddingTop: 10,
  },
  priceLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '600', marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { color: '#002D72', fontSize: 22, fontWeight: '800' },
  currency: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  bookBtn: {
    backgroundColor: '#0052CC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 1 },
  star: { fontSize: 14 },
  filled: { color: '#F59E0B' },
  empty: { color: '#E2E8F0' },
});
