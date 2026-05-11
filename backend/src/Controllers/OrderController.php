<?php

namespace App\Controllers;

use App\Models\Eloquent\Order;
use App\Models\Eloquent\OrderItem;
use App\Models\Eloquent\Product;
use App\Models\Eloquent\Promotion;
use App\Utils\Request;
use App\Utils\Response;
use Carbon\Carbon;
use Illuminate\Database\Capsule\Manager as Capsule;

class OrderController
{
    public function create(): void
    {
        $data = Request::json();
        $items = $data['items'] ?? null;

        if (!is_array($items) || count($items) === 0) {
            Response::json(['error' => 'Missing items'], 400);
        }

        $userId = isset($data['user_id']) && (int)$data['user_id'] > 0 ? (int)$data['user_id'] : null;

        try {
            $orderId = Capsule::connection()->transaction(function () use ($userId, $items) {
                $calculatedTotal = 0;
                $productsData = [];
                $now = Carbon::now();

                foreach ($items as $item) {
                    $productId = (int)($item['id'] ?? 0);
                    $qty = (int)($item['quantity'] ?? 0);

                    if ($productId <= 0 || $qty <= 0) {
                        throw new \RuntimeException('Invalid order item');
                    }

                    /** @var Product|null $product */
                    $product = Product::find($productId);
                    if (!$product) {
                        throw new \RuntimeException("Product not found: {$productId}");
                    }

                    if ((int)$product->stock < $qty) {
                        throw new \RuntimeException("库存不足：{$product->name}");
                    }

                    $promotion = Promotion::where('product_id', $productId)
                        ->where('start_time', '<=', $now)
                        ->where('end_time', '>=', $now)
                        ->first();

                    $effectivePrice = $promotion ? (float)$promotion->discount_price : (float)$product->price;

                    $productsData[] = [
                        'productId' => $productId,
                        'qty' => $qty,
                        'price' => $effectivePrice,
                        'name' => $product->name,
                        'image_url' => $product->image_url,
                        'product' => $product
                    ];

                    $calculatedTotal += $effectivePrice * $qty;
                }

                $order = Order::create([
                    'user_id' => $userId,
                    'total_price' => $calculatedTotal,
                    'status' => 'pending',
                ]);

                foreach ($productsData as $pd) {
                    OrderItem::create([
                        'order_id' => (int)$order->id,
                        'product_id' => $pd['productId'],
                        'product_name' => $pd['name'],
                        'image_url' => $pd['image_url'],
                        'quantity' => $pd['qty'],
                        'price' => $pd['price'],
                    ]);

                    $pd['product']->stock = (int)$pd['product']->stock - $pd['qty'];
                    $pd['product']->save();
                }

                return (int)$order->id;
            });

            Response::json(['message' => 'Order placed', 'order_id' => $orderId]);
        } catch (\Throwable $e) {
            // 业务校验错误（例如库存不足）用 400，避免前端误判为服务器崩溃
            if ($e instanceof \RuntimeException) {
                Response::json(['error' => $e->getMessage()], 400);
            }
            Response::json(['error' => '服务器内部错误: ' . $e->getMessage()], 500);
        }
    }

    public function index(): void
    {
        $userId = Request::query('user_id');
        $page = (int)Request::query('page', 1);
        $limit = (int)Request::query('limit', 0);

        $query = Order::with([
            'user:id,username',
            'items',
        ])->orderBy('created_at', 'desc');

        if ($userId) {
            $query->where('user_id', (int)$userId);
        }

        if ($limit > 0) {
            $total = $query->count();
            $orders = $query->skip(($page - 1) * $limit)->take($limit)->get();
            Response::json([
                'orders' => $this->formatOrders($orders),
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit)
            ]);
        } else {
            $orders = $query->get();
            Response::json($this->formatOrders($orders));
        }
    }

    private function formatOrders($orders)
    {
        return $orders->map(function (Order $order) {
            return [
                'id' => (int)$order->id,
                'user_id' => $order->user_id !== null ? (int)$order->user_id : null,
                'customer_name' => $order->user ? (string)$order->user->username : null,
                'total_price' => (string)$order->total_price,
                'status' => (string)$order->status,
                'created_at' => (string)$order->created_at,
                'items' => $order->items->map(function (OrderItem $item) {
                    return [
                        'id' => (int)$item->id,
                        'product_id' => $item->product_id !== null ? (int)$item->product_id : null,
                        'product_name' => (string)$item->product_name ?: '已删除商品',
                        'quantity' => (int)$item->quantity,
                        'price' => (string)$item->price,
                        'image_url' => (string)$item->image_url,
                    ];
                })->values(),
            ];
        })->values();
    }

    public function update(): void
    {
        $data = Request::json();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $status = isset($data['status']) ? (string)$data['status'] : '';

        if ($id <= 0 || $status === '') {
            Response::json(['error' => 'Missing ID or status'], 400);
        }

        $order = Order::find($id);
        if (!$order) {
            Response::json(['error' => 'Order not found'], 404);
        }

        $order->status = $status;
        $order->save();

        Response::json(['message' => 'Order status updated']);
    }
}

