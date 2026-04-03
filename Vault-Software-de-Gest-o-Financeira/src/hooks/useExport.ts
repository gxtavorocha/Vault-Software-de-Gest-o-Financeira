// hooks/useExport.js
import {
  exportAll,
  exportTransactions,
  exportCards,
  exportAccounts,
  exportCategories,
} from "../utils/exportCSV";

export function useExport() {
  const get = (key) => JSON.parse(localStorage.getItem(key) ?? "[]");

  const data = {
    transactions : get("orcpro_tx"),        
    cards        : get("orcpro_cards"),      
    accounts     : get("finance_accounts"),  
    categories   : get("orcpro_cat"),        
  };

  return {
    exportAll         : () => exportAll(data),
    exportTransactions: () => exportTransactions(data.transactions, data.categories),
    exportCards       : () => exportCards(data.cards),
    exportAccounts    : () => exportAccounts(data.accounts),
    exportCategories  : () => exportCategories(data.categories),
  };
}