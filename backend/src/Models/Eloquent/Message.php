<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends BaseModel
{
    protected $table = 'messages';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

