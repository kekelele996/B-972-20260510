<?php

namespace App\Controllers;

use App\Models\Eloquent\User;
use App\Utils\Request;
use App\Utils\Response;

class AuthController
{
    public function login(): void
    {
        $data = Request::json();
        $username = trim((string)($data['username'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if ($username === '' || $password === '') {
            Response::json(['error' => 'Missing username or password'], 400);
        }

        $user = User::where('username', $username)->first();
        if (!$user) {
            Response::json(['error' => '用户名不存在，请检查后重试'], 401);
        }

        if ((int)($user->is_active ?? 1) !== 1) {
            Response::json(['error' => '该账号已被禁用，请联系管理员'], 403);
        }

        if (!password_verify($password, (string)$user->password_hash)) {
            Response::json(['error' => '密码错误，请重新输入'], 401);
        }

        Response::json([
            'user' => [
                'id' => (int)$user->id,
                'username' => (string)$user->username,
                'email' => (string)$user->email,
                'role' => (string)$user->role,
            ],
        ]);
    }

    public function register(): void
    {
        $data = Request::json();
        $username = trim((string)($data['username'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $email = trim((string)($data['email'] ?? ''));

        if ($username === '' || $password === '' || $email === '') {
            Response::json(['error' => 'Missing required fields'], 400);
        }

        if (User::where('username', $username)->exists()) {
            Response::json(['error' => 'User already exists'], 400);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        User::create([
            'username' => $username,
            'email' => $email,
            'password_hash' => $hash,
            'role' => 'user',
            'is_active' => 1,
        ]);

        Response::json(['message' => 'User registered']);
    }
}

