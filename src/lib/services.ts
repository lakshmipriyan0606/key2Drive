export const SERVICE_IMAGES: Record<string, string> = {
  'hourly-driver': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop',
  'full-day-driver': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
  'airport-transfer': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop',
  'outstation-driver': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
  'corporate-services': 'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
  'personal-chauffeur': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop',
};

export const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseFeaturesAndImage(featuresStr: string | null): { featuresList: string[]; image?: string } {
  if (!featuresStr) return { featuresList: [] };
  try {
    const parsed = JSON.parse(featuresStr);
    if (Array.isArray(parsed)) {
      return { featuresList: parsed };
    }
    if (parsed && typeof parsed === 'object') {
      return {
        featuresList: Array.isArray(parsed.bullets) ? parsed.bullets : [],
        image: typeof parsed.image === 'string' && parsed.image.trim() ? parsed.image : undefined,
      };
    }
  } catch {
    return {
      featuresList: featuresStr.split('\n').filter((f: string) => f.trim().length > 0),
    };
  }
  return { featuresList: [] };
}

export function stringifyFeaturesAndImage(featuresInput: any, imageInput?: string): string {
  let bullets: string[] = [];
  let image = imageInput;

  if (Array.isArray(featuresInput)) {
    bullets = featuresInput;
  } else if (typeof featuresInput === 'string') {
    try {
      const parsed = JSON.parse(featuresInput);
      if (Array.isArray(parsed)) {
        bullets = parsed;
      } else if (parsed && typeof parsed === 'object') {
        bullets = Array.isArray(parsed.bullets) ? parsed.bullets : [];
        if (!image && parsed.image) {
          image = parsed.image;
        }
      }
    } catch {
      bullets = featuresInput.split('\n').filter((f: string) => f.trim().length > 0);
    }
  }

  if (image && image.trim()) {
    return JSON.stringify({ bullets, image: image.trim() });
  }

  return JSON.stringify(bullets);
}

