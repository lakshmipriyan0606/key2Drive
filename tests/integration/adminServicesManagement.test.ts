import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import * as authModule from '@/lib/auth';
import { GET as getServices, POST as createService } from '@/app/api/admin/services/route';
import {
  GET as getService,
  PUT as updateService,
  DELETE as deleteService,
} from '@/app/api/admin/services/[id]/route';
import { POST as uploadImage } from '@/app/api/admin/upload/route';

describe('Admin Services & Content Management Integration Suite', () => {
  beforeEach(() => {
    vi.spyOn(authModule, 'getAdminSession').mockResolvedValue({
      user: {
        id: 'admin_test_svc',
        email: 'admin@key2drive.com',
        name: 'Master Admin',
        role: 'ADMIN',
      },
      sessionId: 'sess_test_svc',
      token: 'tok_test_svc',
      expiresAt: new Date(Date.now() + 86400000),
    });
  });

  it('GET /api/admin/services returns all services with features list and image', async () => {
    const res = await getServices();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.count).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.services)).toBe(true);
    expect(data.services[0]).toHaveProperty('title');
    expect(data.services[0]).toHaveProperty('slug');
    expect(data.services[0]).toHaveProperty('featuresList');
    expect(data.services[0]).toHaveProperty('image');
  });

  it('POST /api/admin/upload processes uploaded image and returns url', async () => {
    const dummyImageContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    const blob = new Blob([dummyImageContent], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'test-car.png');

    const req = new Request('http://localhost:3000/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadImage(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.url).toBe('string');
    expect(data.url.length).toBeGreaterThan(0);
  });

  it('POST /api/admin/services creates a new service with custom image and reflects in database', async () => {
    const uniqueSlug = `test-luxury-driver-${Date.now()}`;
    const customImageUrl = 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800';

    const payload = {
      title: 'Luxury Car Chauffeur',
      slug: uniqueSlug,
      tagline: 'Mercedes, BMW, Audi & EV specialists',
      description: 'White-glove luxury chauffeur service for VIPs, weddings, and executive board meetings.',
      image: customImageUrl,
      features: ['Suited & polished chauffeurs', 'Automatic & EV competence', 'Strict discretion guaranteed'],
      basePrice: 500,
      priceUnit: 'per hour',
      isActive: true,
    };

    const req = new Request('http://localhost:3000/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await createService(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.service.title).toBe('Luxury Car Chauffeur');
    expect(data.service.slug).toBe(uniqueSlug);
    expect(data.service.image).toBe(customImageUrl);

    const createdId = data.service.id;

    // Verify GET /api/admin/services/[id] returns image and featuresList
    const getReq = new Request(`http://localhost:3000/api/admin/services/${createdId}`);
    const getRes = await getService(getReq, {
      params: Promise.resolve({ id: createdId }),
    });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.service.title).toBe('Luxury Car Chauffeur');
    expect(getData.service.image).toBe(customImageUrl);
    expect(getData.service.featuresList).toContain('Suited & polished chauffeurs');

    // Verify PUT /api/admin/services/[id] updates image, content and name
    const updatedImageUrl = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800';
    const updateReq = new Request(`http://localhost:3000/api/admin/services/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'VIP Executive Chauffeur',
        tagline: 'Premium Mercedes & BMW specialists',
        image: updatedImageUrl,
        basePrice: 650,
      }),
    });
    const updateRes = await updateService(updateReq, {
      params: Promise.resolve({ id: createdId }),
    });
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.service.title).toBe('VIP Executive Chauffeur');
    expect(updateData.service.image).toBe(updatedImageUrl);
    expect(updateData.service.basePrice).toBe(650);

    // Verify DELETE /api/admin/services/[id]
    const delReq = new Request(`http://localhost:3000/api/admin/services/${createdId}`, {
      method: 'DELETE',
    });
    const delRes = await deleteService(delReq, {
      params: Promise.resolve({ id: createdId }),
    });
    expect(delRes.status).toBe(200);
    const delData = await delRes.json();
    expect(delData.success).toBe(true);
    expect(delData.deleted).toBe(true);

    // Ensure it no longer exists
    const checkDeleted = await prisma.service.findUnique({
      where: { id: createdId },
    });
    expect(checkDeleted).toBeNull();
  });
});
