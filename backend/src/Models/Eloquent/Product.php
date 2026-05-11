<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends BaseModel
{
    protected $table = 'products';

    protected $appends = ['current_price', 'is_on_sale'];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    public function getIsOnSaleAttribute(): bool
    {
        if ($this->discount_price === null) {
            return false;
        }

        $now = new \DateTime();

        if ($this->sale_start_time !== null) {
            $start = new \DateTime($this->sale_start_time);
            if ($now < $start) {
                return false;
            }
        }

        if ($this->sale_end_time !== null) {
            $end = new \DateTime($this->sale_end_time);
            if ($now > $end) {
                return false;
            }
        }

        return true;
    }

    public function getCurrentPriceAttribute()
    {
        return $this->is_on_sale ? $this->discount_price : $this->price;
    }
}

