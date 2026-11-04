import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL je povinná' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Neplatný protokol');
      }
    } catch {
      return NextResponse.json({ error: 'Neplatný formát URL' }, { status: 400 });
    }

    // Fetch page with standard User-Agent
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'cs,en-US;q=0.9,en;q=0.8',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Stránku se nepodařilo načíst (status ${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();

    let title: string | undefined;
    let price: number | undefined;
    let image: string | undefined;

    // 1. Try JSON-LD schema
    const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const jsonContent = JSON.parse(match[1].trim());
        const items = Array.isArray(jsonContent) ? jsonContent : [jsonContent];

        for (const item of items) {
          if (item['@type'] === 'Product' || item.offers) {
            if (!title && item.name) {
              title = item.name;
            }
            if (item.image) {
              image = Array.isArray(item.image) ? item.image[0] : (typeof item.image === 'string' ? item.image : item.image.url);
            }
            const offers = item.offers;
            if (offers) {
              const offerObj = Array.isArray(offers) ? offers[0] : offers;
              if (offerObj && offerObj.price) {
                const parsed = parseFloat(String(offerObj.price).replace(/\s/g, '').replace(',', '.'));
                if (!isNaN(parsed) && parsed > 0) {
                  price = Math.round(parsed);
                }
              }
            }
          }
        }
      } catch {
        // Ignore JSON parse errors in malformed script tags
      }
    }

    // 2. OpenGraph & Meta tags
    if (!title) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["']/i);
      if (ogTitleMatch) {
        title = ogTitleMatch[1];
      } else {
        const docTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (docTitleMatch) {
          title = docTitleMatch[1];
        }
      }
    }

    if (!image) {
      const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImgMatch) {
        image = ogImgMatch[1];
      }
    }

    if (!price) {
      // Product price meta tags
      const priceMetaMatch =
        html.match(/<meta[^>]*property=["'](?:product|og):price:amount["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*itemprop=["']price["'][^>]*content=["']([^"']+)["']/i);

      if (priceMetaMatch) {
        const parsed = parseFloat(priceMetaMatch[1].replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) {
          price = Math.round(parsed);
        }
      }
    }

    // 3. Fallback regex search for Czech price if still not found
    if (!price) {
      const czkMatch = html.match(/([0-9]{1,3}(?:[\s.][0-9]{3})*|[0-9]+)(?:,[0-9]{2})?\s*(?:Kč|CZK)/i);
      if (czkMatch) {
        const numStr = czkMatch[1].replace(/[\s.]/g, '');
        const parsed = parseInt(numStr, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed < 10000000) {
          price = parsed;
        }
      }
    }

    // Clean up title if found
    if (title) {
      title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
      // Remove common suffixes like "| Alza.cz"
      title = title.replace(/\s*[-–|]\s*(Alza\.cz|Mall\.cz|Datart|Allegro|Heureka).*$/i, '');
    }

    return NextResponse.json({
      title: title || '',
      price: price || null,
      image: image || null,
      url: parsedUrl.toString(),
    });
  } catch (error: unknown) {
    console.error('Error fetching product meta:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chyba při stahování dat' },
      { status: 500 }
    );
  }
}
