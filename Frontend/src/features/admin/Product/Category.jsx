import React, { useState, useEffect } from "react";

import CategoryCards from "../Components/cards/CategoryCards";
import { productAPI } from '@shared/api';
import { useOutletContext } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import SyncIcon from '@mui/icons-material/Sync';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function Category() {
    const { userId, selectedCompany } = useOutletContext();
    const [cards, setCards] = useState([]);
    const [totalPromotion, setTotalPromotion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          productAPI.getCategories(),
          productAPI.getAll(),
        ]);
        const categories = catRes.data;
        let products = prodRes.data;

        // Filter by selected company if not 'all'
        if (selectedCompany && selectedCompany !== 'all') {
          products = products.filter(p => p.companyId === selectedCompany);
        }

        // Count products per category
        const categoryStats = categories.map(cat => {
          const matching = products.filter(p => p.category === cat.name);
          const subcats = (cat.subcategories || []).map(sub => ({
            name: sub.name || sub,
            count: products.filter(p => p.subCategory === (sub.name || sub)).length,
          }));
          return {
            category: cat.name,
            total: matching.length,
            subcategories: subcats,
          };
        });

        setCards(categoryStats);
        setTotalPromotion(products.length);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [userId, selectedCompany]);

    const handleSyncCategories = async () => {
      try {
        setSyncing(true);
        const res = await productAPI.syncCategories();
        const { created, existed, total } = res.data;
        setSnackbar({
          open: true,
          message: `Synced ${total} categories — ${created} new subcategories added, ${existed} already existed.`,
          severity: created > 0 ? 'success' : 'info',
        });
        // Refresh the category list
        await fetchData();
      } catch (err) {
        console.error('Failed to sync categories:', err);
        setSnackbar({
          open: true,
          message: 'Failed to sync categories. Please try again.',
          severity: 'error',
        });
      } finally {
        setSyncing(false);
      }
    };

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      );
    }

    return (
        <div className="category-container">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button
                variant="outlined"
                startIcon={syncing ? <CircularProgress size={18} /> : <SyncIcon />}
                onClick={handleSyncCategories}
                disabled={syncing}
                sx={{
                  borderColor: '#9766ff',
                  color: '#9766ff',
                  fontWeight: 700,
                  borderRadius: 2,
                  '&:hover': { borderColor: '#7c3aed', bgcolor: 'rgba(151,102,255,0.08)' },
                }}
              >
                {syncing ? 'Syncing...' : 'Sync Categories'}
              </Button>
            </div>
            <CategoryCards categories={cards} totalPromotions={totalPromotion} />
            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar(s => ({ ...s, open: false }))}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                severity={snackbar.severity}
                variant="filled"
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
        </div>
    );
}