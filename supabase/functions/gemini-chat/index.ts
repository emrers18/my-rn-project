import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ─── Env ──────────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
Sen TravelBot'sun, profesyonel bir yapay zeka seyahat asistanısın.
Her zaman Türkçe yanıt ver. Seyahat planlaması, otel önerisi, uçuş bilgisi ve rota konularında uzmansın.

Kullanıcı destinasyon, otel, uçuş veya rota hakkında sorduğunda aşağıdaki JSON formatında yanıt ver:

{
  "text": "Kullanıcıya kısa ve samimi Türkçe açıklama",
  "widgets": [
    {
      "type": "DestinationCard" | "HotelCard" | "TicketCard" | "RouteWidget",
      "data": { ... }
    }
  ]
}

Widget data formatları (TAM OLARAK bu yapıyı kullan):

DestinationCard:
{
  "name": "şehir adı",
  "country": "ülke adı",
  "description": "kısa açıklama",
  "highlights": ["özellik1", "özellik2", "özellik3"],
  "weather": { "temperature": 22, "condition": "Güneşli" }
}

HotelCard:
{
  "name": "otel adı",
  "location": "konum",
  "pricePerNight": 1500,
  "currency": "TRY",
  "stars": 5,
  "description": "otel açıklaması",
  "amenities": ["WiFi", "Havuz", "Restoran"]
}

TicketCard:
{
  "airline": "havayolu adı",
  "from": "İstanbul (IST)",
  "to": "Roma (FCO)",
  "departureTime": "09:30",
  "arrivalTime": "11:45",
  "duration": "3s 15dk",
  "price": 4500,
  "currency": "TRY",
  "class": "Ekonomi"
}

RouteWidget:
{
  "title": "rota başlığı",
  "totalDuration": "7 gün",
  "stops": [
    { "name": "yer adı", "duration": "2 gün", "description": "aktivite açıklaması" }
  ]
}

Genel sohbet için: { "text": "Türkçe yanıt", "widgets": [] }

ÖNEMLİ KURALLAR:
- SADECE geçerli JSON döndür, JSON dışında HİÇBİR metin yazma
- Birden fazla aynı türde widget döndürebilirsin (örn. 3 otel için 3 HotelCard)
- Tüm widget'lar AYNI TYPE olmalı (HotelCard ile TicketCard'ı karıştırma)
- currency değeri için "TRY", "EUR", "USD" kullan
`.trim();

// ─── Types ────────────────────────────────────────────────────────────────────
interface RequestBody {
  chatId: string;
  userId: string;
  content: string;
}

interface GeminiContent {
  role: string;
  parts: Array<{ text: string }>;
}

interface AiWidget {
  type: string;
  data: Record<string, unknown>;
}

interface AiResponseJson {
  text: string;
  widgets: AiWidget[];
}

interface DbMessageRow {
  id: string;
  chat_id: string;
  user_id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── CORS headers ─────────────────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Parse & validate request body
    const body = (await req.json()) as RequestBody;
    const { chatId, userId, content } = body;

    if (!chatId || !userId || !content?.trim()) {
      return Response.json({ error: 'chatId, userId ve content zorunludur.' }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Save user message to DB
    const { data: userMsg, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        role: 'user',
        content: content.trim(),
        metadata: { isGenUI: false },
      })
      .select()
      .single<DbMessageRow>();

    if (userMsgError || !userMsg) {
      return Response.json(
        { error: `Mesaj kaydedilemedi: ${userMsgError?.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Fetch last 20 messages for context
    const { data: historyRows } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(20);

    // 4. Build Gemini history (user msg is already included as it was just saved)
    const geminiHistory: GeminiContent[] = (historyRows ?? []).map((row: { role: string; content: string }) => ({
      role: row.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: row.content }],
    }));

    // 5. Call Gemini 2.5 Flash
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiHistory,
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.75,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return Response.json(
        { error: `Gemini API hatası: ${geminiRes.status}` },
        { status: 502, headers: corsHeaders }
      );
    }

    // 6. Parse Gemini response
    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let aiResponse: AiResponseJson;
    try {
      aiResponse = JSON.parse(rawText) as AiResponseJson;
      if (typeof aiResponse.text !== 'string') throw new Error('Invalid format');
    } catch {
      // Fallback: treat as plain text
      aiResponse = { text: rawText || 'Üzgünüm, şu an yanıt üretemiyorum.', widgets: [] };
    }

    // 7. Build metadata for AI message
    const widgets = Array.isArray(aiResponse.widgets) ? aiResponse.widgets : [];
    const hasWidgets = widgets.length > 0;
    const metadata = hasWidgets
      ? {
          isGenUI: true,
          widgetType: widgets[0].type,
          widgetData: { items: widgets.map((w) => w.data) },
        }
      : { isGenUI: false };

    // 8. Save AI message to DB
    const { data: aiMsg, error: aiMsgError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        role: 'assistant',
        content: aiResponse.text || 'Yanıt alındı.',
        metadata,
      })
      .select()
      .single<DbMessageRow>();

    if (aiMsgError || !aiMsg) {
      return Response.json(
        { error: `AI mesajı kaydedilemedi: ${aiMsgError?.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    // 9. Update chat updated_at
    await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);

    return Response.json({ userMessage: userMsg, aiMessage: aiMsg }, { headers: corsHeaders });
  } catch (err) {
    console.error('Edge function error:', err);
    return Response.json(
      { error: `Beklenmeyen hata: ${String(err)}` },
      { status: 500, headers: corsHeaders }
    );
  }
});
