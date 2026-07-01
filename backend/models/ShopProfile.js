import mongoose from 'mongoose';

const shopProfileSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    taxId: {
      type: String,
      default: '', // GSTIN, VAT ID, EIN, etc.
    },
    paymentDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      holderName: { type: String, default: '' },
      ifscCode: { type: String, default: '' }, // or routing number
      upiId: { type: String, default: '' },
    },
    defaultTerms: {
      type: String,
      default: 'Payment is due within 15 days of invoice date.',
    },
  },
  {
    timestamps: true,
  }
);

const ShopProfile = mongoose.model('ShopProfile', shopProfileSchema);
export default ShopProfile;
