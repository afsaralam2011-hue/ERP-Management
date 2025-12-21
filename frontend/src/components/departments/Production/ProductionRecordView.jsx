import React from 'react';
import { useParams } from 'react-router-dom';

const ProductionRecordView = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Production Record Details</h1>
      <p>Viewing details for production record ID: {id}</p>
    </div>
  );
};

export default ProductionRecordView;