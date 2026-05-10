<?php

namespace App\Controllers;

use App\Models\Eloquent\Product;
use App\Models\Eloquent\OrderItem;
use App\Utils\Request;
use App\Utils\Response;

class ProductController
{
    private function validateSaleFields(array $data): ?string
    {
        $hasSalePrice = isset($data['sale_price']) && $data['sale_price'] !== '' && $data['sale_price'] !== null;
        $hasStartTime = !empty($data['sale_start_time']);
        $hasEndTime = !empty($data['sale_end_time']);

        $filled = array_filter([$hasSalePrice, $hasStartTime, $hasEndTime]);
        if (count($filled) > 0 && count($filled) < 3) {
            return '限时特价字段要么都填（折扣价、开始时间、结束时间），要么都不填';
        }

        if (count($filled) === 3) {
            $salePrice = (float)$data['sale_price'];
            $originalPrice = (float)($data['price'] ?? 0);
            if ($salePrice >= $originalPrice) {
                return '折扣价必须小于原价';
            }
            $startTime = strtotime((string)$data['sale_start_time']);
            $endTime = strtotime((string)$data['sale_end_time']);
            if ($endTime <= $startTime) {
                return '结束时间必须晚于开始时间';
            }
        }

        return null;
    }

    public function index(): void
    {
        $page = (int)Request::query('page', 1);
        $limit = (int)Request::query('limit', 0); // 0 means all for compatibility

        $query = Product::orderBy('created_at', 'desc');

        if ($limit > 0) {
            $total = $query->count();
            $products = $query->skip(($page - 1) * $limit)->take($limit)->get();
            Response::json([
                'products' => $products,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit)
            ]);
        } else {
            $products = $query->get();
            Response::json($products);
        }
    }

    public function create(): void
    {
        $data = Request::json();

        $name = trim((string)($data['name'] ?? ''));
        $price = $data['price'] ?? null;

        if ($name === '' || $price === null) {
            Response::json(['error' => 'Missing required fields'], 400);
        }

        $validationError = $this->validateSaleFields($data);
        if ($validationError !== null) {
            Response::json(['error' => $validationError], 400);
        }

        Product::create([
            'name' => $name,
            'description' => (string)($data['description'] ?? ''),
            'price' => $price,
            'sale_price' => isset($data['sale_price']) && $data['sale_price'] !== '' ? $data['sale_price'] : null,
            'sale_start_time' => !empty($data['sale_start_time']) ? (string)$data['sale_start_time'] : null,
            'sale_end_time' => !empty($data['sale_end_time']) ? (string)$data['sale_end_time'] : null,
            'image_url' => (string)($data['image_url'] ?? ''),
            'stock' => (int)($data['stock'] ?? 0),
        ]);

        Response::json(['message' => 'Product added']);
    }

    public function update(): void
    {
        $id = Request::query('id');
        if (!$id) {
            Response::json(['error' => 'Missing ID'], 400);
        }

        $data = Request::json();

        $product = Product::find((int)$id);
        if (!$product) {
            Response::json(['error' => 'Product not found'], 404);
        }

        $validationError = $this->validateSaleFields($data);
        if ($validationError !== null) {
            Response::json(['error' => $validationError], 400);
        }

        $product->fill([
            'name' => (string)($data['name'] ?? $product->name),
            'description' => (string)($data['description'] ?? $product->description),
            'price' => $data['price'] ?? $product->price,
            'sale_price' => isset($data['sale_price']) && $data['sale_price'] !== '' ? $data['sale_price'] : null,
            'sale_start_time' => !empty($data['sale_start_time']) ? (string)$data['sale_start_time'] : null,
            'sale_end_time' => !empty($data['sale_end_time']) ? (string)$data['sale_end_time'] : null,
            'image_url' => (string)($data['image_url'] ?? $product->image_url),
            'stock' => isset($data['stock']) ? (int)$data['stock'] : (int)$product->stock,
        ]);
        $product->save();

        Response::json(['message' => 'Product updated']);
    }

    public function delete(): void
    {
        $data = Request::json();

        // 批量删除
        if (isset($data['ids']) && is_array($data['ids'])) {
            $ids = array_values(array_filter(array_map('intval', $data['ids']), fn($v) => $v > 0));
            if (count($ids) === 0) {
                Response::json(['error' => 'Missing IDs'], 400);
            }
            
            // 然后删除商品
            Product::whereIn('id', $ids)->delete();
            Response::json(['message' => 'Products deleted']);
            return;
        }

        // 单个删除
        $id = Request::query('id');
        if (!$id) {
            Response::json(['error' => 'Missing ID'], 400);
        }

        $productId = (int)$id;
        
        // 然后删除商品
        Product::where('id', $productId)->delete();
        Response::json(['message' => 'Product deleted']);
    }
}

