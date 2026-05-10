<?php

namespace App\Controllers;

use App\Models\Eloquent\Product;
use App\Models\Eloquent\OrderItem;
use App\Models\Eloquent\Promotion;
use App\Utils\Request;
use App\Utils\Response;
use Carbon\Carbon;

class ProductController
{
    public function index(): void
    {
        $page = (int)Request::query('page', 1);
        $limit = (int)Request::query('limit', 0);

        $query = Product::orderBy('created_at', 'desc');

        if ($limit > 0) {
            $total = $query->count();
            $products = $query->skip(($page - 1) * $limit)->take($limit)->get();
            Response::json([
                'products' => $this->appendPromotions($products),
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit)
            ]);
        } else {
            $products = $query->get();
            Response::json($this->appendPromotions($products));
        }
    }

    private function appendPromotions($products): array
    {
        $now = Carbon::now();
        $productIds = $products->pluck('id')->toArray();
        $promotions = Promotion::whereIn('product_id', $productIds)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->get()
            ->keyBy('product_id');

        return $products->map(function (Product $product) use ($promotions) {
            $data = [
                'id' => (int)$product->id,
                'name' => (string)$product->name,
                'description' => (string)$product->description,
                'price' => (string)$product->price,
                'image_url' => (string)$product->image_url,
                'stock' => (int)$product->stock,
                'created_at' => (string)$product->created_at,
            ];
            $promo = $promotions->get($product->id);
            if ($promo) {
                $data['promotion'] = [
                    'discount_price' => (string)$promo->discount_price,
                    'start_time' => (string)$promo->start_time,
                    'end_time' => (string)$promo->end_time,
                ];
            }
            return $data;
        })->values()->toArray();
    }

    public function create(): void
    {
        $data = Request::json();

        $name = trim((string)($data['name'] ?? ''));
        $price = $data['price'] ?? null;

        if ($name === '' || $price === null) {
            Response::json(['error' => 'Missing required fields'], 400);
        }

        Product::create([
            'name' => $name,
            'description' => (string)($data['description'] ?? ''),
            'price' => $price,
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

        $product->fill([
            'name' => (string)($data['name'] ?? $product->name),
            'description' => (string)($data['description'] ?? $product->description),
            'price' => $data['price'] ?? $product->price,
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

