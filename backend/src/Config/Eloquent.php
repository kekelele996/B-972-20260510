<?php

namespace App\Config;

use Illuminate\Database\Capsule\Manager as Capsule;

class Eloquent
{
    private static bool $initialized = false;

    public static function initialize(): void
    {
        if (self::$initialized) {
            return;
        }

        $capsule = new Capsule();

        $capsule->addConnection([
            'driver' => 'mysql',
            'host' => getenv('DB_HOST') ?: 'db',
            'database' => getenv('DB_NAME') ?: 'bunshop',
            'username' => getenv('DB_USER') ?: 'user',
            // 兼容旧环境变量 DB_PASS
            'password' => getenv('DB_PASSWORD') ?: (getenv('DB_PASS') ?: 'root'),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
        ]);

        $capsule->setAsGlobal();
        $capsule->bootEloquent();

        self::$initialized = true;
    }
}

