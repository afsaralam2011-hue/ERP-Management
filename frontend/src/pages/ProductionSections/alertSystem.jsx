// alertSystem.js
const checkInventoryAlerts = async () => {
    const { data: lowInventory } = await supabase
        .from('inventory_ledger')
        .select('*')
        .lt('balance', 500) // 500 Kg سے کم ہو
        .eq('balance_status', 'Low');
    
    if (lowInventory.length > 0) {
        // الرٹ بھیجیں
        sendAlert({
            type: 'INVENTORY_LOW',
            message: `${lowInventory.length} materials are below minimum level`,
            items: lowInventory
        });
    }
};