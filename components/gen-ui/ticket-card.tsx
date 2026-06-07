import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { TicketCardData } from '@/src/domain/entities/ai-response';

interface Props {
  data: TicketCardData;
  index?: number;
}

export function TicketCard({ data, index = 0 }: Props) {
  const styles = useThemedStyles(createStyles);
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
      backgroundColor: colors.primary,
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
      backgroundColor: colors.tint,
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
      color: colors.primary,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    airportCode: {
      color: colors.icon,
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
    },
    durationCol: { alignItems: 'center', flex: 1 },
    durationText: {
      color: colors.icon,
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 4,
      opacity: 0.8,
    },
    lineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    dashedLine: {
      flex: 1,
      height: 1.5,
      backgroundColor: colors.surfaceContainer,
      marginHorizontal: 2,
    },
    arrowIcon: { color: colors.primary, fontSize: 12 },
    directText: { color: colors.tint, fontSize: 9, fontWeight: '700', marginTop: 4 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.surfaceContainer,
      paddingHorizontal: 14,
      paddingVertical: 12,
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
    buyBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 9,
    },
    buyBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  });
