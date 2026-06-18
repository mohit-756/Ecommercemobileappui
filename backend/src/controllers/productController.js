import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import * as XLSX from 'xlsx';

export async function getProducts(req, res, next) {
  try {
    const { page = 1, limit = 20, category, minPrice, maxPrice, sort, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      const keywords = search.trim().split(/\s+/).filter(Boolean);
      if (keywords.length > 0) {
        filter.$and = keywords.map(kw => ({
          $or: [
            { name: { $regex: kw, $options: 'i' } },
            { description: { $regex: kw, $options: 'i' } },
            { tags: { $regex: kw, $options: 'i' } },
          ]
        }));
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name').sort(sortOption).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, session }
    );
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Product not found' });
    }
    await session.commitTransaction();
    session.endSession();
    res.json(product);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}

export async function bulkUploadProducts(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Uploaded sheet is empty' });
    }

    let productsCreated = 0;
    let categoriesCreated = 0;

    const categoryCache = {};
    const dbCategories = await Category.find({});
    dbCategories.forEach(cat => {
      categoryCache[cat.name.toLowerCase()] = cat._id;
    });

    const productsToInsert = [];

    for (const row of rows) {
      const name = row.Name || row.name;
      const description = row.Description || row.description;
      const price = Number(row.Price || row.price);
      
      if (!name || !description || isNaN(price)) {
        continue;
      }

      const originalPrice = Number(row.OriginalPrice || row.originalPrice || row.Original_Price);
      const stock = Number(row.Stock || row.stock || 0);
      const categoryName = (row.Category || row.category || 'Mixed').toString().trim();
      const imageVal = row.Image || row.image || row.ImageUrl || row.image_url;

      let categoryId = categoryCache[categoryName.toLowerCase()];
      if (!categoryId) {
        let categoryDoc = await Category.findOne({ name: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
        if (!categoryDoc) {
          categoryDoc = await Category.create({ name: categoryName, icon: 'LayoutGrid' });
          categoriesCreated++;
        }
        categoryId = categoryDoc._id;
        categoryCache[categoryName.toLowerCase()] = categoryId;
      }

      const variants = [];
      const variantsVal = row.Variants || row.variants || row.weight_variants;
      if (variantsVal) {
        const parts = variantsVal.toString().split(',');
        for (const part of parts) {
          const splitPart = part.split(':');
          const weight = splitPart[0]?.trim();
          const vPrice = Number(splitPart[1]?.trim());
          if (weight && !isNaN(vPrice)) {
            variants.push({
              weight,
              price: vPrice,
              originalPrice: vPrice,
              stock: 50
            });
          }
        }
      }

      let discount = null;
      if (originalPrice && originalPrice > price) {
        discount = `${Math.round(((originalPrice - price) / originalPrice) * 100)}%`;
      }

      productsToInsert.push({
        name,
        description,
        price,
        originalPrice: isNaN(originalPrice) ? undefined : originalPrice,
        discount,
        stock,
        category: categoryId,
        images: imageVal ? [imageVal.toString().trim()] : [],
        variants,
        isActive: true
      });
      productsCreated++;
    }

    if (productsToInsert.length === 0) {
      return res.status(400).json({ message: 'No valid products found in the sheet. Please ensure Name, Description, and Price columns are present.' });
    }

    await Product.insertMany(productsToInsert);

    res.status(201).json({
      message: 'Products imported successfully',
      productsCreated,
      categoriesCreated
    });
  } catch (error) {
    next(error);
  }
}

export async function getSearchSuggestions(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }
    const keywords = q.trim().split(/\s+/).filter(Boolean);
    if (keywords.length === 0) {
      return res.json([]);
    }
    
    // Find up to 5 matching products (name, tags)
    const filter = {
      isActive: true,
      $and: keywords.map(kw => ({
        $or: [
          { name: { $regex: kw, $options: 'i' } },
          { tags: { $regex: kw, $options: 'i' } },
        ]
      }))
    };
    
    const products = await Product.find(filter)
      .select('name')
      .limit(5);
      
    res.json(products.map(p => p.name));
  } catch (error) {
    next(error);
  }
}
