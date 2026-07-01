import mongoose from 'mongoose';
import connectDB from './config/db.js';
import ShopProfile from './models/ShopProfile.js';
import Customer from './models/Customer.js';
import Invoice from './models/Invoice.js';
import Counter from './models/Counter.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await ShopProfile.deleteMany();
    await Customer.deleteMany();
    await Invoice.deleteMany();
    await Counter.deleteMany();

    console.log('Database cleared.');

    // Create a ShopProfile
    const shop = await ShopProfile.create({
      businessName: 'Apex Electronics',
      logoUrl: '',
      address: '123 Tech Lane, Silicon Valley, CA 94025',
      email: 'billing@apexelectronics.com',
      phone: '+1 (555) 019-2834',
      taxId: 'TX-998877-US',
      paymentDetails: {
        bankName: 'Silicon Bank',
        accountNumber: '9876543210',
        holderName: 'Apex Electronics Inc.',
        ifscCode: 'SVB12345',
        upiId: 'apex@upi',
      },
      defaultTerms: 'Net 15: Payment is due within 15 days of invoice date.',
    });

    console.log('Shop Profile created:', shop.businessName);

    // Create Customers
    const customer1 = await Customer.create({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 014-9988',
      address: '456 Elm Street, Seattle, WA 98101',
      taxId: 'TAX-JD-982',
    });

    const customer2 = await Customer.create({
      name: 'Sarah Smith',
      email: 'sarah.smith@corporate.com',
      phone: '+1 (555) 018-7766',
      address: '789 Pine Road, Boston, MA 02108',
      taxId: 'TAX-SS-112',
    });

    console.log('Customers created:', customer1.name, ',', customer2.name);

    // Create Invoices
    const invoice1 = await Invoice.create({
      shopId: shop._id,
      customerId: customer1._id,
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: 'Paid',
      lineItems: [
        {
          description: 'Mechanical Keyboard (Cherry MX Blue)',
          quantity: 2,
          unitPrice: 80,
          taxRate: 10,
          total: 160,
        },
        {
          description: 'USB-C Cable (6ft, Braided)',
          quantity: 3,
          unitPrice: 15,
          taxRate: 10,
          total: 45,
        },
      ],
      subtotal: 205,
      taxTotal: 20.5,
      grandTotal: 225.5,
      notes: 'Thank you for your purchase!',
      terms: shop.defaultTerms,
    });

    const invoice2 = await Invoice.create({
      shopId: shop._id,
      customerId: customer2._id,
      issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago (due 5 days ago)
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'Overdue',
      lineItems: [
        {
          description: 'UltraWide Monitor 34"',
          quantity: 1,
          unitPrice: 450,
          taxRate: 18,
          total: 450,
        },
      ],
      subtotal: 450,
      taxTotal: 81,
      grandTotal: 531,
      notes: 'Urgent payment required.',
      terms: shop.defaultTerms,
    });

    const invoice3 = await Invoice.create({
      shopId: shop._id,
      customerId: customer1._id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'Pending',
      lineItems: [
        {
          description: 'Wireless Gaming Mouse',
          quantity: 1,
          unitPrice: 70,
          taxRate: 12,
          total: 70,
        },
      ],
      subtotal: 70,
      taxTotal: 8.4,
      grandTotal: 78.4,
      notes: 'Initial invoice draft.',
      terms: shop.defaultTerms,
    });

    console.log('Invoices created successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
