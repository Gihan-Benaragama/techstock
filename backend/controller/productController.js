import Product from "../model/product.js";
import { isAdmin } from "./userController.js";

function normalizeProductId(value) {
    return String(value || "").trim().toUpperCase();
}

export async function createProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Access denied. Admins only.",
        });
        return;
    }

    try {
        const payload = {
            productId: normalizeProductId(req.body.productId),
            productID: normalizeProductId(req.body.productId),
            name: String(req.body.name || "").trim(),
            altNames: Array.isArray(req.body.altNames)
                ? req.body.altNames.map((item) => String(item).trim()).filter(Boolean)
                : undefined,
            price: Number(req.body.price),
            labelledPrice: Number(req.body.labelledPrice),
            description: req.body.description ? String(req.body.description).trim() : undefined,
            images: Array.isArray(req.body.images)
                ? req.body.images.map((item) => String(item).trim()).filter(Boolean)
                : undefined,
            brand: req.body.brand ? String(req.body.brand).trim() : undefined,
            model: req.body.model ? String(req.body.model).trim() : undefined,
            category: req.body.category ? String(req.body.category).trim() : undefined,
            stock: Number(req.body.stock),
        };

        if (!payload.productId || !payload.name) {
            return res.status(400).json({
                message: "productId and name are required.",
            });
        }

        if (!Number.isFinite(payload.price) || !Number.isFinite(payload.labelledPrice) || !Number.isFinite(payload.stock)) {
            return res.status(400).json({
                message: "price, labelledPrice and stock must be valid numbers.",
            });
        }

        const existingProduct = await Product.findOne({
            $or: [
                { productId: payload.productId },
                { productID: payload.productId },
            ],
        });

        if (existingProduct != null) {
            res.status(400).json({
                message: `Product with productId '${payload.productId}' already exists.`,
            });
            return;
        }

        const newProduct = new Product(payload);

        await newProduct.save();

        res.status(201).json({
            message: "Product created successfully.",
            product: newProduct,
        });
    } catch (error) {
        if (error?.code === 11000) {
            const duplicateField = Object.keys(error?.keyPattern || {})[0] || Object.keys(error?.keyValue || {})[0] || "field";
            const duplicateValue = error?.keyValue?.[duplicateField];
            return res.status(400).json({
                message: duplicateValue !== undefined
                    ? `Duplicate value for ${duplicateField}: '${duplicateValue}'.`
                    : "Duplicate value error.",
            });
        }

        if (error?.name === "ValidationError") {
            const firstError = Object.values(error.errors || {})[0];
            return res.status(400).json({
                message: firstError?.message || "Invalid product data.",
            });
        }

        return res.status(500).json({
            message: error?.message || "Error creating product",
        });
    }
}

export async function getAllProducts(req, res) {
    try {
        // Support server-side pagination via ?page=1&limit=12
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.max(1, parseInt(req.query.limit || '12', 10));
        const filter = isAdmin(req) ? {} : { isAvailable: true };
        // optional search
        if (req.query.search) {
            const q = String(req.query.search).trim();
            const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [ { name: regex }, { description: regex }, { altNames: regex } ];
        }

        const total = await Product.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const products = await Product.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        res.json({ products, page, limit, total, totalPages });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products",
        });
    }
}

export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Access denied. Admins only.",
        });
        return;
    }

    try {
        const deleted = await Product.findOneAndDelete({
            $or: [
                { productId: req.params.productId },
                { productID: req.params.productId }
            ]
        });

        if (deleted == null) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully.",
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting product",
        });
    }
}

export async function updateProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Access denied. Admins only.",
        });
        return;
    }

    try {

        await Product.updateOne({
            $or: [
                { productId: req.params.productId },
                { productID: req.params.productId }
            ]
        }, {
            name: req.body.name,
            altNames: req.body.altNames,
            price: req.body.price,
            labelledPrice: req.body.labelledPrice,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            model: req.body.model,
            category: req.body.category,
            stock: req.body.stock,
            isAvailable: req.body.isAvailable
        })

        res.json({
            message: "Product updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating product",
        });
    }
}



export async function updateProductStock(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Access denied. Admins only.",
        });
        return;
    }

    try {
        await Product.updateOne({
            productId: req.params.productId
        }, {
            stock: req.body.stock,
            isAvailable: req.body.isAvailable
        })
        res.json({
            message: "Product stock updated successfully."
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating product",
        });
    }
}
export async function getProductById(req, res) {
    try {
        const product = await Product.findOne({
            $or: [
                { productId: req.params.productId },
                { productID: req.params.productId }
            ]
        })
        if (product == null) {
            res.status(404).json({
                message: "Product not found"
            })
        } else {
            if (product.isAvailable) {
                res.json(product)
            } else {
                if (isAdmin(req)) {
                    res.json(product)
                } else {
                    res.status(403).json({
                        message: "Access denied. Admins only."
                    })
                }
            }
        }
    } catch (error) {
        res.status(500).json({
            message: "Error fetching product",
        });
    }
}
