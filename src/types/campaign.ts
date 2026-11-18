export type CampaignPublic = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  localityLabel: string;
  active: boolean;
  mapCenterLat: number | null;
  mapCenterLng: number | null;
  localities: { name: string; lat: number | null; lng: number | null }[];
};