import React from 'react';
import {
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import Data from '@data/moc-data/Data';
import { useCategories } from '@shared/hooks/useProducts';

const PURPLE_MAIN = '#9766ff';
const PURPLE_ALT = '#a78bfa';
const PANEL_BORDER = 'rgba(151, 102, 255, 0.18)';
const PANEL_BG = 'rgba(255,255,255,0.46)';
const DROPDOWN_BG = 'rgba(255, 255, 255, 0.92)';

const getCategoryIcon = (name) => {
  const normalized = String(name || '').toLowerCase();

  if (normalized.includes('fashion') || normalized.includes('apparel')) return <CheckroomOutlinedIcon />;
  if (normalized.includes('electronics') || normalized.includes('gadgets')) return <DevicesOtherOutlinedIcon />;
  if (normalized.includes('home') || normalized.includes('living')) return <ChairOutlinedIcon />;
  if (normalized.includes('grocer') || normalized.includes('food')) return <LocalGroceryStoreOutlinedIcon />;
  if (normalized.includes('beauty') || normalized.includes('personal care')) return <SpaOutlinedIcon />;
  if (normalized.includes('health') || normalized.includes('fitness')) return <FitnessCenterOutlinedIcon />;
  if (normalized.includes('toys') || normalized.includes('hobbies') || normalized.includes('entertainment'))
    return <SportsEsportsOutlinedIcon />;
  if (normalized.includes('automotive') || normalized.includes('tools')) return <BuildOutlinedIcon />;
  if (normalized.includes('travel') || normalized.includes('tourism')) return <FlightTakeoffOutlinedIcon />;

  return <CheckroomOutlinedIcon />;
};

export default function Filter({ value, onChange }) {
  const { categories: apiCategories } = useCategories();
  // Use API categories if available, fall back to mock data
  const categories = apiCategories.length > 0 ? apiCategories : (Array.isArray(Data?.categories) ? Data.categories : []);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [menu, setMenu] = React.useState({ anchorEl: null, mainCategory: null });
  const [uncontrolledValue, setUncontrolledValue] = React.useState({ mainCategory: null, subcategory: null });
  const currentValue = value ?? uncontrolledValue;

  const setValue = React.useCallback(
    (next) => {
      if (onChange) onChange(next);
      if (value === undefined) setUncontrolledValue(next);
    },
    [onChange, value]
  );

  const closeMenu = React.useCallback(() => {
    setMenu({ anchorEl: null, mainCategory: null });
  }, []);

  const toggleMainCategory = (event, mainCategoryName) => {
    const anchorEl = event?.currentTarget ?? null;
    setMenu((prev) => {
      const isSame = prev.mainCategory === mainCategoryName;
      if (isSame) return { anchorEl: null, mainCategory: null };
      return { anchorEl, mainCategory: mainCategoryName };
    });
  };

  const handleSubcategoryClick = (mainCategoryName, subcategoryName) => {
    const isSame =
      currentValue?.mainCategory === mainCategoryName && currentValue?.subcategory === subcategoryName;
    setValue(
      isSame
        ? { mainCategory: null, subcategory: null }
        : { mainCategory: mainCategoryName, subcategory: subcategoryName }
    );
    closeMenu();

    if (isSame) {
      navigate('/explore');
    } else {
      navigate(`/category/${encodeURIComponent(subcategoryName)}`);
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        py: 1.25,
      }}
    >
      <Box sx={{ px: 2.25, pb: 1.25 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.0rem',
            fontWeight: 800,
            color: PURPLE_MAIN,
            letterSpacing: 0.2,
          }}
        >
          Categories
        </Typography>
        <Typography variant="body2" sx={{ color: PURPLE_ALT, fontWeight: 650, mt: 0.15, fontSize: '0.82rem' }}>
          Pick a subcategory to filter
        </Typography>
      </Box>

      <Box
        sx={{
          mx: 1.75,
          mb: 0.75,
          borderRadius: 3,
          border: `1px solid ${PANEL_BORDER}`,
          bgcolor: 'rgba(255,255,255,0.40)',
          overflow: 'hidden',
          flex: 1,
          minHeight: 0,
          backdropFilter: 'blur(12px)',
        }}
      >
        <List
          dense
          sx={{
            width: '100%',
            px: 0.75,
            py: 0.75,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            overflowY: 'auto',
            maxHeight: '100%',
            scrollbarWidth: 'thin',
            scrollbarColor: `${PURPLE_ALT} transparent`,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(167, 139, 250, 0.55)',
              borderRadius: 12,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(151, 102, 255, 0.7)',
            },
          }}
        >
          {categories.map((category) => {
            const mainName = category?.name ?? '';
            const subcategories = Array.isArray(category?.subcategories) ? category.subcategories : [];
            const isMainActive = currentValue?.mainCategory === mainName;
            const isMenuOpen = Boolean(menu?.anchorEl) && menu?.mainCategory === mainName;

            return (
              <Box key={mainName} sx={{ mx: 0.75 }}>
                <ListItemButton
                  onClick={(e) => toggleMainCategory(e, mainName)}
                  sx={{
                    borderRadius: 2.5,
                    px: 1.1,
                    py: 0.95,
                    '& .MuiListItemIcon-root': { minWidth: 40 },
                    color: PURPLE_MAIN,
                    background: isMainActive
                      ? 'linear-gradient(90deg, rgba(151, 102, 255, 0.18), rgba(167, 139, 250, 0.07))'
                      : PANEL_BG,
                    border: isMainActive
                      ? '1px solid rgba(151, 102, 255, 0.22)'
                      : '1px solid rgba(151, 102, 255, 0.12)',
                    backdropFilter: 'blur(14px)',
                    boxShadow: isMainActive ? '0 12px 26px rgba(124, 58, 237, 0.12)' : 'none',
                    '&:hover': {
                      bgcolor: 'rgba(151, 102, 255, 0.10)',
                      borderColor: 'rgba(151, 102, 255, 0.22)',
                      boxShadow: '0 10px 22px rgba(124, 58, 237, 0.10)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isMainActive ? PURPLE_MAIN : 'rgba(151, 102, 255, 0.92)',
                      '& svg': { fontSize: 20 },
                    }}
                  >
                    {getCategoryIcon(mainName)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontSize: '0.98rem', fontWeight: 750 }}>
                        {mainName}
                      </Typography>
                    }
                  />
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', color: PURPLE_ALT }}>
                    {isMenuOpen ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
                  </Box>
                </ListItemButton>

                <Popper
                  open={isMenuOpen}
                  anchorEl={menu?.anchorEl}
                  placement={isSmallScreen ? 'bottom-start' : 'right-start'}
                  disablePortal={false}
                  modifiers={[
                    { name: 'offset', options: { offset: [0, 8] } },
                    { name: 'preventOverflow', options: { padding: 8 } },
                  ]}
                  sx={{ zIndex: 2000 }}
                >
                  <ClickAwayListener onClickAway={closeMenu}>
                    <Paper
                      elevation={0}
                      sx={{
                        width: 300,
                        maxWidth: '80vw',
                        borderRadius: 3,
                        border: `1px solid ${PANEL_BORDER}`,
                        bgcolor: DROPDOWN_BG,
                        backdropFilter: 'blur(18px)',
                        overflow: 'hidden',
                        boxShadow: '0 18px 40px rgba(124, 58, 237, 0.16)',
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.75,
                          py: 1.25,
                          background:
                            'linear-gradient(180deg, rgba(151, 102, 255, 0.14) 0%, rgba(255,255,255,0.0) 100%)',
                        }}
                      >
                        <Typography sx={{ fontWeight: 950, color: PURPLE_MAIN, fontSize: '0.98rem' }}>
                          {mainName}
                        </Typography>
                        <Typography sx={{ mt: 0.1, color: PURPLE_ALT, fontWeight: 700, fontSize: '0.82rem' }}>
                          Choose a subcategory
                        </Typography>
                      </Box>
                      <Divider />

                      <List
                        dense
                        sx={{
                          px: 0.75,
                          py: 0.75,
                          maxHeight: 320,
                          overflowY: 'auto',
                          scrollbarWidth: 'thin',
                          scrollbarColor: `${PURPLE_ALT} transparent`,
                          '&::-webkit-scrollbar': { width: 8 },
                          '&::-webkit-scrollbar-track': { background: 'transparent' },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(167, 139, 250, 0.55)',
                            borderRadius: 12,
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: 'rgba(151, 102, 255, 0.7)',
                          },
                        }}
                      >
                        {subcategories.map((subcat) => {
                          const isSubSelected =
                            currentValue?.mainCategory === mainName && currentValue?.subcategory === subcat;

                          return (
                            <ListItemButton
                              key={`${mainName}-${subcat}`}
                              onClick={() => handleSubcategoryClick(mainName, subcat)}
                              sx={{
                                borderRadius: 2.25,
                                py: 0.9,
                                px: 1.25,
                                color: PURPLE_MAIN,
                                borderLeft: isSubSelected ? `3px solid ${PURPLE_MAIN}` : '3px solid transparent',
                                '&:hover': { bgcolor: 'rgba(151, 102, 255, 0.10)' },
                                ...(isSubSelected
                                  ? {
                                      bgcolor: 'rgba(151, 102, 255, 0.14)',
                                      '&:hover': { bgcolor: 'rgba(151, 102, 255, 0.18)' },
                                    }
                                  : null),
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 28, color: isSubSelected ? PURPLE_MAIN : PURPLE_ALT }}>
                                <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: isSubSelected ? 850 : 650,
                                      fontSize: '0.9rem',
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {subcat}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Paper>
                  </ClickAwayListener>
                </Popper>
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
