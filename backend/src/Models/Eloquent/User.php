<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends BaseModel
{
    protected $table = 'users';

    protected $hidden = ['password_hash'];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'user_id');
    }
}

