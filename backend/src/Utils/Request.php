<?php

namespace App\Utils;

class Request
{
    public static function json(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public static function query(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }
}

