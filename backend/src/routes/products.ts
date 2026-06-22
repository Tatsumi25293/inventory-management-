import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');
const LOGS_FILE = path.join(__dirname, '../../data/logs.json');

// Helper to read JSON files
const readJSONFile = (filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      // Ensure file exists with empty array
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

// Helper to write JSON files
const writeJSONFile = (filePath: string, data: any) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
};

// Protect all routes with auth middleware
router.use(authenticateToken);

// 1. Get all products
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const products = readJSONFile(PRODUCTS_FILE);
  return res.status(200).json({ success: true, products });
});

// 2. Add a new product
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const { name, sku, category, quantity, minThreshold, costPrice, sellingPrice, supplierName } = req.body;

  if (!name || !sku || !category || quantity === undefined || !minThreshold || costPrice === undefined || sellingPrice === undefined || !supplierName) {
    return res.status(400).json({ success: false, error: 'يرجى إكمال جميع الحقول المطلوبة للمنتج' });
  }

  const products = readJSONFile(PRODUCTS_FILE);

  // Check if SKU already exists
  const skuExists = products.some((p: any) => p.sku.toUpperCase() === sku.trim().toUpperCase());
  if (skuExists) {
    return res.status(400).json({ success: false, error: 'رمز SKU هذا موجود بالفعل في النظام' });
  }

  const newProduct = {
    id: 'prod-' + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    sku: sku.trim().toUpperCase(),
    category: category.trim(),
    quantity: Number(quantity),
    minThreshold: Number(minThreshold),
    costPrice: Number(costPrice),
    sellingPrice: Number(sellingPrice),
    supplierName: supplierName.trim()
  };

  products.push(newProduct);
  writeJSONFile(PRODUCTS_FILE, products);

  // Log transaction
  const logs = readJSONFile(LOGS_FILE);
  const newLog = {
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    productName: newProduct.name,
    sku: newProduct.sku,
    change: newProduct.quantity,
    reason: 'إضافة منتج جديد للمخازن',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logs.unshift(newLog);
  writeJSONFile(LOGS_FILE, logs);

  return res.status(201).json({ success: true, product: newProduct });
});

// 3. Update an existing product
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, sku, category, minThreshold, costPrice, sellingPrice, supplierName } = req.body;

  if (!name || !sku || !category || !minThreshold || costPrice === undefined || sellingPrice === undefined || !supplierName) {
    return res.status(400).json({ success: false, error: 'يرجى إكمال جميع الحقول المطلوبة' });
  }

  const products = readJSONFile(PRODUCTS_FILE);
  const index = products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  // Check if SKU is taken by another product
  const skuExists = products.some((p: any) => p.sku.toUpperCase() === sku.trim().toUpperCase() && p.id !== id);
  if (skuExists) {
    return res.status(400).json({ success: false, error: 'رمز SKU هذا موجود بالفعل لمنتج آخر' });
  }

  const updatedProduct = {
    ...products[index],
    name: name.trim(),
    sku: sku.trim().toUpperCase(),
    category: category.trim(),
    minThreshold: Number(minThreshold),
    costPrice: Number(costPrice),
    sellingPrice: Number(sellingPrice),
    supplierName: supplierName.trim()
  };

  products[index] = updatedProduct;
  writeJSONFile(PRODUCTS_FILE, products);

  // Log transaction
  const logs = readJSONFile(LOGS_FILE);
  const newLog = {
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    productName: updatedProduct.name,
    sku: updatedProduct.sku,
    change: 0,
    reason: 'تعديل تفاصيل المنتج والأسعار',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logs.unshift(newLog);
  writeJSONFile(LOGS_FILE, logs);

  return res.status(200).json({ success: true, product: updatedProduct });
});

// 4. Adjust product stock quantity
router.post('/:id/adjust', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { quantityChange, reason } = req.body;

  if (quantityChange === undefined || !reason) {
    return res.status(400).json({ success: false, error: 'يرجى تحديد مقدار التعديل والسبب' });
  }

  const products = readJSONFile(PRODUCTS_FILE);
  const index = products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  const product = products[index];
  const updatedQty = Math.max(0, product.quantity + Number(quantityChange));
  product.quantity = updatedQty;

  products[index] = product;
  writeJSONFile(PRODUCTS_FILE, products);

  // Log transaction
  const logs = readJSONFile(LOGS_FILE);
  const newLog = {
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    productName: product.name,
    sku: product.sku,
    change: Number(quantityChange),
    reason,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logs.unshift(newLog);
  writeJSONFile(LOGS_FILE, logs);

  return res.status(200).json({ success: true, product });
});

// 5. Delete a product
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const products = readJSONFile(PRODUCTS_FILE);
  const productToDelete = products.find((p: any) => p.id === id);

  if (!productToDelete) {
    return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
  }

  const updatedProducts = products.filter((p: any) => p.id !== id);
  writeJSONFile(PRODUCTS_FILE, updatedProducts);

  // Log transaction
  const logs = readJSONFile(LOGS_FILE);
  const newLog = {
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    productName: productToDelete.name,
    sku: productToDelete.sku,
    change: -productToDelete.quantity,
    reason: 'شطب وحذف المنتج من المخازن',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logs.unshift(newLog);
  writeJSONFile(LOGS_FILE, logs);

  return res.status(200).json({ success: true, message: 'تم حذف المنتج بنجاح' });
});

// 6. Get all logs
router.get('/logs', (req: AuthenticatedRequest, res: Response) => {
  const logs = readJSONFile(LOGS_FILE);
  return res.status(200).json({ success: true, logs });
});

export default router;
