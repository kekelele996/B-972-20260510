<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends BaseModel
{
    protected $table = 'products';

    protected $appends = ['current_price', 'is_on_sale', 'original_price', 'sale_start_time_local', 'sale_end_time_local'];

    public function isCurrentlyOnSale(): bool
    {
        if (
            $this->sale_price === null
            || $this->sale_start_time === null
            || $this->sale_end_time === null
        ) {
            return false;
        }

        $now = time();
        $startTs = is_string($this->sale_start_time) ? strtotime($this->sale_start_time) : (int)$this->sale_start_time;
        $endTs = is_string($this->sale_end_time) ? strtotime($this->sale_end_time) : (int)$this->sale_end_time;

        return $startTs !== false && $endTs !== false && $now >= $startTs && $now <= $endTs;
    }

    protected function currentPrice(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->isCurrentlyOnSale()) {
                    return $this->sale_price;
                }
                return $this->price;
            }
        );
    }

    protected function isOnSale(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->isCurrentlyOnSale();
            }
        );
    }

    protected function originalPrice(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->price;
            }
        );
    }

    protected function saleStartTimeLocal(): Attribute
    {
        return Attribute::make(
            get: function () {
            if ($this->sale_start_time === null) {
                return null;
            }
            $ts = is_string($this->sale_start_time) ? strtotime($this->sale_start_time) : $this->sale_start_time;
            return date('Y-m-d\\TH:i', $ts);
            }
        );
    }

    protected function saleEndTimeLocal(): Attribute
    {
        return Attribute::make(
            get: function () {
            if ($this->sale_end_time === null) {
                return null;
            }
            $ts = is_string($this->sale_end_time) ? strtotime($this->sale_end_time) : $this->sale_end_time;
            return date('Y-m-d\\TH:i', $ts);
            }
        );
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }
}

