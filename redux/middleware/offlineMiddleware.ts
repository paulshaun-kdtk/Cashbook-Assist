import { Middleware } from '@reduxjs/toolkit';
import { sqliteService } from '../../services/database/sqlite';
import { NetworkService } from '../../services/network/NetworkService';
import { Transaction } from '../../types/transaction';

// Action types that should work offline
const OFFLINE_ACTIONS = [
  'companies/create',
  'companies/update', 
  'companies/delete',
  'cashbooks/create',
  'cashbooks/update',
  'cashbooks/delete',
  'categories/create',
  'categories/update',
  'categories/delete',
  'income/create',
  'income/update',
  'income/delete',
  'expenses/create',
  'expenses/update',
  'expenses/delete',
];

// Actions that should fetch from local DB when offline
const FETCH_ACTIONS = [
  'companies/fetch',
  'cashbooks/fetch',
  'categories/fetch',
  'income/fetch',
  'expenses/fetch',
];

export const offlineMiddleware: Middleware = (store) => (next) => async (action: any) => {
  const isOnline = NetworkService.isConnected();
  const actionType = action.type;

  // If offline and this is a create/update/delete action, queue it for later sync
  if (!isOnline && OFFLINE_ACTIONS.some(type => actionType.includes(type))) {
    try {
      // Extract the operation details from the action
      const operationType = actionType.includes('create') ? 'create' :
                           actionType.includes('update') ? 'update' : 'delete';
      
      const tableName = actionType.split('/')[0]; // e.g., 'companies' from 'companies/create'
      const recordId = action.payload?.id || action.payload?.$id || action.meta?.arg?.id;
      
      if (recordId) {
        await sqliteService.addOfflineOperation(
          operationType,
          tableName,
          recordId,
          action.payload
        );
      }
    } catch (error) {
      console.error('Failed to queue offline operation:', error);
    }
  }

  // If offline and this is a fetch action, get data from local DB
  if (!isOnline && FETCH_ACTIONS.some(type => actionType.includes(type))) {
    try {
      const tableName = actionType.split('/')[0];
      let localData: any[] = [];

      switch (tableName) {
        case 'companies':
          localData = await sqliteService.getCompanies();
          break;
        case 'cashbooks':
          localData = await sqliteService.getCashbooks(action.meta?.arg);
          break;
        case 'categories':
          localData = await sqliteService.getCategories();
          break;
        case 'income':
        case 'expenses':
          localData = await sqliteService.getTransactions(action.meta?.arg);
          // Filter by type
          localData = localData.filter((t: Transaction) => t.type === (tableName === 'income' ? 'income' : 'expense'));
          break;
      }

      // Dispatch success action with local data
      const successAction = {
        type: actionType.replace('pending', 'fulfilled'),
        payload: localData,
        meta: action.meta
      };

      return next(successAction);
    } catch (error) {
      console.error('Failed to fetch local data:', error);
      // Continue with original action if local fetch fails
    }
  }

  // For online actions or actions that don't need special handling, proceed normally
  return next(action);
};

export default offlineMiddleware;
