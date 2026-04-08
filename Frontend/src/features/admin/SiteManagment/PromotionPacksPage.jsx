import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Chip, Stack
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import Data from '@data/moc-data/Data';

const PromotionPacksPage = () => {
  const [plans, setPlans] = useState(Data.initialPlans);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', price: '', features: '' });
  const [error, setError] = useState('');

  const handleOpenEdit = (plan) => {
    setForm({
      ...plan,
      features: plan.features.join('\n'),
    });
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.features) {
      setError('All fields are required');
      return;
    }

    const updatedPlan = {
      id: form.id,
      name: form.name,
      price: form.price,
      features: form.features.split('\n').map(f => f.trim()).filter(f => f),
    };

    setPlans(prev => prev.map(p => (p.id === updatedPlan.id ? updatedPlan : p)));
    setOpen(false);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#fff', minHeight: '100vh' }}>
      <Typography variant="h4" color="#8b5cf6" mb={2}>
        Promotion Plans Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f3e8ff' }}>
            <TableRow>
              <TableCell><strong>Plan Name</strong></TableCell>
              <TableCell><strong>Price (DZ)</strong></TableCell>
              <TableCell><strong>Features</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map(plan => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.price}</TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {plan.features.map((feature, idx) => (
                      <Chip key={idx} label={feature} size="small" color="primary" variant="outlined" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenEdit(plan)} color="primary">
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No plans available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: '#8b5cf6' }}>Edit Plan</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Plan Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Features (one per line)"
            multiline
            rows={5}
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            sx={{ mt: 2 }}
          />
          {error && <Typography color="error" mt={1}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} sx={{ backgroundColor: '#8b5cf6', color: '#fff' }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};




export default PromotionPacksPage;
