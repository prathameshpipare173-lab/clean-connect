import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GVP_ACTIONS, getCategoryConfig } from '../utils/gvpConfig';

const DataContext = createContext(null);

function ls(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

export function DataProvider({ children }) {
  const [wasteEntries, setWasteEntries]     = useState([]);
  const [wallets, setWallets]               = useState([]);
  const [ledger, setLedger]                 = useState([]);
  const [gvpTransactions, setGvpTxns]       = useState([]);
  const [manureListings, setManureListings] = useState([]);
  const [lots, setLots]                     = useState([]);
  const [dumpReports, setDumpReports]       = useState([]);

  const reload = useCallback(() => {
    setWasteEntries(ls('avengers_waste_entries'));
    setWallets(ls('avengers_wallets'));
    setLedger(ls('avengers_wallet_ledger'));
    setGvpTxns(ls('avengers_gvp_transactions'));
    setManureListings(ls('avengers_manure_listings'));
    setLots(ls('avengers_lots'));
    setDumpReports(ls('avengers_dump_reports'));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ─── Wallet helpers ───────────────────────────────────────────────────────
  const getWallet = (userId) => wallets.find(w => w.household_id === userId) || { cash_balance: 0, points_balance: 0, total_points_earned: 0 };

  const creditWallet = (userId, cash, points, reason) => {
    const ws = ls('avengers_wallets');
    const idx = ws.findIndex(w => w.household_id === userId);
    if (idx === -1) return;
    ws[idx].cash_balance   = +(ws[idx].cash_balance   + cash).toFixed(2);
    ws[idx].points_balance = +(ws[idx].points_balance + points);
    ws[idx].total_points_earned = +(ws[idx].total_points_earned + points);
    lsSet('avengers_wallets', ws);

    const l = ls('avengers_wallet_ledger');
    l.push({ id: 'tx_' + uuidv4().substring(0, 8), wallet_id: 'wal_' + userId, type: 'credit', amount: cash, points, reason, timestamp: new Date().toISOString() });
    lsSet('avengers_wallet_ledger', l);
    reload();
  };

  const debitWallet = (userId, cash, points, reason) => {
    const ws = ls('avengers_wallets');
    const idx = ws.findIndex(w => w.household_id === userId);
    if (idx === -1) throw new Error('Wallet not found');
    if (ws[idx].cash_balance < cash) throw new Error('Insufficient cash balance');
    if (ws[idx].points_balance < points) throw new Error('Insufficient points balance');
    ws[idx].cash_balance   = +(ws[idx].cash_balance   - cash).toFixed(2);
    ws[idx].points_balance = +(ws[idx].points_balance - points);
    lsSet('avengers_wallets', ws);

    const l = ls('avengers_wallet_ledger');
    l.push({ id: 'tx_' + uuidv4().substring(0, 8), wallet_id: 'wal_' + userId, type: 'debit', amount: cash, points, reason, timestamp: new Date().toISOString() });
    lsSet('avengers_wallet_ledger', l);
    reload();
  };

  // ─── GVP helpers ─────────────────────────────────────────────────────────
  const awardGVP = (villageId, action, sourceId = null, weightKg = 1) => {
    const config = GVP_ACTIONS[action];
    if (!config) return;
    const pts = config.perKg ? config.points * weightKg : config.points;
    const txns = ls('avengers_gvp_transactions');
    txns.push({
      id: 'gvp_' + uuidv4().substring(0, 8),
      panchayatId: villageId,
      category: config.category,
      points: pts,
      sourceType: action,
      sourceId,
      description: config.label,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    lsSet('avengers_gvp_transactions', txns);

    // Update village GVP score
    const vils = ls('avengers_villages', []);
    const vIdx = vils.findIndex(v => v.id === villageId);
    if (vIdx !== -1) {
      vils[vIdx].gvp_score = (vils[vIdx].gvp_score || 0) + pts;
      lsSet('avengers_villages', vils);
    }
    reload();
  };

  // ─── Waste Entry CRUD ─────────────────────────────────────────────────────
  const logWaste = (userId, villageId, { category, weight_kg, lat, lng, description, imageProof, aiClassification }) => {
    const entries = ls('avengers_waste_entries');
    const catConfig = getCategoryConfig(category);
    const entry = {
      id: 'we_' + uuidv4().substring(0, 8),
      household_id: userId,
      agent_id: null,
      village_id: villageId,
      category,
      weight_kg: parseFloat(weight_kg),
      status: 'pending',
      lat, lng, description,
      imageProof: imageProof || null,
      aiClassification: aiClassification || null,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    entries.push(entry);
    lsSet('avengers_waste_entries', entries);

    // Award points immediately
    const cash = catConfig.cashPerKg * weight_kg;
    const pts = catConfig.pointsPerKg * weight_kg;
    creditWallet(userId, cash, pts, `Waste logged: ${catConfig.label} ${weight_kg}kg`);
    awardGVP(villageId, 'WASTE_PICKUP', entry.id);

    reload();
    return entry;
  };

  const collectWaste = (entryId, agentId) => {
    const entries = ls('avengers_waste_entries');
    const idx = entries.findIndex(e => e.id === entryId);
    if (idx === -1) throw new Error('Entry not found');
    const entry = entries[idx];
    const createdAt = new Date(entry.createdAt);
    const now = new Date();
    const hoursElapsed = (now - createdAt) / 3600000;

    entries[idx] = { ...entry, status: 'collected', agent_id: agentId, collectedAt: now.toISOString() };
    lsSet('avengers_waste_entries', entries);

    // Bonus or penalty GVP
    if (hoursElapsed < 4) {
      awardGVP(entry.village_id, 'PICKUP_BONUS', entryId);
    } else if (hoursElapsed > 24) {
      awardGVP(entry.village_id, 'PENALTY_LATE', entryId);
    }
    reload();
    return entries[idx];
  };

  // ─── Manure Marketplace ───────────────────────────────────────────────────
  const createManureListing = (sellerId, data) => {
    const listings = ls('avengers_manure_listings');
    const listing = { id: 'mn_' + uuidv4().substring(0, 8), seller_id: sellerId, status: 'available', createdAt: new Date().toISOString(), ...data };
    listings.push(listing);
    lsSet('avengers_manure_listings', listings);
    reload();
    return listing;
  };

  const buyManure = (buyerId, listingId, quantityKg, usePoints) => {
    const listings = ls('avengers_manure_listings');
    const lIdx = listings.findIndex(l => l.id === listingId);
    if (lIdx === -1) throw new Error('Listing not found');
    const listing = listings[lIdx];
    const cash = usePoints ? 0 : listing.price_per_kg * quantityKg;
    const pts  = usePoints ? listing.points_per_kg * quantityKg : 0;
    debitWallet(buyerId, cash, pts, `Manure purchase: ${listing.manure_type} ${quantityKg}kg`);
    creditWallet(listing.seller_id, cash, 0, `Manure sold: ${listing.manure_type} ${quantityKg}kg`);
    listings[lIdx].quantity_kg -= quantityKg;
    if (listings[lIdx].quantity_kg <= 0) listings[lIdx].status = 'sold';
    lsSet('avengers_manure_listings', listings);
    reload();
  };

  // ─── Lots ─────────────────────────────────────────────────────────────────
  const bidOnLot = (lotId, bidderId, bidPerKg) => {
    const ls_lots = ls('avengers_lots');
    const idx = ls_lots.findIndex(l => l.id === lotId);
    if (idx === -1) throw new Error('Lot not found');
    ls_lots[idx].bids = [...(ls_lots[idx].bids || []), { bidderId, bidPerKg, timestamp: new Date().toISOString() }];
    lsSet('avengers_lots', ls_lots);
    reload();
  };

  // ─── Dump Reports ─────────────────────────────────────────────────────────
  const reportDump = (reporterId, { lat, lng, description }) => {
    const reports = ls('avengers_dump_reports');
    const report = { id: 'dr_' + uuidv4().substring(0, 8), reporter_user_id: reporterId, lat, lng, description, reward_points: 15, status: 'pending', timestamp: new Date().toISOString(), createdAt: new Date().toISOString() };
    reports.push(report);
    lsSet('avengers_dump_reports', reports);
    reload();
    return report;
  };

  return (
    <DataContext.Provider value={{
      wasteEntries, wallets, ledger, gvpTransactions, manureListings, lots, dumpReports,
      reload, getWallet, creditWallet, debitWallet, awardGVP,
      logWaste, collectWaste,
      createManureListing, buyManure,
      bidOnLot,
      reportDump,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
