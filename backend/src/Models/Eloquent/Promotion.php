<?php

namespace App\Models\Eloquent;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends BaseModel
{
    protected $table = 'promotions';

    protected $casts = [
        'discount_price' => 'decimal:2',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function isActive(): bool
    {
        $now = Carbon::now();
        return Carbon::parse($this->start_time)->lte($now)
            && Carbon::parse($this->end_time)->gte($now);
    }
}
