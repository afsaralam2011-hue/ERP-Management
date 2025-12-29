// اضافی فکشنز جو ہم نے چاہیے
export const inventoryService = {
  // ... آپ کے پہلے سے موجود فکشنز
  
  // ✅ فلٹیننگ کی کل پروڈکشن (آئٹم وائز)
  async getFlatteningProductionByItem(itemCode = null) {
    let query = supabase
      .from('flatteningsection')
      .select('item_code, item_name, production_quantity, unit')
      .order('created_at', { ascending: false });

    if (itemCode) {
      query = query.eq('item_code', itemCode);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // آئٹم وائز سمی کریں
    const itemWiseSummary = {};
    
    data.forEach(record => {
      const itemCode = record.item_code;
      const quantity = parseFloat(record.production_quantity) || 0;
      
      if (!itemWiseSummary[itemCode]) {
        itemWiseSummary[itemCode] = {
          item_code: itemCode,
          item_name: record.item_name || itemCode,
          total_production: 0,
          unit: record.unit || 'Kg'
        };
      }
      
      itemWiseSummary[itemCode].total_production += quantity;
    });
    
    return Object.values(itemWiseSummary);
  },

  // ✅ اسپائرل کی کل پروڈکشن (آئٹم وائز)
  async getSpiralProductionByItem(itemCode = null) {
    let query = supabase
      .from('spiralsection')
      .select('item_code, item_name, weight, unit')
      .order('created_at', { ascending: false });

    if (itemCode) {
      query = query.eq('item_code', itemCode);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // آئٹم وائز سمی کریں
    const itemWiseSummary = {};
    
    data.forEach(record => {
      const itemCode = record.item_code;
      const weight = parseFloat(record.weight) || 0;
      
      if (!itemWiseSummary[itemCode]) {
        itemWiseSummary[itemCode] = {
          item_code: itemCode,
          item_name: record.item_name || itemCode,
          total_consumption: 0,
          unit: record.unit || 'Kg'
        };
      }
      
      itemWiseSummary[itemCode].total_consumption += weight;
    });
    
    return Object.values(itemWiseSummary);
  },

  // ✅ فلٹیننگ انوینٹری کیلکولیٹ کریں
  async calculateFlatteningInventory() {
    try {
      // دونوں سیکشنز کا ڈیٹا لائیں
      const [flatteningData, spiralData] = await Promise.all([
        this.getFlatteningProductionByItem(),
        this.getSpiralProductionByItem()
      ]);
      
      // انوینٹری آرے بنائیں
      const inventory = [];
      
      // فلٹیننگ ڈیٹا پر لوپ
      flatteningData.forEach(flatteningItem => {
        const itemCode = flatteningItem.item_code;
        
        // اسپائرل میں اس آئٹم کا کنسمپشن تلاش کریں
        const spiralItem = spiralData.find(item => item.item_code === itemCode);
        
        const flatteningQty = flatteningItem.total_production;
        const spiralQty = spiralItem ? spiralItem.total_consumption : 0;
        const balance = flatteningQty - spiralQty;
        
        inventory.push({
          item_code: itemCode,
          item_name: flatteningItem.item_name,
          flattening_production: flatteningQty.toFixed(2),
          spiral_consumption: spiralQty.toFixed(2),
          balance: balance.toFixed(2),
          unit: flatteningItem.unit,
          status: balance > 0 ? 'Available' : 'Deficit'
        });
      });
      
      // صرف وہ آئٹمز جو فلٹیننگ میں ہیں مگر اسپائرل میں نہیں
      const flatteningOnly = flatteningData.filter(fItem => 
        !spiralData.some(sItem => sItem.item_code === fItem.item_code)
      );
      
      flatteningOnly.forEach(item => {
        inventory.push({
          item_code: item.item_code,
          item_name: item.item_name,
          flattening_production: item.total_production.toFixed(2),
          spiral_consumption: '0.00',
          balance: item.total_production.toFixed(2),
          unit: item.unit,
          status: 'Available'
        });
      });
      
      return inventory;
      
    } catch (error) {
      console.error('Inventory calculation error:', error);
      throw error;
    }
  }
};