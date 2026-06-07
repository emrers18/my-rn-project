import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { HotelCardData } from '@/src/domain/entities/ai-response';

interface Props {
  data: HotelCardData;
  index?: number;
}

function StarRating({ stars, colors }: { stars: number; colors: typeof Colors.light }) {
  const starStyles = createStarStyles(colors);
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
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
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
          <StarRating stars={data.stars} colors={colors} />
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
    accentBar: {
      height: 4,
      backgroundColor: colors.primaryContainer,
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
      color: colors.primary,
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
    locationText: { color: colors.icon, fontSize: 12, fontWeight: '500' },
    description: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 10,
      opacity: 0.85,
    },
    amenities: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    amenityChip: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
    },
    amenityText: { color: colors.primary, fontSize: 10, fontWeight: '600' },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.surfaceContainer,
      paddingTop: 10,
    },
    priceLabel: {
      color: colors.icon,
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 2,
      opacity: 0.8,
    },
    priceRow: { flexDirection: 'row', alignItems: 'baseline' },
    price: { color: colors.primary, fontSize: 22, fontWeight: '800' },
    currency: { color: colors.icon, fontSize: 12, fontWeight: '600' },
    bookBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 9,
    },
    bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  });

const createStarStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 1 },
    star: { fontSize: 14 },
    filled: { color: '#F59E0B' },
    empty: { color: colors.outline },
  });
