import db from './db';
import {
  users,
  admins,
  staff,
  adminActivityLogs,
  categories,
  products,
  productVariants,
  addresses,
  orders,
  payments,
  orderItems,
  reviews,
  inquiries,
  subscribers,
  coupons,
  sessions,
  pickupStations,
  pickupLocations
} from './schema';
import { hash } from 'bcrypt';

async function seed() {
  console.log('Clearing existing data...');

  await db.delete(sessions);
  await db.delete(coupons);
  await db.delete(subscribers);
  await db.delete(inquiries);
  await db.delete(reviews);
  await db.delete(orderItems);
  await db.delete(payments);
  await db.delete(orders);
  await db.delete(addresses);
  await db.delete(productVariants);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(adminActivityLogs);
  await db.delete(staff);
  await db.delete(admins);
  await db.delete(users);
  await db.delete(pickupLocations);
  await db.delete(pickupStations);

  console.log('Existing data cleared');
  console.log('Seeding database...');

  const hashedPassword = await hash('password123', 10);

  const insertedUsers = await db.insert(users).values([
    {
      fullName: 'Admin User',
      email: 'moseemmanuel64@yahoo.com',
      phone: '0712345678',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      avatarPhoto: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=Admin+User'
    },
    {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0723456789',
      passwordHash: hashedPassword,
      role: 'customer',
      isActive: true,
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      avatarPhoto: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=Jane+Smith'
    },
    {
      fullName: 'Peter Otieno',
      email: 'peter@example.com',
      phone: '0734567890',
      passwordHash: hashedPassword,
      role: 'customer',
      isActive: true,
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      avatarPhoto: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=Peter+Otieno'
    },
    {
      fullName: 'Mary Wambui',
      email: 'mary@example.com',
      phone: '0745678901',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      avatarPhoto: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=Mary+Wambui'
    },
    {
      fullName: 'David Mwangi',
      email: 'david@example.com',
      phone: '0756789012',
      passwordHash: hashedPassword,
      role: 'customer',
      isActive: true,
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      avatarPhoto: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=David+Mwangi'
    },
    {
      fullName: 'Staff User',
      email: 'emmanuelmose10204@gmail.com',
      phone: '0767890123',
      passwordHash: hashedPassword,
      role: 'staff',
      isActive: true,
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      avatarPhoto: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=Staff+User'
    }
  ]).returning();

  console.log(`Inserted ${insertedUsers.length} users`);

  const adminUser = insertedUsers.find(u => u.email === 'moseemmanuel64@yahoo.com');
  const staffUser = insertedUsers.find(u => u.email === 'emmanuelmose10204@gmail.com');

  await db.insert(admins).values([
    { userId: adminUser!.userId, email: adminUser!.email }
  ]);

  await db.insert(staff).values([
    { userId: staffUser!.userId, email: staffUser!.email }
  ]);

  console.log('Inserted admins and staff records');

  await db.insert(adminActivityLogs).values([
    { userId: insertedUsers[0].userId, action: 'USER_LOGIN', details: { ip: '192.168.1.1', userAgent: 'Chrome' }, ipAddress: '192.168.1.1' },
    { userId: insertedUsers[0].userId, action: 'PRODUCT_CREATED', details: { productId: 1, productName: 'iPhone 15 Pro Max' }, ipAddress: '192.168.1.1' },
    { userId: insertedUsers[3].userId, action: 'ORDER_UPDATED', details: { orderId: 1, status: 'confirmed' }, ipAddress: '192.168.1.2' },
    { userId: insertedUsers[0].userId, action: 'USER_ROLE_CHANGED', details: { userId: 5, oldRole: 'customer', newRole: 'admin' }, ipAddress: '192.168.1.1' },
    { userId: insertedUsers[3].userId, action: 'PRODUCT_UPDATED', details: { productId: 2, field: 'price', oldValue: 30000, newValue: 34500 }, ipAddress: '192.168.1.2' }
  ]);

  const insertedCategories = await db.insert(categories).values([
    { name: 'Mobile Phones', slug: 'mobile-phones', description: 'Latest smartphones from top brands', icon: '📱', photo: 'https://example.com/images/mobile-phones.jpg', displayOrder: 1, isActive: true },
    { name: 'Audio Devices', slug: 'audio-devices', description: 'Headphones, speakers, and audio accessories', icon: '🎧', photo: 'https://example.com/images/audio-devices.jpg', displayOrder: 2, isActive: true },
    { name: 'Television Products', slug: 'television-products', description: 'Smart TVs and accessories', icon: '📺', photo: 'https://example.com/images/tvs.jpg', displayOrder: 3, isActive: true },
    { name: 'Computers and Accessories', slug: 'computers-accessories', description: 'Laptops, desktops, and peripherals', icon: '💻', photo: 'https://example.com/images/computers.jpg', displayOrder: 4, isActive: true },
    { name: 'Solar Products', slug: 'solar-products', description: 'Solar panels, inverters, and accessories', icon: '☀️', photo: 'https://example.com/images/solar.jpg', displayOrder: 5, isActive: true }
  ]).returning();

  console.log(`Inserted ${insertedCategories.length} categories`);

  const insertedProducts = await db.insert(products).values([
    {
      name: 'iPhone 15 Pro Max 256GB',
      slug: 'iphone-15-pro-max-256gb',
      description: 'The latest iPhone with powerful A17 Pro chip and titanium design',
      shortDescription: 'Apple flagship with 6.7" OLED display',
      price: '160000',
      comparePrice: '175000',
      costPrice: '140000',
      stock: 15,
      lowStockThreshold: 5,
      status: 'in_stock',
      categoryId: insertedCategories[0].categoryId,
      featuredPhoto: 'https://example.com/images/iphone-15-pro-max.jpg',
      sku: 'IPH15PM256',
      brand: 'Apple',
      brandPhoto: 'https://example.com/images/apple-logo.png',
      isFeatured: true,
      isBestSeller: true,
      views: 1500,
      metaTitle: 'iPhone 15 Pro Max 256GB - Buy Online',
      metaDescription: 'Best price for iPhone 15 Pro Max in Kenya'
    },
    {
      name: 'Samsung Galaxy A35 5G',
      slug: 'samsung-galaxy-a35-5g',
      description: 'Mid-range 5G smartphone with AMOLED display',
      shortDescription: 'Samsung A-series with 5G connectivity',
      price: '34500',
      comparePrice: '40000',
      costPrice: '30000',
      stock: 2,
      lowStockThreshold: 5,
      status: 'low_stock',
      categoryId: insertedCategories[0].categoryId,
      featuredPhoto: 'https://example.com/images/samsung-a35.jpg',
      sku: 'SAMA355G',
      brand: 'Samsung',
      brandPhoto: 'https://example.com/images/samsung-logo.png',
      isFeatured: false,
      isBestSeller: true,
      views: 800,
      metaTitle: 'Samsung Galaxy A35 5G - Best Price',
      metaDescription: 'Affordable 5G smartphone from Samsung'
    },
    {
      name: 'JBL Tune 510BT Wireless Headphones',
      slug: 'jbl-tune-510bt-wireless-headphones',
      description: 'Wireless over-ear headphones with 40-hour battery life',
      shortDescription: 'JBL signature sound with Bluetooth 5.0',
      price: '6500',
      comparePrice: '8000',
      costPrice: '5000',
      stock: 30,
      lowStockThreshold: 5,
      status: 'in_stock',
      categoryId: insertedCategories[1].categoryId,
      featuredPhoto: 'https://example.com/images/jbl-tune-510bt.jpg',
      sku: 'JBL510BT',
      brand: 'JBL',
      brandPhoto: 'https://example.com/images/jbl-logo.png',
      isFeatured: true,
      isBestSeller: false,
      views: 450,
      metaTitle: 'JBL Tune 510BT Headphones - Buy Online',
      metaDescription: 'Best wireless headphones in Kenya'
    },
    {
      name: 'Oraimo FreePods 4 Active Noise Cancelling',
      slug: 'oraimo-freepods-4-active-noise-cancelling',
      description: 'True wireless earbuds with active noise cancellation',
      shortDescription: 'Oraimo earbuds with ANC technology',
      price: '4200',
      comparePrice: '5000',
      costPrice: '3500',
      stock: 0,
      lowStockThreshold: 5,
      status: 'out_of_stock',
      categoryId: insertedCategories[1].categoryId,
      featuredPhoto: 'https://example.com/images/oraimo-freepods-4.jpg',
      sku: 'ORAFP4ANC',
      brand: 'Oraimo',
      brandPhoto: 'https://example.com/images/oraimo-logo.png',
      isFeatured: false,
      isBestSeller: false,
      views: 300,
      metaTitle: 'Oraimo FreePods 4 - ANC Earbuds',
      metaDescription: 'Best noise cancelling earbuds in Kenya'
    },
    {
      name: 'HP 250 G9 Intel Core i5 Laptop',
      slug: 'hp-250-g9-intel-core-i5-laptop',
      description: 'Reliable laptop for students and professionals',
      shortDescription: 'HP laptop with Intel Core i5 processor',
      price: '75000',
      comparePrice: '85000',
      costPrice: '65000',
      stock: 8,
      lowStockThreshold: 3,
      status: 'in_stock',
      categoryId: insertedCategories[3].categoryId,
      featuredPhoto: 'https://example.com/images/hp-250-g9.jpg',
      sku: 'HP250G9',
      brand: 'HP',
      brandPhoto: 'https://example.com/images/hp-logo.png',
      isFeatured: true,
      isBestSeller: true,
      views: 1200,
      metaTitle: 'HP 250 G9 Laptop - Best Price Kenya',
      metaDescription: 'Affordable HP laptop for students'
    }
  ]).returning();

  console.log(`Inserted ${insertedProducts.length} products`);

  const insertedVariants = await db.insert(productVariants).values([
    {
      productId: insertedProducts[0].productId,
      name: 'iPhone 15 Pro Max 256GB - Black',
      sku: 'IPH15PM256-BLK',
      price: '160000',
      stock: 10,
      attributes: { color: 'Black', storage: '256GB' },
      featuredPhoto: 'https://example.com/images/iphone-black.jpg'
    },
    {
      productId: insertedProducts[0].productId,
      name: 'iPhone 15 Pro Max 256GB - Silver',
      sku: 'IPH15PM256-SLV',
      price: '160000',
      stock: 5,
      attributes: { color: 'Silver', storage: '256GB' },
      featuredPhoto: 'https://example.com/images/iphone-silver.jpg'
    },
    {
      productId: insertedProducts[1].productId,
      name: 'Samsung Galaxy A35 5G - Blue',
      sku: 'SAMA355G-BLU',
      price: '34500',
      stock: 2,
      attributes: { color: 'Blue', storage: '128GB' },
      featuredPhoto: 'https://example.com/images/samsung-a35-blue.jpg'
    },
    {
      productId: insertedProducts[2].productId,
      name: 'JBL Tune 510BT - Black',
      sku: 'JBL510BT-BLK',
      price: '6500',
      stock: 20,
      attributes: { color: 'Black' },
      featuredPhoto: 'https://example.com/images/jbl-black.jpg'
    },
    {
      productId: insertedProducts[2].productId,
      name: 'JBL Tune 510BT - White',
      sku: 'JBL510BT-WHT',
      price: '6500',
      stock: 10,
      attributes: { color: 'White' },
      featuredPhoto: 'https://example.com/images/jbl-white.jpg'
    }
  ]).returning();

  console.log(`Inserted ${insertedVariants.length} product variants`);

  const insertedStations = await db.insert(pickupStations).values([
    {
      name: 'GMNEX Nairobi CBD',
      county: 'Nairobi',
      town: 'Nairobi CBD',
      address: 'Moi Avenue, Nairobi',
      phone: '0704812343',
      email: 'nairobi@gmnex.com',
      isActive: true
    },
    {
      name: 'GMNEX Kakamega',
      county: 'Kakamega',
      town: 'Kakamega Town',
      address: 'Lurambi, Opposite Bamboo',
      phone: '0704812343',
      email: 'kakamega@gmnex.com',
      isActive: true
    },
    {
      name: 'GMNEX Mombasa',
      county: 'Mombasa',
      town: 'Mombasa CBD',
      address: 'Moi Avenue, Mombasa',
      phone: '0704812344',
      email: 'mombasa@gmnex.com',
      isActive: true
    }
  ]).returning();

  console.log(`Inserted ${insertedStations.length} pickup stations`);

  await db.insert(pickupLocations).values([
    { stationId: insertedStations[0].stationId, name: 'Nairobi Main Branch', address: 'Moi Avenue, 3rd Floor', landmark: 'Opposite Nation Media', phone: '0704812343' },
    { stationId: insertedStations[0].stationId, name: 'Westlands Pickup Point', address: 'Westlands Road, Next to Sarit Centre', landmark: 'Near the roundabout', phone: '0704812344' },
    { stationId: insertedStations[1].stationId, name: 'Kakamega Main Shop', address: 'Lurambi, Opposite Bamboo', landmark: 'Next to the petrol station', phone: '0704812345' },
    { stationId: insertedStations[2].stationId, name: 'Mombasa Main Branch', address: 'Moi Avenue, Near Post Office', landmark: 'Opposite the bank', phone: '0704812346' }
  ]);

  const insertedAddresses = await db.insert(addresses).values([
    {
      userId: insertedUsers[0].userId,
      firstName: 'Admin',
      lastName: 'User',
      phonePrefix: '+254',
      phoneNumber: '0712345678',
      additionalPhone: '0712345679',
      email: 'moseemmanuel64@yahoo.com',
      county: 'Kakamega',
      town: 'Kakamega Town',
      area: 'Kakamega Central',
      landmark: 'Opposite Hotel Franka',
      addressLine1: 'Ayuku house, ground floor, Room No. 2',
      addressLine2: 'Opposite Bamboo',
      postalCode: '50100',
      deliveryInstructions: 'Call before arrival',
      isDefault: true
    },
    {
      userId: insertedUsers[1].userId,
      firstName: 'Jane',
      lastName: 'Smith',
      phonePrefix: '+254',
      phoneNumber: '0723456789',
      additionalPhone: null,
      email: 'jane@example.com',
      county: 'Nairobi',
      town: 'Nairobi CBD',
      area: 'Central Business District',
      landmark: 'Opposite Nation Media House',
      addressLine1: 'Moi Avenue',
      addressLine2: '6th Floor, Room 601',
      postalCode: '00100',
      deliveryInstructions: 'Leave at reception',
      isDefault: true
    },
    {
      userId: insertedUsers[1].userId,
      firstName: 'Jane',
      lastName: 'Smith',
      phonePrefix: '+254',
      phoneNumber: '0723456789',
      additionalPhone: '0723456790',
      email: 'jane@example.com',
      county: 'Nairobi',
      town: 'Westlands',
      area: 'Westlands',
      landmark: 'Next to Westgate Mall',
      addressLine1: 'Westlands Road',
      addressLine2: 'Apartment 3B',
      postalCode: '00800',
      deliveryInstructions: 'Call before delivery',
      isDefault: false
    },
    {
      userId: insertedUsers[2].userId,
      firstName: 'Peter',
      lastName: 'Otieno',
      phonePrefix: '+254',
      phoneNumber: '0734567890',
      additionalPhone: null,
      email: 'peter@example.com',
      county: 'Kakamega',
      town: 'Lurambi',
      area: 'Lurambi Central',
      landmark: 'Next to Bamboo Restaurant',
      addressLine1: 'Opposite Bamboo',
      addressLine2: 'Lurambi',
      postalCode: '50102',
      deliveryInstructions: 'Leave at the gate',
      isDefault: true
    },
    {
      userId: insertedUsers[3].userId,
      firstName: 'Mary',
      lastName: 'Wambui',
      phonePrefix: '+254',
      phoneNumber: '0745678901',
      additionalPhone: '0745678902',
      email: 'mary@example.com',
      county: 'Kisumu',
      town: 'Kisumu Town',
      area: 'Kisumu Central',
      landmark: 'Near Kisumu Hotel',
      addressLine1: 'Oginga Odinga Road',
      addressLine2: 'Kisumu',
      postalCode: '40100',
      deliveryInstructions: 'Call before delivery',
      isDefault: true
    },
    {
      userId: insertedUsers[4].userId,
      firstName: 'David',
      lastName: 'Mwangi',
      phonePrefix: '+254',
      phoneNumber: '0756789012',
      additionalPhone: null,
      email: 'david@example.com',
      county: 'Nakuru',
      town: 'Nakuru Town',
      area: 'Nakuru Central',
      landmark: 'Opposite Nakuru Post Office',
      addressLine1: 'Kenyatta Road',
      addressLine2: 'Nakuru',
      postalCode: '20100',
      deliveryInstructions: 'Call before arrival',
      isDefault: true
    }
  ]).returning();

  console.log(`Inserted ${insertedAddresses.length} addresses`);

  const insertedOrders = await db.insert(orders).values([
    {
      orderRef: 'GM-2026-0001',
      userId: insertedUsers[1].userId,
      guestEmail: null,
      guestPhone: null,
      total: '9700',
      subtotal: '9000',
      tax: '700',
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: { fullName: 'Jane Smith', phone: '0723456789', addressLine1: 'Moi Avenue, Nairobi', city: 'Nairobi', county: 'Nairobi' },
      billingAddress: { fullName: 'Jane Smith', phone: '0723456789', addressLine1: 'Moi Avenue, Nairobi', city: 'Nairobi', county: 'Nairobi' },
      deliveryNotes: 'Leave at reception',
      pickupStationId: insertedStations[0].stationId,
      pickupLocationId: 1
    },
    {
      orderRef: 'GM-2026-0002',
      userId: insertedUsers[2].userId,
      guestEmail: null,
      guestPhone: null,
      total: '58000',
      subtotal: '55000',
      tax: '3000',
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: { fullName: 'Peter Otieno', phone: '0734567890', addressLine1: 'Opposite Bamboo, Lurambi', city: 'Kakamega', county: 'Kakamega' },
      billingAddress: { fullName: 'Peter Otieno', phone: '0734567890', addressLine1: 'Opposite Bamboo, Lurambi', city: 'Kakamega', county: 'Kakamega' },
      deliveryNotes: '',
      pickupStationId: insertedStations[1].stationId,
      pickupLocationId: 3,
      deliveryDate: new Date(Date.now() - 86400000)
    },
    {
      orderRef: 'GM-2026-0003',
      userId: insertedUsers[3].userId,
      guestEmail: null,
      guestPhone: null,
      total: '25000',
      subtotal: '24000',
      tax: '1000',
      status: 'confirmed',
      paymentStatus: 'paid',
      shippingAddress: { fullName: 'Mary Wambui', phone: '0745678901', addressLine1: 'Oginga Odinga Road, Kisumu', city: 'Kisumu', county: 'Kisumu' },
      billingAddress: { fullName: 'Mary Wambui', phone: '0745678901', addressLine1: 'Oginga Odinga Road, Kisumu', city: 'Kisumu', county: 'Kisumu' },
      deliveryNotes: 'Call before delivery',
      pickupStationId: insertedStations[0].stationId,
      pickupLocationId: 2
    },
    {
      orderRef: 'GM-2026-0004',
      userId: insertedUsers[4].userId,
      guestEmail: null,
      guestPhone: null,
      total: '160000',
      subtotal: '160000',
      tax: '0',
      status: 'shipped',
      paymentStatus: 'paid',
      shippingAddress: { fullName: 'David Mwangi', phone: '0756789012', addressLine1: 'Kenyatta Road, Nakuru', city: 'Nakuru', county: 'Nakuru' },
      billingAddress: { fullName: 'David Mwangi', phone: '0756789012', addressLine1: 'Kenyatta Road, Nakuru', city: 'Nakuru', county: 'Nakuru' },
      pickupStationId: insertedStations[0].stationId,
      pickupLocationId: 1
    },
    {
      orderRef: 'GM-2026-0005',
      userId: insertedUsers[0].userId,
      guestEmail: null,
      guestPhone: null,
      total: '6500',
      subtotal: '6500',
      tax: '0',
      status: 'cancelled',
      paymentStatus: 'refunded',
      shippingAddress: { fullName: 'Admin User', phone: '0712345678', addressLine1: 'Ayuku house, ground floor, Room No. 2', city: 'Kakamega', county: 'Kakamega' },
      billingAddress: { fullName: 'Admin User', phone: '0712345678', addressLine1: 'Ayuku house, ground floor, Room No. 2', city: 'Kakamega', county: 'Kakamega' },
      adminNotes: 'Order cancelled due to customer request',
      pickupStationId: insertedStations[1].stationId,
      pickupLocationId: 3
    }
  ]).returning();

  console.log(`Inserted ${insertedOrders.length} orders`);

  const insertedPayments = await db.insert(payments).values([
    {
      orderId: insertedOrders[0].orderId,
      userId: insertedUsers[1].userId,
      amount: '9700',
      paymentMethod: 'mpesa',
      paymentStatus: 'pending',
      mpesaPhoneNumber: '0723456789',
      mpesaTillNumber: '4149288',
      paymentDate: new Date()
    },
    {
      orderId: insertedOrders[1].orderId,
      userId: insertedUsers[2].userId,
      amount: '58000',
      paymentMethod: 'mpesa',
      paymentStatus: 'paid',
      transactionReference: 'TRX123456',
      mpesaReceiptNumber: 'MPESA-001',
      mpesaPhoneNumber: '0734567890',
      mpesaTillNumber: '4149288',
      paymentDate: new Date(Date.now() - 172800000),
      paymentResponse: { status: 'success', message: 'Payment confirmed' }
    },
    {
      orderId: insertedOrders[2].orderId,
      userId: insertedUsers[3].userId,
      amount: '25000',
      paymentMethod: 'mpesa',
      paymentStatus: 'paid',
      transactionReference: 'TRX789012',
      mpesaReceiptNumber: 'MPESA-002',
      mpesaPhoneNumber: '0745678901',
      mpesaTillNumber: '4149288',
      paymentDate: new Date(Date.now() - 86400000),
      paymentResponse: { status: 'success', message: 'Payment confirmed' }
    },
    {
      orderId: insertedOrders[3].orderId,
      userId: insertedUsers[4].userId,
      amount: '160000',
      paymentMethod: 'mpesa',
      paymentStatus: 'paid',
      transactionReference: 'TRX345678',
      mpesaReceiptNumber: 'MPESA-003',
      mpesaPhoneNumber: '0756789012',
      mpesaTillNumber: '4149288',
      paymentDate: new Date(Date.now() - 43200000),
      paymentResponse: { status: 'success', message: 'Payment confirmed' }
    },
    {
      orderId: insertedOrders[4].orderId,
      userId: insertedUsers[0].userId,
      amount: '6500',
      paymentMethod: 'mpesa',
      paymentStatus: 'refunded',
      transactionReference: 'TRX901234',
      mpesaReceiptNumber: 'MPESA-004',
      mpesaPhoneNumber: '0712345678',
      mpesaTillNumber: '4149288',
      paymentDate: new Date(Date.now() - 259200000),
      paymentResponse: { status: 'refunded', message: 'Payment refunded' }
    }
  ]).returning();

  console.log(`Inserted ${insertedPayments.length} payments`);

  await db.insert(orderItems).values([
    {
      orderId: insertedOrders[0].orderId,
      productId: insertedProducts[3].productId,
      variantId: null,
      productName: 'Oraimo FreePods 4 Active Noise Cancelling',
      productSku: 'ORAFP4ANC',
      price: '4200',
      quantity: 2,
      total: '8400',
      attributes: { color: 'White' }
    },
    {
      orderId: insertedOrders[0].orderId,
      productId: insertedProducts[2].productId,
      variantId: insertedVariants[3].variantId,
      productName: 'JBL Tune 510BT Wireless Headphones',
      productSku: 'JBL510BT-BLK',
      price: '6500',
      quantity: 1,
      total: '6500',
      attributes: { color: 'Black' }
    },
    {
      orderId: insertedOrders[1].orderId,
      productId: insertedProducts[1].productId,
      variantId: insertedVariants[2].variantId,
      productName: 'Samsung Galaxy A35 5G',
      productSku: 'SAMA355G-BLU',
      price: '34500',
      quantity: 1,
      total: '34500',
      attributes: { color: 'Blue', storage: '128GB' }
    },
    {
      orderId: insertedOrders[1].orderId,
      productId: insertedProducts[2].productId,
      variantId: insertedVariants[3].variantId,
      productName: 'JBL Tune 510BT Wireless Headphones',
      productSku: 'JBL510BT-BLK',
      price: '6500',
      quantity: 2,
      total: '13000',
      attributes: { color: 'Black' }
    },
    {
      orderId: insertedOrders[2].orderId,
      productId: insertedProducts[4].productId,
      variantId: null,
      productName: 'HP 250 G9 Intel Core i5 Laptop',
      productSku: 'HP250G9',
      price: '75000',
      quantity: 1,
      total: '75000',
      attributes: {}
    }
  ]);

  await db.insert(reviews).values([
    { userId: insertedUsers[1].userId, productId: insertedProducts[0].productId, orderId: insertedOrders[1].orderId, rating: 5, title: 'Absolutely brilliant!', comment: 'Genuine product and fast delivery in Kakamega.', status: 'approved', photos: ['https://example.com/images/review1.jpg'], isVerified: true },
    { userId: insertedUsers[2].userId, productId: insertedProducts[1].productId, orderId: insertedOrders[2].orderId, rating: 4, title: 'Great value for money', comment: 'Lasts long and charges my phone multiple times. Satisfied with the power bank.', status: 'approved', photos: [], isVerified: true },
    { userId: insertedUsers[3].userId, productId: insertedProducts[4].productId, orderId: insertedOrders[3].orderId, rating: 5, title: 'Perfect for students', comment: 'Great laptop for student work. Price was best in town. Highly recommend Naoja Ventures.', status: 'pending', photos: ['https://example.com/images/review2.jpg', 'https://example.com/images/review3.jpg'], isVerified: true },
    { userId: insertedUsers[4].userId, productId: insertedProducts[2].productId, orderId: insertedOrders[4].orderId, rating: 3, title: 'Good but not great', comment: 'Decent headphones but battery life could be better.', status: 'approved', photos: [], isVerified: false },
    { userId: insertedUsers[0].userId, productId: insertedProducts[3].productId, orderId: insertedOrders[0].orderId, rating: 4, title: 'Good ANC earbuds', comment: 'Noise cancellation works well for the price.', status: 'pending', photos: ['https://example.com/images/review4.jpg'], isVerified: true }
  ]);

  await db.insert(inquiries).values([
    { name: 'Francis Mwangi', email: 'francis@example.com', phone: '0711223344', subject: 'Bulk Order Inquiry', message: 'Hi, do you have stock of MK double sockets in bulk? Need about 50 pieces for a site in Lurambi.', status: 'read', userId: null, productId: null },
    { name: 'Grace Chebet', email: 'grace@example.com', phone: '0722998877', subject: 'Warranty Question', message: 'Hello, what is the warranty period for your Solar King panels? Can I get delivery to Shikoti?', status: 'unread', userId: null, productId: null },
    { name: 'Admin User', email: 'moseemmanuel64@yahoo.com', phone: '0712345678', subject: 'Product Availability', message: 'Is the iPhone 15 Pro Max available in store? I want to pick it up today.', status: 'replied', userId: insertedUsers[0].userId, productId: insertedProducts[0].productId, adminResponse: 'Yes, we have stock available. You can pick up from our Kakamega store.', respondedAt: new Date(Date.now() - 3600000) },
    { name: 'Mary Wambui', email: 'mary@example.com', phone: '0745678901', subject: 'Delivery Timeline', message: 'How long does delivery take to Kisumu?', status: 'resolved', userId: insertedUsers[3].userId, productId: null, adminResponse: 'Delivery to Kisumu takes 1-2 business days.', respondedAt: new Date(Date.now() - 7200000) },
    { name: 'Peter Otieno', email: 'peter@example.com', phone: '0734567890', subject: 'Technical Support', message: 'I need help setting up my new laptop. Can I get a call?', status: 'unread', userId: insertedUsers[2].userId, productId: insertedProducts[4].productId }
  ]);

  await db.insert(subscribers).values([
    { email: 'admin@naojaventures.com', name: 'Naoja Admin', isActive: true },
    { email: 'info@naojaventures.com', name: 'Visitor', isActive: true },
    { email: 'samuel@gmail.com', name: 'Samuel Wekesa', isActive: true },
    { email: 'jane@example.com', name: 'Jane Smith', isActive: true },
    { email: 'david@example.com', name: 'David Mwangi', isActive: true }
  ]);

  await db.insert(coupons).values([
    { code: 'WELCOME10', description: '10% off for new customers', discountType: 'percentage', discountValue: '10', minOrderAmount: '1000', maxDiscount: '5000', usageLimit: 100, usedCount: 0, perUserLimit: 1, startDate: new Date(), endDate: new Date(Date.now() + 2592000000), isActive: true, appliesTo: ['all'] },
    { code: 'SUMMER20', description: '20% off on audio devices', discountType: 'percentage', discountValue: '20', minOrderAmount: '5000', maxDiscount: '10000', usageLimit: 50, usedCount: 0, perUserLimit: 2, startDate: new Date(), endDate: new Date(Date.now() + 7776000000), isActive: true, appliesTo: ['categories', [2]] },
    { code: 'SAVE500', description: 'KSh 500 off on any order', discountType: 'fixed', discountValue: '500', minOrderAmount: '2500', maxDiscount: null, usageLimit: 200, usedCount: 0, perUserLimit: 1, startDate: new Date(), endDate: new Date(Date.now() + 5184000000), isActive: true, appliesTo: ['all'] },
    { code: 'FLASH15', description: '15% off flash sale', discountType: 'percentage', discountValue: '15', minOrderAmount: '10000', maxDiscount: '15000', usageLimit: 30, usedCount: 0, perUserLimit: 1, startDate: new Date(), endDate: new Date(Date.now() + 86400000), isActive: true, appliesTo: ['all'] },
    { code: 'VIP1000', description: 'KSh 1000 off for VIP customers', discountType: 'fixed', discountValue: '1000', minOrderAmount: '10000', maxDiscount: null, usageLimit: 10, usedCount: 0, perUserLimit: 1, startDate: new Date(), endDate: new Date(Date.now() + 7776000000), isActive: true, appliesTo: ['all'] }
  ]);

  await db.insert(sessions).values([
    { sessionToken: 'sess_1234567890abcdef', userId: insertedUsers[0].userId, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', expiresAt: new Date(Date.now() + 604800000) },
    { sessionToken: 'sess_abcdef1234567890', userId: insertedUsers[1].userId, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', expiresAt: new Date(Date.now() + 604800000) },
    { sessionToken: 'sess_0987654321fedcba', userId: insertedUsers[2].userId, ipAddress: '192.168.1.3', userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36', expiresAt: new Date(Date.now() + 604800000) },
    { sessionToken: 'sess_fedcba0987654321', userId: insertedUsers[3].userId, ipAddress: '192.168.1.4', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', expiresAt: new Date(Date.now() + 604800000) },
    { sessionToken: 'sess_12345abcde67890', userId: insertedUsers[4].userId, ipAddress: '192.168.1.5', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', expiresAt: new Date(Date.now() + 604800000) }
  ]);

  console.log('Database seeding completed successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });