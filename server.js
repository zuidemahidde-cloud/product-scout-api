import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

function requireApiKey(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!API_KEY || token !== API_KEY) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  next();
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.post("/product-scout/search", requireApiKey, async (req, res) => {
  const {
    query,
    imageDescription,
    brand,
    ean,
    sku,
    category,
    targetRegion,
    maxUnitPrice,
    maxMoq,
    maxDeliveryDays,
    currency
  } = req.body;

  if (!query && !imageDescription && !ean && !sku) {
    return res.status(400).json({
      error: "Geef minimaal query, imageDescription, ean of sku mee."
    });
  }

  const matches = [
    {
      productName: query || imageDescription || "Vergelijkbaar product",
      supplierName: "Demo Supplier Europe",
      supplierUrl: "https://example.com",
      productUrl: "https://example.com/product/demo",
      matchScore: 0.91,
      unitPrice: maxUnitPrice ? Math.min(maxUnitPrice, 9.95) : 9.95,
      currency: currency || "EUR",
      moq: maxMoq ? Math.min(maxMoq, 50) : 50,
      deliveryDays: maxDeliveryDays ? Math.min(maxDeliveryDays, 7) : 7,
      availableStock: 1200,
      region: targetRegion || "Europe",
      notes: "Demo-resultaat. Later vervangen we dit door echte leverancierdata."
    }
  ];

  res.json({
    queryUsed: {
      query,
      imageDescription,
      brand,
      ean,
      sku,
      category,
      targetRegion,
      maxUnitPrice,
      maxMoq,
      maxDeliveryDays,
      currency
    },
    matches
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Product Scout API draait op poort ${port}`);
});
