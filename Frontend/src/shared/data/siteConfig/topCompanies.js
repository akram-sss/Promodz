import Data from '@data/moc-data/Data';

const STORAGE_KEY = 'promodz.topCompanies.v1';

export const getTopCompanies = () => {
  if (typeof window === 'undefined') return Data?.TopHomePage || [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return Data?.TopHomePage || [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Data?.TopHomePage || [];

    return parsed;
  } catch {
    return Data?.TopHomePage || [];
  }
};

export const setTopCompanies = (companies) => {
  const canonical = Array.isArray(companies) ? companies : [];

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
  }

  return canonical;
};

export const addTopCompany = (company) => {
  const current = getTopCompanies();
  const newCompanies = [...current, company];
  return setTopCompanies(newCompanies);
};

export const updateTopCompany = (id, updatedCompany) => {
  const current = getTopCompanies();
  const newCompanies = current.map(c => c.id === id ? updatedCompany : c);
  return setTopCompanies(newCompanies);
};

export const deleteTopCompany = (id) => {
  const current = getTopCompanies();
  const newCompanies = current.filter(c => c.id !== id);
  return setTopCompanies(newCompanies);
};
