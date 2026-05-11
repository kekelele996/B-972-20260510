<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends BaseModel
{
    protected $table = 'products';

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }
}

