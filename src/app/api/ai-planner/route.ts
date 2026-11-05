import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, currentEvents, customApiKey } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Chybí prompt' }, { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    // Pokud uživatel nemá Gemini API klíč, nabídneme mu buď chytrou simulaci / generátor, nebo výzvu
    if (!apiKey) {
      // Inteligentní vestavěný heuristický parser pro běžné požadavky (pokud není klíč ještě nastaven)
      const mockResult = generateFallbackPlan(prompt);
      return NextResponse.json({
        plan: mockResult,
        warning: 'Použit vestavěný offline asistent (není nastaven GEMINI_API_KEY). Pro maximální AI chytrost nastav svůj Gemini API klíč.'
      });
    }

    // Volání Google Gemini API
    const systemInstruction = `Jsi inteligentní plánovač rozvrhu a studijní poradce (pro středoškoláky, maturanty i studenty VŠ) v aplikaci TaskFlow.
Uživatel ti zadá své požadavky na studium (např. příprava na maturitu, SCIO testy, zkoušky), záliby, tréninky, volný čas nebo dlouhodobé cíle.
Tvým úkolem je vytvořit strukturovaný návrh rozvrhu (událostí).

Musíš vrátit POUZE validní JSON (žádný markdown, žádný úvodní ani koncový text, čistý JSON) v tomto formátu:
{
  "summary": "Stručné shrnutí navrženého plánu v češtině (2-3 věty)",
  "milestones": [
    {
      "title": "Název zkoušky / milníku",
      "date": "YYYY-MM-DD",
      "notes": "Poznámka k milníku"
    }
  ],
  "events": [
    {
      "title": "Název aktivity (např. Příprava na maturitu - Matematika)",
      "description": "Konkrétní téma nebo cíl bloku",
      "category": "STUDY" | "EXAM" | "SPORT" | "LEISURE" | "PERSONAL",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "recurrence": "WEEKLY" | "NONE" | "DAILY",
      "daysOfWeek": [1, 2, ...], // 1=Pondělí, 2=Úterý, 3=Středa, 4=Čtvrtek, 5=Pátek, 6=Sobota, 7=Neděle (POUZE pokud recurrence je WEEKLY)
      "date": "YYYY-MM-DD" // (POUZE pokud recurrence je NONE)
    }
  ]
}

Pravidla plánování:
- Studium rozlož rovnoměrně, neplánuj nereálně dlouhé bloky bez pauz (ideálně 60-90 minut).
- Pokud uživatel zmíní konkrétní dny pro tréninky nebo volno, respektuj je.
- Pro opakující se týdenní aktivity nastav recurrence="WEEKLY" a uveď dny v daysOfWeek (1-7).
- Pro jednorázové zkoušky nebo testy nastav recurrence="NONE" a category="EXAM" a vyplň přesné datum v date (YYYY-MM-DD) a uveď i v milestones.
- Odpověz v češtině.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nUživatelův požadavek:\n"${prompt}"\n\nStávající aktivity uživatele v kalendáři:\n${JSON.stringify(currentEvents || [])}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      // Fallback
      const fallback = generateFallbackPlan(prompt);
      return NextResponse.json({
        plan: fallback,
        warning: `Gemini API vrátilo chybu (${response.status}). Byl použit záložní generátor plánu.`
      });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Prázdná odpověď od AI');
    }

    const cleanJson = candidateText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsedPlan = JSON.parse(cleanJson);

    return NextResponse.json({ plan: parsedPlan });

  } catch (err: any) {
    console.error('AI Planner route error:', err);
    return NextResponse.json({
      error: 'Nepodařilo se vygenerovat plán: ' + (err.message || 'Neznámá chyba')
    }, { status: 500 });
  }
}

// Inteligentní záložní generátor (pokud není klíč nebo selže síť)
function generateFallbackPlan(prompt: string) {
  const p = prompt.toLowerCase();
  const events = [];
  const milestones = [];

  // Zkoušky a milníky
  if (p.includes('scio') || p.includes('test')) {
    milestones.push({
      title: 'SCIO testy',
      date: '2026-12-10',
      notes: 'Národní srovnávací zkoušky'
    });
    events.push({
      title: 'SCIO test - OSP',
      description: 'Zkouška nanečisto / reálný test',
      category: 'EXAM',
      startTime: '09:00',
      endTime: '11:30',
      recurrence: 'NONE',
      date: '2026-12-10'
    });
  }

  if (p.includes('maturit') || p.includes('matematik') || p.includes('česk')) {
    milestones.push({
      title: 'Maturitní zkoušky',
      date: '2027-05-15',
      notes: 'Písemné a ústní maturitní zkoušky'
    });
    // Pondělí matematika
    events.push({
      title: 'Příprava na maturitu - Matematika',
      description: 'Funkce, rovnice a procvičování testů Cermat',
      category: 'STUDY',
      startTime: '16:00',
      endTime: '17:30',
      recurrence: 'WEEKLY',
      daysOfWeek: [1] // Pondělí
    });
    // Čtvrtek český jazyk / literatura
    events.push({
      title: 'Příprava na maturitu - Český jazyk',
      description: 'Rozbor děl a literární historie',
      category: 'STUDY',
      startTime: '16:00',
      endTime: '17:15',
      recurrence: 'WEEKLY',
      daysOfWeek: [4] // Čtvrtek
    });
  }

  // Sport a trénink
  if (p.includes('trenink') || p.includes('trénink') || p.includes('sport') || p.includes('posilovna')) {
    events.push({
      title: 'Sport / Trénink',
      description: 'Kondiční trénink nebo sportovní klub',
      category: 'SPORT',
      startTime: '18:00',
      endTime: '19:30',
      recurrence: 'WEEKLY',
      daysOfWeek: [3, 5] // Středa a Pátek
    });
  }

  // Volno / Relax
  events.push({
    title: 'Volno a regenerace',
    description: 'Čas pro sebe, filmy, kamarádi',
    category: 'LEISURE',
    startTime: '14:00',
    endTime: '18:00',
    recurrence: 'WEEKLY',
    daysOfWeek: [7] // Neděle
  });

  return {
    summary: 'Navrhl jsem vyvážený studijní plán s pravidelnými bloky na přípravu na zkoušky, vyhrazeným časem na trénink a garantovaným volnem na regeneraci.',
    milestones,
    events
  };
}
