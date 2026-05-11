<?php

namespace App\Controllers;

use App\Models\Eloquent\Promotion;
use App\Models\Eloquent\Product;
use App\Utils\Request;
use App\Utils\Response;
use Carbon\Carbon;

class PromotionController
{
    public function index(): void
    {
        $promotions = Promotion::with('product:id,name,price,image_url')
            ->orderBy('start_time', 'desc')
            ->get();

        $result = $promotions->map(function (Promotion $p) {
            return [
                'id' => (int)$p->id,
                'product_id' => (int)$p->product_id,
                'product_name' => $p->product ? $p->product->name : null,
                'original_price' => $p->product ? (string)$p->product->price : null,
                'discount_price' => (string)$p->discount_price,
                'start_time' => (string)$p->start_time,
                'end_time' => (string)$p->end_time,
                'is_active' => $p->isActive(),
                'created_at' => (string)$p->created_at,
            ];
        })->values();

        Response::json($result);
    }

    public function create(): void
    {
        $data = Request::json();

        $productId = (int)($data['product_id'] ?? 0);
        $discountPrice = $data['discount_price'] ?? null;
        $startTime = trim((string)($data['start_time'] ?? ''));
        $endTime = trim((string)($data['end_time'] ?? ''));

        if ($productId <= 0 || $discountPrice === null || $startTime === '' || $endTime === '') {
            Response::json(['error' => '缺少必填字段'], 400);
        }

        $product = Product::find($productId);
        if (!$product) {
            Response::json(['error' => '商品不存在'], 404);
        }

        if ((float)$discountPrice <= 0) {
            Response::json(['error' => '折扣价必须大于0'], 400);
        }

        if ((float)$discountPrice >= (float)$product->price) {
            Response::json(['error' => '折扣价必须小于商品原价'], 400);
        }

        $start = Carbon::parse($startTime);
        $end = Carbon::parse($endTime);
        if ($start->gte($end)) {
            Response::json(['error' => '结束时间必须晚于开始时间'], 400);
        }

        Promotion::create([
            'product_id' => $productId,
            'discount_price' => $discountPrice,
            'start_time' => $start,
            'end_time' => $end,
        ]);

        Response::json(['message' => '促销活动已创建']);
    }

    public function update(): void
    {
        $id = Request::query('id');
        if (!$id) {
            Response::json(['error' => '缺少ID'], 400);
        }

        $promotion = Promotion::find((int)$id);
        if (!$promotion) {
            Response::json(['error' => '促销活动不存在'], 404);
        }

        $data = Request::json();

        $discountPrice = $data['discount_price'] ?? $promotion->discount_price;
        $startTime = trim((string)($data['start_time'] ?? $promotion->start_time));
        $endTime = trim((string)($data['end_time'] ?? $promotion->end_time));

        if ((float)$discountPrice <= 0) {
            Response::json(['error' => '折扣价必须大于0'], 400);
        }

        $product = Product::find((int)$promotion->product_id);
        if ($product && (float)$discountPrice >= (float)$product->price) {
            Response::json(['error' => '折扣价必须小于商品原价'], 400);
        }

        $start = Carbon::parse($startTime);
        $end = Carbon::parse($endTime);
        if ($start->gte($end)) {
            Response::json(['error' => '结束时间必须晚于开始时间'], 400);
        }

        $promotion->fill([
            'discount_price' => $discountPrice,
            'start_time' => $start,
            'end_time' => $end,
        ]);
        $promotion->save();

        Response::json(['message' => '促销活动已更新']);
    }

    public function delete(): void
    {
        $id = Request::query('id');
        if (!$id) {
            Response::json(['error' => '缺少ID'], 400);
        }

        $promotion = Promotion::find((int)$id);
        if (!$promotion) {
            Response::json(['error' => '促销活动不存在'], 404);
        }

        $promotion->delete();
        Response::json(['message' => '促销活动已删除']);
    }

    public static function getActivePromotionForProduct(int $productId): ?Promotion
    {
        $now = Carbon::now();
        return Promotion::where('product_id', $productId)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->first();
    }
}
