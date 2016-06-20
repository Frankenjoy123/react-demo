import React from 'react';
import res from '../../data.json';
const adminPartners = res.data.adminPartners;

export default function Select() {
  return (
    <select>
      {
        adminPartners.map(partner => <option key={partner.partnerCode} value={partner.partnerCode}>{partner.displayName}</option>)
      }
    </select>
  );
}
