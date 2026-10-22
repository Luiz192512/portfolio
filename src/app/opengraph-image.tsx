import { ImageResponse } from 'next/og';
import { getProfile } from '@/lib/content/load';

export const alt = 'Luiz Gustavo Enz, Desenvolvedor Full Stack';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Built-in sans font from ImageResponse: no network fetch and no TTF at build time.
export default async function OpengraphImage() {
  const profile = await getProfile();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: '#0D0D0D',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          color: '#F0F0F0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: '#00A7F8' }}>luiz.enz</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>
            {profile.name}
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: '#A3A3A3', marginTop: 24 }}>
            {profile.role}
          </div>
        </div>
        <div style={{ display: 'flex', width: 160, height: 8, background: '#00A7F8' }} />
      </div>
    ),
    { ...size },
  );
}
