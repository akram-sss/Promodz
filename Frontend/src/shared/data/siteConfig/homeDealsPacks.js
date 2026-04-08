import Data from '@data/moc-data/Data';
import defaultLogo from '@assets/PromoDzLogo.svg';

const STORAGE_KEY = 'promodz.homeDealsPacks.v1';

const getDefaultPacks = () => {
  const companies = Array.isArray(Data?.companyData) ? Data.companyData : [];
  const fallbackCompanyIds = companies.slice(0, 3).map((c) => c?.id).filter(Boolean);
  const companyIds = [30, 40, 50].every((id) => companies.some((c) => c?.id === id))
    ? [30, 40, 50]
    : fallbackCompanyIds;

  return [0, 1, 2].map((i) => ({
    slotId: i + 1,
    companyId: companyIds[i] ?? (companyIds[0] ?? null),
    text: `Up to 50% off fall deal drop ${i + 1}`,
    image: '',
  }));
};

export const getHomeDealsPacks = () => {
  if (typeof window === 'undefined') return getDefaultPacks();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPacks();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 3) return getDefaultPacks();

    return parsed.map((p, i) => ({
      slotId: Number(p?.slotId ?? i + 1),
      companyId: p?.companyId ?? null,
      text: String(p?.text ?? ''),
      image: String(p?.image ?? ''),
    }));
  } catch {
    return getDefaultPacks();
  }
};

export const setHomeDealsPacks = (packs) => {
  const next = Array.isArray(packs) ? packs : [];
  const canonical = next.slice(0, 3).map((p, i) => ({
    slotId: Number(p?.slotId ?? i + 1),
    companyId: p?.companyId ?? null,
    text: String(p?.text ?? ''),
    image: String(p?.image ?? ''),
  }));

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
  }

  return canonical;
};

export const resolveCompanyForPack = (companyId) => {
  const companies = Array.isArray(Data?.companyData) ? Data.companyData : [];
  return companies.find((c) => c?.id === companyId) ?? null;
};

export const getPackLogo = (company) => {
  return company?.image || defaultLogo;
};
