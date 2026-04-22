import { View } from 'react-native';

import {
  parseDestinationItems,
  parseHotelItems,
  parseRouteItems,
  parseTicketItems,
  WidgetType,
} from '@/src/domain/entities/ai-response';
import { DestinationCard } from './destination-card';
import { ErrorWidget } from './error-widget';
import { HotelCard } from './hotel-card';
import { RouteWidget } from './route-widget';
import { TicketCard } from './ticket-card';

interface Props {
  widgetType: string;
  widgetData: Record<string, unknown> | undefined;
}

/**
 * GenUIRenderer — widgetType'a göre doğru bileşeni render eder.
 * widgetData.items içindeki her item için ilgili card/widget oluşturulur.
 */
export function GenUIRenderer({ widgetType, widgetData }: Props) {
  const items = Array.isArray(widgetData?.items) ? (widgetData.items as unknown[]) : [];

  if (items.length === 0) {
    return <ErrorWidget message='Widget verisi bulunamadı.' />;
  }

  switch (widgetType as WidgetType) {
    case 'DestinationCard': {
      const parsed = parseDestinationItems(items);
      if (parsed.length === 0) return <ErrorWidget message='Destinasyon verisi işlenemedi.' />;
      return (
        <View>
          {parsed.map((d, i) => (
            <DestinationCard key={i} data={d} index={i} />
          ))}
        </View>
      );
    }

    case 'HotelCard': {
      const parsed = parseHotelItems(items);
      if (parsed.length === 0) return <ErrorWidget message='Otel verisi işlenemedi.' />;
      return (
        <View>
          {parsed.map((h, i) => (
            <HotelCard key={i} data={h} index={i} />
          ))}
        </View>
      );
    }

    case 'TicketCard': {
      const parsed = parseTicketItems(items);
      if (parsed.length === 0) return <ErrorWidget message='Uçuş verisi işlenemedi.' />;
      return (
        <View>
          {parsed.map((t, i) => (
            <TicketCard key={i} data={t} index={i} />
          ))}
        </View>
      );
    }

    case 'RouteWidget': {
      const parsed = parseRouteItems(items);
      if (parsed.length === 0) return <ErrorWidget message='Rota verisi işlenemedi.' />;
      return (
        <View>
          {parsed.map((r, i) => (
            <RouteWidget key={i} data={r} index={i} />
          ))}
        </View>
      );
    }

    default:
      return <ErrorWidget message={`Bilinmeyen widget türü: ${widgetType}`} />;
  }
}
