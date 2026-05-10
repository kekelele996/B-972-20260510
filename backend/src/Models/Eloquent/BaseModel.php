<?php

namespace App\Models\Eloquent;

use Illuminate\Database\Eloquent\Model;

abstract class BaseModel extends Model
{
    public $timestamps = false;

    // 默认允许批量赋值（项目内部控制）
    protected $guarded = [];
}

